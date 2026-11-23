<?php

namespace Source\Controller;

use Source\Models\Sectors\Sector;
use Source\Controller\Api;

class Sectors extends Api
{
    private function authorizeReader(): bool
    {
        if ($this->authToken('administrador') || $this->authToken('profissional')) {
            return true;
        }

        $this->call(401, "unauthorized", "Sessão inválida ou sem permissão para consultar os setores.", "error")->back([]);
        return false;
    }

   
/**
 * Autoriza ações administrativas nos setores.
 *
 * Verifica:
 * - Se o token pertence a um administrador;
 * - Se o administrador continua ativo no banco.
 */
private function authorizeAdministrator(): bool
{
    // 1. Verifica o perfil informado pelo token.
    if (!$this->authToken("administrador")) {
        $this->call(
            403,
            "forbidden",
            "Apenas administradores podem gerenciar os setores.",
            "error"
        )->back();

        return false;
    }

    try {
        // 2. Consulta a situação atual do administrador.
        $pdo = \Source\Core\Connect::getInstance();

        $stmt = $pdo->prepare(
            "SELECT id
             FROM users
             WHERE id = :id
               AND enrollment = 'administrador'
               AND active = 1
             LIMIT 1"
        );

        $stmt->execute([
            "id" => $this->userAuthId
        ]);

        // 3. Impede ações com uma conta desativada.
        if (!$stmt->fetchColumn()) {
            $this->call(
                403,
                "forbidden",
                "Sua conta administrativa está inativa.",
                "error"
            )->back();

            return false;
        }

        return true;

    } catch (\Throwable $exception) {
        error_log(
            "[SIAE - Sectors::authorizeAdministrator] "
            . $exception->getMessage()
        );

        $this->call(
            500,
            "internal_server_error",
            "Não foi possível verificar suas permissões.",
            "error"
        )->back();

        return false;
    }
}


    public function hello(): void
    {
        echo "HELLO SECTORS";
    }

    // LIST ALL - GET
    public function listAll(): void
    {
        if (!$this->authorizeReader()) {
            return;
        }

        $sector = new Sector();
        $sectors = $sector->selectAll(["active = 1"]);


if (empty($sectors)) {
    $this->call(
        200,
        "success",
        "Nenhum setor ativo cadastrado.",
        "success"
    )->back([]);

    return;
}


        $this->call(
            200,
            "success",
            "Setores encontrados",
            "success"
        )->back($sectors);
    }




/**
 * Lista todos os setores para a gestão administrativa.
 *
 * Inclui:
 * - Setores ativos e desativados;
 * - Total de profissionais por setor;
 * - Profissionais ativos e inativos.
 *
 * Não altera a listagem pública já utilizada
 * pelos formulários do SIAE.
 */
public function listManagement(): void
{
    // Apenas administradores podem acessar a gestão completa.
    if (!$this->authorizeAdministrator()) {
        return;
    }

    try {
        $pdo = \Source\Core\Connect::getInstance();

        // Busca os setores e conta seus profissionais.
        // O LEFT JOIN também retorna setores sem profissionais.
        $stmt = $pdo->prepare(
            "SELECT
                s.id,
                s.name,
                s.description,
                s.active,

                COUNT(u.id) AS professionalsTotal,

                COUNT(
                    CASE
                        WHEN u.active = 1 THEN 1
                    END
                ) AS professionalsActive,

                COUNT(
                    CASE
                        WHEN u.active = 0 THEN 1
                    END
                ) AS professionalsInactive

             FROM sectors s

             LEFT JOIN users u
                ON u.sector_id = s.id
                AND u.enrollment = 'profissional'

             GROUP BY
                s.id,
                s.name,
                s.description,
                s.active

             ORDER BY
                s.active DESC,
                s.name ASC"
        );

        $stmt->execute();

        $sectors = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Converte números para o formato correto no JSON.
        foreach ($sectors as &$sector) {
            $sector["id"] = (int) $sector["id"];
            $sector["active"] = (int) $sector["active"];

            $sector["professionalsTotal"] =
                (int) $sector["professionalsTotal"];

            $sector["professionalsActive"] =
                (int) $sector["professionalsActive"];

            $sector["professionalsInactive"] =
                (int) $sector["professionalsInactive"];
        }

        unset($sector);

        // Mesmo sem setores, retorna uma lista vazia.
        $this->call(
            200,
            "success",
            "Setores administrativos carregados com sucesso.",
            "success"
        )->back($sectors);

    } catch (\Throwable $exception) {

        error_log(
            "[SIAE - Sectors::listManagement] "
            . $exception->getMessage()
        );

        $this->call(
            500,
            "internal_server_error",
            "Não foi possível carregar a gestão de setores.",
            "error"
        )->back();
    }
}



