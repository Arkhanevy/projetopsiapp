/* ============================================================
   RESUMO DO ARQUIVO: notificacoes.js
   O que faz: consulte a descrição de responsabilidade abaixo; este resumo
   foi acrescentado para orientar a leitura do arquivo.
   Observações: as funções podem depender de jQuery, módulos globais,
   elementos HTML e/ou respostas do backend mencionados no código.
   Inventário de objetos e funções identificados:
   - Objeto: moduloNotificacoes
   - Objeto: opcoes
   - Função/método: iniciar
   - Função/método: cachearElementos
   - Função/método: registrarEventos
   - Função/método: aoDefinirSessao
   - Função/método: exibirNaoLogado
   - Função/método: contratoDisponivel
   - Função/método: chamarContrato
   - Função/método: exibirEstadoPagina
   - Função/método: carregarNotificacoes
   - Função/método: exibirErroNotificacoes
   - Função/método: renderizarNotificacoes
   - Função/método: normalizarNotificacao
   - Função/método: valorVerdadeiro
   - Função/método: criarCardNotificacao
   - Função/método: formatarData
   - Função/método: abrirNotificacao
   - Função/método: aoFecharModal
   - Função/método: marcarComoLida
   - Função/método: atualizarCardLido
   ============================================================ */

/* ============================================================
   PÁGINA: notificacoes (cliente, clienteSimples, profissional e clínica)
   Depende de: jQuery, Bootstrap 5 (bundle), componentes.js,
               utilitarios.js (window.ElmoUtilitarios) e
               sessaoNavegacao.js (evento "sessaoNavegacaoDefinida").

   Fluxo:
   - sessaoNavegacao.js descobre quem está logado e avisa a página.
     A tela exige login: visitante deslogado vê "Entre na sua conta
     para ver suas notificações." (mesmo padrão de contatos).
   - Os cards são gerados a partir do <template id="modeloCardNotificacao">
     e preenchidos só com .text() / .attr() (nenhum dado do banco entra
     como HTML).
   - Clicar (ou Enter/Espaço) em um card abre o modalNotificacao com o
     título e a mensagem completos. Ao fechar, o foco volta ao card.
   - Abrir uma notificação não lida chama marcarNotificacaoLida; só depois
     de o servidor confirmar o card perde o selo "Nova" e a borda azul.
   - O parágrafo com o link "Minhas Consultas" está no HTML do modal
     (data-campo="blocoLinkConsultas"); o JS só mostra ou esconde o
     parágrafo (exibirLinkConsultas) e ajusta o caminho conforme o tipo
     de usuário.

   Backend NÃO é alterado por este arquivo. Os contratos abaixo ainda
   não existem (disponivel: false). Enquanto for assim, a tela mostra só
   o estado vazio (sem dados de exemplo). Para ligar um contrato: crie a
   ação no controller do papel (cliente, profissional ou clinica) e troque
   para disponivel: true (e ajuste o nome da ação, se precisar).

   Contratos (POST em index.php?uri=cliente | profissional | clinica; os
   controllers só leem $_POST["acao"]). Resposta: { sucesso, dados } ou
   { sucesso: false, erro }.

   listarNotificacoes (sem dados)
     dados: [item], da mais recente para a mais antiga
     item: {
       idNotificacao,
       tituloNotificacao,
       resumoNotificacao,
       mensagemNotificacao,   // parágrafos separados por linha em branco
       dataNotificacao,       // "AAAA-MM-DD" (pode vir com hora)
       lida,                  // true | false (ou 1 | 0)
       exibirLinkConsultas    // true | false (ou 1 | 0)
     }
     (nomes de campo propostos; ajuste aqui se o backend usar outros)

   marcarNotificacaoLida  { idNotificacao }

   Obs.: os atributos data-* em camelCase são lidos com .attr(); o .data()
   do jQuery espera a forma com hífen (data-notificacao-id).
   ============================================================ */

