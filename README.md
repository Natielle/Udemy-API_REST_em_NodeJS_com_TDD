# Curso da plataforma Udemy: API REST em Node.JS aplicando testes (TDD) desde o princípio

*Descrição do curso:* Utilize o TDD para desenvolver um gerenciador financeiro com a segurança dos testes automatizados sempre a seu lado.

## Anotações sobre o Visual Studio

### Mexendo pelo terminal

- `code .`  – abre o vs code na pasta que está no terminal
- `touch teste.js` – cria um arquivo chamado teste.js
- `rm teste.js` – remove um arquivo chamado teste.js

### Mudando as configurações de cores

CTRL + Shift + P e escrever “theme” e selecionar preferencias de cores
Tem como baixar temas também na aba de extensões

### Instalar a fonte fira code com chocolatey

`choco install firacode`

### Extensões do VS Code

- **Bracket Pair Colorizer** – Diferencia os níveis de cores dos colchetes. Torna mais fácil a navegação.
- **Gitlens** – Suporte para o git.
- **TODO Tree** – Serve para realizar marcações em comentários para serem resolvidas depois e o plugin mostra elas em forma de lista. Facilitando a busca.

## Anotações sobre o Node JS

### Executando o arquivo node pelo terminal

``node teste.js``
Criando um projeto: npm init –y

### Habilitando o eslint no projeto

``npm i -D eslint`` – indica que está instalando a dependência eslint em ambiente de desenvolvimento só.
Após isso, executar no terminal ``.\node_modules\.bin\eslint –init``

Configurações escolhidas:

![Configurações do eslint](configuracoes_terminal.png)

Realizando a verificação de formatação dos arquivos que estão nas pastas src e test:

``.\node_modules\.bin\eslint src/** test/** --fix``

Para executar ``npm run lint``, tem que adicionar o parâmetro lint no arquivo package.json (caso não exista arquivos na pasta, haverá erro ao executar o comando)

### Configurando o Jest no projeto

**Instalando:** ``npm i –D jest@23.6.0 –E`` – dependência que será instalada apenas em ambiente de dev e em uma versão específica. –E garante que vai pegar a versão e não vai atualizar depois.

*Curiosidade sobre versionamentos:* https://semver.org/lang/pt-BR/

**Para rodar o jest:** ``.\node_modules\.bin\jest`` 

OBS: caso não haja testes escritos, informará que nenhum teste foi encontrado.

Para executar apenas ``npm test``, atualizar o scripts test no package.json para “jest” apenas.
Como estamos usando o lint, tem que informar ao lint que estamos usando o jest para ele não ficar reclamando. Para isso, basta alterar o arquivo .eslintrc.json e adicionar o jest como true no env.

Como vamos testar api, vamos instalar uma dependência que vai facilitar as coisas com requisições http.

***Para instalar o supertest:*** ``npm i –D –E supertest@3.3.0``
Após instalar, basta “importar” no arquivo que vai ser utilizado.

### Criando um servidor NodeJS

**Instalar a dependência do express:** ``npm i –S –E express@4.16.4`` – não instala como dependência de dev apenas pois é do projeto em si (então –S ao invés de -D)

### Rodando a aplicação no modo seguro

**Para executar os testes em tempo real:** ``npm run secure-mode``

Permite que ao realizar as alterações na aplicação, já tenha um feedback muito rápido para ver se a aplicação ainda está consistente após a alteração do dev.

### Mexendo com migrations

**Instalar a dependência:** ``npm i –S –E knex``

- *Criando uma migration pelo terminal:* 
``node_modules/.bin/knex migrate:make create_users --env test``
- *Aplicando todas as migrações possíveis:*
``node_modules/.bin/knex migrate:latest --env test``
- *Voltando a aplicação da migrations:*
``node_modules/.bin/knex migrate:rollback --env test``

### Dependencias para criptografia de senha e autenticacao

``npm i -S -E bcrypt-nodejs``

``npm i -S -E jwt-simple@0.5.5``

``npm i -S -E passport@0.4.0``

``npm i -S -E passport-jwt@4.0.0``