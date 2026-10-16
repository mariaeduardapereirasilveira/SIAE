<?php

namespace Source\Models\Services;

use Source\Core\Model;

class Service extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?int $studentId;
    private ?string $observations;
    private ?string $createdAt;
    private ?string $updatedAt;
    private ?int $active;


    public function __construct(
        ?int $id = null,
        ?int $userId = null,
        ?int $studentId = null,
        ?string $observations = null,
        ?string $createdAt = null,
        ?string $updatedAt = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->studentId = $studentId;
        $this->observations = $observations;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->active = $active;


        $this->table = 'services';
        $this->primaryKey = 'id';
        $this->fillable = [
            'userId',
            'studentId',
            'observations',
            'createdAt',
            'updatedAt',
            'active'
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

   

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getStudentId(): ?int
    {
        return $this->studentId;
    }

    public function setStudentId(int $studentId): void
    {
        $this->studentId = $studentId;
    }

  
    public function getObservations(): ?string
    {
        return $this->observations;
    }

    public function setObservations(string $observations): void
    {
        $this->observations = $observations;
    }

   

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?string $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }

   
}