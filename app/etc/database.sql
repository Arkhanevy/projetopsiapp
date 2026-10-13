drop database dbelmo;

create database dbelmo character set utf8mb4 collate utf8mb4_general_ci;
use dbelmo;

create table clinica( -- tabela com os dados do perifil da clinica
	clin_id int auto_increment primary key, -- id da clinica
	clin_nome varchar(90), -- nome da clinica
	clin_email varchar(90) unique not null, -- email da clinica
	clin_user varchar(20) unique not null, -- usuario da clinica
	clin_senha varchar(255), -- senha da clinica
	clin_bio text,  -- biografia da clinica
	clin_foto varchar(100), -- foto da clinica  -- vai guardar o nome do do arquivo ao inves do arquivo em si
	clin_codVali varchar(6) null,-- codigo de validação da clinica
	clin_dtCad datetime default current_timestamp, -- data de cadastro da clinica
	clin_dtDell datetime null,-- data de delete da clinica-- usado para soft delete 
	clin_stat varchar(8),-- status da clinica -- se o perfil está ativo ou desativado
	clin_cnpj varchar(14) unique, -- cnpj da clinica
	clin_cep varchar(8), -- cep da clinica
	clin_tel varchar(11), -- telefone da clinica
	clin_notif int null -- notifição da clinica -- vai guardar o id da notificação padrão
);


create table profissional ( -- tabela do perfil do profissional
    pro_id int primary key auto_increment, -- usuario do profissional
    pro_nome varchar(90),-- nome do profissional
    pro_email varchar(90) unique not null,-- email do profissional
    pro_user varchar(20) unique not null,-- usuario do profissional
    pro_senha varchar(255),-- senha do profissional
    pro_bio text,-- biografia do profissional
    pro_foto varchar(100),-- foto do profissional
    pro_codVali varchar(6),-- codigo de validação do profissional
    pro_dtNasc date,-- data de nascimento do profissional
    pro_dtCad datetime default current_timestamp,-- data de cadastro do profissional
    pro_dtDell datetime null,-- data de delete do profissional
    pro_stat varchar(8),-- status do profissional
    pro_CPF varchar(11) unique, -- cpf do profissional
    pro_CEP varchar(8),-- cep do profissional
    pro_tel varchar(11),-- telefone do profissional
    pro_gen varchar(1), -- genero do profissional
    pro_regi varchar(20),-- registro do profissional -- ainda não vi mas deve ter algum documento pra podologa poder atuar dps tem que ver tbm como verifica -- seriamente eu tenho que ver isso dês de o começo do ano
    pro_doc varchar(90), -- documento do profissional -- por enquanto o campo tá ai mais pra dizer que tem isso pq tô esperando o cleber passar a tabela de upload que ele falou quando perguntei sobre
    pro_notif int -- notifição do profissional
);

create table cliente ( -- tabela do cliente
    cli_id int auto_increment primary key,-- id do cliente
    cli_nome varchar(90),-- nome do cliente
    cli_email varchar(90) unique,-- email do cliente
    cli_user varchar(20) unique not null,-- usuario do cliente
    cli_senha varchar(255) not null,-- senha do cliente
    cli_bio text,-- biografia do cliente
    cli_foto varchar(100),-- foto do cliente
    cli_codVali varchar(6),-- codigo de validação do cliente
    cli_dtNasc date,-- data de nascimento do cliente
    cli_dtCad datetime default current_timestamp,-- data de cadastro do cliente
    cli_dtDell datetime null,-- data de delete
    cli_stat varchar(8),-- status do cliente
    cli_CPF varchar(11) unique not null,-- cpf do cliente
    cli_tel varchar(11),-- telefone do cliente
    cli_gen varchar(6),-- genero do cliente
    cli_doc varchar(100),-- documento do cliente
    cli_notif int -- notifição do cliente 
);

