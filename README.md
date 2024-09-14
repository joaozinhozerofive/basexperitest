Claro! Vou atualizar o README para incluir todas as opções da interface `Options` do `formidable`. Vou adicionar detalhes sobre cada uma das opções, bem como as opções personalizadas fornecidas anteriormente. 

---

# Xperi - Micro-framework Node.js

## Introdução

O **Xperi** é um micro-framework Node.js desenvolvido do zero para fornecer uma solução leve e flexível para a criação de aplicações web e APIs. Focado em simplicidade e controle, o Xperi permite o gerenciamento eficiente de rotas, middlewares e suporte a diversos tipos de requisições.

## Características

### 1. Gerenciamento de Rotas

- **Criação e Gerenciamento**: Utilize JavaScript puro para definir e gerenciar rotas. Parâmetros podem ser incluídos diretamente na URL da rota.

### 2. Suporte a Requisições `multipart/form-data`

- **Campos e Arquivos**: Campos e arquivos enviados em uma requisição `multipart/form-data` são armazenados diretamente no objeto da requisição.
- **Configurações Flexíveis**: Personalize diretórios de upload, limites de tamanho e regras para uploads.

### 3. Suporte a Requisições `application/json`

- **Armazenamento de JSON**: JSON enviado em requisições `application/json` é armazenado diretamente no objeto da requisição.

### 4. Suporte a Requisições `application/xml`

- **Conversão de XML**: O XML recebido é convertido em JSON usando a biblioteca `xml2js`, facilitando o trabalho com dados XML.

### 5. Envio Automático de Respostas JSON

- **Respostas JSON**: Envio simplificado de respostas no formato JSON.

### 6. Uso de Middlewares

- **Configuração e Captura de Erros**: Configure middlewares para tratamento de erros e gerenciamento de fluxos de requisição e resposta.

### 7. Suporte a CORS Integrado

- **Controle de Origem**: Configure CORS (Cross-Origin Resource Sharing) para controlar permissões de acesso entre diferentes origens e ajustar opções conforme necessário.

### 8. Simplificação do Envio de Respostas JSON

- **Facilidade de Resposta**: Simplifique o envio de respostas JSON para uma experiência de desenvolvimento mais eficiente.

### 9. Facilidade na Criação de Middlewares

- **Criação Simples**: Adicione e configure middlewares com facilidade para estender a funcionalidade do framework.

### 10. Adição de Parâmetros ao Objeto da Requisição

- **Gerenciamento de Estados**: Adicione parâmetros diretamente ao objeto da requisição para gerenciar estados e informações adicionais.

## Bibliotecas Utilizadas

- **[formidable](https://github.com/formidablejs/formidable)**: Biblioteca para gerenciamento de uploads de arquivos.
  ![Formidable](https://raw.githubusercontent.com/node-formidable/formidable/master/logo.png)

- **[xml2js](https://github.com/abbelk/xml2js)**: Biblioteca para conversão de XML em JSON.

## Pré-requisitos

Certifique-se de que os seguintes pré-requisitos estão instalados:

- **Node.js**: Versão 18 ou superior.

## Instalação

Para instalar o Xperi, execute o seguinte comando no terminal:

```sh
npm install xperi
```

## Criando um Servidor com Xperi

### 1. Configuração Inicial do Servidor

Crie um arquivo `app.js` e importe o Xperi para criar uma instância do servidor:

```javascript
import xperi from 'xperi';

// Crie uma instância do servidor.
export const app = xperi();
```

### 2. Configuração do Servidor

Crie um arquivo `server.js` para configurar e iniciar o servidor:

```javascript
import { RequestProps, ResponseProps } from 'xperi';
import { app } from './app';
import { routes } from './routes';
import { AppError } from './utils/app-error';

// Configuração do middleware para tratamento de erros.
app.error(async (error: unknown, req: RequestProps, res: ResponseProps) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            error: error.message,
            status: error.statusCode
        });
        return;
    }
});

// Adicione as rotas.
app.use(routes);

// Defina a porta e inicie o servidor.
const port = 9090;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

### 2.1 Tratamento de Erros

O método `app.error` permite configurar um callback para tratamento de erros. Configure este middleware antes de iniciar o servidor com `app.listen()`.

```javascript
app.error(async (error: unknown, req: RequestProps, res: ResponseProps) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            error: error.message,
            status: error.statusCode
        });
        return;
    }
});
```

### 2.2 Adicionando Middlewares

Utilize o método `app.use` para adicionar middlewares e definir rotas. Exemplo:

```javascript
app.use((req, res, next) => {
    if (req.params.user_id === 256) {
        next();
    }
}, routes);
```

### 2.3 Iniciando o Servidor

Defina a porta e inicie o servidor:

```javascript
const port = 9090;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

