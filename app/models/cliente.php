<?php
namespace models;

//use core\database\DBQuery;
//use core\utils\CodeGenerator;
//use core\utils\Mail;
//use core\database\Where;
use models\usuario;


class cliente extends usuario {
    public function __construct($table,$campo,$primary) {
        parent::__construct($table,$campo,$primary);}
        
        public function Cadastrarcliente($nome,$email,$username,$senha,$bio,$dtNas,$CPF,$telefone,$genero) {
            $dados =[
                0,
                $nome ,
                $email ,
                $username ,
                password_hash($senha ,PASSWORD_BCRYPT),
                $bio  ?? '',
                'cxfoto',//$cxproFoto ,
                0,
                $dtNas  ?? '',
                date('Y-m-d H:i:s'),
                null,
                "desativo",
                $CPF ,
                $telefone ,
                $genero ,
                0
                
            ];
            return $this->Cadastrar($dados);
        }
        
}


/*$acao = $_POST['acao'] ?? '';

$camposcliente =[
'cli_id',
'cli_nome',
'cli_email',
'cli_user',
'cli_senha',
'cli_bio',
'cli_foto',
'cli_codVali',
'cli_dtNasc',
'cli_dtCad',
'cli_dtDell',
'cli_stat',
'cli_CPF',
'cli_tel',
'cli_gen',
'cli_doc',
'cli_notif'];


switch ($acao){
case "cadastrar":
$generator = new CodeGenerator();
$cod = $generator->run(6);
//$assunto = 'codigo de validação';
//$body = "!DOCTYPE html>
//        <html lang='pt-BR'>
//        <head>
//            <meta charset='UTF-8'>
//            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
//        </head>
//        <body>
//        </body>
//        </html>";

$dados =[
0,
$_POST['nome'],
$_POST['email'],
$_POST['username'],
password_hash($_POST['senha'],PASSWORD_BCRYPT),
$_POST['bio'] ?? '',
'cxfoto',//$_POST['cxproFoto'],
$cod,
$_POST['dtNas'] ?? '',
date('Y-m-d H:i:s'),
null,
"desativo",
$_POST['CPF'],
$_POST['telefone'],
$_POST['genero'],
0,
0
];
$camposcli = implode(',',$camposcli);

try {
$cadastrar = new DBQuery("cliente", $camposcli, ['cli_id']);
$resultado = $cadastrar->insert($dados);

if ($resultado) {
echo "sucesso";
//$email = new Mail($dados[2], $assunto, $body);
//$email ->send();
} else {
echo "erro ao inserir";
}
} catch (InvalidArgumentException $e) {
echo "Erro de validação: " . $e->getMessage();
} catch (\Exception $e) {
echo "Erro no banco: " . $e->getMessage();
};
exit;

case "ReGerarCodigo":
$generator = new CodeGenerator();
$cod = $generator->run(6);
$dados = [$_POST['email'],$cod];
$camposcli = implode(',',[$camposcli[2], $camposcli[7]]);
try {
$codigo = new DBQuery("cliente", $camposcli, ['cli_email']);
$resultado = $codigo->update($dados);
if ($resultado) {
echo "sucesso";
} else {
echo "erro ao inserir";
}
} catch (InvalidArgumentException $e){
echo "Erro de validação: " . $e->getMessage();
}catch (\Exception $e) {
echo "Erro no banco: " . $e->getMessage();
};
exit;
case "ativar": //ALERTA DE CAMBIARRA

$email = $_POST['email'];
$cod = $_POST['codigo'];

$select = $camposcli[7];
$db = new DBQuery("cliente", $select, '');
$where = " where cli_email = '" . $email . "'";
$resultado = $db->selectWhere($where);
$registro = $resultado->fetch(PDO::FETCH_ASSOC);

if (!$registro) {
echo "e-mail não encontrado";
exit;
}

$codVali = $registro['cli_codVali'];

if ($cod !== $codVali) {
echo "código inválido";
exit;
}

$camposcli = implode(',',[$camposcli[11], $camposcli[2]]);
$dados = [
"ativo",
$email
];

try {
$ativar = new DBQuery("cliente", $camposcli,'cli_email');
$Update = $ativar->update($dados);
if ($Update) {
echo "sucesso";
} else {
echo "erro ao atualizar";
}
} catch (InvalidArgumentException $e) {
echo "Erro de validação: " . $e->getMessage();
} catch (\Exception $e) {
echo "Erro no banco: " . $e->getMessage();
}
exit;


//EVELYN LOGIN
case "login":

$email = $_POST['email'] ?? '';
$senha = $_POST['senhaLog'] ?? '';

//ANTES
//$select = "clin_id,clin_nome,clin_email,clin_senha,clin_stat";

//DEPOIS
$select = "cli_id,cli_nome,cli_email,cli_senha,cli_stat";

try {
$db = new DBQuery("cliente", $select, "");

$where = " WHERE cli_email = '" . $email . "'";

$resultado = $db->selectWhere($where);

//ANTES
//$clinica = $resultado->fetch(PDO::FETCH_ASSOC);

//DEPOIS
$cliente = $resultado->fetch(PDO::FETCH_ASSOC);

//ANTES
//if (!$clinica) {

//DEPOI
$cliente = $resultado->fetch(PDO::FETCH_ASSOC);

;

if (!$cliente) {
echo "E-mail não encontrado";
exit;
}

//ANTES
//if ($clinica['clin_stat'] != 'ativo') {

//DEPOIS

if ($cliente['cli_stat'] != 'ativo') {
echo "Conta não ativada";
exit;
}


//ANTES
//if (!password_verify($senha, $clinica['clin_senha'])) {

//DEPOS
if (!password_verify($senha, $cliente['cli_senha'])) {
echo "Senha inválida";
exit;
}


//ANTES
//$_SESSION['clinica'] = [
//    'id' => $clinica['clin_id'],
//    'nome' => $clinica['clin_nome'],
//    'email' => $clinica['clin_email']
//];

//DEPOIS
$_SESSION['cliente'] = [
'id' => $cliente['cli_id'],
'nome' => $cliente['cli_nome'],
'email' => $cliente['cli_email']
];

//FALAR COM A EVELYN
$_SESSION['idUsuario'] = $cliente['cli_id'];
$_SESSION['tipoUsuario'] = 'cliente';


echo "sucesso";

} catch (\Exception $e) {

echo $e->getMessage();

}

exit;

case "verificarLogin": //EXPLICAR M

header('Content-Type: application/json; charset=utf-8');

if (
isset($_SESSION['idUsuario'], $_SESSION['tipoUsuario']) &&
$_SESSION['tipoUsuario'] === 'cliente'
) {
echo json_encode([
'logado' => true
]);
} else {
echo json_encode([
'logado' => false
]);
}

exit;
case "MostrarConsulta":
$campoSelect = "agnd_id,agnd_pro,profissional.pro_nome,agnd_cli,cliente.cli_nome,agnd_clin,clinica.clin_nome,agnd_ser,servico.ser_nome,agnd_dt,agnd_hrIni,agnd_hrTerm";
$campospro = "pro_id,pro_nome";
$campocli = "cli_id,cli_nome";
$camposClin = "clin_id,clin_nome";
$campoServ = "ser_id,ser_nome";


$agenda = new DBQuery('agenda', $campoSelect, 'agnd_id');
$profissional = new DBQuery('profissional', $campospro, 'pro_id');
$cliente = new DBQuery('cliente', $campocli, 'cli_id');
$clinica = new DBQuery('clinica', $camposClin, 'clin_id');
$servico = new DBQuery('servico', $campoServ, 'ser_id');


// Adicionar JOINS (ambos na tabela principal)
$agenda->addJoin('INNER', 'agnd_pro', $profissional, 'pro_id');
$agenda->addJoin('INNER', 'agnd_cli', $cliente, 'cli_id');
$agenda->addJoin('INNER', 'agnd_clin', $clinica, 'clin_id');
$agenda->addJoin('INNER', 'agnd_ser', $servico, 'ser_id');



// Executar
$where = new Where();
$where->addCondition('AND', 'agnd_cli', '=', $_SESSION['cliente']['id']);
try {
$resultado = $agenda->selectFiltered($where);
if ($resultado) {
echo json_encode( [
'sucesso' => true,
'dados' => $resultado->fetchAll(PDO::FETCH_ASSOC)
]);
} else {
echo "erro ao inserir";
}
} catch (InvalidArgumentException $e) {
echo "Erro de validação: " . $e->getMessage();
} catch (\Exception $e) {
echo "Erro no banco: " . $e->getMessage();
};

exit;
}*/
?>