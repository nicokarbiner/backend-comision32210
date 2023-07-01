import { server, io } from './app.js'
import mongoose from 'mongoose'
import { logger } from './src/middleware/logger.js'
import { createMessage } from './src/controllers/chat.controller.js'
import config from './src/config/config.js'
const { MONGO_URI, DB_NAME, PORT } = config

// Conectando mongoose con Atlas e iniciando el servidor
mongoose.set('strictQuery', false)
mongoose.connect(MONGO_URI, {dbname: DB_NAME }, error => {
  if (error) {
    return logger.fatal("Can't connect to the DB")
  }

  logger.info('DB connected')
  server.listen(PORT, () => logger.info(`Listening on port ${PORT}`))
  server.on('error', e => logger.error(e))
})

// Websockets chat
io.on('connection', createMessage(io))

/* mongodb+srv://nkarbinercoderhouse:PHe540MjFoeI48mC@cluster0.m9pc8jy.mongodb.net/   Prueba 1
mongodb+srv://nkarbinercoderhouse:PHe540MjFoeI48mC@cluster0.uoylv7p.mongodb.net/ */   