<?php

namespace Source\Controller;

use Source\Models\Users\User;
use Source\Controller\Api;
use Source\Support\Upload;

class Users extends Api
{

    public function hello(): void
    {
        echo "HELLO USERS";
    }


    // Lista apenas os campos necessários para as listas administrativas.
    // Senhas e outros dados internos nunca são enviados ao navegador.
    public function listAll(): void
    {
        $isAdministrator = $this->authToken('administrador');
        $isProfessional = $this->authToken('profissional');

        if (!$isAdministrator && !$isProfessional) {
            $this->call(401, "unauthorized", "Sessão inválida ou sem permissão para consultar estudantes.", "error")->back();
            return;
        }

        try {
            $pdo = \Source\Core\Connect::getInstance();

            // Administradores consultam estudantes e profissionais.
            // Profissionais consultam somente estudantes, conforme a matriz de acesso do SIAE.
            $enrollmentFilter = $isAdministrator
                ? "u.enrollment IN ('estudante', 'profissional')"
                : "u.enrollment = 'estudante'";

            $query = "SELECT
                        u.id,
                        u.name,
                        u.email,
                        u.photo,
                        u.enrollment,
                        u.active,
                        u.date_birth AS dateBirth,
                        u.class_id AS classId,
                        c.name AS className,
                        u.sector_id AS sectorId,
                        s.name AS sectorName
                      FROM users u
                      LEFT JOIN classes c ON c.id = u.class_id
                      LEFT JOIN sectors s ON s.id = u.sector_id
                      WHERE {$enrollmentFilter}
                      ORDER BY u.enrollment ASC, u.name ASC";
            $stmt = $pdo->query($query);
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Entrega uma URL pública consistente para as fotos enviadas pelo upload.
            // Valores antigos digitados manualmente (ex.: "asdasdasda") continuam sem foto.
            foreach ($users as &$listedUser) {
                $listedUser["photoUrl"] = $this->publicPhotoUrl($listedUser["photo"] ?? null);
            }
            unset($listedUser);

            $this->call(200, "success", "Usuários encontrados.", "success")->back($users);
        } catch (\Throwable $exception) {
            error_log("Erro ao listar usuários administrativos: " . $exception->getMessage());
            $this->call(500, "internal_server_error", "Não foi possível carregar os usuários.", "error")->back();
        }
    }

    /**
     * Converte somente caminhos gerados pelo upload em uma URL pública.
     * Não trata strings antigas digitadas manualmente como se fossem arquivos.
     */
    private function publicPhotoUrl(?string $photo): ?string
    {
        if ($photo === null || trim($photo) === "") {
            return null;
        }

        $normalized = str_replace("\\", "/", trim($photo));

        if (preg_match('#^https?://#i', $normalized)) {
            return $normalized;
        }

        if (preg_match('#(?:^|/)uploads/users/([a-f0-9]{32}\.(?:jpg|png|webp))$#i', $normalized, $matches)) {
            return \url("uploads/users/" . $matches[1]);
        }

        if (preg_match('#^([a-f0-9]{32}\.(?:jpg|png|webp))$#i', $normalized, $matches)) {
            return \url("uploads/users/" . $matches[1]);
        }

        return null;
    }



    // Lista profissionais autorizados para seleção no compartilhamento de ocorrências.
    public function listProfessionals(): void
    {
        if (!$this->authToken('administrador') && !$this->authToken('profissional')) {
            $this->call(401, "unauthorized", "Sessão inválida ou sem permissão.", "error")->back();
            return;
        }

        try {
            $pdo = \Source\Core\Connect::getInstance();
            $stmt = $pdo->query(
                "SELECT u.id, u.name, u.email, u.photo, u.enrollment, u.active,
                        u.sector_id AS sectorId, s.name AS sectorName
                 FROM users u
                 LEFT JOIN sectors s ON s.id = u.sector_id
                 WHERE u.enrollment = 'profissional' AND u.active = 1
                 ORDER BY u.name ASC"
            );
            $professionals = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($professionals as &$professional) {
                $professional["photoUrl"] = $this->publicPhotoUrl($professional["photo"] ?? null);
            }
            unset($professional);

            $this->call(200, "success", "Profissionais encontrados.", "success")->back($professionals);
        } catch (\Throwable $exception) {
            error_log("Erro ao listar profissionais para compartilhamento: " . $exception->getMessage());
            $this->call(500, "internal_server_error", "Não foi possível carregar os profissionais.", "error")->back();
        }
    }

