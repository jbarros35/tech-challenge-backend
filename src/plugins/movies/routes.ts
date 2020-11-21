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

import * as movies from '../../lib/movies'
import { isHasCode } from '../../util/types'


interface ParamsId {
  id: number
}
const validateParamsId: RouteOptionsValidate = {
  params: joi.object({
    id: joi.number().required().min(1),
  })
}

interface PayloadMovie {
  name: string
  synopsis: string
  releaseAt: string
  runtime: number
}
interface PayloadGenre {
  movieId: number
  genreId: number
}
const validatePayloadMovie: RouteOptionsResponseSchema = {
  payload: joi.object({
    name: joi.string().required(),
    synopsis: joi.string().required(),
    releaseAt: joi.string().required(),
    runtime: joi.number().required().min(1)
  })
}
const validatePayloadGender: RouteOptionsResponseSchema = {
  payload: joi.object({
    movieId: joi.number().required(),
    genreId: joi.number().required(),
  })
}
export const movieRoutes: ServerRoute[] = [{
  method: 'GET',
  path: '/movies',
  handler: getAll,
},{
  method: 'POST',
  path: '/movies',
  handler: post,
  options: { validate: validatePayloadMovie },
},{
  method: 'POST',
  path: '/movies/gender',
  handler: associateGender,
  options: { validate: validatePayloadGender },
},{
  method: 'GET',
  path: '/movies/{id}',
  handler: get,
  options: { validate: validateParamsId },
},{
  method: 'PUT',
  path: '/movies/{id}',
  handler: put,
  options: { validate: {...validateParamsId, ...validatePayloadMovie} },
},{
  method: 'DELETE',
  path: '/movies/{id}',
  handler: remove,
  options: { validate: validateParamsId },
},]


async function getAll(_req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  return movies.list()
}

async function get(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await movies.find(id)
  return found || Boom.notFound()
}

async function post(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { name } = (req.payload as PayloadMovie)
  const { synopsis } = (req.payload as PayloadMovie)
  const { releaseAt } = (req.payload as PayloadMovie)
  const { runtime } = (req.payload as PayloadMovie)
  try {
    const id = await movies.create(name, synopsis, releaseAt, runtime)
    const result = {
      id,
      path: `${req.route.path}/${id}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    console.log(er)
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function associateGender(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { movieId } = (req.payload as PayloadGenre)
  const { genreId } = (req.payload as PayloadGenre)
  try {
    const id = await movies.setGender(genreId, movieId)
    const result = {
      id,
      path: `${req.route.path}/${id}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    console.log(er)
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function put(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  const { name } = (req.payload as PayloadMovie)
  const { synopsis } = (req.payload as PayloadMovie)
  const { releaseAt } = (req.payload as PayloadMovie)
  const { runtime } = (req.payload as PayloadMovie)
  try {
    return await movies.update(id, name, synopsis, releaseAt, runtime) ? h.response().code(204) : Boom.notFound()
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function remove(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  return await movies.remove(id) ? h.response().code(204) : Boom.notFound()
}
