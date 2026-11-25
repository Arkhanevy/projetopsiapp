<?php
use models\cliente;
use models\clinica;
use models\notificacao;
use models\download;

$acao = $_POST['acao'] ?? '';
$campos =[
    'cli_id',
    'cli_nome',
    'cli_email',
    'cli_user',
    'cli_senha',
    'cli_foto',
    'cli_codVali',
    'cli_dtNasc',
    'cli_dtCad',
    'cli_dtDell',
    'cli_stat',
    'cli_CPF',
    'cli_tel',
    'cli_gen',
    'cli_doc'];
switch ($acao){
    case "cadastrar":
        $cliente = new cliente('cliente', $campos, $campos[0]);
        $resultado = $cliente->Cadastrarcliente($_POST['nome'] ?? '', $_POST['email'],$_FILES['cxclientefoto'] ?? '', $_POST['username'] ?? '', $_POST['senha'], $_POST['dtNas'] ?? null, $_POST['CPF'],$_POST['telefone'] ?? '',$_POST['genero'] ?? '');
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
        $campos = [$campos[0],$campos[1],$campos[2],$campos[4], $campos[10]];
        $cliente = new cliente('cliente', $campos, $campos[2]);
        $resultado = $cliente->Login($_POST['email'],$_POST['senha']);
        echo json_encode($resultado);
        exit;
    case "MostrarConsulta":
        $campo = 'agnd_cli';
        $cliente = new cliente('cliente', $campo, $campo);
        $resultado = $cliente->MostrarConsulta($_POST['dia'] ?? '');
        echo json_encode($resultado);
        exit;
    case 'contato':
        $campospro = ['pro_id','pro_nome','pro_tel','pro_email','pro_foto'];
        $camposCLin = ['clin_id','clin_nome','clin_tel','clin_email','clin_foto'];
        
        $condicao = ['agnd_pro','agnd_cli'];
        $id = $_SESSION['usuario']['idUsuario'];
        
        $contCli = new cliente('profissional', $campospro, $campospro[0]);
        $clinica= new clinica('clinica', $camposCLin, $camposCLin[0]);
        
        $contCli = $contCli->contatoProCli($condicao, $id);
        if ($contCli['sucesso'] === false){
            echo json_encode($contCli);
        };
        $contCLin = $clinica->contatoCLin($condicao[1], $id);
        
        if ($contCLin['sucesso'] === false){
            echo json_encode($contCLin);
        };
        $baixar = new download();
        $contCli['dados']  = $baixar->anexarFotos($contCli['dados'] ?? null, 'pro');
        $contCLin['dados'] = $baixar->anexarFotos($contCLin['dados'] ?? null, 'clin');
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
    case "PegarPerfil":
        $camposcli = [$campos[0],$campos[1],$campos[5],$campos[6]];
        $cliente = new cliente('cliente', $camposcli, $camposcli[0]);
        $download  =new download();
            
        $cliperfil = $cliente->PegarPerfil($_SESSION['usuario']['idUsuario']);
        if ($cliperfil['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $cliperfil['erro']
            ]);
            exit;
        }
        
        if (!empty($cliperfil['dados'])) {
            $arq = $download->arquivoParaDataUri($cliperfil['dados'][0]['cli_foto'] ?? '');
            $dataUri = $arq ? $arq['data'] : '';
            $cliperfil['dados'][0]['cli_foto'] = $dataUri;
            $cliperfil['dados'][0]['pro_foto'] = $dataUri; // perfil.js lê pro_foto para quem não é clínica
        }
        
        echo json_encode([
            'sucesso' => true,
            'dados1' => $cliperfil['dados']
        ]);
        exit;
    case 'atualizar':
        $diccli = [
        'nome' => 'cli_nome',
        'email' => 'cli_email',
        'biografia' => 'cli_bio',
        'foto' => 'cli_foto',
        'telefone' => 'cli_tel',
        ];
        $atualizacao = $_POST['atualizacao'];
        $campos = ['cli_id'];
        foreach ($atualizacao as $campo){
            if (!array_key_exists($campo, $diccli)) {
                echo json_encode(['sucesso' => false,'mensagem' => 'Campo de atualização não válido']);
                exit;
            }
            $campos[] = $diccli[$campo];
        }
        $valores = $_POST['valores'];
        $id = $_SESSION['usuario']['idUsuario'];
        $cliente = new cliente('cliente', $campos, $campos[0]);
        $atualizar = $cliente->atualizar($valores, $id);
        echo json_encode($atualizar);
        exit;
    case 'notificação':
        $notificacâo = new notificacao('notificacao', '*', '', $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
        $listar = $notificacâo->listar();
        echo json_encode($listar);
        exit;
    //TESTE - MARIA
    case 'lernot':
        if (!isset($_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario'])) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Faça login para continuar.']);
            exit;
        }
        $notificacâo = new notificacao('notificacao', 'notif_id,notif_stat', 'notif_id', $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
        echo json_encode($notificacâo->lido($_POST['not_id'] ?? 0));
        exit;
    case 'meusArquivos':
        $arquivos = new download();
        $resultado = $arquivos->meusarquivos($_SESSION['usuario']['idUsuario'], 'cliente', 'cli_id');
        echo json_encode($resultado);
        exit;
    case 'arquivosCompartilhados':
        $arquivos = new download();
        $resultado = $arquivos->arquivoscompartilhado($_POST['id'],$_SESSION['usuario']['email']);
        echo json_encode($resultado);
        exit;
    case 'listarDocumentosContato':
        $arquivos = new download();
        $resultado = $arquivos->listarDocumentosContato($_POST['idContato'] ?? '', $_POST['tipoContato'] ?? '', $_POST['tipo'] ?? 'enviados');
        echo json_encode($resultado);
        exit;
    case 'enviarDocumento':
        $arquivos = new download();
        $resultado = $arquivos->enviarDocumento($_POST['idContato'] ?? '', $_POST['tipoContato'] ?? '', $_POST['tituloDocumento'] ?? '', $_FILES['arquivoDocumento'] ?? null);
        echo json_encode($resultado);
        exit;
    case 'uploadDocumento':
        $arquivos = new download();
        $resultado = $arquivos->salvarDocumentoProprio($_POST['titulo'] ?? '', $_POST['tipo'] ?? '', $_FILES['file'] ?? null);
        echo json_encode($resultado);
        exit;
    case 'baixarDocumento':
        $arquivos = new download();
        $resultado = $arquivos->baixarDocumento($_POST['idDocumento'] ?? '');
        echo json_encode($resultado);
        exit;
}
