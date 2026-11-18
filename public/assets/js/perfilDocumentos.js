(function ($, Utilitarios) {
  "use strict";

  window.ElmoPerfilModulos = window.ElmoPerfilModulos || [];

  const tiposDocumento = {
    diploma: "Diploma",
    certificadoEspecializacao: "Certificado de especialização",
    licencaAlvaraSanitario: "Licença ou alvará sanitário",
    alvaraFuncionamento: "Alvará de funcionamento"
  };

  // Só estes tipos viram data URI no backend (models/download.php).
  const extensoesPorMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf"
  };

  // Upload.php: 0 = público, 1 = privado; shareMails vazio = ninguém em especial.
  const controleAcessoPadrao = "0";

  const moduloDocumentos = {

    contratos: {
      // profissionalcontroller / clinicacontroller: arquivos do dono logado (sem url: usa o controller do papel).
      listarDocumentos: { acao: "meusArquivos", disponivel: true },

      // Mesmos controllers: arquivos de outro dono compartilhados com o e-mail da sessão ($_POST["id"] = dono).
      listarDocumentosCompartilhados: { acao: "arquivosCompartilhados", disponivel: true },

      // utils/Upload.php: lê $_FILES["file"] e $_POST["titulo"], ["tipo"], ["accessCtrl"], ["shareMails"].
      // Ajuste a rota se no routes.json o Upload.php tiver outro nome.
      enviarDocumento: { url: "index.php?uri=upload", acao: "upload", disponivel: true },

      // Ainda não existe ação de apagar no backend.
      apagarDocumento: { url: "index.php?uri=documento", acao: "apagarDocumento", disponivel: false }
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
      const e = this.elementos;

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
      const texto = $.trim(String(url || ""));

      if (/^data:(image\/(jpeg|png|gif|webp)|application\/pdf);base64,[A-Za-z0-9+\/=]+$/.test(texto)) {
        return texto;
      }
      if (!texto || /^(javascript|data|vbscript):/i.test(texto)) {
        return "#";
      }
      return texto;
    },

    // "up20261117093015123.pdf.base64" -> { data: "17/11/2026", extensao: "pdf" }
    lerNomeGuardado: function (nome) {
      const partes = /^up(\d{4})(\d{2})(\d{2})\d{9}\.([^.]*)\.base64$/i.exec(String(nome || ""));

      if (!partes) {
        return { data: "", extensao: "" };
      }
      return { data: partes[3] + "/" + partes[2] + "/" + partes[1], extensao: partes[4].toLowerCase() };
    },

    // meusArquivos só devolve { mime, nome, data }: título e tipo não vêm do backend,
    // então o título é montado pelo tipo do arquivo e pela data do envio.
    tituloDoArquivo: function (item) {
      const guardado = this.lerNomeGuardado(item.nome);
      let base;

      if (item.titulo) {
        return item.titulo;
      }
      if (String(item.mime || "").indexOf("image/") === 0) {
        base = "Imagem";
      } else {
        base = "Documento PDF";
      }
      if (guardado.data) {
        return base + " de " + guardado.data;
      }
      return base;
    },

    definirEstado: function (nome) {
      const e = this.elementos;

      e.$carregando.prop("hidden", nome !== "carregando");
      e.$erro.prop("hidden", nome !== "erro");
      e.$vazio.prop("hidden", nome !== "vazio");
      e.$lista.prop("hidden", nome !== "lista");
    },

    carregar: function () {
      const self = this;
      const nucleo = this.nucleo;
      const numeroPedido = ++this.estado.pedido;
      let dados = null;

      this.definirEstado("carregando");

      let contrato = "listarDocumentos";

      if (nucleo.ehVisitante()) {
        contrato = "listarDocumentosCompartilhados";
        dados = { id: nucleo.estado.alvo.id };
      }
      if (!nucleo.contratoDisponivel(contrato)) {
        this.renderizar([]);
        return;
      }

      nucleo.chamarContrato(contrato, dados)
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
      const self = this;
      const nucleo = this.nucleo;
      const $lista = this.elementos.$lista.empty();

      this.estado.carregado = true;

      $.each(itens, function (_, item) {
        const titulo = self.tituloDoArquivo(item);
        const extensao = extensoesPorMime[item.mime] || self.lerNomeGuardado(item.nome).extensao;
        const href = self.urlSegura(item.data || item.url);
        const eImagem = String(item.mime || "").indexOf("image/") === 0 && href !== "#";
        const $card = nucleo.clonarModelo("modeloCardDocumento");
        const $link = $card.find('[data-campo="linkBaixarDocumento"]');
        const $tipo = $card.find('[data-campo="tipoDocumento"]');

        $card.find('[data-campo="tituloDocumento"]').text(titulo);
        if (item.tipo) {
          $tipo.text(self.rotuloDoTipo(item.tipo));
        } else {
          $tipo.attr("hidden", "hidden");
        }
        $link.attr({
          href: href,
          download: titulo + (extensao ? "." + extensao : ""),
          "aria-label": "Baixar " + titulo
        });
        $card.find('[data-acao="apagarDocumento"]').attr("aria-label", "Apagar " + titulo);

        // Miniatura opcional: só aparece se o modelo tiver <img data-campo="miniaturaDocumento" hidden>.
        if (eImagem) {
          $card.find('[data-campo="miniaturaDocumento"]').attr({ src: href, alt: titulo }).removeAttr("hidden");
        }

        if (nucleo.ehVisitante()) {
          $card.find("[data-somenteDono]").attr("hidden", "hidden");
        }

        $card.data("documento", { id: item.id || item.nome, titulo: titulo });
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
      const e = this.elementos;

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
      const e = this.elementos;

      this.estado.arquivo = null;
      e.$campoArquivo.val("");
      e.$nomeArquivo.text("");
      e.$estadoArquivoSelecionado.attr("hidden", "hidden");
      e.$estadoArquivoVazio.removeAttr("hidden");
    },

    validarArquivo: function (arquivo) {
      const tipos = $.trim(this.elementos.$areaArquivo.attr("data-tiposPermitidos") || "");
      const tamanhoMaximoMb = Number(this.elementos.$areaArquivo.attr("data-tamanhoMaximoMb"));

      if (tipos) {
        const extensoes = $.map(tipos.split(","), function (tipo) {
          return $.trim(tipo).toLowerCase().replace(/^\./, "");
        });
        const extensao = (arquivo.name.split(".").pop() || "").toLowerCase();

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
      const e = this.elementos;
      const erro = this.validarArquivo(arquivo);

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
      const $titulo = this.elementos.$campoTitulo;
      const sugestao = nomeArquivo.replace(/\.[^.]+$/, "").slice(0, 100);
      const atual = $.trim($titulo.val());

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
      const e = this.elementos;
      const $invalido = e.$formulario.find("input.is-invalid, .campoSelect--erro .campoSelect_gatilho").first();

      if ($invalido.length) {
        $invalido.trigger("focus");
      } else {
        e.$areaArquivo.find('[data-acao="escolherArquivo"]').trigger("focus");
      }
    },

    enviar: function () {
      const self = this;
      const e = this.elementos;
      const nucleo = this.nucleo;
      const titulo = $.trim(e.$campoTitulo.val());
      const tipo = e.$campoTipo.attr("data-valorSelecionado") || "";
      const arquivo = this.estado.arquivo;

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

      // Upload.php lê $_FILES["file"] e os campos em $_POST.
      const dados = new FormData();
      dados.append("file", arquivo, arquivo.name);
      dados.append("titulo", titulo);
      dados.append("tipo", tipo);
      dados.append("accessCtrl", controleAcessoPadrao);
      dados.append("shareMails", "");

      this.alternarEnvio(true);

      // O Upload.php responde com texto (nome do arquivo salvo), não com JSON.
      nucleo.chamarContrato("enviarDocumento", dados, "text")
        .done(function (resposta) {
          if (self.envioConfirmado(resposta)) {
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

    // Sucesso = nome gerado pelo Upload.php ("up" + data/hora + extensão + ".base64").
    envioConfirmado: function (resposta) {
      return /up\d{14,}\.[^\s]*\.base64/.test(String(resposta || ""));
    },

    abrirApagar: function ($botao) {
      const documento = $botao.closest(".cardDocumento").data("documento");

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
      const self = this;
      const e = this.elementos;
      const nucleo = this.nucleo;
      const documento = this.estado.documentoParaApagar;

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
      const self = this;
      const e = this.elementos;

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
        const arquivo = this.files && this.files[0];

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
        const destino = evento.originalEvent.relatedTarget;

        if (!destino || !$.contains(this, destino)) {
          $(this).removeClass("areaArquivo--arrastando");
        }
      });
      e.$areaArquivo.on("drop", function (evento) {
        const transferencia = evento.originalEvent.dataTransfer;

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