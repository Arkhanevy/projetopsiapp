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
    <title>Fale conosco - Central de Ajuda</title>
    <link rel="stylesheet" href="public/assets/css/centralAjuda.css" />
</head>

<body>
    <a href="#conteudoCentralAjuda" class="linkPularConteudo">Pular para o conteúdo principal</a>

    <div id="avisoContainer" class="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
        <div id="avisoErroCentralAjuda" class="toast avisoFlutuante" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-body avisoFlutuante_corpo">
                <span class="material-symbols-outlined avisoFlutuante_icone" aria-hidden="true">error</span>
                <p class="avisoFlutuante_mensagem">Você precisa preencher todos os dados!</p>
            </div>
        </div>
    </div>

    <nav class="navTopoLogado" aria-label="Navegação principal">
        <a href="index.php?uri=home" class="navTopoLogado_logo">
            <img src="public/assets/images/logo.png" alt="" width="50" height="50">
            <span data-nomePlataforma="">Podopsi</span>
        </a>
        <div class="dropdown menuHamburguerLogado">
            <button type="button" class="menuHamburguerLogado_botao" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu">
                <span class="material-symbols-outlined" aria-hidden="true">menu</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li>
                    <button type="button" class="dropdown-item menuHamburguerLogado_item" data-acao="sair">
                        <span class="material-symbols-outlined" aria-hidden="true">logout</span>
                        Sair
                    </button>
                </li>
            </ul>
        </div>
    </nav>

    <main id="conteudoCentralAjuda" class="container py-4">
        <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6 col-xl-5">

                <h1 class="text-center mb-4">Fale conosco</h1>

                <form id="formularioCentralAjuda" class="centralAjuda_formulario" novalidate>

                    <div class="form-floating campoTexto mb-4">
                        <input name="cxajuDestinatario" id="campoDestinatario" data-emailDestinatario="" class="form-control" type="email" placeholder="Destinatário" value="" readonly>
                        <label for="campoDestinatario">Destinatário</label>
                    </div>

                    <div class="form-floating campoTexto mb-4">
                        <input name="cxajuEmail" id="campoEmailUsuario" data-emailUsuario="" class="form-control" type="email" placeholder="Digite seu e-mail" autocomplete="email" required>
                        <label for="campoEmailUsuario">E-mail</label>
                    </div>

                    <div class="dropdown campoSelect mb-4" id="campoAssunto" data-valorSelecionado="">
                        <span id="rotuloAssunto" class="visually-hidden">Assunto do e-mail</span>
                        <button type="button" class="campoSelect_gatilho dropdown-toggle" id="gatilhoAssunto" data-bs-toggle="dropdown" aria-expanded="false" aria-labelledby="rotuloAssunto valorAssunto">
                            <span class="campoSelect_valor" id="valorAssunto" data-textoPadrao="Sobre qual assunto é esse e-mail?">Sobre qual assunto é esse e-mail?</span>
                            <span class="campoSelect_iconeChevron">
                                <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
                            </span>
                        </button>
                        <ul class="dropdown-menu campoSelect_lista" data-opcoesAssunto="">
                            <li><button type="button" class="dropdown-item campoSelect_opcao" data-valor="relatarProblema">Relatar um problema</button></li>
                            <li><button type="button" class="dropdown-item campoSelect_opcao" data-valor="duvidaNaoEsclarecida">Dúvida não esclarecida no site.</button></li>
                            <li><button type="button" class="dropdown-item campoSelect_opcao" data-valor="nenhumaDasAnteriores">Nenhuma das anteriores</button></li>
                        </ul>
                        <input type="hidden" name="cxajuAssunto" id="campoAssuntoValor" value="">
                    </div>

                    <div class="campoTexto mb-4">
                        <label for="campoMensagem" id="rotuloMensagem" class="centralAjuda_rotuloMensagem">Nos conte o que você precisa</label>
                        <textarea name="cxajuMensagem" id="campoMensagem" class="form-control centralAjuda_mensagem" rows="10" maxlength="2000" required disabled
                            data-placeholderDesabilitado="Antes de escrever uma mensagem, selecione um dos assuntos acima."
                            data-placeholderHabilitado="Digite sua mensagem aqui..."
                            placeholder="Antes de escrever uma mensagem, selecione um dos assuntos acima."></textarea>
                    </div>

                    <div class="d-flex justify-content-end justify-content-lg-center">
                        <button type="submit" id="botaoEnviar" class="btn botaoBase botaoBase--primario" aria-disabled="true">
                            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            Enviar
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </main>

    <div class="modal fade modalBase" id="modalSucessoCentralAjuda" tabindex="-1" aria-labelledby="tituloModalSucesso" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content modalBase_conteudo">
                <div class="modal-header modalBase_cabecalho">
                    <h2 class="modal-title modalBase_titulo" id="tituloModalSucesso">Mensagem enviada com sucesso!</h2>
                </div>
                <div class="modal-body modalBase_corpo">
                    <img src="public/assets/images/logo.png" alt="" class="modalMidia_imagem">
                    <p class="modalFeedback_mensagem">Fique de olho no seu e-mail, assim que possível retornaremos com uma resposta.</p>
                </div>
                <div class="modal-footer modalBase_rodape">
                    <button type="button" id="botaoVoltarAbaAnterior" class="btn botaoBase botaoBase--secundario" data-acao="voltarAbaAnterior">
                        <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>
                        Voltar à aba anterior
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="public/assets/js/componentes.js"></script>
    <script src="public/assets/js/utilitarios.js"></script>
    <script src="public/assets/js/centralAjuda.js" defer></script>

</body>

</html>
