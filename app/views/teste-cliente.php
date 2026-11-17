<?php
/*
 * PÁGINA DE TESTE - localizacaocontroller
 * Use só em ambiente de desenvolvimento. Apague antes de publicar
 * (quem abrir esta página consegue "virar" qualquer usuário).
 *
 * Ações do localizacaocontroller: inserirloc, inserirsala, pegarloc, pegarSalas, editarloc, editarsala
 * (clientes não têm acesso a nenhuma)
 *
 * Esta página só monta/mostra a sessão (setup_teste e ver_sessao). As ações são enviadas para a
 * rota "localizacao" do Router. A rota é calculada no JS trocando o último trecho da URL e pode ser
 * corrigida no campo de endpoint.
 *
 * Antes de cada rodada rode o inserts_localizacao.sql (ele limpa e recria os dados de teste).
 * Senha de todos os usuários de teste: Senha@123
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/* Cenários: o que o login colocaria em $_SESSION['usuario'] (mesma estrutura de usuario::Login) */
$cenarios = [
    '0' => ['nome' => 'Sem sessão (deslogado)', 'usuario' => null],
    '1' => ['nome' => 'Cliente (id 601)',                      'usuario' => ['idUsuario' => 601, 'nome' => 'TLC Cliente',       'email' => 'cliente@testeloc.com', 'tipoUsuario' => 'cliente']],
    '2' => ['nome' => 'Profissional Ana (id 611) - 2 localizações',   'usuario' => ['idUsuario' => 611, 'nome' => 'TLC Ana Podóloga',   'email' => 'ana@testeloc.com',   'tipoUsuario' => 'profissional']],
    '3' => ['nome' => 'Profissional Bruno (id 612) - 2 localizações', 'usuario' => ['idUsuario' => 612, 'nome' => 'TLC Bruno Podólogo', 'email' => 'bruno@testeloc.com', 'tipoUsuario' => 'profissional']],
    '4' => ['nome' => 'Profissional Paulo (id 621) - mesmo id da clínica Alfa, sem localizações', 'usuario' => ['idUsuario' => 621, 'nome' => 'TLC Paulo Podólogo', 'email' => 'paulo@testeloc.com', 'tipoUsuario' => 'profissional']],
    '5' => ['nome' => 'Clínica Alfa (id 621) - 2 localizações',        'usuario' => ['idUsuario' => 621, 'nome' => 'TLC Clínica Alfa', 'email' => 'alfa@testeloc.com', 'tipoUsuario' => 'clinica']],
    '6' => ['nome' => 'Clínica Beta (id 622) - sem localizações',      'usuario' => ['idUsuario' => 622, 'nome' => 'TLC Clínica Beta', 'email' => 'beta@testeloc.com', 'tipoUsuario' => 'clinica']],
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
<title>Teste localizacaocontroller</title>
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
<h1>Teste do localizacaocontroller</h1>

<p class="aviso">
    Rode o <code>inserts_localizacao.sql</code> antes de cada rodada (inserir e editar mudam os dados).
    Senha de todos os usuários de teste: <code>Senha@123</code>. Os testes de leitura vêm primeiro, antes de qualquer ação que altere os dados.
    O Paulo (profissional 621) e a clínica Alfa (621) têm o mesmo id de propósito.
</p>

<fieldset class="linha">
    <legend>0. Endpoint</legend>
    <label>localizacaocontroller <input id="epLocalizacao" class="endpoint" type="text"></label>
    <small>Se a rota do seu Router for outra, corrija aqui (ex: /projetopsi/localizacao).</small>
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
    <small>Cada teste monta a sessão que precisa. O "esperado" descreve o comportamento correto: linha vermelha = o código ou o dado de teste não bate com isso. Erros de banco que o modelo devolve com sucesso: true contam como falha quando o esperado é recusa.</small>
    <div id="veredito"></div>
</fieldset>

<h2>3. Ações individuais</h2>
<div id="cartoes" class="grid"></div>

<details>
    <summary>Conferir no banco depois de rodar tudo (o dono real de cada localização)</summary>
<pre>select loc_id, loc_pro, loc_clin, loc_nome, loc_tipo from localizacao
where loc_id between 601 and 699 or loc_nome like 'TLC%' order by loc_id;
-- esperado (comportamento correto) para as criadas pelos testes:
--   'TLC Nova Ana'    loc_pro 611, loc_clin NULL, tipo casa
--   'TLC Nova Bruno'  loc_pro 612, loc_clin NULL, tipo domi
--   'TLC Nova Alfa'   loc_pro NULL, loc_clin 621, tipo clin
--   'TLC Nova Beta'   loc_pro NULL, loc_clin 622, tipo clin
--   "TLC Ana's"       loc_pro 611, loc_clin NULL
--   NÃO deve existir: tipo inválido, nome vazio, as do cliente e as de quem não estava logado (dono NULL e NULL)
-- editadas: 641 'TLC Consultório Renomeado'; 642 'TLC Domicílio Editado' tipo casa; 644 'TLC Unidade Alfa Editada'; 643 e 645 intactas

select sala_id, sala_loc, sala_nome from sala where sala_id between 651 and 699 or sala_loc in (select loc_id from localizacao where loc_nome like 'TLC%') order by sala_id;
-- esperado: 'TLC Sala Nova' na localização 641, 'TLC Sala Alfa Nova' na 644; 651 renomeada 'TLC Sala 1 Editada'; 655 'TLC Sala A Editada'
-- NÃO deve existir sala nova na 643 (do Bruno), na 641 pela Alfa, na localização 999999, nem com nome vazio</pre>
</details>

<h3>Resposta</h3>
<pre id="saida">Escolha um cenário e clique em "Montar sessão", ou rode todos os testes.</pre>

<script>
const el = id => document.getElementById(id);
const saida = el('saida');
const veredito = el('veredito');

/* Troca o último trecho da URL (ex: /projetopsi/teste -> /projetopsi/localizacao) */
const baseRota = nome => location.pathname.replace(/[^\/]*\/?$/, nome);
el('epLocalizacao').value = baseRota('localizacao');
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

/* Arrays viram campo[] (como um formulário HTML faz) */
async function enviar(dados) {
    const fd = new FormData();
    for (const k in dados) {
        if (Array.isArray(dados[k])) dados[k].forEach(v => fd.append(k + '[]', v));
        else fd.append(k, dados[k]);
    }
    const propria = dados.acao === 'setup_teste' || dados.acao === 'ver_sessao';
    const url = propria ? ENDPOINT_PAGINA : el('epLocalizacao').value.trim();
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
    { acao: 'inserirloc', obs: 'Cria uma localização para o usuário da sessão (profissional ou clínica).', campos: [
        { n: 'nome', l: 'Nome', v: 'TLC Nova Manual' },
        { n: 'tipo', l: 'Tipo', t: 'select', opts: ['casa', 'clin', 'domi'] } ] },
    { acao: 'inserirsala', obs: 'Cria uma sala numa localização que seja do usuário da sessão.', campos: [
        { n: 'loc', l: 'Localização (id)', v: '641' },
        { n: 'nome', l: 'Nome da sala', v: 'TLC Sala Manual' } ] },
    { acao: 'pegarloc', obs: 'Lista as localizações do usuário da sessão, ou da clínica informada.', campos: [
        { n: 'clinica', l: 'Clínica (opcional)', v: '', opcional: true } ] },
    { acao: 'pegarSalas', obs: 'Lista as salas do usuário da sessão, ou da clínica informada.', campos: [
        { n: 'clinica', l: 'Clínica (opcional)', v: '', opcional: true } ] },
    { acao: 'editarloc', obs: 'Altera nome e tipo de uma localização do usuário da sessão (atualizacao[] = nome, tipo; valores[] = id, nome, tipo).', fixos: { atualizacao: ['nome', 'tipo'] }, campos: [
        { n: 'valores', arr: true, l: 'Localização (id)', v: '641' },
        { n: 'valores', arr: true, l: 'Novo nome', v: 'TLC Editada Manual' },
        { n: 'valores', arr: true, l: 'Novo tipo', t: 'select', opts: ['casa', 'clin', 'domi'] } ] },
    { acao: 'editarsala', obs: 'Renomeia uma sala de uma localização do usuário da sessão (valores[] = id da sala, nome).', campos: [
        { n: 'valores', arr: true, l: 'Sala (id)', v: '651' },
        { n: 'valores', arr: true, l: 'Novo nome', v: 'TLC Sala Editada Manual' } ] }
];

function montarCartoes() {
    const alvo = el('cartoes');
    ACOES.forEach((a, idx) => {
        const fs = document.createElement('fieldset');
        let html = '<legend>' + esc(a.acao) + '</legend><p class="obs">' + esc(a.obs) + '</p>';
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
            const dados = { acao: a.acao, ...(a.fixos || {}) };
            a.campos.forEach((c, j) => {
                const v = el('f_' + idx + '_' + j).value;
                if (c.opcional && v === '') return;
                if (c.arr) (dados[c.n] = dados[c.n] || []).push(v);
                else dados[c.n] = v;
            });
            enviar(dados).then(mostrar);
        });
    });
}

