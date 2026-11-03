<?php
/*
 * PÁGINA DE TESTE - relatório (quantidade + ganhos)
 * Use só em ambiente de desenvolvimento. Apague antes de publicar.
 *
 * Esta página só monta/mostra a sessão. As ações (quantidade, ganho) são enviadas para a rota
 * "relatorio" do Router, que chama o relatoriocontroller.
 * A rota é calculada no JS (ENDPOINT_RELATORIO), trocando o último trecho da URL por "relatorio".
 *
 * Os cenários e os valores esperados batem com o inserts_relatorio.sql
 * (rode antes o inserts_teste.sql e depois o inserts_relatorio.sql).
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria na sessão + resultados esperados (data de referência 2026-11-03) */
$cenarios = [
    '1' => [
        'nome'    => 'Profissional Ana (id 1)',
        'usuario' => ['idUsuario' => 1, 'tipoUsuario' => 'profissional'],
        'esperado' => ['quantidade' => [6, 1, 1], 'diario' => 250, 'semanal' => 400, 'mensal' => 400, 'anual' => 600],
    ],
    '2' => [
        'nome'    => 'Profissional Bruno (id 2)',
        'usuario' => ['idUsuario' => 2, 'tipoUsuario' => 'profissional'],
        'esperado' => ['quantidade' => [1, 0, 1], 'diario' => 80, 'semanal' => 80, 'mensal' => 80, 'anual' => 80],
    ],
    '3' => [
        'nome'    => 'Clínica Alfa (id 1)',
        'usuario' => ['idUsuario' => 1, 'tipoUsuario' => 'clinica'],
        'esperado' => ['quantidade' => [3, 0, 1], 'diario' => 230, 'semanal' => 380, 'mensal' => 380, 'anual' => 380],
    ],
    '4' => [
        'nome'    => 'Clínica Beta (id 2) - sem ganhos (SUM retorna NULL)',
        'usuario' => ['idUsuario' => 2, 'tipoUsuario' => 'clinica'],
        'esperado' => ['quantidade' => [0, 1, 0], 'diario' => 0, 'semanal' => 0, 'mensal' => 0, 'anual' => 0],
    ],
    '5' => [
        'nome'    => 'ID inválido (0) → deve dar erro "ID inválido"',
        'usuario' => ['idUsuario' => 0, 'tipoUsuario' => 'profissional'],
        'esperado' => null,
    ],
    '6' => [
        'nome'    => 'Tipo "cliente" → deve dar erro "Usuário inválido"',
        'usuario' => ['idUsuario' => 1, 'tipoUsuario' => 'cliente'],
        'esperado' => null,
    ],
];

