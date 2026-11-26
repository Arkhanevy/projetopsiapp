(function ($, window) {
  "use strict";

  const moduloInicioPro = {

    configuracao: {
      tipoUsuario: null,
      urlConsultas: null,
      urlServico: "index.php?uri=servico",
      urlLogin: null,
      statusPermitidos: { aceita: "confirmada" },
      // Valores gravados em atendimento.atd_stat (iguais aos usados pelo relatório do backend).
      statusAtendimento: { atendido: "atendido", naoCompareceu: "não compareceu" },
      // Momento em que "Atendido" / "Não compareceu" substituem Cancelar / Reagendar:
      // "inicio" (hora marcada) ou "termino" (fim da consulta).
      momentoLiberacaoAtendimento: "inicio",
      intervaloVerificacaoHorario: 60000,
      nomesMes: [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ],
      textos: {
        semConsultas: "Nenhuma consulta foi encontrada",
        erroCarregar: "Não foi possível carregar as consultas.",
        iconeSemConsultas: "event_busy",
        iconeErro: "error",
        rotuloAtendido: "Atendido",
        rotuloNaoCompareceu: "Não compareceu",
        iconeAtendido: "check_circle",
        iconeNaoCompareceu: "person_off",
        erroAtendimento: "Não foi possível registrar o atendimento. Tente novamente."
      }
    },

    elementos: {},
    modeloCard: null,
    consultasPorId: {},
    temporizadorHorario: null,

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
      const self = this;

      $(document).on("sessaoNavegacaoDefinida", function (evento, sessao) {
        self.aoDefinirSessao(sessao);
      });

      this.elementos.$modalCancelamento.on("show.bs.modal", function (evento) {
        self.prepararModalCancelamento(evento.relatedTarget);
      });

      $(document).on("click", "[data-acao='confirmarCancelamentoConsulta']", function () {
        const idConsulta = self.elementos.$modalCancelamento
          .find(".modalBase_conteudo")
          .attr("data-idConsulta");

        $(document).trigger("consultaCancelamentoConfirmado", { idConsulta: idConsulta });
      });

      $(document).on("click", "[data-acao='marcarAtendido']", function () {
        self.registrarAtendimento($(this), self.configuracao.statusAtendimento.atendido);
      });

      $(document).on("click", "[data-acao='marcarNaoCompareceu']", function () {
        self.registrarAtendimento($(this), self.configuracao.statusAtendimento.naoCompareceu);
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
      const sessaoValida = sessao
        && sessao.logado
        && sessao.tipoUsuario === this.configuracao.tipoUsuario;

      if (!sessaoValida) {
        ElmoUtilitarios.exibirModal(this.elementos.$modalSessao);
        return;
      }

      this.carregarConsultas();
    },

    carregarConsultas: function () {
      const self = this;

      $.ajax({
        url: this.configuracao.urlConsultas,
        method: "POST",
        dataType: "json",
        data: { acao: "MostrarConsulta", somenteAceitas: 0 }
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
      const agora = new Date();
      const mes = String(agora.getMonth() + 1).padStart(2, "0");
      const dia = String(agora.getDate()).padStart(2, "0");
      return agora.getFullYear() + "-" + mes + "-" + dia;
    },

    filtrarConsultasDeHoje: function (dados) {
      const hoje = this.obterDataHoje();

      return dados
        .filter(function (consulta) {
          return String(consulta.agnd_dt).substring(0, 10) === hoje;
        })
        .sort(function (a, b) {
          return String(a.agnd_hrIni).localeCompare(String(b.agnd_hrIni));
        });
    },

    formatarDataHora: function (data, horaInicio) {
      const partes = String(data).substring(0, 10).split("-");
      const dia = partes[2];
      const mes = this.configuracao.nomesMes[parseInt(partes[1], 10) - 1];
      const hora = String(horaInicio).substring(0, 5);

      return dia + " de " + mes + ", " + hora;
    },

    montarCard: function (consulta) {
      const $card = this.modeloCard.clone();
      const estado = this.configuracao.statusPermitidos[consulta.agnd_stat] || "pendente";

      $card.attr("data-idConsulta", consulta.agnd_id);
      $card.attr("data-estadoConsulta", estado);
      this.consultasPorId[String(consulta.agnd_id)] = consulta;

      const dataHora = this.formatarDataHora(consulta.agnd_dt, consulta.agnd_hrIni);

      ElmoUtilitarios.preencherCampos($card.find("[data-campo]"), {
        nomeServico: consulta.ser_nome,
        dataHoraConsulta: dataHora
      });

      const complemento = " — " + consulta.ser_nome + ", " + dataHora;
      $card.find("[data-acao='cancelarConsulta']").attr("aria-label", "Cancelar consulta" + complemento);
      $card.find("[data-acao='reagendarConsulta']").attr("aria-label", "Reagendar consulta" + complemento);

      if (this.podeRegistrarAtendimento(consulta)) {
        this.trocarBotoesPorAtendimento($card, complemento);
      }

      return $card;
    },

    // ---- Atendimento: Atendido / Não compareceu ----
    obterMomentoLiberacao: function (consulta) {
      const hora = this.configuracao.momentoLiberacaoAtendimento === "termino" ? consulta.agnd_hrTerm : consulta.agnd_hrIni;
      let horario = String(hora || "").substring(0, 8);
      let momento;

      if (horario.length === 5) {
        horario += ":00";
      }
      momento = new Date(String(consulta.agnd_dt).substring(0, 10) + "T" + horario);

      return isNaN(momento.getTime()) ? null : momento;
    },

    // Só o profissional registra, só em consulta aceita e só depois do horário marcado.
    podeRegistrarAtendimento: function (consulta) {
      const momento = this.obterMomentoLiberacao(consulta);

      if (this.configuracao.tipoUsuario !== "profissional") {
        return false;
      }
      if (this.configuracao.statusPermitidos[consulta.agnd_stat] !== "confirmada") {
        return false;
      }
      return momento !== null && new Date() >= momento;
    },

    // Mantém as classes do botão original (tamanho, etc.) e só troca a variação de cor.
    criarBotaoAtendimento: function ($modelo, acao, variacao, icone, rotulo, complemento) {
      const classes = ($modelo.attr("class") || "btn botaoBase botaoBase--compacto")
        .replace(/botaoBase--(primario|secundario|opositora|extra)/g, "")
        .replace(/\s+/g, " ");
      const $botao = $("<button>")
        .attr({ type: "button", "data-acao": acao, "aria-label": rotulo + complemento })
        .addClass($.trim(classes) + " botaoBase--" + variacao);

      if ($modelo.find(".material-symbols-outlined").length) {
        $botao.append($("<span>").addClass("material-symbols-outlined").attr("aria-hidden", "true").text(icone));
      }
      $botao.append(document.createTextNode(rotulo));

      return $botao;
    },

    trocarBotoesPorAtendimento: function ($card, complemento) {
      const textos = this.configuracao.textos;
      const $cancelar = $card.find("[data-acao='cancelarConsulta']");
      const $reagendar = $card.find("[data-acao='reagendarConsulta']");
      let $atendido;
      let $naoCompareceu;

      if ($card.attr("data-acoesAtendimento") === "1" || (!$cancelar.length && !$reagendar.length)) {
        return;
      }

      $atendido = this.criarBotaoAtendimento(
        $cancelar.length ? $cancelar : $reagendar, "marcarAtendido", "primario", textos.iconeAtendido, textos.rotuloAtendido, complemento
      );
      $naoCompareceu = this.criarBotaoAtendimento(
        $reagendar.length ? $reagendar : $cancelar, "marcarNaoCompareceu", "opositora", textos.iconeNaoCompareceu, textos.rotuloNaoCompareceu, complemento
      );

      if ($cancelar.length && $reagendar.length) {
        $cancelar.replaceWith($atendido);
        $reagendar.replaceWith($naoCompareceu);
      } else {
        $cancelar.add($reagendar).first().replaceWith($atendido);
        $atendido.after($naoCompareceu);
      }

      $card.attr("data-acoesAtendimento", "1");
    },

    extrairJson: function (texto) {
      const conteudo = String(texto || "");
      const inicio = conteudo.indexOf("{");

      return inicio > 0 ? conteudo.slice(inicio) : conteudo;
    },

    registrarAtendimento: function ($botao, tipo) {
      const self = this;
      const $card = $botao.closest("[data-idConsulta]");
      const consulta = this.consultasPorId[String($card.attr("data-idConsulta"))];
      const $acoes = $card.find("[data-acao='marcarAtendido'], [data-acao='marcarNaoCompareceu']");
      let dados;

      if (!consulta || $card.attr("data-registrando") === "1") {
        return;
      }

      dados = {
        acao: "atendimento",
        agnd_id: consulta.agnd_id,
        agnd_pro: consulta.agnd_pro,
        agnd_cli: consulta.agnd_cli || "",
        agnd_ser: consulta.agnd_ser,
        tipo: tipo
      };
      // Sem clínica o campo não vai: o backend assume 0, como já faz no cancelamento.
      if (consulta.agnd_clin) {
        dados.agnd_clin = consulta.agnd_clin;
      }

      $card.attr({ "data-registrando": "1", "aria-busy": "true" });
      $acoes.prop("disabled", true);
      $card.find("[data-campo='erroAtendimento']").remove();

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "text",
        data: dados
      })
        .done(function (texto) {
          let resposta = null;

          // O backend pode imprimir avisos do PHP antes do JSON.
          try {
            resposta = JSON.parse(self.extrairJson(texto));
          } catch (erro) {
            resposta = null;
          }

          if (resposta && resposta.sucesso === true) {
            self.aoRegistrarAtendimento($card, consulta, tipo);
          } else {
            self.aoFalharAtendimento($card, $acoes);
          }
        })
        .fail(function () {
          self.aoFalharAtendimento($card, $acoes);
        })
        .always(function () {
          $card.removeAttr("data-registrando").attr("aria-busy", "false");
        });
    },

    aoRegistrarAtendimento: function ($card, consulta, tipo) {
      const textos = this.configuracao.textos;
      const rotulo = tipo === this.configuracao.statusAtendimento.atendido ? textos.rotuloAtendido : textos.rotuloNaoCompareceu;
      const $acoes = $card.find("[data-acao='marcarAtendido'], [data-acao='marcarNaoCompareceu']");
      const $resultado = $("<p>")
        .addClass("mb-0 fw-bold")
        .attr({ "data-campo": "resultadoAtendimento", role: "status" })
        .text(rotulo);

      consulta.atendimentoRegistrado = tipo;
      $card.attr("data-atendimento", tipo);
      $acoes.first().before($resultado);
      $acoes.remove();
      this.elementos.$statusPagina.text(rotulo + " registrado.");

      $(document).trigger("atendimentoRegistrado", { idConsulta: consulta.agnd_id, tipo: tipo });
    },

    aoFalharAtendimento: function ($card, $acoes) {
      const mensagem = this.configuracao.textos.erroAtendimento;

      $acoes.prop("disabled", false);
      $acoes.last().after(
        $("<p>").addClass("text-danger small mb-0").attr({ "data-campo": "erroAtendimento", role: "alert" }).text(mensagem)
      );
      this.elementos.$statusPagina.text(mensagem);
    },

    // Consultas que passam do horário com a página aberta também trocam os botões.
    atualizarCardsPorHorario: function () {
      const self = this;

      this.elementos.$lista.children("[data-idConsulta]").each(function () {
        const $card = $(this);
        const consulta = self.consultasPorId[String($card.attr("data-idConsulta"))];

        if (consulta && !$card.attr("data-atendimento") && self.podeRegistrarAtendimento(consulta)) {
          self.trocarBotoesPorAtendimento(
            $card,
            " — " + consulta.ser_nome + ", " + self.formatarDataHora(consulta.agnd_dt, consulta.agnd_hrIni)
          );
        }
      });
    },

    iniciarVerificacaoHorario: function () {
      const self = this;

      window.clearInterval(this.temporizadorHorario);
      this.temporizadorHorario = window.setInterval(function () {
        self.atualizarCardsPorHorario();
      }, this.configuracao.intervaloVerificacaoHorario);
    },

    atualizarContador: function (quantidade) {
      this.elementos.$quantidade.text(quantidade);
      this.elementos.$rotulo.text(quantidade === 1 ? "consulta" : "consultas");
    },

    exibirConsultas: function (consultas) {
      const self = this;
      const quantidade = consultas.length;

      this.atualizarContador(quantidade);
      this.marcarCarregando(false);

      if (quantidade === 0) {
        this.exibirEstadoVazio(this.configuracao.textos.iconeSemConsultas, this.configuracao.textos.semConsultas);
        this.elementos.$statusPagina.text(this.configuracao.textos.semConsultas + ".");
      } else {
        this.elementos.$lista.empty();
        this.consultasPorId = {};

        $.each(consultas, function (indice, consulta) {
          self.elementos.$lista.append(self.montarCard(consulta));
        });

        this.elementos.$lista.removeAttr("hidden");
        this.elementos.$estadoVazio.attr("hidden", "hidden");
        this.elementos.$acoes.removeAttr("hidden");
        this.elementos.$statusPagina.text(
          quantidade + (quantidade === 1 ? " consulta hoje." : " consultas hoje.")
        );
        this.iniciarVerificacaoHorario();
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
      const $lista = this.elementos.$lista;

      ElmoUtilitarios.alternarEsqueletoAcessivel(this.elementos.$camposCabecalho, ativo);
      this.elementos.$conteudo.attr("aria-busy", ativo ? "true" : "false");

      if (ativo) {
        $lista.addClass("estadoCarregando").attr("aria-busy", "true").attr("inert", "inert");
      } else {
        $lista.removeClass("estadoCarregando").attr("aria-busy", "false").removeAttr("inert");
      }
    },

    prepararModalCancelamento: function (botaoAcionador) {
      const $card = $(botaoAcionador).closest("[data-idConsulta]");
      const $conteudo = this.elementos.$modalCancelamento.find(".modalBase_conteudo");

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
