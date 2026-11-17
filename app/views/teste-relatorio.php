<?php
/*
 * PÁGINA DE TESTE - busca / gerenciarPro
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer clínica).
 *
 * Esta página só monta/mostra a sessão (definir, limpar, ver_sessao).
 * A ação 'gerenciarPro' é enviada para a rota "busca" do Router. A rota é calculada
 * no JS trocando o último trecho da URL por "busca" e pode ser corrigida no campo de endpoint.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    $acao = $_POST['acao'] ?? '';
    
    if ($acao === 'limpar') {
        unset($_SESSION['usuario']);
        echo json_encode(['sucesso' => true, 'sessao' => ['usuario' => $_SESSION['usuario'] ?? null]]);
        exit;
    }
    if ($acao === 'definir') {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) { echo json_encode(['sucesso' => false, 'erro' => 'id inválido']); exit; }
        $_SESSION['usuario'] = [
            'idUsuario'   => $id,
            'nome'        => 'Clínica Teste ' . $id,
            'email'       => 'clinica' . $id . '@teste.com',
            'tipoUsuario' => 'clinica'
        ];
        echo json_encode(['sucesso' => true, 'sessao' => ['usuario' => $_SESSION['usuario']]]);
        exit;
    }
    if ($acao === 'ver_sessao') {
        echo json_encode(['sucesso' => true, 'sessao' => ['usuario' => $_SESSION['usuario'] ?? null]]);
        exit;
    }
    // Qualquer outra ação não é desta página: ela deve ir para o endpoint (busca).
    echo json_encode(['sucesso' => false, 'erro' => 'ação inválida nesta página (use o endpoint "busca" para gerenciarPro)']);
    exit;
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste - busca / gerenciarPro</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 24px auto; padding: 0 16px; }
  fieldset { margin-bottom: 16px; border: 1px solid #ccc; border-radius: 6px; }
  label { display: block; margin: 6px 0; font-size: 14px; }
  input { padding: 4px 6px; margin-left: 6px; }
  button { padding: 6px 12px; margin-right: 6px; cursor: pointer; }
  table { border-collapse: collapse; width: 100%; margin-top: 8px; font-size: 14px; }
  th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
  pre { background: #f4f4f4; padding: 10px; overflow: auto; max-height: 300px; }
  .ok { color: #0a7a2f; font-weight: bold; } .erro { color: #b00020; font-weight: bold; }
</style>
</head>
<body>
<h1>Teste: busca → gerenciarPro</h1>

<details>
  <summary><b>0. Inserts SQL (rode no banco antes)</b></summary>
  <button id="btnCopiar">Copiar SQL</button>
<pre id="sql">use dbelmo;

insert into clinica (clin_id, clin_nome, clin_email, clin_user, clin_senha, clin_bio, clin_foto, clin_stat, clin_cnpj, clin_cep, clin_tel) values
(900, 'Clínica Teste A', 'clinica.a@teste.com', 'clinica_a', 'x', 'Bio clínica A', 'clinA.png', 'ativo', '11111111000191', '07000000', '11911111111'),
(901, 'Clínica Teste B', 'clinica.b@teste.com', 'clinica_b', 'x', 'Bio clínica B', 'clinB.png', 'ativo', '22222222000191', '07000001', '11922222222');

insert into profissional (pro_id, pro_nome, pro_email, pro_user, pro_senha, pro_bio, pro_foto, pro_dtNasc, pro_stat, pro_CPF, pro_CEP, pro_tel, pro_gen) values
(901, 'Ana Podóloga',   'ana@teste.com',   'ana_pod',   'x', 'Bio Ana',   'ana.png',   '1990-05-10', 'ativo', '90000000001', '07000000', '11933333331', 'F'),
(902, 'Bruno Podólogo', 'bruno@teste.com', 'bruno_pod', 'x', 'Bio Bruno', 'bruno.png', '1988-03-22', 'ativo', '90000000002', '07000000', '11933333332', 'M'),
(903, 'Carla Podóloga', 'carla@teste.com', 'carla_pod', 'x', 'Bio Carla', 'carla.png', '1995-11-01', 'ativo', '90000000003', '07000000', '11933333333', 'F'),
(904, 'Diego Podólogo', 'diego@teste.com', 'diego_pod', 'x', 'Bio Diego', 'diego.png', '1992-07-15', 'ativo', '90000000004', '07000001', '11933333334', 'M');

insert into profissional_clinica (pc_id, pc_pro, pc_clin) values
(9001, 901, 900),
(9002, 902, 900),
(9003, 903, 900),
(9004, 902, 901),  -- Bruno está nas duas clínicas
(9005, 904, 901);  -- Diego só na B (não deve aparecer para a 900)

-- Esperado clínica 900: pro_id 901, 902, 903
-- Esperado clínica 901: pro_id 902, 904

-- LIMPEZA (quando terminar):
-- delete from profissional_clinica where pc_id between 9001 and 9005;
-- delete from profissional where pro_id between 901 and 904;
-- delete from clinica where clin_id in (900, 901);</pre>
</details>

<fieldset>
  <legend>Configuração</legend>
  <label>URI do endpoint (rota "busca"): <input id="endpoint" size="40"></label>
  <small>Se a rota do seu Router for outra, corrija aqui (ex: /projetopsi/busca).</small>
  <label>ID da clínica (sessão): <input id="idClinica" type="number" value="900"></label>
  <label>IDs de profissionais esperados (vírgula): <input id="esperados" value="901,902,903" size="30"></label>
</fieldset>

<button id="btnSessao">1. Definir sessão</button>
<button id="btnVer">Ver sessão</button>
<button id="btnTestar">2. Testar gerenciarPro</button>
<button id="btnLimpar">Limpar sessão</button>

<h3>Resultado</h3>
<div id="veredito"></div>
<div id="tabela"></div>
<h3>Resposta bruta</h3>
<pre id="saida">—</pre>

<script>
const $ = (id) => document.getElementById(id);

/* Troca o último trecho da URL (ex: /projetopsi/teste-relatorio.php -> /projetopsi/busca) */
$('endpoint').value = location.pathname.replace(/[^\/]*\/?$/, 'busca');
const ENDPOINT_PAGINA = location.pathname; // definir, limpar e ver_sessao ficam nesta página

