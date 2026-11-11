<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Minhas consultas — Profissional</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" /><!-- Bootstrap 5 -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /><!-- Material Symbols (Google) -->
  <link rel="stylesheet" href="public/assets/css/variaveis.css" /><!-- Variáveis globais -->
  <link rel="stylesheet" href="public/assets/css/componentes.css" /><!-- Componentes compartilhados -->
  <link rel="stylesheet" href="public/assets/css/consultasPro.css" /><!-- CSS próprio -->
</head>
<body>

  <a href="#conteudoConsultasProfissional" class="linkPularConteudo">Pular para o conteúdo principal</a>

  <!-- BARRA SUPERIOR (LOGADO — DESKTOP E MOBILE) -->
  <header class="navTopoLogado">
    <a href="index.php" class="navTopoLogado_logo">
      <img src="public/assets/images/logo.png" alt="" width="40" height="40" />
      <span data-campo="nomePlataforma">Podopsi</span>
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
    <button type="button" class="navTopoLogado_botaoMenuMobile d-md-none" data-bs-toggle="offcanvas" data-bs-target="#painelMenuMobile" aria-controls="painelMenuMobile" aria-label="Abrir menu">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
  </header>

  <!-- PAINEL DO MENU (MOBILE, LOGADO) -->
  <div class="offcanvas offcanvas-top painelMenuMobile d-md-none" tabindex="-1" id="painelMenuMobile" aria-labelledby="tituloPainelMenuMobile">
    <div class="offcanvas-header">
      <a href="index.php" class="painelMenuMobile_logo" id="tituloPainelMenuMobile">
        <img src="public/assets/images/logo.png" alt="" width="40" height="40" />
        <span data-campo="nomePlataforma">Podopsi</span>
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

  <!-- NAVEGAÇÃO LATERAL (DESKTOP, LOGADO) — exibida por sessaoNavegacao.js -->
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

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="conteudoConsultasProfissional" class="conteudoConsultasPro conteudoConsultasProfissional container-fluid">

      <h1 class="tituloConsultasPro"><span class="d-none d-md-inline">Minhas </span>Consultas</h1>
      <p id="mensagemStatusConsultasPro" class="visually-hidden" aria-live="polite" aria-atomic="true"></p>

      <div class="gradeConsultasPro">

        <!-- ---------- Calendário ---------- -->
        <section class="painelCalendarioPro" aria-labelledby="tituloCalendarioPro">
          <h2 id="tituloCalendarioPro" class="visually-hidden">Calendário de consultas</h2>

          <div id="calendarioConsultas" class="calendarioBase" role="group" aria-labelledby="tituloCalendarioPro" data-mesAtual="" data-anoAtual="">
            <div class="calendarioBase_cabecalho">
              <button type="button" class="btn calendarioBase_botaoNavegacao" data-direcao="anterior" aria-label="Mês anterior">
                <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              </button>
              <p class="calendarioBase_tituloMes" aria-live="polite">JUL 2026</p>
              <button type="button" class="btn calendarioBase_botaoNavegacao" data-direcao="proximo" aria-label="Próximo mês">
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </div>

            <!-- Os dias abaixo são apenas pré-visualização (JUL 2026); renderizarCalendario() os substitui -->
            <div class="calendarioBase_grade" id="gradeCalendarioConsultas">
              <span class="calendarioBase_diaSemana">Dom</span>
              <span class="calendarioBase_diaSemana">Seg</span>
              <span class="calendarioBase_diaSemana">Ter</span>
              <span class="calendarioBase_diaSemana">Qua</span>
              <span class="calendarioBase_diaSemana">Qui</span>
              <span class="calendarioBase_diaSemana">Sex</span>
              <span class="calendarioBase_diaSemana">Sáb</span>
            <span class="calendarioBase_dia--vazio" aria-hidden="true"></span>
            <span class="calendarioBase_dia--vazio" aria-hidden="true"></span>
            <span class="calendarioBase_dia--vazio" aria-hidden="true"></span>
            <button type="button" class="calendarioBase_dia" data-dia="1" aria-label="1 de julho">1</button>
            <button type="button" class="calendarioBase_dia" data-dia="2" aria-label="2 de julho">2</button>
            <button type="button" class="calendarioBase_dia" data-dia="3" aria-label="3 de julho">3</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="4" data-estadoDia="indisponivel" aria-label="4 de julho, indisponível" disabled>4</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="5" data-estadoDia="indisponivel" aria-label="5 de julho, indisponível" disabled>5</button>
            <button type="button" class="calendarioBase_dia" data-dia="6" aria-label="6 de julho">6</button>
            <button type="button" class="calendarioBase_dia" data-dia="7" aria-label="7 de julho">7</button>
            <button type="button" class="calendarioBase_dia" data-dia="8" aria-label="8 de julho">8</button>
            <button type="button" class="calendarioBase_dia" data-dia="9" aria-label="9 de julho">9</button>
            <button type="button" class="calendarioBase_dia" data-dia="10" aria-label="10 de julho">10</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="11" data-estadoDia="indisponivel" aria-label="11 de julho, indisponível" disabled>11</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="12" data-estadoDia="indisponivel" aria-label="12 de julho, indisponível" disabled>12</button>
            <button type="button" class="calendarioBase_dia" data-dia="13" aria-label="13 de julho">13</button>
            <button type="button" class="calendarioBase_dia" data-dia="14" aria-label="14 de julho">14</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--pendente" data-dia="15" data-estadoDia="pendente" aria-label="15 de julho, consulta pendente">15</button>
            <button type="button" class="calendarioBase_dia" data-dia="16" aria-label="16 de julho">16</button>
            <button type="button" class="calendarioBase_dia" data-dia="17" aria-label="17 de julho">17</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="18" data-estadoDia="indisponivel" aria-label="18 de julho, indisponível" disabled>18</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="19" data-estadoDia="indisponivel" aria-label="19 de julho, indisponível" disabled>19</button>
            <button type="button" class="calendarioBase_dia" data-dia="20" aria-label="20 de julho">20</button>
            <button type="button" class="calendarioBase_dia" data-dia="21" aria-label="21 de julho">21</button>
            <button type="button" class="calendarioBase_dia" data-dia="22" aria-label="22 de julho">22</button>
            <button type="button" class="calendarioBase_dia" data-dia="23" aria-label="23 de julho">23</button>
            <button type="button" class="calendarioBase_dia" data-dia="24" aria-label="24 de julho">24</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="25" data-estadoDia="indisponivel" aria-label="25 de julho, indisponível" disabled>25</button>
            <button type="button" class="calendarioBase_dia calendarioBase_dia--indisponivel" data-dia="26" data-estadoDia="indisponivel" aria-label="26 de julho, indisponível" disabled>26</button>
            <button type="button" class="calendarioBase_dia" data-dia="27" aria-label="27 de julho">27</button>
            <button type="button" class="calendarioBase_dia" data-dia="28" aria-label="28 de julho">28</button>
            <button type="button" class="calendarioBase_dia" data-dia="29" aria-label="29 de julho">29</button>
            <button type="button" class="calendarioBase_dia" data-dia="30" aria-label="30 de julho">30</button>
            <button type="button" class="calendarioBase_dia" data-dia="31" aria-label="31 de julho">31</button>
            </div>

            <ul class="calendarioBase_legenda">
              <li class="calendarioBase_itemLegenda">
                <span class="calendarioBase_marcadorLegenda calendarioBase_marcadorLegenda--confirmada" aria-hidden="true"></span>
                Consulta confirmada
              </li>
              <li class="calendarioBase_itemLegenda">
                <span class="calendarioBase_marcadorLegenda calendarioBase_marcadorLegenda--pendente" aria-hidden="true"></span>
                Consulta pendente
              </li>
              <li class="calendarioBase_itemLegenda">
                <span class="calendarioBase_marcadorLegenda calendarioBase_marcadorLegenda--selecionado" aria-hidden="true"></span>
                Dia selecionado
              </li>
              <li class="calendarioBase_itemLegenda">
                <span class="calendarioBase_marcadorLegenda calendarioBase_marcadorLegenda--indisponivel" aria-hidden="true"></span>
                Dias indisponíveis
              </li>
            </ul>
          </div>
        </section>

        <!-- ---------- Painel de consultas ---------- -->
        <section class="painelConsultasPro" aria-labelledby="tituloPainelConsultasPro">
          <h2 id="tituloPainelConsultasPro" class="visually-hidden" tabindex="-1">Consultas do dia selecionado</h2>

          <div class="painelConsultasPro_acoes">
            <a href="index.php?uri=agendamentoProfissional" id="botaoAdicionarConsulta" class="btn botaoBase botaoBase--primario botaoBase--compacto">Adicionar consulta</a>

            <!-- Filtro: opções são apenas um exemplo de preenchimento; virão do backend -->
            <div class="dropdown filtroConsultas">
              <button
                type="button"
                id="botaoFiltrarConsultas"
                class="btn filtroConsultas_gatilho dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
                aria-controls="painelFiltroConsultas"
              >
                <span class="material-symbols-outlined" aria-hidden="true">filter_alt</span>
                <span class="filtroConsultas_rotulo">Filtrar...</span>
              </button>
              <div id="painelFiltroConsultas" class="dropdown-menu dropdown-menu-end painelFiltro">
                <fieldset class="grupoFiltro" data-grupoFiltro="estadoConsulta">
                  <legend class="grupoFiltro_titulo">Situação</legend>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroEstadoConsulta" id="filtroEstadoTodas" value="todas" checked />
                    <label class="form-check-label" for="filtroEstadoTodas">Todas</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroEstadoConsulta" id="filtroEstadoPendente" value="pendente" />
                    <label class="form-check-label" for="filtroEstadoPendente">Pendentes</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="filtroEstadoConsulta" id="filtroEstadoConfirmada" value="confirmada" />
                    <label class="form-check-label" for="filtroEstadoConfirmada">Confirmadas</label>
                  </div>
                </fieldset>
                <div class="painelFiltro_rodape">
                  <button type="button" class="btn botaoBase botaoBase--primario painelFiltro_botaoAplicar">Aplicar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista: os 3 cards abaixo são modelos de pré-visualização (um por estado); o JS os substitui pelos dados do banco -->
          <div id="listaConsultasPro" class="listaConsultasPro estadoCarregando" aria-busy="true" inert>

            <!-- Modelo 1: pendente, solicitada pelo cliente -->
            <article class="card cardConsultaProfissional" data-idConsulta="" data-estadoConsulta="pendente">
              <div class="card-body d-flex flex-column gap-3">
                <div class="cardConsultaProfissional_cabecalho">
                  <h3 class="cardConsultaProfissional_servico" data-campo="nomeServico">Tratamento de unha encravada</h3>
                  <p class="cardConsultaProfissional_dataHora" data-campo="dataHoraConsulta">15 de julho, 08:00</p>
                </div>
                <div class="cardConsultaProfissional_acoes">
                  <button type="button" class="btn botaoBase botaoBase--primario botaoBase--compacto" data-acao="aceitarConsulta">
                    <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    Aceitar
                  </button>
                  <button type="button" class="btn botaoBase botaoBase--secundario botaoBase--compacto" data-acao="verDetalhesConsulta" data-bs-toggle="modal" data-bs-target="#modalDetalhesConsulta">
                    <span class="material-symbols-outlined" aria-hidden="true">assignment_turned_in</span>
                    Ver detalhes
                  </button>
                </div>
              </div>
            </article>

            <!-- Modelo 2: confirmada -->
            <article class="card cardConsultaProfissional" data-idConsulta="" data-estadoConsulta="confirmada">
              <div class="card-body d-flex flex-column gap-3">
                <div class="cardConsultaProfissional_cabecalho">
                  <h3 class="cardConsultaProfissional_servico" data-campo="nomeServico">Tratamento de unha encravada</h3>
                  <p class="cardConsultaProfissional_dataHora" data-campo="dataHoraConsulta">15 de julho, 08:00</p>
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

            <!-- Modelo 3: pendente, aguardando confirmação do paciente -->
            <article class="card cardConsultaProfissional" data-idConsulta="" data-estadoConsulta="pendente">
              <div class="card-body d-flex flex-column gap-3">
                <div class="cardConsultaProfissional_cabecalho">
                  <h3 class="cardConsultaProfissional_servico" data-campo="nomeServico">Remoção de calos e calosidades</h3>
                  <p class="cardConsultaProfissional_dataHora" data-campo="dataHoraConsulta">21 de julho, 10:00</p>
                </div>
                <div class="cardConsultaProfissional_acoes">
                  <button type="button" class="btn botaoBase botaoBase--opositora botaoBase--compacto" data-acao="cancelarConsulta" data-bs-toggle="modal" data-bs-target="#modalConfirmarCancelamento">
                    <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
                    Cancelar
                  </button>
                  <span class="indicadorStatus indicadorStatus--pendente indicadorStatus--compacto" data-estadoConsulta="pendente">
                    <span class="material-symbols-outlined" aria-hidden="true">hourglass_top</span>
                    Pendente
                  </span>
                </div>
              </div>
            </article>

          </div>

          <!-- Estado vazio -->
          <div id="estadoVazioConsultasPro" class="estadoVazio estadoVazioConsultasPro" hidden>
            <span class="material-symbols-outlined estadoVazio_icone" aria-hidden="true">event_busy</span>
            <p class="estadoVazio_texto">Nenhuma consulta agendada</p>
          </div>
        </section>

      </div>
    </main>

    <!-- NAVEGAÇÃO INFERIOR (MOBILE) -->
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

  <!-- MODAL: SESSÃO EXPIRADA (não pode ser fechado) -->
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

  <!-- MODAL: DETALHES DA CONSULTA -->
  <div
    class="modal fade modalBase"
    id="modalDetalhesConsulta"
    tabindex="-1"
    aria-labelledby="tituloModalDetalhesConsulta"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo" data-idConsulta="">
        <div class="modal-header modalBase_cabecalho">
          <h2 id="tituloModalDetalhesConsulta" class="modal-title modalBase_titulo" data-campo="nomeServico">Tratamento de unha encravada</h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="detalhesConsulta_linhaTopo">
            <p class="detalhesConsulta_dataHora" data-campo="dataHoraConsulta">17 de junho, 08:00</p>
            <p class="detalhesConsulta_preco" data-campo="precoConsulta">R$12,50</p>
          </div>
          <p class="detalhesConsulta_linha"><strong>Cliente:</strong> <span data-campo="nomeCliente">Anna Rita</span></p>
          <p class="detalhesConsulta_linha"><strong>Clínica:</strong> <span data-campo="nomeClinica">Girasol</span></p>
        </div>
        <div class="modal-footer modalBase_rodape acoesModalConfirmacao">
          <button type="button" id="botaoRecusarConsulta" class="btn botaoBase botaoBase--opositora" data-acao="recusarConsulta">
            <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
            Recusar
          </button>
          <button type="button" id="botaoAceitarConsultaModal" class="btn botaoBase botaoBase--primario" data-acao="aceitarConsulta">
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            Aceitar
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
            <strong id="nomeConsultaParaCancelar" data-campo="nomeServico">Tratamento de unha encravada</strong>!
          </p>
          <p>
            Se continuar com isso, a consulta sairá da sua agenda e da agenda do cliente.
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

  <!-- MODAL: CONSULTA ADICIONADA À AGENDA -->
  <div
    class="modal fade modalBase"
    id="modalConsultaAdicionada"
    tabindex="-1"
    aria-labelledby="tituloModalConsultaAdicionada"
    aria-describedby="textoModalConsultaAdicionada"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modalBase_conteudo">
        <div class="modal-header modalBase_cabecalho">
          <h2 id="tituloModalConsultaAdicionada" class="modal-title modalBase_titulo">Consulta adicionada à agenda</h2>
          <button type="button" class="modalBase_botaoFechar" data-bs-dismiss="modal" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="modal-body" id="textoModalConsultaAdicionada">
          <p>
            Essa consulta foi adicionada na sua agenda. Uma mensagem vai ser enviada
            para o(a) paciente para que ele(a) possa confirmar essa consulta.
          </p>
          <p>
            Quando a consulta for confirmada pelo(a) paciente, você receberá uma mensagem.
          </p>
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
  <script src="public/assets/js/consultasPro.js"></script><!-- Módulo compartilhado das consultas Pro -->
  <script src="public/assets/js/consultasProfissional.js" defer></script>
</body>
</html>
