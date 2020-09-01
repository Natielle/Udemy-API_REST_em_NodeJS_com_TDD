// para colocar o servidor no ar: node src/server.js
const express = require('express');

const app = express();

// para a rota '/' o servidor responde status 200
app.get('/', (req, res) => {
    res.status(200).send();
});

// colocando o servidor node para responder na porta 3001
app.listen(3001); 