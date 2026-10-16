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

    iniciar: function () {
      this.cachearElementos();
      Busca.configurarNavegacao();
      this.estado.animacaoReduzida = !!(window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      this.registrarEventos();
      this.agendarProximaTroca();
    },

    cachearElementos: function () {
      var e = this.elementos;
      e.$titulo = $("#tituloBusca");
      e.$termos = $(".tituloBusca_termo");
      e.$campoPesquisa = $("#campoPesquisaBusca");
      e.$entrada = $("#entradaBusca");
      e.$aviso = $("#avisoBusca");
      e.$sugestoes = $(".sugestoesBusca_botao");
    },

    registrarEventos: function () {
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
    pesquisar: function (termo) {
      if (!Busca.termoValido(termo)) {
        this.mostrarAviso();
        return;
      }
      Busca.irParaResultados(termo);
    },

    mostrarAviso: function () {
      this.elementos.$aviso.removeAttr("hidden");
      this.elementos.$entrada.attr("aria-invalid", "true").trigger("focus");
    },

    esconderAviso: function () {
      this.elementos.$aviso.attr("hidden", "hidden");
      this.elementos.$entrada.removeAttr("aria-invalid");
    },

    /* ---------- Título animado ---------- */
    podeTrocar: function () {
      return !this.estado.animacaoReduzida &&
        !this.estado.campoEmUso &&
        !document.hidden &&
        this.elementos.$termos.length > 1;
    },

    intervaloDeTroca: function () {
      var valor = parseInt(this.elementos.$titulo.attr("data-intervaloTroca"), 10);
      return valor > 0 ? valor : this.configuracao.intervaloPadrao;
    },

    cancelarTroca: function () {
      window.clearTimeout(this.estado.temporizador);
      this.estado.temporizador = null;
    },

    agendarProximaTroca: function () {
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

    trocarTermo: function () {
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
