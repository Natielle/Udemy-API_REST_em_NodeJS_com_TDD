module.exports = () => {
    const findAll = (req, res) => {
        const users = [
            { name: 'Natielle', mail: 'nati@gmail.com'},
        ];
    
        // envia um status 200 e a resposta em json
        res.status(200).json(users);
    }
    
    const create = (req, res) => {
        // envia um status 200 e a resposta em json
        res.status(201).json(req.body);
    }

    return { findAll, create };
};
