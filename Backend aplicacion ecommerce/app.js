import express from "express"
import http from "http"
import productsRouter from "./src/routes/products.router.js"
import viewsRouter from "./src/routes/views.router.js"
import cartsRouter from "./src/routes/carts.router.js"
import chatRouter from './src/routes/chat.router.js'
import handlebars from 'express-handlebars'
import __dirname from "./src/utils.js"
import { Server } from "socket.io"
import sessionRouter from './src/routes/sessions.router.js'
import cookieParser from "cookie-parser"
import passport from "passport"
import initializePassport from "./src/config/passport.config.js"
import { passportCall, authorization } from './src/middleware/auth.js'
import session from "express-session"
import config from "./src/config/config.js"
import mockingProducts from './src/routes/testing/products.mocking.js'
import errorHandler from "./src/middleware/errors/index.js"
import { logger, addLogger } from "./src/middleware/logger.js"
import loggerRouter from "./src/routes/testing/logger.router.js"
import { serve, setup } from "swagger-ui-express"
import specs from "./src/config/swagger.config.js"
import cors from 'cors'
import mercadopago from 'mercadopago'
import ticketsRouter from './src/routes/tickets.router.js'

const { SESSION_SECRET, COOKIE_SECRET, CORS_ORIGIN, MP_ACCESS_TOKEN } = config;

const app = express()
export const server = http.createServer(app)
export const io = new Server(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(COOKIE_SECRET))
app.use(cors({ credentials: true, origin: CORS_ORIGIN.split(', ') }))
initializePassport();
app.use(passport.initialize())
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }))
app.use(passport.session())
mercadopago.configure({access_token: MP_ACCESS_TOKEN})

// Winston Logger
app.use(addLogger)

// Swagger
app.use('/apidocs', serve, setup(specs))

// Configurando el motor de plantillas
app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))

// Configuración de rutas
app.use('/api/products', productsRouter)
app.use('/api/carts', passportCall("current"), authorization(["user", "premium"]), cartsRouter)
app.use('/api/sessions', sessionRouter)
app.use('/api/users', passportCall('current'), usersRouter)
app.use('/api/purchases', ticketsRouter)
app.use('/chat', passportCall("current"), authorization(["user", "premium"]), chatRouter)
app.use("/mockingproducts", mockingProducts)
app.use("/loggertest", loggerRouter)
app.use('/', viewsRouter)

/* const MONGO_URI = "mongodb+srv://dbCoderhouse:dbCoderhousePassword@cluster0.uoylv7p.mongodb.net/?retryWrites=true&w=majority"
const DB_NAME = "ecommerce" */

// Middleware de errores
app.use(errorHandler)