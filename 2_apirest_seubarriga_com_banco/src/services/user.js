module.exports = (app) => {
    const findAll = (filter = {}) => {
        return app.db('users').where(filter).select();
    };
    
    const save = async (user) => {
        // tratando o erro a nivel de servico
        if(!user.name) return { error: 'Nome é um atributo obrigatório' }; 
        if(!user.mail) return { error: 'Email é um atributo obrigatório' }; 
        if(!user.passwd) return { error: 'Senha é um atributo obrigatório' }; 

        // verificando se já existe email repetido
        const userDb = await findAll({mail: user.mail});
        if(userDb && userDb.length > 0) return { error: 'Já existe um usuario com esse email' }; 
        
        // * retorna tudo que foi inserido (obs: nao funciona com o mysql)
        return app.db('users').insert(user, '*'); 
    };

    return { findAll, save };
};
