(function ($, Utilitarios) {
  "use strict";

  var moduloInfoServico = {

    configuracao: {
      urlObterServico: "index.php?uri=busca" // buscacontroller.php: acao "mostrardetalhes"
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

      var id = Utilitarios.obterParametroUrl("id");
      // O backend espera um id numérico; sem ele, a tela mostra o erro de serviço não encontrado
      this.estado.idServico = /^[0-9]+$/.test(id || "") ? id : null;

      this.registrarEventos();
      this.buscarDadosServico();
    },

    registrarEventos: function () {
      var self = this;

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
      var self = this;

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
          self.habilitarBotaoAgendar();
          self.exibirModalSucessoSeAgendado();
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
        });
    },

    mapearDadosServico: function (registro) {
      return {
        tituloServico: registro.ser_nome,
        descricaoServico: registro.ser_desc,
        duracaoServico: registro.ser_dur ? registro.ser_dur + " min" : "",
        precoServico: this.formatarPreco(registro.ser_val)
      };
    },

    formatarPreco: function (valor) {
      var numero = Number(valor);
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
      var parametros = new URLSearchParams(window.location.search);

      if (parametros.get("agendado") !== "1") {
        return;
      }

      Utilitarios.exibirModal(this.elementos.$modalSucesso);

      parametros.delete("agendado");
      var novaQuerystring = parametros.toString();
      var novaUrl =
        window.location.pathname + (novaQuerystring ? "?" + novaQuerystring : "");
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
      var url = "index.php?uri=agendamentoCli";
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
