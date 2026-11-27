<?php

namespace Source\Controller;

use Source\Models\Occurrences\Occurrence;
use Source\Controller\Api;

class Occurrences extends Api
{
    public function hello(): void
    {
        echo "HELLO OCCURRENCES";
    }

    // LIST ALL - GET
    public function listAll(): void
    {
        $isAdministrator = $this->authToken('administrador');
        $isProfessional = $this->authToken('profissional');

        if (!$isAdministrator && !$isProfessional) {
            $this->call(401, "unauthorized", "Sessão inválida ou sem permissão para consultar ocorrências.", "error")->back([]);
            return;
        }

        try {
            $pdo = \Source\Core\Connect::getInstance();
            if ($isAdministrator) {
                $stmt = $pdo->query(
                    "SELECT * FROM occurrences WHERE active = 1 ORDER BY created_at DESC, id DESC"
                );
            } else {
                $stmt = $pdo->prepare(
                    "SELECT DISTINCT o.*
                     FROM occurrences o
                     LEFT JOIN shares sh
                       ON sh.occurrence_id = o.id AND sh.user_id = :shared_user_id AND sh.active = 1
                     WHERE o.active = 1
                       AND (
                         o.user_id = :owner_user_id
                         OR sh.id IS NOT NULL
                         OR o.secrecy_level = 'Todas as entidades'
                       )
                     ORDER BY o.created_at DESC, o.id DESC"
                );
                $stmt->execute([
                    "shared_user_id" => $this->userAuthId,
                    "owner_user_id" => $this->userAuthId
                ]);
            }

            
/*
 * Recupera as ocorrências que o usuário
 * autenticado está autorizado a consultar.
 *
 * Uma lista vazia é um resultado válido,
 * não um erro de requisição.
 */
$occurrences = $stmt->fetchAll(\PDO::FETCH_ASSOC);

// Retorna os registros encontrados ou um array vazio.
$this->call(
    200,
    "success",
    empty($occurrences)
        ? "Nenhuma ocorrência disponível."
        : "Ocorrências encontradas.",
    "success"
)->back($occurrences);

        } catch (\Throwable $exception) {
            error_log("Erro ao listar ocorrências: " . $exception->getMessage());
            $this->call(500, "internal_server_error", "Não foi possível carregar as ocorrências.", "error"
            )->back([]);
        }
    }

