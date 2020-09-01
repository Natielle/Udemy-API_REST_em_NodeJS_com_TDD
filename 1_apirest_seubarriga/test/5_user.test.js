const request = require('supertest');

const app = require('../src/app');

test('Deve listar todos os usuarios', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('name', 'Natielle');
        });
});

test('Deve inserir um usuario', () => {
    return request(app).post('/users')
        .send({name: 'Carlos', mail: 'carlos@gmail.com'})
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Carlos');
        });
});