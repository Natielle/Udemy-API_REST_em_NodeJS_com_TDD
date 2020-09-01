const bodyParser = require('body-parser');

module.exports = (app) =>{
    // adicionando o bodyparser para conseguir ler o corpo da resposta
    app.use(bodyParser.json());
};