    // Retorna somente as informações básicas do usuário autenticado.
    public function me(array $data = []): void
    {
        if (!$this->authToken('administrador') && !$this->authToken('profissional')) {
            $this->call(401, "unauthorized", "Sessão inválida ou expirada.", "error")->back();
            return;
        }

        try {
            $pdo = \Source\Core\Connect::getInstance();
            $stmt = $pdo->prepare(
                "SELECT u.id, u.name, u.email, u.photo, u.enrollment, u.date_birth AS dateBirth,
                        u.active, u.class_id AS classId, c.name AS className,
                        u.sector_id AS sectorId, s.name AS sectorName
                 FROM users u
                 LEFT JOIN classes c ON c.id = u.class_id
                 LEFT JOIN sectors s ON s.id = u.sector_id
                 WHERE u.id = :id LIMIT 1"
            );
            $stmt->bindValue(':id', $this->userAuthId, \PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$user) {
                $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
                return;
            }

            $user["photoUrl"] = $this->publicPhotoUrl($user["photo"] ?? null);
            $this->call(200, "success", "Perfil carregado com sucesso.", "success")->back($user);
        } catch (\Throwable $exception) {
            error_log("Erro ao carregar perfil do usuário: " . $exception->getMessage());
            $this->call(500, "internal_server_error", "Não foi possível carregar o perfil.", "error")->back();
        }
    }

