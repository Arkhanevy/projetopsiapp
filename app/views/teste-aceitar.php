<?php
/*
 * PÁGINA DE TESTE - profissionalcontroller: aceitar e rejeitar
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * O que é testado (comportamento correto):
 *   aceitar:  o profissional dono da consulta "esperando" (agnd_id + agnd_pro) a deixa "aceita"
 *             e o cliente da consulta recebe a notificação tipo 3 (padrão da clínica ou do profissional)
 *   rejeitar: o profissional dono da consulta "esperando" a apaga e o cliente recebe a notificação tipo 4
 *   nos dois: só o dono da consulta faz isso (cliente, outro profissional e deslogado são recusados),
 *             não dá para repetir, e erro volta como JSON com sucesso: false (nunca erro fatal)
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas para as rotas
 * "profissional" (aceitar, rejeitar, notificação) e "cliente" (notificação, para conferir o aviso).
 * As rotas são calculadas no JS trocando o último trecho da URL e podem ser corrigidas nos campos de endpoint.
 *
 * Antes de cada rodada rode o inserts_aceitar_rejeitar.sql (ele limpa e recria os dados de teste).
 * Senha de todos os usuários de teste: Senha@123
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria em $_SESSION['usuario'] (mesma estrutura de usuario::Login) */
$cenarios = [
    '0' => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1' => ['nome' => 'Cliente Um (id 701)',   'usuario' => ['idUsuario' => 701, 'nome' => 'TAR Cliente Um',   'email' => 'um@testear.com',   'tipoUsuario' => 'cliente']],
    '2' => ['nome' => 'Cliente Dois (id 702)', 'usuario' => ['idUsuario' => 702, 'nome' => 'TAR Cliente Dois', 'email' => 'dois@testear.com', 'tipoUsuario' => 'cliente']],
    '3' => ['nome' => 'Cliente Três (id 703)', 'usuario' => ['idUsuario' => 703, 'nome' => 'TAR Cliente Três', 'email' => 'tres@testear.com', 'tipoUsuario' => 'cliente']],
    '4' => ['nome' => 'Profissional Ana (id 711) - clínica Alfa 721',          'usuario' => ['idUsuario' => 711, 'nome' => 'TAR Ana Podóloga',   'email' => 'ana@testear.com',   'tipoUsuario' => 'profissional']],
    '5' => ['nome' => 'Profissional Bruno (id 712) - autônomo, padrões próprios', 'usuario' => ['idUsuario' => 712, 'nome' => 'TAR Bruno Podólogo', 'email' => 'bruno@testear.com', 'tipoUsuario' => 'profissional']],
    '6' => ['nome' => 'Profissional Carla (id 713) - clínica Alfa 721',        'usuario' => ['idUsuario' => 713, 'nome' => 'TAR Carla Podóloga', 'email' => 'carla@testear.com', 'tipoUsuario' => 'profissional']],
    '7' => ['nome' => 'Profissional Diana (id 714) - clínica Beta 722 (sem padrões)', 'usuario' => ['idUsuario' => 714, 'nome' => 'TAR Diana Podóloga', 'email' => 'diana@testear.com', 'tipoUsuario' => 'profissional']],
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
<title>Teste aceitar e rejeitar (profissional)</title>
<style>
    body { font-family: system-ui, sans-serif; max-width: 1150px; margin: 24px auto; padding: 0 16px 280px; color: #222; }
    h1 { font-size: 1.3rem; }
    h2 { font-size: 1.1rem; margin-top: 24px; }
    fieldset { margin: 12px 0; border: 1px solid #ccc; border-radius: 8px; min-width: 0; }
    legend { font-weight: 600; padding: 0 6px; }
    label { display: block; margin: 6px 0; font-size: .9rem; }
    label input, label select { display: block; width: 100%; box-sizing: border-box; margin-top: 2px; }
    input, select, button { padding: 6px 8px; font-size: .95rem; }
    button { cursor: pointer; margin: 4px 4px 4px 0; }
    .linha label { display: inline-block; width: auto; margin: 4px 12px 4px 0; }
    .linha input, .linha select { display: inline-block; width: auto; max-width: 100%; }
    .endpoint { width: min(420px, 90vw); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 4px 14px; }
    .obs { font-size: .8rem; color: #555; margin: 2px 0 6px; }
    .rota { font-size: .75rem; color: #5a4fcf; font-weight: 600; }
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
<h1>Teste do aceitar e rejeitar do profissionalcontroller</h1>

<p class="aviso">
    Rode o <code>inserts_aceitar_rejeitar.sql</code> antes de cada rodada (aceitar e rejeitar mudam a agenda e criam notificações).
    Senha de todos os usuários de teste: <code>Senha@123</code>. O aceitar e o rejeitar recebem
    <code>agnd_id</code>, <code>agnd_pro</code>, <code>cli</code> e <code>clinica</code>; o "esperado" é o comportamento correto
    (linha vermelha = o código não bate). Para conferir se a consulta mudou, a página tenta repetir a ação (se já foi aceita ou apagada, tem que recusar).
</p>

<fieldset class="linha">
    <legend>0. Endpoints</legend>
    <label>profissionalcontroller <input id="epProfissional" class="endpoint" type="text"></label>
    <label>clientecontroller <input id="epCliente" class="endpoint" type="text"></label>
    <small>Se a rota do seu Router for outra, corrija aqui.</small>
</fieldset>

<fieldset class="linha">
    <legend>1. Sessão (simula o login)</legend>
    <label>Usuário
        <select id="cenario">
            <?php foreach ($cenarios as $k => $c): ?>
                <option value="<?= $k ?>"><?= htmlspecialchars($c['nome']) ?></option>
            <?php endforeach; ?>
        </select>
    </label>
    <button id="btnMontar">Montar sessão</button>
    <button id="btnVer">Ver sessão</button>
</fieldset>

<fieldset>
    <legend>2. Rodar tudo e comparar com o esperado</legend>
    <button id="btnTudo">Rodar todos os testes</button>
    <small>Cada teste monta a sessão que precisa. Resposta com warning/notice do PHP antes do JSON, erro fatal ou resposta vazia contam como falha.</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo</summary>
<pre>select agnd_id, agnd_pro, agnd_cli, agnd_stat from agenda where agnd_id between 761 and 799 order by agnd_id;
-- esperado (comportamento correto):
--   'aceita':  761, 762, 763, 764, 765
--   apagadas:  766, 767, 768, 769 (não aparecem mais)

select notif_id, notif_pd, notif_pro, notif_clin, notif_cli, notif_dest, notif_tipo, notif_msg
from notificacao where notif_id &gt; 702 order by notif_id;
-- esperado: tipo 3 para o cliente 701 (761), 702 (762), 703 (763, msg do Bruno) e 701 (765);
--           tipo 4 para o cliente 701 (766), 702 (767) e 703 (768, msg do Bruno).
--           A 762 e a 767 foram feitas mandando cli=701 de propósito: o aviso tem que ir para o cliente 702.
--           Diana (764 e 769) atende na Beta, que não tem padrão: a consulta muda, e não deve gerar erro nem warning.</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/profissional) */
const baseRota = nome => location.pathname.replace(/[^\/]*\/?$/, nome);
const EP = { profissional: 'epProfissional', cliente: 'epCliente' };
for (const k in EP) el(EP[k]).value = baseRota(k);
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

/* rota: 'profissional' (padrão) ou 'cliente' */
async function enviar(dados, rota) {
    const fd = new FormData();
    for (const k in dados) fd.append(k, dados[k]);
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const url = propria ? ENDPOINT_PAGINA : el(EP[rota || 'profissional']).value.trim();
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
    { rota: 'profissional', acao: 'aceitar', obs: 'O profissional da sessão aceita a consulta "esperando" e avisa o cliente (notificação tipo 3).', campos: [
        { n: 'agnd_id', l: 'Consulta (id)', v: '761' },
        { n: 'agnd_pro', l: 'Profissional da consulta (id)', v: '711' },
        { n: 'cli', l: 'Cliente (id)', v: '701' },
        { n: 'clinica', l: 'Clínica (id, vazio se autônomo)', v: '721' } ] },
    { rota: 'profissional', acao: 'rejeitar', obs: 'O profissional da sessão rejeita (apaga) a consulta "esperando" e avisa o cliente (notificação tipo 4).', campos: [
        { n: 'agnd_id', l: 'Consulta (id)', v: '766' },
        { n: 'agnd_pro', l: 'Profissional da consulta (id)', v: '711' },
        { n: 'cli', l: 'Cliente (id)', v: '701' },
        { n: 'clinica', l: 'Clínica (id, vazio se autônomo)', v: '721' } ] },
    { rota: 'profissional', acao: 'notificação', obs: 'Lista as notificações do profissional da sessão.', campos: [] },
    { rota: 'cliente', acao: 'notificação', obs: 'Lista as notificações do cliente da sessão.', campos: [] }
];

function montarCartoes() {
    const alvo = el('cartoes');
    ACOES.forEach((a, idx) => {
        const fs = document.createElement('fieldset');
        let html = '<legend>' + esc(a.acao) + '</legend><p class="rota">rota: ' + esc(a.rota) + '</p><p class="obs">' + esc(a.obs) + '</p>';
        a.campos.forEach((c, j) => {
            html += '<label>' + esc(c.l) + '<input id="f_' + idx + '_' + j + '" type="text" value="' + esc(c.v || '') + '"></label>';
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
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Cliente Um 701', '2': 'Cliente Dois 702', '3': 'Cliente Três 703',
    '4': 'Ana 711', '5': 'Bruno 712', '6': 'Carla 713', '7': 'Diana 714' };

function criarTestes() {
    const S = { nenhuma: '0', um: '1', dois: '2', tres: '3', ana: '4', bruno: '5', carla: '6', diana: '7' };

    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const dadosLista = j => (sucesso(j) && Array.isArray(j.dados)) ? j.dados : null;
    /* notificações NOVAS (id > 702, as do SQL são 701 e 702) do tipo pedido, e com a mensagem pedida se for o caso */
    const novas = (j, tipo, msgEsp) => (dadosLista(j) || []).filter(r => Number(r.notif_id) > 702 && String(r.notif_tipo) === String(tipo) && (msgEsp === undefined || r.notif_msg === msgEsp));
    const novaNotif = (j, tipo, msgEsp) => novas(j, tipo, msgEsp).length > 0;

    const ACE = (agnd, pro, cli, clinica) => ({ acao: 'aceitar', agnd_id: agnd, agnd_pro: pro, cli, clinica });
    const REJ = (agnd, pro, cli, clinica) => ({ acao: 'rejeitar', agnd_id: agnd, agnd_pro: pro, cli, clinica });
    const LISTAR = { acao: 'notificação' };
    const MSG3 = 'Sua consulta foi aceita.', MSG4 = 'Sua consulta foi rejeitada.';
    const B3 = 'Bruno: consulta aceita.', B4 = 'Bruno: consulta rejeitada.';

    return [
        /* ================= aceitar ================= */
        { grupo: 'aceitar', n: 'Ana aceita a consulta 761 (cliente 701, clínica Alfa)', sessao: S.ana, req: ACE('761', '711', '701', '721'),
          esp: 'sucesso: true, resposta só com o JSON (sem warning)', ok: j => sucesso(j) },
        { n: 'o cliente 701 recebe a notificação de consulta aceita (tipo 3, padrão da Alfa)', sessao: S.um, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 702) tipo 3 com a mensagem "' + MSG3 + '"', ok: j => novaNotif(j, 3, MSG3) },
        { n: 'Ana aceita de novo a 761 (já está aceita)', sessao: S.ana, req: ACE('761', '711', '701', '721'),
          esp: 'sucesso: false com mensagem (prova que a consulta mudou para "aceita")', ok: j => falha(j) },
        { n: 'Carla tenta aceitar a 762 (da Ana) mandando agnd_pro = 711', sessao: S.carla, req: ACE('762', '711', '702', '721'),
          esp: 'sucesso: false (quem aceita é o profissional da sessão, não o que veio no POST)', ok: j => falha(j) },
        { n: 'Carla tenta aceitar a 762 (da Ana) mandando o próprio agnd_pro = 713', sessao: S.carla, req: ACE('762', '713', '702', '721'),
          esp: 'sucesso: false (a consulta não é dela)', ok: j => falha(j) },
        { n: 'cliente 702 chama o aceitar da 762', sessao: S.dois, req: ACE('762', '711', '702', '721'),
          esp: 'sucesso: false (cliente não aceita consulta)', ok: j => falha(j) },
        { n: 'sem login chama o aceitar da 762', sessao: S.nenhuma, aceitaAviso: true, req: ACE('762', '711', '702', '721'),
          esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'consulta que não existe (999999)', sessao: S.ana, req: ACE('999999', '711', '702', '721'),
          esp: 'sucesso: false com mensagem (e não erro fatal)', ok: j => falha(j) },
        { n: 'sem agnd_id', sessao: S.ana, req: { acao: 'aceitar', agnd_pro: '711', cli: '702', clinica: '721' },
          esp: 'sucesso: false com mensagem, sem warning de índice indefinido', ok: j => falha(j) },
        { n: 'Ana aceita a 762 mandando cli = 701 (o cliente real é o 702)', sessao: S.ana, req: ACE('762', '711', '701', '721'),
          esp: 'sucesso: true (prova que as recusas anteriores não mexeram na 762)', ok: j => sucesso(j) },
        { n: 'o cliente 702 (o dono da consulta) recebe a notificação tipo 3', sessao: S.dois, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA tipo 3', ok: j => novaNotif(j, 3, MSG3) },
        { n: 'o cliente 701 NÃO recebe um segundo aviso pela 762 (só o da 761)', sessao: S.um, rota: 'cliente', req: LISTAR,
          esp: 'exatamente 1 notificação nova tipo 3 (a da 761); o cliente do aviso tem que vir da consulta, não do POST', ok: j => novas(j, 3).length === 1 },
        { n: 'Bruno (autônomo, clínica vazia) aceita a 763 (cliente 703)', sessao: S.bruno, req: ACE('763', '712', '703', ''),
          esp: 'sucesso: true, resposta limpa', ok: j => sucesso(j) },
        { n: 'o cliente 703 recebe o aviso com o padrão do Bruno', sessao: S.tres, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA tipo 3 com a mensagem "' + B3 + '"', ok: j => novaNotif(j, 3, B3) },
        { n: 'Diana aceita a 764 numa clínica SEM padrão de notificação (Beta)', sessao: S.diana, req: ACE('764', '714', '703', '722'),
          esp: 'sucesso: true e resposta limpa (sem padrão não pode gerar warning nem erro fatal)', ok: j => sucesso(j) },
        { n: 'Carla aceita a 765 (a dela)', sessao: S.carla, req: ACE('765', '713', '701', '721'),
          esp: 'sucesso: true, resposta limpa', ok: j => sucesso(j) },

        /* ================= rejeitar ================= */
        { grupo: 'rejeitar', n: 'Ana rejeita a consulta 766 (cliente 701, clínica Alfa)', sessao: S.ana, req: REJ('766', '711', '701', '721'),
          esp: 'sucesso: true, resposta só com o JSON (sem warning e sem erro fatal)', ok: j => sucesso(j) },
        { n: 'o cliente 701 recebe a notificação de consulta rejeitada (tipo 4, padrão da Alfa)', sessao: S.um, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA tipo 4 com a mensagem "' + MSG4 + '"', ok: j => novaNotif(j, 4, MSG4) },
        { n: 'Ana rejeita de novo a 766 (já foi apagada)', sessao: S.ana, req: REJ('766', '711', '701', '721'),
          esp: 'sucesso: false com mensagem (prova que a consulta foi apagada)', ok: j => falha(j) },
        { n: 'Ana tenta aceitar a 766 (rejeitada)', sessao: S.ana, req: ACE('766', '711', '701', '721'),
          esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'Ana tenta rejeitar a 761 (já aceita)', sessao: S.ana, req: REJ('761', '711', '701', '721'),
          esp: 'sucesso: false (só se rejeita consulta "esperando")', ok: j => falha(j) },
        { n: 'Carla tenta rejeitar a 767 (da Ana) mandando agnd_pro = 711', sessao: S.carla, req: REJ('767', '711', '702', '721'),
          esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'Carla tenta rejeitar a 767 (da Ana) mandando o próprio agnd_pro = 713', sessao: S.carla, req: REJ('767', '713', '702', '721'),
          esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'cliente 702 chama o rejeitar da 767', sessao: S.dois, req: REJ('767', '711', '702', '721'),
          esp: 'sucesso: false (cliente não rejeita consulta)', ok: j => falha(j) },
        { n: 'sem login chama o rejeitar da 767', sessao: S.nenhuma, aceitaAviso: true, req: REJ('767', '711', '702', '721'),
          esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'consulta que não existe (999999)', sessao: S.ana, req: REJ('999999', '711', '702', '721'),
          esp: 'sucesso: false com mensagem (e não erro fatal)', ok: j => falha(j) },
        { n: 'sem agnd_id', sessao: S.ana, req: { acao: 'rejeitar', agnd_pro: '711', cli: '702', clinica: '721' },
          esp: 'sucesso: false com mensagem, sem warning de índice indefinido', ok: j => falha(j) },
        { n: 'Ana rejeita a 767 mandando cli = 701 (o cliente real é o 702)', sessao: S.ana, req: REJ('767', '711', '701', '721'),
          esp: 'sucesso: true (prova que as recusas anteriores não mexeram na 767)', ok: j => sucesso(j) },
        { n: 'o cliente 702 (o dono da consulta) recebe a notificação tipo 4', sessao: S.dois, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA tipo 4', ok: j => novaNotif(j, 4, MSG4) },
        { n: 'o cliente 701 NÃO recebe um segundo aviso de rejeição pela 767 (só o da 766)', sessao: S.um, rota: 'cliente', req: LISTAR,
          esp: 'exatamente 1 notificação nova tipo 4 (a da 766)', ok: j => novas(j, 4).length === 1 },
        { n: 'Bruno (autônomo) rejeita a 768 (cliente 703)', sessao: S.bruno, req: REJ('768', '712', '703', ''),
          esp: 'sucesso: true, resposta limpa', ok: j => sucesso(j) },
        { n: 'o cliente 703 recebe o aviso de rejeição com o padrão do Bruno', sessao: S.tres, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA tipo 4 com a mensagem "' + B4 + '"', ok: j => novaNotif(j, 4, B4) },
        { n: 'Diana rejeita a 769 numa clínica SEM padrão de notificação (Beta)', sessao: S.diana, req: REJ('769', '714', '702', '722'),
          esp: 'sucesso: true e resposta limpa (sem padrão não pode gerar warning nem erro fatal)', ok: j => sucesso(j) },
        { n: 'Diana rejeita de novo a 769 (já apagada)', sessao: S.diana, req: REJ('769', '714', '702', '722'),
          esp: 'sucesso: false', ok: j => falha(j) }
    ];
}

function resumo(res) {
    if (!res.json) {
        const limpo = (res.texto || '(resposta vazia)').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return 'sem JSON: ' + limpo.slice(0, 220);
    }
    let s = JSON.stringify(res.json);
    if (s.length > 240) s = s.slice(0, 240) + '…';
    return (res.json.__sujo ? '⚠ texto fora do JSON · ' : '') + s;
}

async function rodarTudo() {
    const btn = el('btnTudo');
    btn.disabled = true;
    const testes = criarTestes();
    const brutos = [];
    let html = '<table><tr><th>#</th><th>Teste</th><th>Sessão</th><th>Esperado</th><th>Obtido</th><th></th></tr>';
    let passou = 0;
    let sessaoAtual = '(sessão do passo anterior)';

    for (let i = 0; i < testes.length; i++) {
        const t = testes[i];
        veredito.textContent = 'Rodando ' + (i + 1) + ' de ' + testes.length + '…';
        if (t.sessao !== undefined) {
            await montarSessao(t.sessao);
            sessaoAtual = ROTULO_SESSAO[t.sessao];
        }
        const res = await enviar(t.req, t.rota);
        let certo = false;
        try { certo = !!t.ok(res.json, res) && (t.aceitaAviso || !(res.json && res.json.__sujo)); } catch (e) { certo = false; }
        if (certo) passou++;
        brutos.push({ teste: t.n, rota: t.rota || 'profissional', enviado: t.req, status: res.status, resposta: res.json ?? res.texto });

        if (t.grupo) html += '<tr class="grupo"><td colspan="6">' + esc(t.grupo) + '</td></tr>';
        html += '<tr><td>' + (i + 1) + '</td><td>' + esc(t.n) + '</td><td>' + esc(sessaoAtual) + '</td><td>' + esc(t.esp) +
            '</td><td class="obt">' + esc(resumo(res)) + '</td><td class="' + (certo ? 'ok' : 'erro') + '">' + (certo ? 'OK' : 'FALHOU') + '</td></tr>';
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