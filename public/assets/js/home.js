/* ============================================================
   ARQUIVO: home.js

   O QUE FAZ
   Página inicial (home): faz a barra de busca da home levar o termo digitado
   para a tela de resultados (resultadosBusca). Não chama o backend.

   OBSERVAÇÕES
   - Depende de jQuery, componentes.js (evento pesquisaAcionada do
     campoPesquisa) e buscaComum.js (window.ElmoBusca), que deve ser carregado
     antes.
   - Termo vazio não pesquisa: o foco volta para o campo.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo do arquivo e recebe
     jQuery e ElmoBusca.
     - moduloHome (objeto) — Módulo da página home; agrupa a inicialização da
       barra de busca.
       - moduloHome.iniciar() — Escuta o evento pesquisaAcionada da barra da
         home, valida o termo e redireciona para os resultados.
     - Callback do document ready — Executa moduloHome.iniciar() quando o DOM
       estiver pronto.
   ============================================================ */

/* ============================================================
   PÁGINA: home (barra de busca)
   Depende de: jQuery, componentes.js e buscaComum.js (window.ElmoBusca).

   A barra da home faz a mesma busca da tela "busca": leva o termo
   para a tela de resultados. Não chama o backend.
   ============================================================ */

/** Função autoexecutável que isola o escopo do arquivo e recebe jQuery e ElmoBusca. */
(function ($, Busca) {
  "use strict";

  /** Módulo da página home; agrupa a inicialização da barra de busca. */
  var moduloHome = {

    /**
     * Escuta o evento pesquisaAcionada da barra da home, valida o termo e redireciona para os
     * resultados.
     */
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

  /** Executa moduloHome.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloHome.iniciar();
  });

})(jQuery, window.ElmoBusca);
