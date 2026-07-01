# Web Service - Documentação da API


## Versionamento
O desenvolvimento do Web Service foi realizado utilizando o sistema de controle de versão Git, permitindo o acompanhamento de todas as alterações realizadas durante o desenvolvimento.
O código-fonte encontra-se armazenado em um repositório no GitHub, contendo todo o histórico de versões do projeto, facilitando sua manutenção, colaboração e evolução.


## Estrutura da documentação
Para cada endpoint da API são apresentados os seguintes itens:
Método HTTP utilizado (GET, POST, PUT, PATCH ou DELETE);
URL da rota;
Descrição da funcionalidade;
Parâmetros aceitos (quando houver);
Corpo da requisição (Request Body), quando necessário;
Exemplo de requisição;
Exemplo de resposta;
Códigos de status HTTP retornados;
Possíveis mensagens de erro.

## Formato das requisições
As requisições que enviam dados para a API utilizam o formato JSON.
Exemplo:
{
    "campo": "valor"
}

As respostas também são retornadas em JSON.
Exemplo:
{
    "success": true,
    "message": "Operação realizada com sucesso."
}


## Códigos de Status HTTP
A API utiliza os principais códigos de status HTTP para indicar o resultado das operações.
Código - Significado
200 - Requisição realizada com sucesso.
201 - Recurso criado com sucesso.
400 - Requisição inválida ou dados incorretos.
401 - Usuário não autenticado ou token inválido.
403 - Usuário sem permissão para realizar a operação.
404 - Recurso não encontrado.
409 - Conflito de dados (quando aplicável).
500 - Erro interno do servidor.



# Endpoints
A seguir são apresentadas todas as rotas disponíveis na API, contendo suas descrições, parâmetros, exemplos de utilização e respectivos retornos.

## Occurrence Routes

GET /occurrences/hello
URL: http://localhost/siae/api/occurrences/hello
Descrição
Verifica se o serviço de ocorrências está disponível. Esta rota é utilizada apenas para testes de funcionamento da API.

Parâmetros
Nenhum.

Exemplo de requisição
GET /occurrences/hello
Resposta esperada
HELLO OCCURRENCES

## Códigos de Status HTTP
Código - Significado
200 - Serviço disponível.


GET /occurrences/list
URL: http://localhost/siae/api/occurrences/list

Descrição
Retorna todas as ocorrências cadastradas no sistema.

Parâmetros
Nenhum.

Exemplo de requisição
GET /occurrences/list
Resposta esperada
[
   {
       "id": 1,
       "servicesId": 1,
       "sectorsId": 2,
       "userId": 3,
       "studentsId": 1,
       "title": "Falta recorrente",
       "description": "Aluno apresentou faltas consecutivas.",
       "status": "Ativo",
       "secrecyLevel": "Todas as entidades",
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00",
       "active": 1,
       "class": "7º Ano A"
   }
]

## Códigos de Status HTTP
Código - Significado
200 - Ocorrências retornadas com sucesso.
404 - Nenhuma ocorrência encontrada.


GET /occurrences/id/{occurrence_id}
URL: http://localhost/siae/api/occurrences/id/{occurrence_id}

Descrição
Retorna os dados de uma ocorrência específica utilizando seu identificador.

Parâmetros
Campo
Tipo
Obrigatório
Descrição
occurrence_id
integer
Sim
Identificador da ocorrência.

Exemplo de requisição
GET /occurrences/id/1
Resposta esperada
{
   "id": 1,
   "servicesId": 1,
   "sectorsId": 2,
   "userId": 3,
   "studentsId": 1,
   "title": "Falta recorrente",
   "description": "Aluno apresentou faltas consecutivas.",
   "status": "Ativo",
   "secrecyLevel": "Todas as entidades",
   "createdAt": "2026-06-30 14:30:00",
   "updatedAt": "2026-06-30 14:30:00",
   "active": 1,
   "class": "7º Ano A"
}

## Códigos de Status HTTP
Código - Significado
200 - Ocorrência encontrada com sucesso.
400 - ID inválido ou não informado.
404 - Ocorrência não encontrada.
500 - Erro interno do servidor.


POST /occurrences
URL: http://localhost/siae/api/occurrences/

Descrição
Realiza o cadastro de uma nova ocorrência no sistema.

Parâmetros 
Campo - Tipo - Obrigatório - Descrição
services_id - integer - Sim - Identificador do serviço relacionado à ocorrência.
sectors_id - integer - Sim - Identificador do setor responsável.
user_id - integer - Sim - Identificador do usuário responsável pelo registro.
student_id - integer - Sim - Identificador do aluno relacionado à ocorrência.
title - string - Sim - Título da ocorrência.
description - string - Não - Descrição detalhada da ocorrência.
status - string - Sim - Situação da ocorrência.
secrecy_level - string - Sim - Define o nível de sigilo da ocorrência.
class - string - Não - Turma do aluno.

