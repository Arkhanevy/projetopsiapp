<?php
/*
 * PÁGINA DE TESTE - associação clínica <-> profissional
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * Vai em app/views/testeAssociacao.php (a rota "teste" do routes.json já aponta pra cá).
 *
 * Cobre o fluxo completo pelos controllers de verdade:
 *   clinica:      vincular (convite), desvincular, permissao
 *   profissional: notificação, lernot, aceitar_vinculo, recusar_vinculo
 *   busca:        gerenciarPro, permisaopro
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas
 * para as rotas "clinica", "profissional" e "busca" do Router. As rotas são calculadas no JS
 * trocando o último trecho da URL e podem ser corrigidas nos campos da página.
 *
 * Antes de cada rodada rode o inserts_associacao.sql (ele limpa e recria os dados de teste).
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria na sessão (mesma estrutura de usuario::Login) */
$cenarios = [
    '0' => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1' => [
        'nome'    => 'Clínica Alfa (id 301) - nenhum profissional vinculado',
        'usuario' => ['idUsuario' => 301, 'nome' => 'Clínica Alfa Assoc', 'email' => 'alfa@testeassoc.com', 'tipoUsuario' => 'clinica'],
    ],
    '2' => [
        'nome'    => 'Clínica Beta (id 302) - já tem o Bruno vinculado',
        'usuario' => ['idUsuario' => 302, 'nome' => 'Clínica Beta Assoc', 'email' => 'beta@testeassoc.com', 'tipoUsuario' => 'clinica'],
    ],
    '3' => [
        'nome'    => 'Profissional Ana (id 301) - sem vínculos',
        'usuario' => ['idUsuario' => 301, 'nome' => 'Ana Assoc', 'email' => 'ana@testeassoc.com', 'tipoUsuario' => 'profissional'],
    ],
    '4' => [
        'nome'    => 'Profissional Bruno (id 302) - vinculado à Beta',
        'usuario' => ['idUsuario' => 302, 'nome' => 'Bruno Assoc', 'email' => 'bruno@testeassoc.com', 'tipoUsuario' => 'profissional'],
    ],
    '5' => [
        'nome'    => 'Cliente (id 301) - não é clínica nem profissional',
        'usuario' => ['idUsuario' => 301, 'nome' => 'Cliente Assoc', 'email' => 'cli@testeassoc.com', 'tipoUsuario' => 'cliente'],
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
<title>Teste associação</title>
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
    .ep { width: min(300px, 90vw); }
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
<h1>Teste da associação clínica ↔ profissional</h1>

<p class="aviso">
    Rode o <code>inserts_associacao.sql</code> antes de cada rodada (os testes criam e apagam vínculos e convites).
    Os usuários de teste não fazem login: a página monta a sessão direto. Ids: clínicas 301/302, profissionais 301 (Ana), 302 (Bruno), 303 (Carla, desativada).
</p>

<fieldset class="linha">
    <legend>0. Endpoints</legend>
    <label>clinica <input class="ep" id="ep_clinica" type="text"></label>
    <label>profissional <input class="ep" id="ep_profissional" type="text"></label>
    <label>busca <input class="ep" id="ep_busca" type="text"></label>
    <br><small>Se a rota do seu Router for outra, corrija aqui (ex: /projetopsi/clinica).</small>
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
    <small>Cada teste monta a sessão que precisa e os testes dependem uns dos outros (o convite criado num é aceito no seguinte). O "esperado" descreve o comportamento correto: linha vermelha = o código ou o dado de teste não bate com isso.</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<p class="obs">Use a sessão escolhida no passo 1. Pegue os ids (notif_id, pc_id, perm_id) nas respostas de "notificação", "gerenciarPro" e "permisaopro".</p>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo</summary>
<pre>select pc_id, pc_pro, pc_clin from profissional_clinica where pc_clin in (301, 302);
-- esperado: Alfa (301) com a Ana (301); Beta (302) só com o Bruno (302)
select notif_id, notif_clin, notif_dest, notif_tipo, notif_stat from notificacao where notif_dest in (301, 302, 303);
-- esperado: nenhum convite pendente (todos foram aceitos ou recusados)
select perm_tipo, perm_bin, perm_pc from permissoes where perm_pc in (select pc_id from profissional_clinica where pc_clin in (301, 302)) order by perm_pc, perm_tipo;
-- esperado: Alfa/Ana = 0,0,0,0 · Beta/Bruno = 1,0,1,0</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');
const ROTAS = ['clinica', 'profissional', 'busca'];

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/clinica) */
ROTAS.forEach(r => { el('ep_' + r).value = location.pathname.replace(/[^\/]*\/?$/, r); });
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

