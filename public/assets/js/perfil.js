/* ============================================================
   ARQUIVO: perfil.js

   O QUE FAZ
   Página de perfil de profissional ou clínica, em dois modos: dono (a pessoa
   logada vê e edita o próprio perfil: biografia, serviços, horários,
   localização e vínculos) e visitante (qualquer pessoa vê o perfil de outra
   em leitura, via ?tipo=...&id=...).

   OBSERVAÇÕES
   - Depende de jQuery, Bootstrap, componentes.js (aplicarPapelNavegacao) e
     ElmoUtilitarios.
   - Elementos com data-perfilDe só aparecem para o tipo do perfil exibido; os
     com data-somenteDono não aparecem para visitantes.
   - O perfil visitado é guardado em history.state e removido da barra de
     endereço; o link com tipo/id só vale ao clicar. ?meu=1 volta ao próprio
     perfil. O backend continua precisando validar o que cada pessoa pode ver.
   - Contratos com disponivel: false (ainda sem backend): editarBio,
     editarLocalizacao, listarVinculos, vincular, desvincular e
     gerenciarVinculos. O JS valida e mostra aviso, mas não envia nada.
   - Existem no backend: verificarLogin, carregarPerfil,
     carregarPerfilPublico, cadastrarServico, cadastrarHorarios (só
     profissional; um dia por chamada) e buscarVinculo.
   - Este arquivo tem sua própria verificação de sessão (ordem profissional,
     clínica, cliente) em vez de usar o evento do sessaoNavegacao.js.
   - enviarServico() envia loc: 1 como 'valor temporário para teste': todo
     serviço cadastrado fica com o local 1.
   - Os dias do serviço são enviados num único número (ser_dia): soma de
     2^índice (Domingo=1 ... Sábado=64). Veja combinarDias/separarDias.
   - O backend só insere horários (sem alterar nem excluir): dias já salvos
     aparecem marcados e travados.
   - hrefInicio do papel cliente aponta para index.php?uri=buscar, enquanto os
     outros arquivos usam uri=busca: confirme a rota.
   - O clique em 'sair' é tratado aqui (limparSessao.php); o evento
     usuarioSolicitouSair de componentes.js não tem ouvinte.
   - Clínica: horários e serviços não vêm do servidor, por isso mostram
     'Informação ainda não disponível'. Cliente logado sem alvo vê 'perfil do
     cliente ainda não disponível'.
   - O comentário original diz 'profissional e clínica', mas visitantes
     (inclusive clientes e deslogados) também usam a página.
   - buscarEnderecoPorCep() (ViaCEP via JSONP, com cache) é parecida com a de
     resultadosBusca.js.

   OBJETOS E FUNÇÕES (na ordem em que aparecem)
   - IIFE — Função autoexecutável que isola o escopo e recebe jQuery e
     ElmoUtilitarios.
     - nomesDias (array) — Nomes dos dias da semana, indexados de 0 (Domingo)
       a 6 (Sábado).
     - urlServico (variável) — URL do controller de serviços.
     - papeis (objeto) — Configuração e textos de cada papel (profissional,
       clínica e cliente-visitante): URLs, links e mensagens.
       - papeis.profissional — Controller, login, agenda e textos de vínculo
         com clínicas do profissional.
       - papeis.clinica — Controller, login, agenda e textos de vínculo com
         profissionais da clínica.
       - papeis.cliente — Cliente (só visitante): define controller, login e
         links de navegação.
     - tiposDePerfil (array) — Tipos de perfil que podem ser exibidos:
       profissional e clínica.
     - moduloPerfil (objeto) — Módulo da página de perfil.
       - moduloPerfil.configuracao — URLs de sair e início, duração do aviso,
         opção de ocultar parâmetros na URL e contratos de backend.
         - configuracao.contratos — Ações de backend (por papel quando
           necessário) e se já estão disponíveis.
       - moduloPerfil.estado — Papel logado, perfil visitado, dados
         carregados, vínculo em uso e caches.
       - moduloPerfil.elementos — Cache dos elementos jQuery da página.
       - moduloPerfil.iniciar() — Guarda os elementos, registra eventos, monta
         formulários, lê o alvo da URL e verifica o login.
       - moduloPerfil.cachearElementos() — Busca no DOM navegações, modais,
         formulários e campos.
       - moduloPerfil.sincronizarAriaInvalid() — Mantém aria-invalid em
         sincronia com as classes de erro, usando um MutationObserver.
       - moduloPerfil.focarPrimeiroInvalido() — Leva o foco ao primeiro campo
         com erro do formulário.
       - moduloPerfil.ehVisitante() — Diz se a página mostra o perfil de outra
         pessoa.
       - moduloPerfil.tipoPerfil() — Tipo do perfil exibido: o do visitado ou
         o de quem está logado.
       - moduloPerfil.configuracaoDoPapel() — Configuração do papel do perfil
         exibido.
       - moduloPerfil.textos() — Textos do papel do perfil exibido.
       - moduloPerfil.ehClinica() — Diz se o perfil exibido é de clínica.
       - moduloPerfil.aplicarPapel() — Mostra só o que vale para o tipo de
         perfil e esconde o que é só do dono para visitantes.
       - moduloPerfil.lerAlvoDaUrl() — Lê tipo e id da URL (ou do
         history.state), valida e limpa a barra de endereço; devolve o alvo ou
         null.
       - moduloPerfil.contratoDisponivel() — Diz se o contrato existe no
         backend e vale para o papel atual.
       - moduloPerfil.chamarContrato() — Faz o POST do contrato (ação conforme
         o papel) ao controller.
       - moduloPerfil.avisarIndisponivel() — Avisa que a ação ainda não está
         disponível no servidor.
       - moduloPerfil.verificarLogin() — Testa em sequência os papéis
         (profissional, clínica, cliente) para descobrir quem está logado.
         - verificarLogin > tentar() — Consulta o papel da posição; se
           negativo ou com falha tenta o próximo; esgotada a lista, trata como
           não logado.
       - moduloPerfil.aoConfirmarLogin() — Guarda o papel, configura a
         navegação e inicia o perfil.
       - moduloPerfil.aoNaoLogar() — Sem login: no perfil próprio abre o modal
         de sessão expirada; como visitante, mostra o perfil normalmente.
       - moduloPerfil.configurarNavegacaoLogado() — Ajusta links e destaques
         das navegações conforme o papel e o modo.
       - moduloPerfil.iniciarPerfil() — Prepara a página (papel, modal de
         vínculo e carga) ou avisa que o perfil do cliente não existe.
       - moduloPerfil.exibirPerfilIndisponivel() — Esconde o perfil e mostra o
         estado 'indisponível' com o texto.
       - moduloPerfil.exibirModalSessaoExpirada() — Abre o modal de sessão
         expirada (sem fechar por fora).
       - moduloPerfil.sair() — Encerra a sessão no servidor e volta ao início.
       - moduloPerfil.carregarPerfil() — Carrega o perfil (próprio ou
         público), guarda os dados e renderiza; trata erros.
       - moduloPerfil.carregarVinculos() — Carrega os vínculos (clínicas ou
         profissionais) ou mostra a lista vazia se o contrato não existe.
       - moduloPerfil.usuarioDoPerfil() — Nome de usuário do perfil (ou o
         nome, se o usuário não vier).
       - moduloPerfil.bioDoPerfil() — Biografia do perfil conforme o tipo.
       - moduloPerfil.definirBioDoPerfil() — Atualiza a biografia no estado
         local.
       - moduloPerfil.renderizarPerfil() — Preenche usuário, biografia,
         serviços ou localização e horários.
       - moduloPerfil.renderizarBio() — Mostra a biografia na tela.
       - moduloPerfil.renderizarServicos() — Monta a tabela de serviços (nome,
         valor, duração e dias).
       - moduloPerfil.renderizarHorarios() — Monta a tabela de horários por
         dia da semana.
       - moduloPerfil.buscarEnderecoPorCep() — Consulta o ViaCEP (JSONP) com
         cache e devolve uma promessa.
       - moduloPerfil.textoEndereco() — Monta 'rua, bairro, cidade - UF' a
         partir do ViaCEP.
       - moduloPerfil.atualizarLinkMaps() — Atualiza o link 'Abrir no Maps'
         com endereço e CEP (ou o esconde).
       - moduloPerfil.renderizarLocalizacao() — Mostra CEP e endereço da
         clínica e atualiza o link do mapa.
       - moduloPerfil.alternarListaOuVazio() — Mostra a tabela ou o estado
         vazio de uma lista.
       - moduloPerfil.clonarModelo() — Clona o conteúdo de um <template> pelo
         id.
       - moduloPerfil.formatarMoeda() — Formata o número como moeda
         brasileira.
       - moduloPerfil.formatarHora() — Reduz a hora para HH:MM.
       - moduloPerfil.mascararValor() — Formata o campo de valor em reais
         enquanto se digita (9000 vira 90,00).
       - moduloPerfil.valorParaBackend() — Converte o valor digitado para
         número com ponto decimal para o backend.
       - moduloPerfil.combinarDias() — Soma 2^índice dos dias escolhidos em um
         único número.
       - moduloPerfil.separarDias() — Faz o inverso: devolve os índices dos
         dias contidos no número combinado.
       - moduloPerfil.exibirAviso() — Mostra um aviso flutuante (toast) de
         erro ou atenção.
       - moduloPerfil.mostrarVisao() — Alterna entre resumo e formulários e
         ajusta o foco.
       - moduloPerfil.prepararVisao() — Prepara os campos da visão antes de
         abri-la.
       - moduloPerfil.cancelarEdicao() — Limpa o formulário e volta ao resumo.
       - moduloPerfil.limparFormulario() — Reinicia o formulário e remove
         marcas de erro.
       - moduloPerfil.enviarBio() — Valida e envia a nova biografia.
       - moduloPerfil.configurarCamposLocalizacao() — Liga o preenchimento por
         CEP aos campos de localização.
       - moduloPerfil.preencherFormularioLocalizacao() — Preenche o formulário
         de localização com o CEP atual e o endereço do ViaCEP.
       - moduloPerfil.enviarLocalizacao() — Valida o CEP e envia a nova
         localização (só o CEP é salvo).
       - moduloPerfil.enviarServico() — Valida e cadastra um novo serviço
         (valor, tipo, duração, dias etc.).
       - moduloPerfil.montarLinhasHorarioFormulario() — Cria as sete linhas
         (uma por dia) do formulário de horários.
       - moduloPerfil.preencherFormularioHorarios() — Marca e trava os dias já
         cadastrados e libera os demais.
       - moduloPerfil.alternarDiaFuncionamento() — Habilita ou desabilita os
         horários do dia marcado.
       - moduloPerfil.atualizarBotaoSalvarHorarios() — Habilita Salvar só se
         houver dia novo marcado.
       - moduloPerfil.enviarHorarios() — Valida e envia os dias novos, uma
         chamada por dia, e recarrega o perfil.
       - moduloPerfil.normalizarVinculo() — Padroniza o item de vínculo
         (profissional ou clínica) do servidor.
       - moduloPerfil.montarCardVinculo() — Cria o card de vínculo, em modo
         'lista' (com desvincular) ou 'seleção' (com selecionar).
       - moduloPerfil.renderizarVinculos() — Mostra a lista de vínculos ou o
         estado vazio.
       - moduloPerfil.prepararModalVinculo() — Ajusta os textos do modal de
         vínculo ao papel.
       - moduloPerfil.abrirVinculo() — Limpa a busca e abre o modal de
         vincular.
       - moduloPerfil.limparBuscaVinculo() — Zera a busca e a seleção do modal
         de vínculo.
       - moduloPerfil.mostrarErroBusca() — Mostra o erro do campo de busca de
         vínculo.
       - moduloPerfil.buscarVinculo() — Busca clínica ou profissional pelo
         usuário e mostra os resultados selecionáveis.
       - moduloPerfil.alternarSelecaoVinculo() — Seleciona ou desmarca um
         resultado (só um por vez).
       - moduloPerfil.enviarVinculo() — Confirma o vínculo selecionado no
         servidor.
       - moduloPerfil.abrirModalDesvincular() — Abre o modal de confirmação
         com o texto do vínculo a remover.
       - moduloPerfil.confirmarDesvinculo() — Desvincula no servidor e
         recarrega os vínculos.
       - moduloPerfil.registrarEventos() — Liga todos os eventos: visões,
         formulários, sair, sessão expirada, horários, vínculos e desvincular.
     - Callback do document ready — Executa moduloPerfil.iniciar() quando o
       DOM estiver pronto.
   ============================================================ */

