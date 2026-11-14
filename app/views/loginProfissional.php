<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="stylesheet" href="public/assets/css/variaveis.css" />
    <link rel="stylesheet" href="public/assets/css/componentes.css" />
    <link rel="stylesheet" href="public/assets/css/autenticacaoBase.css" />
    <link rel="stylesheet" href="public/assets/css/loginProfissional.css" />
    <title>Login de Profissional</title>
</head>

<body>
    <a href="#conteudoLogin" class="linkPularConteudo">Pular para o conteúdo principal</a>

    <nav class="navTopoDeslogado" aria-label="Navegação principal">
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

    <main id="conteudoLogin" class="container-fluid">
        <div id="alertContainer" class="position-fixed top-0 start-50 translate-middle-x p-3" style="z-index: 9999;"></div>
        <div class="row g-0 min-vh-100">

            <div id="imgBox" class="d-none d-md-block col-md-6">
                <img src="public/assets/images/bannerVertical.jpg" alt="" class="img-fluid h-100 w-100 object-fit-cover">
            </div>

            <div id="colForm" class="col-12 col-md-6 d-flex justify-content-center align-items-start">
                <div class="form-wrapper">

                    <div id="loginProfissional">
                        <div class="text-center mt-4">
                            <div class="d-flex align-items-center justify-content-center gap-2">
                                <img src="public/assets/images/logo_verde.png" alt="Podopsi" class="logo-titulo">
                                <h1 class="m-0">Seja Bem-Vindo de Volta!</h1>
                            </div>
                            <p class="text-muted mt-2 mx-auto" style="max-width: 400px;">
                                Faça um login como profissional para que os clientes possam encontrar seus serviços.
                            </p>
                        </div>
                        <form class="mt-4" enctype="multipart/form-data">
                                <div class="form-floating mb-3">
                                    <input name="cxproEmailLog" id="emailCadastroLog" class="form-control" type="email"
                                        placeholder="E-mail" required>
                                    <label for="emailCadastroLog">E-mail</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input name="cxproSenhaLog" id="senhaProfissionalLog" class="form-control" type="password"
                                        placeholder="Senha" required>
                                    <label for="senhaProfissionalLog">Senha</label>
                                </div>
                                <div class="d-grid mb-3">
                                    <button type="submit" id="btnLogar" class="btn botaoBase botaoBase--primario">Logar</button>
                                </div>
                        </form>

                        <p> Não tem conta? <a href="index.php?uri=cadastroProfissional">Cadastre-se</a></p>

                    </div>

                </div>
            </div>
        </div>
    </main>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="public/assets/js/componentes.js"></script>
    <script src="public/assets/js/utilitarios.js"></script>
    <script src="public/assets/js/loginProfissional.js"></script>

</body>

</html>
