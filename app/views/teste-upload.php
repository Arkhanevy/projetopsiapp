<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste da API</title>
<style>
  :root{--bg:#f6f7f9;--card:#fff;--tx:#1d2330;--mut:#6b7280;--bd:#d9dde3;--ac:#2563eb;--ok:#15803d;--er:#b91c1c;--wn:#b45309}
  @media (prefers-color-scheme:dark){:root{--bg:#14171d;--card:#1d222b;--tx:#e8ebf0;--mut:#9aa3b2;--bd:#323a47;--ac:#5b8def;--ok:#4ade80;--er:#f87171;--wn:#fbbf24}}
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--tx);padding:20px}
  .wrap{max-width:960px;margin:0 auto;display:grid;gap:14px}
  .card{background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:16px}
  h1{font-size:20px;margin:0 0 4px}
  .sub{margin:0;color:var(--mut);font-size:13px}
  label{display:block;font-size:13px;color:var(--mut);margin-bottom:4px}
  input,select,textarea{width:100%;padding:8px 10px;border:1px solid var(--bd);border-radius:6px;background:var(--bg);color:var(--tx);font:inherit}
  .tabs{display:flex;gap:6px;flex-wrap:wrap}
  .tab{padding:8px 12px;border:1px solid var(--bd);background:var(--card);color:var(--tx);border-radius:8px;cursor:pointer;font:inherit;font-size:14px}
  .tipo .tab{flex:1;padding:10px}
  .tab.on{background:var(--ac);border-color:var(--ac);color:#fff}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px}
  .row{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
  button.btn{padding:10px 16px;border:0;border-radius:6px;background:var(--ac);color:#fff;cursor:pointer;font:inherit}
  button.sec{background:transparent;color:var(--tx);border:1px solid var(--bd)}
  pre{margin:0;white-space:pre-wrap;word-break:break-word;font-size:13px;background:var(--bg);border:1px solid var(--bd);border-radius:6px;padding:10px;max-height:340px;overflow:auto}
  .st{font-weight:600;margin-bottom:8px;font-size:14px}.ok{color:var(--ok)}.er{color:var(--er)}
  .nota{margin-top:8px;font-size:13px;color:var(--wn)}
  .prev{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}
  .prev figure{margin:0;font-size:12px;color:var(--mut);max-width:200px}
  .prev img{max-width:200px;max-height:160px;border:1px solid var(--bd);border-radius:6px;display:block;margin-bottom:4px}
  .prev a{color:var(--ac)}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <h1>Teste da API</h1>
    <p class="sub">Ordem sugerida: Cadastrar → Gerar código → Ativar → Login → demais ações. O login guarda a sessão (cookie) para as ações seguintes.</p>
    <div style="margin-top:12px">
      <label for="base">Prefixo da rota (opcional, normalmente vazio)</label>
      <input id="base" placeholder="vazio = envia direto para o endpoint: profissional, clinica, cliente ou upload">
    </div>
  </div>

  <div class="tabs tipo" id="tipos"></div>
  <div class="tabs" id="acoes"></div>

  <form class="card" id="form">
    <div id="info" class="sub"></div>
    <div id="nota" class="nota"></div>
    <div class="grid" id="campos"></div>
    <div class="row">
      <button class="btn" type="submit">Enviar</button>
      <button class="btn sec" type="button" id="exemplo">Preencher exemplo</button>
      <button class="btn sec" type="button" id="limpar">Limpar</button>
    </div>
  </form>

  <div class="card">
    <div class="st" id="status">Aguardando envio…</div>
    <label>Enviado</label>
    <pre id="req">—</pre>
    <label style="margin-top:12px">Resposta</label>
    <pre id="res">—</pre>
    <div class="prev" id="prev"></div>
  </div>
</div>

<script>
/* ===== Configuração =====
 * "name" = chave enviada no POST (o que o controller lê em $_POST / $_FILES).
 * Profissional segue o profissionalcontroller.php. Clínica e Cliente são suposição:
 * ajuste os campos e as ações conforme os seus controllers. */
const GEN = [['F', 'F'], ['M', 'M'], ['O', 'O']];

const CAD = {
  profissional: [
    { name: 'nome', label: 'Nome', exemplo: 'Dra. Ana Souza' },
    { name: 'email', label: 'E-mail', type: 'email', exemplo: 'ana@teste.com' },
    { name: 'username', label: 'Username', exemplo: 'anasouza' },
    { name: 'senha', label: 'Senha', type: 'password', exemplo: '123456' },
    { name: 'bio', label: 'Biografia', type: 'textarea', exemplo: 'Fisioterapeuta há 10 anos.' },
    { name: 'dtNas', label: 'Data de nascimento', type: 'date', exemplo: '1990-05-20' },
    { name: 'CPF', label: 'CPF', exemplo: '12345678909' },
    { name: 'CEP', label: 'CEP', exemplo: '07000000' },
    { name: 'telefone', label: 'Telefone', exemplo: '11999998888' },
    { name: 'genero', label: 'Gênero', type: 'select', opcoes: GEN, exemplo: 'F' },
    { name: 'registro', label: 'Registro profissional', exemplo: 'CREFITO-123456' },
    { name: 'foto', label: 'Foto', type: 'file', required: true }
  ],
  clinica: [
    { name: 'nome', label: 'Nome da clínica', exemplo: 'Clínica Vida' },
    { name: 'email', label: 'E-mail', type: 'email', exemplo: 'contato@clinicavida.com' },
    { name: 'username', label: 'Username', exemplo: 'clinicavida' },
    { name: 'senha', label: 'Senha', type: 'password', exemplo: '123456' },
    { name: 'bio', label: 'Descrição', type: 'textarea', exemplo: 'Clínica de reabilitação.' },
    { name: 'CNPJ', label: 'CNPJ', exemplo: '12345678000199' },
    { name: 'CEP', label: 'CEP', exemplo: '07000000' },
    { name: 'telefone', label: 'Telefone', exemplo: '1133334444' },
    { name: 'foto', label: 'Foto', type: 'file', required: true }
  ],
  cliente: [
    { name: 'nome', label: 'Nome', exemplo: 'Carlos Lima' },
    { name: 'email', label: 'E-mail', type: 'email', exemplo: 'carlos@teste.com' },
    { name: 'username', label: 'Username', exemplo: 'carloslima' },
    { name: 'senha', label: 'Senha', type: 'password', exemplo: '123456' },
    { name: 'dtNas', label: 'Data de nascimento', type: 'date', exemplo: '1995-02-10' },
    { name: 'CPF', label: 'CPF', exemplo: '98765432100' },
    { name: 'CEP', label: 'CEP', exemplo: '07000000' },
    { name: 'telefone', label: 'Telefone', exemplo: '11988887777' },
    { name: 'genero', label: 'Gênero', type: 'select', opcoes: GEN, exemplo: 'M' },
    { name: 'foto', label: 'Foto', type: 'file', required: true }
  ]
};
const ROTULO = { profissional: 'Profissional', clinica: 'Clínica', cliente: 'Cliente' };
const EX_EMAIL = { profissional: 'ana@teste.com', clinica: 'contato@clinicavida.com', cliente: 'carlos@teste.com' };

function acoes(tipo) {
  const email = { name: 'email', label: 'E-mail', type: 'email', exemplo: EX_EMAIL[tipo] };
  const senha = { name: 'senha', label: 'Senha', type: 'password', exemplo: '123456' };
  return [
    { id: 'cadastrar', rotulo: 'Cadastrar', acao: 'cadastrar', campos: CAD[tipo] },
    { id: 'codigo', rotulo: 'Gerar código', acao: 'ReGerarCodigo', campos: [email],
      nota: 'O envio de e-mail está comentado no GerarCodigo: o código só é gravado no banco (coluna de código de validação). Copie de lá para usar em "Ativar".' },
    { id: 'ativar', rotulo: 'Ativar conta', acao: 'ativar', campos: [email, { name: 'cod', label: 'Código de validação', exemplo: '' }] },
    { id: 'login', rotulo: 'Login', acao: 'login', campos: [email, senha] },
    { id: 'perfil', rotulo: 'Pegar perfil', acao: 'PegarPerfil', campos: [], nota: 'Precisa estar logado.' },
    { id: 'meus', rotulo: 'Meus arquivos', acao: 'meusArquivos', campos: [], nota: 'Precisa estar logado.' },
    { id: 'compart', rotulo: 'Arquivos compartilhados', acao: 'arquivosCompartilhados',
      campos: [{ name: 'id', label: 'id (enviado em $_POST[\'id\'])', exemplo: '1' }],
      nota: 'Precisa estar logado: o e-mail vem da sessão.' },
    { id: 'upload', rotulo: 'Upload', endpoint: 'upload', acao: null,
      campos: [
        { name: 'file', label: 'Arquivo (file)', type: 'file', required: true },
        { name: 'accessCtrl', label: 'accessCtrl', type: 'select', opcoes: [['0', '0 (padrão)'], ['1', '1']], exemplo: '0' },
        { name: 'shareMails', label: 'shareMails (e-mails separados por vírgula)', exemplo: '' }
      ],
      nota: 'Vai para o endpoint "upload" (Upload.php), sem "acao". O dono do arquivo é o usuário logado.' }
  ];
}

/* ===== Estado e tela ===== */
const $ = (id) => document.getElementById(id);
let tipo = 'profissional';
let acaoId = 'cadastrar';
const valores = {}; // mantém e-mail, senha etc. entre as ações

const acaoAtual = () => acoes(tipo).find((a) => a.id === acaoId);
const endpointDe = (a) => $('base').value.trim() + (a.endpoint || tipo);

function montarAbas() {
  const bt = $('tipos'); bt.innerHTML = '';
  Object.keys(ROTULO).forEach((t) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tab' + (t === tipo ? ' on' : ''); b.textContent = ROTULO[t];
    b.onclick = () => { tipo = t; montarAbas(); montarForm(); };
    bt.appendChild(b);
  });
  const ba = $('acoes'); ba.innerHTML = '';
  acoes(tipo).forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tab' + (a.id === acaoId ? ' on' : ''); b.textContent = a.rotulo;
    b.onclick = () => { acaoId = a.id; montarAbas(); montarForm(); };
    ba.appendChild(b);
  });
}

function montarForm() {
  const a = acaoAtual();
  $('info').textContent = 'POST ' + endpointDe(a) + (a.acao ? '  •  acao=' + a.acao : '  •  (sem acao)');
  $('nota').textContent = a.nota || '';
  const box = $('campos'); box.innerHTML = '';
  if (!a.campos.length) {
    const p = document.createElement('p'); p.className = 'sub'; p.textContent = 'Sem campos: é só enviar.'; box.appendChild(p);
  }
  a.campos.forEach((c) => {
    const w = document.createElement('div');
    let el;
    if (c.type === 'textarea') { el = document.createElement('textarea'); el.rows = 3; }
    else if (c.type === 'select') {
      el = document.createElement('select');
      c.opcoes.forEach((o) => el.add(typeof o === 'string' ? new Option(o, o) : new Option(o[1], o[0])));
    } else {
      el = document.createElement('input'); el.type = c.type || 'text';
      if (c.type === 'file') { if (c.required) el.required = true; }
    }
    el.id = 'f_' + c.name; el.name = c.name;
    if (c.type !== 'file') {
      if (valores[c.name] !== undefined) el.value = valores[c.name];
      el.addEventListener('input', () => { valores[c.name] = el.value; });
    }
    const l = document.createElement('label');
    l.htmlFor = el.id;
    l.textContent = c.label + (c.name !== c.label ? ' (' + c.name + ')' : '') + (c.type === 'file' && c.required ? ' *obrigatório' : '');
    w.append(l, el); box.appendChild(w);
  });
}

function preencherExemplo() {
  acaoAtual().campos.forEach((c) => {
    const el = $('f_' + c.name);
    if (el && c.type !== 'file' && c.exemplo !== undefined && c.exemplo !== '') {
      el.value = c.exemplo; valores[c.name] = c.exemplo;
    }
  });
}

function limpar() {
  acaoAtual().campos.forEach((c) => { delete valores[c.name]; });
  montarForm();
}

/* ===== Resposta ===== */
function varrer(v, caminho, anexos) {
  if (typeof v === 'string' && v.startsWith('data:')) {
    const mime = (v.match(/^data:([^;,]+)/) || [])[1] || 'desconhecido';
    anexos.push({ caminho, mime, uri: v });
    return `[data URI ${mime}, ~${Math.round(v.length * 0.75 / 1024)} KB]`;
  }
  if (Array.isArray(v)) return v.map((x, i) => varrer(x, caminho + '[' + i + ']', anexos));
  if (v && typeof v === 'object') {
    const o = {};
    for (const k in v) o[k] = varrer(v[k], caminho ? caminho + '.' + k : k, anexos);
    return o;
  }
  return v;
}

function mostrarAnexos(anexos) {
  const box = $('prev'); box.innerHTML = '';
  anexos.forEach((a) => {
    const f = document.createElement('figure');
    if (a.mime.startsWith('image/')) {
      const img = document.createElement('img'); img.src = a.uri; f.appendChild(img);
    } else if (a.mime === 'application/pdf') {
      const bin = atob(a.uri.split(',')[1]);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([bytes], { type: a.mime }));
      link.target = '_blank'; link.textContent = 'Abrir PDF'; f.appendChild(link);
    }
    f.appendChild(document.createTextNode(a.caminho));
    box.appendChild(f);
  });
}

