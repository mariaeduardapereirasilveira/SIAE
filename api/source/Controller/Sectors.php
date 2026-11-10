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

    private function authorizeAdministrator(): bool
    {
        if ($this->authToken('administrador')) {
            return true;
        }

        $this->call(403, "forbidden", "Apenas administradores podem gerenciar os setores.", "error")->back([]);
        return false;
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
                404,
                "not_found",
                "Nenhum setor encontrado",
                "error"
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
    public function delete(array $data): void
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

        if (!$sector->softDeleteById((int)$data["sector_id"])) {
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
            "Setor desativado com sucesso!",
            "success"
        )->back();
    }
}