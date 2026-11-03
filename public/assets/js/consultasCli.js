(function ($, Utilitarios) {
  "use strict";

  var INFORMACOES_STATUS = {
    pendente: {
      classe: "badgeStatusPendente",
      titulo: "Pendente",
      icone: "autorenew",
      descricao: "Essa consulta está esperando o profissional aceite realizar o procedimento."
    },
    agendada: {
      classe: "badgeStatusAgendada",
      titulo: "Agendada",
      icone: "check_circle",
      descricao: "Essa consulta foi confirmada pelo profissional e está garantida na agenda."
    },
    cancelada: {
      classe: "badgeStatusCancelada",
      titulo: "Cancelada",
      icone: "cancel",
      descricao: "Essa consulta foi cancelada e não consta mais na agenda do profissional."
    }
  };

  var moduloConsultasCli = {

    configuracao: {
      urlVerificarSessao: "/backend/verificarSessao.php",
      urlObterConsultas: "app/controllers/Servicocontroller.php",
      urlCancelarConsulta: "/backend/cancelarConsulta.php",
      urlLogin: "/login/index.html"
    },

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      this.registrarEventos();

    },

    cachearElementos: function () {
      this.elementos.$grade = $("#gradeConsultas");
      this.elementos.$estadoVazio = $("#estadoVazioConsultas");
      this.elementos.$textoEstadoVazio = this.elementos.$estadoVazio.find(".textoEstadoVazio");
      this.textoEstadoVazioOriginal = this.elementos.$textoEstadoVazio.html();

      this.elementos.$modalSessaoExpirada = $("#modalSessaoExpirada");
      this.elementos.$botaoRealizarLoginSessao = $("#botaoRealizarLoginSessao");

      this.elementos.$modalConfirmar = $("#modalConfirmarCancelamento");
      this.elementos.$nomeConsultaParaCancelar = $("#nomeConsultaParaCancelar");
      this.elementos.$botaoConfirmarCancelamento = $("#botaoConfirmarCancelamento");

      this.elementos.$mensagemStatus = $("#mensagemStatusConsultas");
    },

    anunciar: function (mensagem) {
      this.elementos.$mensagemStatus.text(mensagem);
    },

    registrarEventos: function () {
      var self = this;

      this.elementos.$botaoRealizarLoginSessao.on("click", function () {
        window.location.href =
          self.configuracao.urlLogin + "?redirecionar=" + encodeURIComponent(window.location.href);
      });

      this.elementos.$grade.on("click", ".botaoCancelarConsulta", function () {
        self.abrirModalConfirmacao($(this).data("consultaId"), $(this).data("nomeServico"));
      });

      this.elementos.$botaoConfirmarCancelamento.on("click", function () {
        self.confirmarCancelamento();
      });
    },

    exibirModalSessaoExpirada: function () {
      this.elementos.$grade.removeClass("estadoCarregando").attr("hidden", "hidden");
      Utilitarios.exibirModal(this.elementos.$modalSessaoExpirada, {
        backdrop: "static",
        keyboard: false
      });
    },

    buscarConsultas: function () {
      var self = this;

      $.ajax({
        url: this.configuracao.urlObterConsultas,
        method: "POST",
        dataType: "json",
        data: {
          acao: "mostrarservico"
        }
      })
        .done(function (resposta) {
          self.elementos.$grade.removeClass("estadoCarregando");

          if (!resposta || !resposta.sucesso) {
            var mensagemErroResposta =
              "Não foi possível carregar suas consultas. Tente novamente mais tarde.";
            self.exibirEstadoVazio(mensagemErroResposta);
            self.anunciar(mensagemErroResposta);
            return;
          }

          var consultas = resposta.dados.consultas || [];
          if (!consultas.length) {
            self.exibirEstadoVazio();
            self.anunciar("Nenhuma consulta agendada.");
            return;
          }

          self.renderizarConsultas(consultas);
          var mensagem;
          if (consultas.length === 1) {
            mensagem = "1 consulta carregada.";
          } else {
            mensagem = consultas.length + " consultas carregadas.";
          }
          self.anunciar(mensagem);
        })
        .fail(function () {
          self.elementos.$grade.removeClass("estadoCarregando");
          var mensagemErro = "Não foi possível carregar suas consultas. Tente novamente mais tarde.";
          self.exibirEstadoVazio(mensagemErro);
          self.anunciar(mensagemErro);
        });
    },

    exibirEstadoVazio: function (mensagemPersonalizada) {
      this.elementos.$grade.empty().attr("hidden", "hidden");

      if (mensagemPersonalizada) {
        this.elementos.$textoEstadoVazio.text(mensagemPersonalizada);
      } else {
        this.elementos.$textoEstadoVazio.html(this.textoEstadoVazioOriginal);
      }

      this.elementos.$estadoVazio.removeAttr("hidden");
    },

    renderizarConsultas: function (consultas) {
      var self = this;

      this.elementos.$estadoVazio.attr("hidden", "hidden");
      this.elementos.$grade.removeAttr("hidden").empty();

      consultas.forEach(function (consulta) {
        self.elementos.$grade.append(self.construirCartaoConsulta(consulta));
      });

      this.inicializarPopovers();
    },

    construirCartaoConsulta: function (consulta) {
      var infoStatus = this.obterInfoStatus(consulta.status);

      var $card = $('<article class="cartaoConsulta"></article>').attr(
        "data-consulta-id",
        consulta.id
      );

      $card.append($("<h2 class=\"tituloConsulta\"></h2>").text(consulta.nomeServico));

      var $linha = $('<div class="linhaConsulta d-flex justify-content-between"></div>');
      $linha.append($("<p class=\"dataHoraConsulta\"></p>").text(consulta.dataHora));
      $linha.append($("<p class=\"precoConsulta\"></p>").text(consulta.preco));
      $card.append($linha);

      $card.append(
        $("<p class=\"profissionalConsulta\"></p>")
          .append("<strong>Profissional:</strong> ")
          .append(document.createTextNode(consulta.nomeProfissional))
      );
      $card.append(
        $("<p class=\"clinicaConsulta\"></p>")
          .append("<strong>Clínica:</strong> ")
          .append(document.createTextNode(consulta.nomeClinica))
      );

      var $rodape = $(
        '<div class="rodapeConsulta d-flex justify-content-between align-items-center"></div>'
      );

      if (consulta.status !== "cancelada") {
        $rodape.append(
          $(
            '<button type="button" class="botaoCancelarConsulta botaoCancelar btn rounded-pill"></button>'
          )
            .attr("data-consulta-id", consulta.id)
            .attr("data-nome-servico", consulta.nomeServico)
            .append('<span class="material-symbols-outlined" aria-hidden="true">cancel</span> Cancelar')
        );
      }

      $rodape.append(this.construirBadgeStatus(infoStatus));
      $card.append($rodape);

      return $card;
    },

    obterInfoStatus: function (status) {
      return INFORMACOES_STATUS[status] || INFORMACOES_STATUS.pendente;
    },

    construirBadgeStatus: function (infoStatus) {
      return $('<button type="button" class="badgeStatus"></button>')
        .addClass(infoStatus.classe)
        .attr("data-bs-toggle", "popover")
        .attr("data-bs-trigger", "hover focus click")
        .attr("data-bs-placement", "top")
        .attr("data-bs-title", infoStatus.titulo)
        .attr("data-bs-content", infoStatus.descricao)
        .append(
          '<span class="material-symbols-outlined" aria-hidden="true">' +
            infoStatus.icone +
            "</span> " +
            infoStatus.titulo
        );
    },

    inicializarPopovers: function () {
      this.elementos.$grade.find('[data-bs-toggle="popover"]').each(function () {
        if (!bootstrap.Popover.getInstance(this)) {
          new bootstrap.Popover(this);
        }
      });
    },

    abrirModalConfirmacao: function (idConsulta, nomeServico) {
      this.elementos.$modalConfirmar.data("consultaId", idConsulta);
      this.elementos.$nomeConsultaParaCancelar.text(nomeServico);
      Utilitarios.exibirModal(this.elementos.$modalConfirmar);
    },

    confirmarCancelamento: function () {
      var self = this;
      var idConsulta = this.elementos.$modalConfirmar.data("consultaId");

      this.elementos.$botaoConfirmarCancelamento.prop("disabled", true);

      $.ajax({
        url: this.configuracao.urlCancelarConsulta,
        method: "POST",
        dataType: "json",
        data: { id: idConsulta }
      })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            var $badgeNovo = self.atualizarCardComoCancelado(idConsulta);
            self.elementos.$modalConfirmar.one("hidden.bs.modal", function () {
              if ($badgeNovo) {
                $badgeNovo.trigger("focus");
              }
            });

            self.anunciar("Consulta cancelada com sucesso.");
          } else {
            self.anunciar("Não foi possível cancelar a consulta. Tente novamente.");
          }
          Utilitarios.esconderModal(self.elementos.$modalConfirmar);
        })
        .fail(function () {
          self.anunciar("Não foi possível cancelar a consulta. Tente novamente.");
          Utilitarios.esconderModal(self.elementos.$modalConfirmar);
        })
        .always(function () {
          self.elementos.$botaoConfirmarCancelamento.prop("disabled", false);
        });
    },

    atualizarCardComoCancelado: function (idConsulta) {
      var infoStatus = this.obterInfoStatus("cancelada");
      var $card = this.elementos.$grade.find('[data-consulta-id="' + idConsulta + '"]');

      if (!$card.length) {
        return null;
      }

      $card.find(".botaoCancelarConsulta").remove();

      var $badgeAntigo = $card.find(".badgeStatus");
      var instanciaAntiga = bootstrap.Popover.getInstance($badgeAntigo[0]);
      if (instanciaAntiga) {
        instanciaAntiga.dispose();
      }

      var $badgeNovo = this.construirBadgeStatus(infoStatus);
      $badgeAntigo.replaceWith($badgeNovo);
      new bootstrap.Popover($badgeNovo[0]);

      return $badgeNovo;
    }
  };

  $(function () {
    moduloConsultasCli.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
