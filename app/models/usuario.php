<?php

namespace models; 

use core\database\DBQuery;
use core\utils\CodeGenerator;
use core\utils\Mail;
use core\database\Where;
use core\utils\Base64Files;
use core\utils\UploadedCtrl;

class usuario {
    private $table = '';
    private  $campos = '';
    private  $primary = '';
    private $foto = '';
    
    protected function __construct($table,$campos,$primary) {
        $this->table = $table;
        $this->campos = $campos;
        $this->primary = $primary;
    }
    
    
    protected function setFoto($foto){
        $this->foto = $foto;
    }
    
    private function fotodePerfil($email){
        $mapa = [
            'profissional' => 'pro',
            'clinica'      => 'clin',
            'cliente'      => 'cli',
        ];
        $cod = $mapa[$this->table].'_id';
        
        
        
        $camposStr = implode(',', $this->campos);
        $resgatar = new DBQuery($this->table, $camposStr, $this->primary);
        $where = new Where();
        $where->addCondition('AND', $this->campos[2], '=',$email);
        $where = $where->build();
        
        $resultado = $resgatar->selectWhere($where);
        $usuario = $resultado->fetch(\PDO::FETCH_ASSOC);
        
        
        $uploadPathDir = __DIR__."/../../"."app/uploads/";
        $uploader = new UploadedCtrl();
        
        
        $file = $this->foto;
        $accessCtrl = 0;
        $shareMails = ""; 
        
        $tempPath = $file['tmp_name'];
        $fileName = $file['name'];
        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileBase64Name = "up" . date('YmdHisv') . ".{$fileExtension}.base64";
        
        /**
         * Instancia a classe Base64Files.
         * Converter o arquivo para base64.
         * Salvar o arquivo base64 no diretório especificado.
         */
        $base64Files = new Base64Files();
        $fileContent = $base64Files->fileToBase64($tempPath);
        $base64Files->base64ToFile($fileContent, $uploadPathDir . $fileBase64Name);
        
        // Registrar o arquivo
        $owner = $usuario[$cod];
        $filePath = $uploadPathDir . $fileBase64Name;
        $filePath = str_replace('\\', '/', $filePath);
        $uploader->registerUploadedfile($owner, $filePath, $accessCtrl, $shareMails,$this->table);
        
        $campos = [
            'profissional' => 'pro_id,pro_foto',
            'clinica'      => 'clin_id,clin_foto',
            'cliente'      => 'cli_id,cli_foto',
        ];
        
        $dados = [$usuario[$cod],$filePath];
        
        $salvar = new DBQuery($this->table, $campos[$this->table], $cod);
        try {
            $salvar->update($dados);
            return ['sucesso' =>true];
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => 'erro ao salvar foto: '.$e->getMessage()
            ];
        }
        
