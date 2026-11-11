(function ($, ConsultasPro) {
  "use strict";

  var URL_SERVICO = "index.php?uri=servico";

  var moduloConsultasClinica = ConsultasPro.criar({
    tipoUsuario:      "clinica",
    urlControlador:   "index.php?uri=clinica",
    urlLogin:         "index.php?uri=loginClinica",
    urlAgendamento:   "index.php?uri=agendamentoClinica",

    contratos: {
      listarConsultas: { disponivel: true, acao: "MostrarConsulta" },

      listarDiasIndisponiveis: { disponivel: false, acao: "listarDiasIndisponiveis" },
       aceitarConsulta: { disponivel: false, acao: "aceitar" },
      recusarConsulta: { disponivel: false, acao: "rejeitar" },

      
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
