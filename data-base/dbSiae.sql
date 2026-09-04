
/* =========================================================
   1. DESABILITA TEMPORARIAMENTE AS FOREIGN KEYS
   ========================================================= */

SET FOREIGN_KEY_CHECKS = 0;


/* =========================================================
   2. AJUSTES DA ESTRUTURA
   ========================================================= */

/* USERS */
ALTER TABLE users
MODIFY enrollment ENUM(
    'administrador',
    'profissional',
    'estudante'
) NOT NULL;


/* SERVICES */
ALTER TABLE services
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE services
CHANGE COLUMN Students_id student_id INT NOT NULL;

ALTER TABLE services
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1;


/* OCCURRENCES */
ALTER TABLE occurrences
CHANGE COLUMN servicesId services_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE COLUMN sectorsId sectors_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE occurrences
CHANGE COLUMN studentsId student_id INT NOT NULL;


/* REPORTS */
ALTER TABLE reports
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE reports
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1;


/* NOTIFICATIONS */
ALTER TABLE notifications
CHANGE COLUMN menssage message LONGTEXT NOT NULL;

ALTER TABLE notifications
CHANGE COLUMN userId user_id INT NOT NULL;

ALTER TABLE notifications
CHANGE COLUMN `read` is_read TINYINT NOT NULL;


/* SHARES */
ALTER TABLE shares
CHANGE COLUMN userId user_id INT NOT NULL;


/* FAQS */
ALTER TABLE faqs
CHANGE COLUMN faqcategoryId faq_category_id INT NOT NULL;


/* USERS_TYPES */
ALTER TABLE users_types
CHANGE COLUMN userId user_id INT NOT NULL;


/* =========================================================
   3. LIMPA OS DADOS ANTIGOS
   ========================================================= */

TRUNCATE TABLE occurrences;
TRUNCATE TABLE services;
TRUNCATE TABLE reports;
TRUNCATE TABLE notifications;
TRUNCATE TABLE shares;
TRUNCATE TABLE users_types;
TRUNCATE TABLE users;
TRUNCATE TABLE sectors;
TRUNCATE TABLE classes;


/* =========================================================
   4. INSERE OS SETORES
   ========================================================= */

INSERT INTO sectors
(
    name,
    description,
    active,
    created_at
)
VALUES
(
    'Direção',
    'Setor administrativo geral',
    1,
    NOW()
),
(
    'Orientação',
    'Acompanhamento pedagógico',
    1,
    NOW()
),
(
    'Psicologia',
    'Atendimento psicológico',
    1,
    NOW()
);


/* =========================================================
   5. INSERE AS TURMAS
   ========================================================= */

INSERT INTO classes
(
    name
)
VALUES
(
    'INFO 1A'
),
(
    'INFO 2A'
);


/* =========================================================
   6. INSERE OS USUÁRIOS
   ========================================================= */

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
(
    1,
    NULL,
    'Maria Clara Santos',
    'maria.admin@siae.com',
    '123456',
    1,
    NOW(),
    'administrador',
    '1985-03-15'
),
(
    1,
    NULL,
    'João Pedro Oliveira',
    'joao.admin@siae.com',
    '123456',
    1,
    NOW(),
    'administrador',
    '1988-09-22'
),
(
    2,
    NULL,
    'Fernanda Rocha',
    'fernanda.prof@siae.com',
    '123456',
    1,
    NOW(),
    'profissional',
    '1990-06-10'
),
(
    3,
    NULL,
    'Ricardo Mendes',
    'ricardo.prof@siae.com',
    '123456',
    1,
    NOW(),
    'profissional',
    '1987-11-05'
),
(
    NULL,
    1,
    'Juliana Almeida',
    'juliana.est@siae.com',
    '123456',
    1,
    NOW(),
    'estudante',
    '2008-04-18'
),
(
    NULL,
    2,
    'Lucas Ferreira',
    'lucas.est@siae.com',
    '123456',
    1,
    NOW(),
    'estudante',
    '2007-12-30'
);


/* =========================================================
   7. INSERE OS SERVIÇOS
   ========================================================= */

