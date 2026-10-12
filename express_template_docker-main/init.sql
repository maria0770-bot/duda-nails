CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    referencias VARCHAR(255)
);

CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    referencias VARCHAR(255)
);

CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    servico_id INTEGER NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,

    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

CREATE TABLE agendamento_servicos (
    agendamento_id INTEGER NOT NULL,
    servico_id INTEGER NOT NULL,

    PRIMARY KEY (agendamento_id, servico_id),

    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

INSERT INTO clientes (nome, telefone, referencias) VALUES
('Maria Eduarda', '16999990000', 'Referência 1'),
('Ana Clara', '16988881111', 'Referência 2'),
('Julia Santos', '16977772222', 'Referência 3');

INSERT INTO servicos (nome, preco, referencias) VALUES
('Manicure', 30.00, 'Referência 1'),
('Pedicure', 35.00, 'Referência 2'),
('Unha em gel', 80.00, 'Referência 3'),
('Alongamento', 100.00, 'Referência 4');

INSERT INTO agendamentos (cliente_id, servico_id, data, horario) VALUES
(1, 3, '2026-10-15', '14:00'),
(2, 1, '2026-10-15', '15:00'),
(3, 4, '2026-10-16', '10:00');

INSERT INTO agendamento_servicos (agendamento_id, servico_id) VALUES
(1, 3),
(2, 1),
(3, 4);
