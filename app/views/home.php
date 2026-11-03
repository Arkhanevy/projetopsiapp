<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Podopsi - Início</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /> <!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais de design -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/home.css" /><!-- CSS próprio -->
</head>
<body>
  <a href="#conteudoHome" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <nav class="navTopoDeslogado" aria-label="Navegação principal">
    <div class="navTopoDeslogado_barra navTopoDeslogado_acoes">
      <a href="#" class="navTopoDeslogado_logo">
        <img src="public/assets/images/logo.png" alt="" width="50" height="50">
        <!--<span class="material-symbols-outlined" aria-hidden="true">eco</span> -->
        <span data-nomePlataforma="">Podopsi</span>
      </a>

      <div class="navTopoDeslogado_acoes">
        <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Cadastre-se</button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="index.php?uri=cadastroCliente">Sou um cliente</a></li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroProfissional">Sou um profissional</a>
          </li>
          <li><a class="dropdown-item" href="index.php?uri=cadastroClinica">Sou uma clínica</a></li>
        </ul>
        <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Entrar</button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="index.php?uri=loginCliente">Sou um cliente</a></li>
          <li><a class="dropdown-item" href="index.php?uri=loginProfissional">Sou um profissional</a>
          </li>
          <li><a class="dropdown-item" href="index.php?uri=loginClinica">Sou uma clínica</a></li>
        </ul>
      </div>
    </div>
    <div class="navTopoDeslogado_secundaria">
      <a href="#" class="navTopoDeslogado_link navTopoDeslogado_link--ativo" aria-current="page">Como funciona</a>
      <a href="#" class="navTopoDeslogado_link">Encontre serviços</a>
      <a href="#" class="navTopoDeslogado_link">Encontre profissionais</a>
      <a href="#" class="navTopoDeslogado_link">Encontre clínicas</a>
      <a href="#" class="navTopoDeslogado_link">Central de ajuda</a>
    </div>
  </nav>

  <div class="fundo">


    <main id="conteudoHome">
      <section class="mb-5" aria-labelledby="tituloPesquisa">
        <h1 id="tituloPesquisa" class="visually-hidden">Pesquisar serviços e profissionais</h1>

        <!-- campoPesquisa (DS). Dispara o evento "pesquisaAcionada" com { termo }; -->
        <!-- o que acontece depois da busca é definido pelo JS da página.          -->
        <div class="input-group campoPesquisa campoPesquisaHome" role="search">
          <input class="form-control campoPesquisa_input" type="search" placeholder="Pesquise" aria-label="Pesquisar">
          <button type="button" class="btn campoPesquisa_botaoIcone" aria-label="Buscar">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
          </button>
        </div>
      </section>
    </main>

  </div>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script><!-- jQuery -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script><!-- Bootstrap 5 (bundle com Popper) -->
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/buscaComum.js"></script><!-- Código compartilhado da busca -->
  <script src="public/assets/js/home.js"></script><!-- JS próprio da página -->
</body>

</html>