(function ($, Utilitarios) {
  "use strict";
  const moduloInfoServico = {

    configuracao: {
      urlObterServico: "index.php?uri=busca"
    },

    estado: {
      idServico: null
    },

    elementos: {},

    iniciar: function () {
      this.elementos.$botaoAgendarAgora = $("#botaoAgendarAgora");
      this.elementos.$botaoTentarNovamente = $("#botaoTentarNovamente");
      this.elementos.$modalErro = $("#modalServicoNaoEncontrado");
      this.elementos.$modalSucesso = $("#modalAgendamentoEnviado");
      this.elementos.$camposDinamicos = $("[data-campo]");
      this.elementos.$cartaoServico = $("#cartaoServico");

      const id = Utilitarios.obterParametroUrl("id");

      if (/^[0-9]+$/.test(id || "")) {
        this.estado.idServico = id;
      } else {
        this.estado.idServico = null;
      }

      this.registrarEventos();
      this.buscarDadosServico();
    },

    registrarEventos: function () {
      const self = this;

      this.elementos.$botaoTentarNovamente.on("click", function () {
        self.buscarDadosServico();
      });

      this.elementos.$botaoAgendarAgora.on("click", function (evento) {
        evento.preventDefault();
        self.irParaAgendamento();
      });

      this.elementos.$modalErro.on("shown.bs.modal", function () {
        self.elementos.$botaoTentarNovamente.trigger("focus");
      });
    },

    buscarDadosServico: function () {
      const self = this;

      Utilitarios.esconderModal(this.elementos.$modalErro);
      this.desabilitarBotaoAgendar();

      if (!this.estado.idServico) {
        this.tratarFalhaCarregamento();
        return;
      }
      this.elementos.$cartaoServico
        .removeClass("estadoErro")
        .addClass("estadoCarregando");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);

      $.ajax({
        url: this.configuracao.urlObterServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "mostrardetalhes",
          tipo: "servico",
          id: this.estado.idServico
        }
      })
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso || !resposta.dados || !resposta.dados.length) {
            self.tratarFalhaCarregamento();
            return;
          }
          self.elementos.$cartaoServico.removeClass("estadoCarregando estadoErro");
          Utilitarios.preencherCampos(
            self.elementos.$camposDinamicos,
            self.mapearDadosServico(resposta.dados[0])
          );
          Utilitarios.alternarEsqueletoAcessivel(self.elementos.$camposDinamicos, false);
          self.carregarProfissional(resposta.dados[0].ser_pro);
          self.habilitarBotaoAgendar();
          self.exibirModalSucessoSeAgendado();
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
        });
    },

    mapearDadosServico: function (registro) {
      let duracao;
      if (registro.ser_dur) {
        duracao = registro.ser_dur + " min";
      } else {
        duracao = "";
      }
      return {
        tituloServico: registro.ser_nome,
        descricaoServico: registro.ser_desc,
        duracaoServico: duracao,
        precoServico: this.formatarPreco(registro.ser_val),
        nomeProfissional: ""
      };
    },

    carregarProfissional: function (idProfissional) {
      const self = this;

      if (!idProfissional) {
        return;
      }

      $.ajax({
        url: this.configuracao.urlObterServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "mostrardetalhes",
          tipo: "profissional",
          id: idProfissional
        }
      }).done(function (resposta) {
        if (!resposta || !resposta.sucesso || !resposta.dados || !resposta.dados.length) {
          return;
        }
        Utilitarios.preencherCampos(self.elementos.$camposDinamicos, {
          nomeProfissional: resposta.dados[0].pro_nome || ""
        });
      });
    },

    formatarPreco: function (valor) {
      const numero = Number(valor);
      if (isNaN(numero)) {
        return "";
      }
      return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    tratarFalhaCarregamento: function () {
      this.elementos.$cartaoServico
        .removeClass("estadoCarregando")
        .addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.exibirModalErro();
    },

    exibirModalSucessoSeAgendado: function () {
      const parametros = new URLSearchParams(window.location.search);

      if (parametros.get("agendado") !== "1") {
        return;
      }

      Utilitarios.exibirModal(this.elementos.$modalSucesso);

      parametros.delete("agendado");
      const novaQuerystring = parametros.toString();
      let sufixoQuery;
      if (novaQuerystring) {
        sufixoQuery = "?" + novaQuerystring;
      } else {
        sufixoQuery = "";
      }
      const novaUrl = window.location.pathname + sufixoQuery;
      window.history.replaceState({}, document.title, novaUrl);
    },

    exibirModalErro: function () {
      this.desabilitarBotaoAgendar();
      Utilitarios.exibirModal(this.elementos.$modalErro, {
        backdrop: "static",
        keyboard: false
      });
    },

    habilitarBotaoAgendar: function () {
      this.elementos.$botaoAgendarAgora
        .prop("disabled", false)
        .attr("aria-disabled", "false");
    },

    desabilitarBotaoAgendar: function () {
      this.elementos.$botaoAgendarAgora
        .prop("disabled", true)
        .attr("aria-disabled", "true");
    },

    irParaAgendamento: function () {
      let url = "index.php?uri=agendamentoCli";
      if (this.estado.idServico) {
        url += "&servico=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    }
  };

  $(function () {
    moduloInfoServico.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
