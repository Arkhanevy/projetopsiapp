(function ($, window) {
  "use strict";

  var ElmoBusca = {

    configuracao: {
      urlResultados: "index.php?uri=resultadosBusca",
      urlInicioProfissionalClinica: "index.php",

      hrefAgendaPorTipo: {
        cliente: "index.php?uri=consultasCli",
        clienteSimples: "index.php?uri=consultasCli",
        profissional: "index.php?uri=agendaProfissional",
        clinica: "index.php?uri=agendaClinica"
      }
    },

    termoValido: function (termo) {
      return $.trim(termo || "") !== "";
    },

    construirUrlResultados: function (termo) {
      return this.configuracao.urlResultados + "&termo=" + encodeURIComponent($.trim(termo));
    },

    irParaResultados: function (termo) {
      window.location.href = this.construirUrlResultados(termo);
    },

    configurarNavegacao: function () {
      var configuracao = this.configuracao;

      $(document).on("sessaoNavegacaoDefinida", function (evento, sessao) {
        if (!sessao || !sessao.logado) {
          return;
        }

        $(".navTopoLogado").removeAttr("hidden");

        var tipo = sessao.tipoUsuario;
        if (configuracao.hrefAgendaPorTipo[tipo]) {
          $("[data-itemAgenda]").attr("href", configuracao.hrefAgendaPorTipo[tipo]);
        }

        if (tipo === "profissional" || tipo === "clinica") {
          $("[data-itemPapel]")
            .attr("href", configuracao.urlInicioProfissionalClinica)
            .removeAttr("aria-current");
          $(".navLateralLogado_item--ativo, .navInferiorLogado_item--ativo")
            .removeClass("navLateralLogado_item--ativo navInferiorLogado_item--ativo");
        }
      });
    }
  };

  window.ElmoBusca = ElmoBusca;

})(jQuery, window);
