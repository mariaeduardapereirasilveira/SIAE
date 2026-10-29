<?php

namespace Source\Controller;

use Source\Models\Classes\ClassModel;
use Source\Controller\Api;

class Classes extends Api
{
    public function listAll(): void
    {
        $class = new ClassModel();
        $classes = $class->selectAll();

        if (empty($classes)) {
            $this->call(
                404,
                "not_found",
                "Nenhuma turma encontrada",
                "error"
            )->back([]);
            return;
        }

        $this->call(
            200,
            "success",
            "Turmas encontradas",
            "success"
        )->back($classes);
    }
}
