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
    <link rel="stylesheet" href="public/assets/css/cadastroProfissional.css" />
    <title>Cadastro de Profissional</title>
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

                    <div id="cadastroProfissional" class="cadastro">
                        <div class="text-center mt-4">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <img src="public/assets/images/logo_verde.png" alt="Podopsi" class="logo-titulo">
                                <h1 class="m-0">Seja Bem-Vindo!</h1>
                            </div>
                            <p class="text-muted mt-2 mx-auto" style="max-width: 400px;">
                                Faça um cadastro como profissional para que os clientes possam encontrar seus serviços.
                            </p>
                        </div>

                        
                        <form id="formProfissional" enctype="multipart/form-data">
                            <div class="avatar-container">
                                <img id="preview" src="public/assets/images/logo_user.png" alt="Foto de perfil">
                                <input name="cxproFoto" type="file" aria-label="Foto de perfil" id="img_perfil" accept="image/*" required>
                            </div>

                            <p class="text-center mt-2" style="font-size: 12px;">
                                Clique na imagem para adicionar foto
                            </p>

                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxproNome" id="nomeProfissional" class="form-control" type="text"
                                        placeholder="Nome" required>
                                    <label for="nomeProfissional">Nome completo</label>
                                </div>
                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxproUsername" id="userProfissional" class="form-control" type="text"
                                        placeholder="Username" required>
                                    <label for="userProfissional">Username</label>
                                </div>
                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxproEmail" id="emailCadastro" class="form-control" type="email"
                                        placeholder="E-mail" required>
                                    <label for="emailCadastro">E-mail</label>
                                </div>
                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxproTelefone" id="telProfissional" data-mascara="telefone" class="form-control" type="tel"
                                        placeholder="Telfone" required>
                                    <label for="telProfissional">Telefone</label>
                                </div>
                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxprodtNasc" id="dtnPro" class="form-control" type="date" placeholder="Data de Nascimento" required>
                                    <label for="dtnPro">Data de Nascimento</label>
                                </div>
                                <div class="form-floating campoTexto mb-3">
                                    <select name="cxproGenero" id="generoProfissional" class="form-select">
                                        <option value="" selected disabled>Selecione uma opção</option>
                                        <option value="F">Feminino</option>
                                        <option value="M">Masculino</option>
                                        <option value="O">Não Binario</option>
                                        <option value="I">Prefiro não dizer</option>
                                    </select>
                                    <label for="generoProfissional">Gênero</label>
                                </div> 
                                <div class="form-floating campoTexto mb-3">
                                    <label for="bioProfissional">Biografia</label> <br />
                                    <br /><textarea name="cxproBiografia" id="bioProfissional"
                                        placeholder="Escreva sua biografia aqui."></textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating campoTexto mb-3">
                                            <input name="cxproCEP" class="form-control" type="text" id="cep" data-mascara="cep" inputmode="numeric" value=""
                                                placeholder="cep" required> <label for="cep">CEP</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating campoTexto mb-3">
                                            <input name="" class="parteCEP form-control" type="text" id="rua" placeholder="rua"
                                                required>
                                            <label for="rua">Rua</label>
                                        </div>
                                    </div>
                                </div>


                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating campoTexto mb-3">
                                            <input name="" class="parteCEP form-control" type="text" id="bairro"
                                                placeholder="bairro" required> <label for="bairro">Bairro</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating campoTexto mb-3">
                                            <input name="" class="parteCEP form-control" type="text" id="cidade"
                                                placeholder="cidade" required> <label for="cidade">Cidade</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating campoTexto mb-3">
                                            <input name="" class=" parteCEP form-control" type="text" id="uf" placeholder="uf"
                                                required>
                                            <label for="uf">Estado</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating campoTexto mb-3">
                                            <input name="" class="parteCEP form-control" type="text" id="ibge" placeholder="ibge"
                                                required> <label for="ibge">IBGE</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxproRegistro" id="registroProfissional" class="form-control" type="text"
                                        placeholder="Registro" required>
                                    <label for="registroProfissional">Registro profissional</label>
                                </div>

                                <fieldset class="grupoFiltro mb-3" id="locaisAtendimento">
                                    <legend class="grupoFiltro_titulo">Onde você atende?</legend>
                                    <small class="d-block mb-2">Marque uma ou mais opções.</small>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="cxproLocalAtendimento" id="localCasa" value="casa">
                                        <label class="form-check-label" for="localCasa">Em casa</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="cxproLocalAtendimento" id="localCasaCliente" value="casaCliente">
                                        <label class="form-check-label" for="localCasaCliente">Na casa do cliente</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="cxproLocalAtendimento" id="localClinica" value="clinica">
                                        <label class="form-check-label" for="localClinica">Em uma clínica</label>
                                    </div>
                                </fieldset>

                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxproCPF" id="CPF" data-mascara="cpf" inputmode="numeric" class="form-control" type="text" placeholder="CPF"
                                        required>
                                    <label for="CPF">CPF</label>
                                </div>

                                <div class="form-floating campoTexto mb-3">
                                    <input name="cxproSenha" id="senhaProfissional" class="form-control" type="password"
                                        placeholder="Senha" required>
                                    <label for="senhaProfissional">Senha</label>
                                </div>
                                <div class="d-grid mb-3">
                                    <button type="submit" id="btnCadastrar" class="btn botaoBase botaoBase--primario">Cadastrar</button>
                                </div>
                        </form>

                        <p>
                            Já tem uma conta? <a href="index.php?uri=loginProfissional">Faça login</a>
                        </p>


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
    <script src="public/assets/js/cadProfissional.js" defer></script>

</body>

</html>
