module.exports = (app) => {

    // transformando a chamada uma promise
    const save = async (account) => {
        if (!account.name) return { error: 'Nome é um atributo obrigatório' };
        // * retorna tudo que foi inserido (obs: nao funciona com o mysql)
        return app.db('accounts').insert(account, '*'); 
    };

    const findAll = () => {
        return app.db('accounts');
    };

    const find = (filter = {}) => {
        // retorna o primeiro resultado encontrado
        return app.db('accounts').where(filter).first();
    };

    const update = (id, account) => {
        return app.db('accounts')
            .where({id})
            .update(account, '*'); // retorna todos os campos do objeto
    };

    const remove = (id) => {
        return app.db('accounts')
            .where({id})
            .del(); // retorna todos os campos do objeto
    };

    return { 
        save, findAll, find, update, remove
    };
};
