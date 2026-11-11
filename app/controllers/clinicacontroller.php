
<?php
use models\clinica;
use models\profissional;
use models\notificacao;
use models\download;

$acao = $_POST['acao'] ?? '';
$campos =[
    'clin_id',
    'clin_nome',
    'clin_email',
    'clin_user',
    'clin_senha',
    'clin_bio',
    'clin_foto',
    'clin_codVali',
    'clin_dtCad',
    'clin_dtDell',
    'clin_stat',
    'clin_cnpj',
    'clin_cep',
    'clin_tel'];
switch ($acao){
    case "cadastrar":
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $resultado = $clinica->Cadastrarclinica($_POST['nome'], $_POST['email'],$_FILES['foto'], $_POST['username'], $_POST['senha'],$_POST['bio'], $_POST['CNPJ'],$_POST['CEP'],$_POST['telefone']);
        echo json_encode($resultado);
        exit;
        
    case "ReGerarCodigo":
        $camposclin = [$campos[2], $campos[7]];
        $clinica = new clinica('clinica',$camposclin,$camposclin[0]);
        $resultado = $clinica->GerarCodigo($_POST['email']);
        echo json_encode($resultado);
        exit;
        
    case "ativar":
        $camposclin = [$campos[2], $campos[7],$campos[10]];
        $clinica = new clinica('clinica', $camposclin, $camposclin[0]);
        $resultado = $clinica->Ativar($_POST['email'], $_POST['cod']);
        echo json_encode($resultado);
        exit;
        
    case "login":
        $camposclin = [$campos[0],$campos[1],$campos[2],$campos[4], $campos[10]];
        $clinica = new clinica('clinica', $camposclin, $camposclin[2]);
        $resultado = $clinica->Login($_POST['email'],$_POST['senha']);
        echo json_encode($resultado);
        exit;
    case "MostrarConsulta":
        $campo = 'agnd_clin';
        $clinica = new clinica('clinica', $campo, $campo);
        $resultado = $clinica->MostrarConsulta();
        echo json_encode($resultado);
        exit;
    case "pegarinfo":
        $camposclin = [$campos[0],$campos[1],$campos[5],$campos[6],$campos[12]];
        $clinica = new clinica('clinica', $camposclin, $camposclin[0]);
        $download  =new download();
        
        $clinperfil = $clinica->PegarPerfil($_SESSION['usuario']['idUsuario']);
        if ($clinperfil['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $clinperfil['erro']
            ]);
            exit;
        }
        
        if (!empty($clinperfil['dados'])) {
            $arq = $download->arquivoParaDataUri($clinperfil['dados'][0]['clin_foto']);
            $clinperfil['dados'][0]['pro_foto'] = $arq ? $arq['data'] : null;
        }
        
        $proHrser = $clinica->pegarHrser();
        if ($proHrser['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $proHrser['erro']
            ]);
            exit;
        }

        echo json_encode([
            'sucesso' => true,
            'dados1' => $clinperfil['dados']
        ]);
        exit;
    case 'contato':
        $camposPro = ['pro_id','pro_nome','pro_tel'];
        
        $condicao = ['agnd_pro','agnd_clin'];
        $id = $_SESSION['usuario']['idUsuario'];
        
        $profissional = new profissional('profissional', $camposPro, $camposPro[0]);
        
        $contPro = $profissional->contatoProCli($condicao, $id);
        if ($contPro['sucesso'] === false){
            echo json_encode($contPro);
        };
        
        echo json_encode([
            "sucesso" => true,
            "dados1" => $contPro['dados']
        ]);
        exit;
    

    case "efetuarLogin":
        header('Content-Type: application/json; charset=utf-8');
        
        $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
        $senha = $_POST['senha'] ?? '';

        $usuario = new models\clinica(); 
        
        // Chama a função que já está pronta usuario.php
        $resultado = $usuario->Login($email, $senha);
        
        // Retorna a resposta para o seu formulário
        echo json_encode($resultado);
        exit;

    // TESTE - MARIA
    case "verificarLogin":
        // Usado por perfil.js: informa se a sessão atual é de uma clínica.
        // Lê a mesma estrutura que usuario::Login grava em $_SESSION['usuario'].
        header('Content-Type: application/json; charset=utf-8');
        $logado = isset($_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario'])
            && $_SESSION['usuario']['tipoUsuario'] === 'clinica';
        echo json_encode(['logado' => $logado]);
        exit;
    case 'notificação':
        $notificacâo = new notificacao('notificacao', '*', '', $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
        $listar = $notificacâo->listar();
        echo json_encode($listar);
        exit;
        
    // --- ROTA PARA DESLOGAR ---
    case "logout":
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        unset($_SESSION['usuario']);
        session_destroy();
        header("Location: /login.php");
        exit;
    case 'meusArquivos':
        $arquivos = new download();
        $resultado = $arquivos->meusarquivos($_SESSION['usuario']['idUsuario'], 'clinica', 'clin_id');
        echo json_encode($resultado);
        exit;
    case 'arquivosCompartilhados':
        $arquivos = new download();
        $resultado = $arquivos->arquivoscompartilhado($_POST['id'],$_SESSION['usuario']['email']);
        echo json_encode($resultado);
        exit;
}
