(function ($, ConsultasPro) {
  "use strict";

  const URL_SERVICO = "index.php?uri=servico";

  const moduloConsultasProfissional = ConsultasPro.criar({
    tipoUsuario:      "profissional",
    urlControlador:   "index.php?uri=profissional",
    urlDias:   "index.php?uri=servico",
    urlLogin:         "index.php?uri=loginProfissional",
    urlAgendamento:   "index.php?uri=reagendamento",

    contratos: {
      
      listarConsultas: { disponivel: true, acao: "MostrarConsulta" },

    
      listarDiasIndisponiveis: { disponivel: true, acao: "MostrarDias" },

      aceitarConsulta: {
        disponivel: true,
        acao: "aceitar",
        montarDados: function (consulta) {
          return {
            agnd_id:   consulta.idConsulta,
            agnd_pro:  consulta.idProfissional,
            agnd_cli:  consulta.idCliente,
            agnd_clin: consulta.idClinica || 0
          };
        }
      },

      recusarConsulta: {
        disponivel: true,
        acao: "rejeitar",
        montarDados: function (consulta) {
          return {
            agnd_id:   consulta.idConsulta,
            agnd_pro:  consulta.idProfissional,
            agnd_cli:  consulta.idCliente,
            agnd_clin: consulta.idClinica || 0
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
    moduloConsultasProfissional.iniciar();
  });

})(jQuery, window.ConsultasPro);