## Criação e Configuração de Rotas

Para definir rotas, use a função `Router()` do Xperi. Exemplo de configuração de rotas:

```javascript
import { NextFunction, RequestProps, ResponseProps, Router } from 'xperi';
import { usersRoutes } from './users-routes';

export const routes = Router();

// Middleware de autenticação e configuração de rotas
routes.use('/users/:id', (req: RequestProps, res: ResponseProps, next: NextFunction) => {
    const [, token] = req.headers.authorization.split(" ");

    if (token) {
        next({
            user: { id: 256 }
        });
    }
}, usersRoutes);

// Configuração de outras rotas
routes.use("/", (req: RequestProps, res: ResponseProps) => {
    res.status(400).json({ teste: "/ ok" });
});

routes.use('/orders', (req: RequestProps, res: ResponseProps) => {
    res.json({ teste: '/orders ok' });
});
```

### 1. Criar e Exportar um Objeto Router

Crie e exporte um objeto Router:

```javascript
export const routes = Router();
```

### 2. Adicionar o Router ao Servidor

Utilize o Router com `app.use` para definir as rotas no servidor:

```javascript
app.use(routes);
```

### 3. Configurar Rotas e Middlewares com Router

Adicione middlewares e defina rotas específicas utilizando `Router.use`:

```javascript
routes.use('/users/:id', (req: RequestProps, res: ResponseProps, next: NextFunction) => {
    const [, token] = req.headers.authorization.split(" ");

    if (token) {
        next({
            user: { id: 256 }
        });
    }
}, usersRoutes);
```

### 4. Configurar CORS de Forma Modular

Configure CORS (Cross-Origin Resource Sharing) de maneira modular. Exemplo de configuração:

```javascript
routes.use('/users/:id', (req: RequestProps, res: ResponseProps, next: NextFunction) => {
    const [, token] = req.headers.authorization.split(" ");

    if (token) {
        next({
            user: { id: 256 }
        });
    }
}, app.cors({
    origins: ["https://teste.com.br", "https://.thisproject.com.br"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    headers: ["Content-Type", "Authorization"],
    allowCredentials: true,
    maxAge: 86400,
    exposeHeaders: ["Authorization"]
}), usersRoutes);
```

### 5. Exemplo de Configuração de Rotas e Upload de Arquivos

Exemplo de configuração de rotas com suporte a upload de arquivos:

```javascript
import { OptionsFiles, Router } from "xperi";
import { app } from "../app";
import { UsersController } from "../controllers/users.controller";
import { AppError } from "../utils/app-error";

const usersRoutes = Router();
const usersController = new UsersController();

const optionsUpload: OptionsFiles = {
    keepExtensions: true,
    uploadDir: './uploads',
    allowExtensions: ['jpg', 'png'],
    exceptionMaxFileSizeExceeded: () => {
        throw new AppError('O tamanho do arquivo ultrapassou o limite de 1024 bytes.', 400);
    },
    exceptionAllowedExtensions: () => {
        throw new AppError(`Apenas arquivos com extensão ${optionsUpload.allowExtensions?.join(', ')} são permitidos.`, 400);
    },
    exceptionMaxFields: () => {
        throw new AppError('Número máximo de campos excedido.', 400);
    }
};

// Definição das rotas para usuários
usersRoutes.get('/:user_id', usersController.show);
usersRoutes.get('/', usersController.index);
usersRoutes.delete('/:user_id', usersController.delete);
usersRoutes.post('/', app.upload(optionsUpload, 'img', 'teste'), usersController.post);

export { usersRoutes };
```

**Explicação do Código**

