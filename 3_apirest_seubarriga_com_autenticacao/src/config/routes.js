// arquivo que faz a ligacao entre as rotas e o app
module.exports = (app) => {
    app.route('/auth/signin').post(app.routes.auth.signin);
    app.route('/auth/signup').post(app.routes.users.create);

    app.route('/users')
        .all(app.config.passport.authenticate()) // protege a rota
        .get(app.routes.users.findAll)
        .post(app.routes.users.create);
    
    app.route('/accounts')
        .all(app.config.passport.authenticate()) // protege a rota
        .get(app.routes.accounts.getAll)
        .post(app.routes.accounts.create);

    app.route('/accounts/:id')
        .all(app.config.passport.authenticate()) // protege a rota          
        .get(app.routes.accounts.get)
        .put(app.routes.accounts.update)
        .delete(app.routes.accounts.remove);
};