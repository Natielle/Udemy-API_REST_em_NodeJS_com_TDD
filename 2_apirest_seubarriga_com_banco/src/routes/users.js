module.exports = (app) => {
    const findAll = (req, res) => {
        app.services.user.findAll()
            .then(result => res.status(200).json(result))
    }
    
    const create = async (req, res) => {
        // * retorna tudo que foi inserido (obs: nao funciona com o mysql)
        const result = await app.services.user.save(req.body);  

        // tratando o erro a nivel de rota
        if (result.error) return res.status(400).json(result);

        // envia um status 200 e a resposta em json
        return res.status(201).json(result[0]);
    }

    return { findAll, create };
};