function limparPhp(t) {
  return t.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}

async function enviar(e) {
  e.preventDefault();
  const a = acaoAtual();
  const fd = new FormData($('form'));
  if (a.acao) fd.append('acao', a.acao);

  const resumo = {};
  for (const [k, v] of fd.entries()) {
    resumo[k] = v instanceof File ? `[arquivo] ${v.name || '(vazio)'} (${v.size} bytes)` : (k === 'senha' ? '••••••' : v);
  }
  const url = endpointDe(a);
  $('req').textContent = 'POST ' + url + '\n' + JSON.stringify(resumo, null, 2);
  $('res').textContent = '…'; $('prev').innerHTML = '';
  $('status').className = 'st'; $('status').textContent = 'Enviando…';

  try {
    const r = await fetch(url, { method: 'POST', body: fd, credentials: 'include' });
    const texto = await r.text();
    let json = null;
    try { json = JSON.parse(texto); } catch (_) {}

    if (json !== null) {
      const anexos = [];
      $('res').textContent = JSON.stringify(varrer(json, '', anexos), null, 2);
      mostrarAnexos(anexos);
      const ok = json.sucesso === true || json.logado === true;
      $('status').className = 'st ' + (ok ? 'ok' : 'er');
      $('status').textContent = `HTTP ${r.status} — sucesso: ${ok}` + (json.mensagem ? ' — ' + json.mensagem : json.erro ? ' — ' + json.erro : '');
    } else {
      const limpo = limparPhp(texto).trim();
      $('res').textContent = limpo || '(resposta vazia)';
      const temErroPhp = /<b>(Warning|Fatal error|Notice|Deprecated)/i.test(texto);
      if (a.id === 'upload' && r.ok && limpo && !temErroPhp) {
        $('status').className = 'st ok';
        $('status').textContent = `HTTP ${r.status} — upload ok, arquivo salvo como: ${limpo}`;
      } else {
        $('status').className = 'st er';
        $('status').textContent = limpo
          ? `HTTP ${r.status} — a resposta não é JSON (veja warnings/erros do PHP abaixo)`
          : `HTTP ${r.status} — resposta vazia (o controller não deu echo/json_encode?)`;
      }
    }
  } catch (err) {
    $('status').className = 'st er';
    $('status').textContent = 'Falha na requisição: ' + err.message;
    $('res').textContent = 'Verifique o endpoint/prefixo e se o servidor está rodando.';
  }
}

$('form').addEventListener('submit', enviar);
$('exemplo').addEventListener('click', preencherExemplo);
$('limpar').addEventListener('click', limpar);
$('base').addEventListener('input', () => { $('info').textContent = 'POST ' + endpointDe(acaoAtual()) + (acaoAtual().acao ? '  •  acao=' + acaoAtual().acao : '  •  (sem acao)'); });
montarAbas();
montarForm();
</script>
</body>
</html>