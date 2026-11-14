(function ($, Utilitarios, Busca) {
  "use strict";

  var moduloResultados = {

    configuracao: {
      urlPerfil: "index.php?uri=perfil",
      urlDetalhesServico: "index.php?uri=infoServico",
      urlViaCep: "https://viacep.com.br/ws/",
      tempoLimiteViaCep: 8000,

      filtrosConhecidos: ["tipoServico"],

      contratos: {
        buscar:   { url: "index.php?uri=busca", acao: "busca" },
        detalhes: { url: "index.php?uri=busca", acao: "mostrardetalhes" }
      }
    },

    abas: {

      servicos: {
        tipoBackend: "servico",
        campoLista: "listaServicos",
        modelo: "#modeloCardServico",
        estadoVazio: "servicos",
        textos: { um: "serviço encontrado", varios: "serviços encontrados", nenhum: "Nenhum serviço foi encontrado" },

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

      profissionais: {
        tipoBackend: "profissional",
        campoLista: "listaProfissionais",
        modelo: "#modeloCardProfissional",
        estadoVazio: "profissionais",
        textos: { um: "profissional encontrado", varios: "profissionais encontrados", nenhum: "Nenhum profissional foi encontrado" },

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

      clinicas: {
        tipoBackend: "clinica",
        campoLista: "listaClinicas",
        modelo: "#modeloCardClinica",
        estadoVazio: "clinicas",
        textos: { um: "clínica encontrada", varios: "clínicas encontradas", nenhum: "Nenhuma clínica foi encontrada" },

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

    estado: {
      termo: "",
      abaAtiva: "servicos",
      filtros: {},
      carregadoPara: {},
      requisicoes: {},
      cacheEnderecos: {},
      cacheDetalhes: {}
    },

    elementos: {},

    iniciar: function () {
      this.cachearElementos();
      Busca.configurarNavegacao();
      this.registrarEventos();
      this.restaurarBusca();
    },

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

    registrarEventos: function () {
      var self = this;

      $(document).on("pesquisaAcionada", "#campoPesquisaResultados", function (evento, dados) {
        self.pesquisar(dados && dados.termo);
      });

      this.elementos.$entrada.on("input", function () {
        self.esconderAvisoBusca();
      });

      this.elementos.$abas.on("shown.bs.tab", function () {
        self.aoTrocarAba($(this).attr("data-tipoBusca"));
      });

      $("#botaoAplicarFiltros").on("click", function () {
        self.aplicarFiltros(self.coletarFiltros());
      });

      $("#botaoLimparFiltros").on("click", function () {
        self.limparFiltros();
      });

      $("#entradaCidade").on("keydown", function (evento) {
        if (evento.key === "Enter") {
          evento.preventDefault();
          self.aplicarFiltros(self.coletarFiltros());
        }
      });

      $("#botaoTentarNovamente").on("click", function () {
        self.carregarAba(self.estado.abaAtiva, true);
      });

      $(window).on("popstate", function () {
        self.restaurarBusca();
      });
    },

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

      }
    },

    pesquisar: function (termo) {

      if (!Busca.termoValido(termo)) {
        this.mostrarAvisoBusca(true);
        return;
      }
      this.estado.termo = $.trim(termo);
      this.estado.carregadoPara = {};
      this.salvarBusca(true);
      this.carregarAba(this.estado.abaAtiva);
    },

    aoTrocarAba: function (aba) {
      if (!this.abas[aba]) {
        return;
      }
      this.estado.abaAtiva = aba;
      this.atualizarTelaDaAba();
      this.salvarBusca(false);
      this.carregarAba(aba);
    },

    mostrarAbaAtiva: function () {
      var $aba = this.elementos.$abas.filter("[data-tipoBusca='" + this.estado.abaAtiva + "']");
      if (!$aba.hasClass("active")) {
        bootstrap.Tab.getOrCreateInstance($aba[0]).show();
      }
    },

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

      this.elementos.$botaoFiltros.prop("hidden", !haGrupoVisivel);
    },

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

    aplicarFiltros: function (filtros) {
      this.estado.filtros = filtros;
      this.estado.carregadoPara = {};
      this.fecharPainelFiltros();
      this.salvarBusca(false);
      this.carregarAba(this.estado.abaAtiva);
    },

    limparFiltros: function () {
      this.aplicarFiltros({});
      this.aplicarFiltrosNaTela();
    },

    fecharPainelFiltros: function () {
      bootstrap.Dropdown.getOrCreateInstance(this.elementos.$botaoFiltros[0]).hide();
      this.elementos.$botaoFiltros.trigger("focus");
    },

    chamarContrato: function (nome, dados) {
      var contrato = this.configuracao.contratos[nome];

      return $.ajax({
        url: contrato.url,
        method: "POST",
        dataType: "json",
        data: $.extend({ acao: contrato.acao }, dados || {})
      });
    },

    carregarAba: function (aba, forcar) {
      var self = this;
      var configuracaoAba = this.abas[aba];
      var chave = JSON.stringify({ termo: this.estado.termo, filtros: this.filtrosDaAba(aba) });

      if (!forcar && this.estado.carregadoPara[aba] === chave) {
        return;
      }
      this.estado.carregadoPara[aba] = chave;

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
            return;
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

    fotoValida: function (foto) {
      if (/\.(jpe?g|png|gif|webp)$/i.test(String(foto || ""))) {
        return foto;
      } else {
        return undefined;
      }
    },

    $listaDaAba: function (aba) {
      return $("[data-campo='" + this.abas[aba].campoLista + "']");
    },

    $vazioDaAba: function (aba) {
      return $("[data-estadoVazio='" + this.abas[aba].estadoVazio + "']");
    },

    exibirSemTermo: function (aba) {
      this.$listaDaAba(aba).empty();
      this.$vazioDaAba(aba).attr("hidden", "hidden");
      this.elementos.$carregando.attr("hidden", "hidden");
      this.elementos.$erro.attr("hidden", "hidden");
      this.elementos.$conteudo.attr("aria-busy", "false");
      this.mostrarAvisoBusca(false);
    },

    mostrarAvisoBusca: function (focar) {
      this.elementos.$avisoBusca.removeAttr("hidden");
      this.elementos.$entrada.attr("aria-invalid", "true");
      if (focar) {
        this.elementos.$entrada.trigger("focus");
      }
    },

    esconderAvisoBusca: function () {
      this.elementos.$avisoBusca.attr("hidden", "hidden");
      this.elementos.$entrada.removeAttr("aria-invalid");
    },

    exibirCarregando: function (aba) {
      this.$listaDaAba(aba).empty();
      this.$vazioDaAba(aba).attr("hidden", "hidden");
      this.elementos.$erro.attr("hidden", "hidden");
      this.elementos.$carregando.removeAttr("hidden");
      this.elementos.$conteudo.attr("aria-busy", "true");
    },

    exibirErro: function (aba) {
      this.estado.carregadoPara[aba] = null;
      this.$listaDaAba(aba).empty();
      this.$vazioDaAba(aba).attr("hidden", "hidden");
      this.elementos.$carregando.attr("hidden", "hidden");
      this.elementos.$erro.removeAttr("hidden");
      this.elementos.$conteudo.attr("aria-busy", "false");
    },

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

    anunciar: function (mensagem) {
      this.elementos.$avisoResultados.text(mensagem);
    },

    montarCard: function (aba, item) {
      var configuracaoAba = this.abas[aba];
      var dados = configuracaoAba.mapear(item, this);
      var modelo = document.querySelector(configuracaoAba.modelo);
      var $card = $(modelo.content.firstElementChild.cloneNode(true));

      Utilitarios.preencherCampos($card.find("[data-campo]"), this.apenasComValor(dados.textos));

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

    apenasComValor: function (textos) {
      var resultado = {};
      $.each(textos, function (nome, valor) {
        if (valor !== undefined && valor !== null && valor !== "") {
          resultado[nome] = valor;
        }
      });
      return resultado;
    },

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

    montarLink: function (base, parametros) {
      var partes = [];
      $.each(parametros, function (nome, valor) {
        partes.push(nome + "=" + encodeURIComponent(valor));
      });
      return base + "&" + partes.join("&");
    },

    formatarPreco: function (valor) {
      var numero = parseFloat(valor);
      if (isNaN(numero)) {
        return "";
      }
      return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

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
          delete cache[cepNumerico];
          resultado.reject();
        });

      return cache[cepNumerico];
    },

    textoEndereco: function (dadosViaCep) {
      return [dadosViaCep.logradouro, dadosViaCep.uf].filter(Boolean).join(", ") || "Indisponível";
    }
  };

  $(function () {
    moduloResultados.iniciar();
  });

})(jQuery, window.ElmoUtilitarios, window.ElmoBusca);
