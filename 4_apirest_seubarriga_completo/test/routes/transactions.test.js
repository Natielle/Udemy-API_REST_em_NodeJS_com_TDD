const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

// variaveis globais
const MAIN_ROUTE = '/v1/transactions';
let user1;
let user2;
let accUser1;
let accUser2;

// irá rodar antes de executar todos os testes
beforeAll(async() => {
    // deletando as informações do banco
    await app.db('transactions').del();
    await app.db('accounts').del();
    await app.db('users').del();

    // inserindo os usuarios base para o teste
    const users = await app.db('users').insert([
        { name: 'User 1', mail: 'newuser1@mail.com', passwd: '$2a$10$1va03iYgXbm2uXPv4YYzHuAcXvj1O7YJP/VRzmts9lyJLSbUTF/Ky' },
        { name: 'User 2', mail: 'newuser2@mail.com', passwd: '$2a$10$1va03iYgXbm2uXPv4YYzHuAcXvj1O7YJP/VRzmts9lyJLSbUTF/Ky' },
    ], '*');

    [user1, user2] = users;

    // gerando uma senha para autenticar
    delete user1.passwd;
    user1.token = jwt.encode(user1, 'Segredo!');
    
    // criando as contas bases para os testes
    const accs = await app.db('accounts').insert([
        { name: 'Conta 1', user_id: user1.id},
        { name: 'Conta 2', user_id: user2.id},
    ], '*');
    [accUser1, accUser2] = accs;

    // console.log('Executou o transaction - BeforeAll');
});

test('Deve listar apenas as transações do usuário', () => {
    // Como? Precisamos ter pelo menos: 2 usuarios, 2 contas e 2 transacoes
    return app.db('transactions').insert([
        { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id  },
        { description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id  },
    ]).then(() => request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user1.token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].description).toBe('T1');
        })
    );
});

// escrevendo o código com snippets
// test('Deve funcionar com snippets', () => {
//     return request(app).get(MAIN_ROUTE)
//         .set('authorization', `bearer ${user1.token}`)
//         .then((res) => {
//         expect(res.status).toBe(200);
//         expect(res.body[0].description).toBe('T1');
//     });
// });

// -------------------------------------------------------
// Realizando testes de validações da transacao
// -------------------------------------------------------
test('Nao deve inserir uma transacao sem descricao', () => {
    request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user1.token}`)
    .send({ date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id })
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Descrição é um atributo obrigatório.');
    });
});
test('Nao deve inserir uma transacao sem valor', () => {
    request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user1.token}`)
    .send({ description: 'T withou ammount', date: new Date(), type: 'I', acc_id: accUser1.id })
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Valor é um atributo obrigatório.');
    });
});

// para não ficar muito repetitivo, usamos o describe
describe('Ao tentar inserir uma transação válida', () => {
    // Nao conseguimos trabalhar dessa forma porque nesse ponto o beforeAll ainda não criou o user
    // const validTransaction = {  description: 'T validation', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id }
    
    // Fazendo outra tentativa
    let validTransaction;
    beforeAll(() => {
        validTransaction = {  description: 'T validation', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id }
    });

    // base para os próximos testes
    const testTemplate = (newData, errorMessage) => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${user1.token}`)
            // caso tenha newData, os dados de newData irão sobrescrever os dados de validTransaction
            .send({ ... validTransaction, ...newData})
            .then((res) => {
                expect(res.status).toBe(400);
                expect(res.body.error).toBe(errorMessage);
        });
    };

    test('Nao deve inserir uma transacao sem data', () => {
        testTemplate( {date: null}, // newData
            'Data é um atributo obrigatório.');
    });
    test('Nao deve inserir uma transacao sem conta', () => {
        testTemplate( {acc_id: null}, // newData
            'Conta é um atributo obrigatório.');
    });
    test('Nao deve inserir uma transacao sem tipo', () => {
        testTemplate( {type: null}, // newData
            'Tipo é um atributo obrigatório.');
    });
    test('Nao deve inserir uma transacao com tipo inválido', () => {
        testTemplate( {type: 'c'}, // newData
            'Tipo inválido.');
    });
});
// -------------------------------------------------------

test('Deve inserir uma transação com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user1.token}`)
    .send({ description: 'New T input', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id })
        .then((res) => {
            // console.log(res.body);
            expect(res.status).toBe(201);
            expect(res.body.acc_id).toBe(accUser1.id);
            expect(res.body.ammount).toBe('100.00'); // garantindo que está positivo
    });
});

