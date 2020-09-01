// aqui estamos separando a aplicacao do servidor
const express = require('express');
const app = express();
const consign = require('consign');

// vai importar todos os middlewares necessarios
consign({'cwd': 'src'})
    .include('./config/middlewares.js')
    .then('./routes')
    .then('./config/routes.js')
    .into(app);

// para a rota '/' o servidor responde status 200
app.get('/', (req, res) => {
    res.status(200).send();
});


// tem que exportar pro teste conseguir testar a aplicacao
module.exports = app;
