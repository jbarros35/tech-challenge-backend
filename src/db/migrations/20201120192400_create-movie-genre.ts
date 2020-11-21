import * as Knex from 'knex'

/**
 * Create actor table
 * @param knex
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET foreign_key_checks = 0')
  await knex.schema.raw(`
    CREATE TABLE movie_genre (
      genreId    INT(10) UNSIGNED NOT NULL,
      movieId    INT(10) UNSIGNED NOT NULL,
    CONSTRAINT fk_genre_id
      FOREIGN KEY (genreId) 
      REFERENCES genre(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_movie_genre_id
      FOREIGN KEY (movieId) 
      REFERENCES movie(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
  )ENGINE=INNODB;`)
  await knex.raw('SET foreign_key_checks = 1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE movie_genre;')
}
