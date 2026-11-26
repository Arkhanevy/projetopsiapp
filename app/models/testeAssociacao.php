<?php
/**
 * testeAssociacao.php
 *
 * Testa o fluxo clínica -> convite -> profissional aceita/recusa, direto nos
 * models (sem passar pelos controllers, que dependem de $_POST e dão exit).
 *
 * COMO USAR
 *  1. Coloque este arquivo na raiz do projeto e ajuste a seção CONFIGURAÇÃO.
 *  2. Navegador: http://localhost/.../testeAssociacao.php   |   Terminal: php testeAssociacao.php
 *  3. O script limpa tudo o que cria. Se o par clínica/profissional já estiver
 *     vinculado, ele ABORTA sem mexer (escolha outro par em ID_CLINICA/ID_PROFISSIONAL).
 */

// ===================== CONFIGURAÇÃO =====================
const DB_HOST   = 'localhost';
const DB_USER   = 'root';
const DB_PASS   = '';
const DB_SCHEMA = 'NOME_DO_BANCO';          // <- troque

const DIR_MODELS = __DIR__ . '/models';     // onde estão clinica.php, profissional.php, notificacao.php...
const DIR_CORE   = __DIR__ . '/core';       // onde estão core/database/DBQuery.php, core/utils/Sanitize.php...

const ID_CLINICA      = 0;                  // 0 = usa a primeira clínica cadastrada
const ID_PROFISSIONAL = 0;                  // 0 = usa o primeiro profissional ATIVO
// ========================================================

$ehCli = (PHP_SAPI === 'cli');
if (!$ehCli) {
    // este script escreve no banco: só roda local
    if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)) {
        http_response_code(403);
        exit('Somente localhost.');
    }
    header('Content-Type: text/plain; charset=utf-8');
}
error_reporting(E_ALL);
ini_set('display_errors', '1');

// ---------- autoload simples: models\x -> models/x.php | core\a\B -> core/a/B.php ----------
spl_autoload_register(function ($classe) {
    $mapa = ['models\\' => DIR_MODELS, 'core\\' => DIR_CORE];
    foreach ($mapa as $prefixo => $dir) {
        if (strpos($classe, $prefixo) === 0) {
            $rel = str_replace('\\', '/', substr($classe, strlen($prefixo)));
            foreach ([$dir . '/' . $rel . '.php', $dir . '/' . strtolower($rel) . '.php'] as $arq) {
                if (is_file($arq)) {
                    require_once $arq;
                    return;
                }
            }
        }
    }
});

// ---------- sessão no formato que o DBConnection espera ----------
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION['database'] = ['host' => DB_HOST, 'user' => DB_USER, 'pass' => DB_PASS, 'schema' => DB_SCHEMA];
if (empty($_SESSION['path']['pdoErrors'])) {
    // DBConnection::getErroMensage faz require desse arquivo; um stub vazio evita fatal ao mascarar o erro real
    $stub = sys_get_temp_dir() . '/pdoErrorsStub.php';
    file_put_contents($stub, '<?php $mensagensDeErro = ["mysql" => []];');
    $_SESSION['path']['pdoErrors'] = $stub;
}

use core\database\DBConnection;
use models\clinica;
use models\profissional;
use models\notificacao;
use models\permissao;

// ---------- helpers de saída ----------
$ok = 0; $falhas = 0;
function titulo($t) { echo "\n== $t ==\n"; }
function check($nome, $cond, $detalhe = '') {
    global $ok, $falhas;
    if ($cond) { $ok++; echo "  [OK]    $nome\n"; }
    else       { $falhas++; echo "  [FALHA] $nome" . ($detalhe !== '' ? "  -> $detalhe" : '') . "\n"; }
    return (bool) $cond;
}
function msg($r) { return is_array($r) ? json_encode($r, JSON_UNESCAPED_UNICODE) : (string) $r; }
function abortar($m) { global $ok, $falhas; echo "\nABORTADO: $m\n"; echo "Resumo parcial: $ok ok, $falhas falha(s)\n"; exit(1); }

$criadas = [];   // ids de notificações criadas pelo teste (para a limpeza)
$clinId = $proId = 0;
$pdo = null;

