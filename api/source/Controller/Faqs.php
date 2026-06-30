<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Faqs\Faq;

class Faqs extends Api
{
    public function listAll(array $data): void{
        $faq = new Faq();
        // var_dump($faq->selectAll());
        $this->call(200,"success","Lista de FAQs","success")->back($faq->selectAll());
    }

     public function listById(array $data): void
    {

        if(!isset($data["faq_id"]) || empty($data["faq_id"]) || !filter_var($data["faq_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back(null);
            return;
        }

        $faq = new Faq();
        if(!$faq->selectById($data["faq_id"])) {
            $this->call(
                404,
                "not_found",
                "FAQ não encontrada",
                "error"
            )->back(null);
            return;
        }

        $response = [
            "id" => $faq->getId(),
            "faqsCategoryId" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
           
        ];

        $this->call(200,"success","FAQ encontrada","success")->back($response);
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
                "Os campos question, answer e faqs_category_id são obrigatórios",
                "error"
            )->back();
            return;
        }

        $faq = new Faq(
            null,
            $data["faqs_category_id"],
            $data["question"],
            $data["answer"]
        );

        if(!$faq->insert()){
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "faq_id" => $faq->getId(),
            "faqs_category_id" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
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

        if(!filter_var($data["faq_id"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID da FAQ é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        if(!$this->validate($data)){
            $this->call(
                400,
                "bad_request",
                "Os campos question, answer e faqs_category_id são obrigatórios",
                "error"
            )->back();
            return;
        }

        $faq = new Faq(
            null,
            $data["faqs_category_id"],
            $data["question"],
            $data["answer"]
        );
      

        if(!$faq->updateById($data["faq_id"])){
            $this->call(500, "internal_server_error", $faq->getErrorMessage(), "error")->back();
            return;
        }
        $response = [
            "id" => $faq->getId(),
            "faqsCategoryId" => $faq->getFaqsCategoryId(),
            "question" => $faq->getQuestion(),
            "answer" => $faq->getAnswer(),
            "active" => $faq->getActive()
        ];

        $this->call(200,"success","FAQ atualizada com sucesso","success")->back($response);
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

    //  valida o ID
    if (
        !isset($data["faq_id"]) ||
        !filter_var($data["faq_id"], FILTER_VALIDATE_INT)
    ) {
        $this->call(
            400,
            "bad_request",
            "ID inválido",
            "error"
        )->back();
        return;
    }

    $faq = new Faq();

    // 👇 AQUI você usa a função herdada
    if (!$faq->softDeleteById($data["faq_id"])) {
        $this->call(
            404,
            "not_found",
            $faq->getErrorMessage(),
            "error"
        )->back();
        return;
    }

    $this->call(
        200,
        "success",
        "FAQ desativada com sucesso",
        "success"
    )->back();
}



 public function validate(array $data): bool
{
    if (
        !isset($data["question"]) || empty($data["question"]) ||
        !isset($data["answer"]) || empty($data["answer"]) ||
        !isset($data["faqs_category_id"]) || empty($data["faqs_category_id"])
    ) {
        return false;
    }

    if (trim($data["question"]) === "") {
        return false;
    }else if (trim($data["answer"]) === "") {
        return false;
    }else if (!filter_var($data["faqs_category_id"], FILTER_VALIDATE_INT)) {
        return false;
    }

    return true;
}


    }