Exemplo de requisição
{
   "services_id": 1,
   "sectors_id": 2,
   "user_id": 3,
   "student_id": 1,
   "title": "Falta recorrente",
   "description": "Aluno apresentou faltas consecutivas.",
   "status": "Ativo",
   "secrecy_level": "Todas as entidades",
   "class": "7º Ano A"
}
Resposta esperada
{
   "code": 201,
   "type": "success",
   "status": "success",
   "message": "Ocorrência cadastrada com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
201 - Ocorrência cadastrada com sucesso.
500 - Erro interno do servidor.


PUT /occurrences/id/{occurrence_id}
URL: http://localhost/siae/api/occurrences/id/{occurrence_id}

Descrição
Atualiza uma ocorrência existente. Apenas os campos enviados na requisição serão modificados, um campo podendo sim não ser modificado.

Parâmetros
Campo - Tipo - Obrigatório - Descrição
occurrence_id - integer - Sim - Identificador da ocorrência.

Exemplo de requisição
{
   "status": "Encerrado",
   "description": "Ocorrência encerrada após atendimento."
}
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Ocorrência atualizada com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Ocorrência atualizada com sucesso.
400 - ID inválido ou nenhum campo informado para atualização.
400 - Nenhum campo para atualização foi informado.
500 - Erro interno do servidor.


DELETE /occurrences/id/{occurrence_id}
URL: http://localhost/siae/api/occurrences/id/{occurrence_id}

Descrição
Realiza a exclusão suave (soft delete) de uma ocorrência, alterando o campo active para 0. Os dados permanecem armazenados no banco de dados para fins de histórico.

Parâmetros
Campo - Tipo - Obrigatório - Descrição
occurrence_id - integer - Sim - Identificador da ocorrência.

Exemplo de requisição
DELETE /occurrences/id/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Ocorrência desativada com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Ocorrência desativada com sucesso.
400 - ID inválido ou não informado.
500 - Erro interno do servidor.



## Sector Routes

GET /sectors/hello
URL: http://localhost/siae/api/sectors/hello

Descrição
Verifica se o serviço de setores está disponível. Esta rota é utilizada apenas para testes de funcionamento da API.

Parâmetros
Nenhum.

Exemplo de requisição
GET /sectors/hello

Resposta esperada
HELLO SECTORS

## Códigos de Status HTTP
Código
Significado
200
Serviço disponível.


GET /sectors/list
URL: http://localhost/siae/api/sectors/list

Descrição
Retorna todos os setores cadastrados no sistema.

Parâmetros
Nenhum.
Exemplo de requisição
GET /sectors/list
Resposta esperada
[
   {
       "id": 1,
       "name": "Coordenação Pedagógica",
       "description": "Responsável pelo acompanhamento pedagógico dos alunos.",
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00",
       "active": 1
   }
]

## Códigos de Status HTTP
Código - Significado
200 - Setores retornados com sucesso.
404 - Nenhum setor encontrado.
500 - Erro interno do servidor.


GET /sectors/id/{sector_id}
URL: http://localhost/siae/api/sectors/id/{sector_id}

Descrição
Retorna os dados de um setor específico utilizando seu identificador.

Parâmetros - Campo - Tipo - Obrigatório - Descrição
sector_id - integer - Sim - Identificador do setor.

Exemplo de requisição
GET /sectors/id/1
Resposta esperada
{
   "id": 1,
   "name": "Coordenação Pedagógica",
   "description": "Responsável pelo acompanhamento pedagógico dos alunos."
}

## Códigos de Status HTTP
Código - Significado
200 - Setor encontrado com sucesso.
400 - ID inválido ou não informado.
404 - Setor não encontrado.
500 - Erro interno do servidor.


POST /sectors
URL: http://localhost/siae/api/sectors/

Descrição
Realiza o cadastro de um novo setor no sistema.

Parâmetros
Campo - Tipo - Obrigatório - Descrição
name - string - Sim - Nome do setor.
description - string - Não - Descrição do setor.

Exemplo de requisição
{
   "name": "Coordenação Pedagógica",
   "description": "Responsável pelo acompanhamento pedagógico dos alunos."
}
Resposta esperada
{
   "code": 201,
   "type": "success",
   "status": "success",
   "message": "Setor cadastrado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
201 - Setor cadastrado com sucesso.
500 - Erro interno do servidor.


PUT /sectors/id/{sector_id}
URL: http://localhost/siae/api/sectors/id/{sector_id}

Descrição
Atualiza as informações de um setor existente. Apenas os campos enviados na requisição serão modificados.

Parâmetros
Campo - Tipo - Obrigatório - Descrição
sector_id - integer - Sim - Identificador do setor.

Exemplo de requisição
{
   "name": "Orientação Educacional",
   "description": "Responsável pelo acompanhamento disciplinar dos alunos."
}
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Setor atualizado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Setor atualizado com sucesso.
400 - ID inválido ou nenhum campo informado para atualização.
400 - Nenhum campo para atualização foi informado.
500 - Erro interno do servidor.


DELETE /sectors/id/{sector_id}
URL: http://localhost/siae/api/sectors/id/{sector_id}

Descrição
Realiza a exclusão sauve (soft delete) de um setor, alterando o campo active para 0. Os dados permanecem armazenados no banco de dados para fins de histórico.

Parâmetros
Campo - Tipo - Obrigatório - Descrição
sector_id - integer - Sim - Identificador do setor.

Exemplo de requisição
DELETE /sectors/id/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Setor desativado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Setor desativado com sucesso.
400 - ID inválido ou não informado.
500 - Erro interno do servidor.





## Report Routes

GET /reports/hello
URL: http://localhost/siae/api/reports/hello
Descrição
Verifica se o serviço de relatórios está disponível. Esta rota é utilizada apenas para testes de funcionamento da API.
Parâmetros
Nenhum.
Exemplo de requisição
GET /reports/hello
Resposta esperada
HELLO REPORTS

## Códigos de Status HTTP
Código - Significado

200 - Serviço disponível.


GET /reports/list
URL: http://localhost/siae/api/reports/list
Descrição
Retorna todos os relatórios cadastrados no sistema.
Parâmetros
Nenhum.
Exemplo de requisição
GET /reports/list
Resposta esperada
[
   {
       "id": 1,
       "userId": 2,
       "title": "Relatório de Atendimento",
       "content": "Descrição detalhada do atendimento realizado.",
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00",
       "active": 1
   }
]

## Códigos de Status HTTP
Código - Significado

200 - Relatórios retornados com sucesso.
404 - Nenhum relatório encontrado.
500 - Erro interno do servidor.


GET /reports/id/{report_id}
URL: http://localhost/siae/api/reports/id/{report_id}
Descrição
Retorna os dados de um relatório específico utilizando seu identificador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
report_id - integer - Sim - Identificador do relatório.

Exemplo de requisição
GET /reports/id/1
Resposta esperada
{
   "id": 1,
   "userId": 2,
   "title": "Relatório de Atendimento",
   "description": "Descrição detalhada do atendimento realizado.",
   "createdAt": "2026-06-30 14:30:00",
   "updatedAt": "2026-06-30 14:30:00",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado

200 - Relatório encontrado com sucesso.
400 - ID inválido ou não informado.
404-  Relatório não encontrado.
500 - Erro interno do servidor.


POST /reports
URL: http://localhost/siae/api/reports/
Descrição
Realiza o cadastro de um novo relatório no sistema.
Campo - Tipo - Obrigatório - Descrição
user_id - integer - Sim-  Identificador do usuário responsável pelo relatório.
title - string-  Sim - Título do relatório.
content - string- Sim - Conteúdo do relatório.

Exemplo de requisição
{
   "user_id": 2,
   "title": "Relatório de Atendimento",
   "content": "Descrição detalhada do atendimento realizado."
}
Resposta esperada
{
   "code": 201,
   "type": "success",
   "status": "success",
   "message": "Relatório cadastrado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado

201 - Relatório cadastrado com sucesso.
500 - Erro interno do servidor.


PUT /reports/id/{report_id}
URL: http://localhost/siae/api/reports/id/{report_id}
Descrição
Atualiza as informações de um relatório existente. Apenas os campos enviados na requisição serão modificados.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
report_id - integer - Sim - Identificador do relatório.

Exemplo de requisição
{
   "title": "Relatório Final",
   "content": "Conteúdo atualizado do relatório."
}
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Relatório atualizado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado

200 - Relatório atualizado com sucesso.
400 - ID inválido ou nenhum campo informado para atualização.
400 - Nenhum campo para atualização foi informado.
500 - Erro interno do servidor.


DELETE /reports/id/{report_id}
URL: http://localhost/siae/api/reports/id/{report_id}
Descrição
Realiza a exclusão suave (soft delete) de um relatório, alterando o campo active para 0. Os dados permanecem armazenados no banco de dados para fins de histórico.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
report_id-  integer - Sim - Identificador do relatório.

Exemplo de requisição
DELETE /reports/id/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Relatório desativado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado

200 - Relatório desativado com sucesso.
400 - ID inválido ou não informado.
500 - Erro interno do servidor.





## User Routes

GET /users/hello
URL: http://localhost/siae/api/users/hello
Descrição
Verifica se o serviço de usuários está disponível. Esta rota é utilizada apenas para testes de funcionamento da API.
Parâmetros
Nenhum.
Exemplo de requisição
GET /users/hello
Resposta esperada
HELLO USERS

## Códigos de Status HTTP
Código - Significado

200 - Serviço disponível.


GET /users/list
URL: http://localhost/siae/api/users/list
Descrição
Retorna todos os usuários cadastrados no sistema.
Parâmetros
Nenhum.
Exemplo de requisição
GET /users/list
Resposta esperada
[
   {
       "id": 1,
       "sectorId": 1,
       "classId": 1,
       "name": "João Silva",
       "email": "joao@email.com",
       "photo": "foto.jpg",
       "enrollment": "20250001",
       "dateBirth": "1990-05-20",
       "active": 1
   }
]

## Códigos de Status HTTP
Código - Significado

200 - Usuários retornados com sucesso.
404 - Nenhum usuário encontrado.
500 - Erro interno do servidor.


GET /users/id/{user_id}
URL: http://localhost/siae/api/users/id/{user_id}
Descrição
Retorna os dados de um usuário específico utilizando seu identificador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
user_id - integer - Sim - Identificador do usuário.

Exemplo de requisição
GET /users/id/1
Resposta esperada
{
   "id": 1,
   "sectorId": 1,
   "classId": 1,
   "name": "João Silva",
   "email": "joao@email.com",
   "photo": "foto.jpg",
   "enrollment": "20250001",
   "dateBirth": "1990-05-20",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
200 - Usuário encontrado com sucesso.
400 - ID inválido ou não informado.
404 - Usuário não encontrado.
500 - Erro interno do servidor.


POST /users
URL: http://localhost/siae/api/users/
Descrição
Realiza o cadastro de um novo usuário no sistema. Esta operação é permitida apenas para usuários autenticados com perfil de administrador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
sector_id - integer - Sim - Identificador do setor do usuário.
class_id - integer - Sim - Identificador do tipo de usuário.
name - string - Sim - Nome completo do usuário.
email - string - Sim - E-mail do usuário.
password - string - Sim - Senha de acesso.
photo - string - Não - Caminho ou nome da foto do usuário.
enrollment - string - Sim - Matrícula do usuário.
dateBirth - string - Sim - Data de nascimento do usuário.

Exemplo de requisição
{
   "sector_id": 1,
   "class_id": 2,
   "name": "João Silva",
   "email": "joao@email.com",
   "password": "123456",
   "photo": "foto.jpg",
   "enrollment": "20250001",
   "dateBirth": "1990-05-20"
}
Resposta esperada
{
   "code": 201,
   "type": "success",
   "status": "success",
   "message": "Usuário cadastrado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
201 - Usuário cadastrado com sucesso.
401 - Apenas administradores podem realizar esta ação.
500 - Erro interno do servidor.


POST /users/login
URL: http://localhost/siae/api/users/login
Descrição
Realiza a autenticação de um usuário utilizando e-mail e senha, retornando um token de acesso para utilização nas demais operações da API.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
string - Sim - E-mail do usuário.
password - string - Sim - Senha do usuário.

Exemplo de requisição
{
   "email": "joao@email.com",
   "password": "123456"
}
Resposta esperada
{
   "id": 1,
   "name": "João Silva",
   "photo": "foto.jpg",
   "token": "eyJhbGciOiJIUzI1NiIs..."
}

## Códigos de Status HTTP
Código - Significado
200 - Usuário autenticado com sucesso.
400 - E-mail ou senha inválidos ou não informados.
400 - Nenhum campo para atualização foi informado.
500 - Erro interno do servidor


POST /users/login/admin
URL: http://localhost/siae/api/users/login/admin
Descrição
Realiza a autenticação de um usuário com perfil de administrador. Apenas usuários pertencentes ao grupo de administradores conseguem efetuar o login por esta rota.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
email - string - Sim - E-mail do administrador.
password - string - Sim - Senha do administrador.

Exemplo de requisição
{
   "email": "admin@email.com",
   "password": "123456"
}
Resposta esperada
{
   "id": 1,
   "name": "Administrador",
   "photo": "admin.jpg",
   "token": "eyJhbGciOiJIUzI1NiIs...",
   "enrollment": "ADM001"
}

## Códigos de Status HTTP
Código - Significado
200 - Administrador autenticado com sucesso.
400 - Dados inválidos ou não informados.
401 - Usuário não autorizado ou credenciais inválidas.


PUT /users/id/{user_id}
URL: http://localhost/siae/api/users/id/{user_id}
Descrição
Atualiza as informações de um usuário existente. Apenas os campos enviados na requisição serão modificados.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
user_id - integer - Sim - Identificador do usuário.

Exemplo de requisição
{
   "name": "João da Silva",
   "email": "joao@email.com",
   "password": "novaSenha123",
   "photo": "novaFoto.jpg"
}
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Usuário atualizado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Usuário atualizado com sucesso.
400 - ID inválido ou nenhum campo informado para atualização.
400 - Nenhum campo para atualização foi informado.
500 - Erro interno do servidor.


DELETE /users/id/{user_id}
URL: http://localhost/siae/api/users/id/{user_id}
Descrição
Realiza a exclusão suave (soft delete) de um usuário, alterando o campo active para 0. Esta operação é permitida apenas para administradores.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
user_id - integer - Sim - Identificador do usuário.

Exemplo de requisição
DELETE /users/id/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Usuário desativado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Usuário desativado com sucesso.
400 - ID inválido ou não informado.
401 - Apenas administradores podem realizar esta ação.
500 - Erro interno do servidor.





## FAQ Routes

GET /faqs/list
URL: http://localhost/siae/api/faqs/list
Descrição
Retorna todas as perguntas frequentes (FAQs) cadastradas no sistema.
Parâmetros
Nenhum.
Exemplo de requisição
GET /faqs/list
Resposta esperada
[
   {
       "id": 1,
       "faqsCategoryId": 1,
       "question": "Como cadastrar uma ocorrência?",
       "answer": "Acesse o menu Ocorrências e selecione a opção Nova Ocorrência.",
       "active": 1
   }
]

## Códigos de Status HTTP
Código - Significado
200 - FAQs retornadas com sucesso.
500 - Erro interno do servidor.


GET /faqs/list/{faq_id}
URL: http://localhost/siae/api/faqs/list/{faq_id}
Descrição
Retorna os dados de uma FAQ específica utilizando seu identificador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
faq_id - integer - Sim - Identificador da FAQ.

Exemplo de requisição
GET /faqs/list/1
Resposta esperada
{
   "id": 1,
   "faqsCategoryId": 1,
   "question": "Como cadastrar uma ocorrência?",
   "answer": "Acesse o menu Ocorrências e selecione a opção Nova Ocorrência.",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
200 - FAQ encontrada com sucesso.
400 - ID inválido ou não informado.
404 - FAQ não encontrada.
500 - Erro interno do servidor.


POST /faqs
URL: http://localhost/siae/api/faqs/
Descrição
Realiza o cadastro de uma nova pergunta frequente (FAQ). Esta operação é permitida apenas para usuários autenticados com perfil de administrador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
faqs_category_id - integer - Sim - Identificador da categoria da FAQ.
question - string - Sim - Pergunta da FAQ.
answer - string - Sim - Resposta da FAQ.

Exemplo de requisição
{
   "faqs_category_id": 1,
   "question": "Como cadastrar uma ocorrência?",
   "answer": "Acesse o menu Ocorrências e selecione a opção Nova Ocorrência."
}
Resposta esperada
{
   "faq_id": 1,
   "faqs_category_id": 1,
   "question": "Como cadastrar uma ocorrência?",
   "answer": "Acesse o menu Ocorrências e selecione a opção Nova Ocorrência.",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
201 - FAQ cadastrada com sucesso.
400 - Dados obrigatórios inválidos ou não informados.
401 - Apenas administradores podem realizar esta ação.
500 - Erro interno do servidor.


PUT /faqs/{faq_id}
URL: http://localhost/siae/api/faqs/{faq_id}
Descrição
Atualiza as informações de uma FAQ existente. Todos os campos da FAQ devem ser informados na requisição. Esta operação é permitida apenas para usuários autenticados com perfil de administrador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
faq_id - integer - Sim - Identificador da FAQ.

Corpo da requisição
Campo - Tipo - Obrigatório - Descrição
faqs_category_id - integer - Sim - Identificador da categoria da FAQ.
question - string - Sim - Pergunta da FAQ.
answer - string - Sim - Resposta da FAQ.

Exemplo de requisição
{
   "faqs_category_id": 1,
   "question": "Como editar uma ocorrência?",
   "answer": "Acesse a ocorrência desejada e selecione a opção Editar."
}
Resposta esperada
{
   "id": 1,
   "faqsCategoryId": 1,
   "question": "Como editar uma ocorrência?",
   "answer": "Acesse a ocorrência desejada e selecione a opção Editar.",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
200 - FAQ atualizada com sucesso.
400 - ID inválido ou dados obrigatórios inválidos.
400 - Os campos question, answer e faqs_category_id são obrigatórios.
401 - Apenas administradores podem realizar esta ação.
500 - Erro interno do servidor.


DELETE /faqs/{faq_id}
URL: http://localhost/siae/api/faqs/{faq_id}
Descrição
Realiza a exclusão lógica (soft delete) de uma FAQ, alterando o campo active para 0. Esta operação é permitida apenas para usuários autenticados com perfil de administrador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
faq_id - integer - Sim - Identificador da FAQ.

Exemplo de requisição
DELETE /faqs/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "FAQ desativada com sucesso"
}

## Códigos de Status HTTP
Código - Significado
200 - FAQ desativada com sucesso.
400 - ID inválido ou não informado.
401 - Apenas administradores podem realizar esta ação.
404 - FAQ não encontrada.
500 - Erro interno do servidor.





## FAQ Categories Routes

GET /faqs-categories/list
URL: http://localhost/siae/api/faqs_categories/list
Descrição
Retorna todas as categorias de FAQs cadastradas no sistema.
Parâmetros
Nenhum.
Exemplo de requisição
GET /faqs-categories/list
Resposta esperada
[
   {
       "id": 1,
       "name": "Ocorrências",
       "active": 1
   }
]

## Códigos de Status HTTP
Código - Significadoo
200 - Categorias de FAQ retornadas com sucesso.
500 - Erro interno do servidor.


GET /faqs-categories/list/{category_id}
URL: http://localhost/siae/api/faqs_categories/list/{category_id}
Descrição
Retorna os dados de uma categoria de FAQ específica utilizando seu identificador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
category_id - integer - Sim - Identificador da categoria de FAQ.

Exemplo de requisição
GET /faqs-categories/list/1
Resposta esperada
{
   "id": 1,
   "name": "Ocorrências",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
200 - Categoria de FAQ encontrada com sucesso.
400 - ID inválido ou não informado.
404 - Categoria de FAQ não encontrada.
500 - Erro interno do servidor.


POST /faqs-categories
URL: http://localhost/siae/api/faqs_categories/
Descrição
Realiza o cadastro de uma nova categoria de FAQ. Esta operação é permitida apenas para usuários autenticados com perfil de administrador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
name - string - Sim - Nome da categoria de FAQ.

Exemplo de requisição
{
   "name": "Ocorrências"
}
Resposta esperada
{
   "faq_category_id": 1,
   "name": "Ocorrências",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
201 - Categoria de FAQ cadastrada com sucesso.
400 - Dados obrigatórios inválidos ou não informados.
401 - Apenas administradores podem realizar esta ação.
500 - Erro interno do servidor.


PUT /faqs-categories/{category_id}
URL: http://localhost/siae/api/faqs_categories/{category_id}
Descrição
Atualiza as informações de uma categoria de FAQ existente. O nome da categoria deve ser informado na requisição. Esta operação é permitida apenas para usuários autenticados com perfil de administrador.
Campo - Tipo - Obrigatório - Descrição
category_id - integer - Sim - Identificador da categoria de FAQ.

Corpo da requisição
Campo - Tipo - Obrigatório - Descrição
name - string - Sim - Novo nome da categoria de FAQ.

Exemplo de requisição
{
   "name": "Atendimentos"
}
Resposta esperada
{
   "id": 1,
   "name": "Atendimentos",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
200 - Categoria de FAQ atualizada com sucesso.
400 - ID inválido ou dados obrigatórios inválidos.
400 - Os campos name são obrigatórios.
401 - Apenas administradores podem realizar esta ação.
500 - Erro interno do servidor.


DELETE /faqs-categories/{category_id}
URL: http://localhost/siae/api/faqs_categories/{category_id}
Descrição
Realiza a exclusão lógica (soft delete) de uma categoria de FAQ, alterando o campo active para 0. Esta operação é permitida apenas para usuários autenticados com perfil de administrador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
category_id - integer - Sim - Identificador da categoria de FAQ.

Exemplo de requisição
DELETE /faqs-categories/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Categoria de FAQ desativada com sucesso"
}

## Códigos de Status HTTP
Código - Significado
200 - Categoria de FAQ desativada com sucesso.
400 - ID inválido ou não informado.
401 - Apenas administradores podem realizar esta ação.
404 - Categoria de FAQ não encontrada.
500 - Erro interno do servidor.


## Share Routes

GET /shares/hello
URL: http://localhost/siae/api/shares/hello
Descrição
Verifica se o serviço de compartilhamentos está disponível. Esta rota é utilizada apenas para testes de funcionamento da API.
Parâmetros
Nenhum.
Exemplo de requisição
GET /shares/hello
Resposta esperada
HELLO SHARES

## Códigos de Status HTTP
Código - Significado
200 - Serviço disponível.


GET /shares/list
URL: http://localhost/siae/api/shares/list
Descrição
Retorna todos os compartilhamentos cadastrados no sistema.
Parâmetros
Nenhum.
Exemplo de requisição
GET /shares/list
Resposta esperada
[
   {
       "id": 1,
       "occurrenceId": 2,
       "userId": 5,
       "active": 1,
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00"
   }
]

## Códigos de Status HTTP
Código - Significado
200 - Compartilhamentos retornados com sucesso.
404 - Nenhum compartilhamento encontrado.
500 - Erro interno do servidor.


GET /shares/id/{share_id}
URL: http://localhost/siae/api/shares/id/{share_id}
Descrição
Retorna os dados de um compartilhamento específico utilizando seu identificador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
share_id - integer - Sim - Identificador do compartilhamento.

Exemplo de requisição
GET /shares/id/1
Resposta esperada
{
   "id": 1,
   "occurrenceId": 2,
   "userId": 5,
   "active": 1,
   "createdAt": "2026-06-30 14:30:00",
   "updatedAt": "2026-06-30 14:30:00"
}

## Códigos de Status HTTP
Código - Significado
200 - Compartilhamento encontrado com sucesso.
400 - ID inválido ou não informado.
404 - Compartilhamento não encontrado.
500 - Erro interno do servidor.


POST /shares
URL: http://localhost/siae/api/shares/
Descrição
Realiza o compartilhamento de uma ocorrência com um usuário do sistema. Antes de realizar o cadastro, a API verifica se a ocorrência e o usuário informados existem.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
occurrence_id - integer - Sim - Identificador da ocorrência que será compartilhada.
user_id - integer - Sim - Identificador do usuário que receberá o compartilhamento.

Exemplo de requisição
{
   "occurrence_id": 2,
   "user_id": 5
}
Resposta esperada
{
   "code": 201,
   "type": "success",
   "status": "success",
   "message": "Compartilhamento criado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
201 - Compartilhamento criado com sucesso.
400 - Dados obrigatórios não informados.
404 - Usuário ou ocorrência não encontrados.
500 - Erro interno do servidor.


GET /shares/id/user/{user_id}
URL: http://localhost/siae/api/shares/id/user/{share_id}
Descrição
Retorna todos os compartilhamentos associados a um usuário específico.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
user_id - integer - Sim - Identificador do usuário.

Exemplo de requisição
GET /shares/id/user/5
Resposta esperada
[
   {
       "id": 1,
       "occurrenceId": 2,
       "userId": 5,
       "active": 1,
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00"
   },
   {
       "id": 2,
       "occurrenceId": 8,
       "userId": 5,
       "active": 1,
       "createdAt": "2026-06-30 15:10:00",
       "updatedAt": "2026-06-30 15:10:00"
   }
]

## Códigos de Status HTTP
Código - Significado
200 - Compartilhamentos encontrados com sucesso.
400 - ID inválido ou não informado.
404 - Nenhum compartilhamento encontrado para este usuário.
500 - Erro interno do servidor.


GET /shares/id/occurrence/{occurrence_id}
URL: http://localhost/siae/api/shares/id/occurrence/{occurrence_id}
Descrição
Retorna todos os compartilhamentos relacionados a uma ocorrência específica.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
occurrence_id - integer - Sim - Identificador da ocorrência.

Exemplo de requisição
GET /shares/id/occurrence/2
Resposta esperada
[
   {
       "id": 1,
       "occurrenceId": 2,
       "userId": 5,
       "active": 1,
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00"
   },
   {
       "id": 3,
       "occurrenceId": 2,
       "userId": 8,
       "active": 1,
       "createdAt": "2026-06-30 14:40:00",
       "updatedAt": "2026-06-30 14:40:00"
   }
]

## Códigos de Status HTTP
Código - Significado
200 - Compartilhamentos encontrados com sucesso.
400 - ID inválido ou não informado.
404 - Nenhum compartilhamento encontrado para esta ocorrência.
500 - Erro interno do servidor.


DELETE /shares/id/{share_id}
URL: http://localhost/siae/api/shares/id/{share_id}
Descrição
Realiza a exclusão lógica (soft delete) de um compartilhamento, alterando o campo active para 0. O compartilhamento permanece armazenado no banco de dados para fins de histórico.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
share_id - integer - Sim - Identificador do compartilhamento.

Exemplo de requisição
DELETE /shares/id/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Compartilhamento desativado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Compartilhamento desativado com sucesso.
400 - ID inválido ou não informado.
500 - Erro interno do servidor.





## Notification Routes

GET /notifications/hello
URL: http://localhost/siae/api/notifications/hello
Descrição
Verifica se o serviço de notificações está disponível. Esta rota é utilizada apenas para testes de funcionamento da API.
Parâmetros
Nenhum.
Exemplo de requisição
GET /notifications/hello
Resposta esperada
HELLO NOTIFICATIONSSSS

## Códigos de Status HTTP
Código - Significado
200 - Serviço disponível.


GET /notifications/list
URL: http://localhost/siae/api/notifications/list
Descrição
Retorna todas as notificações cadastradas no sistema.
Parâmetros
Nenhum.
Exemplo de requisição
GET /notifications/list
Resposta esperada
[
   {
       "id": 1,
       "userId": 5,
       "message": "Uma nova ocorrência foi compartilhada com você.",
       "is_read": 0,
       "active": 1,
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00"
   }
]

## Códigos de Status HTTP
Código - Significado
200 - Notificações retornadas com sucesso.
404 - Nenhuma notificação encontrada.
500 - Erro interno do servidor.


GET /notifications/id/{notification_id}
URL: http://localhost/siae/api/notifications/id/{notification_id}
Descrição
Retorna os dados de uma notificação específica utilizando seu identificador.
Parâmetros
Campo - Tipo - Obrigatório - Descrição
notification_id - integer - Sim - Identificador da notificação.

Exemplo de requisição
GET /notifications/id/1
Resposta esperada
{
   "id": 1,
   "userId": 5,
   "message": "Uma nova ocorrência foi compartilhada com você.",
   "is_read": 0,
   "active": 1,
   "createdAt": "2026-06-30 14:30:00",
   "updatedAt": "2026-06-30 14:30:00"
}

## Códigos de Status HTTP
Código - Significado
200 - Notificação encontrada com sucesso.
400 - ID inválido ou não informado.
404 - Notificação não encontrada.
500 - Erro interno do servidor.


POST /notifications
URL: http://localhost/siae/api/notifications/

Descrição
Realiza o cadastro de uma nova notificação para um usuário. Antes da criação da notificação, a API verifica se o usuário informado existe.

Parâmetros
Campo - Tipo - Obrigatório - Descrição
user_id - integer - Sim - Identificador do usuário que receberá a notificação.
message - string - Sim - Mensagem da notificação.

Exemplo de requisição
{
   "user_id": 5,
   "message": "Uma nova ocorrência foi compartilhada com você."
}
Resposta esperada
{
   "code": 201,
   "type": "success",
   "status": "success",
   "message": "Notificação cadastrada com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
201 - Notificação cadastrada com sucesso.
400 - Dados obrigatórios não informados.
404 - Usuário não encontrado.
500 - Erro interno do servidor.


PUT /notifications/read/{notification_id}
URL: http://localhost/siae/api/notifications/read/{notification_id}

Descrição
Marca uma notificação como lida, alterando o campo is_read de 0 para 1. A API verifica previamente se a notificação existe antes de realizar a atualização.

Parâmetros
Campo - Tipo - Obrigatório - Descrição
notification_id - integer - Sim - Identificador da notificação.

Exemplo de requisição
PUT /notifications/read/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Notificação marcada como lida."
}

## Códigos de Status HTTP
Código - Significado
200 - Notificação marcada como lida com sucesso.
400 - ID inválido ou não informado.
404 - Notificação não encontrada.
500 - Erro interno do servidor.


DELETE /notifications/id/{notification_id}
URL: http://localhost/siae/api/notifications/id/{notification_id} 

Descrição
Realiza a exclusão lógica (soft delete) de uma notificação, alterando o campo active para 0. A notificação permanece armazenada no banco de dados para fins de histórico.

Parâmetros
 Campo - Tipo - Obrigatório - Descrição
notification_id - integer - Sim - Identificador da notificação.

Exemplo de requisição
DELETE /notifications/id/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Notificação desativada com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Notificação desativada com sucesso.
400 - ID inválido ou não informado.
500 - Erro interno do servidor.




## Service Routes

GET /services/hello
URL: http://localhost/siae/api/services/hello

Descrição
Verifica se o serviço de atendimentos está disponível. Esta rota é utilizada apenas para testes de funcionamento da API.

Parâmetros
Nenhum.

Exemplo de requisição
GET /services/hello
Resposta esperada
HELLO SERVICES

## Códigos de Status HTTP
Código - Significado
200 - Serviço disponível.


GET /services/list
URL: http://localhost/siae/api/services/list

Descrição
Retorna todos os atendimentos cadastrados no sistema.

Parâmetros
Nenhum.

Exemplo de requisição
GET /services/list
Resposta esperada
[
   {
       "id": 1,
       "userId": 2,
       "studentsId": 15,
       "observations": "Atendimento realizado com os responsáveis.",
       "createdAt": "2026-06-30 14:30:00",
       "updatedAt": "2026-06-30 14:30:00",
       "active": 1
   }
]

## Códigos de Status HTTP
Código - Significado
200 - Serviços retornados com sucesso.
404 - Nenhum serviço encontrado.
500 - Erro interno do servidor.


GET /services/id/{service_id}
URL: http://localhost/siae/api/services/id/{service_id}
Descrição
Retorna os dados de um atendimento específico utilizando seu identificador.
Parâmetros
 Campo - Tipo - Obrigatório - Descrição
service_id - integer - Sim - Identificador do atendimento.

Exemplo de requisição
GET /services/id/1
Resposta esperada
{
   "id": 1,
   "userId": 2,
   "studentsId": 15,
   "observations": "Atendimento realizado com os responsáveis.",
   "createdAt": "2026-06-30 14:30:00",
   "updatedAt": "2026-06-30 14:30:00",
   "active": 1
}

## Códigos de Status HTTP
Código - Significado
200 - Serviço encontrado com sucesso.
400 - ID inválido ou não informado.
404 - Serviço não encontrado.
500 - Erro interno do servidor.


POST /services
URL: http://localhost/siae/api/services/
Descrição
Realiza o cadastro de um novo atendimento no sistema.
Parâmetros
Parâmetros - Campo - Tipo - Obrigatório - Descrição
user_id - integer - Sim - Identificador do profissional responsável pelo atendimento.
students_id - integer - Sim - Identificador do aluno atendido.
observations - string - Não - Observações registradas durante o atendimento.

Exemplo de requisição
{
   "user_id": 2,
   "students_id": 15,
   "observations": "Atendimento realizado com os responsáveis."
}
Resposta esperada
{
   "code": 201,
   "type": "success",
   "status": "success",
   "message": "Serviço cadastrado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
201 - Serviço cadastrado com sucesso.
500 - Erro interno do servidor.


PUT /services/id/{service_id}
URL: http://localhost/siae/api/services/id/{service_id}

Descrição
Atualiza as informações de um atendimento existente. Apenas os campos enviados na requisição serão modificados.

Parâmetros
Código - SignificadoParâmetros - Campo - Tipo - Obrigatório - Descrição
service_id - integer - Sim - Identificador do atendimento.

Exemplo de requisição
{
   "observations": "Atendimento finalizado e encaminhado para acompanhamento."
}
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Serviço atualizado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Serviço atualizado com sucesso.
400 - ID inválido ou nenhum campo informado para atualização.
500 - Erro interno do servidor.


DELETE /services/id/{service_id}
URL: http://localhost/siae/api/services/id/{service_id}

Descrição
Realiza a exclusão suave (soft delete) de um atendimento, alterando o campo active para 0. Os dados permanecem armazenados no banco de dados para fins de histórico.

Parâmetros
Parâmetros - Campo - Tipo - Obrigatório - Descrição
service_id - integer - Sim - Identificador do atendimento.

Exemplo de requisição
DELETE /services/id/1
Resposta esperada
{
   "code": 200,
   "type": "success",
   "status": "success",
   "message": "Serviço desativado com sucesso!"
}

## Códigos de Status HTTP
Código - Significado
200 - Serviço desativado com sucesso.
400 - ID inválido ou não informado.
500 - Erro interno do servidor.

