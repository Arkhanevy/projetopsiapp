<?php 
namespace models;
use core\database\DBQuery;
use core\database\Where;
use models\usuario;


class clinica extends usuario {
    public function __construct($table,$campo,$primary) {
        parent::__construct($table,$campo,$primary);}
        
    public function Cadastrarclinica($nome,$email/*,$foto*/,$username,$senha,$bio,$CNPJ,$CEP,$telefone) {
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
            /*$this->setFoto($foto);*/
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
            //$where->addCondition('AND', 'hrser_clin', '=',$_SESSION['clinica']['id']);
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
        //Ver se tá prestando (está vinculado ao clinicacontroller):
        //Vincula um profissional a uma clínica na tabela profissional_clinica
        public function vincularProfissional($clinId, $proId) {
            try {
                //Verificar se o vínculo ativo já existe no banco
                $sqlCheck = "SELECT 1 FROM profissional_clinica WHERE pc_clin = :clin_id AND pc_pro = :pro_id";
                $stmtCheck = $this->db->prepare($sqlCheck);
                $stmtCheck->execute([
                    ':clin_id' => $clinId,
                    ':pro_id'  => $proId
                ]);
                if ($stmtCheck->fetch()) {
                    return ['sucesso' => false, 'mensagem' => 'Este profissional já está vinculado a esta clínica.'];
                }
                //Insere o novo relacionamento na tabela profissional_clinica
                $sqlInsert = "INSERT INTO profesional_clinica (pc_clin, pc_pro) VALUES (:clin_id, :pro_id)";
                $stmtInsert = $this->db->prepare($sqlInsert);
                $executou = $stmtInsert->execute([
                    ':clin_id' => $clinId,
                    ':pro_id'  => $proId
                ]);
                if ($executou) {
                    return ['sucesso' => true, 'mensagem' => 'Profissional vinculado com sucesso!'];
                }
                return ['sucesso' => false, 'mensagem' => 'Não foi possível salvar o vínculo.'];
            } catch (\PDOException $e) {
                return ['sucesso' => false, 'erro' => $e->getMessage()];
            }
        }
        
        //Remove o vínculo de um profissional com a clínica
        public function desvincularProfissional($clinId, $proId) {
            try {
                $sqlDelete = "DELETE FROM profissional_clinica WHERE pc_clin = :clin_id AND pc_pro = :pro_id";
                $stmtDelete = $this->db->prepare($sqlDelete);
                $executou = $stmtDelete->execute([
                    ':clin_id' => $clinId,
                    ':pro_id'  => $proId
                ]);
                if ($executou && $stmtDelete->rowCount() > 0) {
                    return ['sucesso' => true, 'mensagem' => 'Profissional desvinculado com sucesso!'];
                }
                return ['sucesso' => false, 'mensagem' => 'Vínculo não encontrado ou já removido.'];
            } catch (\PDOException $e) {
                return ['sucesso' => false, 'erro' => $e->getMessage()];
            }
        }
}
?>