/* Monta a sessão do cenário escolhido */
if (($_POST['acao'] ?? '') === 'setup_teste') {
    header('Content-Type: application/json; charset=utf-8');
    $c = $cenarios[$_POST['cenario'] ?? ''] ?? null;
    if (!$c) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'cenário inválido']);
        exit;
    }
    $_SESSION['usuario'] = $c['usuario'];
    echo json_encode(['sucesso' => true, 'sessao' => ['usuario' => $c['usuario']], 'esperado' => $c['esperado']]);
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
<title>Teste relatório</title>
<style>
    body { font-family: system-ui, sans-serif; max-width: 860px; margin: 24px auto; padding: 0 16px; color: #222; }
    h1 { font-size: 1.3rem; }
    fieldset { margin: 16px 0; border: 1px solid #ccc; border-radius: 8px; }
    legend { font-weight: 600; padding: 0 6px; }
    label { display: inline-block; margin: 4px 12px 4px 0; }
    input, select, button { padding: 6px 8px; font-size: .95rem; }
    button { cursor: pointer; margin: 4px 4px 4px 0; }
    pre { background: #111; color: #d6ffd6; padding: 12px; border-radius: 8px; overflow: auto; min-height: 90px; white-space: pre-wrap; }
    table { border-collapse: collapse; width: 100%; margin-top: 8px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-size: .9rem; }
    .ok { color: #0a7d2c; font-weight: 600; } .erro { color: #b00020; font-weight: 600; }
</style>
</head>
<body>
<h1>Teste do relatório</h1>

<fieldset>
    <legend>1. Cenário (monta a sessão)</legend>
    <select id="cenario">
        <?php foreach ($cenarios as $k => $c): ?>
            <option value="<?= $k ?>"><?= htmlspecialchars($c['nome']) ?></option>
        <?php endforeach; ?>
    </select>
    <button onclick="montarSessao()">Montar sessão</button>
    <button onclick="verSessao()">Ver sessão</button>
</fieldset>

<fieldset>
    <legend>2. Chamadas individuais</legend>
    <button onclick="quantidade()">Quantidade</button><br>
    <label>Período
        <select id="periodo">
            <option value="diario">diario</option>
            <option value="semanal">semanal</option>
            <option value="mensal">mensal</option>
            <option value="anual">anual</option>
        </select>
    </label>
    <label>Data de referência <input id="data" type="date" value="2026-11-03"></label>
    <button onclick="ganho()">Ganhos</button>
</fieldset>

<fieldset>
    <legend>3. Rodar tudo e comparar com o esperado</legend>
    <button onclick="rodarTudo()">Rodar quantidade + 4 períodos</button>
    <div id="veredito"></div>
</fieldset>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão".</pre>

<script>
const saida = document.getElementById('saida');
const veredito = document.getElementById('veredito');

/* Rota do endpoint relatorio: troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/relatorio).
   Se a sua rota for diferente, escreva direto aqui, ex: const ENDPOINT_RELATORIO = '/projetopsi/relatorio'; */
const ENDPOINT_RELATORIO = location.pathname.replace(/[^\/]*\/?$/, 'relatorio');
const ENDPOINT_PAGINA    = location.pathname; // setup_teste e ver_sessao ficam nesta página

let esperado = null; // vem do setup_teste

async function enviar(dados) {
    const fd = new FormData();
    for (const k in dados) fd.append(k, dados[k]);
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const r = await fetch(propria ? ENDPOINT_PAGINA : ENDPOINT_RELATORIO, { method: 'POST', body: fd });
    const texto = await r.text();
    let json = null;
    try { json = JSON.parse(texto); } catch (e) {}
    return { texto, json };
}

function mostrar(res) {
    saida.textContent = res.json ? JSON.stringify(res.json, null, 2) : (res.texto || '(resposta vazia)');
}

/* O controller monta a data de cada período de um jeito:
   mensal -> ano atual + $_POST['data'] + '-01'  (então data = '-MM')
   anual  -> $_POST['data'] + '-01-01'           (então data = 'AAAA')
   demais -> usa a data como veio ('AAAA-MM-DD') */
function dataParaPeriodo(periodo, dataCompleta) {
    if (periodo === 'mensal') return '-' + dataCompleta.slice(5, 7);
    if (periodo === 'anual')  return dataCompleta.slice(0, 4);
    return dataCompleta;
}

async function montarSessao() {
    veredito.textContent = '';
    const res = await enviar({ acao: 'setup_teste', cenario: document.getElementById('cenario').value });
    esperado = res.json ? res.json.esperado : null;
    mostrar(res);
}

async function verSessao() { mostrar(await enviar({ acao: 'ver_sessao' })); }

async function quantidade() { mostrar(await enviar({ acao: 'quantidade' })); }

async function ganho() {
    const periodo = document.getElementById('periodo').value;
    const dataCompleta = document.getElementById('data').value;
    if (!dataCompleta) { alert('Escolha a data.'); return; }
    mostrar(await enviar({ acao: 'ganho', periodo, data: dataParaPeriodo(periodo, dataCompleta) }));
}

function celula(ok, texto) {
    return '<td class="' + (ok ? 'ok' : 'erro') + '">' + texto + '</td>';
}

async function rodarTudo() {
    const dataCompleta = document.getElementById('data').value;
    const usarEsperado = esperado && dataCompleta === '2026-11-03';
    const linhas = [];
    const brutos = {};

    /* quantidade */
    const q = await enviar({ acao: 'quantidade' });
    brutos.quantidade = q.json || q.texto;
    let obtido, ok;
    if (q.json && q.json.sucesso) {
        obtido = [q.json.dados1, q.json.dados2, q.json.dados3];
        ok = usarEsperado ? JSON.stringify(obtido) === JSON.stringify(esperado.quantidade) : null;
    } else {
        obtido = 'erro: ' + ((q.json && q.json.mensagem) || q.texto.slice(0, 120));
        ok = (esperado === null) ? true : false;
    }
    linhas.push(['quantidade (atendido/desmarcado/não comp.)', usarEsperado ? JSON.stringify(esperado.quantidade) : (esperado === null ? 'erro' : '-'), JSON.stringify(obtido), ok]);

    /* ganhos */
    for (const periodo of ['diario', 'semanal', 'mensal', 'anual']) {
        const g = await enviar({ acao: 'ganho', periodo, data: dataParaPeriodo(periodo, dataCompleta) });
        brutos[periodo] = g.json || g.texto;
        let obt, okg;
        if (g.json && g.json.sucesso) {
            const v = Number(g.json.dados ?? 0);
            obt = String(v) + (g.json.dados === null ? ' (NULL)' : '');
            okg = usarEsperado ? v === esperado[periodo] : null;
        } else {
            obt = 'erro: ' + ((g.json && g.json.mensagem) || g.texto.replace(/<[^>]+>/g, ' ').trim().slice(0, 120));
            okg = (esperado === null) ? true : false;
        }
        linhas.push(['ganho ' + periodo, usarEsperado ? String(esperado[periodo]) : (esperado === null ? 'erro' : '-'), obt, okg]);
    }

    let html = '<table><tr><th>Teste</th><th>Esperado</th><th>Obtido</th></tr>';
    for (const [nome, esp, obt, ok] of linhas) {
        html += '<tr><td>' + nome + '</td><td>' + esp + '</td>' + (ok === null ? '<td>' + obt + '</td>' : celula(ok, obt)) + '</tr>';
    }
    html += '</table>';
    if (!usarEsperado && esperado !== null) html += '<p>Sem comparação: use a data 2026-11-03 para comparar com o esperado.</p>';
    veredito.innerHTML = html;
    saida.textContent = JSON.stringify(brutos, null, 2);
}
</script>
</body>
</html>