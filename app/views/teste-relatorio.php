<?php
/*
 * PÁGINA DE TESTE - relatoriocontroller, notificações e Servicocontroller (cancelar / atendimento)
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * O que é testado:
 *   relatoriocontroller:  quantidade, ganho (diario, semanal, mensal, anual), historico e os erros
 *   notificações:         listar ('notificação') no profissionalcontroller, clientecontroller e
 *                         clinicacontroller; envio feito por agendar, reagendar, cancelar,
 *                         aceitar e rejeitar (o destinatário confere na própria lista)
 *   Servicocontroller:    cancelar (agora grava atendimento "desmarcado") e atendimento (novo)
 *   profissionalcontroller: aceitar e rejeitar
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas para as
 * rotas "servico", "relatorio", "profissional", "cliente" e "clinica" do Router. As rotas são
 * calculadas no JS trocando o último trecho da URL e podem ser corrigidas nos campos de endpoint.
 *
 * Antes de cada rodada rode o inserts_relatorio_notif.sql (ele limpa e recria os dados de teste).
 * Senha de todos os usuários de teste: Senha@123
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria em $_SESSION['usuario'] (mesma estrutura de usuario::Login) */
$cenarios = [
    '0'  => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1'  => ['nome' => 'Cliente Um (id 501)',   'usuario' => ['idUsuario' => 501, 'nome' => 'TRN Cliente Um',   'email' => 'um@testerel.com',   'tipoUsuario' => 'cliente']],
    '2'  => ['nome' => 'Cliente Dois (id 502)', 'usuario' => ['idUsuario' => 502, 'nome' => 'TRN Cliente Dois', 'email' => 'dois@testerel.com', 'tipoUsuario' => 'cliente']],
    '3'  => ['nome' => 'Cliente Três (id 503)', 'usuario' => ['idUsuario' => 503, 'nome' => 'TRN Cliente Três', 'email' => 'tres@testerel.com', 'tipoUsuario' => 'cliente']],
    '4'  => ['nome' => 'Profissional Ana (id 511) - clínica 521, todas as permissões', 'usuario' => ['idUsuario' => 511, 'nome' => 'TRN Ana Podóloga',   'email' => 'ana@testerel.com',   'tipoUsuario' => 'profissional']],
    '5'  => ['nome' => 'Profissional Bruno (id 512) - autônomo',                       'usuario' => ['idUsuario' => 512, 'nome' => 'TRN Bruno Podólogo', 'email' => 'bruno@testerel.com', 'tipoUsuario' => 'profissional']],
    '6'  => ['nome' => 'Profissional Carla (id 513) - clínica 521, SEM permissões',     'usuario' => ['idUsuario' => 513, 'nome' => 'TRN Carla Podóloga', 'email' => 'carla@testerel.com', 'tipoUsuario' => 'profissional']],
    '7'  => ['nome' => 'Profissional Diana (id 514) - clínica 522 (sem padrões de notificação)', 'usuario' => ['idUsuario' => 514, 'nome' => 'TRN Diana Podóloga', 'email' => 'diana@testerel.com', 'tipoUsuario' => 'profissional']],
    '8'  => ['nome' => 'Profissional Eva (id 515) - sem atendimentos',                  'usuario' => ['idUsuario' => 515, 'nome' => 'TRN Eva Podóloga',   'email' => 'eva@testerel.com',   'tipoUsuario' => 'profissional']],
    '9'  => ['nome' => 'Clínica Alfa (id 521)', 'usuario' => ['idUsuario' => 521, 'nome' => 'TRN Clínica Alfa', 'email' => 'alfa@testerel.com', 'tipoUsuario' => 'clinica']],
    '10' => ['nome' => 'Clínica Beta (id 522)', 'usuario' => ['idUsuario' => 522, 'nome' => 'TRN Clínica Beta', 'email' => 'beta@testerel.com', 'tipoUsuario' => 'clinica']],
];

/* Serviço na sessão: simula o que o mostrardetalhes deixaria em $_SESSION['servico'] (agendar e reagendar usam) */
$presets = [
    ''       => ['nome' => '(nenhum)', 'servico' => null],
    'ser531' => ['nome' => 'Serviço 531 - Ana, clínica 521, 40+10 min, salas 541/542', 'servico' => ['ser_id' => 531, 'ser_pro' => 511, 'ser_clin' => 521,  'ser_dur' => 40, 'ser_inter' => 10, 'ser_loc' => 541]],
    'ser533' => ['nome' => 'Serviço 533 - Carla, clínica 521',                         'servico' => ['ser_id' => 533, 'ser_pro' => 513, 'ser_clin' => 521,  'ser_dur' => 40, 'ser_inter' => 10, 'ser_loc' => 541]],
    'ser534' => ['nome' => 'Serviço 534 - Diana, clínica 522 (sem padrão), sala 544',  'servico' => ['ser_id' => 534, 'ser_pro' => 514, 'ser_clin' => 522,  'ser_dur' => 40, 'ser_inter' => 10, 'ser_loc' => 544]],
    'ser535' => ['nome' => 'Serviço 535 - Bruno, autônomo, 30+10 min, sala 545',       'servico' => ['ser_id' => 535, 'ser_pro' => 512, 'ser_clin' => null, 'ser_dur' => 30, 'ser_inter' => 10, 'ser_loc' => 545]],
];

/* Monta a sessão do cenário escolhido (e o serviço da sessão, se pedido) */
if (($_POST['acao'] ?? '') === 'setup_teste') {
    header('Content-Type: application/json; charset=utf-8');
    $chave  = $_POST['cenario'] ?? '';
    $preset = $_POST['servico'] ?? '';
    if (!array_key_exists($chave, $cenarios) || !array_key_exists($preset, $presets)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'cenário ou serviço inválido']);
        exit;
    }
    $c = $cenarios[$chave];
    if ($c['usuario'] === null) {
        unset($_SESSION['usuario']);
    } else {
        $_SESSION['usuario'] = $c['usuario'];
    }
    unset($_SESSION['servico'], $_SESSION['datas'], $_SESSION['horarios']);
    if ($presets[$preset]['servico'] !== null) {
        $_SESSION['servico'] = $presets[$preset]['servico'];
    }
    echo json_encode(['sucesso' => true, 'sessao' => [
        'usuario' => $_SESSION['usuario'] ?? null,
        'servico' => $_SESSION['servico'] ?? null,
    ]]);
    exit;
}

/* Ver a sessão atual */
if (($_POST['acao'] ?? '') === 'ver_sessao') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'usuario'  => $_SESSION['usuario'] ?? null,
        'servico'  => $_SESSION['servico'] ?? null,
        'datas'    => $_SESSION['datas'] ?? null,
        'horarios' => $_SESSION['horarios'] ?? null,
    ]);
    exit;
}

?><!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste relatório, notificações, cancelar e atendimento</title>
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
<h1>Teste do relatoriocontroller, das notificações e do cancelar / atendimento</h1>

