<?php

namespace Source\Controller;

use Source\Models\Services\Service;
use Source\Controller\Api;

class Services extends Api
{
    public function hello(): void
    {
        echo "HELLO SERVICES";
    }

    // LIST ALL - GET
    public function listAll(): void
    {
        $service = new Service();
        $services = $service->selectAll();

        if (empty($services)) {
            $this->call(
                404,
                "not_found",
                "Nenhum serviço encontrado",
                "error"
            )->back([]);
            return;
        }

        $this->call(
            200,
            "success",
            "Serviços encontrados",
            "success"
        )->back($services);
    }

    // LIST BY ID - GET
    public function listById(array $data): void
    {
        if (
            !isset($data["service_id"]) ||
            empty($data["service_id"]) ||
            !filter_var($data["service_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do serviço é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $service = new Service();

        if (!$service->selectById((int)$data["service_id"])) {
            $this->call(
                404,
                "not_found",
                "Serviço não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $service->getId(),
            "userId" => $service->getUserId(),
            "studentsId" => $service->getStudentsId(),
            "observations" => $service->getObservations(),
            "createdAt" => $service->getCreatedAt(),
            "updatedAt" => $service->getUpdatedAt(),
            "active" => $service->getActive()
        ];

        $this->call(
            200,
            "success",
            "Serviço encontrado",
            "success"
        )->back($response);
           
    }

    // INSERT - POST
    public function insert(array $data): void
    {
       

        $service = new Service(
            null,
            $data["user_id"],
            $data["students_id"],
            $data["observations"] ?? null,
            date("Y-m-d H:i:s"),
            date("Y-m-d H:i:s"),
            1
        );

        if (!$service->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $service->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $this->call(
            201,
            "success",
            "Serviço cadastrado com sucesso!",
            "success"
        )->back();
    }

    // UPDATE - PUT
    public function update(array $data): void
    {
      
        if (
            !isset($data["service_id"]) ||
            empty($data["service_id"]) ||
            !filter_var($data["service_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do serviço é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $service = new Service();

        if (isset($data["user_id"])) {
            $service->setUserId((int)$data["user_id"]);
        }

        if (isset($data["students_id"])) {
            $service->setStudentId($data["students_id"]);
        }

        if (isset($data["observations"])) {
            $service->setObservations($data["observations"]);
        }

       

        $hasFieldsToUpdate =
            isset($data["user_id"]) ||
            isset($data["students_id"]) ||
            isset($data["observations"])||
            isset($data["active"]);

        if (!$hasFieldsToUpdate) {
            $this->call(
                400,
                "bad_request",
                "Nenhum campo para atualização foi informado.",
                "error"
            )->back(null);
            return;
        }

        $service->setUpdatedAt(date("Y-m-d H:i:s"));

        if (!$service->updateById($data["service_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $service->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Serviço atualizado com sucesso!",
            "success"
        )->back();
    }

    // DELETE - DELETE
    public function delete(array $data): void
    {
        if (
            !isset($data["service_id"]) ||
            empty($data["service_id"]) ||
            !filter_var($data["service_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do serviço é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $service = new Service();

        if (!$service->softDeleteById((int)$data["service_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $service->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Serviço desativado com sucesso!",
            "success"
        )->back();
    }
}