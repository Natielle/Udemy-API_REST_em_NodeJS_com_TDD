const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/accounts';
const secret = 'Segredo!';
let user;
let user2;

// executa antes de cada um dos testes, porem é bastante custoso ficar acessando
// o banco de dados antes de cada um dos testes
// beforeEach(async () => {
//     const res = await app.services.user.save({ name: 'Account User', mail: `${Date.now()}@email.com`, passwd: '123456' });
//     user = { ...res[0] };
//     user.token = jwt.encode(user, secret);

//     const res2 = await app.services.user.save({ name: 'Account User 2', mail: `${Date.now()}@email.com`, passwd: '7890' });
//     user2 = { ...res2[0] };
//     // nao precisa do token do 2° usuario pois nao vamos logar com ele
// });

// Então é melhor executar uma única vez e adaptar o teste que não está sendo possível
// realizar por conta de conflito
beforeAll(async () => {
    const res = await app.services.user.save({ name: 'Account User', mail: `${Date.now()}@email.com`, passwd: '123456' });
    user = { ...res[0] };
    user.token = jwt.encode(user, secret);

    const res2 = await app.services.user.save({ name: 'Account User 2', mail: `${Date.now()}@email.com`, passwd: '7890' });
    user2 = { ...res2[0] };
    // nao precisa do token do 2° usuario pois nao vamos logar com ele
});

// ---- Casos de testes que nao precisam de autenticacao do usuario ----
test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Acc #1'})
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(201);
            expect(result.body.name).toBe('Acc #1');
        });
});

test('Nao deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({})
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(400); 
            expect(result.body.error).toBe('Nome é um atributo obrigatório');
        });
});

test('Deve listar todas as contas', () => {
    return app.db('accounts')
        .insert({ name: 'Acc list', user_id: user.id })
        .then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('Deve retornar uma conta por id', () => {
    return app.db('accounts')
        .insert({ name: 'Acc by id', user_id: user.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc by id');
            expect(res.body.user_id).toBe(user.id);
        });
});

test('Deve alterar uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc to Update', user_id: user.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
            .send({name: 'Acc Updated'})
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc Updated');
        });
});

test('Deve remover uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc to Remove', user_id: user.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(204); // 204 pois o usuario acabou de ser deletado
        });
});

// ---- Casos de testes que precisam de autenticacao do usuario ----
test('Nao deve inserir uma conta com nome duplicado para o mesmo usuario', () => {
    return app.db('accounts').insert({ name: 'Acc duplicada', user_id: user.id})
        .then(() => request(app).post(MAIN_ROUTE) // executa a insercao
            .set('authorization', `bearer ${user.token}`)
            .send({ name: 'Acc duplicada'}))
        .then((res) => {
            // eh esperado um erro ao inserir com nome duplicado
            expect(res.status).toBe(400); 
            expect(res.body.error).toBe('Já existe uma conta com esse nome.');
        });
});

test('Deve listar apenas as contas do usuario', async () => {
    // como -> inserir duas contas e listar apenas uma

    // deletando as informações do banco para não ter conflito de dados 
    await app.db('transactions').del();
    await app.db('accounts').del();

    return app.db('accounts')
        // inserindo os dois usuarios de uma vez
        .insert([
            { name: 'Acc user 1', user_id: user.id},
            { name: 'Acc user 2', user_id: user2.id},
        ]).then(() => request(app).get(MAIN_ROUTE) // faz a busca
            .set('authorization', `bearer ${user.token}`)
            .then((result) => {
                expect(result.status).toBe(200);
                expect(result.body.length).toBe(1);
                expect(result.body[0].name).toBe('Acc user 1');
            })
        );
});

test('Nao deve retornar uma conta de outro usuario', () => {
    // usuario 1 nao pode ver a conta do usuario 2
    return app.db('accounts')
        .insert({ name: 'Acc User 2', user_id: user2.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            // 403 -> está autenticado mas nao tem direito ao recurso
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Este recurso não pertence ao usuário.');
        });
});

test('Nao deve alterar uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({ name: 'Acc user 2', user_id: user2.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
            .send({name: 'Acc Updated'})
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            // 403 -> está autenticado mas nao tem direito ao recurso
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Este recurso não pertence ao usuário.');
        });
});

test('Nao deve remover uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({ name: 'Acc user 2', user_id: user2.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
            .send({name: 'Acc Delete'})
            .set('authorization', `bearer ${user.token}`))
        .then((res) => {
            // 403 -> está autenticado mas nao tem direito ao recurso
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Este recurso não pertence ao usuário.');
        });
});