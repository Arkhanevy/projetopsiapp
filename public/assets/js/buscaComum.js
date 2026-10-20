/* ============================================================
   ARQUIVO: buscaComum.js

   O QUE FAZ
   Código compartilhado pelas telas de busca (home.js, busca.js e
   resultadosBusca.js): valida o termo, monta a URL de resultados e ajusta a
   navegação ao tipo de usuário logado. Expõe window.ElmoBusca.

   OBSERVAÇÕES
   - Deve ser carregado ANTES do JS de cada página. Depende de jQuery.
   - configurarNavegacao() só age quando a página também carrega
     sessaoNavegacao.js (usa o evento sessaoNavegacaoDefinida).
   - Profissional e clínica têm 'Início' no lugar de 'Buscar', por isso o item
     perde o destaque e aponta para o início.
   - O mapa hrefAgendaPorTipo se repete em notificacoes.js e contatos.js; vale
     centralizar um dia.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e publica ElmoBusca em
     window.
     - ElmoBusca (objeto) — Objeto de utilidades de busca compartilhado entre
       as telas.
       - ElmoBusca.configuracao — URLs da busca e links de destino conforme o
         tipo de usuário.
         - ElmoBusca.configuracao.hrefAgendaPorTipo — Mapa tipo de usuário ->
           link da agenda/consultas.
       - ElmoBusca.termoValido() — Retorna true se o termo não é vazio
         (ignorando espaços).
       - ElmoBusca.construirUrlResultados() — Monta a URL da tela de
         resultados com o termo codificado.
       - ElmoBusca.irParaResultados() — Redireciona o navegador para a tela de
         resultados com o termo.
       - ElmoBusca.configurarNavegacao() — Ao saber a sessão, mostra a barra
         superior do logado e ajusta os links de agenda e o item
         Buscar/Início.
   ============================================================ */

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

/** Função autoexecutável que isola o escopo e publica ElmoBusca em window. */
(function ($, window) {
  "use strict";

  /** Objeto de utilidades de busca compartilhado entre as telas. */
  var ElmoBusca = {

    /** URLs da busca e links de destino conforme o tipo de usuário. */
    configuracao: {
      urlResultados: "index.php?uri=resultadosBusca",
      urlInicioProfissionalClinica: "index.php",
      /** Mapa tipo de usuário -> link da agenda/consultas. */
      hrefAgendaPorTipo: {
        cliente: "index.php?uri=consultasCli",
        clienteSimples: "index.php?uri=consultasCli",
        profissional: "index.php?uri=agendaProfissional",
        clinica: "index.php?uri=agendaClinica"
      }
    },

    /** Retorna true se o termo não é vazio (ignorando espaços). */
    termoValido: function (termo) {
      return $.trim(termo || "") !== "";
    },

    /** Monta a URL da tela de resultados com o termo codificado. */
    construirUrlResultados: function (termo) {
      return this.configuracao.urlResultados + "&termo=" + encodeURIComponent($.trim(termo));
    },

    /** Redireciona o navegador para a tela de resultados com o termo. */
    irParaResultados: function (termo) {
      window.location.href = this.construirUrlResultados(termo);
    },

    /**
     * Ao saber a sessão, mostra a barra superior do logado e ajusta os links de agenda e o item
     * Buscar/Início.
     */
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
