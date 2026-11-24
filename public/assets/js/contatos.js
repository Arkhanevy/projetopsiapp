(function ($, Utilitarios) {
  "use strict";

  const moduloContatos = {

    configuracao: {
      tempoAvisoMs: 5000,
      textoIndisponivel: "Essa ação ainda não está disponível no servidor.",

      secoes: {
        profissionais: { prefixo: "pro",  tipo: "profissional", comDocumento: true,  campoLista: "listaContatosProfissionais" },
        clientes:      { prefixo: "cli",  tipo: "cliente",      comDocumento: true,  campoLista: "listaContatosClientes" },
        clinicas:      { prefixo: "clin", tipo: "clinica",      comDocumento: false, campoLista: "listaContatosClinicas" }
      },

      papeis: {
        cliente: {
          url: "index.php?uri=cliente",
          listas: { dados1: "profissionais", dados2: "clinicas" },
          secoes: ["profissionais", "clinicas"],
          apoio: "clínicas e profissionais",
          mostrarTelefone: true
        },
        clienteSimples: {
          url: "index.php?uri=cliente",
          listas: { dados1: "profissionais", dados2: "clinicas" },
          secoes: ["profissionais", "clinicas"],
          apoio: "clínicas e profissionais",
          mostrarTelefone: false
        },
        profissional: {
          url: "index.php?uri=profissional",
          listas: { dados1: "clientes", dados2: "clinicas" },
          secoes: ["clientes", "clinicas"],
          apoio: "clínicas e clientes",
          mostrarTelefone: true
        },
        clinica: {
          url: "index.php?uri=clinica",
          listas: { dados1: "profissionais", dados2: "clientes" },
          secoes: ["profissionais", "clientes"],
          apoio: "profissionais e clientes",
          mostrarTelefone: true
        }
      },

      hrefAgendaPorTipo: {
        cliente: "index.php?uri=consultasCli",
        clienteSimples: "index.php?uri=consultasCli",
        profissional: "index.php?uri=agendaProfissional",
        clinica: "index.php?uri=agendaClinica"
      },

      contratos: {
        listarContatos:   { acao: "contato",          disponivel: true  },
        listarDocumentos: { acao: "listarDocumentosContato", disponivel: true },
        enviarDocumento:  { acao: "enviarDocumento",  disponivel: true },
        baixarDocumento:  { acao: "baixarDocumento",  disponivel: true }
      },

      avisos: {
        erro:    { icone: "error",        classe: "" },
        atencao: { icone: "warning",      classe: "avisoFlutuante--atencao" },
        sucesso: { icone: "check_circle", classe: "avisoFlutuante--sucesso" }
      },

      listasDocumentos: {
        enviados:  "listaDocumentosEnviados",
        recebidos: "listaDocumentosRecebidos"
      }
    },

    estado: {
      papel: null,
      requisicaoContatos: 0,
      contatoAtual: null,
      modalAberto: false,
      abaDocumentos: "enviados",
      requisicoesDocumentos: {},
      arquivo: null,
      tituloAutomatico: "",
      enviando: false
    },

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      this.registrarEventos();
    },

    cachearElementos: function () {
      const e = this.elementos;
      e.$principal = $("#conteudoContatos");
      e.$avisoPagina = $("#avisoContatos");
      e.$estadosPagina = $("[data-estadoContatos]");
      e.$botaoTentarContatos = $("#botaoTentarNovamenteContatos");
      e.$secoes = $("[data-secaoContatos]");
      e.$modeloContato = $("#modeloItemContato");
      e.$modeloDocumento = $("#modeloCardDocumento");

      e.$modal = $("#modalDocumentos");
      e.$visaoLista = $("[data-visaoDocumentos='lista']");
      e.$visaoEnvio = $("#formularioEnvioDocumento");
      e.$abasDocumentos = $("#abasDocumentos");
      e.$estadosDocumentos = $("[data-estadoDocumentos]");
      e.$botaoAbrirEnvio = $("[data-acao='abrirEnvioDocumento']");

      e.$campoTitulo = $("#campoTituloDocumento");
      e.$campoArquivo = $("#campoArquivoDocumento");
      e.$areaArquivo = $("#areaArquivoDocumento");
      e.$arquivoSelecionado = $("[data-campo='arquivoSelecionado']");
      e.$nomeArquivo = $("[data-campo='nomeArquivoSelecionado']");
      e.$tamanhoArquivo = $("[data-campo='tamanhoArquivoSelecionado']");
      e.$rotuloBotaoArquivo = $("[data-campo='rotuloBotaoArquivo']");
      e.$botaoEnviar = $("#botaoEnviarDocumento");
      e.$indicadorEnvio = $("[data-campo='indicadorEnvio']");
      e.$iconeEnvio = $("[data-campo='iconeEnvio']");

      e.$aviso = $("#avisoContatosFlutuante");
    },

    registrarEventos: function () {
      const self = this;
      const e = this.elementos;

      $(document).on("sessaoNavegacaoDefinida", function (evento, sessao) {
        self.aoDefinirSessao(sessao);
      });

      e.$botaoTentarContatos.on("click", function () {
        self.carregarContatos();
      });

      e.$modal.on("show.bs.modal", function (evento) {
        self.aoAbrirModal(evento);
      });
      e.$modal.on("shown.bs.modal", function () {
        self.carregarDocumentos(self.estado.abaDocumentos);
      });
      e.$modal.on("hide.bs.modal", function (evento) {
        if (self.estado.enviando) {
          evento.preventDefault();
          self.exibirAviso("Aguarde o envio terminar para fechar.", "atencao");
        }
      });
      e.$modal.on("hidden.bs.modal", function () {
        self.aoFecharModal();
      });

      e.$abasDocumentos.on("shown.bs.tab", "[data-tipoDocumento]", function () {
        self.estado.abaDocumentos = $(this).attr("data-tipoDocumento");
        if (self.estado.modalAberto) {
          self.carregarDocumentos(self.estado.abaDocumentos);
        }
      });

      $("#botaoTentarNovamenteDocumentos").on("click", function () {
        self.carregarDocumentos(self.estado.abaDocumentos);
      });

      e.$modal.on("click", "[data-acao='baixarDocumento']", function () {
        self.baixarDocumento($(this).closest("[data-idDocumento]").attr("data-idDocumento"));
      });

      e.$botaoAbrirEnvio.on("click", function () {
        self.abrirEnvio();
      });
      e.$modal.on("click", "[data-acao='cancelarEnvioDocumento']", function () {
        self.voltarParaLista();
      });
      e.$modal.on("click", "[data-acao='escolherArquivo']", function () {
        e.$campoArquivo.trigger("click");
      });
      e.$campoArquivo.on("change", function () {
        const arquivos = this.files;
        if (arquivos && arquivos.length) {
          self.selecionarArquivo(arquivos[0]);
        }
        this.value = "";
      });
      e.$campoTitulo.on("input", function () {
        self.limparErroTitulo();
      });
      e.$visaoEnvio.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarDocumento();
      });

      this.registrarArrastar();
    },

    registrarArrastar: function () {
      const self = this;
      const $area = this.elementos.$areaArquivo;

      $area.on("dragenter dragover", function (evento) {
        evento.preventDefault();
        if (!self.estado.enviando) {
          $area.attr("data-estadoArea", "arrastando");
        }
      });

      $area.on("dragleave", function (evento) {

        const destino = evento.originalEvent && evento.originalEvent.relatedTarget;
        if (destino && $area.get(0).contains(destino)) {
          return;
        }
        self.atualizarEstadoArea();
      });

      $area.on("drop", function (evento) {
        evento.preventDefault();
        self.atualizarEstadoArea();
        if (self.estado.enviando) {
          return;
        }

        const transferencia = evento.originalEvent && evento.originalEvent.dataTransfer;
        const arquivos = transferencia && transferencia.files;
        if (!arquivos || !arquivos.length) {
          return;
        }
        if (arquivos.length > 1) {
          self.exibirAviso("Selecione apenas um arquivo por vez.", "atencao");
          return;
        }
        self.selecionarArquivo(arquivos[0]);
      });
    },

    aoDefinirSessao: function (sessao) {
      const configuracao = this.configuracao;

      if (!sessao || !sessao.logado) {
        this.exibirNaoLogado();
        return;
      }

      $(".navTopoLogado").removeAttr("hidden");
      if (configuracao.hrefAgendaPorTipo[sessao.tipoUsuario]) {
        $("[data-itemAgenda]").attr("href", configuracao.hrefAgendaPorTipo[sessao.tipoUsuario]);
      }

      if (!configuracao.papeis[sessao.tipoUsuario]) {

        this.exibirEstadoPagina("vazio");
        return;
      }

      this.estado.papel = sessao.tipoUsuario;
      this.aplicarTextosPapel(sessao.tipoUsuario);
      this.carregarContatos();
    },

    exibirNaoLogado: function () {
      this.exibirEstadoPagina("erro");
      this.elementos.$estadosPagina.filter("[data-estadoContatos='erro']")
        .find(".estadoVazio_texto").text("Entre na sua conta para ver seus contatos.");
      this.elementos.$botaoTentarContatos.attr("hidden", "hidden");
    },

    aplicarTextosPapel: function (papel) {
      const config = this.configuracao.papeis[papel];
      $("[data-campo='tiposContatoApoio']").text(config.apoio);
    },

    contratoDisponivel: function (nome) {
      if (this.configuracao.contratos[nome].disponivel) {
        return true;
      } else {
        return false;
      }
    },

    chamarContrato: function (nome, dados) {
      const contrato = this.configuracao.contratos[nome];
      const papel = this.configuracao.papeis[this.estado.papel];
      const pedido = {
        url: contrato.url || papel.url,
        method: "POST",
        dataType: "json"
      };

      if (typeof FormData !== "undefined" && dados instanceof FormData) {
        dados.append("acao", contrato.acao);
        pedido.data = dados;
        pedido.processData = false;
        pedido.contentType = false;
      } else {
        pedido.data = $.extend({ acao: contrato.acao }, dados || {});
      }

      return $.ajax(pedido);
    },

    exibirEstadoPagina: function (nome) {
      const e = this.elementos;
      e.$estadosPagina.attr("hidden", "hidden");
      e.$estadosPagina.filter("[data-estadoContatos='" + nome + "']").removeAttr("hidden");
      let ariaOcupado;
      if (nome === "carregando") {
        ariaOcupado = "true";
      } else {
        ariaOcupado = "false";
      }
      e.$principal.attr("aria-busy", ariaOcupado);

      if (nome === "vazio") {
        e.$avisoPagina.text("Nenhum contato foi encontrado.");
      } else if (nome === "erro") {
        e.$avisoPagina.text("");
      }
    },

    carregarContatos: function () {
      const self = this;
      const numero = ++this.estado.requisicaoContatos;

      this.elementos.$botaoTentarContatos.removeAttr("hidden");

      if (!this.contratoDisponivel("listarContatos")) {

        this.renderizarContatos({});
        return;
      }

      this.exibirEstadoPagina("carregando");

      this.chamarContrato("listarContatos")
        .done(function (resposta) {
          if (numero !== self.estado.requisicaoContatos) {
            return;
          }
          if (resposta && resposta.sucesso) {
            self.renderizarContatos(self.normalizarContatos(resposta));
          } else {
            self.exibirErroContatos();
          }
        })
        .fail(function () {
          if (numero === self.estado.requisicaoContatos) {
            self.exibirErroContatos();
          }
        });
    },

    normalizarContatos: function (resposta) {
      const mapa = this.configuracao.papeis[this.estado.papel].listas;
      const dados = {};

      $.each(mapa, function (campoServidor, nomeSecao) {
        if (Array.isArray(resposta[campoServidor])) {
          dados[nomeSecao] = resposta[campoServidor];
        } else {
          dados[nomeSecao] = [];
        }
      });

      return dados;
    },

    exibirErroContatos: function () {
      this.elementos.$estadosPagina.filter("[data-estadoContatos='erro']")
        .find(".estadoVazio_texto").text("Não foi possível carregar os contatos.");
      this.exibirEstadoPagina("erro");
    },

    renderizarContatos: function (dados) {
      const e = this.elementos;
      const configuracao = this.configuracao;
      const papel = configuracao.papeis[this.estado.papel];
      const self = this;
      let total = 0;

      e.$secoes.attr("hidden", "hidden");

      $.each(papel.secoes, function (indice, nomeSecao) {
        const secao = configuracao.secoes[nomeSecao];
        let itens;
        if (Array.isArray(dados[nomeSecao])) {
          itens = dados[nomeSecao];
        } else {
          itens = [];
        }
        const $lista = $("[data-campo='" + secao.campoLista + "']").empty();

        $.each(itens, function (posicao, item) {
          $lista.append(self.criarItemContato(item, secao, papel));
        });

        if (itens.length) {
          $("[data-secaoContatos='" + nomeSecao + "']").removeAttr("hidden");
          total += itens.length;
        }
      });

      if (!total) {
        this.exibirEstadoPagina("vazio");
        return;
      }

      this.exibirEstadoPagina("lista");
      let sufixoTotal;
      if (total === 1) {
        sufixoTotal = " contato encontrado.";
      } else {
        sufixoTotal = " contatos encontrados.";
      }
      e.$avisoPagina.text(total + sufixoTotal);
    },

    criarItemContato: function (item, secao, papel) {
      const modelo = this.elementos.$modeloContato.get(0);
      const $item = $(modelo.content.firstElementChild.cloneNode(true));
      const prefixo = secao.prefixo;
      const usuario = item[prefixo + "_user"] || item[prefixo + "_nome"] || "";
      const foto = this.fotoValida(item[prefixo + "_foto"]);

      $item.find("[data-idContato]").addBack("[data-idContato]")
        .attr("data-idContato", item[prefixo + "_id"])
        .attr("data-tipoContato", secao.tipo);
      $item.find("[data-campo='usuarioContato']").text(usuario);

      const $telefone = $item.find("[data-campo='telefoneContato']");
      let telefoneFormatado = "";
      if (papel.mostrarTelefone) {
        telefoneFormatado = Utilitarios.formatarMascara("telefone", item[prefixo + "_tel"]);
      }
      if (telefoneFormatado) {
        $telefone.text(telefoneFormatado);
      } else {
        $telefone.remove();
      }

      const $icone = $item.find("[data-campo='iconePadraoContato']");
      let nomeIcone;
      if (secao.tipo === "clinica") {
        nomeIcone = "apartment";
      } else {
        nomeIcone = "person";
      }
      $icone.text(nomeIcone);
      if (foto) {
        $item.find("[data-campo='fotoContato']").attr("src", foto).removeAttr("hidden");
        $icone.attr("hidden", "hidden");
      }

      if (secao.comDocumento) {
        $item.find("[data-acao='abrirDocumentos']")
          .attr("aria-label", "Documentos de " + usuario)
          .removeAttr("hidden");
      }

      return $item;
    },

    fotoValida: function (foto) {
      const texto = String(foto || "");
      if (/^data:image\/(jpeg|png|gif|webp);base64,/i.test(texto) || /\.(jpe?g|png|gif|webp)$/i.test(texto)) {
        return texto;
      } else {
        return undefined;
      }
    },

    aoAbrirModal: function (evento) {
      const $botao = $(evento.relatedTarget);
      const $contato = $botao.closest("[data-idContato]");

      this.estado.contatoAtual = {
        id: $contato.attr("data-idContato"),
        tipo: $contato.attr("data-tipoContato"),
        usuario: $contato.find("[data-campo='usuarioContato']").text()
      };
      this.estado.modalAberto = true;

      $("[data-campo='usuarioContatoModal']").text(this.estado.contatoAtual.usuario);
      this.mostrarVisao("lista");
    },

    aoFecharModal: function () {
      this.estado.modalAberto = false;
      this.estado.contatoAtual = null;
      this.estado.requisicoesDocumentos = {};
      this.limparFormulario();
      this.limparListasDocumentos();

      this.estado.abaDocumentos = "enviados";
      bootstrap.Tab.getOrCreateInstance($("#abaDocumentosEnviados").get(0)).show();
    },

    mostrarVisao: function (visao) {
      const e = this.elementos;
      e.$visaoLista.prop("hidden", visao !== "lista");
      e.$visaoEnvio.prop("hidden", visao !== "envio");
    },

    $listaDocumentos: function (tipo) {
      return $("[data-campo='" + this.configuracao.listasDocumentos[tipo] + "']");
    },

    $vazioDocumentos: function (tipo) {
      return $("[data-estadoVazioDocumentos='" + tipo + "']");
    },

    limparListasDocumentos: function () {
      const self = this;
      $.each(this.configuracao.listasDocumentos, function (tipo) {
        self.$listaDocumentos(tipo).empty();
        self.$vazioDocumentos(tipo).attr("hidden", "hidden");
      });
      this.exibirEstadoDocumentos(null);
    },

    exibirEstadoDocumentos: function (nome) {
      this.elementos.$estadosDocumentos.attr("hidden", "hidden");
      if (nome) {
        this.elementos.$estadosDocumentos.filter("[data-estadoDocumentos='" + nome + "']").removeAttr("hidden");
      }
    },

    carregarDocumentos: function (tipo) {
      const self = this;
      const contato = this.estado.contatoAtual;
      if (!contato) {
        return;
      }

      const numero = (this.estado.requisicoesDocumentos[tipo] || 0) + 1;
      this.estado.requisicoesDocumentos[tipo] = numero;

      this.$listaDocumentos(tipo).empty();
      this.$vazioDocumentos(tipo).attr("hidden", "hidden");

      if (!this.contratoDisponivel("listarDocumentos")) {

        this.exibirEstadoDocumentos(null);
        this.renderizarDocumentos(tipo, []);
        return;
      }

      this.exibirEstadoDocumentos("carregando");

      this.chamarContrato("listarDocumentos", {
        idContato: contato.id,
        tipoContato: contato.tipo,
        tipo: tipo
      })
        .done(function (resposta) {
          if (!self.respostaDocumentosAtual(tipo, numero, contato)) {
            return;
          }
          if (resposta && resposta.sucesso && Array.isArray(resposta.dados)) {
            self.exibirEstadoDocumentos(null);
            self.renderizarDocumentos(tipo, resposta.dados);
          } else {
            self.exibirEstadoDocumentos("erro");
          }
        })
        .fail(function () {
          if (self.respostaDocumentosAtual(tipo, numero, contato)) {
            self.exibirEstadoDocumentos("erro");
          }
        });
    },

    respostaDocumentosAtual: function (tipo, numero, contato) {
      return this.estado.modalAberto
        && this.estado.contatoAtual
        && this.estado.contatoAtual.id === contato.id
        && this.estado.requisicoesDocumentos[tipo] === numero;
    },

    renderizarDocumentos: function (tipo, itens) {
      const $lista = this.$listaDocumentos(tipo);
      const modelo = this.elementos.$modeloDocumento.get(0);

      $lista.empty();

      if (!itens.length) {
        this.$vazioDocumentos(tipo).removeAttr("hidden");
        return;
      }

      $.each(itens, function (indice, item) {
        const $item = $(modelo.content.firstElementChild.cloneNode(true));
        $item.find("[data-idDocumento]").addBack("[data-idDocumento]").attr("data-idDocumento", item.idDocumento);
        $item.find("[data-campo='tituloDocumento']").text(item.tituloDocumento || "");
        $item.find("[data-campo='remetenteDocumento']").text(item.remetente || "");
        $item.find("[data-campo='destinatarioDocumento']").text(item.destinatario || "");
        $item.find("[data-acao='baixarDocumento']")
          .attr("aria-label", "Baixar " + (item.tituloDocumento || "documento"));
        $lista.append($item);
      });
    },

    baixarDocumento: function (idDocumento) {
      const self = this;
      if (!idDocumento) {
        return;
      }
      if (!this.contratoDisponivel("baixarDocumento")) {
        this.exibirAviso(this.configuracao.textoIndisponivel, "atencao");
        return;
      }

      this.chamarContrato("baixarDocumento", { idDocumento: idDocumento })
        .done(function (resposta) {
          if (resposta && resposta.sucesso && resposta.data) {
            self.salvarArquivoLocal(resposta);
          } else {
            self.exibirAviso((resposta && resposta.mensagem) || "Não foi possível baixar o documento.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível baixar o documento.", "erro");
        });
    },

    salvarArquivoLocal: function (arquivo) {
      const self = this;

      fetch(arquivo.data)
        .then(function (resposta) {
          return resposta.blob();
        })
        .then(function (conteudo) {
          const endereco = URL.createObjectURL(conteudo);
          const $ancora = $("<a>", { href: endereco, download: arquivo.nome || "documento" }).attr("hidden", "hidden");
          $ancora.appendTo(document.body);
          $ancora.get(0).click();
          $ancora.remove();
          setTimeout(function () {
            URL.revokeObjectURL(endereco);
          }, 1000);
        })
        .catch(function () {
          self.exibirAviso("Não foi possível baixar o documento.", "erro");
        });
    },

    abrirEnvio: function () {
      this.limparFormulario();
      this.mostrarVisao("envio");
      this.elementos.$campoTitulo.trigger("focus");
    },

    voltarParaLista: function () {
      if (this.estado.enviando) {
        return;
      }
      this.limparFormulario();
      this.mostrarVisao("lista");
      this.elementos.$botaoAbrirEnvio.trigger("focus");
    },

    limparFormulario: function () {
      const e = this.elementos;

      e.$visaoEnvio.get(0).reset();
      this.estado.arquivo = null;
      this.estado.tituloAutomatico = "";
      this.definirEnviando(false);

      e.$arquivoSelecionado.attr("hidden", "hidden");
      e.$nomeArquivo.text("");
      e.$tamanhoArquivo.text("");
      e.$rotuloBotaoArquivo.text("Escolha um arquivo");
      e.$botaoEnviar.prop("disabled", true);

      this.limparErroTitulo();
      this.limparErroArquivo();
      this.atualizarEstadoArea();
    },

    atualizarEstadoArea: function () {
      let estadoArea;
      if (this.estado.arquivo) {
        estadoArea = "selecionado";
      } else {
        estadoArea = "vazio";
      }
      this.elementos.$areaArquivo.attr("data-estadoArea", estadoArea);
    },

    selecionarArquivo: function (arquivo) {
      const e = this.elementos;
      const erro = this.validarArquivo(arquivo);

      if (erro) {
        this.mostrarErroArquivo(erro);
        return;
      }

      this.limparErroArquivo();
      this.estado.arquivo = arquivo;

      e.$nomeArquivo.text(arquivo.name);
      e.$tamanhoArquivo.text(this.formatarTamanho(arquivo.size));
      e.$arquivoSelecionado.removeAttr("hidden");
      e.$rotuloBotaoArquivo.text("Trocar arquivo");
      e.$botaoEnviar.prop("disabled", false);
      this.atualizarEstadoArea();

      const tituloAtual = $.trim(e.$campoTitulo.val());
      if (tituloAtual === "" || tituloAtual === this.estado.tituloAutomatico) {
        const novoTitulo = this.nomeSemExtensao(arquivo.name);
        e.$campoTitulo.val(novoTitulo);
        this.estado.tituloAutomatico = novoTitulo;
        this.limparErroTitulo();
      }
    },

    nomeSemExtensao: function (nome) {
      const semExtensao = nome.replace(/\.[^.]+$/, "");
      if ($.trim(semExtensao) !== "") {
        return semExtensao;
      } else {
        return nome;
      }
    },

    validarArquivo: function (arquivo) {
      const $area = this.elementos.$areaArquivo;
      const tipos = $.trim($area.attr("data-tiposPermitidos") || "");
      const tamanhoMaximoMb = parseFloat($area.attr("data-tamanhoMaximoMb"));

      if (tipos) {
        const nome = arquivo.name.toLowerCase();
        let permitido = false;
        $.each(tipos.split(","), function (indice, tipo) {
          tipo = $.trim(tipo).toLowerCase();
          if (tipo && (nome.slice(-tipo.length) === tipo || arquivo.type === tipo)) {
            permitido = true;
          }
        });
        if (!permitido) {
          return "Este tipo de arquivo não é permitido.";
        }
      }

      if (!isNaN(tamanhoMaximoMb) && arquivo.size > tamanhoMaximoMb * 1024 * 1024) {
        return "O arquivo é maior que o limite de " + tamanhoMaximoMb + " MB.";
      }

      return "";
    },

    formatarTamanho: function (bytes) {
      const formato = { maximumFractionDigits: 1 };
      if (bytes < 1024) {
        return bytes + " B";
      }
      if (bytes < 1024 * 1024) {
        return (bytes / 1024).toLocaleString("pt-BR", formato) + " KB";
      }
      return (bytes / (1024 * 1024)).toLocaleString("pt-BR", formato) + " MB";
    },

    mostrarErroTitulo: function (mensagem) {
      this.elementos.$campoTitulo.addClass("is-invalid").attr("aria-invalid", "true");
      $("[data-mensagemCampo='tituloDocumento']").text(mensagem);
    },

    limparErroTitulo: function () {
      this.elementos.$campoTitulo.removeClass("is-invalid").removeAttr("aria-invalid");
      $("[data-mensagemCampo='tituloDocumento']").text("");
    },

    mostrarErroArquivo: function (mensagem) {
      this.elementos.$areaArquivo.addClass("areaArquivo--invalido");
      this.elementos.$campoArquivo.attr("aria-invalid", "true");
      $("[data-mensagemCampo='arquivoDocumento']").text(mensagem);
    },

    limparErroArquivo: function () {
      this.elementos.$areaArquivo.removeClass("areaArquivo--invalido");
      this.elementos.$campoArquivo.removeAttr("aria-invalid");
      $("[data-mensagemCampo='arquivoDocumento']").text("");
    },

    definirEnviando: function (enviando) {
      const e = this.elementos;
      this.estado.enviando = enviando;
      let ariaOcupado;
      if (enviando) {
        ariaOcupado = "true";
      } else {
        ariaOcupado = "false";
      }
      e.$visaoEnvio.attr("aria-busy", ariaOcupado);
      e.$indicadorEnvio.prop("hidden", !enviando);
      e.$iconeEnvio.prop("hidden", enviando);
      e.$botaoEnviar.prop("disabled", enviando || !this.estado.arquivo);
    },

    enviarDocumento: function () {
      const self = this;
      const e = this.elementos;
      const contato = this.estado.contatoAtual;
      const titulo = $.trim(e.$campoTitulo.val());

      if (this.estado.enviando || !contato) {
        return;
      }

      if (!this.estado.arquivo) {
        this.mostrarErroArquivo("Escolha um arquivo para enviar.");
        e.$visaoEnvio.find("[data-acao='escolherArquivo']").trigger("focus");
        return;
      }

      if (!titulo) {
        const mensagem = "Informe um título para o documento.";
        this.mostrarErroTitulo(mensagem);
        this.exibirAviso(mensagem, "atencao");
        e.$campoTitulo.trigger("focus");
        return;
      }

      if (!this.contratoDisponivel("enviarDocumento")) {
        this.exibirAviso(this.configuracao.textoIndisponivel, "atencao");
        return;
      }

      const dados = new FormData();
      dados.append("idContato", contato.id);
      dados.append("tipoContato", contato.tipo);
      dados.append("tituloDocumento", titulo);
      dados.append("arquivoDocumento", this.estado.arquivo);

      this.definirEnviando(true);

      this.chamarContrato("enviarDocumento", dados)
        .done(function (resposta) {
          self.definirEnviando(false);
          if (resposta && resposta.sucesso) {
            self.aoEnviarComSucesso();
          } else {
            self.exibirAviso((resposta && (resposta.mensagem || resposta.erro)) || "Não foi possível enviar o documento.", "erro");
          }
        })
        .fail(function () {
          self.definirEnviando(false);
          self.exibirAviso("Não foi possível enviar o documento.", "erro");
        });
    },

    aoEnviarComSucesso: function () {
      this.exibirAviso("Documento enviado.", "sucesso");
      this.limparFormulario();
      this.mostrarVisao("lista");

      if (this.estado.abaDocumentos !== "enviados") {
        bootstrap.Tab.getOrCreateInstance($("#abaDocumentosEnviados").get(0)).show();
      } else {
        this.carregarDocumentos("enviados");
      }
      this.elementos.$botaoAbrirEnvio.trigger("focus");
    },

    exibirAviso: function (mensagem, variacao) {
      const $aviso = this.elementos.$aviso;
      const avisos = this.configuracao.avisos;
      const atual = avisos[variacao] || avisos.erro;

      $.each(avisos, function (nome, aviso) {
        if (aviso.classe) {
          $aviso.removeClass(aviso.classe);
        }
      });
      if (atual.classe) {
        $aviso.addClass(atual.classe);
      }

      $aviso.find("[data-campo='iconeAviso']").text(atual.icone);
      $aviso.find("[data-campo='mensagemAviso']").text(mensagem);

      bootstrap.Toast.getOrCreateInstance($aviso.get(0), { delay: this.configuracao.tempoAvisoMs }).show();
    }
  };

  $(function () {
    moduloContatos.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);