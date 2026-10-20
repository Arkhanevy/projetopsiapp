/* ============================================================
   ARQUIVO: resultadosBusca.js

   O QUE FAZ
   Tela de resultados da busca: lê o termo da URL, consulta o backend por aba
   (Serviços, Profissionais, Clínicas), aplica filtros, mostra os cards,
   completa o endereço das clínicas pelo CEP (ViaCEP) e mantém aba, termo e
   filtros no histórico do navegador.

   OBSERVAÇÕES
   - Depende de jQuery, Bootstrap, componentes.js, ElmoUtilitarios,
     sessaoNavegacao.js e buscaComum.js (window.ElmoBusca).
   - Cada aba só carrega ao ser aberta ou quando termo/filtros mudam
     (carregadoPara evita repetir); estado.requisicoes descarta respostas
     antigas.
   - O backend só filtra por termo. O filtro tipoServico é aplicado no
     navegador sobre ser_tipo; preço, cidade e local estão escondidos no HTML
     até o backend suportar.
   - Cada card de clínica faz uma consulta de detalhes (para obter o CEP) e
     depois uma ao ViaCEP: muitas requisições; há cache para CEP e detalhes
     repetidos.
   - O mapeamento de serviços lê ser_foto, campo que não consta na lista de
     campos documentada no topo.
   - O ViaCEP é chamado via JSONP, com tempo limite de 8 s.
   - fotoValida() e formatarPreco() também existem (iguais ou parecidos) em
     contatos.js e infoServico.js.
   - Atributos data-* em camelCase são lidos com .attr(); o .data() do jQuery
     esperaria a forma com hífen.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery,
     ElmoUtilitarios e ElmoBusca.
     - moduloResultados (objeto) — Módulo da página de resultados.
       - moduloResultados.configuracao — URLs de perfil, serviço e ViaCEP,
         filtros aceitos e contratos de backend.
         - configuracao.contratos — Rota e ação da busca e dos detalhes
           (buscacontroller.php).
       - moduloResultados.abas — Dados de cada aba: tipo no backend, elementos
         do HTML, textos e conversão do item do backend.
         - abas.servicos — Aba Serviços.
           - abas.servicos.mapear() — Converte um serviço do backend nos dados
             do card (nome, preço, foto, link de detalhes).
         - abas.profissionais — Aba Profissionais.
           - abas.profissionais.mapear() — Converte um profissional do backend
             nos dados do card (nome, foto, link do perfil).
         - abas.clinicas — Aba Clínicas.
           - abas.clinicas.mapear() — Converte uma clínica do backend nos
             dados do card (nome, foto, link do perfil e endereço provisório).
       - moduloResultados.estado — Termo, aba ativa, filtros, controle de
         cargas e caches de endereços e detalhes.
       - moduloResultados.elementos — Cache dos elementos jQuery da página.
       - moduloResultados.iniciar() — Guarda os elementos, configura a
         navegação, registra eventos e restaura a busca.
       - moduloResultados.cachearElementos() — Busca no DOM conteúdo, campo,
         filtros, abas e estados.
       - moduloResultados.registrarEventos() — Liga pesquisa, troca de aba,
         filtros, tentar novamente e voltar/avançar do navegador.
       - moduloResultados.restaurarBusca() — Lê termo (URL), aba e filtros
         (history.state), atualiza a tela e carrega a aba ativa.
       - moduloResultados.filtrosValidos() — Aceita só filtros conhecidos com
         valor em texto.
       - moduloResultados.salvarBusca() — Grava termo, aba e filtros na URL e
         no history.state (nova entrada ou substituindo a atual).
       - moduloResultados.pesquisar() — Valida o termo; se vazio avisa, senão
         salva e recarrega a aba ativa.
       - moduloResultados.aoTrocarAba() — Ao trocar de aba, atualiza a tela,
         salva o estado e carrega os resultados.
       - moduloResultados.mostrarAbaAtiva() — Abre a aba guardada se ela ainda
         não for a ativa.
       - moduloResultados.atualizarTelaDaAba() — Ajusta o placeholder do campo
         e os grupos de filtro conforme a aba.
       - moduloResultados.coletarFiltros() — Lê os valores do painel de
         filtros.
       - moduloResultados.aplicarFiltrosNaTela() — Preenche o painel com os
         filtros guardados no estado.
       - moduloResultados.filtrosDaAba() — Devolve só os filtros válidos para
         a aba.
       - moduloResultados.aplicarFiltros() — Guarda os filtros, fecha o
         painel, salva a busca e recarrega a aba.
       - moduloResultados.limparFiltros() — Remove todos os filtros e limpa o
         painel.
       - moduloResultados.fecharPainelFiltros() — Fecha o dropdown de filtros
         e devolve o foco ao botão.
       - moduloResultados.chamarContrato() — Faz o POST do contrato (acao +
         dados) ao backend.
       - moduloResultados.carregarAba() — Busca os resultados da aba (evita
         repetir a mesma consulta), trata carregando, erro e respostas
         antigas.
       - moduloResultados.aplicarFiltrosLocais() — Aplica no navegador os
         filtros que o backend não faz (tipo de serviço).
       - moduloResultados.fotoValida() — Aceita a foto só se parecer arquivo
         de imagem; senão devolve undefined.
       - moduloResultados.$listaDaAba() — Devolve a lista de cards da aba.
       - moduloResultados.$vazioDaAba() — Devolve o bloco de 'nenhum
         resultado' da aba.
       - moduloResultados.exibirSemTermo() — Limpa a aba e mostra o aviso de
         busca vazia, sem exibir 'nenhum resultado'.
       - moduloResultados.mostrarAvisoBusca() — Mostra o aviso de pesquisa
         vazia e, se pedido, foca o campo.
       - moduloResultados.esconderAvisoBusca() — Esconde o aviso de pesquisa
         vazia.
       - moduloResultados.exibirCarregando() — Limpa a aba e mostra o estado
         de carregamento.
       - moduloResultados.exibirErro() — Mostra o estado de erro e libera nova
         tentativa.
       - moduloResultados.exibirResultados() — Monta os cards, mostra ou
         esconde o 'nenhum resultado' e anuncia o total.
       - moduloResultados.mensagemDeResultados() — Monta a frase com a
         quantidade de resultados (ou 'nenhum').
       - moduloResultados.anunciar() — Escreve a mensagem na região de status
         para leitores de tela.
       - moduloResultados.montarCard() — Clona o modelo da aba, preenche os
         campos, configura o link e, para clínicas, busca o endereço.
       - moduloResultados.apenasComValor() — Remove valores vazios para não
         sobrescrever o texto do modelo com 'undefined'.
       - moduloResultados.configurarLink() — Define o link do card (só com id
         numérico) e seu aria-label.
       - moduloResultados.montarLink() — Monta uma URL com parâmetros
         codificados.
       - moduloResultados.formatarPreco() — Formata o valor como moeda
         brasileira (vazio se inválido).
       - moduloResultados.obterDetalhesClinica() — Busca os detalhes da
         clínica (para obter o CEP) com cache de promessas.
       - moduloResultados.preencherEndereco() — Preenche CEP e endereço do
         card a partir dos detalhes e do ViaCEP.
       - moduloResultados.buscarEnderecoPorCep() — Consulta o ViaCEP (JSONP)
         com cache e tempo limite; CEPs repetidos reaproveitam a consulta.
       - moduloResultados.textoEndereco() — Monta 'rua, UF' a partir do
         ViaCEP.
     - Callback do document ready — Executa moduloResultados.iniciar() quando
       o DOM estiver pronto.
   ============================================================ */

