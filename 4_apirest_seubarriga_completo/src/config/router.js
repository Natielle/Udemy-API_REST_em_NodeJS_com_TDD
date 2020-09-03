const express = require('express');

module.exports = (app) => {
    app.use('/auth', app.routes.auth);

    const protectedRouter = express.Router();
    
    // rotas protegidas com autenticacao
    protectedRouter.use('/users', app.routes.users);
    protectedRouter.use('/accounts', app.routes.accounts);
    protectedRouter.use('/transactions', app.routes.transactions);
    protectedRouter.use('/transfers', app.routes.transfers);
    protectedRouter.use('/balances', app.routes.balances);
    
    // faz a autenticacao antes de chamar a rota de fato
    app.use('/v1', app.config.passport.authenticate(), protectedRouter);
};