/* ============================================================
   ARQUIVO: consultasCli.js

   O QUE FAZ
   Tela 'Minhas consultas' do cliente: lista as consultas em cartões (com
   status pendente/agendada/cancelada), permite cancelar uma consulta após
   confirmação em modal e anuncia as mudanças para leitores de tela.

   OBSERVAÇÕES
   - ATENÇÃO: em iniciar() a chamada this.verificarSessaoEBuscarConsultas()
     está comentada, e a função também está comentada. Resultado:
     buscarConsultas() nunca é chamada e a lista não carrega.
   - As URLs de configuracao são antigas/provisórias
     (/backend/verificarSessao.php, /backend/cancelarConsulta.php,
     /login/index.html, marcadas //Axalote), diferentes do padrão
     index.php?uri=... das outras telas.
   - Depende de jQuery, Bootstrap (modais e popovers) e ElmoUtilitarios
     (utilitarios.js).
   - Os cartões são montados com .text() e createTextNode, então os dados do
     servidor não entram como HTML.
   - Formato esperado de cada consulta (id, nomeServico, dataHora, preco,
     nomeProfissional, nomeClinica, status) está documentado em
     construirCartaoConsulta.
   - O status 'realizada' (usado em componentes.js) não existe aqui: status
     desconhecido cai em 'pendente'.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery e
     ElmoUtilitarios.
     - INFORMACOES_STATUS (objeto) — Tabela de status da consulta: classe CSS,
       título, ícone e descrição do popover.
     - moduloConsultasCli (objeto) — Módulo da página de consultas do cliente.
       - moduloConsultasCli.configuracao — URLs de sessão, listagem,
         cancelamento e login.
       - moduloConsultasCli.elementos — Cache dos elementos jQuery da página.
       - moduloConsultasCli.iniciar() — Guarda os elementos e registra os
         eventos (a carga das consultas está desativada).
       - moduloConsultasCli.cachearElementos() — Busca no DOM grade, estado
         vazio, modais, botões e região de status.
       - moduloConsultasCli.anunciar() — Escreve uma mensagem na região de
         status para leitores de tela.
       - moduloConsultasCli.registrarEventos() — Liga o botão de login (sessão
         expirada), os botões de cancelar da grade e a confirmação do
         cancelamento.
       - moduloConsultasCli.exibirModalSessaoExpirada() — Esconde a grade e
         abre o modal de sessão expirada (sem fechar por fora).
       - moduloConsultasCli.buscarConsultas() — Pede as consultas ao backend e
         mostra a lista, o estado vazio ou uma mensagem de erro.
       - moduloConsultasCli.exibirEstadoVazio() — Esconde a grade e mostra o
         estado vazio, com o texto padrão ou uma mensagem de erro.
       - moduloConsultasCli.renderizarConsultas() — Monta um cartão por
         consulta na grade e ativa os popovers.
       - moduloConsultasCli.construirCartaoConsulta() — Cria o cartão de uma
         consulta (título, data, preço, profissional, clínica, botão cancelar
         e badge de status).
       - moduloConsultasCli.obterInfoStatus() — Devolve os dados do status;
         desconhecido vira 'pendente'.
       - moduloConsultasCli.construirBadgeStatus() — Cria o botão-badge de
         status com popover explicativo.
       - moduloConsultasCli.inicializarPopovers() — Cria os popovers Bootstrap
         ainda não inicializados na grade.
       - moduloConsultasCli.abrirModalConfirmacao() — Guarda o id da consulta,
         mostra o nome do serviço e abre o modal de confirmação de
         cancelamento.
       - moduloConsultasCli.confirmarCancelamento() — Envia o cancelamento ao
         backend, atualiza o cartão em caso de sucesso e anuncia o resultado.
       - moduloConsultasCli.atualizarCardComoCancelado() — Remove o botão
         cancelar do cartão e troca o badge para 'Cancelada'; devolve o novo
         badge para receber o foco.
     - Callback do document ready — Executa moduloConsultasCli.iniciar()
       quando o DOM estiver pronto.
   ============================================================ */

