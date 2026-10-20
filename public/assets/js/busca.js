/* ============================================================
   ARQUIVO: busca.js

   O QUE FAZ
   Tela inicial de busca: alterna o título animado (Serviço / Profissional /
   Clínica) e o placeholder do campo, valida o termo e leva para a tela de
   resultados, e trata o clique nas sugestões (preenche o campo e já
   pesquisa).

   OBSERVAÇÕES
   - Não chama o backend: a busca em si acontece em resultadosBusca.js.
   - Depende de jQuery, Bootstrap, componentes.js, sessaoNavegacao.js e
     buscaComum.js (window.ElmoBusca).
   - A troca do título respeita prefers-reduced-motion, pausa com o campo em
     foco e com a aba em segundo plano.
   - duracaoTransicao (500 ms) deve ser igual à transição de
     .tituloBusca_termo no busca.css.
   - Atributos data-* em camelCase são lidos com .attr(); o .data() do jQuery
     esperaria a forma com hífen.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery e
     ElmoBusca.
     - moduloBusca (objeto) — Módulo da tela inicial de busca.
       - moduloBusca.configuracao — Intervalo padrão e duração da transição do
         título animado (ms).
       - moduloBusca.estado — Estado do título animado: índice ativo,
         temporizador, animação reduzida e foco no campo.
       - moduloBusca.elementos — Cache dos elementos jQuery da página.
       - moduloBusca.iniciar() — Guarda elementos, configura a navegação,
         detecta animação reduzida, registra eventos e agenda a troca do
         título.
       - moduloBusca.cachearElementos() — Busca no DOM título, termos, campo,
         aviso e botões de sugestão.
       - moduloBusca.registrarEventos() — Liga pesquisa (lupa/Enter),
         sugestões, foco/blur do campo e visibilidade da aba.
       - moduloBusca.pesquisar() — Valida o termo; se vazio mostra o aviso,
         senão vai para os resultados.
       - moduloBusca.mostrarAviso() — Exibe o aviso de pesquisa vazia, marca o
         campo como inválido e foca nele.
       - moduloBusca.esconderAviso() — Esconde o aviso e remove o estado
         inválido do campo.
       - moduloBusca.podeTrocar() — Diz se a troca do título pode ocorrer
         agora (sem animação reduzida, sem foco no campo, aba visível, mais de
         um termo).
       - moduloBusca.intervaloDeTroca() — Lê o intervalo de data-
         intervaloTroca do título ou usa o padrão.
       - moduloBusca.cancelarTroca() — Cancela o temporizador da próxima
         troca.
       - moduloBusca.agendarProximaTroca() — Agenda a próxima troca de termo
         (se permitido), repetindo o ciclo.
       - moduloBusca.trocarTermo() — Anima a saída do termo atual e a entrada
         do próximo, e atualiza o placeholder.
     - Callback do document ready — Executa moduloBusca.iniciar() quando o DOM
       estiver pronto.
   ============================================================ */

/* ============================================================
   PÁGINA: busca (tela inicial)
   Depende de: jQuery, Bootstrap 5 (bundle), componentes.js,
               sessaoNavegacao.js e buscaComum.js (window.ElmoBusca).

   O que faz:
   - alterna o título (Serviço / Profissional / Clínica) e o placeholder
     do campo, com a animação definida em busca.css;
   - valida o termo e leva para a tela de resultados (o tipo — serviço,
     profissional ou clínica — é escolhido lá, pelas abas);
   - trata o clique nas sugestões (preenche o campo e já pesquisa).

   Não chama o backend: a busca em si acontece em resultadosBusca.js.

   Obs.: os atributos data-* em camelCase são lidos com .attr(); o .data()
   do jQuery espera a forma com hífen (data-intervalo-troca).
   ============================================================ */

