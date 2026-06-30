<?php

namespace Source\Models\Reports;

use Source\Core\Model;

class Report extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?string $title;
    private ?string $content;
    private ?string $createdAt;
    private ?string $updatedAt;
    private ?int $active;


    public function __construct(
        ?int $id = null,
        ?int $userId = null,
        ?string $title = null,
        ?string $content = null,
        ?string $createdAt = null,
        ?string $updatedAt = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->title = $title;
        $this->content = $content;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->active = $active;

        $this->table = 'reports';
        $this->primaryKey = 'id';
        $this->fillable = [
            'userId',
            'title',
            'content',
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

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): void
    {
        $this->content = $content;
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