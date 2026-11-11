(function ($, Utilitarios, window) {
  "use strict";

  var NOMES_MES_COMPLETO = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  var ROTULO_ESTADO_DIA = {
    pendente: "consulta pendente",
    confirmada: "consulta confirmada",
    indisponivel: "indisponível",
    folga: "dia de folga"
  };

  var ESTADO_POR_STATUS_BANCO = {
    esperando: "pendente",
    aceita: "confirmada"
  };

  var ESTADOS_EXIBIDOS = ["pendente", "confirmada"];

  function criarModulo(configuracao) {

    var moduloConsultasPro = {

      configuracao: configuracao,

      estado: {
        mesExibido: null,
        anoExibido: null,
        diaSelecionado: null,
        consultas: [],
        filtroEstadoConsulta: "todas",
        diasIndisponiveis: [],
        idConsultaEmAcao: null,
        carregou: false,
        avisoCamposAusentesExibido: false
      },

      elementos: {},

      modelosCard: {},

      textosEstadoVazioPadrao: {},


      iniciar: function () {
        var hoje = new Date();
        this.estado.mesExibido = hoje.getMonth();
        this.estado.anoExibido = hoje.getFullYear();

        this.cachearElementos();
        this.capturarModelosCard();
        this.registrarEventos();
        this.renderizarCalendario();
        this.anunciar("Carregando consultas.");
        this.exibirModalConsultaAdicionadaSeNecessario();
      },

      cachearElementos: function () {
        this.elementos.$calendario = $("#calendarioConsultas");
        this.elementos.$lista = $("#listaConsultasPro");
        this.elementos.$estadoVazio = $("#estadoVazioConsultasPro");
        this.elementos.$mensagemStatus = $("#mensagemStatusConsultasPro");
        this.elementos.$tituloPainel = $("#tituloPainelConsultasPro");

        this.elementos.$painelFiltro = $("#painelFiltroConsultas");
        this.elementos.$botaoFiltro = $("#botaoFiltrarConsultas");

        this.elementos.$modalSessaoExpirada = $("#modalSessaoExpirada");
        this.elementos.$modalDetalhes = $("#modalDetalhesConsulta");
        this.elementos.$modalCancelamento = $("#modalConfirmarCancelamento");
        this.elementos.$modalConsultaAdicionada = $("#modalConsultaAdicionada");

        this.textosEstadoVazioPadrao = {
          icone: this.elementos.$estadoVazio.find(".estadoVazio_icone").text(),
          texto: this.elementos.$estadoVazio.find(".estadoVazio_texto").text()
        };
      },

      capturarModelosCard: function () {
        var $cards = this.elementos.$lista.find(".cardConsultaProfissional");
        var modelos = this.modelosCard;

        $cards.each(function () {
          var $card = $(this);

          if ($card.find("[data-acao='aceitarConsulta']").length) {
            modelos.pendenteCliente = $card.clone();
          } else if ($card.find("[data-acao='reagendarConsulta']").length) {
            modelos.confirmada = $card.clone();
          } else if ($card.find(".indicadorStatus").length) {
            modelos.pendenteAguardando = $card.clone();
          }
        });

        if (!modelos.pendenteCliente || !modelos.confirmada || !modelos.pendenteAguardando) {
          console.warn("consultasPro: algum modelo de card não foi encontrado no HTML.");
        }

        this.elementos.$lista.empty();
      },

      registrarEventos: function () {
        var self = this;

        $(document).on("sessaoNavegacaoDefinida", function (evento, informacoes) {
          self.tratarSessao(informacoes);
        });

        $("#botaoRealizarLoginSessao").on("click", function () {
          window.location.href =
            self.configuracao.urlLogin + "&redirecionar=" + encodeURIComponent(window.location.href);
        });

        this.elementos.$calendario.on("mesAlterado", function (evento, dados) {
          self.aoAlterarMes(dados);
        });

        this.elementos.$calendario.on("diaSelecionado", function (evento, dados) {
          self.aoSelecionarDia(dados);
        });

        this.elementos.$painelFiltro.on("click", ".painelFiltro_botaoAplicar", function () {
          self.aplicarFiltro();
        });

        $(document).on("consultaAceita", function (evento) {
          self.aceitarConsulta($(evento.target).attr("data-idConsulta"));
        });

        $(document).on("consultaReagendada", function (evento) {
          self.reagendarConsulta($(evento.target).attr("data-idConsulta"));
        });

        this.elementos.$modalDetalhes.on("click", "[data-acao='recusarConsulta']", function () {
          self.recusarConsulta(self.estado.idConsultaEmAcao);
        });

        $("#botaoConfirmarCancelamento").on("click", function () {
          self.cancelarConsulta(self.estado.idConsultaEmAcao);
        });

        this.elementos.$modalDetalhes.on("show.bs.modal", function (evento) {
          self.prepararModal(evento, $(this));
        });

        this.elementos.$modalCancelamento.on("show.bs.modal", function (evento) {
          self.prepararModal(evento, $(this));
        });
      },



      tratarSessao: function (informacoes) {
        var tipoEsperado = this.configuracao.tipoUsuario;
        var tipoIncorreto = informacoes && informacoes.logado && tipoEsperado &&
                            informacoes.tipoUsuario !== tipoEsperado;

        if (!informacoes || !informacoes.logado || tipoIncorreto) {
          Utilitarios.exibirModal(this.elementos.$modalSessaoExpirada, {
            backdrop: "static",
            keyboard: false
          });
          return;
        }

        this.buscarConsultas();
      },

      buscarConsultas: function () {
        var self = this;
        var contrato = this.configuracao.contratos.listarConsultas;

        if (!contrato.disponivel) {
          this.concluirCarregamento();
          return;
        }

        $.ajax({
          url: this.configuracao.urlControlador,
          method: "POST",
          dataType: "json",
          data: { acao: contrato.acao }
        })
          .done(function (resposta) {
            if (!resposta || !resposta.sucesso || !$.isArray(resposta.dados)) {
              self.tratarFalhaCarregamento();
              return;
            }

            self.estado.consultas = $.map(resposta.dados, function (registro) {
              return self.mapearConsulta(registro);
            });
            self.concluirCarregamento();
          })
          .fail(function () {
            self.tratarFalhaCarregamento();
          });
      },

      buscarDiasIndisponiveis: function () {
        var self = this;
        var contrato = this.configuracao.contratos.listarDiasIndisponiveis;

        if (!contrato.disponivel) {
          this.estado.diasIndisponiveis = [];
          return;
        }

        $.ajax({
          url: this.configuracao.urlControlador,
          method: "POST",
          dataType: "json",
          data: {
            acao: contrato.acao,
            mes: this.estado.mesExibido + 1,
            ano: this.estado.anoExibido
          }
        })
          .done(function (resposta) {
            if (resposta && resposta.sucesso && $.isArray(resposta.dias)) {
              self.estado.diasIndisponiveis = resposta.dias;
              self.renderizarCalendario();
            }
          });
      },

      mapearConsulta: function (registro) {
        var partesData = String(registro.agnd_dt || "").split("-");
        var preco = Number(registro.ser_val);

        var idCliente = registro.agnd_cli ? registro.agnd_cli : null;
        var idClinica = registro.agnd_clin ? registro.agnd_clin : null;
        var estadoConsulta = registro.agnd_estado || ESTADO_POR_STATUS_BANCO[registro.agnd_stat] || null;

        if (!this.estado.avisoCamposAusentesExibido && !estadoConsulta) {
          this.estado.avisoCamposAusentesExibido = true;
          console.warn("consultasPro: agnd_stat \"" + registro.agnd_stat + "\" não reconhecido; a consulta não será exibida.");
        }

        return {
          idConsulta: registro.agnd_id,
          idProfissional: registro.agnd_pro,
          idCliente: idCliente,
          idClinica: idClinica,
          idServico: registro.agnd_ser,
          nomeServico: registro.ser_nome || "",
          nomeCliente: registro.cli_nome || "",
          nomeClinica: registro.clin_nome || "",
          nomeProfissional: registro.pro_nome || "",
          ano: parseInt(partesData[0], 10),
          mes: parseInt(partesData[1], 10) - 1,
          dia: parseInt(partesData[2], 10),
          horaInicio: String(registro.agnd_hrIni || "").slice(0, 5),
          preco: (registro.ser_val === undefined || registro.ser_val === null || isNaN(preco)) ? null : preco,
          estadoConsulta: estadoConsulta,
          solicitadoPor: registro.agnd_solicitadoPor || (idCliente ? "cliente" : "profissionalClinica")
        };
      },

      concluirCarregamento: function () {
        this.estado.carregou = true;
        this.elementos.$lista.removeClass("estadoCarregando").removeAttr("inert aria-busy");
        this.buscarDiasIndisponiveis();
        this.atualizarTela();
      },

      tratarFalhaCarregamento: function () {
        this.estado.carregou = true;
        this.estado.consultas = [];
        this.elementos.$lista.removeClass("estadoCarregando").removeAttr("inert aria-busy").prop("hidden", true);

        this.elementos.$estadoVazio
          .find(".estadoVazio_icone").text("error").end()
          .find(".estadoVazio_texto").text("Não foi possível carregar as consultas. Tente novamente mais tarde.").end()
          .prop("hidden", false);

        this.anunciar("Não foi possível carregar as consultas.");
      },



      renderizarCalendario: function () {
        var estadosPorDia = {};
        var self = this;

        $.each(this.estado.diasIndisponiveis, function (indice, dia) {
          estadosPorDia[String(dia)] = "indisponivel";
        });

        $.each(this.consultasDoMes(), function (indice, consulta) {
          var chave = String(consulta.dia);
          if (consulta.estadoConsulta === "pendente") {
            estadosPorDia[chave] = "pendente";
          } else if (estadosPorDia[chave] !== "pendente") {
            estadosPorDia[chave] = "confirmada";
          }
        });

        window.renderizarCalendario(
          this.elementos.$calendario,
          this.estado.anoExibido,
          this.estado.mesExibido,
          estadosPorDia
        );

        if (this.estado.diaSelecionado !== null) {
          this.elementos.$calendario
            .find(".calendarioBase_dia[data-dia='" + this.estado.diaSelecionado + "']")
            .addClass("calendarioBase_dia--selecionado");
        }

        this.aplicarAcessibilidadeDias();
      },

      aplicarAcessibilidadeDias: function () {
        var nomeMes = NOMES_MES_COMPLETO[this.estado.mesExibido];

        this.elementos.$calendario.find(".calendarioBase_dia").each(function () {
          var $dia = $(this);
          var rotulo = $dia.attr("data-dia") + " de " + nomeMes;
          var rotuloEstado = ROTULO_ESTADO_DIA[$dia.attr("data-estadoDia")];

          if (rotuloEstado) {
            rotulo += ", " + rotuloEstado;
          }

          $dia
            .attr("aria-label", rotulo)
            .attr("aria-pressed", $dia.hasClass("calendarioBase_dia--selecionado") ? "true" : "false");
        });
      },

      aoAlterarMes: function (dados) {
        var novaData = new Date(dados.anoAtual, dados.mesAtual + dados.direcao, 1);

        this.estado.mesExibido = novaData.getMonth();
        this.estado.anoExibido = novaData.getFullYear();
        this.estado.diaSelecionado = null;

        this.buscarDiasIndisponiveis();
        this.atualizarTela();
      },

      aoSelecionarDia: function (dados) {
        if (this.estado.diaSelecionado === dados.dia) {
          this.elementos.$calendario
            .find(".calendarioBase_dia--selecionado")
            .removeClass("calendarioBase_dia--selecionado");
          this.estado.diaSelecionado = null;
        } else {
          this.estado.diaSelecionado = dados.dia;
        }

        this.aplicarAcessibilidadeDias();
        this.atualizarLista();
      },



      atualizarTela: function () {
        this.renderizarCalendario();
        this.atualizarLista();
      },

      consultasDoMes: function () {
        var self = this;

        return $.grep(this.estado.consultas, function (consulta) {
          return consulta.mes === self.estado.mesExibido &&
                 consulta.ano === self.estado.anoExibido &&
                 $.inArray(consulta.estadoConsulta, ESTADOS_EXIBIDOS) !== -1;
        });
      },

      consultasVisiveis: function () {
        var self = this;

        var visiveis = $.grep(this.consultasDoMes(), function (consulta) {
          var passaDia = self.estado.diaSelecionado === null || consulta.dia === self.estado.diaSelecionado;
          var passaEstado = self.estado.filtroEstadoConsulta === "todas" ||
                            consulta.estadoConsulta === self.estado.filtroEstadoConsulta;
          return passaDia && passaEstado;
        });

        return visiveis.sort(function (a, b) {
          if (a.dia !== b.dia) {
            return a.dia - b.dia;
          }
          return a.horaInicio < b.horaInicio ? -1 : 1;
        });
      },

      atualizarLista: function () {
        var consultas = this.consultasVisiveis();
        var self = this;

        this.elementos.$lista.empty();

        if (!consultas.length) {
          this.elementos.$estadoVazio
            .find(".estadoVazio_icone").text(this.textosEstadoVazioPadrao.icone).end()
            .find(".estadoVazio_texto").text(this.textosEstadoVazioPadrao.texto).end()
            .prop("hidden", false);
          this.elementos.$lista.prop("hidden", true);
          this.anunciar("Nenhuma consulta agendada.");
          return;
        }

        $.each(consultas, function (indice, consulta) {
          self.elementos.$lista.append(self.criarCard(consulta));
        });

        this.elementos.$estadoVazio.prop("hidden", true);
        this.elementos.$lista.prop("hidden", false);
        this.anunciar(consultas.length === 1 ? "1 consulta encontrada." : consultas.length + " consultas encontradas.");
      },

      escolherModeloCard: function (consulta) {
        if (consulta.estadoConsulta === "confirmada") {
          return this.modelosCard.confirmada;
        }
        if (consulta.solicitadoPor === "cliente") {
          return this.modelosCard.pendenteCliente;
        }
        return this.modelosCard.pendenteAguardando;
      },

      criarCard: function (consulta) {
        var $card = this.escolherModeloCard(consulta).clone();
        var dataHora = this.formatarDataHora(consulta);

        $card.attr("data-idConsulta", consulta.idConsulta);
        $card.attr("data-estadoConsulta", consulta.estadoConsulta);

        Utilitarios.preencherCampos($card.find("[data-campo]"), {
          nomeServico: consulta.nomeServico,
          dataHoraConsulta: dataHora
        });

        $card.find("button[data-acao]").each(function () {
          var $botao = $(this);
          $botao.attr("aria-label", $.trim($botao.text()) + ": " + consulta.nomeServico + ", " + dataHora);
        });

        return $card;
      },


      aplicarFiltro: function () {
        var filtros = {};

        this.elementos.$painelFiltro.find(".grupoFiltro").each(function () {
          var $grupo = $(this);
          filtros[$grupo.attr("data-grupoFiltro")] = $grupo.find("input[type='radio']:checked").val() || null;
        });

        this.estado.filtroEstadoConsulta = filtros.estadoConsulta || "todas";

        var instancia = bootstrap.Dropdown.getInstance(this.elementos.$botaoFiltro.get(0));
        if (instancia) {
          instancia.hide();
        }

        this.atualizarLista();
      },



      buscarConsultaPorId: function (idConsulta) {
        var encontrada = null;

        $.each(this.estado.consultas, function (indice, consulta) {
          if (String(consulta.idConsulta) === String(idConsulta)) {
            encontrada = consulta;
            return false;
          }
        });

        return encontrada;
      },

      prepararModal: function (evento, $modal) {
        var idConsulta = $(evento.relatedTarget).closest("[data-idConsulta]").attr("data-idConsulta");
        var consulta = this.buscarConsultaPorId(idConsulta);

        if (!consulta) {
          return;
        }

        this.estado.idConsultaEmAcao = consulta.idConsulta;

        Utilitarios.preencherCampos($modal.find("[data-campo]"), {
          nomeServico: consulta.nomeServico,
          dataHoraConsulta: this.formatarDataHora(consulta),
          precoConsulta: this.formatarPreco(consulta.preco),
          nomeCliente: consulta.nomeCliente,
          nomeClinica: consulta.nomeClinica,
          nomeProfissional: consulta.nomeProfissional
        });

        $modal.find(".modalBase_conteudo").attr("data-idConsulta", consulta.idConsulta);
      },

      exibirModalConsultaAdicionadaSeNecessario: function () {
        if (Utilitarios.obterParametroUrl("consultaAdicionada") !== "1") {
          return;
        }

        Utilitarios.exibirModal(this.elementos.$modalConsultaAdicionada);

        var parametros = new URLSearchParams(window.location.search);
        parametros.delete("consultaAdicionada");
        window.history.replaceState(null, "", window.location.pathname + "?" + parametros.toString());
      },

       executarAcao: function (nomeContrato, consulta) {
        var contrato = this.configuracao.contratos[nomeContrato];

        if (!contrato || !contrato.disponivel) {
          console.info("consultasPro: o contrato \"" + nomeContrato + "\" ainda não está disponível no backend.");
          this.anunciar("Essa ação ainda não está disponível.");
          return $.Deferred().reject({ indisponivel: true }).promise();
        }

        if (!consulta) {
          return $.Deferred().reject({ mensagem: "Consulta não encontrada." }).promise();
        }

        var dados;
        if (contrato.montarDados) {
          dados = contrato.montarDados(consulta);
        } else {
          dados = { idConsulta: consulta.idConsulta };
        }

        return $.ajax({
          url: contrato.url || this.configuracao.urlControlador,
          method: "POST",
          dataType: "json",
          data: $.extend({ acao: contrato.acao }, dados)
        }).then(function (resposta) {
          if (resposta && resposta.sucesso) {
            return resposta;
          }
          return $.Deferred().reject({ mensagem: resposta && resposta.mensagem }).promise();
        });
      },

      tratarFalhaAcao: function (falha, mensagem) {
        if (falha && falha.indisponivel) {
          return;
        }
        if (falha && falha.mensagem) {
          mensagem = mensagem + " " + falha.mensagem;
        }
        this.anunciar(mensagem);
      },

      aceitarConsulta: function (idConsulta) {
        var self = this;

        this.executarAcao("aceitarConsulta", this.buscarConsultaPorId(idConsulta))
          .done(function () {
            var consulta = self.buscarConsultaPorId(idConsulta);
            if (consulta) {
              consulta.estadoConsulta = "confirmada";
            }
            self.restaurarFoco(self.elementos.$modalDetalhes);
            Utilitarios.esconderModal(self.elementos.$modalDetalhes);
            self.atualizarTela();
            self.anunciar("Consulta aceita.");
          })
          .fail(function (falha) {
            self.tratarFalhaAcao(falha, "Não foi possível aceitar a consulta.");
          });
      },

      recusarConsulta: function (idConsulta) {
        var self = this;

        this.executarAcao("recusarConsulta", this.buscarConsultaPorId(idConsulta))
          .done(function () {
            self.removerConsulta(idConsulta);
            self.restaurarFoco(self.elementos.$modalDetalhes);
            Utilitarios.esconderModal(self.elementos.$modalDetalhes);
            self.atualizarTela();
            self.anunciar("Consulta recusada.");
          })
          .fail(function (falha) {
            self.tratarFalhaAcao(falha, "Não foi possível recusar a consulta.");
          });
      },

      cancelarConsulta: function (idConsulta) {
        var self = this;

        this.executarAcao("cancelarConsulta", this.buscarConsultaPorId(idConsulta))
          .done(function () {
            self.removerConsulta(idConsulta);
            self.restaurarFoco(self.elementos.$modalCancelamento);
            Utilitarios.esconderModal(self.elementos.$modalCancelamento);
            self.atualizarTela();
            self.anunciar("Consulta cancelada.");
          })
          .fail(function (falha) {
            self.tratarFalhaAcao(falha, "Não foi possível cancelar a consulta.");
          });
      },

      reagendarConsulta: function (idConsulta) {
        window.location.href = this.configuracao.urlAgendamento + "&reagendar=" + encodeURIComponent(idConsulta);
      },

      removerConsulta: function (idConsulta) {
        this.estado.consultas = $.grep(this.estado.consultas, function (consulta) {
          return String(consulta.idConsulta) !== String(idConsulta);
        });
      },

     

      formatarDataHora: function (consulta) {
        return consulta.dia + " de " + NOMES_MES_COMPLETO[consulta.mes] + ", " + consulta.horaInicio;
      },

      formatarPreco: function (preco) {
        if (preco === null) {
          return "—";
        }
        return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\s/g, "");
      },

      restaurarFoco: function ($modal) {
        var self = this;

        function focarPainel() {
          self.elementos.$tituloPainel.trigger("focus");
        }

        if ($modal && $modal.hasClass("show")) {
          $modal.one("hidden.bs.modal", focarPainel);
        } else {
          focarPainel();
        }
      },

      anunciar: function (mensagem) {
        var $mensagemStatus = this.elementos.$mensagemStatus;

        $mensagemStatus.text("");
        window.setTimeout(function () {
          $mensagemStatus.text(mensagem);
        }, 50);
      }
    };

    return moduloConsultasPro;
  }

  window.ConsultasPro = { criar: criarModulo };

})(jQuery, window.ElmoUtilitarios, window);
