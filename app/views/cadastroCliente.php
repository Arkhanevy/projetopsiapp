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
    <title>Cadastro do Cliente</title>
    <link rel="stylesheet" href="public/assets/css/cadastroCliente.css" />
</head>

<body>
    <a href="#conteudoCadastro" class="linkPularConteudo">Pular para o conteúdo principal</a>
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

    <main id="conteudoCadastro" class="container d-flex justify-content-center mt-3 min-vh-100">


        <div class="img-thumbnail bg-light border border-success p-4 rounded-4 shadow" id="cadastroCliente">
            <h1>Seja Bem-Vindo!</h1>
            <p class="text-muted mt-2 mx-auto"> Cadastre-se para poder agendar suas consultas.</p>
            <form>
                <div class="text-center">
                    <img class="img-fluid rounded-circle" id="preview" src="public/assets/images/logo_user.png" alt="Foto de perfil">
                    <input name="cxcliFoto" class="form-control" type="file" aria-label="Foto de perfil" id="img_perfil" accept="image/*" required>
                </div>

                <p class="text-center mt-2" style="font-size: 12px;">Clique na imagem para adicionar foto</p>

                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliNome" id="nomeCliente" class="form-control" type="text" placeholder="Nome" required>
                    <label for="nomeCliente">Nome completo</label>
                </div>
                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliUsername" id="userCliente" class="form-control" type="text" placeholder="Username"
                        required>
                    <label for="userCliente">Username</label>
                </div>
                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliEmail" id="emailCadastro" class="form-control" type="email" placeholder="E-mail"
                        required>
                    <label for="emailCadastro">E-mail</label>
                </div>
                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliTelefone" id="telCliente" data-mascara="telefone" class="form-control" type="tel" placeholder="Telfone"
                        required>
                    <label for="telCliente">Telefone</label>
                </div>
                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliDtn" id="dtnCli" class="form-control" type="date" placeholder="Data de Nascimento"
                        required>
                    <label for="dtnCli">Data de Nascimento</label>
                </div>
                <div class="form-floating campoTexto mb-3">
                    <select name="cxcliGenero" id="generoCliente" class="form-select">
                        <option value="" selected disabled>Selecione uma opção</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                    </select>
                    <label for="generoCliente">Gênero</label>
                </div> 

                
                <div class="form-floating campoTexto mb-3">
                    <label for="bioCliente">Biografia</label> <br />
                    <br /><textarea name="cxcliBiografia" id="bioCliente"
                        placeholder="Escreva sua biografia aqui."></textarea>
                </div>
                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliCPF" id="CPF" data-mascara="cpf" inputmode="numeric" class="form-control" type="text" placeholder="CPF" required>
                    <label for="CPF">CPF</label>
                </div>

                <div class="form-floating campoTexto mb-3">
                    <input name="cxcliSenha" id="senhaCliente" class="form-control" type="password" placeholder="Senha"
                        required>
                    <label for="senhaCliente">Senha</label>
                </div>
                <div class="d-grid mb-3">
                    <button type="submit" id="btnCadastrar" class="btn botaoBase botaoBase--primario">Cadastrar</button>
                </div>
            </form>
            <p>Já tem uma conta? <a href="index.php?uri=loginCliente">Faça login</a></p>
        </div>
        
        <div class="img-thumbnail bg-light border border-success p-4 rounded-4 shadow" id="ativacao">
            <h2 class="h1 text-muted mt-5 mx-auto">Seja Bem-Vindo!</h2>
            <p class="text-muted mt-5 mx-auto"> Um código de ativação foi enviado para o seu e-mail.</p>
            <form>
                <div class="form-floating campoTexto mt-5 mb-3">
                    <input name="cxcliCodigo" id="codigoCliente" class="form-control" type="text" placeholder="Código de Ativação" required>
                    <label for="codigoCliente">Código de Ativação</label>
                </div>
                <div class="d-grid mb-3">
                    <button type="button" id="btnAtivar" class="btn botaoBase botaoBase--primario mb-3">Ativar</button>
                    <button type="button" id="btnCodigo" class="btn botaoBase botaoBase--primario">Gerar código</button>
                </div>
            </form>
        </div>


    </main>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="public/assets/js/componentes.js"></script>
    <script src="public/assets/js/utilitarios.js"></script>
    <script src="public/assets/js/cadCliente.js" defer></script>

</body>

</html>