    //LIST BY ID - GET
    public function listById(array $data): void
    {

        if (
            !isset($data["user_id"]) ||
            empty($data["user_id"]) ||
            !filter_var($data["user_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $user = new User();

        if (!$user->selectById($data["user_id"])) {
            $this->call(
                404,
                "not_found",
                "Usuário não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $user->getId(),
            "sectorId" => $user->getSectorId(),
            "classId" => $user->getClassId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhoto(),
            "photoUrl" => $this->publicPhotoUrl($user->getPhoto()),
            "enrollment" => $user->getEnrollment(),
            "dateBirth" => $user->getDateBirth(),
            "active" => $user->getActive()
        ];

        $this->call(
            200,

            "success",
            "Usuário encontrado",
            "success"
        )->back($response);
    }




    //INSERT - POST

    public function insert(array $data): void
    {
        // Somente administradores podem cadastrar usuários.
        if (!$this->authToken('administrador')) {
            $this->call(
                401,
                "unauthorized",
                "Apenas administradores podem realizar esta ação.",
                "error"
            )->back();
            return;
        }


        $isProfessional = ($data["enrollment"] ?? null) === "profissional";
        $isStudent = ($data["enrollment"] ?? null) === "estudante";


        $required = [
            "name",
            "email",
            "enrollment",
            "dateBirth"
        ];


        if ($isProfessional) {
            $required[] = "sector";
        } elseif ($isStudent) {
            $required[] = "class_id";
        } else {
            $required[] = "sector_id";
        }


        foreach ($required as $field) {
            if (!isset($data[$field]) || trim((string) $data[$field]) === "") {
                $this->call(
                    400,
                    "bad_request",
                    "Campo obrigatório ausente ou vazio: " . $field,
                    "error"
                )->back();
                return;
            }
        }

        if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
            $this->call(
                400,
                "bad_request",
                "O e-mail informado é inválido.",
                "error"
            )->back();
            return;
        }


        $password = trim((string) ($data["password"] ?? ""));

        if ($password === "") {
            $password = date("His");
        }


        $classId = $data["class_id"] ?? null;
        if ($classId === "" || $classId === "null") {
            $classId = null;
        } elseif ($classId !== null) {
            $classId = (int) $classId;
        }

        $photo = $data["photo"] ?? null;
        if ($photo === "" || $photo === "null") {
            $photo = null;
        }

        $pdo = \Source\Core\Connect::getInstance();
        $uploadDirectory = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "users";
        $uploadedPhotoPath = null;

        try {
            $pdo->beginTransaction();


            $sectorId = null;

            if ($isProfessional) {
                // Converte o nome enviado pela modal no ID do setor.
                $sectorStmt = $pdo->prepare(
                    "SELECT id FROM sectors WHERE name = :name AND active = 1 LIMIT 1"
                );
                $sectorStmt->execute(["name" => $data["sector"]]);
                $sector = $sectorStmt->fetch(\PDO::FETCH_ASSOC);


                if (!$sector) {
                    $pdo->rollBack();
                    $this->call(
                        400,
                        "bad_request",
                        "O setor selecionado não foi encontrado ou está inativo.",
                        "error"
                    )->back();
                    return;
                }

                $sectorId = (int) $sector["id"];
                $classId = null;
            }

            // Quando há uma foto selecionada no formulário, armazena o arquivo
            // e grava no banco apenas o caminho relativo gerado pelo Upload.
            if (
                isset($_FILES["photo"]) && is_array($_FILES["photo"]) &&
                (int) ($_FILES["photo"]["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE
            ) {
                try {
                    $uploader = new Upload($uploadDirectory);
                    $filename = $uploader->image($_FILES["photo"]);
                    $photo = "uploads/users/" . $filename;
                    $uploadedPhotoPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
                } catch (\RuntimeException $exception) {
                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }
                    $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
                    return;
                }
            }

            $active = isset($data["active"]) && $data["active"] !== "" ? (int) $data["active"] : 1;
            $active = $active === 0 ? 0 : 1;

            $user = new User(
                null,
                $sectorId,
                $classId,
                $data["name"],
                $data["email"],
                $password,
                $photo,
                (string) time(),
                (string) time(),
                $data["enrollment"],
                $data["dateBirth"],
                $active
            );

            if (!$user->insert()) {
                $pdo->rollBack();
                if ($uploadedPhotoPath && is_file($uploadedPhotoPath)) {
                    @unlink($uploadedPhotoPath);
                }

                $this->call(
                    400,
                    "bad_request",
                    $user->getErrorMessage(),
                    "error"
                )->back();
                return;
            }



            $pdo->commit();

            $this->call(
                201,
                "success",
                $isProfessional
                    ? "Profissional cadastrado com sucesso!"
                    : "Usuário cadastrado com sucesso!",
                "success"
            )->back();
        } catch (\Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            if ($uploadedPhotoPath && is_file($uploadedPhotoPath)) {
                @unlink($uploadedPhotoPath);
            }

            error_log("Erro ao cadastrar usuário: " . $exception->getMessage());

            $this->call(
                500,
                "internal_server_error",
                "Não foi possível concluir o cadastro.",
                "error"
            )->back();
        }
    }



    //UPDATE - PUT

    public function update(array $data): void
    {
        // 1. Somente administradores podem editar estudantes.
        if (!$this->authToken('administrador')) {
            $this->call(
                401,
                'unauthorized',
                'Apenas administradores podem editar estudantes.',
                'error'
            )->back();
            return;
        }

        // 2. Valida o ID recebido na URL.
        $id = filter_var(
            $data['user_id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($id === false || $id === null || $id < 1) {
            $this->call(
                400,
                'bad_request',
                'ID do estudante inválido.',
                'error'
            )->back();
            return;
        }

        try {
            $pdo = \Source\Core\Connect::getInstance();

            // Confirma que o administrador continua ativo.
            $adminStmt = $pdo->prepare(
                "SELECT active FROM users
             WHERE id = :id AND enrollment = 'administrador'
             LIMIT 1"
            );
            $adminStmt->execute(['id' => $this->userAuthId]);

            if ((int) $adminStmt->fetchColumn() !== 1) {
                $this->call(
                    403,
                    'forbidden',
                    'Conta administrativa inativa.',
                    'error'
                )->back();
                return;
            }

            // 3. Confirma que o registro pertence a um estudante.
            $stmt = $pdo->prepare(
                'SELECT enrollment FROM users WHERE id = :id LIMIT 1'
            );
            $stmt->execute(['id' => $id]);

            $enrollment = $stmt->fetchColumn();

            if ($enrollment === false) {
                $this->call(
                    404,
                    'not_found',
                    'Estudante não encontrado.',
                    'error'
                )->back();
                return;
            }

            if ($enrollment !== 'estudante') {
                $this->call(
                    403,
                    'forbidden',
                    'Esta operação permite editar somente estudantes.',
                    'error'
                )->back();
                return;
            }

            // Senha, foto, perfil e status não pertencem
            // à atualização dos dados cadastrais.
            foreach (
                [
                    'password',
                    'photo',
                    'active',
                    'enrollment',
                    'sectorId',
                    'sector_id'
                ] as $bloqueado
            ) {
                if (array_key_exists($bloqueado, $data)) {
                    $this->call(
                        400,
                        'bad_request',
                        "O campo {$bloqueado} não pode ser alterado aqui.",
                        'error'
                    )->back();
                    return;
                }
            }

            // 4. Aceita também os nomes vindos do formulário HTML.
            if (isset($data['registration_number'])) {
                $data['registrationNumber'] =
                    $data['registration_number'];
            }

            if (isset($data['class_id'])) {
                $data['classId'] = $data['class_id'];
            }

            if (isset($data['date_birth'])) {
                $data['dateBirth'] = $data['date_birth'];
            }

            // 5. Campos permitidos, setters e limites do banco.
            $campos = [
                'name'               => ['setName', 45],
                'email'              => ['setEmail', 45],
                'registrationNumber' => ['setRegistrationNumber', 30],
                'phone'              => ['setPhone', 20],
                'guardian'           => ['setGuardian', 150],
                'course'             => ['setCourse', 100],
                'shift'              => ['setShift', 30]
            ];

            $user = new User();
            $alterou = false;

            foreach ($campos as $chave => [$setter, $limite]) {
                if (!array_key_exists($chave, $data)) {
                    continue;
                }

                if (!is_string($data[$chave])) {
                    $this->call(
                        400,
                        'bad_request',
                        "Valor inválido para {$chave}.",
                        'error'
                    )->back();
                    return;
                }

                $valor = trim($data[$chave]);

                $tamanho = function_exists('mb_strlen')
                    ? mb_strlen($valor, 'UTF-8')
                    : strlen($valor);

                if (
                    $tamanho > $limite ||
                    (
                        in_array($chave, ['name', 'email'], true)
                        && $valor === ''
                    )
                ) {
                    $this->call(
                        400,
                        'bad_request',
                        "Campo {$chave} vazio ou muito longo.",
                        'error'
                    )->back();
                    return;
                }

                if (
                    $chave === 'email' &&
                    !filter_var($valor, FILTER_VALIDATE_EMAIL)
                ) {
                    $this->call(
                        400,
                        'bad_request',
                        'E-mail inválido.',
                        'error'
                    )->back();
                    return;
                }

                $user->{$setter}($valor);
                $alterou = true;
            }

            // 6. Valida se a turma existe.
            if (array_key_exists('classId', $data)) {
                $classId = filter_var(
                    $data['classId'],
                    FILTER_VALIDATE_INT
                );

                if (
                    $classId === false ||
                    $classId === null ||
                    $classId < 1
                ) {
                    $this->call(
                        400,
                        'bad_request',
                        'Turma inválida.',
                        'error'
                    )->back();
                    return;
                }

                $stmt = $pdo->prepare(
                    'SELECT id FROM classes WHERE id = :id LIMIT 1'
                );
                $stmt->execute(['id' => $classId]);

                if (!$stmt->fetchColumn()) {
                    $this->call(
                        400,
                        'bad_request',
                        'Turma não encontrada.',
                        'error'
                    )->back();
                    return;
                }

                $user->setClassId($classId);
                $alterou = true;
            }

            // 7. Valida a data de nascimento.
            if (array_key_exists('dateBirth', $data)) {
                $nascimento = $data['dateBirth'];

                if (
                    !is_string($nascimento) ||
                    !preg_match(
                        '/^(\d{4})-(\d{2})-(\d{2})$/',
                        $nascimento,
                        $partes
                    ) ||
                    !checkdate(
                        (int) ($partes[2] ?? 0),
                        (int) ($partes[3] ?? 0),
                        (int) ($partes[1] ?? 0)
                    )
                ) {
                    $this->call(
                        400,
                        'bad_request',
                        'Data inválida. Utilize AAAA-MM-DD.',
                        'error'
                    )->back();
                    return;
                }

                $user->setDateBirth($nascimento);
                $alterou = true;
            }

            if (!$alterou) {
                $this->call(
                    400,
                    'bad_request',
                    'Nenhum campo foi informado.',
                    'error'
                )->back();
                return;
            }

            // 8. Verifica e-mail duplicado.
            if (array_key_exists('email', $data)) {
                $stmt = $pdo->prepare(
                    'SELECT id FROM users
                 WHERE email = :email AND id <> :id
                 LIMIT 1'
                );

                $stmt->execute([
                    'email' => $user->getEmail(),
                    'id' => $id
                ]);

                if ($stmt->fetchColumn()) {
                    $this->call(
                        409,
                        'conflict',
                        'Este e-mail já está cadastrado.',
                        'error'
                    )->back();
                    return;
                }
            }

            // 9. Registra a atualização.
            $user->setUpdatedAt(date('Y-m-d H:i:s'));

            if (!$user->updateById($id)) {
                error_log(
                    'Erro ao atualizar estudante: ' .
                        $user->getErrorMessage()
                );

                $this->call(
                    500,
                    'internal_server_error',
                    'Não foi possível atualizar o estudante.',
                    'error'
                )->back();
                return;
            }

            $this->call(
                200,
                'success',
                'Dados do estudante atualizados com sucesso.',
                'success'
            )->back();
        } catch (\Throwable $exception) {
            error_log(
                'Falha na atualização de estudante: ' .
                    $exception->getMessage()
            );

            $this->call(
                500,
                'internal_server_error',
                'Erro ao salvar o estudante.',
                'error'
            )->back();
        }
    }




    //DELETE - DELETE
    public function delete(array $data): void
    {
        if (!$this->authToken('administrador')) {
            $this->call(
                401,
                "unauthorized",
                "Apenas administradores podem realizar esta ação (2).",
                "error"
            )->back();
            return;
        }


        if (
            !isset($data["user_id"]) ||
            empty($data["user_id"]) ||
            !filter_var($data["user_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do usuário é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $user = new User();

        if (!$user->softDeleteById($data["user_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Usuário desativado com sucesso!",
            "success"
        )->back();
    }


    /**
     * Atualiza a foto de um estudante.
     * Somente administradores podem executar.
     */
    public function uploadStudentPhoto(array $data): void
    {
        // 1. Verifica a autenticação.
        if (!$this->authToken('administrador')) {
            $this->call(
                401,
                'unauthorized',
                'Faça login como administrador.',
                'error'
            )->back();
            return;
        }

        // 2. Valida o ID do estudante.
        $id = filter_var(
            $data['user_id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($id === false || $id === null || $id <= 0) {
            $this->call(
                400,
                'bad_request',
                'ID do estudante inválido.',
                'error'
            )->back();
            return;
        }

        // 3. Verifica se a imagem foi enviada.
        if (
            !isset($_FILES['photo']) ||
            !is_array($_FILES['photo'])
        ) {
            $this->call(
                400,
                'bad_request',
                'Selecione uma foto.',
                'error'
            )->back();
            return;
        }

        try {
            $pdo = \Source\Core\Connect::getInstance();

            // Confirma que a conta administrativa está ativa.
            $checkAdmin = $pdo->prepare(
                "SELECT id FROM users
             WHERE id = :id
             AND enrollment = 'administrador'
             AND active = 1
             LIMIT 1"
            );

            $checkAdmin->execute([
                'id' => $this->userAuthId
            ]);

            if (!$checkAdmin->fetchColumn()) {
                $this->call(
                    403,
                    'forbidden',
                    'Administrador sem permissão ativa.',
                    'error'
                )->back();
                return;
            }

            // 4. Localiza o estudante e a foto anterior.
            $checkStudent = $pdo->prepare(
                "SELECT photo FROM users
             WHERE id = :id
             AND enrollment = 'estudante'
             LIMIT 1"
            );

            $checkStudent->execute(['id' => $id]);

            $student = $checkStudent->fetch(
                \PDO::FETCH_ASSOC
            );

            if ($student === false) {
                $this->call(
                    404,
                    'not_found',
                    'Estudante não encontrado.',
                    'error'
                )->back();
                return;
            }

            // 5. Reutiliza a classe Upload do SIAE.
            $directory = dirname(__DIR__, 3)
                . '/uploads/users';

            $uploader = new Upload($directory);

            try {
                // Valida o arquivo e salva a nova imagem.
                $filename = $uploader->image(
                    $_FILES['photo']
                );
            } catch (\RuntimeException $exception) {
                $this->call(
                    400,
                    'bad_request',
                    $exception->getMessage(),
                    'error'
                )->back();
                return;
            }

            $photoPath = 'uploads/users/' . $filename;

            // 6. Atualiza o banco de dados.
            $user = new User();

            if (!$user->updatePhoto($id, $photoPath)) {
                // Evita deixar uma foto sem registro no banco.
                $newFile = $directory . '/' . $filename;

                if (is_file($newFile) && !unlink($newFile)) {
                    error_log(
                        'Falha ao remover foto após erro no banco.'
                    );
                }

                $this->call(
                    500,
                    'internal_server_error',
                    'Não foi possível salvar a foto.',
                    'error'
                )->back();
                return;
            }

            // 7. Remove a foto antiga, quando pertence
            // ao armazenamento gerenciado pelo SIAE.
            $this->deletePreviousPhoto(
                $student['photo'],
                $directory
            );

            // 8. Retorna a URL da imagem atualizada.
            $this->call(
                200,
                'success',
                'Foto do estudante atualizada.',
                'success'
            )->back([
                'photo' => $photoPath,
                'photoUrl' => $this->publicPhotoUrl(
                    $photoPath
                )
            ]);
        } catch (\Throwable $exception) {
            error_log(
                'Erro ao atualizar foto do estudante: '
                    . $exception->getMessage()
            );

            $this->call(
                500,
                'internal_server_error',
                'Erro ao processar a foto.',
                'error'
            )->back();
        }
    }



    public function uploadPhoto(array $data = []): void
    {
        // O usuário só pode atualizar a própria foto e precisa estar autenticado.
        if (!$this->authToken('administrador') && !$this->authToken('profissional')) {
            $this->call(
                401,
                "unauthorized",
                "Usuário não autenticado ou sem permissão para atualizar a foto.",
                "error"
            )->back();
            return;
        }

        if (!isset($_FILES["photo"]) || !is_array($_FILES["photo"])) {
            $this->call(400, "bad_request", "Selecione uma imagem para enviar.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }

        $oldPhoto = $user->getPhoto();
        $uploadDirectory = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "users";
        $uploader = new Upload($uploadDirectory);

        try {
            $filename = $uploader->image($_FILES["photo"]);
        } catch (\RuntimeException $exception) {
            $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
            return;
        } catch (\Throwable $exception) {
            error_log("Erro inesperado ao receber foto do usuário: " . $exception->getMessage());
            $this->call(500, "internal_server_error", "Não foi possível processar a imagem.", "error")->back();
            return;
        }

        $photoPath = "uploads/users/" . $filename;

        if (!$user->updatePhoto($this->userAuthId, $photoPath)) {
            $savedPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
            if (is_file($savedPath) && !unlink($savedPath)) {
                error_log("Não foi possível remover a nova foto após falha ao atualizar o perfil.");
            }

            $this->call(
                500,
                "internal_server_error",
                $user->getErrorMessage() ?? "Não foi possível atualizar a foto.",
                "error"
            )->back();
            return;
        }

        $this->deletePreviousPhoto($oldPhoto, $uploadDirectory);

        $this->call(200, "success", "Foto atualizada com sucesso.", "success")->back([
            "photo" => $photoPath,
            "photoUrl" => $this->publicPhotoUrl($photoPath)
        ]);
    }

    /**
     * Só remove fotos geradas por este sistema; não apaga URLs externas nem arquivos arbitrários.
     */
    private function deletePreviousPhoto(?string $oldPhoto, string $uploadDirectory): void
    {
        if ($oldPhoto === null || trim($oldPhoto) === "") {
            return;
        }

        $path = parse_url($oldPhoto, PHP_URL_PATH);
        if (!is_string($path)) {
            return;
        }

        $normalizedPath = ltrim($path, "/");
        $prefix = "uploads/users/";
        if (!str_starts_with($normalizedPath, $prefix)) {
            return;
        }

        $filename = substr($normalizedPath, strlen($prefix));
        if (!preg_match('/\A[a-f0-9]{32}\.(?:jpg|png|webp)\z/', $filename)) {
            return;
        }

        $oldFilePath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
        if (is_file($oldFilePath) && !unlink($oldFilePath)) {
            error_log("Não foi possível remover a foto antiga do perfil.");
        }
    }

    public function auth(?array $data = null): void
    {

        if (
            !isset($data['email'], $data['password']) ||
            empty($data['email']) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)
        ) {

            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios.",
                "error"
            )->back();
            return;
        }


        $user = new User();
        if (!$user->login($data['email'], $data['password'], 'profissional')) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "photo" => $user->getPhoto(),
            "photoUrl" => $this->publicPhotoUrl($user->getPhoto()),
            "token" => $user->getToken(),
            "enrollment" => $user->getEnrollment(),
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success"
        )->back($response);
    }

    public function authAdmin(array $data): void
    {

        if (
            !isset($data['email'], $data['password']) ||
            empty($data['email']) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)
        ) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error"
            )->back();
            return;
        }

        $user = new User();
        if (!$user->login($data['email'], $data['password'], 'administrador')) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "photo" => $user->getPhoto(),
            "photoUrl" => $this->publicPhotoUrl($user->getPhoto()),
            "token" => $user->getToken(),
            "enrollment" => $user->getEnrollment()
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success"
        )->back($response);
    }
}
