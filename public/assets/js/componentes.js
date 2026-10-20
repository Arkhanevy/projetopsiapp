/* ============================================================
   ARQUIVO: componentes.js

   O QUE FAZ
   Comportamentos genéricos dos componentes visuais do site (botão, indicador
   de status, campo de pesquisa e select, painel de filtro, calendário, modal,
   cards de consulta/documento, menus e navegação). Cada componente dispara
   eventos jQuery próprios para a página tratar.

   OBSERVAÇÕES
   - O arquivo é a junção de vários arquivos antigos (botao.js, status.js,
     campo.js etc.), indicados nos comentários 'Arquivo original: ...'.
   - Não usa IIFE: atualizarIndicadorStatus, renderizarCalendario,
     aplicarPapelNavegacao, NOMES_MES e ITEM_POR_PAPEL ficam globais
     (aplicarPapelNavegacao é usada por sessaoNavegacao.js e perfil.js).
   - Quase tudo usa delegação em document: funciona também em elementos
     criados depois.
   - Eventos disparados: botaoAcionado, pesquisaAcionada, opcaoSelecionada,
     filtroAplicado, mesAlterado, diaSelecionado, modalAberto/modalFechado,
     consultaCancelada/Aceita/Reagendada, documentoApagado/Visualizado e
     usuarioSolicitouSair.
   - Nos arquivos enviados, só pesquisaAcionada e opcaoSelecionada têm
     ouvinte; os demais ficam à espera da página que os usar.
     'usuarioSolicitouSair' não tem ouvinte (o perfil.js trata o clique em
     sair por conta própria).
   - agendamentoCli.js tem calendário próprio e não usa renderizarCalendario
     nem este NOMES_MES.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - Bloco botão (document ready) — Registra o clique dos botões .botaoBase.
     - Clique em .botaoBase — Ignora botão desabilitado; senão dispara o
       evento botaoAcionado com a ação (data-acao) e o elemento.
   - atualizarIndicadorStatus() — Troca o estado visual do indicador de status
     (agendada, confirmada, pendente, cancelada, realizada) e ignora estados
     desconhecidos.
   - Bloco campos (document ready) — Registra a pesquisa (lupa e Enter) e a
     seleção de opção do select.
     - dispararPesquisa() — Lê o termo do campo e dispara o evento
       pesquisaAcionada no componente.
     - Clique na lupa — Dispara a pesquisa ao clicar no ícone.
     - Enter no campo de pesquisa — Dispara a pesquisa ao pressionar Enter.
     - Clique em opção do select — Mostra o texto escolhido, guarda o valor em
       data-valorSelecionado e dispara opcaoSelecionada.
   - Bloco filtro (document ready) — Registra o clique em 'Aplicar' do painel
     de filtros.
     - Clique em Aplicar filtros — Coleta o radio marcado de cada grupo e
       dispara filtroAplicado com o resultado.
   - NOMES_MES (array) — Abreviações dos meses usadas no título do calendário.
   - renderizarCalendario() — Desenha a grade de dias de um mês (com estados
     por dia) dentro do calendarioBase.
   - Bloco calendário (document ready) — Registra a navegação entre meses e a
     seleção de dia.
     - Clique em mês anterior/próximo — Dispara mesAlterado com a direção; a
       página busca os dados e redesenha.
     - Clique em um dia — Marca o dia como selecionado e dispara
       diaSelecionado (dia, mês, ano).
   - Bloco modal (document ready) — Repassa a abertura e o fechamento dos
     modais como eventos próprios.
     - Modal aberto — Dispara modalAberto no modal.
     - Modal fechado — Dispara modalFechado no modal.
   - Bloco cards (document ready) — Converte cliques em ações de card nos
     eventos de consulta e documento.
     - Cancelar consulta — Dispara consultaCancelada com o id do card.
     - Aceitar consulta — Dispara consultaAceita com o id do card.
     - Reagendar consulta — Dispara consultaReagendada com o id do card.
     - Apagar documento — Dispara documentoApagado com o id do documento.
     - Visualizar documento — Dispara documentoVisualizado com o id do
       documento.
   - Bloco menu mobile (document ready) — Marca o item ativo do painel de menu
     mobile.
     - Clique em item do menu mobile — Move a classe de item ativo para o item
       clicado.
   - Bloco menu hambúrguer (document ready) — Trata o botão Sair do menu.
     - Clique em Sair — Dispara usuarioSolicitouSair no document.
   - ITEM_POR_PAPEL (objeto) — Define ícone, rótulo e ação do primeiro item da
     navegação por papel (cliente: Buscar; profissional/clínica: Início).
   - aplicarPapelNavegacao() — Ajusta ícone, rótulo e ação do primeiro item da
     navegação conforme o data-papel.
   - Bloco navegação (document ready) — Aplica o papel nas navegações e
     controla o item ativo.
     - Clique em item da navegação — Move o destaque de item ativo (lateral no
       desktop, inferior no mobile).
   ============================================================ */