try {
    // ============ 1. conexão ============
    titulo('1. Conexão com o banco');
    try {
        $pdo = (new DBConnection())->getConn();
        $banco = $pdo->query('SELECT DATABASE()')->fetchColumn();
        check("Conectou no schema '$banco'", true);
    } catch (\Throwable $e) {
        check('Conectou no banco', false, $e->getMessage());
        abortar('sem conexão (confira DB_HOST/DB_USER/DB_PASS/DB_SCHEMA e se o MySQL está ligado)');
    }

    // ============ 2. schema ============
    titulo('2. Tabelas e colunas necessárias');
    $exigidas = [
        'clinica'              => ['clin_id'],
        'profissional'         => ['pro_id', 'pro_stat'],
        'profissional_clinica' => ['pc_id', 'pc_pro', 'pc_clin'],
        'permissoes'           => ['perm_tipo', 'perm_bin', 'perm_pc'],
        'notificacao'          => ['notif_id', 'notif_pd', 'notif_clin', 'notif_dest', 'notif_tipo', 'notif_msg', 'notif_data', 'notif_stat'],
        'padrao_notif'         => ['pdNotif_id', 'pdNotif_msg'],
    ];
    $schemaOk = true;
    foreach ($exigidas as $tab => $cols) {
        $st = $pdo->prepare('SELECT LOWER(COLUMN_NAME) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t');
        $st->execute([':t' => $tab]);
        $existentes = $st->fetchAll(\PDO::FETCH_COLUMN);
        if (!$existentes) { $schemaOk = false; check("Tabela $tab existe", false, 'não encontrada'); continue; }
        $faltam = array_diff(array_map('strtolower', $cols), $existentes);
        if (!check("Tabela $tab com colunas esperadas", !$faltam, 'faltam: ' . implode(', ', $faltam))) {
            $schemaOk = false;
            echo "          colunas reais: " . implode(', ', $existentes) . "\n";
        }
    }
    if (!$schemaOk) abortar('o schema não bate com o que o código usa (ajuste o código ou o banco)');

    $st = $pdo->prepare('SELECT pdNotif_msg FROM padrao_notif WHERE pdNotif_id = :id');
    $st->execute([':id' => notificacao::CONVITE_VINCULO]);
    $msgPadrao = $st->fetchColumn();
    if (!check('padrao_notif tem o id ' . notificacao::CONVITE_VINCULO . ' (mensagem do convite)', $msgPadrao !== false,
        "crie a linha, ex.: INSERT INTO padrao_notif (pdNotif_id, pdNotif_msg) VALUES (" . notificacao::CONVITE_VINCULO . ", 'A clínica convidou você para fazer parte do corpo profissional.');  (se a tabela tiver outras colunas obrigatórias, inclua-as)")) {
        abortar('sem a notificação padrão do convite');
    }

    // ============ 3. escolha do par ============
    titulo('3. Escolha da clínica e do profissional');
    $clinId = ID_CLINICA ?: (int) $pdo->query('SELECT MIN(clin_id) FROM clinica')->fetchColumn();
    $proId  = ID_PROFISSIONAL ?: (int) $pdo->query("SELECT MIN(pro_id) FROM profissional WHERE pro_stat = 'ativo'")->fetchColumn();
    if (!check("Clínica escolhida: id $clinId", $clinId > 0, 'nenhuma clínica cadastrada')) abortar('cadastre uma clínica');
    if (!check("Profissional escolhido: id $proId", $proId > 0, "nenhum profissional com pro_stat='ativo'")) abortar('cadastre/ative um profissional');

    $st = $pdo->prepare('SELECT 1 FROM profissional_clinica WHERE pc_clin = :c AND pc_pro = :p');
    $st->execute([':c' => $clinId, ':p' => $proId]);
    if ($st->fetch()) abortar("clínica $clinId e profissional $proId já estão vinculados; escolha outro par para não apagar dado real");

    $outro = (int) $pdo->query("SELECT MIN(pro_id) FROM profissional WHERE pro_id <> $proId")->fetchColumn();

    $mClin = new clinica('clinica', ['clin_id'], 'clin_id');
    $mPro  = new profissional('profissional', ['pro_id'], 'pro_id');

    // helper: pega a notificação de convite pendente do par
    $convite = function () use ($pdo, $clinId, $proId) {
        $st = $pdo->prepare('SELECT * FROM notificacao WHERE notif_clin = :c AND notif_dest = :p AND notif_tipo = :t');
        $st->execute([':c' => $clinId, ':p' => $proId, ':t' => notificacao::CONVITE_VINCULO]);
        return $st->fetch(\PDO::FETCH_ASSOC);
    };
    $vinculo = function () use ($pdo, $clinId, $proId) {
        $st = $pdo->prepare('SELECT pc_id FROM profissional_clinica WHERE pc_clin = :c AND pc_pro = :p');
        $st->execute([':c' => $clinId, ':p' => $proId]);
        return $st->fetchColumn();
    };

    // ============ 4. convite ============
    titulo('4. Clínica convida o profissional');
    $r = $mClin->convidarProfissional($clinId, $proId);
    check('convidarProfissional() retornou sucesso', ($r['sucesso'] ?? false) === true, msg($r));
    $n = $convite();
    if (check('notificação do convite foi gravada', (bool) $n)) {
        $criadas[] = (int) $n['notif_id'];
        check('notif_dest = profissional', (int) $n['notif_dest'] === $proId);
        check('notif_clin = clínica', (int) $n['notif_clin'] === $clinId);
        check('notif_stat = 0 (não lida)', (int) $n['notif_stat'] === 0);
        check('mensagem veio do padrao_notif', $n['notif_msg'] === $msgPadrao);
    }
    check('vínculo AINDA não existe (só depois do aceite)', $vinculo() === false);

    titulo('5. Convite duplicado deve ser barrado');
    $r = $mClin->convidarProfissional($clinId, $proId);
    check('segundo convite recusado', ($r['sucesso'] ?? true) === false, msg($r));

    // ============ 6. segurança do aceite ============
    titulo('6. Aceite indevido deve falhar');
    $notifId = (int) ($n['notif_id'] ?? 0);
    if ($outro > 0) {
        $r = $mPro->aceitarVinculo($outro, $notifId);
        check("profissional $outro NÃO consegue aceitar convite de outro", ($r['sucesso'] ?? true) === false, msg($r));
    } else {
        echo "  (pulado: só existe 1 profissional no banco)\n";
    }
    $r = $mPro->aceitarVinculo($proId, 999999999);
    check('aceitar notificação inexistente falha', ($r['sucesso'] ?? true) === false, msg($r));
    check('nenhum vínculo criado pelas tentativas inválidas', $vinculo() === false);

    // ============ 7. aceite ============
    titulo('7. Profissional aceita');
    $r = $mPro->aceitarVinculo($proId, $notifId);
    check('aceitarVinculo() retornou sucesso', ($r['sucesso'] ?? false) === true, msg($r));
    $pc = $vinculo();
    if (check('linha criada em profissional_clinica', $pc !== false)) {
        $st = $pdo->prepare('SELECT COUNT(*) FROM permissoes WHERE perm_pc = :pc');
        $st->execute([':pc' => $pc]);
        check('permissões do vínculo foram criadas', (int) $st->fetchColumn() > 0);
    }
    check('convite foi consumido', $convite() === false);

    $r = $mPro->aceitarVinculo($proId, $notifId);
    check('aceitar o mesmo convite de novo falha', ($r['sucesso'] ?? true) === false, msg($r));

    titulo('8. Convite de quem já é vinculado');
    $r = $mClin->convidarProfissional($clinId, $proId);
    check('convidar profissional já vinculado é barrado', ($r['sucesso'] ?? true) === false, msg($r));

    titulo('9. permissao::permissao() enxerga o vínculo novo');
    $perm = new permissao('permissoes', 'perm_bin', 'perm_bin');
    $r = $perm->permissao($proId, $clinId, 1);
    check('retorna true ou "permissão negada" (e NÃO "não vinculado")',
        $r === true || (is_array($r) && ($r['mensagem'] ?? '') === 'permissão negada'), msg($r));

    // ============ 10. desvincular ============
    titulo('10. Clínica desvincula');
    $r = $mClin->desvincularProfissional($clinId, $proId);
    check('desvincularProfissional() retornou sucesso', ($r['sucesso'] ?? false) === true, msg($r));
    check('vínculo removido', $vinculo() === false);
    if (!empty($pc)) {
        $st = $pdo->prepare('SELECT COUNT(*) FROM permissoes WHERE perm_pc = :pc');
        $st->execute([':pc' => $pc]);
        check('permissões do vínculo removidas', (int) $st->fetchColumn() === 0);
    }
    $r = $mClin->desvincularProfissional($clinId, $proId);
    check('desvincular de novo falha', ($r['sucesso'] ?? true) === false, msg($r));

    // ============ 11. recusa ============
    titulo('11. Profissional recusa um convite');
    $r = $mClin->convidarProfissional($clinId, $proId);
    check('novo convite enviado', ($r['sucesso'] ?? false) === true, msg($r));
    $n = $convite();
    if ($n) $criadas[] = (int) $n['notif_id'];
    $r = $mPro->recusarVinculo($proId, (int) ($n['notif_id'] ?? 0));
    check('recusarVinculo() retornou sucesso', ($r['sucesso'] ?? false) === true, msg($r));
    check('nenhum vínculo criado', $vinculo() === false);
    check('convite removido', $convite() === false);

} catch (\Throwable $e) {
    $falhas++;
    echo "\n[EXCEÇÃO NÃO TRATADA] " . get_class($e) . ': ' . $e->getMessage() . "\n  em " . $e->getFile() . ':' . $e->getLine() . "\n";
} finally {
    // ============ limpeza ============
    if ($pdo && $clinId && $proId) {
        titulo('Limpeza');
        try {
            $st = $pdo->prepare('SELECT pc_id FROM profissional_clinica WHERE pc_clin = :c AND pc_pro = :p');
            $st->execute([':c' => $clinId, ':p' => $proId]);
            foreach ($st->fetchAll(\PDO::FETCH_COLUMN) as $pcId) {
                $pdo->prepare('DELETE FROM permissoes WHERE perm_pc = :pc')->execute([':pc' => $pcId]);
                $pdo->prepare('DELETE FROM profissional_clinica WHERE pc_id = :pc')->execute([':pc' => $pcId]);
                echo "  removido vínculo pc_id=$pcId\n";
            }
            foreach ($criadas as $nid) {
                $pdo->prepare('DELETE FROM notificacao WHERE notif_id = :n')->execute([':n' => $nid]);
            }
            echo "  notificações de teste removidas (" . count($criadas) . " rastreadas)\n";
        } catch (\Throwable $e) {
            echo "  erro na limpeza: " . $e->getMessage() . "\n";
        }
    }
}

echo "\n==== RESULTADO: $ok ok, $falhas falha(s) ====\n";
exit($falhas ? 1 : 0);
