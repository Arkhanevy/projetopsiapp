<?php
/**
 * Topo comum das páginas Home (paciente, profissional e clínica).
 * Espera: $homeTitulo (string).
 * Abre <html>, <body>, a navegação, o menu mobile e termina abrindo <main>.
 * O fechamento do <main> e o resto da página vêm de partials/homeBase.php.
 */
$homeTitulo = $homeTitulo ?? 'Podopsi';
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($homeTitulo, ENT_QUOTES, 'UTF-8') ?></title>
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
