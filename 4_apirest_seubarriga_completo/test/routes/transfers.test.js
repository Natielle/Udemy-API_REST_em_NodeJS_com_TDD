const request = require('supertest');
const app = require('../../src/app');

// Estes casos de testes foram escritos com a estratégia de utilizar dados pré inseridos 
// no banco através dos seeds

const MAIN_ROUTE = '/v1/transfers';

// obtido pelo site: https://jwt.io/
/**
 * com o payload:
{
  "id": 10000, 
  "name": "User #1", 
  "mail": "user1@mail.com"
}
 * e incluindo o segredo 'Segredo!'
 */
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.QMgvo_lPe0Rdxpx7cay_hIkDAbjCK_--VD2fP0NTTqk';

beforeAll(async () => {
    // pode deixar a execução dos testes mais lenta
    // é necessário que garanta que todas as migrações foram rodadas de uma única vez para que
    // o rollback consiga voltar o banco inteiro
    // await app.db.migrate.rollback();
    // await app.db.migrate.latest();

    // executando o seed para povoar o banco de dados antes dos testes
    await app.db.seed.run();
  });

test('Deve listar apenas as transferências do usuário', () => {
    return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
        // console.log('Body transfers: ', res.body);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].description).toBe('Transfer #1');
    });
});

test('Deve inserir uma conta com sucesso', () => {
    // como os dados já estão no banco, precisamos nos preocupar apenas com a requisição
    // como estamos inserindo uma transferencia, temos que inserir duas transações também
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ 
            description: 'Regular Transfer', 
            user_id: 10000, 
            acc_ori_id: 10000, 
            acc_dest_id: 10001, 
            ammount: 100, 
            date: new Date() 
        }).then(async (res) => {
            // console.log('Inserir conta:', res.body);
            expect(res.status).toBe(201);
            expect(res.body.description).toBe('Regular Transfer');

            // Obtendo as transações
            const transactions = await app.db('transactions').where({ transfer_id: res.body.id });
            
            // esperado receber duas transações de uma transferencia
            expect(transactions).toHaveLength(2); 

            // transactions[0] -> conta de origem
            // transactions[1] -> conta de destino
            expect(transactions[0].description).toBe('Transfer to acc #10001');
            expect(transactions[1].description).toBe('Transfer from acc #10000');
            expect(transactions[0].ammount).toBe('-100.00');
            expect(transactions[1].ammount).toBe('100.00');
            expect(transactions[0].acc_id).toBe(10000);
            expect(transactions[1].acc_id).toBe(10001);
        });
});

// Nesse caso, temos bem mais detalhes de onde está acontecendo o erro do que 
// no caso de teste acima (que testa tudo de uma vez).
// O de cima pode ser mais vago e auxiliar menos nesse exemplo que é mais complexo (que depende mais de outras partes).
describe('Ao salvar uma transferencia valida', () => {
    // precisamos do id da transferencia para buscar as transações
    let transferId;
    let income;
    let outcome;

    test('Deve retornar status 201 e os dados da transferência', () => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .send({ 
                description: 'Regular Valid Transfer', 
                user_id: 10000, 
                acc_ori_id: 10000, 
                acc_dest_id: 10001, 
                ammount: 100, 
                date: new Date() 
            }).then(async (res) => {
                // console.log('Body', res.body);
                expect(res.status).toBe(201);
                expect(res.body.description).toBe('Regular Valid Transfer');
                transferId = res.body.id;
            });
    });

    test('As transações equivalentes devem ser geradas', async () => {
        // Obtendo as transações
        // para garantir que teremos a mesma ordem sempre, utilizamos orderby porque teremos 
        // sempre uma transação negativa e outra positiva
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
            
        // esperado receber duas transações de uma transferencia
        expect(transactions).toHaveLength(2); 

        // salvando as transações
        [outcome, income] = transactions;
    });

    test('A transação de saída deve ser negativa', () => {
        expect(outcome.description).toBe('Transfer to acc #10001');
        expect(outcome.ammount).toBe('-100.00');
        expect(outcome.acc_id).toBe(10000);
        expect(outcome.type).toBe('O'); // verificando se é de saída de fato
    });

    test('A transação de entrada deve ser positiva', () => {
        expect(income.description).toBe('Transfer from acc #10000');
        expect(income.ammount).toBe('100.00');
        expect(income.acc_id).toBe(10001);
        expect(income.type).toBe('I'); // verificando se é de saída de fato
    });

    test('Ambas as transações devem referenciar a transação que as originou ', () => {
        expect(income.transfer_id).toBe(transferId);
        expect(outcome.transfer_id).toBe(transferId);
    });

    test('Ambas devem estar com status de realizadas', () => {
        expect(income.status).toBe(true);
        expect(outcome.status).toBe(true);        
    });
});

describe('Ao tentar salvar uma transferência inválida...', () => {
    const validTransfer = { 
        description: 'Regular Valid Transfer', 
        user_id: 10000, 
        acc_ori_id: 10000, 
        acc_dest_id: 10001, 
        ammount: 100, 
        date: new Date() 
    };

    const template = (newData, errorMessage) => {
        return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ ...validTransfer, ...newData })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe(errorMessage);
        });
    };

    test('Não deve inserir sem descrição', () => template({ description: null }, 'Descrição é um atributo obrigatório.'));
    test('Não deve inserir sem valor', () => template({ ammount: null }, 'Valor é um atributo obrigatório.'));
    test('Não deve inserir sem data', () => template({ date: null }, 'Data é um atributo obrigatório.'));
    test('Não deve inserir sem conta de origem', () => template({ acc_ori_id: null }, 'Conta de Origem é um atributo obrigatório.'));
    test('Não deve inserir sem conta de destino', () => template({ acc_dest_id: null }, 'Conta de Destino é um atributo obrigatório.'));
    test('Não deve inserir se as contas de origem e destino forem as mesmas', () => template({ acc_dest_id: 10000 }, 'Não é possível transferir de uma conta para ela mesma.'));
    test('Não deve inserir se as contas pertencerem a outro usuário', () => template({ acc_ori_id: 10002 }, 'Conta #10002 não pertence ao usuário.'));
});

