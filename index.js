const config = require('./config.json')
const fastify = require('fastify')({
  logger: config.fastify.logger
})
const rawBody = require('raw-body')

fastify.register(require('fastify-compress'))

fastify.addContentTypeParser('*', (req, done) => {
  rawBody(req, {
    length: req.headers['content-length'],
    limit: config.general.uploadLimit
  }, (err, body) => {
    if (err) return done(err)
    done(null, body)
  })
})

fastify.register(require('./routes/default-route'))
fastify.register(require('./routes/view-route'))
fastify.register(require('./routes/upload-route'))

const start = async () => {
  try {
    await fastify.listen(config.fastify.port, config.fastify.hostname)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()