/* ============================================================
   PÁGINA: resultadosBusca (abas, filtros e cards)
   Depende de: jQuery, Bootstrap 5 (bundle), componentes.js,
               utilitarios.js (window.ElmoUtilitarios),
               sessaoNavegacao.js e buscaComum.js (window.ElmoBusca).

   Fluxo:
   - O termo chega por ?termo=... (vem da busca ou da home).
   - A aba ativa e os filtros ficam em history.state, então voltar ou
     recarregar a página mantém a busca.
   - Cada aba (Serviços, Profissionais, Clínicas) consulta o seu contrato
     e só carrega quando é aberta (ou quando termo/filtros mudam).
   - Cada card de clínica consulta os detalhes da clínica (para obter o CEP)
     e depois o ViaCEP para mostrar o endereço (a busca devolve só id, nome e foto).

   Backend NÃO é alterado por este arquivo. Contratos usados (buscacontroller.php,
   rota "busca"): { acao: "busca", tipo, busca, valor? } e
   { acao: "mostrardetalhes", tipo, id }. Resposta: { sucesso, dados } ou
   { sucesso: false, erro }.

   Obs.: os atributos data-* em camelCase são lidos com .attr(); o .data()
   do jQuery espera a forma com hífen (data-grupo-filtro).
   ============================================================ */

