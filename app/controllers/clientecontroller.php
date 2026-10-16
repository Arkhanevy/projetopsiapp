<?php
use models\cliente;
use models\clinica;

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
    case 'contato':
        $camposCli = [$campos[0],$campos[1],$campos[13]];
        $camposCLin = ['clin_id','clin_nome','clin_tel'];
        
        $condicao = ['agnd_cli','agnd_pro'];
        $id = 1;//$_SESSION['usuario']['idUsuario'];
        
        $contCli = new cliente('cliente', $camposCli, $camposCli[0]);
        $clinica= new clinica('clinica', $camposCLin, $camposCLin[0]);
        
        $contCli = $contCli->contatoProCli($condicao, $id);
        if ($contCli['sucesso'] === false){
            echo json_encode($contCli);
        };
        $contCLin = $clinica->contatoCLin($condicao[1], $id);
        
        if ($contCLin['sucesso'] === false){
            echo json_encode($contCLin);
        };
        echo json_encode([
            "sucesso" => true,
            "dados1" => $contCli['dados'],
            "dados2" => $contCLin['dados']
        ]);
        exit;
    
    // TESTE - MARIA
    case "verificarLogin":
        // Usado por perfil.js e sessaoNavegacao.js: informa se a sessão atual é de um cliente.
        // Lê a mesma estrutura que usuario::Login grava em $_SESSION['usuario'].
        header('Content-Type: application/json; charset=utf-8');
        $logado = isset($_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario'])
            && $_SESSION['usuario']['tipoUsuario'] === 'cliente';
        echo json_encode(['logado' => $logado]);
        exit;
}