/* ==================================================================
   Arquivo original: botao/botao.js
   ================================================================== */

/** Registra o clique dos botões .botaoBase. */
$(function () {
  /**
   * Ignora botão desabilitado; senão dispara o evento botaoAcionado com a ação (data-acao) e o
   * elemento.
   */
  $(document).on("click", ".botaoBase", function (evento) {
    const $botao = $(this);

    if ($botao.is(":disabled") || $botao.attr("aria-disabled") === "true") {
      evento.preventDefault();
      return;
    }

    const acao = $botao.data("acao") || null;

    $botao.trigger("botaoAcionado", {
      acao: acao,
      elemento: $botao
    });
  });
});


/* ==================================================================
   Arquivo original: status/status.js
   ================================================================== */

/**
 * Troca o estado visual do indicador de status (agendada, confirmada, pendente, cancelada,
 * realizada) e ignora estados desconhecidos.
 */
function atualizarIndicadorStatus($elemento, novoEstado) {
  const estadosValidos = ["agendada", "confirmada", "pendente", "cancelada", "realizada"];

  if (estadosValidos.indexOf(novoEstado) === -1) {
    console.warn(`indicadorStatus: estado "${novoEstado}" não reconhecido.`);
    return;
  }

  const classesEstado = estadosValidos.map((estado) => `indicadorStatus--${estado}`).join(" ");

  $elemento
    .removeClass(classesEstado)
    .addClass(`indicadorStatus--${novoEstado}`)
    .attr("data-estadoConsulta", novoEstado);
}


/* ==================================================================
   Arquivo original: campo/campo.js
   ================================================================== */

/** Registra a pesquisa (lupa e Enter) e a seleção de opção do select. */
$(function () {

  /** Lê o termo do campo e dispara o evento pesquisaAcionada no componente. */
  // ---------- campoPesquisa: disparo de busca ----------
  function dispararPesquisa($campoPesquisa) {
    const termo = $campoPesquisa.find(".campoPesquisa_input").val();
    $campoPesquisa.trigger("pesquisaAcionada", { termo: termo });
  }

  /** Dispara a pesquisa ao clicar no ícone. */
  $(document).on("click", ".campoPesquisa_botaoIcone", function () {
    dispararPesquisa($(this).closest(".campoPesquisa"));
  });

  /** Dispara a pesquisa ao pressionar Enter. */
  $(document).on("keypress", ".campoPesquisa_input", function (evento) {
    if (evento.which === 13) {
      evento.preventDefault();
      dispararPesquisa($(this).closest(".campoPesquisa"));
    }
  });

  /**
   * Mostra o texto escolhido, guarda o valor em data-valorSelecionado e dispara opcaoSelecionada.
   */
  // ---------- campoSelect: seleção de opção ----------
  // Abrir/fechar já é feito pelo Bootstrap (data-bs-toggle="dropdown").
  $(document).on("click", ".campoSelect_opcao", function (evento) {
    evento.preventDefault();
    const $opcao = $(this);
    const $select = $opcao.closest(".campoSelect");

    $select.find(".campoSelect_valor").text($opcao.text().trim());
    $select.attr("data-valorSelecionado", $opcao.data("valor"));

    $select.trigger("opcaoSelecionada", { valor: $opcao.data("valor") });
  });

});


/* ==================================================================
   Arquivo original: filtro/filtro.js
   ================================================================== */


/** Registra o clique em 'Aplicar' do painel de filtros. */
$(function () {

  /** Coleta o radio marcado de cada grupo e dispara filtroAplicado com o resultado. */
  $(document).on("click", ".painelFiltro_botaoAplicar", function () {
    const $painel = $(this).closest(".painelFiltro");
    const filtrosSelecionados = {};

    $painel.find(".grupoFiltro").each(function () {
      const nomeGrupo = $(this).data("grupoFiltro");
      const valorSelecionado = $(this).find("input[type='radio']:checked").val() || null;
      filtrosSelecionados[nomeGrupo] = valorSelecionado;
    });

    $painel.trigger("filtroAplicado", filtrosSelecionados);
  });

});


/* ==================================================================
   Arquivo original: calendario/calendario.js
   ================================================================== */
