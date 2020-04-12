const config = require('../config.json')

async function routes (fastify, options) {
  fastify.get('/', async (request, reply) => {
    reply.redirect(config.general.redirect)
  })
}

module.exports = routes