/* ============================================================
   RESUMO DO ARQUIVO: home.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloHome
   - Função/método: iniciar
   ============================================================ */

/* ============================================================
   PÁGINA: home (barra de busca)
   Depende de: jQuery, componentes.js e buscaComum.js (window.ElmoBusca).

   A barra da home faz a mesma busca da tela "busca": leva o termo
   para a tela de resultados. Não chama o backend.
   ============================================================ */

(function ($, Busca) {
  "use strict";

  // Objeto \'moduloHome\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloHome = {

    // Método \'iniciar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    iniciar: function() {
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
