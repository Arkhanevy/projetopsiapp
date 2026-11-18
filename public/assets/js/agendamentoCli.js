(function ($, Utilitarios) {
  "use strict";

  var NOMES_MES = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
  ];

  var NOMES_MES_COMPLETO = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  var NOMES_DIA_SEMANA = [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"
  ];

  var moduloAgendamentoCli = {

    configuracao: {
      urlServico: "index.php?uri=servico",
      urlDetalhesServico: "index.php?uri=busca",
      urlVerificarLogin: "index.php?uri=cliente",
      urlInfoServico: "index.php?uri=infoServico",
      urlCadastroCliente: "index.php?uri=cliente",

      contratos: {
        mostrarSala: { acao: "mostrarSala", disponivel: true }
      }
    },

    estado: {
      idServico: null,
      servico: null,
      dataExibida: (function () {
        var hoje = new Date();
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      })(),
      tokenDias: 0,
      tokenHorarios: 0,
      diasIndisponiveis: [],
      diasLivres: [],
      diasSemHorario: [],
      diaSelecionado: null,
      horarioSelecionado: null,
      salaSelecionada: null,
      emailPendente: null,
      retomarAposLogin: false
    },

    elementos: {},

    iniciar: function () {
      this.urlElementos();
      var idParametro = Utilitarios.obterParametroUrl("servico");
      if (/^[0-9]+$/.test(idParametro || "")) {
        this.estado.idServico = idParametro;
      } else {
        this.estado.idServico = null;
      }
      this.elementos.$inputIdServico.val(this.estado.idServico || "");

      this.registrarEventos();
      this.buscarDadosAgendamento();
    },

    urlElementos: function () {
      this.elementos.$form = $("#formularioAgendamento");
      this.elementos.$alerta = $("#alertaValidacao");
      this.elementos.$inputIdServico = $("#inputIdServico");
      this.elementos.$camposDinamicos = $("[data-campo]");

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

      this.elementos.$modalErro = $("#modalServicoNaoEncontrado");
      this.elementos.$botaoTentarNovamente = $("#botaoTentarNovamente");

      this.elementos.$modalNaoLogado = $("#modalNaoLogado");
      this.elementos.$botaoRealizarLogin = $("#botaoRealizarLogin");

      this.elementos.$linkCadastro = $("#linkCadastro");
      this.elementos.$painelCadastroSimples = $("#painelCadastroSimples");
      this.elementos.$formCadastroSimples = $("#formularioCadastroSimples");
      this.elementos.$alertaCadastroSimples = $("#alertaCadastroSimples");
      this.elementos.$inputNomeUsuarioCadastro = $("#inputNomeUsuarioCadastro");
      this.elementos.$inputEmailCadastro = $("#inputEmailCadastro");
      this.elementos.$inputSenhaCadastro = $("#inputSenhaCadastro");
      this.elementos.$inputCpfCadastro = $("#inputCpfCadastro");
      this.elementos.$botaoVisibilidadeSenha = $("#botaoVisibilidadeSenhaCadastro");
      this.elementos.$botaoCadastrarSimples = $("#botaoCadastrarSimples");

      this.elementos.$painelAtivacao = $("#painelAtivacao");
      this.elementos.$formAtivacao = $("#formularioAtivacao");
      this.elementos.$alertaAtivacao = $("#alertaAtivacao");
      this.elementos.$inputCodigoAtivacao = $("#inputCodigoAtivacao");
      this.elementos.$botaoAtivarConta = $("#botaoAtivarConta");
      this.elementos.$botaoGerarCodigo = $("#botaoGerarCodigo");

      this.elementos.$painelLogin = $("#painelLogin");
      this.elementos.$formLogin = $("#formularioLogin");
      this.elementos.$alertaLogin = $("#alertaLogin");
      this.elementos.$inputEmailLogin = $("#inputEmailLogin");
      this.elementos.$inputSenhaLogin = $("#inputSenhaLogin");
      this.elementos.$botaoVisibilidadeSenhaLogin = $("#botaoVisibilidadeSenhaLogin");
      this.elementos.$botaoLogarCliente = $("#botaoLogarCliente");
      this.elementos.$linkCadastroPainelLogin = $("#linkCadastroPainelLogin");
    },

    registrarEventos: function () {
      var self = this;

      this.elementos.$botaoVoltar.on("click", function () {
        self.cancelarAgendamento();
      });

      this.elementos.$botaoCancelar.on("click", function () {
        self.cancelarAgendamento();
      });

      this.elementos.$form.on("submit", function (evento) {
        evento.preventDefault();
        self.tentarConfirmarAgendamento();
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
        var $dropdownAberto = $(".dropdownCustomizado").filter(function () {
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
        self.buscarDadosAgendamento();
      });

      this.registrarEventosCadastroSimples();
      this.registrarEventosAtivacaoELogin();
    },

    cancelarAgendamento: function () {
      var url = this.configuracao.urlInfoServico;
      if (this.estado.idServico) {
        url += "&id=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    },

    //P
    buscarDadosAgendamento: function () {
      var self = this;

      Utilitarios.esconderModal(this.elementos.$modalErro);

      if (!this.estado.idServico) {
        this.tratarFalhaCarregamento();
        return;
      }

      this.elementos.$form.removeClass("estadoErro").addClass("estadoCarregando");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);

      $.ajax({
        url: this.configuracao.urlDetalhesServico,
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

          self.estado.servico = resposta.dados[0];

          Utilitarios.preencherCampos(
            self.elementos.$camposDinamicos,
            self.mapearDadosServico(resposta.dados[0])
          );

          Utilitarios.alternarEsqueletoAcessivel(self.elementos.$camposDinamicos, false);
          self.carregarProfissional(resposta.dados[0].ser_pro);
          self.buscarDiasIndisponiveis(self.estado.dataExibida);
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
        });
    },

    mapearDadosServico: function (registro) {
      var numero = Number(registro.ser_val);
      var precoFormatado;
      if (isNaN(numero)) {
        precoFormatado = "";
      } else {
        precoFormatado = numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      }
      return {
        precoServico: precoFormatado,
        nomeProfissional: ""
      };
    },

    carregarProfissional: function (idProfissional) {
      var self = this;

      if (!idProfissional) {
        return;
      }

      $.ajax({
        url: this.configuracao.urlDetalhesServico,
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

    tratarFalhaCarregamento: function () {
      this.elementos.$form.removeClass("estadoCarregando").addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.exibirModalErro();
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
      var self = this;
      var contrato = this.configuracao.contratos.mostrarSala;
      var horarioRequisitado = this.estado.horarioSelecionado;
      var partesHorario = this.obterPartesHorario();
      var servico = this.estado.servico || {};

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
          ser_id: this.estado.idServico,
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
      var servico = this.estado.servico || {};
      return servico.ser_loc === null || typeof servico.ser_loc === "undefined" || String(servico.ser_loc).trim() === "";
    },

    nomeDaSala: function (sala) {
      return sala.sala_nome || "Sala " + sala.sala_id;
    },

    renderizarSalas: function (salas) {
      var self = this;
      this.elementos.$listaSalas.empty();

      salas.forEach(function (sala) {
        var $item = $(
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
      var hoje = new Date();
      return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    },

    navegarMes: function (deltaMeses) {
      var atual = this.estado.dataExibida;
      var destino = new Date(atual.getFullYear(), atual.getMonth() + deltaMeses, 1);
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
      var self = this;
      var token = ++this.estado.tokenDias;

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "MostrarDias",
          id: this.estado.idServico,
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
      var self = this;
      var indisponiveis = [];


      ["indisponivel", "folga"].forEach(function (chave) {
        (resposta[chave] || []).forEach(function (item) {
          var dataTexto;
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
      var hoje = new Date();
      return this.formatarDataChave(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    },

    calcularDiasLivres: function (data) {
      var ano = data.getFullYear();
      var mes = data.getMonth();
      var totalDias = new Date(ano, mes + 1, 0).getDate();
      var chaveHoje = this.obterChaveHoje();
      var livres = [];

      for (var dia = 1; dia <= totalDias; dia++) {
        var dataChave = this.formatarDataChave(ano, mes, dia);
        var jaPassou = dataChave < chaveHoje;
        var estaIndisponivel = this.estado.diasIndisponiveis.indexOf(dataChave) !== -1;

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
      var indisponivelNoServidor = this.estado.diasIndisponiveis.indexOf(dataChave) !== -1;

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
      var self = this;
      var token = this.estado.tokenDias;

      this.estado.diasLivres.forEach(function (dataChave) {
        $.ajax({
          url: self.configuracao.urlServico,
          method: "POST",
          dataType: "json",
          data: {
            acao: "mostrarhorario",
            id: self.estado.idServico,
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

      var $dia = this.elementos.$grade.find('.diaCalendario[data-data="' + dataChave + '"]');
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
      var ano = data.getFullYear();
      var mes = data.getMonth();
      var primeiroDiaSemana = new Date(ano, mes, 1).getDay();
      var totalDias = new Date(ano, mes + 1, 0).getDate();

      this.elementos.$tituloMesAno.text(NOMES_MES[mes] + " " + ano);
      this.atualizarBotaoMesAnterior(data);
      this.elementos.$grade.empty();

      for (var i = 0; i < primeiroDiaSemana; i++) {
        this.elementos.$grade.append(
          '<button type="button" class="diaCalendario diaVazio" disabled aria-hidden="true" tabindex="-1"></button>'
        );
      }

      for (var dia = 1; dia <= totalDias; dia++) {
        var dataChave = this.formatarDataChave(ano, mes, dia);
        var indisponivel = this.estado.diasLivres.indexOf(dataChave) === -1;
        var motivoEncerrado = this.obterMotivoEncerrado(dataChave);
        var selecionado = dataChave === this.estado.diaSelecionado;
        var nomeDiaSemana = NOMES_DIA_SEMANA[new Date(ano, mes, dia).getDay()];

        var rotulo = nomeDiaSemana + ", " + dia + " de " + NOMES_MES_COMPLETO[mes];
        if (motivoEncerrado === "jaPassou") {
          rotulo += " — já passou";
        } else if (motivoEncerrado === "semHorario") {
          rotulo += " — sem horários";
        } else if (indisponivel) {
          rotulo += " — indisponível";
        }

        var ariaPressionado;
        if (selecionado) {
          ariaPressionado = "true";
        } else {
          ariaPressionado = "false";
        }
        var $botaoDia = $('<button type="button" class="diaCalendario"></button>')
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
      var hoje = new Date();
      var mesExibido = data.getFullYear() * 12 + data.getMonth();
      var mesAtual = hoje.getFullYear() * 12 + hoje.getMonth();
      var bloqueado = mesExibido <= mesAtual;

      this.elementos.$botaoMesAnterior
        .prop("disabled", bloqueado)
        .attr("aria-disabled", bloqueado ? "true" : "false");
    },

    formatarDataChave: function (ano, mesIndiceZero, dia) {
      var mesFormatado = String(mesIndiceZero + 1).padStart(2, "0");
      var diaFormatado = String(dia).padStart(2, "0");
      return ano + "-" + mesFormatado + "-" + diaFormatado;
    },

    selecionarDia: function (dataChave) {
      this.estado.diaSelecionado = dataChave;
      this.elementos.$inputDia.val(dataChave);
      this.removerErroCampo(this.elementos.$calendario);

      this.elementos.$grade.find(".diaCalendario").each(function () {
        var $dia = $(this);
        var ehEsseDia = $dia.data("data") === dataChave;
        $dia.toggleClass("diaSelecionado", ehEsseDia);
        var ariaPressionado;
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
      var self = this;
      var token = ++this.estado.tokenHorarios;

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "mostrarhorario",
          id: this.estado.idServico,
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

          var horarios = self.filtrarHorariosFuturos(dataChave, resposta);
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

      var agora = new Date();
      var limite =
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
      var self = this;
      this.elementos.$listaHorarios.empty();

      horarios.forEach(function (horario) {
        var $item = $(
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
      var $lista = $dropdown.find(".dropdownCustomizadoLista");
      var estaAberta = !$lista.attr("hidden");

      this.fecharTodosDropdowns();

      if (!estaAberta) {
        this.abrirDropdown($dropdown, $inputOculto);
      }
    },

    abrirDropdown: function ($dropdown, $inputOculto) {
      $dropdown.find(".dropdownCustomizadoLista").removeAttr("hidden");
      $dropdown.find(".dropdownCustomizadoBotao").attr("aria-expanded", "true");

      var $itens = $dropdown.find(".dropdownCustomizadoItem");
      if (!$itens.length) {
        return;
      }

      var valorAtual;
      if ($inputOculto) {
        valorAtual = $inputOculto.val();
      } else {
        valorAtual = null;
      }
      var $itemSelecionado = $itens.filter(function () {
        return String($(this).data("valor")) === String(valorAtual);
      });

      var $itemFoco;
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
        var $itens = $lista.find(".dropdownCustomizadoItem");
        var indiceAtual = $itens.index(this);
        var proximoIndice = null;

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

    tentarConfirmarAgendamento: function () {
      var self = this;
      var camposValidos = true;
      var $primeiroInvalido = null;

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
      this.verificarLoginEEnviar();
    },

    verificarLoginEEnviar: function () {
      var self = this;

      $.ajax({
        url: this.configuracao.urlVerificarLogin,
        method: "POST",
        dataType: "json",
        data: { acao: "verificarLogin" }
      })
        .done(function (resposta) {
          if (resposta && resposta.logado) {
            self.enviarAgendamento(self.ehAtendimentoDomiciliar() ? null : self.estado.salaSelecionada);
          } else {
            self.exibirModalNaoLogado();
          }
        })
        .fail(function () {
          self.exibirModalNaoLogado();
        });
    },

    obterPartesHorario: function () {
      return (this.estado.horarioSelecionado || "").split("|");
    },

    enviarAgendamento: function (idSala) {
      var self = this;
      var partesHorario = this.obterPartesHorario();
      var dados = {
        acao: "agendar",
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
          var resultado = $.trim(respostaTexto).replace(/^"+|"+$/g, "");
          if (resultado === "sucesso") {
            self.irParaInfoServicoComSucesso();
            return;
          }
          self.tratarErroAgendamento($.trim(respostaTexto));
        })
        .fail(function () {
          self.exibirAlertaValidacao(
            "Não foi possível concluir o agendamento. Tente novamente."
          );
        })
        .always(function () {
          self.elementos.$botaoConfirmar.prop("disabled", false);
        });
    },

    extrairMensagemAgendamento: function (texto) {
      var analisado;
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

    tratarErroAgendamento: function (texto) {
      var mensagem = this.extrairMensagemAgendamento(texto);
      var generica = "Não foi possível concluir o agendamento. Tente novamente.";

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
      if (mensagem && !/^erro/i.test(mensagem)) {
        this.exibirAlertaValidacao(mensagem);
        return;
      }

      this.exibirAlertaValidacao(generica);
    },

    irParaInfoServicoComSucesso: function () {
      var url = this.configuracao.urlInfoServico + "&agendado=1";
      if (this.estado.idServico) {
        url += "&id=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    },

    exibirModalErro: function () {
      Utilitarios.exibirModal(this.elementos.$modalErro, {
        backdrop: "static",
        keyboard: false
      });
    },

    exibirModalNaoLogado: function () {
      Utilitarios.exibirModal(this.elementos.$modalNaoLogado);
    },

    registrarEventosCadastroSimples: function () {
      var self = this;
      var el = this.elementos;

      el.$linkCadastro.on("click", function (evento) {
        evento.preventDefault();
        self.abrirCadastroSimples();
      });

      el.$botaoVisibilidadeSenha.on("click", function () {
        self.alternarVisibilidadeSenha(el.$inputSenhaCadastro, el.$botaoVisibilidadeSenha);
      });

      el.$formCadastroSimples.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarCadastroSimples();
      });

      el.$formCadastroSimples.on("input change", ".form-control", function () {
        $(this).removeClass("is-invalid").removeAttr("aria-invalid");
      });

      el.$painelCadastroSimples.on("shown.bs.offcanvas", function () {
        el.$inputNomeUsuarioCadastro.trigger("focus");
      });

      el.$painelCadastroSimples.on("hidden.bs.offcanvas", function () {
        self.limparCadastroSimples();
        el.$botaoConfirmar.trigger("focus");
      });

      Utilitarios.validarAoSair(el.$alertaCadastroSimples, [
        {
          $campo: el.$inputEmailCadastro,
          valido: function (valor) { return Utilitarios.emailValido(valor); },
          mensagem: "E-mail inválido!"
        },
        {
          $campo: el.$inputCpfCadastro,
          valido: function (valor) { return Utilitarios.cpfValido(Utilitarios.apenasNumeros(valor)); },
          mensagem: "CPF inválido!"
        }
      ]);
    },

    abrirCadastroSimples: function () {
      this.abrirPainel(this.elementos.$painelCadastroSimples);
    },

    fecharCadastroSimples: function () {
      var painel = bootstrap.Offcanvas.getInstance(this.elementos.$painelCadastroSimples.get(0));
      if (painel) {
        painel.hide();
      }
    },

    alternarVisibilidadeSenha: function ($input, $botao) {
      var mostrar = $input.attr("type") === "password";

      $input.attr("type", mostrar ? "text" : "password");
      $botao
        .attr("aria-pressed", mostrar ? "true" : "false")
        .find(".material-symbols-outlined")
        .text(mostrar ? "visibility_off" : "visibility");
    },

    mostrarAlertaPainel: function ($container, mensagem, tipo) {
      var mensagemSegura = $("<div>").text(mensagem).html();
      Utilitarios.mostrarAlerta($container, mensagemSegura, tipo);
    },

    mostrarAlertaCadastroSimples: function (mensagem, tipo) {
      this.mostrarAlertaPainel(this.elementos.$alertaCadastroSimples, mensagem, tipo);
    },

    restaurarBotaoCadastroSimples: function () {
      this.elementos.$botaoCadastrarSimples.prop("disabled", false).text("Cadastrar");
      this.elementos.$formCadastroSimples.removeAttr("aria-busy");
    },

    limparCadastroSimples: function () {
      var el = this.elementos;

      el.$formCadastroSimples.get(0).reset();
      el.$formCadastroSimples.find(".form-control").removeClass("is-invalid").removeAttr("aria-invalid");
      el.$inputSenhaCadastro.attr("type", "password");
      el.$botaoVisibilidadeSenha
        .attr("aria-pressed", "false")
        .find(".material-symbols-outlined")
        .text("visibility");
      el.$alertaCadastroSimples.empty();
      this.restaurarBotaoCadastroSimples();
    },

    enviarCadastroSimples: function () {
      var self = this;
      var el = this.elementos;

      var nomeUsuario = $.trim(el.$inputNomeUsuarioCadastro.val());
      var email = $.trim(el.$inputEmailCadastro.val());
      var senha = el.$inputSenhaCadastro.val();
      var cpfLimpo = Utilitarios.apenasNumeros(el.$inputCpfCadastro.val());

      var existeCampoVazio = Utilitarios.validarCampos([
        { valor: nomeUsuario, el: el.$inputNomeUsuarioCadastro },
        { valor: email, el: el.$inputEmailCadastro },
        { valor: senha, el: el.$inputSenhaCadastro },
        { valor: cpfLimpo, el: el.$inputCpfCadastro }
      ]);

      if (existeCampoVazio) {
        this.mostrarAlertaCadastroSimples("Preencha todos os campos obrigatórios!", "danger");
        el.$formCadastroSimples.find(".is-invalid").attr("aria-invalid", "true").first().trigger("focus");
        return;
      }

      if (!Utilitarios.emailValido(email)) {
        Utilitarios.marcarCamposComErro(el.$alertaCadastroSimples, [el.$inputEmailCadastro], "E-mail inválido!");
        el.$inputEmailCadastro.attr("aria-invalid", "true").trigger("focus");
        return;
      }

      if (!Utilitarios.cpfValido(cpfLimpo)) {
        Utilitarios.marcarCamposComErro(el.$alertaCadastroSimples, [el.$inputCpfCadastro], "CPF inválido!");
        el.$inputCpfCadastro.attr("aria-invalid", "true").trigger("focus");
        return;
      }

      el.$botaoCadastrarSimples.prop("disabled", true).text("Cadastrando...");
      el.$formCadastroSimples.attr("aria-busy", "true");

      var dadosCadastro = new FormData();
      dadosCadastro.append("acao", el.$formCadastroSimples.attr("data-acaoEnvio") || "cadastrar");
      dadosCadastro.append("username", nomeUsuario);
      // Provisório: o formulário não tem campo de nome completo, então o backend
      // receberia cli_nome vazio. Trocar quando o campo existir.
      dadosCadastro.append("nome", nomeUsuario);
      dadosCadastro.append("email", email);
      dadosCadastro.append("senha", senha);
      dadosCadastro.append("CPF", cpfLimpo);

      $.ajax({
        url: this.configuracao.urlCadastroCliente,
        method: "POST",
        data: dadosCadastro,
        processData: false,
        contentType: false,
        dataType: "json"
      })
        .done(function (resposta) {
          if (resposta && resposta.sucesso === true) {
            self.mostrarAlertaCadastroSimples("Cadastro realizado!", "success");
            setTimeout(function () {
              $(document).trigger("cadastroSimplesConcluido", [{ email: email }]);
              self.iniciarAtivacao(email);
            }, 1500);
            return;
          }

          self.restaurarBotaoCadastroSimples();
          self.mostrarAlertaCadastroSimples(
            (resposta && resposta.mensagem) || "Não foi possível realizar o cadastro.",
            "danger"
          );
        })
        .fail(function (xhr, status, erro) {
          console.error("Erro no cadastro simples:", status, erro, xhr.responseText);
          self.restaurarBotaoCadastroSimples();
          self.mostrarAlertaCadastroSimples("Erro na requisição!", "danger");
        });
    },


    abrirPainel: function ($painel) {
      var painel = bootstrap.Offcanvas.getOrCreateInstance($painel.get(0));
      var $modal = this.elementos.$modalNaoLogado;
      var $painelAberto = $(".offcanvas.show").not($painel);

      if ($modal.hasClass("show")) {
        $modal.one("hidden.bs.modal", function () {
          painel.show();
        });
        Utilitarios.esconderModal($modal);
        return;
      }

      if ($painelAberto.length) {
        $painelAberto.first().one("hidden.bs.offcanvas", function () {
          painel.show();
        });
        bootstrap.Offcanvas.getOrCreateInstance($painelAberto.get(0)).hide();
        return;
      }

      painel.show();
    },

    fecharPainel: function ($painel) {
      var painel = bootstrap.Offcanvas.getInstance($painel.get(0));
      if (painel) {
        painel.hide();
      }
    },

    registrarEventosAtivacaoELogin: function () {
      var self = this;
      var el = this.elementos;

      el.$botaoRealizarLogin.on("click", function () {
        self.abrirPainel(el.$painelLogin);
      });

      el.$linkCadastroPainelLogin.on("click", function (evento) {
        evento.preventDefault();
        self.abrirPainel(el.$painelCadastroSimples);
      });

      el.$botaoVisibilidadeSenhaLogin.on("click", function () {
        self.alternarVisibilidadeSenha(el.$inputSenhaLogin, el.$botaoVisibilidadeSenhaLogin);
      });

      el.$formAtivacao.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarAtivacao();
      });

      el.$botaoGerarCodigo.on("click", function () {
        self.solicitarCodigo(self.estado.emailPendente, true);
      });

      el.$formLogin.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarLogin();
      });

      el.$formAtivacao.add(el.$formLogin).on("input change", ".form-control", function () {
        $(this).removeClass("is-invalid").removeAttr("aria-invalid");
      });

      el.$painelAtivacao.on("shown.bs.offcanvas", function () {
        el.$inputCodigoAtivacao.trigger("focus");
      });

      el.$painelAtivacao.on("hidden.bs.offcanvas", function () {
        self.limparAtivacao();
      });

      el.$painelLogin.on("shown.bs.offcanvas", function () {
        if (el.$inputEmailLogin.val()) {
          el.$inputSenhaLogin.trigger("focus");
        } else {
          el.$inputEmailLogin.trigger("focus");
        }
      });

      el.$painelLogin.on("hidden.bs.offcanvas", function () {
        var retomar = self.estado.retomarAposLogin;
        self.limparLogin();
        if (retomar) {
          self.estado.retomarAposLogin = false;
          self.verificarLoginEEnviar();
        }
      });

      Utilitarios.validarAoSair(el.$alertaLogin, [
        {
          $campo: el.$inputEmailLogin,
          valido: function (valor) { return Utilitarios.emailValido(valor); },
          mensagem: "E-mail inválido!"
        }
      ]);
    },

    iniciarAtivacao: function (email) {
      this.estado.emailPendente = email;
      this.solicitarCodigo(email, false);
      this.abrirPainel(this.elementos.$painelAtivacao);
    },


    solicitarCodigo: function (email, mostrarSucesso) {
      var self = this;
      var el = this.elementos;

      if (!email) {
        this.mostrarAlertaPainel(
          el.$alertaAtivacao,
          "Não foi possível identificar o e-mail. Faça o cadastro ou o login novamente.",
          "danger"
        );
        return;
      }

      el.$botaoGerarCodigo.prop("disabled", true);

      $.ajax({
        url: this.configuracao.urlCadastroCliente,
        method: "POST",
        dataType: "json",
        data: {
          acao: el.$formAtivacao.attr("data-acaoNovoCodigo") || "ReGerarCodigo",
          email: email
        }
      })
        .done(function (resposta) {
          if (resposta && resposta.sucesso === true) {
            if (mostrarSucesso) {
              self.mostrarAlertaPainel(el.$alertaAtivacao, "Novo código enviado para o seu e-mail.", "success");
            }
            return;
          }
          self.mostrarAlertaPainel(
            el.$alertaAtivacao,
            (resposta && resposta.mensagem) || "Não foi possível gerar o código.",
            "danger"
          );
        })
        .fail(function () {
          self.mostrarAlertaPainel(el.$alertaAtivacao, "Erro na requisição!", "danger");
        })
        .always(function () {
          el.$botaoGerarCodigo.prop("disabled", false);
        });
    },

    enviarAtivacao: function () {
      var self = this;
      var el = this.elementos;
      var codigo = $.trim(el.$inputCodigoAtivacao.val());

      if (!this.estado.emailPendente) {
        this.mostrarAlertaPainel(
          el.$alertaAtivacao,
          "Não foi possível identificar o e-mail. Faça o cadastro ou o login novamente.",
          "danger"
        );
        return;
      }

      if (Utilitarios.validarCampos([{ valor: codigo, el: el.$inputCodigoAtivacao }])) {
        this.mostrarAlertaPainel(el.$alertaAtivacao, "Informe o código de ativação!", "danger");
        el.$inputCodigoAtivacao.attr("aria-invalid", "true").trigger("focus");
        return;
      }

      el.$botaoAtivarConta.prop("disabled", true).text("Ativando...");
      el.$botaoGerarCodigo.prop("disabled", true);
      el.$formAtivacao.attr("aria-busy", "true");

      $.ajax({
        url: this.configuracao.urlCadastroCliente,
        method: "POST",
        dataType: "json",
        data: {
          acao: el.$formAtivacao.attr("data-acaoEnvio") || "ativar",
          email: this.estado.emailPendente,
          cod: codigo
        }
      })
        .done(function (resposta) {
          if (resposta && resposta.sucesso === true) {
            self.mostrarAlertaPainel(el.$alertaAtivacao, "Conta ativada!", "success");
            setTimeout(function () {
              self.prepararLogin(self.estado.emailPendente);
              self.abrirPainel(el.$painelLogin);
            }, 1200);
            return;
          }

          self.restaurarBotoesAtivacao();
          self.mostrarAlertaPainel(
            el.$alertaAtivacao,
            (resposta && resposta.mensagem) || "Não foi possível ativar a conta.",
            "danger"
          );
        })
        .fail(function () {
          self.restaurarBotoesAtivacao();
          self.mostrarAlertaPainel(el.$alertaAtivacao, "Erro na requisição!", "danger");
        });
    },

    restaurarBotoesAtivacao: function () {
      this.elementos.$botaoAtivarConta.prop("disabled", false).text("Ativar");
      this.elementos.$botaoGerarCodigo.prop("disabled", false);
      this.elementos.$formAtivacao.removeAttr("aria-busy");
    },

    limparAtivacao: function () {
      var el = this.elementos;

      el.$formAtivacao.get(0).reset();
      el.$formAtivacao.find(".form-control").removeClass("is-invalid").removeAttr("aria-invalid");
      el.$alertaAtivacao.empty();
      this.restaurarBotoesAtivacao();
    },

    prepararLogin: function (email) {
      this.elementos.$inputEmailLogin.val(email || "");
    },

    enviarLogin: function () {
      var self = this;
      var el = this.elementos;

      var email = $.trim(el.$inputEmailLogin.val());
      var senha = el.$inputSenhaLogin.val();

      var existeCampoVazio = Utilitarios.validarCampos([
        { valor: email, el: el.$inputEmailLogin },
        { valor: senha, el: el.$inputSenhaLogin }
      ]);

      if (existeCampoVazio) {
        this.mostrarAlertaPainel(el.$alertaLogin, "Preencha todos os campos obrigatórios!", "danger");
        el.$formLogin.find(".is-invalid").attr("aria-invalid", "true").first().trigger("focus");
        return;
      }

      if (!Utilitarios.emailValido(email)) {
        Utilitarios.marcarCamposComErro(el.$alertaLogin, [el.$inputEmailLogin], "E-mail inválido!");
        el.$inputEmailLogin.attr("aria-invalid", "true").trigger("focus");
        return;
      }

      el.$botaoLogarCliente.prop("disabled", true).text("Entrando...");
      el.$formLogin.attr("aria-busy", "true");

      $.ajax({
        url: this.configuracao.urlCadastroCliente,
        method: "POST",
        dataType: "json",
        data: {
          acao: el.$formLogin.attr("data-acaoEnvio") || "login",
          email: email,
          senha: senha
        }
      })
        .done(function (resposta) {
          if (resposta && resposta.sucesso === true) {
            // O agendamento é retomado quando o painel termina de fechar
            // (handler de hidden.bs.offcanvas em registrarEventosAtivacaoELogin).
            self.estado.retomarAposLogin = true;
            self.fecharPainel(el.$painelLogin);
            return;
          }

          var mensagem = (resposta && resposta.mensagem) || "Não foi possível entrar.";
          self.restaurarBotaoLogin();

          // Conta criada mas nunca ativada: leva o usuário direto para a ativação.
          if (/n[ãa]o ativada/i.test(mensagem)) {
            self.iniciarAtivacao(email);
            return;
          }

          self.mostrarAlertaPainel(el.$alertaLogin, mensagem, "danger");
        })
        .fail(function () {
          self.restaurarBotaoLogin();
          self.mostrarAlertaPainel(el.$alertaLogin, "Erro na requisição!", "danger");
        });
    },

    restaurarBotaoLogin: function () {
      this.elementos.$botaoLogarCliente.prop("disabled", false).text("Logar");
      this.elementos.$formLogin.removeAttr("aria-busy");
    },

    limparLogin: function () {
      var el = this.elementos;

      el.$formLogin.get(0).reset();
      el.$formLogin.find(".form-control").removeClass("is-invalid").removeAttr("aria-invalid");
      el.$inputSenhaLogin.attr("type", "password");
      el.$botaoVisibilidadeSenhaLogin
        .attr("aria-pressed", "false")
        .find(".material-symbols-outlined")
        .text("visibility");
      el.$alertaLogin.empty();
      this.restaurarBotaoLogin();
    }
  };

  $(function () {
    moduloAgendamentoCli.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);