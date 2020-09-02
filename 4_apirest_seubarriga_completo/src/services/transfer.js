const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const find = (filter = {}) => {
        return app.db('transfers')
            .where(filter)
            .select();
    };    

    const findOne = (filter = {}) => {
        return app.db('transfers')
            .where(filter)
            .first();
    };

    const validate = async (transfer) => {
        if (!transfer.description) throw new ValidationError('Descrição é um atributo obrigatório.');
        if (!transfer.ammount) throw new ValidationError('Valor é um atributo obrigatório.');
        if (!transfer.date) throw new ValidationError('Data é um atributo obrigatório.');
        if (!transfer.acc_ori_id) throw new ValidationError('Conta de Origem é um atributo obrigatório.');
        if (!transfer.acc_dest_id) throw new ValidationError('Conta de Destino é um atributo obrigatório.');
        
        // verificando se a conta de origem é a mesma de destino
        if (transfer.acc_ori_id === transfer.acc_dest_id) throw new ValidationError('Não é possível transferir de uma conta para ela mesma.');

        // verificando se
        const accounts = await app.db('accounts').whereIn('id', [transfer.acc_dest_id, transfer.acc_ori_id]);
        accounts.forEach((acc) => {
            if (acc.user_id !== parseInt(transfer.user_id, 10)) throw new ValidationError(`Conta #${acc.id} não pertence ao usuário.`);
        });
    };

    const save = async (transfer) => { 

        /**
         * Validação diretamente no método
        
        // realizando as validações
        if (!transfer.description) throw new ValidationError('Descrição é um atributo obrigatório.');
        if (!transfer.ammount) throw new ValidationError('Valor é um atributo obrigatório.');
        if (!transfer.date) throw new ValidationError('Data é um atributo obrigatório.');
        if (!transfer.acc_ori_id) throw new ValidationError('Conta de Origem é um atributo obrigatório.');
        if (!transfer.acc_dest_id) throw new ValidationError('Conta de Destino é um atributo obrigatório.');
        
        // verificando se a conta de origem é a mesma de destino
        if (transfer.acc_ori_id === transfer.acc_dest_id) throw new ValidationError('Não é possível transferir de uma conta para ela mesma.');

        // verificando se
        const accounts = await app.db('accounts').whereIn('id', [transfer.acc_dest_id, transfer.acc_ori_id]);
        accounts.forEach((acc) => {
            if (acc.user_id !== parseInt(transfer.user_id, 10)) throw new ValidationError(`Conta #${acc.id} não pertence ao usuário.`);
        });
        */

        // realizando a validação com método a nivel de serviço
        // mas como estamos fazendo a nivel de middleware (antes de chamar o serviço)
        // não é necessário fazer aqui também
        // await validate(transfer);

        // inserindo a transferencia   
        const result = await app.db('transfers').insert(transfer, '*');
        const transferId = result[0].id;

        // inserindo as duas transações da transferencia
        const transactions = [
        { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId, status: true },
        { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: transferId, status: true },
        ];

        await app.db('transactions').insert(transactions); // inserindo de fato
        return result;
    };

    const update = async (id, transfer) => {

        // realizando a validação com método a nivel de serviço
        // mas como estamos fazendo a nivel de middleware (antes de chamar o serviço)
        // não é necessário fazer aqui também
        // await validate(transfer);

        // atualiza a transferência
        const result = await app.db('transfers')
            .where({ id })
            .update(transfer, '*');

        // criando transações para apagar e incluir novamente
        // Só porque o professor disse que seria mais fácil apagar e inserir novamente, mas poderia atualizar tbm
        const transactions = [
            { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: id, status: true },
            { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: id, status: true },
        ];

        await app.db('transactions').where({ transfer_id: id }).del(); // removendo os que existiam
        await app.db('transactions').insert(transactions); // inserindo as transações
        return result;
    };    

    const remove = async (id) => {
        // temos que inserir as transações primeiro para que posteriormente possamos 
        // excluir a transferência
        await app.db('transactions').where({ transfer_id: id }).del();
        return app.db('transfers').where({ id }).del();
    };

    return { 
        find, 
        save, 
        findOne, 
        update,
        validate,
        remove 
    };
};