(function ($, Utilitarios) {
  "use strict";

  window.ElmoPerfilModulos = window.ElmoPerfilModulos || [];

  var moduloGerenciamento = {

     contratos: {
      listarPermissoes: { url: "index.php?uri=permissao", acao: "listarPermissoes", disponivel: false },
      alterarPermissao: { url: "index.php?uri=permissao", acao: "alterarPermissao", disponivel: false }
    },

    estado: {
      ativo: false,
      pedido: 0
    },

    elementos: {},

    nucleo: null,

    iniciar: function (nucleo) {
      this.nucleo = nucleo;

      if (!nucleo.ehClinica() || nucleo.ehVisitante()) {
        return;
      }
      this.estado.ativo = true;
      this.cachearElementos();
      this.montarPermissoesTodos();
      this.registrarEventos();
    },

    cachearElementos: function () {
      var e = this.elementos;

      e.$carregando = $('[data-carregando="gerenciamento"]');
      e.$erro = $('[data-estadoErro="gerenciamento"]');
      e.$vazio = $('[data-estadoVazio="gerenciamento"]');
      e.$acordeao = $("#acordeaoGerenciamento");
      e.$listaTodos = $('[data-lista="permissoesTodos"]');
      e.$listaProfissionais = $('[data-lista="gerenciamentoProfissionais"]');
    },

    aoPrepararVisao: function (nomeVisao) {
      if (this.estado.ativo && nomeVisao === "profissionaisGerenciamento") {
        this.carregar();
      }
    },

    montarPermissoesTodos: function () {
      this.elementos.$listaTodos.empty().append(this.nucleo.clonarModelo("modeloListaPermissoes"));
    },

    definirEstado: function (nome) {
      var e = this.elementos;

      e.$carregando.prop("hidden", nome !== "carregando");
      e.$erro.prop("hidden", nome !== "erro");
      e.$vazio.prop("hidden", nome !== "vazio");
      e.$acordeao.prop("hidden", nome !== "lista");
    },

    carregar: function () {
      var self = this;
      var nucleo = this.nucleo;
      var numeroPedido = ++this.estado.pedido;

      this.definirEstado("carregando");

      if (!nucleo.contratoDisponivel("listarPermissoes")) {
        this.renderizar([]);
        return;
      }

      nucleo.chamarContrato("listarPermissoes")
        .done(function (resposta) {
          if (numeroPedido !== self.estado.pedido) {
            return;
          }
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            self.renderizar(resposta.dados);
          } else {
            self.definirEstado("erro");
          }
        })
        .fail(function () {
          if (numeroPedido === self.estado.pedido) {
            self.definirEstado("erro");
          }
        });
    },

    permitido: function (valor) {
      return valor === true || valor === 1 || valor === "1";
    },

    renderizar: function (itens) {
      var self = this;
      var nucleo = this.nucleo;
      var $lista = this.elementos.$listaProfissionais.empty();

      $.each(itens, function (_, item) {
        var id = item.pro_id;
        var usuario = item.pro_user || item.pro_nome || "";
        var idPainel = "painelPermissoesProfissional" + String(id).replace(/[^a-zA-Z0-9]/g, "");
        var permissoes = item.permissoes || {};
        var $item = nucleo.clonarModelo("modeloItemGerenciamento");
        var $permissoes = nucleo.clonarModelo("modeloListaPermissoes");

        $item.find('[data-campo="usuarioProfissional"]').text(usuario);
        $item.find('[data-campo="gatilhoPermissoes"]').attr({
          "data-bs-target": "#" + idPainel,
          "aria-controls": idPainel
        });
        $item.find('[data-campo="painelPermissoes"]').attr("id", idPainel);

        if (item.pro_foto) {
          $item.find('[data-campo="fotoProfissional"]').attr("src", item.pro_foto).removeAttr("hidden");
          $item.find(".itemGerenciamento_avatar .material-symbols-outlined").attr("hidden", "hidden");
        }

        $permissoes.attr("data-idProfissional", id);
        $permissoes.find(".listaPermissoes_controle").each(function () {
          $(this).prop("checked", self.permitido(permissoes[$(this).attr("data-permissao")]));
        });

        $item.find('[data-lista="permissoesProfissional"]').append($permissoes);
        $lista.append($item);
      });

      if (itens.length) {
        this.sincronizarTodos();
        this.definirEstado("lista");
      } else {
        this.definirEstado("vazio");
      }
    },

    sincronizarTodos: function () {
      var $profissionais = this.elementos.$listaProfissionais;

      this.elementos.$listaTodos.find(".listaPermissoes_controle").each(function () {
        var chave = $(this).attr("data-permissao");
        var $controles = $profissionais.find('.listaPermissoes_controle[data-permissao="' + chave + '"]');
        var todosPermitidos = $controles.length > 0 && $controles.filter(":not(:checked)").length === 0;

        $(this).prop("checked", todosPermitidos);
      });
    },

    alterarPermissao: function ($controle) {
      var self = this;
      var nucleo = this.nucleo;
      var chave = $controle.attr("data-permissao");
      var permitido = $controle.is(":checked");
      var paraTodos = $controle.closest('[data-lista="permissoesTodos"]').length > 0;
      var idProfissional = "todos";
      var valorEnviado = 0;

      if (!paraTodos) {
        idProfissional = $controle.closest(".listaPermissoes").attr("data-idProfissional");
      }
      if (permitido) {
        valorEnviado = 1;
      }

      if (!nucleo.contratoDisponivel("alterarPermissao")) {
        $controle.prop("checked", !permitido);
        nucleo.avisarIndisponivel();
        return;
      }

      $controle.prop("disabled", true);

      nucleo.chamarContrato("alterarPermissao", {
        idProfissional: idProfissional,
        permissao: chave,
        permitido: valorEnviado
      })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            if (paraTodos) {
              self.elementos.$listaProfissionais
                .find('.listaPermissoes_controle[data-permissao="' + chave + '"]')
                .prop("checked", permitido);
            } else {
              self.sincronizarTodos();
            }
          } else {
            $controle.prop("checked", !permitido);
            nucleo.exibirAviso("Não foi possível alterar a permissão. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          $controle.prop("checked", !permitido);
          nucleo.exibirAviso("Não foi possível alterar a permissão. Tente novamente.", "erro");
        })
        .always(function () {
          $controle.prop("disabled", false);
        });
    },

    registrarEventos: function () {
      var self = this;

      $(document).on("click", '[data-acao="tentarNovamenteGerenciamento"]', function () {
        self.carregar();
      });

      this.elementos.$acordeao.on("change", ".listaPermissoes_controle", function () {
        self.alterarPermissao($(this));
      });
    }
  };

  window.ElmoPerfilModulos.push(moduloGerenciamento);

})(jQuery, window.ElmoUtilitarios);
