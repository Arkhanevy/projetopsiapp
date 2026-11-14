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
    <link rel="stylesheet" href="public/assets/css/cadastroClinica.css" />
    <title>Cadastro de Clínica</title>
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
                <button type="button" class="nav-link dropdown-toggle navbar-brand navTopoDeslogado_acao" data-bs-toggle="dropdown">Entrar</button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="index.php?uri=loginCliente">Sou um cliente</a></li>
                    <li><a class="dropdown-item" href="index.php?uri=loginProfissional">Sou um profissional</a></li>
                    <li><a class="dropdown-item" href="index.php?uri=loginClinica">Sou uma clínica</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <main id="conteudoCadastro" class="container-fluid">
        <div id="alertContainer" class="position-fixed top-0 start-50 translate-middle-x p-3" style="z-index: 9999;"></div>
        <div class="row g-0 min-vh-100">

            <div id="imgBox" class="d-none d-md-block col-md-6">
                <img src="public/assets/images/bannerVertical.jpg" alt="" class="img-fluid h-100 w-100 object-fit-cover">
            </div>

            <div id="colForm" class="col-12 col-md-6 d-flex justify-content-center align-items-start">
                <div class="form-wrapper">

                    <div id="cadastroClinica" class="cadastro">
                        <div class="text-center mt-4">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <img src="public/assets/images/logo_verde.png" alt="Podopsi" class="logo-titulo">
                                <h1 class="m-0">Seja Bem-Vindo!</h1>
                            </div>
                            <p class="text-muted mt-2 mx-auto" style="max-width: 400px;">
                                Cadastro a clínica em Podopsi para que clientes consigam encontrá-las!
                            </p>
                        </div>



                        <form id="formClinica" enctype="multipart/form-data">
                            <div class="avatar-container">
                            <img id="previewClinica" src="public/assets/images/logo_user.png" alt="Foto de perfil">
                            <input name="cxclinFoto" type="file" aria-label="Foto da clínica" id="img_perfil_Clinica" accept="image/*" required>
                        </div>

                        <p class="text-center mt-2" style="font-size: 12px;">
                            Clique na imagem para adicionar logo da clinica.
                        </p>
                            <div class="form-floating campoTexto mb-3">
                                <input name="cxclinNome" id="nomeClinica" class="form-control" type="text"
                                    placeholder="Nome" required>
                                <label for="nomeClinica">Nome da clínica</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="exclinEmail" id="emailCadClinica" class="form-control" type="email"
                                    placeholder="E-mail" required>
                                <label for="emailCadClinica">E-mail</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="cxclinTelefone" id="telClinica" data-mascara="telefone" class="form-control" type="tel"
                                    placeholder="Telfone" required>
                                <label for="telClinica">Telefone</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="cxclinUsername" id="userClinica" class="form-control" type="text"
                                    placeholder="Username" required>
                                <label for="userClinica">Username da clínica</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <label for="bioClinica">Biografia</label> <br />
                                    <br /><textarea name="cxclinBiografia" id="bioClinica"
                                        placeholder="Escreva sua biografia aqui." required></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating campoTexto mb-3">
                                        <input name="cxclinCEP" class="form-control" type="text" id="cepClinica" data-mascara="cep" inputmode="numeric" value=""
                                            placeholder="cep" required> <label for="cepClinica">Cep</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating campoTexto mb-3">
                                        <input name="" class="parteCEPClinica form-control" type="text" id="ruaClinica" placeholder="rua"
                                            required>
                                        <label for="ruaClinica">Rua</label>
                                    </div>
                                </div>
                            </div>


                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating campoTexto mb-3">
                                        <input name="" class="parteCEPClinica form-control" type="text" id="bairroClinica"
                                            placeholder="bairro" required> <label for="bairroClinica">Bairro</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating campoTexto mb-3">
                                        <input name="" class="parteCEPClinica form-control" type="text" id="cidadeClinica"
                                            placeholder="cidade" required> <label for="cidadeClinica">Cidade</label>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating campoTexto mb-3">
                                        <input name="" class=" parteCEPClinica form-control" type="text" id="ufClinica" placeholder="uf"
                                            required>
                                        <label for="ufClinica">Estado</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating campoTexto mb-3">
                                        <input name="" class="parteCEPClinica form-control" type="text" id="ibgeClinica" placeholder="ibge"
                                            required> <label for="ibgeClinica">IBGE</label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="cxclinCnpj" id="cnpj" data-mascara="cnpj" inputmode="numeric" class="form-control" type="text" placeholder="CNPJ"
                                    required>
                                <label for="cnpj">CNPJ</label>
                            </div>
                            <div class="form-floating campoTexto mb-3">
                                <input name="cxclinSenha" id="senhaClinica" class="form-control" type="password"
                                    placeholder="Senha" required>
                                <label for="senhaClinica">Senha</label>
                            </div>
                            <div class="d-grid mb-3">
                                <button type="submit" id="btnCadClinica" class="btn botaoBase botaoBase--primario">Cadastrar</button>
                            </div>
                        </form>

                        

                        <p>Já tem conta? <a href="index.php?uri=loginClinica">Faça login</a></p>
                    </div>

                        <div class="img-thumbnail bg-light border border-success p-4 rounded-4 shadow" id="ativacao">
                            <h1 class="text-muted mt-5 mx-auto">Seja Bem-Vindo!</h1>
                            <p class="text-muted mt-5 mx-auto"> Clique no botão "Gerar código" para que um código seja enviado para o seu e-mail. Depois coloque-o da caixa abaixo para ativar sua conta.</p>
                            <form>
                                <div class="form-floating campoTexto mt-5 mb-3">
                                    <input name="cxcliCodigo" id="codigoCliente" class="form-control" type="text" placeholder="Nome" required>
                                    <label for="codigoCliente">Código de Ativação</label>
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
    <script src="public/assets/js/cadClinica.js" defer></script>

</body>

</html>
