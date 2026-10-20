/* ============================================================
   ARQUIVO: agendamentoCli.js

   O QUE FAZ
   Tela de agendamento do cliente: carrega os dados do serviço, mostra um
   calendário mensal com os dias indisponíveis, lista os horários livres do
   dia escolhido, valida a escolha, confere se o cliente está logado e envia o
   agendamento.

   OBSERVAÇÕES
   - Depende de jQuery, Bootstrap (modais) e ElmoUtilitarios (utilitarios.js).
   - Cliente deslogado ao confirmar vê o modal 'não logado' com botão para o
     login.
   - Localização (clínica/local de atendimento): o cliente escolhe entre as
     opções do profissional. O contrato listarLocalizacoes ainda não existe no
     backend (disponivel: false): enquanto isso o campo fica oculto e não é
     obrigatório. Quando existir, resposta { sucesso, dados: [{ loc_id,
     loc_nome }] }; é preciso ligar disponivel: true e fazer o mostrarSala do
     servidor usar a localização enviada (hoje usa ser_loc da sessão).
   - A sala não é escolhida pelo cliente: buscarSalaLivre() pede mostrarSala e
     usa a primeira sala livre no horário; sem sala livre, avisa e não envia.
   - O agendar do backend não confere se a sala continua livre ao gravar:
     dois agendamentos simultâneos podem receber a mesma sala.
   - navegarMes() usa setMonth sobre a data de hoje: nos dias 29 a 31, avançar
     para um mês mais curto pula para o mês seguinte (ex.: 31/jan + 1 mês =
     3/mar).
   - enviarAgendamento() envia sala, dia, início e término (sem id do serviço):
     o servidor precisa saber o serviço por outro meio, como a sessão.
   - A resposta de 'agendar' é texto simples: só o texto 'sucesso' conta como
     êxito.
   - buscarDadosAgendamento() usa index.php?uri=busca (tipo "servico", id),
     que também grava $_SESSION['servico'] usada pelo Servicocontroller.
   - verificarLoginEEnviar() envia acao=verificarLogin; urlLogin aponta para
     loginCliente (a rota "login" não existe no routes.json).
   - Tem calendário próprio, independente do renderizarCalendario() de
     componentes.js.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery e
     ElmoUtilitarios.
     - NOMES_MES (array) — Abreviações dos meses para o título do calendário.
     - NOMES_MES_COMPLETO (array) — Nomes completos dos meses, usados nos
       rótulos de acessibilidade dos dias.
     - NOMES_DIA_SEMANA (array) — Nomes dos dias da semana, usados nos rótulos
       de acessibilidade.
     - moduloAgendamentoCli (objeto) — Módulo da página de agendamento do
       cliente.
       - moduloAgendamentoCli.configuracao — URLs do serviço, de verificação
         de login, de detalhes do serviço, de login e de cadastro.
       - moduloAgendamentoCli.estado — Serviço, mês exibido, dias
         indisponíveis e escolhas atuais de dia, local e horário.
       - moduloAgendamentoCli.elementos — Cache dos elementos jQuery da
         página.
       - moduloAgendamentoCli.iniciar() — Lê o id do serviço da URL, registra
         eventos e carrega os dados.
       - moduloAgendamentoCli.urlElementos() — Busca no DOM e guarda
         formulário, calendário, dropdowns e modais.
       - moduloAgendamentoCli.registrarEventos() — Liga botões, envio do
         formulário, navegação de mês, dropdowns, teclado, seleção de
         dia/horário e modais.
       - moduloAgendamentoCli.cancelarAgendamento() — Volta para a tela de
         detalhes do serviço.
       - moduloAgendamentoCli.buscarDadosAgendamento() — Pede os dados do
         serviço, preenche o preço e carrega os dias indisponíveis do mês.
       - moduloAgendamentoCli.mapearDadosServico() — Converte o registro do
         backend no preço formatado.
       - moduloAgendamentoCli.tratarFalhaCarregamento() — Coloca o formulário
         em estado de erro e abre o modal de erro.
       - moduloAgendamentoCli.navegarMes() — Avança ou volta meses, limpa dia
         e horário e recarrega os dias indisponíveis.
       - moduloAgendamentoCli.buscarDiasIndisponiveis() — Pede ao backend os
         dias de folga/indisponíveis do mês e redesenha o calendário.
       - moduloAgendamentoCli.extrairDiasIndisponiveis() — Junta folgas e
         indisponíveis da resposta em uma lista de datas AAAA-MM-DD.
       - moduloAgendamentoCli.renderizarCalendario() — Desenha a grade do mês
         com botões de dia (indisponível, selecionado, rótulos de
         acessibilidade).
       - moduloAgendamentoCli.formatarDataChave() — Monta a data no formato
         AAAA-MM-DD.
       - moduloAgendamentoCli.selecionarDia() — Marca o dia escolhido, zera o
         horário e busca os horários livres.
       - moduloAgendamentoCli.resetarHorario() — Limpa o horário escolhido e a
         lista, e desabilita o dropdown de horários.
       - moduloAgendamentoCli.buscarHorariosDisponiveis() — Pede ao backend os
         horários livres do dia e preenche o dropdown.
       - moduloAgendamentoCli.mapearHorarios() — Converte cada horário em
         valor 'inicio|termino' e texto 'inicio às termino'.
       - moduloAgendamentoCli.renderizarHorarios() — Cria os itens da lista de
         horários.
       - moduloAgendamentoCli.selecionarHorario() — Guarda o horário
         escolhido, atualiza o texto e fecha o dropdown.
       - moduloAgendamentoCli.alternarDropdown() — Abre o dropdown se estava
         fechado (fechando os outros) ou fecha se estava aberto.
       - moduloAgendamentoCli.abrirDropdown() — Abre a lista e foca a opção
         selecionada ou a primeira.
       - moduloAgendamentoCli.fecharDropdown() — Fecha a lista do dropdown e
         atualiza aria-expanded.
       - moduloAgendamentoCli.fecharTodosDropdowns() — Fecha os dropdowns de
         localização e de horário.
       - moduloAgendamentoCli.registrarNavegacaoTecladoLista() — Navegação por
         teclado numa lista de opções (setas, Home e End), padrão ARIA
         listbox.
       - moduloAgendamentoCli.marcarCampoComErro() — Marca um campo com a
         classe de erro.
       - moduloAgendamentoCli.removerErroCampo() — Remove a classe de erro de
         um campo.
       - moduloAgendamentoCli.exibirAlertaValidacao() — Mostra o alerta de
         validação (mensagem padrão: preencher todos os dados).
       - moduloAgendamentoCli.esconderAlertaValidacao() — Esconde o alerta de
         validação.
       - moduloAgendamentoCli.tentarConfirmarAgendamento() — Valida dia e
         horário; se faltar algo, marca os erros e foca o primeiro; senão
         confere o login e envia.
       - moduloAgendamentoCli.verificarLoginEEnviar() — Consulta se o cliente
         está logado: se sim envia o agendamento, senão abre o modal 'não
         logado'.
       - moduloAgendamentoCli.enviarAgendamento() — Envia dia, início e
         término ao backend e, se a resposta for 'sucesso', vai para a tela de
         detalhes.
       - moduloAgendamentoCli.irParaInfoServicoComSucesso() — Redireciona para
         os detalhes do serviço com agendado=1 (que mostra o modal de
         sucesso).
       - moduloAgendamentoCli.exibirModalErro() — Abre o modal de serviço não
         encontrado (sem fechar por fora).
       - moduloAgendamentoCli.exibirModalNaoLogado() — Abre o modal pedindo
         para o cliente entrar na conta.
     - Callback do document ready — Executa moduloAgendamentoCli.iniciar()
       quando o DOM estiver pronto.
   ============================================================ */

