<?php
/*
 * PÁGINA DE TESTE - clientecontroller
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * Cobre as 8 ações do clientecontroller:
 *   cadastrar, ReGerarCodigo, ativar, login, MostrarConsulta, contato, verificarLogin, atualizar
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas
 * para a rota "cliente" do Router. A rota é calculada no JS trocando o último trecho
 * da URL por "cliente" e pode ser corrigida no campo de endpoint da página.
 *
 * Antes de cada rodada rode o inserts_cliente.sql (ele limpa e recria os dados de teste).
 * Senha de todos os usuários de teste: Senha@123
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria na sessão (mesma estrutura de usuario::Login) */
$cenarios = [
    '0' => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1' => [
        'nome'    => 'Cliente Um (id 301) - 2 consultas aceitas em clínica, contatos: 2 profissionais e 1 clínica',
        'usuario' => ['idUsuario' => 301, 'nome' => 'Cliente Um', 'email' => 'um@testecli.com', 'tipoUsuario' => 'cliente'],
    ],
    '2' => [
        'nome'    => 'Cliente Dois (id 302) - 1 consulta com profissional autônomo (sem clínica)',
        'usuario' => ['idUsuario' => 302, 'nome' => 'Cliente Dois', 'email' => 'dois@testecli.com', 'tipoUsuario' => 'cliente'],
    ],
    '3' => [
        'nome'    => 'Cliente Três (id 303) - sem consultas',
        'usuario' => ['idUsuario' => 303, 'nome' => 'Cliente Três', 'email' => 'tres@testecli.com', 'tipoUsuario' => 'cliente'],
    ],
    '4' => [
        'nome'    => 'Profissional Ana (id 311) - não é cliente',
        'usuario' => ['idUsuario' => 311, 'nome' => 'Ana Podóloga', 'email' => 'ana@testecli.com', 'tipoUsuario' => 'profissional'],
    ],
    '5' => [
        'nome'    => 'Clínica Alfa (id 321) - não é cliente',
        'usuario' => ['idUsuario' => 321, 'nome' => 'Clínica Alfa Teste', 'email' => 'alfa@testecli.com', 'tipoUsuario' => 'clinica'],
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
<title>Teste cliente</title>
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
<h1>Teste do clientecontroller</h1>

<p class="aviso">
    Rode o <code>inserts_cliente.sql</code> antes de cada rodada (cadastrar, ativar e atualizar mudam os dados).
    Senha de todos os usuários de teste: <code>Senha@123</code>.
</p>

<fieldset class="linha">
    <legend>0. Endpoint</legend>
    <label>Rota do clientecontroller <input id="endpoint" type="text"></label>
    <small>Se a rota do seu Router for outra, corrija aqui (ex: /projetopsi/cliente).</small>
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
<pre>select cli_id, cli_stat, cli_codVali from cliente where cli_id in (304, 305) or cli_email like 'novo.%@testecli.com';
-- 304 = 'ativo'; 305 com código diferente de 654321; devem existir 2 clientes novos (completo e mínimo), com stat 'desativo'

select cli_nome, cli_bio, cli_tel from cliente where cli_id = 301;
-- depois do teste "atualizar": 'Cliente Atualizado', 'Bio atualizada pelo teste', '11999990301'

select clin_id, clin_nome, clin_bio from clinica where clin_id = 321;
-- não pode ter mudado (o controller de cliente monta o atualizar em cima da classe/tabela clinica)</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');
const endpointInput = el('endpoint');

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/cliente) */
endpointInput.value = location.pathname.replace(/[^\/]*\/?$/, 'cliente');
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

/* Arrays viram campo[] (usado por atualizacao[] e valores[]) */
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
    { acao: 'cadastrar', obs: 'Cria o cliente com status "desativo". Só e-mail, senha e CPF são obrigatórios; e-mail, usuário e CPF são únicos.', campos: [
        { n: 'nome', l: 'Nome', v: 'Cliente Novo Manual' },
        { n: 'email', l: 'E-mail', v: 'novo.manual@testecli.com' },
        { n: 'username', l: 'Usuário (até 20)', v: 'novomanual' },
        { n: 'senha', l: 'Senha', v: 'Senha@123' },
        { n: 'bio', l: 'Bio', v: 'Bio de teste' },
        { n: 'dtNas', l: 'Nascimento', v: '1995-05-20', t: 'date' },
        { n: 'CPF', l: 'CPF (11 dígitos)', v: '94000000399' },
        { n: 'telefone', l: 'Telefone (11 dígitos)', v: '11955559999' },
        { n: 'genero', l: 'Gênero (até 6)', v: 'F' } ] },
    { acao: 'ReGerarCodigo', obs: 'Gera outro código e manda por e-mail (precisa do SMTP). Confira cli_codVali no banco.', campos: [
        { n: 'email', l: 'E-mail', v: 'cinco@testecli.com' } ] },
    { acao: 'ativar', obs: 'Cliente Quatro (304) começa desativado com o código 123456.', campos: [
        { n: 'email', l: 'E-mail', v: 'quatro@testecli.com' },
        { n: 'cod', l: 'Código', v: '123456' } ] },
    { acao: 'login', obs: 'Grava $_SESSION["usuario"]. Depois use verificarLogin ou MostrarConsulta.', campos: [
        { n: 'email', l: 'E-mail', v: 'um@testecli.com' },
        { n: 'senha', l: 'Senha', v: 'Senha@123', t: 'password' } ] },
    { acao: 'MostrarConsulta', obs: 'Consultas com status "aceita" do cliente da sessão. O Um deve ter 2 e o Dois 1.', campos: [] },
    { acao: 'contato', obs: 'dados1 = profissionais e dados2 = clínicas que têm agenda com o cliente da sessão.', campos: [] },
    { acao: 'verificarLogin', obs: 'Devolve logado true só se a sessão for de cliente.', campos: [] },
    { acao: 'atualizar', obs: 'Separe vários itens com |. Chaves do controller: nome, email, biografia, foto, CEP, telefone.', campos: [
        { n: 'atualizacao', l: 'Campos', v: 'nome|biografia|telefone', lista: true },
        { n: 'valores', l: 'Valores', v: 'Cliente Atualizado|Bio atualizada pelo teste|11999990301', lista: true } ] }
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
            a.campos.forEach((c, j) => {
                const v = el('f_' + idx + '_' + j).value;
                dados[c.n] = c.lista ? v.split('|').map(s => s.trim()) : v;
            });
            enviar(dados).then(mostrar);
        });
    });
}