    // LIST BY ID - GET
    public function listById(array $data): void
    {
        if (!$this->authorizeReader()) {
            return;
        }

        if (
            !isset($data["sector_id"]) ||
            empty($data["sector_id"]) ||
            !filter_var($data["sector_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do setor é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $sector = new Sector();

        if (!$sector->selectById((int)$data["sector_id"])) {
            $this->call(
                404,
                "not_found",
                "Setor não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $sector->getId(),
            "name" => $sector->getName(),
            "description" => $sector->getDescription()
        ];

        $this->call(
            200,
            "success",
            "Setor encontrado",
            "success"
        )->back($response);
    }

 
    // INSERT - POST
    public function insert(array $data): void
    {
        if (!$this->authorizeAdministrator()) {
            return;
        }

       

        $sectors = new Sector(
            null,
            $data["name"] ?? null,
            $data["description"] ?? null,
            date("Y-m-d H:i:s"),
            date("Y-m-d H:i:s"),
            1
        );

        if (!$sectors->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $sectors->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $this->call(
            201,
            "success",
            "Setor cadastrado com sucesso!",
            "success"
        )->back();
    }

    // UPDATE - PUT
    public function update(array $data): void
    {
        if (!$this->authorizeAdministrator()) {
            return;
        }

      
        if (
            !isset($data["sector_id"]) ||
            empty($data["sector_id"]) ||
            !filter_var($data["sector_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do setor é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $sector = new Sector();

        if (isset($data["name"])) {
            $sector->setName($data["name"]);
        }

        if (isset($data["description"])) {
            $sector->setDescription($data["description"]);
        }

       

        $hasFieldsToUpdate =
            isset($data["name"]) ||
            isset($data["description"]);

        if (!$hasFieldsToUpdate) {
            $this->call(
                400,
                "bad_request",
                "Nenhum campo para atualização foi informado.",
                "error"
            )->back(null);
            return;
        }

        $sector->setUpdatedAt(date("Y-m-d H:i:s"));

        if (!$sector->updateById((int)$data["sector_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $sector->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Setor atualizado com sucesso!",
            "success"
        )->back();
    }

    // DELETE - DELETE
    
/**
 * Desativa um setor sem excluir seus dados.
 *
 * Regras:
 * - Somente administradores podem desativar.
 * - O setor precisa existir e estar ativo.
 * - Não pode possuir profissionais vinculados.
 * - Profissionais inativos também contam como vínculos.
 */
public function delete(array $data): void
{
    // 1. Verifica a permissão do administrador.
    if (!$this->authorizeAdministrator()) {
        return;
    }

    // 2. Valida o identificador do setor.
    $sectorId = filter_var(
        $data["sector_id"] ?? null,
        FILTER_VALIDATE_INT
    );

    if (!$sectorId || $sectorId <= 0) {
        $this->call(
            400,
            "bad_request",
            "ID do setor inválido.",
            "error"
        )->back();

        return;
    }

    $pdo = \Source\Core\Connect::getInstance();

    try {
        // 3. Inicia a transação.
        $pdo->beginTransaction();

        // 4. Localiza e bloqueia o registro do setor
        // durante a operação.
        $stmt = $pdo->prepare(
            "SELECT id, active
             FROM sectors
             WHERE id = :id
             LIMIT 1
             FOR UPDATE"
        );

        $stmt->execute([
            "id" => $sectorId
        ]);

        $sector = $stmt->fetch(\PDO::FETCH_ASSOC);

        // 5. Verifica se o setor existe.
        if (!$sector) {
            $pdo->rollBack();

            $this->call(
                404,
                "not_found",
                "Setor não encontrado.",
                "error"
            )->back();

            return;
        }

        // 6. Impede desativar um setor já inativo.
        if ((int) $sector["active"] === 0) {
            $pdo->rollBack();

            $this->call(
                409,
                "conflict",
                "Este setor já está desativado.",
                "error"
            )->back();

            return;
        }

        // 7. Conta TODOS os profissionais vinculados.
        // Inclui profissionais ativos e inativos.
        $stmt = $pdo->prepare(
            "SELECT COUNT(*)
             FROM users
             WHERE sector_id = :sector_id
               AND enrollment = 'profissional'"
        );

        $stmt->execute([
            "sector_id" => $sectorId
        ]);

        $totalProfissionais = (int) $stmt->fetchColumn();

        // 8. Bloqueia a operação caso existam vínculos.
        if ($totalProfissionais > 0) {
            $pdo->rollBack();

            $this->call(
                409,
                "conflict",
                "Não é possível desativar este setor. "
                . "Existem {$totalProfissionais} profissionais vinculados. "
                . "Transfira-os para outro setor primeiro.",
                "error"
            )->back();

            return;
        }

        // 9. Desativa o setor sem excluir o registro.
        $stmt = $pdo->prepare(
            "UPDATE sectors
             SET active = 0,
                 updated_at = NOW()
             WHERE id = :id
               AND active = 1"
        );

        $stmt->execute([
            "id" => $sectorId
        ]);

        if ($stmt->rowCount() !== 1) {
            throw new \RuntimeException(
                "Não foi possível atualizar o status do setor."
            );
        }

        // 10. Confirma a operação.
        $pdo->commit();

        $this->call(
            200,
            "success",
            "Setor desativado com sucesso!",
            "success"
        )->back();

    } catch (\Throwable $exception) {

        // Desfaz a operação em caso de erro.
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        // Registra o erro no servidor.
        error_log(
            "[SIAE - Sectors::delete] "
            . $exception->getMessage()
        );

        $this->call(
            500,
            "internal_server_error",
            "Não foi possível desativar o setor.",
            "error"
        )->back();
    }
}



/**
 * Reativa um setor anteriormente desativado.
 *
 * Regras:
 * - Somente administradores podem reativar setores.
 * - O setor precisa existir.
 * - Não altera profissionais ou outros dados do setor.
 */
public function reactivate(array $data): void
{
    // 1. Verifica se o usuário é administrador.
    if (!$this->authorizeAdministrator()) {
        return;
    }

    // 2. Valida o ID recebido pela URL.
    $sectorId = filter_var(
        $data["sector_id"] ?? null,
        FILTER_VALIDATE_INT
    );

    if (!$sectorId || $sectorId <= 0) {
        $this->call(
            400,
            "bad_request",
            "ID do setor inválido.",
            "error"
        )->back();

        return;
    }

    $pdo = \Source\Core\Connect::getInstance();

    try {
        // 3. Inicia a transação.
        $pdo->beginTransaction();

        // 4. Localiza o setor e bloqueia o registro
        // durante a alteração.
        $stmt = $pdo->prepare(
            "SELECT id, active
             FROM sectors
             WHERE id = :id
             LIMIT 1
             FOR UPDATE"
        );

        $stmt->execute([
            "id" => $sectorId
        ]);

        $sector = $stmt->fetch(\PDO::FETCH_ASSOC);

        // 5. Confirma que o setor existe.
        if (!$sector) {
            $pdo->rollBack();

            $this->call(
                404,
                "not_found",
                "Setor não encontrado.",
                "error"
            )->back();

            return;
        }

        // 6. Verifica se o setor já está ativo.
        if ((int) $sector["active"] === 1) {
            $pdo->rollBack();

            $this->call(
                200,
                "success",
                "Este setor já está ativo.",
                "success"
            )->back();

            return;
        }

        // 7. Reativa o setor.
        $stmt = $pdo->prepare(
            "UPDATE sectors
             SET active = 1,
                 updated_at = NOW()
             WHERE id = :id
               AND active = 0"
        );

        $stmt->execute([
            "id" => $sectorId
        ]);

        if ($stmt->rowCount() !== 1) {
            throw new \RuntimeException(
                "Não foi possível atualizar o status do setor."
            );
        }

        // 8. Confirma a reativação.
        $pdo->commit();

        $this->call(
            200,
            "success",
            "Setor reativado com sucesso!",
            "success"
        )->back();

    } catch (\Throwable $exception) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        error_log(
            "[SIAE - Sectors::reactivate] "
            . $exception->getMessage()
        );

        $this->call(
            500,
            "internal_server_error",
            "Não foi possível reativar o setor.",
            "error"
        )->back();
    }
}

}