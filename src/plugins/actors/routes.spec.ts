import { script } from '@hapi/lab'
import { expect } from '@hapi/code'
import sinon from 'sinon'

export const lab = script()
const { beforeEach, before, after, afterEach, describe, it } = lab

import * as Hapi from '@hapi/hapi'
import { actor as plugin } from './index'
import * as lib from '../../lib/actors'

describe('plugin', () => describe('actor', () => {
  const sandbox = Object.freeze(sinon.createSandbox())

  const isContext = (value: unknown): value is Context => {
    if(!value || typeof value !== 'object') return false
    const safe = value as Partial<Context>
    if(!safe.server) return false
    if(!safe.stub) return false
    return true
  }
  interface Context {
    server: Hapi.Server
    stub: Record<string, sinon.SinonStub>
  }
  interface Flags extends script.Flags {
    readonly context: Partial<Context>
  }

  before(async ({ context }: Flags) => {
    context.stub = {
      lib_list: sandbox.stub(lib, 'list'),
      lib_find: sandbox.stub(lib, 'find'),
      lib_remove: sandbox.stub(lib, 'remove'),
      lib_create: sandbox.stub(lib, 'create'),
      lib_update: sandbox.stub(lib, 'update'),
    }

    // all stubs must be made before server starts
    const server = Hapi.server()
    await server.register(plugin)
    await server.start()
    context.server = server
  })

  beforeEach(({ context }: Flags) => {
    if(!isContext(context)) throw TypeError()

    context.stub.lib_list.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_find.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_remove.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_create.rejects(new Error('test: provide a mock for the result'))
    context.stub.lib_update.rejects(new Error('test: provide a mock for the result'))
  })

  afterEach(() => sandbox.resetHistory())
  after(() => sandbox.restore())

  describe('GET /actors', () => {
    const [method, url] = ['GET', '/actors']

    it('returns all actors', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = [{'any': 'result'}]
      context.stub.lib_list.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnce(context.stub.lib_list)
      expect(response.result).equals(anyResult)
    })

  })

  describe('GET /actorsCharacters/:id', () => {
    const paramId = 1
    const [method, url] = ['GET', `/actorsCharacters/${paramId}`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'not-a-number' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      context.stub.lib_find.resolves(null)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns one actor', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = {'any': 'result'}
      context.stub.lib_find.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnceWithExactly(context.stub.lib_find, paramId)
      expect(response.result).equals(anyResult)
    })

  })

  describe('GET /actorsFavouriteGenre/:id', () => {
    const paramId = 1
    const [method, url] = ['GET', `/actorsFavouriteGenre/${paramId}`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'not-a-number' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      context.stub.lib_find.resolves(null)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns one actor', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = {'any': 'result'}
      context.stub.lib_find.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnceWithExactly(context.stub.lib_find, paramId)
      expect(response.result).equals(anyResult)
    })

  })

  describe('POST /actors', () => {
    const [method, url] = ['POST', '/actors']

    it('validates payload is not empty', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = undefined
      const opts: Hapi.ServerInjectOptions = { method, url, payload}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('validates payload matches `actor`', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {'some': 'object'}
      const opts: Hapi.ServerInjectOptions = { method, url, payload}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 409 when given `name` already exists', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {'name': 'repeated-name'}
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      context.stub.lib_create.rejects({ code: 'ER_DUP_ENTRY'})

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(409)
    })

    it('returns HTTP 201, with the `id` and `path` to the row created', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {'name': 'any-name'}
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      const anyResult = 123
      context.stub.lib_create.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(201)

      sinon.assert.calledOnceWithExactly(context.stub.lib_create, payload.name)
      expect(response.result).equals({
        id: anyResult,
        path: `/actors/${anyResult}`
      })
    })

  })

  describe('POST /actorsAppearance', () => {
    const [method, url] = ['POST', '/actorsAppearance']

    it('validates payload is not empty', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = undefined
      const opts: Hapi.ServerInjectOptions = { method, url, payload}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('validates payload matches `actor`', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {'some': 'object'}
      const opts: Hapi.ServerInjectOptions = { method, url, payload}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 409 when given `name` already exists', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {'name': 'repeated-name'}
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      context.stub.lib_create.rejects({ code: 'ER_DUP_ENTRY'})

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(409)
    })

    it('returns HTTP 201, with the `id` and `path` to the row created', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const payload = {'name': 'any-name'}
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      const anyResult = 123
      context.stub.lib_create.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(201)

      sinon.assert.calledOnceWithExactly(context.stub.lib_create, payload.name)
      expect(response.result).equals({
        id: anyResult,
        path: `/actorsAppearance/${anyResult}`
      })
    })

  })

  describe('GET /actors/:id', () => {
    const paramId = 123
    const [method, url] = ['GET', `/actors/${paramId}`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'not-a-number' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      context.stub.lib_find.resolves(null)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns one actor', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = {'any': 'result'}
      context.stub.lib_find.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(200)

      sinon.assert.calledOnceWithExactly(context.stub.lib_find, paramId)
      expect(response.result).equals(anyResult)
    })

  })

  describe('PUT /actors/:id', () => {
    const paramId = 123
    const [method, url, payload] = ['PUT', `/actors/${paramId}`, {'name': 'any-name'}]

    it('validates payload is not empty', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload: undefined}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('validates payload matches `actor`', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload: {'unexpected': 'object'}}

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      context.stub.lib_update.resolves(0)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns HTTP 409 when given `name` already exists', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      context.stub.lib_update.rejects({ code: 'ER_DUP_ENTRY'})

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(409)
    })

    it('returns HTTP 204', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url, payload }
      const anyResult = 123
      context.stub.lib_update.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(204)

      sinon.assert.calledOnceWithExactly(context.stub.lib_update, paramId, payload.name)
      expect(response.result).to.be.null()
    })

  })

  describe('DELETE /actors/:id', () => {
    const paramId = 123
    const [method, url] = ['DELETE', `/actors/${paramId}`]

    it('validates :id is numeric', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url: 'not-a-number' }

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(400)
    })

    it('returns HTTP 404 when :id is not found', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      context.stub.lib_remove.resolves(0)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(404)
    })

    it('returns HTTP 204', async ({ context }: Flags) => {
      if(!isContext(context)) throw TypeError()
      const opts: Hapi.ServerInjectOptions = { method, url }
      const anyResult = {'any': 'result'}
      context.stub.lib_remove.resolves(anyResult)

      const response = await context.server.inject(opts)
      expect(response.statusCode).equals(204)

      sinon.assert.calledOnceWithExactly(context.stub.lib_remove, paramId)
      expect(response.result).to.be.null()
    })

  })

}))
