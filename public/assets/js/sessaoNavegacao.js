(function ($) {
  "use strict";

  const moduloSessaoNavegacao = {
    
    configuracao: {
      tiposParaVerificar: ["cliente", "profissional", "clinica"],
      urlVerificarSessaoPorTipo: function (tipo) {
        return "index.php?uri=" + tipo;
      },
      urlSair: "index.php?uri=limpar",
      urlAposSair: "index.php",
      loginsPorTipo: [
        { rotulo: "Sou um cliente", url: "index.php?uri=loginCliente" },
        { rotulo: "Sou um profissional", url: "index.php?uri=loginProfissional" },
        { rotulo: "Sou uma clínica", url: "index.php?uri=loginClinica" }
      ]
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
        // Sem inicio/agenda: a clínica não exibe "Início" nem "Agenda" no menu.
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
      const configuracao = this.configuracao;

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
      const caminhos = this.caminhosMenuPorTipo[tipoUsuario];

      if (!caminhos) {
        return;
      }

      this.aplicarLinkOuRemoverItem(this.elementos.$itemPapel, caminhos.inicio);
      this.aplicarLinkOuRemoverItem(this.elementos.$itemAgenda, caminhos.agenda);

      if (caminhos.perfil) {
        this.elementos.$itemPerfil.attr("href", caminhos.perfil);
      } else {
        this.removerItemPerfil();
      }
    },

    aplicarLinkOuRemoverItem: function ($item, href) {
      if (href) {
        $item.attr("href", href);
      } else {
        $item.remove();
      }
    },

    removerItemPerfil: function () {
      const $rodapes = this.elementos.$itemPerfil.closest(".navLateralLogado_rodape");

      this.elementos.$itemPerfil.remove();
      $rodapes.filter(function () {
        return $(this).children().length === 0;
      }).remove();
    },

    verificarSessao: function () {
      this.testarTipo(this.configuracao.tiposParaVerificar, 0);
    },

    testarTipo: function (tipos, indice) {
      const self = this;

      if (indice >= tipos.length) {
        self.exibirNavegacaoDeslogado();
        return;
      }

      const tipoAtual = tipos[indice];

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
      this.avisarUsuarioDeslogado();
    },

    /**
     * Telas que exigem login declaram <body data-exigeLogin>. Quando nenhum login é
     * identificado, abre o modal de aviso (sem opção de fechar) com os caminhos de login.
     * Telas que já tratam a sessão por conta própria (consultas, início, perfil) não usam
     * o atributo e continuam com o modal delas.
     */
    avisarUsuarioDeslogado: function () {
      if (!document.body.hasAttribute("data-exigeLogin")) {
        return;
      }

      let $modal = $("#modalUsuarioDeslogado");
      if (!$modal.length) {
        $modal = $(this.montarModalDeslogado()).appendTo(document.body);
      }

      bootstrap.Modal.getOrCreateInstance($modal.get(0), {
        backdrop: "static",
        keyboard: false
      }).show();
    },

    montarModalDeslogado: function () {
      let botoes = "";

      $.each(this.configuracao.loginsPorTipo, function (_, login) {
        botoes += '<a class="btn botaoBase botaoBase--secundario" href="' + login.url + '">' +
                  login.rotulo + "</a>";
      });

      return '<div class="modal fade modalBase" id="modalUsuarioDeslogado" tabindex="-1"' +
               ' aria-labelledby="tituloModalUsuarioDeslogado"' +
               ' aria-describedby="textoModalUsuarioDeslogado" aria-modal="true" role="dialog">' +
               '<div class="modal-dialog modal-dialog-centered">' +
                 '<div class="modal-content modalBase_conteudo">' +
                   '<div class="modal-header modalBase_cabecalho">' +
                     '<h2 class="modal-title modalBase_titulo" id="tituloModalUsuarioDeslogado">' +
                       "Usuário deslogado</h2>" +
                   "</div>" +
                   '<div class="modal-body text-center">' +
                     '<p class="visually-hidden">Esta janela não pode ser fechada. ' +
                       "Escolha abaixo como deseja entrar para continuar.</p>" +
                     '<div class="modalFeedback_icone" aria-hidden="true">' +
                       '<span class="material-symbols-outlined" aria-hidden="true">no_accounts</span>' +
                     "</div>" +
                     '<p id="textoModalUsuarioDeslogado" class="modalFeedback_mensagem">' +
                       "Para acessar essa página, realize login na sua conta.</p>" +
                   "</div>" +
                   '<div class="modal-footer modalBase_rodape flex-wrap justify-content-center gap-2">' +
                     botoes +
                   "</div>" +
                 "</div>" +
               "</div>" +
             "</div>";
    },

    exibirNavegacaoLogado: function (tipoUsuario) {
      let papel;
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

      const configContatos = this.itemContatosPorTipo[tipoUsuario];
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