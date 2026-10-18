/* ============================================================
   RESUMO DO ARQUIVO: infoServico.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloInfoServico
   - Função/método: iniciar
   - Função/método: registrarEventos
   - Função/método: buscarDadosServico
   - Função/método: mapearDadosServico
   - Função/método: formatarPreco
   - Função/método: tratarFalhaCarregamento
   - Função/método: exibirModalSucessoSeAgendado
   - Função/método: exibirModalErro
   - Função/método: habilitarBotaoAgendar
   - Função/método: desabilitarBotaoAgendar
   - Função/método: irParaAgendamento
   ============================================================ */

(function ($, Utilitarios) {
  "use strict";

  // Objeto \'moduloInfoServico\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloInfoServico = {

    configuracao: {
      urlObterServico: "index.php?uri=busca" // buscacontroller.php: acao "mostrardetalhes"
    },

    estado: {
      idServico: null
    },
    elementos: {},

    // Método \'iniciar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    iniciar: function() {
      this.elementos.$botaoAgendarAgora = $("#botaoAgendarAgora");
      this.elementos.$botaoTentarNovamente = $("#botaoTentarNovamente");
      this.elementos.$modalErro = $("#modalServicoNaoEncontrado");
      this.elementos.$modalSucesso = $("#modalAgendamentoEnviado");
      this.elementos.$camposDinamicos = $("[data-campo]");
      this.elementos.$cartaoServico = $("#cartaoServico");

      var id = Utilitarios.obterParametroUrl("id");
      // O backend espera um id numérico; sem ele, a tela mostra o erro de serviço não encontrado
      if (/^[0-9]+$/.test(id || "")) {
        this.estado.idServico = id;
      } else {
        this.estado.idServico = null;
      }

      this.registrarEventos();
      this.buscarDadosServico();
    },

    // Método \'registrarEventos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    registrarEventos: function() {
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

    // Método \'buscarDadosServico\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    buscarDadosServico: function() {
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

    // Método \'mapearDadosServico\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mapearDadosServico: function(registro) {
      var duracao;
      if (registro.ser_dur) {
        duracao = registro.ser_dur + " min";
      } else {
        duracao = "";
      }
      return {
        tituloServico: registro.ser_nome,
        descricaoServico: registro.ser_desc,
        duracaoServico: duracao,
        precoServico: this.formatarPreco(registro.ser_val)
      };
    },

    // Método \'formatarPreco\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    formatarPreco: function(valor) {
      var numero = Number(valor);
      if (isNaN(numero)) {
        return "";
      }
      return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    // Método \'tratarFalhaCarregamento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    tratarFalhaCarregamento: function() {
      this.elementos.$cartaoServico
        .removeClass("estadoCarregando")
        .addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.exibirModalErro();
    },

    // Método \'exibirModalSucessoSeAgendado\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirModalSucessoSeAgendado: function() {
      var parametros = new URLSearchParams(window.location.search);

      if (parametros.get("agendado") !== "1") {
        return;
      }

      Utilitarios.exibirModal(this.elementos.$modalSucesso);

      parametros.delete("agendado");
      var novaQuerystring = parametros.toString();
      var sufixoQuery;
      if (novaQuerystring) {
        sufixoQuery = "?" + novaQuerystring;
      } else {
        sufixoQuery = "";
      }
      var novaUrl = window.location.pathname + sufixoQuery;
      window.history.replaceState({}, document.title, novaUrl);
    },

    // Método \'exibirModalErro\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirModalErro: function() {
      this.desabilitarBotaoAgendar();
      Utilitarios.exibirModal(this.elementos.$modalErro, {
        backdrop: "static",
        keyboard: false
      });
    },

    // Método \'habilitarBotaoAgendar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    habilitarBotaoAgendar: function() {
      this.elementos.$botaoAgendarAgora
        .prop("disabled", false)
        .attr("aria-disabled", "false");
    },

    // Método \'desabilitarBotaoAgendar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    desabilitarBotaoAgendar: function() {
      this.elementos.$botaoAgendarAgora
        .prop("disabled", true)
        .attr("aria-disabled", "true");
    },

    // Método \'irParaAgendamento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    irParaAgendamento: function() {
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
