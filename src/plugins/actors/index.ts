import { Server, Plugin } from '@hapi/hapi'
import { actorRoutes } from './routes'

export const actor: Plugin<void> = {
  name: 'actor',
  version: '1.0.0',
  multiple: false,
  register: (server: Server, _options: void) => server.route(actorRoutes)
}
