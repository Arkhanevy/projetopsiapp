<?php
/*
tipo = 1 é agendar a consulta
tipo = 2 é reagendar consultas a consulta
tipo = 3 é Cancelar a consulta
tipo = 4 é enviar documentos
*/


namespace models;

use core\database\DBQuery;
use core\database\Where;  

class permissao {
    private $table = '';
    private $campo = '';
    private $primary = '';
    
    public function __construct($table,$campo,$primary) {
        $this->table = $table;
        $this->campo = $campo;
        $this->primary = $primary;
    }
    private function proclin($id,$clin) {
        $proclin = new DBQuery('profissional_clinica', 'pc_id', 'pc_id');
        
        $where = new Where();
        $where->addCondition('AND', 'pc_pro', '=', $id);
        $where->addCondition('AND', 'pc_clin', '=', $clin);
        $where = $where -> build();
        try {
            $resultado = $proclin->selectWhere($where);
            $pc = $resultado->fetchColumn();
            return $pc === false ? null : $pc;
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        }
    }
    
   public function permissao($id,$clin,$tipo) {
        $pc = $this->proclin($id, $clin);
        
        if (is_array($pc)) {
            return $pc;
        }
        if ($pc === null) {
            return ['sucesso' => false, 'mensagem' => 'Profissional não vinculado à clínica'];
        }

        $permissao = new DBQuery($this->table, $this->campo, $this->campo);
        
        $where = new Where();
        $where->addCondition('AND', 'perm_pc', '=', $pc);
        $where->addCondition('AND', 'perm_tipo', '=', $tipo);
        $where = $where->build();
        
        try {
            $resultado = $permissao->selectWhere($where);
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        }
        
        $bin = $resultado->fetchColumn();
        if (!$bin){
            return ['sucesso' => false,
                'mensagem' => 'permissão negada'
            ];
        }
        else {
            return true;
        }
   }

}