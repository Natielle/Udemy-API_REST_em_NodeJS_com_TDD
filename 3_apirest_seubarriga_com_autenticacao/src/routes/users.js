const express = require('express');

module.exports = (app) => {

    const router = express.Router();

    router.get('/', (req, res, next) => {
        app.services.user.findAll()
            .then((result) => {
                res.status(200).json(result);
                console.log('\tO metodo de consulta dos usuarios foi executado');
                next(); // passa a execucao para um próximo metodo, caso tenha
            })
            .catch(err => next(err));
    });
    
    router.post('/', async (req, res, next) => {
        try{
            // * retorna tudo que foi inserido (obs: nao funciona com o mysql)
            const result = await app.services.user.save(req.body);  
            
            // envia um status 200 e a resposta em json
            return res.status(201).json(result[0]);
        } catch (err){
            // tratando o erro a nivel de rota
            return next(err);
        }
    });

    return router;
};