    // LIST BY ID - GET
    
/**
 * Consulta uma ocorrência pelo ID.
 *
 * Administradores podem consultar os registros.
 *
 * Profissionais podem consultar ocorrências:
 * - Criadas por eles;
 * - Compartilhadas diretamente com eles;
 * - Classificadas para todas as entidades.
 */
public function listById(array $data): void
{
    // 1. Verifica a autenticação.
    $isAdministrator = $this->authToken("administrador");
    $isProfessional = $this->authToken("profissional");

    if (!$isAdministrator && !$isProfessional) {
        $this->call(
            401,
            "unauthorized",
            "Sessão inválida ou sem permissão.",
            "error"
        )->back();

        return;
    }

    // 2. Valida o ID solicitado.
    $occurrenceId = filter_var(
        $data["occurrence_id"] ?? null,
        FILTER_VALIDATE_INT
    );

    if (!$occurrenceId || $occurrenceId <= 0) {
        $this->call(
            400,
            "bad_request",
            "ID da ocorrência inválido.",
            "error"
        )->back();

        return;
    }

    try {
        $pdo = \Source\Core\Connect::getInstance();

        // 3. Consulta somente ocorrências ativas.
        $sql = "
            SELECT o.*
            FROM occurrences o
            WHERE o.id = :occurrence_id
              AND o.active = 1
        ";

        $params = [
            "occurrence_id" => $occurrenceId
        ];

        // 4. Aplica as regras de acesso dos profissionais.
        if (!$isAdministrator) {

            $sql .= "
                AND (
                    o.user_id = :owner_id

                    OR o.secrecy_level = 'Todas as entidades'

                    OR EXISTS (
                        SELECT 1
                        FROM shares sh
                        WHERE sh.occurrence_id = o.id
                          AND sh.user_id = :recipient_id
                          AND sh.active = 1
                    )
                )
            ";

            $params["owner_id"] = $this->userAuthId;
            $params["recipient_id"] = $this->userAuthId;
        }

        $sql .= " LIMIT 1";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $occurrence = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Não revela se um registro restrito existe.
        if (!$occurrence) {
            $this->call(
                404,
                "not_found",
                "Ocorrência não encontrada ou indisponível.",
                "error"
            )->back();

            return;
        }

        // 5. Retorna os dados autorizados.
        $response = [
            "id" => (int) $occurrence["id"],
            "servicesId" => (int) $occurrence["service_id"],
            "sectorsId" => (int) $occurrence["sector_id"],
            "userId" => (int) $occurrence["user_id"],
            "studentsId" => (int) $occurrence["student_id"],
            "title" => $occurrence["title"],
            "description" => $occurrence["description"],
            "status" => $occurrence["status"],
            "secrecyLevel" => $occurrence["secrecy_level"],
            "createdAt" => $occurrence["created_at"],
            "updatedAt" => $occurrence["updated_at"],
            "active" => (int) $occurrence["active"],
            "class" => $occurrence["class"]
        ];

        $this->call(
            200,
            "success",
            "Ocorrência encontrada.",
            "success"
        )->back($response);

    } catch (\Throwable $exception) {

        error_log(
            "[SIAE - Occurrences::listById] "
            . $exception->getMessage()
        );

        $this->call(
            500,
            "internal_server_error",
            "Não foi possível consultar a ocorrência.",
            "error"
        )->back();
    }
}