- **`OptionsFiles`**: Configura opções para upload de arquivos.

 

  - **`keepExtensions`**: Mantém as extensões dos arquivos ao fazer o upload.
  - **`uploadDir`**: Define o diretório onde os arquivos serão armazenados.
  - **`allowExtensions`**: Lista de extensões permitidas para uploads.
  - **`exceptionMaxFileSizeExceeded`**: Função executada se o tamanho do arquivo exceder o limite definido.
  - **`exceptionAllowedExtensions`**: Função executada se a extensão do arquivo não for permitida.
  - **`exceptionMaxFields`**: Função executada se o número máximo de campos for excedido.

## Suporte a CORS Integrado

O Xperi oferece suporte integrado a CORS (Cross-Origin Resource Sharing) para gerenciar o acesso de diferentes origens à sua API. Aqui estão as propriedades disponíveis para configuração:

- **`origins`**: Define quais origens (domínios) têm permissão para acessar os recursos da API. Pode ser um array de URLs. Exemplo: `["https://example.com", "https://api.example.com"]`.

- **`methods`**: Especifica os métodos HTTP permitidos para requisições CORS. Por padrão, métodos como "GET", "POST", "PUT", "PATCH" e "DELETE" são habilitados, mas você pode customizar essa lista. Exemplo: `["GET", "POST", "PUT", "DELETE"]`.

- **`headers`**: Define quais cabeçalhos podem ser usados em requisições CORS. Pode incluir cabeçalhos personalizados. Exemplo: `["Content-Type", "Authorization"]`.

- **`allowCredentials`**: Se definido como `true`, permite que cookies e outras credenciais sejam enviados com as requisições CORS. Exemplo: `true`.

- **`maxAge`**: Define o tempo máximo (em segundos) que os resultados de uma pré-solicitação (preflight) CORS podem ser armazenados em cache pelo navegador. Exemplo: `86400` (24 horas).

- **`exposeHeaders`**: Especifica quais cabeçalhos podem ser expostos e acessados pelo cliente. Exemplo: `["Authorization"]`.

## Opções de Configuração do `formidable`

O `formidable` fornece diversas opções de configuração para o gerenciamento de uploads de arquivos e campos de formulário. Abaixo estão as opções disponíveis:

- **`encoding`**: Define a codificação para campos de formulário recebidos. 
  - **Tipo**: `BufferEncoding` 
  - **Padrão**: `'utf-8'`

- **`uploadDir`**: Diretório para onde os arquivos enviados serão armazenados. 
  - **Tipo**: `string` 
  - **Padrão**: `os.tmpdir()`

- **`keepExtensions`**: Se `true`, mantém as extensões dos arquivos originais.
  - **Tipo**: `boolean`
  - **Padrão**: `false`

- **`allowEmptyFiles`**: Permite o upload de arquivos vazios.
  - **Tipo**: `boolean`
  - **Padrão**: `true`

- **`minFileSize`**: Tamanho mínimo do arquivo enviado.
  - **Tipo**: `number`
  - **Padrão**: `1`

- **`maxFiles`**: Limita o número de arquivos enviados. Defina como `Infinity` para ilimitado.
  - **Tipo**: `number`
  - **Padrão**: `Infinity`

- **`maxFileSize`**: Limita o tamanho máximo do arquivo enviado.
  - **Tipo**: `number`
  - **Padrão**: `200 * 1024 * 1024` (200 MB)

- **`maxTotalFileSize`**: Limita o tamanho total dos arquivos enviados.
  - **Tipo**: `number`
  - **Padrão**: `options.maxFileSize`

- **`maxFields`**: Limita o número de campos no formulário. Defina como `0` para ilimitado.
  - **Tipo**: `number`
  - **Padrão**: `1000`

- **`maxFieldsSize`**: Limita a quantidade de memória que todos os campos (exceto arquivos) podem alocar, em bytes.
  - **Tipo**: `number`
  - **Padrão**: `20 * 1024 * 1024` (20 MB)

- **`hashAlgorithm`**: Inclui checksums calculados para arquivos recebidos. Define o algoritmo de hash a ser utilizado.
  - **Tipo**: `string | false`
  - **Padrão**: `false`

- **`fileWriteStreamHandler`**: Função para lidar com o stream de escrita de arquivos. Pode ser utilizada para enviar arquivos para armazenamentos em nuvem ou outros destinos personalizados.
  - **Tipo**: `(file?: VolatileFile) => Writable`
  - **Padrão**: `null`

