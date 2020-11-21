import {
  ServerRoute,
  ResponseToolkit,
  Lifecycle,
  RouteOptionsValidate,
  Request,
  RouteOptionsResponseSchema
} from '@hapi/hapi'
import joi from 'joi'
import Boom from '@hapi/boom'

import * as actors from '../../lib/actors'
import { isHasCode } from '../../util/types'


interface ParamsId {
  id: number
}
const validateParamsId: RouteOptionsValidate = {
  params: joi.object({
    id: joi.number().required().min(1),
  })
}

interface PayloadActor {
  name: string
  bio: string
  bornAt: string
}
interface PayloadActorAppearance {
  actorId: number
  movieId: number
  characterName: string
}
const validatePayloadActor: RouteOptionsResponseSchema = {
  payload: joi.object({
    name: joi.string().required(),
    bio: joi.string().required(),
    bornAt: joi.string().required()
  })
}
const validatePayloadActorAppearance: RouteOptionsResponseSchema = {
  params: joi.object({
    id: joi.number().required().min(1),
  }),
  payload: joi.object({
    movieId: joi.number().required(),
    characterName: joi.string().required()
  })
}

export const actorRoutes: ServerRoute[] = [{
  method: 'GET',
  path: '/actors',
  handler: getAll,
},{
  method: 'POST',
  path: '/actors',
  handler: post,
  options: { validate: validatePayloadActor },
},{
  method: 'POST',
  path: '/actorsAppearance/{id}',
  handler: postAppearance,
  options: { validate: validatePayloadActorAppearance },
},{
  method: 'GET',
  path: '/actorsAppearance/{id}',
  handler: getAppearances,
  options: { validate: validateParamsId },
},{
  method: 'GET',
  path: '/actorsFavouriteGenre/{id}',
  handler: getFavouriteGenre,
  options: { validate: validateParamsId },
},{
  method: 'GET',
  path: '/actorsCharacters/{id}',
  handler: getCharacters,
  options: { validate: validateParamsId },
},{
  method: 'GET',
  path: '/actors/{id}',
  handler: get,
  options: { validate: validateParamsId },
},{
  method: 'PUT',
  path: '/actors/{id}',
  handler: put,
  options: { validate: {...validateParamsId, ...validatePayloadActor} },
},{
  method: 'DELETE',
  path: '/actors/{id}',
  handler: remove,
  options: { validate: validateParamsId },
},]

async function getAll(_req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  return actors.list()
}

async function get(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await actors.find(id)
  return found || Boom.notFound()
}

async function getFavouriteGenre(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  try {
    const found = await actors.findActorFavouriteGenre(id)
    return found || Boom.notFound()
  }
  catch (er: unknown) {
    console.log(er)
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function getAppearances(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await actors.findActorAppearances(id)
  return found || Boom.notFound()
}

async function getCharacters(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await actors.findActorCharacters(id)
  return found || Boom.notFound()
}

async function post(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { name } = (req.payload as PayloadActor)
  const { bio } = (req.payload as PayloadActor)
  const { bornAt } = (req.payload as PayloadActor)
  try {
    const id = await actors.create(name, bio, bornAt)
    const result = {
      id,
      path: `${req.route.path}/${id}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function postAppearance(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  const { movieId } = (req.payload as PayloadActorAppearance)
  const { characterName } = (req.payload as PayloadActorAppearance)
  try {
    const appId = await actors.createAppearance(id, movieId, characterName)
    const result = {
      appId,
      path: `${req.route.path}/${appId}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function put(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  const { name } = (req.payload as PayloadActor)
  const { bio } = (req.payload as PayloadActor)
  const { bornAt } = (req.payload as PayloadActor)
  try {
    return await actors.update(id, name, bio, bornAt) ? h.response().code(204) : Boom.notFound()
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function remove(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  return await actors.remove(id) ? h.response().code(204) : Boom.notFound()
}
