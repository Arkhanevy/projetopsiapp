<?php
use models\localizacao;

$acao = $_POST['acao'] ?? '';
if ($acao === '') {
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Ação não enviada'
    ]);
};
if ($_SESSION['usuario']['tipoUsuario'] === 'cliente') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'clientes não tem acesso a essas ações']);
    exit;
}

$camposLoc = [
    'loc_id',
    'loc_pro',
    'loc_clin',
    'loc_nome',
    'loc_tipo',
    'loc_cep',
    'loc_num',
    'loc_compl'
];
$camposSala = [
    'sala_id',
    'sala_loc',
    'sala_nome'
];


switch ($acao){
    case "inserirloc":
        if ($_SESSION['usuario']['tipoUsuario'] === 'profissional') {
            $pro = $_SESSION['usuario']['idUsuario'];
            $clin = null;
        }
        if ($_SESSION['usuario']['tipoUsuario'] === 'clinica') {
            $pro = null;
            $clin = $_SESSION['usuario']['idUsuario'];
        }
        $localizacao = new localizacao('localizacao',$camposLoc,$camposLoc[0]);
        $inserir = $localizacao->inserirloc($pro, $clin, $_POST['nome'], $_POST['tipo'],$_POST['cep'],$_POST['numero'],$_POST['complemento'] ?? '');
        echo json_encode($inserir);
        exit;
    case 'inserirsala':
        $localizacao = new localizacao('sala',$camposSala,$camposSala[0]);
        $inserir = $localizacao->inserirsala($_POST['loc'],$_POST['nome'],$_SESSION['usuario']['tipoUsuario'],$_SESSION['usuario']['idUsuario']);
        echo json_encode($inserir);
        exit;
    case 'pegarloc':
        if (isset($_POST['clinica'])) {
            $id = $_POST['clinica'];
            $dono = 'clinica';
        }else if(isset($_POST['profissional'])) {
            $id = $_POST['profissional'];
            $dono = 'profissional';}
        else  {$id = $_SESSION['usuario']['idUsuario']; $dono = 'profissional';}
        
        $localizacao = new localizacao('localizacao',$camposLoc,$camposLoc[0]);
        $mostrar = $localizacao->pegarloc($dono,$id);
        echo json_encode($mostrar);
        exit;
    case 'pegarSalas':
        $localizacao = new localizacao('sala',$camposSala,$camposSala[0]);
        $mostrar = $localizacao->pegarSalas($_POST['loc']);
        echo json_encode($mostrar);
        exit;
    case 'editarloc':
        $dicpro = [
        'nome' => 'loc_nome',
        'tipo' => 'loc_tipo',
        'CEP' => 'loc_cep',
        'numero' => 'loc_num',
        'compl' => 'loc_compl'
        ];
        $atualizacao = $_POST['atualizacao'];
        
        $campos = ['loc_id'];
        foreach ($atualizacao as $campo){
            if (!array_key_exists($campo, $dicpro)) {
                echo json_encode(['sucesso' => false,'mensagem' => 'Campo de atualização não válido']);
                exit;
            }
            $campos[] = $dicpro[$campo];
        }
        
        $valores = $_POST['valores'];
        $localizacao = new localizacao('localizacao',$campos,$campos[0]);
        $mostrar = $localizacao->editar($valores,$_SESSION['usuario']['tipoUsuario'],$_SESSION['usuario']['idUsuario']);
        echo json_encode($mostrar);
        exit;
    case 'editarsala':
        $campos = ['sala_id','sala_nome'];
        
        $valores = $_POST['valores'];
        $localizacao = new localizacao('sala',$campos,$campos[0]);
        $mostrar = $localizacao->editar($valores,$_SESSION['usuario']['tipoUsuario'],$_SESSION['usuario']['idUsuario']);
        echo json_encode($mostrar);
        exit;
        
}