/** Abreviações dos meses usadas no título do calendário. */
const NOMES_MES = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

/** Desenha a grade de dias de um mês (com estados por dia) dentro do calendarioBase. */
/**
 * Renderiza a grade de dias de um mês dentro do calendarioBase.
 *
 * @param {jQuery} $calendario  elemento .calendarioBase
 * @param {number} ano          ex.: 2026
 * @param {number} mesIndex     0 = Janeiro ... 11 = Dezembro
 * @param {Object} estadosPorDia mapa { "1": "indisponivel", "15": "selecionado", ... }
 */
function renderizarCalendario($calendario, ano, mesIndex, estadosPorDia) {
  estadosPorDia = estadosPorDia || {};

  const $tituloMes = $calendario.find(".calendarioBase_tituloMes");
  const $grade = $calendario.find(".calendarioBase_grade");

  $tituloMes.text(`${NOMES_MES[mesIndex]} ${ano}`);
  $calendario.attr("data-mesAtual", mesIndex).attr("data-anoAtual", ano);

  // Remove apenas as células de dia, mantendo o cabeçalho Dom–Sáb
  $grade.find(".calendarioBase_dia, .calendarioBase_dia--vazio").remove();

  const primeiroDiaSemana = new Date(ano, mesIndex, 1).getDay(); // 0 = domingo
  const totalDiasNoMes = new Date(ano, mesIndex + 1, 0).getDate();

  // Preenche os espaços vazios antes do dia 1
  for (let i = 0; i < primeiroDiaSemana; i++) {
    $grade.append('<span class="calendarioBase_dia--vazio" aria-hidden="true"></span>');
  }

  for (let dia = 1; dia <= totalDiasNoMes; dia++) {
    const estado = estadosPorDia[String(dia)] || null;
    const $celula = $("<button>", {
      type: "button",
      class: "calendarioBase_dia",
      "data-dia": dia,
      text: dia
    });

    if (estado) {
      $celula.addClass(`calendarioBase_dia--${estado}`);
      $celula.attr("data-estadoDia", estado);
    }

    if (estado === "indisponivel" || estado === "folga") {
      $celula.prop("disabled", true);
    }

    $grade.append($celula);
  }
}

/** Registra a navegação entre meses e a seleção de dia. */
$(function () {

  /** Dispara mesAlterado com a direção; a página busca os dados e redesenha. */
  // Navegação entre meses — quem escuta este evento deve buscar os
  // novos estados de dia (ex.: via AJAX) e chamar renderizarCalendario novamente
  $(document).on("click", ".calendarioBase_botaoNavegacao", function () {
    const $calendario = $(this).closest(".calendarioBase");
    let direcao;
    if ($(this).data("direcao") === "proximo") {
      direcao = 1;
    } else {
      direcao = -1;
    }

    $calendario.trigger("mesAlterado", {
      direcao: direcao,
      mesAtual: parseInt($calendario.attr("data-mesAtual"), 10),
      anoAtual: parseInt($calendario.attr("data-anoAtual"), 10)
    });
  });

  /** Marca o dia como selecionado e dispara diaSelecionado (dia, mês, ano). */
  // Seleção de dia (somente dias habilitados)
  $(document).on("click", ".calendarioBase_dia:not(:disabled)", function () {
    const $dia = $(this);
    const $calendario = $dia.closest(".calendarioBase");

    $calendario.find(".calendarioBase_dia--selecionado").removeClass("calendarioBase_dia--selecionado");
    $dia.addClass("calendarioBase_dia--selecionado");

    $calendario.trigger("diaSelecionado", {
      dia: $dia.data("dia"),
      mes: parseInt($calendario.attr("data-mesAtual"), 10),
      ano: parseInt($calendario.attr("data-anoAtual"), 10)
    });
  });

});


/* ==================================================================
   Arquivo original: modal/modal.js
   ================================================================== */

/** Repassa a abertura e o fechamento dos modais como eventos próprios. */
$(function () {

  /** Dispara modalAberto no modal. */
  // Exemplo de gancho: disparar um evento próprio sempre que qualquer
  // modalBase for aberto/fechado, para quem quiser reagir a isso.
  $(document).on("shown.bs.modal", ".modalBase", function () {
    $(this).trigger("modalAberto");
  });

  /** Dispara modalFechado no modal. */
  $(document).on("hidden.bs.modal", ".modalBase", function () {
    $(this).trigger("modalFechado");
  });

});


/* ==================================================================
   Arquivo original: cards/cards.js
   ================================================================== */

