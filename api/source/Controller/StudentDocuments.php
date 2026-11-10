<?php

namespace Source\Controller;

use Source\Core\Connect;
use Source\Support\Upload;
use PDO;
use PDOException;
use finfo;
use RuntimeException;
use Throwable;

class StudentDocuments extends Api
{
    /**
     * Verifica se o usuário está autenticado como administrador
     * ou profissional.
     */
    private function authenticateStaff(): bool
    {
        $isAdministrator = $this->authToken('administrador');
        $isProfessional = $this->authToken('profissional');

        if (!$isAdministrator && !$isProfessional) {
            $this->call(
                401,
                "unauthorized",
                "Sessão inválida ou sem permissão para acessar documentos.",
                "error"
            )->back([]);

            return false;
        }

        return true;
    }

    /**
     * Valida o ID do estudante recebido pela rota.
     */
    private function validateStudentId(array $data): ?int
    {
        if (
            !isset($data["student_id"]) ||
            !filter_var($data["student_id"], FILTER_VALIDATE_INT) ||
            (int) $data["student_id"] <= 0
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do estudante inválido.",
                "error"
            )->back(null);

            return null;
        }

        return (int) $data["student_id"];
    }

    /**
     * Retorna o diretório privado de armazenamento.
     */
    private function storageDirectory(): string
    {
        return dirname(__DIR__, 2)
            . DIRECTORY_SEPARATOR . "private-storage"
            . DIRECTORY_SEPARATOR . "student-documents";
    }

    /**
     * Verifica se o estudante existe.
     */
    private function studentExists(PDO $pdo, int $studentId): bool
    {
        $stmt = $pdo->prepare(
            "SELECT id
             FROM users
             WHERE id = :student_id
               AND enrollment = 'estudante'
             LIMIT 1"
        );

        $stmt->execute([
            "student_id" => $studentId
        ]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Remove arquivos enviados caso ocorra uma falha no processo.
     */
    private function cleanupFiles(array $paths): void
    {
        foreach ($paths as $path) {
            if (is_file($path)) {
                @unlink($path);
            }
        }
    }

    /**
     * LIST - GET
     * Lista os documentos de determinado estudante.
     */
    public function listByStudent(array $data): void
    {
        if (!$this->authenticateStaff()) {
            return;
        }

        $studentId = $this->validateStudentId($data);

        if ($studentId === null) {
            return;
        }

        try {
            $pdo = Connect::getInstance();

            if (!$this->studentExists($pdo, $studentId)) {
                $this->call(
                    404,
                    "not_found",
                    "Estudante não encontrado.",
                    "error"
                )->back([]);

                return;
            }

            $stmt = $pdo->prepare(
                "SELECT
                    id,
                    student_id AS studentId,
                    uploaded_by AS uploadedBy,
                    original_name AS originalName,
                    mime_type AS mimeType,
                    extension,
                    size_bytes AS sizeBytes,
                    created_at AS createdAt
                 FROM student_documents
                 WHERE student_id = :student_id
                   AND active = 1
                 ORDER BY created_at DESC, id DESC"
            );

            $stmt->execute([
                "student_id" => $studentId
            ]);

            $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->call(
                200,
                "success",
                "Documentos encontrados.",
                "success"
            )->back($documents);

        } catch (Throwable $exception) {
            error_log(
                "Erro ao listar documentos: " . $exception->getMessage()
            );

            $this->call(
                500,
                "internal_server_error",
                "Não foi possível carregar os documentos.",
                "error"
            )->back([]);
        }
    }

    /**
     * INSERT - POST
     * Envia vários documentos para um estudante.
     *
     * O FormData deve utilizar o campo documents[].
     */
    public function upload(array $data): void
    {
        if (!$this->authenticateStaff()) {
            return;
        }

        $studentId = $this->validateStudentId($data);

        if ($studentId === null) {
            return;
        }

        if (
            !isset($_FILES["documents"]) ||
            !isset($_FILES["documents"]["name"]) ||
            !is_array($_FILES["documents"]["name"])
        ) {
            $this->call(
                400,
                "bad_request",
                "Selecione pelo menos um documento.",
                "error"
            )->back();

            return;
        }

        $files = $_FILES["documents"];
        $fileCount = count($files["name"]);

        if ($fileCount < 1 || $fileCount > 10) {
            $this->call(
                400,
                "bad_request",
                "Envie entre 1 e 10 documentos por operação.",
                "error"
            )->back();

            return;
        }

        $pdo = Connect::getInstance();
        $savedPaths = [];

        try {
            if (!$this->studentExists($pdo, $studentId)) {
                $this->call(
                    404,
                    "not_found",
                    "Estudante não encontrado.",
                    "error"
                )->back();

                return;
            }

            $uploadDirectory = $this->storageDirectory();
            $uploader = new Upload($uploadDirectory);

            $pdo->beginTransaction();

            $insert = $pdo->prepare(
                "INSERT INTO student_documents (
                    student_id,
                    uploaded_by,
                    original_name,
                    stored_name,
                    file_path,
                    mime_type,
                    extension,
                    size_bytes,
                    created_at,
                    active
                ) VALUES (
                    :student_id,
                    :uploaded_by,
                    :original_name,
                    :stored_name,
                    :file_path,
                    :mime_type,
                    :extension,
                    :size_bytes,
                    NOW(),
                    1
                )"
            );

            $uploadedDocuments = [];

            foreach ($files["name"] as $index => $originalName) {
                $singleFile = [
                    "name" => $files["name"][$index] ?? "",
                    "type" => $files["type"][$index] ?? "",
                    "tmp_name" => $files["tmp_name"][$index] ?? "",
                    "error" => $files["error"][$index] ?? UPLOAD_ERR_NO_FILE,
                    "size" => $files["size"][$index] ?? 0
                ];

                $filename = $uploader->file($singleFile);

                $storedPath = $uploadDirectory
                    . DIRECTORY_SEPARATOR
                    . $filename;

                $savedPaths[] = $storedPath;

                $originalName = basename(
                    str_replace("\\", "/", (string) $originalName)
                );

                $originalName = preg_replace(
                    '/[\x00-\x1F\x7F]/',
                    '',
                    $originalName
                );

                $originalName = substr(trim($originalName), 0, 255);

                if ($originalName === "") {
                    $originalName = "documento";
                }

                $mimeType = (new finfo(FILEINFO_MIME_TYPE))
                    ->file($storedPath);

                if (!is_string($mimeType)) {
                    throw new RuntimeException(
                        "Não foi possível identificar o tipo do arquivo."
                    );
                }

                $extension = strtolower(
                    pathinfo($filename, PATHINFO_EXTENSION)
                );

                $size = filesize($storedPath);

                if ($size === false) {
                    throw new RuntimeException(
                        "Não foi possível identificar o tamanho do arquivo."
                    );
                }

                $relativePath = "private-storage/student-documents/"
                    . $filename;

                $insert->execute([
                    "student_id" => $studentId,
                    "uploaded_by" => $this->userAuthId,
                    "original_name" => $originalName,
                    "stored_name" => $filename,
                    "file_path" => $relativePath,
                    "mime_type" => $mimeType,
                    "extension" => $extension,
                    "size_bytes" => $size
                ]);

                $uploadedDocuments[] = [
                    "id" => (int) $pdo->lastInsertId(),
                    "originalName" => $originalName
                ];
            }

            $pdo->commit();

            $this->call(
                201,
                "success",
                "Documentos enviados com sucesso.",
                "success"
            )->back([
                "documents" => $uploadedDocuments
            ]);

        } catch (PDOException $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            $this->cleanupFiles($savedPaths);

            error_log(
                "Erro no banco durante upload de documentos: "
                . $exception->getMessage()
            );

            $this->call(
                500,
                "internal_server_error",
                "Não foi possível registrar os documentos no banco.",
                "error"
            )->back();

        } catch (RuntimeException $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            $this->cleanupFiles($savedPaths);

            $this->call(
                400,
                "bad_request",
                $exception->getMessage(),
                "error"
            )->back();

        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            $this->cleanupFiles($savedPaths);

            error_log(
                "Erro inesperado no upload de documentos: "
                . $exception->getMessage()
            );

            $this->call(
                500,
                "internal_server_error",
                "Ocorreu um erro ao enviar os documentos.",
                "error"
            )->back();
        }
    }

    /**
     * DOWNLOAD - GET
     * Disponibiliza um documento por meio da API.
     */
    public function download(array $data): void
    {
        if (!$this->authenticateStaff()) {
            return;
        }

        if (
            !isset($data["document_id"]) ||
            !filter_var($data["document_id"], FILTER_VALIDATE_INT) ||
            (int) $data["document_id"] <= 0
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do documento inválido.",
                "error"
            )->back();

            return;
        }

        try {
            $pdo = Connect::getInstance();

            $stmt = $pdo->prepare(
                "SELECT *
                 FROM student_documents
                 WHERE id = :id
                   AND active = 1
                 LIMIT 1"
            );

            $stmt->execute([
                "id" => (int) $data["document_id"]
            ]);

            $document = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$document) {
                $this->call(
                    404,
                    "not_found",
                    "Documento não encontrado.",
                    "error"
                )->back();

                return;
            }

            $filename = $document["stored_name"];

            if (!preg_match(
                '/\A[a-f0-9]{32}\.[a-z0-9]{1,10}\z/i',
                $filename
            )) {
                throw new RuntimeException(
                    "Nome de arquivo armazenado inválido."
                );
            }

            $filePath = $this->storageDirectory()
                . DIRECTORY_SEPARATOR
                . $filename;

            if (!is_file($filePath) || !is_readable($filePath)) {
                $this->call(
                    404,
                    "not_found",
                    "Arquivo não encontrado no armazenamento.",
                    "error"
                )->back();

                return;
            }

            $mimeType = $document["mime_type"];

            if (!preg_match(
                '/\A[a-z0-9.+-]+\/[a-z0-9.+-]+\z/i',
                $mimeType
            )) {
                $mimeType = "application/octet-stream";
            }

            $originalName = $document["original_name"];

            $fallbackName = preg_replace(
                '/[^A-Za-z0-9._-]/',
                '_',
                $originalName
            );

            header("Content-Type: " . $mimeType);
            header("X-Content-Type-Options: nosniff");
            header("Cache-Control: private, no-store");
            header("Content-Length: " . filesize($filePath));

            header(
                "Content-Disposition: attachment; filename=\""
                . $fallbackName
                . "\"; filename*=UTF-8''"
                . rawurlencode($originalName)
            );

            readfile($filePath);
            exit;

        } catch (Throwable $exception) {
            error_log(
                "Erro ao baixar documento: " . $exception->getMessage()
            );

            $this->call(
                500,
                "internal_server_error",
                "Não foi possível baixar o documento.",
                "error"
            )->back();
        }
    }




