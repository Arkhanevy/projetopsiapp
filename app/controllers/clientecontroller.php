<?php
use models\cliente;

$acao = $_POST['acao'] ?? '';
$campos =[
    'cli_id',
    'cli_nome',
    'cli_email',
    'cli_user',
    'cli_senha',
    'cli_bio',
    'cli_foto',
    'cli_codVali',
    'cli_dtNasc',
    'cli_dtCad',
    'cli_dtDell',
    'cli_stat',
    'cli_CPF',
    'cli_tel',
    'cli_gen',
    'cli_doc',
    'cli_notif'];
switch ($acao){
    case "cadastrar":
        $cliente = new cliente('cliente', $campos, $campos[0]);
        $resultado = $cliente->Cadastrarcliente($_POST['nome'], $_POST['email'], $_POST['username'], $_POST['senha'],$_POST['bio'], $_POST['dtNas'], $_POST['CPF'],$_POST['telefone'],$_POST['genero']);
        echo json_encode($resultado);
        exit;
        
    case "ReGerarCodigo":
        $camposcli = [$campos[2], $campos[7]];
        $cliente = new cliente('cliente',$camposcli,$camposcli[0]);
        $resultado = $cliente->GerarCodigo($_POST['email']);
        echo json_encode($resultado);
        exit;
        
    case "ativar":
        $camposcli = [$campos[2], $campos[7],$campos[11]];
        $cliente = new cliente('cliente', $camposcli, $camposcli[0]);
        $resultado = $cliente->Ativar($_POST['email'], $_POST['cod']);
        echo json_encode($resultado);
        exit;
        
    case "login":
        $campos = [$campos[0],$campos[1],$campos[2],$campos[4], $campos[11]];
        $cliente = new cliente('cliente', $campos, $camposcli[2]);
        $resultado = $cliente->Login($_POST['email'],$_POST['senha']);
        echo json_encode($resultado);
        exit;
    case "MostrarConsulta":
        $campo = 'agnd_cli';
        $cliente = new cliente('cliente', $campo, $campo);
        $resultado = $cliente->MostrarConsulta();
        echo json_encode($resultado);
        exit;
}