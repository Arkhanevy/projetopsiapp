(function ($) {
  "use strict";

  var moduloSessaoNavegacao = {
    
    configuracao: {
      tiposParaVerificar: ["cliente", "profissional", "clinica"],
      urlVerificarSessaoPorTipo: function (tipo) {
        return "index.php?uri=" + tipo;
      },
      urlSair: "index.php?uri=limpar",
      urlAposSair: "index.php"
    },

    caminhosMenuPorTipo: {
      cliente: {
        inicio: "index.php?uri=buscar",
        agenda: "index.php?uri=consultasCli"
      },
      clienteSimples: {
        inicio: "index.php?uri=buscar",
        agenda: "index.php?uri=consultasCli"
      },
      profissional: {
        inicio: "index.php?uri=inicioProfissional",
        agenda: "index.php?uri=agendaProfissional",
        perfil: "index.php?uri=perfil"
      },
      clinica: {
        inicio: "index.php?uri=inicioClinica",
        agenda: "index.php?uri=agendaClinica",
        perfil: "index.php?uri=perfil"
      }
    },

    itemContatosPorTipo: {
      clienteSimples: { icone: "description", rotulo: "Documentos" }
    },

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      this.configurarSair();
      this.verificarSessao();
    },

    configurarSair: function () {
      var configuracao = this.configuracao;

      $(document).on("usuarioSolicitouSair", function () {
        $.ajax({ url: configuracao.urlSair, method: "POST" }).always(function () {
          window.location.href = configuracao.urlAposSair;
        });
      });
    },

    cachearElementos: function () {
      this.elementos.$navTopoDeslogado = $(".navTopoDeslogado");
      this.elementos.$navTopoLogado = $(".navTopoLogado");
      this.elementos.$navsLogado = $(".navLateralLogado, .navInferiorLogado");
      this.elementos.$menuHamburguer = $(".menuHamburguerLogado");
      this.elementos.$itemContatos = $("[data-itemContatos]");
      this.elementos.$itemPapel = $("[data-itemPapel]");
      this.elementos.$itemAgenda = $("[data-itemAgenda]");
      this.elementos.$itemPerfil = $("[data-itemPerfil]");
    },

    aplicarCaminhosDoMenu: function (tipoUsuario) {
      var caminhos = this.caminhosMenuPorTipo[tipoUsuario];

      if (!caminhos) {
        return;
      }

      this.elementos.$itemPapel.attr("href", caminhos.inicio);
      this.elementos.$itemAgenda.attr("href", caminhos.agenda);

      if (caminhos.perfil) {
        this.elementos.$itemPerfil.attr("href", caminhos.perfil);
      } else {
        this.removerItemPerfil();
      }
    },

    removerItemPerfil: function () {
      var $rodapes = this.elementos.$itemPerfil.closest(".navLateralLogado_rodape");

      this.elementos.$itemPerfil.remove();
      $rodapes.filter(function () {
        return $(this).children().length === 0;
      }).remove();
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
      this.elementos.$navTopoLogado.attr("hidden", "hidden");
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
      this.elementos.$navTopoLogado.removeAttr("hidden");
      this.elementos.$navTopoDeslogado.attr("hidden", "hidden");

      this.aplicarCaminhosDoMenu(tipoUsuario);

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