import multer from 'multer'
import fs from 'fs'
import __dirname from '../utils.js'

export const DOCUMENT_TYPES = {
  PROFILE: 'profile',
  PRODUCT: 'product',
  DOCUMENT: 'document',
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { id } = req.user
    const event = req.body.event

    if (event === DOCUMENT_TYPES.PROFILE) {
      cb(null, __dirname + '/public/images/profiles')
    } else if (event === DOCUMENT_TYPES.PRODUCT) {
      cb(null, __dirname + '/public/images/products')
    } else if (event === DOCUMENT_TYPES.DOCUMENT) {
      const dir = __dirname + `/public/documents/${id}`
      if (!fs.existsSync(dir)) {
        return fs.mkdir(dir, error => cb(error, dir))
      }
      cb(null, dir)
    } else throw new Error('Error uploading file.')
  },
  filename: function (req, file, cb) {
    const { id } = req.user
    const event = req.body.event
    console.log(req.body)
    console.log(file)
    if (event === DOCUMENT_TYPES.PROFILE) {
      file.document_type = DOCUMENT_TYPES.PROFILE
      cb(null, `${id}.png`)
    } else if (event === DOCUMENT_TYPES.PRODUCT) {
      file.document_type = DOCUMENT_TYPES.PRODUCT
    } else if (event === DOCUMENT_TYPES.DOCUMENT) {
      file.document_type = req.body.document_type
      cb(null, file.originalname.replace(/\s/g, '_').replace(/_-_/g, '_').toLowerCase())
    } else throw new Error('Error uploading file.')
  },
})

export const uploader = multer({ storage })