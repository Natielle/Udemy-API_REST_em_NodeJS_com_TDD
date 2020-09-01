// aqui estamos separando a aplicacao do servidor
const express = require('express');
const app = express();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');
// const knexlogger = require('knex-logger');

// TODO criar um chaveamento dinamico
app.db = knex(knexfile.test);

// mostra no console as consultas feitas no banco
// app.use(knexlogger(app.db)) // para ver tem que configurar o --verbose=false no package

// vai importar todos os middlewares necessarios
consign({'cwd': 'src'})
    .include('./config/middlewares.js')
    .then('./services')
    .then('./routes')
    .then('./config/routes.js')
    .into(app);

// para a rota '/' o servidor responde status 200
app.get('/', (req, res) => {
    res.status(200).send();
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
