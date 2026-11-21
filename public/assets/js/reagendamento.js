(function ($, Utilitarios) {
  "use strict";

  const NOMES_MES = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
  ];

  const NOMES_MES_COMPLETO = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  const NOMES_DIA_SEMANA = [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"
  ];

  // Tela de reagendamento: mesma interface do agendamentoCli, mas parte de uma consulta existente.
  // O backend (Servicocontroller) refaz o serviço da sessão a partir de $_POST["reagendar"] e confere o dono
  // da consulta; por isso todas as chamadas de dias, horários e salas levam o id da consulta.
  const moduloReagendamento = {

    configuracao: {
      urlServico: "index.php?uri=servico",
      urlVoltarPorTipo: {
        cliente: "index.php?uri=consultasCli",
        clienteSimples: "index.php?uri=consultasCli",
        profissional: "index.php?uri=agendaProfissional",
        clinica: "index.php?uri=agendaClinica"
      },

      contratos: {
        mostrarSala: { acao: "mostrarSala", disponivel: true }
      }
    },

    estado: {
      idConsulta: null,
      consulta: null,
      servico: null,
      tipoUsuario: null,
      dataExibida: (function () {
        const hoje = new Date();
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      })(),
      tokenDias: 0,
      tokenHorarios: 0,
      diasIndisponiveis: [],
      diasLivres: [],
      diasSemHorario: [],
      diaSelecionado: null,
      horarioSelecionado: null,
      salaSelecionada: null
    },

    elementos: {},

    iniciar: function () {
      this.urlElementos();

      const idParametro = Utilitarios.obterParametroUrl("consulta");
      if (/^[0-9]+$/.test(idParametro || "")) {
        this.estado.idConsulta = idParametro;
      } else {
        this.estado.idConsulta = null;
      }
      this.elementos.$inputIdConsulta.val(this.estado.idConsulta || "");

      this.registrarEventos();
    },

    urlElementos: function () {
      this.elementos.$form = $("#formularioAgendamento");
      this.elementos.$alerta = $("#alertaValidacao");
      this.elementos.$inputIdConsulta = $("#inputIdConsulta");
      this.elementos.$camposDinamicos = $("[data-campo]");
      this.elementos.$linhaSalaAtual = $("#linhaSalaAtual");

      this.elementos.$botaoVoltar = $("#botaoVoltar");
      this.elementos.$botaoCancelar = $("#botaoCancelarAgendamento");
      this.elementos.$botaoConfirmar = $("#botaoConfirmarAgendamento");

      this.elementos.$dropdownSala = $("#dropdownSala");
      this.elementos.$botaoSala = $("#botaoDropdownSala");
      this.elementos.$textoSala = $("#textoSalaSelecionada");
      this.elementos.$listaSalas = $("#listaSalas");
      this.elementos.$inputSala = $("#inputSalaSelecionada");

      this.elementos.$calendario = $("#calendarioAgendamento");
      this.elementos.$tituloMesAno = $("#calendarioTitulo");
      this.elementos.$botaoMesAnterior = $("#botaoMesAnterior");
      this.elementos.$botaoProximoMes = $("#botaoProximoMes");
      this.elementos.$grade = $("#calendarioGrade");
      this.elementos.$inputDia = $("#inputDiaSelecionado");

      this.elementos.$dropdownHorario = $("#dropdownHorario");
      this.elementos.$botaoHorario = $("#botaoDropdownHorario");
      this.elementos.$textoHorario = $("#textoHorarioSelecionado");
      this.elementos.$listaHorarios = $("#listaHorarios");
      this.elementos.$inputHorario = $("#inputHorarioSelecionado");

      this.elementos.$modalErro = $("#modalConsultaNaoEncontrada");
      this.elementos.$textoModalErro = $("#textoModalConsultaNaoEncontrada");
      this.elementos.$botaoTentarNovamente = $("#botaoTentarNovamente");
      this.elementos.$linkVoltarAgenda = $("#linkVoltarAgenda");

      this.elementos.$modalNaoLogado = $("#modalNaoLogado");
    },

    registrarEventos: function () {
      const self = this;

      // A tela só carrega depois que a navegação descobre quem está logado.
      $(document).on("sessaoNavegacaoDefinida", function (evento, informacoes) {
        self.tratarSessao(informacoes);
      });

      this.elementos.$botaoVoltar.on("click", function () {
        self.voltarParaAgenda();
      });

      this.elementos.$botaoCancelar.on("click", function () {
        self.voltarParaAgenda();
      });

      this.elementos.$form.on("submit", function (evento) {
        evento.preventDefault();
        self.tentarConfirmarReagendamento();
      });

      this.elementos.$botaoMesAnterior.on("click", function () {
        self.navegarMes(-1);
      });

      this.elementos.$botaoProximoMes.on("click", function () {
        self.navegarMes(1);
      });

      this.elementos.$botaoSala.on("click", function (evento) {
        evento.stopPropagation();
        if ($(this).is(":disabled")) {
          return;
        }
        self.alternarDropdown(self.elementos.$dropdownSala, self.elementos.$inputSala);
      });

      this.elementos.$botaoHorario.on("click", function (evento) {
        evento.stopPropagation();
        if ($(this).is(":disabled")) {
          return;
        }
        self.alternarDropdown(self.elementos.$dropdownHorario, self.elementos.$inputHorario);
      });

      $(document).on("click", function (evento) {
        if (!$(evento.target).closest(".dropdownCustomizado").length) {
          self.fecharTodosDropdowns();
        }
      });

      $(document).on("keydown", function (evento) {
        if (evento.key !== "Escape") {
          return;
        }
        const $dropdownAberto = $(".dropdownCustomizado").filter(function () {
          return !$(this).find(".dropdownCustomizadoLista").attr("hidden");
        });
        self.fecharTodosDropdowns();
        $dropdownAberto.find(".dropdownCustomizadoBotao").trigger("focus");
      });

      this.elementos.$grade.on(
        "click",
        ".diaCalendario:not(.diaIndisponivel):not(.diaEncerrado):not(.diaVazio)",
        function () {
          self.selecionarDia($(this).data("data"));
        }
      );

      this.elementos.$listaSalas.on("click", ".dropdownCustomizadoItem", function () {
        self.selecionarSala($(this).data("valor"), $(this).data("texto"), false);
      });

      this.elementos.$listaHorarios.on("click", ".dropdownCustomizadoItem", function () {
        self.selecionarHorario($(this).data("valor"), $(this).data("texto"));
      });

      this.registrarNavegacaoTecladoLista(this.elementos.$listaSalas);
      this.registrarNavegacaoTecladoLista(this.elementos.$listaHorarios);

      this.elementos.$modalErro.on("shown.bs.modal", function () {
        self.elementos.$botaoTentarNovamente.trigger("focus");
      });

      this.elementos.$botaoTentarNovamente.on("click", function () {
        self.buscarDadosReagendamento();
      });
    },

    tratarSessao: function (informacoes) {
      if (!informacoes || !informacoes.logado) {
        const destino = encodeURIComponent(window.location.href);
        $("[data-loginRedirecionar]").each(function () {
          const $link = $(this);
          $link.attr("href", $link.attr("href").split("&redirecionar=")[0] + "&redirecionar=" + destino);
        });
        Utilitarios.exibirModal(this.elementos.$modalNaoLogado, { backdrop: "static", keyboard: false });
        return;
      }

      this.estado.tipoUsuario = informacoes.tipoUsuario;
      this.elementos.$linkVoltarAgenda.attr("href", this.urlVoltar());
      this.buscarDadosReagendamento();
    },

    urlVoltar: function () {
      return this.configuracao.urlVoltarPorTipo[this.estado.tipoUsuario] || "index.php";
    },

    voltarParaAgenda: function () {
      window.location.href = this.urlVoltar();
    },

    buscarDadosReagendamento: function () {
      const self = this;

      Utilitarios.esconderModal(this.elementos.$modalErro);

      if (!this.estado.idConsulta) {
        this.tratarFalhaCarregamento("Não encontramos a consulta que você quer reagendar.");
        return;
      }

      this.elementos.$form.removeClass("estadoErro").addClass("estadoCarregando");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "detalhesReagendamento",
          agnd_id: this.estado.idConsulta
        }
      })
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso || !resposta.dados || !resposta.dados.consulta) {
            self.tratarFalhaCarregamento(resposta && resposta.mensagem);
            return;
          }

          self.estado.consulta = resposta.dados.consulta;
          self.estado.servico = resposta.dados.servico;

          Utilitarios.preencherCampos(
            self.elementos.$camposDinamicos,
            self.mapearDados(resposta.dados)
          );
          self.elementos.$linhaSalaAtual.prop("hidden", !resposta.dados.consulta.sala_nome);

          Utilitarios.alternarEsqueletoAcessivel(self.elementos.$camposDinamicos, false);
          self.estado.dataExibida = self.mesInicial(resposta.dados.consulta.agnd_dt);
          self.buscarDiasIndisponiveis(self.estado.dataExibida);
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
        });
    },

    // Abre o calendário no mês da consulta atual (ou no mês corrente, se ela já passou).
    mesInicial: function (dataConsulta) {
      const partes = String(dataConsulta || "").split("-");
      const mesAtual = this.obterPrimeiroDiaMesAtual();
      if (partes.length !== 3) {
        return mesAtual;
      }
      const mesConsulta = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, 1);
      return mesConsulta > mesAtual ? mesConsulta : mesAtual;
    },

    mapearDados: function (dados) {
      const numero = Number(dados.servico.ser_val);
      let precoFormatado = "";
      if (!isNaN(numero)) {
        precoFormatado = numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      }

      const partes = String(dados.consulta.agnd_dt || "").split("-");
      let dataHora = "";
      if (partes.length === 3) {
        dataHora = parseInt(partes[2], 10) + " de " + NOMES_MES_COMPLETO[parseInt(partes[1], 10) - 1] +
          " de " + partes[0] + ", " + dados.consulta.agnd_hrIni + " às " + dados.consulta.agnd_hrTerm;
      }

      return {
        precoServico: precoFormatado,
        nomeProfissional: dados.nomes.pro_nome || "",
        nomeServico: dados.servico.ser_nome || "",
        dataHoraAtual: dataHora,
        salaAtual: dados.consulta.sala_nome || ""
      };
    },

    tratarFalhaCarregamento: function (mensagem) {
      this.elementos.$form.removeClass("estadoCarregando").addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.elementos.$textoModalErro.text(
        mensagem || "Não conseguimos carregar a consulta que você quer reagendar."
      );
      Utilitarios.exibirModal(this.elementos.$modalErro, {
        backdrop: "static",
        keyboard: false
      });
    },

    resetarSala: function () {
      this.estado.salaSelecionada = null;
      this.elementos.$inputSala.val("");
      this.elementos.$textoSala.text("Selecione a sala");
      this.elementos.$listaSalas.empty();
      this.elementos.$botaoSala.prop("disabled", true);
      this.removerErroCampo(this.elementos.$botaoSala);
      this.fecharDropdown(this.elementos.$dropdownSala);
    },

    
    buscarSalasDisponiveis: function () {
      const self = this;
      const contrato = this.configuracao.contratos.mostrarSala;
      const horarioRequisitado = this.estado.horarioSelecionado;
      const partesHorario = this.obterPartesHorario();
      const servico = this.estado.servico || {};

      this.esconderAlertaValidacao();
      this.resetarSala();

      if (this.ehAtendimentoDomiciliar()) {
        this.elementos.$textoSala.text("Atendimento domiciliar — sala não necessária");
        this.elementos.$botaoSala.prop("disabled", true);
        return;
      }

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: contrato.acao,
          inicio: partesHorario[0],
          termino: partesHorario[1],
          ser_loc: servico.ser_loc || "",
          reagendar: this.estado.idConsulta,
          dia: this.estado.diaSelecionado
        }
      })
        .done(function (resposta) {
          if (horarioRequisitado !== self.estado.horarioSelecionado) {
            return;
          }
          if (!resposta || !resposta.sucesso || !$.isArray(resposta.dados)) {
            self.exibirAlertaValidacao("Não foi possível carregar as salas. Tente novamente.");
            return;
          }
          if (!resposta.dados.length) {
            self.exibirAlertaValidacao("Não há sala disponível nesse horário. Escolha outro horário.");
            return;
          }

          self.renderizarSalas(resposta.dados);
          self.elementos.$botaoSala.prop("disabled", false);

          if (resposta.dados.length === 1) {
            self.selecionarSala(resposta.dados[0].sala_id, self.nomeDaSala(resposta.dados[0]), true);
          }
        })
        .fail(function () {
          if (horarioRequisitado !== self.estado.horarioSelecionado) {
            return;
          }
          self.exibirAlertaValidacao("Não foi possível carregar as salas. Tente novamente.");
        });
    },

    ehAtendimentoDomiciliar: function () {
      const servico = this.estado.servico || {};
      return servico.ser_loc === null || typeof servico.ser_loc === "undefined" || String(servico.ser_loc).trim() === "";
    },

    nomeDaSala: function (sala) {
      return sala.sala_nome || "Sala " + sala.sala_id;
    },

    renderizarSalas: function (salas) {
      const self = this;
      this.elementos.$listaSalas.empty();

      salas.forEach(function (sala) {
        const $item = $(
          '<li role="presentation"><button type="button" class="dropdownCustomizadoItem" role="option"></button></li>'
        );
        $item
          .find("button")
          .attr("data-valor", sala.sala_id)
          .attr("data-texto", self.nomeDaSala(sala))
          .text(self.nomeDaSala(sala))
          .append(
            '<span class="material-symbols-outlined" aria-hidden="true">meeting_room</span>'
          );
        self.elementos.$listaSalas.append($item);
      });
    },

    selecionarSala: function (id, nome, semFoco) {
      this.estado.salaSelecionada = id;
      this.elementos.$inputSala.val(id);
      this.elementos.$textoSala.text(nome);
      this.fecharDropdown(this.elementos.$dropdownSala);
      this.removerErroCampo(this.elementos.$botaoSala);
      if (!semFoco) {
        this.elementos.$botaoSala.trigger("focus");
      }
    },

    obterPrimeiroDiaMesAtual: function () {
      const hoje = new Date();
      return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    },

    navegarMes: function (deltaMeses) {
      const atual = this.estado.dataExibida;
      const destino = new Date(atual.getFullYear(), atual.getMonth() + deltaMeses, 1);
      if (destino < this.obterPrimeiroDiaMesAtual()) {
        return;
      }

      this.estado.dataExibida = destino;
      this.estado.diaSelecionado = null;
      this.elementos.$inputDia.val("");
      this.resetarHorario();
      this.buscarDiasIndisponiveis(this.estado.dataExibida);
    },

    buscarDiasIndisponiveis: function (data) {
      const self = this;
      const token = ++this.estado.tokenDias;

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "MostrarDias",
          reagendar: this.estado.idConsulta,
          mes: data.getMonth() + 1,
          ano: data.getFullYear()
        }
      })
        .done(function (resposta) {
          if (token !== self.estado.tokenDias) {
            return;
          }
          if (!resposta || typeof resposta !== "object" || !$.isArray(resposta.disponivel)) {
            self.tratarFalhaCarregamento();
            return;
          }

          self.estado.diasIndisponiveis = self.extrairDiasIndisponiveis(resposta);
          self.estado.diasLivres = self.calcularDiasLivres(data);
          self.estado.diasSemHorario = [];
          self.elementos.$form.removeClass("estadoCarregando estadoErro");
          self.renderizarCalendario(data);
          self.verificarHorariosDosDias();
        })
        .fail(function () {
          if (token !== self.estado.tokenDias) {
            return;
          }
          self.tratarFalhaCarregamento();
        });
    },

    extrairDiasIndisponiveis: function (resposta) {
      const self = this;
      const indisponiveis = [];


      ["indisponivel", "folga"].forEach(function (chave) {
        (resposta[chave] || []).forEach(function (item) {
          let dataTexto;
          if (item && item.date) {
            dataTexto = item.date;
          } else {
            dataTexto = item;
          }
          if (typeof dataTexto === "string") {
            indisponiveis.push(dataTexto.substring(0, 10));
          }
        });
      });

      return indisponiveis;
    },

    obterChaveHoje: function () {
      const hoje = new Date();
      return this.formatarDataChave(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    },

    calcularDiasLivres: function (data) {
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const totalDias = new Date(ano, mes + 1, 0).getDate();
      const chaveHoje = this.obterChaveHoje();
      const livres = [];

      for (let dia = 1; dia <= totalDias; dia++) {
        const dataChave = this.formatarDataChave(ano, mes, dia);
        const jaPassou = dataChave < chaveHoje;
        const estaIndisponivel = this.estado.diasIndisponiveis.indexOf(dataChave) !== -1;

        if (!jaPassou && !estaIndisponivel) {
          livres.push(dataChave);
        }
      }

      return livres;
    },

    // Retorna "jaPassou", "semHorario" ou null.
    // Dia que já passou só é "encerrado" se o servidor não o marcou como
    // indisponível/folga (esses continuam com a cor de indisponível).
    obterMotivoEncerrado: function (dataChave) {
      const indisponivelNoServidor = this.estado.diasIndisponiveis.indexOf(dataChave) !== -1;

      if (dataChave < this.obterChaveHoje() && !indisponivelNoServidor) {
        return "jaPassou";
      }
      if (this.estado.diasSemHorario.indexOf(dataChave) !== -1) {
        return "semHorario";
      }
      return null;
    },

    // true: tem horário | false: não tem | null: resposta inesperada (não marca o dia)
    diaTemHorario: function (dataChave, resposta) {
      if (typeof resposta === "string") {
        return false;
      }
      if (!$.isArray(resposta)) {
        return null;
      }
      return this.filtrarHorariosFuturos(dataChave, resposta).length > 0;
    },

    verificarHorariosDosDias: function () {
      const self = this;
      const token = this.estado.tokenDias;

      this.estado.diasLivres.forEach(function (dataChave) {
        $.ajax({
          url: self.configuracao.urlServico,
          method: "POST",
          dataType: "json",
          data: {
            acao: "mostrarhorario",
            reagendar: self.estado.idConsulta,
            dia: dataChave
          }
        }).done(function (resposta) {
          if (token !== self.estado.tokenDias) {
            return;
          }
          if (self.diaTemHorario(dataChave, resposta) === false) {
            self.marcarDiaSemHorario(dataChave);
          }
        });
        // Falha em um dia isolado: o dia continua disponível; o clique
        // volta a validar os horários normalmente.
      });
    },

    marcarDiaSemHorario: function (dataChave) {
      if (this.estado.diasSemHorario.indexOf(dataChave) === -1) {
        this.estado.diasSemHorario.push(dataChave);
      }

      const $dia = this.elementos.$grade.find('.diaCalendario[data-data="' + dataChave + '"]');
      if (!$dia.length) {
        return;
      }

      $dia
        .removeClass("diaDisponivel")
        .addClass("diaEncerrado")
        .prop("disabled", true)
        .attr("aria-disabled", "true")
        .attr("aria-label", $dia.attr("aria-label") + " — sem horários");
    },

    renderizarCalendario: function (data) {
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
      const totalDias = new Date(ano, mes + 1, 0).getDate();

      this.elementos.$tituloMesAno.text(NOMES_MES[mes] + " " + ano);
      this.atualizarBotaoMesAnterior(data);
      this.elementos.$grade.empty();

      for (let i = 0; i < primeiroDiaSemana; i++) {
        this.elementos.$grade.append(
          '<button type="button" class="diaCalendario diaVazio" disabled aria-hidden="true" tabindex="-1"></button>'
        );
      }

      for (let dia = 1; dia <= totalDias; dia++) {
        const dataChave = this.formatarDataChave(ano, mes, dia);
        const indisponivel = this.estado.diasLivres.indexOf(dataChave) === -1;
        const motivoEncerrado = this.obterMotivoEncerrado(dataChave);
        const selecionado = dataChave === this.estado.diaSelecionado;
        const nomeDiaSemana = NOMES_DIA_SEMANA[new Date(ano, mes, dia).getDay()];

        let rotulo = nomeDiaSemana + ", " + dia + " de " + NOMES_MES_COMPLETO[mes];
        if (motivoEncerrado === "jaPassou") {
          rotulo += " — já passou";
        } else if (motivoEncerrado === "semHorario") {
          rotulo += " — sem horários";
        } else if (indisponivel) {
          rotulo += " — indisponível";
        }

        let ariaPressionado;
        if (selecionado) {
          ariaPressionado = "true";
        } else {
          ariaPressionado = "false";
        }
        const $botaoDia = $('<button type="button" class="diaCalendario"></button>')
          .text(dia)
          .attr("data-data", dataChave)
          .attr("aria-label", rotulo)
          .attr("aria-pressed", ariaPressionado);

        if (motivoEncerrado) {
          $botaoDia.addClass("diaEncerrado").prop("disabled", true);
          $botaoDia.attr("aria-disabled", "true");
        } else if (indisponivel) {
          $botaoDia.addClass("diaIndisponivel").prop("disabled", true);
          $botaoDia.attr("aria-disabled", "true");
        } else {
          $botaoDia.addClass("diaDisponivel");
        }
        if (selecionado) {
          $botaoDia.addClass("diaSelecionado");
        }

        this.elementos.$grade.append($botaoDia);
      }
    },

    atualizarBotaoMesAnterior: function (data) {
      const hoje = new Date();
      const mesExibido = data.getFullYear() * 12 + data.getMonth();
      const mesAtual = hoje.getFullYear() * 12 + hoje.getMonth();
      const bloqueado = mesExibido <= mesAtual;

      this.elementos.$botaoMesAnterior
        .prop("disabled", bloqueado)
        .attr("aria-disabled", bloqueado ? "true" : "false");
    },

    formatarDataChave: function (ano, mesIndiceZero, dia) {
      const mesFormatado = String(mesIndiceZero + 1).padStart(2, "0");
      const diaFormatado = String(dia).padStart(2, "0");
      return ano + "-" + mesFormatado + "-" + diaFormatado;
    },

    selecionarDia: function (dataChave) {
      this.estado.diaSelecionado = dataChave;
      this.elementos.$inputDia.val(dataChave);
      this.removerErroCampo(this.elementos.$calendario);

      this.elementos.$grade.find(".diaCalendario").each(function () {
        const $dia = $(this);
        const ehEsseDia = $dia.data("data") === dataChave;
        $dia.toggleClass("diaSelecionado", ehEsseDia);
        let ariaPressionado;
        if (ehEsseDia) {
          ariaPressionado = "true";
        } else {
          ariaPressionado = "false";
        }
        $dia.attr("aria-pressed", ariaPressionado);
      });

      this.esconderAlertaValidacao();
      this.resetarHorario();
      this.buscarHorariosDisponiveis(dataChave);
    },

    resetarHorario: function () {
      this.estado.tokenHorarios++;
      this.estado.horarioSelecionado = null;
      this.elementos.$inputHorario.val("");
      this.elementos.$textoHorario.text("Selecione horário");
      this.elementos.$listaHorarios.empty();
      this.elementos.$botaoHorario.prop("disabled", true);
      this.fecharDropdown(this.elementos.$dropdownHorario);
      this.resetarSala();
    },

    buscarHorariosDisponiveis: function (dataChave) {
      const self = this;
      const token = ++this.estado.tokenHorarios;

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "mostrarhorario",
          reagendar: this.estado.idConsulta,
          dia: dataChave
        }
      })
        .done(function (resposta) {
          if (token !== self.estado.tokenHorarios) {
            return;
          }
          if (typeof resposta === "string") {
            self.exibirAlertaValidacao("Não há horários disponíveis para esse dia. Escolha outro dia.");
            return;
          }
          if (!resposta || !Array.isArray(resposta)) {
            self.tratarFalhaCarregamento();
            return;
          }

          const horarios = self.filtrarHorariosFuturos(dataChave, resposta);
          if (!horarios.length) {
            if (resposta.length) {
              self.exibirAlertaValidacao("Os horários de hoje já passaram. Escolha outro dia.");
            } else {
              self.exibirAlertaValidacao("Não há horários disponíveis para esse dia. Escolha outro dia.");
            }
            return;
          }

          self.renderizarHorarios(self.mapearHorarios(horarios));
          self.elementos.$botaoHorario.prop("disabled", false);
        })
        .fail(function () {
          if (token !== self.estado.tokenHorarios) {
            return;
          }
          self.tratarFalhaCarregamento();
        });
    },


    filtrarHorariosFuturos: function (dataChave, horarios) {
      if (dataChave !== this.obterChaveHoje()) {
        return horarios;
      }

      const agora = new Date();
      const limite =
        String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0");

      return horarios.filter(function (horario) {
        return horario.inicio > limite;
      });
    },

    mapearHorarios: function (horarios) {
      return horarios.map(function (horario) {
        return {
          valor: horario.inicio + "|" + horario.termino,
          texto: horario.inicio + " às " + horario.termino
        };
      });
    },

    renderizarHorarios: function (horarios) {
      const self = this;
      this.elementos.$listaHorarios.empty();

      horarios.forEach(function (horario) {
        const $item = $(
          '<li role="presentation"><button type="button" class="dropdownCustomizadoItem" role="option"></button></li>'
        );
        $item
          .find("button")
          .attr("data-valor", horario.valor)
          .attr("data-texto", horario.texto)
          .text(horario.texto);
        self.elementos.$listaHorarios.append($item);
      });
    },

    selecionarHorario: function (valor, texto) {
      this.estado.horarioSelecionado = valor;
      this.elementos.$inputHorario.val(valor);
      this.elementos.$textoHorario.text(texto);
      this.fecharDropdown(this.elementos.$dropdownHorario);
      this.removerErroCampo(this.elementos.$botaoHorario);
      this.elementos.$botaoHorario.trigger("focus");
      this.buscarSalasDisponiveis();
    },

    alternarDropdown: function ($dropdown, $inputOculto) {
      const $lista = $dropdown.find(".dropdownCustomizadoLista");
      const estaAberta = !$lista.attr("hidden");

      this.fecharTodosDropdowns();

      if (!estaAberta) {
        this.abrirDropdown($dropdown, $inputOculto);
      }
    },

    abrirDropdown: function ($dropdown, $inputOculto) {
      $dropdown.find(".dropdownCustomizadoLista").removeAttr("hidden");
      $dropdown.find(".dropdownCustomizadoBotao").attr("aria-expanded", "true");

      const $itens = $dropdown.find(".dropdownCustomizadoItem");
      if (!$itens.length) {
        return;
      }

      let valorAtual;
      if ($inputOculto) {
        valorAtual = $inputOculto.val();
      } else {
        valorAtual = null;
      }
      const $itemSelecionado = $itens.filter(function () {
        return String($(this).data("valor")) === String(valorAtual);
      });

      let $itemFoco;
      if ($itemSelecionado.length) {
        $itemFoco = $itemSelecionado;
      } else {
        $itemFoco = $itens.first();
      }
      $itemFoco.trigger("focus");
    },

    fecharDropdown: function ($dropdown) {
      $dropdown.find(".dropdownCustomizadoLista").attr("hidden", "hidden");
      $dropdown.find(".dropdownCustomizadoBotao").attr("aria-expanded", "false");
    },

    fecharTodosDropdowns: function () {
      this.fecharDropdown(this.elementos.$dropdownHorario);
      this.fecharDropdown(this.elementos.$dropdownSala);
    },

    registrarNavegacaoTecladoLista: function ($lista) {
      $lista.on("keydown", ".dropdownCustomizadoItem", function (evento) {
        const $itens = $lista.find(".dropdownCustomizadoItem");
        const indiceAtual = $itens.index(this);
        let proximoIndice = null;

        switch (evento.key) {
          case "ArrowDown":
            proximoIndice = (indiceAtual + 1) % $itens.length;
            break;
          case "ArrowUp":
            proximoIndice = (indiceAtual - 1 + $itens.length) % $itens.length;
            break;
          case "Home":
            proximoIndice = 0;
            break;
          case "End":
            proximoIndice = $itens.length - 1;
            break;
          default:
            return;
        }

        evento.preventDefault();
        $itens.eq(proximoIndice).trigger("focus");
      });
    },

    marcarCampoComErro: function ($elemento) {
      $elemento.addClass("campoComErro");
    },

    removerErroCampo: function ($elemento) {
      $elemento.removeClass("campoComErro");
    },

    exibirAlertaValidacao: function (mensagem) {
      this.elementos.$alerta
        .text(mensagem || "Você precisa preencher todos os dados!")
        .removeAttr("hidden");
    },

    esconderAlertaValidacao: function () {
      this.elementos.$alerta.attr("hidden", "hidden");
    },

    tentarConfirmarReagendamento: function () {
      let camposValidos = true;
      let $primeiroInvalido = null;

      if (!this.estado.diaSelecionado) {
        this.marcarCampoComErro(this.elementos.$calendario);
        $primeiroInvalido = $primeiroInvalido || this.elementos.$calendario;
        camposValidos = false;
      }

      if (!this.estado.horarioSelecionado) {
        this.marcarCampoComErro(this.elementos.$botaoHorario);
        $primeiroInvalido = $primeiroInvalido || this.elementos.$botaoHorario;
        camposValidos = false;
      }

      if (this.estado.horarioSelecionado && !this.ehAtendimentoDomiciliar() && !this.estado.salaSelecionada) {
        this.marcarCampoComErro(this.elementos.$botaoSala);
        $primeiroInvalido = $primeiroInvalido || this.elementos.$botaoSala;
        camposValidos = false;
      }

      if (!camposValidos) {
        this.exibirAlertaValidacao();
        if ($primeiroInvalido) {
          $primeiroInvalido.trigger("focus");
        }
        return;
      }

      this.esconderAlertaValidacao();
      this.enviarReagendamento(this.ehAtendimentoDomiciliar() ? null : this.estado.salaSelecionada);
    },

    obterPartesHorario: function () {
      return (this.estado.horarioSelecionado || "").split("|");
    },

    enviarReagendamento: function (idSala) {
      const self = this;
      const partesHorario = this.obterPartesHorario();
      const dados = {
        acao: "reagendar",
        agnd_id: this.estado.idConsulta,
        sala: idSala,
        dia: this.estado.diaSelecionado,
        inicio: partesHorario[0],
        termino: partesHorario[1]
      };
      this.elementos.$botaoConfirmar.prop("disabled", true);

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "text",
        data: dados
      })
        .done(function (respostaTexto) {
          const resultado = $.trim(respostaTexto).replace(/^"+|"+$/g, "");
          if (resultado === "sucesso") {
            window.location.href = self.urlVoltar();
            return;
          }
          self.tratarErroReagendamento($.trim(respostaTexto));
        })
        .fail(function () {
          self.exibirAlertaValidacao("Não foi possível concluir o reagendamento. Tente novamente.");
        })
        .always(function () {
          self.elementos.$botaoConfirmar.prop("disabled", false);
        });
    },

    extrairMensagem: function (texto) {
      let analisado;
      try {
        analisado = JSON.parse(texto);
      } catch (erro) {
        return "";
      }
      if (typeof analisado === "string") {
        return analisado;
      }
      if (analisado && typeof analisado.mensagem === "string") {
        return analisado.mensagem;
      }
      return "";
    },

    tratarErroReagendamento: function (texto) {
      const mensagem = this.extrairMensagem(texto);
      const generica = "Não foi possível concluir o reagendamento. Tente novamente.";

      if (Utilitarios.ehPermissaoNegada(mensagem)) {
        this.exibirAlertaValidacao(Utilitarios.mensagemPermissaoNegada("reagendarConsulta"));
        return;
      }

      if (/sala/i.test(mensagem) && /ocupad/i.test(mensagem)) {
        this.buscarSalasDisponiveis();
        this.exibirAlertaValidacao("Essa sala não está mais disponível. Escolha outra sala.");
        return;
      }

      if (/ocupad/i.test(mensagem)) {
        this.exibirAlertaValidacao("Esse horário não está mais disponível. Escolha outro horário.");
        this.resetarHorario();
        if (this.estado.diaSelecionado) {
          this.buscarHorariosDisponiveis(this.estado.diaSelecionado);
        }
        return;
      }

      if (/sess[aã]o expirada/i.test(mensagem)) {
        Utilitarios.exibirModal(this.elementos.$modalNaoLogado, { backdrop: "static", keyboard: false });
        return;
      }

      if (mensagem && !/^erro/i.test(mensagem)) {
        this.exibirAlertaValidacao(mensagem);
        return;
      }

      this.exibirAlertaValidacao(generica);
    }
  };

  $(function () {
    moduloReagendamento.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
