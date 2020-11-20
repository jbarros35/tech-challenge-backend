import { knex } from '../util/knex'

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

/** @returns whether the ID was actually found */
export async function update(id: number, name: string): Promise<boolean>  {
  const count = await knex.from('actor').where({ id }).update({ name })
  return count > 0
}
