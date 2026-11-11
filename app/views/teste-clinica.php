<?php
/*
 * PÁGINA DE TESTE - clinicacontroller
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * Cobre as 8 ações do clinicacontroller:
 *   cadastrar, ReGerarCodigo, ativar, login, MostrarConsulta, pegarinfo, contato, verificarLogin
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas
 * para a rota "clinica" do Router. A rota é calculada no JS trocando o último trecho
 * da URL por "clinica" e pode ser corrigida no campo de endpoint da página.
 *
 * Antes de cada rodada rode o inserts_clinica.sql (ele limpa e recria os dados de teste).
 * Senha de todos os usuários de teste: Senha@123
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria na sessão (mesma estrutura de usuario::Login) */
$cenarios = [
    '0' => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1' => [
        'nome'    => 'Clínica Alfa (id 201) - 4 consultas, 2 profissionais, 2 horários',
        'usuario' => ['idUsuario' => 201, 'nome' => 'Clínica Alfa Teste', 'email' => 'alfa@testeclin.com', 'tipoUsuario' => 'clinica'],
    ],
    '2' => [
        'nome'    => 'Clínica Beta (id 202) - sem consultas e sem horários',
        'usuario' => ['idUsuario' => 202, 'nome' => 'Clínica Beta Teste', 'email' => 'beta@testeclin.com', 'tipoUsuario' => 'clinica'],
    ],
    '3' => [
        'nome'    => 'Profissional Ana (id 201) - não é clínica',
        'usuario' => ['idUsuario' => 201, 'nome' => 'Ana Podóloga', 'email' => 'ana@testeclin.com', 'tipoUsuario' => 'profissional'],
    ],
    '4' => [
        'nome'    => 'Cliente Um (id 201) - não é clínica',
        'usuario' => ['idUsuario' => 201, 'nome' => 'Cliente Um', 'email' => 'cli1@testeclin.com', 'tipoUsuario' => 'cliente'],
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
<title>Teste clínica</title>
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
<h1>Teste do clinicacontroller</h1>

<p class="aviso">
    Rode o <code>inserts_clinica.sql</code> antes de cada rodada (cadastrar e ativar mudam os dados).
    Senha de todos os usuários de teste: <code>Senha@123</code>.
</p>

<fieldset class="linha">
    <legend>0. Endpoint</legend>
    <label>Rota do clinicacontroller <input id="endpoint" type="text"></label>
    <small>Se a rota do seu Router for outra, corrija aqui (ex: /projetopsi/clinica).</small>
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
    <small>Cada teste monta a sessão que precisa. O "esperado" descreve o comportamento correto: linha vermelha = o código ou o dado de teste não bate com isso.</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo</summary>
<pre>select clin_id, clin_stat, clin_codVali from clinica where clin_id in (203, 204) or clin_email like 'novo.%@testeclin.com';
-- 203 = 'ativo'; 204 com código diferente de 654321; a clínica nova deve existir com stat 'desativo' (e só uma, sem as duplicadas)</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');
const endpointInput = el('endpoint');

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/clinica) */
endpointInput.value = location.pathname.replace(/[^\/]*\/?$/, 'clinica');
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

async function enviar(dados) {
    const fd = new FormData();
    for (const k in dados) fd.append(k, dados[k]);
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
    { acao: 'cadastrar', obs: 'Cria a clínica com status "desativo". E-mail, usuário e CNPJ são únicos.', campos: [
        { n: 'nome', l: 'Nome', v: 'Clínica Nova Manual' },
        { n: 'email', l: 'E-mail', v: 'novo.manual@testeclin.com' },
        { n: 'username', l: 'Usuário (até 20)', v: 'novamanual' },
        { n: 'senha', l: 'Senha', v: 'Senha@123' },
        { n: 'bio', l: 'Bio', v: 'Bio de teste' },
        { n: 'CNPJ', l: 'CNPJ (14 dígitos)', v: '90000000000299' },
        { n: 'CEP', l: 'CEP (8 dígitos)', v: '01310100' },
        { n: 'telefone', l: 'Telefone (11 dígitos)', v: '11933339999' } ] },
    { acao: 'ReGerarCodigo', obs: 'Gera outro código e manda por e-mail (precisa do SMTP). Confira clin_codVali no banco.', campos: [
        { n: 'email', l: 'E-mail', v: 'delta@testeclin.com' } ] },
    { acao: 'ativar', obs: 'Gama (203) começa desativada com o código 123456.', campos: [
        { n: 'email', l: 'E-mail', v: 'gama@testeclin.com' },
        { n: 'cod', l: 'Código', v: '123456' } ] },
    { acao: 'login', obs: 'Grava $_SESSION["usuario"]. Depois use verificarLogin ou pegarinfo.', campos: [
        { n: 'email', l: 'E-mail', v: 'alfa@testeclin.com' },
        { n: 'senha', l: 'Senha', v: 'Senha@123', t: 'password' } ] },
    { acao: 'MostrarConsulta', obs: 'Consultas com status "aceita" da clínica da sessão. A Alfa deve ter 3.', campos: [] },
    { acao: 'pegarinfo', obs: 'dados1 = perfil da clínica (id, nome, bio, CEP). Os horários são lidos mas o controller não devolve.', campos: [] },
    { acao: 'contato', obs: 'dados1 = profissionais que têm agenda com a clínica, sem repetir.', campos: [] },
    { acao: 'verificarLogin', obs: 'Devolve logado true só se a sessão for de clínica.', campos: [] }
];

