<?php

namespace Source\Models\Users;

use Source\Core\Model;
use Source\Core\Connect;

class User extends Model
{
    private ?int $id;
    private ?int $sectorId;
    private ?int $classId;
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?string $photo;
    private ?int $createdAt;
    private ?int $updateAt;
    private ?string $enrollment;
    private ?string $dateBirth;
    private ?int $active;

    public function __construct(?int $id = null, ?int $sectorId = null,
    ?int $classId = null, ?string $name = null, ?string $email = null,
    ?string $password = null, ?string $photo = null, ?int $createdAt = null,
     ?int $updateAt = null, ?string $enrollment = null, ?string $dateBirth = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->sectorId = $sectorId;
        $this->classId = $classId;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->photo = $photo;
        $this->createdAt = $createdAt;
        $this->updateAt = $updateAt;
        $this->enrollment = $enrollment;
        $this->dateBirth = $dateBirth;
        $this->active = $active;

        $this->table = 'users';
        $this->primaryKey = 'id';
        $this->fillable = ['sectorId', 'classId', 'name', 'email', 'password', 'photo', 'crteatedAt', 'updateAt', 'enrollment', 'dateBirth', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getSectorId(): ?int
    {
        return $this->sectorId;
    }

    public function setSectorId(int $sectorId): void
    {
        $this->sectorId = $sectorId;
    }

    public function getClassId(): ?int
    {
        return $this->classId;
    }

    public function setClassId(int $classId): void
    {
        $this->classId = $classId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(string $photo): void
    {
        $this->photo = $photo;
    }

    public function getCreatedAt(): ?int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }
    public function getEnrollment(): ?string
    {
        return $this->enrollment;
    }

    public function setEnrollment(string $enrollment): void
    {
        $this->enrollment = $enrollment;
    }
    public function getDateBirth(): ?string
    {
        return $this->dateBirth;
    }

    public function setDateBirth(string $dateBirth): void
    {
        $this->dateBirth = $dateBirth;
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