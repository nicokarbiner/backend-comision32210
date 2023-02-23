import express from "express"
import http from "http"
import productsRouter from "./routes/products.router.js"
import viewsRouter from "./routes/views.router.js"
import cartsRouter from "./routes/carts.router.js"
import chatRouter from './routes/chat.router.js'
import handlebars from 'express-handlebars'
import __dirname from "./utils.js"
import { Server } from "socket.io"
import mongoose from "mongoose"
import messageModel from "./dao/models/message.model.js"
import sessionRouter from './routes/session.router.js'
import cookieParser from "cookie-parser"
import passport from "passport"
import initializePassport from "./config/passport.config.js"
import { passportCall, authorization } from "./utils.js"
import session from "express-session"

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('cookieSecret'))
initializePassport()
app.use(passport.initialize())
app.use(session({secret: 'mysecret', resave: false, saveUninitialized: true}))
app.use(passport.session())

// Configurando el motor de plantillas
app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))

// Configuración de rutas
app.use('/api/products', passportCall('current'), authorization('user'), productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/api/sessions', sessionRouter)
app.use('/chat', chatRouter)
app.use('/', viewsRouter)

// Conectando Mongoose con Atlas e iniciando el servidor
const MONGO_URI = "mongodb+srv://dbCoderhouse:dbCoderhousePassword@cluster0.uoylv7p.mongodb.net/?retryWrites=true&w=majority"
const DB_NAME = "ecommerce"

mongoose.set('strictQuery', false)
mongoose.connect(MONGO_URI, { dbName: 'ecommerce'}, error => {
    if(error) {
        console.log("Can't connect to the DB")
        return
    }

    console.log('DB connected')
    server.listen(8080, () => console.log('Listening on port 8080'))
    server.on('error', e => console.log(e))
})

io.on('connection', socket => {
    console.log('New websocket connection')

    socket.on('chatMessage', async (obj) => {
        io.emit('message', obj)
        const newMessage = await messageModel.create({user: obj.user, message: obj.msg})
        console.log({ status: "success", payload: newMessage })
    })
})