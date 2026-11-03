(function ($, Utilitarios) {
  "use strict";

  var moduloNotificacoes = {

    configuracao: {

      papeis: {
        cliente:        { url: "index.php?uri=cliente" },
        clienteSimples: { url: "index.php?uri=cliente" },
        profissional:   { url: "index.php?uri=profissional" },
        clinica:        { url: "index.php?uri=clinica" }
      },

      hrefAgendaPorTipo: {
        cliente: "index.php?uri=consultasCli",
        clienteSimples: "index.php?uri=consultasCli",
        profissional: "index.php?uri=agendaProfissional",
        clinica: "index.php?uri=agendaClinica"
      },

      contratos: {
        listarNotificacoes:    { acao: "listarNotificacoes",    disponivel: false },
        marcarNotificacaoLida: { acao: "marcarNotificacaoLida", disponivel: false }
      },

      textos: {
        naoLogado: "Entre na sua conta para ver suas notificações.",
        erro: "Não foi possível carregar as notificações.",
        vazio: "Nenhuma notificação encontrada."
      }
    },

    estado: {
      papel: null,
      requisicaoNotificacoes: 0,
      notificacoes: {},
      $cardAtual: null
    },

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      this.registrarEventos();
    },

    cachearElementos: function () {
      var e = this.elementos;
      e.$principal = $("#conteudoNotificacoes");
      e.$avisoPagina = $("#avisoNotificacoes");
      e.$estadosPagina = $("[data-estadoNotificacoes]");
      e.$textoErro = e.$estadosPagina.filter("[data-estadoNotificacoes='erro']").find(".estadoVazio_texto");
      e.$botaoTentar = $("#botaoTentarNovamenteNotificacoes");
      e.$lista = $("[data-campo='listaNotificacoes']");
      e.$modelo = $("#modeloCardNotificacao");

      e.$modal = $("#modalNotificacao");
      e.$tituloModal = e.$modal.find("[data-campo='tituloNotificacao']");
      e.$mensagemModal = e.$modal.find("[data-campo='mensagemNotificacao']");
      e.$blocoLinkConsultas = e.$modal.find("[data-campo='blocoLinkConsultas']");
    },

    registrarEventos: function () {
      var self = this;
      var e = this.elementos;

      $(document).on("sessaoNavegacaoDefinida", function (evento, sessao) {
        self.aoDefinirSessao(sessao);
      });

      e.$botaoTentar.on("click", function () {
        self.carregarNotificacoes();
      });

      e.$lista.on("click", ".cardNotificacao", function () {
        self.abrirNotificacao($(this));
      });

      e.$modal.on("hidden.bs.modal", function () {
        self.aoFecharModal();
      });
    },

    aoDefinirSessao: function (sessao) {
      var configuracao = this.configuracao;

      if (!sessao || !sessao.logado) {
        this.exibirNaoLogado();
        return;
      }

      $(".navTopoLogado").removeAttr("hidden");
      var hrefAgenda = configuracao.hrefAgendaPorTipo[sessao.tipoUsuario];
      if (hrefAgenda) {
        $("[data-itemAgenda]").attr("href", hrefAgenda);
        $("[data-itemMinhasConsultas]").attr("href", hrefAgenda);
      }

      if (!configuracao.papeis[sessao.tipoUsuario]) {

        this.exibirEstadoPagina("vazio");
        return;
      }

      this.estado.papel = sessao.tipoUsuario;
      this.carregarNotificacoes();
    },

    exibirNaoLogado: function () {
      this.exibirEstadoPagina("erro");
      this.elementos.$textoErro.text(this.configuracao.textos.naoLogado);
      this.elementos.$botaoTentar.attr("hidden", "hidden");
    },

    contratoDisponivel: function (nome) {
      if (this.configuracao.contratos[nome].disponivel) {
        return true;
      } else {
        return false;
      }
    },

    chamarContrato: function (nome, dados) {
      var contrato = this.configuracao.contratos[nome];
      var papel = this.configuracao.papeis[this.estado.papel];

      return $.ajax({
        url: contrato.url || papel.url,
        method: "POST",
        dataType: "json",
        data: $.extend({ acao: contrato.acao }, dados || {})
      });
    },

    exibirEstadoPagina: function (nome) {
      var e = this.elementos;
      e.$estadosPagina.attr("hidden", "hidden");
      e.$estadosPagina.filter("[data-estadoNotificacoes='" + nome + "']").removeAttr("hidden");
      var ariaOcupado;
      if (nome === "carregando") {
        ariaOcupado = "true";
      } else {
        ariaOcupado = "false";
      }
      e.$principal.attr("aria-busy", ariaOcupado);

      if (nome === "vazio") {
        e.$avisoPagina.text(this.configuracao.textos.vazio);
      } else if (nome === "erro") {
        e.$avisoPagina.text("");
      }
    },

    carregarNotificacoes: function () {
      var self = this;
      var numero = ++this.estado.requisicaoNotificacoes;

      this.elementos.$botaoTentar.removeAttr("hidden");

      if (!this.contratoDisponivel("listarNotificacoes")) {

        this.renderizarNotificacoes([]);
        return;
      }

      this.exibirEstadoPagina("carregando");

      this.chamarContrato("listarNotificacoes")
        .done(function (resposta) {
          if (numero !== self.estado.requisicaoNotificacoes) {
            return;
          }
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            self.renderizarNotificacoes(resposta.dados);
          } else {
            self.exibirErroNotificacoes();
          }
        })
        .fail(function () {
          if (numero === self.estado.requisicaoNotificacoes) {
            self.exibirErroNotificacoes();
          }
        });
    },

    exibirErroNotificacoes: function () {
      this.elementos.$textoErro.text(this.configuracao.textos.erro);
      this.exibirEstadoPagina("erro");
    },

    renderizarNotificacoes: function (itens) {
      var self = this;
      var e = this.elementos;
      var novas = 0;

      e.$lista.empty();
      this.estado.notificacoes = {};

      $.each(itens, function (posicao, item) {
        var notificacao = self.normalizarNotificacao(item);
        if (!notificacao.id) {
          return;
        }

        self.estado.notificacoes[notificacao.id] = notificacao;
        e.$lista.append(self.criarCardNotificacao(notificacao));
        if (!notificacao.lida) {
          novas++;
        }
      });

      var total = e.$lista.children().length;
      if (!total) {
        this.exibirEstadoPagina("vazio");
        return;
      }

      this.exibirEstadoPagina("lista");
      var textoTotal;
      if (total === 1) {
        textoTotal = " notificação encontrada";
      } else {
        textoTotal = " notificações encontradas";
      }
      var textoNovas;
      if (novas) {
        var sufixoNovas;
        if (novas === 1) {
          sufixoNovas = " nova.";
        } else {
          sufixoNovas = " novas.";
        }
        textoNovas = ", " + novas + sufixoNovas;
      } else {
        textoNovas = ".";
      }
      e.$avisoPagina.text(total + textoTotal + textoNovas);
    },

    normalizarNotificacao: function (item) {
      item = item || {};
      var idNotificacao;
      if (item.idNotificacao) {
        idNotificacao = String(item.idNotificacao);
      } else {
        idNotificacao = "";
      }
      return {
        id: idNotificacao,
        titulo: String(item.tituloNotificacao || ""),
        resumo: String(item.resumoNotificacao || ""),
        mensagem: String(item.mensagemNotificacao || ""),
        data: String(item.dataNotificacao || ""),
        tipo: String(item.tipoNotificacao || ""),
        lida: this.valorVerdadeiro(item.lida),
        exibirLinkConsultas: this.valorVerdadeiro(item.exibirLinkConsultas)
      };
    },

    valorVerdadeiro: function (valor) {
      return valor === true || valor === 1 || valor === "1" || valor === "true";
    },

    criarCardNotificacao: function (notificacao) {
      var modelo = this.elementos.$modelo.get(0);
      var $item = $(modelo.content.firstElementChild.cloneNode(true));
      var data = this.formatarData(notificacao.data);

      var valorLida;
      if (notificacao.lida) {
        valorLida = "true";
      } else {
        valorLida = "false";
      }
      $item.find(".cardNotificacao")
        .attr("data-notificacaoId", notificacao.id)
        .attr("data-lida", valorLida)
        .attr("data-tipoNotificacao", notificacao.tipo);
      $item.find("[data-campo='tituloNotificacao']").text(notificacao.titulo);
      $item.find("[data-campo='resumoNotificacao']").text(notificacao.resumo);
      $item.find("[data-campo='dataNotificacao']")
        .text(data.texto)
        .attr("datetime", data.iso);

      if (!notificacao.lida) {
        $item.find("[data-campo='seloNova']").removeAttr("hidden");
      }

      return $item;
    },

    formatarData: function (valor) {
      var partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor || ""));
      if (!partes) {
        return { texto: "", iso: "" };
      }

      var data = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
      var opcoes = { day: "numeric", month: "long" };
      if (data.getFullYear() !== new Date().getFullYear()) {
        opcoes.year = "numeric";
      }

      return {
        texto: data.toLocaleDateString("pt-BR", opcoes),
        iso: partes[1] + "-" + partes[2] + "-" + partes[3]
      };
    },

    abrirNotificacao: function ($card) {
      var e = this.elementos;
      var id = $card.attr("data-notificacaoId");
      var notificacao = this.estado.notificacoes[id];

      if (!notificacao) {
        return;
      }

      this.estado.$cardAtual = $card;

      e.$tituloModal.text(notificacao.titulo);

      e.$mensagemModal.text(notificacao.mensagem || notificacao.resumo);

      if (notificacao.exibirLinkConsultas) {
        e.$blocoLinkConsultas.removeAttr("hidden");
      } else {
        e.$blocoLinkConsultas.attr("hidden", "hidden");
      }

      Utilitarios.exibirModal(e.$modal);
      this.marcarComoLida(notificacao.id);
    },

    aoFecharModal: function () {
      var $card = this.estado.$cardAtual;
      this.estado.$cardAtual = null;

      if ($card && $card.length && $.contains(document.documentElement, $card.get(0))) {
        $card.trigger("focus");
      }
    },

    marcarComoLida: function (id) {
      var self = this;
      var notificacao = this.estado.notificacoes[id];

      if (!notificacao || notificacao.lida || !this.contratoDisponivel("marcarNotificacaoLida")) {
        return;
      }

      this.chamarContrato("marcarNotificacaoLida", { idNotificacao: id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            notificacao.lida = true;
            self.atualizarCardLido(id);
          }
        });
    },

    atualizarCardLido: function (id) {
      var $card = this.elementos.$lista.find(".cardNotificacao").filter(function () {
        return $(this).attr("data-notificacaoId") === String(id);
      });

      $card.attr("data-lida", "true");
      $card.find("[data-campo='seloNova']").attr("hidden", "hidden");
    }
  };

  $(function () {
    moduloNotificacoes.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
