<?php

namespace Source\Controller;

use Source\Models\Notifications\Notification;
use Source\Controller\Api;
use Source\Models\Users\User;

class Notifications extends Api {

    // HELLO - GET
    public function hello(): void
    {
        echo "HELLO NOTIFICATIONSSSS";
    }

    //LIST ALL - GET
    public function listAll(): void
    {
        $notification = new Notification();

        $notifications = $notification->selectAll();

    if (empty($notifications)) {
        $this->call(
            404,
            "not_found",
            "Nenhuma notificação encontrada",
            "error"
        )->back([]);
        return;
    }

    $this->call(
        200,
        "success",
        "Notificações encontradas",
        "success"
    )->back($notifications);
    }

    //LIST BY ID - GET
    public function listById(array $data): void
    {
        
    if (
        !isset($data["notification_id"]) ||
        empty($data["notification_id"]) ||
        !filter_var($data["notification_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da notificação é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $notification = new Notification();

    if (!$notification->selectById($data["notification_id"])) {
    $this->call(
        404,
        "not_found",
        "Notificação não encontrada",
        "error"
    )->back(null);
    return;
    }   

    $response = [
    "id" => $notification->getId(),
    "userId" => $notification->getUserId(),
    "message" => $notification->getMessage(),
    "is_read" => $notification->getIsRead(),
    "active" => $notification->getActive(),
    "createdAt" => $notification->getCreatedAt(),
    "updatedAt" => $notification->getUpdatedAt()
    ];

    $this->call(
        200,

        "success",
        "Notificação encontrado",
        "success"
    )->back($response);
    }

    //DELETE - DELETE
    public function delete(array $data): void
    {
    if (
        !isset($data["notification_id"]) ||
        empty($data["notification_id"]) ||
        !filter_var($data["notification_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da notificação é obrigatório e deve ser um número inteiro",
            "error"
        )->back(null);
        return;
    }

    $notification = new Notification();

    if (!$notification->softDeleteById($data["notification_id"])) {
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
        "Notificação desativado com sucesso!",
        "success"
    )->back();
    }

    //INSERT - POST
    public function insert(array $data): void
    {

    if (
        !isset($data["user_id"]) ||
        !isset($data["message"])
    ) {
        $this->call(
            400,
            "bad_request",
            "ID do usuário e a mensagem são obrigatórios.",
            "error"
        )->back();
        return;
    }

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

    $notification = new Notification(
        null,
        $data["user_id"],
        $data["message"],
        0,
        1,
        date('Y-m-d H:i:s'),
        date('Y-m-d H:i:s')
    );

    if (!$notification->insert()) {
        $this->call(
            500,
            "internal_server_error",
            $notification->getErrorMessage(),
            "error"
        )->back();
        return;
    }

    $this->call(
        201,
        "success",
        "Notificação cadastrada com sucesso!",
        "success"
    )->back();
    }
    
    //READ NOTIFICATION - PUT
    public function readNotification(array $data): void 
    {
    if (
        !isset($data["notification_id"]) ||
        empty($data["notification_id"]) ||
        !filter_var($data["notification_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID da notificação é obrigatório e deve ser um número inteiro.",
            "error"
        )->back();
        return;
    }

    $notification = new Notification();

    if (!$notification->selectById($data["notification_id"])) {
        $this->call(
            404,
            "not_found",
            "Notificação não encontrada.",
            "error"
        )->back();
        return;
    }

    if (!$notification->readNotification($data["notification_id"])) {
        $this->call(
            500,
            "internal_server_error",
            $notification->getErrorMessage(),
            "error"
        )->back();
        return;
    }

    $this->call(
        200,
        "success",
        "Notificação marcada como lida.",
        "success"
    )->back();
    }
}
