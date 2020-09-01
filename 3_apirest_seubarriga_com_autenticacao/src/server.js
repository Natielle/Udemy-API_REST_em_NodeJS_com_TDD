const app = require('./app');

// colocando o servidor node para responder na porta 3001
app.listen(3001,() => {
    console.log('A aplicacao esta no ar.')
}); 