        // Retornar o nome do arquivo para o cliente
        echo $fileBase64Name;
    }
    
    
    protected function Cadastrar($dados) {
        $camposStr = implode(',', $this->campos);//nessa função o $campo vai ser um array com todos os campos
        try {
            $cadastrar = new DBQuery($this->table, $camposStr, $this->primary);
            $cadastrar->insert($dados);
        } 
        catch (\Exception $e) {
                    return [
                        'sucesso' => false,
                        'mensagem' => $e->getMessage()
                    ];
                }
        $foto = $this->fotodePerfil($dados[2]);
        if ($foto['sucesso'] === false) {
            return json_encode($foto);
        }
        return ['sucesso' => true];
    }
    
    public function GerarCodigo($email) {
        //nessa função o $campo vai ser os campos para:email e codigo de validação
        $generator = new CodeGenerator();
        $cod = $generator->run(6);
        $dados = [$email,$cod];
        $assunto = 'codigo de validação';
         $body = "<!DOCTYPE html>
         <html lang='pt-BR'>
         <head>
         <meta charset='UTF-8'>
         <meta name='viewport' content='width=device-width, initial-scale=1.0'>
         </head>
         <body>
         <p> seu codigo é: ".$cod."</p>
         </body>
         </html>";
        
        try {
            $camposStr = implode(',', $this->campos);
            $codigo = new DBQuery($this->table, $camposStr, $this->primary);
            $codigo->update($dados);
            /*
            $mail = new Mail($dados[0], $assunto, $body);
            $mail ->send();
            if (!$mail->send()) {
                return [
                    'sucesso'  => false,
                    'mensagem' => $mail->getLastError()
                ];
            }*/
            return ['sucesso' => true];
        }catch (\Exception $e) {
            return [
                'sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        };
    }
    
    public function Ativar($email,$cod) {
        //nessa função o $campo vai ser os campos para:email, codigo de validação e status
        $codigo = new DBQuery($this->table, $this->campos[1], $this->primary);
        $where = new Where();
        $where->addCondition('AND', $this->campos[0], '=',$email);
        $where->addCondition('AND', $this->campos[1], '=',$cod);
        $where = $where->build();
        $codigo = $codigo->selectWhere($where);
        $resultado = $codigo->fetch(\PDO::FETCH_ASSOC);
        if (!$resultado) {
             return [
                'sucesso' => false,
                'mensagem' => "e-mail ou codigo invalido"
            ];
            
        }
        $dados = [$email,'ativo'];
        try {
            $camposStr = implode(',', [$this->campos[0],$this->campos[2]]);
            $ativar =  new DBQuery($this->table, $camposStr, $this->primary);
            $Update = $ativar->update($dados);
            if ($Update) {
                return [
                    'sucesso' => true];
            } else {
                return [
                    'sucesso' => false,
                    'mensagem' => "erro ao atualizar"
                ];
            }
        }
        catch (\Exception $e) {
            return [
                'sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        };
    }
    
    public function Login($email,$senha) {
        try {
            //nessa função o $campo vai ser os campos para:id,nome,email,senha e status
            $camposStr = implode(',', $this->campos);
            $login = new DBQuery($this->table, $camposStr, $this->primary);
            $where = new Where();
            $where->addCondition('AND', $this->campos[2], '=',$email);
            $where = $where->build();
            
            $resultado = $login->selectWhere($where);
            $usuario = $resultado->fetch(\PDO::FETCH_ASSOC);
            
            
        } catch (\Exception $e) {
            
            return [
                'sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
            
        };
        if (!$usuario) {
            return [
                'sucesso' => false,
                'mensagem' => "E-mail não encontrado"];
        }
        
        if ($usuario[$this->campos[4]] != 'ativo') {
            return [
                'sucesso' => false,
                'mensagem' => "Conta não ativada"];
            
        }
        if (!password_verify($senha, $usuario[$this->campos[3]])) {
            return [
                'sucesso' => false,
                'mensagem' => "Senha inválida"];
        }
        $_SESSION['usuario'] = [
            'idUsuario'    => $usuario[$this->campos[0]],
            'nome'  => $usuario[$this->campos[1]],
            'email' => $usuario[$this->campos[2]],
            'tipoUsuario' => $this->table
        ];
        return ['sucesso' => true];   
    }
    
    public function MostrarConsulta() {
        //nessa função o $campo vai ser sting com o campo: agnd_(id do usuario)
        $campoSelect = "agnd_id,agnd_pro,agnd_stat,profissional.pro_nome,agnd_cli,cliente.cli_nome,agnd_clin,clinica.clin_id,clinica.clin_nome,agnd_ser,servico.ser_id,servico.ser_nome,servico.ser_dur,servico.ser_inter,servico.ser_loc,agnd_dt,agnd_hrIni,agnd_hrTerm";
        $campospro = "pro_id,pro_nome";
        $campocli = "cli_id,cli_nome";
        $camposClin = "clin_id,clin_nome";
        $campoServ = "ser_id,ser_nome";
        $atual = new \DateTime();
        $atual = $atual->format('Y-m-d');
        
        $agenda = new DBQuery('agenda', $campoSelect, 'agnd_id');
        $profissional = new DBQuery('profissional', $campospro, 'pro_id');
        $cliente = new DBQuery('cliente', $campocli, 'cli_id');
        $clinica = new DBQuery('clinica', $camposClin, 'clin_id');
        $servico = new DBQuery('servico', $campoServ, 'ser_id');
        
        $agenda->addJoin('INNER', 'agnd_pro', $profissional, 'pro_id');
        $agenda->addJoin('LEFT', 'agnd_cli', $cliente, 'cli_id');// pode ser o profissional que cadastrou
        $agenda->addJoin('LEFT', 'agnd_clin', $clinica, 'clin_id');//pode não ter clinica/autonomo
        $agenda->addJoin('INNER', 'agnd_ser', $servico, 'ser_id');
        
        $where = new Where();
        $where->addCondition('AND', $this->campos, '=', $_SESSION['usuario']['idUsuario']);
        $where->addCondition('AND', 'agnd_stat', '=', 'aceita');
        $where->addCondition('AND', 'agnd_dt', '>=', $atual);
        
        try {
            $resultado = $agenda->selectFiltered($where);
            if ($resultado) {
                return [
                    'sucesso' => true,
                    'dados' => $resultado->fetchAll(\PDO::FETCH_ASSOC)
                ];
            } else {
                return ['sucesso' => false,
                        'mensagem' => "erro ao inserir"];
            }
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()];
        };
        
    }
    public function PegarPerfil($id){
        $camposStr = implode(',', $this->campos);
        $usuario = new DBQuery($this->table, $camposStr, $this->primary);
        $where = new Where();
        $where->addCondition('AND', $this->primary, '=', $id);
        $where = $where->build();
        try {
            $resultado = $usuario->selectWhere($where);
            return [
                'sucesso' => true,
                'dados' => $resultado->fetchAll(\PDO::FETCH_ASSOC)
            ];
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()];
        }
    }
    
    public function contatoProCli($condicao,$id) {
        $camposStr = implode(',', $this->campos);
        $camposStrAgnd = implode(',', $condicao);//"agnd_pro","agnd_cli" ou "agnd_cli","agnd_pro"
        $usuario = new DBQuery($this->table, 'DISTINCT ' . $camposStr, $this->primary);//aqui a requisição vai ser invetido, o cliente vai mandar a ação para o profissional contoller  
        $agenda = new DBQuery('agenda', $camposStrAgnd, $condicao[0]);// 'agnd_pro' ou 'agnd_cli'
        $usuario->addJoin('INNER', $this->primary, $agenda, $condicao[0]);//'pro_id' ou 'cli_id'
        $where = new Where();
        $where->addCondition('AND', 'agenda.' . $condicao[1], '=', $id);
        try {
            $resultado = $usuario->selectFiltered($where);
            return [
                'sucesso' => true,
                'dados' => $resultado->fetchAll(\PDO::FETCH_ASSOC)
            ];
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()];
        }
    }
    
    public function contatoCLin($condicao,$id) {
        $camposStr = implode(',', $this->campos);
        $usuario = new DBQuery($this->table, 'DISTINCT ' . $camposStr, $this->primary);
        $agenda = new DBQuery('agenda', 'agnd_clin', 'agnd_clin');
        $usuario->addJoin('INNER', $this->primary, $agenda, 'agnd_clin');
        $where = new Where();
        $where->addCondition('AND', 'agenda.' . $condicao, '=', $id);
        try {
            $resultado = $usuario->selectFiltered($where);
            return [
                'sucesso' => true,
                'dados' => $resultado->fetchAll(\PDO::FETCH_ASSOC)
            ];
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()];
        }
    }
    
    public function atualizar($valores,$id) {
        $camposStr = implode(',', $this->campos);
        $usuario = new DBQuery($this->table, $camposStr, $this->primary);
        try {
            array_unshift($valores, $id);
            
            $usuario->update($valores);
            return [
                'sucesso' => true,
                'dados' => 'atualizado com sucesso'
            ];
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()];
        }
    }
}  
?>