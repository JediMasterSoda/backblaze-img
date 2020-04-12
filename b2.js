const config = require('./config.json')
const B2 = require('backblaze-b2')
const memoize = require('memoizee')
const { nanoid } = require('nanoid')

const b2 = new B2({
  applicationKeyId: config.b2.keyID,
  applicationKey: config.b2.applicationKey
})

const reauth = memoize(
  () => b2.authorize(),
  { promise: true, maxAge: config.b2.authCacheTTL }
)

reauth()

async function downloadFile(nanoid) {
  await reauth()

  const stream = await b2.downloadFileByName({
    bucketName: config.b2.bucketName,
    fileName: nanoid,
    responseType: 'stream'
  })

  return stream
}

async function initNewUpload() {
  await reauth()

  const uploadUrl = await b2.getUploadUrl({
    bucketId: config.b2.bucketId
  })

  if(uploadUrl.status === 200) {
    return uploadUrl.data
  } else {
    return null
  }
}

async function uploadFile(file, contentType, contentLength) {
  await reauth()

  const uploadData = await initNewUpload()
  const fileName = nanoid()

  const upload = await b2.uploadFile({
    uploadUrl: uploadData.uploadUrl,
    uploadAuthToken: uploadData.authorizationToken,
    fileName: fileName,
    data: file,
    mime: contentType || 'b2/x-auto',
    contentLength: contentLength
  })

  return upload
}

module.exports = { downloadFile, uploadFile }