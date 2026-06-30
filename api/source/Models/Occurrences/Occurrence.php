<?php

namespace Source\Models\Occurrences;

use Source\Core\Model;

class Occurrence extends Model
{
    private ?int $id;
    private ?int $servicesId;
    private ?int $sectorsId;
    private ?int $userId;
    private ?int $studentId;
    private ?string $title;
    private ?string $description;
    private ?string $status;
    private ?string $secrecyLevel;
    private ?string $createdAt;
    private ?string $updatedAt;
    private ?int $active;
    private ?string $class;

    public function __construct(
        ?int $id = null,
        ?int $servicesId = null,
        ?int $sectorsId = null,
        ?int $userId = null,
        ?int $studentId = null,
        ?string $title = null,
        ?string $description = null,
        ?string $status = null,
        ?string $secrecyLevel = null,
        ?string $createdAt = null,
        ?string $updatedAt = null,
        ?int $active = 1,
        ?string $class = null
    ) {
        $this->id = $id;
        $this->servicesId = $servicesId;
        $this->sectorsId = $sectorsId;
        $this->userId = $userId;
        $this->studentId = $studentId;
        $this->title = $title;
        $this->description = $description;
        $this->status = $status;
        $this->secrecyLevel = $secrecyLevel;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->active = $active;
        $this->class = $class;

        $this->table = 'occurrences';
        $this->primaryKey = 'id';
        $this->fillable = [
            'servicesId',
            'sectorsId',
            'userId',
            'studentId',
            'title',
            'description',
            'status',
            'secrecyLevel',
            'createdAt',
            'updatedAt',
            'active',
            'class'
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

    public function getServicesId(): ?int
    {
        return $this->servicesId;
    }

    public function setServicesId(int $servicesId): void
    {
        $this->servicesId = $servicesId;
    }

    public function getSectorsId(): ?int
    {
        return $this->sectorsId;
    }

    public function setSectorsId(int $sectorsId): void
    {
        $this->sectorsId = $sectorsId;
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function getSecrecyLevel(): ?string
    {
        return $this->secrecyLevel;
    }

    public function setSecrecyLevel(string $secrecyLevel): void
    {
        $this->secrecyLevel = $secrecyLevel;
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

    public function getClass(): ?string
    {
        return $this->class;
    }

    public function setClass(string $class): void
    {
        $this->class = $class;
    }
}