<p class="aviso">
    Rode o <code>inserts_relatorio_notif.sql</code> antes de cada rodada (cancelar, atendimento, aceitar, rejeitar, agendar e reagendar mudam os dados).
    Senha de todos os usuários de teste: <code>Senha@123</code>. Os testes de relatório e de listar vêm primeiro, antes de qualquer ação que altere os dados.
    O ganho "mensal" usa o ano ATUAL do servidor; os dados históricos são de 2026.
</p>

<fieldset class="linha">
    <legend>0. Endpoints</legend>
    <label>Servicocontroller <input id="epServico" class="endpoint" type="text"></label>
    <label>relatoriocontroller <input id="epRelatorio" class="endpoint" type="text"></label>
    <label>profissionalcontroller <input id="epProfissional" class="endpoint" type="text"></label>
    <label>clientecontroller <input id="epCliente" class="endpoint" type="text"></label>
    <label>clinicacontroller <input id="epClinica" class="endpoint" type="text"></label>
    <small>Se as rotas do seu Router forem outras, corrija aqui (ex: /projetopsi/relatorio).</small>
</fieldset>

<fieldset class="linha">
    <legend>1. Sessão (simula o login e o serviço que o mostrardetalhes deixaria em $_SESSION['servico'])</legend>
    <label>Usuário
        <select id="cenario">
            <?php foreach ($cenarios as $k => $c): ?>
                <option value="<?= $k ?>"><?= htmlspecialchars($c['nome']) ?></option>
            <?php endforeach; ?>
        </select>
    </label>
    <label>Serviço na sessão
        <select id="preset">
            <?php foreach ($presets as $k => $p): ?>
                <option value="<?= $k ?>"><?= htmlspecialchars($p['nome']) ?></option>
            <?php endforeach; ?>
        </select>
    </label>
    <button id="btnMontar">Montar sessão</button>
    <button id="btnVer">Ver sessão</button>
</fieldset>

<fieldset>
    <legend>2. Rodar tudo e comparar com o esperado</legend>
    <button id="btnTudo">Rodar todos os testes</button>
    <small>Cada teste monta a sessão que precisa. Os que têm "antes/depois" consultam o relatório antes e depois da ação para provar que a contagem mudou (ou NÃO mudou, nas recusas). O "esperado" descreve o comportamento correto: linha vermelha = o código ou o dado de teste não bate com isso.</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo (o "efeito" real, sem passar pelo listar)</summary>
<pre>-- notificações criadas pelos testes (id &gt; 507). Se o enviar() funcionasse, apareceriam:
--   agendar 531 (cli 501)         -&gt; tipo 1, para a Ana (511)
--   agendar 535 (cli 501)         -&gt; tipo 1, para o Bruno (512)
--   reagendar 595 (cli 502)       -&gt; tipo 2, para a Ana
--   cancelar 571 (Ana)            -&gt; tipo 5, para o cliente 501
--   cancelar 572 (cliente 502)    -&gt; tipo 5, para a Ana
--   aceitar  591 (Ana)            -&gt; tipo 3, para o cliente 502
--   rejeitar 592 (Ana)            -&gt; tipo 4, para o cliente 501
--   aceitar  593 (Bruno)          -&gt; tipo 3, para o cliente 503
select notif_id, notif_pd, notif_pro, notif_clin, notif_cli, notif_dest, notif_tipo, notif_data
from notificacao where notif_id &gt; 507 order by notif_id;

-- atendimentos criados pelos testes (atd_id &gt; 564). atd_agnd fica NULL porque a agenda é apagada
select atd_id, atd_pro, atd_clin, atd_agnd, atd_cli, atd_ser, atd_stat from atendimento where atd_id &gt; 564 order by atd_id;
-- esperado (comportamento correto):
--   571 desmarcado (Ana/501) | 572 desmarcado (Ana/502) | 576 desmarcado (Bruno/502)
--   578 atendido (Ana/501)   | 579 não compareceu (Ana/502) | 583 atendido (Bruno/503)
--   NÃO deve existir: 573, 574, 575, 577, 580, 581, 582 (recusas)

-- consultas que ainda devem existir (recusas) e as que foram apagadas
select agnd_id, agnd_pro, agnd_cli, agnd_stat, agnd_dt, agnd_hrIni from agenda where agnd_id between 571 and 596 order by agnd_id;
-- esperado: sumiram 571, 572, 576, 578, 579, 583 e 592 (rejeitada); 591 e 593 viraram 'aceita'; 595 ficou 'esperando' em 23/12 10:00 (sala 542)
-- e continuam 573, 574, 575, 577, 580, 581, 582, 594, 596 (596 vira 'aceita' no teste da Diana)

-- consultas novas do agendar (dez/2026)
select agnd_id, agnd_pro, agnd_cli, agnd_clin, agnd_ser, agnd_dt, agnd_stat from agenda where agnd_id &gt; 596 order by agnd_id;
-- esperado: 3 linhas em 28/12 (clientes 501, 501 e 503); agnd_clin deveria ser 521 na da Ana e 522 na da Diana</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/servico) */
const baseRota = nome => location.pathname.replace(/[^\/]*\/?$/, nome);
const EP = { servico: 'epServico', relatorio: 'epRelatorio', profissional: 'epProfissional', cliente: 'epCliente', clinica: 'epClinica' };
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