/* ============================================================
   PÁGINA: perfil (profissional e clínica)
   Depende de: jQuery, Bootstrap 5 (bundle), componentes.js e
               utilitarios.js (window.ElmoUtilitarios).

   Dois modos:
   - Dono: a pessoa logada (profissional ou clínica) vê e edita o próprio perfil.
   - Visitante: qualquer pessoa (cliente, profissional, clínica ou sem login)
     vê o perfil de outra em modo leitura. O perfil visitado chega por
     ?tipo=...&id=..., que o JS guarda em history.state e tira da barra de
     endereço (ver lerAlvoDaUrl). Elementos com data-somenteDono não aparecem
     para visitantes.

   O tipo do perfil exibido (profissional ou clínica) decide o que aparece:
   todo elemento com data-perfilDe="profissional|clinica" só aparece
   para o tipo correspondente.

   Backend NÃO é alterado por este arquivo. Cada chamada ao servidor
   está registrada em "contratos". Os que têm "disponivel: true"
   já existem no backend e são chamados de verdade. Os que têm
   "disponivel: false" ainda não existem: o JS valida o formulário,
   mostra os estados visuais e um aviso, mas NÃO envia nada.
   Quando o backend implementar a ação, basta trocar para
   "disponivel: true" (e ajustar o nome da ação, se for diferente).
   Quando "acao" é um objeto por papel e não tem o papel atual (ex.:
   clínica), o contrato também conta como indisponível.
   ============================================================ */

