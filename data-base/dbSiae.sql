SELECT COUNT(*) FROM services;
SELECT COUNT(*) FROM occurrences;
SELECT COUNT(*) FROM reports;
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM shares;

DELETE FROM users_types;
SELECT COUNT(*) AS total
FROM users_types;
DELETE FROM users WHERE id > 0;
ALTER TABLE users AUTO_INCREMENT = 1;
SELECT * FROM users;
INSERT INTO users
(
    sector_id,
    class_id,
    name,
    email,
    password,
    active,
    created_at,
    enrollment,
    date_birth
)
VALUES

(1, NULL, 'Maria Clara Santos', 'maria.admin@siae.com',
'123456', 1, NOW(), 'administrador', '1985-03-15'),

(1, NULL, 'João Pedro Oliveira', 'joao.admin@siae.com',
'123456', 1, NOW(), 'administrador', '1988-09-22'),

(2, NULL, 'Fernanda Rocha', 'fernanda.prof@siae.com',
'123456', 1, NOW(), 'profissional', '1990-06-10'),

(3, NULL, 'Ricardo Mendes', 'ricardo.prof@siae.com',
'123456', 1, NOW(), 'profissional', '1987-11-05'),

(NULL, 1, 'Juliana Almeida', 'juliana.est@siae.com',
'123456', 1, NOW(), 'estudante', '2008-04-18'),

(NULL, 2, 'Lucas Ferreira', 'lucas.est@siae.com',
'123456', 1, NOW(), 'estudante', '2007-12-30');
ALTER TABLE users
MODIFY enrollment ENUM(
    'administrador',
    'profissional',
    'estudante'
) NOT NULL;
SELECT
    id,
    name,
    email,
    enrollment
FROM users;