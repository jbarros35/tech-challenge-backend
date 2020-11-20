import * as Knex from 'knex'


/**
 * Create actor table
 * @param knex 
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE TABLE actor (
      id    INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      name  VARCHAR(50),
      bio TEXT,
      bornAt DATE,

      CONSTRAINT PK_actor__id PRIMARY KEY (id),
      CONSTRAINT UK_actor__name UNIQUE KEY (name)
  );`)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE actor;')
}
