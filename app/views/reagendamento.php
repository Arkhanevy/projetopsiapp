<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reagendamento</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link rel="stylesheet" href="public/assets/css/variaveis.css" />
  <link rel="stylesheet" href="public/assets/css/componentes.css" />
  <link rel="stylesheet" href="public/assets/css/agendamentoCli.css" />
  <link rel="stylesheet" href="public/assets/css/reagendamento.css" />
  <link rel="stylesheet" href="public/assets/css/responsivo.css" />
</head>
<body>

  <a href="#conteudoAgendamento" class="linkPularConteudo">Pular para o conteúdo principal</a>

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
        <a class="nav-link navbar-brand navTopoDeslogado_acao" href="index.php?uri=login">Entrar</a>
      </div>
    </div>
  </nav>

  <header class="navTopoLogado" hidden>
    <a href="index.php" class="navTopoLogado_logo">
      <img src="public/assets/images/logo.png" alt="" width="40" height="40">
      <span data-nomePlataforma="">Podopsi</span>
    </a>

    <div class="dropdown menuHamburguerLogado d-none d-md-block">
      <button type="button" class="menuHamburguerLogado_botao dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menu">
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end menuHamburguerLogado_lista">
        <li><a href="#" class="dropdown-item menuHamburguerLogado_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>

    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobileAgendamento" aria-controls="painelMenuMobileAgendamento" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobileAgendamento" aria-labelledby="tituloPainelMenuMobileAgendamento">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobileAgendamento">
        <img src="public/assets/images/logo.png" alt="" width="40" height="40">
        <span data-nomePlataforma="">Podopsi</span>
      </a>
      <button type="button" class="painelMenuMobile_botaoFechar" data-bs-dismiss="offcanvas" aria-label="Fechar menu">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <ul class="painelMenuMobile_rodape">
        <li><a href="#" class="painelMenuMobile_item" data-acao="sair"><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sair</a></li>
      </ul>
    </div>
  </div>

  <nav class="navLateralLogado d-none d-md-flex" data-papel="profissionalClinica" aria-label="Navegação principal" hidden>
    <a href="index.php?uri=inicioProfissional" class="navLateralLogado_item" data-itemPapel>
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
    <a href="index.php?uri=agendaProfissional" class="navLateralLogado_item navLateralLogado_item--ativo" aria-current="page" data-itemAgenda>
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

    <main id="conteudoAgendamento" class="conteudoAgendamento container-fluid">

      <button type="button" id="botaoVoltar" class="botaoVoltarAgendamento btn rounded-circle" aria-label="Voltar">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>

      <form id="formularioAgendamento" class="gradeAgendamento estadoCarregando" novalidate>

        <input type="hidden" id="inputIdConsulta" name="idConsulta" />

        <h1 class="tituloAgendamento areaTitulo">Reagendamento</h1>

        <div class="alertaValidacao areaAlerta" id="alertaValidacao" role="alert" hidden>
          Você precisa preencher todos os dados!
        </div>

        <div class="campoFormulario areaConsultaAtual" id="blocoConsultaAtual">
          <h2 class="tituloCampo">Consulta atual</h2>
          <p class="consultaAtualServico" data-campo="nomeServico"></p>
          <p class="consultaAtualLinha">
            <span class="material-symbols-outlined" aria-hidden="true">event</span>
            <span data-campo="dataHoraAtual"></span>
          </p>
          <p class="consultaAtualLinha" id="linhaSalaAtual" hidden>
            <span class="material-symbols-outlined" aria-hidden="true">meeting_room</span>
            <span data-campo="salaAtual"></span>
          </p>
          <p class="textoAjuda">
            Depois de reagendar, a consulta volta a aguardar confirmação.
          </p>
        </div>

        <div class="campoValor areaValor">
          <div class="campoValorLinha">
            <h2 class="tituloCampo">Valor</h2>
            <p class="valorAgendamento" data-campo="precoServico">R$12,50</p>
          </div>
          <p class="textoAjuda">
            O valor continua sendo o do serviço da consulta.
          </p>
        </div>

        <div class="campoFormulario areaProfissional">
          <label for="inputProfissionalResponsavel" class="tituloCampo">Profissional responsável</label>
          <input
            type="text"
            id="inputProfissionalResponsavel"
            class="inputFormulario"
            data-campo="nomeProfissional"
            value=""
            readonly
          />
        </div>

        <div class="campoFormulario areaCalendario">
          <h2 class="tituloCampo" id="labelCalendario">Selecione o novo dia</h2>
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

        <div class="campoFormulario areaHorario">
          <span id="labelHorario" class="tituloCampo">Selecione o novo horário</span>
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

        <div class="campoFormulario areaSala">
          <span id="labelSala" class="tituloCampo">Selecione a sala de atendimento</span>
          <div class="dropdownCustomizado" id="dropdownSala">
            <button
              type="button"
              id="botaoDropdownSala"
              class="dropdownCustomizadoBotao"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-labelledby="labelSala"
              aria-describedby="textoSalaSelecionada"
              disabled
            >
              <span class="material-symbols-outlined" aria-hidden="true">meeting_room</span>
              <span id="textoSalaSelecionada" class="dropdownCustomizadoTexto">Selecione a sala</span>
              <span class="material-symbols-outlined dropdownCustomizadoSeta" aria-hidden="true">expand_more</span>
            </button>
            <ul
              id="listaSalas"
              class="dropdownCustomizadoLista"
              role="listbox"
              aria-labelledby="labelSala"
              hidden
            >
            </ul>
          </div>
          <input type="hidden" id="inputSalaSelecionada" name="salaSelecionada" />
        </div>

        <div class="acoesFormulario areaBotoes">
          <button type="button" id="botaoCancelarAgendamento" class="btn botaoBase botaoBase--opositora">
            <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Voltar
          </button>
          <button type="submit" id="botaoConfirmarAgendamento" class="btn botaoBase botaoBase--primario">
            <span class="material-symbols-outlined" aria-hidden="true">event_repeat</span>
            Reagendar
          </button>
        </div>

      </form>
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
      <a href="index.php?uri=inicioProfissional" class="navInferiorLogado_item" data-itemPapel>
        <span class="material-symbols-outlined" aria-hidden="true">home</span>
        <span class="navInferiorLogado_rotulo">Início</span>
      </a>
      <a href="index.php?uri=agendaProfissional" class="navInferiorLogado_item navInferiorLogado_item--ativo" aria-current="page" data-itemAgenda>
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
    id="modalConsultaNaoEncontrada"
    tabindex="-1"
    aria-labelledby="tituloModalConsultaNaoEncontrada"
    aria-describedby="textoModalConsultaNaoEncontrada"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 class="modal-title modalBase_titulo" id="tituloModalConsultaNaoEncontrada">Consulta não encontrada</h2>
        </div>
        <div class="modal-body text-center">
          <div class="modalFeedback_icone" aria-hidden="true">
            <span class="material-symbols-outlined" aria-hidden="true">event_busy</span>
          </div>
          <p id="textoModalConsultaNaoEncontrada" class="modalFeedback_mensagem">
            Não conseguimos carregar a consulta que você quer reagendar.
          </p>
        </div>
        <div class="modal-footer modalBase_rodape flex-wrap justify-content-center gap-2">
          <button type="button" id="botaoTentarNovamente" class="btn botaoBase botaoBase--primario">
            Tentar novamente
          </button>
          <a href="index.php" id="linkVoltarAgenda" class="btn botaoBase botaoBase--opositora">Voltar à agenda</a>
        </div>
        <p class="textoSmall text-center pb-3">
          Caso o erro permaneça, entre em contato com a
          <a href="index.php?uri=centralAjuda" id="linkCentralAjuda">Central de Ajuda.</a>
        </p>
      </div>
    </div>
  </div>

  <div class="modal fade modalBase" id="modalNaoLogado" tabindex="-1" aria-labelledby="tituloModalNaoLogado" aria-describedby="textoModalNaoLogado" aria-modal="true" role="dialog">
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
            Para reagendar uma consulta, você precisa estar logado(a). Entre na sua conta para continuar.
          </p>
        </div>
        <div class="modal-footer modalBase_rodape flex-wrap justify-content-center gap-2">
          <a href="index.php?uri=login" class="btn botaoBase botaoBase--primario" data-loginRedirecionar>Entrar</a>
        </div>
      </div>
    </div>
  </div>
  
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="public/assets/js/componentes.js"></script>
  <script src="public/assets/js/sessaoNavegacao.js"></script>
  <script src="public/assets/js/utilitarios.js"></script>
  <script src="public/assets/js/reagendamento.js" defer></script>

</body>
</html>