INSERT INTO services
(
    user_id,
    observations,
    created_at,
    student_id,
    active
)
VALUES
(
    3,
    'Atendimento psicológico inicial',
    NOW(),
    5,
    1
),
(
    4,
    'Acompanhamento pedagógico',
    NOW(),
    6,
    1
);


/* =========================================================
   8. INSERE OS TIPOS DE USUÁRIOS
   ========================================================= */

INSERT INTO users_types
(
    user_id,
    name,
    active
)
VALUES
(
    1,
    'administrador',
    1
),
(
    2,
    'administrador',
    1
),
(
    3,
    'profissional',
    1
),
(
    4,
    'profissional',
    1
),
(
    5,
    'estudante',
    1
),
(
    6,
    'estudante',
    1
);


/* =========================================================
   9. INSERE AS OCORRÊNCIAS
   ========================================================= */

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


/* =========================================================
   10. RECRIA AS FOREIGN KEYS
   ========================================================= */

/* SERVICES -> USERS */
ALTER TABLE services
ADD CONSTRAINT fk_services_users
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE NO ACTION
ON UPDATE NO ACTION;


/* OCCURRENCES -> SERVICES */
ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_services
FOREIGN KEY (services_id)
REFERENCES services(id);


/* OCCURRENCES -> USERS */
ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_users
FOREIGN KEY (user_id)
REFERENCES users(id);


/* OCCURRENCES -> SECTORS */
ALTER TABLE occurrences
ADD CONSTRAINT fk_occurrences_sectors
FOREIGN KEY (sectors_id)
REFERENCES sectors(id);


/* NOTIFICATIONS -> USERS */
ALTER TABLE notifications
ADD CONSTRAINT fk_Notifications_User1
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE NO ACTION
ON UPDATE NO ACTION;


/* SHARES -> USERS */
ALTER TABLE shares
ADD CONSTRAINT fk_Shares_User1
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE NO ACTION
ON UPDATE NO ACTION;


/* =========================================================
   11. REATIVA AS FOREIGN KEYS
   ========================================================= */

SET FOREIGN_KEY_CHECKS = 1;


/* =========================================================
   12. CONFERÊNCIA
   ========================================================= */

SELECT COUNT(*) AS total_users
FROM users;

SELECT COUNT(*) AS total_services
FROM services;

SELECT COUNT(*) AS total_occurrences
FROM occurrences;

SELECT COUNT(*) AS total_reports
FROM reports;

SELECT COUNT(*) AS total_notifications
FROM notifications;

SELECT COUNT(*) AS total_shares
FROM shares;

SELECT COUNT(*) AS total_users_types
FROM users_types;


/* USUÁRIOS */
SELECT
    id,
    name,
    email,
    enrollment
FROM users;


/* SERVIÇOS */
SELECT
    id,
    user_id,
    student_id,
    observations,
    active
FROM services;


/* OCORRÊNCIAS */
SELECT *
FROM occurrences;
SELECT *
FROM faqs_categories;



SELECT * FROM db_siae.faqs;
INSERT INTO faqs_categories
(
    name,
    active
)
VALUES
('Acesso e Conta', 1),
('Atendimentos', 1),
('Ocorrências', 1),
('Privacidade e Sigilo', 1),
('Notificações', 1),
('Compartilhamento de Informações', 1);
INSERT INTO faqs
(
    faq_category_id,
    question,
    answer,
    active
)
VALUES

/* =====================================================
   ACESSO E CONTA
   ===================================================== */

(
    1,
    'Como acessar o SIAE?',
    'Para acessar o SIAE, utilize seu e-mail institucional e sua senha cadastrada. Após realizar o login, você terá acesso às funcionalidades disponíveis de acordo com o seu perfil de usuário.',
    1
),

(
    1,
    'Esqueci minha senha. O que devo fazer?',
    'Caso tenha esquecido sua senha, procure o responsável pelo sistema ou o administrador da instituição para realizar a recuperação ou redefinição do acesso.',
    1
),

(
    1,
    'Quem pode utilizar o SIAE?',
    'O SIAE pode ser utilizado por estudantes, profissionais e administradores autorizados pela instituição. Cada perfil possui permissões específicas dentro do sistema.',
    1
),

