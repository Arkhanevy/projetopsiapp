<?php
namespace models;

use core\utils\Base64Files;
use core\utils\UploadedCtrl;
use core\database\DBQuery;
use core\database\Where;

class download {
    public function arquivoParaDataUri($caminho, $larguraMax = 0) {
        $dir = realpath(__DIR__ . '/../uploads');
        if (!$caminho || !$dir) {
            return null;
        }
        
        // aceita caminho com "\" ou "/" e fica só com o nome do arquivo
        $nome = basename(str_replace('\\', '/', $caminho));
        $real = realpath($dir . DIRECTORY_SEPARATOR . $nome);
        
        if (!$real || strpos($real, $dir . DIRECTORY_SEPARATOR) !== 0 || !is_file($real)) {
            return null;
        }
        
        $permitidos = ['image/jpeg','image/png','image/gif','image/webp','application/pdf'];
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        
        $conteudo = file_get_contents($real);
        $mime = $finfo->buffer($conteudo);
        
        if (in_array($mime, $permitidos, true)) {
            if ($larguraMax > 0) {
                $conteudo = $this->reduzirImagem($conteudo, $mime, (int) $larguraMax);
            }
            $b64 = base64_encode($conteudo);        // arquivo guardado é o binário original
        } else {
            $bin = base64_decode(trim($conteudo), true);   // fallback: texto base64
            if ($bin === false) {
                return null;
            }
            $mime = $finfo->buffer($bin);
            if (!in_array($mime, $permitidos, true)) {
                return null;
            }
            $b64 = trim($conteudo);
        }
        
        return [
            'sucesso' => true,
            'mime' => $mime,
            'nome' => $nome,
            'data' => "data:$mime;base64,$b64"
        ];
    }
    
    private function reduzirImagem($conteudo, $mime, $larguraMax) {
        if (!function_exists('imagecreatefromstring') || !function_exists('imagescale')
            || !in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            return $conteudo;
        }
        if ($mime === 'image/webp' && !function_exists('imagewebp')) {
            return $conteudo;
        }
        $img = @imagecreatefromstring($conteudo);
        if (!$img) {
            return $conteudo;
        }
        if (imagesx($img) <= $larguraMax) {
            imagedestroy($img);
            return $conteudo;
        }
        $novo = imagescale($img, $larguraMax);
        imagedestroy($img);
        if (!$novo) {
            return $conteudo;
        }
        ob_start();
        if ($mime === 'image/png') {
            imagesavealpha($novo, true);
            imagepng($novo);
        } elseif ($mime === 'image/webp') {
            imagewebp($novo, null, 80);
        } else {
            imagejpeg($novo, null, 82);
        }
        $saida = ob_get_clean();
        imagedestroy($novo);
        return ($saida !== false && $saida !== '') ? $saida : $conteudo;
    }

    private function montarListaDocumentos($linhas, $filtroEmail = '') {
        $lista = [];
        foreach ($linhas as $linha) {
            if (($linha['tipo'] ?? '') === 'foto') {
                continue;
            }
            if ($filtroEmail !== '' && !in_array($filtroEmail, $this->listaDeEmails($linha['shareMails'] ?? ''), true)) {
                continue;
            }
            $arquivo = $this->arquivoParaDataUri($linha['filePath']);
            if ($arquivo === null) {
                continue;
            }
            $arquivo['id']     = $arquivo['nome'];
            $arquivo['titulo'] = $linha['titulo'] ?? '';
            $arquivo['tipo']   = $linha['tipo'] ?? '';
            $lista[] = $arquivo;
        }
        return $lista;
    }

    public function meusarquivos($id,$tipo) {
        $arquivos = new DBQuery('ctrlFiles', 'filePath, shareMails, titulo, tipo', '');

        $where = new Where();
        $where->addCondition('AND', 'owner', '=', $id);
        $where->addCondition('AND', 'ownerTipo', '=', $tipo);

        try {
            $linhas = $arquivos->selectFiltered($where)->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return ['sucesso' => false,'mensagem' => $e->getMessage()];
        }

        return ['sucesso' => true, 'dados' => $this->montarListaDocumentos($linhas)];
    }

