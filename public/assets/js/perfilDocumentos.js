(function ($, Utilitarios) {
  "use strict";

  window.ElmoPerfilModulos = window.ElmoPerfilModulos || [];

  var tiposDocumento = {
    diploma: "Diploma",
    certificadoEspecializacao: "Certificado de especialização",
    licencaAlvaraSanitario: "Licença ou alvará sanitário",
    alvaraFuncionamento: "Alvará de funcionamento"
  };

  var moduloDocumentos = {

     contratos: {
      listarDocumentos: { url: "index.php?uri=documento", acao: "listarDocumentos", disponivel: false },
      enviarDocumento:  { url: "index.php?uri=documento", acao: "enviarDocumento",  disponivel: false },
      apagarDocumento:  { url: "index.php?uri=documento", acao: "apagarDocumento",  disponivel: false }
    },

    estado: {
      carregado: false,
      pedido: 0,
      arquivo: null,
      tituloAutomatico: "",
      documentoParaApagar: null
    },

    elementos: {},

    nucleo: null,

    iniciar: function (nucleo) {
      this.nucleo = nucleo;
      this.cachearElementos();
      this.registrarEventos();
    },

    cachearElementos: function () {
      var e = this.elementos;

      e.$carregando = $('[data-carregando="documentos"]');
      e.$erro = $('[data-estadoErro="documentos"]');
      e.$vazio = $('[data-estadoVazio="documentos"]');
      e.$lista = $('[data-lista="documentos"]');

      e.$modalAdicionar = $("#modalAdicionarDocumento");
      e.$formulario = $("#formularioDocumento");
      e.$campoTitulo = $("#campoTituloDocumento");
      e.$campoTipo = $("#campoTipoDocumento");
      e.$campoArquivo = $("#campoArquivoDocumento");
      e.$areaArquivo = $("[data-areaArquivo]");
      e.$estadoArquivoVazio = e.$areaArquivo.find('[data-estadoArquivo="vazio"]');
      e.$estadoArquivoSelecionado = e.$areaArquivo.find('[data-estadoArquivo="selecionado"]');
      e.$nomeArquivo = $('[data-campo="nomeArquivoSelecionado"]');
      e.$botaoEnviar = $('[data-campo="botaoEnviarDocumento"]');
      e.$carregandoEnvio = $('[data-campo="carregandoEnvioDocumento"]');

      e.$modalApagar = $("#modalApagarDocumento");
      e.$botaoConfirmarApagar = $("#botaoConfirmarApagarDocumento");
      e.$carregandoApagar = $('[data-campo="carregandoApagarDocumento"]');
    },

    rotuloDoTipo: function (tipo) {
      return tiposDocumento[tipo] || tipo || "";
    },

    urlSegura: function (url) {
      var texto = $.trim(String(url || ""));

      if (!texto || /^(javascript|data|vbscript):/i.test(texto)) {
        return "#";
      }
      return texto;
    },

    definirEstado: function (nome) {
      var e = this.elementos;

      e.$carregando.prop("hidden", nome !== "carregando");
      e.$erro.prop("hidden", nome !== "erro");
      e.$vazio.prop("hidden", nome !== "vazio");
      e.$lista.prop("hidden", nome !== "lista");
    },

    carregar: function () {
      var self = this;
      var nucleo = this.nucleo;
      var numeroPedido = ++this.estado.pedido;
      var dados = null;

      this.definirEstado("carregando");

      if (!nucleo.contratoDisponivel("listarDocumentos")) {
        this.renderizar([]);
        return;
      }
      if (nucleo.ehVisitante()) {
        dados = { tipo: nucleo.estado.alvo.tipo, id: nucleo.estado.alvo.id };
      }

      nucleo.chamarContrato("listarDocumentos", dados)
        .done(function (resposta) {
          if (numeroPedido !== self.estado.pedido) {
            return;
          }
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            self.renderizar(resposta.dados);
          } else {
            self.definirEstado("erro");
          }
        })
        .fail(function () {
          if (numeroPedido === self.estado.pedido) {
            self.definirEstado("erro");
          }
        });
    },

    renderizar: function (itens) {
      var self = this;
      var nucleo = this.nucleo;
      var $lista = this.elementos.$lista.empty();

      this.estado.carregado = true;

      $.each(itens, function (_, item) {
        var titulo = item.titulo || "";
        var $card = nucleo.clonarModelo("modeloCardDocumento");

        $card.find('[data-campo="tituloDocumento"]').text(titulo);
        $card.find('[data-campo="tipoDocumento"]').text(self.rotuloDoTipo(item.tipo));
        $card.find('[data-campo="linkBaixarDocumento"]').attr({
          href: self.urlSegura(item.url),
          "aria-label": "Baixar " + titulo
        });
        $card.find('[data-acao="apagarDocumento"]').attr("aria-label", "Apagar " + titulo);

        if (nucleo.ehVisitante()) {
          $card.find("[data-somenteDono]").attr("hidden", "hidden");
        }

        $card.data("documento", { id: item.id, titulo: titulo });
        $lista.append($card);
      });

      if (itens.length) {
        this.definirEstado("lista");
      } else {
        this.definirEstado("vazio");
      }
    },

    abrirAdicionar: function () {
      this.limparFormulario();
      Utilitarios.exibirModal(this.elementos.$modalAdicionar);
    },

    limparFormulario: function () {
      var e = this.elementos;

      e.$formulario.get(0).reset();
      e.$formulario.find(".is-invalid").removeClass("is-invalid");
      e.$campoTipo
        .removeClass("campoSelect--erro")
        .attr("data-valorSelecionado", "")
        .find(".campoSelect_valor")
        .text("Selecione o tipo de documento");
      e.$areaArquivo.removeClass("areaArquivo--erro areaArquivo--arrastando");
      this.limparArquivo();
      this.estado.tituloAutomatico = "";
      this.alternarEnvio(false);
    },

    limparArquivo: function () {
      var e = this.elementos;

      this.estado.arquivo = null;
      e.$campoArquivo.val("");
      e.$nomeArquivo.text("");
      e.$estadoArquivoSelecionado.attr("hidden", "hidden");
      e.$estadoArquivoVazio.removeAttr("hidden");
    },

    validarArquivo: function (arquivo) {
      var tipos = $.trim(this.elementos.$areaArquivo.attr("data-tiposPermitidos") || "");
      var tamanhoMaximoMb = Number(this.elementos.$areaArquivo.attr("data-tamanhoMaximoMb"));

      if (tipos) {
        var extensoes = $.map(tipos.split(","), function (tipo) {
          return $.trim(tipo).toLowerCase().replace(/^\./, "");
        });
        var extensao = (arquivo.name.split(".").pop() || "").toLowerCase();

        if ($.inArray(extensao, extensoes) === -1) {
          return "Tipo de arquivo não permitido. Use: " + extensoes.join(", ") + ".";
        }
      }
      if (tamanhoMaximoMb > 0 && arquivo.size > tamanhoMaximoMb * 1024 * 1024) {
        return "O arquivo é maior que " + tamanhoMaximoMb + " MB.";
      }
      return "";
    },

    definirArquivo: function (arquivo) {
      var e = this.elementos;
      var erro = this.validarArquivo(arquivo);

      if (erro) {
        this.limparArquivo();
        this.nucleo.exibirAviso(erro, "erro");
        return;
      }

      this.estado.arquivo = arquivo;
      e.$areaArquivo.removeClass("areaArquivo--erro");
      e.$nomeArquivo.text(arquivo.name);
      e.$estadoArquivoVazio.attr("hidden", "hidden");
      e.$estadoArquivoSelecionado.removeAttr("hidden");
      e.$estadoArquivoSelecionado.find('[data-acao="removerArquivo"]').trigger("focus");
      this.preencherTituloAutomatico(arquivo.name);
    },

    preencherTituloAutomatico: function (nomeArquivo) {
      var $titulo = this.elementos.$campoTitulo;
      var sugestao = nomeArquivo.replace(/\.[^.]+$/, "").slice(0, 100);
      var atual = $.trim($titulo.val());

      if (!atual || atual === this.estado.tituloAutomatico) {
        $titulo.val(sugestao).removeClass("is-invalid");
        this.estado.tituloAutomatico = sugestao;
      }
    },

    alternarEnvio: function (enviando) {
      this.elementos.$botaoEnviar.prop("disabled", enviando);
      this.elementos.$carregandoEnvio.prop("hidden", !enviando);
    },

    focarPrimeiroInvalido: function () {
      var e = this.elementos;
      var $invalido = e.$formulario.find("input.is-invalid, .campoSelect--erro .campoSelect_gatilho").first();

      if ($invalido.length) {
        $invalido.trigger("focus");
      } else {
        e.$areaArquivo.find('[data-acao="escolherArquivo"]').trigger("focus");
      }
    },

    enviar: function () {
      var self = this;
      var e = this.elementos;
      var nucleo = this.nucleo;
      var titulo = $.trim(e.$campoTitulo.val());
      var tipo = e.$campoTipo.attr("data-valorSelecionado") || "";
      var arquivo = this.estado.arquivo;

      e.$formulario.find(".is-invalid").removeClass("is-invalid");
      e.$campoTipo.removeClass("campoSelect--erro");
      e.$areaArquivo.removeClass("areaArquivo--erro");

      if (!titulo) {
        e.$campoTitulo.addClass("is-invalid");
      }
      if (!tipo) {
        e.$campoTipo.addClass("campoSelect--erro");
      }
      if (!arquivo) {
        e.$areaArquivo.addClass("areaArquivo--erro");
      }
      if (!titulo || !tipo || !arquivo) {
        nucleo.exibirAviso("Você precisa preencher todos os campos!", "erro");
        this.focarPrimeiroInvalido();
        return;
      }
      if (!nucleo.contratoDisponivel("enviarDocumento")) {
        nucleo.avisarIndisponivel();
        return;
      }

      var dados = new FormData();
      dados.append("titulo", titulo);
      dados.append("tipo", tipo);
      dados.append("arquivo", arquivo, arquivo.name);

      this.alternarEnvio(true);

      nucleo.chamarContrato("enviarDocumento", dados)
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            Utilitarios.esconderModal(e.$modalAdicionar);
            self.carregar();
          } else {
            nucleo.exibirAviso("Não foi possível enviar o documento. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          nucleo.exibirAviso("Não foi possível enviar o documento. Tente novamente.", "erro");
        })
        .always(function () {
          self.alternarEnvio(false);
        });
    },

    abrirApagar: function ($botao) {
      var documento = $botao.closest(".cardDocumento").data("documento");

      if (!documento) {
        return;
      }
      this.estado.documentoParaApagar = documento;
      $('[data-campo="nomeDocumentoApagar"]').text(documento.titulo);
      Utilitarios.exibirModal(this.elementos.$modalApagar);
    },

    alternarApagando: function (apagando) {
      this.elementos.$botaoConfirmarApagar.prop("disabled", apagando);
      this.elementos.$carregandoApagar.prop("hidden", !apagando);
    },

    confirmarApagar: function () {
      var self = this;
      var e = this.elementos;
      var nucleo = this.nucleo;
      var documento = this.estado.documentoParaApagar;

      if (!documento) {
        return;
      }
      if (!nucleo.contratoDisponivel("apagarDocumento")) {
        Utilitarios.esconderModal(e.$modalApagar);
        nucleo.avisarIndisponivel();
        return;
      }

      this.alternarApagando(true);

      nucleo.chamarContrato("apagarDocumento", { idDocumento: documento.id })
        .done(function (resposta) {
          Utilitarios.esconderModal(e.$modalApagar);
          if (resposta && resposta.sucesso) {
            self.carregar();
          } else {
            nucleo.exibirAviso("Não foi possível apagar o documento. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          Utilitarios.esconderModal(e.$modalApagar);
          nucleo.exibirAviso("Não foi possível apagar o documento. Tente novamente.", "erro");
        })
        .always(function () {
          self.alternarApagando(false);
        });
    },

    registrarEventos: function () {
      var self = this;
      var e = this.elementos;

      $("#abaDocumentos").on("shown.bs.tab", function () {
        if (!self.estado.carregado) {
          self.carregar();
        }
      });

      $(document).on("click", '[data-acao="tentarNovamenteDocumentos"]', function () {
        self.carregar();
      });

      $(document).on("click", '[data-acao="abrirAdicionarDocumento"]', function () {
        self.abrirAdicionar();
      });
      e.$modalAdicionar.on("hidden.bs.modal", function () {
        self.limparFormulario();
      });

      e.$formulario.on("submit", function (evento) {
        evento.preventDefault();
        self.enviar();
      });
      e.$campoTitulo.on("input", function () {
        $(this).removeClass("is-invalid");
      });
      e.$campoTipo.on("opcaoSelecionada", function () {
        $(this).removeClass("campoSelect--erro");
      });

      $(document).on("click", '[data-acao="escolherArquivo"]', function () {
        e.$campoArquivo.trigger("click");
      });
      e.$campoArquivo.on("change", function () {
        var arquivo = this.files && this.files[0];

        if (arquivo) {
          self.definirArquivo(arquivo);
        }
      });
      $(document).on("click", '[data-acao="removerArquivo"]', function () {
        self.limparArquivo();
        e.$areaArquivo.find('[data-acao="escolherArquivo"]').trigger("focus");
      });

      e.$areaArquivo.on("dragenter dragover", function (evento) {
        evento.preventDefault();
        $(this).addClass("areaArquivo--arrastando");
      });
      e.$areaArquivo.on("dragleave", function (evento) {
        var destino = evento.originalEvent.relatedTarget;

        if (!destino || !$.contains(this, destino)) {
          $(this).removeClass("areaArquivo--arrastando");
        }
      });
      e.$areaArquivo.on("drop", function (evento) {
        var transferencia = evento.originalEvent.dataTransfer;

        evento.preventDefault();
        $(this).removeClass("areaArquivo--arrastando");

        if (transferencia && transferencia.files && transferencia.files.length) {
          self.definirArquivo(transferencia.files[0]);
        }
      });

      $(document).on("click", '[data-acao="apagarDocumento"]', function () {
        self.abrirApagar($(this));
      });
      e.$botaoConfirmarApagar.on("click", function () {
        self.confirmarApagar();
      });
      e.$modalApagar.on("hidden.bs.modal", function () {
        self.estado.documentoParaApagar = null;
        self.alternarApagando(false);
      });
    }
  };

  window.ElmoPerfilModulos.push(moduloDocumentos);

})(jQuery, window.ElmoUtilitarios);
