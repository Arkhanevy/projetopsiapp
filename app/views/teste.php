<?php
/*
 * PÁGINA DE TESTE - localizacaocontroller (só o que está programado)
 * Só para desenvolvimento. Apague antes de publicar.
 * Antes de cada rodada rode inserts_localizacao.sql.
 *
 * Ações: inserirloc, inserirsala, pegarloc, pegarSalas, editarloc, editarsala
 * Esta página só monta a sessão (setup_teste / ver_sessao); as ações vão para a rota "localizacao".
 * Obs.: editarloc/editarsala recebem o id da localização/sala como PRIMEIRO item de valores[].
 */
if (session_status() === PHP_SESSION_NONE) { session_start(); }

$cenarios = [
    '1' => ['nome' => 'Profissional Ana (id 511)',   'usuario' => ['idUsuario' => 511, 'nome' => 'TLC Ana',   'email' => 'ana@testeloc.com',   'tipoUsuario' => 'profissional']],
    '2' => ['nome' => 'Profissional Bruno (id 512)', 'usuario' => ['idUsuario' => 512, 'nome' => 'TLC Bruno', 'email' => 'bruno@testeloc.com', 'tipoUsuario' => 'profissional']],
    '3' => ['nome' => 'Clínica Alfa (id 521)',       'usuario' => ['idUsuario' => 521, 'nome' => 'TLC Clínica Alfa', 'email' => 'alfa@testeloc.com', 'tipoUsuario' => 'clinica']],
    '4' => ['nome' => 'Cliente (id 501)',            'usuario' => ['idUsuario' => 501, 'nome' => 'TLC Cliente', 'email' => 'cli@testeloc.com', 'tipoUsuario' => 'cliente']],
];

