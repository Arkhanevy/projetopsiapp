/* ============================================================
   ARQUIVO: cadCliente.js

   O QUE FAZ
   Cadastro e ativação de conta do cliente. Alterna entre as telas de cadastro
   e de ativação, valida e envia o cadastro (com foto de perfil) por AJAX,
   gera/reenvia o código de ativação por e-mail e ativa a conta com o código
   informado.

   OBSERVAÇÕES
   - Depende de jQuery, Bootstrap e ElmoUtilitarios (utilitarios.js, carregado
     antes).
   - Nenhum formulário é enviado de forma nativa: o submit é bloqueado e o
     envio é por AJAX com FormData.
   - As validações do navegador (CPF/CNPJ, telefone, e-mail, idade) são só
     conveniência: o servidor precisa validar tudo de novo.
   - A URL do controller está fixa com o prefixo  (marcada
     //Axolote em alguns pontos): ajuste ao mudar de ambiente.
   - O nome urlElementos() engana: a função só guarda referências de
     elementos, não monta URL.
   - O botão 'Ativar' só funciona depois de 'Gerar código'
     (estado.codigoGerado); o botão de gerar fica bloqueado 60 s com contagem
     regressiva.
   - gerarCodigo() inicia a contagem de 60 s antes da resposta do servidor: se
     a requisição falhar, o usuário ainda espera o tempo todo. Há também um
     caractere \b dentro do texto do botão.
   - Os campos $form e $emailAtivacao são guardados mas não usados; a ativação
     lê o e-mail do formulário de cadastro.
   - Links antigos com ?tipo=login são redirecionados para a tela
     loginCliente.
   - Exige ser maior de 18 anos, CPF e telefone válidos e foto de perfil.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery e
     ElmoUtilitarios.
     - moduloCadCliente (objeto) — Módulo da página de cadastro e ativação.
       - moduloCadCliente.configuracao — URL do controller e URL de login
         (destino após a ativação).
       - moduloCadCliente.estado — Estado interno: tela inicial e se o código
         de ativação já foi gerado.
       - moduloCadCliente.telas — Referências das telas (cadastro e ativação)
         alternadas por mostrarTela().
       - moduloCadCliente.elementos — Cache dos elementos jQuery (campos,
         botões e contêiner de alerta).
       - moduloCadCliente.iniciar() — Guarda os elementos, redireciona links
         antigos ?tipo=login, ativa a prévia da imagem, registra eventos e
         mostra a tela inicial.
       - moduloCadCliente.urlElementos() — Busca no DOM e guarda telas, campos
         do formulário e botões.
       - moduloCadCliente.validarCamposAoSair() — Valida os campos indicados
         ao perder o foco e mostra alerta quando inválidos.
       - moduloCadCliente.registrarEventos() — Bloqueia o submit nativo, limpa
         o estado de erro ao digitar e liga os botões de cadastrar, gerar
         código e ativar.
       - moduloCadCliente.mostrarTela() — Esconde todas as telas e mostra só a
         indicada.
       - moduloCadCliente.mostrarAlert() — Exibe um alerta Bootstrap no
         contêiner da página.
       - moduloCadCliente.enviarCadastro() — Valida o formulário, monta o
         FormData (com a foto) e envia o cadastro; em sucesso, passa para a
         tela de ativação.
       - moduloCadCliente.gerarCodigo() — Bloqueia o botão por 60 s e pede ao
         servidor que (re)envie o código de ativação por e-mail.
       - moduloCadCliente.ativarConta() — Envia e-mail e código digitado; se
         correto, informa o sucesso e redireciona ao login após 1,5 s.
     - Callback do document ready — Executa moduloCadCliente.iniciar() quando
       o DOM estiver pronto.
   ============================================================ */

console.log("JS cadCliente carregado");
/* ============================================================
   PÁGINA: cadCliente (Cadastro / Ativação do Cliente)
   Depende de: jQuery, Bootstrap 5 (bundle JS), ElmoUtilitarios
   (ver /assets/js/utilitarios.js — deve ser carregado antes deste arquivo)

   Responsabilidades deste arquivo:
   - Alternar entre as telas de cadastro e ativação do cliente.
   - Redirecionar para a página de login (loginCliente) após a ativação
     e para links antigos com ?tipo=login.
   - Validar e enviar o formulário de cadastro via AJAX (com upload
     da imagem de perfil).
   - Gerar/reenviar o código de ativação por e-mail.
   - Validar o código informado e ativar a conta.
   ============================================================ */

