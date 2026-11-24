<?php
namespace models;

use core\database\DBQuery;
use core\database\Where;

class localizacao {
    private $campos =[];
    private $primarykey =[];
    private $table = '';
    
    public function __construct($table,$campos,$primary) {
        $this->table = $table;
        $this->campos = $campos;
        $this->primary = $primary;
    }
    
    private function contruircampos($prefixo,$usuario) {
        $mapa = [
            'profissional' => 'pro',
            'clinica'      => 'clin',
            'cliente'      => 'cli',
        ];
        return $prefixo.$mapa[$usuario];}

    private function verifica($usuario,$id,$loc) {
        $cod = $this->contruircampos('loc_', $usuario);

        $camposStr = $this->table === 'localizacao' ? implode(',', $this->campos) : 'loc_id';
        
        $verifica = new DBQuery('localizacao', $camposStr, 'loc_id');
        $where = new Where();
        $where->addCondition('AND', 'loc_id', '=',$loc);
        $where->addCondition('AND', $cod, '=',$id);
        $where = $where->build();
        try {
            $resultado = $verifica->selectWhere($where);
            $dono = $resultado->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            return [
                'sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
            
        };
        if (!$dono) {
            return [
                'sucesso' => false,
                'mensagem' => "você não é o dono dessa localização"];
        }
        return ['sucesso' => true];
        
    }
    public function inserirloc($pro,$clin,$nome,$tipo,$cep,$num,$comp) {
        $camposLoc = implode(',',$this->campos);
        $dados =[
            0,
            $pro,
            $clin,
            $nome,
            $tipo,
            $cep,
            $num,
            $comp
        ];
        try {
            $cadastrar = new DBQuery($this->table, $camposLoc,$this->primarykey );
            $resultado = $cadastrar->insert($dados);
            
            if ($resultado) {
                return ["sucesso" => true];
            } else {
                return ["sucesso" => false, 'mensagem' => "erro ao inserir"];
            }
        } catch (\InvalidArgumentException $e) {
            return ["sucesso" =>false, 'mensagem' => "Erro de validação: " . $e->getMessage()];
        } catch (\Exception $e) {
            return ["sucesso" => false, 'mensagem' => "Erro no banco: " . $e->getMessage()];
        };
    }
    
    public function inserirsala($loc,$nome,$usuario,$id) {
        $dono = $this->verifica($usuario, $id, $loc);
        if ($dono['sucesso'] === false){
            return $dono;
        }
        $camposSala = implode(',',$this->campos);
        $dados =[
            0,
            $loc,
            $nome
        ];
        try {
            $cadastrar = new DBQuery($this->table, $camposSala,$this->primarykey );
            $resultado = $cadastrar->insert($dados);
            
            if ($resultado) {
                return ["sucesso" => true];
            } else {
                return ["sucesso" => false, 'mensagem' => "erro ao inserir"];
            }
        } catch (\InvalidArgumentException $e) {
            return ["sucesso" => false, 'mensagem' => "Erro de validação: " . $e->getMessage()];
        } catch (\Exception $e) {
            return ["sucesso" => false, 'mensagem' => "Erro no banco: " . $e->getMessage()];
        };
    }
    
    public function pegarloc($dono,$id) {
        $camposLoc = implode(',',$this->campos);
        $cod = $this->contruircampos('loc_',$dono);
        $mostrar = new DBQuery($this->table, $camposLoc,$this->primarykey);
        $where = new Where();
        $where->addCondition('AND', $cod,'=', $id);
        $where = $where->build();
        try{
            $resultado = $mostrar->selectWhere($where);
            
            if ($resultado) {
                return ['sucesso' => true,
                    'dados' =>$resultado->fetchAll(\PDO::FETCH_ASSOC)];
            }else {
                return ['sucesso' => false,
                    'mensagem' => 'Erro ao resgatar informação'];
            }
        } catch (\InvalidArgumentException $e) {
            return ['sucesso' => false,
                'mensagem' => 'Erro de validação: ' . $e->getMessage()];
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => 'Erro no banco: ' . $e->getMessage()];
        }
    }

    public function pegarSalas($loc){
        $camposLoc = implode(',',$this->campos);
        $mostrar = new DBQuery($this->table, $camposLoc,$this->primarykey);
        $where = new Where();
        $where->addCondition('AND', 'sala_loc','=', $loc);
        $where = $where->build();
        try{
            $resultado = $mostrar->selectWhere($where);
            
            if ($resultado) {
                return ['sucesso' => true,
                    'dados' =>$resultado->fetchAll(\PDO::FETCH_ASSOC)];
            }else {
                return ['sucesso' => false,
                    'mensagem' => 'Erro ao resgatar informação'];
            }
        } catch (\InvalidArgumentException $e) {
            return ['sucesso' => false,
                'mensagem' => 'Erro de validação: ' . $e->getMessage()];
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => 'Erro no banco: ' . $e->getMessage()];
        }
    }
    
    public function editar($dados) {
        
        $camposStr = implode(',', $this->campos);
        $ativar =  new DBQuery($this->table, $camposStr, $this->primary);
        try {
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
        };;
    }
}