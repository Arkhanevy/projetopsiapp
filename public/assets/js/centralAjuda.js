(function ($) {
  "use strict";

  var moduloCentralAjuda = {

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      this.registrarEventos();
      this.atualizarBotaoEnviar();
    },

    cachearElementos: function () {
      this.elementos.$formulario = $("#formularioCentralAjuda");
      this.elementos.$campoDestinatario = $("#campoDestinatario");
      this.elementos.$campoEmailUsuario = $("#campoEmailUsuario");
      this.elementos.$campoAssunto = $("#campoAssunto");
      this.elementos.$campoAssuntoValor = $("#campoAssuntoValor");
      this.elementos.$valorAssunto = $("#valorAssunto");
      this.elementos.$campoMensagem = $("#campoMensagem");
      this.elementos.$botaoEnviar = $("#botaoEnviar");
      this.elementos.$avisoErro = $("#avisoErroCentralAjuda");
      this.elementos.$modalSucesso = $("#modalSucessoCentralAjuda");
    },

    registrarEventos: function () {
      var self = this;

      this.elementos.$campoEmailUsuario.on("input", function () {
        self.limparErroCampo($(this));
        self.atualizarBotaoEnviar();
      });

      this.elementos.$campoMensagem.on("input", function () {
        self.limparErroCampo($(this));
        self.atualizarBotaoEnviar();
      });

      this.elementos.$campoAssunto.on("opcaoSelecionada", function (evento, dados) {
        self.aoSelecionarAssunto(dados.valor);
      });

      this.elementos.$formulario.on("submit", function (evento) {
        evento.preventDefault();
        self.aoEnviar();
      });

      $(document).on("click", "[data-acao='voltarAbaAnterior']", function () {
        self.voltarAbaAnterior();
      });
    },


    aoSelecionarAssunto: function (valor) {
      var $mensagem = this.elementos.$campoMensagem;

      this.elementos.$campoAssuntoValor.val(valor);
      this.limparErroSelect();

      $mensagem
        .prop("disabled", false)
        .attr("placeholder", $mensagem.attr("data-placeholderHabilitado"));

      this.atualizarBotaoEnviar();
    },


    campoEstaPreenchido: function ($campo) {
      return $.trim($campo.val()) !== "";
    },

    emailUsuarioEhValido: function () {
      var campo = this.elementos.$campoEmailUsuario[0];
      return this.campoEstaPreenchido(this.elementos.$campoEmailUsuario) && campo.checkValidity();
    },

    formularioEstaCompleto: function () {
      return this.emailUsuarioEhValido()
        && this.campoEstaPreenchido(this.elementos.$campoAssuntoValor)
        && this.campoEstaPreenchido(this.elementos.$campoMensagem);
    },

    atualizarBotaoEnviar: function () {
      var estaCompleto = this.formularioEstaCompleto();
      this.elementos.$botaoEnviar.attr("aria-disabled", estaCompleto ? "false" : "true");
    },

    marcarErros: function () {
      if (!this.emailUsuarioEhValido()) {
        this.elementos.$campoEmailUsuario.addClass("is-invalid").attr("aria-invalid", "true");
      }

      if (!this.campoEstaPreenchido(this.elementos.$campoAssuntoValor)) {
        this.elementos.$campoAssunto.addClass("campoSelect--erro");
      }

      if (!this.campoEstaPreenchido(this.elementos.$campoMensagem)) {
        this.elementos.$campoMensagem.addClass("is-invalid").attr("aria-invalid", "true");
      }
    },

    limparErroCampo: function ($campo) {
      $campo.removeClass("is-invalid").removeAttr("aria-invalid");
    },

    limparErroSelect: function () {
      this.elementos.$campoAssunto.removeClass("campoSelect--erro");
    },

    exibirAvisoErro: function () {
      bootstrap.Toast.getOrCreateInstance(this.elementos.$avisoErro[0], { delay: 4000 }).show();
    },


    aoEnviar: function () {
      if (!this.formularioEstaCompleto()) {
        this.marcarErros();
        this.exibirAvisoErro();
        return;
      }

      this.elementos.$formulario.trigger("mensagemAjudaSolicitada", {
        destinatario: this.elementos.$campoDestinatario.val(),
        emailUsuario: $.trim(this.elementos.$campoEmailUsuario.val()),
        assunto: this.elementos.$campoAssuntoValor.val(),
        mensagem: $.trim(this.elementos.$campoMensagem.val())
      });
    },

    exibirSucesso: function () {
      bootstrap.Modal.getOrCreateInstance(this.elementos.$modalSucesso[0]).show();
    },

    voltarAbaAnterior: function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.php?uri=home";
      }
    },


    preencherDados: function (dados) {
      if (dados.emailDestinatario) {
        $("[data-emailDestinatario]").val(dados.emailDestinatario);
      }
      if (dados.emailUsuario) {
        $("[data-emailUsuario]").val(dados.emailUsuario);
      }
      this.atualizarBotaoEnviar();
    }
  };

  window.centralAjuda = {
    exibirSucesso: function () { moduloCentralAjuda.exibirSucesso(); },
    preencherDados: function (dados) { moduloCentralAjuda.preencherDados(dados); }
  };

  $(function () {
    moduloCentralAjuda.iniciar();
  });

})(jQuery);