/** Função autoexecutável que isola o escopo e recebe jQuery e ElmoUtilitarios. */
(function ($, Utilitarios) {
  "use strict";

  /** Tabela de status da consulta: classe CSS, título, ícone e descrição do popover. */
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

  /** Módulo da página de consultas do cliente. */
  var moduloConsultasCli = {

    /** URLs de sessão, listagem, cancelamento e login. */
    configuracao: {
      urlVerificarSessao: "/backend/verificarSessao.php", //Axalote
      urlObterConsultas: "app/controllers/Servicocontroller.php",
      urlCancelarConsulta: "/backend/cancelarConsulta.php", //Axalote
      urlLogin: "/login/index.html" //Axalote
    },

    /** Cache dos elementos jQuery da página. */
    elementos: {},

    /** Guarda os elementos e registra os eventos (a carga das consultas está desativada). */
    iniciar: function () {
      this.cachearElementos();
      this.registrarEventos();
      //this.verificarSessaoEBuscarConsultas();
    },

    /** Busca no DOM grade, estado vazio, modais, botões e região de status. */
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

    /** Escreve uma mensagem na região de status para leitores de tela. */
    anunciar: function (mensagem) {
      this.elementos.$mensagemStatus.text(mensagem);
    },

    /**
     * Liga o botão de login (sessão expirada), os botões de cancelar da grade e a confirmação do
     * cancelamento.
     */
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

    /*verificarSessaoEBuscarConsultas: function () {
      var self = this;

      $.ajax({
        url: this.configuracao.urlVerificarSessao,
        method: "GET",
        dataType: "json"
      })
        .done(function (resposta) {
          if (resposta && resposta.logado) {
            self.buscarConsultas();
          } else {
            self.exibirModalSessaoExpirada();
          }
        })
        .fail(function () {
          self.exibirModalSessaoExpirada();
        });
    },*/

    /** Esconde a grade e abre o modal de sessão expirada (sem fechar por fora). */
    exibirModalSessaoExpirada: function () {
      this.elementos.$grade.removeClass("estadoCarregando").attr("hidden", "hidden");
      Utilitarios.exibirModal(this.elementos.$modalSessaoExpirada, {
        backdrop: "static",
        keyboard: false
      });
    },

    /** Pede as consultas ao backend e mostra a lista, o estado vazio ou uma mensagem de erro. */
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

    /** Esconde a grade e mostra o estado vazio, com o texto padrão ou uma mensagem de erro. */
    exibirEstadoVazio: function (mensagemPersonalizada) {
      this.elementos.$grade.empty().attr("hidden", "hidden");

      if (mensagemPersonalizada) {
        this.elementos.$textoEstadoVazio.text(mensagemPersonalizada);
      } else {
        this.elementos.$textoEstadoVazio.html(this.textoEstadoVazioOriginal);
      }

      this.elementos.$estadoVazio.removeAttr("hidden");
    },


    /** Monta um cartão por consulta na grade e ativa os popovers. */
    renderizarConsultas: function (consultas) {
      var self = this;

      this.elementos.$estadoVazio.attr("hidden", "hidden");
      this.elementos.$grade.removeAttr("hidden").empty();

      consultas.forEach(function (consulta) {
        self.elementos.$grade.append(self.construirCartaoConsulta(consulta));
      });

      this.inicializarPopovers();
    },

    /**
     * Cria o cartão de uma consulta (título, data, preço, profissional, clínica, botão cancelar e
     * badge de status).
     */
    /**
     * Convenção do objeto "consulta" vindo do PHP:
     * {
     *   id: 1,
     *   nomeServico: "Tratamento de unha encravada",
     *   dataHora: "17 de junho, 08:00",
     *   preco: "R$12,50",
     *   nomeProfissional: "Samanta Santos",
     *   nomeClinica: "Girasol",
     *   status: "pendente" | "agendada" | "cancelada"
     * }
     */
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

    /** Devolve os dados do status; desconhecido vira 'pendente'. */
    obterInfoStatus: function (status) {
      return INFORMACOES_STATUS[status] || INFORMACOES_STATUS.pendente;
    },

    /** Cria o botão-badge de status com popover explicativo. */
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

    /** Cria os popovers Bootstrap ainda não inicializados na grade. */
    inicializarPopovers: function () {
      this.elementos.$grade.find('[data-bs-toggle="popover"]').each(function () {
        if (!bootstrap.Popover.getInstance(this)) {
          new bootstrap.Popover(this);
        }
      });
    },

    /**
     * Guarda o id da consulta, mostra o nome do serviço e abre o modal de confirmação de
     * cancelamento.
     */
    abrirModalConfirmacao: function (idConsulta, nomeServico) {
      this.elementos.$modalConfirmar.data("consultaId", idConsulta);
      this.elementos.$nomeConsultaParaCancelar.text(nomeServico);
      Utilitarios.exibirModal(this.elementos.$modalConfirmar);
    },

    /**
     * Envia o cancelamento ao backend, atualiza o cartão em caso de sucesso e anuncia o resultado.
     */
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

    /**
     * Remove o botão cancelar do cartão e troca o badge para 'Cancelada'; devolve o novo badge para
     * receber o foco.
     */
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

  /** Executa moduloConsultasCli.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloConsultasCli.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
