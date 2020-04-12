const config = require('../config.json')
const b2 = require('../b2')
const Cache = require('timed-cache')
const errorCache = new Cache({ defaultTtl: config.general.errorCacheTTL })

async function routes (fastify, options) {
  fastify.get('/:nanoid', async (request, reply) => {
    if(errorCache.get(request.params.nanoid)) {
      reply.code(404)
      return ''
    } else {
      try {
        const file = await b2.downloadFile(request.params.nanoid)

        if(file.status === 200) {
          reply.type(file.headers['content-type'])
          reply.header('content-length', file.headers['content-length'])
          reply.header('cache-control', `public, max-age=${config.general.fileCacheMaxAge}`)

          return file.data
        } else {
          errorCache.put(request.params.nanoid, 1)
          reply.code(404)
          return ''
        }
      } catch (err) {
        errorCache.put(request.params.nanoid, 1)
        reply.code(404)
        return ''
      }
    }
  })
}

module.exports = routes