/** Função autoexecutável que isola o escopo e recebe jQuery e ElmoBusca. */
(function ($, Busca) {
  "use strict";

  /** Módulo da tela inicial de busca. */
  var moduloBusca = {

    /** Intervalo padrão e duração da transição do título animado (ms). */
    configuracao: {
      intervaloPadrao: 3000,   // ms; pode ser trocado em data-intervaloTroca no título
      duracaoTransicao: 500    // ms; deve ser igual à transição do tituloBusca_termo no CSS
    },

    /** Estado do título animado: índice ativo, temporizador, animação reduzida e foco no campo. */
    estado: {
      indiceAtivo: 0,
      temporizador: null,
      animacaoReduzida: false,
      campoEmUso: false
    },

    /** Cache dos elementos jQuery da página. */
    elementos: {},

    /**
     * Guarda elementos, configura a navegação, detecta animação reduzida, registra eventos e agenda
     * a troca do título.
     */
    iniciar: function () {
      this.cachearElementos();
      Busca.configurarNavegacao();
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.estado.animacaoReduzida = true;
      } else {
        this.estado.animacaoReduzida = false;
      }
      this.registrarEventos();
      this.agendarProximaTroca();
    },

    /** Busca no DOM título, termos, campo, aviso e botões de sugestão. */
    cachearElementos: function () {
      var e = this.elementos;
      e.$titulo = $("#tituloBusca");
      e.$termos = $(".tituloBusca_termo");
      e.$campoPesquisa = $("#campoPesquisaBusca");
      e.$entrada = $("#entradaBusca");
      e.$aviso = $("#avisoBusca");
      e.$sugestoes = $(".sugestoesBusca_botao");
    },

    /** Liga pesquisa (lupa/Enter), sugestões, foco/blur do campo e visibilidade da aba. */
    registrarEventos: function () {
      var self = this;

      // Evento do campoPesquisa (componentes.js): lupa ou Enter
      $(document).on("pesquisaAcionada", "#campoPesquisaBusca", function (evento, dados) {
        self.pesquisar(dados && dados.termo);
      });

      this.elementos.$sugestoes.on("click", function () {
        var termo = $(this).attr("data-termoSugestao");
        self.elementos.$entrada.val(termo);
        self.pesquisar(termo);
      });

      this.elementos.$entrada
        .on("input", function () {
          self.esconderAviso();
        })
        // Enquanto a pessoa usa o campo, o placeholder para de trocar
        .on("focus", function () {
          self.estado.campoEmUso = true;
          self.cancelarTroca();
        })
        .on("blur", function () {
          self.estado.campoEmUso = false;
          self.agendarProximaTroca();
        });

      // Aba em segundo plano: não troca
      $(document).on("visibilitychange", function () {
        if (document.hidden) {
          self.cancelarTroca();
        } else {
          self.agendarProximaTroca();
        }
      });
    },

    /* ---------- Pesquisa ---------- */
    /** Valida o termo; se vazio mostra o aviso, senão vai para os resultados. */
    pesquisar: function (termo) {
      if (!Busca.termoValido(termo)) {
        this.mostrarAviso();
        return;
      }
      Busca.irParaResultados(termo);
    },

    /** Exibe o aviso de pesquisa vazia, marca o campo como inválido e foca nele. */
    mostrarAviso: function () {
      this.elementos.$aviso.removeAttr("hidden");
      this.elementos.$entrada.attr("aria-invalid", "true").trigger("focus");
    },

    /** Esconde o aviso e remove o estado inválido do campo. */
    esconderAviso: function () {
      this.elementos.$aviso.attr("hidden", "hidden");
      this.elementos.$entrada.removeAttr("aria-invalid");
    },

    /* ---------- Título animado ---------- */
    /**
     * Diz se a troca do título pode ocorrer agora (sem animação reduzida, sem foco no campo, aba
     * visível, mais de um termo).
     */
    podeTrocar: function () {
      return !this.estado.animacaoReduzida &&
        !this.estado.campoEmUso &&
        !document.hidden &&
        this.elementos.$termos.length > 1;
    },

    /** Lê o intervalo de data-intervaloTroca do título ou usa o padrão. */
    intervaloDeTroca: function () {
      var valor = parseInt(this.elementos.$titulo.attr("data-intervaloTroca"), 10);
      if (valor > 0) {
        return valor;
      } else {
        return this.configuracao.intervaloPadrao;
      }
    },

    /** Cancela o temporizador da próxima troca. */
    cancelarTroca: function () {
      window.clearTimeout(this.estado.temporizador);
      this.estado.temporizador = null;
    },

    /** Agenda a próxima troca de termo (se permitido), repetindo o ciclo. */
    agendarProximaTroca: function () {
      var self = this;
      this.cancelarTroca();

      if (!this.podeTrocar()) {
        return;
      }
      this.estado.temporizador = window.setTimeout(function () {
        self.trocarTermo();
        self.agendarProximaTroca();
      }, this.intervaloDeTroca());
    },

    /** Anima a saída do termo atual e a entrada do próximo, e atualiza o placeholder. */
    trocarTermo: function () {
      var $termos = this.elementos.$termos;
      var $atual = $termos.eq(this.estado.indiceAtivo);
      this.estado.indiceAtivo = (this.estado.indiceAtivo + 1) % $termos.length;
      var $proximo = $termos.eq(this.estado.indiceAtivo);

      // O termo atual sobe e some; o próximo entra por baixo
      $atual.removeClass("tituloBusca_termo--ativo").addClass("tituloBusca_termo--saindo");
      $proximo.addClass("tituloBusca_termo--ativo");

      window.setTimeout(function () {
        $atual.removeClass("tituloBusca_termo--saindo");
      }, this.configuracao.duracaoTransicao);

      this.elementos.$entrada.attr("placeholder", $proximo.attr("data-placeholderBusca"));
    }
  };

  /** Executa moduloBusca.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloBusca.iniciar();
  });

})(jQuery, window.ElmoBusca);
