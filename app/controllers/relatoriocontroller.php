<?php
use models\relatorio;

$acao = $_POST['acao'] ?? '';
if ($acao === '') {
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Ação não enviada'
    ]);
};
/*$campos = [// para caso seja usado em outros relatorios futuros
    'atd_id', // é atendimento pq essa tabela que serve de parametro para a construção do relatorio
    'atd_pro',
    'atd_clin',
    'atd_agnd',
    'atd_cli',
    'atd_ser',
    'atd_stat'
];
*/


switch ($acao){
    case "quantidade":
        $relatorio = new relatorio('atendimento','atd_id'/*, $campos*/, 'atd_id'/*$campos[0]*/, $_SESSION['usuario']['tipoUsuario'], $_SESSION['usuario']['idUsuario']);
        $mostrar = $relatorio->consultadas();
        echo json_encode($mostrar);
        exit;
    case 'ganho':
        switch ($_POST['periodo']) {
            case 'mensal':
                $data = new DateTime();
                $dia = $data->format('Y') . $_POST['data'] . '-01';
                break;
            case 'anual':
                $dia = $_POST['data'] . '-01-01' ;
                break;
            default:
                $dia = $_POST['data'];
            break;
        }
        $relatorio = new relatorio('atendimento','atd_id'/*, $campos*/, 'atd_id'/*$campos[0]*/, $_SESSION['usuario']['tipoUsuario'], $_SESSION['usuario']['idUsuario']);
        $mostrar = $relatorio->ganhos($dia, $_POST['periodo']);
        echo json_encode($mostrar);
        exit;
    case 'historico':
        $tipo = $_SESSION['usuario']['tipoUsuario'];
        $campo = '';
        if ($tipo === 'profissional') {
            $campo = 'pro_id';
        }
        if ($tipo === 'clinica') {
            $campo = 'clin_id';
        }
        if ($tipo === 'cliente') {
            $campo = 'cli_id';
        }
        $relatorio = new relatorio('atendimento',$campo, 'atd_id',$tipo, $_SESSION['usuario']['idUsuario']);
        $historico = $relatorio->historico();
        echo json_encode($historico);
        exit;
        
        
}