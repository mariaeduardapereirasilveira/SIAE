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
        $occurrence = new Occurrence();
        $occurrences = $occurrence->selectAll();

        if (empty($occurrences)) {
            $this->call(
                404,
                "not_found",
                "Nenhuma ocorrência encontrada",
                "error"
            )->back([]);
            return;
        }

        $this->call(
            200,
            "success",
            "Ocorrências encontradas",
            "success"
        )->back($occurrences);
    }

    // LIST BY ID - GET
    public function listById(array $data): void
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

        if (!$occurrence->selectById((int)$data["occurrence_id"])) {
            $this->call(
                404,
                "not_found",
                "Ocorrência não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $occurrence->getId(),
            "servicesId" => $occurrence->getServicesId(),
            "sectorsId" => $occurrence->getSectorsId(),
            "userId" => $occurrence->getUserId(),
            "studentsId" => $occurrence->getStudentId(),
            "title" => $occurrence->getTitle(),
            "description" => $occurrence->getDescription(),
            "status" => $occurrence->getStatus(),
            "secrecyLevel" => $occurrence->getSecrecyLevel(),
            "createdAt" => $occurrence->getCreatedAt(),
            "updatedAt" => $occurrence->getUpdatedAt(),
            "active" => $occurrence->getActive(),
            "class" => $occurrence->getClass()
        ];

        $this->call(
            200,
            "success",
            "Ocorrência encontrada",
            "success"
        )->back($response);
    }

    // INSERT - POST
    public function insert(array $data): void
    {
       

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
        )->back();
    }

    // UPDATE - PUT
    public function update(array $data): void
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

        if (isset($data["servicesId"])) {
            $occurrence->setServicesId((int)$data["servicesId"]);
        }

        if (isset($data["sectorsId"])) {
            $occurrence->setSectorsId((int)$data["sectorsId"]);
        }

        if (isset($data["userId"])) {
            $occurrence->setUserId((int)$data["userId"]);
        }

        if (isset($data["studentsId"])) {
            $occurrence->setStudentsId((int)$data["studentsId"]);
        }

        if (isset($data["title"])) {
            $occurrence->setTitle($data["title"]);
        }

        if (isset($data["description"])) {
            $occurrence->setDescription($data["description"]);
        }

        if (isset($data["status"])) {
            $occurrence->setStatus($data["status"]);
        }

        if (isset($data["secrecyLevel"])) {
            $occurrence->setSecrecyLevel($data["secrecyLevel"]);
        }

        if (isset($data["class"])) {
            $occurrence->setClass($data["class"]);
        }

        $hasFieldsToUpdate =
            isset($data["servicesId"]) ||
            isset($data["sectorsId"]) ||
            isset($data["userId"]) ||
            isset($data["studentsId"]) ||
            isset($data["title"]) ||
            isset($data["description"]) ||
            isset($data["status"]) ||
            isset($data["secrecyLevel"]) ||
            isset($data["class"]);

        if (!$hasFieldsToUpdate) {
            $this->call(
                400,
                "bad_request",
                "Nenhum campo para atualização foi informado.",
                "error"
            )->back(null);
            return;
        }

        $occurrence->setUpdatedAt(date("Y-m-d H:i:s"));

        if (!$occurrence->updateById((int)$data["occurrence_id"])) {
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
            "Ocorrência atualizada com sucesso!",
            "success"
        )->back();
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