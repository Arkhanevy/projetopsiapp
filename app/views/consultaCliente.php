<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Minhas consultas </title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes  -->
  <link rel="stylesheet" href="public/assets/css/consultasCli.css" /><!-- CSS próprio -->
</head>
<body>

  <a href="#conteudoConsultas" class="linkPularConteudo">Pular para o conteúdo principal</a>

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
    <a href="index.php?uri=busca" class="navLateralLogado_item" data-itemPapel>
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
    <a href="index.php?uri=consultasCli" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page">
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
    <main id="conteudoConsultas" class="conteudoConsultas container-fluid">

      <h1 class="tituloConsultas">Minhas consultas</h1>
      <p id="mensagemStatusConsultas" class="visually-hidden" aria-live="polite" aria-atomic="true"></p>

      <div id="gradeConsultas" class="gradeConsultas estadoCarregando">
        <article class="cartaoConsulta cartaoConsultaEsqueleto" aria-hidden="true">
          <h2 class="tituloConsulta">Tratamento de unha encravada</h2>
          <div class="linhaConsulta d-flex justify-content-between">
            <p class="dataHoraConsulta">17 de junho, 08:00</p>
            <p class="precoConsulta">R$12,50</p>
          </div>
          <p class="profissionalConsulta"><strong>Profissional:</strong> Samanta Santos</p>
          <p class="clinicaConsulta"><strong>Clínica:</strong> Girasol</p>
          <div class="rodapeConsulta d-flex justify-content-between align-items-center">
            <span class="botaoCancelar btn rounded-pill">Cancelar</span>
            <span class="badgeStatus badgeStatusPendente">Pendente</span>
          </div>
        </article>
        <article class="cartaoConsulta cartaoConsultaEsqueleto" aria-hidden="true">
          <h2 class="tituloConsulta">Pedicure</h2>
          <div class="linhaConsulta d-flex justify-content-between">
            <p class="dataHoraConsulta">26 de junho, 08:00</p>
            <p class="precoConsulta">R$80,50</p>
          </div>
          <p class="profissionalConsulta"><strong>Profissional:</strong> Katarina</p>
          <p class="clinicaConsulta"><strong>Clínica:</strong> Girasol</p>
          <div class="rodapeConsulta d-flex justify-content-between align-items-center">
            <span class="botaoCancelar btn rounded-pill">Cancelar</span>
            <span class="badgeStatus badgeStatusAgendada">Agendada</span>
          </div>
        </article>
      </div>

      <!-- Estado vazio -->
      <div id="estadoVazioConsultas" class="estadoVazioConsultas" hidden>
        <span class="material-symbols-outlined iconeEstadoVazio" aria-hidden="true">assignment_ind</span>
        <p class="textoEstadoVazio">
          Nenhuma consulta agendada.<br />
          Se estiver atrás de algum serviço, faça uma
          <a href="index.php?uri=busca">busca</a>.
        </p>
      </div>

    </main>

    <!-- NAVEGAÇÃO INFERIOR (MOBILE) -->
    <nav class="navInferiorLogado d-flex d-md-none" data-papel="cliente" aria-label="Navegação principal" hidden>
      <a href="index.php?uri=notificacoes" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="navInferiorLogado_rotulo">Notif.</span>
      </a>
      <a href="index.php?uri=mensagens" class="navInferiorLogado_item" data-itemContatos>
        <span class="material-symbols-outlined" aria-hidden="true">chat</span>
        <span class="navInferiorLogado_rotulo">Contatos</span>
      </a>
      <a href="index.php?uri=busca" class="navInferiorLogado_item" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">search</span>
        <span class="navInferiorLogado_rotulo">Buscar</span>
      </a>
      <a href="index.php?uri=consultasCli" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page">
        <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
        <span class="navInferiorLogado_rotulo">Agenda</span>
      </a>
      <a href="index.php?uri=perfil" class="navInferiorLogado_item">
        <span class="material-symbols-outlined" aria-hidden="true">person</span>
        <span class="navInferiorLogado_rotulo">Perfil</span>
      </a>
    </nav>

  </div>

  <!-- MODAL: SESSÃO EXPIRADA -->
  <div
    class="modal fade modalBase"
    id="modalSessaoExpirada"
    tabindex="-1"
    aria-labelledby="tituloModalSessaoExpirada"
    aria-describedby="textoModalSessaoExpirada"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalSessaoExpirada">Sessão expirada</h2>
        </div>
        <div class="modal-body text-center">
          <p class="visually-hidden">
            Esta janela não pode ser fechada automaticamente. Use o botão
            "Realizar login" abaixo para continuar.
          </p>

          <div class="modalFeedback_icone" aria-hidden="true">
            <span class="material-symbols-outlined" aria-hidden="true">no_accounts</span>
          </div>

          <p id="textoModalSessaoExpirada" class="modalFeedback_mensagem">
            Sua sessão anterior expirou, precisamos que você realize login novamente
            para poder acessar essa página.
          </p>
        </div>
        <div class="modal-footer modalBase_rodape">
          <button type="button" id="botaoRealizarLoginSessao" class="btn botaoBase botaoBase--primario">
            Realizar login
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: CONFIRMAR CANCELAMENTO -->
  <div
    class="modal fade modalBase"
    id="modalConfirmarCancelamento"
    tabindex="-1"
    aria-labelledby="tituloModalConfirmarCancelamento"
    aria-describedby="textoModalConfirmarCancelamento"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 id="tituloModalConfirmarCancelamento" class="modal-title modalBase_titulo">Cuidado!</h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div class="modal-body text-center">
          <p id="textoModalConfirmarCancelamento">
            Você está preste a cancelar sua consulta de
            <strong id="nomeConsultaParaCancelar">Tratamento de unha encravada</strong>!
          </p>

          <p>
            Se continuar com isso, a consulta sairá da sua agenda e da agenda do
            profissional. Essa ação não pode ser desfeita. Deseja continuar com essa ação?
          </p>
        </div>
        <div class="modal-footer modalBase_rodape acoesModalConfirmacao">
          <button type="button" id="botaoVoltarParaAgenda" class="btn botaoBase botaoBase--secundario" data-bs-dismiss="modal">
            <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>
            Voltar para a agenda
          </button>
          <button type="button" id="botaoConfirmarCancelamento" class="btn botaoCancelar">
            <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
            Cancelar consulta
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- Bootstrap 5 (bundle com Popper) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/sessaoNavegacao.js"></script><!-- Decide qual navegação exibir -->
  <script src="public/assets/js/utilitarios.js"></script>
  <script src="public/assets/js/consultasCli.js" defer></script>
</body>
</html>
