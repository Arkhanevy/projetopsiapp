<?php
use models\busca;


$acao = $_POST['acao'] ?? '';
$tipo = $_POST['tipo'] ?? '';
if ($acao === '') {
    echo 'ação não enviada. Tente novamente mais tarde';
};
if ($tipo === 'servico') {
    $campos = ['ser_id',
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
    $primary = $campos[0];
}
if ($tipo === 'profissional') {
    $campos = [
        'pro_id',
        'pro_nome',
        'pro_bio',
        'pro_foto',
        'pro_dtNasc',
        'pro_tel',
        'pro_gen'];
    $primary = $campos[0];
}
if ($tipo === 'clinica') {
    $campos = [
        'clin_id',
        'clin_nome',
        'clin_bio',
        'clin_foto',
        'clin_cep',
        'clin_tel'];
    $primary = $campos[0];
}
switch ($acao){
    case "busca":
        if ($tipo === 'servico') {
            $campos = [
                $campos[0],
                $campos[1],
                $campos[2],
                $campos[3],
                $campos[4],
                $campos[5],
                $campos[8]
            ];
        }
        else {
            $campos = [
                $campos[0],
                $campos[1],
                $campos[3]
            ];
        }
        $busca = new busca($tipo, $campos, $primary);
        $mostrar = $busca->Buscar($_POST['busca'],$_POST['valor']??'',$_POST['ser_pro'] ?? '');
        
        echo json_encode($mostrar);
        exit;
    case 'mostrardetalhes':
        $busca = new busca($tipo, $campos, $primary);
        $mostrar= $busca->MostrarDetalhes($_POST['id']);
        

        if ($mostrar['sucesso']) {
            if ($tipo === 'servico' && !empty($mostrar['dados'])) {
                $busca = $mostrar['dados'][0];
                $_SESSION['servico'] = [
                    'ser_id'    => $busca['ser_id'],
                    'ser_pro'   => $busca['ser_pro'],
                    'ser_clin'   => $busca['ser_clin'],
                    'ser_dur'   => $busca['ser_dur'],
                    'ser_inter' => $busca['ser_inter'],
                    'ser_loc'   => $busca['ser_loc']
                ];
            }
            
            echo json_encode([
                'sucesso' => true,
                'dados' => $mostrar['dados']
            ]);
        } else {
            echo json_encode([
                'sucesso' => false,
                'erro' => $mostrar['erro']
            ]);
        }
        exit;
    case 'gerenciarPro':
        $camposgen = array_merge(['pc_id'], $campos);
        $busca = new busca($tipo, $camposgen, $primary);
        $mostrar = $busca->gerenciarPro($_SESSION['usuario']['idUsuario']);
        
        
        if ($mostrar['sucesso']) {
            echo json_encode([
                'sucesso' => true,
                'dados' => $mostrar['dados']
            ]);
        } else {
            echo json_encode([
                'sucesso' => false,
                'erro' => $mostrar['erro']
            ]);
        }
        exit;
    case 'permisaopro':
        $camposgen = array_merge(['pc_id'], $campos);
        $busca = new busca('permissoes', ['perm_id','perm_tipo','perm_bin','perm_pc'], 'perm_id');
        $mostrar = $busca->permiçãoPro($_POST['pc_id']);
        
        
        if ($mostrar['sucesso']) {
            echo json_encode([
                'sucesso' => true,
                'dados' => $mostrar['dados']
            ]);
        } else {
            echo json_encode([
                'sucesso' => false,
                'erro' => $mostrar['erro']
            ]);
        }
        exit;
    }