<?php

namespace Source\Models\Sectors;

use Source\Core\Model;

class Sector extends Model
{
    private ?int $id;
    private ?string $name;
    private ?string $description;
    private ?string $createdAt;
    private ?string $updatedAt;
    private ?int $active;


    public function __construct(
        ?int $id = null,
        ?string $name = null,
        ?string $description = null,
        ?string $createdAt = null,
        ?string $updatedAt = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->active = $active;

        $this->table = 'sectors';
        $this->primaryKey = 'id';
        $this->fillable = [
            'name',
            'description',
            'createdAt',
            'updatedAt',
            'active',
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
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