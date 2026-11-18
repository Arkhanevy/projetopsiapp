(function ($, Utilitarios) {
  "use strict";

  window.ElmoPerfilModulos = window.ElmoPerfilModulos || [];

  // Mesmos números usados em models/permissao.php (perm_tipo).
  const tiposDePermissao = {
    agendarConsultas: 1,
    reagendarConsultas: 2,
    cancelarConsultas: 3,
    enviarDocumentos: 4
  };

  // perm_tipo (número) -> chave usada em data-permissao nos controles.
  const chavesPorTipo = {};
  $.each(tiposDePermissao, function (chave, numero) {
    chavesPorTipo[numero] = chave;
  });

  const moduloGerenciamento = {

    contratos: {
      // buscacontroller: lista os profissionais vinculados à clínica logada (devolve pc_id + pro_*).
      listarPermissoes: { url: "index.php?uri=busca", acao: "gerenciarPro", disponivel: true },

      // buscacontroller: lista as linhas de "permissoes" de um vínculo (perm_id, perm_tipo, perm_bin, perm_pc).
      // Só leitura: não grava nada.
      listarPermissoesDoVinculo: { url: "index.php?uri=busca", acao: "permisaopro", disponivel: true },

      // clinicacontroller: grava perm_bin de uma linha de "permissoes" (perm_id + status 0/1).
      alterarPermissao: { url: "index.php?uri=clinica", acao: "permissao", disponivel: true }
    },

    estado: {
      ativo: false,
      pedido: 0
    },

    elementos: {},

    nucleo: null,

    iniciar: function (nucleo) {
      this.nucleo = nucleo;

      if (!nucleo.ehClinica() || nucleo.ehVisitante()) {
        return;
      }
      this.estado.ativo = true;
      this.cachearElementos();
      this.montarPermissoesTodos();
      this.registrarEventos();
    },

    cachearElementos: function () {
      const e = this.elementos;

      e.$carregando = $('[data-carregando="gerenciamento"]');
      e.$erro = $('[data-estadoErro="gerenciamento"]');
      e.$vazio = $('[data-estadoVazio="gerenciamento"]');
      e.$acordeao = $("#acordeaoGerenciamento");
      e.$listaTodos = $('[data-lista="permissoesTodos"]');
      e.$listaProfissionais = $('[data-lista="gerenciamentoProfissionais"]');
    },

    aoPrepararVisao: function (nomeVisao) {
      if (this.estado.ativo && nomeVisao === "profissionaisGerenciamento") {
        this.carregar();
      }
    },

    montarPermissoesTodos: function () {
      this.elementos.$listaTodos.empty().append(this.nucleo.clonarModelo("modeloListaPermissoes"));
    },

    definirEstado: function (nome) {
      const e = this.elementos;

      e.$carregando.prop("hidden", nome !== "carregando");
      e.$erro.prop("hidden", nome !== "erro");
      e.$vazio.prop("hidden", nome !== "vazio");
      e.$acordeao.prop("hidden", nome !== "lista");
    },

    // 1) gerenciarPro -> lista de profissionais (pc_id, pro_*)
    // 2) permisaopro  -> uma chamada por pc_id, com as permissões de cada profissional
    carregar: function () {
      const self = this;
      const nucleo = this.nucleo;
      const numeroPedido = ++this.estado.pedido;

      this.definirEstado("carregando");

      if (!nucleo.contratoDisponivel("listarPermissoes")) {
        this.renderizar([]);
        return;
      }

      // O backend usa $_SESSION para identificar a clínica. O "tipo" é obrigatório
      // porque o buscacontroller monta a lista de campos a partir dele.
      nucleo.chamarContrato("listarPermissoes", { tipo: "profissional" })
        .done(function (resposta) {
          if (numeroPedido !== self.estado.pedido) {
            return;
          }
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            self.carregarPermissoes(resposta.dados, numeroPedido);
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

    carregarPermissoes: function (profissionais, numeroPedido) {
      const self = this;
      const nucleo = this.nucleo;

      if (!profissionais.length) {
        this.renderizar([]);
        return;
      }

      if (!nucleo.contratoDisponivel("listarPermissoesDoVinculo")) {
        this.renderizar(profissionais);
        return;
      }

      const pedidos = $.map(profissionais, function (profissional) {
        return nucleo.chamarContrato("listarPermissoesDoVinculo", {
          tipo: "profissional",
          pc_id: profissional.pc_id
        }).then(function (resposta) {
          if (resposta && resposta.sucesso && $.isArray(resposta.dados)) {
            return resposta.dados;
          }
          return $.Deferred().reject().promise();
        });
      });

      $.when.apply($, pedidos)
        .done(function () {
          if (numeroPedido !== self.estado.pedido) {
            return;
          }

          const listas = $.makeArray(arguments);

          $.each(profissionais, function (indice, profissional) {
            profissional.permissoes = self.agruparPermissoes(listas[indice]);
          });

          self.renderizar(profissionais);
        })
        .fail(function () {
          if (numeroPedido === self.estado.pedido) {
            self.definirEstado("erro");
          }
        });
    },

    // [{perm_id, perm_tipo, perm_bin, perm_pc}] -> { agendarConsultas: {id, valor}, ... }
    agruparPermissoes: function (linhas) {
      const agrupadas = {};

      $.each(linhas || [], function (_, linha) {
        const chave = chavesPorTipo[parseInt(linha.perm_tipo, 10)];

        if (chave) {
          agrupadas[chave] = { id: linha.perm_id, valor: linha.perm_bin };
        }
      });

      return agrupadas;
    },

    permitido: function (valor) {
      return valor === true || valor === 1 || valor === "1";
    },

    renderizar: function (itens) {
      const self = this;
      const nucleo = this.nucleo;
      const $lista = this.elementos.$listaProfissionais.empty();

      $.each(itens, function (_, item) {
        const id = item.pro_id;
        const usuario = item.pro_user || item.pro_nome || "";
        const idPainel = "painelPermissoesProfissional" + String(id).replace(/[^a-zA-Z0-9]/g, "");
        const permissoes = item.permissoes || {};
        const $item = nucleo.clonarModelo("modeloItemGerenciamento");
        const $permissoes = nucleo.clonarModelo("modeloListaPermissoes");

        $item.find('[data-campo="usuarioProfissional"]').text(usuario);
        $item.find('[data-campo="gatilhoPermissoes"]').attr({
          "data-bs-target": "#" + idPainel,
          "aria-controls": idPainel
        });
        $item.find('[data-campo="painelPermissoes"]').attr("id", idPainel);

        if (item.pro_foto) {
          $item.find('[data-campo="fotoProfissional"]').attr("src", item.pro_foto).removeAttr("hidden");
          $item.find(".itemGerenciamento_avatar .material-symbols-outlined").attr("hidden", "hidden");
        }

        $permissoes.attr("data-idProfissional", id);
        $permissoes.attr("data-pcId", item.pc_id);
        $permissoes.find(".listaPermissoes_controle").each(function () {
          const $controle = $(this);
          const permissao = permissoes[$controle.attr("data-permissao")];

          if (permissao) {
            $controle
              .attr("data-permId", permissao.id)
              .prop("checked", self.permitido(permissao.valor));
          } else {
            // Sem linha em "permissoes" não há o que atualizar (o backend não cria a linha).
            $controle.prop("checked", false).prop("disabled", true);
          }
        });

        $item.find('[data-lista="permissoesProfissional"]').append($permissoes);
        $lista.append($item);
      });

      if (itens.length) {
        this.sincronizarTodos();
        this.definirEstado("lista");
      } else {
        this.definirEstado("vazio");
      }
    },

    sincronizarTodos: function () {
      const $profissionais = this.elementos.$listaProfissionais;

      this.elementos.$listaTodos.find(".listaPermissoes_controle").each(function () {
        const chave = $(this).attr("data-permissao");
        const $controles = $profissionais.find('.listaPermissoes_controle[data-permissao="' + chave + '"]');
        const todosPermitidos = $controles.length > 0 && $controles.filter(":not(:checked)").length === 0;

        $(this).prop("checked", todosPermitidos);
      });
    },

    // Envia uma alteração por perm_id e espera todas terminarem (sucesso ou falha).
    // Resolve com { total, falhas }.
    gravarPermissoes: function (ids, status) {
      const nucleo = this.nucleo;
      const concluido = $.Deferred();
      let pendentes = ids.length;
      let falhas = 0;

      function terminarUma() {
        pendentes -= 1;
        if (pendentes === 0) {
          concluido.resolve({ total: ids.length, falhas: falhas });
        }
      }

      $.each(ids, function (_, permId) {
        nucleo.chamarContrato("alterarPermissao", {
          perm_id: permId,
          status: status
        })
          .done(function (resposta) {
            if (!(resposta && resposta.sucesso)) {
              falhas += 1;
            }
          })
          .fail(function () {
            falhas += 1;
          })
          .always(terminarUma);
      });

      return concluido.promise();
    },

    alterarPermissao: function ($controle) {
      const self = this;
      const nucleo = this.nucleo;
      const chave = $controle.attr("data-permissao");
      const permitido = $controle.is(":checked");
      const paraTodos = $controle.closest('[data-lista="permissoesTodos"]').length > 0;
      const status = permitido ? 1 : 0;
      const mensagemErro = "Não foi possível alterar a permissão. Tente novamente.";

      if (!tiposDePermissao[chave]) {
        $controle.prop("checked", !permitido);
        nucleo.exibirAviso(mensagemErro, "erro");
        return;
      }

      if (!nucleo.contratoDisponivel("alterarPermissao")) {
        $controle.prop("checked", !permitido);
        nucleo.avisarIndisponivel();
        return;
      }

      // Controles que serão gravados: o próprio, ou todos os profissionais para a chave.
      let $alvos = $controle;
      if (paraTodos) {
        $alvos = this.elementos.$listaProfissionais
          .find('.listaPermissoes_controle[data-permissao="' + chave + '"]');
      }

      const ids = [];
      $alvos.each(function () {
        const permId = $(this).attr("data-permId");
        if (permId) {
          ids.push(permId);
        }
      });

      if (!ids.length) {
        $controle.prop("checked", !permitido);
        nucleo.exibirAviso(mensagemErro, "erro");
        return;
      }

      $controle.prop("disabled", true);
      $alvos.prop("disabled", true);

      this.gravarPermissoes(ids, status)
        .done(function (resultado) {
          if (resultado.falhas === 0) {
            if (paraTodos) {
              $alvos.prop("checked", permitido);
            } else {
              self.sincronizarTodos();
            }
            return;
          }

          $controle.prop("checked", !permitido);
          nucleo.exibirAviso(mensagemErro, "erro");

          // Em lote, parte das alterações pode ter sido gravada: recarrega do banco.
          if (paraTodos && resultado.falhas < resultado.total) {
            self.carregar();
          }
        })
        .always(function () {
          $controle.prop("disabled", false);
          // Controles sem permId continuam desabilitados (não existe linha para atualizar).
          $alvos.each(function () {
            if ($(this).attr("data-permId")) {
              $(this).prop("disabled", false);
            }
          });
        });
    },

    registrarEventos: function () {
      const self = this;

      $(document).on("click", '[data-acao="tentarNovamenteGerenciamento"]', function () {
        self.carregar();
      });

      this.elementos.$acordeao.on("change", ".listaPermissoes_controle", function () {
        self.alterarPermissao($(this));
      });
    }
  };

  window.ElmoPerfilModulos.push(moduloGerenciamento);

})(jQuery, window.ElmoUtilitarios);