test('Deve retornar uma transferencia por id', () => {
    // o id da transferencia que vamos buscar está fixo pois já sabemos de antemão o id que foi inserido pelo seed
    return request(app).get(`${MAIN_ROUTE}/10000`) 
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.description).toBe('Transfer #1');
    });
});


describe('Ao alterar uma transferencia valida', () => {
    // precisamos do id da transferencia para buscar as transações
    let transferId;
    let income;
    let outcome;

    test('Deve retornar status 200 e os dados da transferência', () => {
        // vamos alterar a transferencia 10000 pois temos certeza que ela foi inserida pelo seed
        return request(app).put(`${MAIN_ROUTE}/10000`)
            .set('authorization', `bearer ${TOKEN}`)
            .send({ 
                description: 'Transfer Updated', 
                user_id: 10000, 
                acc_ori_id: 10000, 
                acc_dest_id: 10001, 
                ammount: 55, 
                date: new Date() 
            }).then(async (res) => {
                // console.log('Body', res.body);
                expect(res.status).toBe(200);
                expect(res.body.description).toBe('Transfer Updated');
                expect(res.body.ammount).toBe('55.00');
                transferId = res.body.id;
            });
    });

    test('As transações equivalentes devem ser geradas', async () => {
        // Obtendo as transações
        // para garantir que teremos a mesma ordem sempre, utilizamos orderby porque teremos 
        // sempre uma transação negativa e outra positiva
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
            
        // esperado receber duas transações de uma transferencia
        expect(transactions).toHaveLength(2); 

        // salvando as transações
        [outcome, income] = transactions;
    });

    test('A transação de saída deve ser negativa', () => {
        expect(outcome.description).toBe('Transfer to acc #10001');
        expect(outcome.ammount).toBe('-55.00');
        expect(outcome.acc_id).toBe(10000);
        expect(outcome.type).toBe('O'); // verificando se é de saída de fato
    });

    test('A transação de entrada deve ser positiva', () => {
        expect(income.description).toBe('Transfer from acc #10000');
        expect(income.ammount).toBe('55.00');
        expect(income.acc_id).toBe(10001);
        expect(income.type).toBe('I'); // verificando se é de saída de fato
    });

    test('Ambas as transações devem referenciar a transação que as originou ', () => {
        expect(income.transfer_id).toBe(transferId);
        expect(outcome.transfer_id).toBe(transferId);
    });

    test('Ambas devem estar com status de realizadas', () => {
        expect(income.status).toBe(true);
        expect(outcome.status).toBe(true);        
    });
});

describe('Ao tentar alterar uma transferência inválida...', () => {
    const validTransfer = { 
        description: 'Regular Valid Transfer', 
        user_id: 10000, 
        acc_ori_id: 10000, 
        acc_dest_id: 10001, 
        ammount: 100, 
        date: new Date() 
    };

    const template = (newData, errorMessage) => {
        return request(app).put(`${MAIN_ROUTE}/10000`)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ ...validTransfer, ...newData })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe(errorMessage);
        });
    };

    test('Não deve inserir sem descrição', () => template({ description: null }, 'Descrição é um atributo obrigatório.'));
    test('Não deve inserir sem valor', () => template({ ammount: null }, 'Valor é um atributo obrigatório.'));
    test('Não deve inserir sem data', () => template({ date: null }, 'Data é um atributo obrigatório.'));
    test('Não deve inserir sem conta de origem', () => template({ acc_ori_id: null }, 'Conta de Origem é um atributo obrigatório.'));
    test('Não deve inserir sem conta de destino', () => template({ acc_dest_id: null }, 'Conta de Destino é um atributo obrigatório.'));
    test('Não deve inserir se as contas de origem e destino forem as mesmas', () => template({ acc_dest_id: 10000 }, 'Não é possível transferir de uma conta para ela mesma.'));
    test('Não deve inserir se as contas pertencerem a outro usuário', () => template({ acc_ori_id: 10002 }, 'Conta #10002 não pertence ao usuário.'));
});

describe('Ao remover uma transferência', () => {
    test('Deve retornar o status 204', () => {
        return request(app).delete(`${MAIN_ROUTE}/10000`)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
                expect(res.status).toBe(204);
        });
    });

    test('O registro deve ter sido removido do banco', () => {
        return app.db('transfers').where({ id: 10000 })
            .then((result) => {
                expect(result).toHaveLength(0);
            });
    });

    test('As transações associadas devem ter sido removidas', () => {
        return app.db('transactions').where({ transfer_id: 10000 })
            .then((result) => {
                expect(result).toHaveLength(0);
            });
    });
});

test('Nao deve retornar transferencia de outro usuario', () => {
    return request(app).get(`${MAIN_ROUTE}/10001`)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
                expect(res.status).toBe(403);
                expect(res.body.error).toBe('Este recurso não pertence ao usuário.');
        });
});