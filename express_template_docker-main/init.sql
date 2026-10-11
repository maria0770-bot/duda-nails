create table clientes (
  id serial primary key,
  nome varchar (100) not null,
  telefone varchar (20) not null
);

create table servicos (
  id serial primary key,
  nome varchar (100) not null,
  preco decimal (10,2) not null
);

create table agendamentos (
  id serial primary key,
  ciente_id integer not null,
  servicos_id integer not null,
  data date not null,
  horario time not null,
  
  foreign key (cliente_id) references cliente(id),
  foreign key (servico_id) references servicos(id)
);

INSERT INTO clientes (nome, telefone) VALUES
('Maria Eduarda', '16999990000'),
('Ana Clara', '16988881111'),
('Julia Santos', '16977772222');

INSERT INTO servicos (nome, preco) VALUES
('Manicure', 30.00),
('Pedicure', 35.00),
('Unha em gel', 80.00),
('Alongamento', 100.00);

INSERT INTO agendamentos (cliente_id, servico_id, data, horario) VALUES
(1, 3, '2026-10-10', '14:00'),
(2, 1, '2026-10-10', '15:00'),
(3, 4, '2026-10-11', '10:00');