<?php
use models\clinica;
use models\profissional;
use models\notificacao;
use models\download;
use models\permissao;
use models\busca;

$acao = $_POST['acao'] ?? '';
$campos = [
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
    'clin_tel'
];
switch ($acao) {
    case "cadastrar":
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $resultado = $clinica->Cadastrarclinica($_POST['nome'], $_POST['email'], $_FILES['cxclinFoto'] ?? '', $_POST['username'], $_POST['senha'], $_POST['bio'], $_POST['CNPJ'], $_POST['telefone']);
        echo json_encode($resultado);
        exit();

    case "ReGerarCodigo":
        $camposclin = [
            $campos[2],
            $campos[7]
        ];
        $clinica = new clinica('clinica', $camposclin, $camposclin[0]);
        $resultado = $clinica->GerarCodigo($_POST['email']);
        echo json_encode($resultado);
        exit();

    case "ativar":
        $camposclin = [
            $campos[2],
            $campos[7],
            $campos[10]
        ];
        $clinica = new clinica('clinica', $camposclin, $camposclin[0]);
        $resultado = $clinica->Ativar($_POST['email'], $_POST['cod']);
        echo json_encode($resultado);
        exit();

    case "login":
        $camposclin = [
            $campos[0],
            $campos[1],
            $campos[2],
            $campos[4],
            $campos[10]
        ];
        $clinica = new clinica('clinica', $camposclin, $camposclin[2]);
        $resultado = $clinica->Login($_POST['email'], $_POST['senha']);
        echo json_encode($resultado);
        exit();
    case "efetuarLogin":
        $camposclin = [
            $campos[0],
            $campos[1],
            $campos[2],
            $campos[4],
            $campos[10]
        ];
        $clinica = new clinica('clinica', $camposclin, $camposclin[2]);
        $resultado = $clinica->Login($_POST['email'], $_POST['senha']);
        echo json_encode($resultado);
        exit();
    case "MostrarConsulta":
        $campo = 'agnd_clin';
        $clinica = new clinica('clinica', $campo, $campo);
        $resultado = $clinica->MostrarConsulta($_POST['dia'] ?? '');
        echo json_encode($resultado);
        exit();
    case "pegarinfo":
        $camposSer = [
            'ser_id',
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
            'ser_loc'
        ];
        $camposclin = [
            $campos[0],
            $campos[1],
            $campos[5],
            $campos[6]
        ];
        $clinica = new clinica('clinica', $camposclin, $camposclin[0]);
        $busca = new busca('servico', $camposSer, $camposSer[0]);
        $download = new download();

        $clinperfil = $clinica->PegarPerfil($_SESSION['usuario']['idUsuario']);
        if ($clinperfil['sucesso'] === false) {
            echo json_encode([
                "sucesso" => false,
                "erro" => $clinperfil['erro']
            ]);
            exit();
        }

        if (! empty($clinperfil['dados'])) {
            $arq = $download->arquivoParaDataUri($clinperfil['dados'][0]['clin_foto'] ?? '');
            $clinperfil['dados'][0]['clin_foto'] = $arq ? $arq['data'] : '';
        }

        $servicos = $busca->MeusServicos($_SESSION['usuario']['tipoUsuario'], $_SESSION['usuario']['idUsuario']);

        echo json_encode([
            'sucesso' => true,
            'dados1' => $clinperfil['dados'],
            'dados2' => $servicos['dados']
        ]);
        exit();
    case 'contato':
        $camposPro = [
            'pro_id',
            'pro_nome',
            'pro_tel',
            'pro_email',
            'pro_foto'
        ];

        $condicao = [
            'agnd_pro',
            'agnd_clin'
        ];
        $id = $_SESSION['usuario']['idUsuario'];

        $profissional = new profissional('profissional', $camposPro, $camposPro[0]);

        $contPro = $profissional->contatoProCli($condicao, $id);
        if ($contPro['sucesso'] === false) {
            echo json_encode($contPro);
        }
        ;

        $contPro['dados'] = (new download())->anexarFotos($contPro['dados'] ?? null, 'pro');
        echo json_encode([
            "sucesso" => true,
            "dados1" => $contPro['dados']
        ]);
        exit();

    // TESTE - MARIA
    case "verificarLogin":
        // Usado por perfil.js: informa se a sessão atual é de uma clínica.
        // Lê a mesma estrutura que usuario::Login grava em $_SESSION['usuario'].
        header('Content-Type: application/json; charset=utf-8');
        $logado = isset($_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']) && $_SESSION['usuario']['tipoUsuario'] === 'clinica';
        echo json_encode([
            'logado' => $logado
        ]);
        exit();
    case 'notificação':
        $notificacâo = new notificacao('notificacao', '*', '', $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
        $listar = $notificacâo->listar();
        echo json_encode($listar);
        exit();

    //TESTE - MARIA
    case 'lernot':
        if (!isset($_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario'])) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Faça login para continuar.']);
            exit();
        }
        $notificacâo = new notificacao('notificacao', 'notif_id,notif_stat', 'notif_id', $_SESSION['usuario']['idUsuario'], $_SESSION['usuario']['tipoUsuario']);
        echo json_encode($notificacâo->lido($_POST['not_id'] ?? 0));
        exit();

    case 'listarVinculos':
        $idPerfil = (int) ($_POST['idPerfil'] ?? 0);
        if ($idPerfil <= 0) {
            if (($_SESSION['usuario']['tipoUsuario'] ?? '') !== 'clinica') {
                echo json_encode(['sucesso' => false, 'mensagem' => 'Faça login como clínica para listar os vínculos.']);
                exit();
            }
            $idPerfil = (int) $_SESSION['usuario']['idUsuario'];
        }
        $clinica = new clinica('clinica', $campos, $campos[0]);
        echo json_encode($clinica->listarProfissionaisVinculados($idPerfil));
        exit();

        // ---------- ASSOCIAÇÃO CLÍNICA <-> PROFISSIONAL ----------
    // A clínica só ENVIA O CONVITE (notificação). O vínculo é criado quando o
    // profissional aceita (profissionalcontroller -> aceitar_vinculo).
    case "vincular":
        if (($_SESSION['usuario']['tipoUsuario'] ?? '') !== 'clinica') {
            echo json_encode([
                'sucesso' => false,
                'mensagem' => 'Somente clínicas podem convidar profissionais.'
            ]);
            exit();
        }
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $resultado = $clinica->convidarProfissional($_SESSION['usuario']['idUsuario'], $_POST['pro_id'] ?? 0);
        echo json_encode($resultado);
        exit();

    case "desvincular":
        if (($_SESSION['usuario']['tipoUsuario'] ?? '') !== 'clinica') {
            echo json_encode([
                'sucesso' => false,
                'mensagem' => 'Somente clínicas podem desvincular profissionais.'
            ]);
            exit();
        }
        // o id da clínica vem SEMPRE da sessão (nunca do POST)
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $resultado = $clinica->desvincularProfissional($_SESSION['usuario']['idUsuario'], $_POST['pro_id'] ?? 0);
        echo json_encode($resultado);
        exit();

    // --- ROTA PARA DESLOGAR ---
    case "logout":
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        unset($_SESSION['usuario']);
        session_destroy();
        header("Location: /login.php");
        exit();
    case 'atualizar':
        $dicclin = [
            'nome' => 'clin_nome',
            'email' => 'clin_email',
            'biografia' => 'clin_bio',
            'foto' => 'clin_foto',
            'telefone' => 'clin_tel'
        ];
        $atualizacao = $_POST['atualizacao'];

        $campos = [
            'clin_id'
        ];
        foreach ($atualizacao as $campo) {
            if (! array_key_exists($campo, $dicclin)) {
                echo json_encode([
                    'sucesso' => false,
                    'mensagem' => 'Campo de atualização não válido'
                ]);
                exit();
            }
            $campos[] = $dicclin[$campo];
        }

        $valores = $_POST['valores'];
        $id = $_SESSION['usuario']['idUsuario'];
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $atualizar = $clinica->atualizar($valores, $id);
        echo json_encode($atualizar);
        exit();
    case "atribuirHrServico":
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $resultado = $clinica->hrServico($_SESSION['usuario']['idUsuario'], $_POST['inicio'], $_POST['termino'], $_POST['dia']);
        echo json_encode($resultado);
        exit();
    case "atribuirHrServico":
        $clinica = new clinica('clinica', $campos, $campos[0]);
        $resultado = $clinica->hrExcecao($_SESSION['usuario']['idUsuario'], $_POST['inicio'], $_POST['termino'], $_POST['dia']);
        echo json_encode($resultado);
        exit();
    case 'permissao':
        $permissao = new permissao('permissoes', 'perm_id,perm_bin', 'perm_id');
        $atualizar = $permissao->atualizar($_POST['perm_id'], $_POST['status']);
        echo json_encode($atualizar);
        exit();
    case 'meusArquivos':
        $arquivos = new download();
        $resultado = $arquivos->meusarquivos($_SESSION['usuario']['idUsuario'], 'clinica', 'clin_id');
        echo json_encode($resultado);
        exit();
    case 'arquivosCompartilhados':
        $arquivos = new download();
        $resultado = $arquivos->arquivoscompartilhado($_POST['id'], $_SESSION['usuario']['email']);
        echo json_encode($resultado);
        exit();
    case 'listarDocumentosContato':
        $arquivos = new download();
        $resultado = $arquivos->listarDocumentosContato($_POST['idContato'] ?? '', $_POST['tipoContato'] ?? '', $_POST['tipo'] ?? 'enviados');
        echo json_encode($resultado);
        exit();
    case 'enviarDocumento':
        $arquivos = new download();
        $resultado = $arquivos->enviarDocumento($_POST['idContato'] ?? '', $_POST['tipoContato'] ?? '', $_POST['tituloDocumento'] ?? '', $_FILES['arquivoDocumento'] ?? null);
        echo json_encode($resultado);
        exit();
    case 'uploadDocumento':
        $arquivos = new download();
        $resultado = $arquivos->salvarDocumentoProprio($_POST['titulo'] ?? '', $_POST['tipo'] ?? '', $_FILES['file'] ?? null);
        echo json_encode($resultado);
        exit();
    case 'baixarDocumento':
        $arquivos = new download();
        $resultado = $arquivos->baixarDocumento($_POST['idDocumento'] ?? '');
        echo json_encode($resultado);
        exit();
}
