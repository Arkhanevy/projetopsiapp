console.log("JS cadCliente carregado");

(function ($, Utilitarios) {
  "use strict";

  var moduloCadCliente = {

    configuracao: {
      urlCliente: "/projetopsi/index.php?uri=cliente",
      urlLogin: "index.php?uri=loginCliente"
    },

    estado: {
      telaInicial: "cadastro",
      codigoGerado: false
    },

    telas: {},

    elementos: {},

    iniciar: function () {
      this.urlElementos();

      var parametros = new URLSearchParams(window.location.search);
      if (parametros.get("tipo") === "login") {
        window.location.replace(this.configuracao.urlLogin);
        return;
      }

      Utilitarios.configurarPreviewImagem(this.elementos.$alertContainer, this.elementos.$img, this.elementos.$preview);
      this.registrarEventos();
      this.mostrarTela(this.estado.telaInicial);
    },

    urlElementos: function () {
      this.telas = {
        cadastro: $("#cadastroCliente"),
        ativacao: $("#ativacao")
      };

      this.elementos.$alertContainer = $("#alertContainer");

      this.elementos.$img = $("#img_perfil");
      this.elementos.$preview = $("#preview");
      this.elementos.$nome = $("#nomeCliente");
      this.elementos.$email = $("#emailCadastro");
      this.elementos.$tel = $("#telCliente");
      this.elementos.$user = $("#userCliente");
      this.elementos.$genero = $("#generoCliente");
      this.elementos.$bio = $("#bioCliente");
      this.elementos.$data = $("#dtnCli");
      this.elementos.$cpf = $("#CPF");
      this.elementos.$senha = $("#senhaCliente");
      this.elementos.$form = $("#cadastroCliente");

      this.elementos.$emailAtivacao = $("#emailAtivacao");
      this.elementos.$codigo = $("#codigoCliente");

      this.elementos.$botaoCadastrar = $("#btnCadastrar");
      this.elementos.$botaoCodigo = $("#btnCodigo");
      this.elementos.$botaoAtivar = $("#btnAtivar");
    },

    validarCamposAoSair: function () {
      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        { $campo: this.elementos.$cpf, valido: function (valor) { return Utilitarios.cpfValido(Utilitarios.apenasNumeros(valor)); }, mensagem: "CPF inválido!" },
        { $campo: this.elementos.$tel, valido: function (valor) { return Utilitarios.telefoneValido(valor); }, mensagem: "Telefone inválido!" },
        { $campo: this.elementos.$data, valido: function (valor) { return Utilitarios.maiorDeIdade(valor, 18); }, mensagem: "Você precisa ser maior de 18 anos para se cadastrar!" },
        { $campo: this.elementos.$email, valido: function (valor) { return Utilitarios.emailValido(valor); }, mensagem: "E-mail inválido!" }
      ]);
    },

    registrarEventos: function () {
      this.validarCamposAoSair();

      $(document).on("submit", "form", function (evento) {
        evento.preventDefault();
      });
      var self = this;

      $(document).on("input change", ".form-control, .form-select, textarea", function () {
        $(this).removeClass("is-invalid");
      });

      this.elementos.$botaoCadastrar.on("click", function (evento) {

        evento.preventDefault();
        self.enviarCadastro($(this));
      });

      this.elementos.$botaoCodigo.on("click", function (evento) {
        evento.preventDefault();
        self.gerarCodigo($(this));
      });

      this.elementos.$botaoAtivar.on("click", function (evento) {
        evento.preventDefault();
        self.ativarConta($(this));
      });

    },

    mostrarTela: function (nomeTela) {
      var self = this;
      Object.keys(this.telas).forEach(function (chave) {
        self.telas[chave].hide();
      });

      if (this.telas[nomeTela]) {
        this.telas[nomeTela].show();
      } else {
        console.warn("Tela não encontrada:", nomeTela);
        this.telas.cadastro.show();
      }
    },

    mostrarAlert: function (mensagem, tipo) {
      Utilitarios.mostrarAlerta(this.elementos.$alertContainer, mensagem, tipo);
    },

    enviarCadastro: function ($botao) {
      var self = this;
      var el = this.elementos;

      $botao.prop("disabled", true).html("Cadastrando...");

      var campos = [
        { valor: el.$nome.val(), el: el.$nome },
        { valor: el.$tel.val(), el: el.$tel },
        { valor: el.$user.val(), el: el.$user },
        { valor: el.$bio.val(), el: el.$bio },
        { valor: el.$data.val(), el: el.$data },
        { valor: el.$senha.val(), el: el.$senha },
        { valor: el.$genero.val(), el: el.$genero },
        { valor: el.$email.val(), el: el.$email },
        { valor: el.$cpf.val(), el: el.$cpf }
      ];

      if (Utilitarios.validarCampos(campos)) {
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("Preencha todos os campos obrigatórios!", "danger");
        return;
      }

      var cpfLimpo = Utilitarios.apenasNumeros(el.$cpf.val());
      if (!Utilitarios.cpfValido(cpfLimpo)) {
        el.$cpf.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("CPF inválido!", "danger");
        return;
      }

      if (!Utilitarios.telefoneValido(el.$tel.val())) {
        el.$tel.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("Telefone inválido!", "danger");
        return;
      }

      if (!Utilitarios.maiorDeIdade(el.$data.val(), 18)) {
        el.$data.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("Você precisa ser maior de 18 anos para se cadastrar!", "danger");
        return;
      }

      var email = el.$email.val().trim();
      if (!Utilitarios.emailValido(email)) {
        el.$email.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("E-mail inválido!", "danger");
        return;
      }

      var imgArquivo = el.$img[0].files[0];
      if (!imgArquivo) {
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("A imagem de perfil é obrigatória.", "danger");
        return;
      }

      var formData = new FormData();
      formData.append("nome", el.$nome.val());
      formData.append("email", email);
      formData.append("telefone", Utilitarios.apenasNumeros(el.$tel.val()));
      formData.append("username", el.$user.val());
      formData.append("bio", el.$bio.val());
      formData.append("dtNas", el.$data.val());
      formData.append("senha", el.$senha.val());
      formData.append("genero", el.$genero.val());
      formData.append("CPF", cpfLimpo);
      formData.append("acao", "cadastrar");
      formData.append("cxclientefoto", imgArquivo);

      $.ajax({
          url: this.configuracao.urlCliente,
          method: "POST",
          data: formData,
          processData: false,
          contentType: false,
          dataType: "json"
      })
      .done(function (resposta) {
          $botao.prop("disabled", false).html("Cadastrar");
          if (resposta.sucesso === true) {
              self.mostrarAlert("Cadastro realizado!", "success");
              self.mostrarTela("ativacao");
          } else {
              self.mostrarAlert(
                  resposta.mensagem || "Não foi possível realizar o cadastro.",
                  "danger"
              );
          }
      })
      .fail(function (xhr, status, erro) {
          $botao.prop("disabled", false).html("Cadastrar");

          console.error("Erro no cadastro:", status, erro);
          console.error("Resposta do servidor:", xhr.responseText);

          self.mostrarAlert("Erro na requisição!", "danger");
      });
    },

    gerarCodigo: function ($botao) {
      var self = this;

      $botao.prop("disabled", true);

      var tempo = 60;
      $botao.text("Aguarde " + tempo + "s até conseguir gerar um novo código.");

      var intervalo = setInterval(function () {
        tempo--;
        $botao.text("Aguarde " + tempo + "s até conseguir gerar \b um novo código.");
        if (tempo <= 0) {
          clearInterval(intervalo);
          $botao.prop("disabled", false);
          $botao.text("Gerar código");
        }
      }, 1000);

      var email = this.elementos.$email.val().trim();

      var fd = new FormData();
      fd.append("email", email);
      fd.append("acao", "ReGerarCodigo");

      $.ajax({
        url: this.configuracao.urlCliente,
        method: "POST",
        data: fd,
        processData: false,
        contentType: false,
        dataType: "json"
      })
      .done(function (resposta) {
          if (resposta.sucesso === true) {
              self.mostrarAlert(
                  "Código enviado com sucesso para o seu e-mail!",
                  "success"
              );

              self.estado.codigoGerado = true;
          } else {
              self.mostrarAlert(
                  resposta.mensagem || "Não foi possível gerar o código.",
                  "danger"
              );
          }
      })
      .fail(function (xhr, status, erro) {
          console.error("Erro ao gerar código:", status, erro, xhr.responseText);
          self.mostrarAlert("Erro na requisição ao gerar código!", "danger");
      });
    },

    ativarConta: function ($botao) {
      var self = this;
      var $campoCodigo = this.elementos.$codigo;
      var codigoDigitado = $campoCodigo.val().trim();
      var email = this.elementos.$email.val().trim();

      if (!this.estado.codigoGerado) {
        this.mostrarAlert("Gere um código primeiro!", "danger");
        $botao.prop("disabled", false).html("Ativar");
        return;
      }

      if (!codigoDigitado) {
        $campoCodigo.addClass("is-invalid");
        this.mostrarAlert("Digite o código enviado!", "danger");
        $botao.prop("disabled", false).html("Ativar");
        return;
      }

      $botao.prop("disabled", true).html("Ativando...");

      var fd = new FormData();
      fd.append("email", email);
      fd.append("cod", codigoDigitado);
      fd.append("acao", "ativar");

      $.ajax({
        url: this.configuracao.urlCliente,
        method: "POST",
        data: fd,
        processData: false,
        contentType: false,
        dataType: "json"
      })
      .done(function (resposta) {
          $botao.prop("disabled", false).html("Ativar");

          if (resposta.sucesso === true) {
              self.mostrarAlert("Conta ativada com sucesso!", "success");
              self.estado.codigoGerado = false;

              setTimeout(function () {
                  window.location.href = self.configuracao.urlLogin;
              }, 1500);
          } else {
              $campoCodigo.addClass("is-invalid");

              self.mostrarAlert(
                  resposta.mensagem || "Não foi possível ativar a conta.",
                  "danger"
              );
          }
      })
      .fail(function (xhr, status, erro) {
          $botao.prop("disabled", false).html("Ativar");

          console.error("Erro na ativação:", status, erro, xhr.responseText);

          self.mostrarAlert("Erro na requisição de ativação!", "danger");
      });
    }
  };

  $(function () {
    moduloCadCliente.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
