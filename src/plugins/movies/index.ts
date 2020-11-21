import { Server, Plugin } from '@hapi/hapi'
import { movieRoutes } from './routes'

export const movie: Plugin<void> = {
  name: 'movie',
  version: '1.0.0',
  multiple: false,
  register: (server: Server, _options: void) => server.route(movieRoutes)
}
