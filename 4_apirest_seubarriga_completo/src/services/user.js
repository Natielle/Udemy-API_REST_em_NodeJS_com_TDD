const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const findAll = () => {
        // nao deve retornar a senha do usuario
        return app.db('users').select(['id', 'name', 'mail']);
    };

    const findOne = (filter = {}) => {
        // Obtem o primeiro resultado porque estamos usando pra obter 
        // um usuario atraves do id
        return app.db('users').where(filter).first();
    };
    
    // fazendo a criptografia
    const getPasswdHash = (passwd) => {
        // estrutura do bcrypt que adiciona uma sequencia de caracteres aleatorios na senha
        // desse modo ela fica mais dificil de ser descoberta
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(passwd, salt); // retorna a senha criptografada
    };

    const save = async (user) => {
        // tratando o erro a nivel de servico
        if(!user.name) throw new ValidationError('Nome é um atributo obrigatório'); 
        if(!user.mail) throw new ValidationError('Email é um atributo obrigatório'); 
        if(!user.passwd) throw new ValidationError('Senha é um atributo obrigatório'); 

        // verificando se já existe email repetido
        const userDb = await findOne({mail: user.mail});
        if(userDb) throw new ValidationError('Já existe um usuario com esse email'); 
        
        const newUser = {...user}; // copia do usuario passado como parametro
        newUser.passwd = getPasswdHash(user.passwd); // faz a criptografia antes de salvar a senha
        
        // [] array com os elementos que devem ser retornados
        return app.db('users').insert(newUser, ['id', 'name', 'mail']); 
    };

    return { findAll, save, findOne };
};
