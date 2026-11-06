<?php
/*
 * PÁGINA DE TESTE - Servicocontroller + buscacontroller (fluxo de agendamento)
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * O fluxo do usuário passa pelos dois controllers, então eles são testados juntos:
 *   busca -> mostrardetalhes (guarda o serviço na sessão) -> MostrarDias -> mostrarhorario
 *         -> mostrarSala -> agendar -> reagendar / cancelar
 *   (e o cadastrar do Servicocontroller alimenta a busca)
 *
 * Ações do Servicocontroller: cadastrar, MostrarDias, mostrarhorario, mostrarSala, agendar, reagendar, cancelar
 * Ações do buscacontroller:   busca, mostrardetalhes
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas
 * para as rotas "servico" e "busca" do Router. As rotas são calculadas no JS trocando o último
 * trecho da URL e podem ser corrigidas nos campos de endpoint.
 *
 * Antes de cada rodada rode o inserts_servico_busca.sql (ele limpa e recria os dados de teste).
 * Senha de todos os usuários de teste: Senha@123
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria em $_SESSION['usuario'] (mesma estrutura de usuario::Login) */
$cenarios = [
    '0' => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1' => [
        'nome'    => 'Cliente Um (id 401)',
        'usuario' => ['idUsuario' => 401, 'nome' => 'TSB Cliente Um', 'email' => 'um@testeserv.com', 'tipoUsuario' => 'cliente'],
    ],
    '2' => [
        'nome'    => 'Cliente Dois (id 402)',
        'usuario' => ['idUsuario' => 402, 'nome' => 'TSB Cliente Dois', 'email' => 'dois@testeserv.com', 'tipoUsuario' => 'cliente'],
    ],
    '3' => [
        'nome'    => 'Profissional Ana (id 411) - vinculada à clínica 421, com todas as permissões',
        'usuario' => ['idUsuario' => 411, 'nome' => 'TSB Ana Podóloga', 'email' => 'ana@testeserv.com', 'tipoUsuario' => 'profissional'],
    ],
    '4' => [
        'nome'    => 'Profissional Carla (id 413) - vinculada à clínica 421, SEM permissões',
        'usuario' => ['idUsuario' => 413, 'nome' => 'TSB Carla Podóloga', 'email' => 'carla@testeserv.com', 'tipoUsuario' => 'profissional'],
    ],
    '5' => [
        'nome'    => 'Profissional Bruno (id 412) - NÃO vinculado à clínica 421',
        'usuario' => ['idUsuario' => 412, 'nome' => 'TSB Bruno Podólogo', 'email' => 'bruno@testeserv.com', 'tipoUsuario' => 'profissional'],
    ],
    '6' => [
        'nome'    => 'Clínica Alfa (id 421)',
        'usuario' => ['idUsuario' => 421, 'nome' => 'TSB Clínica Alfa', 'email' => 'alfa@testeserv.com', 'tipoUsuario' => 'clinica'],
    ],
];

/*
 * Serviço na sessão: simula o que o mostrardetalhes deveria deixar em $_SESSION['servico'].
 * Inclui ser_clin porque o agendar/reagendar/cancelar usam esse campo para checar permissão.
 */
