/* ============================================================
   ARQUIVO: sessaoNavegacao.js

   O QUE FAZ
   Descobre, ao carregar a página, se há usuário logado e qual o tipo
   (cliente, profissional ou clínica), e mostra o bloco de navegação correto
   (deslogado ou logado). Depois avisa a página com o evento sessaoNavegacaoDefinida.

   OBSERVAÇÕES
   - Não há rota única 'quem sou eu': testa uma URI por tipo, na ordem de
     tiposParaVerificar, e para no primeiro 'logado: true'. Se todas falharem,
     considera deslogado.
   - Cada URI deve responder JSON { logado: true|false } e recebe POST com
     acao=verificarLogin.
   - No máximo 3 requisições em sequência em página deslogada (uma por tipo).
   - O tipo 'clienteSimples' é tratado aqui, mas nunca é testado em
     tiposParaVerificar: só aparece se a URI de cliente passar a devolvê-lo.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo do arquivo.
     - moduloSessaoNavegacao (objeto) — Módulo que resolve a sessão e controla a navegação exibida.
       - moduloSessaoNavegacao.configuracao — Ordem dos tipos a verificar e geração da URL de verificação.
         - configuracao.urlVerificarSessaoPorTipo() — Devolve a URI de verificação de login do tipo informado.
       - moduloSessaoNavegacao.itemContatosPorTipo — Troca ícone e rótulo do
         item Contatos por 'Documentos' para clienteSimples.
       - moduloSessaoNavegacao.elementos — Cache dos elementos jQuery de
         navegação.
       - moduloSessaoNavegacao.iniciar() — Ponto de entrada: guarda os
         elementos e inicia a verificação de sessão.
       - moduloSessaoNavegacao.cachearElementos() — Busca no DOM e guarda as
         navegações, o menu hambúrguer e o item de contatos.
       - moduloSessaoNavegacao.verificarSessao() — Começa a testar os tipos
         pelo primeiro da lista.
       - moduloSessaoNavegacao.testarTipo() — Consulta o servidor para o tipo
         da posição indicada; se negativo ou com falha, tenta o próximo;
         esgotada a lista, exibe como deslogado.
       - moduloSessaoNavegacao.exibirNavegacaoDeslogado() — Mostra a barra de
         deslogado, esconde as de logado e dispara sessaoNavegacaoDefinida
         (logado: false).
       - moduloSessaoNavegacao.exibirNavegacaoLogado() — Mostra a navegação do
         logado conforme o papel, ajusta Contatos/Documentos e dispara
         sessaoNavegacaoDefinida (logado: true).
     - Callback do document ready — Executa moduloSessaoNavegacao.iniciar()
       quando o DOM estiver pronto.
   ============================================================ */

