<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Detalhe do Serviço </title>
  
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais  -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/infoServico.css" /><!-- CSS próprio -->
</head>
<body>
  <a href="#conteudoDetalheServico" class="linkPularConteudo">Pular para o conteúdo principal</a>

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

  <!-- MENU HAMBÚRGUER (DESKTOP, LOGADO) — exibido por sessaoNavegacao.js -->
  <div class="dropdown menuHamburguerLogado d-none d-md-block" hidden>
    <button type="button" class="menuHamburguerLogado_botao dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
    <ul class="dropdown-menu menuHamburguerLogado_lista">
      <li><a href="#" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">help</span>Como funciona</a></li>
      <li><a href="index.php?uri=centralAjuda" class="dropdown-item menuHamburguerLogado_item"><span class="material-symbols-outlined" aria-hidden="true">support_agent</span>Central de ajuda</a></li>
      <li><a href="#" class="dropdown-item menuHamburguerLogado_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
    </ul>
  </div>

  <!-- NAVEGAÇÃO LATERAL (DESKTOP, LOGADO) — exibida por sessaoNavegacao.js -->
  <nav class="navLateralLogado d-none d-md-flex" data-papel="cliente" aria-label="Navegação principal" hidden>
    <a href="index.php?uri=buscar" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemPapel>
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <span class="navLateralLogado_rotulo">Buscar</span>
    </a>
    <a href="index.php?uri=mensagens" class="navLateralLogado_item" data-itemContatos>
      <span class="material-symbols-outlined" aria-hidden="true">chat</span>
      <span class="navLateralLogado_rotulo">Contatos</span>
    </a>
    <a href="index.php?uri=notificacoes" class="navLateralLogado_item">
      <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
      <span class="navLateralLogado_rotulo">Notificação</span>
    </a>
    <a href="index.php?uri=consultasCli" class="navLateralLogado_item">
      <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
      <span class="navLateralLogado_rotulo">Agenda</span>
    </a>
    <div class="navLateralLogado_rodape">
      <a href="index.php?uri=perfil" class="navLateralLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navLateralLogado_rotulo">Perfil</span>
      </a>
    </div>
  </nav>

  <div>

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="conteudoDetalheServico" class="conteudoDetalheServico container-fluid">

      <button type="button" id="botaoVoltar" class="botaoVoltarServico btn rounded-circle" aria-label="Voltar" onclick="window.history.back();">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>

      <article class="cartaoServico row gy-4 estadoCarregando" id="cartaoServico">

        <div class="col-12 col-md-6">
          <figure class="figuraServico">
            <img
              src="public/assets/images/servico.jpg"
              alt="Profissional realizando procedimento de remoção de unha encravada no pé do paciente"
              class="imagemServico img-fluid rounded"
              data-campo="imagemServico"
              data-campo-alt="legendaImagemServico"
            />
          </figure>
        </div>

        <div class="col-12 col-md-6">
          <div class="infoServico d-flex flex-column">

            <p class="nomeProfissional order-1 order-md-2">
              <span class="rotuloProfissional d-none d-md-inline">Profissional: </span>
              <span data-campo="nomeProfissional">Samanta Santos</span>
            </p>

            <h1 class="tituloServico order-2 order-md-1" data-campo="tituloServico">
              Tratamento de unha encravada
            </h1>

            <div class="detalhesServico order-3 d-flex justify-content-between">
              <p class="precoServico" data-campo="precoServico">R$12,50</p>
              <p class="duracaoServico" data-campo="duracaoServico">60 minutos</p>
            </div>

            <section class="descricaoServico order-4" aria-labelledby="tituloDescricao">
              <h2 id="tituloDescricao" class="tituloSecao">Descrição</h2>
              <p class="textoDescricao" data-campo="descricaoServico">
                O tratamento especializado para unha encravada oferece o alívio rápido da dor e
                da inflamação através de técnicas totalmente seguras e indolores. Garantimos
                cuidado profissional para corrigir o crescimento da unha, evitar graves
                infecções e devolver o conforto aos seus pés. O procedimento é realizado por
                especialistas em podologia. Agende sua consulta para caminhar novamente sem
                incômodos e com bem-estar.
              </p>
            </section>

            <button
              type="button"
              id="botaoAgendarAgora"
              class="botaoAgendarAgora btn botaoBase botaoBase--primario order-5"
            >
              Agendar agora
            </button>

          </div>
        </div>

      </article>
    </main>

    <!-- NAVEGAÇÃO INFERIOR (MOBILE, LOGADO) — exibida por sessaoNavegacao.js -->
    <nav class="navInferiorLogado d-flex d-md-none" data-papel="cliente" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php?uri=buscar" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">search</span>
        <span class="navInferiorLogado_rotulo">Buscar</span>
      </a>
      <a href="index.php?uri=consultasCli" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="navInferiorLogado_rotulo">Agenda</span>
      </a>
      <a href="index.php?uri=perfil" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navInferiorLogado_rotulo">Perfil</span>
      </a>
    </nav>

  </div>

  <!-- MODAL: SERVIÇO NÃO ENCONTRADO -->
  <div
    class="modal fade modalBase"
    id="modalServicoNaoEncontrado"
    tabindex="-1"
    aria-labelledby="tituloModalServicoNaoEncontrado"
    aria-describedby="textoModalServicoNaoEncontrado"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalServicoNaoEncontrado">Serviço não encontrado</h2>
        </div>
        <div class="modal-body text-center">
          <p class="visually-hidden">
            Esta janela não pode ser fechada automaticamente. Use o botão
            "Tentar novamente" ou o link "Central de Ajuda" abaixo para continuar.
          </p>

          <div class="iconeModalErro" aria-hidden="true">
            <span class="material-symbols-outlined iconeModalErroBase" aria-hidden="true">search</span>
            <span class="material-symbols-outlined iconeModalErroSobreposto" aria-hidden="true">monitor_heart</span>
          </div>

          <p id="textoModalServicoNaoEncontrado">
            Infelizmente não conseguimos encontrar o serviço que você selecionou.
          </p>
        </div>
        <div class="modal-footer modalBase_rodape">
          <button type="button" id="botaoTentarNovamente" class="btn botaoBase botaoBase--primario">
            Tentar novamente
          </button>
        </div>
        <p class="textoSmall text-center pb-3">
          Caso o erro permaneça, entre em contato com a
          <a href="index.php?uri=centralAjuda" id="linkCentralAjuda">Central de Ajuda.</a>
        </p>
      </div>
    </div>
  </div>

  <!-- MODAL: PEDIDO DE AGENDAMENTO ENVIADO -->
  <div
    class="modal fade modalBase"
    id="modalAgendamentoEnviado"
    tabindex="-1"
    aria-labelledby="tituloModalAgendamentoEnviado"
    aria-describedby="textoModalAgendamentoEnviado"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalAgendamentoEnviado">
            Pedido de agendamento enviado!
          </h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="modal-body text-center">
          <p id="textoModalAgendamentoEnviado">
            Seu pedido de agendamento foi enviado para
            <span data-campo="nomeProfissional">Samanta Santos</span>. No momento, sua consulta
            está aguardando a confirmação do profissional.
          </p>

          <p>
            Quando a consulta for confirmada, você receberá uma mensagem. Para acompanhar o
            status ou reagendar sua consulta, acesse as
            <a href="index.php?uri=consultasCli" id="linkMinhasConsultas">Minhas Consultas</a>.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- Bootstrap 5 -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/sessaoNavegacao.js"></script><!-- Decide qual navegação exibir -->
  <script src="public/assets/js/utilitarios.js"></script>
  <script src="public/assets/js/infoServico.js" defer></script>
</body>
</html>