/* rota: 'clinica' | 'profissional' | 'busca' (as ações setup_teste/ver_sessao vão para esta página) */
async function enviar(dados, rota) {
    const fd = new FormData();
    for (const k in dados) fd.append(k, dados[k]);
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const url = propria ? ENDPOINT_PAGINA : el('ep_' + rota).value.trim();
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
    { rota: 'clinica', acao: 'vincular', obs: 'Sessão de CLÍNICA. Só envia o convite (notificação); o vínculo nasce quando o profissional aceita.', campos: [
        { n: 'pro_id', l: 'Id do profissional', v: '301' } ] },
    { rota: 'clinica', acao: 'desvincular', obs: 'Sessão de CLÍNICA. Remove o vínculo e as permissões dele. O id da clínica vem da sessão.', campos: [
        { n: 'pro_id', l: 'Id do profissional', v: '301' } ] },
    { rota: 'clinica', acao: 'permissao', obs: 'Sessão de CLÍNICA. Liga/desliga uma permissão (perm_id vem do permisaopro).', campos: [
        { n: 'perm_id', l: 'perm_id', v: '' },
        { n: 'status', l: 'status (0 ou 1)', v: '0' } ] },
    { rota: 'profissional', acao: 'notificação', obs: 'Lista as notificações cujo notif_dest é o id da sessão. Convite = notif_tipo 6.', campos: [] },
    { rota: 'profissional', acao: 'lernot', obs: 'Marca a notificação como lida (notif_stat = 1). O convite continua valendo.', campos: [
        { n: 'not_id', l: 'notif_id', v: '' } ] },
    { rota: 'profissional', acao: 'aceitar_vinculo', obs: 'Sessão de PROFISSIONAL. Cria o vínculo + permissões e consome o convite.', campos: [
        { n: 'notif_id', l: 'notif_id do convite', v: '' } ] },
    { rota: 'profissional', acao: 'recusar_vinculo', obs: 'Sessão de PROFISSIONAL. Apaga o convite sem criar vínculo.', campos: [
        { n: 'notif_id', l: 'notif_id do convite', v: '' } ] },
    { rota: 'busca', acao: 'gerenciarPro', obs: 'Sessão de CLÍNICA. Profissionais vinculados (devolve pc_id de cada um).', campos: [
        { n: 'tipo', l: 'tipo', v: 'profissional' } ] },
    { rota: 'busca', acao: 'permisaopro', obs: 'Permissões de um vínculo (pc_id vem do gerenciarPro).', campos: [
        { n: 'tipo', l: 'tipo', v: 'profissional' },
        { n: 'pc_id', l: 'pc_id', v: '' } ] },
    { rota: 'clinica', acao: 'notificação', obs: 'Notificações da clínica da sessão (mesma lógica: filtra só por notif_dest).', campos: [] }
];