/* =====================================================
   ATENDIMENTOS
   ===================================================== */

(
    2,
    'Como registrar um novo atendimento?',
    'Para registrar um atendimento, acesse a área de atendimentos, selecione o estudante e informe as observações necessárias. Após preencher os dados, salve o registro para que ele fique disponível no sistema.',
    1
),

(
    2,
    'Quem pode registrar um atendimento?',
    'Os atendimentos podem ser registrados por profissionais autorizados pela instituição, de acordo com as permissões definidas para o perfil de usuário.',
    1
),

(
    2,
    'É possível consultar atendimentos anteriores?',
    'Sim. Usuários que possuem permissão podem consultar os atendimentos registrados anteriormente, respeitando as regras de acesso e sigilo estabelecidas pela instituição.',
    1
),

/* =====================================================
   OCORRÊNCIAS
   ===================================================== */

(
    3,
    'O que é uma ocorrência?',
    'Uma ocorrência é um registro relacionado a uma situação que necessita de acompanhamento pela instituição, podendo envolver aspectos pedagógicos, comportamentais ou de apoio ao estudante.',
    1
),

(
    3,
    'Como registrar uma ocorrência?',
    'Para registrar uma ocorrência, acesse a área correspondente, informe o estudante, o setor responsável, o título, a descrição e as demais informações solicitadas. Depois, salve o registro.',
    1
),

(
    3,
    'Quem pode visualizar uma ocorrência?',
    'A visualização de uma ocorrência depende das permissões do usuário e do nível de sigilo definido no registro. Dessa forma, somente usuários ou setores autorizados poderão acessar determinadas informações.',
    1
),

/* =====================================================
   PRIVACIDADE E SIGILO
   ===================================================== */

(
    4,
    'As informações dos estudantes são protegidas?',
    'Sim. O SIAE utiliza níveis de acesso e sigilo para limitar a visualização de informações conforme as permissões de cada usuário e as regras estabelecidas pela instituição.',
    1
),

(
    4,
    'Quem pode acessar informações sigilosas?',
    'Somente usuários autorizados e que possuam as permissões necessárias podem acessar informações classificadas como sigilosas.',
    1
),

(
    4,
    'Posso compartilhar informações de um estudante com qualquer usuário?',
    'Não. Informações relacionadas aos estudantes devem ser compartilhadas somente com usuários ou setores autorizados, respeitando o nível de sigilo e as regras da instituição.',
    1
),

/* =====================================================
   NOTIFICAÇÕES
   ===================================================== */

(
    5,
    'Para que servem as notificações?',
    'As notificações informam o usuário sobre acontecimentos importantes no sistema, como novos registros, atualizações ou outras ações que necessitem de atenção.',
    1
),

(
    5,
    'Como saber se tenho novas notificações?',
    'As novas notificações podem ser identificadas na área de notificações do sistema. Ao acessar essa área, você poderá consultar as mensagens recebidas.',
    1
),

(
    5,
    'As notificações podem ser marcadas como lidas?',
    'Sim. Após visualizar uma notificação, ela pode ser marcada como lida, permitindo que você diferencie as mensagens que ainda precisam de atenção das que já foram consultadas.',
    1
),

/* =====================================================
   COMPARTILHAMENTO DE INFORMAÇÕES
   ===================================================== */

(
    6,
    'O que é o compartilhamento de informações?',
    'O compartilhamento permite disponibilizar determinadas informações para usuários ou setores autorizados, de acordo com as permissões e regras de sigilo definidas no sistema.',
    1
),

(
    6,
    'Quem pode compartilhar informações?',
    'Somente usuários que possuam permissão para realizar compartilhamentos podem utilizar essa funcionalidade.',
    1
),

(
    6,
    'É possível controlar quem recebe uma informação compartilhada?',
    'Sim. O compartilhamento deve respeitar as permissões do sistema e pode ser direcionado aos usuários ou setores autorizados conforme as regras estabelecidas pela instituição.',
    1
);
select * from faqs;

select * from users;
use db_siae;
ALTER TABLE users
MODIFY password VARCHAR(255) NOT NULL;