if (($_POST['acao'] ?? '') === 'setup_teste') {
    header('Content-Type: application/json; charset=utf-8');
    $k = $_POST['cenario'] ?? '';
    if (!isset($cenarios[$k])) { echo json_encode(['sucesso' => false, 'mensagem' => 'cenário inválido']); exit; }
    $_SESSION['usuario'] = $cenarios[$k]['usuario'];
    echo json_encode(['sucesso' => true, 'sessao' => ['usuario' => $_SESSION['usuario']]]);
    exit;
}
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
<title>Teste localização</title>
<style>
    body { font-family: system-ui, sans-serif; max-width: 1150px; margin: 24px auto; padding: 0 16px 280px; color: #222; }
    h1 { font-size: 1.3rem; } h2 { font-size: 1.1rem; margin-top: 24px; }
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
<h1>Teste do localizacaocontroller</h1>
<p class="aviso">Rode o <code>inserts_localizacao.sql</code> antes de cada rodada (os testes criam e editam localizações e salas).</p>

<fieldset class="linha">
    <legend>0. Endpoint</legend>
    <label>Rota do localizacaocontroller <input id="epLoc" class="endpoint" type="text"></label>
    <small>Se a rota do seu Router for outra, corrija aqui.</small>
</fieldset>

<fieldset class="linha">
    <legend>1. Sessão</legend>
    <label>Usuário <select id="cenario">
        <?php foreach ($cenarios as $k => $c): ?><option value="<?= $k ?>"><?= htmlspecialchars($c['nome']) ?></option><?php endforeach; ?>
    </select></label>
    <button id="btnMontar">Montar sessão</button>
    <button id="btnVer">Ver sessão</button>
</fieldset>

<fieldset>
    <legend>2. Rodar tudo e comparar com o esperado</legend>
    <button id="btnTudo">Rodar todos os testes</button>
    <small>Linha vermelha = o código não faz o que o "esperado" descreve.</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo</summary>
<pre>select loc_id, loc_pro, loc_clin, loc_nome, loc_tipo, loc_cep, loc_num, loc_compl from localizacao where loc_nome like 'TLC%' order by loc_id;
select sala_id, sala_loc, sala_nome from sala where sala_nome like 'TLC%' order by sala_id;
-- esperado: loc 531 (Ana) com nome/num/cep/tipo/compl editados pelos testes; 532 (Bruno) e 533 (Alfa) como no insert
-- nenhuma sala "TLC Sala Invasora" na 531</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida'), veredito = el('veredito');
el('epLoc').value = location.pathname.replace(/[^\/]*\/?$/, 'localizacao');
const ENDPOINT_PAGINA = location.pathname;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function lerJson(texto) {
    try { return JSON.parse(texto); } catch (e) {}
    /* avisos do PHP (Deprecated/Warning) antes do JSON: tenta a partir de cada { ou [ até achar o JSON */
    for (let i = 0; i < texto.length; i++) {
        const c = texto[i];
        if (c !== '{' && c !== '[') continue;
        try {
            const j = JSON.parse(texto.slice(i).trim());
            if (j && typeof j === 'object') { Object.defineProperty(j, '__sujo', { value: true }); return j; }
        } catch (e) {}
    }
    return null;
}
/* valores que são array (atualizacao, valores) vão como chave[] */
async function enviar(dados) {
    const fd = new FormData();
    for (const k in dados) {
        if (Array.isArray(dados[k])) dados[k].forEach(v => fd.append(k + '[]', v)); else fd.append(k, dados[k]);
    }
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const url = propria ? ENDPOINT_PAGINA : el('epLoc').value.trim();
    try {
        const r = await fetch(url, { method: 'POST', body: fd, credentials: 'same-origin' });
        const texto = await r.text();
        return { status: r.status, texto, json: lerJson(texto) };
    } catch (e) { return { status: 0, texto: 'Falha de rede: ' + e.message, json: null }; }
}
function mostrar(res) {
    const sujo = res.json && res.json.__sujo ? '  (⚠ texto fora do JSON: warning/notice do PHP)' : '';
    saida.textContent = 'HTTP ' + res.status + sujo + '\n' + (res.json ? JSON.stringify(res.json, null, 2) : (res.texto || '(resposta vazia)'));
}
const montarSessao = chave => enviar({ acao: 'setup_teste', cenario: chave ?? el('cenario').value });
el('btnMontar').addEventListener('click', () => montarSessao().then(mostrar));
el('btnVer').addEventListener('click', () => enviar({ acao: 'ver_sessao' }).then(mostrar));

/* ---------- ações individuais ---------- */
const ACOES = [
    { acao: 'inserirloc', obs: 'Profissional ou clínica da sessão vira dono.', campos: [
        { n: 'nome', l: 'Nome', v: 'TLC Manual' }, { n: 'tipo', l: 'Tipo (clin, casa, domi)', v: 'casa' },
        { n: 'cep', l: 'CEP', v: '01001000' }, { n: 'numero', l: 'Número', v: '55' }, { n: 'complemento', l: 'Complemento', v: 'Apto 1' } ] },
    { acao: 'pegarloc', obs: 'Sem campos: localizações do profissional da sessão. Ou envie clinica / profissional (id).', campos: [
        { n: 'clinica', l: 'clinica (id, opcional)', v: '', op: true }, { n: 'profissional', l: 'profissional (id, opcional)', v: '', op: true } ] },
    { acao: 'pegarSalas', obs: 'Salas de uma localização.', campos: [ { n: 'loc', l: 'Localização (id)', v: '531' } ] },
    { acao: 'inserirsala', obs: 'Só o dono da localização.', campos: [ { n: 'loc', l: 'Localização (id)', v: '531' }, { n: 'nome', l: 'Nome', v: 'TLC Sala Manual' } ] },
    { acao: 'editarloc', obs: 'atualizacao[] (nome,tipo,CEP,numero,compl) e valores[] separados por vírgula; o PRIMEIRO valor é o id.', arr: true, campos: [
        { n: 'atualizacao', l: 'atualizacao', v: 'nome,numero' }, { n: 'valores', l: 'valores (id primeiro)', v: '531,TLC Editada,77' } ] },
    { acao: 'editarsala', obs: 'valores[] = id da sala e novo nome.', arr: true, campos: [ { n: 'valores', l: 'valores (id, nome)', v: '541,TLC Sala Editada' } ] }
];
function montarCartoes() {
    ACOES.forEach((a, i) => {
        const fs = document.createElement('fieldset');
        let h = '<legend>' + esc(a.acao) + '</legend><p class="obs">' + esc(a.obs) + '</p>';
        a.campos.forEach((c, j) => { h += '<label>' + esc(c.l) + '<input id="f_' + i + '_' + j + '" value="' + esc(c.v) + '"></label>'; });
        fs.innerHTML = h + '<button type="button">Enviar</button>';
        el('cartoes').appendChild(fs);
        fs.querySelector('button').addEventListener('click', () => {
            const d = { acao: a.acao };
            a.campos.forEach((c, j) => {
                const v = el('f_' + i + '_' + j).value;
                if (c.op && v === '') return;
                d[c.n] = (a.arr && (c.n === 'atualizacao' || c.n === 'valores')) ? v.split(',').map(s => s.trim()) : v;
            });
            enviar(d).then(mostrar);
        });
    });
}

/* ---------- bateria ---------- */
const ROTULO = { '1': 'Ana', '2': 'Bruno', '3': 'Clínica Alfa', '4': 'Cliente' };

function criarTestes() {
    const ts = String(Date.now()).slice(-6);
    const S = { ana: '1', bruno: '2', alfa: '3', cli: '4' };
    const nomeAna = 'TLC Loc Ana ' + ts, nomeAna2 = 'TLC Loc Ana2 ' + ts, nomeClin = 'TLC Loc Alfa ' + ts;
    const salaAna = 'TLC Sala Nova Ana ' + ts, salaAlfa = 'TLC Sala Nova Alfa ' + ts, salaInv = 'TLC Sala Invasora ' + ts;
    const nomeEd = 'TLC Ana Editada ' + ts, salaEd = 'TLC Sala Ana Editada ' + ts;

    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? '');
    const dados = j => (sucesso(j) && Array.isArray(j.dados)) ? j.dados : null;
    const ids = (j, campo) => (dados(j) || []).map(r => String(r[campo]));
    const acha = (j, campo, valor) => (dados(j) || []).find(r => String(r[campo]) === String(valor));
    const pegarAna = { acao: 'pegarloc' };
    const loc531 = j => acha(j, 'loc_id', 531);

    return [
        { grupo: 'cliente (o controller bloqueia)', n: 'cliente tenta inserirloc', sessao: S.cli,
          req: { acao: 'inserirloc', nome: 'TLC Cliente ' + ts, tipo: 'casa', cep: '01001000', numero: '1' },
          esp: 'sucesso: false, "clientes não tem acesso..."', ok: j => falha(j) && /cliente/i.test(msg(j)) },
        { n: 'cliente tenta pegarloc', req: { acao: 'pegarloc', profissional: '511' },
          esp: 'sucesso: false, "clientes não tem acesso..."', ok: j => falha(j) && /cliente/i.test(msg(j)) },

        { grupo: 'inserirloc e pegarloc', n: 'Ana cadastra uma localização com complemento', sessao: S.ana,
          req: { acao: 'inserirloc', nome: nomeAna, tipo: 'casa', cep: '04004000', numero: '45', complemento: 'Apto 2' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'Ana vê a nova localização (dona = Ana, sem clínica)', req: pegarAna,
          esp: 'loc com nome novo, loc_pro 511, loc_clin nulo, tipo casa, cep 04004000, num 45, compl "Apto 2"',
          ok: j => { const l = acha(j, 'loc_nome', nomeAna); return !!l && String(l.loc_pro) === '511' && l.loc_clin === null && l.loc_tipo === 'casa'
              && String(l.loc_cep) === '04004000' && String(l.loc_num) === '45' && l.loc_compl === 'Apto 2'; } },
        { n: 'Ana cadastra sem complemento', req: { acao: 'inserirloc', nome: nomeAna2, tipo: 'domi', cep: '05005000', numero: '8' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'complemento fica vazio', req: pegarAna, esp: 'loc_compl vazio e tipo domi',
          ok: j => { const l = acha(j, 'loc_nome', nomeAna2); return !!l && (l.loc_compl === '' || l.loc_compl === null) && l.loc_tipo === 'domi'; } },
        { n: 'Ana vê só as próprias (531 sim; 532 e 533 não)', req: pegarAna, esp: 'inclui 531; não inclui 532 nem 533',
          ok: j => { const i = ids(j, 'loc_id'); return i.includes('531') && !i.includes('532') && !i.includes('533'); } },
        { n: 'Clínica Alfa cadastra uma localização', sessao: S.alfa,
          req: { acao: 'inserirloc', nome: nomeClin, tipo: 'clin', cep: '06006000', numero: '300', complemento: 'Bloco B' },
          esp: 'sucesso: true', ok: sucesso },
        { n: 'pegarloc da clínica 521', req: { acao: 'pegarloc', clinica: '521' },
          esp: 'inclui 533 e a nova (loc_clin 521, loc_pro nulo); não inclui 531',
          ok: j => { const l = acha(j, 'loc_nome', nomeClin); return !!l && String(l.loc_clin) === '521' && l.loc_pro === null && ids(j, 'loc_id').includes('533') && !ids(j, 'loc_id').includes('531'); } },
        { n: 'Bruno vê as localizações da Ana pelo campo profissional', sessao: S.bruno, req: { acao: 'pegarloc', profissional: '511' },
          esp: 'inclui 531; não inclui 532 (do Bruno)', ok: j => ids(j, 'loc_id').includes('531') && !ids(j, 'loc_id').includes('532') },
        { n: 'Bruno sem parâmetros vê as próprias', req: { acao: 'pegarloc' },
          esp: 'inclui 532; não inclui 531 nem 533', ok: j => { const i = ids(j, 'loc_id'); return i.includes('532') && !i.includes('531') && !i.includes('533'); } },

        { grupo: 'pegarSalas', n: 'salas da localização 531', sessao: S.ana, req: { acao: 'pegarSalas', loc: '531' },
          esp: 'só a sala 541', ok: j => JSON.stringify(ids(j, 'sala_id')) === '["541"]' },
        { n: 'salas da localização 533', req: { acao: 'pegarSalas', loc: '533' },
          esp: 'salas 542 e 543', ok: j => JSON.stringify(ids(j, 'sala_id').sort()) === '["542","543"]' },

        { grupo: 'inserirsala (checa se é o dono)', n: 'Ana cadastra sala na própria localização (531)', sessao: S.ana,
          req: { acao: 'inserirsala', loc: '531', nome: salaAna }, esp: 'sucesso: true', ok: sucesso },
        { n: 'sala aparece em 531', req: { acao: 'pegarSalas', loc: '531' }, esp: 'inclui a sala nova, ligada à loc 531',
          ok: j => { const s = acha(j, 'sala_nome', salaAna); return !!s && String(s.sala_loc) === '531'; } },
        { n: 'Clínica Alfa cadastra sala na própria localização (533)', sessao: S.alfa,
          req: { acao: 'inserirsala', loc: '533', nome: salaAlfa }, esp: 'sucesso: true', ok: sucesso },
        { n: 'sala aparece em 533', req: { acao: 'pegarSalas', loc: '533' }, esp: 'inclui a sala nova da Alfa', ok: j => !!acha(j, 'sala_nome', salaAlfa) },
        { n: 'Bruno tenta cadastrar sala na localização da Ana (531)', sessao: S.bruno,
          req: { acao: 'inserirsala', loc: '531', nome: salaInv }, esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => falha(j) && /dono/i.test(msg(j)) },
        { n: 'Clínica Alfa tenta cadastrar sala na localização da Ana (531)', sessao: S.alfa,
          req: { acao: 'inserirsala', loc: '531', nome: salaInv }, esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => falha(j) && /dono/i.test(msg(j)) },
        { n: 'a sala invasora não foi criada', req: { acao: 'pegarSalas', loc: '531' }, esp: 'nenhuma sala "' + salaInv + '"', ok: j => !!dados(j) && !acha(j, 'sala_nome', salaInv) },

        { grupo: 'editarloc (valores começa pelo id da localização)', n: 'Ana edita nome e número da 531', sessao: S.ana,
          req: { acao: 'editarloc', atualizacao: ['nome', 'numero'], valores: ['531', nomeEd, '99'] }, esp: 'sucesso: true', ok: sucesso },
        { n: 'nome e número gravados, o resto intacto', req: pegarAna, esp: 'nome novo, num 99; cep 01001000, tipo casa e compl "Casa 1" como antes',
          ok: j => { const l = loc531(j); return !!l && l.loc_nome === nomeEd && String(l.loc_num) === '99' && String(l.loc_cep) === '01001000' && l.loc_tipo === 'casa' && l.loc_compl === 'Casa 1'; } },
        { n: 'Ana edita o CEP', req: { acao: 'editarloc', atualizacao: ['CEP'], valores: ['531', '07007000'] }, esp: 'sucesso: true', ok: sucesso },
        { n: 'CEP gravado', req: pegarAna, esp: 'loc_cep 07007000', ok: j => String(loc531(j)?.loc_cep) === '07007000' },
        { n: 'Ana edita o tipo', req: { acao: 'editarloc', atualizacao: ['tipo'], valores: ['531', 'domi'] }, esp: 'sucesso: true', ok: sucesso },
        { n: 'tipo gravado', req: pegarAna, esp: 'loc_tipo domi', ok: j => loc531(j)?.loc_tipo === 'domi' },
        { n: 'Ana edita o complemento (campo "compl")', req: { acao: 'editarloc', atualizacao: ['compl'], valores: ['531', 'Sala 5'] }, esp: 'sucesso: true', ok: sucesso },
        { n: 'complemento gravado em loc_compl (e o tipo não é mexido)', req: pegarAna, esp: 'loc_compl "Sala 5" e loc_tipo ainda domi',
          ok: j => { const l = loc531(j); return !!l && l.loc_compl === 'Sala 5' && l.loc_tipo === 'domi'; } },
        { n: 'campo não permitido (id)', req: { acao: 'editarloc', atualizacao: ['id'], valores: ['531', '999'] },
          esp: 'sucesso: false, "Campo de atualização não válido"', ok: j => falha(j) && /campo/i.test(msg(j)) },
        { n: 'campo válido + inválido juntos (nome e pro)', req: { acao: 'editarloc', atualizacao: ['nome', 'pro'], valores: ['531', 'TLC Nao Deve Gravar ' + ts, '512'] },
          esp: 'sucesso: false, "Campo de atualização não válido"', ok: j => falha(j) && /campo/i.test(msg(j)) },
        { n: 'nada foi gravado na tentativa acima', req: pegarAna, esp: 'nome continua o da edição anterior e loc_pro 511',
          ok: j => { const l = loc531(j); return !!l && l.loc_nome === nomeEd && String(l.loc_pro) === '511'; } },

        { grupo: 'editarsala', n: 'Ana renomeia a sala 541', sessao: S.ana,
          req: { acao: 'editarsala', valores: ['541', salaEd] }, esp: 'sucesso: true', ok: sucesso },
        { n: 'nome da sala gravado', req: { acao: 'pegarSalas', loc: '531' }, esp: 'sala 541 com o nome novo, ainda na loc 531',
          ok: j => { const s = acha(j, 'sala_id', 541); return !!s && s.sala_nome === salaEd && String(s.sala_loc) === '531'; } },
    ];
}

function resumo(res) {
    if (!res.json) return 'sem JSON: ' + (res.texto || '(resposta vazia)').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    let s = JSON.stringify(res.json);
    if (s.length > 240) s = s.slice(0, 240) + '…';
    return (res.json.__sujo ? '⚠ texto fora do JSON · ' : '') + s;
}
async function rodarTudo() {
    const btn = el('btnTudo'); btn.disabled = true;
    const testes = criarTestes(), brutos = [];
    let html = '<table><tr><th>#</th><th>Teste</th><th>Sessão</th><th>Esperado</th><th>Obtido</th><th></th></tr>';
    let avisos = 0, passou = 0, sessaoAtual = '';
    for (let i = 0; i < testes.length; i++) {
        const t = testes[i];
        veredito.textContent = 'Rodando ' + (i + 1) + ' de ' + testes.length + '…';
        if (t.sessao !== undefined) { await montarSessao(t.sessao); sessaoAtual = ROTULO[t.sessao]; }
        const res = await enviar(t.req);
        let ok = false;
        try { ok = !!t.ok(res.json, res); } catch (e) { ok = false; }
        if (ok) passou++;
        if (res.json && res.json.__sujo) avisos++;
        brutos.push({ teste: t.n, enviado: t.req, status: res.status, resposta: res.json ?? res.texto });
        if (t.grupo) html += '<tr class="grupo"><td colspan="6">' + esc(t.grupo) + '</td></tr>';
        html += '<tr><td>' + (i + 1) + '</td><td>' + esc(t.n) + '</td><td>' + esc(sessaoAtual) + '</td><td>' + esc(t.esp) +
            '</td><td class="obt">' + esc(resumo(res)) + '</td><td class="' + (ok ? 'ok' : 'erro') + '">' + (ok ? 'OK' : 'FALHOU') + '</td></tr>';
    }
    veredito.innerHTML = '<p><b>' + passou + ' de ' + testes.length + ' testes passaram.</b></p>' + (avisos ? '<p class="obs">⚠ ' + avisos + ' resposta(s) vieram com aviso do PHP antes do JSON (não conta como falha; veja a coluna Obtido).</p>' : '') + html + '</table>';
    saida.textContent = JSON.stringify(brutos, null, 2);
    btn.disabled = false;
}
el('btnTudo').addEventListener('click', rodarTudo);
montarCartoes();
</script>
</body>
</html>