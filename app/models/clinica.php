<?php 
namespace models;
use core\database\DBQuery;
use core\database\DBConnection;
use core\database\Where;
use models\usuario;


class clinica extends usuario {
    public function __construct($table,$campo,$primary) {
        parent::__construct($table,$campo,$primary);}
        
    public function Cadastrarclinica($nome,$email,$foto,$username,$senha,$bio,$CNPJ,$CEP,$telefone) {
            $dados =[
                0,
                $nome,
                $email,
                $username,
                password_hash($senha,PASSWORD_BCRYPT),
                $bio,
                'cxfoto',//$cxproFoto,
                0,
                date('Y-m-d H:i:s'),
                null, #PAULO
                "desativo",
                $CNPJ,
                $CEP,
                $telefone
               
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
            $pegar = new DBQuery('hr_servico', $camposHrser,'hrser_clin' );
            $where = new Where();
            $where->addCondition('AND', 'hrser_clin', '=', $_SESSION['usuario']['idUsuario']);
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
        // Passo 1 da associação: a clínica CONVIDA o profissional (só cria a notificação).
        // O vínculo em profissional_clinica só nasce quando o profissional aceita
        // (profissional::aceitarVinculo).
        public function convidarProfissional($clinId, $proId) {
            $clinId = (int) $clinId;
            $proId  = (int) $proId;
            if ($clinId <= 0 || $proId <= 0) {
                return ['sucesso' => false, 'mensagem' => 'IDs inválidos.'];
            }
            try {
                $pdo = (new DBConnection())->getConn();
                
                $st = $pdo->prepare("SELECT pro_stat FROM profissional WHERE pro_id = :pro");
                $st->execute([':pro' => $proId]);
                $pro = $st->fetch(\PDO::FETCH_ASSOC);
                if (!$pro) {
                    return ['sucesso' => false, 'mensagem' => 'Profissional não encontrado.'];
                }
                if ($pro['pro_stat'] !== 'ativo') {
                    return ['sucesso' => false, 'mensagem' => 'Este profissional ainda não ativou a conta.'];
                }
                
                $st = $pdo->prepare("SELECT 1 FROM profissional_clinica WHERE pc_clin = :clin AND pc_pro = :pro");
                $st->execute([':clin' => $clinId, ':pro' => $proId]);
                if ($st->fetch()) {
                    return ['sucesso' => false, 'mensagem' => 'Este profissional já está vinculado a esta clínica.'];
                }
                
                $st = $pdo->prepare("SELECT 1 FROM notificacao WHERE notif_clin = :clin AND notif_dest = :pro AND notif_tipo = :tipo AND notif_stat = 0");
                $st->execute([':clin' => $clinId, ':pro' => $proId, ':tipo' => notificacao::CONVITE_VINCULO]);
                if ($st->fetch()) {
                    return ['sucesso' => false, 'mensagem' => 'Já existe um convite pendente para este profissional.'];
                }
            } catch (\Exception $e) {
                return ['sucesso' => false, 'mensagem' => $e->getMessage()];
            }
            
            // 8 campos: quando a clínica envia, ela já vai em notif_clin (não há 9º campo de remetente)
            $camposnot = ['notif_id','notif_pd','notif_clin','notif_dest','notif_tipo','notif_msg','notif_data','notif_stat'];
            $notificacao = new notificacao('notificacao', $camposnot, $camposnot[0], $clinId, 'clinica');
            return $notificacao->enviar(notificacao::CONVITE_VINCULO, $proId, $clinId);
        }
        
        // Remove o vínculo (e as permissões dele) de um profissional com a clínica
        public function desvincularProfissional($clinId, $proId) {
            $clinId = (int) $clinId;
            $proId  = (int) $proId;
            $pdo = null;
            try {
                $pdo = (new DBConnection())->getConn();
                $st = $pdo->prepare("SELECT pc_id FROM profissional_clinica WHERE pc_clin = :clin AND pc_pro = :pro");
                $st->execute([':clin' => $clinId, ':pro' => $proId]);
                $pc = $st->fetchColumn();
                if ($pc === false) {
                    return ['sucesso' => false, 'mensagem' => 'Vínculo não encontrado ou já removido.'];
                }
                $pdo->beginTransaction();
                $pdo->prepare("DELETE FROM permissoes WHERE perm_pc = :pc")->execute([':pc' => $pc]);
                $pdo->prepare("DELETE FROM profissional_clinica WHERE pc_id = :pc")->execute([':pc' => $pc]);
                $pdo->commit();
                return ['sucesso' => true, 'mensagem' => 'Profissional desvinculado com sucesso!'];
            } catch (\Throwable $e) {
                if ($pdo && $pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                return ['sucesso' => false, 'mensagem' => $e->getMessage()];
            }
        }
}
?>