$presets = [
    ''       => ['nome' => '(nenhum)', 'servico' => null],
    'ser401' => ['nome' => 'Serviço 401 - Ana, autônomo, 40+10 min, sala 443',   'servico' => ['ser_id' => 401, 'ser_pro' => 411, 'ser_clin' => null, 'ser_dur' => 40, 'ser_inter' => 10, 'ser_loc' => 442]],
    'ser402' => ['nome' => 'Serviço 402 - Ana, clínica 421, 40+10 min, salas 441/442', 'servico' => ['ser_id' => 402, 'ser_pro' => 411, 'ser_clin' => 421, 'ser_dur' => 40, 'ser_inter' => 10, 'ser_loc' => 441]],
    'ser403' => ['nome' => 'Serviço 403 - Bruno, autônomo, 30+10 min',          'servico' => ['ser_id' => 403, 'ser_pro' => 412, 'ser_clin' => null, 'ser_dur' => 30, 'ser_inter' => 10, 'ser_loc' => 443]],
    'ser405' => ['nome' => 'Serviço 405 - Carla, clínica 421, 40+10 min',       'servico' => ['ser_id' => 405, 'ser_pro' => 413, 'ser_clin' => 421, 'ser_dur' => 40, 'ser_inter' => 10, 'ser_loc' => 441]],
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

/* Ver a sessão atual (o que os controllers deixam guardado entre uma etapa e outra) */
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
<title>Teste serviço e busca</title>
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
<h1>Teste do Servicocontroller + buscacontroller</h1>

<p class="aviso">
    Rode o <code>inserts_servico_busca.sql</code> antes de cada rodada (cadastrar, agendar, reagendar e cancelar mudam os dados).
    Senha de todos os usuários de teste: <code>Senha@123</code>. As datas de teste são de dezembro de 2026.
</p>

<fieldset class="linha">
    <legend>0. Endpoints</legend>
    <label>Rota do Servicocontroller <input id="epServico" class="endpoint" type="text"></label>
    <label>Rota do buscacontroller <input id="epBusca" class="endpoint" type="text"></label>
    <small>Se as rotas do seu Router forem outras, corrija aqui (ex: /projetopsi/servico e /projetopsi/busca).</small>
</fieldset>

<fieldset class="linha">
    <legend>1. Sessão (simula o login e o que o mostrardetalhes deixaria em $_SESSION['servico'])</legend>
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
    <small>Cada teste monta a sessão que precisa; os de um mesmo grupo seguem o fluxo e reaproveitam a sessão do passo anterior. O "esperado" descreve o comportamento correto: linha vermelha = o código ou o dado de teste não bate com isso.</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo</summary>
<pre>-- agendar e reagendar
select agnd_id, agnd_pro, agnd_cli, agnd_clin, agnd_ser, agnd_sala, agnd_dt, agnd_hrIni, agnd_stat
from agenda where agnd_pro = 411 order by agnd_dt, agnd_hrIni;
-- esperado: 12/12 não importa; em 14 e 15/12 devem existir
--   14/12 08:00 cli 401 clin NULL (serviço autônomo)      'esperando'
--   15/12 08:00 cli 402 clin 421  (serviço da clínica)    'esperando'  &lt;- agnd_clin tem que ser 421
--   15/12 10:00 cli NULL clin 421 (agendado pela Ana)     'esperando'
--   agenda 402 movida p/ 14/12 09:00, agnd_cli 402; agenda 405 movida p/ 14/12 13:00 e agnd_cli continua 401
--   agenda 406 intacta (16/12 15:00, cli 402, aceita)

-- cancelar
select agnd_id from agenda where agnd_id in (403, 404);
-- esperado: nenhuma linha
select atd_pro, atd_clin, atd_cli, atd_ser, atd_stat from atendimento where atd_pro = 411;
-- esperado: 2 linhas 'desmarcado' (clientes 401 e 402); atd_agnd fica NULL porque a agenda foi apagada

-- cadastrar
select ser_id, ser_pro, ser_clin, ser_nome from servico where ser_nome like 'TSB Novo%' or ser_nome like 'TSB Clin%';
-- esperado: o da Ana com ser_pro 411; o da clínica com ser_clin 421 e ser_pro NULL; nenhum criado por cliente nem sem login</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/servico) */
const baseRota = nome => location.pathname.replace(/[^\/]*\/?$/, nome);
el('epServico').value = baseRota('servico');
el('epBusca').value = baseRota('busca');
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

