(function ($, Utilitarios) {
  "use strict";

  window.ElmoPerfilModulos = window.ElmoPerfilModulos || [];

  var raioFatia = 25;
  var circunferencia = 2 * Math.PI * raioFatia;
  var raioRotulo = 30;
  var fracaoMinimaRotulo = 0.05;
  var nomesFatias = ["realizadas", "canceladas", "pendentes"];
  var nomesLinhas = ["realizadas", "canceladas", "pendentes", "naoCompareceu"];
  var rotulosFatias = { realizadas: "Realizadas", canceladas: "Canceladas", pendentes: "Pendentes" };

  var compensarMensalDoBackend = true;

  var moduloRelatorio = {

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
        disponivel: false
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
      var e = this.elementos;

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
      var hoje = new Date();
      var mes = String(hoje.getMonth() + 1);
      var dia = String(hoje.getDate());

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
      var partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor || ""));

      if (partes) {
        return partes[3] + "/" + partes[2] + "/" + partes[1];
      }
      return String(valor || "");
    },

    lerItem: function (dados, nome) {
      var item = {};

      if (dados && dados[nome]) {
        item = dados[nome];
      }
      return {
        quantidade: Number(item.quantidade) || 0,
        valor: Number(item.valor) || 0
      };
    },

    calcularFatias: function (itens, totalQuantidade) {
      var acumulado = 0;
      var fatias = [];

      $.each(nomesFatias, function (_, nome) {
        var fracao = 0;

        if (totalQuantidade > 0) {
          fracao = itens[nome].quantidade / totalQuantidade;
        }
        fatias.push({ nome: nome, fracao: fracao, inicio: acumulado });
        acumulado += fracao;
      });

      return fatias;
    },

    dataParaPeriodo: function (periodo) {
        var hoje = new Date();

        if (periodo === "mensal") {
            var mes = String(hoje.getMonth() + 1).padStart(2, "0");

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
            var inicio = texto.indexOf('{"sucesso"');

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
        var self = this;
        var nucleo = this.nucleo;
        var e = this.elementos;
        var numeroPedido = ++this.estado.pedidoResumo;

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

        var periodo = this.periodoDo(e.$campoPeriodoRelatorio);
        var data = this.dataParaPeriodo(periodo);

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

            var dados = {
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
      var self = this;
      var nucleo = this.nucleo;
      var e = this.elementos;
      var itens = {};
      var totalQuantidade = 0;
      var totalValor = 0;
      var quantidadeNoGrafico = 0;

      $.each(nomesLinhas, function (_, nome) {
        var item = self.lerItem(dados, nome);
        var sufixo = self.capitalizar(nome);

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
      var self = this;
      var e = this.elementos;
      var fatias = this.calcularFatias(itens, totalQuantidade);
      var descricoes = [];

      $.each(fatias, function (_, fatia) {
        var $circulo = e.$grafico.find('[data-fatia="' + fatia.nome + '"]');
        var $rotulo = e.$grafico.find('[data-rotuloFatia="' + fatia.nome + '"]');
        var comprimento = fatia.fracao * circunferencia;

        $circulo.attr("stroke-dasharray", comprimento.toFixed(3) + " " + (circunferencia - comprimento).toFixed(3));
        $circulo.attr("stroke-dashoffset", (-fatia.inicio * circunferencia).toFixed(3));

        if (fatia.fracao >= fracaoMinimaRotulo) {
          var angulo = (fatia.inicio + fatia.fracao / 2) * 2 * Math.PI - Math.PI / 2;

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

    definirEstadoHistorico: function (nome) {
      var e = this.elementos;

      e.$carregandoHistorico.prop("hidden", nome !== "carregando");
      e.$erroHistorico.prop("hidden", nome !== "erro");
      e.$vazioHistorico.prop("hidden", nome !== "vazio");
      e.$tabelaHistorico.prop("hidden", nome !== "tabela");
    },

    carregarHistorico: function () {
      var self = this;
      var nucleo = this.nucleo;
      var numeroPedido = ++this.estado.pedidoHistorico;

      this.definirEstadoHistorico("carregando");

      if (!nucleo.contratoDisponivel("carregarHistorico")) {
        this.renderizarHistorico([]);
        return;
      }

      nucleo.chamarContrato("carregarHistorico", { periodo: this.periodoDo(this.elementos.$campoPeriodoHistorico), data: this.dataDeHoje() })
        .done(function (resposta) {
          if (numeroPedido !== self.estado.pedidoHistorico) {
            return;
          }
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            self.renderizarHistorico(resposta.dados);
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
      var self = this;
      var nucleo = this.nucleo;
      var $corpo = this.elementos.$listaHistorico.empty();

      $.each(itens, function (_, item) {
        var $linha = nucleo.clonarModelo("modeloLinhaHistorico");

        $linha.find('[data-campo="clienteConsulta"]').text(item.cliente || "");
        $linha.find('[data-campo="servicoConsulta"]').text(item.servico || "");
        $linha.find('[data-campo="profissionalConsulta"]').text(item.profissional || "");
        $linha.find('[data-campo="dataConsulta"]').text(self.formatarData(item.data));
        $linha.find('[data-campo="horarioConsulta"]').text(nucleo.formatarHora(item.horario));

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
      var self = this;
      var e = this.elementos;

      $("#abaRelatorio").on("shown.bs.tab", function () {
        if (!self.estado.carregado) {
          self.estado.carregado = true;
          self.carregarResumo();
          //self.carregarHistorico();
        }
      });

      e.$campoPeriodoRelatorio.on("opcaoSelecionada", function () {
        self.carregarResumo();
      });
      e.$campoPeriodoHistorico.on("opcaoSelecionada", function () {
        //self.carregarHistorico();
      });

      $(document).on("click", '[data-acao="tentarNovamenteRelatorio"]', function () {
        self.carregarResumo();
      });
      $(document).on("click", '[data-acao="tentarNovamenteHistorico"]', function () {
        //self.carregarHistorico();
      });
    }
  };

  window.ElmoPerfilModulos.push(moduloRelatorio);

})(jQuery, window.ElmoUtilitarios);
