(function ($, window) {
  "use strict";

  var ElmoUtilitarios = {

    obterParametroUrl: function (nome) {
      var parametros = new URLSearchParams(window.location.search);
      return parametros.get(nome);
    },

    obterInstanciaModal: function ($elementoModal, opcoes) {
      return bootstrap.Modal.getOrCreateInstance($elementoModal.get(0), opcoes);
    },

    exibirModal: function ($elementoModal, opcoes) {
      this.obterInstanciaModal($elementoModal, opcoes).show();
    },

    esconderModal: function ($elementoModal) {
      var instancia = bootstrap.Modal.getInstance($elementoModal.get(0));
      if (instancia) {
        instancia.hide();
      }
    },

    preencherCampos: function ($camposDinamicos, dados) {
      $camposDinamicos.each(function () {
        var $elemento = $(this);
        var nomeCampo = $elemento.data("campo");

        if (!(nomeCampo in dados)) {
          return;
        }

        if (this.tagName === "IMG") {
          $elemento.attr("src", dados[nomeCampo]);

          var nomeCampoAlt = $elemento.data("campo-alt");
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

    mostrarAlerta: function ($container, mensagem, tipo) {
      tipo = tipo || "success";

      var $alerta = $(
        '<div class="alert alert-' + tipo + ' alert-dismissible fade show" role="alert">' +
          mensagem +
          '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        "</div>"
      );

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
      var numeros = this.apenasNumeros(telefone || "");

      if (numeros.length !== 10 && numeros.length !== 11) return false;

      var ddd = parseInt(numeros.substring(0, 2), 10);
      if (ddd < 11 || ddd > 99) return false;

      if (numeros.length === 11 && numeros.charAt(2) !== "9") return false;

      return true;
    },

    calcularIdade: function (dataNascimento) {
      var hoje = new Date();
      var nascimento = new Date(dataNascimento + "T00:00:00");
      var idade = hoje.getFullYear() - nascimento.getFullYear();
      var diferencaMeses = hoje.getMonth() - nascimento.getMonth();

      if (diferencaMeses < 0 || (diferencaMeses === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }

      return idade;
    },

    maiorDeIdade: function (dataNascimento, idadeMinima) {
      idadeMinima = idadeMinima || 18;

      if (!dataNascimento || isNaN(new Date(dataNascimento + "T00:00:00").getTime())) {
        return false;
      }

      return this.calcularIdade(dataNascimento) >= idadeMinima;
    },

    validarCampos: function (campos) {
      var erro = false;
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
      var self = this;

      regras.forEach(function (regra) {
        regra.$campo.on("blur", function () {
          var valor = $.trim(regra.$campo.val());

          if (valor === "" || regra.valido(valor)) {
            regra.$campo.removeClass("is-invalid").removeAttr("aria-invalid");
            return;
          }

          regra.$campo.addClass("is-invalid").attr("aria-invalid", "true");

          var jaExibido = $container.find(".alert").filter(function () {
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
      var d = this.apenasNumeros(valor || "");
      var f = "";

      if (tipo === "telefone") {

        if (d.length > 11 && d.indexOf("55") === 0) d = d.substring(2);
        d = d.substring(0, 11);
        if (d.length === 0) return "";
        f = "(" + d.substring(0, 2);
        if (d.length > 2) {
          var resto = d.substring(2);

          var corte;
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
      var self = this;

      function formatarCampo(campo) {
        var tipo = campo.getAttribute("data-mascara");
        var antes = campo.value;
        var depois = self.formatarMascara(tipo, antes);
        if (antes === depois) return;

        var cursor = campo.selectionStart;
        var digitosAntesDoCursor;
        if (cursor === null || cursor === undefined) {
          digitosAntesDoCursor = null;
        } else {
          digitosAntesDoCursor = self.apenasNumeros(antes.substring(0, cursor)).length;
        }

        campo.value = depois;

        if (digitosAntesDoCursor !== null && document.activeElement === campo) {
          var contados = 0;
          var posicao = 0;
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

      var soma = 0;
      var i;
      for (i = 0; i < 9; i++) {
        soma += parseInt(cpf[i], 10) * (10 - i);
      }
      var resto = (soma * 10) % 11;
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

      var tamanho = 12;
      var numeros = cnpj.substring(0, tamanho);
      var digitos = cnpj.substring(tamanho);
      var soma = 0;
      var pos = tamanho - 7;
      var i;

      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }

      var resultado;
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

    configurarPreviewImagem: function ($container, $input, $preview) {
      var self = this;

      $preview.on("click", function () {
        $input.trigger("click");
      });

      $input.on("change", function () {
        var arquivo = this.files[0];

        if (!arquivo || !arquivo.type.startsWith("image/")) {
          self.mostrarAlerta($container, "Selecione uma imagem válida!", "danger");
          return;
        }

        var leitor = new FileReader();
        leitor.onload = function (evento) {
          $preview.attr("src", evento.target.result);
        };
        leitor.readAsDataURL(arquivo);
      });
    },

    configurarCEP: function ($container, campos) {
      var self = this;
      var todosOsCampos = [campos.cep, campos.rua, campos.bairro, campos.cidade, campos.uf, campos.ibge];

      campos.cep.on("blur", function () {
        var cep = self.apenasNumeros($(this).val());

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
