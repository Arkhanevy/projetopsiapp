<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Início — Clínica</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link rel="stylesheet" href="public/assets/css/variaveis.css" />
  <link rel="stylesheet" href="public/assets/css/componentes.css" />
  <link rel="stylesheet" href="public/assets/css/inicioPro.css" />
</head>
<body>

  <a href="#conteudoInicioClinica" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <header class="navTopoLogado">
    <a href="index.php" class="navTopoLogado_logo">
      <img src="public/assets/images/logo.png" alt="" width="40" height="40" />
      <span data-nomePlataforma="">Podopsi</span>
    </a>

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

    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobileInicio" aria-controls="painelMenuMobileInicio" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobileInicio" aria-labelledby="tituloPainelMenuMobileInicio">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobileInicio">
        <img src="public/assets/images/logo.png" alt="" width="40" height="40" />
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

  <nav class="navLateralLogado d-none d-md-flex" data-papel="profissionalClinica" aria-label="Navegação principal" hidden>
    <a href="index.php?uri=inicioClinica" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemPapel>
      <span class="material-symbols-outlined" aria-hidden="true">home</span>
      <span class="navLateralLogado_rotulo">Início</span>
    </a>
    <a href="index.php?uri=mensagens" class="navLateralLogado_item" data-itemContatos>
      <span class="material-symbols-outlined" aria-hidden="true">chat</span>
      <span class="navLateralLogado_rotulo">Contatos</span>
    </a>
    <a href="index.php?uri=notificacoes" class="navLateralLogado_item">
      <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
      <span class="navLateralLogado_rotulo">Notificação</span>
    </a>
    <a href="index.php?uri=agendaClinica" class="navLateralLogado_item" data-itemAgenda>
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

    <main id="conteudoInicioClinica" class="conteudoInicioPro conteudoInicioClinica container-fluid">

      <p id="mensagemStatusInicioPro" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></p>

      <div class="cabecalhoInicioPro">
        <h1 class="tituloInicioPro">
          <span data-campo="quantidadeConsultasHoje">2</span>
          <span data-campo="rotuloConsultasHoje">consultas</span> hoje
        </h1>
      </div>

      <section class="painelAgendamentosPro" aria-labelledby="tituloPainelAgendamentosPro">
        <h2 id="tituloPainelAgendamentosPro" class="painelAgendamentosPro_titulo">Agendamentos</h2>

        <div id="listaAgendamentosPro" class="listaAgendamentosPro estadoCarregando" aria-busy="true" inert>

          <article class="card cardConsultaProfissional" data-idConsulta="" data-estadoConsulta="confirmada">
            <div class="card-body d-flex flex-column gap-3">
              <div class="cardConsultaProfissional_cabecalho">
                <h3 class="cardConsultaProfissional_servico" data-campo="nomeServico">Tratamento de Calosidade</h3>
                <p class="cardConsultaProfissional_dataHora" data-campo="dataHoraConsulta">07 de maio, 10:00</p>
              </div>
              <div class="cardConsultaProfissional_acoes">
                <button type="button" class="btn botaoBase botaoBase--opositora botaoBase--compacto" data-acao="cancelarConsulta" data-bs-toggle="modal" data-bs-target="#modalConfirmarCancelamento">
                  <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
                  Cancelar
                </button>
                <button type="button" class="btn botaoBase botaoBase--extra botaoBase--compacto" data-acao="reagendarConsulta">
                  <span class="material-symbols-outlined" aria-hidden="true">event_repeat</span>
                  Reagendar
                </button>
              </div>
            </div>
          </article>

          <article class="card cardConsultaProfissional" data-idConsulta="" data-estadoConsulta="confirmada">
            <div class="card-body d-flex flex-column gap-3">
              <div class="cardConsultaProfissional_cabecalho">
                <h3 class="cardConsultaProfissional_servico" data-campo="nomeServico">Hidratação dos Pés</h3>
                <p class="cardConsultaProfissional_dataHora" data-campo="dataHoraConsulta">07 de maio, 12:00</p>
              </div>
              <div class="cardConsultaProfissional_acoes">
                <button type="button" class="btn botaoBase botaoBase--opositora botaoBase--compacto" data-acao="cancelarConsulta" data-bs-toggle="modal" data-bs-target="#modalConfirmarCancelamento">
                  <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
                  Cancelar
                </button>
                <button type="button" class="btn botaoBase botaoBase--extra botaoBase--compacto" data-acao="reagendarConsulta">
                  <span class="material-symbols-outlined" aria-hidden="true">event_repeat</span>
                  Reagendar
                </button>
              </div>
            </div>
          </article>

        </div>

        <div id="estadoVazioAgendamentosPro" class="estadoVazio estadoVazioAgendamentosPro" hidden>
          <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">event_busy</span>
          <p class="estadoVazio_texto">Nenhuma consulta foi encontrada</p>
        </div>

        <div id="acoesAgendamentosPro" class="painelAgendamentosPro_acoes">
          <a href="index.php?uri=agendaClinica" id="botaoVisualizarMaisConsultas" class="btn botaoBase botaoBase--secundario" data-acao="visualizarMaisConsultas">
            <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>
            Visualizar mais
          </a>
        </div>
      </section>

    </main>

    <nav class="navInferiorLogado d-flex d-md-none" data-papel="profissionalClinica" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php?uri=inicioClinica" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">home</span>
        <span class="navInferiorLogado_rotulo">Início</span>
      </a>
      <a href="index.php?uri=agendaClinica" class="navInferiorLogado_item" data-itemAgenda>
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="navInferiorLogado_rotulo">Agenda</span>
      </a>
      <a href="index.php?uri=perfil" class="navInferiorLogado_item" data-itemPerfil>
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navInferiorLogado_rotulo">Perfil</span>
      </a>
    </nav>

  </div>

  <div
    class="modal fade modalBase"
    id="modalSessaoExpirada"
    tabindex="-1"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    aria-labelledby="tituloModalSessaoExpirada"
    aria-describedby="textoModalSessaoExpirada"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalSessaoExpirada">Sessão expirada</h2>
        </div>
        <div class="modal-body text-center">
          <div class="modalFeedback_icone" aria-hidden="true">
            <span class="material-symbols-outlined">no_accounts</span>
          </div>
          <p id="textoModalSessaoExpirada" class="modalFeedback_mensagem">
            Sua sessão anterior expirou, precisamos que você realize login novamente
            para poder acessar essa página.
          </p>
        </div>
        <div class="modal-footer modalBase_rodape">
          <button type="button" id="botaoRealizarLoginSessao" class="btn botaoBase botaoBase--primario">Realizar login</button>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade modalBase"
    id="modalConfirmarCancelamento"
    tabindex="-1"
    aria-labelledby="tituloModalConfirmarCancelamento"
    aria-describedby="textoModalConfirmarCancelamento"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo" data-idConsulta="">
        <div class="modal-header modalBase_cabecalho">
          <h2 id="tituloModalConfirmarCancelamento" class="modal-title modalBase_titulo">Cuidado!</h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p id="textoModalConfirmarCancelamento">
            Você está prestes a cancelar sua consulta de
            <strong id="nomeConsultaParaCancelar" data-campo="nomeServico">Tratamento de Calosidade</strong>!
          </p>
          <p>
            Se continuar com isso, a consulta sairá da sua agenda e da agenda do cliente e do profissional.
          </p>
          <p>
            Essa ação não pode ser desfeita. Deseja continuar com essa ação?
          </p>
        </div>
        <div class="modal-footer modalBase_rodape acoesModalConfirmacao">
          <button type="button" id="botaoVoltarParaAgenda" class="btn botaoBase botaoBase--secundario" data-bs-dismiss="modal">
            <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>
            Voltar para a agenda
          </button>
          <button type="button" id="botaoConfirmarCancelamento" class="btn botaoBase botaoBase--opositora" data-acao="confirmarCancelamentoConsulta">
            <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
            Cancelar consulta
          </button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script>
  <script src="public/assets/js/sessaoNavegacao.js"></script>
  <script src="public/assets/js/utilitarios.js"></script>
  <script src="public/assets/js/inicioPro.js"></script>
  <script src="public/assets/js/inicioClinica.js" defer></script>
</body>
</html>
