/* ============================================================
   RESUMO DO ARQUIVO: busca.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloBusca
   - Função/método: iniciar
   - Função/método: cachearElementos
   - Função/método: registrarEventos
   - Função/método: pesquisar
   - Função/método: mostrarAviso
   - Função/método: esconderAviso
   - Função/método: podeTrocar
   - Função/método: intervaloDeTroca
   - Função/método: cancelarTroca
   - Função/método: agendarProximaTroca
   - Função/método: trocarTermo
   ============================================================ */

/* ============================================================
   PÁGINA: busca (tela inicial)
   Depende de: jQuery, Bootstrap 5 (bundle), componentes.js,
               sessaoNavegacao.js e buscaComum.js (window.ElmoBusca).

   O que faz:
   - alterna o título (Serviço / Profissional / Clínica) e o placeholder
     do campo, com a animação definida em busca.css;
   - valida o termo e leva para a tela de resultados (o tipo — serviço,
     profissional ou clínica — é escolhido lá, pelas abas);
   - trata o clique nas sugestões (preenche o campo e já pesquisa).

   Não chama o backend: a busca em si acontece em resultadosBusca.js.

   Obs.: os atributos data-* em camelCase são lidos com .attr(); o .data()
   do jQuery espera a forma com hífen (data-intervalo-troca).
   ============================================================ */

(function ($, Busca) {
  "use strict";

  // Objeto \'moduloBusca\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloBusca = {

    configuracao: {
      intervaloPadrao: 3000,   // ms; pode ser trocado em data-intervaloTroca no título
      duracaoTransicao: 500    // ms; deve ser igual à transição do tituloBusca_termo no CSS
    },

    estado: {
      indiceAtivo: 0,
      temporizador: null,
      animacaoReduzida: false,
      campoEmUso: false
    },

    elementos: {},

    // Método \'iniciar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    iniciar: function() {
      this.cachearElementos();
      Busca.configurarNavegacao();
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.estado.animacaoReduzida = true;
      } else {
        this.estado.animacaoReduzida = false;
      }
      this.registrarEventos();
      this.agendarProximaTroca();
    },

    // Método \'cachearElementos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    cachearElementos: function() {
      var e = this.elementos;
      e.$titulo = $("#tituloBusca");
      e.$termos = $(".tituloBusca_termo");
      e.$campoPesquisa = $("#campoPesquisaBusca");
      e.$entrada = $("#entradaBusca");
      e.$aviso = $("#avisoBusca");
      e.$sugestoes = $(".sugestoesBusca_botao");
    },

    // Método \'registrarEventos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    registrarEventos: function() {
      var self = this;

      // Evento do campoPesquisa (componentes.js): lupa ou Enter
      $(document).on("pesquisaAcionada", "#campoPesquisaBusca", function (evento, dados) {
        self.pesquisar(dados && dados.termo);
      });

      this.elementos.$sugestoes.on("click", function () {
        var termo = $(this).attr("data-termoSugestao");
        self.elementos.$entrada.val(termo);
        self.pesquisar(termo);
      });

      this.elementos.$entrada
        .on("input", function () {
          self.esconderAviso();
        })
        // Enquanto a pessoa usa o campo, o placeholder para de trocar
        .on("focus", function () {
          self.estado.campoEmUso = true;
          self.cancelarTroca();
        })
        .on("blur", function () {
          self.estado.campoEmUso = false;
          self.agendarProximaTroca();
        });

      // Aba em segundo plano: não troca
      $(document).on("visibilitychange", function () {
        if (document.hidden) {
          self.cancelarTroca();
        } else {
          self.agendarProximaTroca();
        }
      });
    },

    /* ---------- Pesquisa ---------- */
    // Método \'pesquisar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    pesquisar: function(termo) {
      if (!Busca.termoValido(termo)) {
        this.mostrarAviso();
        return;
      }
      Busca.irParaResultados(termo);
    },

    // Método \'mostrarAviso\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mostrarAviso: function() {
      this.elementos.$aviso.removeAttr("hidden");
      this.elementos.$entrada.attr("aria-invalid", "true").trigger("focus");
    },

    // Método \'esconderAviso\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    esconderAviso: function() {
      this.elementos.$aviso.attr("hidden", "hidden");
      this.elementos.$entrada.removeAttr("aria-invalid");
    },

    /* ---------- Título animado ---------- */
    // Método \'podeTrocar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    podeTrocar: function() {
      return !this.estado.animacaoReduzida &&
        !this.estado.campoEmUso &&
        !document.hidden &&
        this.elementos.$termos.length > 1;
    },

    // Método \'intervaloDeTroca\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    intervaloDeTroca: function() {
      var valor = parseInt(this.elementos.$titulo.attr("data-intervaloTroca"), 10);
      if (valor > 0) {
        return valor;
      } else {
        return this.configuracao.intervaloPadrao;
      }
    },

    // Método \'cancelarTroca\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    cancelarTroca: function() {
      window.clearTimeout(this.estado.temporizador);
      this.estado.temporizador = null;
    },

    // Método \'agendarProximaTroca\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    agendarProximaTroca: function() {
      var self = this;
      this.cancelarTroca();

      if (!this.podeTrocar()) {
        return;
      }
      this.estado.temporizador = window.setTimeout(function () {
        self.trocarTermo();
        self.agendarProximaTroca();
      }, this.intervaloDeTroca());
    },

    // Método \'trocarTermo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    trocarTermo: function() {
      var $termos = this.elementos.$termos;
      var $atual = $termos.eq(this.estado.indiceAtivo);
      this.estado.indiceAtivo = (this.estado.indiceAtivo + 1) % $termos.length;
      var $proximo = $termos.eq(this.estado.indiceAtivo);

      // O termo atual sobe e some; o próximo entra por baixo
      $atual.removeClass("tituloBusca_termo--ativo").addClass("tituloBusca_termo--saindo");
      $proximo.addClass("tituloBusca_termo--ativo");

      window.setTimeout(function () {
        $atual.removeClass("tituloBusca_termo--saindo");
      }, this.configuracao.duracaoTransicao);

      this.elementos.$entrada.attr("placeholder", $proximo.attr("data-placeholderBusca"));
    }
  };

  $(function () {
    moduloBusca.iniciar();
  });

})(jQuery, window.ElmoBusca);
