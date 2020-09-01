const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

const secret = 'Segredo!';

module.exports = (app) => {
    const router = express.Router();

    router.post('/signin', (req, res, next) => {
        app.services.user.findOne({mail: req.body.mail})
            .then((user) => {
                // caso nao haja usuario, informar o error
                if (!user) throw new ValidationError('Usuário ou senha inválido.');

                // se a senha do banco é igual a senha que está tentando fazer login
                if (bcrypt.compareSync(req.body.passwd, user.passwd)){
                    const payload = {
                        id: user.id,
                        name: user.name, 
                        mail: user.mail,
                    };

                    const token = jwt.encode(payload, secret);

                    // tem que mandar {token} e não apenas token, pois se mandar apenas o token, só o token é enviado
                    // mandando {token}, o objeto token: chave_do_token é enviado
                    res.status(200).json({token}); 
                } else{
                    throw new ValidationError('Usuário ou senha inválido.');
                }
            }).catch(err => next(err));
    });

    router.post('/signup', async (req, res, next) => {
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