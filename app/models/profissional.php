<?php 
namespace models;

use core\database\DBQuery;
//use core\utils\CodeGenerator;
//use core\utils\Mail;
use core\database\Where;
use models\usuario;


class profissional extends usuario {
    public function __construct($table,$campo,$primary) {
        parent::__construct($table,$campo,$primary);}

    public function Cadastrarprofissional($nome,$email,$username,$senha,$bio,$dtNas,$CPF,$CEP,$telefone,$genero,$registro) {
        $dados =[
            0,
            $nome,
            $email,
            $username,
            password_hash($senha,PASSWORD_BCRYPT),
            $senha,
            $bio,
            'cxfoto',
            $dtNas,
            date('Y-m-d H:i:s'),
            null,
            "desativo",
            $CPF,
            $CEP,
            $telefone,
            $genero,
            $registro,
            0,
            0
        ];
        return $this->Cadastrar($dados);
    }
    
    public function pegarHrser() {
        $camposHrser = "
            hrser_id,
            hrser_pro,
            hrser_hora_inic,
            hrser_hora_term,
            hrser_dia";
            $pegar = new DBQuery('hr_servico', $camposHrser,'hrser_pro' );
            $where = new Where();
            $where->addCondition('AND', 'hrser_pro', '=',$_SESSION['profissional']['id']);
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
        $camposStr =  "
        'hrser_id',
        'hrser_pro',
        'hrser_clin',
        'hrser_hora_inic',
        'hrser_hora_term',
        'hrser_dia' ";
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
            'hr_excecao_id',
            'hr_excecao_pro',
            'hr_excecao_dia',
            'hr_excecao_trab',
            'hr_excecao_ini',
            'hr_excecao_term',
            'hr_excecao_desc'";
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
}
?>