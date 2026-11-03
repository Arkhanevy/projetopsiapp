(function ($, Utilitarios) {
  "use strict";

  var nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  var urlServico = "index.php?uri=servico";

  var papeis = {

    profissional: {
      url: "index.php?uri=profissional",
      urlLogin: "index.php?uri=loginProfissional",
      hrefAgenda: "index.php?uri=agendaProfissional",
      listaVinculos: "clinicas",
      iconeVinculo: "apartment",
      textos: {
        tituloVinculo: "Vincular Clínica",
        rotuloVinculo: "Digite o usuário da clínica que deseja vincular:",
        placeholderVinculo: "Digite o usuário da clínica",
        buscaVazia: "Digite o usuário da clínica.",
        naoEncontrado: "Clínica não encontrada.",
        selecioneAntes: "Antes de confirmar, você precisa selecionar uma clínica.",
        rotuloSelecionar: "Selecionar clínica",
        rotuloDesvincular: "Desvincular clínica",
        desvinculoAbertura: "Você está prestes a desvincular a clínica ",
        desvinculoConsequencia: "Se continuar com isso, ela não aparecerá mais como uma clínica em que você trabalha. Dessa forma, os clientes não poderão agendar uma consulta com você nessa localização e suas futuras consultas não aparecerão no relatório dessa clínica."
      }
    },

    clinica: {
      url: "index.php?uri=clinica",
      urlLogin: "index.php?uri=loginClinica",
      hrefAgenda: "index.php?uri=agendaClinica",
      listaVinculos: "profissionais",
      iconeVinculo: "person",
      textos: {
        tituloVinculo: "Vincular Profissional",
        rotuloVinculo: "Digite o usuário do profissional que deseja vincular:",
        placeholderVinculo: "Digite o usuário do profissional",
        buscaVazia: "Digite o usuário do profissional.",
        naoEncontrado: "Profissional não encontrado.",
        selecioneAntes: "Antes de confirmar, você precisa selecionar um profissional.",
        rotuloSelecionar: "Selecionar profissional",
        rotuloDesvincular: "Desvincular profissional",
        desvinculoAbertura: "Você está prestes a desvincular o profissional ",
        desvinculoConsequencia: "Se continuar com isso, esse profissional não aparecerá mais como parte da sua clínica. Dessa forma, os clientes não poderão agendar uma consulta com ele nessa localização e as futuras consultas dele não aparecerão no relatório da clínica."
      }
    },

    cliente: {
      url: "index.php?uri=cliente",
      urlLogin: "index.php?uri=loginCliente",
      hrefAgenda: "index.php?uri=consultasCli",
      hrefInicio: "index.php?uri=buscar"
    }
  };

  var tiposDePerfil = ["profissional", "clinica"];

  var moduloPerfil = {

    configuracao: {
      urlSair: "limparSessao.php",
      urlInicio: "index.php",
      duracaoAviso: 4000,
      ocultarParametrosNaUrl: true,

      contratos: {

        verificarLogin:    { acao: "verificarLogin", disponivel: true },
        carregarPerfil:    { acao: { profissional: "PegarPerfil", clinica: "pegarinfo" }, disponivel: true },
        cadastrarServico:  { url: urlServico, acao: "cadastrar", disponivel: true },

        carregarPerfilPublico: { url: "index.php?uri=busca", acao: "mostrardetalhes", disponivel: true },

        cadastrarHorarios: { acao: { profissional: "atribuirHrServico" }, disponivel: true },

        buscarVinculo: { url: "index.php?uri=busca", acao: "busca", disponivel: true },

        editarBio:         { acao: "editarBio",          disponivel: false },
        editarLocalizacao: { acao: "editarLocalizacao",  disponivel: false },
        listarVinculos:    { acao: "listarVinculos",     disponivel: false },

        vincular:          { acao: "vincular",           disponivel: false },
        desvincular:       { acao: "desvincular",        disponivel: false },
        gerenciarVinculos: { acao: "gerenciarVinculos",  disponivel: false }
      }
    },

    estado: {
      papel: null,
      alvo: null,
      perfil: null,
      horarios: [],
      servicos: [],
      vinculoBuscado: null,
      vinculoSelecionado: null,
      vinculoParaDesvincular: null,
      cacheEnderecos: {},
      origemFoco: null
    },

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      this.sincronizarAriaInvalid();
      this.registrarEventos();
      this.montarLinhasHorarioFormulario();
      this.configurarCamposLocalizacao();
      this.estado.alvo = this.lerAlvoDaUrl();
      this.verificarLogin();
    },

    cachearElementos: function () {
      var e = this.elementos;
      e.$navsLogado = $(".navTopoLogado, .navLateralLogado, .navInferiorLogado");
      e.$modalSessaoExpirada = $("#modalSessaoExpirada");
      e.$modalVincular = $("#modalVincular");
      e.$modalDesvincular = $("#modalDesvincular");
      e.$aviso = $("#avisoPerfil");

      e.$formularioBio = $("#formularioBio");
      e.$formularioServico = $("#formularioServico");
      e.$formularioLocalizacao = $("#formularioLocalizacao");
      e.$formularioHorarios = $("#formularioHorarios");
      e.$formularioVinculo = $("#formularioVinculo");

      e.$campoBioNova = $("#campoBioNova");
      e.$campoTipoServico = $("#campoTipoServico");
      e.$campoValorServico = $("#campoValorServico");
      e.$listaLinhasHorario = $('[data-lista="linhasHorario"]');
      e.$botaoSalvarHorarios = $("#botaoSalvarHorarios");
      e.$campoUsuarioVinculo = $("#campoUsuarioVinculo");
      e.$mensagemUsuarioVinculo = $("#mensagemUsuarioVinculo");
      e.$resultadoVinculo = $('[data-lista="resultadoVinculo"]');

      e.$camposLocalizacao = {
        cep: $("#campoCepLocalizacao"),
        rua: $("#campoRuaLocalizacao"),
        bairro: $("#campoBairroLocalizacao"),
        cidade: $("#campoCidadeLocalizacao"),
        uf: $("#campoEstadoLocalizacao"),
        ibge: $("#campoIbgeLocalizacao")
      };
    },

    sincronizarAriaInvalid: function () {
      var observador = new MutationObserver(function (mudancas) {
        $.each(mudancas, function (_, mudanca) {
          var $elemento = $(mudanca.target);

          if ($elemento.is("input, textarea")) {
            var ariaInvalido;
            if ($elemento.hasClass("is-invalid")) {
              ariaInvalido = "true";
            } else {
              ariaInvalido = null;
            }
            $elemento.attr("aria-invalid", ariaInvalido);
          } else if ($elemento.is(".campoSelect")) {
            var ariaInvalidoGatilho;
            if ($elemento.hasClass("campoSelect--erro")) {
              ariaInvalidoGatilho = "true";
            } else {
              ariaInvalidoGatilho = null;
            }
            $elemento.find(".campoSelect_gatilho").attr("aria-invalid", ariaInvalidoGatilho);
          }
        });
      });

      observador.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
    },

    focarPrimeiroInvalido: function ($escopo) {
      $escopo.find("input.is-invalid, textarea.is-invalid, .campoSelect--erro .campoSelect_gatilho").first().trigger("focus");
    },

    ehVisitante: function () {
      if (this.estado.alvo) {
        return true;
      } else {
        return false;
      }
    },

    tipoPerfil: function () {
      if (this.estado.alvo) {
        return this.estado.alvo.tipo;
      } else {
        return this.estado.papel;
      }
    },

    configuracaoDoPapel: function () {
      return papeis[this.tipoPerfil()];
    },

    textos: function () {
      return papeis[this.tipoPerfil()].textos;
    },

    ehClinica: function () {
      return this.tipoPerfil() === "clinica";
    },

    aplicarPapel: function () {
      var tipo = this.tipoPerfil();

      $("[data-perfilDe]").each(function () {
        var atributoHidden;
        if ($(this).attr("data-perfilDe") === tipo) {
          atributoHidden = null;
        } else {
          atributoHidden = "hidden";
        }
        $(this).attr("hidden", atributoHidden);
      });

      if (this.ehVisitante()) {
        $("[data-somenteDono]").attr("hidden", "hidden");

        $("#linkDocumentos").attr("href", "index.php?uri=documentos&id=" + encodeURIComponent(this.estado.alvo.id));
      }
    },

    lerAlvoDaUrl: function () {
      var parametros = new URLSearchParams(window.location.search);
      var tipo = parametros.get("tipo");
      var id = parametros.get("id");
      var alvo = null;
      var urlLimpa = window.location.pathname + "?uri=perfil";

      if (parametros.get("meu")) {
        alvo = null;
      } else if ($.inArray(tipo, tiposDePerfil) !== -1 && /^[0-9]+$/.test(id || "")) {
        alvo = { tipo: tipo, id: id };
      } else if (window.history.state && window.history.state.perfilVisitado) {
        var guardado = window.history.state.perfilVisitado;
        if ($.inArray(guardado.tipo, tiposDePerfil) !== -1 && /^[0-9]+$/.test(String(guardado.id))) {
          alvo = guardado;
        }
      }

      var haParametros = parametros.has("tipo") || parametros.has("id") || parametros.has("meu");
      if (this.configuracao.ocultarParametrosNaUrl && haParametros) {
        try {
          var estadoHistorico;
          if (alvo) {
            estadoHistorico = { perfilVisitado: alvo };
          } else {
            estadoHistorico = null;
          }
          window.history.replaceState(estadoHistorico, "", urlLimpa);
        } catch (erro) {

        }
      }
      return alvo;
    },

    contratoDisponivel: function (nome) {
      var contrato = this.configuracao.contratos[nome];

      if (!contrato.disponivel) {
        return false;
      }

      if (typeof contrato.acao === "object") {
        if (contrato.acao[this.tipoPerfil()]) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },

    chamarContrato: function (nome, dados, tipoResposta, papel) {
      var contrato = this.configuracao.contratos[nome];
      papel = papel || this.tipoPerfil();
      var acao;
      if (typeof contrato.acao === "object") {
        acao = contrato.acao[papel];
      } else {
        acao = contrato.acao;
      }

      return $.ajax({
        url: contrato.url || papeis[papel].url,
        method: "POST",
        dataType: tipoResposta || "json",
        data: $.extend({ acao: acao }, dados || {})
      });
    },

    avisarIndisponivel: function () {
      this.exibirAviso("Essa ação ainda não está disponível no servidor.", "atencao");
    },

    verificarLogin: function () {
      var self = this;
      var ordem = ["profissional", "clinica", "cliente"];

      function tentar(indice) {
        if (indice >= ordem.length) {
          self.aoNaoLogar();
          return;
        }
        self.chamarContrato("verificarLogin", null, "json", ordem[indice])
          .done(function (resposta) {
            if (resposta && resposta.logado) {
              self.aoConfirmarLogin(ordem[indice]);
            } else {
              tentar(indice + 1);
            }
          })
          .fail(function () {
            tentar(indice + 1);
          });
      }

      tentar(0);
    },

    aoConfirmarLogin: function (papel) {
      this.estado.papel = papel;
      this.configurarNavegacaoLogado();
      this.iniciarPerfil();
    },

    aoNaoLogar: function () {

      if (!this.ehVisitante()) {
        this.exibirModalSessaoExpirada();
        return;
      }
      $(".navTopoDeslogado").removeAttr("hidden");
      $("#conteudoPerfil").addClass("conteudoPerfil--semNavLateral");
      this.iniciarPerfil();
    },

    configurarNavegacaoLogado: function () {
      var papel = this.estado.papel;
      var config = papeis[papel];
      var $navs = this.elementos.$navsLogado;

      if (papel === "cliente") {

        $navs.filter("[data-papel]").attr("data-papel", "cliente").each(function () {
          if (typeof aplicarPapelNavegacao === "function") {
            aplicarPapelNavegacao($(this));
          }
        });
        $("[data-itemPapel]").attr("href", config.hrefInicio);
      }
      $("[data-itemAgenda]").attr("href", config.hrefAgenda);

      if (this.ehVisitante()) {

        $(".navLateralLogado_item--ativo, .navInferiorLogado_item--ativo")
          .removeClass("navLateralLogado_item--ativo navInferiorLogado_item--ativo")
          .removeAttr("aria-current");
        $("[data-itemPerfil]").attr("href", "index.php?uri=perfil&meu=1");
      }
      $navs.removeAttr("hidden");
    },

    iniciarPerfil: function () {
      if (this.ehVisitante() || $.inArray(this.estado.papel, tiposDePerfil) !== -1) {
        this.aplicarPapel();
        this.prepararModalVinculo();
        this.carregarPerfil();
        return;
      }

      this.exibirPerfilIndisponivel("O perfil do cliente ainda não está disponível.");
    },

    exibirPerfilIndisponivel: function (texto) {
      $(".cabecalhoPerfil, .abasPerfil, .conteudoAbas").attr("hidden", "hidden");
      $('[data-campo="textoPerfilIndisponivel"]').text(texto);
      $('[data-estadoVazio="perfilIndisponivel"]').removeAttr("hidden");
      $("#conteudoPerfil").attr("aria-busy", "false");
    },

    exibirModalSessaoExpirada: function () {
      Utilitarios.exibirModal(this.elementos.$modalSessaoExpirada, {
        backdrop: "static",
        keyboard: false
      });
    },

    sair: function () {
      var self = this;
      $.ajax({ url: this.configuracao.urlSair, method: "POST" }).always(function () {
        window.location.href = self.configuracao.urlInicio;
      });
    },

    carregarPerfil: function () {
      var self = this;
      var visitante = this.ehVisitante();
      var contrato;
      if (visitante) {
        contrato = "carregarPerfilPublico";
      } else {
        contrato = "carregarPerfil";
      }

      this.carregarVinculos();

      if (!this.contratoDisponivel(contrato)) {
        this.exibirPerfilIndisponivel("Perfil indisponível no momento.");
        return;
      }

      var dadosPerfil;
      if (visitante) {
        dadosPerfil = { tipo: this.estado.alvo.tipo, id: this.estado.alvo.id };
      } else {
        dadosPerfil = null;
      }
      this.chamarContrato(contrato, dadosPerfil)
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso) {
            if (visitante) {
              self.exibirPerfilIndisponivel("Perfil não encontrado.");
            } else {
              self.exibirAviso("Não foi possível carregar o perfil. Tente novamente.", "erro");
              $("#conteudoPerfil").attr("aria-busy", "false");
            }
            return;
          }
          if (visitante) {

            if (!$.isArray(resposta.dados) || !resposta.dados.length) {
              self.exibirPerfilIndisponivel("Perfil não encontrado.");
              return;
            }
            self.estado.perfil = resposta.dados[0];
            self.estado.horarios = [];
            self.estado.servicos = [];
          } else {

            self.estado.perfil = (resposta.dados1 && resposta.dados1[0]) || {};
            self.estado.horarios = resposta.dados2 || [];
            self.estado.servicos = resposta.dados3 || [];
          }
          self.renderizarPerfil();
          $("#conteudoPerfil").attr("aria-busy", "false");
        })
        .fail(function () {
          if (visitante) {
            self.exibirPerfilIndisponivel("Perfil indisponível no momento.");
          } else {
            self.exibirAviso("Não foi possível carregar o perfil. Tente novamente.", "erro");
            $("#conteudoPerfil").attr("aria-busy", "false");
          }
        });
    },

    carregarVinculos: function () {
      var self = this;

      if (!this.contratoDisponivel("listarVinculos")) {
        this.renderizarVinculos([]);
        return;
      }

      var dadosVinculos;
      if (this.ehVisitante()) {
        dadosVinculos = { idPerfil: this.estado.alvo.id };
      } else {
        dadosVinculos = null;
      }
      this.chamarContrato("listarVinculos", dadosVinculos)
        .done(function (resposta) {
          var vinculos;
          if (resposta && resposta.sucesso) {
            vinculos = resposta.dados;
          } else {
            vinculos = [];
          }
          self.renderizarVinculos(vinculos);
        })
        .fail(function () {
          self.renderizarVinculos([]);
        });
    },

    usuarioDoPerfil: function () {
      var p = this.estado.perfil || {};

      if (this.ehClinica()) {
        return p.clin_user || p.clin_nome || "";
      } else {
        return p.pro_user || p.pro_nome || "";
      }
    },

    bioDoPerfil: function () {
      var p = this.estado.perfil || {};
      var biografia;
      if (this.ehClinica()) {
        biografia = p.clin_bio;
      } else {
        biografia = p.pro_bio;
      }
      return biografia || "";
    },

    definirBioDoPerfil: function (bio) {
      var campoBio;
      if (this.ehClinica()) {
        campoBio = "clin_bio";
      } else {
        campoBio = "pro_bio";
      }
      this.estado.perfil[campoBio] = bio;
    },

    renderizarPerfil: function () {
      $('[data-campo="usuario"]').text(this.usuarioDoPerfil());
      this.renderizarBio();

      if (this.ehClinica()) {
        this.renderizarLocalizacao();
      } else {
        this.renderizarServicos();
      }
      this.renderizarHorarios();
      this.preencherFormularioHorarios();

      if (this.ehVisitante() || this.ehClinica()) {
        $('[data-estadoVazio="servicos"] .estadoVazio_texto, [data-estadoVazio="horarios"] .estadoVazio_texto')
          .text("Informação ainda não disponível");
      }
    },

    renderizarBio: function () {
      $('[data-campo="bio"]').text(this.bioDoPerfil());
    },

    renderizarServicos: function () {
      var self = this;
      var $corpo = $('[data-lista="servicos"]').empty();
      var servicos = this.estado.servicos;

      $.each(servicos, function (_, servico) {
        var $linha = self.clonarModelo("modeloLinhaServico");
        var $dias = $linha.find('[data-campo="diasServico"]');

        $linha.find('[data-campo="nomeServico"]').text(servico.ser_nome);
        $linha.find('[data-campo="valorServico"]').text(self.formatarMoeda(servico.ser_val));
        $linha.find('[data-campo="duracaoServico"]').text(servico.ser_dur + " min");

        $.each(self.separarDias(servico.ser_dia), function (_, indice) {
          $dias.append($("<div>").text(nomesDias[indice]));
        });

        $corpo.append($linha);
      });

      this.alternarListaOuVazio("servicos", servicos.length > 0);
    },

    renderizarHorarios: function () {
      var self = this;
      var $corpo = $('[data-lista="horarios"]').empty();
      var horarios = this.estado.horarios.slice().sort(function (a, b) {
        return Number(a.hrser_dia) - Number(b.hrser_dia);
      });

      $.each(horarios, function (_, horario) {
        var $linha = self.clonarModelo("modeloLinhaHorario");
        $linha.find('[data-campo="diaSemana"]').text(nomesDias[Number(horario.hrser_dia)]);
        $linha.find('[data-campo="horaAbertura"]').text(self.formatarHora(horario.hrser_hrini));
        $linha.find('[data-campo="horaFechamento"]').text(self.formatarHora(horario.hrser_hrterm));
        $corpo.append($linha);
      });

      this.alternarListaOuVazio("horarios", horarios.length > 0);
    },

    buscarEnderecoPorCep: function (cep) {
      var cepNumerico = Utilitarios.apenasNumeros(cep || "");
      var cache = this.estado.cacheEnderecos;
      var resultado = $.Deferred();

      if (!/^[0-9]{8}$/.test(cepNumerico)) {
        return resultado.reject().promise();
      }
      if (cache[cepNumerico]) {
        return resultado.resolve(cache[cepNumerico]).promise();
      }

      $.ajax({
        url: "https://viacep.com.br/ws/" + cepNumerico + "/json/",
        dataType: "jsonp",
        timeout: 8000
      })
        .done(function (dados) {
          if (!dados || dados.erro) {
            resultado.reject();
            return;
          }
          cache[cepNumerico] = dados;
          resultado.resolve(dados);
        })
        .fail(function () {
          resultado.reject();
        });

      return resultado.promise();
    },

    textoEndereco: function (dadosViaCep) {
      var cidadeUf = [dadosViaCep.localidade, dadosViaCep.uf].filter(Boolean).join(" - ");
      return [dadosViaCep.logradouro, dadosViaCep.bairro, cidadeUf].filter(Boolean).join(", ");
    },

    atualizarLinkMaps: function (cepFormatado, endereco) {
      var prefixoEndereco;
      if (endereco) {
        prefixoEndereco = endereco + " ";
      } else {
        prefixoEndereco = "";
      }
      var consulta = $.trim(prefixoEndereco + cepFormatado);
      var $maps = $("#botaoAbrirMaps");

      if (consulta) {
        $maps.attr("href", "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta)).removeAttr("hidden");
      } else {
        $maps.attr("hidden", "hidden");
      }
    },

    renderizarLocalizacao: function () {
      var self = this;
      var cepBruto = (this.estado.perfil || {}).clin_cep || "";
      var cep;
      if (cepBruto) {
        cep = Utilitarios.formatarMascara("cep", cepBruto);
      } else {
        cep = "";
      }
      var $endereco = $('[data-campo="enderecoClinica"]');

      $('[data-campo="cepClinica"]').text(cep || "Não informado");
      this.atualizarLinkMaps(cep, "");

      if (!cep) {
        $endereco.text("Não informado");
        return;
      }

      $endereco.text("Carregando...");
      this.buscarEnderecoPorCep(cepBruto)
        .done(function (dados) {

          if (Utilitarios.apenasNumeros((self.estado.perfil || {}).clin_cep || "") !== Utilitarios.apenasNumeros(cepBruto)) {
            return;
          }
          var endereco = self.textoEndereco(dados);
          $endereco.text(endereco || "Não informado");
          self.atualizarLinkMaps(cep, endereco);
        })
        .fail(function () {
          $endereco.text("Não foi possível carregar o endereço.");
        });
    },

    alternarListaOuVazio: function (nome, temItens) {
      var hiddenTabela;
      if (temItens) {
        hiddenTabela = null;
      } else {
        hiddenTabela = "hidden";
      }
      $('[data-tabela="' + nome + '"]').attr("hidden", hiddenTabela);
      var hiddenEstadoVazio;
      if (temItens) {
        hiddenEstadoVazio = "hidden";
      } else {
        hiddenEstadoVazio = null;
      }
      $('[data-estadoVazio="' + nome + '"]').attr("hidden", hiddenEstadoVazio);
    },

    clonarModelo: function (idModelo) {
      return $(document.getElementById(idModelo).content.firstElementChild.cloneNode(true));
    },

    formatarMoeda: function (valor) {
      return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    formatarHora: function (hora) {
      return String(hora || "").slice(0, 5);
    },

    mascararValor: function ($campo) {
      var centavos = Utilitarios.apenasNumeros($campo.val());
      if (!centavos) {
        $campo.val("");
        return;
      }
      $campo.val((Number(centavos) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    },

    valorParaBackend: function ($campo) {
      var centavos = Utilitarios.apenasNumeros($campo.val());
      if (centavos) {
        return (Number(centavos) / 100).toFixed(2);
      } else {
        return "";
      }
    },

    combinarDias: function (indices) {
      var soma = 0;
      $.each(indices, function (_, indice) {
        soma += Math.pow(2, Number(indice));
      });
      return soma;
    },

    separarDias: function (valorCombinado) {
      var numero = parseInt(valorCombinado, 10) || 0;
      var indices = [];
      for (var indice = 0; indice < nomesDias.length; indice++) {
        if (numero & Math.pow(2, indice)) {
          indices.push(indice);
        }
      }
      return indices;
    },

    exibirAviso: function (mensagem, tipo) {
      var $aviso = this.elementos.$aviso;
      var icone;
      if (tipo === "atencao") {
        icone = "warning";
      } else {
        icone = "error";
      }

      $aviso.toggleClass("avisoFlutuante--atencao", tipo === "atencao");
      $aviso.find(".avisoFlutuante_icone").text(icone);
      $aviso.find('[data-campo="mensagemAviso"]').text(mensagem);

      bootstrap.Toast.getOrCreateInstance($aviso.get(0), {
        delay: this.configuracao.duracaoAviso
      }).show();
    },

    mostrarVisao: function (nomeVisao) {
      var $alvo = $('.visaoPerfil[data-visao="' + nomeVisao + '"]');
      var origem = this.estado.origemFoco;

      $alvo.siblings(".visaoPerfil").attr("hidden", "hidden");
      $alvo.removeAttr("hidden");
      window.scrollTo(0, 0);

      var $titulo = $alvo.find(".formularioPerfil_titulo").first();
      if ($titulo.length) {

        $titulo.attr("tabindex", "-1").trigger("focus");
      } else if (origem && $.contains(document.body, origem) && !$(origem).closest("[hidden]").length) {

        $(origem).trigger("focus");
      } else {
        $alvo.attr("tabindex", "-1").trigger("focus");
      }
    },

    prepararVisao: function (nomeVisao) {
      if (nomeVisao === "edicaoBio") {
        $("#campoBioAtual").val(this.bioDoPerfil());
        this.elementos.$campoBioNova.val("");
      }
      if (nomeVisao === "edicaoLocalizacao") {
        this.preencherFormularioLocalizacao();
      }
      if (nomeVisao === "cadastroHorarios") {
        this.preencherFormularioHorarios();
      }
    },

    cancelarEdicao: function ($botao) {
      var $formulario = $botao.closest("form");
      var $visaoResumo = $botao.closest(".tab-pane").children(".visaoPerfil").first();

      this.limparFormulario($formulario);
      this.mostrarVisao($visaoResumo.attr("data-visao"));
    },

    limparFormulario: function ($formulario) {
      $formulario.get(0).reset();
      $formulario.find(".is-invalid").removeClass("is-invalid");
      $formulario.find(".campoSelect--erro").removeClass("campoSelect--erro");
      $formulario.find(".campoSelect").each(function () {
        $(this).attr("data-valorSelecionado", "");
        $(this).find(".campoSelect_valor").text("Selecione um tipo de serviço");
      });
      $("#avisosLocalizacao").empty();

      if ($formulario.is(this.elementos.$formularioHorarios)) {
        this.preencherFormularioHorarios();
      }
    },

    enviarBio: function () {
      var $campo = this.elementos.$campoBioNova;
      var bio = $.trim($campo.val());

      if (!bio) {
        $campo.addClass("is-invalid");
        this.focarPrimeiroInvalido(this.elementos.$formularioBio);
        return;
      }
      if (bio === $.trim(this.bioDoPerfil())) {
        this.exibirAviso("Nenhuma alteração foi feita!", "atencao");
        return;
      }
      if (!this.contratoDisponivel("editarBio")) {
        this.avisarIndisponivel();
        return;
      }

      var self = this;
      this.chamarContrato("editarBio", { bio: bio })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.definirBioDoPerfil(bio);
            self.renderizarBio();
            self.limparFormulario(self.elementos.$formularioBio);
            self.mostrarVisao("resumo");
          } else {
            self.exibirAviso("Não foi possível salvar a biografia. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível salvar a biografia. Tente novamente.", "erro");
        });
    },

    configurarCamposLocalizacao: function () {
      Utilitarios.configurarCEP($("#avisosLocalizacao"), this.elementos.$camposLocalizacao);
    },

    preencherFormularioLocalizacao: function () {
      var cep = (this.estado.perfil || {}).clin_cep || "";
      var c = this.elementos.$camposLocalizacao;

      $("#avisosLocalizacao").empty();
      $.each(c, function (_, $campo) {
        $campo.removeClass("is-invalid").val("");
      });
      var cepExibido;
      if (cep) {
        cepExibido = Utilitarios.formatarMascara("cep", cep);
      } else {
        cepExibido = "";
      }
      c.cep.val(cepExibido);

      this.buscarEnderecoPorCep(cep).done(function (dados) {
        c.rua.val(dados.logradouro || "");
        c.bairro.val(dados.bairro || "");
        c.cidade.val(dados.localidade || "");
        c.uf.val(dados.uf || "");
        c.ibge.val(dados.ibge || "");
      });
    },

    enviarLocalizacao: function () {
      var c = this.elementos.$camposLocalizacao;
      var perfil = this.estado.perfil || {};
      var $avisos = $("#avisosLocalizacao");
      var cep = Utilitarios.apenasNumeros(c.cep.val());

      var vazios = [];
      $.each(c, function (_, $campo) {
        $campo.removeClass("is-invalid");
        var valor = $.trim($campo.val());
        if (!valor || valor === "...") {
          vazios.push($campo);
        }
      });

      if (!/^[0-9]{8}$/.test(cep)) {
        Utilitarios.marcarCamposComErro($avisos, [c.cep], "CEP inválido!");
        c.cep.trigger("focus");
        return;
      }
      if (vazios.length) {
        $.each(vazios, function (_, $campo) {
          $campo.addClass("is-invalid");
        });
        this.exibirAviso("Você precisa preencher todos os campos!", "erro");
        this.focarPrimeiroInvalido(this.elementos.$formularioLocalizacao);
        return;
      }
      if (cep === Utilitarios.apenasNumeros(perfil.clin_cep || "")) {
        this.exibirAviso("Nenhuma alteração foi feita!", "atencao");
        return;
      }
      if (!this.contratoDisponivel("editarLocalizacao")) {
        this.avisarIndisponivel();
        return;
      }

      var self = this;
      this.chamarContrato("editarLocalizacao", { cep: cep })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.estado.perfil.clin_cep = cep;
            self.renderizarLocalizacao();
            self.limparFormulario(self.elementos.$formularioLocalizacao);
            self.mostrarVisao("resumo");
          } else {
            self.exibirAviso("Não foi possível salvar a localização. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível salvar a localização. Tente novamente.", "erro");
        });
    },

    enviarServico: function () {
      var $formulario = this.elementos.$formularioServico;
      var $tipo = this.elementos.$campoTipoServico;

      var dados = {
        nome: $.trim($("#campoNomeServico").val()),
        val: this.valorParaBackend(this.elementos.$campoValorServico),
        tipo: $tipo.attr("data-valorSelecionado") || "",
        desc: $.trim($("#campoDescricaoServico").val()),
        dur: $.trim($("#campoDuracaoServico").val()),
        inter: $.trim($("#campoIntervaloServico").val()),
        stat: "ativo",

        loc: 1
      };

      var camposVazios = [];
      if (!dados.nome) camposVazios.push($("#campoNomeServico"));
      if (!dados.val) camposVazios.push(this.elementos.$campoValorServico);
      if (!dados.desc) camposVazios.push($("#campoDescricaoServico"));
      if (!dados.dur) camposVazios.push($("#campoDuracaoServico"));
      if (dados.inter === "") camposVazios.push($("#campoIntervaloServico"));

      $formulario.find(".is-invalid").removeClass("is-invalid");
      $tipo.removeClass("campoSelect--erro");
      $.each(camposVazios, function (_, $campo) {
        $campo.addClass("is-invalid");
      });
      if (!dados.tipo) {
        $tipo.addClass("campoSelect--erro");
      }

      if (camposVazios.length || !dados.tipo) {
        this.exibirAviso("Você precisa preencher todos os campos!", "erro");
        this.focarPrimeiroInvalido($formulario);
        return;
      }

      var indicesDias = $formulario.find('input[name="diasServico"]:checked').map(function () {
        return Number(this.value);
      }).get();

      if (!indicesDias.length) {
        this.exibirAviso("Você precisa selecionar pelo menos um dia para realizar esse serviço!", "erro");
        $formulario.find('input[name="diasServico"]').first().trigger("focus");
        return;
      }

      dados.dia = this.combinarDias(indicesDias);

      var self = this;
      var $botao = $formulario.find('button[type="submit"]').prop("disabled", true);

      this.chamarContrato("cadastrarServico", dados, "text")
        .done(function (resposta) {
          if ($.trim(resposta) === "sucesso") {
            self.limparFormulario($formulario);
            self.mostrarVisao("resumo");
            self.carregarPerfil();
          } else {
            self.exibirAviso("Não foi possível cadastrar o serviço. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível cadastrar o serviço. Tente novamente.", "erro");
        })
        .always(function () {
          $botao.prop("disabled", false);
        });
    },

    montarLinhasHorarioFormulario: function () {
      var self = this;

      $.each(nomesDias, function (indice, nomeDia) {
        var $linha = self.clonarModelo("modeloLinhaHorarioFormulario");
        var idCheck = "checkHorario" + indice;
        var idAbertura = "campoHoraAbertura" + indice;
        var idFechamento = "campoHoraFechamento" + indice;

        $linha.attr("data-dia", indice);
        $linha.find('[data-campo="marcaDia"]').attr({ id: idCheck, name: "diaFuncionamento", value: indice });
        $linha.find('[data-campo="rotuloDia"]').attr("for", idCheck).text(nomeDia);
        $linha.find('[data-campo="rotuloAbertura"]').attr("for", idAbertura);
        $linha.find('[data-campo="horaAbertura"]').attr({ id: idAbertura, name: "horaAbertura" + indice });
        $linha.find('[data-campo="rotuloFechamento"]').attr("for", idFechamento);
        $linha.find('[data-campo="horaFechamento"]').attr({ id: idFechamento, name: "horaFechamento" + indice });

        self.elementos.$listaLinhasHorario.append($linha);
      });
    },

    preencherFormularioHorarios: function () {
      var self = this;
      var $linhas = this.elementos.$listaLinhasHorario.children(".linhaHorario");
      var haSalvos = false;

      $linhas.each(function () {
        var $linha = $(this);
        $linha.removeAttr("data-salvo");
        $linha.find('[data-campo="marcaDia"]').prop("checked", false).prop("disabled", false);
        $linha.find('input[type="time"]').val("").prop("disabled", true).removeClass("is-invalid");
      });
      $.each(this.estado.horarios, function (_, horario) {
        var $linha = $linhas.filter('[data-dia="' + Number(horario.hrser_dia) + '"]');

        haSalvos = true;
        $linha.attr("data-salvo", "1");
        $linha.find('[data-campo="marcaDia"]').prop("checked", true).prop("disabled", true);
        $linha.find('[data-campo="horaAbertura"]').val(self.formatarHora(horario.hrser_hrini)).prop("disabled", true);
        $linha.find('[data-campo="horaFechamento"]').val(self.formatarHora(horario.hrser_hrterm)).prop("disabled", true);
      });

      $('[data-campo="avisoHorariosSalvos"]').prop("hidden", !haSalvos);
      this.atualizarBotaoSalvarHorarios();
    },

    alternarDiaFuncionamento: function ($marca) {
      var $linha = $marca.closest(".linhaHorario");
      var marcado = $marca.is(":checked");

      $linha.find('input[type="time"]').prop("disabled", !marcado).removeClass("is-invalid");
      if (!marcado) {
        $linha.find('input[type="time"]').val("");
      }
      this.atualizarBotaoSalvarHorarios();
    },

    atualizarBotaoSalvarHorarios: function () {

      var haDiaNovo = this.elementos.$listaLinhasHorario.find('[data-campo="marcaDia"]:checked:not(:disabled)').length > 0;
      this.elementos.$botaoSalvarHorarios.prop("disabled", !haDiaNovo);
    },

    enviarHorarios: function () {
      var self = this;
      var novos = [];
      var haCampoVazio = false;

      this.elementos.$listaLinhasHorario.children(".linhaHorario").each(function () {
        var $linha = $(this);
        var $marca = $linha.find('[data-campo="marcaDia"]');

        if (!$marca.is(":checked") || $marca.prop("disabled")) {
          return;
        }
        var $abertura = $linha.find('[data-campo="horaAbertura"]');
        var $fechamento = $linha.find('[data-campo="horaFechamento"]');

        $abertura.toggleClass("is-invalid", !$abertura.val());
        $fechamento.toggleClass("is-invalid", !$fechamento.val());

        if (!$abertura.val() || !$fechamento.val()) {
          haCampoVazio = true;
          return;
        }
        novos.push({
          dia: Number($linha.attr("data-dia")),
          inicio: $abertura.val(),
          termino: $fechamento.val()
        });
      });

      if (haCampoVazio) {
        this.exibirAviso("Preencha a abertura e o fechamento dos dias selecionados.", "erro");
        this.focarPrimeiroInvalido(this.elementos.$formularioHorarios);
        return;
      }
      if (!this.contratoDisponivel("cadastrarHorarios")) {
        this.avisarIndisponivel();
        return;
      }
      if (!novos.length) {
        this.exibirAviso("Nenhum dia novo para salvar!", "atencao");
        return;
      }

      var $botao = this.elementos.$botaoSalvarHorarios.prop("disabled", true);

      var pedidos = $.map(novos, function (horario) {
        var resultado = $.Deferred();

        self.chamarContrato("cadastrarHorarios", horario)
          .done(function (resposta) {
            var sucesso;
            if (resposta && resposta.sucesso) {
              sucesso = true;
            } else {
              sucesso = false;
            }
            resultado.resolve(sucesso);
          })
          .fail(function () {
            resultado.resolve(false);
          });
        return resultado.promise();
      });

      $.when.apply($, pedidos).done(function () {
        var falhas = $.grep($.makeArray(arguments), function (ok) {
          return !ok;
        }).length;

        if (falhas === 0) {
          self.mostrarVisao("resumo");
        } else {
          self.exibirAviso("Não foi possível salvar todos os horários. Tente novamente.", "erro");
        }

        self.carregarPerfil();
      }).always(function () {
        self.atualizarBotaoSalvarHorarios();
      });
    },

    normalizarVinculo: function (item) {
      if (this.ehClinica()) {
        return {
          id: item.pro_id,
          titulo: item.pro_user || item.pro_nome || "",
          detalhes: false
        };
      }
      var cepFormatado;
      if (item.clin_cep) {
        cepFormatado = Utilitarios.formatarMascara("cep", item.clin_cep);
      } else {
        cepFormatado = "";
      }
      return {
        id: item.clin_id,
        titulo: item.clin_user || item.clin_nome || "",
        detalhes: true,
        cepBruto: item.clin_cep || "",
        cep: cepFormatado
      };
    },

    montarCardVinculo: function (item, modo) {
      var vinculo = this.normalizarVinculo(item);
      var config = this.configuracaoDoPapel();
      var $card = this.clonarModelo("modeloCardVinculo");

      $card.find('[data-campo="nomeVinculo"]').text(vinculo.titulo);
      $card.find('[data-campo="linkPerfilVinculo"]').attr("aria-label", "Ver perfil de " + vinculo.titulo);
      $card.find('[data-campo="iconePadraoVinculo"]').text(config.iconeVinculo);

      var tipoDoVinculo;
      if (this.ehClinica()) {
        tipoDoVinculo = "profissional";
      } else {
        tipoDoVinculo = "clinica";
      }
      $card.find('[data-campo="linkPerfilVinculo"]')
        .attr("href", "index.php?uri=perfil&tipo=" + tipoDoVinculo + "&id=" + encodeURIComponent(vinculo.id));

      if (vinculo.detalhes) {
        var textoEndereco;
        if (vinculo.cep) {
          textoEndereco = "Carregando...";
        } else {
          textoEndereco = "Não informado";
        }
        var $endereco = $card.find('[data-campo="enderecoVinculo"]').text(textoEndereco);
        $card.find('[data-campo="cepVinculo"]').text(vinculo.cep || "Não informado");
        $card.find('[data-campo="detalhesVinculo"]').removeAttr("hidden");

        var self = this;
        this.buscarEnderecoPorCep(vinculo.cepBruto)
          .done(function (dados) {
            $endereco.text(self.textoEndereco(dados) || "Não informado");
          })
          .fail(function () {
            $endereco.text("Não informado");
          });
      }

      $card.data("vinculo", { id: vinculo.id, titulo: vinculo.titulo });

      if (modo === "selecao") {
        $card.addClass("cardVinculo--selecionavel");
        $card.find('[data-acao="desvincular"]').remove();
        $card.find('[data-acao="selecionarVinculo"]').attr("aria-label", this.textos().rotuloSelecionar + " " + vinculo.titulo);
      } else {
        $card.find('[data-acao="selecionarVinculo"]').remove();
        if (this.ehVisitante()) {
          $card.find('[data-acao="desvincular"]').remove();
        } else {
          $card.find('[data-acao="desvincular"]').attr("aria-label", this.textos().rotuloDesvincular + " " + vinculo.titulo);
        }
      }

      return $card;
    },

    renderizarVinculos: function (itens) {
      var self = this;
      var nomeLista = this.configuracaoDoPapel().listaVinculos;
      var $lista = $('[data-lista="' + nomeLista + '"]').empty();

      $.each(itens, function (_, item) {
        $lista.append(self.montarCardVinculo(item, "lista"));
      });

      var hiddenLista;
      if (itens.length) {
        hiddenLista = null;
      } else {
        hiddenLista = "hidden";
      }
      $lista.attr("hidden", hiddenLista);
      var hiddenEstadoVazio;
      if (itens.length) {
        hiddenEstadoVazio = "hidden";
      } else {
        hiddenEstadoVazio = null;
      }
      $('[data-estadoVazio="' + nomeLista + '"]').attr("hidden", hiddenEstadoVazio);
    },

    prepararModalVinculo: function () {
      var t = this.textos();

      $('[data-campo="tituloVinculo"]').text(t.tituloVinculo);
      $('[data-campo="rotuloVinculo"]').text(t.rotuloVinculo);
      this.elementos.$campoUsuarioVinculo.attr("placeholder", t.placeholderVinculo);
      $('[data-campo="rotuloBotaoDesvincular"]').text(t.rotuloDesvincular);
    },

    abrirVinculo: function () {
      this.limparBuscaVinculo();
      Utilitarios.exibirModal(this.elementos.$modalVincular);
    },

    limparBuscaVinculo: function () {
      this.estado.vinculoBuscado = null;
      this.estado.vinculoSelecionado = null;
      this.elementos.$campoUsuarioVinculo.val("").removeClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.removeClass("d-block").text("");
      this.elementos.$resultadoVinculo.empty().attr("hidden", "hidden");
    },

    mostrarErroBusca: function (mensagem) {
      this.elementos.$campoUsuarioVinculo.addClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.text(mensagem).addClass("d-block");
    },

    buscarVinculo: function () {
      var self = this;
      var usuario = $.trim(this.elementos.$campoUsuarioVinculo.val());
      var tipoVinculo;
      if (this.ehClinica()) {
        tipoVinculo = "profissional";
      } else {
        tipoVinculo = "clinica";
      }

      this.elementos.$campoUsuarioVinculo.removeClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.removeClass("d-block");
      this.estado.vinculoSelecionado = null;
      this.elementos.$resultadoVinculo.empty().attr("hidden", "hidden");

      if (!usuario) {
        this.mostrarErroBusca(this.textos().buscaVazia);
        return;
      }
      if (!this.contratoDisponivel("buscarVinculo")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("buscarVinculo", { tipo: tipoVinculo, busca: usuario })
        .done(function (resposta) {
          var itens;
          if (resposta && resposta.sucesso && Array.isArray(resposta.dados)) {
            itens = resposta.dados;
          } else {
            itens = [];
          }

          if (!itens.length) {
            self.mostrarErroBusca(self.textos().naoEncontrado);
            return;
          }

          $.each(itens, function (_, item) {
            self.elementos.$resultadoVinculo.append(
              self.montarCardVinculo(item, "selecao").data("item", item)
            );
          });
          self.elementos.$resultadoVinculo.removeAttr("hidden");
        })
        .fail(function () {
          self.exibirAviso("Não foi possível buscar agora. Tente novamente.", "erro");
        });
    },

    alternarSelecaoVinculo: function ($card) {
      var jaSelecionado = $card.hasClass("cardEntidadeBase--selecionado");

      this.elementos.$resultadoVinculo.find(".cardVinculo--selecionavel").each(function () {
        $(this).removeClass("cardEntidadeBase--selecionado")
          .find('[data-acao="selecionarVinculo"]')
          .attr("aria-pressed", "false")
          .find(".material-symbols-outlined")
          .text("radio_button_unchecked");
      });

      if (jaSelecionado) {
        this.estado.vinculoSelecionado = null;
        return;
      }

      this.estado.vinculoSelecionado = $card.data("item");
      $card.addClass("cardEntidadeBase--selecionado")
        .find('[data-acao="selecionarVinculo"]')
        .attr("aria-pressed", "true")
        .find(".material-symbols-outlined")
        .text("check_circle");
    },

    enviarVinculo: function () {
      var selecionado = this.estado.vinculoSelecionado;
      var self = this;

      if (!selecionado) {
        this.exibirAviso(this.textos().selecioneAntes, "erro");
        return;
      }
      if (!this.contratoDisponivel("vincular")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("vincular", { idVinculo: this.normalizarVinculo(selecionado).id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            Utilitarios.esconderModal(self.elementos.$modalVincular);
            self.carregarVinculos();
          } else {
            self.exibirAviso("Não foi possível vincular. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível vincular. Tente novamente.", "erro");
        });
    },

    abrirModalDesvincular: function ($botao) {
      var vinculo = $botao.closest(".cardVinculo").data("vinculo");
      var t = this.textos();
      var $abertura = $('[data-campo="textoDesvinculoAbertura"]');

      this.estado.vinculoParaDesvincular = vinculo;
      $abertura.empty()
        .append(document.createTextNode(t.desvinculoAbertura))
        .append($("<strong>").text(vinculo.titulo))
        .append(document.createTextNode("!"));
      $('[data-campo="textoDesvinculoConsequencia"]').text(t.desvinculoConsequencia);

      Utilitarios.exibirModal(this.elementos.$modalDesvincular);
    },

    confirmarDesvinculo: function () {
      var self = this;

      if (!this.contratoDisponivel("desvincular")) {
        Utilitarios.esconderModal(this.elementos.$modalDesvincular);
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("desvincular", { idVinculo: this.estado.vinculoParaDesvincular.id })
        .done(function (resposta) {
          Utilitarios.esconderModal(self.elementos.$modalDesvincular);
          if (resposta && resposta.sucesso) {
            self.carregarVinculos();
          } else {
            self.exibirAviso("Não foi possível desvincular. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          Utilitarios.esconderModal(self.elementos.$modalDesvincular);
          self.exibirAviso("Não foi possível desvincular. Tente novamente.", "erro");
        });
    },

    registrarEventos: function () {
      var self = this;
      var e = this.elementos;

      $(document).on("click", "[data-visaoDestino]", function () {
        var destino = $(this).attr("data-visaoDestino");
        self.estado.origemFoco = this;
        self.prepararVisao(destino);
        self.mostrarVisao(destino);
      });

      $(document).on("click", '[data-acao="cancelarEdicao"]', function () {
        self.cancelarEdicao($(this));
      });

      $(document).on("click", '[data-acao="sair"]', function (evento) {
        evento.preventDefault();
        self.sair();
      });

      $("#botaoRealizarLoginSessao").on("click", function () {
        window.location.href = papeis[self.estado.papel || "profissional"].urlLogin;
      });

      e.$formularioBio.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarBio();
      });
      e.$formularioServico.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarServico();
      });
      e.$formularioLocalizacao.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarLocalizacao();
      });
      e.$formularioHorarios.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarHorarios();
      });
      e.$formularioVinculo.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarVinculo();
      });

      $(".formularioPerfil, #formularioVinculo").on("input change", ".is-invalid", function () {
        $(this).removeClass("is-invalid");
        e.$mensagemUsuarioVinculo.removeClass("d-block");
      });
      e.$campoTipoServico.on("opcaoSelecionada", function () {
        $(this).removeClass("campoSelect--erro");
      });

      e.$campoValorServico.on("input", function () {
        self.mascararValor($(this));
      });

      e.$listaLinhasHorario.on("change", '[data-campo="marcaDia"]', function () {
        self.alternarDiaFuncionamento($(this));
      });

      $(document).on("click", '[data-acao="abrirVinculo"]', function () {
        self.abrirVinculo();
      });
      $(document).on("click", '[data-acao="gerenciarVinculos"]', function () {
        self.exibirAviso("Gerenciar profissionais ainda não está disponível.", "atencao");
      });

      $("#botaoBuscarVinculo").on("click", function () {
        self.buscarVinculo();
      });
      e.$campoUsuarioVinculo.on("keydown", function (evento) {
        if (evento.key === "Enter") {
          evento.preventDefault();
          self.buscarVinculo();
        }
      });
      e.$modalVincular.on("hidden.bs.modal", function () {
        self.limparBuscaVinculo();
      });

      e.$resultadoVinculo.on("click", ".cardVinculo--selecionavel", function (evento) {
        if ($(evento.target).closest("a").length) {
          return;
        }
        self.alternarSelecaoVinculo($(this));
      });

      $(document).on("click", '[data-acao="desvincular"]', function () {
        self.abrirModalDesvincular($(this));
      });
      $("#botaoConfirmarDesvinculo").on("click", function () {
        self.confirmarDesvinculo();
      });
    }
  };

  $(function () {
    moduloPerfil.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
