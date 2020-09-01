const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {

    const findAll = (user_id) => {
        return app.db('accounts').where({user_id: user_id});
    };

    const find = (filter = {}) => {
        // retorna o primeiro resultado encontrado
        return app.db('accounts').where(filter).first();
    };

    // transformando a chamada uma promise
    const save = async (account) => {
        // verificando se existe o nome
        if (!account.name) throw new ValidationError('Nome é um atributo obrigatório');

        // verificando se a conta ja possui o mesmo nome no banco
        const accDb = await find({ name: account.name, user_id: account.user_id });
        if (accDb) throw new ValidationError('Já existe uma conta com esse nome.');

        // * retorna tudo que foi inserido (obs: nao funciona com o mysql)
        return app.db('accounts').insert(account, '*'); 
    };


    const update = (id, account) => {
        return app.db('accounts')
            .where({id})
            .update(account, '*'); // retorna todos os campos do objeto
    };

    const remove = async (id) => {

        // buscando transações associadas a conta
        // caso tenha alguma transação, deve disparar um error
        const transaction = await app.services.transaction.findOne({ acc_id: id });
        if (transaction) throw new ValidationError('Essa conta possui transações associadas.');

        return app.db('accounts')
            .where({id})
            .del(); // retorna todos os campos do objeto
    };

    return { 
        save, findAll, find, update, remove
    };
};
