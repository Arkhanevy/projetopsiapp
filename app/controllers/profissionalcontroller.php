<?php
use models\profissional;
use models\busca;
use models\clinica;
use models\notificacao;
use models\download;
use models\servicos;

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
    'pro_doc'];
switch ($acao){
    case "cadastrar":
        $profissional = new profissional('profissional', $campos, $campos[0]);
        $resultado = $profissional->Cadastrarprofissional($_POST['nome'], $_POST['email'],$_FILES['cxproFoto'] ?? '', $_POST['username'], $_POST['senha'],$_POST['bio'], $_POST['dtNas'], $_POST['CPF'],$_POST['CEP'],$_POST['telefone'],$_POST['genero'],'');
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
        $resultado = $profissional->MostrarConsulta($_POST['dia'] ?? '');
        echo json_encode($resultado);
        exit;
    case "PegarPerfil":
        $camposPro = [$campos[0],$campos[1],$campos[5],$campos[6]];
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
        $download = new download();
        
        $properfil = $profissional->PegarPerfil($_SESSION['usuario']['idUsuario']);
        if ($properfil['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $properfil['erro']
            ]);
            exit;
        }
        if (!empty($properfil['dados'])) {
            $arq = $download->arquivoParaDataUri($properfil['dados'][0]['pro_foto'] ?? '');
            $properfil['dados'][0]['pro_foto'] = $arq ? $arq['data'] : '';
        }
        
        
        $proHrser = $profissional->pegarHrser();
        if ($proHrser['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $proHrser['erro']
            ]);
            exit;
        }
        
        $proSer = $busca->MeusServicos($_SESSION['usuario']['tipoUsuario'],$_SESSION['usuario']['idUsuario']);
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
    case 'contato':
        $camposCli = ['cli_id','cli_nome','cli_tel','cli_email','cli_foto'];
        $camposCLin = ['clin_id','clin_nome','clin_tel','clin_email','clin_foto'];
        
        $condicao = ['agnd_cli','agnd_pro'];
        $id = $_SESSION['usuario']['idUsuario'];
        
        $profissional = new profissional('cliente', $camposCli, $camposCli[0]);
        $clinica= new clinica('clinica', $camposCLin, $camposCLin[0]);
        
        $contPro = $profissional->contatoProCli($condicao, $id);
        if ($contPro['sucesso'] === false){
            echo json_encode($contPro);
        };
        $contCLin = $clinica->contatoCLin($condicao[1], $id);
        
        if ($contCLin['sucesso'] === false){
            echo json_encode($contCLin);
        };
        $baixar = new download();
        $contPro['dados']  = $baixar->anexarFotos($contPro['dados'] ?? null, 'cli');
        $contCLin['dados'] = $baixar->anexarFotos($contCLin['dados'] ?? null, 'clin');
        echo json_encode([
            "sucesso" => true, 
            "dados1" => $contPro['dados'],
            "dados2" => $contCLin['dados']
            ]);
        exit;

    // TESTE - MARIA
    case "verificarLogin":
        // Usado por perfil.js: informa se a sessão atual é de um profissional.
        // Lê a mesma estrutura que usuario::Login grava em $_SESSION['usuario'].
        header('Content-Type: application/json; charset=utf-8');
        $logado = isset($_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario'])
            && $_SESSION['usuario']['tipoUsuario'] === 'profissional';
        echo json_encode(['logado' => $logado]);
        exit;  
         
    case 'atualizar':
        $dicpro = [
            'nome' => 'pro_nome',
            'email' => 'pro_email',
            'biografia' => 'pro_bio',
            'foto' => 'pro_foto',
            'CEP' => 'pro_CEP',
            'telefone' => 'pro_tel',
            ];
        $atualizacao = $_POST['atualizacao'];

        $campos = ['pro_id'];
        foreach ($atualizacao as $campo){
            if (!array_key_exists($campo, $dicpro)) {
                echo json_encode(['sucesso' => false,'mensagem' => 'Campo de atualização não válido']);
                exit;
            }
            $campos[] = $dicpro[$campo];
        }

        $valores = $_POST['valores'];
        $id = $_SESSION['usuario']['idUsuario'];
        $profissional = new profissional('profissional', $campos, $campos[0]);
        $atualizar = $profissional->atualizar($valores, $id);
        echo json_encode($atualizar);
        exit;
    case 'notificação':
        $notificacâo = new notificacao('notificacao', '*', '', $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
        $listar = $notificacâo->listar();
        echo json_encode($listar);
        exit;
    case 'lernot':
        $notificacâo = new notificacao('notificacao', 'notif_id,notif_stat', 'notif_id', $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
        $lido = $notificacâo->lido($_POST['not_id']);
        echo json_encode($lido);
        exit;
    case 'aceitar':
        $aceitar = new servicos();
        $sucesso = $aceitar->aceitar($_POST['agnd_id'], $_POST['agnd_pro']);
        if ($sucesso['sucesso'] === true) {
            $camposnot= ['notif_id',
                'notif_pd',
                'notif_clin',
                'notif_dest',
                'notif_tipo',
                'notif_msg',
                'notif_data',
                'notif_stat',
                'notif_pro'
            ];
            
            $notificacâo = new notificacao('notificacao', $camposnot, $camposnot[0], $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
            $notificacâo = $notificacâo->enviar(3, $_POST['agnd_cli'],$_POST['agnd_clin'] ?? $_POST['agnd_pro']);
            echo json_encode($notificacâo);
            exit;
        }
        echo json_encode($sucesso);
        exit;
        
    //ver se tá dando certo
    // ---------- ASSOCIAÇÃO CLÍNICA <-> PROFISSIONAL ----------
    case 'aceitar_vinculo':
        if (($_SESSION['usuario']['tipoUsuario'] ?? '') !== 'profissional') {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Somente profissionais podem aceitar convites.']);
            exit;
        }
        // a clínica NÃO vem mais do POST: é lida da própria notificação (e conferida)
        $profissional = new profissional('profissional', $campos, $campos[0]);
        $resultado = $profissional->aceitarVinculo($_SESSION['usuario']['idUsuario'], $_POST['notif_id'] ?? 0);
        echo json_encode($resultado);
        exit;

    case 'recusar_vinculo':
        if (($_SESSION['usuario']['tipoUsuario'] ?? '') !== 'profissional') {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Somente profissionais podem recusar convites.']);
            exit;
        }
        $profissional = new profissional('profissional', $campos, $campos[0]);
        $resultado = $profissional->recusarVinculo($_SESSION['usuario']['idUsuario'], $_POST['notif_id'] ?? 0);
        echo json_encode($resultado);
        exit;
    
    case 'rejeitar':
        $rejeitar = new servicos();
        $sucesso = $rejeitar->rejeitar($_POST['agnd_id'], $_POST['agnd_pro']);
        if ($sucesso['sucesso'] === true) {
            $camposnot= ['notif_id',
                'notif_pd',
                'notif_clin',
                'notif_dest',
                'notif_tipo',
                'notif_msg',
                'notif_data',
                'notif_stat',
                'notif_pro'
            ];
            $notificacâo = new notificacao('notificacao', $camposnot, $camposnot[0], $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
            $notificacâo = $notificacâo->enviar(4, $_POST['agnd_cli'],$_POST['agnd_clin'] ?? $_POST['agnd_pro']);
            echo json_encode($notificacâo);
            exit;
        }
        echo json_encode($sucesso);
        exit;
    case 'meusArquivos':
        $arquivos = new download();
        $resultado = $arquivos->meusarquivos($_SESSION['usuario']['idUsuario'], 'profissional', 'pro_id');
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