(function ($, Utilitarios) {
  "use strict";

  // Objeto \'moduloNotificacoes\': agrupa estado, configurações e/ou métodos deste módulo.

  var moduloNotificacoes = {

    /* ---------- Configuração ---------- */
    configuracao: {
      // Cada papel usa o controller do próprio tipo de usuário.
      // clienteSimples usa o controller de cliente (não há outro para ele).
      papeis: {
        cliente:        { url: "index.php?uri=cliente" },
        clienteSimples: { url: "index.php?uri=cliente" },
        profissional:   { url: "index.php?uri=profissional" },
        clinica:        { url: "index.php?uri=clinica" }
      },

      // Destino de "Agenda" no menu e de "Minhas Consultas" no modal
      hrefAgendaPorTipo: {
        cliente: "index.php?uri=consultasCli",
        clienteSimples: "index.php?uri=consultasCli",
        profissional: "index.php?uri=agendaProfissional",
        clinica: "index.php?uri=agendaClinica"
      },

      contratos: {
        listarNotificacoes:    { acao: "listarNotificacoes",    disponivel: false },
        marcarNotificacaoLida: { acao: "marcarNotificacaoLida", disponivel: false } // dados: idNotificacao
      },

      textos: {
        naoLogado: "Entre na sua conta para ver suas notificações.",
        erro: "Não foi possível carregar as notificações.",
        vazio: "Nenhuma notificação encontrada."
      }
    },

    /* ---------- Estado interno ---------- */
    estado: {
      papel: null,               // "cliente" | "clienteSimples" | "profissional" | "clinica" | null
      requisicaoNotificacoes: 0, // descarta respostas antigas
      notificacoes: {},          // idNotificacao -> notificação normalizada
      $cardAtual: null           // card que abriu o modal (recebe o foco ao fechar)
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
      e.$principal = $("#conteudoNotificacoes");
      e.$avisoPagina = $("#avisoNotificacoes");
      e.$estadosPagina = $("[data-estadoNotificacoes]");
      e.$textoErro = e.$estadosPagina.filter("[data-estadoNotificacoes='erro']").find(".estadoVazio_texto");
      e.$botaoTentar = $("#botaoTentarNovamenteNotificacoes");
      e.$lista = $("[data-campo='listaNotificacoes']");
      e.$modelo = $("#modeloCardNotificacao");

      e.$modal = $("#modalNotificacao");
      e.$tituloModal = e.$modal.find("[data-campo='tituloNotificacao']");
      e.$mensagemModal = e.$modal.find("[data-campo='mensagemNotificacao']");
      e.$blocoLinkConsultas = e.$modal.find("[data-campo='blocoLinkConsultas']");
    },

    // Método \'registrarEventos\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    registrarEventos: function() {
      var self = this;
      var e = this.elementos;

      // Sessão resolvida por sessaoNavegacao.js
      $(document).on("sessaoNavegacaoDefinida", function (evento, sessao) {
        self.aoDefinirSessao(sessao);
      });

      e.$botaoTentar.on("click", function () {
        self.carregarNotificacoes();
      });

      // O card é um <button>: o clique cobre também Enter e Espaço
      e.$lista.on("click", ".cardNotificacao", function () {
        self.abrirNotificacao($(this));
      });

      // Devolve o foco ao card que abriu o modal
      e.$modal.on("hidden.bs.modal", function () {
        self.aoFecharModal();
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

      // Barra superior do logado e links de agenda conforme o tipo de usuário
      $(".navTopoLogado").removeAttr("hidden");
      var hrefAgenda = configuracao.hrefAgendaPorTipo[sessao.tipoUsuario];
      if (hrefAgenda) {
        $("[data-itemAgenda]").attr("href", hrefAgenda);
        $("[data-itemMinhasConsultas]").attr("href", hrefAgenda);
      }

      if (!configuracao.papeis[sessao.tipoUsuario]) {
        // Tipo de usuário sem esta tela: não há o que listar
        this.exibirEstadoPagina("vazio");
        return;
      }

      this.estado.papel = sessao.tipoUsuario;
      this.carregarNotificacoes();
    },

    // Método \'exibirNaoLogado\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirNaoLogado: function() {
      this.exibirEstadoPagina("erro");
      this.elementos.$textoErro.text(this.configuracao.textos.naoLogado);
      this.elementos.$botaoTentar.attr("hidden", "hidden");
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

      return $.ajax({
        url: contrato.url || papel.url,
        method: "POST",
        dataType: "json",
        data: $.extend({ acao: contrato.acao }, dados || {})
      });
    },

    /* ---------- Estados da página ---------- */
    // Método \'exibirEstadoPagina\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    exibirEstadoPagina: function(nome) {
      var e = this.elementos;
      e.$estadosPagina.attr("hidden", "hidden");
      e.$estadosPagina.filter("[data-estadoNotificacoes='" + nome + "']").removeAttr("hidden");
      var ariaOcupado;
      if (nome === "carregando") {
        ariaOcupado = "true";
      } else {
        ariaOcupado = "false";
      }
      e.$principal.attr("aria-busy", ariaOcupado);

      if (nome === "vazio") {
        e.$avisoPagina.text(this.configuracao.textos.vazio);
      } else if (nome === "erro") {
        e.$avisoPagina.text("");
      }
    },

    /* ---------- Lista ---------- */
    // Método \'carregarNotificacoes\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    carregarNotificacoes: function() {
      var self = this;
      var numero = ++this.estado.requisicaoNotificacoes;

      this.elementos.$botaoTentar.removeAttr("hidden");

      if (!this.contratoDisponivel("listarNotificacoes")) {
        // Sem backend: só o estado vazio (sem dados de exemplo)
        this.renderizarNotificacoes([]);
        return;
      }

      this.exibirEstadoPagina("carregando");

      this.chamarContrato("listarNotificacoes")
        .done(function (resposta) {
          if (numero !== self.estado.requisicaoNotificacoes) {
            return;
          }
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            self.renderizarNotificacoes(resposta.dados);
          } else {
            self.exibirErroNotificacoes();
          }
        })
        .fail(function () {
          if (numero === self.estado.requisicaoNotificacoes) {
            self.exibirErroNotificacoes();
          }
        });
    },

    // Método \'exibirErroNotificacoes\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    exibirErroNotificacoes: function() {
      this.elementos.$textoErro.text(this.configuracao.textos.erro);
      this.exibirEstadoPagina("erro");
    },

    // Método \'renderizarNotificacoes\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    renderizarNotificacoes: function(itens) {
      var self = this;
      var e = this.elementos;
      var novas = 0;

      e.$lista.empty();
      this.estado.notificacoes = {};

      $.each(itens, function (posicao, item) {
        var notificacao = self.normalizarNotificacao(item);
        if (!notificacao.id) {
          return; // item sem id não pode ser aberto nem marcado como lido
        }

        self.estado.notificacoes[notificacao.id] = notificacao;
        e.$lista.append(self.criarCardNotificacao(notificacao));
        if (!notificacao.lida) {
          novas++;
        }
      });

      var total = e.$lista.children().length;
      if (!total) {
        this.exibirEstadoPagina("vazio");
        return;
      }

      this.exibirEstadoPagina("lista");
      var textoTotal;
      if (total === 1) {
        textoTotal = " notificação encontrada";
      } else {
        textoTotal = " notificações encontradas";
      }
      var textoNovas;
      if (novas) {
        var sufixoNovas;
        if (novas === 1) {
          sufixoNovas = " nova.";
        } else {
          sufixoNovas = " novas.";
        }
        textoNovas = ", " + novas + sufixoNovas;
      } else {
        textoNovas = ".";
      }
      e.$avisoPagina.text(total + textoTotal + textoNovas);
    },

    // Método \'normalizarNotificacao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    normalizarNotificacao: function(item) {
      item = item || {};
      var idNotificacao;
      if (item.idNotificacao) {
        idNotificacao = String(item.idNotificacao);
      } else {
        idNotificacao = "";
      }
      return {
        id: idNotificacao,
        titulo: String(item.tituloNotificacao || ""),
        resumo: String(item.resumoNotificacao || ""),
        mensagem: String(item.mensagemNotificacao || ""),
        data: String(item.dataNotificacao || ""),
        tipo: String(item.tipoNotificacao || ""),
        lida: this.valorVerdadeiro(item.lida),
        exibirLinkConsultas: this.valorVerdadeiro(item.exibirLinkConsultas)
      };
    },

    // Método \'valorVerdadeiro\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    valorVerdadeiro: function(valor) {
      return valor === true || valor === 1 || valor === "1" || valor === "true";
    },

    // Método \'criarCardNotificacao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    criarCardNotificacao: function(notificacao) {
      var modelo = this.elementos.$modelo.get(0);
      var $item = $(modelo.content.firstElementChild.cloneNode(true));
      var data = this.formatarData(notificacao.data);

      var valorLida;
      if (notificacao.lida) {
        valorLida = "true";
      } else {
        valorLida = "false";
      }
      $item.find(".cardNotificacao")
        .attr("data-notificacaoId", notificacao.id)
        .attr("data-lida", valorLida)
        .attr("data-tipoNotificacao", notificacao.tipo);
      $item.find("[data-campo='tituloNotificacao']").text(notificacao.titulo);
      $item.find("[data-campo='resumoNotificacao']").text(notificacao.resumo);
      $item.find("[data-campo='dataNotificacao']")
        .text(data.texto)
        .attr("datetime", data.iso);

      if (!notificacao.lida) {
        $item.find("[data-campo='seloNova']").removeAttr("hidden");
      }

      return $item;
    },

    // "AAAA-MM-DD" -> "20 de janeiro" (com o ano, se não for o ano atual).
    // Lê as partes da string para não deslocar o dia por fuso horário.
    // Método \'formatarData\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    formatarData: function(valor) {
      var partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor || ""));
      if (!partes) {
        return { texto: "", iso: "" };
      }

      var data = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
      // Objeto \'opcoes\': agrupa estado, configurações e/ou métodos deste módulo.
      var opcoes = { day: "numeric", month: "long" };
      if (data.getFullYear() !== new Date().getFullYear()) {
        opcoes.year = "numeric";
      }

      return {
        texto: data.toLocaleDateString("pt-BR", opcoes),
        iso: partes[1] + "-" + partes[2] + "-" + partes[3]
      };
    },

    /* ---------- Modal: abrir, marcar como lida e fechar ---------- */
    // Método \'abrirNotificacao\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.
    abrirNotificacao: function($card) {
      var e = this.elementos;
      var id = $card.attr("data-notificacaoId");
      var notificacao = this.estado.notificacoes[id];

      if (!notificacao) {
        return;
      }

      this.estado.$cardAtual = $card;

      e.$tituloModal.text(notificacao.titulo);
      // A mensagem completa usa as quebras de linha (white-space: pre-line no CSS)
      e.$mensagemModal.text(notificacao.mensagem || notificacao.resumo);

      if (notificacao.exibirLinkConsultas) {
        e.$blocoLinkConsultas.removeAttr("hidden");
      } else {
        e.$blocoLinkConsultas.attr("hidden", "hidden");
      }

      Utilitarios.exibirModal(e.$modal);
      this.marcarComoLida(notificacao.id);
    },

    // Método \'aoFecharModal\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    aoFecharModal: function() {
      var $card = this.estado.$cardAtual;
      this.estado.$cardAtual = null;

      if ($card && $card.length && $.contains(document.documentElement, $card.get(0))) {
        $card.trigger("focus");
      }
    },

    // Método \'marcarComoLida\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    marcarComoLida: function(id) {
      var self = this;
      var notificacao = this.estado.notificacoes[id];

      if (!notificacao || notificacao.lida || !this.contratoDisponivel("marcarNotificacaoLida")) {
        return;
      }

      // Só atualiza a tela depois de o servidor confirmar; se falhar, a
      // notificação continua "Nova" e será marcada de novo na próxima abertura.
      this.chamarContrato("marcarNotificacaoLida", { idNotificacao: id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            notificacao.lida = true;
            self.atualizarCardLido(id);
          }
        });
    },

    // Método \'atualizarCardLido\': executa a responsabilidade indicada pelo nome; detalhes estão no corpo.

    atualizarCardLido: function(id) {
      var $card = this.elementos.$lista.find(".cardNotificacao").filter(function () {
        return $(this).attr("data-notificacaoId") === String(id);
      });

      $card.attr("data-lida", "true");
      $card.find("[data-campo='seloNova']").attr("hidden", "hidden");
    }
  };

  $(function () {
    moduloNotificacoes.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
