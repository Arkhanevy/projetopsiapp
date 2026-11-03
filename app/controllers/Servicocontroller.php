<?php
use models\servicos;
use models\permissao;


$acao = $_POST['acao'] ?? '';
$servico = new servicos();

switch ($acao){
    case "cadastrar":
        $cadastro = $servico->cadastrar(0, $_SESSION['usuario']['idUsuario'],0/*$_POST['clinica']*/, $_POST['nome'], $_POST['tipo'], $_POST['desc'], $_POST['dur'], $_POST['inter'], $_POST['val'], $_POST['dia'], $_POST['loc']);
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
        $mostrar = $servico->MostrarDatas($_SESSION['servico']['ser_id'],  $_SESSION['servico']['ser_pro'],$ano,$mes,$dia);
        $_SESSION['datas'] = $mostrar;
        echo $mostrar;
        exit;
    case 'mostrarhorario':
        $mostrar = $servico->PegarHoraVaga($_POST['dia'],$_SESSION['servico']['ser_dur'],$_SESSION['servico']['ser_inter'],$_SESSION['servico']['ser_pro']);
        $_SESSION['horarios'] = $mostrar;
        $_SESSION['datas'] = $_POST['dia'];
        echo json_encode($mostrar);
        exit;
    case 'mostrarSala':
        $mostrar = $servico->sala($_POST['inicio'], $_POST['termino'], $_SESSION['servico']['ser_loc'], $_SESSION['datas']);
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
            $_SESSION['servico'] = [];
            $_SESSION['datas'] = [];
            $_SESSION['horarios'] = [];
        }
        echo $agendar;
        exit;
}