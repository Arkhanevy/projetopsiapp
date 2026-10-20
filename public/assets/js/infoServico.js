/* ============================================================
   ARQUIVO: infoServico.js

   O QUE FAZ
   Tela de detalhes de um serviço: lê o id da URL, busca os dados no backend,
   preenche os campos da página e habilita o botão de agendar. Mostra modal de
   erro se o serviço não for encontrado e modal de sucesso após um agendamento
   (?agendado=1).

   OBSERVAÇÕES
   - Depende de jQuery, Bootstrap (modais) e ElmoUtilitarios (utilitarios.js,
     carregado antes).
   - Sem id numérico válido na URL, a tela cai direto no erro de serviço não
     encontrado.
   - Usa a rota index.php?uri=busca com acao=mostrardetalhes
     (buscacontroller.php).
   - formatarPreco() se repete em agendamentoCli.js e resultadosBusca.js.
   - O modal de sucesso remove ?agendado=1 da URL com history.replaceState
     para não reaparecer ao recarregar.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery e
     ElmoUtilitarios.
     - moduloInfoServico (objeto) — Módulo da página de detalhes do serviço.
       - moduloInfoServico.configuracao — URL do backend que devolve os
         detalhes do serviço.
       - moduloInfoServico.estado — Estado da tela: id do serviço exibido.
       - moduloInfoServico.elementos — Cache dos elementos jQuery da página.
       - moduloInfoServico.iniciar() — Guarda os elementos, valida o id da
         URL, registra eventos e busca os dados.
       - moduloInfoServico.registrarEventos() — Liga os cliques de 'Tentar
         novamente' e 'Agendar agora' e o foco do modal de erro.
       - moduloInfoServico.buscarDadosServico() — Pede os dados ao backend,
         controla os estados de carregamento/erro e preenche a tela.
       - moduloInfoServico.mapearDadosServico() — Converte o registro do
         backend (ser_*) nos campos exibidos na página.
       - moduloInfoServico.formatarPreco() — Formata um número como moeda
         brasileira (R$).
       - moduloInfoServico.tratarFalhaCarregamento() — Coloca o cartão em
         estado de erro e abre o modal de erro.
       - moduloInfoServico.exibirModalSucessoSeAgendado() — Se a URL tiver
         ?agendado=1, mostra o modal de sucesso e limpa o parâmetro da URL.
       - moduloInfoServico.exibirModalErro() — Desabilita o agendamento e abre
         o modal de serviço não encontrado (sem fechar por fora).
       - moduloInfoServico.habilitarBotaoAgendar() — Habilita o botão 'Agendar
         agora' (disabled e aria-disabled).
       - moduloInfoServico.desabilitarBotaoAgendar() — Desabilita o botão
         'Agendar agora' (disabled e aria-disabled).
       - moduloInfoServico.irParaAgendamento() — Redireciona para a tela de
         agendamento levando o id do serviço.
     - Callback do document ready — Executa moduloInfoServico.iniciar() quando
       o DOM estiver pronto.
   ============================================================ */

/** Função autoexecutável que isola o escopo e recebe jQuery e ElmoUtilitarios. */
(function ($, Utilitarios) {
  "use strict";

  /** Módulo da página de detalhes do serviço. */
  var moduloInfoServico = {

    /** URL do backend que devolve os detalhes do serviço. */
    configuracao: {
      urlObterServico: "index.php?uri=busca" // buscacontroller.php: acao "mostrardetalhes"
    },

    /** Estado da tela: id do serviço exibido. */
    estado: {
      idServico: null
    },
    /** Cache dos elementos jQuery da página. */
    elementos: {},

    /** Guarda os elementos, valida o id da URL, registra eventos e busca os dados. */
    iniciar: function () {
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

    /** Liga os cliques de 'Tentar novamente' e 'Agendar agora' e o foco do modal de erro. */
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

    /** Pede os dados ao backend, controla os estados de carregamento/erro e preenche a tela. */
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

    /** Converte o registro do backend (ser_*) nos campos exibidos na página. */
    mapearDadosServico: function (registro) {
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

    /** Formata um número como moeda brasileira (R$). */
    formatarPreco: function (valor) {
      var numero = Number(valor);
      if (isNaN(numero)) {
        return "";
      }
      return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    /** Coloca o cartão em estado de erro e abre o modal de erro. */
    tratarFalhaCarregamento: function () {
      this.elementos.$cartaoServico
        .removeClass("estadoCarregando")
        .addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.exibirModalErro();
    },

    /** Se a URL tiver ?agendado=1, mostra o modal de sucesso e limpa o parâmetro da URL. */
    exibirModalSucessoSeAgendado: function () {
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

    /** Desabilita o agendamento e abre o modal de serviço não encontrado (sem fechar por fora). */
    exibirModalErro: function () {
      this.desabilitarBotaoAgendar();
      Utilitarios.exibirModal(this.elementos.$modalErro, {
        backdrop: "static",
        keyboard: false
      });
    },

    /** Habilita o botão 'Agendar agora' (disabled e aria-disabled). */
    habilitarBotaoAgendar: function () {
      this.elementos.$botaoAgendarAgora
        .prop("disabled", false)
        .attr("aria-disabled", "false");
    },

    /** Desabilita o botão 'Agendar agora' (disabled e aria-disabled). */
    desabilitarBotaoAgendar: function () {
      this.elementos.$botaoAgendarAgora
        .prop("disabled", true)
        .attr("aria-disabled", "true");
    },

    /** Redireciona para a tela de agendamento levando o id do serviço. */
    irParaAgendamento: function () {
      var url = "index.php?uri=agendamentoCli";
      if (this.estado.idServico) {
        url += "&servico=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url; 
    }
  };

  /** Executa moduloInfoServico.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloInfoServico.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