test('Transações de entradas devem ser positivas', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user1.token}`)
        .send({ description: 'New T output', date: new Date(), ammount: -100, type: 'I', acc_id: accUser1.id })
        .then((res) => {
            // console.log(res.body);
            expect(res.status).toBe(201);
            expect(res.body.acc_id).toBe(accUser1.id);
            expect(res.body.ammount).toBe('100.00'); // garantindo que está positivo
    });
});

test('Transações de saída devem ser negativas', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user1.token}`)
        .send({ description: 'New T', date: new Date(), ammount: 100, type: 'O', acc_id: accUser1.id })
        .then((res) => {
            // console.log(res.body);
            expect(res.status).toBe(201);
            expect(res.body.acc_id).toBe(accUser1.id);
            expect(res.body.ammount).toBe('-100.00'); // garantindo que está positivo
    });
});

// test('Deve retornar uma transação por ID', () => {
//     return app.db('transactions').insert([
//         { description: 'T para ID', date: new Date(), ammount: 50, type: 'I', acc_id: accUser1.id }
//     ], ['id']) // retorna o id apos a insercao
//         .then((trans) => request(app).get(`${MAIN_ROUTE}/${trans[0].id}`)
//             .set('authorization', `bearer ${user1.token}`)
//             .then((res) => {
//                 expect(res.status).toBe(200);
//                 expect(res.body.id).toBe(trans[0].id);
//                 expect(res.body.description).toBe('T para ID');
//         }));
// });

test('Deve retornar uma transação por ID', () => {
    return app.db('transactions').insert(
      { description: 'T ID', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id }, ['id'],
    ).then(trans => request(app).get(`${MAIN_ROUTE}/${trans[0].id}`)
      .set('authorization', `bearer ${user1.token}`)
      .then((res) => {
        // console.log('Transaction by id body ->', res.body);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(trans[0].id);
        expect(res.body.description).toBe('T ID');
      }));
  });

test('Deve alterar uma transação', () => {
    // devemos inserir uma nova transação e alterá-la
    return app.db('transactions').insert(
      { description: 'T to update', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id }, ['id'],
    ).then(trans => request(app).put(`${MAIN_ROUTE}/${trans[0].id}`)
      .set('authorization', `bearer ${user1.token}`)
      .send({description: 'T updated'})
      .then((res) => {
        // console.log('Transaction updated body ->', res.body);
        expect(res.status).toBe(200);
        expect(res.body.description).toBe('T updated');
      }));
  });

test('Deve remover uma transacao', () => {
    // devemos inserir uma nova transação e removê-la
    return app.db('transactions').insert(
        { description: 'T to delete', date: new Date(), ammount: 25, type: 'O', acc_id: accUser1.id }, ['id'],
      ).then(trans => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user1.token}`)
        .send({description: 'T updated'})
        .then((res) => {
        //   console.log('Transaction deleted body ->', res.body);
          expect(res.status).toBe(204);
        }));
});

test('Nao deve remover uma transacao de outro usuario', () => {
    // devemos inserir uma nova transação e removê-la a partir de outro usuario
    return app.db('transactions').insert(
        { description: 'T to delete', date: new Date(), ammount: 25, type: 'O', acc_id: accUser2.id }, ['id'],
      ).then(trans => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user1.token}`)
        .send({description: 'T updated'})
        .then((res) => {
          console.log('Transaction protected deleted body ->', res.body);
          expect(res.status).toBe(403);
          expect(res.body.error).toBe('Este recurso não pertence ao usuário.');
        }));
});

// TODO implementar 'Nao deve alterar uma transacao de outro usuario'
test.skip('Nao deve alterar uma transacao de outro usuario', () => {
    // devemos inserir uma nova transação e alterá-la a partir de outro usuario
});

test('Não deve remover conta com transação', () => {
    // precisamos ter uma transação vinculado a uma conta e depois excluimos ela

    return app.db('transactions').insert(
        { description: 'T to delete account', date: new Date(), ammount: 30, type: 'O', acc_id: accUser2.id }, ['id'],
    ).then(() => request(app).delete(`/v1/accounts/${accUser1.id}`)
        .set('authorization', `bearer ${user1.token}`)
        .then((res) => {
            console.log('Body remover conta com transacao: ', res.body);
            expect(res.status).toBe(400); // deve ter sido deletado
            expect(res.body.error).toBe('Essa conta possui transações associadas.');
    }));
});