function montarCartoes() {
    const alvo = el('cartoes');
    ACOES.forEach((a, idx) => {
        const fs = document.createElement('fieldset');
        let html = '<legend>' + esc(a.rota + ' · ' + a.acao) + '</legend><p class="obs">' + esc(a.obs) + '</p>';
        a.campos.forEach((c, j) => {
            html += '<label>' + esc(c.l) + '<input id="f_' + idx + '_' + j + '" type="' + (c.t || 'text') + '" value="' + esc(c.v || '') + '"></label>';
        });
        html += '<button type="button">Enviar</button>';
        fs.innerHTML = html;
        alvo.appendChild(fs);
        fs.querySelector('button').addEventListener('click', () => {
            const dados = { acao: a.acao };
            a.campos.forEach((c, j) => { dados[c.n] = el('f_' + idx + '_' + j).value; });
            enviar(dados, a.rota).then(mostrar);
        });
    });
}

/* ---------- bateria de testes ---------- */
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Clínica Alfa', '2': 'Clínica Beta', '3': 'Ana (prof.)', '4': 'Bruno (prof.)', '5': 'Cliente' };

function criarTestes() {
    const S = { nenhuma: '0', alfa: '1', beta: '2', ana: '3', bruno: '4', cliente: '5' };
    const ANA = 301, BRUNO = 302, CARLA = 303, ALFA = 301, BETA = 302;

    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? '');
    const tam = (j, k) => Array.isArray(j?.[k]) ? j[k].length : -1;

    const convitesDe = j => (Array.isArray(j?.dados) ? j.dados : []).filter(n => String(n.notif_tipo) === '6');
    const convite = (j, clin) => convitesDe(j).find(n => String(n.notif_clin) === String(clin));
    const pcDe = (j, pro) => (Array.isArray(j?.dados) ? j.dados : []).find(p => String(p.pro_id) === String(pro))?.pc_id;
    const bins = j => (Array.isArray(j?.dados) ? j.dados : []).slice().sort((a, b) => a.perm_tipo - b.perm_tipo).map(p => Number(p.perm_bin));
    const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    const vincular = (pro) => ({ rota: 'clinica', req: { acao: 'vincular', pro_id: pro } });
    const desvincular = (pro) => ({ rota: 'clinica', req: { acao: 'desvincular', pro_id: pro } });
    const listarNotif = { rota: 'profissional', req: { acao: 'notificação' } };
    const gerenciar = { rota: 'busca', req: { acao: 'gerenciarPro', tipo: 'profissional' } };
    const aceitar = (campo) => ({ rota: 'profissional', req: c => ({ acao: 'aceitar_vinculo', notif_id: c[campo] }) });
    const recusar = (campo) => ({ rota: 'profissional', req: c => ({ acao: 'recusar_vinculo', notif_id: c[campo] }) });
    const permsDe = (campo) => ({ rota: 'busca', req: c => ({ acao: 'permisaopro', tipo: 'profissional', pc_id: c[campo] }) });

    return [
        /* --- 1. convite --- */
        { grupo: '1. Convite (clínica)', n: 'sem sessão tenta convidar', sessao: S.nenhuma, ...vincular(ANA),
          esp: 'sucesso: false (só clínica convida)', ok: falha },
        { n: 'profissional tenta convidar', sessao: S.ana, ...vincular(BRUNO),
          esp: 'sucesso: false (só clínica convida)', ok: falha },
        { n: 'Alfa convida a Ana', sessao: S.alfa, ...vincular(ANA),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'Alfa convida a Ana de novo', ...vincular(ANA),
          esp: 'sucesso: false, "convite pendente"', ok: j => falha(j) && /pendente/i.test(msg(j)) },
        { n: 'convidar profissional inexistente', ...vincular(999999),
          esp: 'sucesso: false, "não encontrado"', ok: j => falha(j) && /encontrado/i.test(msg(j)) },
        { n: 'convidar profissional com conta não ativada (Carla)', ...vincular(CARLA),
          esp: 'sucesso: false, "não ativou a conta"', ok: j => falha(j) && /ativ/i.test(msg(j)) },
        { n: 'convidar sem informar o profissional', rota: 'clinica', req: { acao: 'vincular' },
          esp: 'sucesso: false', ok: falha },
        { n: 'Beta convida a Ana', sessao: S.beta, ...vincular(ANA),
          esp: 'sucesso: true (a Ana passa a ter 2 convites pendentes)', ok: sucesso },

        /* --- 2. notificações --- */
        { grupo: '2. Notificações do profissional', n: 'Ana lista as notificações', sessao: S.ana, ...listarNotif,
          esp: 'sucesso, 2 convites (Alfa e Beta); guarda os notif_id',
          guardar: (j, c) => { c.nAlfa = convite(j, ALFA)?.notif_id; c.nBeta = convite(j, BETA)?.notif_id; },
          ok: j => sucesso(j) && convitesDe(j).length === 2 && !!convite(j, ALFA) && !!convite(j, BETA) },
        { n: 'Bruno não vê os convites da Ana', sessao: S.bruno, ...listarNotif,
          esp: 'sucesso, nenhum convite', ok: j => sucesso(j) && convitesDe(j).length === 0 },
        { n: 'Clínica Alfa (id 301) não vê convite da Ana (id 301)', sessao: S.alfa, rota: 'clinica', req: { acao: 'notificação' },
          esp: 'nenhum convite. Se falhar: notificacao::listar filtra só por notif_dest, sem o tipo de usuário, e ids iguais colidem',
          ok: j => !(sucesso(j) && convitesDe(j).length > 0) },

        /* --- 3. segurança do aceite --- */
        { grupo: '3. Aceite indevido (nada pode virar vínculo)', n: 'Bruno tenta aceitar o convite da Ana', sessao: S.bruno, ...aceitar('nAlfa'),
          esp: 'sucesso: false, "não é para você"', ok: falha },
        { n: 'cliente tenta aceitar', sessao: S.cliente, ...aceitar('nAlfa'),
          esp: 'sucesso: false (só profissional)', ok: falha },
        { n: 'sem sessão tenta aceitar', sessao: S.nenhuma, ...aceitar('nAlfa'),
          esp: 'sucesso: false', ok: falha },
        { n: 'Ana aceita notificação inexistente', sessao: S.ana, rota: 'profissional', req: { acao: 'aceitar_vinculo', notif_id: 999999999 },
          esp: 'sucesso: false', ok: falha },
        { n: 'Ana aceita sem informar o notif_id', rota: 'profissional', req: { acao: 'aceitar_vinculo' },
          esp: 'sucesso: false', ok: falha },
        { n: 'Alfa continua sem profissionais', sessao: S.alfa, ...gerenciar,
          esp: 'sucesso, dados vazio', ok: j => sucesso(j) && tam(j, 'dados') === 0 },

        /* --- 4. aceite --- */
        { grupo: '4. Aceite e permissões', n: 'Ana aceita o convite da Alfa', sessao: S.ana, ...aceitar('nAlfa'),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'Alfa agora tem a Ana', sessao: S.alfa, ...gerenciar,
          esp: 'sucesso, 1 profissional (Ana); guarda o pc_id',
          guardar: (j, c) => { c.pcAlfa = pcDe(j, ANA); },
          ok: j => sucesso(j) && tam(j, 'dados') === 1 && !!pcDe(j, ANA) },
        { n: '1º profissional da Alfa: permissões padrão (tudo negado)', ...permsDe('pcAlfa'),
          esp: 'sucesso, 4 permissões, todas 0', ok: j => sucesso(j) && igual(bins(j), [0, 0, 0, 0]) },
        { n: 'aceitar o mesmo convite de novo', sessao: S.ana, ...aceitar('nAlfa'),
          esp: 'sucesso: false (convite já consumido)', ok: falha },
        { n: 'Alfa convida quem já é vinculado', sessao: S.alfa, ...vincular(ANA),
          esp: 'sucesso: false, "já está vinculado"', ok: j => falha(j) && /vinculad/i.test(msg(j)) },
        { n: 'Ana aceita o convite da Beta', sessao: S.ana, ...aceitar('nBeta'),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'Beta agora tem Bruno e Ana', sessao: S.beta, ...gerenciar,
          esp: 'sucesso, 2 profissionais; guarda os pc_id',
          guardar: (j, c) => { c.pcBeta = pcDe(j, ANA); c.pcBruno = pcDe(j, BRUNO); },
          ok: j => sucesso(j) && tam(j, 'dados') === 2 && !!pcDe(j, ANA) && !!pcDe(j, BRUNO) },
        { n: 'Ana herdou as permissões do Bruno (1,0,1,0)', ...permsDe('pcBeta'),
          esp: 'sucesso, permissões por tipo = 1,0,1,0 (não as da clínica de id 1)',
          guardar: (j, c) => { c.permId1 = (Array.isArray(j?.dados) ? j.dados : []).find(p => Number(p.perm_tipo) === 1)?.perm_id; },
          ok: j => sucesso(j) && igual(bins(j), [1, 0, 1, 0]) },
        { n: 'Beta desliga a permissão 1 da Ana', rota: 'clinica', req: c => ({ acao: 'permissao', perm_id: c.permId1, status: 0 }),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'permissões da Ana agora: 0,0,1,0', ...permsDe('pcBeta'),
          esp: 'sucesso, 0,0,1,0', ok: j => sucesso(j) && igual(bins(j), [0, 0, 1, 0]) },

        /* --- 5. desvincular --- */
        { grupo: '5. Desvincular', n: 'profissional tenta desvincular', sessao: S.ana, ...desvincular(ANA),
          esp: 'sucesso: false (só clínica)', ok: falha },
        { n: 'sem sessão tenta desvincular', sessao: S.nenhuma, ...desvincular(ANA),
          esp: 'sucesso: false', ok: falha },
        { n: 'Alfa não desvincula o Bruno (que é da Beta)', sessao: S.alfa, ...desvincular(BRUNO),
          esp: 'sucesso: false, "vínculo não encontrado"', ok: falha },
        { n: 'Beta ainda tem Bruno e Ana', sessao: S.beta, ...gerenciar,
          esp: 'sucesso, 2 profissionais', ok: j => sucesso(j) && tam(j, 'dados') === 2 },
        { n: 'Beta desvincula a Ana', ...desvincular(ANA),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'Beta só tem o Bruno', ...gerenciar,
          esp: 'sucesso, 1 profissional (Bruno)', ok: j => sucesso(j) && tam(j, 'dados') === 1 && !!pcDe(j, BRUNO) && !pcDe(j, ANA) },
        { n: 'desvincular a Ana de novo', ...desvincular(ANA),
          esp: 'sucesso: false', ok: falha },
        { n: 'permissões do vínculo removido sumiram', ...permsDe('pcBeta'),
          esp: 'sucesso, nenhuma permissão', ok: j => sucesso(j) && tam(j, 'dados') === 0 },
        { n: 'Bruno continua com as permissões dele', ...permsDe('pcBruno'),
          esp: 'sucesso, 1,0,1,0', ok: j => sucesso(j) && igual(bins(j), [1, 0, 1, 0]) },

        /* --- 6. recusa e "lido" --- */
        { grupo: '6. Recusa e convite lido', n: 'Beta convida a Ana de novo', sessao: S.beta, ...vincular(ANA),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'Ana vê o novo convite', sessao: S.ana, ...listarNotif,
          esp: 'sucesso, convite da Beta; guarda o notif_id',
          guardar: (j, c) => { c.nBeta2 = convite(j, BETA)?.notif_id; },
          ok: j => sucesso(j) && !!convite(j, BETA) },
        { n: 'Ana marca o convite como lido (lernot)', rota: 'profissional', req: c => ({ acao: 'lernot', not_id: c.nBeta2 }),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'convite lido continua na lista, com notif_stat 1', ...listarNotif,
          esp: 'convite da Beta com notif_stat = 1', ok: j => sucesso(j) && Number(convite(j, BETA)?.notif_stat) === 1 },
        { n: 'Bruno tenta recusar o convite da Ana', sessao: S.bruno, ...recusar('nBeta2'),
          esp: 'sucesso: false', ok: falha },
        { n: 'Ana recusa o convite (mesmo já lido)', sessao: S.ana, ...recusar('nBeta2'),
          esp: 'sucesso: true', ok: sucesso },
        { n: 'o convite sumiu da lista', ...listarNotif,
          esp: 'sucesso, sem convite da Beta', ok: j => sucesso(j) && !convite(j, BETA) },
        { n: 'Beta não ganhou a Ana', sessao: S.beta, ...gerenciar,
          esp: 'sucesso, só o Bruno', ok: j => sucesso(j) && tam(j, 'dados') === 1 && !pcDe(j, ANA) },
        { n: 'Ana tenta aceitar o convite recusado', sessao: S.ana, ...aceitar('nBeta2'),
          esp: 'sucesso: false', ok: falha },
        { n: 'recusar o mesmo convite de novo', ...recusar('nBeta2'),
          esp: 'sucesso: false', ok: falha }
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
    const ctx = {};            // ids guardados entre os testes (notif_id, pc_id, perm_id)
    const brutos = [];
    let html = '<table><tr><th>#</th><th>Teste</th><th>Sessão</th><th>Esperado</th><th>Obtido</th><th></th></tr>';
    let passou = 0;
    let sessaoAtual = '(sessão anterior)';

    for (let i = 0; i < testes.length; i++) {
        const t = testes[i];
        veredito.textContent = 'Rodando ' + (i + 1) + ' de ' + testes.length + '…';
        if (t.sessao !== undefined) {
            await montarSessao(t.sessao);
            sessaoAtual = ROTULO_SESSAO[t.sessao];
        }
        const req = typeof t.req === 'function' ? t.req(ctx) : t.req;
        // se um id que devia ter sido guardado por um teste anterior não existe, não envia
        // (senão o teste "passa" sem ter testado nada: ex. lernot/permissao com id "undefined")
        const faltaId = Object.values(req).some(v => v === undefined || v === null || v === 'undefined');
        const res = faltaId
            ? { status: 0, texto: 'PULADO: depende de um id que um teste anterior não conseguiu guardar', json: null }
            : await enviar(req, t.rota);
        let ok = false;
        try {
            if (t.guardar) t.guardar(res.json, ctx);
            ok = !!t.ok(res.json, res, ctx) && (t.aceitaAviso || !(res.json && res.json.__sujo));
        } catch (e) { ok = false; }
        if (ok) passou++;
        brutos.push({ teste: t.n, rota: t.rota, enviado: req, status: res.status, resposta: res.json ?? res.texto });

        if (t.grupo) html += '<tr class="grupo"><td colspan="6">' + esc(t.grupo) + '</td></tr>';
        html += '<tr><td>' + (i + 1) + '</td><td>' + esc(t.n) + '</td><td>' + esc(sessaoAtual) + '</td><td>' + esc(t.esp) +
            '</td><td class="obt">' + esc(resumo(res)) + '</td><td class="' + (ok ? 'ok' : 'erro') + '">' + (ok ? 'OK' : 'FALHOU') + '</td></tr>';
    }

    html += '</table>';
    veredito.innerHTML = '<p><b>' + passou + ' de ' + testes.length + ' testes passaram.</b></p>' + html;
    saida.textContent = JSON.stringify({ idsGuardados: ctx, requisicoes: brutos }, null, 2);
    btn.disabled = false;
}
el('btnTudo').addEventListener('click', rodarTudo);

montarCartoes();
</script>
</body>
</html>
