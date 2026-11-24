(function ($, window) {
  "use strict";

  const ElmoUtilitarios = {

    obterParametroUrl: function (nome) {
      const parametros = new URLSearchParams(window.location.search);
      return parametros.get(nome);
    },

    obterInstanciaModal: function ($elementoModal, opcoes) {
      return bootstrap.Modal.getOrCreateInstance($elementoModal.get(0), opcoes);
    },

    exibirModal: function ($elementoModal, opcoes) {
      this.obterInstanciaModal($elementoModal, opcoes).show();
    },

    esconderModal: function ($elementoModal) {
      const instancia = bootstrap.Modal.getInstance($elementoModal.get(0));
      if (instancia) {
        instancia.hide();
      }
    },

    preencherCampos: function ($camposDinamicos, dados) {
      $camposDinamicos.each(function () {
        const $elemento = $(this);
        const nomeCampo = $elemento.data("campo");

        if (!(nomeCampo in dados)) {
          return;
        }

        if (this.tagName === "IMG") {
          $elemento.attr("src", dados[nomeCampo]);

          const nomeCampoAlt = $elemento.data("campo-alt");
          if (nomeCampoAlt && dados[nomeCampoAlt]) {
            $elemento.attr("alt", dados[nomeCampoAlt]);
          }
          return;
        }

        if (this.tagName === "INPUT") {
          $elemento.val(dados[nomeCampo]);
          return;
        }

        $elemento.text(dados[nomeCampo]);
      });
    },

    alternarEsqueletoAcessivel: function ($camposDinamicos, ativo) {
      if (ativo) {
        $camposDinamicos.attr("aria-hidden", "true");
      } else {
        $camposDinamicos.removeAttr("aria-hidden");
      }
    },

    // Textos usados quando a clínica proíbe uma ação do profissional.
    // As chaves são os nomes dos contratos/ações; "contexto" completa "A clínica ...".
    permissaoNegadaPorAcao: {
      agendarConsulta: { verbo: "agendem", contexto: "desse serviço" },
      reagendarConsulta: { verbo: "reagendem", contexto: "dessa consulta" },
      cancelarConsulta: { verbo: "cancelem", contexto: "dessa consulta" },
      aceitarConsulta: { verbo: "aceitem", contexto: "dessa consulta" },
      recusarConsulta: { verbo: "recusem", contexto: "dessa consulta" }
    },

    // O backend responde { sucesso: false, mensagem: "permissão negada" } quando a
    // clínica bloqueia a ação (models/permissao.php). Aceita a resposta ou só a mensagem.
    ehPermissaoNegada: function (resposta) {
      const mensagem = typeof resposta === "string" ? resposta : resposta && resposta.mensagem;

      if (typeof mensagem !== "string") {
        return false;
      }
      return mensagem.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() === "permissao negada";
    },

    mensagemPermissaoNegada: function (nomeAcao) {
      const texto = this.permissaoNegadaPorAcao[nomeAcao];

      if (!texto) {
        return "A clínica não permite essa ação para profissionais.";
      }
      return "A clínica " + texto.contexto + " não permite que profissionais " + texto.verbo + " consultas.";
    },

    mostrarAlerta: function ($container, mensagem, tipo) {
      tipo = tipo || "success";

      const $alerta = $(
        '<div class="alert alert-' + tipo + ' alert-dismissible fade show" role="alert">' +
          '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        "</div>"
      );

      // A mensagem entra como nó de texto (nunca como HTML) para evitar XSS.
      $alerta.prepend(document.createTextNode(String(mensagem)));

      $container.append($alerta);

      setTimeout(function () {
        $alerta.fadeOut(200, function () {
          $alerta.remove();
        });
      }, 3000);
    },

    emailValido: function (email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    apenasNumeros: function (valor) {
      return valor.replace(/\D/g, "");
    },

    telefoneValido: function (telefone) {
      const numeros = this.apenasNumeros(telefone || "");

      if (numeros.length !== 10 && numeros.length !== 11) return false;

      const ddd = parseInt(numeros.substring(0, 2), 10);
      if (ddd < 11 || ddd > 99) return false;

      if (numeros.length === 11 && numeros.charAt(2) !== "9") return false;

      return true;
    },

    calcularIdade: function (dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento + "T00:00:00");
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const diferencaMeses = hoje.getMonth() - nascimento.getMonth();

      if (diferencaMeses < 0 || (diferencaMeses === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }

      return idade;
    },

    maiorDeIdade: function (dataNascimento, idadeMinima) {
      idadeMinima = idadeMinima ?? 18;

      //Mudar para aceitar 16 no cliente
      /*var idadeMinima = tipoUsuario === "cliente" ? 16 : 18;
      var idadeValida = utilitario.maiorDeIdade(dataNascimento, idadeMinima);*/

      if (!dataNascimento || isNaN(new Date(dataNascimento + "T00:00:00").getTime())) {
        return false;
      }

      return this.calcularIdade(dataNascimento) >= idadeMinima;
    },

    validarCampos: function (campos) {
      let erro = false;
      campos.forEach(function (campo) {
        if (!campo.valor) {
          campo.el.addClass("is-invalid");
          erro = true;
        }
      });
      return erro;
    },

    marcarCamposComErro: function ($container, campos, mensagem) {
      campos.forEach(function ($campo) {
        $campo.addClass("is-invalid");
      });
      this.mostrarAlerta($container, mensagem, "danger");
    },

    validarAoSair: function ($container, regras) {
      const self = this;

      regras.forEach(function (regra) {
        regra.$campo.on("blur", function () {
          const valor = $.trim(regra.$campo.val());

          if (valor === "" || regra.valido(valor)) {
            regra.$campo.removeClass("is-invalid").removeAttr("aria-invalid");
            return;
          }

          regra.$campo.addClass("is-invalid").attr("aria-invalid", "true");

          const jaExibido = $container.find(".alert").filter(function () {
            return $.trim($(this).text()) === regra.mensagem;
          }).length > 0;

          if (!jaExibido) {
            self.mostrarAlerta($container, regra.mensagem, "danger");
          }
        });

        regra.$campo.on("input change", function () {
          regra.$campo.removeAttr("aria-invalid");
        });
      });
    },

    formatarMascara: function (tipo, valor) {
      let d = this.apenasNumeros(valor || "");
      let f = "";

      if (tipo === "telefone") {
        if (d.length > 11 && d.indexOf("55") === 0) d = d.substring(2);
        d = d.substring(0, 11);
        if (d.length === 0) return "";
        f = "(" + d.substring(0, 2);
        if (d.length > 2) {
          const resto = d.substring(2);

          let corte;
          if (resto.length > 8) {
            corte = 5;
          } else {
            corte = 4;
          }
          f += ") " + resto.substring(0, corte);
          if (resto.length > corte) f += "-" + resto.substring(corte);
        }
        return f;
      }

      if (tipo === "cpf") {
        d = d.substring(0, 11);
        f = d.substring(0, 3);
        if (d.length > 3) f += "." + d.substring(3, 6);
        if (d.length > 6) f += "." + d.substring(6, 9);
        if (d.length > 9) f += "-" + d.substring(9);
        return f;
      }

      if (tipo === "cnpj") {
        d = d.substring(0, 14);
        f = d.substring(0, 2);
        if (d.length > 2) f += "." + d.substring(2, 5);
        if (d.length > 5) f += "." + d.substring(5, 8);
        if (d.length > 8) f += "/" + d.substring(8, 12);
        if (d.length > 12) f += "-" + d.substring(12);
        return f;
      }

      if (tipo === "cep") {
        d = d.substring(0, 8);
        f = d.substring(0, 5);
        if (d.length > 5) f += "-" + d.substring(5);
        return f;
      }

      return valor;
    },

    aplicarMascaras: function () {
      const self = this;

      function formatarCampo(campo) {
        const tipo = campo.getAttribute("data-mascara");
        const antes = campo.value;
        const depois = self.formatarMascara(tipo, antes);
        if (antes === depois) return;

        const cursor = campo.selectionStart;
        let digitosAntesDoCursor;
        if (cursor === null || cursor === undefined) {
          digitosAntesDoCursor = null;
        } else {
          digitosAntesDoCursor = self.apenasNumeros(antes.substring(0, cursor)).length;
        }

        campo.value = depois;

        if (digitosAntesDoCursor !== null && document.activeElement === campo) {
          let contados = 0;
          let posicao = 0;
          while (posicao < depois.length && contados < digitosAntesDoCursor) {
            if (/\d/.test(depois.charAt(posicao))) contados++;
            posicao++;
          }
          campo.setSelectionRange(posicao, posicao);
        }
      }

      $(document).on("input change", "[data-mascara]", function () {
        formatarCampo(this);
      });

      $("[data-mascara]").each(function () {
        formatarCampo(this);
      });
    },

    cpfValido: function (cpf) {
      cpf = cpf.replace(/\D/g, "");

      if (cpf.length !== 11) return false;
      if (/^(\d)\1+$/.test(cpf)) return false;

      let soma = 0;
      let i;
      for (i = 0; i < 9; i++) {
        soma += parseInt(cpf[i], 10) * (10 - i);
      }
      let resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9], 10)) return false;

      soma = 0;
      for (i = 0; i < 10; i++) {
        soma += parseInt(cpf[i], 10) * (11 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;

      return resto === parseInt(cpf[10], 10);
    },

    cnpjValido: function (cnpj) {
      cnpj = cnpj.replace(/\D/g, "");

      if (cnpj.length !== 14) return false;
      if (/^(\d)\1+$/.test(cnpj)) return false;

      let tamanho = 12;
      let numeros = cnpj.substring(0, tamanho);
      const digitos = cnpj.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;
      let i;

      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }

      let resultado;
      if (soma % 11 < 2) {
        resultado = 0;
      } else {
        resultado = 11 - (soma % 11);
      }
      if (resultado != digitos.charAt(0)) return false;

      tamanho = 13;
      numeros = cnpj.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;

      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }

      if (soma % 11 < 2) {
        resultado = 0;
      } else {
        resultado = 11 - (soma % 11);
      }
      return resultado == digitos.charAt(1);
    },

    criarFormData: function ($formulario, valores) {
      const formData = new FormData($formulario.get(0));

      Object.keys(valores || {}).forEach(function (chave) {
        formData.set(chave, valores[chave]);
      });

      return formData;
    },

    validarArquivo: function (arquivo, $input) {
      const elemento = $input.get(0);
      const tiposPermitidos = (elemento.getAttribute("data-tiposPermitidos") || "").toLowerCase();
      const tamanhoMaximoMb = parseFloat(elemento.getAttribute("data-tamanhoMaximoMb"));

      if (tiposPermitidos) {
        const nomeArquivo = arquivo.name.toLowerCase();
        const tipoArquivo = (arquivo.type || "").toLowerCase();

        const tipoValido = tiposPermitidos.split(",").some(function (tipo) {
          tipo = $.trim(tipo);
          if (tipo === "") { return false; }
          if (tipo.slice(-2) === "/*") { return tipoArquivo.indexOf(tipo.slice(0, -1)) === 0; }
          if (tipo.charAt(0) === ".") { return nomeArquivo.slice(-tipo.length) === tipo; }
          return tipoArquivo === tipo;
        });

        if (!tipoValido) {
          return "Tipo de arquivo não permitido!";
        }
      }

      if (tamanhoMaximoMb > 0 && arquivo.size > tamanhoMaximoMb * 1024 * 1024) {
        return "O arquivo deve ter no máximo " + tamanhoMaximoMb + " MB!";
      }

      return "";
    },

    configurarPreviewImagem: function ($container, $input, $preview) {
      const self = this;
      const srcOriginal = $preview.attr("src");

      $preview.on("click", function () {
        $input.trigger("click");
      });

      $input.on("change", function () {
        const arquivo = this.files[0];

        if (!arquivo) {
          return;
        }

        const erro = arquivo.type.indexOf("image/") !== 0
          ? "Selecione uma imagem válida!"
          : self.validarArquivo(arquivo, $input);

        if (erro) {
          $input.val("");
          $preview.attr("src", srcOriginal);
          self.mostrarAlerta($container, erro, "danger");
          return;
        }

        const leitor = new FileReader();
        leitor.onload = function (evento) {
          $preview.attr("src", evento.target.result);
        };
        leitor.readAsDataURL(arquivo);
      });
    },

    configurarArquivo: function ($container, $input, $rotuloNome) {
      const self = this;

      $input.on("change", function () {
        const arquivo = this.files[0];

        if (!arquivo) {
          $rotuloNome.text("");
          return;
        }

        const erro = self.validarArquivo(arquivo, $input);

        if (erro) {
          $input.val("").addClass("is-invalid");
          $rotuloNome.text("");
          self.mostrarAlerta($container, erro, "danger");
          return;
        }

        $input.removeClass("is-invalid");
        $rotuloNome.text("Arquivo selecionado: " + arquivo.name);
      });
    },

    configurarCEP: function ($container, campos) {
      const self = this;
      const todosOsCampos = [campos.cep, campos.rua, campos.bairro, campos.cidade, campos.uf, campos.ibge];

      campos.cep.on("blur", function () {
        const cep = self.apenasNumeros($(this).val());

        if (!/^[0-9]{8}$/.test(cep)) {
          self.marcarCamposComErro($container, todosOsCampos, "CEP inválido!");
          return;
        }

        campos.rua.val("...");
        campos.bairro.val("...");
        campos.cidade.val("...");
        campos.uf.val("...");
        campos.ibge.val("...");

        $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {
          if (dados.erro) {
            self.marcarCamposComErro($container, todosOsCampos, "CEP não encontrado!");
            return;
          }

          campos.rua.val(dados.logradouro);
          campos.bairro.val(dados.bairro);
          campos.cidade.val(dados.localidade);
          campos.uf.val(dados.uf);
          campos.ibge.val(dados.ibge);
          todosOsCampos.forEach(function ($campo) {
            $campo.removeClass("is-invalid");
          });
        });
      });

      campos.cep.on("input", function () {
        $(this).removeClass("is-invalid");
      });
    }
  };

  window.ElmoUtilitarios = ElmoUtilitarios;

  $(function () {
    ElmoUtilitarios.aplicarMascaras();
  });

})(jQuery, window);