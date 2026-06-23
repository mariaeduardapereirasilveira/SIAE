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
$route->get("/products/list", "Products:productsList");
//$route->get("/users/list", "Users:usersList");

$route->group("/occurrences");
$route->namespace("Source\Controller");

$route->get("/hello", "Occurrences:hello");
$route->get("/list", "Occurrences:listAll");
$route->get("/id/{occurrence_id}", "Occurrences:listById");
$route->post("/", "Occurrences:insert");
$route->put("/id/{occurrence_id}", "Occurrences:update");
$route->delete("/id/{occurrence_id}", "Occurrences:delete");


$route->group("/users");
$route->namespace("Source\Controller");

$route->get("/hello", "Users:hello");
$route->get("/list", "Users:listAll");
$route->get("/id/{user_id}", "Users:listById");
$route->post("/", "Users:insert");
$route->post("/login", "Users:login");
$route->put("/id/{user_id}", "Users:update");
$route->delete("/id/{user_id}", "Users:delete");

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