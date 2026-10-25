console.log("JS agendamentoCli carregado");

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
      urlLogin: "index.php?uri=loginCliente",

      contratos: {

        listarLocalizacoes: { acao: "listarLocalizacoes", disponivel: false },

        mostrarSala: { acao: "mostrarSala", disponivel: true }
      }
    },

    estado: {
      idServico: null,
      dataExibida: new Date(),
      diasIndisponiveis: [],
      diaSelecionado: null,
      localizacaoSelecionada: null,
      localizacoesDisponiveis: false,
      horarioSelecionado: null
    },

    elementos: {},

    iniciar: function () {
      this.urlElementos();
      this.estado.idServico = Utilitarios.obterParametroUrl("servico");
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

      this.elementos.$dropdownLocalizacao = $("#dropdownLocalizacao");
      this.elementos.$areaLocalizacao = $(".areaLocalizacao");
      this.elementos.$botaoLocalizacao = $("#botaoDropdownLocalizacao");
      this.elementos.$textoLocalizacao = $("#textoLocalizacaoSelecionada");
      this.elementos.$listaLocalizacoes = $("#listaLocalizacoes");
      this.elementos.$inputLocalizacao = $("#inputLocalizacaoSelecionada");

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

      this.elementos.$botaoLocalizacao.on("click", function (evento) {
        evento.stopPropagation();
        self.alternarDropdown(self.elementos.$dropdownLocalizacao, self.elementos.$inputLocalizacao);
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
        ".diaCalendario:not(.diaIndisponivel):not(.diaVazio)",
        function () {
          self.selecionarDia($(this).data("data"));
        }
      );

      this.elementos.$listaLocalizacoes.on("click", ".dropdownCustomizadoItem", function () {
        self.selecionarLocalizacao($(this).data("valor"), $(this).data("texto"));
      });

      this.elementos.$listaHorarios.on("click", ".dropdownCustomizadoItem", function () {
        self.selecionarHorario($(this).data("valor"), $(this).data("texto"));
      });

      this.registrarNavegacaoTecladoLista(this.elementos.$listaLocalizacoes);
      this.registrarNavegacaoTecladoLista(this.elementos.$listaHorarios);

      this.elementos.$modalErro.on("shown.bs.modal", function () {
        self.elementos.$botaoTentarNovamente.trigger("focus");
      });

      this.elementos.$botaoTentarNovamente.on("click", function () {
        self.buscarDadosAgendamento();
      });

      this.elementos.$botaoRealizarLogin.on("click", function () {
        window.location.href =
          self.configuracao.urlLogin +
          "?redirecionar=" +
          encodeURIComponent(window.location.href);
      });
    },

    cancelarAgendamento: function () {
      var url = this.configuracao.urlInfoServico;
      if (this.estado.idServico) {
        url += "&id=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    },

    buscarDadosAgendamento: function () {
      var self = this;

      Utilitarios.esconderModal(this.elementos.$modalErro);
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

          Utilitarios.preencherCampos(
            self.elementos.$camposDinamicos,
            self.mapearDadosServico(resposta.dados[0])
          );
          Utilitarios.alternarEsqueletoAcessivel(self.elementos.$camposDinamicos, false);
          self.carregarLocalizacoes();
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
        precoServico: precoFormatado
      };
    },

    tratarFalhaCarregamento: function () {
      this.elementos.$form.removeClass("estadoCarregando").addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.exibirModalErro();
    },

    carregarLocalizacoes: function () {
      var self = this;
      var contrato = this.configuracao.contratos.listarLocalizacoes;

      this.estado.localizacoesDisponiveis = false;
      this.elementos.$areaLocalizacao.attr("hidden", "hidden");

      if (!contrato.disponivel) {
        return;
      }

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: contrato.acao,
          id: this.estado.idServico
        }
      })
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso || !$.isArray(resposta.dados)) {
            self.tratarFalhaCarregamento();
            return;
          }
          if (!resposta.dados.length) {
            return;
          }
          self.renderizarLocalizacoes(resposta.dados);
          self.estado.localizacoesDisponiveis = true;
          self.elementos.$areaLocalizacao.removeAttr("hidden");
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
        });
    },

    renderizarLocalizacoes: function (localizacoes) {
      var self = this;
      this.elementos.$listaLocalizacoes.empty();

      localizacoes.forEach(function (local) {
        var $item = $(
          '<li role="presentation"><button type="button" class="dropdownCustomizadoItem" role="option"></button></li>'
        );
        $item
          .find("button")
          .attr("data-valor", local.loc_id)
          .attr("data-texto", local.loc_nome)
          .text(local.loc_nome)
          .append(
            '<span class="material-symbols-outlined" aria-hidden="true">location_on</span>'
          );
        self.elementos.$listaLocalizacoes.append($item);
      });
    },

    selecionarLocalizacao: function (id, nome) {
      this.estado.localizacaoSelecionada = id;
      this.elementos.$inputLocalizacao.val(id);
      this.elementos.$textoLocalizacao.text(nome);
      this.fecharDropdown(this.elementos.$dropdownLocalizacao);
      this.removerErroCampo(this.elementos.$botaoLocalizacao);
      this.elementos.$botaoLocalizacao.trigger("focus");
    },

    navegarMes: function (deltaMeses) {
      this.estado.dataExibida.setMonth(this.estado.dataExibida.getMonth() + deltaMeses);
      this.estado.diaSelecionado = null;
      this.elementos.$inputDia.val("");
      this.resetarHorario();
      this.buscarDiasIndisponiveis(this.estado.dataExibida);
    },

    buscarDiasIndisponiveis: function (data) {
      var self = this;

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
          if (!resposta || typeof resposta === "string") {
            self.tratarFalhaCarregamento();
            return;
          }

          self.estado.diasIndisponiveis = self.extrairDiasIndisponiveis(resposta);
          self.elementos.$form.removeClass("estadoCarregando estadoErro");
          self.renderizarCalendario(data);
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
        });
    },

    extrairDiasIndisponiveis: function (resposta) {
      var self = this;
      var indisponiveis = [];

      ["folga", "indisponivel"].forEach(function (chave) {
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

    renderizarCalendario: function (data) {
      var ano = data.getFullYear();
      var mes = data.getMonth();
      var primeiroDiaSemana = new Date(ano, mes, 1).getDay();
      var totalDias = new Date(ano, mes + 1, 0).getDate();

      this.elementos.$tituloMesAno.text(NOMES_MES[mes] + " " + ano);
      this.elementos.$grade.empty();

      for (var i = 0; i < primeiroDiaSemana; i++) {
        this.elementos.$grade.append(
          '<button type="button" class="diaCalendario diaVazio" disabled aria-hidden="true" tabindex="-1"></button>'
        );
      }

      for (var dia = 1; dia <= totalDias; dia++) {
        var dataChave = this.formatarDataChave(ano, mes, dia);
        var indisponivel = this.estado.diasIndisponiveis.indexOf(dataChave) !== -1;
        var selecionado = dataChave === this.estado.diaSelecionado;
        var nomeDiaSemana = NOMES_DIA_SEMANA[new Date(ano, mes, dia).getDay()];

        var rotulo = nomeDiaSemana + ", " + dia + " de " + NOMES_MES_COMPLETO[mes];
        if (indisponivel) {
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

        if (indisponivel) {
          $botaoDia.addClass("diaIndisponivel").prop("disabled", true);
          $botaoDia.attr("aria-disabled", "true");
        }
        if (selecionado) {
          $botaoDia.addClass("diaSelecionado");
        }

        this.elementos.$grade.append($botaoDia);
      }
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

      this.resetarHorario();
      this.buscarHorariosDisponiveis(dataChave);
    },

    resetarHorario: function () {
      this.estado.horarioSelecionado = null;
      this.elementos.$inputHorario.val("");
      this.elementos.$textoHorario.text("Selecione horário");
      this.elementos.$listaHorarios.empty();
      this.elementos.$botaoHorario.prop("disabled", true);
      this.fecharDropdown(this.elementos.$dropdownHorario);
    },

    buscarHorariosDisponiveis: function (dataChave) {
      var self = this;

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
          if (!resposta || typeof resposta === "string" || !Array.isArray(resposta)) {
            self.tratarFalhaCarregamento();
            return;
          }
          self.renderizarHorarios(self.mapearHorarios(resposta));
          self.elementos.$botaoHorario.prop("disabled", false);
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
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
      this.fecharDropdown(this.elementos.$dropdownLocalizacao);
      this.fecharDropdown(this.elementos.$dropdownHorario);
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

      if (this.estado.localizacoesDisponiveis && !this.estado.localizacaoSelecionada) {
        this.marcarCampoComErro(this.elementos.$botaoLocalizacao);
        $primeiroInvalido = $primeiroInvalido || this.elementos.$botaoLocalizacao;
        camposValidos = false;
      }

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
            self.buscarSalaLivre();
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

    buscarSalaLivre: function () {
      var self = this;
      var contrato = this.configuracao.contratos.mostrarSala;
      var partesHorario = this.obterPartesHorario();
      var dados = {
        acao: contrato.acao,
        inicio: partesHorario[0],
        termino: partesHorario[1]
      };
      if (this.estado.localizacaoSelecionada) {
        dados.localizacao = this.estado.localizacaoSelecionada;
      }

      this.elementos.$botaoConfirmar.prop("disabled", true);

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: dados
      })
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso || !$.isArray(resposta.dados)) {
            self.exibirAlertaValidacao("Não foi possível concluir o agendamento. Tente novamente.");
            self.elementos.$botaoConfirmar.prop("disabled", false);
            return;
          }
          if (!resposta.dados.length) {
            self.exibirAlertaValidacao("Não há sala disponível nesse horário. Escolha outro horário.");
            self.elementos.$botaoConfirmar.prop("disabled", false);
            return;
          }
          self.enviarAgendamento(resposta.dados[0].sala_id);
        })
        .fail(function () {
          self.exibirAlertaValidacao("Não foi possível concluir o agendamento. Tente novamente.");
          self.elementos.$botaoConfirmar.prop("disabled", false);
        });
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
      if (this.estado.localizacaoSelecionada) {
        dados.localizacao = this.estado.localizacaoSelecionada;
      }

      this.elementos.$botaoConfirmar.prop("disabled", true);

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "text",
        data: dados
      })
        .done(function (respostaTexto) {
          if ($.trim(respostaTexto) === "sucesso") {
            self.irParaInfoServicoComSucesso();
            return;
          }
          self.exibirAlertaValidacao(
            "Não foi possível concluir o agendamento. Tente novamente."
          );
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
    }
  };

  $(function () {
    moduloAgendamentoCli.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