/* ---------- bateria de testes ---------- */
const ROTULO_SESSAO = { '0': 'sem sessão', '1': 'Cliente 601', '2': 'Ana 611', '3': 'Bruno 612', '4': 'Paulo 621 (profissional)', '5': 'Clínica Alfa 621', '6': 'Clínica Beta 622' };

function criarTestes() {
    const S = { nenhuma: '0', cliente: '1', ana: '2', bruno: '3', paulo: '4', alfa: '5', beta: '6' };

    const sucesso = j => j?.sucesso === true;
    const falha = j => j?.sucesso === false;
    const msg = j => String(j?.mensagem ?? j?.erro ?? j?.msg ?? '');
    const txt = r => r.texto.trim();
    /* sucesso de verdade: sucesso true e sem mensagem de erro embutida (o modelo devolve sucesso: true com "Erro no banco...") */
    const ok = j => sucesso(j) && !('mensagem' in j);
    const naoDono = j => falha(j) && /dono/i.test(msg(j));
    const dados = j => (sucesso(j) && Array.isArray(j.dados)) ? j.dados : null;
    const idsDe = (j, campo, esperados) => {
        const d = dados(j);
        if (!d || d.length !== esperados.length) return false;
        return JSON.stringify(d.map(r => String(r[campo])).sort()) === JSON.stringify(esperados.map(String).sort());
    };
    const vazio = j => !!dados(j) && dados(j).length === 0;
    const achar = (j, campo, valor) => (dados(j) || []).find(r => String(r[campo]) === String(valor));

    const INS = (nome, tipo) => ({ acao: 'inserirloc', nome, tipo });
    const SAL = (loc, nome) => ({ acao: 'inserirsala', loc, nome });
    const EDL = (campos, valores) => ({ acao: 'editarloc', atualizacao: campos, valores });
    const EDS = (id, nome) => ({ acao: 'editarsala', valores: [id, nome] });
    const PEGL = { acao: 'pegarloc' };
    const PEGS = { acao: 'pegarSalas' };
    const recusa = 'JSON com sucesso: false e mensagem (o controller devolve vazio ou outra coisa)';

    return [
        /* ================= pegarloc ================= */
        { grupo: 'pegarloc (valores do SQL)', n: 'Ana lista as dela', sessao: S.ana, req: PEGL, esp: 'sucesso, localizações 641 e 642', ok: j => idsDe(j, 'loc_id', [641, 642]) },
        { n: 'Bruno lista as dele', sessao: S.bruno, req: PEGL, esp: 'sucesso, localizações 622 e 643', ok: j => idsDe(j, 'loc_id', [622, 643]) },
        { n: 'Paulo (profissional 621, mesmo id da clínica Alfa)', sessao: S.paulo, req: PEGL, esp: 'sucesso, dados vazio (as da clínica Alfa não são dele)', ok: j => vazio(j) },
        { n: 'clínica Alfa lista as dela', sessao: S.alfa, req: PEGL, esp: 'sucesso, localizações 644 e 645 (e não as do profissional 621)', ok: j => idsDe(j, 'loc_id', [644, 645]) },
        { n: 'clínica Beta (sem localizações)', sessao: S.beta, req: PEGL, esp: 'sucesso, dados vazio (o Bruno tem a localização 622, mas ela não é da clínica)', ok: j => vazio(j) },
        { n: 'Ana pede as localizações da clínica 621', sessao: S.ana, req: { acao: 'pegarloc', clinica: '621' }, esp: 'sucesso, localizações 644 e 645 da clínica', ok: j => idsDe(j, 'loc_id', [644, 645]) },
        { n: 'campos da localização 641', sessao: S.ana, req: PEGL, esp: 'loc_nome "TLC Consultório da Ana", loc_tipo casa, loc_pro 611 e loc_clin nulo',
          ok: j => { const r = achar(j, 'loc_id', 641); return !!r && r.loc_nome === 'TLC Consultório da Ana' && r.loc_tipo === 'casa' && String(r.loc_pro) === '611' && r.loc_clin === null; } },
        { n: 'clínica Alfa informa a própria clínica (clinica=621)', sessao: S.alfa, req: { acao: 'pegarloc', clinica: '621' }, esp: 'sucesso, localizações 644 e 645', ok: j => idsDe(j, 'loc_id', [644, 645]) },
        { n: 'pede a clínica Beta (clinica=622, sem localizações)', sessao: S.ana, req: { acao: 'pegarloc', clinica: '622' }, esp: 'sucesso, dados vazio (a 622 do Bruno é localização, não é da clínica)', ok: j => vazio(j) },
        { n: 'cliente tenta listar', sessao: S.cliente, req: PEGL, esp: recusa, ok: j => falha(j) },
        { n: 'sem login tenta listar', sessao: S.nenhuma, aceitaAviso: true, req: PEGL, esp: recusa, ok: j => falha(j) },

        /* ================= pegarSalas ================= */
        { grupo: 'pegarSalas (valores do SQL)', n: 'Ana lista as salas das localizações dela', sessao: S.ana, req: PEGS, esp: 'sucesso, salas 651 e 652', ok: j => idsDe(j, 'sala_id', [651, 652]) },
        { n: 'Bruno lista as dele', sessao: S.bruno, req: PEGS, esp: 'sucesso, salas 654 e 658', ok: j => idsDe(j, 'sala_id', [654, 658]) },
        { n: 'clínica Alfa lista as dela', sessao: S.alfa, req: PEGS, esp: 'sucesso, salas 655, 656 e 657', ok: j => idsDe(j, 'sala_id', [655, 656, 657]) },
        { n: 'Ana pede as salas da clínica 621', sessao: S.ana, req: { acao: 'pegarSalas', clinica: '621' }, esp: 'sucesso, salas 655, 656 e 657', ok: j => idsDe(j, 'sala_id', [655, 656, 657]) },
        { n: 'clínica Beta (id 622 é o mesmo de uma localização do Bruno)', sessao: S.beta, req: PEGS, esp: 'sucesso, dados vazio (hoje o id da clínica é tratado como id de localização e volta a sala 658 do Bruno)', ok: j => vazio(j) },
        { n: 'Paulo (profissional 621)', sessao: S.paulo, req: PEGS, esp: 'sucesso, dados vazio', ok: j => vazio(j) },
        { n: 'campos da sala 655', sessao: S.alfa, req: PEGS, esp: 'sala_nome "TLC Sala A" e sala_loc 644', ok: j => { const r = achar(j, 'sala_id', 655); return !!r && r.sala_nome === 'TLC Sala A' && String(r.sala_loc) === '644'; } },
        { n: 'cliente tenta listar salas', sessao: S.cliente, req: PEGS, esp: recusa, ok: j => falha(j) },

        /* ================= inserirloc ================= */
        { grupo: 'inserirloc', n: 'Ana cria uma localização', sessao: S.ana, req: INS('TLC Nova Ana', 'casa'), esp: 'sucesso: true, sem mensagem de erro', ok: j => ok(j) },
        { n: 'Bruno cria uma localização domiciliar', sessao: S.bruno, req: INS('TLC Nova Bruno', 'domi'), esp: 'sucesso: true, sem mensagem de erro', ok: j => ok(j) },
        { n: 'clínica Alfa (621) cria uma localização', sessao: S.alfa, req: INS('TLC Nova Alfa', 'clin'), esp: 'sucesso: true; a localização fica da clínica (loc_clin 621, loc_pro nulo), não do Paulo que tem o mesmo id', ok: j => ok(j) },
        { n: 'clínica Beta (622) cria uma localização', sessao: S.beta, req: INS('TLC Nova Beta', 'clin'), esp: 'sucesso: true, sem mensagem de erro; fica com loc_clin 622', ok: j => ok(j) },
        { n: 'nome com aspas simples', sessao: S.ana, req: INS("TLC Ana's", 'casa'), esp: 'sucesso: true, sem mensagem de erro (o nome tem que ser tratado e não quebrar o SQL)', ok: j => ok(j) },
        { n: 'tipo inválido ("xyz")', sessao: S.ana, req: INS('TLC Tipo Ruim', 'xyz'), esp: 'sucesso: false (se o MySQL estiver em modo não estrito, o enum aceita "" e volta sucesso: true: valide o tipo no PHP)', ok: j => falha(j) },
        { n: 'nome vazio', sessao: S.ana, req: INS('', 'casa'), esp: 'sucesso: false (localização sem nome não deveria ser criada)', ok: j => falha(j) },
        { n: 'cliente tenta criar', sessao: S.cliente, req: INS('TLC Cliente Loc', 'casa'), esp: recusa, ok: j => falha(j) },
        { n: 'sem login tenta criar', sessao: S.nenhuma, aceitaAviso: true, req: INS('TLC Anonimo', 'casa'), esp: 'sucesso: false (hoje $pro e $clin ficam indefinidos e cria uma localização sem dono)', ok: j => falha(j) },
        { n: 'Ana lista: as 2 novas dela aparecem com ela como dona', sessao: S.ana, req: PEGL, esp: 'inclui "TLC Nova Ana" e "TLC Ana\'s" com loc_pro 611',
          ok: j => { const a = achar(j, 'loc_nome', 'TLC Nova Ana'), b = achar(j, 'loc_nome', "TLC Ana's"); return !!a && !!b && String(a.loc_pro) === '611' && String(b.loc_pro) === '611'; } },
        { n: 'clínica Beta lista: a nova é dela (loc_clin 622)', sessao: S.beta, req: PEGL, esp: 'inclui "TLC Nova Beta" com loc_clin 622 e loc_pro nulo',
          ok: j => { const r = achar(j, 'loc_nome', 'TLC Nova Beta'); return !!r && String(r.loc_clin) === '622' && r.loc_pro === null; } },
        { n: 'Paulo lista: a da clínica Alfa NÃO é dele', sessao: S.paulo, req: PEGL, esp: 'sucesso, dados vazio', ok: j => vazio(j) },
        { n: 'clínica Alfa lista: a nova é dela (loc_clin 621, loc_pro nulo)', sessao: S.alfa, req: PEGL, esp: 'inclui "TLC Nova Alfa" com loc_clin 621 e loc_pro nulo',
          ok: j => { const r = achar(j, 'loc_nome', 'TLC Nova Alfa'); return !!r && String(r.loc_clin) === '621' && r.loc_pro === null; } },

        /* ================= inserirsala ================= */
        { grupo: 'inserirsala', n: 'Ana cria uma sala na localização dela (641)', sessao: S.ana, req: SAL('641', 'TLC Sala Nova'), esp: 'sucesso: true, sem mensagem de erro', ok: j => ok(j) },
        { n: 'Ana tenta criar sala na localização do Bruno (643)', sessao: S.ana, req: SAL('643', 'TLC Sala Invasora'), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'clínica Alfa cria sala na unidade dela (644)', sessao: S.alfa, req: SAL('644', 'TLC Sala Alfa Nova'), esp: 'sucesso: true, sem mensagem de erro', ok: j => ok(j) },
        { n: 'clínica Alfa tenta criar sala na localização da Ana (641)', sessao: S.alfa, req: SAL('641', 'TLC Sala Invasora 2'), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'Paulo (profissional 621) tenta criar sala na 644 da clínica Alfa (mesmo id)', sessao: S.paulo, req: SAL('644', 'TLC Sala Paulo'), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'localização que não existe (999999)', sessao: S.ana, req: SAL('999999', 'TLC Sala Fantasma'), esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'nome de sala vazio', sessao: S.ana, req: SAL('641', ''), esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'cliente tenta criar sala', sessao: S.cliente, req: SAL('641', 'TLC Sala Cliente'), esp: recusa, ok: j => falha(j) },
        { n: 'Ana lista as salas: a nova aparece na localização 641', sessao: S.ana, req: PEGS, esp: 'inclui "TLC Sala Nova" com sala_loc 641 (e continua sem a "Invasora")',
          ok: j => { const r = achar(j, 'sala_nome', 'TLC Sala Nova'); return !!r && String(r.sala_loc) === '641' && !achar(j, 'sala_nome', 'TLC Sala Invasora'); } },

        /* ================= editarloc ================= */
        { grupo: 'editarloc', n: 'Ana renomeia a localização 641', sessao: S.ana, req: EDL(['nome'], ['641', 'TLC Consultório Renomeado']), esp: 'sucesso: true', ok: j => ok(j) },
        { n: 'Ana muda nome e tipo da 642', sessao: S.ana, req: EDL(['nome', 'tipo'], ['642', 'TLC Domicílio Editado', 'casa']), esp: 'sucesso: true', ok: j => ok(j) },
        { n: 'Bruno tenta editar a 641 (da Ana)', sessao: S.bruno, req: EDL(['nome'], ['641', 'TLC Invadida']), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'clínica Alfa edita a 644', sessao: S.alfa, req: EDL(['nome'], ['644', 'TLC Unidade Alfa Editada']), esp: 'sucesso: true', ok: j => ok(j) },
        { n: 'clínica Alfa tenta editar a 641 (da Ana)', sessao: S.alfa, req: EDL(['nome'], ['641', 'TLC Invadida 2']), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'Paulo (profissional 621) tenta editar a 644 da clínica Alfa (mesmo id)', sessao: S.paulo, req: EDL(['nome'], ['644', 'TLC Invadida 3']), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'campo que não pode ser editado ("dono")', sessao: S.ana, req: EDL(['dono'], ['641', '999']), esp: 'sucesso: false, "Campo de atualização não válido"', ok: j => falha(j) && /v[aá]lido/i.test(msg(j)) },
        { n: 'tipo inválido ("xyz")', sessao: S.ana, req: EDL(['tipo'], ['641', 'xyz']), esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'localização que não existe (999999)', sessao: S.ana, req: EDL(['nome'], ['999999', 'TLC Fantasma']), esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'cliente tenta editar', sessao: S.cliente, req: EDL(['nome'], ['641', 'TLC Cliente Edita']), esp: recusa, ok: j => falha(j) },
        { n: 'sem login tenta editar', sessao: S.nenhuma, aceitaAviso: true, req: EDL(['nome'], ['641', 'TLC Anonimo Edita']), esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'Ana lista: as edições aparecem e a invadida não', sessao: S.ana, req: PEGL, esp: '641 "TLC Consultório Renomeado"; 642 "TLC Domicílio Editado" tipo casa',
          ok: j => { const a = achar(j, 'loc_id', 641), b = achar(j, 'loc_id', 642); return !!a && !!b && a.loc_nome === 'TLC Consultório Renomeado' && b.loc_nome === 'TLC Domicílio Editado' && b.loc_tipo === 'casa'; } },

        /* ================= editarsala ================= */
        { grupo: 'editarsala', n: 'Ana renomeia a sala 651', sessao: S.ana, req: EDS('651', 'TLC Sala 1 Editada'), esp: 'sucesso: true', ok: j => ok(j) },
        { n: 'Bruno tenta renomear a sala 651 (da Ana)', sessao: S.bruno, req: EDS('651', 'TLC Sala Invadida'), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'clínica Alfa renomeia a sala 655', sessao: S.alfa, req: EDS('655', 'TLC Sala A Editada'), esp: 'sucesso: true', ok: j => ok(j) },
        { n: 'Paulo (profissional 621) tenta renomear a sala 655 da clínica Alfa', sessao: S.paulo, req: EDS('655', 'TLC Sala Invadida 2'), esp: 'sucesso: false, "você não é o dono dessa localização"', ok: j => naoDono(j) },
        { n: 'sala que não existe (999999)', sessao: S.ana, req: EDS('999999', 'TLC Sala Fantasma'), esp: 'sucesso: false', ok: j => falha(j) },
        { n: 'cliente tenta renomear sala', sessao: S.cliente, req: EDS('651', 'TLC Sala Cliente Edita'), esp: recusa, ok: j => falha(j) },
        { n: 'Ana lista as salas: a edição aparece', sessao: S.ana, req: PEGS, esp: 'sala 651 "TLC Sala 1 Editada" e sem "TLC Sala Invadida"',
          ok: j => { const r = achar(j, 'sala_id', 651); return !!r && r.sala_nome === 'TLC Sala 1 Editada' && !achar(j, 'sala_nome', 'TLC Sala Invadida'); } },

        /* ================= geral ================= */
        { grupo: 'requisição geral', n: 'requisição sem ação', sessao: S.ana, req: {}, esp: 'JSON com sucesso: false ("Ação não enviada")', ok: j => falha(j) },
        { n: 'ação inexistente', req: { acao: 'nao_existe' }, esp: 'resposta vazia ou sucesso: false (o switch não tem default)', ok: (j, r) => txt(r) === '' || falha(j) }
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
        const res = await enviar(t.req);
        let certo = false;
        try { certo = !!t.ok(res.json, res) && (t.aceitaAviso || !(res.json && res.json.__sujo)); } catch (e) { certo = false; }
        if (certo) passou++;
        brutos.push({ teste: t.n, enviado: t.req, status: res.status, resposta: res.json ?? res.texto });

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