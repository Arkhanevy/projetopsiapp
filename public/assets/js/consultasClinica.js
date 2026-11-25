(function ($, ConsultasPro) {
  "use strict";

  const URL_SERVICO = "index.php?uri=servico";

  const moduloConsultasClinica = ConsultasPro.criar({
    tipoUsuario:      "clinica",
    urlControlador:   "index.php?uri=clinica",
    urlLogin:         "index.php?uri=login",
    urlAgendamento:   "index.php?uri=reagendamento",

    contratos: {
      listarConsultas: { disponivel: true, acao: "MostrarConsulta" },

      listarDiasIndisponiveis: { disponivel: true, acao: "listarDiasIndisponiveis" },
      aceitarConsulta: {
        disponivel: true,
        acao: "aceitar",
        montarDados: function (consulta) {
          return {
            cli: consulta.idCliente,
            clinica: consulta.idClinica || 0,
            agnd_id: consulta.idConsulta
          };
        }
      },

      recusarConsulta: {
        disponivel: true,
        acao: "rejeitar",
        montarDados: function (consulta) {
          return {
            cli: consulta.idCliente,
            clinica: consulta.idClinica || 0,
            agnd_id: consulta.idConsulta
          };
        }
      },

      
      cancelarConsulta: {
        disponivel: true,
        acao: "cancelar",
        url: URL_SERVICO,
        montarDados: function (consulta) {
          return {
            agnd_id:   consulta.idConsulta,
            agnd_pro:  consulta.idProfissional,
            agnd_cli:  consulta.idCliente,
            agnd_clin: consulta.idClinica || 0,
            agnd_ser:  consulta.idServico
          };
        }
      }
    }
  });

  $(function () {
    moduloConsultasClinica.iniciar();
  });

})(jQuery, window.ConsultasPro);