/**
 * UPDATE - PUT
 * Atualiza o nome de exibição de um documento.
 */
public function updateName(array $data): void
{
    if (!$this->authenticateStaff()) {
        return;
    }

    if (
        !isset($data["document_id"]) ||
        !filter_var($data["document_id"], FILTER_VALIDATE_INT) ||
        (int) $data["document_id"] <= 0
    ) {
        $this->call(
            400,
            "bad_request",
            "ID do documento inválido.",
            "error"
        )->back();

        return;
    }

    $newName = trim((string) ($data["original_name"] ?? ""));

    if ($newName === "") {
        $this->call(
            400,
            "bad_request",
            "Informe o novo nome do documento.",
            "error"
        )->back();

        return;
    }

    try {
        $pdo = Connect::getInstance();

        $stmt = $pdo->prepare(
            "SELECT extension
             FROM student_documents
             WHERE id = :id
               AND active = 1
             LIMIT 1"
        );

        $stmt->execute([
            "id" => (int) $data["document_id"]
        ]);

        $document = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$document) {
            $this->call(
                404,
                "not_found",
                "Documento não encontrado.",
                "error"
            )->back();

            return;
        }

        // Impede que o nome contenha caminhos de diretórios.
        $newName = basename(str_replace("\\", "/", $newName));

        // Remove caracteres de controle.
        $newName = preg_replace('/[\x00-\x1F\x7F]/', '', $newName);
        $newName = trim($newName);

        $extension = strtolower($document["extension"]);

        // Mantém a extensão original do arquivo.
        $providedExtension = strtolower(
            pathinfo($newName, PATHINFO_EXTENSION)
        );

        if (
            $providedExtension !== "" &&
            $providedExtension !== $extension
        ) {
            $this->call(
                400,
                "bad_request",
                "A extensão do arquivo não pode ser modificada.",
                "error"
            )->back();

            return;
        }

        $baseName = pathinfo($newName, PATHINFO_FILENAME);
        $baseName = trim($baseName);

        if ($baseName === "") {
            $this->call(
                400,
                "bad_request",
                "Informe um nome válido para o documento.",
                "error"
            )->back();

            return;
        }

        $newName = $baseName . "." . $extension;

        if (strlen($newName) > 255) {
            $this->call(
                400,
                "bad_request",
                "O nome do documento deve ter no máximo 255 bytes.",
                "error"
            )->back();

            return;
        }

        $update = $pdo->prepare(
            "UPDATE student_documents
             SET original_name = :original_name,
                 updated_at = NOW()
             WHERE id = :id
               AND active = 1"
        );

        $update->execute([
            "original_name" => $newName,
            "id" => (int) $data["document_id"]
        ]);

        $this->call(
            200,
            "success",
            "Nome do documento atualizado com sucesso.",
            "success"
        )->back([
            "id" => (int) $data["document_id"],
            "originalName" => $newName
        ]);

    } catch (Throwable $exception) {
        error_log(
            "Erro ao atualizar nome do documento: "
            . $exception->getMessage()
        );

        $this->call(
            500,
            "internal_server_error",
            "Não foi possível atualizar o nome do documento.",
            "error"
        )->back();
    }
}





    /**
     * DELETE - DELETE
     * Desativa o registro e remove o arquivo armazenado.
     */
    public function delete(array $data): void
    {
        if (!$this->authenticateStaff()) {
            return;
        }

        if (
            !isset($data["document_id"]) ||
            !filter_var($data["document_id"], FILTER_VALIDATE_INT) ||
            (int) $data["document_id"] <= 0
        ) {
            $this->call(
                400,
                "bad_request",
                "ID do documento inválido.",
                "error"
            )->back();

            return;
        }

        try {
            $pdo = Connect::getInstance();

            $stmt = $pdo->prepare(
                "SELECT stored_name
                 FROM student_documents
                 WHERE id = :id
                   AND active = 1
                 LIMIT 1"
            );

            $stmt->execute([
                "id" => (int) $data["document_id"]
            ]);

            $document = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$document) {
                $this->call(
                    404,
                    "not_found",
                    "Documento não encontrado.",
                    "error"
                )->back();

                return;
            }

            $filename = $document["stored_name"];

            if (!preg_match(
                '/\A[a-f0-9]{32}\.[a-z0-9]{1,10}\z/i',
                $filename
            )) {
                throw new RuntimeException(
                    "Nome de arquivo armazenado inválido."
                );
            }

            $update = $pdo->prepare(
                "UPDATE student_documents
                 SET active = 0,
                     updated_at = NOW()
                 WHERE id = :id"
            );

            $update->execute([
                "id" => (int) $data["document_id"]
            ]);

            $filePath = $this->storageDirectory()
                . DIRECTORY_SEPARATOR
                . $filename;

            if (is_file($filePath) && !unlink($filePath)) {
                error_log(
                    "Não foi possível remover o arquivo: " . $filename
                );
            }

            $this->call(
                200,
                "success",
                "Documento excluído com sucesso.",
                "success"
            )->back();

        } catch (Throwable $exception) {
            error_log(
                "Erro ao excluir documento: " . $exception->getMessage()
            );

            $this->call(
                500,
                "internal_server_error",
                "Não foi possível excluir o documento.",
                "error"
            )->back();
        }
    }
}
