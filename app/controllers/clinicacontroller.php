
<?php
use models\clinica;
use models\profissional;

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
    'clin_tel',
    'clin_notif'];
switch ($acao){
    case "cadastrar":
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $resultado = $clinica->Cadastrarclinica($_POST['nome'], $_POST['email'], $_POST['username'], $_POST['senha'],$_POST['bio'], $_POST['CNPJ'],$_POST['CEP'],$_POST['telefone']);
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
        $camposclin = [$campos[0],$campos[1],$campos[5],$campos[12]];
        $clinica = new clinica('clinica', $camposclin, $camposclin[0]);
        
        $clinperfil = $clinica->PegarPerfil();
        if ($clinperfil['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $clinperfil['erro']
            ]);
            exit;
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
        $id = 1;//$_SESSION['usuario']['idUsuario'];
        
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
}