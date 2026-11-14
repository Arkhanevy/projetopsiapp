<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="stylesheet" href="public/assets/css/variaveis.css" />
    <link rel="stylesheet" href="public/assets/css/componentes.css" />
    <title>Login do Cliente</title>
    <link rel="stylesheet" href="public/assets/css/loginCliente.css" />
</head>

<body>
    <a href="#conteudoLogin" class="linkPularConteudo">Pular para o conteúdo principal</a>
    <div id="alertContainer" class="position-fixed top-0 start-50 translate-middle-x p-3" style="z-index: 9999;"></div>

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

    <main id="conteudoLogin" class="container d-flex justify-content-center mt-3 min-vh-100">

        <div class="img-thumbnail bg-light border border-success p-4 rounded-4 shadow" id="loginCliente">
            <h1 class="text-muted mt-5 mx-auto">Seja Bem-Vindo de Volta!</h1>
            <p class="text-muted mt-5 mx-auto"> Entre para poder agendar suas consultas.</p>
            <form>
                <div class="form-floating campoTexto mt-5 mb-3">
                    <input name="cxcliEmail" id="emailLogin" class="form-control" type="email" placeholder="E-mail"
                        required>
                    <label for="emailLogin">E-mail</label>
                </div>
                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliSenha" id="senhaLogin" class="form-control" type="password" placeholder="Senha"
                        required>
                    <label for="senhaLogin">Senha</label>
                </div>
                <div class="d-grid mb-3">
                    <button type="submit" id="btnLogar" class="btn botaoBase botaoBase--primario">Logar</button>
                </div>
            </form>
            <p>Ainda não tem conta? <a href="index.php?uri=cadastroCliente">Faça o cadastro</a></p>
        </div>

    </main>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="public/assets/js/componentes.js"></script>
    <script src="public/assets/js/utilitarios.js"></script>
    <script src="public/assets/js/loginCliente.js" defer></script>

</body>

</html>
