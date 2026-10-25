(function ($) {
  "use strict";

  var moduloSessaoNavegacao = {

    configuracao: {

      tiposParaVerificar: ["cliente", "profissional", "clinica"],

      urlVerificarSessaoPorTipo: function (tipo) {
        return "index.php?uri=" + tipo;
      }
    },

    itemContatosPorTipo: {
      clienteSimples: { icone: "description", rotulo: "Documentos" }
    },

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      this.verificarSessao();
    },

    cachearElementos: function () {
      this.elementos.$navTopoDeslogado = $(".navTopoDeslogado");
      this.elementos.$navsLogado = $(".navLateralLogado, .navInferiorLogado");
      this.elementos.$menuHamburguer = $(".menuHamburguerLogado");
      this.elementos.$itemContatos = $("[data-itemContatos]");
    },

    verificarSessao: function () {
      this.testarTipo(this.configuracao.tiposParaVerificar, 0);
    },

    testarTipo: function (tipos, indice) {
      var self = this;

      if (indice >= tipos.length) {
        self.exibirNavegacaoDeslogado();
        return;
      }

      var tipoAtual = tipos[indice];

      $.ajax({
        url: this.configuracao.urlVerificarSessaoPorTipo(tipoAtual),
        method: "POST",
        dataType: "json",
        data: { acao: "verificarLogin" }
      })
        .done(function (resposta) {
          if (resposta && resposta.logado) {
            self.exibirNavegacaoLogado(tipoAtual);
          } else {
            self.testarTipo(tipos, indice + 1);
          }
        })
        .fail(function () {
          self.testarTipo(tipos, indice + 1);
        });
    },

    exibirNavegacaoDeslogado: function () {
      this.elementos.$navTopoDeslogado.removeAttr("hidden");
      this.elementos.$navsLogado.attr("hidden", "hidden");
      this.elementos.$menuHamburguer.attr("hidden", "hidden");

      $(document).trigger("sessaoNavegacaoDefinida", [{ logado: false, tipoUsuario: null }]);
    },

    exibirNavegacaoLogado: function (tipoUsuario) {
      var papel;
      if (tipoUsuario === "cliente" || tipoUsuario === "clienteSimples") {
        papel = "cliente";
      } else {
        papel = "profissionalClinica";
      }

      this.elementos.$navsLogado
        .attr("data-papel", papel)
        .data("papel", papel)
        .removeAttr("hidden");
      this.elementos.$menuHamburguer.removeAttr("hidden");
      this.elementos.$navTopoDeslogado.attr("hidden", "hidden");

      var configContatos = this.itemContatosPorTipo[tipoUsuario];
      if (configContatos) {
        this.elementos.$itemContatos
          .find(".material-symbols-outlined")
          .text(configContatos.icone);
        this.elementos.$itemContatos
          .find(".navLateralLogado_rotulo, .navInferiorLogado_rotulo")
          .text(configContatos.rotulo);
      }

      if (typeof aplicarPapelNavegacao === "function") {
        this.elementos.$navsLogado.each(function () {
          aplicarPapelNavegacao($(this));
        });
      }

      $(document).trigger("sessaoNavegacaoDefinida", [{ logado: true, tipoUsuario: tipoUsuario }]);
    }
  };

  $(function () {
    moduloSessaoNavegacao.iniciar();
  });

})(jQuery);
