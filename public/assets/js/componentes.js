$(function () {

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

$(function () {

  function dispararPesquisa($campoPesquisa) {
    const termo = $campoPesquisa.find(".campoPesquisa_input").val();
    $campoPesquisa.trigger("pesquisaAcionada", { termo: termo });
  }

  $(document).on("click", ".campoPesquisa_botaoIcone", function () {
    dispararPesquisa($(this).closest(".campoPesquisa"));
  });

  $(document).on("keypress", ".campoPesquisa_input", function (evento) {
    if (evento.which === 13) {
      evento.preventDefault();
      dispararPesquisa($(this).closest(".campoPesquisa"));
    }
  });

  $(document).on("click", ".campoSelect_opcao", function (evento) {
    evento.preventDefault();
    const $opcao = $(this);
    const $select = $opcao.closest(".campoSelect");

    $select.find(".campoSelect_valor").text($opcao.text().trim());
    $select.attr("data-valorSelecionado", $opcao.data("valor"));

    $select.trigger("opcaoSelecionada", { valor: $opcao.data("valor") });
  });

});

$(function () {

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

const NOMES_MES = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

function renderizarCalendario($calendario, ano, mesIndex, estadosPorDia) {
  estadosPorDia = estadosPorDia || {};

  const $tituloMes = $calendario.find(".calendarioBase_tituloMes");
  const $grade = $calendario.find(".calendarioBase_grade");

  $tituloMes.text(`${NOMES_MES[mesIndex]} ${ano}`);
  $calendario.attr("data-mesAtual", mesIndex).attr("data-anoAtual", ano);

  $grade.find(".calendarioBase_dia, .calendarioBase_dia--vazio").remove();

  const primeiroDiaSemana = new Date(ano, mesIndex, 1).getDay();
  const totalDiasNoMes = new Date(ano, mesIndex + 1, 0).getDate();

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

$(function () {

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

$(function () {

  $(document).on("shown.bs.modal", ".modalBase", function () {
    $(this).trigger("modalAberto");
  });

  $(document).on("hidden.bs.modal", ".modalBase", function () {
    $(this).trigger("modalFechado");
  });

});

$(function () {

  $(document).on("click", "[data-acao='cancelarConsulta']", function () {
    const $card = $(this).closest("[data-idConsulta]");
    $card.trigger("consultaCancelada", { idConsulta: $card.data("idconsulta") });
  });

  $(document).on("click", "[data-acao='aceitarConsulta']", function () {
    const $card = $(this).closest("[data-idConsulta]");
    $card.trigger("consultaAceita", { idConsulta: $card.data("idconsulta") });
  });

  $(document).on("click", "[data-acao='reagendarConsulta']", function () {
    const $card = $(this).closest("[data-idConsulta]");
    $card.trigger("consultaReagendada", { idConsulta: $card.data("idconsulta") });
  });

  $(document).on("click", "[data-acao='apagarDocumento']", function () {
    const $card = $(this).closest("[data-idDocumento]");
    $card.trigger("documentoApagado", { idDocumento: $card.data("iddocumento") });
  });

  $(document).on("click", "[data-acao='visualizarDocumento']", function () {
    const $card = $(this).closest("[data-idDocumento]");
    $card.trigger("documentoVisualizado", { idDocumento: $card.data("iddocumento") });
  });

});

$(function () {

  $(document).on("click", ".painelMenuMobile_item", function () {
    $(this).closest(".painelMenuMobile_lista, .painelMenuMobile_rodape")
      .find(".painelMenuMobile_item--ativo")
      .removeClass("painelMenuMobile_item--ativo");
    $(this).addClass("painelMenuMobile_item--ativo");
  });

});

$(function () {

  $(document).on("click", "[data-acao='sair']", function () {
    $(document).trigger("usuarioSolicitouSair");
  });

});

const ITEM_POR_PAPEL = {
  cliente: { icone: "search", rotulo: "Buscar", acao: "buscar" },
  profissionalClinica: { icone: "home", rotulo: "Início", acao: "irParaInicio" }
};

function aplicarPapelNavegacao($navegacao) {
  const papel = $navegacao.data("papel");
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

$(function () {
  $(".navLateralLogado, .navInferiorLogado").each(function () {
    aplicarPapelNavegacao($(this));
  });

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