    // INSERT - POST
    public function insert(array $data): void
    {
        $isAdministrator = $this->authToken('administrador');
        $isProfessional = $this->authToken('profissional');
        if (!$isAdministrator && !$isProfessional) {
            $this->call(401, "unauthorized", "Sessão inválida ou sem permissão para registrar ocorrências.", "error")->back();
            return;
        }
        // O responsável é sempre o usuário identificado pelo token.
        $data["user_id"] = $this->userAuthId;

       

        $occurrence = new Occurrence(
            null,
            $data["services_id"] ?? null,
            $data["sectors_id"] ?? null,
            $data["user_id"] ?? null,
            $data["student_id"] ?? null,
            $data["title"] ?? null,
            $data["description"] ?? null,
            $data["status"] ?? null,
            $data["secrecy_level"] ?? null,
            date("Y-m-d H:i:s"),
            date("Y-m-d H:i:s"),
            1,
            $data["class"] ?? null
        );

        if (!$occurrence->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $occurrence->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $this->call(
            201,
            "success",
            "Ocorrência cadastrada com sucesso!",
            "success"
        )->back(["id" => $occurrence->getId()]);
    }

    // UPDATE - PUT
    
/**
 * Altera a situação de uma ocorrência.
 *
 * Nesta etapa:
 * - Administradores ativos podem alterar.
 * - O profissional autor pode alterar.
 * - Destinatários não recebem essa permissão
 *   automaticamente pelo compartilhamento.
 *
 * A edição dos demais campos será tratada
 * separadamente, com permissões específicas.
 */
public function update(array $data): void
{
    // 1. Verifica a autenticação.
    $isAdministrator = $this->authToken("administrador");
    $isProfessional = $this->authToken("profissional");

    if (!$isAdministrator && !$isProfessional) {
        $this->call(
            401,
            "unauthorized",
            "Sessão inválida ou sem permissão.",
            "error"
        )->back();
        return;
    }

    // 2. Valida o ID da ocorrência.
    $occurrenceId = filter_var(
        $data["occurrence_id"] ?? null,
        FILTER_VALIDATE_INT
    );

    if (!$occurrenceId || $occurrenceId <= 0) {
        $this->call(
            400,
            "bad_request",
            "ID da ocorrência inválido.",
            "error"
        )->back();
        return;
    }

    // 3. Recupera os dados de uma requisição PUT.
    $contentType = $_SERVER["CONTENT_TYPE"] ?? "";

    if (stripos($contentType, "application/x-www-form-urlencoded") !== false) {
        parse_str(file_get_contents("php://input"), $body);
        $data = array_merge($body, $data);
    } elseif (stripos($contentType, "application/json") !== false) {
        $body = json_decode(file_get_contents("php://input"), true);

        if (is_array($body)) {
            $data = array_merge($body, $data);
        }
    }

    // 4. Aceita somente situações definidas no banco.
    $status = trim((string) ($data["status"] ?? ""));

    $allowedStatuses = [
        "Ativo",
        "Interrompido",
        "Encerrado"
    ];

    if (!in_array($status, $allowedStatuses, true)) {
        $this->call(
            400,
            "bad_request",
            "Situação inválida para a ocorrência.",
            "error"
        )->back();
        return;
    }

    try {
        $pdo = \Source\Core\Connect::getInstance();

        // 5. Confirma que a conta autenticada está ativa.
        $stmt = $pdo->prepare(
            "SELECT id
             FROM users
             WHERE id = :id
               AND active = 1
             LIMIT 1"
        );

        $stmt->execute([
            "id" => $this->userAuthId
        ]);

        if (!$stmt->fetchColumn()) {
            $this->call(
                403,
                "forbidden",
                "Sua conta não possui permissão ativa.",
                "error"
            )->back();
            return;
        }

        // 6. Localiza a ocorrência.
        $stmt = $pdo->prepare(
            "SELECT user_id, status
             FROM occurrences
             WHERE id = :id
               AND active = 1
             LIMIT 1"
        );

        $stmt->execute([
            "id" => $occurrenceId
        ]);

        $occurrence = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$occurrence) {
            $this->call(
                404,
                "not_found",
                "Ocorrência não encontrada.",
                "error"
            )->back();
            return;
        }

        // 7. Somente o autor ou administrador pode alterar.
        $isOwner = (int) $occurrence["user_id"]
            === (int) $this->userAuthId;

        if (!$isAdministrator && !$isOwner) {
            $this->call(
                403,
                "forbidden",
                "Você não possui permissão para alterar esta ocorrência.",
                "error"
            )->back();
            return;
        }

        // 8. Evita alterações desnecessárias.
        if ($occurrence["status"] === $status) {
            $this->call(
                200,
                "success",
                "A ocorrência já possui esta situação.",
                "success"
            )->back();
            return;
        }

        // 9. Atualiza somente a situação.
        $stmt = $pdo->prepare(
            "UPDATE occurrences
             SET status = :status,
                 updated_at = NOW()
             WHERE id = :id
               AND active = 1"
        );

        $stmt->execute([
            "status" => $status,
            "id" => $occurrenceId
        ]);

        // 10. Confirma a alteração.
        $this->call(
            200,
            "success",
            "Situação da ocorrência atualizada com sucesso!",
            "success"
        )->back();

    } catch (\Throwable $exception) {
        error_log(
            "[SIAE - Occurrences::update] "
            . $exception->getMessage()
        );

        $this->call(
            500,
            "internal_server_error",
            "Não foi possível atualizar a ocorrência.",
            "error"
        )->back();
    }
}

    // DELETE - DELETE
    public function delete(array $data): void
    {
        if (
            !isset($data["occurrence_id"]) ||
            empty($data["occurrence_id"]) ||
            !filter_var($data["occurrence_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID da ocorrência é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $occurrence = new Occurrence();

        if (!$occurrence->softDeleteById((int)$data["occurrence_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $occurrence->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Ocorrência desativada com sucesso!",
            "success"
        )->back();
    }
}