console.log("JS agendamentoCli carregado");

/** Função autoexecutável que isola o escopo e recebe jQuery e ElmoUtilitarios. */
(function ($, Utilitarios) {
  "use strict";

  /** Abreviações dos meses para o título do calendário. */
  var NOMES_MES = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
  ];

  /** Nomes completos dos meses, usados nos rótulos de acessibilidade dos dias. */
  var NOMES_MES_COMPLETO = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  /** Nomes dos dias da semana, usados nos rótulos de acessibilidade. */
  var NOMES_DIA_SEMANA = [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"
  ];

  /** Módulo da página de agendamento do cliente. */
  var moduloAgendamentoCli = {

    /* ---------- Configuração ---------- */
    /** URLs do serviço, de verificação de login, de detalhes do serviço, de login e de cadastro. */
    configuracao: {
      urlServico: "index.php?uri=servico",
      urlDetalhesServico: "index.php?uri=busca", // buscacontroller.php: acao "mostrardetalhes" (também grava $_SESSION['servico'])
      urlVerificarLogin: "index.php?uri=cliente",
      urlInfoServico: "index.php?uri=infoServico",
      urlLogin: "index.php?uri=loginCliente",
      /* Contratos com o backend. 'disponivel: false' = ação ainda não existe no
         servidor: o JS não chama e segue sem ela. */
      contratos: {
        // Dados: id (serviço). Resposta esperada: { sucesso, dados: [{ loc_id, loc_nome }] }
        listarLocalizacoes: { acao: "listarLocalizacoes", disponivel: false },
        // Dados: inicio, termino e, se houver, localizacao. Resposta: { sucesso, dados: [{ sala_id, sala_nome }] }
        mostrarSala: { acao: "mostrarSala", disponivel: true }
      }
    },

    /* ---------- Estado interno ---------- */
    /** Serviço, mês exibido, dias indisponíveis e escolhas atuais de dia, local e horário. */
    estado: {
      idServico: null,
      dataExibida: new Date(),
      diasIndisponiveis: [],
      diaSelecionado: null,
      localizacaoSelecionada: null,
      localizacoesDisponiveis: false,
      horarioSelecionado: null
    },

    /* ---------- Referências de elementos (cacheadas) ---------- */
    /** Cache dos elementos jQuery da página. */
    elementos: {},

    /** Lê o id do serviço da URL, registra eventos e carrega os dados. */
    iniciar: function () {
      this.urlElementos();
      this.estado.idServico = Utilitarios.obterParametroUrl("servico");
      this.elementos.$inputIdServico.val(this.estado.idServico || "");

      this.registrarEventos();
      this.buscarDadosAgendamento();
    },

    /** Busca no DOM e guarda formulário, calendário, dropdowns e modais. */
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

    /**
     * Liga botões, envio do formulário, navegação de mês, dropdowns, teclado, seleção de
     * dia/horário e modais.
     */
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

    /** Volta para a tela de detalhes do serviço. */
    cancelarAgendamento: function () {
      var url = this.configuracao.urlInfoServico;
      if (this.estado.idServico) {
        url += "&id=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    },

    /* CARREGAMENTO DE DADOS */

    /** Pede os dados do serviço, preenche o preço e carrega os dias indisponíveis do mês. */
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

    /** Converte o registro do backend no preço formatado. */
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

    /** Coloca o formulário em estado de erro e abre o modal de erro. */
    tratarFalhaCarregamento: function () {
      this.elementos.$form.removeClass("estadoCarregando").addClass("estadoErro");
      Utilitarios.alternarEsqueletoAcessivel(this.elementos.$camposDinamicos, true);
      this.exibirModalErro();
    },

    /* LOCALIZAÇÃO (clínica/local de atendimento escolhido pelo cliente) */

    /**
     * Carrega as localizações do serviço. Se o contrato ainda não existe no backend
     * ou não vier nenhuma opção, esconde o campo e o agendamento segue sem ele.
     */
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

    /** Cria os itens da lista de localizações (loc_id e loc_nome). */
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

    /** Guarda a localização escolhida, atualiza o texto e fecha o dropdown. */
    selecionarLocalizacao: function (id, nome) {
      this.estado.localizacaoSelecionada = id;
      this.elementos.$inputLocalizacao.val(id);
      this.elementos.$textoLocalizacao.text(nome);
      this.fecharDropdown(this.elementos.$dropdownLocalizacao);
      this.removerErroCampo(this.elementos.$botaoLocalizacao);
      this.elementos.$botaoLocalizacao.trigger("focus");
    },

    /* CALENDÁRIO */

    /** Avança ou volta meses, limpa dia e horário e recarrega os dias indisponíveis. */
    navegarMes: function (deltaMeses) {
      this.estado.dataExibida.setMonth(this.estado.dataExibida.getMonth() + deltaMeses);
      this.estado.diaSelecionado = null;
      this.elementos.$inputDia.val("");
      this.resetarHorario();
      this.buscarDiasIndisponiveis(this.estado.dataExibida);
    },

    /** Pede ao backend os dias de folga/indisponíveis do mês e redesenha o calendário. */
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


    /** Junta folgas e indisponíveis da resposta em uma lista de datas AAAA-MM-DD. */
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

    /**
     * Desenha a grade do mês com botões de dia (indisponível, selecionado, rótulos de
     * acessibilidade).
     */
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

    /** Monta a data no formato AAAA-MM-DD. */
    formatarDataChave: function (ano, mesIndiceZero, dia) {
      var mesFormatado = String(mesIndiceZero + 1).padStart(2, "0");
      var diaFormatado = String(dia).padStart(2, "0");
      return ano + "-" + mesFormatado + "-" + diaFormatado;
    },

    /** Marca o dia escolhido, zera o horário e busca os horários livres. */
    selecionarDia: function (dataChave) {
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

    /** Limpa o horário escolhido e a lista, e desabilita o dropdown de horários. */
    resetarHorario: function () {
      this.estado.horarioSelecionado = null;
      this.elementos.$inputHorario.val("");
      this.elementos.$textoHorario.text("Selecione horário");
      this.elementos.$listaHorarios.empty();
      this.elementos.$botaoHorario.prop("disabled", true);
      this.fecharDropdown(this.elementos.$dropdownHorario);
    },

    /** Pede ao backend os horários livres do dia e preenche o dropdown. */
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

    /** Converte cada horário em valor 'inicio|termino' e texto 'inicio às termino'. */
    mapearHorarios: function (horarios) {
      return horarios.map(function (horario) {
        return {
          valor: horario.inicio + "|" + horario.termino,
          texto: horario.inicio + " às " + horario.termino
        };
      });
    },

    /** Cria os itens da lista de horários. */
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

    /** Guarda o horário escolhido, atualiza o texto e fecha o dropdown. */
    selecionarHorario: function (valor, texto) {
      this.estado.horarioSelecionado = valor;
      this.elementos.$inputHorario.val(valor);
      this.elementos.$textoHorario.text(texto);
      this.fecharDropdown(this.elementos.$dropdownHorario);
      this.removerErroCampo(this.elementos.$botaoHorario);
      this.elementos.$botaoHorario.trigger("focus");
    },

    /* DROPDOWNS — abrir/fechar */

    /** Abre o dropdown se estava fechado (fechando os outros) ou fecha se estava aberto. */
    alternarDropdown: function ($dropdown, $inputOculto) {
      var $lista = $dropdown.find(".dropdownCustomizadoLista");
      var estaAberta = !$lista.attr("hidden");

      this.fecharTodosDropdowns();

      if (!estaAberta) {
        this.abrirDropdown($dropdown, $inputOculto);
      }
    },

    /** Abre a lista e foca a opção selecionada ou a primeira. */
    //Abre o dropdown e move o foco para a opção já selecionada (se houver) ou para a primeira opção da lista
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

    /** Fecha a lista do dropdown e atualiza aria-expanded. */
    fecharDropdown: function ($dropdown) {
      $dropdown.find(".dropdownCustomizadoLista").attr("hidden", "hidden");
      $dropdown.find(".dropdownCustomizadoBotao").attr("aria-expanded", "false");
    },

    /** Fecha os dropdowns de localização e de horário. */
    fecharTodosDropdowns: function () {
      this.fecharDropdown(this.elementos.$dropdownLocalizacao);
      this.fecharDropdown(this.elementos.$dropdownHorario);
    },

    /** Navegação por teclado numa lista de opções (setas, Home e End), padrão ARIA listbox. */
    /* Implementa a navegação por teclado do padrão ARIA "listbox"
     * dentro de uma lista de opções: setas para cima/baixo movem o
     * foco entre as opções (com wrap-around), Home/End vão para a
     * primeira/última. Enter/Espaço já funcionam nativamente, pois
     * as opções são elementos <button>.
     */
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

    /* VALIDAÇÃO E ENVIO DO AGENDAMENTO */

    /** Marca um campo com a classe de erro. */
    marcarCampoComErro: function ($elemento) {
      $elemento.addClass("campoComErro");
    },

    /** Remove a classe de erro de um campo. */
    removerErroCampo: function ($elemento) {
      $elemento.removeClass("campoComErro");
    },

    /** Mostra o alerta de validação (mensagem padrão: preencher todos os dados). */
    exibirAlertaValidacao: function (mensagem) {
      this.elementos.$alerta
        .text(mensagem || "Você precisa preencher todos os dados!")
        .removeAttr("hidden");
    },

    /** Esconde o alerta de validação. */
    esconderAlertaValidacao: function () {
      this.elementos.$alerta.attr("hidden", "hidden");
    },

    /**
     * Valida dia e horário; se faltar algo, marca os erros e foca o primeiro; senão confere o login
     * e envia.
     */
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

    /**
     * Consulta se o cliente está logado: se sim envia o agendamento, senão abre o modal 'não
     * logado'.
     */
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

    /** Separa o horário escolhido ('inicio|termino') em início e término. */
    obterPartesHorario: function () {
      return (this.estado.horarioSelecionado || "").split("|");
    },

    /**
     * Pede ao backend as salas livres no horário escolhido e usa a primeira. Sem sala livre,
     * avisa o cliente e não envia o agendamento.
     */
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

    /**
     * Envia dia, início, término e sala ao backend e, se a resposta for 'sucesso', vai para a
     * tela de detalhes.
     */
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

    /** Redireciona para os detalhes do serviço com agendado=1 (que mostra o modal de sucesso). */
    irParaInfoServicoComSucesso: function () {
      var url = this.configuracao.urlInfoServico + "&agendado=1";
      if (this.estado.idServico) {
        url += "&id=" + encodeURIComponent(this.estado.idServico);
      }
      window.location.href = url;
    },

    /* MODAIS */

    /** Abre o modal de serviço não encontrado (sem fechar por fora). */
    exibirModalErro: function () {
      Utilitarios.exibirModal(this.elementos.$modalErro, {
        backdrop: "static",
        keyboard: false
      });
    },

    /** Abre o modal pedindo para o cliente entrar na conta. */
    exibirModalNaoLogado: function () {
      Utilitarios.exibirModal(this.elementos.$modalNaoLogado);
    }
  };

  /** Executa moduloAgendamentoCli.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloAgendamentoCli.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);