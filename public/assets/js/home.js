/* ============================================================
   PÁGINA: home (barra de busca)
   Depende de: jQuery, componentes.js e buscaComum.js (window.ElmoBusca).

   A barra da home faz a mesma busca da tela "busca": leva o termo
   para a tela de resultados. Não chama o backend.
   ============================================================ */

(function ($, Busca) {
  "use strict";

  var moduloHome = {

    iniciar: function () {
      // Evento do campoPesquisa (componentes.js): lupa ou Enter
      $(document).on("pesquisaAcionada", ".campoPesquisaHome", function (evento, dados) {
        var termo = dados && dados.termo;

        if (!Busca.termoValido(termo)) {
          $(this).find(".campoPesquisa_input").trigger("focus");
          return;
        }
        Busca.irParaResultados(termo);
      });
    }
  };

  $(function () {
    moduloHome.iniciar();
  });

})(jQuery, window.ElmoBusca);
