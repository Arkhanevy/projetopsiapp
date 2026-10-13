<?php
use models\profissional;
use models\busca;

$acao = $_POST['acao'] ?? '';
$campos =[
    'pro_id',
    'pro_nome',
    'pro_email',
    'pro_user',
    'pro_senha',
    'pro_bio',
    'pro_foto',
    'pro_codVali',
    'pro_dtNasc',
    'pro_dtCad',
    'pro_dtDell',
    'pro_stat',
    'pro_CPF',
    'pro_CEP',
    'pro_tel',
    'pro_gen',
    'pro_regi',
    'pro_doc',
    'pro_notif'];
switch ($acao){
    case "cadastrar":
        $profissional = new profissional('profissional', $campos, $campos[0]);
        $resultado = $profissional->Cadastrarprofissional($_POST['nome'], $_POST['email'], $_POST['username'], $_POST['senha'],$_POST['bio'], $_POST['dtNas'], $_POST['CPF'],$_POST['CEP'],$_POST['telefone'],$_POST['genero'],$_POST['registro']);
        echo json_encode($resultado);
        exit;
        
    case "ReGerarCodigo":
        $camposPro = [$campos[2], $campos[7]];
        $profissional = new profissional('profissional',$camposPro,$camposPro[0]);
        $resultado = $profissional->GerarCodigo($_POST['email']);
        echo json_encode($resultado);
        exit;

    case "ativar":
        $camposPro = [$campos[2], $campos[7],$campos[11]];
        $profissional = new profissional('profissional', $camposPro, $camposPro[0]);
        $resultado = $profissional->Ativar($_POST['email'], $_POST['cod']);
        echo json_encode($resultado);
        exit;
        
    case "login":
        $camposPro = [$campos[0],$campos[1],$campos[2],$campos[4], $campos[11]];
        $profissional = new profissional('profissional', $camposPro, $camposPro[2]);
        $resultado = $profissional->Login($_POST['email'],$_POST['senha']);
        echo json_encode($resultado);
        exit;
    case "atribuirHrServico":
        $profissional = new profissional('profissional', $campos, $campos[0]);
        $resultado = $profissional->hrServico($_SESSION['usuario']['idUsuario'], $_POST['clinica'] ?? 0, $_POST['inicio'], $_POST['termino'], $_POST['dia']);
        echo json_encode($resultado);
        exit;
    case 'aribuirHrExcecao':
        $profissional = new profissional('profissional', $campos, $campos[0]);
        $resultado = $profissional->hrExcecao($_SESSION['usuario']['idUsuario'], $_POST['dia'], $_POST['trabalho'], $_POST['inicio'], $_POST['termino'], $_POST['descricao']);
        echo json_encode($resultado);
        exit;
    case "MostrarConsulta":
        $campo = 'agnd_pro';
        $profissional = new profissional('profissional', $campo, $campo);
        $resultado = $profissional->MostrarConsulta();
        echo json_encode($resultado);
        exit;
    case "PegarPerfil":
        $camposPro = [$campos[0],$campos[1],$campos[5]];
        $camposSer = ['ser_id',
            'ser_pro',
            'ser_clin',
            'ser_nome',
            'ser_tipo',
            'ser_desc',
            'ser_dur',
            'ser_inter',
            'ser_val',
            'ser_stat',
            'ser_dia',
            'ser_loc'];
        $profissional = new profissional('profissional', $camposPro, $camposPro[0]);
        $busca = new busca('servico',$camposSer,$camposSer[0]);
        
        
        $properfil = $profissional->PegarPerfil();
        if ($properfil['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $properfil['erro']
            ]);
            exit;
        }
        
        $proHrser = $profissional->pegarHrser();
        if ($proHrser['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $proHrser['erro']
            ]);
            exit;
        }
        
        $proSer = $busca->MeusServicos();
        if ($proSer['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $proSer['erro']
            ]);
            exit;
        }
        
        echo json_encode([
            'sucesso' => true,
            'dados1' => $properfil['dados'],
            'dados2' => $proHrser['dados'],
            'dados3' => $proSer['dados']
        ]);
        exit;
        
}