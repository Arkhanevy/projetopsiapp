<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agendamento</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /> <!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais de design -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados  -->
  <link rel="stylesheet" href="public/assets/css/agendamentoCli.css" /><!-- CSS próprio -->
</head>
<body>

  <a href="#conteudoAgendamento" class="linkPularConteudo">Pular para o conteúdo principal</a>

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
    <a href="index.php?uri=busca" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemPapel>
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
    <main id="conteudoAgendamento" class="conteudoAgendamento container-fluid">

      <button type="button" id="botaoVoltar" class="botaoVoltarAgendamento btn rounded-circle" aria-label="Voltar">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>

      <form id="formularioAgendamento" class="gradeAgendamento estadoCarregando" novalidate>

        <input type="hidden" id="inputIdServico" name="idServico" />

        <h1 class="tituloAgendamento areaTitulo">Agendamento</h1>

        <div class="alertaValidacao areaAlerta" id="alertaValidacao" role="alert" hidden>
          Você precisa preencher todos os dados!
        </div>

        <!-- ---------- Valor ---------- -->
        <div class="campoValor areaValor">
          <div class="campoValorLinha">
            <h2 class="tituloCampo">Valor</h2>
            <p class="valorAgendamento" data-campo="precoServico">R$12,50</p>
          </div>
          <p class="textoAjuda">
            O valor do agendamento é calculado com base no valor do serviço selecionado.
          </p>
        </div>

        <!-- ---------- Profissional responsável ---------- -->
        <div class="campoFormulario areaProfissional">
          <label for="inputProfissionalResponsavel" class="tituloCampo">Profissional responsável</label>
          <input
            type="text"
            id="inputProfissionalResponsavel"
            class="inputFormulario"
            data-campo="nomeProfissional"
            value="Samanta Santos"
            readonly
          />
        </div>

        <!-- ---------- Localização de atendimento ---------- -->
        <!--<div class="campoFormulario areaLocalizacao">
          <span id="labelLocalizacao" class="tituloCampo">Localização de atendimento</span>
          <div class="dropdownCustomizado" id="dropdownLocalizacao">
            <button
              type="button"
              id="botaoDropdownLocalizacao"
              class="dropdownCustomizadoBotao"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-labelledby="labelLocalizacao"
              aria-describedby="textoLocalizacaoSelecionada"
            >
              <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
              <span id="textoLocalizacaoSelecionada" class="dropdownCustomizadoTexto">Selecione localização</span>
              <span class="material-symbols-outlined dropdownCustomizadoSeta" aria-hidden="true">expand_more</span>
            </button>
            <ul
              id="listaLocalizacoes"
              class="dropdownCustomizadoLista"
              role="listbox"
              aria-labelledby="labelLocalizacao"
              hidden
            >
            </ul>
          </div>
          <input type="hidden" id="inputLocalizacaoSelecionada" name="localizacaoSelecionada" />
        </div> -->

        <!-- ---------- Calendário ---------- -->
        <div class="campoFormulario areaCalendario">
          <h2 class="tituloCampo" id="labelCalendario">Selecione um dia disponível</h2>
          <div class="calendarioAgendamento" id="calendarioAgendamento" role="group" aria-labelledby="labelCalendario">
            <div class="calendarioCabecalho">
              <button type="button" id="botaoMesAnterior" class="calendarioBotaoNavegacao" aria-label="Mês anterior">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
              </button>
              <p class="calendarioTitulo" id="calendarioTitulo" aria-live="polite">JUL 2026</p>
              <button type="button" id="botaoProximoMes" class="calendarioBotaoNavegacao" aria-label="Próximo mês">
                <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
              </button>
            </div>

            <div class="calendarioDiasSemana" aria-hidden="true">
              <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
            </div>

            <div class="calendarioGrade" id="calendarioGrade">
            </div>

            <div class="calendarioLegenda">
              <span class="legendaItem">
                <span class="legendaAmostra legendaAmostraSelecionado" aria-hidden="true"></span>
                Dia selecionado
              </span>
              <span class="legendaItem">
                <span class="legendaAmostra legendaAmostraIndisponivel" aria-hidden="true"></span>
                Dias indisponíveis
              </span>
            </div>
          </div>
          <input type="hidden" id="inputDiaSelecionado" name="diaSelecionado" />
        </div>

        <!-- ---------- Horário ---------- -->
        <div class="campoFormulario areaHorario">
          <span id="labelHorario" class="tituloCampo">Selecione um dos horários disponível</span>
          <div class="dropdownCustomizado" id="dropdownHorario">
            <button
              type="button"
              id="botaoDropdownHorario"
              class="dropdownCustomizadoBotao"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-labelledby="labelHorario"
              aria-describedby="textoHorarioSelecionado"
              disabled
            >
              <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
              <span id="textoHorarioSelecionado" class="dropdownCustomizadoTexto">Selecione horário</span>
              <span class="material-symbols-outlined dropdownCustomizadoSeta" aria-hidden="true">expand_more</span>
            </button>
            <ul
              id="listaHorarios"
              class="dropdownCustomizadoLista"
              role="listbox"
              aria-labelledby="labelHorario"
              hidden
            >
            </ul>
          </div>
          <input type="hidden" id="inputHorarioSelecionado" name="horarioSelecionado" />
        </div>

        <!-- ---------- Ações ---------- -->
        <div class="acoesFormulario areaBotoes">
          <button type="button" id="botaoCancelarAgendamento" class="btn botaoBase botaoBase--opositora">
            <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
            Cancelar
          </button>
          <button type="submit" id="botaoConfirmarAgendamento" class="btn botaoBase botaoBase--primario">
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            Agendar
          </button>
        </div>

      </form>
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
      <a href="index.php?uri=busca" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemPapel>
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

          <div class="modalFeedback_icone" aria-hidden="true">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
          </div>

          <p id="textoModalServicoNaoEncontrado" class="modalFeedback_mensagem">
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

  <!-- MODAL: USUÁRIO NÃO LOGADO -->
  <div
    class="modal fade modalBase"
    id="modalNaoLogado"
    tabindex="-1"
    aria-labelledby="tituloModalNaoLogado"
    aria-describedby="textoModalNaoLogado"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalNaoLogado">Você não está logado(a)</h2>
        </div>
        <div class="modal-body text-center">
          <div class="modalFeedback_icone" aria-hidden="true">
            <span class="material-symbols-outlined" aria-hidden="true">no_accounts</span>
          </div>

          <p id="textoModalNaoLogado" class="modalFeedback_mensagem">
            Para finalizar o agendamento, você precisa estar logado(a). Para fazer login,
            clique no botão abaixo.
          </p>
        </div>
        <div class="modal-footer modalBase_rodape">
          <button type="button" id="botaoRealizarLogin" class="btn botaoBase botaoBase--primario">
            Realizar login
          </button>
        </div>
        <p class="textoSmall text-center pb-3">
          Caso não tenha uma conta, realize o
          <a href="index.php?uri=cadastroCliente" id="linkCadastro">Cadastro</a>.
        </p>
      </div>
    </div>
  </div>

  
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script><!-- jQuery -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script><!-- Bootstrap 5 -->
  <script src="public/assets/js/componentes.js"></script><!-- Componentes compartilhados -->
  <script src="public/assets/js/sessaoNavegacao.js"></script><!-- Decide qual navegação exibir -->
  <script src="public/assets/js/utilitarios.js"></script>
  <script src="public/assets/js/agendamentoCli.js" defer></script>

</body>
</html>