/* ---------- bateria de testes ---------- */
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Cliente Um', '2': 'Cliente Dois', '3': 'Cliente Três', '4': 'Profissional', '5': 'Clínica' };

function criarTestes() {
    const ts = String(Date.now()); // 13 dígitos: deixa e-mail, usuário e CPF únicos a cada rodada
    const novo = {
        nome: 'Cliente Novo ' + ts.slice(-4),
        email: 'novo.' + ts + '@testecli.com',
        username: 'c' + ts.slice(-8),
        senha: 'Senha@123',
        bio: 'Cadastro automático do teste',
        dtNas: '1995-05-20',
        CPF: '9' + ts.slice(-10),
        telefone: '119' + ts.slice(-8),
        genero: 'F'
    };
    const S = { nenhuma: '0', um: '1', dois: '2', tres: '3', profissional: '4', clinica: '5' };
    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? '');
    const logado = v => j => j?.logado === v;
    const tam = (j, k) => Array.isArray(j?.[k]) ? j[k].length : -1;
    const vazioOuNegado = (j, k) => !(sucesso(j) && tam(j, k) > 0);
    /* os ids de j[k][].campo são exatamente os de "esperados" (ordem não importa, sem repetir) */
    const ids = (j, k, campo, esperados) => {
        if (tam(j, k) !== esperados.length) return false;
        const achados = j[k].map(r => String(r[campo])).sort();
        return JSON.stringify(achados) === JSON.stringify(esperados.map(String).sort());
    };

    return [
        /* --- cadastro, código e ativação --- */
        { grupo: 'Cadastro, código e ativação', n: 'cadastrar cliente novo (todos os campos)', sessao: S.nenhuma,
          req: { acao: 'cadastrar', ...novo }, esp: 'sucesso: true', ok: sucesso },
        { n: 'cadastrar só com os obrigatórios (e-mail, senha, CPF)',
          req: { acao: 'cadastrar', email: 'novo.' + ts + 'min@testecli.com', senha: 'Senha@123', CPF: '7' + ts.slice(-10) },
          esp: 'sucesso: true (o controller usa "" nos demais campos; nascimento "" pode falhar no MySQL estrito)', ok: sucesso },
        { n: 'cadastrar com e-mail repetido', req: { acao: 'cadastrar', ...novo, username: 'x' + ts.slice(-8), CPF: '8' + ts.slice(-10) },
          esp: 'sucesso: false (e-mail é único)', ok: falha },
        { n: 'cadastrar com CPF repetido', req: { acao: 'cadastrar', ...novo, email: 'novo.' + ts + 'b@testecli.com', username: 'y' + ts.slice(-8) },
          esp: 'sucesso: false (CPF é único)', ok: falha },
        { n: 'login do cliente recém-cadastrado (ainda desativado)', req: { acao: 'login', email: novo.email, senha: novo.senha },
          esp: 'sucesso: false, "Conta não ativada"', ok: j => falha(j) && /ativada/i.test(msg(j)) },
        { n: 'ReGerarCodigo (Cinco)', req: { acao: 'ReGerarCodigo', email: 'cinco@testecli.com' },
          esp: 'sucesso: true (precisa do SMTP configurado)', ok: sucesso },
        { n: 'ativar com código errado (Quatro)', req: { acao: 'ativar', email: 'quatro@testecli.com', cod: '000000' },
          esp: 'sucesso: false, "e-mail ou codigo invalido"', ok: falha },
        { n: 'ativar com código certo (Quatro)', req: { acao: 'ativar', email: 'quatro@testecli.com', cod: '123456' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'login do Quatro já ativo', req: { acao: 'login', email: 'quatro@testecli.com', senha: 'Senha@123' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'login com senha errada', req: { acao: 'login', email: 'um@testecli.com', senha: 'errada' },
          esp: 'sucesso: false, "Senha inválida"', ok: j => falha(j) && /senha/i.test(msg(j)) },
        { n: 'login com e-mail inexistente', req: { acao: 'login', email: 'ninguem@testecli.com', senha: 'Senha@123' },
          esp: 'sucesso: false, "E-mail não encontrado"', ok: j => falha(j) && /e-mail/i.test(msg(j)) },
        { n: 'login do Um', req: { acao: 'login', email: 'um@testecli.com', senha: 'Senha@123' },
          esp: 'sucesso: true', ok: sucesso },

        /* --- verificarLogin --- */
        { grupo: 'verificarLogin', n: 'logo depois do login real do Um (sem montar sessão)', req: { acao: 'verificarLogin' },
          esp: 'logado: true (usa a sessão criada pelo login acima)', ok: logado(true) },
        { n: 'sessão de cliente', sessao: S.um, req: { acao: 'verificarLogin' }, esp: 'logado: true', ok: logado(true) },
        { n: 'sessão de profissional', sessao: S.profissional, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },
        { n: 'sessão de clínica', sessao: S.clinica, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'verificarLogin' }, esp: 'logado: false', ok: logado(false) },

        /* --- MostrarConsulta --- */
        { grupo: 'MostrarConsulta', n: 'Um: 2 consultas aceitas em clínica (a "esperando" fica de fora)', sessao: S.um, req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados com 2 consultas', ok: j => sucesso(j) && tam(j, 'dados') === 2 },
        { n: 'Dois: 1 consulta com profissional autônomo (agnd_clin nulo)', sessao: S.dois, req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados com 1 consulta (consulta sem clínica também precisa aparecer)', ok: j => sucesso(j) && tam(j, 'dados') === 1 },
        { n: 'Três: sem consultas', sessao: S.tres, req: { acao: 'MostrarConsulta' },
          esp: 'sucesso, dados vazio', ok: j => sucesso(j) && tam(j, 'dados') === 0 },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'MostrarConsulta' }, aceitaAviso: true,
          esp: 'não devolve consulta nenhuma', ok: j => vazioOuNegado(j, 'dados') },

        /* --- contato --- */
        { grupo: 'contato', n: 'Um: profissionais 311 e 312 + clínica 321', sessao: S.um, req: { acao: 'contato' },
          esp: 'sucesso, dados1 = profissionais 311 e 312 (sem repetir), dados2 = clínica 321',
          ok: j => sucesso(j) && ids(j, 'dados1', 'pro_id', [311, 312]) && ids(j, 'dados2', 'clin_id', [321]) },
        { n: 'Dois: só o profissional 312, nenhuma clínica', sessao: S.dois, req: { acao: 'contato' },
          esp: 'sucesso, dados1 = profissional 312, dados2 vazio',
          ok: j => sucesso(j) && ids(j, 'dados1', 'pro_id', [312]) && tam(j, 'dados2') === 0 },
        { n: 'Três: sem contatos', sessao: S.tres, req: { acao: 'contato' },
          esp: 'sucesso, dados1 e dados2 vazios', ok: j => sucesso(j) && tam(j, 'dados1') === 0 && tam(j, 'dados2') === 0 },
        { n: 'sem sessão', sessao: S.nenhuma, req: { acao: 'contato' }, aceitaAviso: true,
          esp: 'não devolve contato nenhum', ok: j => vazioOuNegado(j, 'dados1') && vazioOuNegado(j, 'dados2') },

        /* --- atualizar --- */
        { grupo: 'atualizar', n: 'atualizar nome, biografia e telefone do Um', sessao: S.um,
          req: { acao: 'atualizar', atualizacao: ['nome', 'biografia', 'telefone'], valores: ['Cliente Atualizado', 'Bio atualizada pelo teste', '11999990301'] },
          esp: 'sucesso: true e a linha do cliente 301 muda no banco (confira pelo SQL abaixo)', ok: sucesso },
        { n: 'atualizar campo fora da lista (senha)', req: { acao: 'atualizar', atualizacao: ['senha'], valores: ['hackeada'] },
          esp: 'sucesso: false (só os campos do dicionário podem mudar)', ok: falha },
        { n: 'atualizar CEP (a tabela cliente não tem CEP)', req: { acao: 'atualizar', atualizacao: ['CEP'], valores: ['01310100'] },
          esp: 'sucesso: false (o dicionário mapeia para cli_CEP, coluna que não existe)', ok: falha },
        { n: 'atualizar sem sessão', sessao: S.nenhuma, aceitaAviso: true,
          req: { acao: 'atualizar', atualizacao: ['nome'], valores: ['Sem Sessão'] },
          esp: 'sucesso: false (não pode atualizar sem login)', ok: falha },

        /* --- ação inexistente --- */
        { grupo: 'Ação inválida', n: 'ação inexistente', sessao: S.um, req: { acao: 'nao_existe' },
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