- **`multiples`**: Se `true`, o argumento de arquivos na chamada de `.parse` conterá arrays de arquivos para inputs que enviam múltiplos arquivos usando o atributo HTML5 `multiple`. Também, o argumento de campos conterá arrays de valores para campos com nomes terminando em '[]'.
  - **Tipo**: `boolean`
  - **Padrão**: `false`

- **`createDirsFromUploads`**: Se `true`, permite uploads diretamente em diretórios.
  - **Tipo**: `boolean`
  - **Padrão**: `false`

- **`filename`**: Função para controlar o novo nome do arquivo. Deve retornar uma string que será unida com `options.uploadDir`.
  - **Tipo**: `(name: string, ext: string, part: Part, form: Formidable) => string`
  - **Padrão**: `undefined`

- **`enabledPlugins`**: Lista de plugins habilitados.
  - **Tipo**: `string[]`
  - **Padrão**: `undefined`

- **`filter`**: Função para filtrar partes do formulário com base em condições personalizadas.
  - **Tipo**: `(part: Part) => boolean`
  - **Padrão**: `undefined`

Claro! Vou adicionar uma seção no README para explicar a classe `RequestXperi`, focando nas propriedades e métodos públicos. Aqui está a atualização:

---

## Objeto `request`

O objeto request é utilizado para obter todas as informações de uma requisição.

### Propriedades
- **`$`**: o objeto nativo do node.js que obtém todos os dados da requisição.
- 
- **`body`**: Um objeto que armazena os dados do corpo da requisição. Pode ser um JSON ou XML convertido para um objeto JavaScript.

- **`contentType`**: O tipo de conteúdo da requisição, extraído dos cabeçalhos HTTP.

- **`files`**: Um objeto que armazena arquivos enviados na requisição. As chaves são os nomes dos campos de arquivo.

- **`fields`**: Um objeto que armazena os campos de formulário enviados na requisição. 

- **`method`**: O método HTTP da requisição (por exemplo, "GET", "POST", etc.).

- **`url`**: A URL da requisição.

- **`headers`**: Um objeto que contém os cabeçalhos da requisição HTTP, como `Authorization`, `Content-Type`, etc.

- **`query`**: Um objeto que contém os parâmetros de consulta da URL (query string). use req.query

- **`params`**: Um objeto que armazena parâmetros adicionais da requisição, úteis para rotas dinâmicas que foram criadas com paramêtros (:id / :user_id). use req.params

- **`addParams<T>(params: Params<T>)`**: Adiciona parâmetros ao objeto `params` da requisição. Os valores são convertidos para número ou string, conforme apropriado.
---
Claro! Vou adicionar uma seção ao README para explicar a classe `ResponseXperi`, incluindo suas propriedades e métodos públicos.

---

## Objeto `response`

O objeto response é usado para manipular e enviar respostas HTTP. Abaixo estão listadas suas principais propriedades e métodos públicos:

### Propriedades

- **`$`**: A instância do objeto da resposta do Node.js, que representa a resposta HTTP.

- **`json(data: object | void): ResponseXperi`**: Envia os dados na resposta como JSON. Define o cabeçalho `Content-Type` como `application/json` e finaliza a resposta com o JSON.stringify dos dados. Retorna a instância atual de `ResponseXperi`.

- **`send(data: string, cb?: () => void): ResponseXperi`**: Envia uma resposta com o dado fornecido como uma string. O cabeçalho `Content-Type` é definido como `application/json` e a resposta é finalizada. Opcionalmente, uma função de callback pode ser passada para ser executada após o envio. Retorna a instância atual de `ResponseXperi`.

- **`end(cb?: () => void)`**: Finaliza a resposta. Opcionalmente, uma função de callback pode ser passada para ser executada após o término. 

- **`status(code: number): ResponseXperi`**: Modifica o código de status da resposta. Retorna a instância atual de `ResponseXperi`.

- **`setHeader(name: string, value: string): ResponseXperi`**: Modifica um cabeçalho específico na resposta. Retorna a instância atual de `ResponseXperi`.

- **`contentType(type: string): ResponseXperi`**: Define o tipo de conteúdo da resposta no cabeçalho `Content-Type`. Retorna a instância atual de `ResponseXperi`.

- **`writeHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[])`**: Escreve o código de status e define os cabeçalhos da resposta antes que a resposta seja enviada. 

---

Se precisar de mais informações ou ajustes, estou à disposição!
  

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---
