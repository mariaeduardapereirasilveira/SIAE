Informações extras sobre o código:
Código para o postMan guardar o Token: 

let response = pm.response.json();
pm.globals.set("token", response.data.token);

Códigos de retorno:
código-type-status-significado
200 - success- success-Requisição bem-sucedida, com ou sem dados de retorno.
201-success-created- Recurso criado com sucesso (usado em POST).
400- error- bad_request- Dados enviados pelo cliente são inválidos ou incompletos.
401- error- unauthorized- Usuário não está autenticado (sem token ou token inválido).
403- error- forbidden- Usuário autenticado, mas sem permissão para este recurso.
404- error- not_found- O recurso solicitado não existe.
500- error- internal_server_error- Erro inesperado no servidor.

exemplo de uso:
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de Produtos",
  "data": [
    {
      "id": 1,
      "name": "Mouse Logitech M170",
      "price": "89.90",
      "category_name": "Periféricos"
    },
    {
      "id": 2,
      "name": "Teclado Logitech K120",
      "price": "79.90",
      "category_name": "Periféricos"
    }
  ]
}
