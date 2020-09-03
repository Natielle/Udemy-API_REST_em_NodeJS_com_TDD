const bodyParser = require('body-parser');
// const knexlogger = require('knex-logger');

module.exports = (app) =>{
    // adicionando o bodyparser para conseguir ler o corpo da resposta
    app.use(bodyParser.json());
    
    // mostra no console as consultas feitas no banco
    // app.use(knexlogger(app.db)) // para ver tem que configurar o --verbose=false no package

};