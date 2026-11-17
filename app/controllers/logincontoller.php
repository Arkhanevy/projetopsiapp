<?php 
use models\cliente;
use models\clinica;
use models\profissional;

$acao = $_POST['acao'] ?? '';
$camposcli =[
    'cli_id',
    'cli_nome',
    'cli_email',
    'cli_senha',
    'cli_stat'];
$campospro =[
    'pro_id',
    'pro_nome',
    'pro_email',
    'pro_senha',
    'pro_stat'
];
$camposclin = [
    'clin_id',
    'clin_nome',
    'clin_email',
    'clin_senha',
    'clin_senha'
];
switch ($acao){
    case "login":
        $cliente = new cliente('cliente', $camposcli, $camposcli[0]);
        $cliente = $cliente->Login($_POST['email'],$_POST['senha']);
        $profissional = new profissional('profissional', $campospro, $campospro[0]);
        $profissional = $profissional->Login($_POST['email'], $_POST['senha']);
        $clinica = new clinica('clinica', $camposclin, $camposclin[2]);
        $clinica = $clinica->Login($_POST['email'],$_POST['senha']);
        if ($cliente['mensagem'] != "E-mail não encontrado" || $cliente['sucesso'] === true) {
            $resultado = $cliente;
        }
        if ($profissional['mensagem'] != "E-mail não encontrado" || $profissional['sucesso'] === true) {
            $resultado = $profissional;
        }
        if ($clinica['mensagem'] != "E-mail não encontrado" || $clinica['sucesso'] === true) {
            $resultado = $clinica;
        }
        echo json_encode($resultado);
        exit;
}
?>