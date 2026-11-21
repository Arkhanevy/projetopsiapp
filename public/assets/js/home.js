(function ($, Busca) {
  "use strict";

  const moduloHome = {

    iniciar: function () {

      $(document).on("pesquisaAcionada", ".campoPesquisaHome", function (evento, dados) {
        const termo = dados && dados.termo;

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
