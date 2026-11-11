<?php
/*
 * PÁGINA DE TESTE - profissionalcontroller
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * Cobre as 13 ações do profissionalcontroller:
 *   cadastrar, ReGerarCodigo, ativar, login, atribuirHrServico, aribuirHrExcecao,
 *   MostrarConsulta, PegarPerfil, contato, verificarLogin, atualizar, aceitar, rejeitar
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas
 * para a rota "profissional" do Router. A rota é calculada no JS trocando o último trecho
 * da URL por "profissional" e pode ser corrigida no campo de endpoint da página.
 *
 * Antes de cada rodada rode o inserts_profissional.sql (ele limpa e recria os dados de teste).
 * Senha de todos os usuários de teste: Senha@123
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria na sessão (mesma estrutura de usuario::Login) */
$cenarios = [
    '0' => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1' => [
        'nome'    => 'Profissional Ana (id 101) - tem horários, serviços, agenda e notificações',
        'usuario' => ['idUsuario' => 101, 'nome' => 'Ana Podóloga', 'email' => 'ana.pro@testepro.com', 'tipoUsuario' => 'profissional'],
    ],
    '2' => [
        'nome'    => 'Profissional Bruno (id 102) - quase sem dados, sem agenda',
        'usuario' => ['idUsuario' => 102, 'nome' => 'Bruno Podólogo', 'email' => 'bruno.pro@testepro.com', 'tipoUsuario' => 'profissional'],
    ],
    '3' => [
        'nome'    => 'Clínica Alfa (id 101) - não é profissional',
        'usuario' => ['idUsuario' => 101, 'nome' => 'Clínica Alfa Teste', 'email' => 'clinica101@testepro.com', 'tipoUsuario' => 'clinica'],
    ],
    '4' => [
        'nome'    => 'Cliente Um (id 101) - não é profissional',
        'usuario' => ['idUsuario' => 101, 'nome' => 'Cliente Um', 'email' => 'cliente101@testepro.com', 'tipoUsuario' => 'cliente'],
    ],
];

/* Monta a sessão do cenário escolhido */
if (($_POST['acao'] ?? '') === 'setup_teste') {
    header('Content-Type: application/json; charset=utf-8');
    $chave = $_POST['cenario'] ?? '';
    if (!array_key_exists($chave, $cenarios)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'cenário inválido']);
        exit;
    }
    $c = $cenarios[$chave];
    if ($c['usuario'] === null) {
        unset($_SESSION['usuario']);
    } else {
        $_SESSION['usuario'] = $c['usuario'];
    }
    echo json_encode(['sucesso' => true, 'sessao' => ['usuario' => $_SESSION['usuario'] ?? null]]);
    exit;
}

/* Ver a sessão atual */
if (($_POST['acao'] ?? '') === 'ver_sessao') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['usuario' => $_SESSION['usuario'] ?? null]);
    exit;
}

