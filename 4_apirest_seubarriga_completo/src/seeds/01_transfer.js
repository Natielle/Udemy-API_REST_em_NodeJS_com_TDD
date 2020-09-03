
exports.seed = (knex) => {
  // notar que vamos realizar as deleções das entidade que mais independentes para as mais dependentes
  // transactions precisa ser removida primeiro do que a transferência porque 
  // a transferencia depende de transações (pois a cada transferência, duas transações são geradas)
  // a conta pode conter transferências
  // e usuários podem ter contas, por isso tem que ser excluído por último    

  // deletando todos os dados antes em cascata
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())

    // inserindo os usuarios
    .then(() => knex('users').insert([
      // Outra estratégia para deixar o id predefinido e não dar conflito é colocar id negativo
      { id: 10000, name: 'User #1', mail: 'user1@mail.com', passwd: '$2a$10$BKWBistO5ExZbFFMfS7hPusyJRon6ayOmNoGG25NezVZ1WVwZ8txu' },
      { id: 10001, name: 'User #2', mail: 'user2@mail.com', passwd: '$2a$10$BKWBistO5ExZbFFMfS7hPusyJRon6ayOmNoGG25NezVZ1WVwZ8txu' },
    ]))
    .then(() => knex('accounts').insert([
      { id: 10000, name: 'AccO #1', user_id: 10000 },
      { id: 10001, name: 'AccD #1', user_id: 10000 },
      { id: 10002, name: 'AccO #2', user_id: 10001 },
      { id: 10003, name: 'AccD #2', user_id: 10001 },
    ]))
    .then(() => knex('transfers').insert([
      { id: 10000, description: 'Transfer #1', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() },
      { id: 10001, description: 'Transfer #2', user_id: 10001, acc_ori_id: 10002, acc_dest_id: 10003, ammount: 100, date: new Date() },
    ]))
    .then(() => knex('transactions').insert([
      { description: 'Transfer from AccO #1', date: new Date(), ammount: 100, type: 'I', acc_id: 10001, transfer_id: 10000 },
      { description: 'Transfer to AccD #1', date: new Date(), ammount: -100, type: 'O', acc_id: 10000, transfer_id: 10000 },
      { description: 'Transfer from AccO #2', date: new Date(), ammount: 100, type: 'I', acc_id: 10003, transfer_id: 10001 },
      { description: 'Transfer to AccD #2', date: new Date(), ammount: -100, type: 'O', acc_id: 10002, transfer_id: 10001 },
    ]));
};