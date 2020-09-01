
exports.up = (knex) => {
    // vamos ter que resolver mais de uma promise, por isso usamos o promise.all
  return Promise.all([
      // uma promise
      knex.schema.createTable('transfers', (t) => {
        t.increments('id').primary();
        t.string('description').notNull();
        t.date('date').notNull();
        t.decimal('ammount', 15, 2).notNull();
        t.integer('acc_ori_id')
          .references('id')
          .inTable('accounts')
          .notNull();
        t.integer('acc_dest_id')
          .references('id')
          .inTable('accounts')
          .notNull();
        t.integer('user_id')
          .references('id')
          .inTable('users')
          .notNull();
      }),
      // outra promise para adicionar a coluna de transfer_id na tabela das transações
      knex.schema.table('transactions', (t) => {
        t.integer('transfer_id')
          .references('id')
          .inTable('transfers');
      }),
  ]);
};

exports.down = (knex) => {
    // vamos ter que resolver mais de uma promise, por isso usamos o promise.all
    return Promise.all([
        // excluindo a coluna que foi inserida 
        knex.schema.table('transactions', (t) => {
          t.dropColumn('transfer_id');
        }),

        // excluindo a tabela que foi adicionada
        knex.schema.dropTable('transfers'),
      ]);
};
