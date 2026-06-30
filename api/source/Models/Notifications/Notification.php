<?php

namespace Source\Models\Notifications;

use Source\Core\Model;

class Notification extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?string $message;
    private ?int $isRead;
    private ?int $active;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(
        ?int $id = null,
        ?int $userId = null,
        ?string $message = null,
        ?int $isRead = 0,
        ?int $active = 1,
        ?string $createdAt = null,
        ?string $updatedAt = null
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->message = $message;
        $this->isRead = $isRead;
        $this->active = $active;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = "notifications";
        $this->primaryKey = "id";

        $this->fillable = [
            "userId",
            "message",
            "isRead",
            "active",
            "createdAt",
            "updatedAt"
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function getIsRead(): ?int
    {
        return $this->isRead;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function setMessage(string $message): void
    {
        $this->message = $message;
    }

    public function setIsRead(int $isRead): void
    {
        $this->isRead = $isRead;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }

    public function setCreatedAt(string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function setUpdatedAt(string $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }
}