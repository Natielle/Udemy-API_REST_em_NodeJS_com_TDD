const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(async () => {
    const res = await app.services.user.save({ name: 'Account User', mail: `${Date.now()}@email.com`, passwd: '123456' });
    user = { ...res[0] };
});

// ---- Casos de testes que nao precisam de autenticacao do usuario ----
test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Acc #1', user_id: user.id })
        .then((result) => {
            expect(result.status).toBe(201);
            expect(result.body.name).toBe('Acc #1');
        });
});

test('Nao deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ user_id: user.id })
        .then((result) => {
            expect(result.status).toBe(400); 
            expect(result.body.error).toBe('Nome é um atributo obrigatório');
        });
});

test('Deve listar todas as contas', () => {
    return app.db('accounts')
        .insert({ name: 'Acc list', user_id: user.id })
        .then(() => request(app).get(MAIN_ROUTE))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('Deve retornar uma conta por id', () => {
    return app.db('accounts')
        .insert({ name: 'Acc by id', user_id: user.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`))
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
            .send({name: 'Acc Updated'}))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc Updated');
        });
});

test('Deve remover uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc to Remove', user_id: user.id }, ['id']) // id é o campo que será retornado
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`))
        .then((res) => {
            expect(res.status).toBe(204); // 204 pois o usuario acabou de ser deletado
        });
});

// ---- Casos de testes que nao precisam de autenticacao do usuario ----
test.skip('Nao deve inserir uma conta com nome duplicado para o mesmo usuario', () => {
    
});

test.skip('Deve listar apenas as contas do usuario', () => {
    
});

test.skip('Nao deve retornar uma conta de outro usuario', () => {
    
});

test.skip('Nao deve alterar uma conta de outro usuario', () => {
    
});

test.skip('Nao deve remover uma conta de outro usuario', () => {
    
});