<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contatos - Podopsi</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/contatos.css" /><!-- CSS próprio da página -->
</head>
<body>

  <a href="#conteudoContatos" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <!-- NAVEGAÇÃO (DESLOGADO) — exibida por sessaoNavegacao.js quando não há sessão -->
  <nav class="navTopoDeslogado" aria-label="Navegação principal" hidden>
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

  <!-- BARRA SUPERIOR (LOGADO — DESKTOP E MOBILE) — exibida por JS quando há sessão -->
  <header class="navTopoLogado" hidden>
    <a href="index.php" class="navTopoLogado_logo">
      <img src="public/assets/images/logo.png" alt="" width="40" height="40">
      <span data-nomePlataforma="">Podopsi</span>
    </a>

    <!-- Desktop: menu hambúrguer em dropdown -->
    <div class="dropdown menuHamburguerLogado d-none d-md-block">
      <button type="button" class="menuHamburguerLogado_botao dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu">
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end menuHamburguerLogado_lista">
        <li><a href="index.php?uri=configuracao" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">settings</span>Configuração</a></li>
        <li><a href="index.php?uri=centralAjuda" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">support_agent</span>Central de ajuda</a></li>
        <li><a href="#" class="dropdown-item menuHamburguerLogado_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>

    <!-- Mobile: o hambúrguer abre o painelMenuMobile (offcanvas) -->
    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobileContatos" aria-controls="painelMenuMobileContatos" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <!-- PAINEL DO MENU (MOBILE, LOGADO) -->
  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobileContatos" aria-labelledby="tituloPainelMenuMobileContatos">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobileContatos">
        <img src="public/assets/images/logo.png" alt="" width="40" height="40">
        <span data-nomePlataforma="">Podopsi</span>
      </a>
      <button type="button" class="painelMenuMobile_botaoFechar" data-bs-dismiss="offcanvas" aria-label="Fechar menu">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <ul class="painelMenuMobile_lista">
        <li><a href="index.php?uri=configuracao" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">settings</span>Configuração</a></li>
        <li><a href="index.php?uri=centralAjuda" class="painelMenuMobile_item"><span class="material-symbols-outlined" aria-hidden="true">support_agent</span>Central de ajuda</a></li>
      </ul>
      <ul class="painelMenuMobile_rodape">
        <li><a href="#" class="painelMenuMobile_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>
  </div>

  <!-- NAVEGAÇÃO LATERAL (DESKTOP, LOGADO) — exibida por JS quando há sessão.
       O data-papel inicial é ajustado por sessaoNavegacao.js (cliente | profissionalClinica). -->
  <nav class="navLateralLogado d-none d-md-flex" data-papel="cliente" aria-label="Navegação principal" hidden>
    <a href="index.php?uri=buscar" class="navLateralLogado_item" data-itemPapel>
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <span class="navLateralLogado_rotulo">Buscar</span>
    </a>
    <a href="index.php?uri=mensagens" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemContatos>
      <span class="material-symbols-outlined" aria-hidden="true">chat</span>
      <span class="navLateralLogado_rotulo">Contatos</span>
    </a>
    <a href="index.php?uri=notificacoes" class="navLateralLogado_item">
      <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
      <span class="navLateralLogado_rotulo">Notificação</span>
    </a>
    <a href="index.php?uri=consultasCli" class="navLateralLogado_item" data-itemAgenda>
      <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
      <span class="navLateralLogado_rotulo">Agenda</span>
    </a>
    <div class="navLateralLogado_rodape">
      <a href="index.php?uri=perfil" class="navLateralLogado_item" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navLateralLogado_rotulo">Perfil</span>
      </a>
    </div>
  </nav>

  <div>

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="conteudoContatos" class="conteudoContatos" aria-busy="true">

      <h1 class="conteudoContatos_titulo">Contatos</h1>

      <!-- Anuncia o resultado do carregamento para leitores de tela (preenchido pelo JS) -->
      <p class="visually-hidden" id="avisoContatos" role="status" aria-live="polite"></p>

      <!-- ESTADOS DA PÁGINA (o JS exibe um por vez) -->
      <div class="estadoCarregando" data-estadoContatos="carregando" hidden>
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Carregando contatos...</span>
        </div>
      </div>

      <div class="estadoVazio estadoVazio--pagina" data-estadoContatos="erro" hidden>
        <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">error</span>
        <p class="estadoVazio_texto" role="alert">Não foi possível carregar os contatos.</p>
        <button type="button" class="btn botaoBase botaoBase--secundario" id="botaoTentarNovamenteContatos">
          <span class="material-symbols-outlined" aria-hidden="true">refresh</span>Tentar novamente
        </button>
      </div>

      <div class="estadoVazio estadoVazio--pagina" data-estadoContatos="vazio" hidden>
        <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">person_search</span>
        <p class="estadoVazio_texto">Nenhum contato foi encontrado</p>
        <p class="estadoVazio_apoio">
          Os contatos de <span data-campo="tiposContatoApoio">clínicas e profissionais</span> são adicionados automaticamente.
          <a href="#" class="estadoVazio_link" data-campo="linkSaibaMais" data-destino="">Saiba mais.</a>
        </p>
      </div>

      <!-- LISTAS DE CONTATOS — só aparecem as seções que têm itens.
           Cliente: profissionais e clínicas | Profissional: clientes e clínicas | Clínica: profissionais e clientes -->
      <div class="areaContatos" data-estadoContatos="lista" hidden>

        <section class="secaoContatos" aria-labelledby="tituloSecaoProfissionais" data-secaoContatos="profissionais" hidden>
          <h2 class="secaoContatos_titulo" id="tituloSecaoProfissionais">Profissionais</h2>
          <ul class="listaContatos" data-campo="listaContatosProfissionais"></ul>
        </section>

        <section class="secaoContatos" aria-labelledby="tituloSecaoClientes" data-secaoContatos="clientes" hidden>
          <h2 class="secaoContatos_titulo" id="tituloSecaoClientes">Clientes</h2>
          <ul class="listaContatos" data-campo="listaContatosClientes"></ul>
        </section>

        <section class="secaoContatos" aria-labelledby="tituloSecaoClinicas" data-secaoContatos="clinicas" hidden>
          <h2 class="secaoContatos_titulo" id="tituloSecaoClinicas">Clínicas</h2>
          <ul class="listaContatos" data-campo="listaContatosClinicas"></ul>
        </section>

      </div>

    </main>


    <!-- NAVEGAÇÃO INFERIOR (MOBILE, LOGADO) — exibida por JS quando há sessão -->
    <nav class="navInferiorLogado d-flex d-md-none" data-papel="cliente" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php?uri=buscar" class="navInferiorLogado_item" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">search</span>
        <span class="navInferiorLogado_rotulo">Buscar</span>
      </a>
      <a href="index.php?uri=consultasCli" class="navInferiorLogado_item" data-itemAgenda>
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="navInferiorLogado_rotulo">Agenda</span>
      </a>
      <a href="index.php?uri=perfil" class="navInferiorLogado_item" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navInferiorLogado_rotulo">Perfil</span>
      </a>
    </nav>

  </div>

  <!-- AVISO FLUTUANTE (Bootstrap toast, variação "atenção") — mensagem definida pelo JS.
       Fica fora do modal para aparecer por cima dele. -->
  <div class="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
    <div class="toast avisoFlutuante avisoFlutuante--atencao" id="avisoContatosFlutuante" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-body avisoFlutuante_corpo">
        <span class="material-symbols-outlined avisoFlutuante_icone" aria-hidden="true" data-campo="iconeAviso">warning</span>
        <p class="avisoFlutuante_mensagem" data-campo="mensagemAviso"></p>
      </div>
    </div>
  </div>

  <!-- MODAL: DOCUMENTOS (Bootstrap modal + modalBase).
       Abre a partir do botão "Documento" de cada contato; o JS preenche os dados do contato
       selecionado. Possui duas visões: "lista" (abas Enviados/Recebidos) e "envio" (formulário). -->
  <div class="modal fade modalBase modalDocumentos" id="modalDocumentos" tabindex="-1" aria-labelledby="tituloModalDocumentos" aria-describedby="descricaoModalDocumentos" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content modalBase_conteudo">

        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalDocumentos">Documentos</h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <!-- Contexto para leitores de tela: com quem são os documentos (o título visível não muda) -->
        <p class="visually-hidden" id="descricaoModalDocumentos">
          Documentos trocados com <span data-campo="usuarioContatoModal"></span>
        </p>

        <div class="modal-body modalBase_corpo">

          <!-- ===================== VISÃO: LISTA ===================== -->
          <div data-visaoDocumentos="lista">

            <button type="button" class="btn botaoBase botaoBase--secundario botaoEnviarDocumentos" data-acao="abrirEnvioDocumento">
              <span class="material-symbols-outlined" aria-hidden="true">add</span>Enviar documentos
            </button>

            <!-- Abas (mesmo componente abasPerfil) -->
            <div class="nav nav-tabs abasPerfil abasDocumentos" id="abasDocumentos">
              <div class="abasPerfil_grupo" role="tablist" aria-label="Tipo de documento">
                <button type="button" class="nav-link abasPerfil_aba active" id="abaDocumentosEnviados" data-bs-toggle="tab" data-bs-target="#painelDocumentosEnviados" role="tab" aria-controls="painelDocumentosEnviados" aria-selected="true" data-tipoDocumento="enviados">Enviados</button>
                <button type="button" class="nav-link abasPerfil_aba" id="abaDocumentosRecebidos" data-bs-toggle="tab" data-bs-target="#painelDocumentosRecebidos" role="tab" aria-controls="painelDocumentosRecebidos" aria-selected="false" data-tipoDocumento="recebidos">Recebidos</button>
              </div>
            </div>

            <!-- ESTADOS COMPARTILHADOS DAS ABAS (o JS exibe um por vez) -->
            <div class="estadoCarregando" data-estadoDocumentos="carregando" hidden>
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Carregando documentos...</span>
              </div>
            </div>

            <div class="estadoVazio" data-estadoDocumentos="erro" hidden>
              <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">error</span>
              <p class="estadoVazio_texto" role="alert">Não foi possível carregar os documentos.</p>
              <button type="button" class="btn botaoBase botaoBase--secundario" id="botaoTentarNovamenteDocumentos">
                <span class="material-symbols-outlined" aria-hidden="true">refresh</span>Tentar novamente
              </button>
            </div>

            <div class="tab-content areaDocumentos">

              <!-- Aba Enviados -->
              <section class="tab-pane fade show active" id="painelDocumentosEnviados" role="tabpanel" aria-labelledby="abaDocumentosEnviados" tabindex="0">
                <ul class="listaDocumentos" data-campo="listaDocumentosEnviados"></ul>
                <div class="estadoVazio" data-estadoVazioDocumentos="enviados" hidden>
                  <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">snippet_folder</span>
                  <p class="estadoVazio_texto">Nenhum documento foi encontrado</p>
                </div>
              </section>

              <!-- Aba Recebidos -->
              <section class="tab-pane fade" id="painelDocumentosRecebidos" role="tabpanel" aria-labelledby="abaDocumentosRecebidos" tabindex="0">
                <ul class="listaDocumentos" data-campo="listaDocumentosRecebidos"></ul>
                <div class="estadoVazio" data-estadoVazioDocumentos="recebidos" hidden>
                  <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">snippet_folder</span>
                  <p class="estadoVazio_texto">Nenhum documento foi encontrado</p>
                </div>
              </section>

            </div>
          </div>

          <!-- ===================== VISÃO: ENVIO ===================== -->
          <form id="formularioEnvioDocumento" data-visaoDocumentos="envio" novalidate hidden>

            <!-- O título é preenchido automaticamente com o nome do arquivo escolhido e pode ser editado -->
            <div class="form-floating campoTexto">
              <input class="form-control" type="text" id="campoTituloDocumento" name="tituloDocumento" placeholder="Título do documento" autocomplete="off" aria-describedby="mensagemTituloDocumento">
              <label for="campoTituloDocumento">Título do documento</label>
              <div class="invalid-feedback" id="mensagemTituloDocumento" data-mensagemCampo="tituloDocumento"></div>
            </div>

            <!-- Área do arquivo: escolher pelo botão ou soltar aqui (o JS troca data-estadoArea:
                 vazio | arrastando | selecionado) -->
            <div class="areaArquivo" id="areaArquivoDocumento" data-estadoArea="vazio" data-tiposPermitidos="" data-tamanhoMaximoMb="">

              <span class="material-symbols-outlined areaArquivo_icone" aria-hidden="true">description</span>

              <!-- Visível só com arquivo selecionado -->
              <div class="areaArquivo_selecionado" data-campo="arquivoSelecionado" hidden>
                <p class="areaArquivo_nome" data-campo="nomeArquivoSelecionado"></p>
                <p class="areaArquivo_tamanho" data-campo="tamanhoArquivoSelecionado"></p>
              </div>

              <input class="visually-hidden" type="file" id="campoArquivoDocumento" name="arquivoDocumento" aria-describedby="dicaArquivoDocumento mensagemArquivoDocumento" tabindex="-1">
              <button type="button" class="btn botaoBase botaoBase--extra areaArquivo_botao" data-acao="escolherArquivo">
                <span class="material-symbols-outlined" aria-hidden="true">upload_file</span>
                <span data-campo="rotuloBotaoArquivo">Escolha um arquivo</span>
              </button>
              <p class="areaArquivo_dica" id="dicaArquivoDocumento">Ou solte um arquivo aqui</p>
              <div class="invalid-feedback areaArquivo_mensagem" id="mensagemArquivoDocumento" data-mensagemCampo="arquivoDocumento"></div>
            </div>

            <div class="modal-footer modalBase_rodape">
              <button type="button" class="btn botaoBase botaoBase--opositora" data-acao="cancelarEnvioDocumento">
                <span class="material-symbols-outlined" aria-hidden="true">cancel</span>Cancelar
              </button>
              <button type="submit" class="btn botaoBase botaoBase--primario" id="botaoEnviarDocumento" data-acao="enviarDocumento" disabled>
                <span class="spinner-border spinner-border-sm" aria-hidden="true" data-campo="indicadorEnvio" hidden></span>
                <span class="material-symbols-outlined" aria-hidden="true" data-campo="iconeEnvio">send</span>Enviar
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>

  <!-- MODELOS (templates) preenchidos pelo JS. Os textos/imagens são só marcadores: o conteúdo real vem do banco. -->
  <template id="modeloItemContato">
    <li class="listaContatos_item">
      <article class="card cardContato" data-idContato="" data-tipoContato="">
        <div class="card-body cardContato_corpo">
          <div class="cardContato_avatar">
            <span class="material-symbols-outlined cardContato_iconePadrao" aria-hidden="true" data-campo="iconePadraoContato">person</span>
            <img class="cardContato_foto" data-campo="fotoContato" alt="" loading="lazy" hidden>
          </div>
          <div class="cardContato_dados">
            <h3 class="cardContato_usuario" data-campo="usuarioContato"></h3>
            <p class="cardContato_telefone" data-campo="telefoneContato"></p>
          </div>
          <!-- Só existe para profissionais (visão do cliente) e clientes (visão do profissional); clínicas não têm -->
          <button type="button" class="btn botaoBase botaoBase--secundario cardContato_botaoDocumento" data-acao="abrirDocumentos" data-bs-toggle="modal" data-bs-target="#modalDocumentos" hidden>
            <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>Documento
          </button>
        </div>
      </article>
    </li>
  </template>

  <template id="modeloCardDocumento">
    <li class="listaDocumentos_item">
      <article class="card cardDocumento" data-idDocumento="">
        <div class="card-body cardDocumento_corpo">
          <h3 class="card-title cardDocumento_titulo" data-campo="tituloDocumento"></h3>
          <ul class="cardDocumento_dados">
            <li>De: <span data-campo="remetenteDocumento"></span></li>
            <li>Para: <span data-campo="destinatarioDocumento"></span></li>
          </ul>
          <div class="d-flex gap-3 cardDocumento_rodape">
            <button type="button" class="btn botaoBase botaoBase--primario" data-acao="baixarDocumento">
              <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Baixar
            </button>
          </div>
        </div>
      </article>
    </li>
  </template>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- Bootstrap 5 (bundle com Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/utilitarios.js"></script><!-- Helpers globais -->
  <script src="public/assets/js/sessaoNavegacao.js"></script><!-- Decide qual navegação exibir -->
  <script src="public/assets/js/contatos.js" defer></script><!-- JS próprio da página -->
</body>
</html>
