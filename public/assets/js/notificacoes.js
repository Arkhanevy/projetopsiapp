(function ($, Utilitarios) {
  "use strict";

  const moduloNotificacoes = {

    configuracao: {

      papeis: {
        cliente:      { url: "index.php?uri=cliente" },
        profissional: { url: "index.php?uri=profissional" },
        clinica:      { url: "index.php?uri=clinica" }
      },

      hrefAgendaPorTipo: {
        cliente: "index.php?uri=consultasCli",
        profissional: "index.php?uri=agendaProfissional",
        clinica: "index.php?uri=agendaClinica"
      },

      contratos: {
        // O backend (cliente/profissional/clinica controller) trata a ação "notificação" (com acento).
        listarNotificacoes:    { acao: "notificação", disponivel: true },
        // O backend ainda não tem ação para marcar como lida.
        marcarNotificacaoLida: { acao: "marcarNotificacaoLida", disponivel: false }
      },

      // notif_tipo gravado pelo backend (ver comentário em models/notificacao.php).
      tiposNotificacao: {
        "1": { titulo: "Nova solicitação de consulta", exibirLinkConsultas: true },
        "2": { titulo: "Consulta reagendada",          exibirLinkConsultas: true },
        "3": { titulo: "Consulta aceita",              exibirLinkConsultas: true },
        "4": { titulo: "Consulta rejeitada",           exibirLinkConsultas: true },
        "5": { titulo: "Consulta cancelada",           exibirLinkConsultas: true }
      },
      tituloPadrao: "Notificação",
      tamanhoResumo: 100,

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
      const e = this.elementos;
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
      const self = this;
      const e = this.elementos;

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
      const configuracao = this.configuracao;

      if (!sessao || !sessao.logado) {
        this.exibirNaoLogado();
        return;
      }

      $(".navTopoLogado").removeAttr("hidden");
      const hrefAgenda = configuracao.hrefAgendaPorTipo[sessao.tipoUsuario];
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
      const contrato = this.configuracao.contratos[nome];
      const papel = this.configuracao.papeis[this.estado.papel];

      return $.ajax({
        url: contrato.url || papel.url,
        method: "POST",
        dataType: "json",
        data: $.extend({ acao: contrato.acao }, dados || {})
      });
    },

    exibirEstadoPagina: function (nome) {
      const e = this.elementos;
      e.$estadosPagina.attr("hidden", "hidden");
      e.$estadosPagina.filter("[data-estadoNotificacoes='" + nome + "']").removeAttr("hidden");
      let ariaOcupado;
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
      const self = this;
      const numero = ++this.estado.requisicaoNotificacoes;

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
      const self = this;
      const e = this.elementos;
      let novas = 0;

      e.$lista.empty();
      this.estado.notificacoes = {};

      $.each(itens, function (posicao, item) {
        const notificacao = self.normalizarNotificacao(item);
        if (!notificacao.id) {
          return;
        }

        self.estado.notificacoes[notificacao.id] = notificacao;
        e.$lista.append(self.criarCardNotificacao(notificacao));
        if (!notificacao.lida) {
          novas++;
        }
      });

      const total = e.$lista.children().length;
      if (!total) {
        this.exibirEstadoPagina("vazio");
        return;
      }

      this.exibirEstadoPagina("lista");
      let textoTotal;
      if (total === 1) {
        textoTotal = " notificação encontrada";
      } else {
        textoTotal = " notificações encontradas";
      }
      let textoNovas;
      if (novas) {
        let sufixoNovas;
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
      const configuracao = this.configuracao;
      let idNotificacao;
      if (item.notif_id) {
        idNotificacao = String(item.notif_id);
      } else {
        idNotificacao = "";
      }

      const tipo = String(item.notif_tipo || "");
      const infoTipo = configuracao.tiposNotificacao[tipo] || {};
      const mensagem = String(item.notif_msg || "");
      let resumo = mensagem;
      if (resumo.length > configuracao.tamanhoResumo) {
        resumo = resumo.substring(0, configuracao.tamanhoResumo).replace(/\s+\S*$/, "") + "…";
      }

      return {
        id: idNotificacao,
        titulo: infoTipo.titulo || configuracao.tituloPadrao,
        resumo: resumo,
        mensagem: mensagem,
        data: String(item.notif_data || ""),
        tipo: tipo,
        lida: this.valorVerdadeiro(item.notif_stat),
        exibirLinkConsultas: !!infoTipo.exibirLinkConsultas
      };
    },

    valorVerdadeiro: function (valor) {
      return valor === true || valor === 1 || valor === "1" || valor === "true";
    },

    criarCardNotificacao: function (notificacao) {
      const modelo = this.elementos.$modelo.get(0);
      const $item = $(modelo.content.firstElementChild.cloneNode(true));
      const data = this.formatarData(notificacao.data);

      let valorLida;
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
      const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor || ""));
      if (!partes) {
        return { texto: "", iso: "" };
      }

      const data = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
      const opcoes = { day: "numeric", month: "long" };
      if (data.getFullYear() !== new Date().getFullYear()) {
        opcoes.year = "numeric";
      }

      return {
        texto: data.toLocaleDateString("pt-BR", opcoes),
        iso: partes[1] + "-" + partes[2] + "-" + partes[3]
      };
    },

    abrirNotificacao: function ($card) {
      const e = this.elementos;
      const id = $card.attr("data-notificacaoId");
      const notificacao = this.estado.notificacoes[id];

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
      const $card = this.estado.$cardAtual;
      this.estado.$cardAtual = null;

      if ($card && $card.length && $.contains(document.documentElement, $card.get(0))) {
        $card.trigger("focus");
      }
    },

    marcarComoLida: function (id) {
      const self = this;
      const notificacao = this.estado.notificacoes[id];

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
      const $card = this.elementos.$lista.find(".cardNotificacao").filter(function () {
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
