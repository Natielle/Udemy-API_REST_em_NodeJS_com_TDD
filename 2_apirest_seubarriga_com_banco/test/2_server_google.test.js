// importando a dependencia
const supertest = require('supertest');

// configurando a requisicao
const request = supertest('http://www.google.com');

test('Deve responder status 200', () => {
    // esta requisicao eh assincrona, adicionando o return garantimos o sincronismo do teste
    return request.get('/').then(res => {
        // a resposta da requisicao deve ser 200S
        expect(res.status).toBe(200);
        
        // forcando o teste falhar
        // expect(res.status).toBe(400);
    });
});