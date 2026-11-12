(function ($, Busca) {
  "use strict";

  var moduloBusca = {

    configuracao: {
      intervaloPadrao: 3000,
      duracaoTransicao: 500
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
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.estado.animacaoReduzida = true;
      } else {
        this.estado.animacaoReduzida = false;
      }
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

        .on("focus", function () {
          self.estado.campoEmUso = true;
          self.cancelarTroca();
        })
        .on("blur", function () {
          self.estado.campoEmUso = false;
          self.agendarProximaTroca();
        });

      $(document).on("visibilitychange", function () {
        if (document.hidden) {
          self.cancelarTroca();
        } else {
          self.agendarProximaTroca();
        }
      });
    },

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

    podeTrocar: function () {
      return !this.estado.animacaoReduzida &&
        !this.estado.campoEmUso &&
        !document.hidden &&
        this.elementos.$termos.length > 1;
    },

    intervaloDeTroca: function () {
      var valor = parseInt(this.elementos.$titulo.attr("data-intervaloTroca"), 10);
      if (valor > 0) {
        return valor;
      } else {
        return this.configuracao.intervaloPadrao;
      }
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