    // Arquivos de $dono compartilhados com o e-mail $comp (shareMails pode ter vários e-mails separados por vírgula).
    public function arquivoscompartilhado($dono,$comp) {
        $emailAlvo = strtolower(trim((string) $comp));
        if ($emailAlvo === '') {
            return ['sucesso' => true, 'dados' => []];
        }
        $arquivos = new DBQuery('ctrlFiles', 'filePath, shareMails, titulo, tipo', '');
        $where = new Where();
        $where->addCondition('AND', 'owner', '=', $dono);

        try {
            $linhas = $arquivos->selectFiltered($where)->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return ['sucesso' => false,'mensagem' => $e->getMessage()];
        }

        return ['sucesso' => true, 'dados' => $this->montarListaDocumentos($linhas, $emailAlvo)];
    }

    // =====================================================================
    // Documentos e imagens trocados entre contatos (tela de Contatos)
    // =====================================================================

    private $extensoesPermitidas = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'pdf'  => 'application/pdf'
    ];
    private $tamanhoMaximoBytes = 10485760; // 10 MB (php.ini precisa permitir pelo menos isso)

    private function dadosDoTipo($tipo) {
        $mapa = [
            'cliente'      => ['tabela' => 'cliente',      'id' => 'cli_id',  'nome' => 'cli_nome',  'email' => 'cli_email',  'agenda' => 'agnd_cli'],
            'profissional' => ['tabela' => 'profissional', 'id' => 'pro_id',  'nome' => 'pro_nome',  'email' => 'pro_email',  'agenda' => 'agnd_pro'],
            'clinica'      => ['tabela' => 'clinica',      'id' => 'clin_id', 'nome' => 'clin_nome', 'email' => 'clin_email', 'agenda' => 'agnd_clin']
        ];
        return $mapa[$tipo] ?? null;
    }

    private function sessaoAtual() {
        $sessao = $_SESSION['usuario'] ?? null;
        if (!$sessao || empty($sessao['idUsuario']) || empty($sessao['tipoUsuario'])) {
            return null;
        }
        return $sessao;
    }

    private function listaDeEmails($texto) {
        $emails = [];
        foreach (explode(',', (string) $texto) as $email) {
            $email = strtolower(trim($email));
            if ($email !== '') {
                $emails[] = $email;
            }
        }
        return $emails;
    }

    private function buscarContato($tipo, $id) {
        $dados = $this->dadosDoTipo($tipo);
        if (!$dados || $id === '' || $id === null) {
            return null;
        }
        $consulta = new DBQuery($dados['tabela'], $dados['id'] . ',' . $dados['nome'] . ',' . $dados['email'], $dados['id']);
        $where = new Where();
        $where->addCondition('AND', $dados['id'], '=', $id);
        try {
            $linha = $consulta->selectFiltered($where)->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return null;
        }
        if (!$linha) {
            return null;
        }
        return [
            'id'    => $linha[$dados['id']],
            'tipo'  => $tipo,
            'nome'  => $linha[$dados['nome']],
            'email' => $linha[$dados['email']]
        ];
    }

    // só deixa trocar arquivos com quem aparece na lista de contatos (tem agendamento em comum)
    private function ehContatoDaSessao($sessao, $contato) {
        $meu  = $this->dadosDoTipo($sessao['tipoUsuario']);
        $dele = $this->dadosDoTipo($contato['tipo']);
        if (!$meu || !$dele || $meu['agenda'] === $dele['agenda']) {
            return false;
        }
        $agenda = new DBQuery('agenda', 'agnd_id', 'agnd_id');
        $where = new Where();
        $where->addCondition('AND', $meu['agenda'], '=', $sessao['idUsuario']);
        $where->addCondition('AND', $dele['agenda'], '=', $contato['id']);
        try {
            return (bool) $agenda->selectFiltered($where)->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return false;
        }
    }

    private function pastaUploads() {
        $pasta = realpath(__DIR__ . '/../uploads');
        if (!$pasta) {
            @mkdir(__DIR__ . '/../uploads', 0775, true);
            $pasta = realpath(__DIR__ . '/../uploads');
        }
        return $pasta;
    }

    private function caminhoNoBanco($pasta, $nome) {
        return str_replace('\\', '/', $pasta) . '/' . $nome;
    }

    private function contatoDaRequisicao($idContato, $tipoContato) {
        $sessao = $this->sessaoAtual();
        if (!$sessao) {
            return ['sucesso' => false, 'mensagem' => 'Sessão expirada. Entre novamente.'];
        }
        $contato = $this->buscarContato($tipoContato, $idContato);
        if (!$contato || !$this->ehContatoDaSessao($sessao, $contato)) {
            return ['sucesso' => false, 'mensagem' => 'Contato não encontrado.'];
        }
        return ['sucesso' => true, 'sessao' => $sessao, 'contato' => $contato];
    }

    // Corta o texto em $max caracteres (UTF-8) sem depender da extensão mbstring, que pode não estar instalada.
    private function cortarTexto($texto, $max) {
        $texto = (string) $texto;
        if (function_exists('mb_substr')) {
            return mb_substr($texto, 0, $max);
        }
        $caracteres = preg_split('//u', $texto, -1, PREG_SPLIT_NO_EMPTY);
        if ($caracteres === false) {
            return substr($texto, 0, $max);
        }
        return implode('', array_slice($caracteres, 0, $max));
    }

    // Valida o upload (erro, tamanho, extensão e conteúdo real) e move para app/uploads com nome aleatório.
    private function gravarArquivoEnviado($arquivo) {
        if (!is_array($arquivo) || !isset($arquivo['error'])) {
            return ['sucesso' => false, 'mensagem' => 'Escolha um arquivo para enviar.'];
        }
        if ($arquivo['error'] === UPLOAD_ERR_INI_SIZE || $arquivo['error'] === UPLOAD_ERR_FORM_SIZE) {
            return ['sucesso' => false, 'mensagem' => 'O arquivo é maior que o limite do servidor.'];
        }
        if ($arquivo['error'] === UPLOAD_ERR_NO_FILE) {
            return ['sucesso' => false, 'mensagem' => 'Escolha um arquivo para enviar.'];
        }
        if ($arquivo['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($arquivo['tmp_name'])) {
            return ['sucesso' => false, 'mensagem' => 'Falha no envio do arquivo.'];
        }
        if ($arquivo['size'] > $this->tamanhoMaximoBytes) {
            return ['sucesso' => false, 'mensagem' => 'O arquivo é maior que o limite de 10 MB.'];
        }

        $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
        if (!isset($this->extensoesPermitidas[$extensao])) {
            return ['sucesso' => false, 'mensagem' => 'Este tipo de arquivo não é permitido.'];
        }
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        if ($finfo->file($arquivo['tmp_name']) !== $this->extensoesPermitidas[$extensao]) {
            return ['sucesso' => false, 'mensagem' => 'O conteúdo do arquivo não confere com o tipo informado.'];
        }

        $pasta = $this->pastaUploads();
        if (!$pasta) {
            return ['sucesso' => false, 'mensagem' => 'Pasta de arquivos indisponível no servidor.'];
        }
        $nome = 'doc' . date('YmdHis') . bin2hex(random_bytes(4)) . '.' . $extensao;
        if (!move_uploaded_file($arquivo['tmp_name'], $pasta . DIRECTORY_SEPARATOR . $nome)) {
            return ['sucesso' => false, 'mensagem' => 'Não foi possível salvar o arquivo.'];
        }

        return ['sucesso' => true, 'pasta' => $pasta, 'nome' => $nome];
    }

    public function enviarDocumento($idContato, $tipoContato, $titulo, $arquivo) {
        $base = $this->contatoDaRequisicao($idContato, $tipoContato);
        if (!$base['sucesso']) {
            return $base;
        }
        $sessao  = $base['sessao'];
        $contato = $base['contato'];

        $titulo = trim((string) $titulo);
        if ($titulo === '') {
            return ['sucesso' => false, 'mensagem' => 'Informe um título para o documento.'];
        }
        $titulo = $this->cortarTexto($titulo, 100);

        $gravado = $this->gravarArquivoEnviado($arquivo);
        if (!$gravado['sucesso']) {
            return $gravado;
        }
        $pasta = $gravado['pasta'];
        $nome  = $gravado['nome'];

        try {
            $registro = new DBQuery('ctrlFiles', 'owner, filePath, accessCtrl, shareMails, ownerTipo, titulo, tipo', 'filePath');
            $registro->insert([
                $sessao['idUsuario'],
                $this->caminhoNoBanco($pasta, $nome),
                1,                      // 1 = privado
                $contato['email'],      // quem pode ver além do dono
                $sessao['tipoUsuario'],
                addslashes($titulo),
                'documento'
            ]);
        } catch (\Exception $e) {
            @unlink($pasta . DIRECTORY_SEPARATOR . $nome);
            return ['sucesso' => false, 'mensagem' => 'Não foi possível registrar o arquivo: ' . $e->getMessage()];
        }

        return ['sucesso' => true];
    }

    private $tiposDocumentoPerfil = ['diploma', 'certificadoEspecializacao', 'licencaAlvaraSanitario', 'alvaraFuncionamento'];

    // Documento do próprio perfil (diploma, alvará...). Fica privado: só o dono vê em "meus arquivos".
    public function salvarDocumentoProprio($titulo, $tipo, $arquivo) {
        $sessao = $this->sessaoAtual();
        if (!$sessao) {
            return ['sucesso' => false, 'mensagem' => 'Sessão expirada. Entre novamente.'];
        }
        $titulo = $this->cortarTexto(trim((string) $titulo), 90);
        if ($titulo === '') {
            return ['sucesso' => false, 'mensagem' => 'Informe um título para o documento.'];
        }
        $tipo = trim((string) $tipo);
        if (!in_array($tipo, $this->tiposDocumentoPerfil, true)) {
            return ['sucesso' => false, 'mensagem' => 'Tipo de documento inválido.'];
        }

        $gravado = $this->gravarArquivoEnviado($arquivo);
        if (!$gravado['sucesso']) {
            return $gravado;
        }
        $pasta = $gravado['pasta'];
        $nome  = $gravado['nome'];

        try {
            $registro = new DBQuery('ctrlFiles', 'owner, filePath, accessCtrl, shareMails, ownerTipo, titulo, tipo', 'filePath');
            $registro->insert([
                $sessao['idUsuario'],
                $this->caminhoNoBanco($pasta, $nome),
                1,
                '',
                $sessao['tipoUsuario'],
                addslashes($titulo),
                $tipo
            ]);
        } catch (\Exception $e) {
            @unlink($pasta . DIRECTORY_SEPARATOR . $nome);
            return ['sucesso' => false, 'mensagem' => 'Não foi possível registrar o arquivo: ' . $e->getMessage()];
        }

        return ['sucesso' => true];
    }

    public function listarDocumentosContato($idContato, $tipoContato, $aba) {
        $base = $this->contatoDaRequisicao($idContato, $tipoContato);
        if (!$base['sucesso']) {
            return $base;
        }
        $sessao  = $base['sessao'];
        $contato = $base['contato'];

        $enviados = ($aba !== 'recebidos');
        $where = new Where();
        if ($enviados) {
            $where->addCondition('AND', 'owner', '=', $sessao['idUsuario']);
            $where->addCondition('AND', 'ownerTipo', '=', $sessao['tipoUsuario']);
            $emailAlvo = strtolower(trim((string) $contato['email']));
            $remetente = $sessao['nome'] ?? '';
            $destinatario = $contato['nome'];
        } else {
            $where->addCondition('AND', 'owner', '=', $contato['id']);
            $where->addCondition('AND', 'ownerTipo', '=', $contato['tipo']);
            $emailAlvo = strtolower(trim((string) ($sessao['email'] ?? '')));
            $remetente = $contato['nome'];
            $destinatario = $sessao['nome'] ?? '';
        }

        try {
            $consulta = new DBQuery('ctrlFiles', 'owner, filePath, shareMails, ownerTipo, titulo, tipo', 'filePath');
            $linhas = $consulta->selectFiltered($where)->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return ['sucesso' => false, 'mensagem' => $e->getMessage()];
        }

        $lista = [];
        foreach ($linhas as $linha) {
            if ($linha['tipo'] === 'foto' || $emailAlvo === '') {
                continue;
            }
            if (!in_array($emailAlvo, $this->listaDeEmails($linha['shareMails']), true)) {
                continue;
            }
            $nome = basename(str_replace('\\', '/', $linha['filePath']));
            $lista[] = [
                'idDocumento'     => $nome,
                'tituloDocumento' => $linha['titulo'],
                'remetente'       => $remetente,
                'destinatario'    => $destinatario,
                'extensao'        => strtolower(pathinfo($nome, PATHINFO_EXTENSION))
            ];
        }

        return ['sucesso' => true, 'dados' => array_reverse($lista)];
    }

    public function baixarDocumento($idDocumento) {
        $sessao = $this->sessaoAtual();
        if (!$sessao) {
            return ['sucesso' => false, 'mensagem' => 'Sessão expirada. Entre novamente.'];
        }
        $nome = basename(str_replace('\\', '/', (string) $idDocumento));
        $pasta = $this->pastaUploads();
        if ($nome === '' || !$pasta) {
            return ['sucesso' => false, 'mensagem' => 'Arquivo não encontrado.'];
        }

        $where = new Where();
        $where->addCondition('AND', 'filePath', '=', $this->caminhoNoBanco($pasta, $nome));
        try {
            $consulta = new DBQuery('ctrlFiles', 'owner, filePath, shareMails, ownerTipo, titulo, tipo', 'filePath');
            $linha = $consulta->selectFiltered($where)->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return ['sucesso' => false, 'mensagem' => $e->getMessage()];
        }
        if (!$linha) {
            return ['sucesso' => false, 'mensagem' => 'Arquivo não encontrado.'];
        }

        $ehDono = ((string) $linha['owner'] === (string) $sessao['idUsuario'] && $linha['ownerTipo'] === $sessao['tipoUsuario']);
        $emailDaSessao = strtolower(trim((string) ($sessao['email'] ?? '')));
        $ehDestinatario = ($emailDaSessao !== '' && in_array($emailDaSessao, $this->listaDeEmails($linha['shareMails']), true));
        if (!$ehDono && !$ehDestinatario) {
            return ['sucesso' => false, 'mensagem' => 'Você não tem acesso a este arquivo.'];
        }

        $arquivo = $this->arquivoParaDataUri($nome);
        if ($arquivo === null) {
            return ['sucesso' => false, 'mensagem' => 'Arquivo não encontrado no servidor.'];
        }
        $titulo = trim(preg_replace('/[\\\\\/:*?"<>|\r\n]+/u', '', (string) $linha['titulo']));
        if ($titulo === '') {
            $titulo = 'documento';
        }
        $arquivo['nome'] = $titulo . '.' . strtolower(pathinfo($nome, PATHINFO_EXTENSION));
        return $arquivo;
    }

    // troca o caminho da foto (campo xxx_foto) por uma imagem pronta para o <img src>
    public function anexarFotos($lista, $prefixo, $larguraMax = 400) {
        if (!is_array($lista)) {
            return $lista;
        }
        $campo = $prefixo . '_foto';
        foreach ($lista as $indice => $item) {
            $foto = null;
            if (!empty($item[$campo])) {
                $foto = $this->arquivoParaDataUri($item[$campo], $larguraMax);
            }
            if ($foto) {
                $lista[$indice][$campo] = $foto['data'];
            } else {
                $lista[$indice][$campo] = '';
            }
        }
        return $lista;
    }

}
?>
