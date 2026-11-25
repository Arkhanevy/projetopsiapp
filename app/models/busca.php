<?php

namespace models;

use core\database\DBQuery;
use core\database\Where;

class busca {
    private $table = '';
    private  $campos = [];
    private  $primary = '';
    
    public function __construct($table,$campos,$primary) {
        $this->table = $table;
        $this->campos = $campos;
        $this->primary = $primary;
    }
    public function Buscar($busca,$valor,$pro){
        $camposStr = implode(',',$this->campos);
        $where = new Where();
        if ($this->table != 'servico' && $this->table != 'profissional' && $this->table != 'clinica') {
            return ['sucesso' => false, 'mensagem' => 'tipo de busca invalida'];
        }
        if ($this->table === 'servico') {
            
            if ($valor !== null && $valor !== '') {
                
                $grupo = new Where();
                
                $grupo->addCondition('AND', 'ser_val', '=', $valor);
                $grupo->addLike('AND', 'ser_nome', $busca);
                
                $grupo->addCondition('OR', 'ser_val', '=', $valor);
                $grupo->addLike('AND', 'ser_tipo', $busca);
                
                $where->addGroup('AND', $grupo);
                $where->addCondition('AND', 'ser_stat', '=', 'ativo');
                
            } else {
                
                $grupo = new Where();
                
                $grupo->addLike('AND', 'ser_nome', $busca);
                $grupo->addLike('OR', 'ser_tipo', $busca);
                
                $where->addGroup('AND', $grupo);
                $where->addCondition('AND', 'ser_stat', '=', 'ativo');
            }
            
            $where = $where->buildGroup();
            
        } else {
            if ($this->table === 'profissional') {
                if (!empty($pro)) {
                    $where->addCondition('AND', 'ser_pro', '=', $pro);
                }else {$where->addLike('AND', 'pro_nome', $busca);}
                $where = $where->build();
            }
            if ($this->table === 'clinica') {
                $where->addLike('AND', 'clin_nome', $busca);
                $where = $where->build();
            }  
            
        }
           
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
    
    // Retorna o loc_tipo (ex.: 'domi') da localização do serviço, ou null se não encontrar.
    public function PegarTipoLocal($loc) {
        $consulta = new DBQuery('localizacao', 'loc_id,loc_tipo', 'loc_id');
        $where = new Where();
        $where->addCondition('AND', 'loc_id', '=', $loc);
        $where = $where->build();
        try {
            $resultado = $consulta->selectWhere($where);
            $linhas = $resultado ? $resultado->fetchAll(\PDO::FETCH_ASSOC) : [];
            return $linhas[0]['loc_tipo'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // Tipos de localização que NÃO são enviados a quem visita o perfil de um profissional
    // (ex.: endereço da residência). Esvazie o array para publicá-los.
    private $tiposLocalPrivados = ['casa'];

    private function listarPublico($tabela, $campos, $primary, $condicoes) {
        try {
            $consulta = new DBQuery($tabela, $campos, $primary);
            $where = new Where();
            foreach ($condicoes as $coluna => $valor) {
                $where->addCondition('AND', $coluna, '=', $valor);
            }
            $resultado = $consulta->selectWhere($where->build());
            return $resultado ? $resultado->fetchAll(\PDO::FETCH_ASSOC) : [];
        } catch (\Exception $e) {
            return [];
        }
    }

    // Serviços ativos, horários e localizações de um profissional/clínica, para quem visita o perfil.
    // Não usa a sessão: o id vem do perfil visitado.
    public function DadosPublicos($tipo, $id) {
        $profissional = ($tipo === 'profissional');
        $id = (int) $id;

        $servicos = $this->listarPublico(
            'servico',
            'ser_id,ser_pro,ser_clin,ser_nome,ser_tipo,ser_desc,ser_dur,ser_inter,ser_val,ser_stat,ser_dia,ser_loc',
            'ser_id',
            [($profissional ? 'ser_pro' : 'ser_clin') => $id, 'ser_stat' => 'ativo']
        );
        $horarios = $this->listarPublico(
            'hr_servico',
            'hrser_id,hrser_pro,hrser_hrini,hrser_hrterm,hrser_dia',
            'hrser_id',
            [($profissional ? 'hrser_pro' : 'hrser_clin') => $id]
        );
        $localizacoes = $this->listarPublico(
            'localizacao',
            'loc_id,loc_nome,loc_tipo,loc_cep,loc_num,loc_compl',
            'loc_id',
            [($profissional ? 'loc_pro' : 'loc_clin') => $id]
        );
        if ($profissional) {
            $privados = $this->tiposLocalPrivados;
            $localizacoes = array_values(array_filter($localizacoes, function ($local) use ($privados) {
                return !in_array(strtolower((string) ($local['loc_tipo'] ?? '')), $privados, true);
            }));
        }

        return [
            'servicos' => $servicos,
            'horarios' => $horarios,
            'localizacoes' => $localizacoes
        ];
    }

    public function MostrarDetalhes($id) {
        $camposStr = implode(',',$this->campos);
        $mostrar = new DBQuery($this->table, $camposStr,$this->primary );
        $where = new Where();
        if ($this->table === 'servico') {
            $where->addCondition('AND', 'ser_id', '=',$id);
            $where->addCondition('AND', 'ser_stat', '=','ativo');
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
    
    public function MeusServicos($usuario,$id) {
        $camposServ = implode(',',$this->campos);
        try {
            $mostrar = new DBQuery($this->table, $camposServ,$this->primary );
            $where = new Where();
            if ($usuario === 'profissional') {
                $cod = 'ser_pro';
            }
            else if ($usuario === 'clinica') {
                $cod = 'ser_clin';
            }
            else {return ['sucesso' => false,'mensagem' => 'cliente não tem serviço'];}
            $where->addCondition('AND', $cod, '=',$id);
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
    
    private function camposGerenciar() {
        $prefixo = 'pro_';
        $tabela = 'profissional';

        
        return implode(', ', array_map(function ($campo) use ($prefixo,$tabela) {
            
            if (strpos($campo, '.') !== false) {
                return $campo;
            }
            if (strpos($campo, $prefixo) === 0) {
                    return $tabela . '.' . $campo;
                }
            
            
            return $campo;
        }, $this->campos));
    }
    
    
    public function gerenciarPro($clin) {
        $camposStr = $this->camposGerenciar();
        $profissional = new DBQuery('profissional','pro_id,','pro_id');
        $pc= new DBQuery('profissional_clinica', $camposStr, 'pc_id');
        
        $pc->addJoin('INNER', 'pc_pro', $profissional, 'pro_id');
        
        $where = new Where();
        
        $where->addCondition('AND', 'pc_clin', '=',$clin);


        try {
            $resultado = $pc->selectFiltered($where);
            
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
    
    public function permiçãoPro($pc) {
        $camposServ = implode(',',$this->campos);
        $mostrar = new DBQuery($this->table, $camposServ,$this->primary );
        $where = new Where();
        $where->addCondition('AND', 'perm_pc', '=',$pc);
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
    
    
}