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
    <link rel="stylesheet" href="public/assets/css/autenticacaoBase.css" />
    <link rel="stylesheet" href="public/assets/css/cadastroCliente.css" />
    <title>Cadastro do Cliente</title>
  <link rel="stylesheet" href="public/assets/css/responsivo.css" />
</head>

<body>
    <a href="#conteudoCadastro" class="linkPularConteudo">Pular para o conteúdo principal</a>
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
                <a class="nav-link navbar-brand navTopoDeslogado_acao" href="index.php?uri=login">Entrar</a>
            </div>
        </div>
    </nav>

    <main id="conteudoCadastro" class="container-fluid">
        <div id="alertContainer" class="position-fixed top-0 start-50 translate-middle-x p-3"></div>
        <div class="row g-0 min-vh-100">

            <div id="imgBox" class="d-none d-md-block col-md-6">
                <img src="public/assets/images/bannerVertical.jpg" alt="" class="img-fluid h-100 w-100 object-fit-cover">
            </div>

            <div id="colForm" class="col-12 col-md-6 d-flex justify-content-center align-items-start">
                <div class="form-wrapper">

                    <div id="cadastroCliente" class="cadastro">
                        <div class="text-center mt-4">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <img src="public/assets/images/logo_verde.png" alt="Podopsi" class="logo-titulo">
                                <h1 class="m-0">Seja Bem-Vindo!</h1>
                            </div>
                            <p class="text-muted mt-2 mx-auto">
                                Cadastre-se para poder agendar suas consultas.
                            </p>
                        </div>

                        <form id="formCliente" enctype="multipart/form-data" novalidate>
                            <input type="hidden" name="acao" value="cadastrar">
                            <div class="avatar-container">
                                <img id="preview" src="public/assets/images/logo_user.png" alt="Foto de perfil">
                                <!-- [ARQUIVOS DESATIVADOS] "required" removido. Original:
                                <input name="cxclientefoto" type="file" aria-label="Foto de perfil" id="img_perfil" accept="image/*" data-tiposPermitidos="" data-tamanhoMaximoMb="" required>
                                -->
                                <input name="cxclientefoto" type="file" aria-label="Foto de perfil" id="img_perfil" accept="image/*" data-tiposPermitidos="" data-tamanhoMaximoMb="">
                            </div>

                            <p class="text-center mt-2 textoAjudaFoto">
                                Clique na imagem para adicionar foto
                            </p>

                            <div class="form-floating campoTexto mb-3">
                                <input name="nome" id="nomeCliente" class="form-control" type="text" placeholder="Nome" required>
                                <label for="nomeCliente">Nome completo</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="username" id="userCliente" class="form-control" type="text" placeholder="Username" required>
                                <label for="userCliente">Username</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="email" id="emailCadastro" class="form-control" type="email" placeholder="E-mail" required>
                                <label for="emailCadastro">E-mail</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="telefone" id="telCliente" data-mascara="telefone" class="form-control" type="tel" placeholder="Telefone" required>
                                <label for="telCliente">Telefone</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="dtNas" id="dtnCli" class="form-control" type="date" placeholder="Data de Nascimento" required>
                                <label for="dtnCli">Data de Nascimento</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <select name="genero" id="generoCliente" class="form-select">
                                    <option value="" selected disabled>Selecione uma opção</option>
                                         <option value="F">Feminino</option>
                                        <option value="M">Masculino</option>
                                        <option value="O">Não Binario</option>
                                        <option value="I">Prefiro não dizer</option>
                                </select>
                                <label for="generoCliente">Gênero</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="CPF" id="CPF" data-mascara="cpf" inputmode="numeric" class="form-control" type="text" placeholder="CPF" required>
                                <label for="CPF">CPF</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="senha" id="senhaCliente" class="form-control" type="password" placeholder="Senha" required>
                                <label for="senhaCliente">Senha</label>
                            </div>
                            <div class="d-grid mb-3">
                                <button type="button" id="btnCadastrar" class="btn botaoBase botaoBase--primario">Cadastrar</button>
                            </div>
                        </form>

                        <p>
                            Já tem uma conta? <a href="index.php?uri=login">Faça login</a>
                        </p>
                    </div>

                    <div id="ativacao">
                            <div class="text-center mt-4">
                                <div class="d-flex align-items-center gap-2 flex-wrap">
                                    <img src="public/assets/images/logo_verde.png" alt="Podopsi" class="logo-titulo">
                                    <h1 class="m-0">Seja Bem-Vindo!</h1>
                                </div>
                                <p class="text-muted mt-2 mx-auto">
                                    Um código de ativação foi enviado para o seu e-mail.
                                </p>
                            </div>

                            <form id="formAtivacao">
                                <div class="form-floating campoTexto mt-4 mb-3">
                                    <input name="cod" id="codigoAtivacao" class="form-control" type="text" placeholder="Código de Ativação" autocomplete="one-time-code" required>
                                    <label for="codigoAtivacao">Código de Ativação</label>
                                </div>
                                <div class="d-grid mb-3">
                                    <button type="button" id="btnAtivar" class="btn botaoBase botaoBase--primario mb-3">Ativar</button>
                                    <button type="button" id="btnCodigo" class="btn botaoBase botaoBase--primario">Gerar código</button>
                                </div>
                            </form>
                        </div>

                </div>
            </div>
        </div>
    </main>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="public/assets/js/componentes.js"></script>
    <script src="public/assets/js/utilitarios.js"></script>
    <script src="public/assets/js/cadCliente.js" defer></script>

</body>

</html>
