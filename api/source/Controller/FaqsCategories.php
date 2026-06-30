<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Faqs\FaqCategory;

class FaqsCategories extends Api
{

public function listAll(array $data): void{
        $faqCategory = new FaqCategory();
        // var_dump($faqCategory->selectAll());
        $this->call(200,"success","Lista de Categorias de FAQs","success")->back($faqCategory->selectAll());
    }
  public function listById(array $data): void
    {

        if(!isset($data["category_id"]) || empty($data["category_id"]) || !filter_var($data["category_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da categoria é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faqCategory = new FaqCategory();
        if(!$faqCategory->selectById($data["category_id"])) {
            $this->call(
                404,
                "not_found",
                "Categoria de FAQ não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $faqCategory->getId(),
            "name" => $faqCategory->getName(),
            "active" => $faqCategory->getActive()
           
        ];

        $this->call(200,"success","Categoria de FAQ encontrada","success")->back($response);
    }



  public function insert (array $data): void
    {
       
if(!$this->authToken('administrador')) {
    $this->call(
        401,
        "unauthorized",
        "Apenas administradores podem realizar esta ação.",
        "error"
    )->back();
    return;
}
        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos name e active são obrigatórios",
                "error"
            )->back();
            return;
        }

        $faqCategory = new FaqCategory(
            null,
            $data["name"]
        );

        if(!$faqCategory->insert()){
            $this->call(500, "internal_server_error", $faqCategory->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "faq_category_id" => $faqCategory->getId(),
            "name" => $faqCategory->getName(),
            "active" => $faqCategory->getActive()
        ];

        $this->call(201,"success","Categoria de FAQ inserida com sucesso","success")->back($response);

    }





public function update (array $data): void
    {

if(!$this->authToken('administrador')) {
    $this->call(
        401,
        "unauthorized",
        "Apenas administradores podem realizar esta ação.",
        "error"
    )->back();
    return;
}

        if(!filter_var($data["category_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da categoria é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos name são obrigatórios",
                "error"
            )->back();
            return;
        }

        $faqsCategory = new FaqCategory(
            null,
            $data["name"]
        );
      

        if(!$faqsCategory->updateById($data["category_id"])){
            $this->call(500, "internal_server_error", $faqsCategory->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $faqsCategory->getId(),
            "name" => $faqsCategory->getName(),
            "active" => $faqsCategory->getActive()
        ];

        $this->call(200,"success","Categoria de FAQ atualizada com sucesso","success")->back($response);
    }

public function delete(array $data): void
{
    if(!$this->authToken('administrador')) {
    $this->call(
        401,
        "unauthorized",
        "Apenas administradores podem realizar esta ação.",
        "error"
    )->back();
    return;
}
    if (
        !isset($data["category_id"]) ||
        !filter_var($data["category_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID inválido",
            "error"
        )->back();
        return;
    }

    $faqCategory = new FaqCategory();

    if (!$faqCategory->softDeleteById($data["category_id"])) {
        $this->call(
            404,
            "not_found",
            $faqCategory->getErrorMessage(),
            "error"
        )->back();
        return;
    }

    $this->call(
        200,
        "success",
        "Categoria de FAQ desativada com sucesso",
        "success"
    )->back();
}



  public function validate(array $data): bool
{
    if (
        !isset($data["name"]) || empty($data["name"]) 
    ) {
        return false;
    }

    if (trim($data["name"]) === "") {
        return false;
    }

    return true;
}

}