/* rota: 'servico' (padrão) ou 'busca' */
async function enviar(dados, rota) {
    const fd = new FormData();
    for (const k in dados) fd.append(k, dados[k]);
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const url = propria ? ENDPOINT_PAGINA : (rota === 'busca' ? el('epBusca').value : el('epServico').value).trim();
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
const TIPOS = ['servico', 'profissional', 'clinica'];
const ACOES = [
    { rota: 'busca', acao: 'busca', obs: 'Procura por nome (e tipo, no serviço). "Valor" só vale para serviço. Use "TSB" para ver os dados de teste.', campos: [
        { n: 'tipo', l: 'Tipo', t: 'select', opts: TIPOS },
        { n: 'busca', l: 'Termo', v: 'TSB' },
        { n: 'valor', l: 'Valor (opcional)', v: '', opcional: true } ] },
    { rota: 'busca', acao: 'mostrardetalhes', obs: 'Para serviço, guarda o serviço na sessão (use "Ver sessão" depois).', campos: [
        { n: 'tipo', l: 'Tipo', t: 'select', opts: TIPOS },
        { n: 'id', l: 'Id', v: '401' } ] },
    { rota: 'servico', acao: 'cadastrar', obs: 'Usa o usuário da sessão: profissional (Ana) ou clínica. Cliente e deslogado não deveriam conseguir.', campos: [
        { n: 'nome', l: 'Nome', v: 'TSB Novo Manual' },
        { n: 'tipo', l: 'Tipo', v: 'tsb-novo' },
        { n: 'desc', l: 'Descrição', v: 'Serviço criado pelo teste' },
        { n: 'dur', l: 'Duração (min)', v: '30' },
        { n: 'inter', l: 'Intervalo (min)', v: '10' },
        { n: 'val', l: 'Valor', v: '55.50' },
        { n: 'dia', l: 'Dia da semana (0-6)', v: '1' },
        { n: 'loc', l: 'Localização (id)', v: '442' } ] },
    { rota: 'servico', acao: 'MostrarDias', obs: 'Dias disponíveis/folga/indisponíveis do mês. Se a sessão tiver serviço, ele vale no lugar do profissional enviado.', campos: [
        { n: 'mes', l: 'Mês', v: '12' },
        { n: 'ano', l: 'Ano', v: '2026' },
        { n: 'ser_id', l: 'Serviço (id)', v: '401' },
        { n: 'agnd_pro', l: 'Profissional (id)', v: '411' } ] },
    { rota: 'servico', acao: 'mostrarhorario', obs: 'Horários livres do dia. Guarda o dia na sessão (o mostrarSala usa). Se a sessão tiver serviço, ele vale no lugar dos campos abaixo.', campos: [
        { n: 'dia', l: 'Dia', v: '2026-12-14', t: 'date' },
        { n: 'ser_dur', l: 'Duração (min)', v: '40' },
        { n: 'ser_inter', l: 'Intervalo (min)', v: '10' },
        { n: 'agnd_pro', l: 'Profissional (id)', v: '411' } ] },
    { rota: 'servico', acao: 'mostrarSala', obs: 'Salas livres no horário, no dia do último mostrarhorario.', campos: [
        { n: 'inicio', l: 'Início', v: '08:00', t: 'time' },
        { n: 'termino', l: 'Término', v: '08:50', t: 'time' },
        { n: 'ser_loc', l: 'Localização (id)', v: '441' } ] },
    { rota: 'servico', acao: 'agendar', obs: 'Usa o serviço da sessão. Cria a consulta como "esperando".', campos: [
        { n: 'sala', l: 'Sala (id)', v: '443' },
        { n: 'dia', l: 'Dia', v: '2026-12-14', t: 'date' },
        { n: 'inicio', l: 'Início', v: '08:00', t: 'time' },
        { n: 'termino', l: 'Término', v: '08:50', t: 'time' } ] },
    { rota: 'servico', acao: 'reagendar', obs: 'Muda dia/horário/sala de uma consulta existente.', campos: [
        { n: 'agnd_id', l: 'Consulta (id)', v: '402' },
        { n: 'agnd_pro', l: 'Profissional (id)', v: '411' },
        { n: 'ser_id', l: 'Serviço (id)', v: '401' },
        { n: 'sala', l: 'Sala (id)', v: '443' },
        { n: 'dia', l: 'Dia', v: '2026-12-14', t: 'date' },
        { n: 'inicio', l: 'Início', v: '09:00', t: 'time' },
        { n: 'termino', l: 'Término', v: '09:50', t: 'time' } ] },
    { rota: 'servico', acao: 'cancelar', obs: 'Apaga a consulta e registra o atendimento como "desmarcado".', campos: [
        { n: 'agnd_pro', l: 'Profissional (id)', v: '411' },
        { n: 'agnd_clin', l: 'Clínica (id)', v: '421' },
        { n: 'agnd_id', l: 'Consulta (id)', v: '403' },
        { n: 'agnd_cli', l: 'Cliente (id)', v: '401' },
        { n: 'agnd_ser', l: 'Serviço (id)', v: '402' } ] }
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
            a.campos.forEach((c, j) => {
                const v = el('f_' + idx + '_' + j).value;
                if (c.opcional && v === '') return;
                dados[c.n] = v;
            });
            enviar(dados, a.rota).then(mostrar);
        });
    });
}

/* ---------- bateria de testes ---------- */
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Cliente Um', '2': 'Cliente Dois', '3': 'Ana', '4': 'Carla', '5': 'Bruno', '6': 'Clínica' };

/* Calendário esperado de MostrarDias: dias de trabalho (0=dom..6=sáb), folgas e dias extras (AAAA-MM-DD) */
function calendario(ano, mes, trabalha, folgas, extras) {
    const total = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
    const r = { disponivel: [], folga: [], indisponivel: [] };
    for (let d = 1; d <= total; d++) {
        const iso = ano + '-' + String(mes).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const dow = new Date(Date.UTC(ano, mes - 1, d)).getUTCDay();
        if (folgas.includes(iso)) r.folga.push(iso);
        else if (extras.includes(iso) || trabalha.includes(dow)) r.disponivel.push(iso);
        else r.indisponivel.push(iso);
    }
    return r;
}