/** Converte cliques em ações de card nos eventos de consulta e documento. */
$(function () {

  /** Dispara consultaCancelada com o id do card. */
  $(document).on("click", "[data-acao='cancelarConsulta']", function () {
    const $card = $(this).closest("[data-idConsulta]");
    $card.trigger("consultaCancelada", { idConsulta: $card.data("idconsulta") });
  });

  /** Dispara consultaAceita com o id do card. */
  $(document).on("click", "[data-acao='aceitarConsulta']", function () {
    const $card = $(this).closest("[data-idConsulta]");
    $card.trigger("consultaAceita", { idConsulta: $card.data("idconsulta") });
  });

  /** Dispara consultaReagendada com o id do card. */
  $(document).on("click", "[data-acao='reagendarConsulta']", function () {
    const $card = $(this).closest("[data-idConsulta]");
    $card.trigger("consultaReagendada", { idConsulta: $card.data("idconsulta") });
  });

  /** Dispara documentoApagado com o id do documento. */
  $(document).on("click", "[data-acao='apagarDocumento']", function () {
    const $card = $(this).closest("[data-idDocumento]");
    $card.trigger("documentoApagado", { idDocumento: $card.data("iddocumento") });
  });

  /** Dispara documentoVisualizado com o id do documento. */
  $(document).on("click", "[data-acao='visualizarDocumento']", function () {
    const $card = $(this).closest("[data-idDocumento]");
    $card.trigger("documentoVisualizado", { idDocumento: $card.data("iddocumento") });
  });

});


/* ==================================================================
   Arquivo original: navegacao/painelMenuMobile.js
   ================================================================== */

/** Marca o item ativo do painel de menu mobile. */
$(function () {

  /** Move a classe de item ativo para o item clicado. */
  $(document).on("click", ".painelMenuMobile_item", function () {
    $(this).closest(".painelMenuMobile_lista, .painelMenuMobile_rodape")
      .find(".painelMenuMobile_item--ativo")
      .removeClass("painelMenuMobile_item--ativo");
    $(this).addClass("painelMenuMobile_item--ativo");
  });

});


/* ==================================================================
   Arquivo original: navegacao/menuHamburguerLogado.js
   ================================================================== */

/** Trata o botão Sair do menu. */
$(function () {

  /** Dispara usuarioSolicitouSair no document. */
  $(document).on("click", "[data-acao='sair']", function () {
    $(document).trigger("usuarioSolicitouSair");
  });

});


/* ==================================================================
   Arquivo original: navegacao/navegacao.js
   ================================================================== */

/**
 * Define ícone, rótulo e ação do primeiro item da navegação por papel (cliente: Buscar;
 * profissional/clínica: Início).
 */
const ITEM_POR_PAPEL = {
  cliente: { icone: "search", rotulo: "Buscar", acao: "buscar" },
  profissionalClinica: { icone: "home", rotulo: "Início", acao: "irParaInicio" }
};

/** Ajusta ícone, rótulo e ação do primeiro item da navegação conforme o data-papel. */
function aplicarPapelNavegacao($navegacao) {
  const papel = $navegacao.data("papel"); // "cliente" | "profissionalClinica"
  const config = ITEM_POR_PAPEL[papel];

  if (!config) {
    console.warn(`navegacao: papel "${papel}" não reconhecido.`);
    return;
  }

  const $primeiroItem = $navegacao.find("[data-itemPapel]");
  $primeiroItem.find(".material-symbols-outlined").text(config.icone);
  $primeiroItem.find(".navLateralLogado_rotulo, .navInferiorLogado_rotulo").text(config.rotulo);
  $primeiroItem.attr("data-acao", config.acao);
}

/** Aplica o papel nas navegações e controla o item ativo. */
$(function () {
  $(".navLateralLogado, .navInferiorLogado").each(function () {
    aplicarPapelNavegacao($(this));
  });

  /** Move o destaque de item ativo (lateral no desktop, inferior no mobile). */
  // Item ativo (desktop e mobile)
  $(document).on("click", ".navLateralLogado_item, .navInferiorLogado_item", function () {
    const $nav = $(this).closest(".navLateralLogado, .navInferiorLogado");
    $nav.find(".navLateralLogado_item--ativo, .navInferiorLogado_item--ativo")
      .removeClass("navLateralLogado_item--ativo navInferiorLogado_item--ativo");
    let classeAtiva;
    if ($(this).closest(".navLateralLogado").length) {
      classeAtiva = "navLateralLogado_item--ativo";
    } else {
      classeAtiva = "navInferiorLogado_item--ativo";
    }
    $(this).addClass(classeAtiva);
  });
});


