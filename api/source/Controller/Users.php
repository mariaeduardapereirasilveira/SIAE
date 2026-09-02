<?php

namespace Source\Controller;

use Source\Models\Users\User;
use Source\Controller\Api;

class Users extends Api {

    public function hello(): void 
    {
    echo "HELLO USERS";
    }


    //LIST ALL - GET
    public function listAll(): void
    {
        $user = new User();

        $users = $user->selectAll();

    if (empty($users)) {
        $this->call(
            404,
            "not_found",
            "Nenhum usuário encontrado",
            "error"
        )->back([]);
        return;
    }

    $this->call(
        200,
        "success",
        "Usuários encontrados",
        "success"
    )->back($users);
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
        if(!$this->authToken('administrador')) {
    $this->call(
        401,
        "unauthorized",
        "Apenas administradores podem realizar esta ação.",
        "error"
    )->back();
    return;
}


    if (
        !isset($data["sector_id"]) ||
        empty($data["sector_id"]) ||
        !isset($data["name"]) ||
        empty($data["name"]) ||
        !isset($data["email"]) ||
        empty($data["email"]) ||
        !isset($data["password"]) ||
        empty($data["password"]) ||
        !isset($data["enrollment"]) ||
        empty($data["enrollment"]) ||
        !isset($data["dateBirth"]) ||
        empty($data["dateBirth"])
    ) {
        $this->call(
            400,
            "bad_request",
            "Os campos obrigatórios não foram informados.",
            "error"
        )->back();
        return;
    }



    // class_id pode ser NULL
    $classId = $data["class_id"] ?? null;

    // Trata "null" como null
    if ($classId === null || $classId === "" || $classId === "null") {
        $classId = null;
    } else {
        $classId = (int) $classId;
    }

    // photo pode ser NULL
    $photo = $data["photo"] ?? null;

    if ($photo === "null" || $photo === "") {
        $photo = null;
    }

        $user = new User(
        null,
        $data["sector_id"],
      $classId,
        $data["name"],
        $data["email"],
        $data["password"],
        $data["photo"],
        time(),
        time(),
        $data["enrollment"],
        $data["dateBirth"],
        1
);

        if(!$user->insert()){
            $this->call(500,
                "internal_server_error",
                $user->getErrorMessage(),
                "error")->back();
            return;
        }
        $this->call(201, "success","Usuário cadastrado com sucesso!" , "success")->back();
    }


    //UPDATE - PUT
    public function update(array $data): void
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

if (isset($data["name"])) {
    $user->setName($data["name"]);
}

if (isset($data["email"])) {
    $user->setEmail($data["email"]);
}

if (isset($data["password"])) {
    $user->setPassword($data["password"]);
}

if (isset($data["photo"])) {
    $user->setPhoto($data["photo"]);
}


if (
    !isset($data["name"]) &&
    !isset($data["email"]) &&
    !isset($data["password"]) &&
    !isset($data["photo"]) 
) {
    $this->call(
        400,
        "bad_request",
        "Nenhum campo para atualização foi informado.",
        "error"
    )->back(null);
    return;
}

    if (!$user->updateById($data["user_id"])) {
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
        "Usuário atualizado com sucesso!",
        "success"
    )->back();
}



    //DELETE - DELETE
    public function delete(array $data): void
{
    if(!$this->authToken('administrador')) {
    $this->call(
        401,
        "unauthorized",
        "Apenas administradores podem realizar esta ação.",
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




public function auth (?array $data = null): void
{

    if(!isset($data['email'], $data['password']) ||
        empty($data['email']) || empty($data['password']) ||
        !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        
        $this->call(
            400,
            "bad_request",
            "E-mail e senha são obrigatórios.",
            "error"
        )->back();
        return;
    }


        $user = new User();
        if(!$user->login($data['email'], $data['password'])) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "photo" => $user->getPhoto(),
            "token" => $user->getToken(),
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success")->back($response);
    }

    public function authAdmin (array $data): void
    {
        
        if(!isset($data['email'], $data['password']) ||
            empty($data['email']) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error")->back();
            return;
        }

        $user = new User();
        if(!$user->login($data['email'], $data['password'], 'administrador')) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "photo" => $user->getPhoto(),
            "token" => $user->getToken(),
            "enrollment" => $user->getEnrollment()
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success")->back($response);
    }

}