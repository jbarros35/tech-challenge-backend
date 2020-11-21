import { knex } from '../util/knex'

export interface Movie {
  id: number
  name: string
  synopsis: string
  releasedAt: Date
  runtime: number
}

export function list(): Promise<Movie[]> {
  return knex.from('movie').select()
}

export function find(id: number): Promise<Movie> {
  return knex.from('movie').where({ id }).first()
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('movie').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(name: string, synopsis: string, releasedAtStr: string, runtime: number): Promise<number> {
  const releasedAt = new Date(releasedAtStr)
  const [ id ] = await (knex.into('movie').insert({ name, synopsis, releasedAt, runtime }))
  return id
}

/** @returns the ID that was created */
export async function setGender(movieId: number, genreId: number): Promise<boolean> {
  const [ id ] = await (knex.into('movie_genre').insert({ movieId, genreId }))
  return id == 0
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, synopsis: string, releasedAt: string, runtime: number): Promise<boolean>  {
  const release = new Date(releasedAt)
  const count = await knex.from('movie').where({ id }).update({ name, synopsis, release, runtime })
  return count > 0
}
