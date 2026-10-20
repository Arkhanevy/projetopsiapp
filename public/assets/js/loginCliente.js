/* ============================================================
   ARQUIVO: loginCliente.js

   O QUE FAZ
   Login do cliente: valida e-mail e senha, envia o login por AJAX ao
   controller e, se der certo, redireciona para o perfil. O cadastro e a
   ativação ficam em cadCliente.js.

   OBSERVAÇÕES
   - Depende de jQuery, Bootstrap e ElmoUtilitarios (utilitarios.js, carregado
     antes).
   - O formulário nunca é enviado de forma nativa: o submit é bloqueado e o
     envio é por AJAX (FormData).
   - Em caso de sucesso redireciona para index.php?uri=perfil (o comentário
     original fala em 'página de serviços').
   - A URL do controller está fixa com o prefixo /projetopsi/ (marcada
     //Axolote em alguns pontos): ajuste ao mudar de ambiente.
   - O nome urlElementos() engana: a função só guarda referências de
     elementos, não monta URL.
   - A tela de login dos três perfis (cliente, profissional, clínica) é quase
     idêntica; vale unificar em um único módulo parametrizado.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery e
     ElmoUtilitarios.
     - moduloLoginCliente (objeto) — Módulo da página de login.
       - moduloLoginCliente.configuracao — URL do controller de autenticação e
         URL do perfil (destino após o login).
       - moduloLoginCliente.elementos — Cache dos elementos jQuery da página.
       - moduloLoginCliente.iniciar() — Ponto de entrada: guarda os elementos
         e registra os eventos.
       - moduloLoginCliente.urlElementos() — Busca no DOM e guarda alerta,
         campos de e-mail/senha e botão de login.
       - moduloLoginCliente.validarCamposAoSair() — Valida o e-mail ao sair do
         campo e mostra alerta se for inválido.
       - moduloLoginCliente.registrarEventos() — Bloqueia o submit nativo,
         limpa o estado de erro ao digitar e liga o clique do botão de login.
       - moduloLoginCliente.mostrarAlert() — Exibe um alerta Bootstrap no
         contêiner da página.
       - moduloLoginCliente.enviarLogin() — Valida os campos, envia
         email/senha (acao=login) ao backend e trata sucesso ou erro.
     - Callback do document ready — Executa moduloLoginCliente.iniciar()
       quando o DOM estiver pronto.
   ============================================================ */

console.log("JS loginCliente carregado");
/* ============================================================
   PÁGINA: loginCliente (Login do Cliente)
   Depende de: jQuery, Bootstrap 5 (bundle JS), ElmoUtilitarios
   (ver /assets/js/utilitarios.js — deve ser carregado antes deste arquivo)

   Responsabilidades deste arquivo:
   - Validar e enviar o formulário de login via AJAX.
   - Redirecionar para a página de serviços após o login.

   O cadastro e a ativação de conta ficam em cadCliente.js.
   ============================================================ */

/** Função autoexecutável que isola o escopo e recebe jQuery e ElmoUtilitarios. */
(function ($, Utilitarios) {
  "use strict";

  /** Módulo da página de login. */
  var moduloLoginCliente = {

    /* ---------- Configuração ---------- */
    /** URL do controller de autenticação e URL do perfil (destino após o login). */
    configuracao: {
      urlCliente: "/projetopsi/index.php?uri=cliente", //Axolote
      urlPerfil: "index.php?uri=perfil"
    },

    /* ---------- Referências de elementos (cacheadas) ---------- */
    /** Cache dos elementos jQuery da página. */
    elementos: {},

    /** Ponto de entrada: guarda os elementos e registra os eventos. */
    /**
     * Ponto de entrada. Deve ser chamado uma vez, quando o
     * documento estiver pronto.
     */
    iniciar: function () {
      this.urlElementos();
      this.registrarEventos();
    },

    /** Busca no DOM e guarda alerta, campos de e-mail/senha e botão de login. */
    urlElementos: function () {
      this.elementos.$alertContainer = $("#alertContainer");

      this.elementos.$loginEmail = $("#emailLogin");
      this.elementos.$loginSenha = $("#senhaLogin");
      this.elementos.$botaoLogar = $("#btnLogar");
    },

    /* VALIDAÇÃO AO SAIR DO CAMPO */

    /** Valida o e-mail ao sair do campo e mostra alerta se for inválido. */
    validarCamposAoSair: function () {
      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        { $campo: this.elementos.$loginEmail, valido: function (valor) { return Utilitarios.emailValido(valor); }, mensagem: "E-mail inválido!" }
      ]);
    },

    /**
     * Bloqueia o submit nativo, limpa o estado de erro ao digitar e liga o clique do botão de
     * login.
     */
    registrarEventos: function () {
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

    /** Exibe um alerta Bootstrap no contêiner da página. */
    mostrarAlert: function (mensagem, tipo) {
      Utilitarios.mostrarAlerta(this.elementos.$alertContainer, mensagem, tipo);
    },

    /* LOGIN */

    /** Valida os campos, envia email/senha (acao=login) ao backend e trata sucesso ou erro. */
    enviarLogin: function ($botao) {
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
        url: this.configuracao.urlCliente,
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

  /** Executa moduloLoginCliente.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloLoginCliente.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
