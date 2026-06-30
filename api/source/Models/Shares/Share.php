<?php

namespace Source\Models\Shares;

use Source\Core\Model;
use Source\Core\Connect;

class Share extends Model
{
    private ?int $id;
    private ?int $occurrenceId;
    private ?int $userId;
    private ?int $active;
    private ?string $createdAt;
    private ?string $updatedAt;

    public function __construct(
        ?int $id = null,
        ?int $occurrenceId = null,
        ?int $userId = null,
        ?int $active = 1,
        ?string $createdAt = null,
        ?string $updatedAt = null
    ) {
        $this->id = $id;
        $this->occurrenceId = $occurrenceId;
        $this->userId = $userId;
        $this->active = $active;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;

        $this->table = "shares";
        $this->primaryKey = "id";
        $this->fillable = [
            "occurrenceId",
            "userId",
            "active",
            "createdAt",
            "updatedAt"
        ];
    }

     public function getId(): ?int
    {
        return $this->id;
    }

    public function getOccurrenceId(): ?int
    {
        return $this->occurrenceId;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
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

    public function setOccurrenceId(int $occurrenceId): void
    {
        $this->occurrenceId = $occurrenceId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
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
