const account = require("./account");
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {

    const find = (userId, filter = {}) => {
        // retorna o primeiro resultado encontrado
        // console.log('Executou o transaction - find()');
        return app.db('transactions')
            .join('accounts', 'accounts.id', 'acc_id')
            .where(filter)
            .andWhere('accounts.user_id', '=', userId)
            .select();
    };

    // const findOne = (filter) => {
    //     return app.db('transactions')
    //         .where(filter).first();
    // };
    const findOne = (filter) => {
        return app.db('transactions')
          .where(filter)
          .first();
      };

    const save = (transaction) => {
        // antes de salvar, verifica se todos os campos estão preenchidos
        if(!transaction.description) throw new ValidationError('Descrição é um atributo obrigatório.');
        if(!transaction.ammount) throw new ValidationError('Valor é um atributo obrigatório.');
        if(!transaction.acc_id) throw new ValidationError('Conta é um atributo obrigatório.');
        if(!transaction.date) throw new ValidationError('Data é um atributo obrigatório.');
        if(!transaction.type) throw new ValidationError('Tipo é um atributo obrigatório.');
        if(!(transaction.type==='I' || transaction.type==='O')) throw new ValidationError('Tipo inválido.');

        // antes de salvar, vamos fazer a distinção entre transações de saida e entrada
        const newTransaction = { ...transaction }; // clone da transação
        if((transaction.type === 'I' && transaction.ammount < 0)
            || (transaction.type === 'O' && transaction.ammount > 0))
            newTransaction.ammount *= -1; // invertendo o valor

        return app.db('transactions')
            .insert(newTransaction, '*');
    };

    const update = (id, transaction) => {
        return app.db('transactions')
          .where({ id })
          .update(transaction, '*');
    };
    
    const remove = (id) => {
        return app.db('transactions')
            .where({ id })
            .del();
    };

    return { 
        find, save, findOne, update, remove
    };
};