function criarTestes() {
    const ts = String(Date.now());
    const nomeAna = 'TSB Novo ' + ts.slice(-6);
    const nomeClin = 'TSB Clin ' + ts.slice(-6);
    const S = { nenhuma: '0', um: '1', dois: '2', ana: '3', carla: '4', bruno: '5', clinica: '6' };

    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? j?.msg ?? '');
    const tam = (j, k) => Array.isArray(j?.[k]) ? j[k].length : -1;
    const txt = r => r.texto.trim();
    /* sucesso do agendar/reagendar/cancelar: texto "sucesso" ou JSON sucesso: true */
    const okTxt = (j, r) => txt(r) === 'sucesso' || j?.sucesso === true;
    /* recusa controlada: resposta não vazia, sem sucesso e sem erro fatal do PHP */
    const recusou = (j, r) => {
        const t = txt(r);
        return t !== '' && !/sucesso\s*$/i.test(t) && j?.sucesso !== true && !/fatal error|stack trace|too few arguments/i.test(t);
    };
    /* os valores de "campo" em j.dados são exatamente "esperados" (sem importar a ordem) */
    const idsDe = (j, campo, esperados) => {
        if (!sucesso(j) || !Array.isArray(j.dados) || j.dados.length !== esperados.length) return false;
        return JSON.stringify(j.dados.map(r => String(r[campo])).sort()) === JSON.stringify(esperados.map(String).sort());
    };
    const semCampos = (r, lista) => !!r && lista.every(c => !(c in r));
    const lista = j => Array.isArray(j) ? j : (j && typeof j === 'object' ? Object.values(j) : null);
    const inicios = (j, esperados) => {
        const l = lista(j);
        return !!l && JSON.stringify(l.map(s => s.inicio)) === JSON.stringify(esperados);
    };
    const semVagas = j => Array.isArray(j) && j.length === 0;
    const igualCal = (j, esp) => ['disponivel', 'folga', 'indisponivel'].every(k => Array.isArray(j?.[k]) && JSON.stringify(j[k]) === JSON.stringify(esp[k]));

    /* horários esperados */
    const dia14 = ['08:00', '08:50', '09:40', '10:30', '11:20', '12:10', '13:00', '13:50', '14:40', '15:30', '16:20', '17:10'];
    const dia07 = ['08:00', '08:50', '11:20', '12:10', '13:00', '13:50', '14:40', '15:30', '16:20', '17:10']; // sem 09:40 e 10:30 (consulta 10:00-10:40)
    const dia05 = ['09:00', '09:50', '10:40', '11:30'];                 // sábado extra 09:00-13:00
    const bruno = ['09:00', '09:40', '10:20', '11:00'];                 // quinta 09:00-12:00, 30+10 min
    const baseHorario = { acao: 'mostrarhorario', ser_dur: '40', ser_inter: '10', agnd_pro: '411' };
    const novoServ = { tipo: 'tsb-novo', desc: 'Serviço criado pelo teste', dur: '30', inter: '10', val: '55.5', dia: '1', loc: '442' };
    const pedidoCancelar = (agnd, cli) => ({ acao: 'cancelar', agnd_pro: '411', agnd_clin: '421', agnd_id: agnd, agnd_cli: cli, agnd_ser: '402' });

    return [
        /* ================= buscacontroller ================= */
        { grupo: 'busca: serviço', n: 'termo "TSB" (o serviço inativo 404 fica de fora)', sessao: S.um, rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: 'TSB' }, esp: 'sucesso, serviços 401, 402, 403 e 405',
          ok: j => idsDe(j, 'ser_id', [401, 402, 403, 405]) },
        { n: 'termo parcial e em minúsculas ("tsb podolog")', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: 'tsb podolog' }, esp: 'sucesso, só o serviço 401',
          ok: j => idsDe(j, 'ser_id', [401]) && Number(j.dados[0].ser_val) === 80 },
        { n: 'busca pelo tipo do serviço ("tsb-pes")', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: 'tsb-pes' }, esp: 'sucesso, serviços 401 e 405 (o inativo 404 tem o mesmo tipo e fica de fora)',
          ok: j => idsDe(j, 'ser_id', [401, 405]) },
        { n: 'termo "TSB" com valor 80', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: 'TSB', valor: '80' }, esp: 'sucesso, só o serviço 401 (R$ 80)',
          ok: j => idsDe(j, 'ser_id', [401]) },
        { n: 'termo "TSB" com valor 120', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: 'TSB', valor: '120' }, esp: 'sucesso, só o serviço 402 (R$ 120)',
          ok: j => idsDe(j, 'ser_id', [402]) },
        { n: 'termo "TSB" com valor que ninguém cobra (999)', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: 'TSB', valor: '999' }, esp: 'sucesso, dados vazio',
          ok: j => sucesso(j) && tam(j, 'dados') === 0 },
        { n: 'termo que não existe', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: 'tsb-nada-existe' }, esp: 'sucesso, dados vazio',
          ok: j => sucesso(j) && tam(j, 'dados') === 0 },

        { grupo: 'busca: profissional e clínica', n: 'profissionais "TSB"', rota: 'busca',
          req: { acao: 'busca', tipo: 'profissional', busca: 'TSB' }, esp: 'sucesso, profissionais 411, 412 e 413',
          ok: j => idsDe(j, 'pro_id', [411, 412, 413]) },
        { n: 'profissional "tsb ana" (sem dados privados)', rota: 'busca',
          req: { acao: 'busca', tipo: 'profissional', busca: 'tsb ana' }, esp: 'sucesso, só a 411, sem senha, e-mail, CPF nem código',
          ok: j => idsDe(j, 'pro_id', [411]) && semCampos(j.dados[0], ['pro_senha', 'pro_email', 'pro_CPF', 'pro_codVali']) },
        { n: 'clínica "TSB Clínica" (sem dados privados)', rota: 'busca',
          req: { acao: 'busca', tipo: 'clinica', busca: 'TSB Clínica' }, esp: 'sucesso, só a 421, sem senha, e-mail, CNPJ nem código',
          ok: j => idsDe(j, 'clin_id', [421]) && semCampos(j.dados[0], ['clin_senha', 'clin_email', 'clin_cnpj', 'clin_codVali']) },
        { n: 'tipo inválido', rota: 'busca',
          req: { acao: 'busca', tipo: 'xyz', busca: 'TSB' }, esp: 'resposta de erro controlada (sem erro fatal do PHP)', ok: recusou },
        { n: 'requisição sem ação', rota: 'busca',
          req: { tipo: 'servico', busca: 'TSB' }, esp: 'mensagem de que a ação não foi enviada', ok: recusou },

        { grupo: 'mostrardetalhes', n: 'profissional 411 (sem dados privados)', rota: 'busca',
          req: { acao: 'mostrardetalhes', tipo: 'profissional', id: '411' }, esp: 'sucesso, 1 linha com nome, bio e telefone, sem senha, e-mail, CPF nem código',
          ok: j => sucesso(j) && tam(j, 'dados') === 1 && String(j.dados[0].pro_nome).startsWith('TSB Ana') && 'pro_bio' in j.dados[0] && 'pro_tel' in j.dados[0]
              && semCampos(j.dados[0], ['pro_senha', 'pro_email', 'pro_CPF', 'pro_codVali']) },
        { n: 'clínica 421 (sem dados privados)', rota: 'busca',
          req: { acao: 'mostrardetalhes', tipo: 'clinica', id: '421' }, esp: 'sucesso, 1 linha com nome, CEP e telefone, sem senha, e-mail, CNPJ nem código',
          ok: j => sucesso(j) && tam(j, 'dados') === 1 && String(j.dados[0].clin_nome).startsWith('TSB Cl') && 'clin_cep' in j.dados[0] && 'clin_tel' in j.dados[0]
              && semCampos(j.dados[0], ['clin_senha', 'clin_email', 'clin_cnpj', 'clin_codVali']) },
        { n: 'serviço 401', rota: 'busca',
          req: { acao: 'mostrardetalhes', tipo: 'servico', id: '401' }, esp: 'sucesso, 1 linha: serviço 401, R$ 80',
          ok: j => sucesso(j) && tam(j, 'dados') === 1 && String(j.dados[0].ser_id) === '401' && Number(j.dados[0].ser_val) === 80 },
        { n: 'sessão guarda o serviço 401 (profissional, duração, intervalo e local)', req: { acao: 'ver_sessao' },
          esp: 'sessão.servico com ser_id 401, ser_pro 411, ser_dur 40, ser_inter 10, ser_loc 442',
          ok: j => !!j?.servico && String(j.servico.ser_id) === '401' && String(j.servico.ser_pro) === '411' && String(j.servico.ser_dur) === '40'
              && String(j.servico.ser_inter) === '10' && String(j.servico.ser_loc) === '442' },
        { n: 'serviço 402 (da clínica)', rota: 'busca',
          req: { acao: 'mostrardetalhes', tipo: 'servico', id: '402' }, esp: 'sucesso, 1 linha: serviço 402',
          ok: j => sucesso(j) && tam(j, 'dados') === 1 && String(j.dados[0].ser_id) === '402' },
        { n: 'sessão guarda a clínica do serviço 402 (o agendar usa para checar permissão)', req: { acao: 'ver_sessao' },
          esp: 'sessão.servico com ser_clin 421', ok: j => String(j?.servico?.ser_clin) === '421' },
        { n: 'serviço inativo (404)', rota: 'busca',
          req: { acao: 'mostrardetalhes', tipo: 'servico', id: '404' }, esp: 'não devolve o serviço inativo',
          ok: j => !(sucesso(j) && tam(j, 'dados') > 0) },
        { n: 'id que não existe', rota: 'busca',
          req: { acao: 'mostrardetalhes', tipo: 'servico', id: '999999' }, esp: 'dados vazio (ou sucesso: false)',
          ok: j => !(sucesso(j) && tam(j, 'dados') > 0) },

        /* ================= Servicocontroller ================= */
        { grupo: 'cadastrar serviço (e achar na busca)', n: 'Ana cadastra um serviço', sessao: S.ana,
          req: { acao: 'cadastrar', nome: nomeAna, ...novoServ }, esp: 'resposta "sucesso"', ok: okTxt },
        { n: 'busca encontra o serviço da Ana', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: nomeAna }, esp: '1 resultado, do profissional 411, R$ 55,50',
          ok: j => idsDe(j, 'ser_nome', [nomeAna]) && String(j.dados[0].ser_pro) === '411' && Number(j.dados[0].ser_val) === 55.5 },
        { n: 'a clínica cadastra um serviço', sessao: S.clinica,
          req: { acao: 'cadastrar', nome: nomeClin, ...novoServ }, esp: 'resposta "sucesso" (o profissional do serviço deve ficar nulo)', ok: okTxt },
        { n: 'busca encontra o serviço da clínica', rota: 'busca',
          req: { acao: 'busca', tipo: 'servico', busca: nomeClin }, esp: '1 resultado, da clínica 421, sem profissional (ser_pro nulo)',
          ok: j => idsDe(j, 'ser_nome', [nomeClin]) && String(j.dados[0].ser_clin) === '421' && j.dados[0].ser_pro === null },
        { n: 'cliente tenta cadastrar serviço', sessao: S.um,
          req: { acao: 'cadastrar', nome: 'TSB Cliente ' + ts.slice(-6), ...novoServ }, esp: 'recusa (só profissional e clínica cadastram)', ok: recusou },
        { n: 'sem login tenta cadastrar serviço', sessao: S.nenhuma, aceitaAviso: true,
          req: { acao: 'cadastrar', nome: 'TSB Anonimo ' + ts.slice(-6), ...novoServ }, esp: 'recusa', ok: recusou },

        { grupo: 'MostrarDias', n: 'Ana em dez/2026 (profissional enviado no POST)', sessao: S.um,
          req: { acao: 'MostrarDias', mes: '12', ano: '2026', ser_id: '401', agnd_pro: '411' },
          esp: 'seg/ter/qua disponíveis, 02/12 folga, 05/12 (sábado extra) disponível, o resto indisponível',
          ok: j => igualCal(j, calendario(2026, 12, [1, 2, 3], ['2026-12-02'], ['2026-12-05'])) },
        { n: 'serviço da sessão vale mais que o profissional do POST', sessao: S.um, servico: 'ser401',
          req: { acao: 'MostrarDias', mes: '12', ano: '2026', agnd_pro: '412' },
          esp: 'calendário da Ana (profissional do serviço), não do Bruno',
          ok: j => igualCal(j, calendario(2026, 12, [1, 2, 3], ['2026-12-02'], ['2026-12-05'])) },
        { n: 'Bruno em dez/2026 (só quintas)', sessao: S.um,
          req: { acao: 'MostrarDias', mes: '12', ano: '2026', ser_id: '403', agnd_pro: '412' },
          esp: 'só as quintas (3, 10, 17, 24, 31) disponíveis',
          ok: j => igualCal(j, calendario(2026, 12, [4], [], [])) },
        { n: 'Carla em dez/2026 (sem horário de trabalho)', sessao: S.um,
          req: { acao: 'MostrarDias', mes: '12', ano: '2026', ser_id: '405', agnd_pro: '413' },
          esp: 'todos os dias indisponíveis',
          ok: j => igualCal(j, calendario(2026, 12, [], [], [])) },
        { n: 'sem mês (usa o mês atual)', sessao: S.um,
          req: { acao: 'MostrarDias', ser_id: '401', agnd_pro: '411' },
          esp: 'JSON com disponivel, folga e indisponivel cobrindo todos os dias do mês atual, sem warning do PHP',
          ok: j => { const h = new Date(); const dias = new Date(h.getFullYear(), h.getMonth() + 1, 0).getDate();
              return ['disponivel', 'folga', 'indisponivel'].every(k => Array.isArray(j?.[k])) && j.disponivel.length + j.folga.length + j.indisponivel.length === dias; } },

        { grupo: 'mostrarhorario', n: 'Ana, segunda 14/12 sem consultas', sessao: S.um,
          req: { ...baseHorario, dia: '2026-12-14' }, esp: '12 horários de 50 min, de 08:00 a 17:10',
          ok: j => inicios(j, dia14) && lista(j)[11].termino === '18:00' },
        { n: 'Ana, segunda 07/12 (consulta 10:00-10:40)', sessao: S.um,
          req: { ...baseHorario, dia: '2026-12-07' }, esp: '10 horários: sem 09:40 e 10:30, que batem com a consulta',
          ok: j => inicios(j, dia07) },
        { n: 'mesmo dia: a resposta é uma lista JSON (array), não um objeto', sessao: S.um,
          req: { ...baseHorario, dia: '2026-12-07' }, esp: 'array JSON (o array_filter mantém as chaves e vira objeto)', ok: j => Array.isArray(j) },
        { n: 'dia de folga da Ana (02/12)', sessao: S.um,
          req: { ...baseHorario, dia: '2026-12-02' }, esp: 'lista vazia (folga total)', ok: semVagas },
        { n: 'dia extra da Ana (sábado 05/12, 09:00-13:00)', sessao: S.um,
          req: { ...baseHorario, dia: '2026-12-05' }, esp: '4 horários: 09:00, 09:50, 10:40 e 11:30', ok: j => inicios(j, dia05) },
        { n: 'dia sem expediente (domingo 06/12)', sessao: S.um, aceitaAviso: true,
          req: { ...baseHorario, dia: '2026-12-06' }, esp: 'lista vazia', ok: semVagas },
        { n: 'Bruno pela sessão (quinta 03/12, 30+10 min), sem duração/profissional no POST', sessao: S.um, servico: 'ser403',
          req: { acao: 'mostrarhorario', dia: '2026-12-03' }, esp: '4 horários: 09:00, 09:40, 10:20 e 11:00', ok: j => inicios(j, bruno) },
        { n: 'sessão guarda o dia escolhido', req: { acao: 'ver_sessao' }, esp: 'sessão.datas = 2026-12-03 (o mostrarSala usa)',
          ok: j => String(j?.datas) === '2026-12-03' },

        { grupo: 'mostrarSala (continua o fluxo do serviço 402, na clínica)', n: 'horários do dia 07/12 pelo serviço 402', sessao: S.um, servico: 'ser402',
          req: { acao: 'mostrarhorario', dia: '2026-12-07' }, esp: 'mesmos 10 horários da Ana nesse dia', ok: j => inicios(j, dia07) },
        { n: 'sala ocupada às 10:30-11:20 (a 441 tem consulta 10:00-10:40)',
          req: { acao: 'mostrarSala', inicio: '10:30', termino: '11:20' }, esp: 'sucesso, só a sala 442 livre',
          ok: j => idsDe(j, 'sala_id', [442]) },
        { n: 'nenhuma sala ocupada às 08:00-08:50',
          req: { acao: 'mostrarSala', inicio: '08:00', termino: '08:50' }, esp: 'sucesso, salas 441 e 442',
          ok: j => idsDe(j, 'sala_id', [441, 442]) },
        { n: 'consulta encostada (10:40-11:30) não bloqueia a sala',
          req: { acao: 'mostrarSala', inicio: '10:40', termino: '11:30' }, esp: 'sucesso, salas 441 e 442',
          ok: j => idsDe(j, 'sala_id', [441, 442]) },
        { n: 'serviço autônomo 401: horários de 14/12', sessao: S.um, servico: 'ser401',
          req: { acao: 'mostrarhorario', dia: '2026-12-14' }, esp: '12 horários da Ana', ok: j => inicios(j, dia14) },
        { n: 'serviço autônomo 401: sala do consultório', req: { acao: 'mostrarSala', inicio: '08:00', termino: '08:50' },
          esp: 'sucesso, só a sala 443 (consultório da Ana)', ok: j => idsDe(j, 'sala_id', [443]) },

        { grupo: 'agendar', n: 'Carla (sem permissão de agendar) no serviço da clínica', sessao: S.carla, servico: 'ser405',
          req: { acao: 'agendar', sala: '441', dia: '2026-12-14', inicio: '08:00', termino: '08:50' },
          esp: 'sucesso: false, "permissão negada"', ok: j => falha(j) && /permiss/i.test(msg(j)) },
        { n: 'Bruno (sem vínculo com a clínica) no serviço da clínica', sessao: S.bruno, servico: 'ser402',
          req: { acao: 'agendar', sala: '441', dia: '2026-12-14', inicio: '08:00', termino: '08:50' },
          esp: 'sucesso: false, "não vinculado à clínica"', ok: j => falha(j) && /vinculad/i.test(msg(j)) },
        { n: 'sem login, sem serviço na sessão', sessao: S.nenhuma, aceitaAviso: true,
          req: { acao: 'agendar', sala: '443', dia: '2026-12-14', inicio: '08:00', termino: '08:50' },
          esp: 'recusa (sem usuário não agenda)', ok: recusou },
        { n: 'cliente 401 agenda o serviço autônomo 401', sessao: S.um, servico: 'ser401',
          req: { acao: 'agendar', sala: '443', dia: '2026-12-14', inicio: '08:00', termino: '08:50' },
          esp: 'resposta "sucesso" (cria a consulta como "esperando" e avisa o profissional)', ok: okTxt },
        { n: 'cliente 402 agenda o serviço 402 da clínica', sessao: S.dois, servico: 'ser402',
          req: { acao: 'agendar', sala: '441', dia: '2026-12-15', inicio: '08:00', termino: '08:50' },
          esp: 'resposta "sucesso" (a consulta deve guardar a clínica 421: confira no banco)', ok: okTxt },
        { n: 'Ana (com permissão) agenda o serviço 402 sem cliente', sessao: S.ana, servico: 'ser402',
          req: { acao: 'agendar', sala: '442', dia: '2026-12-15', inicio: '10:00', termino: '10:50' },
          esp: 'resposta "sucesso" (agenda feita pelo profissional, sem cliente)', ok: okTxt },
        { n: 'horário e sala já ocupados (sala 441, 07/12 10:00-10:40)', sessao: S.dois, servico: 'ser402',
          req: { acao: 'agendar', sala: '441', dia: '2026-12-07', inicio: '10:00', termino: '10:40' },
          esp: 'recusa (a mesma sala não pode ter duas consultas no mesmo horário)', ok: recusou },

        { grupo: 'reagendar', n: 'Carla (sem permissão de reagendar)', sessao: S.carla, servico: 'ser405',
          req: { acao: 'reagendar', agnd_id: '404', agnd_pro: '411', ser_id: '402', sala: '442', dia: '2026-12-18', inicio: '08:00', termino: '08:50' },
          esp: 'sucesso: false, "permissão negada"', ok: j => falha(j) && /permiss/i.test(msg(j)) },
        { n: 'sem login tenta reagendar a consulta 406', sessao: S.nenhuma, aceitaAviso: true,
          req: { acao: 'reagendar', agnd_id: '406', agnd_pro: '411', ser_id: '401', sala: '443', dia: '2026-12-17', inicio: '08:00', termino: '08:50' },
          esp: 'recusa', ok: recusou },
        { n: 'cliente 401 tenta reagendar a consulta do cliente 402 (406)', sessao: S.um, servico: 'ser401',
          req: { acao: 'reagendar', agnd_id: '406', agnd_pro: '411', ser_id: '401', sala: '443', dia: '2026-12-17', inicio: '08:00', termino: '08:50' },
          esp: 'recusa (só o dono da consulta ou o profissional mexe nela)', ok: recusou },
        { n: 'cliente 402 reagenda a própria consulta (402)', sessao: S.dois, servico: 'ser401',
          req: { acao: 'reagendar', agnd_id: '402', agnd_pro: '411', ser_id: '401', sala: '443', dia: '2026-12-14', inicio: '09:00', termino: '09:50' },
          esp: 'resposta "sucesso"', ok: okTxt },
        { n: 'Ana (com permissão) reagenda a consulta 405', sessao: S.ana, servico: 'ser402',
          req: { acao: 'reagendar', agnd_id: '405', agnd_pro: '411', ser_id: '402', sala: '441', dia: '2026-12-14', inicio: '13:00', termino: '13:50' },
          esp: 'resposta "sucesso" (o cliente 401 da consulta deve continuar nela: confira no banco)', ok: okTxt },

        { grupo: 'cancelar', n: 'Carla (sem permissão de cancelar)', sessao: S.carla, servico: 'ser405',
          req: pedidoCancelar('404', '402'), esp: 'sucesso: false, "permissão negada"', ok: j => falha(j) && /permiss/i.test(msg(j)) },
        { n: 'Ana (com permissão) cancela a consulta 404', sessao: S.ana, servico: 'ser402',
          req: pedidoCancelar('404', '402'), esp: 'sucesso (a consulta sai da agenda e vira atendimento "desmarcado")', ok: okTxt },
        { n: 'cliente 401 cancela a própria consulta 403', sessao: S.um, servico: '',
          req: pedidoCancelar('403', '401'), esp: 'sucesso (a consulta sai da agenda e vira atendimento "desmarcado")', ok: okTxt },

        { grupo: 'Ação inválida', n: 'ação inexistente no Servicocontroller', sessao: S.um,
          req: { acao: 'nao_existe' }, esp: 'resposta vazia ou sucesso: false (o switch não tem default)', ok: (j, r) => txt(r) === '' || falha(j) }
    ];
}

function resumo(res) {
    if (!res.json) {
        const limpo = (res.texto || '(resposta vazia)').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return 'sem JSON: ' + limpo.slice(0, 200);
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
            await montarSessao(t.sessao, t.servico ?? '');
            sessaoAtual = ROTULO_SESSAO[t.sessao] + (t.servico ? ' + serviço ' + t.servico.replace('ser', '') : '');
        }
        const res = await enviar(t.req, t.rota);
        let ok = false;
        try { ok = !!t.ok(res.json, res) && (t.aceitaAviso || !(res.json && res.json.__sujo)); } catch (e) { ok = false; }
        if (ok) passou++;
        brutos.push({ teste: t.n, rota: t.rota || 'servico', enviado: t.req, status: res.status, resposta: res.json ?? res.texto });

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