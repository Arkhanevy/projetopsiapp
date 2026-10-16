<?php 
namespace models;
use core\database\DBQuery;
use core\database\Where;
use models\usuario;


class clinica extends usuario {
    public function __construct($table,$campo,$primary) {
        parent::__construct($table,$campo,$primary);}
        
    public function Cadastrarclinica($nome,$email,$username,$senha,$bio,$CNPJ,$CEP,$telefone) {
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
                $telefone,
                0
            ];
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
}
?>