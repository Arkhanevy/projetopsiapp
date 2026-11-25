(function ($, Utilitarios) {
  "use strict";

  const moduloLogin = {

    configuracao: {
      urlLogin: "index.php?uri=autenticar",
      // para onde cada tipo de usuário vai depois de entrar
      destinoPorTipo: {
        cliente: "index.php?uri=buscar",
        profissional: "index.php?uri=perfil",
        clinica: "index.php?uri=perfil"
      },
      destinoPadrao: "index.php?uri=buscar"
    },

    elementos: {},

    iniciar: function () {
      this.urlElementos();
      this.registrarEventos();
    },

    urlElementos: function () {
      this.elementos.$alertContainer = $("#alertContainer");
      this.elementos.$formulario = $("#formLogin");
      this.elementos.$loginEmail = $("#emailLogin");
      this.elementos.$loginSenha = $("#senhaLogin");
      this.elementos.$botaoLogar = $("#btnLogar");
    },

    registrarEventos: function () {
      const self = this;

      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        {
          $campo: this.elementos.$loginEmail,
          valido: function (valor) { return Utilitarios.emailValido(valor); },
          mensagem: "E-mail inválido!"
        }
      ]);

      $(document).on("input change", ".form-control", function () {
        $(this).removeClass("is-invalid");
      });

      // o submit cobre o clique no botão e o Enter nos campos
      this.elementos.$formulario.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarLogin();
      });
    },

    mostrarAlert: function (mensagem, tipo) {
      Utilitarios.mostrarAlerta(this.elementos.$alertContainer, mensagem, tipo);
    },

    liberarBotao: function () {
      this.elementos.$botaoLogar.prop("disabled", false).html("Logar");
    },

    enviarLogin: function () {
      const self = this;
      const el = this.elementos;

      el.$botaoLogar.prop("disabled", true).html("Logando...");

      const campos = [
        { valor: el.$loginEmail.val(), el: el.$loginEmail },
        { valor: el.$loginSenha.val(), el: el.$loginSenha }
      ];

      if (Utilitarios.validarCampos(campos)) {
        this.liberarBotao();
        this.mostrarAlert("Preencha todos os campos!", "danger");
        return;
      }

      const email = el.$loginEmail.val().trim();
      if (!Utilitarios.emailValido(email)) {
        el.$loginEmail.addClass("is-invalid");
        this.liberarBotao();
        this.mostrarAlert("E-mail inválido!", "danger");
        return;
      }

      const fd = new FormData();
      fd.append("acao", "login");
      fd.append("email", email);
      fd.append("senha", el.$loginSenha.val());

      $.ajax({
        url: this.configuracao.urlLogin,
        method: "POST",
        data: fd,
        processData: false,
        contentType: false,
        dataType: "json"
      })
      .done(function (resposta) {
        if (resposta && resposta.sucesso === true) {
          self.mostrarAlert("Login realizado com sucesso!", "success");
          const destinos = self.configuracao.destinoPorTipo;
          window.location.href = destinos[resposta.tipoUsuario] || self.configuracao.destinoPadrao;
          return; // mantém o botão travado durante o redirecionamento
        }
        self.liberarBotao();
        self.mostrarAlert(
          (resposta && resposta.mensagem) || "Não foi possível realizar o login.", "danger"
        );
      })
      .fail(function () {
        self.liberarBotao();
        self.mostrarAlert("Erro na requisição!", "danger");
      });
    }
  };

  $(function () {
    moduloLogin.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
