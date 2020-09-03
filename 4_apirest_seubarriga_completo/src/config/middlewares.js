const bodyParser = require('body-parser');
// const knexlogger = require('knex-logger');
const cors = require('cors');

module.exports = (app) =>{
    // adicionando o bodyparser para conseguir ler o corpo da resposta
    app.use(bodyParser.json());
    
    // mostra no console as consultas feitas no banco
    // app.use(knexlogger(app.db)) // para ver tem que configurar o --verbose=false no package

    // aplicando o cors para a api poder ser acessada via browser 
    app.use(cors({origin: '*'})); // aceita todas requisições
};