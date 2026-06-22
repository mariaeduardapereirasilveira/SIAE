<?php

namespace Source\Models\Ocurrences;

use Source\Core\Model;
use Source\Core\Connect;

class Occurrence extends Model
{
    private ?int $id;
    private ?int $servicesId;
    private ?int $sectorsId;
    private ?string $userId;
    private ?string $title;
    private ?string $description;
    private ?string $status;
    private ?string $createdAt;
    private ?string $updateAt;
    private ?string $secrecyLevel;
    private ?string $classId;
    private ?int $active;

    public function __construct(?int $id = null, ?int $servicesId = null,
    ?int $sectorsId = null, ?string $title = null, ?string $description = null,
    ?string $status = null, ?string $createdAt = null, ?string $updateAt = null,
    ?string $secrecyLevel = null, ?string $classId = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->servicesId = $servicesId;
        $this->sectorsId = $sectorsId;
        $this->title = $title;
        $this->description = $description;
        $this->status = $status;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->secrecyLevel = $secrecyLevel;
        $this->classId = $classId;
        $this->active = $active;

        $this->table = 'users';
        $this->primaryKey = 'id';
        $this->fillable = ['servicesId', 'sectorsId', 'title', 'description', 'status', 'createdAt', 'updateAt', 'secrecyLevel', 'classId', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getSectorsId(): ?int
    {
        return $this->sectorsId;
    }

    public function setsectorsId(int $sectorsId): void
    {
        $this->sectorsId = $sectorsId;
    }

    public function getClassId(): ?int
    {
        return $this->classId;
    }

    public function setClassId(int $classId): void
    {
        $this->classId = $classId;
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

    public function setCreatedAt(string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }
    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(string $updatedAt): void
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