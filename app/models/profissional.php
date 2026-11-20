<?php 
namespace models;

use core\database\DBQuery;
use core\database\DBConnection;
//use core\utils\CodeGenerator;
//use core\utils\Mail;
use core\database\Where;
use models\usuario;


class profissional extends usuario {
    public function __construct($table,$campo,$primary) {
        parent::__construct($table,$campo,$primary);}

    public function Cadastrarprofissional($nome,$email,$foto,$username,$senha,$bio,$dtNas,$CPF,$CEP,$telefone,$genero,$registro) {
        $dados =[
            0,
            $nome,
            $email,
            $username,
            password_hash($senha,PASSWORD_BCRYPT),
            $bio,
            'cxfoto',
            null,
            $dtNas,
            date('Y-m-d H:i:s'),
            null,
            "desativo",
            $CPF,
            $CEP,
            $telefone,
            $genero,
            $registro,
            0
            
        ];
        if(!empty($foto)){
                $this->setFoto($foto);
            }
        return $this->Cadastrar($dados);
    }
    
    public function pegarHrser() {
        $camposHrser = "
            hrser_id,
            hrser_pro,
            hrser_hrini,
            hrser_hrterm,
            hrser_dia";
            $pegar = new DBQuery('hr_servico', $camposHrser,'hrser_pro' );
            $where = new Where();
            //$where->addCondition('AND', 'hrser_pro', '=',$_SESSION['profissional']['id']);
            $where->addCondition('AND', 'hrser_pro', '=', $_SESSION['usuario']['idUsuario']);
            $where = $where->build();
        try {
            $resultado = $pegar->selectWhere($where);
            
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
    
    public function hrServico($pro,$clin,$inicio,$termino,$dia) {
        $camposStr = "hrser_id, hrser_pro, hrser_clin, hrser_hrini, hrser_hrterm, hrser_dia";
        $dados = [0,$pro,$clin,$inicio,$termino,$dia];
        try {
            $cadastrar = new DBQuery('hr_servico', $camposStr, 'hrser_id');
            $cadastrar->insert($dados);
            return ['sucesso' => true];
        }
        catch (\Exception $e) {
            return [
                'sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        };
    }
    
    public function hrExcecao($pro,$dia,$trabalho,$inicio,$termino,$desc) {
        $camposStr =  " 
            hr_excecao_id,
            hr_excecao_pro,
            hr_excecao_dia,
            hr_excecao_trab,
            hr_excecao_ini,
            hr_excecao_term,
            hr_excecao_desc";
        $dados = [0,$pro,$dia,$trabalho,$inicio,$termino,$desc];
        try {
            $cadastrar = new DBQuery('hr_excecao', $camposStr, 'hr_excecao_id');
            $cadastrar->insert($dados);
            return ['sucesso' => true];
        }
        catch (\Exception $e) {
            return [
                'sucesso' => false,
                'mensagem' => $e->getMessage()
            ];
        };
    }
    
    // ---------- ASSOCIAÇÃO COM CLÍNICA ----------
    // Permissões que o novo profissional recebe quando a clínica ainda não tem
    // nenhum outro profissional para servir de modelo (tipo => 0 negado / 1 permitido)
    const PERMISSOES_PADRAO = [1 => 0, 2 => 0, 3 => 0, 4 => 0];
    
    // Só vale convite que: existe, é tipo "convite de vínculo", é pra ESTE profissional
    private function buscarConvite(\PDO $pdo, $proId, $notifId) {
        $st = $pdo->prepare(
            "SELECT notif_id, notif_clin FROM notificacao
             WHERE notif_id = :n AND notif_dest = :p AND notif_tipo = :t AND notif_clin IS NOT NULL");
        $st->execute([':n' => (int) $notifId, ':p' => (int) $proId, ':t' => notificacao::CONVITE_VINCULO]);
        return $st->fetch(\PDO::FETCH_ASSOC);
    }
    
    public function aceitarVinculo($proId, $notifId) {
        $proId = (int) $proId;
        $pdo = null;
        try {
            $pdo = (new DBConnection())->getConn();
            
            $convite = $this->buscarConvite($pdo, $proId, $notifId);
            if (!$convite) {
                return ['sucesso' => false, 'mensagem' => 'Convite não encontrado ou não é para você.'];
            }
            $clinId = (int) $convite['notif_clin'];
            
            $pdo->beginTransaction();
            
            $st = $pdo->prepare("SELECT 1 FROM profissional_clinica WHERE pc_pro = :pro AND pc_clin = :clin");
            $st->execute([':pro' => $proId, ':clin' => $clinId]);
            if ($st->fetch()) {
                $pdo->rollBack();
                return ['sucesso' => false, 'mensagem' => 'Você já está vinculado a esta clínica.'];
            }
            
            $pdo->prepare("INSERT INTO profissional_clinica (pc_pro, pc_clin) VALUES (:pro, :clin)")
                ->execute([':pro' => $proId, ':clin' => $clinId]);
            $novoPc = (int) $pdo->lastInsertId();
            
            // modelo de permissões = vínculo mais antigo da MESMA clínica (antes era perm_pc = 1 fixo)
            $st = $pdo->prepare("SELECT MIN(pc_id) FROM profissional_clinica WHERE pc_clin = :clin AND pc_id <> :novo");
            $st->execute([':clin' => $clinId, ':novo' => $novoPc]);
            $modeloPc = $st->fetchColumn();
            
            $perms = [];
            if ($modeloPc) {
                $st = $pdo->prepare("SELECT perm_tipo, perm_bin FROM permissoes WHERE perm_pc = :pc");
                $st->execute([':pc' => $modeloPc]);
                $perms = $st->fetchAll(\PDO::FETCH_ASSOC);
            }
            if (empty($perms)) {
                foreach (self::PERMISSOES_PADRAO as $tipo => $bin) {
                    $perms[] = ['perm_tipo' => $tipo, 'perm_bin' => $bin];
                }
            }
            $ins = $pdo->prepare("INSERT INTO permissoes (perm_tipo, perm_bin, perm_pc) VALUES (:tipo, :bin, :pc)");
            foreach ($perms as $p) {
                $ins->execute([':tipo' => $p['perm_tipo'], ':bin' => $p['perm_bin'], ':pc' => $novoPc]);
            }
            
            // convite resolvido: apaga, para não poder ser reaproveitado depois de um desvincular
            $pdo->prepare("DELETE FROM notificacao WHERE notif_id = :n")->execute([':n' => (int) $convite['notif_id']]);
            
            $pdo->commit();
            return ['sucesso' => true, 'mensagem' => 'Vínculo aceito e permissões herdadas com sucesso!', 'pc_id' => $novoPc];
        } catch (\Throwable $e) {
            if ($pdo && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            return ['sucesso' => false, 'mensagem' => 'Erro ao processar o aceite: ' . $e->getMessage()];
        }
    }
    
    public function recusarVinculo($proId, $notifId) {
        try {
            $pdo = (new DBConnection())->getConn();
            $convite = $this->buscarConvite($pdo, $proId, $notifId);
            if (!$convite) {
                return ['sucesso' => false, 'mensagem' => 'Convite não encontrado ou não é para você.'];
            }
            $pdo->prepare("DELETE FROM notificacao WHERE notif_id = :n")->execute([':n' => (int) $convite['notif_id']]);
            return ['sucesso' => true, 'mensagem' => 'Convite recusado.'];
        } catch (\Throwable $e) {
            return ['sucesso' => false, 'mensagem' => $e->getMessage()];
        }
    }
}
?>
