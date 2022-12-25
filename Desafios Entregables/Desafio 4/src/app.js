import express  from 'express'
import productsRouter from './router/products.router.js'
import cartsRouter from './router/carts.router.js'
import viewsRouter from './router/views.router.js'
import __dirname from './utils.js'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'

const app = express()

const httpServer = app.listen(8080, () => console.log('Listening...'))
const socketServer = new Server(httpServer)  

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static(__dirname + '/public'))

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.use('/', viewsRouter)

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

socketServer.on('connection', (socket) => {
    socket.on('messageAdd', (data) => {
        socketServer.emit('msg_all_add', data)
    })

    socket.on('messageDel', (data) => {
        socketServer.emit('msg_all_del', data)
    })

})