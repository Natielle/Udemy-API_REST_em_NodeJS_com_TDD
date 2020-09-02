const express = require('express');
const InappropriateResourceError = require('../errors/InappropriateResourceError')

module.exports = (app) => {
  const router = express.Router();

  // fazendo um middleware para executar toda vez que o parametro id for passado
  router.param('id', (req, res, next) => {
    app.services.transfer.findOne({ id: req.params.id })
      .then((result) => {
        if (result.user_id !== req.user.id) throw new InappropriateResourceError();
        next();
      }).catch(err => next(err));
  });

  // Método para realizar a validação a nível de middleware
  const validate = (req, res, next) => {
    app.services.transfer.validate({ ...req.body, user_id: req.user.id })
      .then(() => next())
      .catch(err => next(err));
  };

  router.get('/', (req, res, next) => {
    app.services.transfer.find({ user_id: req.user.id })
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.post('/', validate, (req, res, next) => { // validação realizada antes de chamar a rota do serviço
  // router.post('/', (req, res, next) => { // validação realizada depois de chamar a rota do serviço
    const transfer = { ...req.body, user_id: req.user.id };
    app.services.transfer.save(transfer)
      .then(result => res.status(201).json(result[0]))
      .catch(err => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.transfer.findOne({ id: req.params.id })
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  // router.put('/:id', (req, res, next) => { // validação realizada depois de chamar a rota do serviço
  router.put('/:id', validate, (req, res, next) => { // validação realizada antes de chamar a rota do serviço
    app.services.transfer.update(req.params.id, { ...req.body, user_id: req.user.id })
      .then(result => res.status(200).json(result[0]))
      .catch(err => next(err));
  });

  router.delete('/:id', (req, res, next) => {
    app.services.transfer.remove(req.params.id)
      .then(() => res.status(204).send())
      .catch(err => next(err));
  });

  return router;
};