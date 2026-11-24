(function ($, Utilitarios, window) {
  "use strict";

  const NOMES_MES_COMPLETO = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  const ROTULO_ESTADO_DIA = {
    pendente: "consulta pendente",
    confirmada: "consulta confirmada",
    indisponivel: "indisponível",
    folga: "dia de folga",
    encerrado: "já passou"
  };

  const ESTADO_POR_STATUS_BANCO = {
    esperando: "pendente",
    aceita: "confirmada"
  };

  const ESTADOS_EXIBIDOS = ["pendente", "confirmada"];

  const TEMPO_AVISO_PERMISSAO_MS = 8000;

  function criarModulo(configuracao) {

    const moduloConsultasPro = {

      configuracao: configuracao,

      estado: {
        mesExibido: null,
        anoExibido: null,
        diaSelecionado: null,
        consultas: [],
        diasIndisponiveis: [],
        diasFolga: [],
        tokenDias: 0,
        idConsultaEmAcao: null,
        carregou: false,
        avisoCamposAusentesExibido: false
      },

      elementos: {},

      modelosCard: {},

      textosEstadoVazioPadrao: {},


      iniciar: function () {
        const hoje = new Date();
        this.estado.mesExibido = hoje.getMonth();
        this.estado.anoExibido = hoje.getFullYear();

        this.cachearElementos();
        this.capturarModelosCard();
        this.registrarEventos();
        this.renderizarCalendario();
        this.anunciar("Carregando consultas.");
      },

      cachearElementos: function () {
        this.elementos.$calendario = $("#calendarioConsultas");
        this.elementos.$lista = $("#listaConsultasPro");
        this.elementos.$estadoVazio = $("#estadoVazioConsultasPro");
        this.elementos.$mensagemStatus = $("#mensagemStatusConsultasPro");
        this.elementos.$avisoPermissao = $("#avisoPermissaoConsultas");
        this.elementos.$tituloPainel = $("#tituloPainelConsultasPro");

        this.elementos.$modalSessaoExpirada = $("#modalSessaoExpirada");
        this.elementos.$modalDetalhes = $("#modalDetalhesConsulta");
        this.elementos.$modalCancelamento = $("#modalConfirmarCancelamento");

        this.textosEstadoVazioPadrao = {
          icone: this.elementos.$estadoVazio.find(".estadoVazio_icone").text(),
          texto: this.elementos.$estadoVazio.find(".estadoVazio_texto").text()
        };
      },

      capturarModelosCard: function () {
        const $cards = this.elementos.$lista.find(".cardConsultaProfissional");
        const modelos = this.modelosCard;

        $cards.each(function () {
          const $card = $(this);

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
        const self = this;

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
        const tipoEsperado = this.configuracao.tipoUsuario;
        const tipoIncorreto = informacoes && informacoes.logado && tipoEsperado &&
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
        const self = this;
        const contrato = this.configuracao.contratos.listarConsultas;

        if (!contrato.disponivel) {
          this.concluirCarregamento();
          return;
        }

        $.ajax({
          url: this.configuracao.urlControlador,
          method: "POST",
          dataType: "json",
          data: { acao: contrato.acao, somenteAceitas: 0 }
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
        const self = this;
        const contrato = this.configuracao.contratos.listarDiasIndisponiveis;

        // Evita mostrar, no mês novo, os dias do mês anterior enquanto a resposta não chega.
        const token = ++this.estado.tokenDias;
        this.estado.diasIndisponiveis = [];
        this.estado.diasFolga = [];

        if (!contrato.disponivel) {
          return;
        }

        $.ajax({
          url: this.configuracao.urlDias,
          method: "POST",
          dataType: "json",
          data: {
            acao: contrato.acao,
            mes: this.estado.mesExibido + 1,
            ano: this.estado.anoExibido
          }
        })
          .done(function (resposta) {
            // Resposta de um mês que já não é o exibido: descarta.
            if (token !== self.estado.tokenDias) {
              return;
            }
            // O backend devolve { disponivel: [], folga: [], indisponivel: [] } com datas "AAAA-MM-DD".
            if (!resposta || typeof resposta !== "object" || !$.isArray(resposta.indisponivel)) {
              return;
            }

            self.estado.diasIndisponiveis = self.extrairDiasDoMes(resposta.indisponivel);
            self.estado.diasFolga = self.extrairDiasDoMes(resposta.folga);
            self.renderizarCalendario();
          });
      },

      // Converte "AAAA-MM-DD" em número do dia, só para o mês e o ano exibidos.
      extrairDiasDoMes: function (datas) {
        const self = this;
        const dias = [];

        $.each($.isArray(datas) ? datas : [], function (indice, data) {
          const partes = String(data).substring(0, 10).split("-");
          const ano = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10) - 1;
          const dia = parseInt(partes[2], 10);

          if (ano === self.estado.anoExibido && mes === self.estado.mesExibido && !isNaN(dia)) {
            dias.push(dia);
          }
        });

        return dias;
      },

      mapearConsulta: function (registro) {
        const partesData = String(registro.agnd_dt || "").split("-");
        const preco = Number(registro.ser_val);

        const idCliente = registro.agnd_cli ? registro.agnd_cli : null;
        const idClinica = registro.agnd_clin ? registro.agnd_clin : null;
        const estadoConsulta = ESTADO_POR_STATUS_BANCO[registro.agnd_stat] || null;

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
          horaTermino: String(registro.agnd_hrTerm || "").slice(0, 5),
          dataBanco: registro.agnd_dt || "",
          nomeSala: registro.sala_nome || "",
          preco: (registro.ser_val === undefined || registro.ser_val === null || isNaN(preco)) ? null : preco,
          estadoConsulta: estadoConsulta,
          solicitadoPor: idCliente ? "cliente" : "profissionalClinica"
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
        const estadosPorDia = {};
        const self = this;

        $.each(this.estado.diasIndisponiveis, function (indice, dia) {
          estadosPorDia[String(dia)] = "indisponivel";
        });

        $.each(this.estado.diasFolga, function (indice, dia) {
          estadosPorDia[String(dia)] = "folga";
        });

        $.each(this.consultasDoMes(), function (indice, consulta) {
          const chave = String(consulta.dia);
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

        this.marcarDiasPassados();
        this.aplicarAcessibilidadeDias();
      },

      marcarDiasPassados: function () {
        const hoje = new Date();
        const mesHoje = hoje.getFullYear() * 12 + hoje.getMonth();
        const mesExibido = this.estado.anoExibido * 12 + this.estado.mesExibido;
        let ultimoDiaPassado;

        if (mesExibido > mesHoje) {
          return;
        }

        if (mesExibido < mesHoje) {
          ultimoDiaPassado = 31;
        } else {
          ultimoDiaPassado = hoje.getDate() - 1;
        }

        this.elementos.$calendario.find(".calendarioBase_dia").each(function () {
          const $dia = $(this);
          const numeroDia = parseInt($dia.attr("data-dia"), 10);

          if (isNaN(numeroDia) || numeroDia > ultimoDiaPassado || $dia.attr("data-estadoDia")) {
            return;
          }

          $dia
            .addClass("calendarioBase_dia--encerrado")
            .attr("data-estadoDia", "encerrado");
        });
      },

      aplicarAcessibilidadeDias: function () {
        const nomeMes = NOMES_MES_COMPLETO[this.estado.mesExibido];

        this.elementos.$calendario.find(".calendarioBase_dia").each(function () {
          const $dia = $(this);
          let rotulo = $dia.attr("data-dia") + " de " + nomeMes;
          const rotuloEstado = ROTULO_ESTADO_DIA[$dia.attr("data-estadoDia")];

          if (rotuloEstado) {
            rotulo += ", " + rotuloEstado;
          }

          $dia
            .attr("aria-label", rotulo)
            .attr("aria-pressed", $dia.hasClass("calendarioBase_dia--selecionado") ? "true" : "false");
        });
      },

      aoAlterarMes: function (dados) {
        const novaData = new Date(dados.anoAtual, dados.mesAtual + dados.direcao, 1);

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
        const self = this;

        return $.grep(this.estado.consultas, function (consulta) {
          return consulta.mes === self.estado.mesExibido &&
                 consulta.ano === self.estado.anoExibido &&
                 $.inArray(consulta.estadoConsulta, ESTADOS_EXIBIDOS) !== -1;
        });
      },

      consultasVisiveis: function () {
        const self = this;

        const visiveis = $.grep(this.consultasDoMes(), function (consulta) {
          return self.estado.diaSelecionado === null || consulta.dia === self.estado.diaSelecionado;
        });

        return visiveis.sort(function (a, b) {
          if (a.dia !== b.dia) {
            return a.dia - b.dia;
          }
          return a.horaInicio < b.horaInicio ? -1 : 1;
        });
      },

      atualizarLista: function () {
        const consultas = this.consultasVisiveis();
        const self = this;

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
        const $card = this.escolherModeloCard(consulta).clone();
        const dataHora = this.formatarDataHora(consulta);

        $card.attr("data-idConsulta", consulta.idConsulta);
        $card.attr("data-estadoConsulta", consulta.estadoConsulta);

        Utilitarios.preencherCampos($card.find("[data-campo]"), {
          nomeServico: consulta.nomeServico,
          dataHoraConsulta: dataHora
        });

        $card.find("button[data-acao]").each(function () {
          const $botao = $(this);
          $botao.attr("aria-label", $.trim($botao.text()) + ": " + consulta.nomeServico + ", " + dataHora);
        });

        return $card;
      },


      buscarConsultaPorId: function (idConsulta) {
        let encontrada = null;

        $.each(this.estado.consultas, function (indice, consulta) {
          if (String(consulta.idConsulta) === String(idConsulta)) {
            encontrada = consulta;
            return false;
          }
        });

        return encontrada;
      },

      prepararModal: function (evento, $modal) {
        const idConsulta = $(evento.relatedTarget).closest("[data-idConsulta]").attr("data-idConsulta");
        const consulta = this.buscarConsultaPorId(idConsulta);

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

       executarAcao: function (nomeContrato, consulta) {
        const contrato = this.configuracao.contratos[nomeContrato];

        if (!contrato || !contrato.disponivel) {
          this.anunciar("Essa ação ainda não está disponível.");
          return $.Deferred().reject({ indisponivel: true }).promise();
        }

        if (!consulta) {
          return $.Deferred().reject({ mensagem: "Consulta não encontrada." }).promise();
        }

        let dados;
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
          if (Utilitarios.ehPermissaoNegada(resposta)) {
            return $.Deferred().reject({ permissaoNegada: true, nomeAcao: nomeContrato }).promise();
          }
          return $.Deferred().reject({ mensagem: resposta && resposta.mensagem }).promise();
        });
      },

      tratarFalhaAcao: function (falha, mensagem) {
        if (falha && falha.indisponivel) {
          return;
        }
        // A ação pode ter alterado o banco mesmo assim: recarrega a lista para a tela refletir o estado real.
        this.buscarConsultas();
        if (falha && falha.permissaoNegada) {
          this.exibirAvisoPermissao(Utilitarios.mensagemPermissaoNegada(falha.nomeAcao));
          return;
        }
        if (falha && falha.mensagem) {
          mensagem = mensagem + " " + falha.mensagem;
        }
        this.anunciar(mensagem);
      },

      exibirAvisoPermissao: function (mensagem) {
        const $aviso = this.elementos.$avisoPermissao;

        if (!$aviso || !$aviso.length) {
          this.anunciar(mensagem);
          return;
        }

        $aviso.find("[data-campo='mensagemAviso']").text(mensagem);
        bootstrap.Toast.getOrCreateInstance($aviso.get(0), { delay: TEMPO_AVISO_PERMISSAO_MS }).show();
      },

      aceitarConsulta: function (idConsulta) {
        const self = this;

        this.executarAcao("aceitarConsulta", this.buscarConsultaPorId(idConsulta))
          .done(function () {
            const consulta = self.buscarConsultaPorId(idConsulta);
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
        const self = this;

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
        const self = this;

        this.executarAcao("cancelarConsulta", this.buscarConsultaPorId(idConsulta))
          .done(function () {
            self.removerConsulta(idConsulta);
            self.restaurarFoco(self.elementos.$modalCancelamento);
            Utilitarios.esconderModal(self.elementos.$modalCancelamento);
            self.atualizarTela();
            self.anunciar("Consulta cancelada.");
          })
          .fail(function (falha) {
            if (falha && falha.permissaoNegada) {
              self.restaurarFoco(self.elementos.$modalCancelamento);
              Utilitarios.esconderModal(self.elementos.$modalCancelamento);
            }
            self.tratarFalhaAcao(falha, "Não foi possível cancelar a consulta.");
          });
      },

      reagendarConsulta: function (idConsulta) {
        const consulta = this.buscarConsultaPorId(idConsulta);

        // A tela de reagendamento não tem ação de leitura no backend: ela recebe a consulta daqui.
        if (consulta) {
          try {
            window.sessionStorage.setItem("reagendamentoConsulta", JSON.stringify({
              agnd_id: consulta.idConsulta,
              agnd_pro: consulta.idProfissional,
              agnd_cli: consulta.idCliente,
              agnd_clin: consulta.idClinica,
              agnd_ser: consulta.idServico,
              agnd_dt: consulta.dataBanco,
              agnd_hrIni: consulta.horaInicio,
              agnd_hrTerm: consulta.horaTermino,
              sala_nome: consulta.nomeSala,
              pro_nome: consulta.nomeProfissional,
              ser_nome: consulta.nomeServico
            }));
          } catch (erro) {
            // Sem sessionStorage a tela de reagendamento mostra o aviso de consulta não encontrada.
          }
        }

        window.location.href = this.configuracao.urlAgendamento + "&consulta=" + encodeURIComponent(idConsulta);
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
        const self = this;

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
        const $mensagemStatus = this.elementos.$mensagemStatus;

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