?><!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste profissional</title>
<style>
    body { font-family: system-ui, sans-serif; max-width: 1100px; margin: 24px auto; padding: 0 16px 280px; color: #222; }
    h1 { font-size: 1.3rem; }
    h2 { font-size: 1.1rem; margin-top: 24px; }
    fieldset { margin: 12px 0; border: 1px solid #ccc; border-radius: 8px; min-width: 0; }
    legend { font-weight: 600; padding: 0 6px; }
    label { display: block; margin: 6px 0; font-size: .9rem; }
    label input, label select { display: block; width: 100%; box-sizing: border-box; margin-top: 2px; }
    input, select, button { padding: 6px 8px; font-size: .95rem; }
    button { cursor: pointer; margin: 4px 4px 4px 0; }
    .linha label { display: inline-block; width: auto; margin: 4px 12px 4px 0; }
    .linha input, .linha select { display: inline-block; width: auto; }
    #endpoint { width: min(480px, 90vw); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 4px 14px; }
    .obs { font-size: .8rem; color: #555; margin: 2px 0 6px; }
    .aviso { background: #fff7e0; border: 1px solid #e6c200; padding: 8px 12px; border-radius: 8px; font-size: .9rem; }
    pre { background: #111; color: #d6ffd6; padding: 12px; border-radius: 8px; overflow: auto; white-space: pre-wrap; }
    pre#saida { position: sticky; bottom: 0; max-height: 38vh; min-height: 70px; margin-bottom: 0; }
    table { border-collapse: collapse; width: 100%; margin-top: 8px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-size: .85rem; vertical-align: top; }
    td.obt { font-family: ui-monospace, monospace; font-size: .78rem; word-break: break-word; }
    tr.grupo td { background: #e8eefc; font-weight: 600; }
    .ok { color: #0a7d2c; font-weight: 600; } .erro { color: #b00020; font-weight: 600; }
    code { background: #f0f0f0; padding: 1px 4px; border-radius: 4px; }
</style>
</head>
<body>
<h1>Teste do profissionalcontroller</h1>

<p class="aviso">
    Rode o <code>inserts_profissional.sql</code> antes de cada rodada (ativar, aceitar, rejeitar e atualizar mudam os dados).
    Senha de todos os usuários de teste: <code>Senha@123</code>.
</p>

<fieldset class="linha">
    <legend>0. Endpoint</legend>
    <label>Rota do profissionalcontroller <input id="endpoint" type="text"></label>
    <small>Se a rota do seu Router for outra, corrija aqui (ex: /projetopsi/profissional).</small>
</fieldset>

<fieldset class="linha">
    <legend>1. Sessão (simula o que o login colocaria em $_SESSION['usuario'])</legend>
    <select id="cenario">
        <?php foreach ($cenarios as $k => $c): ?>
            <option value="<?= $k ?>"><?= htmlspecialchars($c['nome']) ?></option>
        <?php endforeach; ?>
    </select>
    <button id="btnMontar">Montar sessão</button>
    <button id="btnVer">Ver sessão</button>
</fieldset>

<fieldset>
    <legend>2. Rodar tudo e comparar com o esperado</legend>
    <button id="btnTudo">Rodar todos os testes</button>
    <small>Cada teste monta a sessão que precisa. O "esperado" descreve o comportamento correto: linha vermelha = bug no código (ou dado de teste fora do lugar).</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo</summary>
<pre>select pro_id, pro_stat, pro_codVali from profissional where pro_id in (103, 104) or pro_email like 'novo.%@testepro.com';
-- 103 = 'ativo'; 104 com código diferente de 654321; o novo cadastro deve existir com stat 'desativo'

select agnd_id, agnd_stat from agenda where agnd_pro = 101;
-- 103 = 'aceita'; 104 não deve existir (rejeitada)

select * from hr_servico where hrser_pro = 101;        -- 8 linhas (2 novas no domingo, dia 0)
select * from hr_excecao where hr_excecao_pro = 101;   -- 4 linhas (2 novas: 31/12 folga e 27/12 extra)
select pro_nome, pro_bio, pro_tel from profissional where pro_id = 101;</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');
const endpointInput = el('endpoint');

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/profissional) */
endpointInput.value = location.pathname.replace(/[^\/]*\/?$/, 'profissional');
const ENDPOINT_PAGINA = location.pathname; // setup_teste e ver_sessao ficam nesta página

function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Lê o JSON. Se o PHP soltou warning/notice antes do JSON, lê mesmo assim mas marca como "sujo". */
function lerJson(texto) {
    try { return JSON.parse(texto); } catch (e) {}
    const i = texto.search(/[\[{]/);
    if (i > 0) {
        try {
            const j = JSON.parse(texto.slice(i));
            if (j && typeof j === 'object') { Object.defineProperty(j, '__sujo', { value: true }); }
            return j;
        } catch (e) {}
    }
    return null;
}

/* Arrays viram campo[] (ex: atualizacao[] e valores[]) */
async function enviar(dados) {
    const fd = new FormData();
    for (const k in dados) {
        const v = dados[k];
        if (Array.isArray(v)) v.forEach(x => fd.append(k + '[]', x));
        else fd.append(k, v);
    }
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const url = propria ? ENDPOINT_PAGINA : endpointInput.value.trim();
    try {
        const r = await fetch(url, { method: 'POST', body: fd, credentials: 'same-origin' });
        const texto = await r.text();
        return { status: r.status, texto, json: lerJson(texto) };
    } catch (e) {
        return { status: 0, texto: 'Falha de rede: ' + e.message, json: null };
    }
}

function mostrar(res) {
    const sujo = res.json && res.json.__sujo ? '  (⚠ texto fora do JSON: warning/notice do PHP)' : '';
    saida.textContent = 'HTTP ' + res.status + sujo + '\n' +
        (res.json ? JSON.stringify(res.json, null, 2) : (res.texto || '(resposta vazia)'));
}

/* ---------- sessão ---------- */
const montarSessao = chave => enviar({ acao: 'setup_teste', cenario: chave ?? el('cenario').value });
el('btnMontar').addEventListener('click', () => montarSessao().then(mostrar));
el('btnVer').addEventListener('click', () => enviar({ acao: 'ver_sessao' }).then(mostrar));

/* ---------- ações individuais (um cartão por ação) ---------- */
const ACOES = [
    { acao: 'cadastrar', obs: 'Cria o profissional com status "desativo". E-mail, usuário e CPF são únicos.', campos: [
        { n: 'nome', l: 'Nome', v: 'Novo Profissional' },
        { n: 'email', l: 'E-mail', v: 'novo.manual@testepro.com' },
        { n: 'username', l: 'Usuário', v: 'novomanual' },
        { n: 'senha', l: 'Senha', v: 'Senha@123' },
        { n: 'bio', l: 'Bio', v: 'Bio de teste' },
        { n: 'dtNas', l: 'Nascimento', v: '1995-05-20', t: 'date' },
        { n: 'CPF', l: 'CPF', v: '90000000199' },
        { n: 'CEP', l: 'CEP', v: '01001000' },
        { n: 'telefone', l: 'Telefone', v: '11911110199' },
        { n: 'genero', l: 'Gênero (1 letra)', v: 'F' },
        { n: 'registro', l: 'Registro', v: 'CRP-9999' } ] },
    { acao: 'ReGerarCodigo', obs: 'Gera outro código e manda por e-mail (precisa do SMTP). Confira pro_codVali no banco.', campos: [
        { n: 'email', l: 'E-mail', v: 'diego.pro@testepro.com' } ] },
    { acao: 'ativar', obs: 'Carla (103) começa desativada com o código 123456.', campos: [
        { n: 'email', l: 'E-mail', v: 'carla.pro@testepro.com' },
        { n: 'cod', l: 'Código', v: '123456' } ] },
    { acao: 'login', obs: 'Grava $_SESSION["usuario"]. Depois use verificarLogin ou PegarPerfil.', campos: [
        { n: 'email', l: 'E-mail', v: 'ana.pro@testepro.com' },
        { n: 'senha', l: 'Senha', v: 'Senha@123', t: 'password' } ] },
    { acao: 'atribuirHrServico', obs: 'Usa o id da sessão. Clínica vazia = campo não é enviado (o controller usa 0). Dia: 0 = domingo ... 6 = sábado.', campos: [
        { n: 'clinica', l: 'Clínica', v: '', opcional: true },
        { n: 'inicio', l: 'Início', v: '08:00', t: 'time' },
        { n: 'termino', l: 'Término', v: '12:00', t: 'time' },
        { n: 'dia', l: 'Dia da semana (0-6)', v: '2' } ] },
    { acao: 'aribuirHrExcecao', obs: 'O nome da ação está assim no controller (sem o "t"). Trabalho: 1 = dia extra, 0 = folga. Folga total: horários vazios.', campos: [
        { n: 'dia', l: 'Dia', v: '2026-12-30', t: 'date' },
        { n: 'trabalho', l: 'Trabalho?', t: 'select', opts: ['0', '1'] },
        { n: 'inicio', l: 'Início', v: '', t: 'time' },
        { n: 'termino', l: 'Término', v: '', t: 'time' },
        { n: 'descricao', l: 'Descrição', v: 'Exceção de teste' } ] },
    { acao: 'MostrarConsulta', obs: 'Consultas com status "aceita" do profissional da sessão.', campos: [] },
    { acao: 'PegarPerfil', obs: 'dados1 = perfil, dados2 = hr_servico, dados3 = serviços.', campos: [] },
    { acao: 'contato', obs: 'dados1 = clientes, dados2 = clínicas que têm agenda com o profissional.', campos: [] },
    { acao: 'verificarLogin', obs: 'Devolve logado true só se a sessão for de profissional.', campos: [] },
    { acao: 'atualizar', obs: 'Separe vários itens com |. Chaves válidas: nome, email, biografia, foto, CEP, telefone.', campos: [
        { n: 'atualizacao', l: 'Campos', v: 'nome|biografia|telefone', lista: true },
        { n: 'valores', l: 'Valores', v: 'Ana Atualizada|Bio atualizada pelo teste|11999990101', lista: true } ] },
    { acao: 'aceitar', obs: 'Aceita a consulta com status "esperando".', campos: [
        { n: 'cli', l: 'Id do cliente', v: '101' } ] },
    { acao: 'rejeitar', obs: 'Rejeita (apaga) a consulta com status "esperando".', campos: [
        { n: 'cli', l: 'Id do cliente', v: '102' } ] }
];

function montarCartoes() {
    const alvo = el('cartoes');
    ACOES.forEach((a, idx) => {
        const fs = document.createElement('fieldset');
        let html = '<legend>' + esc(a.acao) + '</legend><p class="obs">' + esc(a.obs) + '</p>';
        a.campos.forEach((c, j) => {
            const id = 'f_' + idx + '_' + j;
            if (c.t === 'select') {
                html += '<label>' + esc(c.l) + '<select id="' + id + '">' +
                    c.opts.map(o => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('') + '</select></label>';
            } else {
                html += '<label>' + esc(c.l) + '<input id="' + id + '" type="' + (c.t || 'text') + '" value="' +
                    esc(c.v || '') + '"' + (c.opcional ? ' placeholder="(opcional)"' : '') + '></label>';
            }
        });
        html += '<button type="button">Enviar</button>';
        fs.innerHTML = html;
        alvo.appendChild(fs);
        fs.querySelector('button').addEventListener('click', () => enviarCartao(idx));
    });
}

function enviarCartao(idx) {
    const a = ACOES[idx];
    const dados = { acao: a.acao };
    a.campos.forEach((c, j) => {
        const v = el('f_' + idx + '_' + j).value;
        if (c.opcional && v === '') return;
        dados[c.n] = c.lista ? v.split('|').map(s => s.trim()) : v;
    });
    enviar(dados).then(mostrar);
}

/* ---------- bateria de testes ---------- */
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Ana', '2': 'Bruno', '3': 'Clínica', '4': 'Cliente' };

function criarTestes() {
    const ts = String(Date.now());
    /* dados únicos a cada rodada para o cadastro não bater em e-mail/usuário/CPF repetido */
    const novo = {
        nome: 'Profissional Novo ' + ts.slice(-4),
        email: 'novo.' + ts + '@testepro.com',
        username: 'n' + ts.slice(-8),
        senha: 'Senha@123',
        bio: 'Cadastro automático do teste',
        dtNas: '1995-05-20',
        CPF: '8' + ts.slice(-10),
        CEP: '01001000',
        telefone: '119' + ts.slice(-8),
        genero: 'F',
        registro: 'CRP-' + ts.slice(-6)
    };
    const S = { nenhuma: '0', ana: '1', bruno: '2', clinica: '3', cliente: '4' };
    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? '');
    const logado = v => j => j?.logado === v;
    const tam = (j, k) => Array.isArray(j?.[k]) ? j[k].length : -1;
    const pri = (j, k) => j?.[k]?.[0];

    return [
        /* --- cadastro, código e ativação --- */
        { grupo: 'Cadastro, código e ativação', n: 'cadastrar profissional novo', sessao: S.nenhuma,
          req: { acao: 'cadastrar', ...novo }, esp: 'sucesso: true', ok: sucesso },
        { n: 'cadastrar com e-mail repetido', req: { acao: 'cadastrar', ...novo, username: 'x' + ts.slice(-8), CPF: '7' + ts.slice(-10) },
          esp: 'sucesso: false (e-mail é único)', ok: falha },
        { n: 'login de conta não ativada (a recém-cadastrada)', req: { acao: 'login', email: novo.email, senha: novo.senha },
          esp: 'sucesso: false, "Conta não ativada"', ok: j => falha(j) && /ativada/i.test(msg(j)) },
        { n: 'ReGerarCodigo (Diego)', req: { acao: 'ReGerarCodigo', email: 'diego.pro@testepro.com' },
          esp: 'sucesso: true (precisa do SMTP configurado)', ok: sucesso },
        { n: 'ativar com código errado (Carla)', req: { acao: 'ativar', email: 'carla.pro@testepro.com', cod: '000000' },
          esp: 'sucesso: false', ok: falha },
        { n: 'ativar com código certo (Carla)', req: { acao: 'ativar', email: 'carla.pro@testepro.com', cod: '123456' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'login da Carla já ativa', req: { acao: 'login', email: 'carla.pro@testepro.com', senha: 'Senha@123' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'login com senha errada', req: { acao: 'login', email: 'ana.pro@testepro.com', senha: 'errada' },
          esp: 'sucesso: false, "Senha inválida"', ok: j => falha(j) && /senha/i.test(msg(j)) },
        { n: 'login com e-mail inexistente', req: { acao: 'login', email: 'ninguem@testepro.com', senha: 'Senha@123' },
          esp: 'sucesso: false, "E-mail não encontrado"', ok: j => falha(j) && /e-mail/i.test(msg(j)) },
        { n: 'login da Ana', req: { acao: 'login', email: 'ana.pro@testepro.com', senha: 'Senha@123' },
          esp: 'sucesso: true', ok: sucesso },

        /* --- verificarLogin --- */
        { grupo: 'verificarLogin', n: 'logo depois do login real da Ana (sem montar sessão)', req: { acao: 'verificarLogin' },
          esp: 'logado: true (usa a sessão criada pelo login acima)', ok: logado(true) },
        { n: 'sessão de profissional', sessao: S.ana, req: { acao: 'verificarLogin' }, esp: 'logado: true', ok: logado(true) },
        { n: 'sessão de clínica', sessao: S.clinica, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },
        { n: 'sessão de cliente', sessao: S.cliente, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },

        /* --- PegarPerfil --- */
        { grupo: 'PegarPerfil', n: 'Ana: perfil, 6 horários e 2 serviços', sessao: S.ana, req: { acao: 'PegarPerfil' },
          esp: 'sucesso, dados1 = Ana, dados2 com 6 linhas, dados3 com 2 linhas',
          ok: j => sucesso(j) && String(pri(j, 'dados1')?.pro_nome).startsWith('Ana') && tam(j, 'dados2') === 6 && tam(j, 'dados3') === 2 },
        { n: 'Bruno: perfil, 1 horário e 1 serviço (não mistura com a Ana)', sessao: S.bruno, req: { acao: 'PegarPerfil' },
          esp: 'sucesso, dados1 = Bruno, dados2 com 1 linha, dados3 com 1 linha',
          ok: j => sucesso(j) && String(pri(j, 'dados1')?.pro_nome).startsWith('Bruno') && tam(j, 'dados2') === 1 && tam(j, 'dados3') === 1 },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'PegarPerfil' },
          esp: 'sucesso: false (não deve devolver perfil sem login)', ok: falha },

        /* --- horários --- */
        { grupo: 'Horários de trabalho e exceções', n: 'atribuirHrServico sem clínica (domingo 07:00-11:00)', sessao: S.ana,
          req: { acao: 'atribuirHrServico', inicio: '07:00', termino: '11:00', dia: '0' }, esp: 'sucesso: true (clínica cai em 0)', ok: sucesso },
        { n: 'atribuirHrServico com clínica 101 (domingo 13:00-17:00)',
          req: { acao: 'atribuirHrServico', clinica: '101', inicio: '13:00', termino: '17:00', dia: '0' }, esp: 'sucesso: true', ok: sucesso },
        { n: 'PegarPerfil confirma os 2 horários novos', req: { acao: 'PegarPerfil' },
          esp: 'dados2 com 8 linhas, 2 delas com hrser_dia = 0',
          ok: j => sucesso(j) && tam(j, 'dados2') === 8 && j.dados2.filter(r => String(r.hrser_dia) === '0').length === 2 },
        { n: 'aribuirHrExcecao folga total (31/12)',
          req: { acao: 'aribuirHrExcecao', dia: '2026-12-31', trabalho: '0', inicio: '', termino: '', descricao: 'Folga criada pelo teste' },
          esp: 'sucesso: true (horários vazios devem virar NULL)', ok: sucesso },
        { n: 'aribuirHrExcecao dia extra (27/12 09:00-13:00)',
          req: { acao: 'aribuirHrExcecao', dia: '2026-12-27', trabalho: '1', inicio: '09:00', termino: '13:00', descricao: 'Dia extra criado pelo teste' },
          esp: 'sucesso: true', ok: sucesso },

        /* --- consultas e contatos --- */
        { grupo: 'Consultas e contatos', n: 'MostrarConsulta da Ana (2 aceitas)', sessao: S.ana, req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados com 2 consultas', ok: j => sucesso(j) && tam(j, 'dados') === 2 },
        { n: 'MostrarConsulta do Bruno (sem agenda)', sessao: S.bruno, req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados vazio', ok: j => sucesso(j) && tam(j, 'dados') === 0 },
        { n: 'contato da Ana (2 clientes e 1 clínica, sem repetir)', sessao: S.ana, req: { acao: 'contato' },
          esp: 'sucesso, dados1 com 2 clientes, dados2 com 1 clínica', ok: j => sucesso(j) && tam(j, 'dados1') === 2 && tam(j, 'dados2') === 1 },
        { n: 'contato do Bruno (sem agenda)', sessao: S.bruno, req: { acao: 'contato' },
          esp: 'sucesso, dados1 e dados2 vazios', ok: j => sucesso(j) && tam(j, 'dados1') === 0 && tam(j, 'dados2') === 0 },

        /* --- atualizar --- */
        { grupo: 'atualizar', n: 'atualizar nome, biografia e telefone da Ana', sessao: S.ana,
          req: { acao: 'atualizar', atualizacao: ['nome', 'biografia', 'telefone'], valores: ['Ana Atualizada', 'Bio atualizada pelo teste', '11999990101'] },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'PegarPerfil confirma a atualização', req: { acao: 'PegarPerfil' },
          esp: 'dados1 com nome "Ana Atualizada" e a bio nova',
          ok: j => sucesso(j) && pri(j, 'dados1')?.pro_nome === 'Ana Atualizada' && pri(j, 'dados1')?.pro_bio === 'Bio atualizada pelo teste' },
        { n: 'atualizar campo fora da lista (senha)', req: { acao: 'atualizar', atualizacao: ['senha'], valores: ['hackeada'] },
          esp: 'sucesso: false (só os campos do dicionário podem mudar)', ok: falha },

        /* --- aceitar e rejeitar --- */
        { grupo: 'Aceitar e rejeitar consultas', n: 'aceitar consulta do cliente 101', sessao: S.ana, req: { acao: 'aceitar', cli: '101' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'MostrarConsulta confirma (agora 3 aceitas)', req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados com 3 consultas', ok: j => sucesso(j) && tam(j, 'dados') === 3 },
        { n: 'rejeitar consulta do cliente 102', req: { acao: 'rejeitar', cli: '102' },
          esp: 'sucesso: true (agenda 104 some do banco)', ok: sucesso },
        { n: 'aceitar sem sessão', sessao: S.nenhuma, req: { acao: 'aceitar', cli: '101' },
          esp: 'sucesso: false', ok: falha },
        { n: 'ação inexistente', req: { acao: 'nao_existe' },
          esp: 'JSON com sucesso: false', ok: falha }
    ];
}

function resumo(res) {
    if (!res.json) {
        const limpo = (res.texto || '(resposta vazia)').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return 'sem JSON: ' + limpo.slice(0, 180);
    }
    const copia = Array.isArray(res.json) ? res.json : Object.assign({}, res.json);
    let s = JSON.stringify(copia);
    if (s.length > 220) s = s.slice(0, 220) + '…';
    return (res.json.__sujo ? '⚠ texto fora do JSON · ' : '') + s;
}

async function rodarTudo() {
    const btn = el('btnTudo');
    btn.disabled = true;
    const testes = criarTestes();
    const brutos = [];
    let html = '<table><tr><th>#</th><th>Teste</th><th>Sessão</th><th>Esperado</th><th>Obtido</th><th></th></tr>';
    let passou = 0;
    let sessaoAtual = '(login real)';

    for (let i = 0; i < testes.length; i++) {
        const t = testes[i];
        veredito.textContent = 'Rodando ' + (i + 1) + ' de ' + testes.length + '…';
        if (t.sessao !== undefined) {
            await montarSessao(t.sessao);
            sessaoAtual = ROTULO_SESSAO[t.sessao];
        }
        const res = await enviar(t.req);
        let ok = false;
        try { ok = !!t.ok(res.json) && !(res.json && res.json.__sujo); } catch (e) { ok = false; }
        if (ok) passou++;
        brutos.push({ teste: t.n, enviado: t.req, status: res.status, resposta: res.json ?? res.texto });

        if (t.grupo) html += '<tr class="grupo"><td colspan="6">' + esc(t.grupo) + '</td></tr>';
        html += '<tr><td>' + (i + 1) + '</td><td>' + esc(t.n) + '</td><td>' + esc(sessaoAtual) + '</td><td>' + esc(t.esp) +
            '</td><td class="obt">' + esc(resumo(res)) + '</td><td class="' + (ok ? 'ok' : 'erro') + '">' + (ok ? 'OK' : 'FALHOU') + '</td></tr>';
    }

    html += '</table>';
    veredito.innerHTML = '<p><b>' + passou + ' de ' + testes.length + ' testes passaram.</b></p>' + html;
    saida.textContent = JSON.stringify(brutos, null, 2);
    btn.disabled = false;
}
el('btnTudo').addEventListener('click', rodarTudo);

montarCartoes();
</script>
</body>
</html>