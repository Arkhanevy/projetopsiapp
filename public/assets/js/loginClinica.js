/* ============================================================
   RESUMO DO ARQUIVO: loginClinica.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloLoginClinica
   - Função/método: iniciar
   - Função/método: urlElementos
   - Função/método: validarCamposAoSair
   - Função/método: registrarEventos
   - Função/método: mostrarAlert
   - Função/método: enviarLogin
   ============================================================ */

console.log("JS loginClinica carregado");
/* ============================================================
   PÁGINA: loginClinica (Login da Clínica)
   Depende de: jQuery, Bootstrap 5 (bundle JS), ElmoUtilitarios
   (ver /assets/js/utilitarios.js — deve ser carregado antes deste arquivo)

   Responsabilidades deste arquivo:
   - Validar e enviar o formulário de login via AJAX.
   - Redirecionar para a página de serviços após o login.

   O cadastro e a ativação de conta ficam em cadClinica.js.
   ============================================================ */

(function ($, Utilitarios) {
  "use strict";

  // Objeto \'moduloLoginClinica\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloLoginClinica = {

    /* ---------- Configuração ---------- */
    configuracao: {
      urlClinica: "/projetopsi/index.php?uri=clinica", //Axolote
      urlPerfil: "index.php?uri=perfil"
    },

    /* ---------- Referências de elementos (cacheadas) ---------- */
    elementos: {},

    /**
     * Ponto de entrada. Deve ser chamado uma vez, quando o
     * documento estiver pronto.
     */
    // Método \'iniciar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    iniciar: function() {
      this.urlElementos();
      this.registrarEventos();
    },

    // Método \'urlElementos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    urlElementos: function() {
      this.elementos.$alertContainer = $("#alertContainer");

      this.elementos.$loginEmail = $("#emailLogClinica");
      this.elementos.$loginSenha = $("#senhaLogClinica");
      this.elementos.$botaoLogar = $("#btnLogClinica");
    },

    /* VALIDAÇÃO AO SAIR DO CAMPO */

    // Método \'validarCamposAoSair\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    validarCamposAoSair: function() {
      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        { $campo: this.elementos.$loginEmail, valido: function (valor) { return Utilitarios.emailValido(valor); }, mensagem: "E-mail inválido!" }
      ]);
    },

    // Método \'registrarEventos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    registrarEventos: function() {
      this.validarCamposAoSair();

      // Nenhum formulário desta página é enviado de forma nativa: o envio
      // é sempre feito por AJAX (evita recarregar a tela e perder a requisição).
      $(document).on("submit", "form", function (evento) {
        evento.preventDefault();
      });
      var self = this;

      // Remove o estado de erro assim que o usuário volta a interagir com o campo.
      $(document).on("input change", ".form-control", function () {
        $(this).removeClass("is-invalid");
      });

      this.elementos.$botaoLogar.on("click", function (evento) {
        evento.preventDefault();
        self.enviarLogin($(this));
      });
    },

    /* ALERTAS */

    // Método \'mostrarAlert\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mostrarAlert: function(mensagem, tipo) {
      Utilitarios.mostrarAlerta(this.elementos.$alertContainer, mensagem, tipo);
    },

    /* LOGIN */

    // Método \'enviarLogin\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    enviarLogin: function($botao) {
      var self = this;
      var el = this.elementos;

      $botao.prop("disabled", true).html("Logando...");

      var campos = [
        { valor: el.$loginEmail.val(), el: el.$loginEmail },
        { valor: el.$loginSenha.val(), el: el.$loginSenha }
      ];

      if (Utilitarios.validarCampos(campos)) {
        $botao.prop("disabled", false).html("Logar");
        this.mostrarAlert("Preencha todos os campos!", "danger");
        return;
      }

      var email = el.$loginEmail.val().trim();
      if (!Utilitarios.emailValido(email)) {
        el.$loginEmail.addClass("is-invalid");
        $botao.prop("disabled", false).html("Logar");
        this.mostrarAlert("E-mail inválido!", "danger");
        return;
      }

      var fd = new FormData();
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
        console.error("Erro no login:", status, erro, xhr.responseText);
        self.mostrarAlert("Erro na requisição!", "danger");
      });
    }
  };

  $(function () {
    moduloLoginClinica.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
