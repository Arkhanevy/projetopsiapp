/* ============================================================
   RESUMO DO ARQUIVO: agendamentoCli.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloAgendamentoCli
   - Função/método: iniciar
   - Função/método: urlElementos
   - Função/método: registrarEventos
   - Função/método: cancelarAgendamento
   - Função/método: buscarDadosAgendamento
   - Função/método: mapearDadosServico
   - Função/método: tratarFalhaCarregamento
   - Função/método: renderizarLocalizacoes
   - Função/método: selecionarLocalizacao
   - Função/método: navegarMes
   - Função/método: buscarDiasIndisponiveis
   - Função/método: extrairDiasIndisponiveis
   - Função/método: renderizarCalendario
   - Função/método: formatarDataChave
   - Função/método: selecionarDia
   - Função/método: resetarHorario
   - Função/método: buscarHorariosDisponiveis
   - Função/método: mapearHorarios
   - Função/método: renderizarHorarios
   - Função/método: selecionarHorario
   - Função/método: alternarDropdown
   - Função/método: abrirDropdown
   - Função/método: fecharDropdown
   - Função/método: fecharTodosDropdowns
   - Função/método: registrarNavegacaoTecladoLista
   - Função/método: marcarCampoComErro
   - Função/método: removerErroCampo
   - Função/método: exibirAlertaValidacao
   - Função/método: esconderAlertaValidacao
   - Função/método: tentarConfirmarAgendamento
   - Função/método: verificarLoginEEnviar
   - Função/método: enviarAgendamento
   - Função/método: irParaInfoServicoComSucesso
   - Função/método: exibirModalErro
   - Função/método: exibirModalNaoLogado
   ============================================================ */

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

  // Objeto \'moduloAgendamentoCli\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloAgendamentoCli = {

    /* ---------- Configuração ---------- */
    configuracao: {
      urlServico: "index.php?uri=servico",
      urlVerificarLogin: "index.php?uri=cliente", //Axalote
      urlInfoServico: "index.php?uri=infoServico",
      urlLogin: "index.php?uri=login", //Axalote
      urlCadastro: "index.php?uri=cadastro"
    },

    /* ---------- Estado interno ---------- */
    estado: {
      idServico: null,
      dataExibida: new Date(),
      diasIndisponiveis: [],
      diaSelecionado: null,
      localizacaoSelecionada: null,
      horarioSelecionado: null
    },

    /* ---------- Referências de elementos (cacheadas) ---------- */
    elementos: {},

    // Método \'iniciar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    iniciar: function() {
      this.urlElementos();
      this.estado.idServico = Utilitarios.obterParametroUrl("servico");
      this.elementos.$inputIdServico.val(this.estado.idServico || "");

      this.registrarEventos();
      this.buscarDadosAgendamento();
    },

    // Método \'urlElementos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    urlElementos: function() {
      this.elementos.$form = $("#formularioAgendamento");
      this.elementos.$alerta = $("#alertaValidacao");
      this.elementos.$inputIdServico = $("#inputIdServico");
      this.elementos.$camposDinamicos = $("[data-campo]");

      this.elementos.$botaoVoltar = $("#botaoVoltar");
      this.elementos.$botaoCancelar = $("#botaoCancelarAgendamento");
      this.elementos.$botaoConfirmar = $("#botaoConfirmarAgendamento");

      this.elementos.$dropdownLocalizacao = $("#dropdownLocalizacao");
      //this.elementos.$botaoLocalizacao = $("#botaoDropdownLocalizacao");
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

    // Método \'registrarEventos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    registrarEventos: function() {
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

      /*this.elementos.$botaoLocalizacao.on("click", function (evento) {
        evento.stopPropagation();
        self.alternarDropdown(self.elementos.$dropdownLocalizacao, self.elementos.$inputLocalizacao);
      });*/

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

    // Método \'cancelarAgendamento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    cancelarAgendamento: function() {
      var url = this.configuracao.urlInfoServico;
      if (this.estado.idServico) {
        url += "&id=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    },

    /* CARREGAMENTO DE DADOS */

    // Método \'buscarDadosAgendamento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    buscarDadosAgendamento: function() {
      var self = this;

      Utilitarios.esconderModal(this.elementos.$modalErro);
      this.elementos.$form.removeClass("estadoErro").addClass("estadoCarregando");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);

      console.log("ID do serviço:", this.estado.idServico);
      console.log("URL do serviço:", this.configuracao.urlServico);

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "json",
        data: {
          acao: "mostrardetalhes",
          ser_id: this.estado.idServico
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
          //self.renderizarLocalizacoes([]);
          self.buscarDiasIndisponiveis(self.estado.dataExibida);
        })
        .fail(function () {
          self.tratarFalhaCarregamento();
        });
    },

    // Método \'mapearDadosServico\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mapearDadosServico: function(registro) {
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

    // Método \'tratarFalhaCarregamento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    tratarFalhaCarregamento: function() {
      this.elementos.$form.removeClass("estadoCarregando").addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.exibirModalErro();
    },

    /*  LOCALIZAÇÃO 

    // Método \'renderizarLocalizacoes\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    renderizarLocalizacoes: function(localizacoes) {
      var self = this;
      this.elementos.$listaLocalizacoes.empty();

      localizacoes.forEach(function (local) {
        var $item = $(
          '<li role="presentation"><button type="button" class="dropdownCustomizadoItem" role="option"></button></li>'
        );
        $item
          .find("button")
          .attr("data-valor", local.id)
          .attr("data-texto", local.nome)
          .text(local.nome)
          .append(
            '<span class="material-symbols-outlined" aria-hidden="true">manage_search</span>'
          );
        self.elementos.$listaLocalizacoes.append($item);
      });
    },

    // Método \'selecionarLocalizacao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    selecionarLocalizacao: function(id, nome) {
      this.estado.localizacaoSelecionada = id;
      this.elementos.$inputLocalizacao.val(id);
      this.elementos.$textoLocalizacao.text(nome);
      this.fecharDropdown(this.elementos.$dropdownLocalizacao);
      this.removerErroCampo(this.elementos.$botaoLocalizacao);
      this.elementos.$botaoLocalizacao.trigger("focus");
    },*/

    /* CALENDÁRIO */

    // Método \'navegarMes\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    navegarMes: function(deltaMeses) {
      this.estado.dataExibida.setMonth(this.estado.dataExibida.getMonth() + deltaMeses);
      this.estado.diaSelecionado = null;
      this.elementos.$inputDia.val("");
      this.resetarHorario();
      this.buscarDiasIndisponiveis(this.estado.dataExibida);
    },

    // Método \'buscarDiasIndisponiveis\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    buscarDiasIndisponiveis: function(data) {
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


    // Método \'extrairDiasIndisponiveis\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.


    extrairDiasIndisponiveis: function(resposta) {
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

    // Método \'renderizarCalendario\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    renderizarCalendario: function(data) {
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

    // Método \'formatarDataChave\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    formatarDataChave: function(ano, mesIndiceZero, dia) {
      var mesFormatado = String(mesIndiceZero + 1).padStart(2, "0");
      var diaFormatado = String(dia).padStart(2, "0");
      return ano + "-" + mesFormatado + "-" + diaFormatado;
    },

    // Método \'selecionarDia\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    selecionarDia: function(dataChave) {
      this.estado.diaSelecionado = dataChave;
      this.elementos.$inputDia.val(dataChave);
      this.removerErroCampo(this.elementos.$calendario);

      // Atualiza visualmente sem re-renderizar todo o calendário.
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

    /* HORÁRIO */

    // Método \'resetarHorario\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    resetarHorario: function() {
      this.estado.horarioSelecionado = null;
      this.elementos.$inputHorario.val("");
      this.elementos.$textoHorario.text("Selecione horário");
      this.elementos.$listaHorarios.empty();
      this.elementos.$botaoHorario.prop("disabled", true);
      this.fecharDropdown(this.elementos.$dropdownHorario);
    },

    // Método \'buscarHorariosDisponiveis\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    buscarHorariosDisponiveis: function(dataChave) {
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

    // Método \'mapearHorarios\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mapearHorarios: function(horarios) {
      return horarios.map(function (horario) {
        return {
          valor: horario.inicio + "|" + horario.termino,
          texto: horario.inicio + " às " + horario.termino
        };
      });
    },

    // Método \'renderizarHorarios\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    renderizarHorarios: function(horarios) {
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

    // Método \'selecionarHorario\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    selecionarHorario: function(valor, texto) {
      this.estado.horarioSelecionado = valor;
      this.elementos.$inputHorario.val(valor);
      this.elementos.$textoHorario.text(texto);
      this.fecharDropdown(this.elementos.$dropdownHorario);
      this.removerErroCampo(this.elementos.$botaoHorario);
      this.elementos.$botaoHorario.trigger("focus");
    },

    /* DROPDOWNS — abrir/fechar */

    // Método \'alternarDropdown\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    alternarDropdown: function($dropdown, $inputOculto) {
      var $lista = $dropdown.find(".dropdownCustomizadoLista");
      var estaAberta = !$lista.attr("hidden");

      this.fecharTodosDropdowns();

      if (!estaAberta) {
        this.abrirDropdown($dropdown, $inputOculto);
      }
    },

    //Abre o dropdown e move o foco para a opção já selecionada (se houver) ou para a primeira opção da lista
    // Método \'abrirDropdown\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    abrirDropdown: function($dropdown, $inputOculto) {
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
        return $(this).data("valor") === valorAtual;
      });

      var $itemFoco;
      if ($itemSelecionado.length) {
        $itemFoco = $itemSelecionado;
      } else {
        $itemFoco = $itens.first();
      }
      $itemFoco.trigger("focus");
    },

    // Método \'fecharDropdown\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    fecharDropdown: function($dropdown) {
      $dropdown.find(".dropdownCustomizadoLista").attr("hidden", "hidden");
      $dropdown.find(".dropdownCustomizadoBotao").attr("aria-expanded", "false");
    },

    // Método \'fecharTodosDropdowns\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    fecharTodosDropdowns: function() {
      this.fecharDropdown(this.elementos.$dropdownLocalizacao);
      this.fecharDropdown(this.elementos.$dropdownHorario);
    },

    /* Implementa a navegação por teclado do padrão ARIA "listbox"
     * dentro de uma lista de opções: setas para cima/baixo movem o
     * foco entre as opções (com wrap-around), Home/End vão para a
     * primeira/última. Enter/Espaço já funcionam nativamente, pois
     * as opções são elementos <button>.
     */
    // Método \'registrarNavegacaoTecladoLista\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    registrarNavegacaoTecladoLista: function($lista) {
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

    /* VALIDAÇÃO E ENVIO DO AGENDAMENTO */

    // Método \'marcarCampoComErro\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    marcarCampoComErro: function($elemento) {
      $elemento.addClass("campoComErro");
    },

    // Método \'removerErroCampo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    removerErroCampo: function($elemento) {
      $elemento.removeClass("campoComErro");
    },

    // Método \'exibirAlertaValidacao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirAlertaValidacao: function(mensagem) {
      this.elementos.$alerta
        .text(mensagem || "Você precisa preencher todos os dados!")
        .removeAttr("hidden");
    },

    // Método \'esconderAlertaValidacao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    esconderAlertaValidacao: function() {
      this.elementos.$alerta.attr("hidden", "hidden");
    },

    // Método \'tentarConfirmarAgendamento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    tentarConfirmarAgendamento: function() {
      var self = this;
      var camposValidos = true;
      var $primeiroInvalido = null;

      /*if (!this.estado.localizacaoSelecionada) {
        this.marcarCampoComErro(this.elementos.$botaoLocalizacao);
        $primeiroInvalido = $primeiroInvalido || this.elementos.$botaoLocalizacao;
        camposValidos = false;
      }*/

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

    // Método \'verificarLoginEEnviar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    verificarLoginEEnviar: function() {
      var self = this;

      $.ajax({
        url: this.configuracao.urlVerificarLogin,
        method: "POST",
        dataType: "json"
      })
        .done(function (resposta) {
          if (resposta && resposta.logado) {
            self.enviarAgendamento();
          } else {
            self.exibirModalNaoLogado();
          }
        })
        .fail(function () {
          self.exibirModalNaoLogado();
        });
    },

    // Método \'enviarAgendamento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    enviarAgendamento: function() {
      var self = this;
      var partesHorario = (this.estado.horarioSelecionado || "").split("|");// Retornar o horario para "inicio" e "termino" separados.

      this.elementos.$botaoConfirmar.prop("disabled", true);

      $.ajax({
        url: this.configuracao.urlServico,
        method: "POST",
        dataType: "text",
        data: {
          acao: "agendar",
          dia: this.estado.diaSelecionado,
          inicio: partesHorario[0],
          termino: partesHorario[1]
        }
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

    // Método \'irParaInfoServicoComSucesso\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    irParaInfoServicoComSucesso: function() {
      var url = this.configuracao.urlInfoServico + "&agendado=1";
      if (this.estado.idServico) {
        url += "&id=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    },

    /* MODAIS */

    // Método \'exibirModalErro\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirModalErro: function() {
      Utilitarios.exibirModal(this.elementos.$modalErro, {
        backdrop: "static",
        keyboard: false
      });
    },

    // Método \'exibirModalNaoLogado\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirModalNaoLogado: function() {
      Utilitarios.exibirModal(this.elementos.$modalNaoLogado);
    }
  };

  $(function () {
    moduloAgendamentoCli.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
