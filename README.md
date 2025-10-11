# AirSense API

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Descrição

Uma API simples para fornecer dados de qualidade do ar em tempo real a partir de coordenadas de latitude e longitude.

**Contexto do Projeto:** Esta API faz parte do projeto de **Atividades Práticas Supervisionadas (APS)** da disciplina de **Desenvolvimento de Sistemas Distribuídos (DSD)** no curso de Ciência da Computação (UNIP). Ela serve como o _Gateway Intermediário_ do nosso sistema.

## O que faz?

Esta API atua como o **Gateway Intermediário** do nosso Sistema Distribuído. Ela consulta a plataforma [AQICN](https://aqicn.org/) (o _Web Service Destino_), **processa, filtra os dados** (incluindo o mapeamento de unidades) e os retorna em um formato JSON simplificado para o aplicativo mobile (o _Cliente_).

## Como obter a chave da API (AQICN_TOKEN)

1.  Acesse o site da [AQICN Data Platform](https://aqicn.org/data-platform/token/).
2.  Preencha o formulário com seus dados para solicitar um token de API.
3.  Você receberá o token no seu e-mail. Guarde-o para usar nas etapas seguintes.

## Como rodar localmente

**Pré-requisitos:**

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

**Passos:**

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/wellingtonrsantos/airsense-api
    cd airsense-api
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Crie um arquivo `.env` na raiz do projeto e adicione seu token:**
    `   AQICN_TOKEN="<COLE_O_SEU_TOKEN_AQUI>"`
    Use o `.env.example` como base :)

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run start:dev
    ```

O servidor estará rodando em `http://localhost:3000`.

## Como rodar com Docker

A imagem já está disponível no [Docker Hub](https://hub.docker.com/r/wellingtonrsantos/airsense-api).

**Pré-requisitos:**

- [Docker](https://www.docker.com/)

**Passo:**

1.  **Execute o comando abaixo no seu terminal, substituindo o placeholder pelo seu token:**
    ```bash
    docker run -d -p 3000:3000 --name airsense-api -e AQICN_TOKEN="<COLE_O_SEU_TOKEN_AQUI>" wellingtonrsantos/airsense-api:1.0.0
    ```

O container estará rodando em segundo plano e a API estará acessível em `http://localhost:3000`.

**Para Parar e Remover (Limpeza):**

Para encerrar a API e remover o container após o uso:

```bash
docker stop airsense-api
docker rm airsense-api
```

## Exemplo de uso

Após iniciar a aplicação (localmente ou via Docker), você pode fazer uma requisição GET para o endpoint `/air-quality`:

```bash
http://localhost:3000/air-quality?lat=-23.5489&lon=-46.6388
```

**Parâmetros:**

- `lat`: Latitude (obrigatório)
- `lon`: Longitude (obrigatório)
