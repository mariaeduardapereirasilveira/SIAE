# AGENT de Frontend Design

## Objetivo deste arquivo

Use este documento para orientar o planejamento visual e estrutural do frontend do sistema. Ele deve ajudar **estudantes** a descrever suas decisões de interface e também orientar **agentes de IA** a propor telas, componentes e organização de arquivos sem quebrar as convenções do projeto.

## Como preencher

* Substitua cada conteúdo entre colchetes por informações do seu sistema.
* Escreva descrições curtas, objetivas e úteis para implementação.
* Registre primeiro o **layout estático**; o consumo da API e a renderização dinâmica virão depois.

## Regras do projeto que devem ser respeitadas

* O conteúdo deve ser escrito em **Português do Brasil**.
* O código, nomes de arquivos, classes, funções e identificadores devem ficar em **English**.
* O frontend deve usar **HTML semântico**.
* Não utilizar `<div>` e não utilizar `<table>` para montar interface.
* Não utilizar `jQuery`.
* Não utilizar eventos inline no HTML.
* Usar `document.querySelector` no JavaScript.
* Requisições HTTP devem usar `HttpClientBase.js` quando a integração com API começar.
* Arquivos compartilhados devem ir em `views/assets/_common/`; arquivos específicos devem ficar em `views/assets/public/`, `views/assets/app/` ou `views/assets/admin/`.

## Escopo inicial do frontend

* Nesta etapa, os dados serão exibidos de forma **estática**.
* O JavaScript poderá ser usado para comportamentos como `menu responsivo`, `abrir e fechar painéis`, `alternar listas`, `máscaras visuais` e `interações de navegação`.
* Não planeje regra de negócio no frontend; a View apenas apresenta dados e interações da interface.

## Contexto geral da interface

* Nome do sistema: `SIAE - Sistema Integrado de Atendimento ao Estudante`
* Objetivo principal: `Centralizar e gerenciar atendimentos estudantis, integrando os setores de Orientação Educacional, Psicologia e Enfermaria com controle de acesso seguro e acompanhamento do histórico dos estudantes.`
* Público principal: `Orientadores educacionais, psicólogos escolares, profissionais da enfermaria e administradores.`
* Dispositivos prioritários: `Desktop, tablet e mobile`
* Estilo desejado: `Institucional, moderno, sofisticado e minimalista`

## Área Pública (`public`)

* Quem acessa: `Usuários não autenticados`
* Objetivo da área: `Permitir acesso seguro ao sistema através da tela de login`
* Telas previstas: `login`, `recuperação de senha`
* Componentes principais: `header`, `formulário de login`, `logo institucional`, `botão de acesso`, `mensagens de erro`
* Ação principal esperada do usuário: `Realizar login no sistema`

## Área de Aplicação (`app`)

* Quem acessa: `Usuários autenticados`
* Objetivo da área: `Registrar, acompanhar e gerenciar atendimentos estudantis de forma integrada e segura`
* Telas previstas: `dashboard`, `perfil`, `cadastro de estudantes`, `registro de atendimentos`, `histórico`, `ocorrências`, `notificações`, `relatórios`, `configurações`
* Componentes principais: `menu lateral`, `barra superior`, `cards`, `formulários`, `listas`, `filtros`, `notificações`
* Ação principal esperada do usuário: `Registrar e acompanhar atendimentos estudantis`

## Área Administrativa (`admin`)

* Quem acessa: `Administradores do sistema`
* Objetivo da área: `Gerenciar estudantes, usuários, permissões, setores e configurações do sistema`
* Telas previstas: `painel administrativo`, `gestão de usuários`, `cadastro de estudantes`, `gestão de permissões`, `relatórios`, `configurações`
* Componentes principais: `indicadores`, `filtros`, `formulários`, `cards administrativos`, `listas de gerenciamento`
* Ação principal esperada do usuário: `Gerenciar usuários, estudantes e permissões da plataforma`

## Navegação e organização visual

* Estrutura de navegação principal: `Menu lateral fixo com barra superior`
* Fluxo entre telas: `Login > Dashboard > Navegação entre estudantes, atendimentos, ocorrências e relatórios`
* Hierarquia visual: `Login em destaque na área pública; dashboards, notificações e informações importantes em destaque nas áreas internas`
* Estados importantes da interface: `vazio`, `carregando`, `erro visual`, `sucesso`, `acesso negado`, `salvando`, `offline`

## Responsividade e acessibilidade

* Breakpoints desejados: `mobile abaixo de 768px`, `tablet entre 768px e 1023px`, `desktop acima de 1024px`
* Ajustes esperados por tela: `Menu lateral recolhível, reorganização de cards, formulários adaptados para toque e listas responsivas`
* Cuidados de acessibilidade: `Contraste adequado, tipografia legível, navegação intuitiva, feedback visual, ordem lógica de leitura e textos claros`
* Elementos semânticos esperados: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `form`, `button`

## Identidade visual

* Paleta principal: `#874537`, `#D37F7F`, `#F2E1C3`, `#54A498`, `#105446`
* Tipografia: `Fontes elegantes e sofisticadas para títulos com fontes modernas e legíveis para interface`, safira
* Referências visuais: `Dashboards modernos, sistemas administrativos premium, interfaces minimalistas sofisticadas e layouts institucionais modernos`
* Sensação que a interface deve transmitir: `Confiança, seriedade, organização, segurança, modernidade e acolhimento visual`

## Organização de arquivos esperada

* Estilos compartilhados: `views/assets/_common/styles/global.css`
* Scripts compartilhados: `views/assets/_common/scripts/global.js`
* Estilos da área pública: `views/assets/public/styles/public.css`
* Scripts da área pública: `views/assets/public/scripts/public.js`
* Estilos da aplicação: `views/assets/app/styles/app.css`
* Scripts da aplicação: `views/assets/app/scripts/app.js`
* Estilos da área administrativa: `views/assets/admin/styles/admin.css`
* Scripts da área administrativa: `views/assets/admin/scripts/admin.js`

## Limite entre etapa atual e integração futura

* Agora: criar HTML semântico, CSS e interações estáticas em JavaScript.
* Depois: integrar com a API usando `HttpClientBase.js`, tratar erros assíncronos e renderizar dados dinamicamente.
* Ao propor código, a IA deve separar o que é **mock estático** do que será substituído por dados reais depois.

## Instrução final para estudantes e IA

Antes de implementar qualquer tela, preencha este arquivo com o máximo de clareza possível. Se uma informação ainda não estiver decidida, registre como `[a definir]` em vez de inventar requisitos.
