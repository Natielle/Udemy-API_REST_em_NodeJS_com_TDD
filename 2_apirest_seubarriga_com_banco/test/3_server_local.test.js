test('should be empty', () => {
    // teste vazio
});

// OBS: para esse teste passar, eh necessario rodar o servidor node src/1_server.js
// Para nao ter que ficar subindo o servidor local toda vez que os testes forem rodar, 
// Estou comentando esse codigo inteiro pra ser desconsiderado.

/*
// importando a dependencia
const supertest = require('supertest');

// configurando a requisicao
const request = supertest('http://localhost:3001');

test('Deve responder na porta 3001', () => {
    // esta requisicao eh assincrona, adicionando o return garantimos o sincronismo do teste
    return request.get('/').then(res => {
        // a resposta da requisicao deve ser 200S
        expect(res.status).toBe(200);
        
        // forcando o teste falhar
        // expect(res.status).toBe(400);
    });
});
*/

