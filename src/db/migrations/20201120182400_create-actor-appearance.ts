import * as Knex from 'knex'

/**
 * Create actor table
 * @param knex
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET foreign_key_checks = 0')
  await knex.schema.raw(`
    CREATE TABLE actor_appearance (
      actor_id    INT(10) UNSIGNED NOT NULL,
      movie_id    INT(10) UNSIGNED NOT NULL,
      character_name  VARCHAR(50),
    CONSTRAINT fk_actor
      FOREIGN KEY (actor_id) 
      REFERENCES actor(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_movie
      FOREIGN KEY (movie_id) 
      REFERENCES movie(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
  )ENGINE=INNODB;`)
  await knex.raw('SET foreign_key_checks = 1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE actor;')
}