create table servico (
	ser_id int auto_increment primary key, -- id do serviço
    ser_pro int not null,-- id do profissional na tabela serviço
    ser_clin int null,
    ser_nome varchar(100) not null,-- nome do serviço
    ser_tipo varchar(50),-- tipo do serviço --
    ser_desc text,-- descrição do serviço
    ser_dur int,-- duração do serviço -- vai estar em minutos
    ser_inter int,-- intervalo do serviço -- vou somar com a duração para saber por quanto tenho que separar os horarios de serviço
    ser_val decimal(10,2), -- valor do seviço
    ser_stat varchar(8),-- status do serviço -- se uma podologa deixar de fazer um serviço dar soft delete para manter o relatorio e atentimento sem dar problema
    ser_dia int null,-- dias em que a podóloga realiza tal serviço 0 = domingo 1 = segunda
    ser_loc int null, -- id da localização
    foreign key (ser_pro) references profissional(pro_id)on delete cascade on update cascade
);

create table permissoes (-- tabela que vai estar os tipos de permissoes que tem
	perm_id int auto_increment primary key,-- id da permissão -- só tem o id pq vai ser as mesma permissões para todo mundo só vai mudar no menu de permissões que permissão vai restringir
    perm_desc text -- descrição da permissão
);

create table profissional_clinica (-- essa tabela relaciona o profissional com a clinica  -- como faremos de forma que o podologo pode ter + de 1 associação tipo ela oferece um serviço no proprio nome já que a clinica não oferece esse serviço por isso uma tabela relacionanto os 2 e não um campo com null pra poder não ter associação
    pc_id int auto_increment primary key, -- id dessa tabela
    pc_pro int not null, -- id do profissional nessa tabela
    pc_clin int not null, -- id da clinica nessa tabela
    foreign key (pc_pro) references profissional(pro_id) on delete cascade on update cascade,
    foreign key (pc_clin) references clinica(clin_id) on delete cascade on update cascade
);

create table menu_permissao ( -- tabela que vai associar as permissoes e clinicas e seus associados
	mnperm_id int auto_increment primary key, -- id dessa tabela
    mnperm_perm int null, -- id da permissão nessa tabela
    mnperm_pc int null, -- id da associção nessa tabela
    foreign key (mnperm_perm) references permissoes(perm_id) on delete cascade on update cascade,
	foreign key (mnperm_pc) references profissional_clinica(pc_id) on delete set null on update cascade
);

create table localizacao (-- criei essa tabela pra fazer um 1vn com as salas
	loc_id int auto_increment primary key, -- id dessa tabela
    loc_pro int null, -- id do profissional nessa tabela
    loc_clin int null,   -- id da clinica nessa tabela
    loc_nome varchar(90), -- nome da localização
    loc_tipo enum('clin','casa','domi'), -- tipo de localização: clinica, casa, à domicíolio
    foreign key (loc_pro) references profissional(pro_id) on delete cascade on update cascade,
    foreign key (loc_clin) references clinica(clin_id) on delete cascade on update cascade
);

create table sala (-- crie essa tabela para controlar o agendamento de forma que não aja um agendamento na mesma sala no mesmo horario
	sala_id int auto_increment primary key,-- id dessa tabela
    sala_loc int not null, -- id da localização nessa tabela
    sala_nome varchar(90), -- nome da sala
    foreign key (sala_loc) references localizacao(loc_id) on delete cascade on update cascade
); -- não tem status pq eu só vou usar para verificar no agendamento se já tem gente usando esssa sala

create table relatorio (-- como queremos guardar os relatorios e que as clinicas possam acessar ela então criamos uma tabela pra isso
    rel_id int auto_increment primary key,-- id dessa tabela
    rel_pro int null, -- id do profissional nessa tabela
    rel_clin int null, -- id da clinica nessa tabela
    dt_relatorio datetime, -- data do relatorio
    ttl_atendimentos int, -- total de atentimentos
    ttl_gnh decimal(10,2), -- ganho. Provavelmente vou ter que acrecentrar coisas 
    foreign key (rel_pro) references profissional(pro_id) on delete set null on update cascade,
    foreign key (rel_clin) references clinica(clin_id) on delete set null on update cascade
);

