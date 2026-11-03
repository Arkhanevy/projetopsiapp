<?php
use models\relatorio;
file_put_contents(__DIR__ . '/debug_controller.txt', date('c') . " chegou\n", FILE_APPEND);

$acao = $_POST['acao'] ?? '';
if ($acao === '') {
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Ação não enviada'
    ]);
};
/*$campos = [
    'atd_id',
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
        $relatorio = new relatorio('atendimento'/*, $campos*/, 'atd_id'/*$campos[0]*/, $_SESSION['usuario']['tipoUsuario'], $_SESSION['usuario']['idUsuario']);
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
        $relatorio = new relatorio('atendimento'/*, $campos*/, 'atd_id'/*$campos[0]*/, $_SESSION['usuario']['tipoUsuario'], $_SESSION['usuario']['idUsuario']);
        $mostrar = $relatorio->ganhos($dia, $_POST['periodo']);
        echo json_encode($mostrar);
        exit;
}