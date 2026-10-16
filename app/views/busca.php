<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Buscar - Podopsi</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/busca.css" /><!-- CSS próprio da página -->
</head>
<body>

  <a href="#conteudoBusca" class="linkPularConteudo">Pular para o conteúdo principal</a>

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
    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobileBusca" aria-controls="painelMenuMobileBusca" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <!-- PAINEL DO MENU (MOBILE, LOGADO) -->
  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobileBusca" aria-labelledby="tituloPainelMenuMobileBusca">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobileBusca">
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

  <!-- NAVEGAÇÃO LATERAL (DESKTOP, LOGADO) — exibida por JS quando há sessão -->
  <nav class="navLateralLogado d-none d-md-flex" data-papel="cliente" aria-label="Navegação principal" hidden>
    <a href="index.php?uri=buscar" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemPapel>
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <span class="navLateralLogado_rotulo">Buscar</span>
    </a>
    <a href="index.php?uri=mensagens" class="navLateralLogado_item" data-itemContatos>
      <span class="material-symbols-outlined" aria-hidden="true">chat</span>
      <span class="navLateralLogado_rotulo">Contatos</span>
    </a>
    <a href="index.php?uri=notificacoes" class="navLateralLogado_item">
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
    <main id="conteudoBusca" class="conteudoBusca">

      <section class="secaoBusca" aria-labelledby="tituloBusca">

        <!--
          Título animado. Leitores de tela leem a frase fixa ("Busque por serviço,
          profissional ou clínica"); a janela animada é só visual (aria-hidden).
          O JS alterna o termo ativo e o placeholder do campo (data-placeholderBusca)
          a cada data-intervaloTroca (ms).
        -->
        <h1 class="tituloBusca" id="tituloBusca" data-intervaloTroca="3000">
          <span class="tituloBusca_prefixo" aria-hidden="true">Busque por</span>
          <span class="tituloBusca_janela" aria-hidden="true">
            <span class="tituloBusca_termo tituloBusca_termo--ativo" data-tipoBusca="servicos" data-placeholderBusca="Digite o nome do serviço">Serviço</span>
            <span class="tituloBusca_termo" data-tipoBusca="profissionais" data-placeholderBusca="Digite o nome do profissional">Profissional</span>
            <span class="tituloBusca_termo" data-tipoBusca="clinicas" data-placeholderBusca="Digite o nome da clínica">Clínica</span>
          </span>
          <span class="visually-hidden">Busque por serviço, profissional ou clínica</span>
        </h1>

        <!-- campoPesquisa (DS). Dispara "pesquisaAcionada" com { termo }; o JS da página decide o que fazer. -->
        <div class="input-group campoPesquisa campoPesquisaBusca" id="campoPesquisaBusca" role="search">
          <input class="form-control campoPesquisa_input" id="entradaBusca" type="search" placeholder="Digite o nome do serviço" aria-label="Pesquisar serviço, profissional ou clínica" aria-describedby="avisoBusca" autocomplete="off" enterkeyhint="search">
          <button type="button" class="btn campoPesquisa_botaoIcone" id="botaoBuscar" aria-label="Buscar">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
          </button>
        </div>
        <p class="campoPesquisa_aviso textoCaption" id="avisoBusca" role="alert" hidden>Digite algo para pesquisar.</p>

        <!-- Sugestões fixas: o clique preenche o campo e já dispara a busca -->
        <section class="sugestoesBusca" aria-labelledby="tituloSugestoesBusca">
          <h2 class="sugestoesBusca_titulo" id="tituloSugestoesBusca">Sugestões de busca</h2>
          <ul class="sugestoesBusca_lista">
            <li class="sugestoesBusca_item"><button type="button" class="sugestoesBusca_botao" data-termoSugestao="Pedicure">Pedicure</button></li>
            <li class="sugestoesBusca_item"><button type="button" class="sugestoesBusca_botao" data-termoSugestao="Hidratação dos Pés">Hidratação dos Pés</button></li>
            <li class="sugestoesBusca_item"><button type="button" class="sugestoesBusca_botao" data-termoSugestao="Avaliação Podológica">Avaliação Podológica</button></li>
            <li class="sugestoesBusca_item"><button type="button" class="sugestoesBusca_botao" data-termoSugestao="Corte Técnico das Unhas">Corte Técnico das Unhas</button></li>
            <li class="sugestoesBusca_item"><button type="button" class="sugestoesBusca_botao" data-termoSugestao="Tratamento de Calosidade">Tratamento de Calosidade</button></li>
          </ul>
        </section>

      </section>

    </main>

    <!-- NAVEGAÇÃO INFERIOR (MOBILE, LOGADO) — exibida por JS quando há sessão -->
    <nav class="navInferiorLogado d-flex d-md-none" data-papel="cliente" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php?uri=buscar" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemPapel>
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

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- Bootstrap 5 (bundle com Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/utilitarios.js"></script><!-- Helpers globais -->
  <script src="public/assets/js/sessaoNavegacao.js"></script><!-- Decide qual navegação exibir -->
  <script src="public/assets/js/buscaComum.js"></script><!-- Código compartilhado da busca -->
  <script src="public/assets/js/busca.js" defer></script><!-- JS próprio da página -->
</body>
</html>
