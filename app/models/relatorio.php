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
    
    public function __construct($table/*,$campo*/,$primary,$usuario,$id) {
        $this->table = $table;//atendimento
        /*$this->campo = $campo;*/// vai variar dependendo do que o select quer tá comentado pq no momento nenhum metodo usa
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
}
   
    