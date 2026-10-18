/* ============================================================
   RESUMO DO ARQUIVO: contatos.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloContatos
   - Objeto: pedido
   - Objeto: dados
   - Objeto: formato
   - Função/método: iniciar
   - Função/método: cachearElementos
   - Função/método: registrarEventos
   - Função/método: registrarArrastar
   - Função/método: aoDefinirSessao
   - Função/método: exibirNaoLogado
   - Função/método: aplicarTextosPapel
   - Função/método: contratoDisponivel
   - Função/método: chamarContrato
   - Função/método: exibirEstadoPagina
   - Função/método: carregarContatos
   - Função/método: normalizarContatos
   - Função/método: exibirErroContatos
   - Função/método: renderizarContatos
   - Função/método: criarItemContato
   - Função/método: fotoValida
   - Função/método: aoAbrirModal
   - Função/método: aoFecharModal
   - Função/método: mostrarVisao
   - Função/método: $listaDocumentos
   - Função/método: $vazioDocumentos
   - Função/método: limparListasDocumentos
   - Função/método: exibirEstadoDocumentos
   - Função/método: carregarDocumentos
   - Função/método: respostaDocumentosAtual
   - Função/método: renderizarDocumentos
   - Função/método: baixarDocumento
   - Função/método: abrirEnvio
   - Função/método: voltarParaLista
   - Função/método: limparFormulario
   - Função/método: atualizarEstadoArea
   - Função/método: selecionarArquivo
   - Função/método: nomeSemExtensao
   - Função/método: validarArquivo
   - Função/método: formatarTamanho
   - Função/método: mostrarErroTitulo
   - Função/método: limparErroTitulo
   - Função/método: mostrarErroArquivo
   - Função/método: limparErroArquivo
   - Função/método: definirEnviando
   - Função/método: enviarDocumento
   - Função/método: aoEnviarComSucesso
   - Função/método: exibirAviso
   ============================================================ */

/* ============================================================
   PÁGINA: contatos (cliente e profissional)
   Depende de: jQuery, Bootstrap 5 (bundle), componentes.js,
               utilitarios.js (window.ElmoUtilitarios) e
               sessaoNavegacao.js (evento "sessaoNavegacaoDefinida").

   Fluxo:
   - sessaoNavegacao.js descobre quem está logado e avisa a página.
     Cada papel vê um conjunto de seções (config.papeis[...].secoes):
       cliente e clienteSimples: Profissionais + Clínicas
       profissional:             Clientes + Clínicas
       clínica:                  Profissionais + Clientes
     Profissionais e clientes têm o botão "Documento"; clínicas não.
     O clienteSimples não vê telefones (nem o dele).
   - O botão "Documento" de cada contato abre o modalDocumentos, com
     as abas Enviados/Recebidos (cada uma consulta o seu contrato ao ser
     aberta) e a visão de envio (título + arquivo).
   - O título do documento é preenchido sozinho com o nome do arquivo
     escolhido (sem a extensão) e pode ser editado. Se o usuário já
     mudou o título, escolher outro arquivo não o sobrescreve.

   Backend NÃO é alterado por este arquivo. A lista de contatos usa a
   ação "contato", que já existe nos controllers. Os contratos de
   documentos ainda não existem (disponivel: false): enquanto for assim,
   a lista de documentos mostra só o estado vazio e as ações de envio e
   download avisam que ainda não estão disponíveis.

   Contratos (POST em index.php?uri=...; os controllers só leem
   $_POST["acao"]). Resposta: { sucesso, ... } ou { sucesso: false,
   mensagem }.

   listarContatos -> acao "contato" (sem dados)
     A requisição é "invertida": cada papel chama o controller que
     devolve a lista de que ele precisa (o id vem de $_SESSION no servidor).
       cliente / clienteSimples -> uri=profissional
           dados1: profissionais, dados2: clínicas
       profissional             -> uri=cliente
           dados1: clientes,      dados2: clínicas
       clinica                  -> uri=clinica
           dados1: profissionais  (não há ação para clientes da clínica)
     Campos do item (o backend não envia *_user nem *_foto):
       profissional: pro_id, pro_nome, pro_tel
       cliente:      cli_id, cli_nome, cli_tel
       clínica:      clin_id, clin_nome, clin_tel

   listarDocumentos  { idContato, tipoContato, tipo }
     tipoContato: "profissional" | "cliente" | "clinica"
     tipo: "enviados" | "recebidos"
     dados: [{ idDocumento, tituloDocumento, remetente, destinatario }]

   enviarDocumento (FormData, multipart)
     { idContato, tipoContato, tituloDocumento, arquivoDocumento }

   baixarDocumento  { idDocumento }
     o servidor responde com o arquivo (download)

   Regras de arquivo (tipos permitidos e tamanho máximo) ainda não foram
   definidas: ficam em data-tiposPermitidos (lista separada por vírgula,
   ex.: ".pdf,.jpg") e data-tamanhoMaximoMb da área do arquivo. Vazios =
   sem validação no navegador.

   Obs.: os atributos data-* em camelCase são lidos com .attr(); o .data()
   do jQuery espera a forma com hífen (data-id-contato).
   ============================================================ */

