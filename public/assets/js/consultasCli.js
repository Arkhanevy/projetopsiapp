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

  var STATUS_BANCO = {
    esperando: "pendente",
    aceita: "agendada"
  };

  var NOMES_MES_COMPLETO = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  var TIPOS_USUARIO_PERMITIDOS = ["cliente", "clienteSimples"];

  var moduloConsultasCli = {

    configuracao: {
      urlObterConsultas:   "index.php?uri=cliente",
      urlCancelarConsulta: "index.php?uri=servico",
      urlLogin:            "index.php?uri=loginCliente"
    },



    elementos: {},

    consultasPorId: {},

    iniciar: function () {
      this.cachearElementos();
      this.registrarEventos();
    },

    tratarSessao: function (informacoes) {
      var tipoValido = informacoes && $.inArray(informacoes.tipoUsuario, TIPOS_USUARIO_PERMITIDOS) !== -1;

      if (!informacoes || !informacoes.logado || !tipoValido) {
        this.exibirModalSessaoExpirada();
        return;
      }

      this.buscarConsultas();
    },

    formatarDataHora: function (dataBanco, horaBanco) {
      var partes = String(dataBanco || "").split("-");
      var hora = String(horaBanco || "").slice(0, 5);
      var dia = parseInt(partes[2], 10);
      var mes = parseInt(partes[1], 10) - 1;

      if (!dia || isNaN(mes) || !NOMES_MES_COMPLETO[mes]) {
        return "—";
      }

      return dia + " de " + NOMES_MES_COMPLETO[mes] + (hora ? ", " + hora : "");
    },

    formatarPreco: function (valor) {
      var numero = Number(valor);

      if (valor === undefined || valor === null || valor === "" || isNaN(numero)) {
        return "";
      }

      return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\s/g, "");
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

      $(document).on("sessaoNavegacaoDefinida", function (evento, informacoes) {
        self.tratarSessao(informacoes);
      });

      this.elementos.$botaoRealizarLoginSessao.on("click", function () {
        window.location.href =
          self.configuracao.urlLogin + "&redirecionar=" + encodeURIComponent(window.location.href);
      });

      this.elementos.$grade.on("click", ".botaoCancelarConsulta", function () {
        self.abrirModalConfirmacao($(this).attr("data-idConsulta"), $(this).attr("data-nomeServico"));
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
        data: { acao: "MostrarConsulta" }
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

          self.consultasPorId = {};

          var consultas = (resposta.dados || []).map(function (c) {
            var consulta = {
              id: c.agnd_id,
              idProfissional: c.agnd_pro,
              idCliente: c.agnd_cli,
              idClinica: c.agnd_clin,
              idServico: c.agnd_ser,
              status: STATUS_BANCO[c.agnd_stat] || "pendente",
              nomeServico: c.ser_nome || "",
              nomeProfissional: c.pro_nome || "—",
              nomeClinica: c.clin_nome || "—",
              dataHora: self.formatarDataHora(c.agnd_dt, c.agnd_hrIni),
              preco: self.formatarPreco(c.ser_val)
            };

            self.consultasPorId[String(consulta.id)] = consulta;
            return consulta;
          });
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
        "data-idConsulta",
        consulta.id
      );

      $card.append($("<h2 class=\"tituloConsulta\"></h2>").text(consulta.nomeServico));

      var $linha = $('<div class="linhaConsulta d-flex justify-content-between"></div>');
      $linha.append($("<p class=\"dataHoraConsulta\"></p>").text(consulta.dataHora));
      if (consulta.preco) {
        $linha.append($("<p class=\"precoConsulta\"></p>").text(consulta.preco));
      }
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
            .attr("data-idConsulta", consulta.id)
            .attr("data-nomeServico", consulta.nomeServico)
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
      this.elementos.$modalConfirmar.data("idConsulta", idConsulta);
      this.elementos.$nomeConsultaParaCancelar.text(nomeServico);
      Utilitarios.exibirModal(this.elementos.$modalConfirmar);
    },

    confirmarCancelamento: function () {
      var self = this;
      var idConsulta = this.elementos.$modalConfirmar.data("idConsulta");
      var consulta = this.consultasPorId[String(idConsulta)];

      if (!consulta) {
        this.anunciar("Não foi possível cancelar a consulta. Tente novamente.");
        Utilitarios.esconderModal(this.elementos.$modalConfirmar);
        return;
      }

      this.elementos.$botaoConfirmarCancelamento.prop("disabled", true);

      $.ajax({
        url: this.configuracao.urlCancelarConsulta,
        method: "POST",
        dataType: "json",
        data: {
          acao: "cancelar",
          agnd_id: consulta.id,
          agnd_pro: consulta.idProfissional,
          agnd_cli: consulta.idCliente,
          agnd_clin: consulta.idClinica || 0,
          agnd_ser: consulta.idServico
        }
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
            var mensagemFalha = "Não foi possível cancelar a consulta. Tente novamente.";
            if (resposta && resposta.mensagem) {
              mensagemFalha = "Não foi possível cancelar a consulta. " + resposta.mensagem;
            }
            self.anunciar(mensagemFalha);
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
      var $card = this.elementos.$grade.find('[data-idConsulta="' + idConsulta + '"]');

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