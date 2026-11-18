(function ($, Utilitarios) {
  "use strict";

  const moduloCadClinica = {

    configuracao: {
      urlClinica: "index.php?uri=clinica",
      urlLogin: "index.php?uri=loginClinica"
    },

    estado: {
      telaInicial: "cadastroClinica",
      codigoGerado: false
    },

    telas: {},

    elementos: {},

    iniciar: function () {
      this.urlElementos();

      const el = this.elementos;
      Utilitarios.configurarPreviewImagem(el.$alertContainer, el.$img, el.$preview);
      Utilitarios.configurarCEP(el.$alertContainer, {
        cep: el.$cep,
        rua: el.$rua,
        bairro: el.$bairro,
        cidade: el.$cidade,
        uf: el.$uf,
        ibge: el.$ibge
      });

      this.registrarEventos();
      this.mostrarTela(this.estado.telaInicial);
    },

    urlElementos: function () {
      this.telas = {
        cadastroClinica: $("#cadastroClinica"),
        ativacao: $("#ativacao")
      };

      this.elementos.$alertContainer = $("#alertContainer");

      this.elementos.$img = $("#img_perfil_Clinica");
      this.elementos.$preview = $("#previewClinica");
      this.elementos.$nome = $("#nomeClinica");
      this.elementos.$email = $("#emailCadClinica");
      this.elementos.$tel = $("#telClinica");
      this.elementos.$user = $("#userClinica");
      this.elementos.$bio = $("#bioClinica");
      this.elementos.$cnpj = $("#cnpj");
      this.elementos.$senha = $("#senhaClinica");
      this.elementos.$cep = $("#cepClinica");
      this.elementos.$rua = $("#ruaClinica");
      this.elementos.$bairro = $("#bairroClinica");
      this.elementos.$uf = $("#ufClinica");
      this.elementos.$ibge = $("#ibgeClinica");
      this.elementos.$cidade = $("#cidadeClinica");
      this.elementos.$formulario = $("#formClinica");

      this.elementos.$formAtivacao = $("#formAtivacao");
      this.elementos.$codigo = $("#codigoAtivacao");

      this.elementos.$botaoCadastrar = $("#btnCadClinica");
      this.elementos.$botaoCodigo = $("#btnCodigo");
      this.elementos.$botaoAtivar = $("#btnAtivar");
    },

    validarCamposAoSair: function () {
      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        { $campo: this.elementos.$cnpj, valido: function (valor) { return Utilitarios.cnpjValido(valor); }, mensagem: "CNPJ inválido!" },
        { $campo: this.elementos.$tel, valido: function (valor) { return Utilitarios.telefoneValido(valor); }, mensagem: "Telefone inválido!" },
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
        { valor: el.$bio.val(), el: el.$bio },
        { valor: el.$senha.val(), el: el.$senha },
        { valor: el.$email.val(), el: el.$email },
        { valor: el.$cep.val(), el: el.$cep },
        { valor: el.$rua.val(), el: el.$rua },
        { valor: el.$bairro.val(), el: el.$bairro },
        { valor: el.$uf.val(), el: el.$uf },
        { valor: el.$ibge.val(), el: el.$ibge },
        { valor: el.$cidade.val(), el: el.$cidade },
        { valor: el.$cnpj.val(), el: el.$cnpj }
      ];

      if (Utilitarios.validarCampos(campos)) {
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("Preencha todos os campos!", "danger");
        return;
      }

      const cnpj = el.$cnpj.val().trim();
      if (!cnpj || !Utilitarios.cnpjValido(cnpj)) {
        el.$cnpj.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("CNPJ inválido!", "danger");
        return;
      }

      if (!Utilitarios.telefoneValido(el.$tel.val())) {
        el.$tel.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("Telefone inválido!", "danger");
        return;
      }

      if (!el.$img[0].files || el.$img[0].files.length === 0) {
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("Imagem obrigatória!", "danger");
        return;
      }

      const email = el.$email.val().trim();
      if (!Utilitarios.emailValido(email)) {
        el.$email.addClass("is-invalid");
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("E-mail inválido!", "danger");
        return;
      }

      if (Utilitarios.apenasNumeros(el.$cep.val()).length !== 8) {
        Utilitarios.marcarCamposComErro(el.$alertContainer, [el.$cep, el.$rua, el.$bairro, el.$uf, el.$ibge, el.$cidade], "CEP inválido!");
        $botao.prop("disabled", false).html("Cadastrar");
        return;
      }

      const cnpjLimpo = Utilitarios.apenasNumeros(el.$cnpj.val());
      const cepLimpo = Utilitarios.apenasNumeros(el.$cep.val());

      // $_POST e $_FILES saem do próprio formulário (atributos name); só os valores com máscara são sobrescritos.
      const formData = Utilitarios.criarFormData(el.$formulario, {
        email: email,
        telefone: Utilitarios.apenasNumeros(el.$tel.val()),
        CEP: cepLimpo,
        CNPJ: cnpjLimpo
      });

      $.ajax({
          url: this.configuracao.urlClinica,
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
      $botao.text("Aguarde " + tempo + "s para gerar um novo código");

      const intervalo = setInterval(function () {
        tempo--;
        $botao.text("Aguarde " + tempo + "s para gerar um novo código");
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
        url: this.configuracao.urlClinica,
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
        url: this.configuracao.urlClinica,
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
    moduloCadClinica.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
