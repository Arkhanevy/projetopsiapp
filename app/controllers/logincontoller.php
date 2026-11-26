<?php
/**
 * Controller de login unificado.
 *
 * Recebe e-mail + senha, procura o usuário nas três tabelas (cliente,
 * profissional, clínica) e abre a sessão no primeiro que bater.
 * Resposta (JSON):
 *   sucesso: {"sucesso": true, "tipoUsuario": "cliente|profissional|clinica"}
 *   falha:   {"sucesso": false, "mensagem": "..."}
 */
use models\cliente;
use models\clinica;
use models\profissional;

header('Content-Type: application/json; charset=utf-8');

$acao = $_POST['acao'] ?? '';

if ($acao !== 'login') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Ação inválida.']);
    exit;
}

$email = trim((string) ($_POST['email'] ?? ''));
$senha = (string) ($_POST['senha'] ?? '');

if ($email === '' || $senha === '') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Preencha e-mail e senha.']);
    exit;
}

// Cada tipo: classe do model, tabela e campos (id, nome, email, senha, status).
$tipos = [
    'cliente' => [
        'classe' => cliente::class,
        'campos' => ['cli_id', 'cli_nome', 'cli_email', 'cli_senha', 'cli_stat'],
    ],
    'profissional' => [
        'classe' => profissional::class,
        'campos' => ['pro_id', 'pro_nome', 'pro_email', 'pro_senha', 'pro_stat'],
    ],
    'clinica' => [
        'classe' => clinica::class,
        'campos' => ['clin_id', 'clin_nome', 'clin_email', 'clin_senha', 'clin_stat'],
    ],
];

$mensagensComuns = ['E-mail não encontrado', 'Senha inválida'];
$contaNaoAtivada = false;
$tipoPendente = null; // tipo da conta que existe mas ainda não foi ativada

try {
    foreach ($tipos as $tabela => $tipo) {
        $modelo    = new $tipo['classe']($tabela, $tipo['campos'], $tipo['campos'][0]);
        $resultado = $modelo->Login($email, $senha);

        if (($resultado['sucesso'] ?? false) === true) {
            // novo id de sessão após autenticar (evita session fixation)
            session_regenerate_id(true);
            echo json_encode([
                'sucesso'     => true,
                'tipoUsuario' => $_SESSION['usuario']['tipoUsuario'] ?? $tabela,
            ]);
            exit;
        }

        $mensagem = $resultado['mensagem'] ?? '';
        if ($mensagem === 'Conta não ativada') {
            $contaNaoAtivada = true;
            $tipoPendente = $tipoPendente ?? $tabela;
        } elseif (!in_array($mensagem, $mensagensComuns, true)) {
            // erro inesperado (ex.: banco): só no log, nunca para o usuário
            error_log("Login ($tabela): $mensagem");
        }
    }
} catch (\Throwable $e) {
    error_log('Login: ' . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Não foi possível realizar o login agora. Tente novamente.']);
    exit;
}

echo json_encode([
    'sucesso'  => false,
    'mensagem' => $contaNaoAtivada
        ? 'Conta não ativada. Confirme o código enviado ao seu e-mail.'
        : 'E-mail ou senha inválidos.',
    // o front usa para abrir a ativação da conta certa
    'tipoPendente' => $contaNaoAtivada ? $tipoPendente : null,
]);
exit;
