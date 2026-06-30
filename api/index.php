<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
// timezone para São Paulo América
date_default_timezone_set('America/Sao_Paulo');

ob_start();

require  __DIR__ . "/vendor/autoload.php";

// os headers abaixo são necessários para permitir o acesso a API por clientes externos ao domínio
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Access-Control-Allow-Credentials: true'); // Permitir credenciais

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use CoffeeCode\Router\Router;
// localhost/acme-3am/api
$route = new Router(url("api"),":");

$route->namespace("Source\Controller");// localhost/acme-3am/api/hello
$route->get("/hello", "Api:hello");
// $route->get("/products/list", "Products:productsList");
//$route->get("/users/list", "Users:usersList");

$route->group("/occurrences");
$route->namespace("Source\Controller");

$route->get("/hello", "Occurrences:hello");
$route->get("/list", "Occurrences:listAll");
$route->get("/id/{occurrence_id}", "Occurrences:listById");
$route->post("/", "Occurrences:insert");
$route->put("/id/{occurrence_id}", "Occurrences:update");
$route->delete("/id/{occurrence_id}", "Occurrences:delete");
$route->group(null);


$route->group("/sectors");
$route->namespace("Source\Controller");

$route->get("/hello", "Sectors:hello");
$route->get("/list", "Sectors:listAll");
$route->get("/id/{sector_id}", "Sectors:listById");
$route->post("/", "Sectors:insert");
$route->put("/id/{sector_id}", "Sectors:update");
$route->delete("/id/{sector_id}", "Sectors:delete");
$route->group(null);


$route->group("/reports");
$route->namespace("Source\Controller");

$route->get("/hello", "Reports:hello");
$route->get("/list", "Reports:listAll");
$route->get("/id/{report_id}", "Reports:listById");
$route->post("/", "Reports:insert");
$route->put("/id/{report_id}", "Reports:update");
$route->delete("/id/{report_id}", "Reports:delete");
$route->group(null);

$route->group("/users");
$route->namespace("Source\Controller");

$route->get("/hello", "Users:hello");
$route->get("/list", "Users:listAll");
$route->get("/id/{user_id}", "Users:listById");
$route->post("/", "Users:insert");
$route->post("/login", "Users:auth");
$route->post("/login/admin", "Users:authAdmin"); 
$route->put("/id/{user_id}", "Users:update");
$route->delete("/id/{user_id}", "Users:delete");

$route->group(null);

$route->group("/faqs"); // select by id
$route->namespace("Source\Controller");

$route->get("/list","Faqs:listAll");
$route->get("/list/{faq_id}","Faqs:listById");
$route->post("/","Faqs:insert");
$route->put("/{faq_id}","Faqs:update");
$route->delete("/{faq_id}","Faqs:delete");
$route->group(null);

$route->group("/faqs-categories");
$route->namespace("Source\Controller");

$route->get("/list","FaqsCategories:listAll");
$route->get("/list/{category_id}","FaqsCategories:listById");
$route->put("/{category_id}","FaqsCategories:update");
$route->post("/","FaqsCategories:insert"); // insert
$route->delete("/{category_id}","FaqsCategories:delete"); // delete
$route->group(null);

$route->group("/shares");
$route->namespace("Source\Controller");

$route->get("/hello", "Shares:hello");
$route->get("/list", "Shares:listAll");
$route->get("/id/{share_id}", "Shares:listById");
$route->delete("/id/{share_id}", "Shares:delete");
$route->post("/", "Shares:insert");
$route->get("/id/user/{user_id}", "Shares:listByUser");
$route->get("/id/occurrence/{occurrence_id}", "Shares:listByOccurrence");

$route->group(null);


$route->group("/notifications");
$route->namespace("Source\Controller");

$route->get("/hello", "Notifications:hello");
$route->get("/list", "Notifications:listAll");
$route->get("/id/{notification_id}", "Notifications:listById");
$route->delete("/id/{notification_id}", "Notifications:delete");
$route->post("/", "Notifications:insert");
$route->put("/read/{notification_id}", "Notifications:readNotification");

$route->group(null);

$route->group("/services");
$route->namespace("Source\Controller");

$route->get("/hello", "Services:hello");
$route->get("/list", "Services:listAll");
$route->get("/id/{service_id}", "Services:listById");
$route->delete("/id/{service_id}", "Services:delete");
$route->post("/", "Services:insert");
$route->put("/id/{service_id}", "Services:update");

$route->group(null);


$route->dispatch();

/** ERROR REDIRECT */
if ($route->error()) {
    header('Content-Type: application/json; charset=UTF-8');
    //http_response_code(404);

    echo json_encode([
        "code" => 404,
        "status" => "not_found",
        "message" => "URL não encontrada"
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

}

ob_end_flush();