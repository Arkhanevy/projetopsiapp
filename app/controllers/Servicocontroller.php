<?php
use models\servicos;
use models\permissao;
use models\notificacao;


$acao = $_POST['acao'] ?? '';
$servico = new servicos();

switch ($acao){
    case "cadastrar":
        if ($_SESSION['usuario']['tipoUsuario'] === 'clinica') {
            $pro = 0;
            $clin = $_SESSION['usuario']['idUsuario'];
        }
        if ($_SESSION['usuario']['tipoUsuario'] === 'profissional') {
            $clin = 0;
            $pro = $_SESSION['usuario']['idUsuario'];
        }
        $cadastro = $servico->cadastrar(0, $pro ,$clin, $_POST['nome'], $_POST['tipo'], $_POST['desc'], $_POST['dur'], $_POST['inter'], $_POST['val'], $_POST['dia'], $_POST['loc']);
        echo $cadastro;
        exit;
    case 'MostrarDias':
        if ($_POST['mes']) {
            $dia = '01';
            $mes = $_POST['mes'];  
            $ano = $_POST['ano'];
        }else {
            $hoje = new DateTime();
            $ano = $hoje->format('Y'); 
            $mes = $hoje->format('m'); 
            $dia = $hoje->format('d');
        };
        $mostrar = $servico->MostrarDatas($_SESSION['servico']['ser_id'] ?? $_POST['ser_id'],  $_SESSION['servico']['ser_pro'] ?? $_POST['agnd_pro'],$ano,$mes,$dia);
        $_SESSION['datas'] = $mostrar;
        echo $mostrar;
        exit;
    case 'mostrarhorario':
        $mostrar = $servico->PegarHoraVaga($_POST['dia'],$_SESSION['servico']['ser_dur'] ?? $_POST['ser_dur'],$_SESSION['servico']['ser_inter'] ?? $_POST['ser_inter'],$_SESSION['servico']['ser_pro'] ?? $_POST['agnd_pro']);
        $_SESSION['horarios'] = $mostrar;
        $_SESSION['datas'] = $_POST['dia'];
        echo json_encode($mostrar);
        exit;
    case 'mostrarSala':
        $mostrar = $servico->sala($_POST['inicio'], $_POST['termino'], $_SESSION['servico']['ser_loc'] ?? $_POST['ser_loc'], $_SESSION['datas']);
        echo json_encode($mostrar);        
        exit;
    case 'agendar':
        if (($_SESSION['usuario']['tipoUsuario'] ?? '') === 'profissional' && !empty($_SESSION['servico']['ser_clin'])) {
            $permissao = new permissao('permissoes', 'perm_bin', 'perm_bin');
            $erro = $permissao->permissao( $_SESSION['usuario']['idUsuario'], $_SESSION['servico']['ser_clin'], 1);
            
            if ($erro !== true) {
                echo json_encode($erro);
                exit;
            };
        }
        $cliId = null;
        if ($_SESSION['usuario']['tipoUsuario'] === 'cliente') {
            $cliId = $_SESSION['usuario']['idUsuario'];
        }
        $agendar = $servico->agendar($_SESSION['servico']['ser_pro'],$cliId,$_SESSION['servico']['ser_id'],$_POST['sala'], $_POST['dia'], $_POST['inicio'], $_POST['termino']);
        if($agendar=== 'sucesso'){
            $camposnot= ['notif_id',
                'notif_pd',
                'notif_pro',
                'notif_clin',
                'notif_cli',
                'notif_dest',
                'notif_tipo',
                'notif_msg',
                'notif_data',
                'notif_status'];
            $notificacao = new notificacao('notificacao', $camposnot, $camposnot[0], $_SESSION['usuario']['idUsuario']);
            $notificacao->enviar(1, $_SESSION['usuario']['tipoUsuario'], $_SESSION['servico']['ser_pro']);
            $_SESSION['servico'] = [];
            $_SESSION['datas'] = [];
            $_SESSION['horarios'] = [];
        }
        echo $agendar;
        exit;
    case 'reagendar':
        if (($_SESSION['usuario']['tipoUsuario'] ?? '') === 'profissional' && !empty($_SESSION['servico']['ser_clin'])) {
            $permissao = new permissao('permissoes', 'perm_bin', 'perm_bin');
            $erro = $permissao->permissao( $_SESSION['usuario']['idUsuario'], $_SESSION['servico']['ser_clin'], 2);
            
            if ($erro !== true) {
                echo json_encode($erro);
                exit;
            };
        }
        $cliId = null;
        if ($_SESSION['usuario']['tipoUsuario'] === 'cliente') {
            $cliId = $_SESSION['usuario']['idUsuario'];
        }
        $reagendar = $servico->reagendar($_POST['agnd_id'],$_POST['agnd_pro'],$cliId,$_POST['ser_id'],$_POST['sala'], $_POST['dia'], $_POST['inicio'], $_POST['termino']);
        if($reagendar=== 'sucesso'){
            $camposnot= ['notif_id',
                'notif_pd',
                'notif_pro',
                'notif_clin',
                'notif_cli',
                'notif_dest',
                'notif_tipo',
                'notif_msg',
                'notif_data',
                'notif_status'];
            $notificacao = new notificacao('notificacao', $camposnot, $camposnot[0], $_SESSION['usuario']['idUsuario']);
            $notificacao->enviar(2, $_SESSION['usuario']['tipoUsuario'], $_SESSION['servico']['ser_pro']);
            $_SESSION['datas'] = [];
            $_SESSION['horarios'] = [];
        }
        echo $reagendar;
        exit;
    case 'cancelar':
        if (($_SESSION['usuario']['tipoUsuario'] ?? '') === 'profissional' && !empty($_SESSION['servico']['ser_clin'])) {
            $permissao = new permissao('permissoes', 'perm_bin', 'perm_bin');
            $erro = $permissao->permissao( $_SESSION['usuario']['idUsuario'], $_SESSION['servico']['ser_clin'], 3);
            
            if ($erro !== true) {
                echo json_encode($erro);
                exit;
            };
            
        $cancelar = $servico->cancelarconsulta($_POST['agnd_pro'], $_POST['agnd_clin'], $_POST['agnd_id'], $_POST['agnd_cli'], $_POST['agnd_ser']);
        if($cancelar === 'sucesso'){
            $dest = $_POST['agnd_cli'];
            if ($_SESSION['usuario']['tipoUsuario'] === 'cliente') {
                $dest = $_POST['agnd_pro'] ;
            }
            $camposnot= ['notif_id',
                'notif_pd',
                'notif_pro',
                'notif_clin',
                'notif_cli',
                'notif_dest',
                'notif_tipo',
                'notif_msg',
                'notif_data',
                'notif_status'];
            $notificacao = new notificacao('notificacao', $camposnot, $camposnot[0], $_SESSION['usuario']['idUsuario']);
            $notificacao->enviar(5, $_SESSION['usuario']['tipoUsuario'], $dest);

        }
        echo $reagendar;
        }
}