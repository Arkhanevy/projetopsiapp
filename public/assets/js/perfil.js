(function ($, Utilitarios) {
  "use strict";

  const nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const localCasa = "Casa";
  const localDomiciliar = "domi";
  const prefixoLocalClinica = "clin";
  const placeholderSala = "Selecione o local de atendimento primeiro";

  const urlServico = "index.php?uri=servico";

  function extrairJson(texto) {
    const conteudo = String(texto || "");
    let inicio = conteudo.search(/\{\s*"(sucesso|logado)"/);

    if (inicio === -1) {
      inicio = conteudo.indexOf("{");
    }
    if (inicio > 0) {
      return conteudo.slice(inicio);
    }
    return conteudo;
  }

  const papeis = {

    profissional: {
      url: "index.php?uri=profissional",
      urlLogin: "index.php?uri=login",
      hrefAgenda: "index.php?uri=agendaProfissional",
      hrefInicio: "index.php?uri=inicioProfissional",
      listaVinculos: "clinicas",
      iconeVinculo: "apartment",
      textos: {
        rotuloDesvincular: "Desvincular clínica",
        desvinculoAbertura: "Você está prestes a desvincular a clínica ",
        desvinculoConsequencia: "Se continuar com isso, ela não aparecerá mais como uma clínica em que você trabalha. Dessa forma, os clientes não poderão agendar uma consulta com você nessa localização e suas futuras consultas não aparecerão no relatório dessa clínica."
      }
    },

    clinica: {
      url: "index.php?uri=clinica",
      urlLogin: "index.php?uri=login",
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
    }
  };

  papeis.cliente = {
    url: "index.php?uri=cliente",
    urlLogin: "index.php?uri=login",
    hrefAgenda: "index.php?uri=consultasCli",
    hrefInicio: "index.php",
    textos: {}
  };

  const tiposDePerfil = ["profissional", "clinica"];

  const moduloPerfil = {

    configuracao: {
      urlSair: "index.php?uri=limpar",
      urlInicio: "index.php",
      duracaoAviso: 4000,
      ocultarParametrosNaUrl: true,
      urlViaCep: "https://viacep.com.br/ws/",
      tempoLimiteViaCep: 8000,

      contratos: {

        verificarLogin:    { acao: "verificarLogin", disponivel: true },
        carregarPerfil:    { acao: { profissional: "PegarPerfil", clinica: "pegarinfo" }, disponivel: true },
        cadastrarServico:  { url: urlServico, acao: "cadastrar", disponivel: true },

        carregarPerfilPublico: { url: "index.php?uri=busca", acao: "mostrardetalhes", disponivel: true },

        cadastrarHorarios: { acao: { profissional: "atribuirHrServico", clinica: "atribuirHrServico" }, disponivel: true },

        buscarVinculo: { url: "index.php?uri=busca", acao: "busca", disponivel: true },

        editarBio: { acao: { profissional: "atualizar" }, disponivel: true },
        cadastrarLocalizacao: { url: "index.php?uri=localizacao", acao: "inserirloc", disponivel: true },
        editarLocalizacao: { url: "index.php?uri=localizacao", acao: "editarloc", disponivel: true },
        removerLocalizacao: { url: "index.php?uri=localizacao", acao: "removerloc", disponivel: true },
        listarVinculos:    { acao: "listarVinculos",     disponivel: true },
        listarServicosClinica: { url: "index.php?uri=clinica", acao: "pegarinfo", disponivel: false },
        listarLocalizacoes: { url: "index.php?uri=localizacao", acao: "pegarloc", disponivel: true },
        listarSalas: { url: "index.php?uri=localizacao", acao: "pegarSalas", disponivel: true },
        cadastrarSala: { url: "index.php?uri=localizacao", acao: "inserirsala", disponivel: true },
        editarSala: { url: "index.php?uri=localizacao", acao: "editarsala", disponivel: true },
        removerSala: { url: "index.php?uri=localizacao", acao: "removersala", disponivel: true },
        listarProfissionaisClinica: { url: "index.php?uri=busca", acao: "gerenciarPro", disponivel: true },

        vincular:          { acao: "vincular",           disponivel: true },
        desvincular:       { acao: "desvincular",        disponivel: true }
      }
    },

    estado: {
      papel: null,
      alvo: null,
      perfil: null,
      horarios: [],
      servicos: [],
      servicosClinica: [],
      vinculoBuscado: null,
      vinculoSelecionado: null,
      vinculoParaDesvincular: null,
      cacheEnderecos: {},
      localizacao: null,
      localizacoesPublicas: [],
      salasServico: [],
      nomesProfissionais: {},
      pedidoNomes: 0,
      vinculos: [],
      pedidoSalas: 0,
      salasPendentes: [],
      origemFoco: null
    },

    elementos: {},

    modulos: [],

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
      const e = this.elementos;
      e.$navsLogado = $(".navTopoLogado, .navLateralLogado, .navInferiorLogado");
      e.$modalSessaoExpirada = $("#modalSessaoExpirada");
      e.$modalVincular = $("#modalVincular");
      e.$modalDesvincular = $("#modalDesvincular");
      e.$modalVinculoEnviado = $("#modalVinculoEnviado");
      e.$aviso = $("#avisoPerfil");

      e.$formularioBio = $("#formularioBio");
      e.$formularioServico = $("#formularioServico");
      e.$formularioLocalizacao = $("#formularioLocalizacao");
      e.$formularioHorarios = $("#formularioHorarios");
      e.$formularioVinculo = $("#formularioVinculo");

      e.$campoBioNova = $("#campoBioNova");
      e.$campoTipoServico = $("#campoTipoServico");
      e.$campoValorServico = $("#campoValorServico");
      e.$campoLocalizacaoServico = $("#campoLocalizacaoServico");
      e.$campoSalaServico = $("#campoSalaServico");
      e.$campoProfissionaisServico = $("#campoProfissionaisServico");
      e.$listaLinhasHorario = $('[data-lista="linhasHorario"]');
      e.$botaoSalvarHorarios = $("#botaoSalvarHorarios");
      e.$botaoConfirmarVinculo = $('[data-campo="botaoConfirmarVinculo"]');
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

      e.$camposEnderecoExtra = {
        numero: $("#campoNumeroLocalizacao"),
        complemento: $("#campoComplementoLocalizacao")
      };
    },

    sincronizarAriaInvalid: function () {
      const observador = new MutationObserver(function (mudancas) {
        $.each(mudancas, function (_, mudanca) {
          const $elemento = $(mudanca.target);

          if ($elemento.is("input, textarea")) {
            let ariaInvalido;
            if ($elemento.hasClass("is-invalid")) {
              ariaInvalido = "true";
            } else {
              ariaInvalido = null;
            }
            $elemento.attr("aria-invalid", ariaInvalido);
          } else if ($elemento.is(".campoSelect")) {
            let ariaInvalidoGatilho;
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

    aplicarPerfilDeEm: function ($escopo) {
      const tipo = this.tipoPerfil();

      $escopo.filter("[data-perfilDe]").add($escopo.find("[data-perfilDe]")).each(function () {
        let atributoHidden;
        if ($(this).attr("data-perfilDe") === tipo) {
          atributoHidden = null;
        } else {
          atributoHidden = "hidden";
        }
        $(this).attr("hidden", atributoHidden);
      });
    },

    aplicarPapel: function () {
      this.aplicarPerfilDeEm($(document.body));

      if (this.ehVisitante()) {
        $("[data-somenteDono]").attr("hidden", "hidden");
      }
    },

    iniciarModulos: function () {
      const self = this;

      $.each(window.ElmoPerfilModulos || [], function (_, modulo) {
        $.extend(self.configuracao.contratos, modulo.contratos || {});
        self.modulos.push(modulo);
        modulo.iniciar(self);
      });
    },

    lerAlvoDaUrl: function () {
      const parametros = new URLSearchParams(window.location.search);
      const tipo = parametros.get("tipo");
      const id = parametros.get("id");
      let alvo = null;
      const urlLimpa = window.location.pathname + "?uri=perfil";

      if (parametros.get("meu")) {
        alvo = null;
      } else if ($.inArray(tipo, tiposDePerfil) !== -1 && /^[0-9]+$/.test(id || "")) {
        alvo = { tipo: tipo, id: id };
      } else if (window.history.state && window.history.state.perfilVisitado) {
        const guardado = window.history.state.perfilVisitado;
        if ($.inArray(guardado.tipo, tiposDePerfil) !== -1 && /^[0-9]+$/.test(String(guardado.id))) {
          alvo = guardado;
        }
      }

      const haParametros = parametros.has("tipo") || parametros.has("id") || parametros.has("meu");
      if (this.configuracao.ocultarParametrosNaUrl && haParametros) {
        try {
          let estadoHistorico;
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
      const contrato = this.configuracao.contratos[nome];

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
      const contrato = this.configuracao.contratos[nome];
      papel = papel || this.tipoPerfil();
      let acao;
      if (typeof contrato.acao === "object") {
        acao = contrato.acao[papel];
      } else {
        acao = contrato.acao;
      }

      const opcoes = {
        url: contrato.url || papeis[papel].url,
        method: "POST",
        dataType: tipoResposta || "json"
      };

      if (opcoes.dataType === "json") {
        opcoes.dataFilter = extrairJson;
      }

      if (typeof FormData !== "undefined" && dados instanceof FormData) {
        dados.append("acao", acao);
        opcoes.data = dados;
        opcoes.processData = false;
        opcoes.contentType = false;
      } else {
        opcoes.data = $.extend({ acao: acao }, dados || {});
      }

      return $.ajax(opcoes);
    },

    avisarIndisponivel: function () {
      this.exibirAviso("Essa ação ainda não está disponível no servidor.", "atencao");
    },

    verificarLogin: function () {
      const self = this;
      const ordem = ["profissional", "clinica", "cliente"];

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
      this.exibirModalSessaoExpirada();
    },

    aplicarLinkOuRemoverItem: function ($item, href) {
      if (href) {
        $item.attr("href", href);
      } else {
        $item.remove();
      }
    },

    configurarNavegacaoLogado: function () {
      const papel = this.estado.papel;
      const config = papeis[papel];
      const $navs = this.elementos.$navsLogado;

      if (papel === "cliente") {

        $navs.filter("[data-papel]").attr("data-papel", "cliente").each(function () {
          if (typeof aplicarPapelNavegacao === "function") {
            aplicarPapelNavegacao($(this));
          }
        });
      }
      this.aplicarLinkOuRemoverItem($("[data-itemPapel]"), config.hrefInicio);
      this.aplicarLinkOuRemoverItem($("[data-itemAgenda]"), config.hrefAgenda);

      if (papel === "cliente") {
        $navs.find("[data-itemPerfil]").closest(".navLateralLogado_rodape").remove();
        $navs.find("[data-itemPerfil]").remove();
      }

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
        this.iniciarModulos();
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
      const self = this;
      $.ajax({ url: this.configuracao.urlSair, method: "POST" }).always(function () {
        window.location.href = self.configuracao.urlInicio;
      });
    },

    carregarPerfil: function () {
      const self = this;
      const visitante = this.ehVisitante();
      let contrato;
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

      let dadosPerfil;
      if (visitante) {
        dadosPerfil = { tipo: this.estado.alvo.tipo, id: this.estado.alvo.id, completo: 1 };
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
            self.estado.horarios = $.isArray(resposta.horarios) ? resposta.horarios : [];
            self.estado.localizacoesPublicas = $.isArray(resposta.localizacoes) ? resposta.localizacoes : [];
            const servicosPublicos = $.isArray(resposta.servicos) ? resposta.servicos : [];
            if (self.ehClinica()) {
              self.estado.servicos = [];
              self.estado.servicosClinica = servicosPublicos;
            } else {
              self.estado.servicos = servicosPublicos;
              self.estado.servicosClinica = [];
            }
          } else {

            self.estado.perfil = (resposta.dados1 && resposta.dados1[0]) || {};
            if (self.ehClinica()) {
              self.estado.horarios = resposta.dados3 || [];
              self.estado.servicos = [];
              self.estado.servicosClinica = resposta.dados2 || [];
            } else {
              self.estado.horarios = resposta.dados2 || [];
              self.estado.servicos = resposta.dados3 || [];
            }
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
      const self = this;

      if (!this.contratoDisponivel("listarVinculos")) {
        this.renderizarVinculos([]);
        return;
      }

      let dadosVinculos;
      if (this.ehVisitante()) {
        dadosVinculos = { idPerfil: this.estado.alvo.id };
      } else {
        dadosVinculos = null;
      }
      this.chamarContrato("listarVinculos", dadosVinculos)
        .done(function (resposta) {
          let vinculos;
          if (resposta && resposta.sucesso) {
            vinculos = resposta.dados;
          } else {
            vinculos = [];
          }
          if (!self.ehVisitante()) {
            self.estado.vinculos = vinculos;
            self.renderizarLocaisServico();
          }
          self.renderizarVinculos(vinculos);
        })
        .fail(function () {
          self.renderizarVinculos([]);
        });
    },

    usuarioDoPerfil: function () {
      const p = this.estado.perfil || {};

      if (this.ehClinica()) {
        return p.clin_user || p.clin_nome || "";
      } else {
        return p.pro_user || p.pro_nome || "";
      }
    },

    bioDoPerfil: function () {
      const p = this.estado.perfil || {};
      let biografia;
      if (this.ehClinica()) {
        biografia = p.clin_bio;
      } else {
        biografia = p.pro_bio;
      }
      return biografia || "";
    },

    definirBioDoPerfil: function (bio) {
      let campoBio;
      if (this.ehClinica()) {
        campoBio = "clin_bio";
      } else {
        campoBio = "pro_bio";
      }
      this.estado.perfil[campoBio] = bio;
    },

    renderizarPerfil: function () {
      $('[data-campo="usuario"]').text(this.usuarioDoPerfil());
      this.renderizarFoto();
      this.renderizarBio();

      if (!this.ehVisitante() || this.ehClinica()) {
        this.carregarLocalizacao();
      }

      if (this.ehClinica()) {
        this.renderizarServicosClinica();
      } else {
        this.renderizarServicos();
      }
      this.renderizarHorarios();
      this.preencherFormularioHorarios();

      if (this.ehVisitante()) {
        $('[data-estadoVazio="horarios"] .estadoVazio_texto').text("Informação ainda não disponível");
      }
      if (this.ehClinica()) {
        $('[data-estadoVazio="servicos"] .estadoVazio_texto').text("Informação ainda não disponível");
      }
    },

    fotoDoPerfil: function () {
      const p = this.estado.perfil || {};

      if (this.ehClinica()) {
        return p.clin_foto || "";
      }
      return p.pro_foto || "";
    },

    renderizarFoto: function () {
      const foto = this.fotoDoPerfil();
      const $foto = $('[data-campo="foto"]');
      const $iconePadrao = $(".cabecalhoPerfil_iconePadrao");

      if (typeof foto === "string" && foto.indexOf("data:image/") === 0) {
        $foto.attr("src", foto).removeAttr("hidden");
        $iconePadrao.attr("hidden", "hidden");
        return;
      }

      $foto.attr("hidden", "hidden").removeAttr("src");
      $iconePadrao.removeAttr("hidden");
    },

    renderizarBio: function () {
      $('[data-campo="bio"]').text(this.bioDoPerfil());
    },

    renderizarServicos: function () {
      const self = this;
      const $corpo = $('[data-lista="servicos"]').empty();
      const servicos = this.estado.servicos;

      $.each(servicos, function (_, servico) {
        const $linha = self.clonarModelo("modeloLinhaServico");
        const $dias = $linha.find('[data-campo="diasServico"]');

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

    carregarServicosClinica: function () {
      const self = this;

      if (!this.contratoDisponivel("listarServicosClinica")) {
        this.estado.servicosClinica = [];
        this.renderizarServicosClinica();
        $('[data-campo="textoServicosClinicaVazio"]').text("Informação ainda não disponível");
        return;
      }

      let dadosServicos;
      if (this.ehVisitante()) {
        dadosServicos = { idPerfil: this.estado.alvo.id };
      } else {
        dadosServicos = null;
      }
      this.chamarContrato("listarServicosClinica", dadosServicos)
        .done(function (resposta) {
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            self.estado.servicosClinica = resposta.dados;
          } else {
            self.estado.servicosClinica = [];
            self.exibirAviso("Não foi possível carregar os serviços da clínica.", "erro");
          }
          self.renderizarServicosClinica();
        })
        .fail(function () {
          self.estado.servicosClinica = [];
          self.renderizarServicosClinica();
          self.exibirAviso("Não foi possível carregar os serviços da clínica.", "erro");
        });
    },

    resolverNomesProfissionais: function (servicos) {
      const self = this;
      const nomes = this.estado.nomesProfissionais;
      const resultado = $.Deferred();
      const ids = [];

      $.each(servicos, function (_, servico) {
        const id = servico.ser_pro;

        if (id && !servico.pro_nome && !nomes[String(id)] && $.inArray(String(id), ids) === -1) {
          ids.push(String(id));
        }
      });

      if (!ids.length) {
        return resultado.resolve().promise();
      }

      function buscarRestantes() {
        const faltando = $.grep(ids, function (id) {
          return !nomes[id];
        });
        const pedidos = $.map(faltando, function (id) {
          const um = $.Deferred();

          self.chamarContrato("carregarPerfilPublico", { tipo: "profissional", id: id })
            .done(function (resposta) {
              let profissional = null;

              if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
                profissional = resposta.dados[0];
              }
              if (profissional && profissional.pro_nome) {
                nomes[id] = profissional.pro_nome;
              }
            })
            .always(function () {
              um.resolve();
            });
          return um.promise();
        });

        $.when.apply($, pedidos).always(function () {
          resultado.resolve();
        });
      }

      if (!this.ehVisitante() && this.contratoDisponivel("listarProfissionaisClinica")) {
        this.chamarContrato("listarProfissionaisClinica", { tipo: "profissional" })
          .done(function (resposta) {
            if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
              $.each(resposta.dados, function (_, profissional) {
                if (profissional.pro_id && profissional.pro_nome) {
                  nomes[String(profissional.pro_id)] = profissional.pro_nome;
                }
              });
            }
          })
          .always(buscarRestantes);
      } else {
        buscarRestantes();
      }

      return resultado.promise();
    },

    renderizarServicosClinica: function () {
      const self = this;
      const numeroPedido = ++this.estado.pedidoNomes;

      this.resolverNomesProfissionais(this.estado.servicosClinica).always(function () {
        if (numeroPedido === self.estado.pedidoNomes) {
          self.desenharServicosClinica();
        }
      });
    },

    desenharServicosClinica: function () {
      const self = this;
      const $corpo = $('[data-lista="servicosClinica"]').empty();
      const servicos = this.estado.servicosClinica;

      $.each(servicos, function (_, servico) {
        const $linha = self.clonarModelo("modeloLinhaServicoClinica");
        const $dias = $linha.find('[data-campo="diasServico"]');

        $linha.find('[data-campo="nomeServico"]').text(servico.ser_nome);
        $linha.find('[data-campo="profissionalServico"]').text(
          servico.pro_nome || self.estado.nomesProfissionais[String(servico.ser_pro)] || "—"
        );
        $linha.find('[data-campo="valorServico"]').text(self.formatarMoeda(servico.ser_val));
        $linha.find('[data-campo="duracaoServico"]').text(servico.ser_dur + " min");

        $.each(self.separarDias(servico.ser_dia), function (_, indice) {
          $dias.append($("<div>").text(nomesDias[indice]));
        });

        $corpo.append($linha);
      });

      this.alternarListaOuVazio("servicosClinica", servicos.length > 0);
    },

    renderizarHorarios: function () {
      const self = this;
      const $corpo = $('[data-lista="horarios"]').empty();
      const horarios = this.estado.horarios.slice().sort(function (a, b) {
        return self.diaDoBackend(a.hrser_dia) - self.diaDoBackend(b.hrser_dia);
      });

      $.each(horarios, function (_, horario) {
        const $linha = self.clonarModelo("modeloLinhaHorario");
        $linha.find('[data-campo="diaSemana"]').text(nomesDias[self.diaDoBackend(horario.hrser_dia)]);
        $linha.find('[data-campo="horaAbertura"]').text(self.formatarHora(horario.hrser_hrini));
        $linha.find('[data-campo="horaFechamento"]').text(self.formatarHora(horario.hrser_hrterm));
        $corpo.append($linha);
      });

      this.alternarListaOuVazio("horarios", horarios.length > 0);
    },

    buscarEnderecoPorCep: function (cep) {
      const cepNumerico = Utilitarios.apenasNumeros(cep || "");
      const cache = this.estado.cacheEnderecos;
      const resultado = $.Deferred();

      if (!/^[0-9]{8}$/.test(cepNumerico)) {
        return resultado.reject().promise();
      }
      if (cache[cepNumerico]) {
        return resultado.resolve(cache[cepNumerico]).promise();
      }

      $.ajax({
        url: this.configuracao.urlViaCep + cepNumerico + "/json/",
        dataType: "jsonp",
        timeout: this.configuracao.tempoLimiteViaCep
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

    textoEndereco: function (dadosViaCep, numero, complemento) {
      const cidadeUf = [dadosViaCep.localidade, dadosViaCep.uf].filter(Boolean).join(" - ");
      return [dadosViaCep.logradouro, numero, complemento, dadosViaCep.bairro, cidadeUf].filter(Boolean).join(", ");
    },

    atualizarLinkMaps: function (cepFormatado, endereco) {
      let prefixoEndereco;
      if (endereco) {
        prefixoEndereco = endereco + " ";
      } else {
        prefixoEndereco = "";
      }
      const consulta = $.trim(prefixoEndereco + cepFormatado);
      const $maps = $("#botaoAbrirMaps");

      if (consulta) {
        $maps.attr("href", "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta)).removeAttr("hidden");
      } else {
        $maps.attr("hidden", "hidden");
      }
    },

    tipoLocalDoPerfil: function () {
      if (this.ehClinica()) {
        return "clin";
      }
      return "casa";
    },

    carregarLocalizacao: function () {
      const self = this;
      const tipoLocal = this.tipoLocalDoPerfil();
      const dados = {};

      if (this.ehClinica() && !this.ehVisitante() && this.estado.perfil && this.estado.perfil.clin_id) {
        dados.clinica = this.estado.perfil.clin_id;
      }

      this.estado.localizacao = null;

      if (this.ehVisitante()) {
        $.each(this.estado.localizacoesPublicas || [], function (_, local) {
          if (local.loc_tipo === tipoLocal) {
            self.estado.localizacao = local;
            return false;
          }
        });
        this.renderizarLocalizacao();
        return;
      }
      if (!this.contratoDisponivel("listarLocalizacoes")) {
        this.renderizarLocalizacao();
        return;
      }

      this.chamarContrato("listarLocalizacoes", dados)
        .done(function (resposta) {
          const lista = (resposta && resposta.sucesso && resposta.dados) || [];
          self.estado.localizacao = null;
          $.each(lista, function (_, local) {
            if (local.loc_tipo === tipoLocal) {
              self.estado.localizacao = local;
              return false;
            }
          });
          self.renderizarLocalizacao();
          self.carregarSalas();
        })
        .fail(function () {
          self.renderizarLocalizacao();
        });
    },

    carregarSalas: function () {
      const self = this;
      const local = this.estado.localizacao;
      if (this.ehVisitante()) {
        return;
      }
      if (!local || !this.contratoDisponivel("listarSalas")) {
        this.renderizarSalas([]);
        return;
      }
      this.chamarContrato("listarSalas", { loc: local.loc_id })
        .done(function (resposta) {
          self.renderizarSalas((resposta && resposta.sucesso && resposta.dados) || []);
        })
        .fail(function () {
          self.renderizarSalas([]);
        });
    },

    renderizarSalas: function (salas) {
      const $lista = $('[data-lista="salas"]');
      const $vazio = $('[data-estadoVazio="salas"]');
      this.estado.salas = salas;
      $("#secaoSalas").prop("hidden", !this.estado.localizacao);
      $lista.empty();
      $.each(salas, function (_, sala) {
        $("<li>").addClass("secaoPerfil_texto").text(sala.sala_nome || "Sala " + sala.sala_id).appendTo($lista);
      });
      $lista.prop("hidden", !salas.length);
      $vazio.prop("hidden", !!salas.length);
      this.renderizarEditorSalas();
    },

    renderizarEditorSalas: function () {
      const $editor = $("#editorSalas");
      const $lista = $editor.find('[data-lista="editorSalas"]');
      const salas = this.estado.salas || [];
      const pendentes = this.estado.salasPendentes || [];
      const temLocal = !!this.estado.localizacao;

      $lista.empty();
      $editor.find('[data-campo="avisoSalasSemLocal"]').prop("hidden", temLocal);
      $editor.find('[data-campo="avisoSalasVazio"]').prop("hidden", temLocal ? !!salas.length : !!pendentes.length);
      $editor.find('[data-campo="novaSalaGrupo"]').prop("hidden", false);

      if (!temLocal) {
        $.each(pendentes, function (indice, nome) {
          const $linha = $("<li>").addClass("d-flex align-items-center gap-2 mb-2").attr("data-sala-pendente", indice);
          const $campo = $("<input>").attr({ type: "text", readonly: true, "aria-label": "Nome da sala" }).addClass("form-control").val(nome);
          const $remover = $("<button>").attr({ type: "button", "data-acao": "removerSalaPendente", "aria-label": "Remover sala " + nome }).addClass("btn secaoPerfil_acao")
            .append($("<span>").addClass("material-symbols-outlined").attr("aria-hidden", "true").text("delete"));
          $linha.append($campo, $remover).appendTo($lista);
        });
        return;
      }

      $.each(salas, function (_, sala) {
        const nome = sala.sala_nome || "";
        const $linha = $("<li>").addClass("d-flex align-items-center gap-2 mb-2").attr("data-sala-id", sala.sala_id).attr("data-nome-original", nome);
        const $campo = $("<input>").attr({ type: "text", maxlength: 50, "aria-label": "Nome da sala" }).addClass("form-control").val(nome);
        const $salvar = $("<button>").attr({ type: "button", "data-acao": "salvarSala", "aria-label": "Salvar nome da sala" }).addClass("btn secaoPerfil_acao")
          .append($("<span>").addClass("material-symbols-outlined").attr("aria-hidden", "true").text("check_circle"));
        const $excluir = $("<button>").attr({ type: "button", "data-acao": "excluirSala", "aria-label": "Excluir sala" }).addClass("btn secaoPerfil_acao")
          .append($("<span>").addClass("material-symbols-outlined").attr("aria-hidden", "true").text("delete"));
        $linha.append($campo, $salvar, $excluir).appendTo($lista);
      });
    },

    adicionarSala: function () {
      const self = this;
      const $campo = $("#campoNovaSala");
      const nome = $.trim($campo.val());
      const local = this.estado.localizacao;

      $campo.removeClass("is-invalid");
      if (!nome) {
        $campo.addClass("is-invalid").trigger("focus");
        this.exibirAviso("Informe o nome da sala.", "erro");
        return;
      }
      if (!local) {
        const jaAdicionada = $.grep(this.estado.salasPendentes, function (existente) {
          return existente.toLowerCase() === nome.toLowerCase();
        }).length;

        if (jaAdicionada) {
          $campo.addClass("is-invalid").trigger("focus");
          this.exibirAviso("Essa sala já foi adicionada.", "atencao");
          return;
        }
        this.estado.salasPendentes.push(nome);
        $campo.val("").trigger("focus");
        this.renderizarEditorSalas();
        return;
      }
      if (!this.contratoDisponivel("cadastrarSala")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("cadastrarSala", { loc: local.loc_id, nome: nome })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            $campo.val("");
            self.carregarSalas();
          } else {
            self.exibirAviso((resposta && resposta.mensagem) || "Não foi possível salvar a sala. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível salvar a sala. Tente novamente.", "erro");
        });
    },

    removerSalaPendente: function ($linha) {
      this.estado.salasPendentes.splice(Number($linha.attr("data-sala-pendente")), 1);
      this.renderizarEditorSalas();
    },

    editarSala: function ($linha) {
      const self = this;
      const $campo = $linha.find("input");
      const nome = $.trim($campo.val());

      $campo.removeClass("is-invalid");
      if (!nome) {
        $campo.addClass("is-invalid").trigger("focus");
        this.exibirAviso("Informe o nome da sala.", "erro");
        return;
      }
      if (nome === $linha.attr("data-nome-original")) {
        this.exibirAviso("Nenhuma alteração foi feita!", "atencao");
        return;
      }
      if (!this.contratoDisponivel("editarSala")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("editarSala", { sala: $linha.attr("data-sala-id"), nome: nome })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.carregarSalas();
          } else {
            self.exibirAviso((resposta && resposta.mensagem) || "Não foi possível editar a sala. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível editar a sala. Tente novamente.", "erro");
        });
    },

    excluirSala: function ($linha) {
      const self = this;
      const nome = $linha.attr("data-nome-original") || "esta sala";

      if (!window.confirm("Excluir a sala \u201c" + nome + "\u201d?")) {
        return;
      }
      if (!this.contratoDisponivel("removerSala")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("removerSala", { sala: $linha.attr("data-sala-id") })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.carregarSalas();
          } else {
            self.exibirAviso((resposta && resposta.mensagem) || "Não foi possível excluir a sala. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível excluir a sala. Tente novamente.", "erro");
        });
    },

    renderizarLocalizacao: function () {
      const self = this;
      const local = this.estado.localizacao;
      const clinica = this.ehClinica();
      const nomeCampoCep = clinica ? "cepClinica" : "cepCasa";
      const nomeCampoEndereco = clinica ? "enderecoClinica" : "enderecoCasa";
      const cepBruto = local ? local.loc_cep : "";
      const cep = cepBruto ? Utilitarios.formatarMascara("cep", cepBruto) : "";
      const $endereco = $('[data-campo="' + nomeCampoEndereco + '"]');

      if (!clinica) {
        $("#alternarAtendeCasa").prop("checked", !!local);
        $("#detalhesCasa").prop("hidden", !local);
      } else {
        this.atualizarLinkMaps(cep, "");
      }

      $('[data-campo="' + nomeCampoCep + '"]').text(cep || "Não informado");

      if (!cep) {
        $endereco.text("Não informado");
        return;
      }

      $endereco.text("Carregando...");
      this.buscarEnderecoPorCep(cepBruto)
        .done(function (dados) {
          if (self.estado.localizacao !== local) {
            return;
          }
          const endereco = self.textoEndereco(dados, local.loc_num, local.loc_compl);
          $endereco.text(endereco || "Não informado");
          if (clinica) {
            self.atualizarLinkMaps(cep, endereco);
          }
        })
        .fail(function () {
          $endereco.text("Não foi possível carregar o endereço.");
        });
    },

    alternarAtendeCasa: function (ligado) {
      const self = this;
      const local = this.estado.localizacao;

      if (ligado) {
        $("#alternarAtendeCasa").prop("checked", false);
        this.estado.origemFoco = document.getElementById("alternarAtendeCasa");
        this.prepararVisao("edicaoLocalizacao");
        this.mostrarVisao("edicaoLocalizacao");
        return;
      }
      if (!local) {
        return;
      }
      if (!window.confirm("Desativar o atendimento na sua residência? O endereço cadastrado será removido.")) {
        $("#alternarAtendeCasa").prop("checked", true);
        return;
      }
      if (!this.contratoDisponivel("removerLocalizacao")) {
        this.avisarIndisponivel();
        $("#alternarAtendeCasa").prop("checked", true);
        return;
      }

      this.chamarContrato("removerLocalizacao", { loc: local.loc_id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.estado.localizacao = null;
            self.renderizarLocalizacao();
          } else {
            self.exibirAviso((resposta && resposta.mensagem) || "Não foi possível desativar. Tente novamente.", "erro");
            $("#alternarAtendeCasa").prop("checked", true);
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível desativar. Tente novamente.", "erro");
          $("#alternarAtendeCasa").prop("checked", true);
        });
    },

    alternarListaOuVazio: function (nome, temItens) {
      let hiddenTabela;
      if (temItens) {
        hiddenTabela = null;
      } else {
        hiddenTabela = "hidden";
      }
      $('[data-tabela="' + nome + '"]').attr("hidden", hiddenTabela);
      let hiddenEstadoVazio;
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
      const centavos = Utilitarios.apenasNumeros($campo.val());
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
      const centavos = Utilitarios.apenasNumeros($campo.val());
      if (centavos) {
        return (Number(centavos) / 100).toFixed(2);
      } else {
        return "";
      }
    },

    diaParaBackend: function (indice) {
      return String(Number(indice));
    },

    diaDoBackend: function (valor) {
      const texto = $.trim(String(valor));
      if (/^[0-6]$/.test(texto)) {
        return Number(texto);
      }
      return -1;
    },

    combinarDias: function (indices) {
      const self = this;
      const ordenados = indices.slice().sort(function (a, b) {
        return Number(a) - Number(b);
      });
      return $.map(ordenados, function (indice) {
        return self.diaParaBackend(indice);
      }).join("");
    },

    separarDias: function (valorCombinado) {
      const self = this;
      const indices = [];
      const partes = $.isArray(valorCombinado) ? valorCombinado : String(valorCombinado === null || valorCombinado === undefined ? "" : valorCombinado).split("");

      $.each(partes, function (_, parte) {
        const indice = self.diaDoBackend(parte);
        if (indice >= 0 && indices.indexOf(indice) === -1) {
          indices.push(indice);
        }
      });
      return indices.sort(function (a, b) {
        return a - b;
      });
    },

    exibirAviso: function (mensagem, tipo) {
      const $aviso = this.elementos.$aviso;
      let icone;
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
      const $alvo = $('.visaoPerfil[data-visao="' + nomeVisao + '"]');
      const origem = this.estado.origemFoco;

      $alvo.siblings(".visaoPerfil").attr("hidden", "hidden");
      $alvo.removeAttr("hidden");
      window.scrollTo(0, 0);

      const $titulo = $alvo.find(".formularioPerfil_titulo").first();
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
        this.renderizarEditorSalas();
      }
      if (nomeVisao === "cadastroHorarios") {
        this.preencherFormularioHorarios();
      }
      if ($('.visaoPerfil[data-visao="' + nomeVisao + '"]').find("#formularioServico").length) {
        this.renderizarLocaisServico();
      }

      $.each(this.modulos, function (_, modulo) {
        if (modulo.aoPrepararVisao) {
          modulo.aoPrepararVisao(nomeVisao);
        }
      });
    },

    cancelarEdicao: function ($botao) {
      const $formulario = $botao.closest("form");
      const $visaoResumo = $botao.closest(".tab-pane").children(".visaoPerfil").first();

      this.limparFormulario($formulario);
      this.mostrarVisao($visaoResumo.attr("data-visao"));
    },

    limparFormulario: function ($formulario) {
      $formulario.get(0).reset();
      $formulario.find(".is-invalid").removeClass("is-invalid");
      $formulario.find(".campoSelect--erro").removeClass("campoSelect--erro");
      $formulario.find(".campoSelect:not(.campoSelect--multiplo)").each(function () {
        $(this).attr("data-valorSelecionado", "");
        $(this).find(".campoSelect_valor").text($(this).attr("data-placeholder") || "Selecione um tipo de serviço");
      });
      $("#avisosLocalizacao").empty();

      if ($formulario.is(this.elementos.$formularioLocalizacao)) {
        this.estado.salasPendentes = [];
        $("#campoNovaSala").val("");
        this.renderizarEditorSalas();
      }

      if ($formulario.is(this.elementos.$formularioHorarios)) {
        this.preencherFormularioHorarios();
      }
      if ($formulario.is(this.elementos.$formularioServico)) {
        this.estado.pedidoSalas++;
        this.renderizarSalasServico([], placeholderSala);
        this.atualizarTextoProfissionaisServico();
      }
    },

    enviarBio: function () {
      const $campo = this.elementos.$campoBioNova;
      const bio = $.trim($campo.val());

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

      const self = this;
      this.chamarContrato("editarBio", { atualizacao: ["biografia"], valores: [bio] })
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
      const local = this.estado.localizacao;
      const c = this.elementos.$camposLocalizacao;
      const extra = this.elementos.$camposEnderecoExtra;

      $("#avisosLocalizacao").empty();
      $.each(c, function (_, $campo) {
        $campo.removeClass("is-invalid").val("");
      });
      extra.numero.removeClass("is-invalid").val(local ? local.loc_num : "");
      extra.complemento.removeClass("is-invalid").val(local ? (local.loc_compl || "") : "");

      if (!local) {
        return;
      }
      c.cep.val(Utilitarios.formatarMascara("cep", local.loc_cep));
      this.buscarEnderecoPorCep(local.loc_cep).done(function (dados) {
        c.rua.val(dados.logradouro || "");
        c.bairro.val(dados.bairro || "");
        c.cidade.val(dados.localidade || "");
        c.uf.val(dados.uf || "");
        c.ibge.val(dados.ibge || "");
      });
    },

    enviarLocalizacao: function () {
      const self = this;
      const c = this.elementos.$camposLocalizacao;
      const extra = this.elementos.$camposEnderecoExtra;
      const local = this.estado.localizacao;
      const $avisos = $("#avisosLocalizacao");
      const cep = Utilitarios.apenasNumeros(c.cep.val());
      const numero = $.trim(extra.numero.val());
      const complemento = $.trim(extra.complemento.val());

      extra.numero.removeClass("is-invalid");
      const vazios = [];
      $.each(c, function (_, $campo) {
        $campo.removeClass("is-invalid");
        const valor = $.trim($campo.val());
        if (!valor || valor === "...") {
          vazios.push($campo);
        }
      });

      if (!/^[0-9]{8}$/.test(cep)) {
        Utilitarios.marcarCamposComErro($avisos, [c.cep], "CEP inválido!");
        c.cep.trigger("focus");
        return;
      }
      if (!numero) {
        vazios.push(extra.numero);
      }
      if (vazios.length) {
        $.each(vazios, function (_, $campo) {
          $campo.addClass("is-invalid");
        });
        this.exibirAviso("Você precisa preencher todos os campos!", "erro");
        this.focarPrimeiroInvalido(this.elementos.$formularioLocalizacao);
        return;
      }
      if (local && cep === local.loc_cep && numero === local.loc_num && complemento === (local.loc_compl || "")) {
        this.exibirAviso("Nenhuma alteração foi feita!", "atencao");
        return;
      }

      let contrato;
      let dados;
      if (local) {
        contrato = "editarLocalizacao";
        dados = { atualizacao: ["CEP", "numero", "compl"], valores: [local.loc_id, cep, numero, complemento] };
      } else {
        contrato = "cadastrarLocalizacao";
        dados = {
          nome: this.ehClinica() ? ((this.estado.perfil || {}).clin_nome || "Sede") : "Residência",
          tipo: this.tipoLocalDoPerfil(),
          cep: cep,
          numero: numero,
          complemento: complemento
        };

        const salasNovas = this.estado.salasPendentes.slice();
        const digitada = $.trim($("#campoNovaSala").val());
        const jaNaLista = $.grep(salasNovas, function (existente) {
          return existente.toLowerCase() === digitada.toLowerCase();
        }).length;

        if (digitada && !jaNaLista) {
          salasNovas.push(digitada);
        }
        if (salasNovas.length) {
          dados.salas = salasNovas;
        }
      }
      if (!this.contratoDisponivel(contrato)) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato(contrato, dados)
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.limparFormulario(self.elementos.$formularioLocalizacao);
            self.mostrarVisao("resumo");
            self.carregarLocalizacao();
          } else {
            self.exibirAviso((resposta && resposta.mensagem) || "Não foi possível salvar a localização. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível salvar a localização. Tente novamente.", "erro");
        });
    },

    ehLocalClinica: function (valor) {
      return String(valor || "").indexOf(prefixoLocalClinica) === 0;
    },

    renderizarLocaisServico: function () {
      const self = this;
      const $campo = this.elementos.$campoLocalizacaoServico;
      const $lista = $campo.find(".campoSelect_lista");
      const clinicas = this.estado.vinculos || [];

      if (!$campo.length) {
        return;
      }

      $lista.find("[data-localClinica]").remove();

      if (this.ehClinica()) {
        $lista.find('[data-valor="' + localCasa + '"], [data-valor="' + localDomiciliar + '"]').closest("li").prop("hidden", true);
        this.renderizarProfissionaisServico();
        this.renderizarSedeServico();
        return;
      }

      $lista.find('[data-valor="' + localCasa + '"]').closest("li").prop("hidden", !this.estado.localizacao);

      if (clinicas.length) {
        $lista.append($("<li>").attr("data-localClinica", "").append($("<hr>").addClass("dropdown-divider")));
        $lista.append($("<li>").attr("data-localClinica", "").append($("<h6>").addClass("dropdown-header").text("Clínicas")));

        $.each(clinicas, function (_, clinica) {
          const nome = clinica.clin_nome || clinica.clin_user || "Clínica " + clinica.clin_id;

          $lista.append(
            $("<li>").attr("data-localClinica", "").append(
              $("<a>")
                .addClass("dropdown-item campoSelect_opcao")
                .attr({ href: "#", "data-valor": prefixoLocalClinica + clinica.clin_id })
                .text(nome)
            )
          );
        });
      }
    },

    renderizarSedeServico: function () {
      const $campo = this.elementos.$campoLocalizacaoServico;
      const $lista = $campo.find(".campoSelect_lista");
      const perfil = this.estado.perfil || {};
      const idClinica = perfil.clin_id;
      const nomeSede = perfil.clin_nome || perfil.clin_user || "Sede da clínica";
      let valorSede;

      if (!idClinica) {
        return;
      }
      valorSede = prefixoLocalClinica + idClinica;

      if (!$lista.find('[data-valor="' + valorSede + '"]').length) {
        $lista.append(
          $("<li>").attr("data-localClinica", "").append(
            $("<a>")
              .addClass("dropdown-item campoSelect_opcao")
              .attr({ href: "#", "data-valor": valorSede })
              .text(nomeSede)
          )
        );
      }

      if ($campo.attr("data-valorSelecionado") !== valorSede) {
        $campo.attr("data-valorSelecionado", valorSede);
        $campo.find(".campoSelect_valor").text(nomeSede);
        $campo.removeClass("campoSelect--erro");
        this.aoSelecionarLocalServico(valorSede);
      }
    },

    renderizarProfissionaisServico: function () {
      const $campo = this.elementos.$campoProfissionaisServico;
      const $lista = $campo.find(".campoSelect_lista");
      const $gatilho = $campo.find(".campoSelect_gatilho");
      const profissionais = this.estado.vinculos || [];
      const marcados = this.profissionaisSelecionados();

      if (!$campo.length) {
        return;
      }
      $lista.empty();

      if (!profissionais.length) {
        $gatilho.prop("disabled", true);
        $campo.find(".campoSelect_valor").text("Nenhum profissional vinculado");
        return;
      }

      $.each(profissionais, function (_, profissional) {
        const id = String(profissional.pro_id);
        const nome = profissional.pro_nome || profissional.pro_user || "Profissional " + id;
        const $marca = $("<input>")
          .attr({ type: "checkbox", name: "profissionalServico", value: id })
          .addClass("form-check-input me-2")
          .prop("checked", $.inArray(id, marcados) !== -1);

        $lista.append(
          $("<li>").append(
            $("<label>").addClass("dropdown-item campoSelect_opcaoMultipla").append($marca).append(document.createTextNode(nome))
          )
        );
      });

      $gatilho.prop("disabled", false);
      this.atualizarTextoProfissionaisServico();
    },

    profissionaisSelecionados: function () {
      return this.elementos.$campoProfissionaisServico
        .find('input[name="profissionalServico"]:checked')
        .map(function () {
          return String(this.value);
        })
        .get();
    },

    atualizarTextoProfissionaisServico: function () {
      const $campo = this.elementos.$campoProfissionaisServico;
      const marcados = $campo.find('input[name="profissionalServico"]:checked');
      let texto;

      if (!$campo.length || $campo.find(".campoSelect_gatilho").prop("disabled")) {
        return;
      }
      if (!marcados.length) {
        texto = "Selecione um ou mais profissionais";
      } else if (marcados.length === 1) {
        texto = $.trim(marcados.first().parent().text());
      } else {
        texto = marcados.length + " profissionais selecionados";
      }
      $campo.find(".campoSelect_valor").text(texto);
    },

    nomeDoProfissional: function (id) {
      let nome = "Profissional " + id;

      $.each(this.estado.vinculos || [], function (_, profissional) {
        if (String(profissional.pro_id) === String(id)) {
          nome = profissional.pro_nome || profissional.pro_user || nome;
          return false;
        }
      });
      return nome;
    },

    aoSelecionarLocalServico: function (valor) {
      valor = String(valor || "");

      if (this.ehLocalClinica(valor)) {
        this.carregarSalasServico(valor.slice(prefixoLocalClinica.length));
      } else {
        this.estado.pedidoSalas++;
        this.renderizarSalasServico([], "Não se aplica ao atendimento fora de clínica");
      }
    },

    carregarSalasServico: function (idClinica) {
      const self = this;
      const numeroPedido = ++this.estado.pedidoSalas;

      function falhou() {
        if (numeroPedido === self.estado.pedidoSalas) {
          self.renderizarSalasServico([], "Não foi possível carregar as salas");
        }
      }

      if (!this.contratoDisponivel("listarLocalizacoes") || !this.contratoDisponivel("listarSalas")) {
        this.renderizarSalasServico([], "Salas indisponíveis no momento");
        return;
      }

      this.renderizarSalasServico([], "Carregando salas...");

      this.chamarContrato("listarLocalizacoes", { clinica: idClinica })
        .done(function (resposta) {
          if (numeroPedido !== self.estado.pedidoSalas) {
            return;
          }
          if (!(resposta && resposta.sucesso && $.isArray(resposta.dados))) {
            falhou();
            return;
          }

          const locais = resposta.dados;
          if (!locais.length) {
            self.renderizarSalasServico([], "Nenhuma sala cadastrada nesta clínica");
            return;
          }

          const pedidos = $.map(locais, function (local) {
            const resultado = $.Deferred();

            self.chamarContrato("listarSalas", { loc: local.loc_id })
              .done(function (res) {
                if (res && res.sucesso && $.isArray(res.dados)) {
                  resultado.resolve(res.dados);
                } else {
                  resultado.resolve([]);
                }
              })
              .fail(function () {
                resultado.resolve([]);
              });
            return resultado.promise();
          });

          $.when.apply($, pedidos).done(function () {
            if (numeroPedido !== self.estado.pedidoSalas) {
              return;
            }
            const salas = [];
            $.each(arguments, function (indice, grupo) {
              $.each(grupo, function (_, sala) {
                let nome = sala.sala_nome || "Sala " + sala.sala_id;
                if (locais.length > 1 && locais[indice].loc_nome) {
                  nome = locais[indice].loc_nome + " - " + nome;
                }
                salas.push({ id: sala.sala_id, nome: nome, loc: locais[indice].loc_id });
              });
            });
            self.renderizarSalasServico(salas, "Nenhuma sala cadastrada nesta clínica");
          });
        })
        .fail(falhou);
    },
    renderizarSalasServico: function (salas, textoVazio) {
      const $campo = this.elementos.$campoSalaServico;
      this.estado.salasServico = salas;
      const $lista = $campo.find(".campoSelect_lista").empty();
      const $gatilho = $campo.find(".campoSelect_gatilho");

      $campo.removeClass("campoSelect--erro");

      if (!salas.length) {
        $campo.attr("data-textoVazio", textoVazio);
        $gatilho.prop("disabled", true);
        $campo.find(".campoSelect_valor").text(textoVazio);
        return;
      }

      $.each(salas, function (_, sala) {
        const $marca = $("<input>")
          .attr({ type: "checkbox", name: "salaServico", value: sala.id })
          .addClass("form-check-input me-2");

        $lista.append(
          $("<li>").append(
            $("<label>").addClass("dropdown-item campoSelect_opcaoMultipla").append($marca).append(document.createTextNode(sala.nome))
          )
        );
      });

      $campo.removeAttr("data-textoVazio");
      $gatilho.prop("disabled", false);
      this.atualizarTextoSalaServico();
    },

    salasSelecionadas: function () {
      return this.elementos.$campoSalaServico
        .find('input[name="salaServico"]:checked')
        .map(function () {
          return this.value;
        })
        .get();
    },

    atualizarTextoSalaServico: function () {
      const $campo = this.elementos.$campoSalaServico;
      const marcadas = $campo.find('input[name="salaServico"]:checked');
      let texto;

      if (!marcadas.length) {
        texto = "Selecione uma ou mais salas";
      } else if (marcadas.length === 1) {
        texto = $.trim(marcadas.first().parent().text());
      } else {
        texto = marcadas.length + " salas selecionadas";
      }
      $campo.find(".campoSelect_valor").text(texto);
    },

    enviarServico: function () {
      let criarLocalDomiciliar = false;
      const $formulario = this.elementos.$formularioServico;
      const $tipo = this.elementos.$campoTipoServico;
      const $local = this.elementos.$campoLocalizacaoServico;
      const $sala = this.elementos.$campoSalaServico;
      const local = $local.attr("data-valorSelecionado") || "";
      const localEhClinica = this.ehLocalClinica(local);
      const salas = localEhClinica ? this.salasSelecionadas() : [];
      const $profissionais = this.elementos.$campoProfissionaisServico;
      const profissionais = this.ehClinica() ? this.profissionaisSelecionados() : [];

      const dados = {
        nome: $.trim($("#campoNomeServico").val()),
        val: this.valorParaBackend(this.elementos.$campoValorServico),
        tipo: $tipo.attr("data-valorSelecionado") || "",
        desc: $.trim($("#campoDescricaoServico").val()),
        dur: $.trim($("#campoDuracaoServico").val()),
        inter: $.trim($("#campoIntervaloServico").val()),
        loc: ""
      };

      if (localEhClinica) {
        dados.sala = salas.join(",");
      }

      const camposVazios = [];
      if (!dados.nome) camposVazios.push($("#campoNomeServico"));
      if (!dados.val) camposVazios.push(this.elementos.$campoValorServico);
      if (!dados.desc) camposVazios.push($("#campoDescricaoServico"));
      if (!dados.dur) camposVazios.push($("#campoDuracaoServico"));
      if (dados.inter === "") camposVazios.push($("#campoIntervaloServico"));

      $formulario.find(".is-invalid").removeClass("is-invalid");
      $tipo.removeClass("campoSelect--erro");
      $local.removeClass("campoSelect--erro");
      $sala.removeClass("campoSelect--erro");
      $profissionais.removeClass("campoSelect--erro");
      $.each(camposVazios, function (_, $campo) {
        $campo.addClass("is-invalid");
      });
      if (!dados.tipo) {
        $tipo.addClass("campoSelect--erro");
      }

      if (!local) {
        $local.addClass("campoSelect--erro");
      }
      if (localEhClinica && !salas.length) {
        $sala.addClass("campoSelect--erro");
      }
      if (this.ehClinica() && !profissionais.length) {
        $profissionais.addClass("campoSelect--erro");
      }

      if (camposVazios.length || !dados.tipo || !local || (localEhClinica && !salas.length) || (this.ehClinica() && !profissionais.length)) {
        this.exibirAviso("Você precisa preencher todos os campos!", "erro");
        this.focarPrimeiroInvalido($formulario);
        return;
      }

      const indicesDias = $formulario.find('input[name="diasServico"]:checked').map(function () {
        return Number(this.value);
      }).get();

      if (!indicesDias.length) {
        this.exibirAviso("Você precisa selecionar pelo menos um dia para realizar esse serviço!", "erro");
        $formulario.find('input[name="diasServico"]').first().trigger("focus");
        return;
      }

      dados.dia = this.combinarDias(indicesDias);

      if (local === localCasa) {
        if (!this.estado.localizacao) {
          this.exibirAviso("Ative o atendimento na sua residência no perfil antes de usar esse local.", "erro");
          return;
        }
        dados.loc = this.estado.localizacao.loc_id;
      } else if (localEhClinica) {
        const locaisDasSalas = [];
        const localDaSala = {};

        $.each(this.estado.salasServico || [], function (_, sala) {
          localDaSala[String(sala.id)] = sala.loc;
        });
        $.each(salas, function (_, idSala) {
          const idLocal = localDaSala[String(idSala)];
          if (idLocal && $.inArray(String(idLocal), locaisDasSalas) === -1) {
            locaisDasSalas.push(String(idLocal));
          }
        });
        if (locaisDasSalas.length !== 1) {
          $sala.addClass("campoSelect--erro");
          this.exibirAviso("Selecione salas de uma única localização da clínica.", "erro");
          return;
        }
        dados.loc = locaisDasSalas[0];
      } else {
        criarLocalDomiciliar = true;
      }


      const self = this;
      const $botao = $formulario.find('button[type="submit"]').prop("disabled", true);
      const fila = this.ehClinica() ? profissionais.slice() : [null];
      const total = fila.length;
      const resultados = [];

      function garantirLocalDomiciliar() {
        const pronto = $.Deferred();

        if (!criarLocalDomiciliar) {
          return pronto.resolve().promise();
        }
        if (self.estado.localDomiciliarCriado) {
          dados.loc = self.estado.localDomiciliarCriado;
          return pronto.resolve().promise();
        }
        const dadosBusca = {};
        if (self.ehClinica() && self.estado.perfil && self.estado.perfil.clin_id) {
          dadosBusca.clinica = self.estado.perfil.clin_id;
        }

        function buscarIdCriado() {
          self.chamarContrato("listarLocalizacoes", dadosBusca)
            .done(function (resposta) {
              let maiorId = 0;

              $.each((resposta && resposta.sucesso && resposta.dados) || [], function (_, local) {
                if (local.loc_tipo === localDomiciliar && Number(local.loc_id) > maiorId) {
                  maiorId = Number(local.loc_id);
                }
              });

              if (!maiorId) {
                pronto.reject();
                return;
              }
              self.estado.localDomiciliarCriado = maiorId;
              dados.loc = maiorId;
              pronto.resolve();
            })
            .fail(function () {
              pronto.reject();
            });
        }

        self.chamarContrato("cadastrarLocalizacao", {
          nome: "Atendimento domiciliar",
          tipo: localDomiciliar,
          cep: "",
          numero: "",
          complemento: ""
        })
          .done(function (resposta) {
            if (resposta && resposta.sucesso) {
              buscarIdCriado();
              return;
            }
            pronto.reject();
          })
          .fail(function () {
            pronto.reject();
          });

        return pronto.promise();
      }

      function mensagemDoServidor(resposta) {
        const texto = $.trim(resposta);
        const legivel = texto.length > 0 && texto.length < 120 && !/^erro/i.test(texto);
        return legivel ? texto : "";
      }

      function enviarProximo() {
        let idProfissional;
        let envio;

        if (!fila.length) {
          return $.Deferred().resolve().promise();
        }
        idProfissional = fila.shift();
        envio = $.extend({}, dados);
        if (idProfissional) {
          envio.pro = idProfissional;
        }

        return self.chamarContrato("cadastrarServico", envio, "text")
          .then(
            function (resposta) {
              resultados.push({
                id: idProfissional,
                ok: $.trim(resposta) === "sucesso",
                mensagem: mensagemDoServidor(resposta)
              });
            },
            function () {
              resultados.push({ id: idProfissional, ok: false, mensagem: "" });
            }
          )
          .then(enviarProximo);
      }

      garantirLocalDomiciliar().then(enviarProximo, function () {
        $.each(fila, function (_, id) {
          resultados.push({
            id: id,
            ok: false,
            mensagem: "Não foi possível criar a localização do atendimento domiciliar."
          });
        });
        fila.length = 0;
      }).always(function () {
        const falhas = $.grep(resultados, function (resultado) {
          return !resultado.ok;
        });

        $botao.prop("disabled", false);

        if (!falhas.length) {
          self.estado.localDomiciliarCriado = null;
          self.limparFormulario($formulario);
          self.mostrarVisao("resumo");
          self.carregarPerfil();
          return;
        }

        if (total === 1) {
          self.exibirAviso(falhas[0].mensagem || "Não foi possível cadastrar o serviço. Tente novamente.", "erro");
          return;
        }

        $.each(resultados, function (_, resultado) {
          if (resultado.ok) {
            $profissionais.find('input[name="profissionalServico"][value="' + resultado.id + '"]').prop("checked", false);
          }
        });
        self.atualizarTextoProfissionaisServico();

        if (falhas.length < total) {
          const nomes = $.map(falhas, function (falha) {
            return self.nomeDoProfissional(falha.id);
          });
          self.exibirAviso(
            "Serviço cadastrado para " + (total - falhas.length) + " de " + total + " profissionais. " +
              "Não foi possível cadastrar para: " + nomes.join(", ") + ". Tente novamente para os que ficaram selecionados.",
            "atencao"
          );
          self.carregarPerfil();
        } else {
          self.exibirAviso(falhas[0].mensagem || "Não foi possível cadastrar o serviço. Tente novamente.", "erro");
        }
      });
      
    },

    montarLinhasHorarioFormulario: function () {
      const self = this;

      $.each(nomesDias, function (indice, nomeDia) {
        const $linha = self.clonarModelo("modeloLinhaHorarioFormulario");
        const idCheck = "checkHorario" + indice;
        const idAbertura = "campoHoraAbertura" + indice;
        const idFechamento = "campoHoraFechamento" + indice;

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
      const self = this;
      const $linhas = this.elementos.$listaLinhasHorario.children(".linhaHorario");
      let haSalvos = false;

      $linhas.each(function () {
        const $linha = $(this);
        $linha.removeAttr("data-salvo");
        $linha.find('[data-campo="marcaDia"]').prop("checked", false).prop("disabled", false);
        $linha.find('input[type="time"]').val("").prop("disabled", true).removeClass("is-invalid");
      });
      $.each(this.estado.horarios, function (_, horario) {
        const $linha = $linhas.filter('[data-dia="' + self.diaDoBackend(horario.hrser_dia) + '"]');

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
      const $linha = $marca.closest(".linhaHorario");
      const marcado = $marca.is(":checked");

      $linha.find('input[type="time"]').prop("disabled", !marcado).removeClass("is-invalid");
      if (!marcado) {
        $linha.find('input[type="time"]').val("");
      }
      this.atualizarBotaoSalvarHorarios();
    },

    atualizarBotaoSalvarHorarios: function () {

      const haDiaNovo = this.elementos.$listaLinhasHorario.find('[data-campo="marcaDia"]:checked:not(:disabled)').length > 0;
      this.elementos.$botaoSalvarHorarios.prop("disabled", !haDiaNovo);
    },

    enviarHorarios: function () {
      const self = this;
      const novos = [];
      let haCampoVazio = false;

      this.elementos.$listaLinhasHorario.children(".linhaHorario").each(function () {
        const $linha = $(this);
        const $marca = $linha.find('[data-campo="marcaDia"]');

        if (!$marca.is(":checked") || $marca.prop("disabled")) {
          return;
        }
        const $abertura = $linha.find('[data-campo="horaAbertura"]');
        const $fechamento = $linha.find('[data-campo="horaFechamento"]');

        $abertura.toggleClass("is-invalid", !$abertura.val());
        $fechamento.toggleClass("is-invalid", !$fechamento.val());

        if (!$abertura.val() || !$fechamento.val()) {
          haCampoVazio = true;
          return;
        }
        novos.push({
          dia: self.diaParaBackend($linha.attr("data-dia")),
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

      const $botao = this.elementos.$botaoSalvarHorarios.prop("disabled", true);

      const pedidos = $.map(novos, function (horario) {
        const resultado = $.Deferred();

        self.chamarContrato("cadastrarHorarios", horario)
          .done(function (resposta) {
            let sucesso;
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
        const falhas = $.grep($.makeArray(arguments), function (ok) {
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
      let cepFormatado;
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
      const vinculo = this.normalizarVinculo(item);
      const config = this.configuracaoDoPapel();
      const $card = this.clonarModelo("modeloCardVinculo");

      $card.find('[data-campo="nomeVinculo"]').text(vinculo.titulo);
      $card.find('[data-campo="linkPerfilVinculo"]').attr("aria-label", "Ver perfil de " + vinculo.titulo);
      $card.find('[data-campo="iconePadraoVinculo"]').text(config.iconeVinculo);

      let tipoDoVinculo;
      if (this.ehClinica()) {
        tipoDoVinculo = "profissional";
      } else {
        tipoDoVinculo = "clinica";
      }
      $card.find('[data-campo="linkPerfilVinculo"]')
        .attr("href", "index.php?uri=perfil&tipo=" + tipoDoVinculo + "&id=" + encodeURIComponent(vinculo.id));

      if (vinculo.detalhes) {
        let textoEndereco;
        if (vinculo.cep) {
          textoEndereco = "Carregando...";
        } else {
          textoEndereco = "Não informado";
        }
        const $endereco = $card.find('[data-campo="enderecoVinculo"]').text(textoEndereco);
        $card.find('[data-campo="cepVinculo"]').text(vinculo.cep || "Não informado");
        $card.find('[data-campo="detalhesVinculo"]').removeAttr("hidden");

        const self = this;
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
      const self = this;
      const nomeLista = this.configuracaoDoPapel().listaVinculos;
      const $lista = $('[data-lista="' + nomeLista + '"]').empty();

      $.each(itens, function (_, item) {
        $lista.append(self.montarCardVinculo(item, "lista"));
      });

      let hiddenLista;
      if (itens.length) {
        hiddenLista = null;
      } else {
        hiddenLista = "hidden";
      }
      $lista.attr("hidden", hiddenLista);
      let hiddenEstadoVazio;
      if (itens.length) {
        hiddenEstadoVazio = "hidden";
      } else {
        hiddenEstadoVazio = null;
      }
      $('[data-estadoVazio="' + nomeLista + '"]').attr("hidden", hiddenEstadoVazio);
    },

    prepararModalVinculo: function () {
      if (!this.ehClinica()) {
        return;
      }
      const t = this.textos();

      $('[data-campo="tituloVinculo"]').text(t.tituloVinculo);
      $('[data-campo="rotuloVinculo"]').text(t.rotuloVinculo);
      this.elementos.$campoUsuarioVinculo.attr("placeholder", t.placeholderVinculo);
    },

    atualizarBotaoConfirmarVinculo: function () {
      const semSelecao = !this.estado.vinculoSelecionado;
      this.elementos.$botaoConfirmarVinculo.attr("aria-disabled", String(semSelecao));
    },

    mostrarVinculoEnviado: function (nome) {
      const self = this;

      $('[data-campo="nomeProfissionalPedido"]').text(nome);
      this.elementos.$modalVincular.one("hidden.bs.modal", function () {
        Utilitarios.exibirModal(self.elementos.$modalVinculoEnviado);
      });
      Utilitarios.esconderModal(this.elementos.$modalVincular);
    },

    abrirVinculo: function () {
      if (!this.ehClinica() || this.ehVisitante()) {
        return;
      }
      this.limparBuscaVinculo();
      Utilitarios.exibirModal(this.elementos.$modalVincular);
    },

    limparBuscaVinculo: function () {
      this.estado.vinculoBuscado = null;
      this.estado.vinculoSelecionado = null;
      this.elementos.$campoUsuarioVinculo.val("").removeClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.removeClass("d-block").text("");
      this.elementos.$resultadoVinculo.empty().attr("hidden", "hidden");
      this.atualizarBotaoConfirmarVinculo();
    },

    mostrarErroBusca: function (mensagem) {
      this.elementos.$campoUsuarioVinculo.addClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.text(mensagem).addClass("d-block");
    },

    buscarVinculo: function () {
      const self = this;
      const usuario = $.trim(this.elementos.$campoUsuarioVinculo.val());
      let tipoVinculo;
      if (this.ehClinica()) {
        tipoVinculo = "profissional";
      } else {
        tipoVinculo = "clinica";
      }

      this.elementos.$campoUsuarioVinculo.removeClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.removeClass("d-block");
      this.estado.vinculoSelecionado = null;
      this.atualizarBotaoConfirmarVinculo();
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
          let itens;
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
      const jaSelecionado = $card.hasClass("cardEntidadeBase--selecionado");

      this.elementos.$resultadoVinculo.find(".cardVinculo--selecionavel").each(function () {
        $(this).removeClass("cardEntidadeBase--selecionado")
          .find('[data-acao="selecionarVinculo"]')
          .attr("aria-pressed", "false")
          .find(".material-symbols-outlined")
          .text("radio_button_unchecked");
      });

      if (jaSelecionado) {
        this.estado.vinculoSelecionado = null;
        this.atualizarBotaoConfirmarVinculo();
        return;
      }

      this.estado.vinculoSelecionado = $card.data("item");
      $card.addClass("cardEntidadeBase--selecionado")
        .find('[data-acao="selecionarVinculo"]')
        .attr("aria-pressed", "true")
        .find(".material-symbols-outlined")
        .text("check_circle");
      this.atualizarBotaoConfirmarVinculo();
    },

    enviarVinculo: function () {
      const selecionado = this.estado.vinculoSelecionado;
      const self = this;

      if (!selecionado) {
        this.exibirAviso(this.textos().selecioneAntes, "erro");
        return;
      }
      if (!this.contratoDisponivel("vincular")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("vincular", { pro_id: this.normalizarVinculo(selecionado).id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.mostrarVinculoEnviado(self.normalizarVinculo(selecionado).titulo);
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
      const vinculo = $botao.closest(".cardVinculo").data("vinculo");
      const t = this.textos();

      this.estado.vinculoParaDesvincular = vinculo;
      $('[data-campo="textoDesvinculoAbertura"]').text(t.desvinculoAbertura);
      $('[data-campo="nomeDesvinculo"]').text(vinculo.titulo);
      $('[data-campo="textoDesvinculoConsequencia"]').text(t.desvinculoConsequencia);

      Utilitarios.exibirModal(this.elementos.$modalDesvincular);
    },

    confirmarDesvinculo: function () {
      const self = this;

      if (!this.contratoDisponivel("desvincular")) {
        Utilitarios.esconderModal(this.elementos.$modalDesvincular);
        this.avisarIndisponivel();
        return;
      }

      let dadosDesvinculo;
      if (this.ehClinica()) {
        dadosDesvinculo = { pro_id: this.estado.vinculoParaDesvincular.id };
      } else {
        dadosDesvinculo = { clin_id: this.estado.vinculoParaDesvincular.id };
      }

      this.chamarContrato("desvincular", dadosDesvinculo)
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
      const self = this;
      const e = this.elementos;

      $(document).on("click", "[data-visaoDestino]", function () {
        const destino = $(this).attr("data-visaoDestino");
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
      $(document).on("click", "#botaoAdicionarSala", function () {
        self.adicionarSala();
      });
      $(document).on("keydown", "#campoNovaSala", function (evento) {
        if (evento.key === "Enter") {
          evento.preventDefault();
          self.adicionarSala();
        }
      });
      $(document).on("click", '#editorSalas [data-acao="salvarSala"]', function () {
        self.editarSala($(this).closest("li"));
      });
      $(document).on("click", '#editorSalas [data-acao="removerSalaPendente"]', function () {
        self.removerSalaPendente($(this).closest("li"));
      });
      $(document).on("click", '#editorSalas [data-acao="excluirSala"]', function () {
        self.excluirSala($(this).closest("li"));
      });
      $("#alternarAtendeCasa").on("change", function () {
        self.alternarAtendeCasa($(this).is(":checked"));
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
      e.$campoLocalizacaoServico.on("opcaoSelecionada", function (_, dados) {
        $(this).removeClass("campoSelect--erro");
        self.aoSelecionarLocalServico(dados.valor);
      });
      e.$campoProfissionaisServico.on("change", 'input[name="profissionalServico"]', function () {
        e.$campoProfissionaisServico.removeClass("campoSelect--erro");
        self.atualizarTextoProfissionaisServico();
      });
      e.$campoSalaServico.on("change", 'input[name="salaServico"]', function () {
        e.$campoSalaServico.removeClass("campoSelect--erro");
        self.atualizarTextoSalaServico();
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