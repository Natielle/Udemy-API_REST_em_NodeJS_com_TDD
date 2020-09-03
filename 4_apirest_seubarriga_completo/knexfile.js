module.exports = {
    test: {
        client: 'pg',
        version: '9.6',
        connection: {
            host:'localhost',
            user:'postgres',
            password:'postgres',
            database:'barriga',
        },
        migrations:{ directory: 'src/migrations' },
        seeds:{ directory: 'src/seeds' },
    },
    prod: {
        client: 'pg',
        version: '9.6',
        connection: {
            host:'localhost',
            user:'postgres',
            password:'postgres',
            database:'barriga_prod',
        },
        migrations:{ directory: 'src/migrations' },
        // não usamos seed em prod pra não ter perigo de apagar os dados reais e inserir novos nada ver
        // seeds:{ directory: 'src/seeds' }, 
    },
};