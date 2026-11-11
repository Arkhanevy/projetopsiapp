<?php
namespace models;

use core\utils\Base64Files;
use core\utils\UploadedCtrl;
use core\database\DBQuery;
use core\database\Where;

class download {
    public function arquivoParaDataUri($caminho) {
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
    
    public function meusarquivos($id,$tipo) {
        $arquivos = new DBQuery('ctrlFiles', 'filePath', '');

        $where = new Where();
        $where->addCondition('AND', 'owner', '=', $id);
        $where->addCondition('AND', 'ownerTipo', '=', $tipo);
        
        try {
            $resultado = $arquivos->selectFiltered($where);
            $linhas  = $resultado->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return ['sucesso' => false,'mensagem' => $e->getMessage()];
        }
        $lista = [];
        foreach ($linhas as $linha) {
            $arquivo = $this->arquivoParaDataUri($linha['filePath']);
            if ($arquivo === null) {
                continue; 
            }
            $lista[] = $arquivo;
        }
        
        return ['sucesso' => true, 'dados' => $lista];
        
   }
   
   public function arquivoscompartilhado($dono,$comp) {
       $arquivos = new DBQuery('ctrlFiles', 'filePath', '');
       $where = new Where();
       $where->addCondition('AND', 'owner', '=', $dono);
       $where->addCondition('AND', 'shareMails', '=', $comp);
       $where = $where->build();
       try {
           $resultado = $arquivos->selectWhere($where);
           $linhas  = $resultado->fetchAll(\PDO::FETCH_ASSOC);
       } catch (\Exception $e) {
           return ['sucesso' => false,'mensagem' => $e->getMessage()];
       }
       $lista = [];
       foreach ($linhas as $linha) {
           $arquivo = $this->arquivoParaDataUri($linha['filePath']);
           if ($arquivo === null) {
               continue;
           }
           $lista[] = $arquivo;
       }
       
       return ['sucesso' => true, 'dados' => $lista];
       
   }
}









?>