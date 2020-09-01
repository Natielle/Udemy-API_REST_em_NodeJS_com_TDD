const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const mail1 = `${Date.now()}@mail.com`;
const secret = 'Segredo!';
let user;
const MAIN_ROUTE = '/v1/users';

beforeAll(async () => {
    const res = await app.services.user.save({ name: 'New User', mail: `${Date.now()}@email.com`, passwd: '1234' });
    user = { ...res[0] };
    user.token = jwt.encode(user, secret);
});

test('Deve listar todos os usuarios', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('Deve inserir um usuario', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({name: 'Carlos', mail: mail1, passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Carlos');
            // por seguranca, a senha nao deve ser retornada
            expect(res.body).not.toHaveProperty('passwd'); 
        });
});

test('Deve armazenar senha criptografada', async () => {
    const res = await request(app).post(MAIN_ROUTE)
        .send({name: 'Maria Josefa', mail: `${Date.now()}@mail.com`, passwd: '123456' })
        .set('authorization', `bearer ${user.token}`);
    expect(res.status).toBe(201);

    // caso body tenha o atributo id, ela será armazenada na variavel id
    const {id} = res.body;
    const userDb = await app.services.user.findOne({id});
    expect(userDb.passwd).not.toBeUndefined();
    expect(userDb.passwd).not.toBe('123456'); // nao pode ser a senha que enviamos, pois nao eh criptografada
});

// primeira estrategia para lidar com a falta de atributos
// essa nao pode esquecer de retornar a funcao
test('Nao deve inserir usuario sem nome', () => {
    const mail = `${Date.now()}@mail.com`;
    return request(app).post(MAIN_ROUTE)
        .send({ mail: mail, passwd: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400); // o erro eh esperado
            expect(res.body.error).toBe('Nome é um atributo obrigatório');
        });
});

// segunda estrategia para lidar com a falta de atributos
// essa nao pode faltar o async await
test('Nao deve inserir usuario sem email', async () => {
    // await faz a requisicao assincrona aguardar o retorno para garantirmos o sincronismo
    const result = await request(app).post(MAIN_ROUTE)
        .send({ name: 'Carlera', passwd: '123456' })
        .set('authorization', `bearer ${user.token}`);

    expect(result.status).toBe(400); // o erro eh esperado
    expect(result.body.error).toBe('Email é um atributo obrigatório');
});


// terceira estrategia para lidar com a falta de atributos (com done)
// e a ultima nao pode deixar de usar o done 
test('Nao deve inserir usuario sem senha', (done) => {
    const mail = `${Date.now()}@mail.com`;
    request(app).post(MAIN_ROUTE)
        .send({ name: 'Carlera', mail: mail })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400); // o erro eh esperado
            expect(res.body.error).toBe('Senha é um atributo obrigatório');
            done();
        })
        .catch(err => done.fail(err)); // forca a captura do erro
});

test('Nao deve inserir usuário com email existente', () => {
    
    return request(app).post(MAIN_ROUTE)
        .send({name: 'Carlos', mail: mail1, passwd: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400); // esperando erro pois o mail1 já foi cadastrado anteriormente
            expect(res.body.error).toBe('Já existe um usuario com esse email');
        });
});