/* rota: 'servico' (padrão), 'relatorio', 'profissional', 'cliente' ou 'clinica' */
async function enviar(dados, rota) {
    const fd = new FormData();
    for (const k in dados) fd.append(k, dados[k]);
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const url = propria ? ENDPOINT_PAGINA : el(EP[rota || 'servico']).value.trim();
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
const montarSessao = (chave, preset) => enviar({ acao: 'setup_teste', cenario: chave ?? el('cenario').value, servico: preset ?? el('preset').value });
el('btnMontar').addEventListener('click', () => montarSessao().then(mostrar));
el('btnVer').addEventListener('click', () => enviar({ acao: 'ver_sessao' }).then(mostrar));

/* ---------- ações individuais (um cartão por ação) ---------- */
const PERIODOS = ['diario', 'semanal', 'mensal', 'anual'];
const ACOES = [
    { rota: 'relatorio', acao: 'quantidade', obs: 'Conta os atendimentos do usuário da sessão (profissional ou clínica): dados1 atendido, dados2 desmarcado, dados3 não compareceu.', campos: [] },
    { rota: 'relatorio', acao: 'ganho', obs: 'Soma o valor dos atendidos. Data: diário/semanal AAAA-MM-DD; mensal -MM (ano atual); anual AAAA.', campos: [
        { n: 'periodo', l: 'Período', t: 'select', opts: PERIODOS },
        { n: 'data', l: 'Data', v: '2026-03-04' } ] },
    { rota: 'relatorio', acao: 'historico', obs: 'Lista as consultas "aceita" com data até hoje do usuário da sessão (profissional, clínica ou cliente), com nomes e dados do serviço.', campos: [] },
    { rota: 'profissional', acao: 'notificação', obs: 'Lista as notificações do profissional da sessão (mais novas primeiro).', campos: [] },
    { rota: 'cliente', acao: 'notificação', obs: 'Lista as notificações do cliente da sessão.', campos: [] },
    { rota: 'clinica', acao: 'notificação', obs: 'Lista as notificações da clínica da sessão.', campos: [] },
    { rota: 'profissional', acao: 'aceitar', obs: 'Profissional aceita o pedido "esperando" do cliente e avisa o cliente (notificação tipo 3).', campos: [
        { n: 'cli', l: 'Cliente (id)', v: '502' },
        { n: 'clinica', l: 'Clínica (id, vazio se autônomo)', v: '521' } ] },
    { rota: 'profissional', acao: 'rejeitar', obs: 'Profissional rejeita o pedido "esperando" do cliente (apaga a consulta) e avisa o cliente.', campos: [
        { n: 'cli', l: 'Cliente (id)', v: '501' },
        { n: 'clinica', l: 'Clínica (id, vazio se autônomo)', v: '521' } ] },
    { rota: 'servico', acao: 'agendar', obs: 'Usa o serviço da sessão. Cria a consulta "esperando" e avisa o profissional (tipo 1).', campos: [
        { n: 'sala', l: 'Sala (id)', v: '541' },
        { n: 'dia', l: 'Dia', v: '2026-12-28', t: 'date' },
        { n: 'inicio', l: 'Início', v: '09:00', t: 'time' },
        { n: 'termino', l: 'Término', v: '09:40', t: 'time' } ] },
    { rota: 'servico', acao: 'reagendar', obs: 'Usa o serviço da sessão (permissão e notificação tipo 2).', campos: [
        { n: 'agnd_id', l: 'Consulta (id)', v: '595' },
        { n: 'agnd_pro', l: 'Profissional (id)', v: '511' },
        { n: 'ser_id', l: 'Serviço (id)', v: '531' },
        { n: 'sala', l: 'Sala (id)', v: '542' },
        { n: 'dia', l: 'Dia', v: '2026-12-23', t: 'date' },
        { n: 'inicio', l: 'Início', v: '10:00', t: 'time' },
        { n: 'termino', l: 'Término', v: '10:40', t: 'time' } ] },
    { rota: 'servico', acao: 'cancelar', obs: 'Grava atendimento "desmarcado", apaga a consulta e avisa a outra parte (tipo 5). "clinica" é usada na permissão do profissional e na notificação.', campos: [
        { n: 'agnd_id', l: 'Consulta (id)', v: '571' },
        { n: 'agnd_pro', l: 'Profissional (id)', v: '511' },
        { n: 'agnd_clin', l: 'Clínica da consulta (id)', v: '521' },
        { n: 'agnd_cli', l: 'Cliente (id)', v: '501' },
        { n: 'agnd_ser', l: 'Serviço (id)', v: '531' },
        { n: 'clinica', l: 'Clínica (para permissão/aviso)', v: '521' } ] },
    { rota: 'servico', acao: 'atendimento', obs: 'Só profissional. Grava o atendimento com o tipo escolhido e apaga a consulta da agenda.', campos: [
        { n: 'agnd_id', l: 'Consulta (id)', v: '578' },
        { n: 'agnd_pro', l: 'Profissional (id)', v: '511' },
        { n: 'agnd_clin', l: 'Clínica da consulta (id)', v: '521' },
        { n: 'agnd_cli', l: 'Cliente (id)', v: '501' },
        { n: 'agnd_ser', l: 'Serviço (id)', v: '531' },
        { n: 'tipo', l: 'Tipo', t: 'select', opts: ['atendido', 'não compareceu', 'desmarcado'] } ] }
];

function montarCartoes() {
    const alvo = el('cartoes');
    ACOES.forEach((a, idx) => {
        const fs = document.createElement('fieldset');
        let html = '<legend>' + esc(a.acao) + '</legend><p class="rota">rota: ' + esc(a.rota) + '</p><p class="obs">' + esc(a.obs) + '</p>';
        a.campos.forEach((c, j) => {
            const id = 'f_' + idx + '_' + j;
            if (c.t === 'select') {
                html += '<label>' + esc(c.l) + '<select id="' + id + '">' +
                    c.opts.map(o => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('') + '</select></label>';
            } else {
                html += '<label>' + esc(c.l) + '<input id="' + id + '" type="' + (c.t || 'text') + '" value="' + esc(c.v || '') + '"></label>';
            }
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
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Cliente Um 501', '2': 'Cliente Dois 502', '3': 'Cliente Três 503', '4': 'Ana 511', '5': 'Bruno 512',
    '6': 'Carla 513', '7': 'Diana 514', '8': 'Eva 515', '9': 'Clínica Alfa 521', '10': 'Clínica Beta 522' };

const ANO_ATUAL = new Date().getFullYear();
const MES_OK = ANO_ATUAL === 2026; // o "mensal" do controller usa o ano atual do servidor

function criarTestes() {
    const S = { nenhuma: '0', um: '1', dois: '2', tres: '3', ana: '4', bruno: '5', carla: '6', diana: '7', eva: '8', alfa: '9', beta: '10' };

    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? j?.msg ?? '');
    const txt = r => r.texto.trim();
    /* sucesso do agendar/reagendar: o controller dá json_encode("sucesso"), então vem entre aspas */
    const okTxt = (j, r) => txt(r).replace(/^"|"$/g, '') === 'sucesso' || j === 'sucesso' || j?.sucesso === true;
    /* recusa controlada: resposta não vazia, sem sucesso e sem erro fatal do PHP */
    const recusou = (j, r) => {
        const t = txt(r);
        return t !== '' && j?.sucesso !== true && j !== 'sucesso' && !/fatal error|stack trace|uncaught/i.test(t);
    };
    const dadosLista = j => (sucesso(j) && Array.isArray(j.dados)) ? j.dados : null;
    const ordem = (j, campo, esperados) => {
        const d = dadosLista(j);
        return !!d && JSON.stringify(d.map(r => String(r[campo]))) === JSON.stringify(esperados.map(String));
    };
    /* o destinatário passou a ter uma notificação NOVA (id > 507, as do SQL vão até 507) do tipo pedido */
    const novaNotif = (j, tipo) => { const d = dadosLista(j); return !!d && d.some(r => Number(r.notif_id) > 507 && String(r.notif_tipo) === String(tipo)); };

    const qtd = j => sucesso(j) ? [j.dados1, j.dados2, j.dados3] : null;
    const mesmaQtd = (j, esp) => { const q = qtd(j); return !!q && JSON.stringify(q) === JSON.stringify(esp); };
    const igualQ = (a, d) => !!qtd(a) && JSON.stringify(qtd(a)) === JSON.stringify(qtd(d));
    /* a contagem subiu 1 só na posição i (0 atendido, 1 desmarcado, 2 não compareceu) */
    const maisUm = (a, d, i) => { const x = qtd(a), y = qtd(d); return !!x && !!y && y.every((v, k) => v === x[k] + (k === i ? 1 : 0)); };
    const ganhoIgual = (j, v) => sucesso(j) && Number(j.dados) === v;
    const mes = v => (MES_OK ? v : 0);
    const notMes = MES_OK ? '' : ' (o servidor está em ' + ANO_ATUAL + ', então o mensal olha esse ano e deve dar 0)';

    const g = (periodo, data) => ({ acao: 'ganho', periodo, data });
    const Q = { rota: 'relatorio', req: { acao: 'quantidade' } };          // passo "antes/depois" na sessão atual
    const QDe = sessao => ({ sessao, rota: 'relatorio', req: { acao: 'quantidade' } });
    const LISTAR = { acao: 'notificação' };
    const cancelar = (agnd, pro, clin, cli, ser, clinica) => ({ acao: 'cancelar', agnd_id: agnd, agnd_pro: pro, agnd_clin: clin, agnd_cli: cli, agnd_ser: ser, clinica });
    const atend = (agnd, pro, clin, cli, ser, tipo) => ({ acao: 'atendimento', agnd_id: agnd, agnd_pro: pro, agnd_clin: clin, agnd_cli: cli, agnd_ser: ser, tipo });
    const permNegada = j => falha(j) && /permiss/i.test(msg(j));

    /* ----- histórico: agenda do SQL (id, profissional, cliente, clínica, data, status) ----- */
    const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const _h = new Date();
    const HOJE = iso(_h);
    const HOJE2 = iso(new Date(_h.getFullYear(), _h.getMonth(), _h.getDate() + 2));
    const AGENDA = [
        [551, 511, 501, 521, '2026-03-04', 'aceita'], [552, 511, 502, 521, '2026-03-04', 'aceita'], [553, 511, 501, null, '2026-03-06', 'aceita'],
        [554, 511, 501, 521, '2026-03-10', 'aceita'], [555, 511, 502, 521, '2026-03-10', 'aceita'], [556, 511, 502, null, '2026-03-12', 'aceita'],
        [557, 511, 501, 521, '2026-04-15', 'aceita'], [558, 511, 501, 521, '2025-12-30', 'aceita'], [559, 511, 502, 521, '2027-01-01', 'aceita'],
        [561, 513, 502, 521, '2026-03-04', 'aceita'], [562, 513, 501, 521, '2026-03-05', 'aceita'], [563, 514, 502, 522, '2026-03-04', 'aceita'],
        [564, 512, 502, null, '2026-03-04', 'aceita'], [565, 511, null, 521, '2026-03-20', 'aceita'], [566, 514, 501, 522, '2026-03-25', 'esperando'],
        [567, 511, 501, 521, HOJE, 'aceita'], [568, 511, 502, 521, HOJE2, 'aceita'],
        [571, 511, 501, 521, '2026-12-14', 'aceita'], [572, 511, 502, 521, '2026-12-14', 'aceita'], [573, 511, 501, 521, '2026-12-15', 'aceita'],
        [574, 513, 501, 521, '2026-12-15', 'aceita'], [575, 513, 502, 521, '2026-12-15', 'aceita'], [576, 512, 502, null, '2026-12-16', 'aceita'],
        [577, 511, 502, 521, '2026-12-17', 'aceita'], [578, 511, 501, 521, '2026-12-17', 'aceita'], [579, 511, 502, 521, '2026-12-18', 'aceita'],
        [580, 511, 501, 521, '2026-12-18', 'aceita'], [581, 511, 502, 521, '2026-12-18', 'aceita'], [582, 511, 501, 521, '2026-12-19', 'aceita'],
        [583, 512, 503, null, '2026-12-16', 'aceita'], [591, 511, 502, 521, '2026-12-21', 'esperando'], [592, 511, 501, 521, '2026-12-21', 'esperando'],
        [593, 512, 503, null, '2026-12-21', 'esperando'], [594, 511, 503, 521, '2026-12-22', 'esperando'], [595, 511, 502, 521, '2026-12-22', 'aceita'],
        [596, 514, 503, 522, '2026-12-21', 'esperando']
    ];
    const COL = { pro: 1, cli: 2, clin: 3 };
    /* ids esperados no histórico: 'aceita' e com data até hoje */
    const hist = (col, id) => AGENDA.filter(a => a[5] === 'aceita' && a[4] <= HOJE && a[COL[col]] === id).map(a => a[0]);
    const ordenados = l => [...l].map(Number).sort((x, y) => x - y);
    /* os agnd_id devolvidos são exatamente os esperados (ignorando os de "ignorar", que têm teste próprio) */
    const idsAgnd = (j, esperados, ignorar = []) => {
        const d = dadosLista(j);
        if (!d) return false;
        const obt = ordenados(d.map(r => r.agnd_id).filter(x => !ignorar.includes(Number(x))));
        const esp = ordenados(esperados.filter(x => !ignorar.includes(x)));
        return JSON.stringify(obt) === JSON.stringify(esp);
    };
    const linha = (j, id) => (dadosLista(j) || []).find(r => Number(r.agnd_id) === id);
    const HIST = { acao: 'historico' };

    return [
        /* ================= relatoriocontroller: quantidade ================= */
        { grupo: 'relatório: quantidade (valores do SQL)', n: 'Ana', sessao: S.ana, rota: 'relatorio', req: { acao: 'quantidade' },
          esp: 'sucesso: dados1 = 8 atendidos, dados2 = 1 desmarcado, dados3 = 1 não compareceu', ok: j => mesmaQtd(j, [8, 1, 1]) },
        { n: 'Carla', sessao: S.carla, rota: 'relatorio', req: { acao: 'quantidade' }, esp: '1 atendido, 0 desmarcado, 1 não compareceu', ok: j => mesmaQtd(j, [1, 0, 1]) },
        { n: 'Bruno', sessao: S.bruno, rota: 'relatorio', req: { acao: 'quantidade' }, esp: '1, 0, 0', ok: j => mesmaQtd(j, [1, 0, 0]) },
        { n: 'Diana', sessao: S.diana, rota: 'relatorio', req: { acao: 'quantidade' }, esp: '1, 0, 0 (não mistura com os da Alfa)', ok: j => mesmaQtd(j, [1, 0, 0]) },
        { n: 'Eva (sem atendimentos)', sessao: S.eva, rota: 'relatorio', req: { acao: 'quantidade' }, esp: 'sucesso com 0, 0, 0 (e não erro)', ok: j => mesmaQtd(j, [0, 0, 0]) },
        { n: 'Clínica Alfa', sessao: S.alfa, rota: 'relatorio', req: { acao: 'quantidade' },
          esp: '8 atendidos, 1 desmarcado, 1 não compareceu (soma de Ana e Carla; o "não compareceu" da Ana é autônomo e não entra)', ok: j => mesmaQtd(j, [8, 1, 1]) },
        { n: 'Clínica Beta', sessao: S.beta, rota: 'relatorio', req: { acao: 'quantidade' }, esp: '1, 0, 0', ok: j => mesmaQtd(j, [1, 0, 0]) },

        { grupo: 'relatório: quantidade (erros)', n: 'cliente pede o relatório', sessao: S.um, rota: 'relatorio', req: { acao: 'quantidade' },
          esp: 'JSON com sucesso: false ("Usuário inválido"), sem erro fatal (o modelo lança exceção e o controller não captura)', ok: (j, r) => falha(j) },
        { n: 'sem login pede o relatório', sessao: S.nenhuma, aceitaAviso: true, rota: 'relatorio', req: { acao: 'quantidade' },
          esp: 'JSON com sucesso: false ("ID inválido"), sem erro fatal', ok: (j, r) => falha(j) },
        { n: 'requisição sem ação', sessao: S.ana, rota: 'relatorio', req: {}, esp: 'JSON com sucesso: false ("Ação não enviada")', ok: (j, r) => falha(j) },
        { n: 'ação inexistente', rota: 'relatorio', req: { acao: 'nao_existe' }, esp: 'resposta vazia ou sucesso: false (o switch não tem default)', ok: (j, r) => txt(r) === '' || falha(j) },

        /* ================= relatoriocontroller: ganho ================= */
        { grupo: 'relatório: ganho da Ana', n: 'diário 04/03/2026 (2 consultas de R$ 100)', sessao: S.ana, rota: 'relatorio', req: g('diario', '2026-03-04'),
          esp: 'sucesso, dados = 200', ok: j => ganhoIgual(j, 200) },
        { n: 'diário 05/03/2026 (nada da Ana; só a Carla teve "não compareceu")', rota: 'relatorio', req: g('diario', '2026-03-05'), esp: 'sucesso, dados = 0', ok: j => ganhoIgual(j, 0) },
        { n: 'diário 10/03/2026 (1 atendido + 1 desmarcado)', rota: 'relatorio', req: g('diario', '2026-03-10'), esp: 'dados = 100 (o desmarcado não conta)', ok: j => ganhoIgual(j, 100) },
        { n: 'semanal com uma quarta (04/03) - semana 01 a 07/03', rota: 'relatorio', req: g('semanal', '2026-03-04'),
          esp: 'dados = 270 (100 + 100 + 70 do serviço autônomo; a consulta de 10/03 fica de fora)', ok: j => ganhoIgual(j, 270) },
        { n: 'semanal começando no domingo (01/03)', rota: 'relatorio', req: g('semanal', '2026-03-01'), esp: 'dados = 270 (o domingo é o início da semana)', ok: j => ganhoIgual(j, 270) },
        { n: 'semanal terminando no sábado (07/03)', rota: 'relatorio', req: g('semanal', '2026-03-07'), esp: 'dados = 270 (o sábado ainda é a mesma semana)', ok: j => ganhoIgual(j, 270) },
        { n: 'semanal da semana seguinte (domingo 08/03)', rota: 'relatorio', req: g('semanal', '2026-03-08'), esp: 'dados = 100 (só o atendido de 10/03)', ok: j => ganhoIgual(j, 100) },
        { n: 'mensal março (data "-03")', rota: 'relatorio', req: g('mensal', '-03'), esp: 'dados = 370' + notMes, ok: j => ganhoIgual(j, mes(370)) },
        { n: 'mensal abril (data "-04")', rota: 'relatorio', req: g('mensal', '-04'), esp: 'dados = 100' + notMes, ok: j => ganhoIgual(j, mes(100)) },
        { n: 'mensal maio, sem atendimentos', rota: 'relatorio', req: g('mensal', '-05'), esp: 'sucesso, dados = 0', ok: j => ganhoIgual(j, 0) },
        { n: 'anual 2026', rota: 'relatorio', req: g('anual', '2026'), esp: 'dados = 470 (não entra o de 30/12/2025 nem o de 01/01/2027)', ok: j => ganhoIgual(j, 470) },
        { n: 'anual 2025', rota: 'relatorio', req: g('anual', '2025'), esp: 'dados = 100 (consulta de 30/12/2025)', ok: j => ganhoIgual(j, 100) },
        { n: 'anual 2027', rota: 'relatorio', req: g('anual', '2027'), esp: 'dados = 100 (consulta de 01/01/2027)', ok: j => ganhoIgual(j, 100) },

        { grupo: 'relatório: ganho de clínicas e outros profissionais', n: 'Clínica Alfa, diário 04/03', sessao: S.alfa, rota: 'relatorio', req: g('diario', '2026-03-04'),
          esp: 'dados = 350 (Ana 100 + 100 e Carla 150)', ok: j => ganhoIgual(j, 350) },
        { n: 'Clínica Alfa, mensal março', rota: 'relatorio', req: g('mensal', '-03'), esp: 'dados = 450 (o serviço autônomo da Ana não entra)' + notMes, ok: j => ganhoIgual(j, mes(450)) },
        { n: 'Clínica Alfa, anual 2026', rota: 'relatorio', req: g('anual', '2026'), esp: 'dados = 550', ok: j => ganhoIgual(j, 550) },
        { n: 'Clínica Beta, diário 04/03 (não mistura com a Alfa)', sessao: S.beta, rota: 'relatorio', req: g('diario', '2026-03-04'), esp: 'dados = 200', ok: j => ganhoIgual(j, 200) },
        { n: 'Bruno (autônomo), diário 04/03', sessao: S.bruno, rota: 'relatorio', req: g('diario', '2026-03-04'), esp: 'dados = 80', ok: j => ganhoIgual(j, 80) },
        { n: 'Eva (sem atendimentos), anual 2026', sessao: S.eva, rota: 'relatorio', req: g('anual', '2026'), esp: 'sucesso, dados = 0', ok: j => ganhoIgual(j, 0) },

        { grupo: 'relatório: ganho (erros)', n: 'período inválido ("semestral")', sessao: S.ana, rota: 'relatorio', req: g('semestral', '2026-03-04'),
          esp: 'JSON com sucesso: false ("Período inválido"), sem erro fatal', ok: (j, r) => falha(j) },
        { n: 'data inválida no diário', rota: 'relatorio', req: g('diario', 'data-ruim'), esp: 'JSON com sucesso: false e a mensagem do erro de data', ok: (j, r) => falha(j) },
        { n: 'cliente pede o ganho', sessao: S.um, rota: 'relatorio', req: g('diario', '2026-03-04'), esp: 'JSON com sucesso: false ("Usuário inválido"), sem erro fatal', ok: (j, r) => falha(j) },
        { n: 'sem login pede o ganho', sessao: S.nenhuma, aceitaAviso: true, rota: 'relatorio', req: g('diario', '2026-03-04'), esp: 'JSON com sucesso: false, sem erro fatal', ok: (j, r) => falha(j) },

        /* ================= relatoriocontroller: historico ================= */
        { grupo: 'relatório: histórico (consultas "aceita" com data até hoje)', n: 'profissional Ana', sessao: S.ana, rota: 'relatorio', req: HIST,
          esp: 'sucesso, consultas da Ana: 551-558, 567 e as de dez/2026 já passadas (a 559 de 2027 e a 568 de daqui a 2 dias ficam de fora). A 565 (sem cliente) tem teste próprio',
          ok: j => idsAgnd(j, hist('pro', 511), [565]) },
        { n: 'campos da consulta 551 (nomes do profissional, cliente, clínica e serviço)', sessao: S.ana, rota: 'relatorio', req: HIST,
          esp: 'pro_nome TRN Ana Podóloga, cli_nome TRN Cliente Um, clin_id 521, clin_nome TRN Clínica Alfa, ser_nome TRN Podologia clínica, ser_dur 40, ser_inter 10, ser_loc 541, agnd_dt 2026-03-04, 09:00:00 a 09:40:00',
          ok: j => { const r = linha(j, 551); return !!r && String(r.pro_nome) === 'TRN Ana Podóloga' && String(r.cli_nome) === 'TRN Cliente Um' && String(r.clin_id) === '521'
              && String(r.clin_nome) === 'TRN Clínica Alfa' && String(r.ser_nome) === 'TRN Podologia clínica' && String(r.ser_dur) === '40' && String(r.ser_inter) === '10'
              && String(r.ser_loc) === '541' && String(r.agnd_dt) === '2026-03-04' && String(r.agnd_hrIni) === '09:00:00' && String(r.agnd_hrTerm) === '09:40:00' && String(r.agnd_stat) === 'aceita'; } },
        { n: 'consulta sem clínica (553, serviço autônomo) aparece', sessao: S.ana, rota: 'relatorio', req: HIST,
          esp: 'a 553 está na lista com clin_id e clin_nome nulos (junção LEFT com a clínica)',
          ok: j => { const r = linha(j, 553); return !!r && r.clin_id === null && r.clin_nome === null && String(r.ser_nome) === 'TRN Podologia em consultório'; } },
        { n: 'consulta agendada pelo profissional, SEM cliente (565), aparece', sessao: S.ana, rota: 'relatorio', req: HIST,
          esp: 'a 565 está na lista com cli_nome nulo (o agnd_cli pode ser nulo; hoje o INNER JOIN com cliente a descarta)',
          ok: j => { const r = linha(j, 565); return !!r && r.cli_nome === null; } },
        { n: 'consulta de hoje (567) entra e a de daqui a 2 dias (568) não', sessao: S.ana, rota: 'relatorio', req: HIST,
          esp: 'a 567 está na lista (data de hoje: <= hoje) e a 568 não',
          ok: j => !!linha(j, 567) && !linha(j, 568) && !linha(j, 559) },
        { n: 'Carla', sessao: S.carla, rota: 'relatorio', req: HIST, esp: 'sucesso, consultas 561 e 562 (e as dela já passadas em dez/2026)', ok: j => idsAgnd(j, hist('pro', 513)) },
        { n: 'Bruno (autônomo)', sessao: S.bruno, rota: 'relatorio', req: HIST, esp: 'sucesso, consulta 564 (sem clínica)', ok: j => idsAgnd(j, hist('pro', 512)) },
        { n: 'Diana (a 566 está "esperando" e não entra)', sessao: S.diana, rota: 'relatorio', req: HIST, esp: 'sucesso, só a 563', ok: j => idsAgnd(j, hist('pro', 514)) },
        { n: 'Eva (sem consultas)', sessao: S.eva, rota: 'relatorio', req: HIST, esp: 'sucesso, dados vazio (e não erro)', ok: j => sucesso(j) && Array.isArray(j.dados) && j.dados.length === 0 },
        { n: 'cliente 501', sessao: S.um, rota: 'relatorio', req: HIST, esp: 'sucesso, só as consultas do cliente 501: 551, 553, 554, 557, 558, 562 e 567', ok: j => idsAgnd(j, hist('cli', 501)) },
        { n: 'cliente 502', sessao: S.dois, rota: 'relatorio', req: HIST, esp: 'sucesso, só as do cliente 502: 552, 555, 556, 561, 563, 564', ok: j => idsAgnd(j, hist('cli', 502)) },
        { n: 'cliente 503 (só tem pedidos futuros)', sessao: S.tres, rota: 'relatorio', req: HIST, esp: 'sucesso, dados vazio', ok: j => sucesso(j) && Array.isArray(j.dados) && j.dados.length === 0 },
        { n: 'Clínica Alfa', sessao: S.alfa, rota: 'relatorio', req: HIST, esp: 'sucesso, consultas da clínica 521 (as de clínica da Ana e da Carla, sem as autônomas 553 e 556)', ok: j => idsAgnd(j, hist('clin', 521), [565]) },
        { n: 'Clínica Beta', sessao: S.beta, rota: 'relatorio', req: HIST, esp: 'sucesso, só a 563', ok: j => idsAgnd(j, hist('clin', 522)) },
        { n: 'sem login pede o histórico', sessao: S.nenhuma, aceitaAviso: true, rota: 'relatorio', req: HIST,
          esp: 'JSON com sucesso: false, sem erro fatal', ok: (j, r) => falha(j) },

        /* ================= notificações: listar ================= */
        { grupo: 'notificações: listar (profissional, cliente e clínica)', n: 'profissionalcontroller: Ana lista as dela', sessao: S.ana, rota: 'profissional', req: LISTAR,
          esp: 'sucesso, 3 notificações da mais nova para a mais antiga: 504, 505, 503', ok: j => ordem(j, 'notif_id', [504, 505, 503]) },
        { n: 'clientecontroller: cliente 501 lista as dele', sessao: S.um, rota: 'cliente', req: LISTAR, esp: 'sucesso, 502 (05/11) e 501 (01/11), nessa ordem', ok: j => ordem(j, 'notif_id', [502, 501]) },
        { n: 'clientecontroller: cliente 502 só vê as dele', sessao: S.dois, rota: 'cliente', req: LISTAR, esp: 'sucesso, só a 507 (não vê as do 501)', ok: j => ordem(j, 'notif_id', [507]) },
        { n: 'clientecontroller: cliente 503 sem notificações', sessao: S.tres, rota: 'cliente', req: LISTAR, esp: 'sucesso, dados vazio', ok: j => sucesso(j) && Array.isArray(j.dados) && j.dados.length === 0 },
        { n: 'clinicacontroller: clínica Alfa lista as dela', sessao: S.alfa, rota: 'clinica', req: LISTAR, esp: 'sucesso, só a 506', ok: j => ordem(j, 'notif_id', [506]) },
        { n: 'sem login tenta listar (clientecontroller)', sessao: S.nenhuma, aceitaAviso: true, rota: 'cliente', req: LISTAR, esp: 'recusa (sucesso: false), sem listar as do "id 0"', ok: (j, r) => recusou(j, r) },

        /* ================= Servicocontroller: cancelar ================= */
        { grupo: 'cancelar', n: 'Ana (com permissão) cancela a 571 (cliente 501, clínica 521)', sessao: S.ana, antes: Q, depois: Q,
          req: cancelar('571', '511', '521', '501', '531', '521'),
          esp: 'sucesso; a consulta sai da agenda e a Ana ganha 1 atendimento "desmarcado" no relatório (dados2 + 1)',
          ok: (j, r, a, d) => sucesso(j) && maisUm(a, d, 1) },
        { n: 'o cliente 501 recebe a notificação de cancelamento (tipo 5)', sessao: S.um, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 5, além das 502 e 501 do SQL', ok: j => novaNotif(j, 5) },
        { n: 'cliente 502 cancela a própria consulta 572', sessao: S.dois, antes: QDe(S.ana), depois: QDe(S.ana),
          req: cancelar('572', '511', '521', '502', '531', '521'),
          esp: 'sucesso; no relatório da Ana, dados2 + 1',
          ok: (j, r, a, d) => sucesso(j) && maisUm(a, d, 1) },
        { n: 'a Ana recebe a notificação de cancelamento (tipo 5)', sessao: S.ana, rota: 'profissional', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 5 (o cancelamento do cliente 502)', ok: j => novaNotif(j, 5) },
        { n: 'Carla (sem permissão) cancela a 574', sessao: S.carla, antes: Q, depois: Q,
          req: cancelar('574', '513', '521', '501', '533', '521'),
          esp: 'sucesso: false, "permissão negada"; o relatório da Carla não muda', ok: (j, r, a, d) => permNegada(j) && igualQ(a, d) },
        { n: 'Carla manda "clinica" vazio para pular a checagem de permissão (575)', sessao: S.carla, antes: Q, depois: Q,
          req: cancelar('575', '513', '521', '502', '533', ''),
          esp: 'recusa (a permissão vale para a clínica da consulta, não para o que vem no POST); o relatório da Carla não muda',
          ok: (j, r, a, d) => recusou(j, r) && igualQ(a, d) },
        { n: 'sem login tenta cancelar a 573', sessao: S.nenhuma, aceitaAviso: true, antes: QDe(S.ana), depois: QDe(S.ana),
          req: cancelar('573', '511', '521', '501', '531', '521'),
          esp: 'recusa; o relatório da Ana não muda', ok: (j, r, a, d) => recusou(j, r) && igualQ(a, d) },
        { n: 'cliente 501 tenta cancelar a 577 (que é do cliente 502)', sessao: S.um, antes: QDe(S.ana), depois: QDe(S.ana),
          req: cancelar('577', '511', '521', '502', '531', '521'),
          esp: 'recusa (só o dono ou o profissional mexe na consulta); o relatório da Ana não muda', ok: (j, r, a, d) => recusou(j, r) && igualQ(a, d) },
        { n: 'Ana cancela a 582 mandando o cliente errado (502 em vez de 501)', sessao: S.ana, antes: Q, depois: Q,
          req: cancelar('582', '511', '521', '502', '531', '521'),
          esp: 'recusa (os dados enviados não batem com a consulta); o relatório da Ana não muda', ok: (j, r, a, d) => recusou(j, r) && igualQ(a, d) },
        { n: 'Bruno (autônomo) cancela a 576 com clínica vazia', sessao: S.bruno, antes: Q, depois: Q,
          req: cancelar('576', '512', '', '502', '535', ''),
          esp: 'sucesso (consulta sem clínica); no relatório do Bruno, dados2 + 1 (o "" não pode ir para uma coluna int)',
          ok: (j, r, a, d) => sucesso(j) && maisUm(a, d, 1) },

        /* ================= Servicocontroller: atendimento ================= */
        { grupo: 'atendimento (novo)', n: 'Ana marca a 578 como atendido', sessao: S.ana, antes: Q, depois: Q,
          req: atend('578', '511', '521', '501', '531', 'atendido'),
          esp: 'sucesso; no relatório da Ana, dados1 + 1', ok: (j, r, a, d) => sucesso(j) && maisUm(a, d, 0) },
        { n: 'ganho do dia 17/12 passa a incluir o atendido da 578', sessao: S.ana, rota: 'relatorio', req: g('diario', '2026-12-17'),
          esp: 'dados = 100. Hoje o atendimento fica sem agenda (a agenda é apagada, atd_agnd vira NULL) e o INNER JOIN do ganho o descarta',
          ok: j => ganhoIgual(j, 100) },
        { n: 'Ana marca a 579 como não compareceu', sessao: S.ana, antes: Q, depois: Q,
          req: atend('579', '511', '521', '502', '531', 'não compareceu'),
          esp: 'sucesso; no relatório da Ana, dados3 + 1', ok: (j, r, a, d) => sucesso(j) && maisUm(a, d, 2) },
        { n: 'Ana marca a 567 (consulta de hoje) como atendida', sessao: S.ana, antes: Q, depois: Q,
          req: atend('567', '511', '521', '501', '531', 'atendido'),
          esp: 'sucesso; no relatório da Ana, dados1 + 1', ok: (j, r, a, d) => sucesso(j) && maisUm(a, d, 0) },
        { n: 'a consulta já atendida (567) continua no histórico', sessao: S.ana, rota: 'relatorio', req: HIST,
          esp: 'a 567 ainda aparece (dúvida de design: o histórico lê a agenda e o atendimento apaga a consulta; o atendimento não guarda data nem horário)',
          ok: j => !!linha(j, 567) },
        { n: 'cliente 501 tenta marcar atendimento na 580', sessao: S.um, antes: QDe(S.ana), depois: QDe(S.ana),
          req: atend('580', '511', '521', '501', '531', 'atendido'),
          esp: 'recusa e NADA muda (o controller não dá exit depois da mensagem); o relatório da Ana não muda',
          ok: (j, r, a, d) => recusou(j, r) && igualQ(a, d) },
        { n: 'Ana manda um tipo inválido ("xyz") na 581', sessao: S.ana, antes: Q, depois: Q,
          req: atend('581', '511', '521', '502', '531', 'xyz'),
          esp: 'recusa limpa (sucesso: false); o relatório da Ana não muda', ok: (j, r, a, d) => falha(j) && igualQ(a, d) },
        { n: 'sem login tenta marcar atendimento na 581', sessao: S.nenhuma, aceitaAviso: true, antes: QDe(S.ana), depois: QDe(S.ana),
          req: atend('581', '511', '521', '502', '531', 'atendido'),
          esp: 'recusa; o relatório da Ana não muda', ok: (j, r, a, d) => recusou(j, r) && igualQ(a, d) },
        { n: 'Bruno (autônomo) marca a 583 como atendido, clínica vazia', sessao: S.bruno, antes: Q, depois: Q,
          req: atend('583', '512', '', '503', '535', 'atendido'),
          esp: 'sucesso; no relatório do Bruno, dados1 + 1', ok: (j, r, a, d) => sucesso(j) && maisUm(a, d, 0) },

        /* ================= profissionalcontroller: aceitar / rejeitar ================= */
        { grupo: 'aceitar e rejeitar (profissionalcontroller)', n: 'Ana aceita o pedido do cliente 502 (591)', sessao: S.ana, rota: 'profissional', req: { acao: 'aceitar', cli: '502', clinica: '521' },
          esp: 'sucesso: true, resposta só com o JSON (sem warning)', ok: j => sucesso(j) },
        { n: 'o cliente 502 recebe a notificação de consulta aceita (tipo 3)', sessao: S.dois, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 3', ok: j => novaNotif(j, 3) },
        { n: 'Ana aceita de novo o cliente 502 (já não há pedido "esperando")', sessao: S.ana, rota: 'profissional', req: { acao: 'aceitar', cli: '502', clinica: '521' },
          esp: 'JSON limpo com sucesso: false e mensagem (o modelo lê $dado[0] sem ver se existe)', ok: (j, r) => falha(j) },
        { n: 'Carla tenta aceitar o pedido do cliente 503 (que é da Ana, 594)', sessao: S.carla, rota: 'profissional', req: { acao: 'aceitar', cli: '503', clinica: '521' },
          esp: 'JSON limpo com sucesso: false; a 594 continua "esperando"', ok: (j, r) => falha(j) },
        { n: 'cliente 502 chama o aceitar do profissional', sessao: S.dois, rota: 'profissional', req: { acao: 'aceitar', cli: '503', clinica: '521' },
          esp: 'JSON limpo com sucesso: false (cliente não aceita consulta)', ok: (j, r) => falha(j) },
        { n: 'Bruno (autônomo, clínica vazia) aceita o pedido do cliente 503 (593)', sessao: S.bruno, rota: 'profissional', req: { acao: 'aceitar', cli: '503', clinica: '' },
          esp: 'sucesso: true, resposta limpa', ok: j => sucesso(j) },
        { n: 'o cliente 503 recebe a notificação do Bruno (tipo 3, padrão do próprio Bruno)', sessao: S.tres, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 3', ok: j => novaNotif(j, 3) },
        { n: 'Diana aceita o pedido do cliente 503 numa clínica SEM padrão de notificação (596)', sessao: S.diana, rota: 'profissional', req: { acao: 'aceitar', cli: '503', clinica: '522' },
          esp: 'sucesso: true e resposta limpa (sem padrão não pode gerar warning)', ok: j => sucesso(j) },
        { n: 'Ana rejeita o pedido do cliente 501 (592)', sessao: S.ana, rota: 'profissional', req: { acao: 'rejeitar', cli: '501', clinica: '521' },
          esp: 'sucesso: true, resposta só com o JSON (o rejeitar usa $camposnot, que só existe no case "aceitar")', ok: j => sucesso(j) },
        { n: 'o cliente 501 recebe a notificação de consulta rejeitada (tipo 4)', sessao: S.um, rota: 'cliente', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 4 (pelo comentário do notificacao.php, rejeitar = 4)', ok: j => novaNotif(j, 4) },

        /* ================= agendar / reagendar: notificação ================= */
        { grupo: 'agendar e reagendar: aviso ao profissional', n: 'cliente 501 agenda o serviço 531 da Ana (clínica 521)', sessao: S.um, servico: 'ser531', req: { acao: 'agendar', sala: '541', dia: '2026-12-28', inicio: '09:00', termino: '09:40' },
          esp: 'sucesso, resposta limpa', ok: (j, r) => okTxt(j, r) },
        { n: 'a Ana recebe o aviso de nova consulta (tipo 1)', sessao: S.ana, rota: 'profissional', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 1', ok: j => novaNotif(j, 1) },
        { n: 'cliente 501 agenda o serviço 535 do Bruno (autônomo)', sessao: S.um, servico: 'ser535', req: { acao: 'agendar', sala: '545', dia: '2026-12-28', inicio: '10:00', termino: '10:30' },
          esp: 'sucesso, resposta limpa', ok: (j, r) => okTxt(j, r) },
        { n: 'o Bruno recebe o aviso de nova consulta (tipo 1, padrão do próprio Bruno)', sessao: S.bruno, rota: 'profissional', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 1', ok: j => novaNotif(j, 1) },
        { n: 'cliente 503 agenda o serviço 534 da Diana (clínica 522 sem padrão)', sessao: S.tres, servico: 'ser534', req: { acao: 'agendar', sala: '544', dia: '2026-12-28', inicio: '11:00', termino: '11:40' },
          esp: 'sucesso e resposta limpa (sem padrão de notificação não pode gerar warning)', ok: (j, r) => okTxt(j, r) },
        { n: 'cliente 502 reagenda a consulta 595 (serviço 531 da Ana)', sessao: S.dois, servico: 'ser531',
          req: { acao: 'reagendar', agnd_id: '595', agnd_pro: '511', ser_id: '531', sala: '542', dia: '2026-12-23', inicio: '10:00', termino: '10:40' },
          esp: 'sucesso, resposta limpa', ok: (j, r) => okTxt(j, r) },
        { n: 'a Ana recebe o aviso de reagendamento (tipo 2)', sessao: S.ana, rota: 'profissional', req: LISTAR,
          esp: 'lista com uma notificação NOVA (id > 507) do tipo 2', ok: j => novaNotif(j, 2) }
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

/* roda um passo extra (antes/depois). Se ele troca de usuário, o usuário do teste é restaurado depois. */
async function passoExtra(passo, t) {
    if (passo.sessao !== undefined) await montarSessao(passo.sessao, passo.servico ?? '');
    const res = await enviar(passo.req, passo.rota);
    if (passo.sessao !== undefined) await montarSessao(t.sessao, t.servico ?? '');
    return res;
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
            await montarSessao(t.sessao, t.servico ?? '');
            sessaoAtual = ROTULO_SESSAO[t.sessao] + (t.servico ? ' + serviço ' + t.servico.replace('ser', '') : '');
        }
        const antes  = t.antes  ? await passoExtra(t.antes, t)  : null;
        const res    = await enviar(t.req, t.rota);
        const depois = t.depois ? await passoExtra(t.depois, t) : null;

        let ok = false;
        try {
            ok = !!t.ok(res.json, res, antes ? antes.json : null, depois ? depois.json : null) && (t.aceitaAviso || !(res.json && res.json.__sujo));
        } catch (e) { ok = false; }
        if (ok) passou++;
        brutos.push({ teste: t.n, rota: t.rota || 'servico', enviado: t.req, status: res.status, resposta: res.json ?? res.texto,
            relatorio_antes: antes ? (antes.json ?? antes.texto) : undefined, relatorio_depois: depois ? (depois.json ?? depois.texto) : undefined });

        let obtido = resumo(res);
        if (antes && depois) {
            const q = x => x.json && x.json.sucesso === true ? '[' + [x.json.dados1, x.json.dados2, x.json.dados3].join(', ') + ']' : 'erro';
            obtido += '  ·  relatório antes ' + q(antes) + ' → depois ' + q(depois);
        }
        if (t.grupo) html += '<tr class="grupo"><td colspan="6">' + esc(t.grupo) + '</td></tr>';
        html += '<tr><td>' + (i + 1) + '</td><td>' + esc(t.n) + '</td><td>' + esc(sessaoAtual) + '</td><td>' + esc(t.esp) +
            '</td><td class="obt">' + esc(obtido) + '</td><td class="' + (ok ? 'ok' : 'erro') + '">' + (ok ? 'OK' : 'FALHOU') + '</td></tr>';
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