(function ($, Utilitarios) {
  "use strict";

  // Objeto \'moduloContatos\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloContatos = {

    /* ---------- Configuração ---------- */
    configuracao: {
      tempoAvisoMs: 5000,
      textoIndisponivel: "Essa ação ainda não está disponível no servidor.",

      // Seções de contatos (ordem da tela). Clínicas não têm o botão "Documento".
      secoes: {
        profissionais: { prefixo: "pro",  tipo: "profissional", comDocumento: true,  campoLista: "listaContatosProfissionais" },
        clientes:      { prefixo: "cli",  tipo: "cliente",      comDocumento: true,  campoLista: "listaContatosClientes" },
        clinicas:      { prefixo: "clin", tipo: "clinica",      comDocumento: false, campoLista: "listaContatosClinicas" }
      },

      // A ação "contato" é "invertida": o cliente consulta o controller de profissional
      // (que devolve profissionais e clínicas) e o profissional consulta o de cliente.
      // "listas" liga cada campo da resposta (dados1, dados2) à seção da tela.
      // clienteSimples usa o mesmo caminho do cliente (não há outro para ele).
      papeis: {
        cliente: {
          url: "index.php?uri=profissional",
          listas: { dados1: "profissionais", dados2: "clinicas" },
          secoes: ["profissionais", "clinicas"],
          apoio: "clínicas e profissionais",
          mostrarTelefone: true
        },
        clienteSimples: {
          url: "index.php?uri=profissional",
          listas: { dados1: "profissionais", dados2: "clinicas" },
          secoes: ["profissionais", "clinicas"],
          apoio: "clínicas e profissionais",
          mostrarTelefone: false
        },
        profissional: {
          url: "index.php?uri=cliente",
          listas: { dados1: "clientes", dados2: "clinicas" },
          secoes: ["clientes", "clinicas"],
          apoio: "clínicas e clientes",
          mostrarTelefone: true
        },
        clinica: {
          url: "index.php?uri=clinica",
          listas: { dados1: "profissionais" }, // o backend não devolve clientes da clínica
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
        listarContatos:   { acao: "contato",          disponivel: true  }, // resposta: dados1, dados2
        listarDocumentos: { acao: "listarDocumentos", disponivel: false }, // dados: idContato, tipoContato, tipo
        enviarDocumento:  { acao: "enviarDocumento",  disponivel: false }, // FormData
        baixarDocumento:  { acao: "baixarDocumento",  disponivel: false }  // dados: idDocumento
      },

      // Aviso flutuante: ícone de cada variação (a classe avisoFlutuante--<variação> vem do CSS)
      avisos: {
        erro:    { icone: "error",        classe: "" },
        atencao: { icone: "warning",      classe: "avisoFlutuante--atencao" },
        sucesso: { icone: "check_circle", classe: "avisoFlutuante--sucesso" }
      },

      // Texto do campo "tipo" das listas de documentos
      listasDocumentos: {
        enviados:  "listaDocumentosEnviados",
        recebidos: "listaDocumentosRecebidos"
      }
    },

    /* ---------- Estado interno ---------- */
    estado: {
      papel: null,                // "cliente" | "clienteSimples" | "profissional" | "clinica" | null
      requisicaoContatos: 0,      // descarta respostas antigas
      contatoAtual: null,         // { id, tipo, usuario } do contato do modal aberto
      modalAberto: false,
      abaDocumentos: "enviados",
      requisicoesDocumentos: {},  // tipo -> número da última requisição
      arquivo: null,              // File escolhido ou solto
      tituloAutomatico: "",       // último título gerado a partir do nome do arquivo
      enviando: false
    },

    elementos: {},

    // Método \'iniciar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    iniciar: function() {
      this.cachearElementos();
      this.registrarEventos();
    },

    // Método \'cachearElementos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    cachearElementos: function() {
      var e = this.elementos;
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

    // Método \'registrarEventos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    registrarEventos: function() {
      var self = this;
      var e = this.elementos;

      // Sessão resolvida por sessaoNavegacao.js
      $(document).on("sessaoNavegacaoDefinida", function (evento, sessao) {
        self.aoDefinirSessao(sessao);
      });

      e.$botaoTentarContatos.on("click", function () {
        self.carregarContatos();
      });

      // Modal
      e.$modal.on("show.bs.modal", function (evento) {
        self.aoAbrirModal(evento);
      });
      e.$modal.on("shown.bs.modal", function () {
        self.carregarDocumentos(self.estado.abaDocumentos);
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

      // Envio
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
        var arquivos = this.files;
        if (arquivos && arquivos.length) {
          self.selecionarArquivo(arquivos[0]);
        }
        this.value = ""; // permite escolher o mesmo arquivo de novo
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

    // Método \'registrarArrastar\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    registrarArrastar: function() {
      var self = this;
      var $area = this.elementos.$areaArquivo;

      $area.on("dragenter dragover", function (evento) {
        evento.preventDefault();
        if (!self.estado.enviando) {
          $area.attr("data-estadoArea", "arrastando");
        }
      });

      $area.on("dragleave", function (evento) {
        // Ignora o dragleave ao passar sobre os filhos da própria área
        var destino = evento.originalEvent && evento.originalEvent.relatedTarget;
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

        var transferencia = evento.originalEvent && evento.originalEvent.dataTransfer;
        var arquivos = transferencia && transferencia.files;
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

    /* ---------- Sessão e navegação ---------- */
    // Método \'aoDefinirSessao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    aoDefinirSessao: function(sessao) {
      var configuracao = this.configuracao;

      if (!sessao || !sessao.logado) {
        this.exibirNaoLogado();
        return;
      }

      // Barra superior do logado e link da agenda conforme o tipo de usuário
      $(".navTopoLogado").removeAttr("hidden");
      if (configuracao.hrefAgendaPorTipo[sessao.tipoUsuario]) {
        $("[data-itemAgenda]").attr("href", configuracao.hrefAgendaPorTipo[sessao.tipoUsuario]);
      }

      if (!configuracao.papeis[sessao.tipoUsuario]) {
        // Tipo de usuário sem esta tela: não há o que listar
        this.exibirEstadoPagina("vazio");
        return;
      }

      this.estado.papel = sessao.tipoUsuario;
      this.aplicarTextosPapel(sessao.tipoUsuario);
      this.carregarContatos();
    },

    // Método \'exibirNaoLogado\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirNaoLogado: function() {
      this.exibirEstadoPagina("erro");
      this.elementos.$estadosPagina.filter("[data-estadoContatos='erro']")
        .find(".estadoVazio_texto").text("Entre na sua conta para ver seus contatos.");
      this.elementos.$botaoTentarContatos.attr("hidden", "hidden");
    },

    // Método \'aplicarTextosPapel\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    aplicarTextosPapel: function(papel) {
      var config = this.configuracao.papeis[papel];
      $("[data-campo='tiposContatoApoio']").text(config.apoio);
    },

    /* ---------- Contratos ---------- */
    // Método \'contratoDisponivel\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    contratoDisponivel: function(nome) {
      if (this.configuracao.contratos[nome].disponivel) {
        return true;
      } else {
        return false;
      }
    },

    // Método \'chamarContrato\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    chamarContrato: function(nome, dados) {
      var contrato = this.configuracao.contratos[nome];
      var papel = this.configuracao.papeis[this.estado.papel];
      // Objeto \'pedido\': agrupa estado, configurações e/ou métodos deste módulo.
      var pedido = {
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

    /* ---------- Contatos ---------- */
    // Método \'exibirEstadoPagina\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    exibirEstadoPagina: function(nome) {
      var e = this.elementos;
      e.$estadosPagina.attr("hidden", "hidden");
      e.$estadosPagina.filter("[data-estadoContatos='" + nome + "']").removeAttr("hidden");
      var ariaOcupado;
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

    // Método \'carregarContatos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    carregarContatos: function() {
      var self = this;
      var numero = ++this.estado.requisicaoContatos;

      this.elementos.$botaoTentarContatos.removeAttr("hidden");

      if (!this.contratoDisponivel("listarContatos")) {
        // Sem backend: só o estado vazio (sem dados de exemplo)
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

    // Converte { dados1, dados2 } do servidor em { profissionais, clientes, clinicas }
    // Método \'normalizarContatos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    normalizarContatos: function(resposta) {
      var mapa = this.configuracao.papeis[this.estado.papel].listas;
      // Objeto \'dados\': agrupa estado, configurações e/ou métodos deste módulo.
      var dados = {};

      $.each(mapa, function (campoServidor, nomeSecao) {
        if (Array.isArray(resposta[campoServidor])) {
          dados[nomeSecao] = resposta[campoServidor];
        } else {
          dados[nomeSecao] = [];
        }
      });

      return dados;
    },

    // Método \'exibirErroContatos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirErroContatos: function() {
      this.elementos.$estadosPagina.filter("[data-estadoContatos='erro']")
        .find(".estadoVazio_texto").text("Não foi possível carregar os contatos.");
      this.exibirEstadoPagina("erro");
    },

    // Método \'renderizarContatos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    renderizarContatos: function(dados) {
      var e = this.elementos;
      var configuracao = this.configuracao;
      var papel = configuracao.papeis[this.estado.papel];
      var self = this;
      var total = 0;

      e.$secoes.attr("hidden", "hidden");

      // Só as seções do papel; as demais listas que o servidor mandar são ignoradas
      $.each(papel.secoes, function (indice, nomeSecao) {
        var secao = configuracao.secoes[nomeSecao];
        var itens;
        if (Array.isArray(dados[nomeSecao])) {
          itens = dados[nomeSecao];
        } else {
          itens = [];
        }
        var $lista = $("[data-campo='" + secao.campoLista + "']").empty();

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
      var sufixoTotal;
      if (total === 1) {
        sufixoTotal = " contato encontrado.";
      } else {
        sufixoTotal = " contatos encontrados.";
      }
      e.$avisoPagina.text(total + sufixoTotal);
    },

    // Método \'criarItemContato\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    criarItemContato: function(item, secao, papel) {
      var modelo = this.elementos.$modeloContato.get(0);
      var $item = $(modelo.content.firstElementChild.cloneNode(true));
      var prefixo = secao.prefixo;
      var usuario = item[prefixo + "_user"] || item[prefixo + "_nome"] || "";
      var foto = this.fotoValida(item[prefixo + "_foto"]);

      $item.find("[data-idContato]")
        .attr("data-idContato", item[prefixo + "_id"])
        .attr("data-tipoContato", secao.tipo);
      $item.find("[data-campo='usuarioContato']").text(usuario);

      // clienteSimples não vê telefones
      var $telefone = $item.find("[data-campo='telefoneContato']");
      if (papel.mostrarTelefone) {
        $telefone.text(Utilitarios.formatarMascara("telefone", item[prefixo + "_tel"]));
      } else {
        $telefone.remove();
      }

      var $icone = $item.find("[data-campo='iconePadraoContato']");
      var nomeIcone;
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

    // Método \'fotoValida\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    fotoValida: function(foto) {
      if (/\.(jpe?g|png|gif|webp)$/i.test(String(foto || ""))) {
        return foto;
      } else {
        return undefined;
      }
    },

    /* ---------- Modal: abrir e fechar ---------- */
    // Método \'aoAbrirModal\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    aoAbrirModal: function(evento) {
      var $botao = $(evento.relatedTarget);
      var $contato = $botao.closest("[data-idContato]");

      this.estado.contatoAtual = {
        id: $contato.attr("data-idContato"),
        tipo: $contato.attr("data-tipoContato"),
        usuario: $contato.find("[data-campo='usuarioContato']").text()
      };
      this.estado.modalAberto = true;

      $("[data-campo='usuarioContatoModal']").text(this.estado.contatoAtual.usuario);
      this.mostrarVisao("lista");
    },

    // Método \'aoFecharModal\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    aoFecharModal: function() {
      this.estado.modalAberto = false;
      this.estado.contatoAtual = null;
      this.estado.requisicoesDocumentos = {};
      this.limparFormulario();
      this.limparListasDocumentos();

      // A próxima abertura sempre começa na aba Enviados
      this.estado.abaDocumentos = "enviados";
      bootstrap.Tab.getOrCreateInstance($("#abaDocumentosEnviados").get(0)).show();
    },

    // Método \'mostrarVisao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mostrarVisao: function(visao) {
      var e = this.elementos;
      e.$visaoLista.prop("hidden", visao !== "lista");
      e.$visaoEnvio.prop("hidden", visao !== "envio");
    },

    /* ---------- Documentos (listas) ---------- */
    // Método \'$listaDocumentos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    $listaDocumentos: function(tipo) {
      return $("[data-campo='" + this.configuracao.listasDocumentos[tipo] + "']");
    },

    // Método \'$vazioDocumentos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    $vazioDocumentos: function(tipo) {
      return $("[data-estadoVazioDocumentos='" + tipo + "']");
    },

    // Método \'limparListasDocumentos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    limparListasDocumentos: function() {
      var self = this;
      $.each(this.configuracao.listasDocumentos, function (tipo) {
        self.$listaDocumentos(tipo).empty();
        self.$vazioDocumentos(tipo).attr("hidden", "hidden");
      });
      this.exibirEstadoDocumentos(null);
    },

    // Método \'exibirEstadoDocumentos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirEstadoDocumentos: function(nome) {
      this.elementos.$estadosDocumentos.attr("hidden", "hidden");
      if (nome) {
        this.elementos.$estadosDocumentos.filter("[data-estadoDocumentos='" + nome + "']").removeAttr("hidden");
      }
    },

    // Método \'carregarDocumentos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    carregarDocumentos: function(tipo) {
      var self = this;
      var contato = this.estado.contatoAtual;
      if (!contato) {
        return;
      }

      var numero = (this.estado.requisicoesDocumentos[tipo] || 0) + 1;
      this.estado.requisicoesDocumentos[tipo] = numero;

      this.$listaDocumentos(tipo).empty();
      this.$vazioDocumentos(tipo).attr("hidden", "hidden");

      if (!this.contratoDisponivel("listarDocumentos")) {
        // Sem backend: só o estado vazio da aba
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

    // Descarta respostas de uma aba/contato que já não está em uso
    // Método \'respostaDocumentosAtual\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    respostaDocumentosAtual: function(tipo, numero, contato) {
      return this.estado.modalAberto
        && this.estado.contatoAtual
        && this.estado.contatoAtual.id === contato.id
        && this.estado.requisicoesDocumentos[tipo] === numero;
    },

    // Método \'renderizarDocumentos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    renderizarDocumentos: function(tipo, itens) {
      var $lista = this.$listaDocumentos(tipo);
      var modelo = this.elementos.$modeloDocumento.get(0);

      $lista.empty();

      if (!itens.length) {
        this.$vazioDocumentos(tipo).removeAttr("hidden");
        return;
      }

      $.each(itens, function (indice, item) {
        var $item = $(modelo.content.firstElementChild.cloneNode(true));
        $item.find("[data-idDocumento]").attr("data-idDocumento", item.idDocumento);
        $item.find("[data-campo='tituloDocumento']").text(item.tituloDocumento || "");
        $item.find("[data-campo='remetenteDocumento']").text(item.remetente || "");
        $item.find("[data-campo='destinatarioDocumento']").text(item.destinatario || "");
        $item.find("[data-acao='baixarDocumento']")
          .attr("aria-label", "Baixar " + (item.tituloDocumento || "documento"));
        $lista.append($item);
      });
    },

    // Método \'baixarDocumento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    baixarDocumento: function(idDocumento) {
      if (!idDocumento) {
        return;
      }
      if (!this.contratoDisponivel("baixarDocumento")) {
        this.exibirAviso(this.configuracao.textoIndisponivel, "atencao");
        return;
      }

      // O controller só lê $_POST: um formulário temporário faz o navegador baixar o arquivo
      var contrato = this.configuracao.contratos.baixarDocumento;
      var papel = this.configuracao.papeis[this.estado.papel];
      var $formulario = $("<form>", {
        method: "POST",
        action: contrato.url || papel.url,
        target: "_self"
      });
      $formulario.append($("<input>", { type: "hidden", name: "acao", value: contrato.acao }));
      $formulario.append($("<input>", { type: "hidden", name: "idDocumento", value: idDocumento }));
      $formulario.appendTo(document.body).trigger("submit");
      $formulario.remove();
    },

    /* ---------- Envio de documento ---------- */
    // Método \'abrirEnvio\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    abrirEnvio: function() {
      this.limparFormulario();
      this.mostrarVisao("envio");
      this.elementos.$campoTitulo.trigger("focus");
    },

    // Método \'voltarParaLista\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    voltarParaLista: function() {
      if (this.estado.enviando) {
        return;
      }
      this.limparFormulario();
      this.mostrarVisao("lista");
      this.elementos.$botaoAbrirEnvio.trigger("focus");
    },

    // Método \'limparFormulario\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    limparFormulario: function() {
      var e = this.elementos;

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

    // Método \'atualizarEstadoArea\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    atualizarEstadoArea: function() {
      var estadoArea;
      if (this.estado.arquivo) {
        estadoArea = "selecionado";
      } else {
        estadoArea = "vazio";
      }
      this.elementos.$areaArquivo.attr("data-estadoArea", estadoArea);
    },

    // Método \'selecionarArquivo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    selecionarArquivo: function(arquivo) {
      var e = this.elementos;
      var erro = this.validarArquivo(arquivo);

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

      // O título acompanha o nome do arquivo, a não ser que o usuário já o tenha editado
      var tituloAtual = $.trim(e.$campoTitulo.val());
      if (tituloAtual === "" || tituloAtual === this.estado.tituloAutomatico) {
        var novoTitulo = this.nomeSemExtensao(arquivo.name);
        e.$campoTitulo.val(novoTitulo);
        this.estado.tituloAutomatico = novoTitulo;
        this.limparErroTitulo();
      }
    },

    // Método \'nomeSemExtensao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    nomeSemExtensao: function(nome) {
      var semExtensao = nome.replace(/\.[^.]+$/, "");
      if ($.trim(semExtensao) !== "") {
        return semExtensao;
      } else {
        return nome;
      }
    },

    // Regras ainda não definidas: sem data-tiposPermitidos/data-tamanhoMaximoMb não valida nada
    // Método \'validarArquivo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    validarArquivo: function(arquivo) {
      var $area = this.elementos.$areaArquivo;
      var tipos = $.trim($area.attr("data-tiposPermitidos") || "");
      var tamanhoMaximoMb = parseFloat($area.attr("data-tamanhoMaximoMb"));

      if (tipos) {
        var nome = arquivo.name.toLowerCase();
        var permitido = false;
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

    // Método \'formatarTamanho\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    formatarTamanho: function(bytes) {
      // Objeto \'formato\': agrupa estado, configurações e/ou métodos deste módulo.
      var formato = { maximumFractionDigits: 1 };
      if (bytes < 1024) {
        return bytes + " B";
      }
      if (bytes < 1024 * 1024) {
        return (bytes / 1024).toLocaleString("pt-BR", formato) + " KB";
      }
      return (bytes / (1024 * 1024)).toLocaleString("pt-BR", formato) + " MB";
    },

    /* ---------- Validação e erros do formulário ---------- */
    // Método \'mostrarErroTitulo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    mostrarErroTitulo: function(mensagem) {
      this.elementos.$campoTitulo.addClass("is-invalid").attr("aria-invalid", "true");
      $("[data-mensagemCampo='tituloDocumento']").text(mensagem);
    },

    // Método \'limparErroTitulo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    limparErroTitulo: function() {
      this.elementos.$campoTitulo.removeClass("is-invalid").removeAttr("aria-invalid");
      $("[data-mensagemCampo='tituloDocumento']").text("");
    },

    // Método \'mostrarErroArquivo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    mostrarErroArquivo: function(mensagem) {
      this.elementos.$areaArquivo.addClass("areaArquivo--invalido");
      this.elementos.$campoArquivo.attr("aria-invalid", "true");
      $("[data-mensagemCampo='arquivoDocumento']").text(mensagem);
    },

    // Método \'limparErroArquivo\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    limparErroArquivo: function() {
      this.elementos.$areaArquivo.removeClass("areaArquivo--invalido");
      this.elementos.$campoArquivo.removeAttr("aria-invalid");
      $("[data-mensagemCampo='arquivoDocumento']").text("");
    },

    // Método \'definirEnviando\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    definirEnviando: function(enviando) {
      var e = this.elementos;
      this.estado.enviando = enviando;
      var ariaOcupado;
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

    // Método \'enviarDocumento\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    enviarDocumento: function() {
      var self = this;
      var e = this.elementos;
      var contato = this.estado.contatoAtual;
      var titulo = $.trim(e.$campoTitulo.val());

      if (this.estado.enviando || !contato) {
        return;
      }

      if (!this.estado.arquivo) {
        this.mostrarErroArquivo("Escolha um arquivo para enviar.");
        e.$visaoEnvio.find("[data-acao='escolherArquivo']").trigger("focus");
        return;
      }

      if (!titulo) {
        var mensagem = "Informe um título para o documento.";
        this.mostrarErroTitulo(mensagem);
        this.exibirAviso(mensagem, "atencao");
        e.$campoTitulo.trigger("focus");
        return;
      }

      if (!this.contratoDisponivel("enviarDocumento")) {
        this.exibirAviso(this.configuracao.textoIndisponivel, "atencao");
        return;
      }

      var dados = new FormData();
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

    // Método \'aoEnviarComSucesso\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    aoEnviarComSucesso: function() {
      this.exibirAviso("Documento enviado.", "sucesso");
      this.limparFormulario();
      this.mostrarVisao("lista");

      // Mostra o documento novo na aba Enviados
      if (this.estado.abaDocumentos !== "enviados") {
        bootstrap.Tab.getOrCreateInstance($("#abaDocumentosEnviados").get(0)).show(); // recarrega pelo evento da aba
      } else {
        this.carregarDocumentos("enviados");
      }
      this.elementos.$botaoAbrirEnvio.trigger("focus");
    },

    /* ---------- Aviso flutuante (toast) ---------- */
    // Método \'exibirAviso\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    exibirAviso: function(mensagem, variacao) {
      var $aviso = this.elementos.$aviso;
      var avisos = this.configuracao.avisos;
      var atual = avisos[variacao] || avisos.erro;

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
