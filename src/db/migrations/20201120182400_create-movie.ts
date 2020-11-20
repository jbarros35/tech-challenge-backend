import * as Knex from 'knex'

/**
 * Create movie table
 * @param knex
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE TABLE movie (
      id    INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      name  VARCHAR(50),
      synopsis TEXT,
      releasedAt DATE,
      runtime FLOAT,

      CONSTRAINT PK_movie__id PRIMARY KEY (id),
      CONSTRAINT UK_movie__name UNIQUE KEY (name)
  );`)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE movie;')
}
