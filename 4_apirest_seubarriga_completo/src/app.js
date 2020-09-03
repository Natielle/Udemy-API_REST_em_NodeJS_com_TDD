// aqui estamos separando a aplicacao do servidor
const express = require('express');
const app = express();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');

// dependencias para o log
const winston = require('winston');
const uuid = require('uuidv4');

// Com chaveamento de prod e test dinâmico.
app.db = knex(knexfile[process.env.NODE_ENV.trim()]);

// Outros modos de executar também. E poderia trocar o prod por test para rodar em ambiente de testes.
// app.db = knex(knexfile.prod);
// app.db = knex(knexfile['prod']);

// log
app.log = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.Console({format: winston.format.json({space: 1})}),
        new winston.transports.File({
            filename: 'logs/error.log', 
            level: 'warn', 
            format: winston.format.combine(winston.format.timestamp(), winston.format.json({ space: 1 })),
        }),
    ],
});

// Entendendo melhor sobre as variáveis de ambiente
console.log("Visualizando o valor da variável NODE_ENV: ", process.env.NODE_ENV);
console.log("Visualizando o valor da variável que criamos -> QUALQUER: ", process.env.QUALQUER);

// entendendo melhor o express 
// middleware especifico para a rota de users
// app.get('/users', (req, res, next) => {
//     console.log('\tInterceptei a requisição para entender melhor o express..');
//     next(); // chama a proxima chamada que seria executada caso nao tivesse essa
// });

// vai importar todos os middlewares necessarios
consign({'cwd': 'src'})
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./services')
    .then('./routes')
    .then('./config/router.js')
    .into(app);

// para a rota '/' o servidor responde status 200
app.get('/', (req, res) => {
    // testando o log. Para executar é só abrir o navegador: http://localhost:3001/
    app.log.debug('passei por aqui atraves do log');

    res.status(200).send();
});

// entendendo melhor o express (a ordem importa)
// middleware genérico para todas as rotas que venham a usar o next
// app.use((req, res, next) => {
//     console.log('\tAinda entendendo melhor o express.. Middleware generico');
// });

// tratando os erros
app.use((err, req, res, next) => {
    const {name, message, stack} = err;
    if(name === 'ValidationError') res.status(400).json({error: message});
    else if(name === 'InappropriateResourceError') res.status(403).json({error: message});
    else {
        console.log(message); // imprime a mensagem
        
        // alternativa que mostra a mensagem de erro parcialmente e guarda a completa no log
        const id = uuid();
        app.log.error({id, name, message, stack})
        res.status(500).json({id: id, error: 'Houve uma falha interna.'});
        
        // alternativa que mostra a mensagem completa de erro
        // res.status(500).json({name, message, stack});
    }
    next();
});


// Fazendo o log de um jeito manual (mais utilizado quando estamos tendo problemas)
// app.db
//     // quando for realizada uma consulta no banco
//     .on('query', (query) => {
//         console.log({ 
//             sql: query.sql, 
//             // bindings são os valores que serao passados para a consulta
//             bindings: query.bindings ? query.bindings.join(',') : ''
//         });
//     })
//     // quando o banco responder algo
//     .on('query-response', (response) => {
//         console.log(response);
//     })
//     .on('error', (error) => {
//         console.log(error);
//     })


// tem que exportar pro teste conseguir testar a aplicacao
module.exports = app;
