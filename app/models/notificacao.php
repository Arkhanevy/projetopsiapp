<?php
/*
'agendar' = notificação de consulta para aceita
'reagendar' = notificação reagendamento de consulta para aceita
'aceita' = notificação de consulta  aceita
'rejeitar' = notificação de consulta  rejeitada
'cancelar' = notificação de cancelamento de consulta



*/
namespace models;

use core\database\DBQuery;
use core\database\Where;  

class notificacao {
    private $table = '';
    private $campos = '';
    private $primary = '';
    private $id = '';
    private $usuario = '';
    
    public function __construct($table,$campo,$primary,$id,$usuario) {
        $this->table = $table;
        $this->campos = $campo;
        $this->primary = $primary;
        $this->id = (int)$id;
        $this->usuario = $usuario;
    }
    private function contruircampos($prefixo) {
        $mapa = [
            'profissional' => 'pro',
            'clinica'      => 'clin',
            'cliente'      => 'cli',
        ];
        return [$prefixo.$mapa[$this->usuario]];
        
    }
    
    public function padao($tipo,$msg) {
        $campospd = ['pdnotif_id'];
        $campospd[] = $this->contruircampos($this->usuario, 'pdNotif_');
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
    
   public function enviar($tipo,$dest,$clin) {
       $cod = $this->contruircampos($this->usuario, 'pdNotif_');
       $cod = implode(',',$cod);
      
       //padão da clinica. da forma que o construir campos funciona não pega o padrão da clinica
       if (!empty($clin)) {
           $cod = 'pdNotif_clin';
       }
       
       $where = new Where();
       $where->addCondition('AND', 'pdNotif_tipo', '=', $tipo);
       $where->addCondition('AND', $cod, '=', $clin ?? $this->id);
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
       $hoje = $hoje->format('Y-m-d H:i:s');
       $dados = [
       0,
       $resultado[0]['pdNotif_id'],
       $clin,
       $dest,
       $tipo,
       $resultado[0]['pdNotif_msg'],
       $hoje,
       0,
       $this->id
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
   
   public function listar() {
       $cod = $this->contruircampos('notif_');
       $cod = implode(',',$cod);
       $where = "where " . $cod . '=' . $this->id . ' ORDER BY notif_data DESC';//não tem função para por order by mas acho que tá seguro pq $cod é gerado por mim e $id é int
       $padao = new DBQuery('notificacao','*','');
       
       try {
           $resultado = $padao->selectWhere($where);
           $dados = $resultado->fetchall(\PDO::FETCH_ASSOC);
           return [
               'sucesso' => true,
               'dados' => $dados
           ];
       }
       catch (\Exception $e) {
           return [
               'sucesso' => false,
               'mensagem' => $e->getMessage()
           ];
       };
   }
   public function aceitar($cli) {
       $agenda = new DBQuery('agenda', 'agnd_id', 'agnd_id');
       
       
       $where = new Where();
       $where->addCondition('AND', 'agnd_cli', '=', $cli);
       $where->addCondition('AND', 'agnd_pro', '=', $this->id);
       $where->addCondition('AND', 'agnd_stat', '=', 'esperando');
       $where = $where->build();
       
       try {
           $resultado = $agenda->selectWhere($where);
          
       }
       catch (\Exception $e) {
           return [
               'sucesso' => false,
               'mensagem' => $e->getMessage()
           ];
       };
       $dado = $resultado->fetchall(\PDO::FETCH_ASSOC);
       $valores = [
           $dado[0]['agnd_id'],
           'aceita'
       ];
       $aceitar = new DBQuery('agenda', 'agnd_id,agnd_stat', 'agnd_id');
       try {
           $aceitar->update($valores);
           return[
               'sucesso' => true
           ];
       } catch (\Exception $e) {
               return[
                   'sucesso' => false,
                   'mensagem' => $e->getMessage()
                   ];
       }
   }
   
   public function rejeitar($cli) {
       $agenda = new DBQuery('agenda', 'agnd_id', 'agnd_id');
       
       
       $where = new Where();
       $where->addCondition('AND', 'agnd_cli', '=', $cli);
       $where->addCondition('AND', 'agnd_pro', '=', $this->id);
       $where->addCondition('AND', 'agnd_stat', '=', 'esperando');
       $where = $where->build();
       
       try {
           $resultado = $agenda->selectWhere($where);
           
       }
       catch (\Exception $e) {
           return [
               'sucesso' => false,
               'mensagem' => $e->getMessage()
           ];
       };
       $dado = $resultado->fetchall(\PDO::FETCH_ASSOC);
       $valores = [
           $dado[0]['agnd_id']
       ];
       $aceitar = new DBQuery('agenda', 'agnd_id', 'agnd_id');
       try {
           $aceitar->delete($valores);
           return[
               'sucesso' => true
           ];
       } catch (\Exception $e) {
           return[
               'sucesso' => false,
               'mensagem' => $e->getMessage()
           ];
       }
   }
}