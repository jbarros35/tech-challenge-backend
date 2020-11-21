import * as Knex from 'knex'

/**
 * Create actor table
 * @param knex
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET foreign_key_checks = 0')
  await knex.schema.raw(`
    CREATE TABLE actor_appearance (
      actorId    INT(10) UNSIGNED NOT NULL,
      movieId    INT(10) UNSIGNED NOT NULL,
      characterName  VARCHAR(50) NOT NULL,
      CONSTRAINT uk_movie_appearance UNIQUE KEY (actorId, movieId),
    CONSTRAINT fk_actor
      FOREIGN KEY (actorId) 
      REFERENCES actor(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_movie
      FOREIGN KEY (movieId) 
      REFERENCES movie(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
  )ENGINE=INNODB;`)
  await knex.raw('SET foreign_key_checks = 1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE actor;')
}
