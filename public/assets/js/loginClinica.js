(function ($, Utilitarios) {
  "use strict";

  const moduloLoginClinica = {

    configuracao: {
      urlClinica: "index.php?uri=clinica",
      urlPerfil: "index.php?uri=perfil"
    },

    elementos: {},

    iniciar: function () {
      this.urlElementos();
      this.registrarEventos();
    },

    urlElementos: function () {
      this.elementos.$alertContainer = $("#alertContainer");

      this.elementos.$loginEmail = $("#emailLogClinica");
      this.elementos.$loginSenha = $("#senhaLogClinica");
      this.elementos.$botaoLogar = $("#btnLogClinica");
    },

    validarCamposAoSair: function () {
      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        { $campo: this.elementos.$loginEmail, valido: function (valor) { return Utilitarios.emailValido(valor); }, mensagem: "E-mail inválido!" }
      ]);
    },

    registrarEventos: function () {
      this.validarCamposAoSair();

      $(document).on("submit", "form", function (evento) {
        evento.preventDefault();
      });
      const self = this;

      $(document).on("input change", ".form-control", function () {
        $(this).removeClass("is-invalid");
      });

      this.elementos.$botaoLogar.on("click", function (evento) {
        evento.preventDefault();
        self.enviarLogin($(this));
      });
    },

    mostrarAlert: function (mensagem, tipo) {
      Utilitarios.mostrarAlerta(this.elementos.$alertContainer, mensagem, tipo);
    },

    enviarLogin: function ($botao) {
      const self = this;
      const el = this.elementos;

      $botao.prop("disabled", true).html("Logando...");

      const campos = [
        { valor: el.$loginEmail.val(), el: el.$loginEmail },
        { valor: el.$loginSenha.val(), el: el.$loginSenha }
      ];

      if (Utilitarios.validarCampos(campos)) {
        $botao.prop("disabled", false).html("Logar");
        this.mostrarAlert("Preencha todos os campos!", "danger");
        return;
      }

      const email = el.$loginEmail.val().trim();
      if (!Utilitarios.emailValido(email)) {
        el.$loginEmail.addClass("is-invalid");
        $botao.prop("disabled", false).html("Logar");
        this.mostrarAlert("E-mail inválido!", "danger");
        return;
      }

      const fd = new FormData();
      fd.append("email", email);
      fd.append("senha", el.$loginSenha.val());
      fd.append("acao", "login");

      $.ajax({
        url: this.configuracao.urlClinica,
        method: "POST",
        data: fd,
        processData: false,
        contentType: false,
        dataType: "json"
          })
      .done(function (resposta) {
        $botao.prop("disabled", false).html("Logar");
        if (resposta.sucesso === true) {
          self.mostrarAlert("Login realizado com sucesso!", "success");
          window.location.href = self.configuracao.urlPerfil;
        } else {
          self.mostrarAlert(
            resposta.mensagem || "Não foi possível realizar o login.", "danger"
          );
        }
      })
      .fail(function (xhr, status, erro) {
        $botao.prop("disabled", false).html("Logar");
        self.mostrarAlert("Erro na requisição!", "danger");
      });
    }
  };

  $(function () {
    moduloLoginClinica.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
