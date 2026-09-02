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

    public function __construct(?int $id = null, ?int $sectorId = null,
    ?int $classId = null, ?string $name = null, ?string $email = null,
    ?string $password = null, ?string $photo = null, ?string $createdAt = null,
     ?string $updatedAt = null, ?string $enrollment = null, ?string $dateBirth = null, ?int $active = 1)
    {
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
        $this->active = $active;

        $this->table = 'users';
        $this->primaryKey = 'id';
        $this->fillable = ['sectorId', 'classId', 'name', 'email', 'password', 'photo', 'createdAt', 'updatedAt', 'enrollment', 'dateBirth', 'active'];
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

    public function setActive(int $active): void
    {
        $this->active = $active;
    }
 public function getToken(): ?string
    {        return $this->token;
    }

       public function insert (): bool
    {
        $query = "SELECT * FROM  {$this->table} WHERE email = :email";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        if($stmt->rowCount() > 0){
            $this->errorMessage = "Email já cadastrado";
            return false;
        }
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);

        if(!parent::insert()){
            $this->errorMessage = "Algo deu errado";
            return false;
        }
        return true;
    }

    public function login (
        string $email, 
        string $password,
        string $enrollment = null
        ): bool
        {
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

    if (!password_verify($password, $user->password)) {
        $this->errorMessage = "Senha incorreta";
        return false;
    }
//
// var_dump("Senha recebida:", $password);
// var_dump("Hash do banco:", $user->password);
// var_dump("Resultado:", password_verify($password, $user->password));

// exit;
//

if(
        $user->enrollment !== "administrador" &&
        $user->enrollment !== "profissional"
    ){
        $this->errorMessage = "Este usuário não possui permissão para acessar o sistema";
        return false;
    }

    if($user->active != 1){
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

    public function permissionVerify (string $email, string $enrollment): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND enrollment = :enrollment";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
            $stmt->bindParam(':enrollment', $enrollment);
        $stmt->execute();
        if($stmt->rowCount() == 0) {
            return false;
        }
        return true;
    }

}