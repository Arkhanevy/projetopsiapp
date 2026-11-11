(function ($, window) {
  "use strict";

  var moduloInicioPro = {

    configuracao: {
      tipoUsuario: null,
      urlConsultas: null,
      urlLogin: null,
      statusPermitidos: { aceita: "confirmada" },
      nomesMes: [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ],
      textos: {
        semConsultas: "Nenhuma consulta foi encontrada",
        erroCarregar: "Não foi possível carregar as consultas.",
        iconeSemConsultas: "event_busy",
        iconeErro: "error"
      }
    },

    elementos: {},
    modeloCard: null,

    iniciar: function (opcoes) {
      $.extend(this.configuracao, opcoes || {});
      this.cachearElementos();
      this.guardarModeloCard();
      this.registrarEventos();
      this.marcarCarregando(true);
    },

    cachearElementos: function () {
      this.elementos.$conteudo = $(".conteudoInicioPro");
      this.elementos.$statusPagina = $("#mensagemStatusInicioPro");
      this.elementos.$camposCabecalho = $(".cabecalhoInicioPro [data-campo]");
      this.elementos.$quantidade = $("[data-campo='quantidadeConsultasHoje']");
      this.elementos.$rotulo = $("[data-campo='rotuloConsultasHoje']");
      this.elementos.$lista = $("#listaAgendamentosPro");
      this.elementos.$estadoVazio = $("#estadoVazioAgendamentosPro");
      this.elementos.$iconeVazio = this.elementos.$estadoVazio.find(".estadoVazio_icone");
      this.elementos.$textoVazio = this.elementos.$estadoVazio.find(".estadoVazio_texto");
      this.elementos.$acoes = $("#acoesAgendamentosPro");
      this.elementos.$modalSessao = $("#modalSessaoExpirada");
      this.elementos.$modalCancelamento = $("#modalConfirmarCancelamento");
    },

    guardarModeloCard: function () {
      this.modeloCard = this.elementos.$lista.children().first().clone();
      this.modeloCard.attr("data-idConsulta", "");
    },

    registrarEventos: function () {
      var self = this;

      $(document).on("sessaoNavegacaoDefinida", function (evento, sessao) {
        self.aoDefinirSessao(sessao);
      });

      this.elementos.$modalCancelamento.on("show.bs.modal", function (evento) {
        self.prepararModalCancelamento(evento.relatedTarget);
      });

      $(document).on("click", "[data-acao='confirmarCancelamentoConsulta']", function () {
        var idConsulta = self.elementos.$modalCancelamento
          .find(".modalBase_conteudo")
          .attr("data-idConsulta");

        $(document).trigger("consultaCancelamentoConfirmado", { idConsulta: idConsulta });
      });

      $(document).on("click", "[data-acao='visualizarMaisConsultas']", function () {
        $(document).trigger("visualizarMaisSolicitado");
      });

      $("#botaoRealizarLoginSessao").on("click", function () {
        if (self.configuracao.urlLogin) {
          window.location.href = self.configuracao.urlLogin;
        }
      });
    },


    aoDefinirSessao: function (sessao) {
      var sessaoValida = sessao
        && sessao.logado
        && sessao.tipoUsuario === this.configuracao.tipoUsuario;

      if (!sessaoValida) {
        ElmoUtilitarios.exibirModal(this.elementos.$modalSessao);
        return;
      }

      this.carregarConsultas();
    },

    carregarConsultas: function () {
      var self = this;

      $.ajax({
        url: this.configuracao.urlConsultas,
        method: "POST",
        dataType: "json",
        data: { acao: "MostrarConsulta" }
      })
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso) {
            self.exibirErro("respostaInvalida");
            return;
          }

          self.exibirConsultas(self.filtrarConsultasDeHoje(resposta.dados || []));
        })
        .fail(function () {
          self.exibirErro("requisicao");
        });
    },

    obterDataHoje: function () {
      var agora = new Date();
      var mes = String(agora.getMonth() + 1).padStart(2, "0");
      var dia = String(agora.getDate()).padStart(2, "0");
      return agora.getFullYear() + "-" + mes + "-" + dia;
    },

    filtrarConsultasDeHoje: function (dados) {
      var hoje = this.obterDataHoje();

      return dados
        .filter(function (consulta) {
          return String(consulta.agnd_dt).substring(0, 10) === hoje;
        })
        .sort(function (a, b) {
          return String(a.agnd_hrIni).localeCompare(String(b.agnd_hrIni));
        });
    },

    formatarDataHora: function (data, horaInicio) {
      var partes = String(data).substring(0, 10).split("-");
      var dia = partes[2];
      var mes = this.configuracao.nomesMes[parseInt(partes[1], 10) - 1];
      var hora = String(horaInicio).substring(0, 5);

      return dia + " de " + mes + ", " + hora;
    },

    montarCard: function (consulta) {
      var $card = this.modeloCard.clone();
      var estado = this.configuracao.statusPermitidos[consulta.agnd_stat] || "pendente";

      $card.attr("data-idConsulta", consulta.agnd_id);
      $card.attr("data-estadoConsulta", estado);

      var dataHora = this.formatarDataHora(consulta.agnd_dt, consulta.agnd_hrIni);

      ElmoUtilitarios.preencherCampos($card.find("[data-campo]"), {
        nomeServico: consulta.ser_nome,
        dataHoraConsulta: dataHora
      });

      var complemento = " — " + consulta.ser_nome + ", " + dataHora;
      $card.find("[data-acao='cancelarConsulta']").attr("aria-label", "Cancelar consulta" + complemento);
      $card.find("[data-acao='reagendarConsulta']").attr("aria-label", "Reagendar consulta" + complemento);

      return $card;
    },

    atualizarContador: function (quantidade) {
      this.elementos.$quantidade.text(quantidade);
      this.elementos.$rotulo.text(quantidade === 1 ? "consulta" : "consultas");
    },

    exibirConsultas: function (consultas) {
      var self = this;
      var quantidade = consultas.length;

      this.atualizarContador(quantidade);
      this.marcarCarregando(false);

      if (quantidade === 0) {
        this.exibirEstadoVazio(this.configuracao.textos.iconeSemConsultas, this.configuracao.textos.semConsultas);
        this.elementos.$statusPagina.text(this.configuracao.textos.semConsultas + ".");
      } else {
        this.elementos.$lista.empty();

        $.each(consultas, function (indice, consulta) {
          self.elementos.$lista.append(self.montarCard(consulta));
        });

        this.elementos.$lista.removeAttr("hidden");
        this.elementos.$estadoVazio.attr("hidden", "hidden");
        this.elementos.$acoes.removeAttr("hidden");
        this.elementos.$statusPagina.text(
          quantidade + (quantidade === 1 ? " consulta hoje." : " consultas hoje.")
        );
      }

      $(document).trigger("consultasInicioCarregadas", { consultasHoje: quantidade });
    },

    exibirEstadoVazio: function (icone, texto) {
      this.elementos.$lista.attr("hidden", "hidden");
      this.elementos.$acoes.attr("hidden", "hidden");
      this.elementos.$iconeVazio.text(icone);
      this.elementos.$textoVazio.text(texto);
      this.elementos.$estadoVazio.removeAttr("hidden");
    },

    exibirErro: function (motivo) {
      this.elementos.$quantidade.text("—");
      this.elementos.$rotulo.text("consultas");
      this.marcarCarregando(false);
      this.exibirEstadoVazio(this.configuracao.textos.iconeErro, this.configuracao.textos.erroCarregar);
      this.elementos.$statusPagina.text(this.configuracao.textos.erroCarregar);

      $(document).trigger("consultasInicioFalhou", { motivo: motivo });
    },

    marcarCarregando: function (ativo) {
      var $lista = this.elementos.$lista;

      ElmoUtilitarios.alternarEsqueletoAcessivel(this.elementos.$camposCabecalho, ativo);
      this.elementos.$conteudo.attr("aria-busy", ativo ? "true" : "false");

      if (ativo) {
        $lista.addClass("estadoCarregando").attr("aria-busy", "true").attr("inert", "inert");
      } else {
        $lista.removeClass("estadoCarregando").attr("aria-busy", "false").removeAttr("inert");
      }
    },

    prepararModalCancelamento: function (botaoAcionador) {
      var $card = $(botaoAcionador).closest("[data-idConsulta]");
      var $conteudo = this.elementos.$modalCancelamento.find(".modalBase_conteudo");

      $conteudo.attr("data-idConsulta", $card.attr("data-idConsulta") || "");

      ElmoUtilitarios.preencherCampos($conteudo.find("[data-campo]"), {
        nomeServico: $card.find("[data-campo='nomeServico']").text()
      });
    }
  };

  window.InicioPro = {
    iniciar: function (opcoes) {
      moduloInicioPro.iniciar(opcoes);
    },
    fecharModalCancelamento: function () {
      ElmoUtilitarios.esconderModal(moduloInicioPro.elementos.$modalCancelamento);
    },
    recarregarConsultas: function () {
      moduloInicioPro.marcarCarregando(true);
      moduloInicioPro.carregarConsultas();
    }
  };

})(jQuery, window);
