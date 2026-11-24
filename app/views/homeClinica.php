<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Podopsi - Para clínicas</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link rel="stylesheet" href="public/assets/css/variaveis.css" />
  <link rel="stylesheet" href="public/assets/css/componentes.css" />
  <link rel="stylesheet" href="public/assets/css/home.css" />
</head>

<body>
  <a href="#conteudoHome" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <!-- Navegação (componente navTopoDeslogado) -->
  <nav class="navTopoDeslogado" aria-label="Navegação principal">
    <div class="navTopoDeslogado_barra">
      <a href="index.php" class="navTopoDeslogado_logo">
        <img src="public/assets/images/logo.png" alt="" width="50" height="50">
        <span data-nomePlataforma="">Podopsi</span>
      </a>

      <div class="navTopoDeslogado_acoes d-none d-lg-flex">
        <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Cadastre-se</button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="index.php?uri=cadastroCliente">Sou um cliente</a></li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroProfissional">Sou um profissional</a></li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroClinica">Sou uma clínica</a></li>
        </ul>
        <a class="nav-link navbar-brand navTopoDeslogado_acao" href="index.php?uri=login">Entrar</a>
      </div>

      <button type="button" class="navTopoLogado_botaoMenuMobile d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobileHome" aria-controls="painelMenuMobileHome" aria-label="Abrir menu">
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
    </div>

    <div class="navbar navTopoDeslogado_secundaria">
      <ul class="navbar-nav flex-row justify-content-between w-100">
        <li class="nav-item"><a href="#comoFunciona" class="nav-link active" aria-current="page">Como funciona</a></li>
        <li class="nav-item"><a href="index.php?uri=resultadosBusca&aba=servicos" class="nav-link">Encontre serviços</a></li>
        <li class="nav-item"><a href="index.php?uri=resultadosBusca&aba=profissionais" class="nav-link">Encontre profissionais</a></li>
        <li class="nav-item"><a href="index.php?uri=resultadosBusca&aba=clinicas" class="nav-link">Encontre clínicas</a></li>
        <li class="nav-item"><a href="index.php?uri=centralAjuda" class="nav-link">Central de ajuda</a></li>
      </ul>
    </div>
  </nav>

  <!-- Menu mobile (componente painelMenuMobile) -->
  <div class="offcanvas offcanvas-top painelMenuMobile d-lg-none" tabindex="-1" id="painelMenuMobileHome" aria-labelledby="tituloPainelMenuMobileHome">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobileHome">
        <img src="public/assets/images/logo.png" alt="" width="40" height="40">
        <span data-nomePlataforma="">Podopsi</span>
      </a>
      <button type="button" class="painelMenuMobile_botaoFechar" data-bs-dismiss="offcanvas" aria-label="Fechar menu">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="offcanvas-body">
      <ul class="painelMenuMobile_lista">
        <li><a href="index.php?uri=login" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">login</span>Entrar</a></li>
        <li><a href="index.php?uri=cadastroCliente" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">person_add</span>Cadastrar como cliente</a></li>
        <li><a href="index.php?uri=cadastroProfissional" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">badge</span>Cadastrar como profissional</a></li>
        <li><a href="index.php?uri=cadastroClinica" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">apartment</span>Cadastrar como clínica</a></li>
        <li><a href="#comoFunciona" class="painelMenuMobile_item" data-bs-dismiss="offcanvas">Como funciona</a></li>
        <li><a href="index.php?uri=resultadosBusca&aba=servicos" class="painelMenuMobile_item">Encontre serviços</a></li>
        <li><a href="index.php?uri=resultadosBusca&aba=profissionais" class="painelMenuMobile_item">Encontre profissionais</a></li>
        <li><a href="index.php?uri=resultadosBusca&aba=clinicas" class="painelMenuMobile_item">Encontre clínicas</a></li>
        <li><a href="index.php?uri=centralAjuda" class="painelMenuMobile_item">Central de ajuda</a></li>
      </ul>
    </div>
  </div>

  <main id="conteudoHome">

    <!-- Hero (versão clínica) -->
    <section class="heroHome" aria-labelledby="tituloHome">
      <div class="container heroHome_conteudo">
        <h1 id="tituloHome" class="heroHome_titulo">Gerencie profissionais</h1>
        <p class="heroHome_subtitulo">Organize profissionais, agendas e atendimentos em uma plataforma feita para clínicas de podologia.</p>

        <div class="heroHome_acoes">
          <a href="index.php?uri=homeProfissional" class="btn botaoBase botaoBase--secundario botaoBase--longo">Sou um profissional</a>
          <a href="index.php?uri=home" class="btn botaoBase botaoBase--secundario botaoBase--longo">Sou um paciente</a>
        </div>
      </div>
    </section>

    <!-- Por que usar -->
    <section id="comoFunciona" class="secaoRecursos" aria-labelledby="tituloRecursos">
      <div class="container text-center">
        <h2 id="tituloRecursos" class="secaoHome_titulo">Mas por quê o Podopsi?</h2>
        <p class="secaoRecursos_texto mx-auto">O Podopsi busca tornar seu agendamento algo simples e fácil para ambos os lados, para isso ele conta com:</p>
        <ul id="listaRecursos" class="row row-cols-2 row-cols-lg-4 g-3 g-lg-4 list-unstyled mt-3 mb-0">
          <li class="col d-flex">
            <article class="card cardEntidadeBase cardRecurso mx-auto">
              <div class="card-body">
                <h3 class="card-title cardEntidadeBase_titulo">Gerenciamento dos profissionais</h3>
                <img class="cardEntidadeBase_imagem" src="public/assets/images/home/equipe.jpg" alt="Equipe de três profissionais de saúde" width="240" height="240" loading="lazy">
              </div>
            </article>
          </li>
          <li class="col d-flex">
            <article class="card cardEntidadeBase cardRecurso mx-auto">
              <div class="card-body">
                <h3 class="card-title cardEntidadeBase_titulo">Notificações de agendamento</h3>
                <img class="cardEntidadeBase_imagem" src="public/assets/images/home/notificacoes.jpg" alt="Notebook exibindo um calendário com lembrete" width="240" height="240" loading="lazy">
              </div>
            </article>
          </li>
          <li class="col d-flex">
            <article class="card cardEntidadeBase cardRecurso mx-auto">
              <div class="card-body">
                <h3 class="card-title cardEntidadeBase_titulo">Relatórios automáticos</h3>
                <img class="cardEntidadeBase_imagem" src="public/assets/images/home/doutora-documentos.jpg" alt="Profissional de saúde apresentando um relatório" width="240" height="240" loading="lazy">
              </div>
            </article>
          </li>
          <li class="col d-flex">
            <article class="card cardEntidadeBase cardRecurso mx-auto">
              <div class="card-body">
                <h3 class="card-title cardEntidadeBase_titulo">Localização das clínicas</h3>
                <img class="cardEntidadeBase_imagem" src="public/assets/images/home/localizacao.jpg" alt="Lupa sobre um globo com marcador de local" width="240" height="240" loading="lazy">
              </div>
            </article>
          </li>
        </ul>
      </div>
    </section>

    <!-- Missão e objetivos -->
    <section class="secaoMissao" aria-labelledby="tituloMissao">
      <div class="container">
        <h2 id="tituloMissao" class="secaoHome_titulo text-center">Nossa missão</h2>

        <div class="row g-4 align-items-start justify-content-center mt-2">
          <div class="col-4 col-md-3 col-lg-2">
            <div class="logoMissao ratio ratio-1x1 rounded-4">
              <img src="public/assets/images/logo.png" alt="Logo do Podopsi" class="p-2">
            </div>
          </div>
          <div class="col-8 col-md-8 col-lg-6">
            <p class="mb-0">Pensando na experiência do usuário, cada tela foi projetada para diminuir o número de etapas. Isso facilita a navegação e torna o processo de agendamento simples para clientes, profissionais e clínicas.</p>
          </div>
        </div>

        <div class="row g-4 align-items-center justify-content-center mt-4 mt-lg-5">
          <div class="col-7 col-md-6 col-lg-5">
            <h2 class="h3 fw-normal">Nossos objetivos</h2>
            <p>Desenvolver um sistema que proporcione ao usuário:</p>
            <ul class="list-unstyled listaObjetivos mb-0">
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Simplicidade</li>
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Acessibilidade</li>
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Organização</li>
              <li><span class="material-symbols-outlined" aria-hidden="true">check</span>Usabilidade</li>
            </ul>
          </div>
          <div class="col-5 col-md-4 col-lg-3">
            <img src="public/assets/images/home/alvo.jpg" alt="Alvo com uma flecha no centro" class="imagemObjetivo img-fluid rounded-4" width="240" height="240" loading="lazy">
          </div>
        </div>
      </div>
    </section>

    <!-- Chamada final -->
    <section class="secaoChamada text-center" aria-labelledby="tituloChamada">
      <div class="container">
        <h2 id="tituloChamada" class="secaoHome_titulo">Pronto para a sua consulta?</h2>
        <a id="botaoCadastrar" href="index.php?uri=cadastroClinica" class="btn botaoBase botaoBase--secundario btn-lg mt-3">Cadastrar-se!</a>
      </div>
    </section>
  </main>

  <footer class="rodapeHome">
    <div class="container d-flex flex-wrap justify-content-between gap-2">
      <a href="mailto:centralPodopsi@gmail.com">Fale conosco</a>
      <a href="mailto:centralPodopsi@gmail.com">centralPodopsi@gmail.com</a>
    </div>
  </footer>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script>
  <script src="public/assets/js/utilitarios.js"></script>
</body>

</html>