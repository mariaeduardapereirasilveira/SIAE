<?php

namespace Source\Controller;

use Source\Models\Shares\Share;
use Source\Controller\Api;
use Source\Models\Occurrences\Occurrence;
use Source\Models\Users\User;

class Shares extends Api
{
    
    /// HELLO - GET
    public function hello(): void
    {
        echo "HELLO SHARES";
    }

    //LIST ALL - GET
    public function listAll(): void
    {
        $share = new Share();

        $shares = $share->selectAll();

    if (empty($shares)) {
        $this->call(
            404,
            "not_found",
            "Nenhum compartilhamento encontrado",
            "error"
        )->back([]);
        return;
    }

    $this->call(
        200,
        "success",
        "Compartilhamentos encontrados",
        "success"
    )->back($shares);
    }

    //LIST BY ID - GET
    public function listById(array $data): void
    {
    if (
        !isset($data["share_id"]) ||
        empty($data["share_id"]) ||
        !filter_var($data["share_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID do share é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $share = new Share();

    if (!$share->selectById($data["share_id"])) {
        $this->call(
            404,
            "not_found",
            "Compartilhamento não encontrado",
            "error"
        )->back(null);
        return;
    }

    $response = [
    "id" => $share->getId(),
    "occurrenceId" => $share->getOccurrenceId(),
    "userId" => $share->getUserId(),
    "active" => $share->getActive(),
    "createdAt" => $share->getCreatedAt(),
    "updatedAt" => $share->getUpdatedAt()
    ];

    $this->call(
        200,

        "success",
        "Compartilhamento encontrado",
        "success"
    )->back($response);
    }


    //DELETE - PUT
    public function delete(array $data): void
    {
    if (
        !isset($data["share_id"]) ||
        empty($data["share_id"]) ||
        !filter_var($data["share_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID do compartilhamento é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $share = new Share();

    if (!$share->softDeleteById($data["share_id"])) {
        $this->call(
            500,
            "internal_server_error",
            $share->getErrorMessage(),
            "error"
        )->back(null);
        return;
    }

    $this->call(
        200,
        "success",
        "Compartilhamento desativado com sucesso!",
        "success"
    )->back();
    }

    //INSERT - POST
    public function insert(array $data): void
    {


    if (
        !isset($data["occurrence_id"]) ||
        !isset($data["user_id"])
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da ocorrência e ID do usuário são obrigatórios.",
            "error"
        )->back();
        return;
    }

    // Testando se procura a tal ocorrenciia
    $occurrence = new Occurrence();

    if (!$occurrence->selectById($data["occurrence_id"])) {
        $this->call(
            404,
            "not_found",
            "Ocorrência não encontrada.",
            "error"
        )->back();
        return;
    }

    // Aqui eu erifico se o usuário existe
    $user = new User();

    if (!$user->selectById($data["user_id"])) {
        $this->call(
            404,
            "not_found",
            "Usuário não encontrado.",
            "error"
        )->back();
        return;
    }

    $share = new Share(
        null,
        $data["occurrence_id"],
        $data["user_id"],
        1,
        date('Y-m-d H:i:s'),
        date('Y-m-d H:i:s')
    );

    if (!$share->insert()) {
        $this->call(
            500,
            "internal_server_error",
            $share->getErrorMessage(),
            "error"
        )->back();
        return;
    }

    $this->call(
        201,
        "success",
        "Compartilhamento criado com sucesso!",
        "success"
    )->back();
    }   

    //SELECTBYUSER - get
    public function listByUser(array $data): void
{
    if (
        !isset($data["user_id"]) ||
        empty($data["user_id"]) ||
        !filter_var($data["user_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID do usuário é obrigatório e deve ser um número inteiro.",
            "error"
        )->back();
        return;
    }

    $share = new Share();

    $shares = $share->selectByUser($data["user_id"]);

    if (empty($shares)) {
        $this->call(
            404,
            "not_found",
            "Nenhum compartilhamento encontrado para este usuário.",
            "error"
        )->back([]);
        return;
    }

    $this->call(
        200,
        "success",
        "Compartilhamentos encontrados.",
        "success"
    )->back($shares);
}

    //SELECTBYOCCURRENCE - get
    public function listByOccurrence(array $data): void
{
    if (
        !isset($data["occurrence_id"]) ||
        empty($data["occurrence_id"]) ||
        !filter_var($data["occurrence_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da ocorrência é obrigatório e deve ser um número inteiro.",
            "error"
        )->back();
        return;
    }

    $share = new Share();

    $shares = $share->selectByOccurrence($data["occurrence_id"]);

    if (empty($shares)) {
        $this->call(
            404,
            "not_found",
            "Nenhum compartilhamento encontrado para esta ocorrência.",
            "error"
        )->back([]);
        return;
    }

    $this->call(
        200,
        "success",
        "Compartilhamentos encontrados.",
        "success"
    )->back($shares);
}
}