/** Função autoexecutável que isola o escopo e recebe jQuery e ElmoUtilitarios. */
(function ($, Utilitarios) {
  "use strict";

  /** Módulo da página de cadastro e ativação. */
  var moduloCadCliente = {

    /* ---------- Configuração ---------- */
    /** URL do controller e URL de login (destino após a ativação). */
    configuracao: {
      urlCliente: "index.php?uri=cliente", //Axolote
      urlLogin: "index.php?uri=loginCliente"
    },

    /* ---------- Estado interno ---------- */
    /** Estado interno: tela inicial e se o código de ativação já foi gerado. */
    estado: {
      telaInicial: "cadastro",
      codigoGerado: false
    },

    /* ---------- Referências de elementos (cacheadas) ---------- */
    /** Referências das telas (cadastro e ativação) alternadas por mostrarTela(). */
    telas: {},
    /** Cache dos elementos jQuery (campos, botões e contêiner de alerta). */
    elementos: {},

    /**
     * Guarda os elementos, redireciona links antigos ?tipo=login, ativa a prévia da imagem,
     * registra eventos e mostra a tela inicial.
     */
    /**
     * Ponto de entrada. Deve ser chamado uma vez, quando o
     * documento estiver pronto.
     */
    iniciar: function () {
      this.urlElementos();

      // Compatibilidade: links antigos usavam ?tipo=login nesta mesma página.
      var parametros = new URLSearchParams(window.location.search);
      if (parametros.get("tipo") === "login") {
        window.location.replace(this.configuracao.urlLogin);
        return;
      }

      Utilitarios.configurarPreviewImagem(this.elementos.$alertContainer, this.elementos.$img, this.elementos.$preview);
      this.registrarEventos();
      this.mostrarTela(this.estado.telaInicial);
    },

    /** Busca no DOM e guarda telas, campos do formulário e botões. */
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

    /* VALIDAÇÃO AO SAIR DO CAMPO */

    /** Valida os campos indicados ao perder o foco e mostra alerta quando inválidos. */
    validarCamposAoSair: function () {
      Utilitarios.validarAoSair(this.elementos.$alertContainer, [
        { $campo: this.elementos.$cpf, valido: function (valor) { return Utilitarios.cpfValido(Utilitarios.apenasNumeros(valor)); }, mensagem: "CPF inválido!" },
        { $campo: this.elementos.$tel, valido: function (valor) { return Utilitarios.telefoneValido(valor); }, mensagem: "Telefone inválido!" },
        { $campo: this.elementos.$data, valido: function (valor) { return Utilitarios.maiorDeIdade(valor, 18); }, mensagem: "Você precisa ser maior de 18 anos para se cadastrar!" },
        { $campo: this.elementos.$email, valido: function (valor) { return Utilitarios.emailValido(valor); }, mensagem: "E-mail inválido!" }
      ]);
    },

    /**
     * Bloqueia o submit nativo, limpa o estado de erro ao digitar e liga os botões de cadastrar,
     * gerar código e ativar.
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
      $(document).on("input change", ".form-control, .form-select, textarea", function () {
        $(this).removeClass("is-invalid");
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

    /** Esconde todas as telas e mostra só a indicada. */
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

    /* ALERTAS */

    /** Exibe um alerta Bootstrap no contêiner da página. */
    mostrarAlert: function (mensagem, tipo) {
      Utilitarios.mostrarAlerta(this.elementos.$alertContainer, mensagem, tipo);
    },

    /* CADASTRO */

    /**
     * Valida o formulário, monta o FormData (com a foto) e envia o cadastro; em sucesso, passa para
     * a tela de ativação.
     */
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

    /* CÓDIGO DE ATIVAÇÃO */

    /**
     * Bloqueia o botão por 60 s e pede ao servidor que (re)envie o código de ativação por e-mail.
     */
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

    /**
     * Envia e-mail e código digitado; se correto, informa o sucesso e redireciona ao login após 1,5
     * s.
     */
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

  /** Executa moduloCadCliente.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloCadCliente.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
