/* ============================================================
   BUSCA — código compartilhado
   Usado por: home.js, busca.js e resultadosBusca.js.
   Depende de: jQuery. Quando a página tem sessaoNavegacao.js,
   configurarNavegacao() usa o evento "sessaoNavegacaoDefinida".
   Deve ser carregado ANTES do JS de cada página.

   Concentra aqui o que as três telas fazem igual: validar o termo,
   montar a URL dos resultados e ajustar a navegação ao tipo de
   usuário (a busca é aberta a visitantes e a todos os papéis).
   ============================================================ */

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

    /*
      A sessaoNavegacao.js só mostra a navegação lateral, a inferior e o menu
      hambúrguer. A barra superior do logado (.navTopoLogado) e os links que
      dependem do tipo de usuário são ajustados aqui.
    */
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

        // Profissional e clínica têm "Início" no lugar de "Buscar": o item não
        // representa esta página, então perde o destaque e volta ao início.
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