/** Função autoexecutável que isola o escopo e recebe jQuery e ElmoUtilitarios. */
(function ($, Utilitarios) {
  "use strict";

  /** Nomes dos dias da semana, indexados de 0 (Domingo) a 6 (Sábado). */
  var nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  /** URL do controller de serviços. */
  var urlServico = "index.php?uri=servico";

  /**
   * Configuração e textos de cada papel (profissional, clínica e cliente-visitante): URLs, links e
   * mensagens.
   */
  /* Configuração e textos de cada papel */
  var papeis = {
    /** Controller, login, agenda e textos de vínculo com clínicas do profissional. */
    profissional: {
      url: "index.php?uri=profissional",
      urlLogin: "index.php?uri=loginProfissional",
      hrefAgenda: "index.php?uri=agendaProfissional",
      listaVinculos: "clinicas",
      iconeVinculo: "apartment",
      textos: {
        tituloVinculo: "Vincular Clínica",
        rotuloVinculo: "Digite o usuário da clínica que deseja vincular:",
        placeholderVinculo: "Digite o usuário da clínica",
        buscaVazia: "Digite o usuário da clínica.",
        naoEncontrado: "Clínica não encontrada.",
        selecioneAntes: "Antes de confirmar, você precisa selecionar uma clínica.",
        rotuloSelecionar: "Selecionar clínica",
        rotuloDesvincular: "Desvincular clínica",
        desvinculoAbertura: "Você está prestes a desvincular a clínica ",
        desvinculoConsequencia: "Se continuar com isso, ela não aparecerá mais como uma clínica em que você trabalha. Dessa forma, os clientes não poderão agendar uma consulta com você nessa localização e suas futuras consultas não aparecerão no relatório dessa clínica."
      }
    },
    /** Controller, login, agenda e textos de vínculo com profissionais da clínica. */
    clinica: {
      url: "index.php?uri=clinica",
      urlLogin: "index.php?uri=loginClinica",
      hrefAgenda: "index.php?uri=agendaClinica",
      listaVinculos: "profissionais",
      iconeVinculo: "person",
      textos: {
        tituloVinculo: "Vincular Profissional",
        rotuloVinculo: "Digite o usuário do profissional que deseja vincular:",
        placeholderVinculo: "Digite o usuário do profissional",
        buscaVazia: "Digite o usuário do profissional.",
        naoEncontrado: "Profissional não encontrado.",
        selecioneAntes: "Antes de confirmar, você precisa selecionar um profissional.",
        rotuloSelecionar: "Selecionar profissional",
        rotuloDesvincular: "Desvincular profissional",
        desvinculoAbertura: "Você está prestes a desvincular o profissional ",
        desvinculoConsequencia: "Se continuar com isso, esse profissional não aparecerá mais como parte da sua clínica. Dessa forma, os clientes não poderão agendar uma consulta com ele nessa localização e as futuras consultas dele não aparecerão no relatório da clínica."
      }
    },
    /** Cliente (só visitante): define controller, login e links de navegação. */
    // Cliente só entra aqui como visitante: define navegação e login.
    cliente: {
      url: "index.php?uri=cliente",
      urlLogin: "index.php?uri=loginCliente",
      hrefAgenda: "index.php?uri=consultasCli",
      hrefInicio: "index.php?uri=buscar"
    }
  };

  /** Tipos de perfil que podem ser exibidos: profissional e clínica. */
  var tiposDePerfil = ["profissional", "clinica"];

  /** Módulo da página de perfil. */
  var moduloPerfil = {

    /* ---------- Configuração ---------- */
    /**
     * URLs de sair e início, duração do aviso, opção de ocultar parâmetros na URL e contratos de
     * backend.
     */
    configuracao: {
      urlSair: "limparSessao.php",
      urlInicio: "index.php",
      duracaoAviso: 4000,
      ocultarParametrosNaUrl: true, // tira tipo e id da barra de endereço (usa history.state)

      /** Ações de backend (por papel quando necessário) e se já estão disponíveis. */
      /*
        Contratos de backend. "acao" pode variar por papel.
        Sem "url", usa a URL do controlador do papel (profissional ou clínica).
      */
      contratos: {
        // Já existem no backend
        verificarLogin:    { acao: "verificarLogin", disponivel: true },
        carregarPerfil:    { acao: { profissional: "PegarPerfil", clinica: "pegarinfo" }, disponivel: true },
        cadastrarServico:  { url: urlServico, acao: "cadastrar", disponivel: true },

        // Perfil visitado: busca/mostrardetalhes devolve { sucesso, dados: [linha] } só com os
        // dados básicos (sem horários nem serviços).
        carregarPerfilPublico: { url: "index.php?uri=busca", acao: "mostrardetalhes", disponivel: true }, // dados: tipo, id

        // Horários: o backend só insere, um dia por chamada (profissional). Clínica: sem ação.
        cadastrarHorarios: { acao: { profissional: "atribuirHrServico" }, disponivel: true }, // dados: dia, inicio, termino

        //Busca orar gerenciamento
        buscarVinculo: { url: "index.php?uri=busca", acao: "busca", disponivel: true },
        // Ainda não existem: contrato preparado (envia { acao, ...dados })
        editarBio:         { acao: "editarBio",          disponivel: false }, // dados: bio
        editarLocalizacao: { acao: "editarLocalizacao",  disponivel: false }, // dados: cep (clínica; o resto vem do ViaCEP)
        listarVinculos:    { acao: "listarVinculos",     disponivel: false }, // dados: idPerfil (só no modo visitante); resposta: { sucesso, dados: [item] }
        //buscarVinculo:     { acao: "buscarVinculo",      disponivel: false }, // dados: usuario; resposta: { sucesso, dados: item }
        vincular:          { acao: "vincular",           disponivel: false }, // dados: idVinculo
        desvincular:       { acao: "desvincular",        disponivel: false }, // dados: idVinculo
        gerenciarVinculos: { acao: "gerenciarVinculos",  disponivel: false }
      }
    },

    /* ---------- Estado interno ---------- */
    /** Papel logado, perfil visitado, dados carregados, vínculo em uso e caches. */
    estado: {
      papel: null,           // quem está logado: "profissional" | "clinica" | "cliente" | null
      alvo: null,            // modo visitante: { tipo, id }; null = perfil do próprio usuário
      perfil: null,          // linha do perfil (dados1[0])
      horarios: [],          // dados2
      servicos: [],          // dados3 (só profissional)
      vinculoBuscado: null,  // resultado da busca no modal de vínculo
      vinculoSelecionado: null,
      vinculoParaDesvincular: null,
      cacheEnderecos: {},    // CEP (só números) -> resposta do ViaCEP
      origemFoco: null       // botão que abriu a última visão (recebe o foco ao voltar)
    },

    /** Cache dos elementos jQuery da página. */
    elementos: {},

    /**
     * Guarda os elementos, registra eventos, monta formulários, lê o alvo da URL e verifica o
     * login.
     */
    iniciar: function () {
      this.cachearElementos();
      this.sincronizarAriaInvalid();
      this.registrarEventos();
      this.montarLinhasHorarioFormulario();
      this.configurarCamposLocalizacao();
      this.estado.alvo = this.lerAlvoDaUrl();
      this.verificarLogin();
    },

    /** Busca no DOM navegações, modais, formulários e campos. */
    cachearElementos: function () {
      var e = this.elementos;
      e.$navsLogado = $(".navTopoLogado, .navLateralLogado, .navInferiorLogado");
      e.$modalSessaoExpirada = $("#modalSessaoExpirada");
      e.$modalVincular = $("#modalVincular");
      e.$modalDesvincular = $("#modalDesvincular");
      e.$aviso = $("#avisoPerfil");

      e.$formularioBio = $("#formularioBio");
      e.$formularioServico = $("#formularioServico");
      e.$formularioLocalizacao = $("#formularioLocalizacao");
      e.$formularioHorarios = $("#formularioHorarios");
      e.$formularioVinculo = $("#formularioVinculo");

      e.$campoBioNova = $("#campoBioNova");
      e.$campoTipoServico = $("#campoTipoServico");
      e.$campoValorServico = $("#campoValorServico");
      e.$listaLinhasHorario = $('[data-lista="linhasHorario"]');
      e.$botaoSalvarHorarios = $("#botaoSalvarHorarios");
      e.$campoUsuarioVinculo = $("#campoUsuarioVinculo");
      e.$mensagemUsuarioVinculo = $("#mensagemUsuarioVinculo");
      e.$resultadoVinculo = $('[data-lista="resultadoVinculo"]');

      e.$camposLocalizacao = {
        cep: $("#campoCepLocalizacao"),
        rua: $("#campoRuaLocalizacao"),
        bairro: $("#campoBairroLocalizacao"),
        cidade: $("#campoCidadeLocalizacao"),
        uf: $("#campoEstadoLocalizacao"),
        ibge: $("#campoIbgeLocalizacao")
      };
    },

    /** Mantém aria-invalid em sincronia com as classes de erro, usando um MutationObserver. */
    /*
      Acessibilidade dos erros: mantém aria-invalid em sincronia com as classes de erro
      (is-invalid nos campos e campoSelect--erro no select), inclusive quando o erro é
      marcado por utilitarios.js (ex.: CEP inválido). Assim cada ponto de validação
      só precisa marcar a classe.
    */
    sincronizarAriaInvalid: function () {
      var observador = new MutationObserver(function (mudancas) {
        $.each(mudancas, function (_, mudanca) {
          var $elemento = $(mudanca.target);

          if ($elemento.is("input, textarea")) {
            var ariaInvalido;
            if ($elemento.hasClass("is-invalid")) {
              ariaInvalido = "true";
            } else {
              ariaInvalido = null;
            }
            $elemento.attr("aria-invalid", ariaInvalido);
          } else if ($elemento.is(".campoSelect")) {
            var ariaInvalidoGatilho;
            if ($elemento.hasClass("campoSelect--erro")) {
              ariaInvalidoGatilho = "true";
            } else {
              ariaInvalidoGatilho = null;
            }
            $elemento.find(".campoSelect_gatilho").attr("aria-invalid", ariaInvalidoGatilho);
          }
        });
      });

      observador.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
    },

    /** Leva o foco ao primeiro campo com erro do formulário. */
    // Leva o foco ao primeiro campo com erro do formulário (teclado e leitor de tela).
    focarPrimeiroInvalido: function ($escopo) {
      $escopo.find("input.is-invalid, textarea.is-invalid, .campoSelect--erro .campoSelect_gatilho").first().trigger("focus");
    },

    /* ---------- Papel, modo e tipo de perfil ---------- */
    /** Diz se a página mostra o perfil de outra pessoa. */
    ehVisitante: function () {
      if (this.estado.alvo) {
        return true;
      } else {
        return false;
      }
    },

    /** Tipo do perfil exibido: o do visitado ou o de quem está logado. */
    // Tipo do perfil exibido: o do visitado (modo visitante) ou o de quem está logado.
    tipoPerfil: function () {
      if (this.estado.alvo) {
        return this.estado.alvo.tipo;
      } else {
        return this.estado.papel;
      }
    },

    /** Configuração do papel do perfil exibido. */
    configuracaoDoPapel: function () {
      return papeis[this.tipoPerfil()];
    },

    /** Textos do papel do perfil exibido. */
    textos: function () {
      return papeis[this.tipoPerfil()].textos;
    },

    /** Diz se o perfil exibido é de clínica. */
    ehClinica: function () {
      return this.tipoPerfil() === "clinica";
    },

    /** Mostra só o que vale para o tipo de perfil e esconde o que é só do dono para visitantes. */
    aplicarPapel: function () {
      var tipo = this.tipoPerfil();

      $("[data-perfilDe]").each(function () {
        var atributoHidden;
        if ($(this).attr("data-perfilDe") === tipo) {
          atributoHidden = null;
        } else {
          atributoHidden = "hidden";
        }
        $(this).attr("hidden", atributoHidden);
      });

      // Visitante não vê o que é só do dono (editar, vincular, Relatório...)
      if (this.ehVisitante()) {
        $("[data-somenteDono]").attr("hidden", "hidden");

        // Documentos (certificados do profissional) é visível a todos; o visitante
        // abre os documentos do perfil visitado, não os dele (alvo.id já é numérico).
        $("#linkDocumentos").attr("href", "index.php?uri=documentos&id=" + encodeURIComponent(this.estado.alvo.id));
      }
    },

    /**
     * Lê tipo e id da URL (ou do history.state), valida e limpa a barra de endereço; devolve o alvo
     * ou null.
     */
    /*
      Perfil visitado: lê tipo e id da URL, guarda em history.state e limpa a URL.
      - ?tipo=clinica&id=7  -> abre esse perfil e a barra de endereço fica só index.php?uri=perfil
      - recarregar a página mantém o perfil (history.state sobrevive ao reload)
      - ?meu=1 (link "Perfil" da navegação no modo visitante) -> volta ao próprio perfil
      Obs.: o link com tipo/id deixa de funcionar depois de limpo; ele só vale ao clicar.
      O backend continua recebendo o id e deve validar o que cada pessoa pode ver.
    */
    lerAlvoDaUrl: function () {
      var parametros = new URLSearchParams(window.location.search);
      var tipo = parametros.get("tipo");
      var id = parametros.get("id");
      var alvo = null;
      var urlLimpa = window.location.pathname + "?uri=perfil";

      if (parametros.get("meu")) {
        alvo = null;
      } else if ($.inArray(tipo, tiposDePerfil) !== -1 && /^[0-9]+$/.test(id || "")) {
        alvo = { tipo: tipo, id: id };
      } else if (window.history.state && window.history.state.perfilVisitado) {
        var guardado = window.history.state.perfilVisitado;
        if ($.inArray(guardado.tipo, tiposDePerfil) !== -1 && /^[0-9]+$/.test(String(guardado.id))) {
          alvo = guardado;
        }
      }

      var haParametros = parametros.has("tipo") || parametros.has("id") || parametros.has("meu");
      if (this.configuracao.ocultarParametrosNaUrl && haParametros) {
        try {
          var estadoHistorico;
          if (alvo) {
            estadoHistorico = { perfilVisitado: alvo };
          } else {
            estadoHistorico = null;
          }
          window.history.replaceState(estadoHistorico, "", urlLimpa);
        } catch (erro) {
          // sem history.replaceState: mantém a URL como está
        }
      }
      return alvo;
    },

    /* ---------- Contratos de backend ---------- */
    /** Diz se o contrato existe no backend e vale para o papel atual. */
    contratoDisponivel: function (nome) {
      var contrato = this.configuracao.contratos[nome];

      if (!contrato.disponivel) {
        return false;
      }
      // Ação por papel: só vale se existir para o papel atual
      if (typeof contrato.acao === "object") {
        if (contrato.acao[this.tipoPerfil()]) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },

    /** Faz o POST do contrato (ação conforme o papel) ao controller. */
    chamarContrato: function (nome, dados, tipoResposta, papel) {
      var contrato = this.configuracao.contratos[nome];
      papel = papel || this.tipoPerfil();
      var acao;
      if (typeof contrato.acao === "object") {
        acao = contrato.acao[papel];
      } else {
        acao = contrato.acao;
      }

      return $.ajax({
        url: contrato.url || papeis[papel].url,
        method: "POST",
        dataType: tipoResposta || "json",
        data: $.extend({ acao: acao }, dados || {})
      });
    },

    /** Avisa que a ação ainda não está disponível no servidor. */
    avisarIndisponivel: function () {
      this.exibirAviso("Essa ação ainda não está disponível no servidor.", "atencao");
    },

    /* ---------- Sessão ---------- */
    /**
     * Testa em sequência os papéis (profissional, clínica, cliente) para descobrir quem está
     * logado.
     */
    verificarLogin: function () {
      var self = this;
      var ordem = ["profissional", "clinica", "cliente"];

      /**
       * Consulta o papel da posição; se negativo ou com falha tenta o próximo; esgotada a lista,
       * trata como não logado.
       */
      function tentar(indice) {
        if (indice >= ordem.length) {
          self.aoNaoLogar();
          return;
        }
        self.chamarContrato("verificarLogin", null, "json", ordem[indice])
          .done(function (resposta) {
            if (resposta && resposta.logado) {
              self.aoConfirmarLogin(ordem[indice]);
            } else {
              tentar(indice + 1);
            }
          })
          .fail(function () {
            tentar(indice + 1);
          });
      }

      tentar(0);
    },

    /** Guarda o papel, configura a navegação e inicia o perfil. */
    aoConfirmarLogin: function (papel) {
      this.estado.papel = papel;
      this.configurarNavegacaoLogado();
      this.iniciarPerfil();
    },

    /**
     * Sem login: no perfil próprio abre o modal de sessão expirada; como visitante, mostra o perfil
     * normalmente.
     */
    aoNaoLogar: function () {
      // Visitante sem login pode ver o perfil; no perfil próprio, precisa logar.
      if (!this.ehVisitante()) {
        this.exibirModalSessaoExpirada();
        return;
      }
      $(".navTopoDeslogado").removeAttr("hidden");
      $("#conteudoPerfil").addClass("conteudoPerfil--semNavLateral");
      this.iniciarPerfil();
    },

    /** Ajusta links e destaques das navegações conforme o papel e o modo. */
    configurarNavegacaoLogado: function () {
      var papel = this.estado.papel;
      var config = papeis[papel];
      var $navs = this.elementos.$navsLogado;

      if (papel === "cliente") {
        // Mesma navegação das telas do cliente (Buscar + consultas)
        $navs.filter("[data-papel]").attr("data-papel", "cliente").each(function () {
          if (typeof aplicarPapelNavegacao === "function") {
            aplicarPapelNavegacao($(this));
          }
        });
        $("[data-itemPapel]").attr("href", config.hrefInicio);
      }
      $("[data-itemAgenda]").attr("href", config.hrefAgenda);

      if (this.ehVisitante()) {
        // Não é o perfil do próprio usuário: tira o destaque e deixa o link voltar ao "meu perfil"
        $(".navLateralLogado_item--ativo, .navInferiorLogado_item--ativo")
          .removeClass("navLateralLogado_item--ativo navInferiorLogado_item--ativo")
          .removeAttr("aria-current");
        $("[data-itemPerfil]").attr("href", "index.php?uri=perfil&meu=1");
      }
      $navs.removeAttr("hidden");
    },

    /**
     * Prepara a página (papel, modal de vínculo e carga) ou avisa que o perfil do cliente não
     * existe.
     */
    iniciarPerfil: function () {
      if (this.ehVisitante() || $.inArray(this.estado.papel, tiposDePerfil) !== -1) {
        this.aplicarPapel();
        this.prepararModalVinculo();
        this.carregarPerfil();
        return;
      }
      // Cliente logado, sem perfil visitado: o perfil do cliente ainda não existe.
      this.exibirPerfilIndisponivel("O perfil do cliente ainda não está disponível.");
    },

    /** Esconde o perfil e mostra o estado 'indisponível' com o texto. */
    exibirPerfilIndisponivel: function (texto) {
      $(".cabecalhoPerfil, .abasPerfil, .conteudoAbas").attr("hidden", "hidden");
      $('[data-campo="textoPerfilIndisponivel"]').text(texto);
      $('[data-estadoVazio="perfilIndisponivel"]').removeAttr("hidden");
      $("#conteudoPerfil").attr("aria-busy", "false");
    },

    /** Abre o modal de sessão expirada (sem fechar por fora). */
    exibirModalSessaoExpirada: function () {
      Utilitarios.exibirModal(this.elementos.$modalSessaoExpirada, {
        backdrop: "static",
        keyboard: false
      });
    },

    /** Encerra a sessão no servidor e volta ao início. */
    sair: function () {
      var self = this;
      $.ajax({ url: this.configuracao.urlSair, method: "POST" }).always(function () {
        window.location.href = self.configuracao.urlInicio;
      });
    },

    /* ---------- Carregamento do perfil ---------- */
    /** Carrega o perfil (próprio ou público), guarda os dados e renderiza; trata erros. */
    carregarPerfil: function () {
      var self = this;
      var visitante = this.ehVisitante();
      var contrato;
      if (visitante) {
        contrato = "carregarPerfilPublico";
      } else {
        contrato = "carregarPerfil";
      }

      this.carregarVinculos();

      if (!this.contratoDisponivel(contrato)) {
        this.exibirPerfilIndisponivel("Perfil indisponível no momento.");
        return;
      }

      var dadosPerfil;
      if (visitante) {
        dadosPerfil = { tipo: this.estado.alvo.tipo, id: this.estado.alvo.id };
      } else {
        dadosPerfil = null;
      }
      this.chamarContrato(contrato, dadosPerfil)
        .done(function (resposta) {
          if (!resposta || !resposta.sucesso) {
            if (visitante) {
              self.exibirPerfilIndisponivel("Perfil não encontrado.");
            } else {
              self.exibirAviso("Não foi possível carregar o perfil. Tente novamente.", "erro");
              $("#conteudoPerfil").attr("aria-busy", "false");
            }
            return;
          }
          if (visitante) {
            // mostrardetalhes: { sucesso, dados: [linha] }, sem horários nem serviços
            if (!$.isArray(resposta.dados) || !resposta.dados.length) {
              self.exibirPerfilIndisponivel("Perfil não encontrado.");
              return;
            }
            self.estado.perfil = resposta.dados[0];
            self.estado.horarios = [];
            self.estado.servicos = [];
          } else {
            // PegarPerfil (profissional) devolve dados1/dados2/dados3; pegarinfo (clínica) só dados1
            self.estado.perfil = (resposta.dados1 && resposta.dados1[0]) || {};
            self.estado.horarios = resposta.dados2 || [];
            self.estado.servicos = resposta.dados3 || [];
          }
          self.renderizarPerfil();
          $("#conteudoPerfil").attr("aria-busy", "false");
        })
        .fail(function () {
          if (visitante) {
            self.exibirPerfilIndisponivel("Perfil indisponível no momento.");
          } else {
            self.exibirAviso("Não foi possível carregar o perfil. Tente novamente.", "erro");
            $("#conteudoPerfil").attr("aria-busy", "false");
          }
        });
    },

    /**
     * Carrega os vínculos (clínicas ou profissionais) ou mostra a lista vazia se o contrato não
     * existe.
     */
    carregarVinculos: function () {
      var self = this;

      if (!this.contratoDisponivel("listarVinculos")) {
        this.renderizarVinculos([]);
        return;
      }

      var dadosVinculos;
      if (this.ehVisitante()) {
        dadosVinculos = { idPerfil: this.estado.alvo.id };
      } else {
        dadosVinculos = null;
      }
      this.chamarContrato("listarVinculos", dadosVinculos)
        .done(function (resposta) {
          var vinculos;
          if (resposta && resposta.sucesso) {
            vinculos = resposta.dados;
          } else {
            vinculos = [];
          }
          self.renderizarVinculos(vinculos);
        })
        .fail(function () {
          self.renderizarVinculos([]);
        });
    },

    /* ---------- Leitura do perfil por papel ---------- */
    /** Nome de usuário do perfil (ou o nome, se o usuário não vier). */
    usuarioDoPerfil: function () {
      var p = this.estado.perfil || {};
      // O backend não devolve o usuário (pro_user / clin_user) em PegarPerfil / pegarinfo; usa o nome se faltar.
      if (this.ehClinica()) {
        return p.clin_user || p.clin_nome || "";
      } else {
        return p.pro_user || p.pro_nome || "";
      }
    },

    /** Biografia do perfil conforme o tipo. */
    bioDoPerfil: function () {
      var p = this.estado.perfil || {};
      var biografia;
      if (this.ehClinica()) {
        biografia = p.clin_bio;
      } else {
        biografia = p.pro_bio;
      }
      return biografia || "";
    },

    /** Atualiza a biografia no estado local. */
    definirBioDoPerfil: function (bio) {
      var campoBio;
      if (this.ehClinica()) {
        campoBio = "clin_bio";
      } else {
        campoBio = "pro_bio";
      }
      this.estado.perfil[campoBio] = bio;
    },

    /* ---------- Renderização ---------- */
    /** Preenche usuário, biografia, serviços ou localização e horários. */
    renderizarPerfil: function () {
      $('[data-campo="usuario"]').text(this.usuarioDoPerfil());
      this.renderizarBio();

      if (this.ehClinica()) {
        this.renderizarLocalizacao();
      } else {
        this.renderizarServicos();
      }
      this.renderizarHorarios();
      this.preencherFormularioHorarios();

      // Horários e serviços não vêm do servidor no perfil visitado nem no da clínica
      if (this.ehVisitante() || this.ehClinica()) {
        $('[data-estadoVazio="servicos"] .estadoVazio_texto, [data-estadoVazio="horarios"] .estadoVazio_texto')
          .text("Informação ainda não disponível");
      }
    },

    /** Mostra a biografia na tela. */
    renderizarBio: function () {
      $('[data-campo="bio"]').text(this.bioDoPerfil());
    },

    /** Monta a tabela de serviços (nome, valor, duração e dias). */
    renderizarServicos: function () {
      var self = this;
      var $corpo = $('[data-lista="servicos"]').empty();
      var servicos = this.estado.servicos;

      $.each(servicos, function (_, servico) {
        var $linha = self.clonarModelo("modeloLinhaServico");
        var $dias = $linha.find('[data-campo="diasServico"]');

        $linha.find('[data-campo="nomeServico"]').text(servico.ser_nome);
        $linha.find('[data-campo="valorServico"]').text(self.formatarMoeda(servico.ser_val));
        $linha.find('[data-campo="duracaoServico"]').text(servico.ser_dur + " min");

        $.each(self.separarDias(servico.ser_dia), function (_, indice) {
          $dias.append($("<div>").text(nomesDias[indice]));
        });

        $corpo.append($linha);
      });

      this.alternarListaOuVazio("servicos", servicos.length > 0);
    },

    /** Monta a tabela de horários por dia da semana. */
    renderizarHorarios: function () {
      var self = this;
      var $corpo = $('[data-lista="horarios"]').empty();
      var horarios = this.estado.horarios.slice().sort(function (a, b) {
        return Number(a.hrser_dia) - Number(b.hrser_dia);
      });

      $.each(horarios, function (_, horario) {
        var $linha = self.clonarModelo("modeloLinhaHorario");
        $linha.find('[data-campo="diaSemana"]').text(nomesDias[Number(horario.hrser_dia)]);
        $linha.find('[data-campo="horaAbertura"]').text(self.formatarHora(horario.hrser_hrini));
        $linha.find('[data-campo="horaFechamento"]').text(self.formatarHora(horario.hrser_hrterm));
        $corpo.append($linha);
      });

      this.alternarListaOuVazio("horarios", horarios.length > 0);
    },

    /** Consulta o ViaCEP (JSONP) com cache e devolve uma promessa. */
    /*
      Endereço por CEP (ViaCEP): o backend guarda e devolve apenas o CEP.
      Rua, bairro, cidade, UF e IBGE são preenchidos aqui, no frontend.
    */
    buscarEnderecoPorCep: function (cep) {
      var cepNumerico = Utilitarios.apenasNumeros(cep || "");
      var cache = this.estado.cacheEnderecos;
      var resultado = $.Deferred();

      if (!/^[0-9]{8}$/.test(cepNumerico)) {
        return resultado.reject().promise();
      }
      if (cache[cepNumerico]) {
        return resultado.resolve(cache[cepNumerico]).promise();
      }

      $.ajax({
        url: "https://viacep.com.br/ws/" + cepNumerico + "/json/",
        dataType: "jsonp",
        timeout: 8000
      })
        .done(function (dados) {
          if (!dados || dados.erro) {
            resultado.reject();
            return;
          }
          cache[cepNumerico] = dados;
          resultado.resolve(dados);
        })
        .fail(function () {
          resultado.reject();
        });

      return resultado.promise();
    },

    /** Monta 'rua, bairro, cidade - UF' a partir do ViaCEP. */
    textoEndereco: function (dadosViaCep) {
      var cidadeUf = [dadosViaCep.localidade, dadosViaCep.uf].filter(Boolean).join(" - ");
      return [dadosViaCep.logradouro, dadosViaCep.bairro, cidadeUf].filter(Boolean).join(", ");
    },

    /** Atualiza o link 'Abrir no Maps' com endereço e CEP (ou o esconde). */
    atualizarLinkMaps: function (cepFormatado, endereco) {
      var prefixoEndereco;
      if (endereco) {
        prefixoEndereco = endereco + " ";
      } else {
        prefixoEndereco = "";
      }
      var consulta = $.trim(prefixoEndereco + cepFormatado);
      var $maps = $("#botaoAbrirMaps");

      if (consulta) {
        $maps.attr("href", "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta)).removeAttr("hidden");
      } else {
        $maps.attr("hidden", "hidden");
      }
    },

    /** Mostra CEP e endereço da clínica e atualiza o link do mapa. */
    renderizarLocalizacao: function () {
      var self = this;
      var cepBruto = (this.estado.perfil || {}).clin_cep || "";
      var cep;
      if (cepBruto) {
        cep = Utilitarios.formatarMascara("cep", cepBruto);
      } else {
        cep = "";
      }
      var $endereco = $('[data-campo="enderecoClinica"]');

      $('[data-campo="cepClinica"]').text(cep || "Não informado");
      this.atualizarLinkMaps(cep, "");

      if (!cep) {
        $endereco.text("Não informado");
        return;
      }

      $endereco.text("Carregando...");
      this.buscarEnderecoPorCep(cepBruto)
        .done(function (dados) {
          // ignora respostas de um CEP que já foi trocado
          if (Utilitarios.apenasNumeros((self.estado.perfil || {}).clin_cep || "") !== Utilitarios.apenasNumeros(cepBruto)) {
            return;
          }
          var endereco = self.textoEndereco(dados);
          $endereco.text(endereco || "Não informado");
          self.atualizarLinkMaps(cep, endereco);
        })
        .fail(function () {
          $endereco.text("Não foi possível carregar o endereço.");
        });
    },

    /** Mostra a tabela ou o estado vazio de uma lista. */
    alternarListaOuVazio: function (nome, temItens) {
      var hiddenTabela;
      if (temItens) {
        hiddenTabela = null;
      } else {
        hiddenTabela = "hidden";
      }
      $('[data-tabela="' + nome + '"]').attr("hidden", hiddenTabela);
      var hiddenEstadoVazio;
      if (temItens) {
        hiddenEstadoVazio = "hidden";
      } else {
        hiddenEstadoVazio = null;
      }
      $('[data-estadoVazio="' + nome + '"]').attr("hidden", hiddenEstadoVazio);
    },

    /** Clona o conteúdo de um <template> pelo id. */
    clonarModelo: function (idModelo) {
      return $(document.getElementById(idModelo).content.firstElementChild.cloneNode(true));
    },

    /* ---------- Formatação e conversões ---------- */
    /** Formata o número como moeda brasileira. */
    formatarMoeda: function (valor) {
      return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    /** Reduz a hora para HH:MM. */
    formatarHora: function (hora) {
      return String(hora || "").slice(0, 5);
    },

    /** Formata o campo de valor em reais enquanto se digita (9000 vira 90,00). */
    // Campo de valor: digita só números e o JS formata em reais (ex.: 9000 -> 90,00).
    mascararValor: function ($campo) {
      var centavos = Utilitarios.apenasNumeros($campo.val());
      if (!centavos) {
        $campo.val("");
        return;
      }
      $campo.val((Number(centavos) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    },

    /** Converte o valor digitado para número com ponto decimal para o backend. */
    valorParaBackend: function ($campo) {
      var centavos = Utilitarios.apenasNumeros($campo.val());
      if (centavos) {
        return (Number(centavos) / 100).toFixed(2);
      } else {
        return "";
      }
    },

    /** Soma 2^índice dos dias escolhidos em um único número. */
    /*
      Dias do serviço em UM valor combinado (a coluna ser_dia é um inteiro).
      Cada dia vale 2^indice (Domingo = 1, Segunda = 2, Terça = 4, ... Sábado = 64),
      e o valor enviado é a soma. Ex.: Segunda + Quarta + Sexta = 2 + 8 + 32 = 42.
      Esse formato evita ambiguidade (o Domingo, índice 0, não se perde).
      É o único ponto que define o formato: combinarDias e separarDias.
    */
    combinarDias: function (indices) {
      var soma = 0;
      $.each(indices, function (_, indice) {
        soma += Math.pow(2, Number(indice));
      });
      return soma;
    },

    /** Faz o inverso: devolve os índices dos dias contidos no número combinado. */
    separarDias: function (valorCombinado) {
      var numero = parseInt(valorCombinado, 10) || 0;
      var indices = [];
      for (var indice = 0; indice < nomesDias.length; indice++) {
        if (numero & Math.pow(2, indice)) {
          indices.push(indice);
        }
      }
      return indices;
    },

    /* ---------- Avisos (toast) ---------- */
    /** Mostra um aviso flutuante (toast) de erro ou atenção. */
    exibirAviso: function (mensagem, tipo) {
      var $aviso = this.elementos.$aviso;
      var icone;
      if (tipo === "atencao") {
        icone = "warning";
      } else {
        icone = "error";
      }

      $aviso.toggleClass("avisoFlutuante--atencao", tipo === "atencao");
      $aviso.find(".avisoFlutuante_icone").text(icone);
      $aviso.find('[data-campo="mensagemAviso"]').text(mensagem);

      bootstrap.Toast.getOrCreateInstance($aviso.get(0), {
        delay: this.configuracao.duracaoAviso
      }).show();
    },

    /* ---------- Navegação entre visões ---------- */
    /** Alterna entre resumo e formulários e ajusta o foco. */
    mostrarVisao: function (nomeVisao) {
      var $alvo = $('.visaoPerfil[data-visao="' + nomeVisao + '"]');
      var origem = this.estado.origemFoco;

      $alvo.siblings(".visaoPerfil").attr("hidden", "hidden");
      $alvo.removeAttr("hidden");
      window.scrollTo(0, 0);

      var $titulo = $alvo.find(".formularioPerfil_titulo").first();
      if ($titulo.length) {
        // Formulário: foco no título
        $titulo.attr("tabindex", "-1").trigger("focus");
      } else if (origem && $.contains(document.body, origem) && !$(origem).closest("[hidden]").length) {
        // Resumo: devolve o foco ao botão que abriu o formulário
        $(origem).trigger("focus");
      } else {
        $alvo.attr("tabindex", "-1").trigger("focus");
      }
    },

    /** Prepara os campos da visão antes de abri-la. */
    prepararVisao: function (nomeVisao) {
      if (nomeVisao === "edicaoBio") {
        $("#campoBioAtual").val(this.bioDoPerfil());
        this.elementos.$campoBioNova.val("");
      }
      if (nomeVisao === "edicaoLocalizacao") {
        this.preencherFormularioLocalizacao();
      }
      if (nomeVisao === "cadastroHorarios") {
        this.preencherFormularioHorarios();
      }
    },

    /** Limpa o formulário e volta ao resumo. */
    cancelarEdicao: function ($botao) {
      var $formulario = $botao.closest("form");
      var $visaoResumo = $botao.closest(".tab-pane").children(".visaoPerfil").first();

      this.limparFormulario($formulario);
      this.mostrarVisao($visaoResumo.attr("data-visao"));
    },

    /** Reinicia o formulário e remove marcas de erro. */
    limparFormulario: function ($formulario) {
      $formulario.get(0).reset();
      $formulario.find(".is-invalid").removeClass("is-invalid");
      $formulario.find(".campoSelect--erro").removeClass("campoSelect--erro");
      $formulario.find(".campoSelect").each(function () {
        $(this).attr("data-valorSelecionado", "");
        $(this).find(".campoSelect_valor").text("Selecione um tipo de serviço");
      });
      $("#avisosLocalizacao").empty();

      if ($formulario.is(this.elementos.$formularioHorarios)) {
        this.preencherFormularioHorarios();
      }
    },

    /* ---------- Biografia ---------- */
    /** Valida e envia a nova biografia. */
    enviarBio: function () {
      var $campo = this.elementos.$campoBioNova;
      var bio = $.trim($campo.val());

      if (!bio) {
        $campo.addClass("is-invalid");
        this.focarPrimeiroInvalido(this.elementos.$formularioBio);
        return;
      }
      if (bio === $.trim(this.bioDoPerfil())) {
        this.exibirAviso("Nenhuma alteração foi feita!", "atencao");
        return;
      }
      if (!this.contratoDisponivel("editarBio")) {
        this.avisarIndisponivel();
        return;
      }

      var self = this;
      this.chamarContrato("editarBio", { bio: bio })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.definirBioDoPerfil(bio);
            self.renderizarBio();
            self.limparFormulario(self.elementos.$formularioBio);
            self.mostrarVisao("resumo");
          } else {
            self.exibirAviso("Não foi possível salvar a biografia. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível salvar a biografia. Tente novamente.", "erro");
        });
    },

    /* ---------- Localização (clínica) ---------- */
    /** Liga o preenchimento por CEP aos campos de localização. */
    // Reaproveita o preenchimento por CEP (ViaCEP) que já existe em utilitarios.js.
    configurarCamposLocalizacao: function () {
      Utilitarios.configurarCEP($("#avisosLocalizacao"), this.elementos.$camposLocalizacao);
    },

    /** Preenche o formulário de localização com o CEP atual e o endereço do ViaCEP. */
    preencherFormularioLocalizacao: function () {
      var cep = (this.estado.perfil || {}).clin_cep || "";
      var c = this.elementos.$camposLocalizacao;

      $("#avisosLocalizacao").empty();
      $.each(c, function (_, $campo) {
        $campo.removeClass("is-invalid").val("");
      });
      var cepExibido;
      if (cep) {
        cepExibido = Utilitarios.formatarMascara("cep", cep);
      } else {
        cepExibido = "";
      }
      c.cep.val(cepExibido);

      this.buscarEnderecoPorCep(cep).done(function (dados) {
        c.rua.val(dados.logradouro || "");
        c.bairro.val(dados.bairro || "");
        c.cidade.val(dados.localidade || "");
        c.uf.val(dados.uf || "");
        c.ibge.val(dados.ibge || "");
      });
    },

    /** Valida o CEP e envia a nova localização (só o CEP é salvo). */
    enviarLocalizacao: function () {
      var c = this.elementos.$camposLocalizacao;
      var perfil = this.estado.perfil || {};
      var $avisos = $("#avisosLocalizacao");
      var cep = Utilitarios.apenasNumeros(c.cep.val());

      // Rua, bairro, cidade, estado e IBGE vêm do ViaCEP; só o CEP é salvo.
      var vazios = [];
      $.each(c, function (_, $campo) {
        $campo.removeClass("is-invalid");
        var valor = $.trim($campo.val());
        if (!valor || valor === "...") {
          vazios.push($campo);
        }
      });

      if (!/^[0-9]{8}$/.test(cep)) {
        Utilitarios.marcarCamposComErro($avisos, [c.cep], "CEP inválido!");
        c.cep.trigger("focus");
        return;
      }
      if (vazios.length) {
        $.each(vazios, function (_, $campo) {
          $campo.addClass("is-invalid");
        });
        this.exibirAviso("Você precisa preencher todos os campos!", "erro");
        this.focarPrimeiroInvalido(this.elementos.$formularioLocalizacao);
        return;
      }
      if (cep === Utilitarios.apenasNumeros(perfil.clin_cep || "")) {
        this.exibirAviso("Nenhuma alteração foi feita!", "atencao");
        return;
      }
      if (!this.contratoDisponivel("editarLocalizacao")) {
        this.avisarIndisponivel();
        return;
      }

      var self = this;
      this.chamarContrato("editarLocalizacao", { cep: cep })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            self.estado.perfil.clin_cep = cep;
            self.renderizarLocalizacao();
            self.limparFormulario(self.elementos.$formularioLocalizacao);
            self.mostrarVisao("resumo");
          } else {
            self.exibirAviso("Não foi possível salvar a localização. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível salvar a localização. Tente novamente.", "erro");
        });
    },

    /* ---------- Cadastro de serviço (profissional) ---------- */
    /** Valida e cadastra um novo serviço (valor, tipo, duração, dias etc.). */
    enviarServico: function () {
      var $formulario = this.elementos.$formularioServico;
      var $tipo = this.elementos.$campoTipoServico;

      var dados = {
        nome: $.trim($("#campoNomeServico").val()),
        val: this.valorParaBackend(this.elementos.$campoValorServico),
        tipo: $tipo.attr("data-valorSelecionado") || "",
        desc: $.trim($("#campoDescricaoServico").val()),
        dur: $.trim($("#campoDuracaoServico").val()),
        inter: $.trim($("#campoIntervaloServico").val()),
        stat: "ativo",
        // Valor temporário para teste
        loc: 1
      };

      var camposVazios = [];
      if (!dados.nome) camposVazios.push($("#campoNomeServico"));
      if (!dados.val) camposVazios.push(this.elementos.$campoValorServico);
      if (!dados.desc) camposVazios.push($("#campoDescricaoServico"));
      if (!dados.dur) camposVazios.push($("#campoDuracaoServico"));
      if (dados.inter === "") camposVazios.push($("#campoIntervaloServico"));

      $formulario.find(".is-invalid").removeClass("is-invalid");
      $tipo.removeClass("campoSelect--erro");
      $.each(camposVazios, function (_, $campo) {
        $campo.addClass("is-invalid");
      });
      if (!dados.tipo) {
        $tipo.addClass("campoSelect--erro");
      }

      if (camposVazios.length || !dados.tipo) {
        this.exibirAviso("Você precisa preencher todos os campos!", "erro");
        this.focarPrimeiroInvalido($formulario);
        return;
      }

      var indicesDias = $formulario.find('input[name="diasServico"]:checked').map(function () {
        return Number(this.value);
      }).get();

      if (!indicesDias.length) {
        this.exibirAviso("Você precisa selecionar pelo menos um dia para realizar esse serviço!", "erro");
        $formulario.find('input[name="diasServico"]').first().trigger("focus");
        return;
      }

      dados.dia = this.combinarDias(indicesDias);

      var self = this;
      var $botao = $formulario.find('button[type="submit"]').prop("disabled", true);

      this.chamarContrato("cadastrarServico", dados, "text")
        .done(function (resposta) {
          if ($.trim(resposta) === "sucesso") {
            self.limparFormulario($formulario);
            self.mostrarVisao("resumo");
            self.carregarPerfil();
          } else {
            self.exibirAviso("Não foi possível cadastrar o serviço. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível cadastrar o serviço. Tente novamente.", "erro");
        })
        .always(function () {
          $botao.prop("disabled", false);
        });
    },

    /* ---------- Horários e dias de funcionamento ---------- */
    /** Cria as sete linhas (uma por dia) do formulário de horários. */
    montarLinhasHorarioFormulario: function () {
      var self = this;

      $.each(nomesDias, function (indice, nomeDia) {
        var $linha = self.clonarModelo("modeloLinhaHorarioFormulario");
        var idCheck = "checkHorario" + indice;
        var idAbertura = "campoHoraAbertura" + indice;
        var idFechamento = "campoHoraFechamento" + indice;

        $linha.attr("data-dia", indice);
        $linha.find('[data-campo="marcaDia"]').attr({ id: idCheck, name: "diaFuncionamento", value: indice });
        $linha.find('[data-campo="rotuloDia"]').attr("for", idCheck).text(nomeDia);
        $linha.find('[data-campo="rotuloAbertura"]').attr("for", idAbertura);
        $linha.find('[data-campo="horaAbertura"]').attr({ id: idAbertura, name: "horaAbertura" + indice });
        $linha.find('[data-campo="rotuloFechamento"]').attr("for", idFechamento);
        $linha.find('[data-campo="horaFechamento"]').attr({ id: idFechamento, name: "horaFechamento" + indice });

        self.elementos.$listaLinhasHorario.append($linha);
      });
    },

    /** Marca e trava os dias já cadastrados e libera os demais. */
    /*
      O backend só insere horários (não há alterar nem excluir). Os dias já
      cadastrados aparecem marcados e travados; só dá para adicionar dias novos.
    */
    preencherFormularioHorarios: function () {
      var self = this;
      var $linhas = this.elementos.$listaLinhasHorario.children(".linhaHorario");
      var haSalvos = false;

      $linhas.each(function () {
        var $linha = $(this);
        $linha.removeAttr("data-salvo");
        $linha.find('[data-campo="marcaDia"]').prop("checked", false).prop("disabled", false);
        $linha.find('input[type="time"]').val("").prop("disabled", true).removeClass("is-invalid");
      });
      $.each(this.estado.horarios, function (_, horario) {
        var $linha = $linhas.filter('[data-dia="' + Number(horario.hrser_dia) + '"]');

        haSalvos = true;
        $linha.attr("data-salvo", "1");
        $linha.find('[data-campo="marcaDia"]').prop("checked", true).prop("disabled", true);
        $linha.find('[data-campo="horaAbertura"]').val(self.formatarHora(horario.hrser_hrini)).prop("disabled", true);
        $linha.find('[data-campo="horaFechamento"]').val(self.formatarHora(horario.hrser_hrterm)).prop("disabled", true);
      });

      $('[data-campo="avisoHorariosSalvos"]').prop("hidden", !haSalvos);
      this.atualizarBotaoSalvarHorarios();
    },

    /** Habilita ou desabilita os horários do dia marcado. */
    alternarDiaFuncionamento: function ($marca) {
      var $linha = $marca.closest(".linhaHorario");
      var marcado = $marca.is(":checked");

      $linha.find('input[type="time"]').prop("disabled", !marcado).removeClass("is-invalid");
      if (!marcado) {
        $linha.find('input[type="time"]').val("");
      }
      this.atualizarBotaoSalvarHorarios();
    },

    /** Habilita Salvar só se houver dia novo marcado. */
    atualizarBotaoSalvarHorarios: function () {
      // Só conta dia novo (os já salvos ficam marcados e travados)
      var haDiaNovo = this.elementos.$listaLinhasHorario.find('[data-campo="marcaDia"]:checked:not(:disabled)').length > 0;
      this.elementos.$botaoSalvarHorarios.prop("disabled", !haDiaNovo);
    },

    /** Valida e envia os dias novos, uma chamada por dia, e recarrega o perfil. */
    enviarHorarios: function () {
      var self = this;
      var novos = [];
      var haCampoVazio = false;

      this.elementos.$listaLinhasHorario.children(".linhaHorario").each(function () {
        var $linha = $(this);
        var $marca = $linha.find('[data-campo="marcaDia"]');

        // Ignora dia desmarcado e dia já salvo (marcado e travado)
        if (!$marca.is(":checked") || $marca.prop("disabled")) {
          return;
        }
        var $abertura = $linha.find('[data-campo="horaAbertura"]');
        var $fechamento = $linha.find('[data-campo="horaFechamento"]');

        $abertura.toggleClass("is-invalid", !$abertura.val());
        $fechamento.toggleClass("is-invalid", !$fechamento.val());

        if (!$abertura.val() || !$fechamento.val()) {
          haCampoVazio = true;
          return;
        }
        novos.push({
          dia: Number($linha.attr("data-dia")),
          inicio: $abertura.val(),
          termino: $fechamento.val()
        });
      });

      if (haCampoVazio) {
        this.exibirAviso("Preencha a abertura e o fechamento dos dias selecionados.", "erro");
        this.focarPrimeiroInvalido(this.elementos.$formularioHorarios);
        return;
      }
      if (!this.contratoDisponivel("cadastrarHorarios")) {
        this.avisarIndisponivel();
        return;
      }
      if (!novos.length) {
        this.exibirAviso("Nenhum dia novo para salvar!", "atencao");
        return;
      }

      var $botao = this.elementos.$botaoSalvarHorarios.prop("disabled", true);

      // Uma chamada por dia (atribuirHrServico grava um dia por vez)
      var pedidos = $.map(novos, function (horario) {
        var resultado = $.Deferred();

        self.chamarContrato("cadastrarHorarios", horario)
          .done(function (resposta) {
            var sucesso;
            if (resposta && resposta.sucesso) {
              sucesso = true;
            } else {
              sucesso = false;
            }
            resultado.resolve(sucesso);
          })
          .fail(function () {
            resultado.resolve(false);
          });
        return resultado.promise();
      });

      $.when.apply($, pedidos).done(function () {
        var falhas = $.grep($.makeArray(arguments), function (ok) {
          return !ok;
        }).length;

        if (falhas === 0) {
          self.mostrarVisao("resumo");
        } else {
          self.exibirAviso("Não foi possível salvar todos os horários. Tente novamente.", "erro");
        }
        // Recarrega: os dias salvos passam a aparecer travados
        self.carregarPerfil();
      }).always(function () {
        self.atualizarBotaoSalvarHorarios();
      });
    },

    /* ---------- Vínculos: clínicas (profissional) e profissionais (clínica) ---------- */
    /** Padroniza o item de vínculo (profissional ou clínica) do servidor. */
    // Padroniza o item recebido do servidor para os dois papéis.
    normalizarVinculo: function (item) {
      if (this.ehClinica()) {
        return {
          id: item.pro_id,
          titulo: item.pro_user || item.pro_nome || "",
          detalhes: false
        };
      }
      var cepFormatado;
      if (item.clin_cep) {
        cepFormatado = Utilitarios.formatarMascara("cep", item.clin_cep);
      } else {
        cepFormatado = "";
      }
      return {
        id: item.clin_id,
        titulo: item.clin_user || item.clin_nome || "",
        detalhes: true,
        cepBruto: item.clin_cep || "",
        cep: cepFormatado
      };
    },

    /** Cria o card de vínculo, em modo 'lista' (com desvincular) ou 'seleção' (com selecionar). */
    montarCardVinculo: function (item, modo) {
      var vinculo = this.normalizarVinculo(item);
      var config = this.configuracaoDoPapel();
      var $card = this.clonarModelo("modeloCardVinculo");

      $card.find('[data-campo="nomeVinculo"]').text(vinculo.titulo);
      $card.find('[data-campo="linkPerfilVinculo"]').attr("aria-label", "Ver perfil de " + vinculo.titulo);
      $card.find('[data-campo="iconePadraoVinculo"]').text(config.iconeVinculo);
      // O vínculo de uma clínica é um profissional e o de um profissional é uma clínica
      var tipoDoVinculo;
      if (this.ehClinica()) {
        tipoDoVinculo = "profissional";
      } else {
        tipoDoVinculo = "clinica";
      }
      $card.find('[data-campo="linkPerfilVinculo"]')
        .attr("href", "index.php?uri=perfil&tipo=" + tipoDoVinculo + "&id=" + encodeURIComponent(vinculo.id));

      if (vinculo.detalhes) {
        var textoEndereco;
        if (vinculo.cep) {
          textoEndereco = "Carregando...";
        } else {
          textoEndereco = "Não informado";
        }
        var $endereco = $card.find('[data-campo="enderecoVinculo"]').text(textoEndereco);
        $card.find('[data-campo="cepVinculo"]').text(vinculo.cep || "Não informado");
        $card.find('[data-campo="detalhesVinculo"]').removeAttr("hidden");

        var self = this;
        this.buscarEnderecoPorCep(vinculo.cepBruto)
          .done(function (dados) {
            $endereco.text(self.textoEndereco(dados) || "Não informado");
          })
          .fail(function () {
            $endereco.text("Não informado");
          });
      }

      $card.data("vinculo", { id: vinculo.id, titulo: vinculo.titulo });

      if (modo === "selecao") {
        $card.addClass("cardVinculo--selecionavel");
        $card.find('[data-acao="desvincular"]').remove();
        $card.find('[data-acao="selecionarVinculo"]').attr("aria-label", this.textos().rotuloSelecionar + " " + vinculo.titulo);
      } else {
        $card.find('[data-acao="selecionarVinculo"]').remove();
        if (this.ehVisitante()) {
          $card.find('[data-acao="desvincular"]').remove();
        } else {
          $card.find('[data-acao="desvincular"]').attr("aria-label", this.textos().rotuloDesvincular + " " + vinculo.titulo);
        }
      }

      return $card;
    },

    /** Mostra a lista de vínculos ou o estado vazio. */
    renderizarVinculos: function (itens) {
      var self = this;
      var nomeLista = this.configuracaoDoPapel().listaVinculos;
      var $lista = $('[data-lista="' + nomeLista + '"]').empty();

      $.each(itens, function (_, item) {
        $lista.append(self.montarCardVinculo(item, "lista"));
      });

      var hiddenLista;
      if (itens.length) {
        hiddenLista = null;
      } else {
        hiddenLista = "hidden";
      }
      $lista.attr("hidden", hiddenLista);
      var hiddenEstadoVazio;
      if (itens.length) {
        hiddenEstadoVazio = "hidden";
      } else {
        hiddenEstadoVazio = null;
      }
      $('[data-estadoVazio="' + nomeLista + '"]').attr("hidden", hiddenEstadoVazio);
    },

    /** Ajusta os textos do modal de vínculo ao papel. */
    prepararModalVinculo: function () {
      var t = this.textos();

      $('[data-campo="tituloVinculo"]').text(t.tituloVinculo);
      $('[data-campo="rotuloVinculo"]').text(t.rotuloVinculo);
      this.elementos.$campoUsuarioVinculo.attr("placeholder", t.placeholderVinculo);
      $('[data-campo="rotuloBotaoDesvincular"]').text(t.rotuloDesvincular);
    },

    /** Limpa a busca e abre o modal de vincular. */
    abrirVinculo: function () {
      this.limparBuscaVinculo();
      Utilitarios.exibirModal(this.elementos.$modalVincular);
    },

    /** Zera a busca e a seleção do modal de vínculo. */
    limparBuscaVinculo: function () {
      this.estado.vinculoBuscado = null;
      this.estado.vinculoSelecionado = null;
      this.elementos.$campoUsuarioVinculo.val("").removeClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.removeClass("d-block").text("");
      this.elementos.$resultadoVinculo.empty().attr("hidden", "hidden");
    },

    /** Mostra o erro do campo de busca de vínculo. */
    mostrarErroBusca: function (mensagem) {
      this.elementos.$campoUsuarioVinculo.addClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.text(mensagem).addClass("d-block");
    },

    /** Busca clínica ou profissional pelo usuário e mostra os resultados selecionáveis. */
    buscarVinculo: function () {
      var self = this;
      var usuario = $.trim(this.elementos.$campoUsuarioVinculo.val());
      var tipoVinculo;
      if (this.ehClinica()) {
        tipoVinculo = "profissional";
      } else {
        tipoVinculo = "clinica";
      }

      this.elementos.$campoUsuarioVinculo.removeClass("is-invalid");
      this.elementos.$mensagemUsuarioVinculo.removeClass("d-block");
      this.estado.vinculoSelecionado = null;
      this.elementos.$resultadoVinculo.empty().attr("hidden", "hidden");

      if (!usuario) {
        this.mostrarErroBusca(this.textos().buscaVazia);
        return;
      }
      if (!this.contratoDisponivel("buscarVinculo")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("buscarVinculo", { tipo: tipoVinculo, busca: usuario })
        .done(function (resposta) {
          var itens;
          if (resposta && resposta.sucesso && Array.isArray(resposta.dados)) {
            itens = resposta.dados;
          } else {
            itens = [];
          }

          if (!itens.length) {
            self.mostrarErroBusca(self.textos().naoEncontrado);
            return;
          }

          $.each(itens, function (_, item) {
            self.elementos.$resultadoVinculo.append(
              self.montarCardVinculo(item, "selecao").data("item", item)
            );
          });
          self.elementos.$resultadoVinculo.removeAttr("hidden");
        })
        .fail(function () {
          self.exibirAviso("Não foi possível buscar agora. Tente novamente.", "erro");
        });
    },

    /** Seleciona ou desmarca um resultado (só um por vez). */
    alternarSelecaoVinculo: function ($card) {
      var jaSelecionado = $card.hasClass("cardEntidadeBase--selecionado");

      // Só um card pode ficar selecionado: desmarca todos antes
      this.elementos.$resultadoVinculo.find(".cardVinculo--selecionavel").each(function () {
        $(this).removeClass("cardEntidadeBase--selecionado")
          .find('[data-acao="selecionarVinculo"]')
          .attr("aria-pressed", "false")
          .find(".material-symbols-outlined")
          .text("radio_button_unchecked");
      });

      if (jaSelecionado) {
        this.estado.vinculoSelecionado = null;
        return;
      }

      this.estado.vinculoSelecionado = $card.data("item");
      $card.addClass("cardEntidadeBase--selecionado")
        .find('[data-acao="selecionarVinculo"]')
        .attr("aria-pressed", "true")
        .find(".material-symbols-outlined")
        .text("check_circle");
    },

    /** Confirma o vínculo selecionado no servidor. */
    enviarVinculo: function () {
      var selecionado = this.estado.vinculoSelecionado;
      var self = this;

      if (!selecionado) {
        this.exibirAviso(this.textos().selecioneAntes, "erro");
        return;
      }
      if (!this.contratoDisponivel("vincular")) {
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("vincular", { idVinculo: this.normalizarVinculo(selecionado).id })
        .done(function (resposta) {
          if (resposta && resposta.sucesso) {
            Utilitarios.esconderModal(self.elementos.$modalVincular);
            self.carregarVinculos();
          } else {
            self.exibirAviso("Não foi possível vincular. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          self.exibirAviso("Não foi possível vincular. Tente novamente.", "erro");
        });
    },

    /** Abre o modal de confirmação com o texto do vínculo a remover. */
    abrirModalDesvincular: function ($botao) {
      var vinculo = $botao.closest(".cardVinculo").data("vinculo");
      var t = this.textos();
      var $abertura = $('[data-campo="textoDesvinculoAbertura"]');

      this.estado.vinculoParaDesvincular = vinculo;
      $abertura.empty()
        .append(document.createTextNode(t.desvinculoAbertura))
        .append($("<strong>").text(vinculo.titulo))
        .append(document.createTextNode("!"));
      $('[data-campo="textoDesvinculoConsequencia"]').text(t.desvinculoConsequencia);

      Utilitarios.exibirModal(this.elementos.$modalDesvincular);
    },

    /** Desvincula no servidor e recarrega os vínculos. */
    confirmarDesvinculo: function () {
      var self = this;

      if (!this.contratoDisponivel("desvincular")) {
        Utilitarios.esconderModal(this.elementos.$modalDesvincular);
        this.avisarIndisponivel();
        return;
      }

      this.chamarContrato("desvincular", { idVinculo: this.estado.vinculoParaDesvincular.id })
        .done(function (resposta) {
          Utilitarios.esconderModal(self.elementos.$modalDesvincular);
          if (resposta && resposta.sucesso) {
            self.carregarVinculos();
          } else {
            self.exibirAviso("Não foi possível desvincular. Tente novamente.", "erro");
          }
        })
        .fail(function () {
          Utilitarios.esconderModal(self.elementos.$modalDesvincular);
          self.exibirAviso("Não foi possível desvincular. Tente novamente.", "erro");
        });
    },

    /* ---------- Eventos ---------- */
    /**
     * Liga todos os eventos: visões, formulários, sair, sessão expirada, horários, vínculos e
     * desvincular.
     */
    registrarEventos: function () {
      var self = this;
      var e = this.elementos;

      // Abrir visões (botões de editar/adicionar das seções)
      $(document).on("click", "[data-visaoDestino]", function () {
        var destino = $(this).attr("data-visaoDestino");
        self.estado.origemFoco = this;
        self.prepararVisao(destino);
        self.mostrarVisao(destino);
      });

      // Cancelar edição/cadastro
      $(document).on("click", '[data-acao="cancelarEdicao"]', function () {
        self.cancelarEdicao($(this));
      });

      // Menu: Sair (dropdown desktop e painel mobile)
      $(document).on("click", '[data-acao="sair"]', function (evento) {
        evento.preventDefault();
        self.sair();
      });

      // Sessão expirada: volta ao login do papel mais provável (profissional, se nenhum foi confirmado)
      $("#botaoRealizarLoginSessao").on("click", function () {
        window.location.href = papeis[self.estado.papel || "profissional"].urlLogin;
      });

      // Formulários
      e.$formularioBio.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarBio();
      });
      e.$formularioServico.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarServico();
      });
      e.$formularioLocalizacao.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarLocalizacao();
      });
      e.$formularioHorarios.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarHorarios();
      });
      e.$formularioVinculo.on("submit", function (evento) {
        evento.preventDefault();
        self.enviarVinculo();
      });

      // Limpa o estado de erro quando a pessoa corrige o campo
      $(".formularioPerfil, #formularioVinculo").on("input change", ".is-invalid", function () {
        $(this).removeClass("is-invalid");
        e.$mensagemUsuarioVinculo.removeClass("d-block");
      });
      e.$campoTipoServico.on("opcaoSelecionada", function () {
        $(this).removeClass("campoSelect--erro");
      });

      // Valor do serviço
      e.$campoValorServico.on("input", function () {
        self.mascararValor($(this));
      });

      // Horários
      e.$listaLinhasHorario.on("change", '[data-campo="marcaDia"]', function () {
        self.alternarDiaFuncionamento($(this));
      });

      // Vincular (botões das abas Clínica / Profissionais)
      $(document).on("click", '[data-acao="abrirVinculo"]', function () {
        self.abrirVinculo();
      });
      $(document).on("click", '[data-acao="gerenciarVinculos"]', function () {
        self.exibirAviso("Gerenciar profissionais ainda não está disponível.", "atencao");
      });

      // Busca no modal de vínculo (botão e Enter)
      $("#botaoBuscarVinculo").on("click", function () {
        self.buscarVinculo();
      });
      e.$campoUsuarioVinculo.on("keydown", function (evento) {
        if (evento.key === "Enter") {
          evento.preventDefault();
          self.buscarVinculo();
        }
      });
      e.$modalVincular.on("hidden.bs.modal", function () {
        self.limparBuscaVinculo();
      });

      // Seleção do resultado (clicar no card ou na marca; o link "Ver perfil" segue normalmente)
      e.$resultadoVinculo.on("click", ".cardVinculo--selecionavel", function (evento) {
        if ($(evento.target).closest("a").length) {
          return;
        }
        self.alternarSelecaoVinculo($(this));
      });

      // Desvincular
      $(document).on("click", '[data-acao="desvincular"]', function () {
        self.abrirModalDesvincular($(this));
      });
      $("#botaoConfirmarDesvinculo").on("click", function () {
        self.confirmarDesvinculo();
      });
    }
  };

  /** Executa moduloPerfil.iniciar() quando o DOM estiver pronto. */
  $(function () {
    moduloPerfil.iniciar();
  });

})(jQuery, window.ElmoUtilitarios);
