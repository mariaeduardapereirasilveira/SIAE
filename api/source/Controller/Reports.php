<?php

namespace Source\Controller;

use Source\Models\Reports\Report;
use Source\Controller\Api;

class Reports extends Api
{
    public function hello(): void
    {
        echo "HELLO REPORTS";
    }

    // LIST ALL - GET
    public function listAll(): void
    {
        $report = new Report();
        $reports = $report->selectAll();

        if (empty($reports)) {
            $this->call(
                404,
                "not_found",
                "Nenhum relatório encontrado",
                "error"
            )->back([]);
            return;
        }

        $this->call(
            200,
            "success",
            "Relatórios encontrados",
            "success"
        )->back($reports);
    }

    // LIST BY ID - GET
    public function listById(array $data): void
    {
        if (
            !isset($data["report_id"]) ||
            empty($data["report_id"]) ||
            !filter_var($data["report_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do relatório é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $report = new Report();

        if (!$report->selectById((int)$data["report_id"])) {
            $this->call(
                404,
                "not_found",
                "Relatório não encontrado",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $report->getId(),
            "userId" => $report->getUserId(),
            "title" => $report->getTitle(),
            "description" => $report->getContent(),
            "createdAt" => $report->getCreatedAt(),
            "updatedAt" => $report->getUpdatedAt(),
            "active" => $report->getActive()
        ];

        $this->call(
            200,
            "success",
            "Relatório encontrado",
            "success"
        )->back($response);
    }

    // INSERT - POST
    public function insert(array $data): void
    {
       

        $report = new Report(
            null,
            $data["user_id"],
            $data["title"] ?? null,
            $data["content"] ?? null,
            date("Y-m-d H:i:s"),
            date("Y-m-d H:i:s"),
            1
        );

        if (!$report->insert()) {
            $this->call(
                500,
                "internal_server_error",
                $report->getErrorMessage(),
                "error"
            )->back();
            return;
        }

        $this->call(
            201,
            "success",
            "Relatório cadastrado com sucesso!",
            "success"
        )->back();
    }

    // UPDATE - PUT
    public function update(array $data): void
    {
      
        if (
            !isset($data["report_id"]) ||
            empty($data["report_id"]) ||
            !filter_var($data["report_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do relatório é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $report = new Report();

        if (isset($data["title"])) {
            $report->setTitle($data["title"]);
        }

        if (isset($data["content"])) {
            $report->setContent($data["content"]);
        }


        if (isset($data["user_id"])) {
            $report->setUserId((int)$data["user_id"]);
        }


      

        $hasFieldsToUpdate =
            isset($data["user_id"]) ||
            isset($data["title"]) ||
            isset($data["content"]); 
        if (!$hasFieldsToUpdate) {
            $this->call(
                400,
                "bad_request",
                "Nenhum campo para atualização foi informado.",
                "error"
            )->back(null);
            return;
        }

        $report->setUpdatedAt(date("Y-m-d H:i:s"));

        if (!$report->updateById((int)$data["report_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $report->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Relatório atualizado com sucesso!",
            "success"
        )->back();
    }

    // DELETE - DELETE
    public function delete(array $data): void
    {
        if (
            !isset($data["report_id"]) ||
            empty($data["report_id"]) ||
            !filter_var($data["report_id"], FILTER_VALIDATE_INT)
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do relatório é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $report = new Report();

        if (!$report->softDeleteById((int)$data["report_id"])) {
            $this->call(
                500,
                "internal_server_error",
                $report->getErrorMessage(),
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Relatório desativado com sucesso!",
            "success"
        )->back();
    }
}