function montarCartoes() {
    const alvo = el('cartoes');
    ACOES.forEach((a, idx) => {
        const fs = document.createElement('fieldset');
        let html = '<legend>' + esc(a.acao) + '</legend><p class="obs">' + esc(a.obs) + '</p>';
        a.campos.forEach((c, j) => {
            html += '<label>' + esc(c.l) + '<input id="f_' + idx + '_' + j + '" type="' + (c.t || 'text') + '" value="' + esc(c.v || '') + '"></label>';
        });
        html += '<button type="button">Enviar</button>';
        fs.innerHTML = html;
        alvo.appendChild(fs);
        fs.querySelector('button').addEventListener('click', () => {
            const dados = { acao: a.acao };
            a.campos.forEach((c, j) => { dados[c.n] = el('f_' + idx + '_' + j).value; });
            enviar(dados).then(mostrar);
        });
    });
}

/* ---------- bateria de testes ---------- */
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Clínica Alfa', '2': 'Clínica Beta', '3': 'Profissional', '4': 'Cliente' };

function criarTestes() {
    const ts = String(Date.now()); // 13 dígitos: deixa e-mail, usuário e CNPJ únicos a cada rodada
    const novo = {
        nome: 'Clínica Nova ' + ts.slice(-4),
        email: 'novo.' + ts + '@testeclin.com',
        username: 'c' + ts.slice(-8),
        senha: 'Senha@123',
        bio: 'Cadastro automático do teste',
        CNPJ: '9' + ts.slice(-13),
        CEP: '01310100',
        telefone: '119' + ts.slice(-8)
    };
    const S = { nenhuma: '0', alfa: '1', beta: '2', profissional: '3', cliente: '4' };
    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? '');
    const logado = v => j => j?.logado === v;
    const tam = (j, k) => Array.isArray(j?.[k]) ? j[k].length : -1;
    const vazioOuNegado = (j, k) => !(sucesso(j) && tam(j, k) > 0);

    return [
        /* --- cadastro, código e ativação --- */
        { grupo: 'Cadastro, código e ativação', n: 'cadastrar clínica nova', sessao: S.nenhuma,
          req: { acao: 'cadastrar', ...novo }, esp: 'sucesso: true', ok: sucesso },
        { n: 'cadastrar com e-mail repetido', req: { acao: 'cadastrar', ...novo, username: 'x' + ts.slice(-8), CNPJ: '8' + ts.slice(-13) },
          esp: 'sucesso: false (e-mail é único)', ok: falha },
        { n: 'cadastrar com CNPJ repetido', req: { acao: 'cadastrar', ...novo, email: 'novo.' + ts + 'b@testeclin.com', username: 'y' + ts.slice(-8) },
          esp: 'sucesso: false (CNPJ é único)', ok: falha },
        { n: 'login da clínica recém-cadastrada (ainda desativada)', req: { acao: 'login', email: novo.email, senha: novo.senha },
          esp: 'sucesso: false, "Conta não ativada"', ok: j => falha(j) && /ativada/i.test(msg(j)) },
        { n: 'ReGerarCodigo (Delta)', req: { acao: 'ReGerarCodigo', email: 'delta@testeclin.com' },
          esp: 'sucesso: true (precisa do SMTP configurado)', ok: sucesso },
        { n: 'ativar com código errado (Gama)', req: { acao: 'ativar', email: 'gama@testeclin.com', cod: '000000' },
          esp: 'sucesso: false, "e-mail ou codigo invalido"', ok: falha },
        { n: 'ativar com código certo (Gama)', req: { acao: 'ativar', email: 'gama@testeclin.com', cod: '123456' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'login da Gama já ativa', req: { acao: 'login', email: 'gama@testeclin.com', senha: 'Senha@123' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'login com senha errada', req: { acao: 'login', email: 'alfa@testeclin.com', senha: 'errada' },
          esp: 'sucesso: false, "Senha inválida"', ok: j => falha(j) && /senha/i.test(msg(j)) },
        { n: 'login com e-mail inexistente', req: { acao: 'login', email: 'ninguem@testeclin.com', senha: 'Senha@123' },
          esp: 'sucesso: false, "E-mail não encontrado"', ok: j => falha(j) && /e-mail/i.test(msg(j)) },
        { n: 'login da Alfa', req: { acao: 'login', email: 'alfa@testeclin.com', senha: 'Senha@123' },
          esp: 'sucesso: true', ok: sucesso },

        /* --- verificarLogin --- */
        { grupo: 'verificarLogin', n: 'logo depois do login real da Alfa (sem montar sessão)', req: { acao: 'verificarLogin' },
          esp: 'logado: true (usa a sessão criada pelo login acima)', ok: logado(true) },
        { n: 'sessão de clínica', sessao: S.alfa, req: { acao: 'verificarLogin' }, esp: 'logado: true', ok: logado(true) },
        { n: 'sessão de profissional', sessao: S.profissional, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },
        { n: 'sessão de cliente', sessao: S.cliente, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },

        /* --- pegarinfo --- */
        { grupo: 'pegarinfo', n: 'Alfa: perfil com nome, bio e CEP', sessao: S.alfa, req: { acao: 'pegarinfo' },
          esp: 'sucesso, dados1 com 1 linha: Clínica Alfa, CEP 01310100',
          ok: j => sucesso(j) && tam(j, 'dados1') === 1 && String(j.dados1[0].clin_nome).startsWith('Clínica Alfa') && j.dados1[0].clin_cep === '01310100' },
        { n: 'Beta: perfil próprio (não mistura com a Alfa)', sessao: S.beta, req: { acao: 'pegarinfo' },
          esp: 'sucesso, dados1 com 1 linha: Clínica Beta',
          ok: j => sucesso(j) && tam(j, 'dados1') === 1 && String(j.dados1[0].clin_nome).startsWith('Clínica Beta') },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'pegarinfo' }, aceitaAviso: true,
          esp: 'não devolve perfil nenhum (sucesso: false ou dados1 vazio)', ok: j => vazioOuNegado(j, 'dados1') },

        /* --- MostrarConsulta --- */
        { grupo: 'MostrarConsulta', n: 'Alfa: 3 consultas aceitas (a "esperando" fica de fora)', sessao: S.alfa, req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados com 3 consultas', ok: j => sucesso(j) && tam(j, 'dados') === 3 },
        { n: 'Beta: sem consultas', sessao: S.beta, req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados vazio', ok: j => sucesso(j) && tam(j, 'dados') === 0 },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'MostrarConsulta' }, aceitaAviso: true,
          esp: 'não devolve consulta nenhuma', ok: j => vazioOuNegado(j, 'dados') },

        /* --- contato --- */
        { grupo: 'contato', n: 'Alfa: 2 profissionais, cada um uma vez só', sessao: S.alfa, req: { acao: 'contato' },
          esp: 'sucesso, dados1 com os profissionais 201 e 202 (sem repetir, mesmo com 2 consultas cada)',
          ok: j => sucesso(j) && tam(j, 'dados1') === 2 && new Set(j.dados1.map(p => String(p.pro_id))).size === 2 },
        { n: 'Beta: sem consultas, sem contatos', sessao: S.beta, req: { acao: 'contato' },
          esp: 'sucesso, dados1 vazio', ok: j => sucesso(j) && tam(j, 'dados1') === 0 },

        /* --- ação inexistente --- */
        { grupo: 'Ação inválida', n: 'ação inexistente', sessao: S.alfa, req: { acao: 'nao_existe' },
          esp: 'resposta vazia ou sucesso: false (o switch não tem default)', ok: (j, r) => r.texto.trim() === '' || falha(j) }
    ];
}

function resumo(res) {
    if (!res.json) {
        const limpo = (res.texto || '(resposta vazia)').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return 'sem JSON: ' + limpo.slice(0, 180);
    }
    let s = JSON.stringify(res.json);
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
        try { ok = !!t.ok(res.json, res) && (t.aceitaAviso || !(res.json && res.json.__sujo)); } catch (e) { ok = false; }
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