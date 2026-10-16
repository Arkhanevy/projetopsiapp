<?php

namespace models;

use core\database\DBQuery;
use core\database\Where;

class busca {
    private $table = '';
    private  $campos = '';
    private  $primary = '';
    
    public function __construct($table,$campos,$primary) {
        $this->table = $table;
        $this->campos = $campos;
        $this->primary = $primary;
    }
    public function Buscar($busca,$valor){
        $camposStr = implode(',',$this->campos);
        $where = new Where();
        if ($this->table === 'servico') {
            if ($valor !== null && $valor !== '') {
                $where->addCondition('AND', 'ser_val', '=', $valor);
                $where->addLike('AND', 'ser_nome', $busca);
                $where->addCondition('OR', 'ser_val', '=', $valor);
                $where->addLike('AND', 'ser_tipo', $busca);
            } else {
                $where->addLike('AND', 'ser_nome', $busca);
                $where->addLike('OR', 'ser_tipo', $busca);
            }
        }
        if ($this->table === 'profissional') {
            $where->addLike('AND', 'pro_nome', $busca);
        }
        if ($this->table === 'clinica') {
            $where->addLike('AND', 'clin_nome', $busca);
        }     
        $where = $where->build();
        $mostrar = new DBQuery($this->table, $camposStr,$this->primary);
        try {
            $resultado = $mostrar->selectWhere($where);
            
            if ($resultado) {
                return [
                    'sucesso' => true,
                    'dados' => $resultado->fetchAll(\PDO::FETCH_ASSOC)
                ];
            }else {
                return [
                    'sucesso' => false,
                    'erro' => 'Erro ao resgatar informação'
                ];
            }
        } catch (\InvalidArgumentException $e) {
            return [
                'sucesso' => false,
                'erro' => 'Erro de validação: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            return [
                'sucesso' => false,
                'erro' => 'Erro no banco: ' . $e->getMessage()
            ];
        }
    }
    
    public function MostrarDetalhes($id) {
        $camposStr = implode(',',$this->campos);
        $mostrar = new DBQuery($this->table, $camposStr,$this->primary );
        $where = new Where();
        if ($this->table === 'servico') {
            $where->addCondition('AND', 'ser_id', '=',$id);
        }
        if ($this->table === 'profissional') {
            $where->addCondition('AND', 'pro_id', '=',$id);
        }
        if ($this->table === 'clinica') {
            $where->addCondition('AND', 'clin_id', '=',$id);
        }
        
        $where = $where->build();
        try {
            $resultado = $mostrar->selectWhere($where);
            
            if ($resultado) {
                return [
                    'sucesso' => true,
                    'dados' => $resultado->fetchAll(\PDO::FETCH_ASSOC)
                ];
            }else {
                return [
                    'sucesso' => false,
                    'erro' => 'Erro ao resgatar informação'
                ];
            }
        } catch (\InvalidArgumentException $e) {
            return [
                'sucesso' => false,
                'erro' => 'Erro de validação: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            return [
                'sucesso' => false,
                'erro' => 'Erro no banco: ' . $e->getMessage()
            ];
        }
    }
    
    public function MeusServicos() {
        $camposServ = implode(',',$this->campos);
        try {
            $mostrar = new DBQuery($this->table, $camposServ,$this->primary );
            $where = new Where();
            $where->addCondition('AND', 'ser_pro', '=',$_SESSION['usuario']['idUsuario']);
            $where = $where->build();
            $resultado = $mostrar->selectWhere($where);
            
            if ($resultado) {
                return [
                    'sucesso' => true,
                    'dados' => $resultado->fetchAll(\PDO::FETCH_ASSOC)
                ];
            }else {
                return [
                    'sucesso' => false,
                    'erro' => 'Erro ao resgatar informação'
                ];
            }
        } catch (\InvalidArgumentException $e) {
            return [
                'sucesso' => false,
                'erro' => 'Erro de validação: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            return [
                'sucesso' => false,
                'erro' => 'Erro no banco: ' . $e->getMessage()
            ];
        }
    }
    
}