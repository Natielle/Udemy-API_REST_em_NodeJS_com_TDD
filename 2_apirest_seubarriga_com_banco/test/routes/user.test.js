const request = require('supertest');

const app = require('../../src/app');

const mail1 = `${Date.now()}@mail.com`;

test('Deve listar todos os usuarios', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('Deve inserir um usuario', () => {
    return request(app).post('/users')
        .send({name: 'Carlos', mail: mail1, passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Carlos');
        });
});

// primeira estrategia para lidar com a falta de atributos
// essa nao pode esquecer de retornar a funcao
test('Nao deve inserir usuario sem nome', () => {
    const mail = `${Date.now()}@mail.com`;
    return request(app).post('/users')
        .send({ mail: mail, passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(400); // o erro eh esperado
            expect(res.body.error).toBe('Nome é um atributo obrigatório');
        });
});

// segunda estrategia para lidar com a falta de atributos
// essa nao pode faltar o async await
test('Nao deve inserir usuario sem email', async () => {
    // await faz a requisicao assincrona aguardar o retorno para garantirmos o sincronismo
    const result = await request(app).post('/users')
        .send({ name: 'Carlera', passwd: '123456' });

    expect(result.status).toBe(400); // o erro eh esperado
    expect(result.body.error).toBe('Email é um atributo obrigatório');
});


// terceira estrategia para lidar com a falta de atributos (com done)
// e a ultima nao pode deixar de usar o done 
test('Nao deve inserir usuario sem senha', (done) => {
    const mail = `${Date.now()}@mail.com`;
    request(app).post('/users')
        .send({ name: 'Carlera', mail: mail })
        .then((res) => {
            expect(res.status).toBe(400); // o erro eh esperado
            expect(res.body.error).toBe('Senha é um atributo obrigatório');
            done();
        })
        .catch(err => done.fail(err)); // forca a captura do erro
});

test('Nao deve inserir usuário com email existente', () => {
    
    return request(app).post('/users')
        .send({name: 'Carlos', mail: mail1, passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(400); // esperando erro pois o mail1 já foi cadastrado anteriormente
            expect(res.body.error).toBe('Já existe um usuario com esse email');
        });
});