(function ($, Utilitarios) {
  "use strict";

  window.ElmoPerfilModulos = window.ElmoPerfilModulos || [];

  const raioFatia = 25;
  const circunferencia = 2 * Math.PI * raioFatia;
  const raioRotulo = 30;
  const fracaoMinimaRotulo = 0.05;
  const nomesFatias = ["realizadas", "canceladas", "pendentes"];
  const nomesLinhas = ["realizadas", "canceladas", "pendentes", "naoCompareceu"];
  const rotulosFatias = { realizadas: "Realizadas", canceladas: "Canceladas", pendentes: "Pendentes" };

  const compensarMensalDoBackend = true;

  const moduloRelatorio = {

    contratos: {
    carregarRelatorio: {
        url: "index.php?uri=relatorio",
        acao: "quantidade",
        disponivel: true
    },
    carregarGanhos: {
        url: "index.php?uri=relatorio",
        acao: "ganho",
        disponivel: true
    },
    carregarHistorico: {
        url: "index.php?uri=relatorio",
        acao: "historico",
        disponivel: true
    }
    },

    estado: {
      carregado: false,
      pedidoResumo: 0,
      pedidoHistorico: 0
    },

    elementos: {},

    nucleo: null,

    iniciar: function (nucleo) {
      this.nucleo = nucleo;

      if (nucleo.ehVisitante()) {
        return;
      }
      this.cachearElementos();
      this.registrarEventos();
    },

    cachearElementos: function () {
      const e = this.elementos;

      e.$campoPeriodoRelatorio = $("#campoPeriodoRelatorio");
      e.$campoPeriodoHistorico = $("#campoPeriodoHistorico");

      e.$carregandoRelatorio = $('[data-carregando="relatorio"]');
      e.$erroRelatorio = $('[data-estadoErro="relatorio"]');
      e.$conteudoRelatorio = $('[data-conteudo="relatorio"]');
      e.$grafico = $('[data-grafico="compromissos"]');
      e.$graficoVazio = $('[data-estadoGrafico="vazio"]');

      e.$carregandoHistorico = $('[data-carregando="historico"]');
      e.$erroHistorico = $('[data-estadoErro="historico"]');
      e.$vazioHistorico = $('[data-estadoVazio="historico"]');
      e.$tabelaHistorico = $('[data-tabela="historico"]');
      e.$listaHistorico = $('[data-lista="historico"]');
    },

    periodoDo: function ($campo) {
      return $campo.attr("data-valorSelecionado") || "diario";
    },

    dataDeHoje: function () {
      const hoje = new Date();
      let mes = String(hoje.getMonth() + 1);
      let dia = String(hoje.getDate());

      if (mes.length < 2) {
        mes = "0" + mes;
      }
      if (dia.length < 2) {
        dia = "0" + dia;
      }
      return hoje.getFullYear() + "-" + mes + "-" + dia;
    },

    capitalizar: function (texto) {
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    },

    formatarPercentual: function (fracao) {
      return (fracao * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
    },

    formatarData: function (valor) {
      const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor || ""));

      if (partes) {
        return partes[3] + "/" + partes[2] + "/" + partes[1];
      }
      return String(valor || "");
    },

    lerItem: function (dados, nome) {
      let item = {};

      if (dados && dados[nome]) {
        item = dados[nome];
      }
      return {
        quantidade: Number(item.quantidade) || 0,
        valor: Number(item.valor) || 0
      };
    },

    calcularFatias: function (itens, totalQuantidade) {
      let acumulado = 0;
      const fatias = [];

      $.each(nomesFatias, function (_, nome) {
        let fracao = 0;

        if (totalQuantidade > 0) {
          fracao = itens[nome].quantidade / totalQuantidade;
        }
        fatias.push({ nome: nome, fracao: fracao, inicio: acumulado });
        acumulado += fracao;
      });

      return fatias;
    },

    dataParaPeriodo: function (periodo) {
        const hoje = new Date();

        if (periodo === "mensal") {
            const mes = String(hoje.getMonth() + 1).padStart(2, "0");

            if (compensarMensalDoBackend) {
                return "-" + mes;
            }
            return mes;
        }

        if (periodo === "anual") {
            return String(hoje.getFullYear());
        }

        return this.dataDeHoje();
    },

     chamarJson: function (nome, dados) {
        return this.nucleo.chamarContrato(nome, dados, "text").then(function (texto) {
            texto = String(texto || "");
            let inicio = texto.indexOf('{"sucesso"');

            if (inicio === -1) {
                inicio = texto.indexOf("{");
            }
            if (inicio === -1) {
                return $.Deferred().reject().promise();
            }

            try {
                return JSON.parse(texto.slice(inicio));
            } catch (erro) {
                return $.Deferred().reject().promise();
            }
        });
    },

    carregarResumo: function () {
        const self = this;
        const nucleo = this.nucleo;
        const e = this.elementos;
        const numeroPedido = ++this.estado.pedidoResumo;

        e.$carregandoRelatorio.prop("hidden", false);
        e.$erroRelatorio.prop("hidden", true);
        e.$conteudoRelatorio.prop("hidden", true);

        if (
            !nucleo.contratoDisponivel("carregarRelatorio") ||
            !nucleo.contratoDisponivel("carregarGanhos")
        ) {
            this.renderizarResumo(null);
            return;
        }

        const periodo = this.periodoDo(e.$campoPeriodoRelatorio);
        const data = this.dataParaPeriodo(periodo);

        $.when(
            self.chamarJson("carregarRelatorio", {
                periodo: periodo,
                data: data
            }),

            self.chamarJson("carregarGanhos", {
                periodo: periodo,
                data: data
            })

        ).done(function (quantidade, ganhos) {

            if (numeroPedido !== self.estado.pedidoResumo) {
                return;
            }

            if (
                !quantidade ||
                !quantidade.sucesso ||
                !ganhos ||
                !ganhos.sucesso
            ) {
                self.mostrarErroResumo();
                return;
            }

            const dados = {
                realizadas: {
                    quantidade: quantidade.dados1,
                    valor: ganhos.dados
                },

                canceladas: {
                    quantidade: quantidade.dados2,
                    valor: 0
                },

                pendentes: {
                    quantidade: 0,
                    valor: 0
                },

                naoCompareceu: {
                    quantidade: quantidade.dados3,
                    valor: 0
                }
            };

            self.renderizarResumo(dados);

        }).fail(function () {

            if (numeroPedido === self.estado.pedidoResumo) {
                self.mostrarErroResumo();
            }

        });
    },

    mostrarErroResumo: function () {
      this.elementos.$carregandoRelatorio.prop("hidden", true);
      this.elementos.$erroRelatorio.prop("hidden", false);
    },

    renderizarResumo: function (dados) {
      const self = this;
      const nucleo = this.nucleo;
      const e = this.elementos;
      const itens = {};
      let totalQuantidade = 0;
      let totalValor = 0;
      let quantidadeNoGrafico = 0;

      $.each(nomesLinhas, function (_, nome) {
        const item = self.lerItem(dados, nome);
        const sufixo = self.capitalizar(nome);

        itens[nome] = item;
        totalQuantidade += item.quantidade;
        totalValor += item.valor;
        if ($.inArray(nome, nomesFatias) !== -1) {
          quantidadeNoGrafico += item.quantidade;
        }

        $('[data-campo="quantidade' + sufixo + '"]').text(item.quantidade);
        $('[data-campo="valor' + sufixo + '"]').text(nucleo.formatarMoeda(item.valor));
      });

      $('[data-campo="quantidadeTotal"]').text(totalQuantidade);
      $('[data-campo="valorTotal"]').text(nucleo.formatarMoeda(totalValor));

      this.desenharGrafico(itens, quantidadeNoGrafico);

      e.$carregandoRelatorio.prop("hidden", true);
      e.$erroRelatorio.prop("hidden", true);
      e.$conteudoRelatorio.prop("hidden", false);
    },

    desenharGrafico: function (itens, totalQuantidade) {
      const self = this;
      const e = this.elementos;
      const fatias = this.calcularFatias(itens, totalQuantidade);
      const descricoes = [];

      $.each(fatias, function (_, fatia) {
        const $circulo = e.$grafico.find('[data-fatia="' + fatia.nome + '"]');
        const $rotulo = e.$grafico.find('[data-rotuloFatia="' + fatia.nome + '"]');
        const comprimento = fatia.fracao * circunferencia;

        $circulo.attr("stroke-dasharray", comprimento.toFixed(3) + " " + (circunferencia - comprimento).toFixed(3));
        $circulo.attr("stroke-dashoffset", (-fatia.inicio * circunferencia).toFixed(3));

        if (fatia.fracao >= fracaoMinimaRotulo) {
          const angulo = (fatia.inicio + fatia.fracao / 2) * 2 * Math.PI - Math.PI / 2;

          $rotulo
            .attr({
              x: (50 + raioRotulo * Math.cos(angulo)).toFixed(2),
              y: (50 + raioRotulo * Math.sin(angulo)).toFixed(2)
            })
            .text(self.formatarPercentual(fatia.fracao))
            .removeAttr("hidden");
        } else {
          $rotulo.text("").attr("hidden", "hidden");
        }

        if (fatia.fracao > 0) {
          descricoes.push(rotulosFatias[fatia.nome] + ": " + self.formatarPercentual(fatia.fracao));
        }
      });

      e.$graficoVazio.prop("hidden", totalQuantidade > 0);

      if (totalQuantidade > 0) {
        $('[data-campo="descricaoGrafico"]').text(descricoes.join(", ") + ".");
      } else {
        $('[data-campo="descricaoGrafico"]').text("Sem compromissos no período.");
      }
    },

    dentroDoPeriodo: function (dataItem, periodo) {
      const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dataItem || ""));
      if (!partes) {
        return false;
      }

      const hoje = new Date();
      const dia = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

      if (periodo === "anual") {
        return dia.getFullYear() === hoje.getFullYear();
      }
      if (periodo === "mensal") {
        return dia.getFullYear() === hoje.getFullYear() && dia.getMonth() === hoje.getMonth();
      }
      if (periodo === "semanal") {
        const inicioSemana = new Date(inicioHoje);
        inicioSemana.setDate(inicioHoje.getDate() - inicioHoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 7);
        return dia >= inicioSemana && dia < fimSemana;
      }
      return dia.getTime() === inicioHoje.getTime();
    },

    definirEstadoHistorico: function (nome) {
      const e = this.elementos;

      e.$carregandoHistorico.prop("hidden", nome !== "carregando");
      e.$erroHistorico.prop("hidden", nome !== "erro");
      e.$vazioHistorico.prop("hidden", nome !== "vazio");
      e.$tabelaHistorico.prop("hidden", nome !== "tabela");
    },

    carregarHistorico: function () {
      const self = this;
      const nucleo = this.nucleo;
      const numeroPedido = ++this.estado.pedidoHistorico;

      this.definirEstadoHistorico("carregando");

      if (!nucleo.contratoDisponivel("carregarHistorico")) {
        this.renderizarHistorico([]);
        return;
      }

      nucleo.chamarContrato("carregarHistorico", null)
        .done(function (resposta) {
          if (numeroPedido !== self.estado.pedidoHistorico) {
            return;
          }
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            const periodo = self.periodoDo(self.elementos.$campoPeriodoHistorico);
            const itens = $.grep(resposta.dados, function (item) {
              return self.dentroDoPeriodo(item.agnd_dt, periodo);
            });
            self.renderizarHistorico(itens);
          } else {
            self.definirEstadoHistorico("erro");
          }
        })
        .fail(function () {
          if (numeroPedido === self.estado.pedidoHistorico) {
            self.definirEstadoHistorico("erro");
          }
        });
    },

    renderizarHistorico: function (itens) {
      const self = this;
      const nucleo = this.nucleo;
      const $corpo = this.elementos.$listaHistorico.empty();

      $.each(itens, function (_, item) {
        const $linha = nucleo.clonarModelo("modeloLinhaHistorico");

        $linha.find('[data-campo="clienteConsulta"]').text(item.cli_nome || "");
        $linha.find('[data-campo="servicoConsulta"]').text(item.ser_nome || "");
        $linha.find('[data-campo="profissionalConsulta"]').text(item.pro_nome || "");
        $linha.find('[data-campo="dataConsulta"]').text(self.formatarData(item.agnd_dt));
        $linha.find('[data-campo="horarioConsulta"]').text(nucleo.formatarHora(item.agnd_hrIni || item.agnd_hrini));

        nucleo.aplicarPerfilDeEm($linha);
        $corpo.append($linha);
      });

      if (itens.length) {
        this.definirEstadoHistorico("tabela");
      } else {
        this.definirEstadoHistorico("vazio");
      }
    },

    registrarEventos: function () {
      const self = this;
      const e = this.elementos;

      $("#abaRelatorio").on("shown.bs.tab", function () {
        if (!self.estado.carregado) {
          self.estado.carregado = true;
          self.carregarResumo();
          self.carregarHistorico();
        }
      });

      e.$campoPeriodoRelatorio.on("opcaoSelecionada", function () {
        self.carregarResumo();
      });
      e.$campoPeriodoHistorico.on("opcaoSelecionada", function () {
        self.carregarHistorico();
      });

      $(document).on("click", '[data-acao="tentarNovamenteRelatorio"]', function () {
        self.carregarResumo();
      });
      $(document).on("click", '[data-acao="tentarNovamenteHistorico"]', function () {
        self.carregarHistorico();
      });
    }
  };

  window.ElmoPerfilModulos.push(moduloRelatorio);

})(jQuery, window.ElmoUtilitarios);