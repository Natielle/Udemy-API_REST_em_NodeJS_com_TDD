const request = require('supertest');
const app = require('../../src/app');

test('Deve inserir usuario via signup', () => {
    return request(app).post('/auth/signup')
        .send({ name: 'Joana do sertao', mail: `${Date.now()}@mail.com`, passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Joana do sertao');
            expect(res.body).toHaveProperty('mail');
            expect(res.body).not.toHaveProperty('passwd');
        });
});

test('Deve receber token ao logar', () => {
    const mail =  `${Date.now()}@mail.com`;
    return app.services.user.save(
        {name: 'Joao Severino', mail: mail, passwd: '123456' }
    ).then(() => request(app).post('/auth/signin')
        .send({mail: mail, passwd: '123456'}))
        .then((res) => {
            expect(res.status).toBe(200);
            console.log(res.body);
            expect(res.body).toHaveProperty('token');
        });
});

test('Nao deve autenticar com senha errada', () => {
    const mail =  `${Date.now()}@mail.com`;
    return app.services.user.save(
        {name: 'Joao Severino', mail: mail, passwd: '123456' }
    ).then(() => request(app).post('/auth/signin')
        .send({mail: mail, passwd: '654321'}))
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Usuário ou senha inválido.');
        });
});

test('Nao deve autenticar com usuario errado', () => {
    return  request(app).post('/auth/signin')
        .send({mail: 'emailNaoexiste@gmail.com', passwd: '654321'})
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Usuário ou senha inválido.');
        });
});

test('Nao deve acessar uma rota protegida sem token', () => {
    return request(app).get('/v1/users')
        .then((res) => {
            expect(res.status).toBe(401);
        });
});