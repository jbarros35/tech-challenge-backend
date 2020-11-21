import { AnySchema } from 'joi'
import { knex } from '../util/knex'
import { Movie } from './movies'

export interface Actor {
  id: number
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

export function findActorAppearances(actorId: number): Promise<any> {
  const movieAppearances = (knex('actor_appearance')
    .join('movie', 'actor_appearance.movieId', 'movie.id')
    .select('movie.id', 'movie.name', 'actor_appearance.characterName')
    .where({actorId: actorId}))
  return movieAppearances
}

/** @returns whether the ID was actually found */
export async function update(id: number, name: string, bio: string, birthDate: string): Promise<boolean>  {
  const bornAt = new Date(birthDate)
  const count = await knex.from('actor').where({ id }).update({ name, bio, bornAt })
  return count > 0
}