create table hr_servico ( -- para cada dia em que a podologa trabralhar vai ter um horario de inicio e terminio e vai servir tbm pra verificar se o horario corresponde ao horario livre
    hrser_id int auto_increment primary key,-- id dessa tabela
    hrser_pro int null,-- id do profissional nessa tabela
    hrser_clin int null,
    hrser_hrini time not null, -- horario do inicio do trabalho 
    hrser_hrterm time not null, -- horario do termino do trabalho 
    hrser_dia int, -- dias de trabalho 0 = domingo 1 = segunda ...
    foreign key (hrser_pro) references profissional(pro_id) on delete cascade
);
create table hr_excecao ( -- para cada dia em que a podologa trabralhar vai ter um horario de inicio e terminio e vai servir tbm pra verificar se o horario corresponde ao horario livre
    hr_excecao_id int auto_increment primary key,-- id dessa tabela
    hr_excecao_pro int not null,-- id do profissional nessa tabela
    hr_excecao_dia date not null, -- dia em que haverá a exceção
    hr_excecao_trab boolean, -- trablho na exveção? -- true para se for um dia que trabalhar extra false se for uma folga
    hr_excecao_ini time,-- inicio da exceção -- pode ser vazio pq caso seja uma folga total ficará vazio, se for uma incompleta aqui ficara o periodo que folgará o mesmo é falido pra hora/dia extra
    hr_excecao_term time,-- termino da exceção
    hr_excecao_desc text, -- descrição/motivo da exceção
    foreign key (hr_excecao_pro) references profissional(pro_id) on delete cascade
);


create table agenda (-- aqui vai estar os horarios das consultas
    agnd_id int primary key auto_increment, -- id dessa tabela
    agnd_pro int not null,-- id do profissional nessa tabela
    agnd_cli int not null,-- id do cliente nessa tabela
    agnd_clin int null,-- id da clinica
    agnd_ser int not null,-- id do servico nessa tabela
    agnd_sala int not null,-- id da sala nessa tabela
    agnd_dt date, -- data da consulta
    agnd_hrIni time,-- data de inicio da consulta
    agnd_hrTerm time, -- data de termino da consulta
    foreign key (agnd_pro) references profissional(pro_id),
	foreign key (agnd_cli) references cliente(cli_id),
	foreign key (agnd_clin) references clinica(clin_id),
    foreign key (agnd_ser) references servico(ser_id),
    foreign key (agnd_sala) references sala(sala_id)
);

create table atendimento ( -- esse vai salvar pra fazer o relatorio e mander no historico -- basicamente depois da consulta vai salvar aqui para poder calcular os relatorio
	atd_id int primary key auto_increment, -- id dessa tabela
	atd_pro int, -- id do profissional nessa tabela
	atd_agnd int, -- id da agenda nessa tabela
	atd_cli int, -- id do cliente nessa tabela
    atd_ser int not null,-- id do servico nessa tabela
    atd_stat enum('atentido','desmarcado','não compareceu'), -- status do atentimento para gerar relatorios
	foreign key (atd_pro) references profissional(pro_id) on delete set null, 
	foreign key (atd_agnd) references agenda(agnd_id) on delete set null, 
	foreign key (atd_cli) references cliente(cli_id) on delete set null,
    foreign key (atd_ser) references servico(ser_id)  on delete cascade
);

select * from cliente;

/*INSERT INTO servico (ser_id, ser_pro, ser_nome, ser_tipo, ser_desc, ser_dur, ser_inter, ser_val, ser_stat, ser_dia) VALUES (0, 1, 'mao de pão', 'mãos', 'sua mão vira pão', 30, 10, 50.20, 'ativado', 0);
INSERT INTO hr_servico (hrser_id, hrser_pro, hrser_hora_inic, hrser_hora_term, hrser_dia) VALUES (0, 1, '08:00:00','18:00:00','1');
INSERT INTO hr_excecao (hr_excecao_id, hr_excecao_pro, hr_excecao_dia, hr_excecao_trab, hr_excecao_ini, hr_excecao_term, hr_excecao_desc) VALUES (0, 1, '2026/08/10',false,null,null,'pão');
*/