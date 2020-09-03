const express = require('express');
const InappropriateResourceError = require('../errors/InappropriateResourceError')

module.exports = (app) => {
    const router = express.Router();

    // fazendo um middleware para executar toda vez que o parametro id for passado
    router.param('id', (req, res, next) => {
        app.services.account.find({id: req.params.id})
        .then((acc) => {
            // verificando se o id passado é igual ao id de quem está solicitando 
            if(acc.user_id !== req.user.id) throw new InappropriateResourceError();
            else next();
        }).catch(err => next(err));
    });

    router.post('/', (req, res, next) => {
        // console.log(req.user); // mostra o usuario que o passport ajuda a enviar
        app.services.account.save({...req.body, user_id: req.user.id})
            .then((result) => {                
                // envia um status 200 e a resposta em json
                return res.status(201).json(result[0]);
            })
            // captura o erro lancado
            .catch(err => next(err));
    }); 

    router.get('/',  (req, res, next) => {
        app.services.account.findAll(req.user.id)
            .then((result) => {
                res.status(200).json(result);
                console.log('\tPassei pelo metodo getAll do account.');
                next(); // passa a execucao para um próximo metodo, caso tenha
            })
            .catch(err => next(err));
    });

    router.get('/:id',  (req, res, next) => {
        // Como o codigo fica caso não tenha o middleware que verifica a passagem do parametro id
        // app.services.account.find({id: req.params.id})
        //     .then((result) => {
        //         // verificar se o usuario tem acesso ao recurso
        //         if (result.user_id !== req.user.id)
        //             return res.status(403).json({ error: 'Este recurso não pertence ao usuário.' });
        //         return res.status(200).json(result);
        //     }).catch(err => next(err));
    
        app.services.account.find({id: req.params.id})
            .then((result) => {
                return res.status(200).json(result);
            }).catch(err => next(err));
    });

    router.put('/:id',  (req, res, next) => {
        app.services.account.update(req.params.id, req.body)
            .then(result => res.status(200).json(result[0]))
            .catch(err => next(err));
    });

    router.delete('/:id',  (req, res, next) => {
        app.services.account.remove(req.params.id)
            .then(() => res.status(204).send())
            .catch(err => next(err));
    });

    return router;
};
