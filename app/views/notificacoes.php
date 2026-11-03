<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notificação - Podopsi</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/notificacoes.css" /><!-- CSS próprio da página -->
</head>
<body>

  <a href="#conteudoNotificacoes" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <!-- NAVEGAÇÃO (DESLOGADO) — exibida por sessaoNavegacao.js quando não há sessão -->
  <nav class="navTopoDeslogado" aria-label="Navegação principal" hidden>
    <div class="navTopoDeslogado_barra navTopoDeslogado_acoes">
      <a href="index.php" class="navTopoDeslogado_logo">
        <img src="public/assets/images/logo.png" alt="Podopsi" width="50" height="50">
        <span data-nomePlataforma="">Podopsi</span>
      </a>
      <div class="navTopoDeslogado_acoes">
        <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Cadastre-se</button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="index.php?uri=cadastroCliente">Sou um cliente</a></li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroProfissional">Sou um profissional</a></li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroClinica">Sou uma clínica</a></li>
        </ul>
        <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Entrar</button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="index.php?uri=loginCliente">Sou um cliente</a></li>
          <li><a class="dropdown-item" href="index.php?uri=loginProfissional">Sou um profissional</a></li>
          <li><a class="dropdown-item" href="index.php?uri=loginClinica">Sou uma clínica</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- BARRA SUPERIOR (LOGADO — DESKTOP E MOBILE) — exibida por JS quando há sessão -->
  <header class="navTopoLogado" hidden>
    <a href="index.php" class="navTopoLogado_logo">
      <img src="public/assets/images/logo.png" alt="" width="40" height="40">
      <span data-nomePlataforma="">Podopsi</span>
    </a>

    <!-- Desktop: menu hambúrguer em dropdown -->
    <div class="dropdown menuHamburguerLogado d-none d-md-block">
      <button type="button" class="menuHamburguerLogado_botao dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu">
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end menuHamburguerLogado_lista">
        <li><a href="index.php?uri=configuracao" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">settings</span>Configuração</a></li>
        <li><a href="index.php?uri=centralAjuda" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">support_agent</span>Central de ajuda</a></li>
        <li><a href="#" class="dropdown-item menuHamburguerLogado_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>

    <!-- Mobile: o hambúrguer abre o painelMenuMobile (offcanvas) -->
    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobileNotificacoes" aria-controls="painelMenuMobileNotificacoes" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <!-- PAINEL DO MENU (MOBILE, LOGADO) -->
  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobileNotificacoes" aria-labelledby="tituloPainelMenuMobileNotificacoes">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobileNotificacoes">
        <img src="public/assets/images/logo.png" alt="" width="40" height="40">
        <span data-nomePlataforma="">Podopsi</span>
      </a>
      <button type="button" class="painelMenuMobile_botaoFechar" data-bs-dismiss="offcanvas" aria-label="Fechar menu">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <ul class="painelMenuMobile_lista">
        <li><a href="index.php?uri=configuracao" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">settings</span>Configuração</a></li>
        <li><a href="index.php?uri=centralAjuda" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">support_agent</span>Central de ajuda</a></li>
      </ul>
      <ul class="painelMenuMobile_rodape">
        <li><a href="#" class="painelMenuMobile_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>
  </div>

  <!-- NAVEGAÇÃO LATERAL (DESKTOP, LOGADO) — exibida por JS quando há sessão.
       O data-papel inicial é ajustado por sessaoNavegacao.js (cliente | profissionalClinica). -->
  <nav class="navLateralLogado d-none d-md-flex" data-papel="cliente" aria-label="Navegação principal" hidden>
    <a href="index.php?uri=buscar" class="navLateralLogado_item" data-itemPapel>
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <span class="navLateralLogado_rotulo">Buscar</span>
    </a>
    <a href="index.php?uri=mensagens" class="navLateralLogado_item" data-itemContatos>
      <span class="material-symbols-outlined" aria-hidden="true">chat</span>
      <span class="navLateralLogado_rotulo">Contatos</span>
    </a>
    <a href="index.php?uri=notificacoes" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page">
      <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
      <span class="navLateralLogado_rotulo">Notificação</span>
    </a>
    <a href="index.php?uri=consultasCli" class="navLateralLogado_item" data-itemAgenda>
      <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
      <span class="navLateralLogado_rotulo">Agenda</span>
    </a>
    <div class="navLateralLogado_rodape">
      <a href="index.php?uri=perfil" class="navLateralLogado_item" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navLateralLogado_rotulo">Perfil</span>
      </a>
    </div>
  </nav>

  <div>

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="conteudoNotificacoes" class="conteudoNotificacoes" aria-busy="true">

      <h1 class="conteudoNotificacoes_titulo">Notificação</h1>

      <!-- Anuncia o resultado do carregamento para leitores de tela (preenchido pelo JS) -->
      <p class="visually-hidden" id="avisoNotificacoes" role="status" aria-live="polite"></p>

      <!-- ESTADOS DA PÁGINA (o JS exibe um por vez).
           O visitante deslogado usa o estado "erro" com o texto trocado pelo JS
           ("Entre na sua conta para ver suas notificações."), igual a contatos. -->
      <div class="estadoCarregando" data-estadoNotificacoes="carregando" hidden>
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Carregando notificações...</span>
        </div>
      </div>

      <div class="estadoVazio estadoVazio--pagina" data-estadoNotificacoes="erro" hidden>
        <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">error</span>
        <p class="estadoVazio_texto" role="alert">Não foi possível carregar as notificações.</p>
        <button type="button" class="btn botaoBase botaoBase--secundario" id="botaoTentarNovamenteNotificacoes">
          <span class="material-symbols-outlined" aria-hidden="true">refresh</span>Tentar novamente
        </button>
      </div>

      <div class="estadoVazio estadoVazio--pagina" data-estadoNotificacoes="vazio" hidden>
        <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">notifications</span>
        <p class="estadoVazio_texto">Nenhuma notificação encontrada</p>
      </div>

      <!-- LISTA DE NOTIFICAÇÕES (cards gerados a partir do template abaixo) -->
      <ul class="listaNotificacoes" data-estadoNotificacoes="lista" data-campo="listaNotificacoes" aria-label="Lista de notificações" hidden></ul>

    </main>


    <!-- NAVEGAÇÃO INFERIOR (MOBILE, LOGADO) — exibida por JS quando há sessão -->
    <nav class="navInferiorLogado d-flex d-md-none" data-papel="cliente" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php?uri=buscar" class="navInferiorLogado_item" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">search</span>
        <span class="navInferiorLogado_rotulo">Buscar</span>
      </a>
      <a href="index.php?uri=consultasCli" class="navInferiorLogado_item" data-itemAgenda>
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="navInferiorLogado_rotulo">Agenda</span>
      </a>
      <a href="index.php?uri=perfil" class="navInferiorLogado_item" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navInferiorLogado_rotulo">Perfil</span>
      </a>
    </nav>

  </div>

  <!-- MODAL: DETALHE DA NOTIFICAÇÃO (Bootstrap modal + modalBase).
       O JS preenche título e mensagem da notificação selecionada (apenas com .text()). -->
  <div class="modal fade modalBase modalNotificacao" id="modalNotificacao" tabindex="-1" aria-labelledby="tituloModalNotificacao" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content modalBase_conteudo">

        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalNotificacao" data-campo="tituloNotificacao"></h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div class="modal-body modalBase_corpo">
          <div class="modalNotificacao_mensagem" data-campo="mensagemNotificacao"></div>

          <!-- Link fixo no HTML: o JS só mostra/esconde o parágrafo (exibirLinkConsultas)
               e ajusta o caminho conforme o tipo de usuário. -->
          <p class="modalNotificacao_acao" data-campo="blocoLinkConsultas" hidden>
            Para acompanhar o status ou reagendar a consulta, acesse as
            <a href="index.php?uri=consultasCli" class="modalNotificacao_link" data-itemMinhasConsultas>Minhas Consultas</a>.
          </p>
        </div>

      </div>
    </div>
  </div>

  <!-- MODELOS (clonados pelo JS com os dados do banco) -->
  <template id="modeloCardNotificacao">
    <li class="listaNotificacoes_item">
      <button type="button" class="cardNotificacao" data-notificacaoId="" data-lida="" data-tipoNotificacao="" aria-haspopup="dialog">
        <span class="cardNotificacao_cabecalho">
          <span class="cardNotificacao_titulo" data-campo="tituloNotificacao"></span>
          <span class="indicadorStatus indicadorStatus--nova cardNotificacao_selo" data-campo="seloNova" hidden>Nova</span>
        </span>
        <span class="cardNotificacao_rodape">
          <span class="cardNotificacao_resumo" data-campo="resumoNotificacao"></span>
          <time class="cardNotificacao_data" data-campo="dataNotificacao" datetime=""></time>
        </span>
      </button>
    </li>
  </template>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- Bootstrap 5 (bundle com Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/utilitarios.js"></script><!-- Helpers globais -->
  <script src="public/assets/js/sessaoNavegacao.js"></script><!-- Decide qual navegação exibir -->
  <script src="public/assets/js/notificacoes.js" defer></script><!-- JS próprio da página -->
</body>
</html>
