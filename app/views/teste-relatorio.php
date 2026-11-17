<?php
/*
 * PÁGINA DE TESTE - clinicacontroller / ação "permissao"
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer clínica).
 *
 * Esta página só monta/mostra a sessão (definir, limpar, ver_sessao).
 * A ação 'permissao' é enviada para a rota "clinica" do Router. A rota é calculada
 * no JS trocando o último trecho da URL por "clinica" e pode ser corrigida no campo de endpoint.
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
    // Qualquer outra ação não é desta página: ela deve ir para o endpoint (clinica).
    echo json_encode(['sucesso' => false, 'erro' => 'ação inválida nesta página (use o endpoint "clinica" para a ação permissao)']);
    exit;
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste - clinica / permissao</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 24px auto; padding: 0 16px; }
  fieldset { margin-bottom: 16px; border: 1px solid #ccc; border-radius: 6px; }
  label { display: block; margin: 6px 0; font-size: 14px; }
  input, select { padding: 4px 6px; margin-left: 6px; }
  button { padding: 6px 12px; margin-right: 6px; cursor: pointer; }
  pre { background: #f4f4f4; padding: 10px; overflow: auto; max-height: 300px; }
  .ok { color: #0a7a2f; font-weight: bold; } .erro { color: #b00020; font-weight: bold; }
</style>
</head>
<body>
<h1>Teste: clinica → permissao</h1>

<details>
  <summary><b>0. Conferir no banco (antes e depois do teste)</b></summary>
  <button id="btnCopiar">Copiar SQL</button>
<pre id="sql">use dbelmo;

-- Veja os registros existentes e escolha um perm_id para testar:
select * from permissoes;

-- Antes e depois de enviar, confira o registro escolhido (troque 1 pelo perm_id):
select * from permissoes where perm_id = 1;

-- Esperado: o campo de status do perm_id enviado muda para o valor enviado.</pre>
</details>

<fieldset>
  <legend>Configuração</legend>
  <label>URI do endpoint (rota "clinica"): <input id="endpoint" size="40"></label>
  <small>Se a rota do seu Router for outra, corrija aqui (ex: /projetopsi/clinica).</small>
  <label>ID da clínica (sessão): <input id="idClinica" type="number" value="900"></label>
</fieldset>

<fieldset>
  <legend>Dados enviados para a ação "permissao"</legend>
  <label>perm_id (precisa existir em permissoes): <input id="permId" type="number" value="1"></label>
  <label>status: <input id="status" value="1" size="10"></label>
  <small>Use o mesmo formato que o model permissao espera para o status (ex: 1/0).</small>
  <label>Resultado esperado:
    <select id="esperado">
      <option value="true">sucesso: true</option>
      <option value="false">sucesso: false (ex: perm_id inexistente)</option>
    </select>
  </label>
</fieldset>

<button id="btnSessao">1. Definir sessão</button>
<button id="btnVer">Ver sessão</button>
<button id="btnTestar">2. Testar permissao</button>
<button id="btnLimpar">Limpar sessão</button>

<h3>Resultado</h3>
<div id="veredito"></div>
<h3>Resposta bruta</h3>
<pre id="saida">—</pre>

<script>
const $ = (id) => document.getElementById(id);

/* Troca o último trecho da URL (ex: /projetopsi/teste-relatorio.php -> /projetopsi/clinica) */
$('endpoint').value = location.pathname.replace(/[^\/]*\/?$/, 'clinica');
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
  // Envia a ação 'permissao' para a rota "clinica"
  const r = await enviar({ acao: 'permissao', perm_id: $('permId').value, status: $('status').value });
  mostrarBruto(r);

  if (!r.json) { veredito('Resposta não é JSON (veja a resposta bruta: provável erro/warning PHP ou rota errada)', false); return; }

  const esperado = $('esperado').value === 'true';
  const obtido = r.json.sucesso === true;
  const msg = r.json.mensagem ?? r.json.erro ?? '';
  const sujo = r.json.__sujo ? ' (⚠ mas o PHP soltou texto fora do JSON)' : '';
  const ok = obtido === esperado && !r.json.__sujo;
  veredito((ok ? 'OK' : 'DIFERENTE') + `: esperado sucesso=${esperado}, recebido sucesso=${obtido}` + (msg ? ' — ' + msg : '') + sujo, ok);
};
</script>
</body>
</html>