/** Função autoexecutável que isola o escopo do arquivo. */
(function ($) {
  "use strict";

  /*
    sessaoNavegacao.js
    -------------------
    Decide, no carregamento da página, qual bloco de navegação mostrar:
    - navTopoDeslogado, se não houver sessão; ou
    - navLateralLogado + navInferiorLogado + menuHamburguerLogado, se
      houver, ajustando o item de "papel" (Buscar/Início) e o item de
      Contatos/Documentos conforme o tipo de usuário.

    IMPORTANTE — isso é só exibição, não é segurança:
    a checagem aqui NÃO autoriza nada. Cada endpoint que devolve dado
    real (consultas, documentos, agendamentos etc.) precisa validar
    $_SESSION no servidor por conta própria, a cada requisição,
    independente do que este script mostrou na tela.

    Cada tipo de usuário tem sua própria URI de verificação (não existe
    uma rota única "quem-sou-eu"). Por isso o front testa uma a uma, na
    ordem de "tiposParaVerificar": chama a URI do tipo, e só passa para
    a próxima se a resposta vier negativa. Se todas vierem negativas,
    considera o usuário deslogado.

    Contrato esperado de cada URI, respondendo JSON:
      { "logado": true|false }
    (a URI já diz o tipo — ex.: "index.php?uri=cliente" responde se a
    sessão atual é, especificamente, de um cliente.)
  */

  /** Módulo que resolve a sessão e controla a navegação exibida. */
  var moduloSessaoNavegacao = {

    /** Ordem dos tipos a verificar e geração da URL de verificação. */
    configuracao: {
      // Ordem em que os tipos são testados até um responder "logado: true".
      tiposParaVerificar: ["cliente", "profissional", "clinica"],
      /** Devolve a URI de verificação de login do tipo informado. */
      urlVerificarSessaoPorTipo: function (tipo) {
        return "index.php?uri=" + tipo;
      }
    },

    /** Troca ícone e rótulo do item Contatos por 'Documentos' para clienteSimples. */
    // clienteSimples troca o rótulo/ícone do item de Contatos por
    // "Documentos"; os demais tipos mantêm o que já está no HTML.
    itemContatosPorTipo: {
      clienteSimples: { icone: "description", rotulo: "Documentos" }
    },

    /** Cache dos elementos jQuery de navegação. */
    elementos: {},

    /** Ponto de entrada: guarda os elementos e inicia a verificação de sessão. */
    iniciar: function () {
      this.cachearElementos();
      this.verificarSessao();
    },

    /** Busca no DOM e guarda as navegações, o menu hambúrguer e o item de contatos. */
    cachearElementos: function () {
      this.elementos.$navTopoDeslogado = $(".navTopoDeslogado");
      this.elementos.$navsLogado = $(".navLateralLogado, .navInferiorLogado");
      this.elementos.$menuHamburguer = $(".menuHamburguerLogado");
      this.elementos.$itemContatos = $("[data-itemContatos]");
    },

    /** Começa a testar os tipos pelo primeiro da lista. */
    verificarSessao: function () {
      this.testarTipo(this.configuracao.tiposParaVerificar, 0);
    },

    /**
     * Consulta o servidor para o tipo da posição indicada; se negativo ou com falha, tenta o
     * próximo; esgotada a lista, exibe como deslogado.
     */
    // Testa o tipo da posição "indice"; se vier negativo (ou falhar),
    // passa para o próximo. Quando a lista acabar sem nenhum positivo,
    // considera deslogado.
    testarTipo: function (tipos, indice) {
      var self = this;

      if (indice >= tipos.length) {
        self.exibirNavegacaoDeslogado();
        return;
      }

      var tipoAtual = tipos[indice];

      $.ajax({
        url: this.configuracao.urlVerificarSessaoPorTipo(tipoAtual),
        method: "POST",
        dataType: "json",
        data: { acao: "verificarLogin" } // os controllers só leem $_POST["acao"]
      })
        .done(function (resposta) {
          if (resposta && resposta.logado) {
            self.exibirNavegacaoLogado(tipoAtual);
          } else {
            self.testarTipo(tipos, indice + 1);
          }
        })
        .fail(function () {
          self.testarTipo(tipos, indice + 1);
        });
    },

    /**
     * Mostra a barra de deslogado, esconde as de logado e dispara sessaoNavegacaoDefinida (logado:
     * false).
     */
    exibirNavegacaoDeslogado: function () {
      this.elementos.$navTopoDeslogado.removeAttr("hidden");
      this.elementos.$navsLogado.attr("hidden", "hidden");
      this.elementos.$menuHamburguer.attr("hidden", "hidden");

      // Avisa a página (ex.: perfil) que a sessão foi resolvida.
      $(document).trigger("sessaoNavegacaoDefinida", [{ logado: false, tipoUsuario: null }]);
    },

    /**
     * Mostra a navegação do logado conforme o papel, ajusta Contatos/Documentos e dispara
     * sessaoNavegacaoDefinida (logado: true).
     */
    exibirNavegacaoLogado: function (tipoUsuario) {
      var papel;
      if (tipoUsuario === "cliente" || tipoUsuario === "clienteSimples") {
        papel = "cliente";
      } else {
        papel = "profissionalClinica";
      }

      // .data() guarda em cache o valor lido por componentes.js no carregamento
      // (sempre o "data-papel" inicial do HTML); sem atualizar o cache,
      // aplicarPapelNavegacao continuaria enxergando o papel antigo.
      this.elementos.$navsLogado
        .attr("data-papel", papel)
        .data("papel", papel)
        .removeAttr("hidden");
      this.elementos.$menuHamburguer.removeAttr("hidden");
      this.elementos.$navTopoDeslogado.attr("hidden", "hidden");

      var configContatos = this.itemContatosPorTipo[tipoUsuario];
      if (configContatos) {
        this.elementos.$itemContatos
          .find(".material-symbols-outlined")
          .text(configContatos.icone);
        this.elementos.$itemContatos
          .find(".navLateralLogado_rotulo, .navInferiorLogado_rotulo")
          .text(configContatos.rotulo);
      }

      // componentes.js já rodou no documento pronto, sem saber o papel
      // ainda (nav começou "hidden"). Aplica de novo agora que sabemos.
      if (typeof aplicarPapelNavegacao === "function") {
        this.elementos.$navsLogado.each(function () {
          aplicarPapelNavegacao($(this));
        });
      }

      // Avisa a página (ex.: perfil) qual é o tipo de usuário logado
      // (cliente, clienteSimples, profissional ou clinica).
      $(document).trigger("sessaoNavegacaoDefinida", [{ logado: true, tipoUsuario: tipoUsuario }]);
    }
  };

  /** Executa moduloSessaoNavegacao.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloSessaoNavegacao.iniciar();
  });

})(jQuery);
