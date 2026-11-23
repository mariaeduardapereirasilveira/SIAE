<?php

namespace Source\Models\Users;

use Source\Core\JWTToken;
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
    private ?string $createdAt;
    private ?string $updatedAt;
    private ?string $enrollment;
    private ?string $dateBirth;
    private ?int $active;

    private ?string $registrationNumber = null;
    private ?string $phone = null;
    private ?string $guardian = null;
    private ?string $course = null;
    private ?string $shift = null;


    public function __construct(
        ?int $id = null,
        ?int $sectorId = null,
        ?int $classId = null,
        ?string $name = null,
        ?string $email = null,
        ?string $password = null,
        ?string $photo = null,
        ?string $createdAt = null,
        ?string $updatedAt = null,
        ?string $enrollment = null,
        ?string $dateBirth = null,
         ?string $registrationNumber = null,
        ?string $phone = null,
         ?string $guardian = null,
         ?string $course = null,
        ?string $shift = null,
        ?int $active = null,
    ) {
        $this->id = $id;
        $this->sectorId = $sectorId;
        $this->classId = $classId;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->photo = $photo;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->enrollment = $enrollment;
        $this->dateBirth = $dateBirth;
        $this-> phone = $phone;
         $this-> guardian = $guardian;
        $this-> course = $course;
        $this-> shift = $shift;
        $this-> active = $active;

        $this->table = 'users';
        $this->primaryKey = 'id';

        $this->fillable = [
            'sectorId',
            'classId',
            'name',
            'email',
            'password',
            'photo',
            'createdAt',
            'updatedAt',
            'enrollment',
            'dateBirth',
            'active',
            'registrationNumber',
            'phone',
            'guardian',
            'course',
            'shift'
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

    public function getSectorId(): ?int
    {
        return $this->sectorId;
    }

    public function setSectorId(?int $sectorId): void
    {
        $this->sectorId = $sectorId;
    }

    public function getClassId(): ?int
    {
        return $this->classId;
    }

    public function setClassId(?int $classId): void
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

    public function setPhoto(?string $photo): void
    {
        $this->photo = $photo;
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

    public function setUpdatedAt(?string $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
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



    /* ==========================================
   DADOS COMPLEMENTARES DO ESTUDANTE
   ========================================== */

    // MATRÍCULA
    public function getRegistrationNumber(): ?string
    {
        return $this->registrationNumber;
    }

    public function setRegistrationNumber(?string $registrationNumber): void
    {
        $this->registrationNumber = $registrationNumber;
    }

    // TELEFONE
    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): void
    {
        $this->phone = $phone;
    }

    // RESPONSÁVEL
    public function getGuardian(): ?string
    {
        return $this->guardian;
    }

    public function setGuardian(?string $guardian): void
    {
        $this->guardian = $guardian;
    }

    // CURSO
    public function getCourse(): ?string
    {
        return $this->course;
    }

    public function setCourse(?string $course): void
    {
        $this->course = $course;
    }

    // TURNO
    public function getShift(): ?string
    {
        return $this->shift;
    }

    public function setShift(?string $shift): void
    {
        $this->shift = $shift;
    }







    public function setActive(int $active): void
    {
        $this->active = $active;
    }
    public function getToken(): ?string
    {
        return $this->token;
    }

    public function insert(): bool
    {

        // Novos usuários são ativos por padrão,
        // caso o status não seja informado explicitamente.
        if ($this->active === null) {
            $this->active = 1;
        }


        $query = "SELECT * FROM  {$this->table} WHERE email = :email";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $this->errorMessage = "Email já cadastrado";
            return false;
        }
      
if ($this->enrollment === 'estudante') {
    // Estudantes não possuem senha.
    $this->password = null;
} else {
    // Somente perfis que acessam o sistema
    // devem possuir uma senha válida.
    if ($this->password === null || $this->password === '') {
        $this->errorMessage = 'Senha obrigatória para este perfil.';
        return false;
    }

    $this->password = password_hash(
        $this->password,
        PASSWORD_DEFAULT
    );
}


        if (!parent::insert()) {
            $this->errorMessage = "Algo deu errado";
            return false;
        }
        return true;
    }

    public function login(
        string $email,
        string $password,
        ?string $enrollment = null
    ): bool {
        $query = "SELECT * FROM {$this->table}
         WHERE email = :email";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $user = $stmt->fetch();

        if (!$user) {
            $this->errorMessage = "Email não cadastrado";
            return false;
        }



        // Valida se o perfil selecionado corresponde ao cadastro.
        if (
            $enrollment !== null &&
            !in_array($enrollment, ["administrador", "profissional"], true)
        ) {
            $this->errorMessage = "Perfil de acesso inválido.";
            return false;
        }

        if (
            $enrollment !== null &&
            $user->enrollment !== $enrollment
        ) {
            $this->errorMessage = "Esta conta não pertence ao perfil selecionado.";
            return false;
        }



        if (!password_verify($password, $user->password)) {
            $this->errorMessage = "Senha incorreta";
            return false;
        }

        // var_dump("Senha recebida:", $password);
        // var_dump("Hash do banco:", $user->password);
        // var_dump("Resultado:", password_verify($password, $user->password));

        // exit;
        //

        if (
            $user->enrollment !== "administrador" &&
            $user->enrollment !== "profissional"
        ) {
            $this->errorMessage = "Este usuário não possui permissão para acessar o sistema";
            return false;
        }

        if ($user->active != 1) {
            $this->errorMessage = "Usuário desativado";
            return false;
        }


        $this->id = $user->id;
        $this->name = $user->name;
        $this->email = $user->email;
        $this->photo = $user->photo;
        $this->enrollment = $user->enrollment;
        $jwt = new JWTToken();
        // definir quais informações irão par o payload do token
        $this->token = $jwt->encode([
            "id" => $user->id,
            "name" => $user->name,
            "email" => $user->email,
            "enrollment" => $user->enrollment
        ]);
        return true;
    }

    public function permissionVerify(string $email, string $enrollment): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND enrollment = :enrollment";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(':enrollment', $enrollment);
        $stmt->execute();
        if ($stmt->rowCount() == 0) {
            return false;
        }
        return true;
    }


    public function updatePhoto(int $id, string $photoPath): bool
    {
        try {
            $query = "UPDATE {$this->table}
                      SET photo = :photo, updated_at = :updated_at
                      WHERE {$this->primaryKey} = :id";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':photo', $photoPath);
            $stmt->bindValue(':updated_at', date('Y-m-d H:i:s'));
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "Perfil não encontrado ou não foi possível atualizar a foto.";
                return false;
            }

            $this->id = $id;
            $this->photo = $photoPath;
            $this->updatedAt = date('Y-m-d H:i:s');
            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = "Erro ao atualizar a foto do usuário.";
            error_log("Erro ao atualizar foto do usuário: " . $exception->getMessage());
            return false;
        }
    }
}
