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

ALTER TABLE services
CHANGE userId user_id INT NOT NULL;

ALTER TABLE services
CHANGE Students_id student_id INT NOT NULL;
ALTER TABLE reports
CHANGE userId user_id INT NOT NULL;
ALTER TABLE notifications
CHANGE userId user_id INT NOT NULL;
ALTER TABLE shares
CHANGE userId user_id INT NOT NULL;
ALTER TABLE faqs
CHANGE faqcategoryId faq_category_id INT NOT NULL;

ALTER TABLE users_types
CHANGE userId user_id INT NOT NULL;




ALTER TABLE occurrences
CHANGE servicesId services_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE sectorsId sectors_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE userId user_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE studentsId student_id INT NOT NULL;


INSERT INTO sectors
(name, description, active, created_at)
VALUES
('Direção', 'Setor administrativo geral', 1, NOW()),
('Orientação', 'Acompanhamento pedagógico', 1, NOW()),
('Psicologia', 'Atendimento psicológico', 1, NOW());
INSERT INTO classes (name)
VALUES
('INFO 1A'),
('INFO 2A');




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

INSERT INTO services
(
    user_id,
    observations,
    created_at,
    student_id
)
VALUES
(
    3,
    'Atendimento psicológico inicial',
    NOW(),
    5
),
(
    4,
    'Acompanhamento pedagógico',
    NOW(),
    6
);

INSERT INTO users_types
(user_id, name, active)
VALUES
(1,'administrador',1),
(2,'administrador',1),
(3,'profissional',1),
(4,'profissional',1),
(5,'estudante',1),
(6,'estudante',1);
select * from users;

INSERT INTO occurrences
(
    services_id,
    sectors_id,
    user_id,
    student_id,
    title,
    description,
    status,
    secrecy_level,
    created_at,
    active,
    class
)
VALUES
(
    1,
    3,
    3,
    5,
    'Primeiro atendimento',
    'Aluno apresentou dificuldades emocionais',
    'Ativo',
    'Apenas esta entidade',
    NOW(),
    1,
    'INFO 1A'
),

(
    2,
    2,
    4,
    6,
    'Acompanhamento escolar',
    'Baixo rendimento em matemática',
    'Ativo',
    'Entidades especificas',
    NOW(),
    1,
    'INFO 2A'
);
select * from occurrences;
ALTER TABLE occurrences
DROP FOREIGN KEY fk_occurrence_Services1;

ALTER TABLE occurrences
DROP FOREIGN KEY fk_Occurrence_User1;

ALTER TABLE occurrences
DROP FOREIGN KEY fk_Occurrence_Sectors1;
ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_services
FOREIGN KEY (services_id)
REFERENCES services(id);

ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_users
FOREIGN KEY (user_id)
REFERENCES users(id);

ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_sectors
FOREIGN KEY (sectors_id)
REFERENCES sectors(id);
ALTER TABLE services
DROP FOREIGN KEY fk_Services_User1;

ALTER TABLE services
ADD CONSTRAINT fk_services_users
FOREIGN KEY (user_id)
REFERENCES users(id);

SELECT id, user_id, student_id
FROM services;
SELECT * FROM services;


ALTER TABLE services
ADD COLUMN active tinyint(1);

-- Alteração da tabela users
ALTER TABLE users
MODIFY enrollment ENUM(
    'administrador',
    'profissional',
    'estudante'
) NOT NULL;

-- Alterações da tabela services
ALTER TABLE services
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE services
CHANGE COLUMN Students_id student_id INT NOT NULL;

ALTER TABLE services
ADD active TINYINT(1) NOT NULL;

ALTER TABLE services
DROP FOREIGN KEY fk_Services_User1;

ALTER TABLE services
ADD CONSTRAINT fk_Services_User1
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE NO ACTION
ON UPDATE NO ACTION;

-- Alterações da tabela occurrences
ALTER TABLE occurrences
CHANGE COLUMN servicesId services_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE COLUMN sectorsId sectors_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE COLUMN studentsId students_id INT NOT NULL;

ALTER TABLE occurrences
DROP FOREIGN KEY fk_occurrence_Services1;

ALTER TABLE occurrences
DROP FOREIGN KEY fk_Occurrence_User1;

ALTER TABLE occurrences
DROP FOREIGN KEY fk_Occurrence_Sectors1;

ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_services
FOREIGN KEY (services_id)
REFERENCES services(id);

ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_users
FOREIGN KEY (user_id)
REFERENCES users(id);

ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_sectors
FOREIGN KEY (sectors_id)
REFERENCES sectors(id);

-- Alterações da tabela reports
ALTER TABLE reports
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE reports
ADD active TINYINT(1) NOT NULL;

-- Alterações da tabela notifications
ALTER TABLE notifications
CHANGE COLUMN menssage message LONGTEXT NOT NULL;

ALTER TABLE notifications
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE notifications
CHANGE COLUMN `read` is_read TINYINT NOT NULL;

ALTER TABLE notifications
DROP FOREIGN KEY fk_Notifications_User1;

ALTER TABLE notifications
ADD CONSTRAINT fk_Notifications_User1
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE NO ACTION
ON UPDATE NO ACTION;

-- Alterações da tabela shares
ALTER TABLE shares
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE shares
DROP FOREIGN KEY fk_Shares_User1;

ALTER TABLE shares
ADD CONSTRAINT fk_Shares_User1
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE NO ACTION
ON UPDATE NO ACTION;

-- Alteração da tabela faqs
ALTER TABLE faqs
CHANGE COLUMN faqcategoryId faq_category_id INT NOT NULL;

-- Alteração da tabela users_types
ALTER TABLE users_types
CHANGE COLUMN userId user_id INT NOT NULL;