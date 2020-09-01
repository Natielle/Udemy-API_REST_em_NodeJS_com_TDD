
// o que deve acontecer caso a versao seja efetivada
exports.up = (knex) => {
    return knex.schema.createTable('users', (t) => {
        t.increments('id').primary();
        t.string('name').notNull();
        t.string('mail').notNull().unique();
        t.string('passwd').notNull();
    })
};

// o que deve acontecer caso seja necessario voltar a versao
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
