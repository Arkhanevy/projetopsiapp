<?php

namespace models;

use core\database\DBQuery;
use core\database\Where;

class relatorio {
    private $table = '';
    private $campo = '';
    private $primary = '';
    private $usuario = '';
    private $id = 0;
    
    public function __construct($table,$campo,$primary,$usuario,$id) {
        $this->table = $table;//atendimento
        $this->campo = $campo;// vai variar dependendo do que o select quer tá comentado pq no momento nenhum metodo usa
        $this->primary = $primary;// atd_id
        $this->usuario = $usuario;// profissional ou clinica
        $this->id = $id;
        if ($this->id <= 0) {
            throw new \InvalidArgumentException('ID inválido');
        }
    }
    
    private function contruirCampos($prefixo) {
        $mapa = [
            'profissional' => 'pro',
            'clinica'      => 'clin'
        ];
        if (!isset($mapa[$this->usuario])) {
            throw new \InvalidArgumentException('Usuário inválido');
        }
        return $prefixo.$mapa[$this->usuario];
        
    }
    
    private function qtdatedimento ($status) {
        $cod = $this->contruirCampos('atd_');
        $atendido = new DBQuery($this->table, 'COUNT(*) AS total', $this->primary);
        $where = new Where();
        $where->addCondition('AND', $cod, '=', $this->id);
        $where->addCondition('AND', 'atd_stat', '=', $status);
        $where = $where -> build();
        try {
            $resultado = $atendido->selectWhere($where);
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        };
        $resultado = $resultado->fetch(\PDO::FETCH_ASSOC);
        return (int) $resultado['total'];
    }
    
    public function consultadas() {
        $atendidos = $this->qtdatedimento('atendido');
        if (!is_int($atendidos)) {
            return $atendidos;
        }
        $desmarcado = $this->qtdatedimento('desmarcado');
        if (!is_int($desmarcado)) {
            return $desmarcado;
        }
        $ncompareceu = $this->qtdatedimento('não compareceu');
        if (!is_int($ncompareceu)) {
            return $ncompareceu;
        }
        
        return [
            'sucesso' => true,
            'dados1' => $atendidos,
            'dados2' => $desmarcado,
            'dados3' => $ncompareceu
        ];       
    }
    
    public function ganhos($dia,$periodo) {
        try {
            $data = new \DateTimeImmutable($dia);
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        };
        
        switch ($periodo) {
            case 'diario':
                $inicio  = $data;
                $proxima = $data->modify('+1 day');
                break;
            case 'semanal':
                $inicio  = $data->modify('-' . $data->format('w') . ' days');
                $proxima = $inicio->modify('+7 days');
                break;
            case 'mensal':
                $inicio  = $data;
                $proxima = $inicio->modify('+1 month');
                break;
            case 'anual':
                $inicio  = $data;
                $proxima = $inicio->modify('+1 year');
                break;
            default:
                throw new \InvalidArgumentException('Período inválido');
        }
        $cod = $this->contruirCampos('atd_');
        $relatorio = new DBQuery($this->table, 'SUM(servico.ser_val) AS total', $this->primary);
        $sevico = new DBQuery('servico', 'ser_id,ser_val', 'ser_id');
        $agenda = new DBQuery('agenda', 'agnd_id,agnd_dt', 'agnd_id');
        
        $relatorio->addJoin('INNER', 'atd_ser', $sevico, 'ser_id');
        $relatorio->addJoin('INNER', 'atd_agnd', $agenda, 'agnd_id');
      
        $where = new Where();
        $where->addCondition('AND', $cod, '=', $this->id);
        $where->addCondition('AND', 'atd_stat', '=', 'atendido');
        $where->addCondition('AND', 'agnd_dt', '>=', $inicio->format('Y-m-d'));
        $where->addCondition('AND', 'agnd_dt', '<',  $proxima->format('Y-m-d'));

        try {
            $resultado = $relatorio->selectFiltered($where);
        } catch (\Exception $e) {
            return ['sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        };
        
        $resultado = $resultado->fetch(\PDO::FETCH_ASSOC);
        return [
            'sucesso' => true,
            'dados' => (float) ($resultado['total'] ?? 0)
        ];
    }
    
    public function historico() {
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
        $agenda->addJoin('LEFT', 'agnd_cli', $cliente, 'cli_id');
        $agenda->addJoin('LEFT', 'agnd_clin', $clinica, 'clin_id');
        $agenda->addJoin('INNER', 'agnd_ser', $servico, 'ser_id');
        
        $where = new Where();
        $where->addCondition('AND', $this->campo, '=', $this->id);
        $where->addCondition('AND', 'agnd_stat', '=', 'aceita');
        $where->addCondition('AND', 'agnd_dt', '<=', $atual);
        
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
    
}
   
    