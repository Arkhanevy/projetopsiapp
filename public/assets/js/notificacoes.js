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
        // Marca como vista (notif_stat = 1). O id vai em "not_id".
        marcarNotificacaoLida: { acao: "lernot", disponivel: true },
        // Convite de vínculo clínica -> profissional (notificação tipo 6). O id vai em "notif_id".
        aceitarVinculo:        { acao: "aceitar_vinculo", disponivel: true },
        recusarVinculo:        { acao: "recusar_vinculo", disponivel: true }
      },

      // notif_tipo gravado pelo backend (ver comentário em models/notificacao.php).
      tiposNotificacao: {
        "1": { titulo: "Nova solicitação de consulta", exibirLinkConsultas: true },
        "2": { titulo: "Consulta reagendada",          exibirLinkConsultas: true },
        "3": { titulo: "Consulta aceita",              exibirLinkConsultas: true },
        "4": { titulo: "Consulta rejeitada",           exibirLinkConsultas: true },
        "5": { titulo: "Consulta cancelada",           exibirLinkConsultas: true },
        "6": { titulo: "Convite de vínculo",           exibirLinkConsultas: false, acoesVinculo: true }
      },
      tituloPadrao: "Notificação",
      tamanhoResumo: 100,

      textos: {
        naoLogado: "Entre na sua conta para ver suas notificações.",
        erro: "Não foi possível carregar as notificações.",
        vazio: "Nenhuma notificação encontrada.",
        vinculoAceito: "Vínculo aceito! A clínica já aparece nas suas clínicas vinculadas.",
        vinculoRecusado: "Convite de vínculo recusado.",
        erroVinculo: "Não foi possível responder ao convite. Tente novamente."
      }
    },

    estado: {
      papel: null,
      requisicaoNotificacoes: 0,
      notificacoes: {},
      $cardAtual: null,
      idNotificacaoAtual: null,
      respondendoVinculo: false
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
      e.$acoesVinculo = e.$modal.find("[data-campo='acoesVinculo']");
      e.$botaoAceitarVinculo = e.$modal.find("[data-acao='aceitarVinculo']");
      e.$botaoRecusarVinculo = e.$modal.find("[data-acao='recusarVinculo']");
      e.$erroVinculo = e.$modal.find("[data-campo='erroVinculo']");
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

      e.$botaoAceitarVinculo.on("click", function () {
        self.responderVinculo(true);
      });

      e.$botaoRecusarVinculo.on("click", function () {
        self.responderVinculo(false);
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

      e.$lista.empty();
      this.estado.notificacoes = {};

      $.each(itens, function (posicao, item) {
        const notificacao = self.normalizarNotificacao(item);
        if (!notificacao.id) {
          return;
        }

        self.estado.notificacoes[notificacao.id] = notificacao;
        e.$lista.append(self.criarCardNotificacao(notificacao));
      });

      if (!e.$lista.children().length) {
        this.exibirEstadoPagina("vazio");
        return;
      }

      this.exibirEstadoPagina("lista");
      this.atualizarAviso();
    },

    // Texto lido por leitores de tela: total de notificações e quantas ainda não foram vistas
    atualizarAviso: function () {
      const itens = this.estado.notificacoes;
      let total = 0;
      let novas = 0;

      $.each(itens, function (id, notificacao) {
        total++;
        if (!notificacao.lida) {
          novas++;
        }
      });

      let texto = total + (total === 1 ? " notificação encontrada" : " notificações encontradas");
      if (novas) {
        texto += ", " + novas + (novas === 1 ? " nova." : " novas.");
      } else {
        texto += ".";
      }
      this.elementos.$avisoPagina.text(texto);
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
      let mensagem = String(item.notif_msg || "");
      const nomeClinica = String(item.clin_nome || item.clin_user || "");
      if (tipo === "6" && nomeClinica) {
        mensagem = "Clínica: " + nomeClinica + ". " + mensagem;
      }
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
        exibirLinkConsultas: !!infoTipo.exibirLinkConsultas,
        // só o profissional responde ao convite (o backend também confere)
        exibirAcoesVinculo: !!infoTipo.acoesVinculo && this.estado.papel === "profissional"
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

      this.estado.idNotificacaoAtual = notificacao.id;
      e.$erroVinculo.attr("hidden", "hidden").text("");
      this.definirBotoesVinculoOcupados(false);
      if (notificacao.exibirAcoesVinculo) {
        e.$acoesVinculo.removeAttr("hidden");
      } else {
        e.$acoesVinculo.attr("hidden", "hidden");
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

      this.chamarContrato("marcarNotificacaoLida", { not_id: id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            notificacao.lida = true;
            self.atualizarCardLido(id);
            self.atualizarAviso();
          }
        });
    },

    atualizarCardLido: function (id) {
      const $card = this.elementos.$lista.find(".cardNotificacao").filter(function () {
        return $(this).attr("data-notificacaoId") === String(id);
      });

      $card.attr("data-lida", "true");
      $card.find("[data-campo='seloNova']").attr("hidden", "hidden");
    },

    definirBotoesVinculoOcupados: function (ocupado) {
      const e = this.elementos;
      this.estado.respondendoVinculo = ocupado;
      e.$botaoAceitarVinculo.prop("disabled", ocupado);
      e.$botaoRecusarVinculo.prop("disabled", ocupado);
    },

    // Aceitar ou recusar o convite de vínculo (notificação tipo 6)
    responderVinculo: function (aceitar) {
      const self = this;
      const e = this.elementos;
      const id = this.estado.idNotificacaoAtual;
      const notificacao = this.estado.notificacoes[id];
      const textos = this.configuracao.textos;
      let contrato;

      if (!notificacao || !notificacao.exibirAcoesVinculo || this.estado.respondendoVinculo) {
        return;
      }

      if (aceitar) {
        contrato = "aceitarVinculo";
      } else {
        contrato = "recusarVinculo";
      }

      e.$erroVinculo.attr("hidden", "hidden").text("");
      this.definirBotoesVinculoOcupados(true);

      this.chamarContrato(contrato, { notif_id: id })
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso) {
            self.definirBotoesVinculoOcupados(false);
            e.$erroVinculo.text((resposta && resposta.mensagem) || textos.erroVinculo).removeAttr("hidden");
            return;
          }

          // o backend apaga o convite quando ele é respondido: some da lista também
          delete self.estado.notificacoes[id];
          e.$lista.find(".cardNotificacao").filter(function () {
            return $(this).attr("data-notificacaoId") === String(id);
          }).closest(".listaNotificacoes_item").remove();

          self.estado.$cardAtual = null;
          Utilitarios.esconderModal(e.$modal);

          if (!e.$lista.children().length) {
            self.exibirEstadoPagina("vazio");
          } else {
            self.atualizarAviso();
          }

          let mensagemFinal;
          if (aceitar) {
            mensagemFinal = textos.vinculoAceito;
          } else {
            mensagemFinal = textos.vinculoRecusado;
          }
          e.$avisoPagina.text(mensagemFinal);
        })
        .fail(function () {
          self.definirBotoesVinculoOcupados(false);
          e.$erroVinculo.text(textos.erroVinculo).removeAttr("hidden");
        });
    }
  };

  $(function () {
    moduloNotificacoes.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
