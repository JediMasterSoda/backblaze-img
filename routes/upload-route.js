const config = require('../config.json')
const b2 = require('../b2')

async function routes (fastify, options) {
  fastify.post('/upload/:key', async (request, reply) => {
    if(request.params.key && config.general.uploadKeys.includes(request.params.key)) {
      if(request.body && request.headers['content-type'] && request.headers['content-length']) {
        const file = request.body
        const upload = await b2.uploadFile(file, request.headers['content-type'], request.headers['content-length'])

        if(upload.status === 200) {
          return { file_url: config.general.fileUrl.replace('{0}', upload.data.fileName) }
        } else {
          reply.code(upload.statusCode)
          return ''
        }
      } else {
        reply.code(400)
        return ''
      }
    } else {
      reply.code(401)
      return ''
    }
  })
}

module.exports = routes