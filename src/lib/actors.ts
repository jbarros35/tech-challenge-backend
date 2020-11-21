import { knex } from '../util/knex'

export interface Actor {
  id: number
  name: string
}

export interface Appearances {
  id: number
  name: string
}

export interface FavouriteGenre {
  name: string
  count: number
}

export interface Character {
  name: string
}

export function list(): Promise<Actor[]> {
  return knex.from('actor').select()
}

export function find(id: number): Promise<Actor> {
  return knex.from('actor').where({ id }).first()
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('actor').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, bio: string, birthDate: string): Promise<number> {
  const bornAt = new Date(birthDate)
  const [ id ] = await (knex.into('actor').insert({ name, bio, bornAt }))
  return id
}

/** @returns the ID that was created */
export async function createAppearance(actorId: number, movieId: number, characterName: string): Promise<number> {
  const [ id ] = await (knex.into('actor_appearance').insert({ actorId, movieId, characterName }))
  return id
}

export function findActorAppearances(actorId: number): Promise<Appearances[]> {
  const movieAppearances = (knex('actor_appearance')
    .join('movie', 'actor_appearance.movieId', 'movie.id')
    .select('movie.id', 'movie.name')
    .where({actorId: actorId}))
  return movieAppearances
}

export function findActorFavouriteGenre(actorId: number): Promise<FavouriteGenre[]> {
  const movieAppearances = (knex('movie')
    .join('movie_genre', 'movie.id', 'movie_genre.movieId')
    .join('actor_appearance', 'actor_appearance.actorId', 'actor_appearance.movieId')
    .join('actor', 'actor.id', 'actor_appearance.actorId')
    .join('genre', 'genre.id', 'movie_genre.genreId')
    .select('genre.name', knex.raw('count(movie.id) as count'))
    .where({'actor.id': actorId})
    .groupBy('genre.name')
    .orderBy('count', 'desc')
    .limit(1))
  return movieAppearances
}

export function findActorCharacters(actorId: number): Promise<Character[]> {
  const movieAppearances = (knex('actor_appearance')
    .join('movie', 'actor_appearance.movieId', 'movie.id')
    .select('actor_appearance.characterName')
    .where({actorId: actorId}))
  return movieAppearances
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, bio: string, birthDate: string): Promise<boolean>  {
  const bornAt = new Date(birthDate)
  const count = await knex.from('actor').where({ id }).update({ name, bio, bornAt })
  return count > 0
}
