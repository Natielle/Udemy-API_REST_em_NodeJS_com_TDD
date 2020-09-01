// o que deve acontecer caso a versao seja efetivada
exports.up = (knex) => {
    return knex.schema.createTable('accounts', (t) => {
        t.increments('id').primary();
        t.string('name').notNull();
        t.integer('user_id')
            .references('id')
            .inTable('users')
            .notNull();
    });
};

// o que deve acontecer caso seja necessario voltar a versao
exports.down = function(knex) {
    return knex.schema.dropTable('accounts');
};
