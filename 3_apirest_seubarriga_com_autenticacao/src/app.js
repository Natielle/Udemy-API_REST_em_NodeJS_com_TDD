// aqui estamos separando a aplicacao do servidor
const express = require('express');
const app = express();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');

// TODO criar um chaveamento dinamico
app.db = knex(knexfile.test);

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
    if(name === 'InappropriateResourceError') res.status(403).json({error: message});
    else res.status(500).json({name, message, stack});
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
