const express = require('express');
const InappropriateResourceError = require('../errors/InappropriateResourceError')

module.exports = (app) => {
    const router = express.Router();

    // fazendo um middleware para executar toda vez que o parametro id for passado
    router.param('id', (req, res, next) => {
        app.services.transaction.find(req.user.id, { 'transactions.id': req.params.id })
        .then((result) => {
            console.log('BODY: ', result.body);
            if(result.length > 0) next();
            else throw new InappropriateResourceError();
        }).catch(err => next(err));
    });

    router.get('/', (req, res, next) => {
        // console.log('Executou o transaction - get /');
        app.services.transaction.find(req.user.id)
        .then(result => res.status(200).json(result))
        .catch(err => next(err));
    });

    router.post('/', (req, res, next) => {
        // console.log('Executou o transaction - post /');
        app.services.transaction.save(req.body)
        .then(result => res.status(201).json(result[0]))
        .catch(err => next(err));
    });

    router.get('/:id', (req, res, next) => {
        console.log('Executou o transaction - get/:id');
        app.services.transaction.findOne({id: req.params.id})
            .then(result => res.status(200).json(result))
            .catch(err => next(err));
    });

    router.put('/:id', (req, res, next) => {
        app.services.transaction.update(req.params.id, req.body)
            .then(result => res.status(200).json(result[0]))
            .catch(err => next(err));
    });

    router.delete('/:id', (req, res, next) => {
        app.services.transaction.remove(req.params.id)
            .then(() => res.status(204).send())
            .catch(err => next(err));
    });

    return router;
};