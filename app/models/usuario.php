<?php

namespace models; 

use core\database\DBQuery;
use core\utils\CodeGenerator;
use core\utils\Mail;
use core\database\Where;

class usuario {
    private $table = '';
    private  $campos = '';
    private  $primary = '';
    
    protected function __construct($table,$campos,$primary) {
        $this->table = $table;
        $this->campos = $campos;
        $this->primary = $primary;
    }
    
    protected function Cadastrar($dados) {
        $camposStr = implode(',', $this->campos);//nessa função o $campo vai ser um array com todos os campos
        try {
            $cadastrar = new DBQuery($this->table, $camposStr, $this->primary);
            $cadastrar->insert($dados);
            return ['sucesso' => true];
        } 
        catch (\Exception $e) {
                    return [
                        'sucesso' => false,
                        'mensagem' => $e->getMessage()
                    ];
                }
                
    }
    
    public function GerarCodigo($email) {
        //nessa função o $campo vai ser os campos para:email e codigo de validação
        $generator = new CodeGenerator();
        $cod = $generator->run(6);
        $dados = [$email,$cod];
        $assunto = 'codigo de validação';
         $body = "!DOCTYPE html>
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
            return ['sucesso' => true];
            $email = new Mail($dados[2], $assunto, $body);
             $email ->send();
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
        $campoSelect = "agnd_id,agnd_pro,profissional.pro_nome,agnd_cli,cliente.cli_nome,agnd_clin,clinica.clin_nome,agnd_ser,servico.ser_nome,agnd_dt,agnd_hrIni,agnd_hrTerm";
        $campospro = "pro_id,pro_nome";
        $campocli = "cli_id,cli_nome";
        $camposClin = "clin_id,clin_nome";
        $campoServ = "ser_id,ser_nome";
        
        $agenda = new DBQuery('agenda', $campoSelect, 'agnd_id');
        $profissional = new DBQuery('profissional', $campospro, 'pro_id');
        $cliente = new DBQuery('cliente', $campocli, 'cli_id');
        $clinica = new DBQuery('clinica', $camposClin, 'clin_id');
        $servico = new DBQuery('servico', $campoServ, 'ser_id');
        
        $agenda->addJoin('INNER', 'agnd_pro', $profissional, 'pro_id');
        $agenda->addJoin('INNER', 'agnd_cli', $cliente, 'cli_id');
        $agenda->addJoin('INNER', 'agnd_clin', $clinica, 'clin_id');
        $agenda->addJoin('INNER', 'agnd_ser', $servico, 'ser_id');
        
        $where = new Where();
        $where->addCondition('AND', $this->campos, '=', $_SESSION[$this->table]['idUsuario']);
        
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
    
    public function PegarPerfil() {
        $camposStr = implode(',', $this->campos);
        $usuario = new DBQuery($this->table, $camposStr, $this->primary);
        $where = new Where();
        $where->addCondition('AND', $this->primary, '=', $_SESSION['usuario']['idUsuario']);
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
}  
?>