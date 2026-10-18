/* ============================================================
   RESUMO DO ARQUIVO: cadProfissional.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloCadProfissional
   - Função/método: iniciar
   - Função/método: urlElementos
   - Função/método: validarCamposAoSair
   - Função/método: registrarEventos
   - Função/método: mostrarTela
   - Função/método: mostrarAlert
   - Função/método: enviarCadastro
   - Função/método: gerarCodigo
   - Função/método: ativarConta
   ============================================================ */

console.log("JS cadProfissional carregado");
/* a============================================================
   PÁGINA: cadProfissional (Cadastro / Ativação do Profissional)
   Depende de: jQuery, Bootstrap 5 (bundle JS), ElmoUtilitarios
   (ver /assets/js/utilitarios.js — deve ser carregado antes deste arquivo)

   Responsabilidades deste arquivo:
   - Alternar entre as telas de cadastro e ativação
     do profissional.
   - Preencher automaticamente o endereço a partir do CEP (ViaCEP).
   - Validar e enviar o formulário de cadastro via AJAX (com upload
     da imagem de perfil).
   - Gerar/reenviar o código de ativação por e-mail.
   - Validar o código informado e ativar a conta.
   ============================================================ */

(function ($, Utilitarios) {
  "use strict";

  // Objeto \'moduloCadProfissional\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloCadProfissional = {

    /* ---------- Configuração ---------- */
    configuracao: {
      urlProfissional: "/projetopsi/index.php?uri=profissional", //Axolote
      urlLogin: "index.php?uri=loginProfissional"
    },

    /* ---------- Estado interno ---------- */
    estado: {
      telaInicial: "cadastroProfissional",
      codigoGerado: false
    },

    /* ---------- Referências de elementos (cacheadas) ---------- */
    telas: {},
    elementos: {},

    /**
     * Ponto de entrada. Deve ser chamado uma vez, quando o
     * documento estiver pronto.
     */
    // Método \'iniciar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    iniciar: function() {
      this.urlElementos();

      var el = this.elementos;
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

    // Método \'urlElementos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    urlElementos: function() {
      this.telas = {
        cadastroProfissional: $("#cadastroProfissional"),
        ativacao: $("#ativacao")
      };

      this.elementos.$alertContainer = $("#alertContainer");

      this.elementos.$img = $("#img_perfil");
      this.elementos.$preview = $("#preview");
      this.elementos.$nome = $("#nomeProfissional");
      this.elementos.$email = $("#emailCadastro");
      this.elementos.$tel = $("#telProfissional");
      this.elementos.$user = $("#userProfissional");
      this.elementos.$genero = $("#generoProfissional");
      this.elementos.$bio = $("#bioProfissional");
      this.elementos.$data = $("#dtnPro");
      this.elementos.$cpf = $("#CPF");
      this.elementos.$senha = $("#senhaProfissional");
      this.elementos.$cep = $("#cep");
      this.elementos.$rua = $("#rua");
      this.elementos.$bairro = $("#bairro");
      this.elementos.$uf = $("#uf");
      this.elementos.$ibge = $("#ibge");
      this.elementos.$cidade = $("#cidade");
      this.elementos.$registro = $("#registroProfissional");
      this.elementos.$locais = $("input[name='cxproLocalAtendimento']");
      this.elementos.$form = $("#cadastroProfissional");


      this.elementos.$emailAtivacao = $("#emailAtivar");
      this.elementos.$codigo = $("#codigoCliente");

      this.elementos.$botaoCadastrar = $("#btnCadastrar");
      this.elementos.$botaoCodigo = $("#btnCodigo");
      this.elementos.$botaoAtivar = $("#btnAtivar");
    },

    /* VALIDAÇÃO AO SAIR DO CAMPO */

    // Método \'validarCamposAoSair\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    validarCamposAoSair: function() {
      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        { $campo: this.elementos.$cpf, valido: function (valor) { return Utilitarios.cpfValido(Utilitarios.apenasNumeros(valor)); }, mensagem: "CPF inválido!" },
        { $campo: this.elementos.$tel, valido: function (valor) { return Utilitarios.telefoneValido(valor); }, mensagem: "Telefone inválido!" },
        { $campo: this.elementos.$data, valido: function (valor) { return Utilitarios.maiorDeIdade(valor, 18); }, mensagem: "Você precisa ser maior de 18 anos para se cadastrar!" },
        { $campo: this.elementos.$email, valido: function (valor) { return Utilitarios.emailValido(valor); }, mensagem: "E-mail inválido!" }
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
      $(document).on("input change", ".form-control, .form-select, textarea", function () {
        $(this).removeClass("is-invalid");
      });

      this.elementos.$locais.on("change", function () {
        self.elementos.$locais.removeClass("is-invalid");
      });

      this.elementos.$botaoCadastrar.on("click", function (evento) {
        // Impede o envio nativo do formulário (que recarregaria a página
        // e cancelaria a requisição); o envio é feito por AJAX.
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

    /* TELAS */

    // Método \'mostrarTela\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mostrarTela: function(nomeTela) {
      var self = this;
      Object.keys(this.telas).forEach(function (chave) {
        self.telas[chave].hide();
      });

      if (this.telas[nomeTela]) {
        this.telas[nomeTela].show();
      } else {
        console.warn("Tela não encontrada:", nomeTela);
      }
    },

    /* ALERTAS */

    // Método \'mostrarAlert\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mostrarAlert: function(mensagem, tipo) {
      Utilitarios.mostrarAlerta(this.elementos.$alertContainer, mensagem, tipo);
    },

    /* CADASTRO */

    // Método \'enviarCadastro\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    enviarCadastro: function($botao) {
      var self = this;
      var el = this.elementos;

      $botao.prop("disabled", true).html("Cadastrando...");

      var campos = [
        { valor: el.$nome.val(), el: el.$nome },
        { valor: el.$tel.val(), el: el.$tel },
        { valor: el.$user.val(), el: el.$user },
        { valor: el.$bio.val(), el: el.$bio },
        { valor: el.$data.val(), el: el.$data },
        { valor: el.$registro.val(), el: el.$registro },
        { valor: el.$senha.val(), el: el.$senha },
        { valor: el.$genero.val(), el: el.$genero },
        { valor: el.$email.val(), el: el.$email },
        { valor: el.$cpf.val(), el: el.$cpf },
        { valor: el.$cep.val(), el: el.$cep },
        { valor: el.$rua.val(), el: el.$rua },
        { valor: el.$bairro.val(), el: el.$bairro },
        { valor: el.$uf.val(), el: el.$uf },
        { valor: el.$ibge.val(), el: el.$ibge },
        { valor: el.$cidade.val(), el: el.$cidade }
      ];

      if (Utilitarios.validarCampos(campos)) {
        $botao.prop("disabled", false).html("Cadastrar");
        this.mostrarAlert("Preencha todos os campos!", "danger");
        return;
      }

      var locaisSelecionados = el.$locais.filter(":checked").map(function () {
        return this.value;
      }).get();

      if (locaisSelecionados.length === 0) {
        $botao.prop("disabled", false).html("Cadastrar");
        Utilitarios.marcarCamposComErro(el.$alertContainer, [el.$locais], "Selecione ao menos um local de atendimento!");
        return;
      }

      var cpf = el.$cpf.val().trim();
      if (!cpf || !Utilitarios.cpfValido(cpf)) {
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

      var camposEndereco = [el.$cep, el.$rua, el.$bairro, el.$uf, el.$ibge, el.$cidade];
      if (Utilitarios.apenasNumeros(el.$cep.val()).length !== 8) {
        Utilitarios.marcarCamposComErro(el.$alertContainer, camposEndereco, "CEP inválido!");
        $botao.prop("disabled", false).html("Cadastrar");
        return;
      }

      var cpfLimpo = Utilitarios.apenasNumeros(el.$cpf.val());
      var cepLimpo = Utilitarios.apenasNumeros(el.$cep.val());

      var formData = new FormData();
      formData.append("nome", el.$nome.val());
      formData.append("email", email);
      formData.append("telefone", Utilitarios.apenasNumeros(el.$tel.val()));
      locaisSelecionados.forEach(function (local) {
        formData.append("locaisAtendimento[]", local);
      });
      formData.append("username", el.$user.val());
      formData.append("bio", el.$bio.val());
      formData.append("dtNas", el.$data.val());
      formData.append("registro", el.$registro.val());
      formData.append("senha", el.$senha.val());
      formData.append("genero", el.$genero.val());
      formData.append("CEP", cepLimpo);
      formData.append("CPF", cpfLimpo);
      formData.append("acao", "cadastrar");
      formData.append("cxproFoto", imgArquivo);

      $.ajax({
          url: this.configuracao.urlProfissional,
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
      .fail(function () {
          $botao.prop("disabled", false).html("Cadastrar");
          self.mostrarAlert("Erro na requisição!", "danger");
      });
    },

    /* CÓDIGO DE ATIVAÇÃO */

    // Método \'gerarCodigo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    gerarCodigo: function($botao) {
      var self = this;

      $botao.prop("disabled", true);

      var tempo = 60;
      $botao.text("Aguarde " + tempo + "s para gerar um novo código");

      var intervalo = setInterval(function () {
        tempo--;
        $botao.text("Aguarde " + tempo + "s para gerar \b um novo código");
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
        url: this.configuracao.urlProfissional,
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

    // Método \'ativarConta\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    ativarConta: function($botao) {
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
    url: this.configuracao.urlProfissional,
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
    moduloCadProfissional.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
