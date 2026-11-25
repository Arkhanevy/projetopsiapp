(function ($, Utilitarios) {
  "use strict";

  const moduloCadCliente = {

    configuracao: {
      urlCliente: "index.php?uri=cliente",
      urlLogin: "index.php?uri=login"
    },

    estado: {
      telaInicial: "cadastro",
      codigoGerado: false
    },

    telas: {},

    elementos: {},

    iniciar: function () {
      this.urlElementos();

      const parametros = new URLSearchParams(window.location.search);
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
      this.elementos.$data = $("#dtnCli");
      this.elementos.$cpf = $("#CPF");
      this.elementos.$senha = $("#senhaCliente");
      this.elementos.$formulario = $("#formCliente");

      this.elementos.$formAtivacao = $("#formAtivacao");
      this.elementos.$codigo = $("#codigoAtivacao");

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

      const self = this;

      // O envio é feito somente pelos botões (AJAX); o submit nativo fica bloqueado.
      this.elementos.$formulario.add(this.elementos.$formAtivacao).on("submit", function (evento) {
        evento.preventDefault();
      });

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
      const self = this;
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
      const self = this;
      const el = this.elementos;

      $botao.prop("disabled", true).html("Cadastrando...");

      const campos = [
        { valor: el.$nome.val(), el: el.$nome },
        { valor: el.$tel.val(), el: el.$tel },
        { valor: el.$user.val(), el: el.$user },
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

      const cpfLimpo = Utilitarios.apenasNumeros(el.$cpf.val());
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

      const email = el.$email.val().trim();
      if (!Utilitarios.emailValido(email)) {
        el.$email.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("E-mail inválido!", "danger");
        return;
      }

      // Imagem de perfil obrigatória; vai no $_FILES['cxclientefoto'].
      const imgArquivo = el.$img[0].files[0];
      if (!imgArquivo) {
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("A imagem de perfil é obrigatória.", "danger");
        return;
      }

      // $_POST e $_FILES saem do próprio formulário (atributos name); só os valores com máscara são sobrescritos.
      const formData = Utilitarios.criarFormData(el.$formulario, {
        email: email,
        telefone: Utilitarios.apenasNumeros(el.$tel.val()),
        CPF: cpfLimpo
      });

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


          self.mostrarAlert("Erro na requisição!", "danger");
      });
    },

    gerarCodigo: function ($botao) {
      const self = this;

      $botao.prop("disabled", true);

      let tempo = 60;
      $botao.text("Aguarde " + tempo + "s até conseguir gerar um novo código.");

      const intervalo = setInterval(function () {
        tempo--;
        $botao.text("Aguarde " + tempo + "s até conseguir gerar um novo código.");
        if (tempo <= 0) {
          clearInterval(intervalo);
          $botao.prop("disabled", false);
          $botao.text("Gerar código");
        }
      }, 1000);

      const email = this.elementos.$email.val().trim();

      const fd = new FormData();
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
          self.mostrarAlert("Erro na requisição ao gerar código!", "danger");
      });
    },

    ativarConta: function ($botao) {
      const self = this;
      const $campoCodigo = this.elementos.$codigo;
      const codigoDigitado = $campoCodigo.val().trim();
      const email = this.elementos.$email.val().trim();

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

      const fd = Utilitarios.criarFormData(this.elementos.$formAtivacao, {
        email: email,
        cod: codigoDigitado,
        acao: "ativar"
      });

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


          self.mostrarAlert("Erro na requisição de ativação!", "danger");
      });
    }
  };

  $(function () {
    moduloCadCliente.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
