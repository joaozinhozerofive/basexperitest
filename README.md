# Xperi - Micro-framework Node.js

## Introdução

O **Xperi** é um micro-framework criado do zero por um desenvolvedor júnior, sem a utilização de recursos de outros frameworks. Baseado em middlewares, o Xperi facilita a autenticação e o gerenciamento de módulos parciais.

Este framework é leve e flexível, oferecendo suporte para diferentes tipos de requisições e diversas funcionalidades que ajudam a construir aplicações robustas de forma eficiente.

## Características

### 1. Gerenciador de Rotas

- **Gerenciamento de Rotas**: Crie e gerencie rotas com JavaScript puro. Defina parâmetros diretamente na URL da rota sem a necessidade de usar "query parameters".

### 2. Suporte a Requisições `multipart/form-data`

- **Campos e Arquivos**: Os campos e arquivos enviados em uma requisição `multipart/form-data` são armazenados diretamente no objeto da requisição.
- **Configurações Flexíveis**: Configure o diretório de upload dos arquivos, o tamanho máximo dos arquivos e defina exceções para regras de upload.

### 3. Suporte a Requisições `application/json`

- **Armazenamento de JSON**: O JSON enviado em uma requisição `application/json` é armazenado diretamente no objeto da requisição.

### 4. Suporte a Requisições `application/xml`

- **Conversão de XML**: Utilizando a biblioteca `xml2js`, o XML recebido é convertido em JSON, melhorando o fluxo de trabalho com os dados recebidos.

### 5. Envio Automático de Respostas JSON

- **Respostas JSON**: Envie respostas automáticas em formato JSON de forma simplificada.

### 6. Uso de Middlewares

- **Configuração e Captura de Erros**: Utilize middlewares para configuração do framework e captura de erros, oferecendo uma maneira eficiente de gerenciar o fluxo de requisições e respostas.

### 7. Fornecimento de CORS Integrado

- **Controle de Origem**: Bloqueie requisições com origens diferentes das permitidas e configure headers e outras opções de CORS, tanto em módulos quanto em rotas específicas.

### 8. Simplificação do Envio de Respostas JSON

- **Facilidade de Resposta**: Simplifique o envio de respostas JSON para uma experiência de desenvolvimento mais ágil.

### 9. Facilidade na Criação de Middlewares

- **Criação Simples**: Adicione e configure middlewares com facilidade para estender a funcionalidade do framework conforme necessário.

### 10. Adição de Parâmetros ao Objeto da Requisição

- **Gerenciamento de Estados**: Adicione parâmetros diretamente ao objeto da requisição para gerenciar estados e informações adicionais.

## Bibliotecas Utilizadas

- **[formidable](https://github.com/formidablejs/formidable)**: Para o gerenciamento de uploads de arquivos.
  ![Formidable](https://raw.githubusercontent.com/node-formidable/formidable/master/logo.png)

- **[xml2js](https://github.com/abbelk/xml2js)**: Para a conversão de XML em JSON.

## Instalação

Para instalar o Xperi, execute o seguinte comando:

```sh
npm install xperi
 -- adicione as seguintes informações

import xperi from 'xperi';

export const app = xperi();


Em outro arquivo importe o app

import { app } from "./app";

const PORT = 5050;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