/** Função autoexecutável que isola o escopo e recebe jQuery, ElmoUtilitarios e ElmoBusca. */
(function ($, Utilitarios, Busca) {
  "use strict";

  /** Módulo da página de resultados. */
  var moduloResultados = {

    /* ---------- Configuração ---------- */
    /** URLs de perfil, serviço e ViaCEP, filtros aceitos e contratos de backend. */
    configuracao: {
      urlPerfil: "index.php?uri=perfil",
      urlDetalhesServico: "index.php?uri=infoServico",
      urlViaCep: "https://viacep.com.br/ws/",
      tempoLimiteViaCep: 8000,
      // O backend só filtra por termo (nome ou tipo). Preço, cidade e local de
      // atendimento estão escondidos no HTML até o backend suportar. O tipo de
      // serviço é aplicado aqui no navegador, sobre ser_tipo (só aba Serviços).
      filtrosConhecidos: ["tipoServico"],

      /** Rota e ação da busca e dos detalhes (buscacontroller.php). */
      /*
        Contratos de backend (rota "busca" = buscacontroller.php).
        Resposta de "busca" (campos por tipo):
          servico:      ser_id, ser_pro, ser_clin, ser_nome, ser_tipo, ser_desc, ser_val
          profissional: pro_id, pro_nome, pro_foto
          clinica:      clin_id, clin_nome, clin_foto
        Resposta de "mostrardetalhes" da clínica: clin_id, clin_nome, clin_bio,
        clin_foto, clin_cep, clin_tel.
      */
      contratos: {
        buscar:   { url: "index.php?uri=busca", acao: "busca" },
        detalhes: { url: "index.php?uri=busca", acao: "mostrardetalhes" }
      }
    },

    /**
     * Dados de cada aba: tipo no backend, elementos do HTML, textos e conversão do item do backend.
     */
    /* Dados de cada aba: contrato, elementos do HTML, textos e conversão do item do backend */
    abas: {
      /** Aba Serviços. */
      servicos: {
        tipoBackend: "servico",
        campoLista: "listaServicos",
        modelo: "#modeloCardServico",
        estadoVazio: "servicos",
        textos: { um: "serviço encontrado", varios: "serviços encontrados", nenhum: "Nenhum serviço foi encontrado" },
        /**
         * Converte um serviço do backend nos dados do card (nome, preço, foto, link de detalhes).
         */
        mapear: function (item, modulo) {
          return {
            id: item.ser_id,
            nome: item.ser_nome,
            textos: {
              nomeServico: item.ser_nome,
              precoServico: modulo.formatarPreco(item.ser_val),
              fotoServico: modulo.fotoValida(item.ser_foto)
            },
            acao: "verDetalhes",
            href: modulo.montarLink(modulo.configuracao.urlDetalhesServico, { id: item.ser_id }),
            rotuloLink: "Ver detalhes do serviço "
          };
        }
      },
      /** Aba Profissionais. */
      profissionais: {
        tipoBackend: "profissional",
        campoLista: "listaProfissionais",
        modelo: "#modeloCardProfissional",
        estadoVazio: "profissionais",
        textos: { um: "profissional encontrado", varios: "profissionais encontrados", nenhum: "Nenhum profissional foi encontrado" },
        /** Converte um profissional do backend nos dados do card (nome, foto, link do perfil). */
        mapear: function (item, modulo) {
          return {
            id: item.pro_id,
            nome: item.pro_nome,
            textos: {
              nomeProfissional: item.pro_nome,
              fotoProfissional: modulo.fotoValida(item.pro_foto)
            },
            acao: "verPerfil",
            href: modulo.montarLink(modulo.configuracao.urlPerfil, { tipo: "profissional", id: item.pro_id }),
            rotuloLink: "Ver perfil de "
          };
        }
      },
      /** Aba Clínicas. */
      clinicas: {
        tipoBackend: "clinica",
        campoLista: "listaClinicas",
        modelo: "#modeloCardClinica",
        estadoVazio: "clinicas",
        textos: { um: "clínica encontrada", varios: "clínicas encontradas", nenhum: "Nenhuma clínica foi encontrada" },
        /**
         * Converte uma clínica do backend nos dados do card (nome, foto, link do perfil e endereço
         * provisório).
         */
        mapear: function (item, modulo) {
          return {
            id: item.clin_id,
            nome: item.clin_nome,
            textos: {
              nomeClinica: item.clin_nome,
              fotoClinica: modulo.fotoValida(item.clin_foto),
              enderecoClinica: "…"
            },
            acao: "verPerfil",
            href: modulo.montarLink(modulo.configuracao.urlPerfil, { tipo: "clinica", id: item.clin_id }),
            rotuloLink: "Ver perfil da clínica "
          };
        }
      }
    },

    /* ---------- Estado interno ---------- */
    /** Termo, aba ativa, filtros, controle de cargas e caches de endereços e detalhes. */
    estado: {
      termo: "",
      abaAtiva: "servicos",
      filtros: {},          // { tipoServico } (só os preenchidos)
      carregadoPara: {},    // aba -> chave (termo + filtros) já carregada ou em andamento
      requisicoes: {},      // aba -> número da última requisição (descarta respostas antigas)
      cacheEnderecos: {},   // CEP (só números) -> promessa da consulta ao ViaCEP
      cacheDetalhes: {}     // id da clínica -> promessa da consulta de detalhes
    },

    /** Cache dos elementos jQuery da página. */
    elementos: {},

    /** Guarda os elementos, configura a navegação, registra eventos e restaura a busca. */
    iniciar: function () {
      this.cachearElementos();
      Busca.configurarNavegacao();
      this.registrarEventos();
      this.restaurarBusca();
    },

    /** Busca no DOM conteúdo, campo, filtros, abas e estados. */
    cachearElementos: function () {
      var e = this.elementos;
      e.$conteudo = $("#conteudoResultados");
      e.$entrada = $("#entradaBuscaResultados");
      e.$avisoBusca = $("#avisoBuscaResultados");
      e.$botaoFiltros = $("#botaoFiltros");
      e.$painelFiltros = $("#painelFiltrosBusca");
      e.$gruposFiltro = $("[data-grupoFiltro]");
      e.$abas = $("#abasResultados [data-bs-toggle='tab']");
      e.$avisoResultados = $("#avisoResultados");
      e.$carregando = $("[data-estadoBusca='carregando']");
      e.$erro = $("[data-estadoBusca='erro']");
    },

    /** Liga pesquisa, troca de aba, filtros, tentar novamente e voltar/avançar do navegador. */
    registrarEventos: function () {
      var self = this;

      // Evento do campoPesquisa (componentes.js): lupa ou Enter
      $(document).on("pesquisaAcionada", "#campoPesquisaResultados", function (evento, dados) {
        self.pesquisar(dados && dados.termo);
      });

      // Ao digitar, some o aviso de pesquisa vazia
      this.elementos.$entrada.on("input", function () {
        self.esconderAvisoBusca();
      });

      // Troca de aba (evento do Bootstrap)
      this.elementos.$abas.on("shown.bs.tab", function () {
        self.aoTrocarAba($(this).attr("data-tipoBusca"));
      });

      $("#botaoAplicarFiltros").on("click", function () {
        self.aplicarFiltros(self.coletarFiltros());
      });

      $("#botaoLimparFiltros").on("click", function () {
        self.limparFiltros();
      });

      // Enter no campo de cidade aplica os filtros
      $("#entradaCidade").on("keydown", function (evento) {
        if (evento.key === "Enter") {
          evento.preventDefault();
          self.aplicarFiltros(self.coletarFiltros());
        }
      });

      $("#botaoTentarNovamente").on("click", function () {
        self.carregarAba(self.estado.abaAtiva, true);
      });

      // Voltar/avançar do navegador
      $(window).on("popstate", function () {
        self.restaurarBusca();
      });
    },

    /* ---------- Estado da busca (URL + history.state) ---------- */

    /** Lê termo (URL), aba e filtros (history.state), atualiza a tela e carrega a aba ativa. */
    // Lê termo (URL), aba e filtros (history.state), atualiza a tela e carrega a aba ativa.
    restaurarBusca: function () {
      var guardado = (window.history.state && window.history.state.busca) || {};

      this.estado.termo = $.trim(Utilitarios.obterParametroUrl("termo") || "");
      if (this.abas[guardado.aba]) {
        this.estado.abaAtiva = guardado.aba;
      } else {
        this.estado.abaAtiva = "servicos";
      }
      this.estado.filtros = this.filtrosValidos(guardado.filtros);
      this.estado.carregadoPara = {};

      this.elementos.$entrada.val(this.estado.termo);
      this.aplicarFiltrosNaTela();
      this.mostrarAbaAtiva();
      this.atualizarTelaDaAba();
      this.carregarAba(this.estado.abaAtiva);
    },

    /** Aceita só filtros conhecidos com valor em texto. */
    // Só aceita os filtros conhecidos, com valor em texto (o history.state pode ter sido alterado)
    filtrosValidos: function (filtros) {
      var validos = {};
      var conhecidos = this.configuracao.filtrosConhecidos;

      if (filtros && typeof filtros === "object") {
        $.each(conhecidos, function (indice, nome) {
          if (typeof filtros[nome] === "string" && $.trim(filtros[nome]) !== "") {
            validos[nome] = $.trim(filtros[nome]);
          }
        });
      }
      return validos;
    },

    /**
     * Grava termo, aba e filtros na URL e no history.state (nova entrada ou substituindo a atual).
     */
    // novaEntrada = true: nova pesquisa (cria entrada no histórico); false: só atualiza a atual
    salvarBusca: function (novaEntrada) {
      var url = window.location.pathname + "?uri=resultadosBusca";
      if (this.estado.termo !== "") {
        url += "&termo=" + encodeURIComponent(this.estado.termo);
      }
      var estadoHistorico = { busca: { aba: this.estado.abaAtiva, filtros: this.estado.filtros } };

      try {
        if (novaEntrada) {
          window.history.pushState(estadoHistorico, "", url);
        } else {
          window.history.replaceState(estadoHistorico, "", url);
        }
      } catch (erro) {
        // sem History API: a busca continua funcionando, só não sobrevive ao recarregar
      }
    },

    /* ---------- Pesquisa, abas e filtros ---------- */
    /** Valida o termo; se vazio avisa, senão salva e recarrega a aba ativa. */
    pesquisar: function (termo) {
      // Pesquisa vazia: aviso visível e nada é pesquisado (os resultados atuais não mudam)
      if (!Busca.termoValido(termo)) {
        this.mostrarAvisoBusca(true);
        return;
      }
      this.estado.termo = $.trim(termo);
      this.estado.carregadoPara = {};
      this.salvarBusca(true);
      this.carregarAba(this.estado.abaAtiva);
    },

    /** Ao trocar de aba, atualiza a tela, salva o estado e carrega os resultados. */
    aoTrocarAba: function (aba) {
      if (!this.abas[aba]) {
        return;
      }
      this.estado.abaAtiva = aba;
      this.atualizarTelaDaAba();
      this.salvarBusca(false);
      this.carregarAba(aba);
    },

    /** Abre a aba guardada se ela ainda não for a ativa. */
    // Abre a aba guardada (se não for a que já está aberta)
    mostrarAbaAtiva: function () {
      var $aba = this.elementos.$abas.filter("[data-tipoBusca='" + this.estado.abaAtiva + "']");
      if (!$aba.hasClass("active")) {
        bootstrap.Tab.getOrCreateInstance($aba[0]).show();
      }
    },

    /** Ajusta o placeholder do campo e os grupos de filtro conforme a aba. */
    // Placeholder do campo e grupos de filtro de acordo com a aba ativa
    atualizarTelaDaAba: function () {
      var aba = this.estado.abaAtiva;
      var $aba = this.elementos.$abas.filter("[data-tipoBusca='" + aba + "']");

      this.elementos.$entrada.attr("placeholder", $aba.attr("data-placeholderBusca"));

      var haGrupoVisivel = false;
      this.elementos.$gruposFiltro.each(function () {
        var abasDoGrupo = ($(this).attr("data-abasFiltro") || "").split(/\s+/);
        var visivel = $.inArray(aba, abasDoGrupo) !== -1;
        $(this).prop("hidden", !visivel);
        haGrupoVisivel = haGrupoVisivel || visivel;
      });

      // Aba sem nenhum filtro disponível: esconde o botão de filtros
      this.elementos.$botaoFiltros.prop("hidden", !haGrupoVisivel);
    },

    /** Lê os valores do painel de filtros. */
    // Lê o painel inteiro (inclusive grupos de outras abas, que mantêm o valor ao trocar de aba)
    coletarFiltros: function () {
      var filtros = {};

      this.elementos.$gruposFiltro.each(function () {
        var $grupo = $(this);
        var nome = $grupo.attr("data-grupoFiltro");
        var $marcado = $grupo.find("input[type='radio']:checked");
        var valor;
        if ($marcado.length) {
          valor = $marcado.val();
        } else {
          valor = $.trim($grupo.find("input[type='text']").val());
        }

        if (valor) {
          filtros[nome] = valor;
        }
      });
      return this.filtrosValidos(filtros);
    },

    /** Preenche o painel com os filtros guardados no estado. */
    aplicarFiltrosNaTela: function () {
      var filtros = this.estado.filtros;

      this.elementos.$gruposFiltro.each(function () {
        var $grupo = $(this);
        var valorGuardado = filtros[$grupo.attr("data-grupoFiltro")] || "";

        $grupo.find("input[type='radio']").each(function () {
          $(this).prop("checked", $(this).val() === valorGuardado);
        });
        $grupo.find("input[type='text']").val(valorGuardado);
      });
    },

    /** Devolve só os filtros válidos para a aba. */
    // Só os filtros que valem para a aba (conforme data-abasFiltro)
    filtrosDaAba: function (aba) {
      var filtros = this.estado.filtros;
      var daAba = {};

      this.elementos.$gruposFiltro.each(function () {
        var abasDoGrupo = ($(this).attr("data-abasFiltro") || "").split(/\s+/);
        var nome = $(this).attr("data-grupoFiltro");

        if ($.inArray(aba, abasDoGrupo) !== -1 && filtros[nome]) {
          daAba[nome] = filtros[nome];
        }
      });
      return daAba;
    },

    /** Guarda os filtros, fecha o painel, salva a busca e recarrega a aba. */
    aplicarFiltros: function (filtros) {
      this.estado.filtros = filtros;
      this.estado.carregadoPara = {};
      this.fecharPainelFiltros();
      this.salvarBusca(false);
      this.carregarAba(this.estado.abaAtiva);
    },

    /** Remove todos os filtros e limpa o painel. */
    limparFiltros: function () {
      this.aplicarFiltros({});
      this.aplicarFiltrosNaTela();
    },

    /** Fecha o dropdown de filtros e devolve o foco ao botão. */
    fecharPainelFiltros: function () {
      bootstrap.Dropdown.getOrCreateInstance(this.elementos.$botaoFiltros[0]).hide();
      this.elementos.$botaoFiltros.trigger("focus");
    },

    /* ---------- Carregamento dos resultados ---------- */
    /** Faz o POST do contrato (acao + dados) ao backend. */
    chamarContrato: function (nome, dados) {
      var contrato = this.configuracao.contratos[nome];

      return $.ajax({
        url: contrato.url,
        method: "POST",
        dataType: "json",
        data: $.extend({ acao: contrato.acao }, dados || {})
      });
    },

    /**
     * Busca os resultados da aba (evita repetir a mesma consulta), trata carregando, erro e
     * respostas antigas.
     */
    carregarAba: function (aba, forcar) {
      var self = this;
      var configuracaoAba = this.abas[aba];
      var chave = JSON.stringify({ termo: this.estado.termo, filtros: this.filtrosDaAba(aba) });

      // Já carregada (ou carregando) com este termo e estes filtros
      if (!forcar && this.estado.carregadoPara[aba] === chave) {
        return;
      }
      this.estado.carregadoPara[aba] = chave;

      // Sem termo: não pesquisa; mostra o aviso e não exibe "nenhum resultado"
      if (this.estado.termo === "") {
        this.exibirSemTermo(aba);
        return;
      }
      this.esconderAvisoBusca();

      var numero = (this.estado.requisicoes[aba] || 0) + 1;
      this.estado.requisicoes[aba] = numero;
      this.exibirCarregando(aba);

      this.chamarContrato("buscar", {
        tipo: configuracaoAba.tipoBackend,
        busca: this.estado.termo
      })
        .done(function (resposta) {
          if (numero !== self.estado.requisicoes[aba]) {
            return; // resposta de uma busca antiga
          }
          if (!resposta || !resposta.sucesso || !$.isArray(resposta.dados)) {
            self.exibirErro(aba);
            return;
          }
          self.exibirResultados(aba, self.aplicarFiltrosLocais(aba, resposta.dados));
        })
        .fail(function () {
          if (numero === self.estado.requisicoes[aba]) {
            self.exibirErro(aba);
          }
        });
    },

    /** Aplica no navegador os filtros que o backend não faz (tipo de serviço). */
    // Filtros que o backend não faz: aplicados aqui sobre os campos devolvidos.
    aplicarFiltrosLocais: function (aba, itens) {
      var filtros = this.filtrosDaAba(aba);

      if (aba === "servicos" && filtros.tipoServico) {
        var tipo = String(filtros.tipoServico).toLowerCase();
        return $.grep(itens, function (item) {
          return String(item.ser_tipo || "").toLowerCase() === tipo;
        });
      }
      return itens;
    },

    /** Aceita a foto só se parecer arquivo de imagem; senão devolve undefined. */
    // O cadastro grava um marcador no lugar da foto (ex.: "cxfoto"); só usa
    // valores que parecem arquivo de imagem. Sem foto, o card esconde a imagem.
    fotoValida: function (foto) {
      if (/\.(jpe?g|png|gif|webp)$/i.test(String(foto || ""))) {
        return foto;
      } else {
        return undefined;
      }
    },

    /* ---------- Exibição ---------- */
    /** Devolve a lista de cards da aba. */
    $listaDaAba: function (aba) {
      return $("[data-campo='" + this.abas[aba].campoLista + "']");
    },

    /** Devolve o bloco de 'nenhum resultado' da aba. */
    $vazioDaAba: function (aba) {
      return $("[data-estadoVazio='" + this.abas[aba].estadoVazio + "']");
    },

    /** Limpa a aba e mostra o aviso de busca vazia, sem exibir 'nenhum resultado'. */
    exibirSemTermo: function (aba) {
      this.$listaDaAba(aba).empty();
      this.$vazioDaAba(aba).attr("hidden", "hidden");
      this.elementos.$carregando.attr("hidden", "hidden");
      this.elementos.$erro.attr("hidden", "hidden");
      this.elementos.$conteudo.attr("aria-busy", "false");
      this.mostrarAvisoBusca(false);
    },

    /** Mostra o aviso de pesquisa vazia e, se pedido, foca o campo. */
    // focar = true quando a pessoa acabou de pesquisar; ao abrir a página não rouba o foco
    mostrarAvisoBusca: function (focar) {
      this.elementos.$avisoBusca.removeAttr("hidden");
      this.elementos.$entrada.attr("aria-invalid", "true");
      if (focar) {
        this.elementos.$entrada.trigger("focus");
      }
    },

    /** Esconde o aviso de pesquisa vazia. */
    esconderAvisoBusca: function () {
      this.elementos.$avisoBusca.attr("hidden", "hidden");
      this.elementos.$entrada.removeAttr("aria-invalid");
    },

    /** Limpa a aba e mostra o estado de carregamento. */
    exibirCarregando: function (aba) {
      this.$listaDaAba(aba).empty();
      this.$vazioDaAba(aba).attr("hidden", "hidden");
      this.elementos.$erro.attr("hidden", "hidden");
      this.elementos.$carregando.removeAttr("hidden");
      this.elementos.$conteudo.attr("aria-busy", "true");
    },

    /** Mostra o estado de erro e libera nova tentativa. */
    exibirErro: function (aba) {
      this.estado.carregadoPara[aba] = null; // permite tentar de novo
      this.$listaDaAba(aba).empty();
      this.$vazioDaAba(aba).attr("hidden", "hidden");
      this.elementos.$carregando.attr("hidden", "hidden");
      this.elementos.$erro.removeAttr("hidden");
      this.elementos.$conteudo.attr("aria-busy", "false");
    },

    /** Monta os cards, mostra ou esconde o 'nenhum resultado' e anuncia o total. */
    exibirResultados: function (aba, itens) {
      var self = this;
      var configuracaoAba = this.abas[aba];
      var $lista = this.$listaDaAba(aba).empty();

      this.elementos.$carregando.attr("hidden", "hidden");
      this.elementos.$erro.attr("hidden", "hidden");
      this.elementos.$conteudo.attr("aria-busy", "false");

      $.each(itens, function (indice, item) {
        $lista.append(self.montarCard(aba, item));
      });

      this.$vazioDaAba(aba).prop("hidden", itens.length > 0);
      this.anunciar(this.mensagemDeResultados(configuracaoAba.textos, itens.length));
    },

    /** Monta a frase com a quantidade de resultados (ou 'nenhum'). */
    mensagemDeResultados: function (textos, quantidade) {
      if (quantidade === 0) {
        return textos.nenhum;
      }
      var textoQuantidade;
      if (quantidade === 1) {
        textoQuantidade = textos.um;
      } else {
        textoQuantidade = textos.varios;
      }
      return quantidade + " " + textoQuantidade;
    },

    /** Escreve a mensagem na região de status para leitores de tela. */
    // Texto para leitores de tela (região role="status" no HTML)
    anunciar: function (mensagem) {
      this.elementos.$avisoResultados.text(mensagem);
    },

    /* ---------- Cards ---------- */
    /**
     * Clona o modelo da aba, preenche os campos, configura o link e, para clínicas, busca o
     * endereço.
     */
    montarCard: function (aba, item) {
      var configuracaoAba = this.abas[aba];
      var dados = configuracaoAba.mapear(item, this);
      var modelo = document.querySelector(configuracaoAba.modelo);
      var $card = $(modelo.content.firstElementChild.cloneNode(true));

      Utilitarios.preencherCampos($card.find("[data-campo]"), this.apenasComValor(dados.textos));

      // Foto ausente: esconde a imagem (alt vazio: o nome já está no título do card)
      $card.find("img[data-campo]").each(function () {
        if (!$(this).attr("src")) {
          $(this).attr("hidden", "hidden");
        }
      });

      this.configurarLink($card, dados);

      if (aba === "clinicas") {
        this.preencherEndereco($card, dados.id);
      }
      return $card;
    },

    /** Remove valores vazios para não sobrescrever o texto do modelo com 'undefined'. */
    // Valores vazios não entram (o preencherCampos trocaria o texto do modelo por "undefined")
    apenasComValor: function (textos) {
      var resultado = {};
      $.each(textos, function (nome, valor) {
        if (valor !== undefined && valor !== null && valor !== "") {
          resultado[nome] = valor;
        }
      });
      return resultado;
    },

    /** Define o link do card (só com id numérico) e seu aria-label. */
    // O link só existe com id numérico (o perfil e o serviço esperam um número)
    configurarLink: function ($card, dados) {
      var $link = $card.find("[data-acao='" + dados.acao + "']");

      if (!/^[0-9]+$/.test(String(dados.id))) {
        $link.remove();
        return;
      }
      $link
        .attr("href", dados.href)
        .attr("aria-label", dados.rotuloLink + (dados.nome || ""))
        .attr("data-idPerfil", dados.id);
    },

    /** Monta uma URL com parâmetros codificados. */
    montarLink: function (base, parametros) {
      var partes = [];
      $.each(parametros, function (nome, valor) {
        partes.push(nome + "=" + encodeURIComponent(valor));
      });
      return base + "&" + partes.join("&");
    },

    /** Formata o valor como moeda brasileira (vazio se inválido). */
    formatarPreco: function (valor) {
      var numero = parseFloat(valor);
      if (isNaN(numero)) {
        return "";
      }
      return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    /* ---------- Endereço da clínica (ViaCEP) ---------- */
    /** Busca os detalhes da clínica (para obter o CEP) com cache de promessas. */
    // A busca não devolve o CEP: ele vem dos detalhes da clínica (uma consulta
    // por card, com cache) e a rua vem do ViaCEP. CEPs repetidos reaproveitam
    // a mesma consulta ao ViaCEP (cache).
    obterDetalhesClinica: function (id) {
      var cache = this.estado.cacheDetalhes;
      var self = this;

      if (cache[id]) {
        return cache[id];
      }
      var resultado = $.Deferred();
      cache[id] = resultado.promise();

      this.chamarContrato("detalhes", { tipo: "clinica", id: id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso && $.isArray(resposta.dados) && resposta.dados.length) {
            resultado.resolve(resposta.dados[0]);
            return;
          }
          delete self.estado.cacheDetalhes[id];
          resultado.reject();
        })
        .fail(function () {
          delete self.estado.cacheDetalhes[id];
          resultado.reject();
        });

      return cache[id];
    },

    /** Preenche CEP e endereço do card a partir dos detalhes e do ViaCEP. */
    preencherEndereco: function ($card, id) {
      var self = this;
      var $endereco = $card.find("[data-campo='enderecoClinica']");
      var $cep = $card.find("[data-campo='cepClinica']");

      this.obterDetalhesClinica(id)
        .done(function (clinica) {
          var cep = clinica.clin_cep || "";

          var textoCep;
          if (cep) {
            textoCep = Utilitarios.formatarMascara("cep", cep);
          } else {
            textoCep = "Não informado";
          }
          $cep.text(textoCep);
          if (!cep) {
            $endereco.text("Indisponível");
            return;
          }
          self.buscarEnderecoPorCep(cep)
            .done(function (dadosViaCep) {
              $endereco.text(self.textoEndereco(dadosViaCep));
            })
            .fail(function () {
              $endereco.text("Indisponível");
            });
        })
        .fail(function () {
          $cep.text("Indisponível");
          $endereco.text("Indisponível");
        });
    },

    /**
     * Consulta o ViaCEP (JSONP) com cache e tempo limite; CEPs repetidos reaproveitam a consulta.
     */
    buscarEnderecoPorCep: function (cep) {
      var cepNumerico = Utilitarios.apenasNumeros(cep || "");
      var cache = this.estado.cacheEnderecos;

      if (!/^[0-9]{8}$/.test(cepNumerico)) {
        return $.Deferred().reject().promise();
      }
      if (cache[cepNumerico]) {
        return cache[cepNumerico];
      }

      var resultado = $.Deferred();
      cache[cepNumerico] = resultado.promise();

      $.ajax({
        url: this.configuracao.urlViaCep + cepNumerico + "/json/",
        dataType: "jsonp",
        timeout: this.configuracao.tempoLimiteViaCep
      })
        .done(function (dados) {
          if (!dados || dados.erro) {
            delete cache[cepNumerico];
            resultado.reject();
            return;
          }
          resultado.resolve(dados);
        })
        .fail(function () {
          delete cache[cepNumerico]; // permite nova tentativa depois
          resultado.reject();
        });

      return cache[cepNumerico];
    },

    /** Monta 'rua, UF' a partir do ViaCEP. */
    // Rua e UF, como no card do Figma ("Rua Sol, SP")
    textoEndereco: function (dadosViaCep) {
      return [dadosViaCep.logradouro, dadosViaCep.uf].filter(Boolean).join(", ") || "Indisponível";
    }
  };

  /** Executa moduloResultados.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloResultados.iniciar();
  });

})(jQuery, window.ElmoUtilitarios, window.ElmoBusca);