/* Lê o JSON. Se o PHP soltou warning/notice antes do JSON, lê mesmo assim mas marca como "sujo". */
function lerJson(texto) {
  try { return JSON.parse(texto); } catch (e) {}
  const i = texto.search(/[\[{]/);
  if (i > 0) {
    try {
      const j = JSON.parse(texto.slice(i));
      if (j && typeof j === 'object') Object.defineProperty(j, '__sujo', { value: true });
      return j;
    } catch (e) {}
  }
  return null;
}

/* Envia como FormData (igual ao teste-profissional) */
async function enviar(dados, paraPagina = false) {
  const fd = new FormData();
  for (const k in dados) fd.append(k, dados[k]);
  const url = paraPagina ? ENDPOINT_PAGINA : $('endpoint').value.trim();
  try {
    const res = await fetch(url, { method: 'POST', body: fd, credentials: 'same-origin' });
    const texto = await res.text();
    return { status: res.status, texto, json: lerJson(texto) };
  } catch (e) {
    return { status: 0, texto: 'Falha de rede: ' + e.message, json: null };
  }
}

function mostrarBruto(r) {
  const sujo = r.json && r.json.__sujo ? '  (⚠ texto fora do JSON: warning/notice do PHP)' : '';
  $('saida').textContent = `HTTP ${r.status}${sujo}\n\n` + (r.json ? JSON.stringify(r.json, null, 2) : (r.texto || '(resposta vazia)'));
}

function desenharTabela(linhas) {
  const div = $('tabela');
  div.textContent = '';
  if (!linhas || !linhas.length) { div.textContent = 'Nenhum registro retornado.'; return; }
  const cols = Object.keys(linhas[0]);
  const table = document.createElement('table');
  const head = table.createTHead().insertRow();
  cols.forEach(c => { const th = document.createElement('th'); th.textContent = c; head.appendChild(th); });
  const body = table.createTBody();
  linhas.forEach(l => {
    const tr = body.insertRow();
    cols.forEach(c => { tr.insertCell().textContent = l[c] ?? ''; });
  });
  div.appendChild(table);
}

function veredito(texto, ok) {
  const p = document.createElement('p');
  p.className = ok ? 'ok' : 'erro';
  p.textContent = texto;
  $('veredito').textContent = '';
  $('veredito').appendChild(p);
}

$('btnCopiar').onclick = () => navigator.clipboard.writeText($('sql').textContent);

$('btnSessao').onclick = async () => {
  const r = await enviar({ acao: 'definir', id: $('idClinica').value }, true);
  mostrarBruto(r);
  veredito(r.json?.sucesso ? 'Sessão definida' : 'Falha ao definir sessão', !!r.json?.sucesso);
};

$('btnVer').onclick = async () => {
  const r = await enviar({ acao: 'ver_sessao' }, true);
  mostrarBruto(r);
};

$('btnLimpar').onclick = async () => {
  const r = await enviar({ acao: 'limpar' }, true);
  mostrarBruto(r);
  veredito('Sessão limpa', true);
};

$('btnTestar').onclick = async () => {
  // Envia a ação 'gerenciarPro' para a rota "busca"
  const r = await enviar({ acao: 'permisaopro', tipo: 'profissional' });
  mostrarBruto(r);

  if (!r.json) { veredito('Resposta não é JSON (veja a resposta bruta: provável erro/warning PHP ou rota errada)', false); desenharTabela([]); return; }
  if (!r.json.sucesso) { veredito('Retornou erro: ' + (r.json.erro ?? r.json.mensagem ?? '?'), false); desenharTabela([]); return; }

  desenharTabela(r.json.dados);
  const esperados = $('esperados').value.split(',').map(s => s.trim()).filter(Boolean).sort();
  const recebidos = (r.json.dados || []).map(d => String(d.pro_id)).sort();
  const igual = JSON.stringify(esperados) === JSON.stringify(recebidos);
  const sujo = r.json.__sujo ? ' (⚠ mas o PHP soltou texto fora do JSON)' : '';
  veredito(igual ? `OK: retornou exatamente [${recebidos}]${sujo}`
                 : `DIFERENTE: esperado [${esperados}] / recebido [${recebidos}]${sujo}`, igual && !r.json.__sujo);
};
</script>
</body>
</html>