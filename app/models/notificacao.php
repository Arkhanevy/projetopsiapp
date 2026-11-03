<?php


namespace models;

use core\database\DBQuery;
use core\database\Where;  

class notificacao {
    private $table = '';
    private $campos = '';
    private $primary = '';
    private $id = '';
    
    public function __construct($table,$campo,$primary,$id) {
        $this->table = $table;
        $this->campo = $campo;
        $this->primary = $primary;
        $this->id = $id;
    }
    private function contruircampos($usuario,$prefixo) {
        $mapa = [
            'profissional' => 'pro',
            'clinica'      => 'clin',
            'cliente'      => 'cli',
        ];
        return [$prefixo.$mapa[$usuario]];
        
    }
    
    private function padao($tipo,$msg,$usuario) {
        $campospd = ['pdnotif_id'];
        $campospd[] = $this->contruircampos($usuario, 'pdNotif_');
        $campospd[] = ['pdNotif_tipo','pdNotif_msg'];
        $camposStr = implode(',', $campospd);
        $dados = [
            0,
            $this->id,
            $tipo,
            $msg
        ];
        $cadastrar = new DBQuery('padao_notif',$camposStr,$campospd[0] );
        
        try {
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
    
   public function enviar($tipo,$usuario,$dest) {
       $cod = $this->contruircampos($usuario, 'pdNotif_');
       $cod = implode(',',$cod);
       $where = new Where();
       $where->addCondition('AND', 'pdNotif_tipo', '=', $tipo);
       $where->addCondition('AND', $cod, '=', $this->id);
       $where = $where->build();
       $padao = new DBQuery('padrao_notif','pdNotif_id,pdNotif_msg','pdNotif_id');
       
       try {
           $resultado = $padao->selectWhere($where);
       }
       catch (\Exception $e) {
           return [
               'sucesso' => false,
               'mensagem' => $e->getMessage()
           ];
       }
       $resultado = $resultado->fetchAll(\PDO::FETCH_ASSOC);
       $hoje = new \DateTime();
       $hoje->format('Y-m-d H:i:s');
       $dados = [
       0,
       $resultado[0]['pdNotif_id'],
       $this->id,
       $dest,
       $tipo,
       $resultado[0]['pdNotif_msg'],
       $hoje,
       0
       ];
       $camposStr = implode(',', $this->campos);
       $enviar = new DBQuery($this->table, $camposStr, $this->primary);
       try {
           $enviar->insert($dados);
           return ['sucesso' => true];
       }
       catch (\Exception $e) {
           return [
               'sucesso' => false,
               'mensagem' => $e->getMessage()
           ];
       }
   }
}