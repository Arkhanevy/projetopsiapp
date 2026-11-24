<?php
namespace models;

use models\usuario;


class cliente extends usuario {
    public function __construct($table,$campo,$primary) {
        parent::__construct($table,$campo,$primary);}
        
        public function Cadastrarcliente($nome,$email,$foto,$username,$senha,$dtNas,$CPF,$telefone,$genero) {
            $dados =[
                0,
                $nome,
                $email ,
                $username ,
                password_hash($senha ,PASSWORD_BCRYPT),
                'cxfoto',//$cxproFoto ,
                0,
                $dtNas,
                date('Y-m-d H:i:s'),
                null,
                "desativo",
                $CPF ,
                $telefone ,
                $genero ,
                0
                
            ];
            if(!empty($foto)){
                $this->setFoto($foto);}
            return $this->Cadastrar($dados);
        }
        
}
?>
