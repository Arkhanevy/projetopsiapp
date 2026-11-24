(function ($, Busca) {
  "use strict";

  // Pesquisa do hero (componente campoPesquisa dispara "pesquisaAcionada")
  $(document).on("pesquisaAcionada", ".campoPesquisaHome", function (evento, dados) {
    const termo = dados && dados.termo;

    if (!Busca.termoValido(termo)) {
      $(this).find(".campoPesquisa_input").trigger("focus");
      return;
    }
    Busca.irParaResultados(termo);
  });

})(jQuery, window.ElmoBusca);