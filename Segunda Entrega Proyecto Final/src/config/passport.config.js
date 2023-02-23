import passport from "passport"
import local from 'passport-local'
import GithubStrategy from 'passport-github2'
import UserModel from "../dao/models/user.model.js"
import CartModel from "../dao/models/cart.model.js"
import jwt from 'passport-jwt'
import { createHash, isValidPassword, generateToken } from "../utils.js"

const PRIVATE_KEY = 'coderSecret'

const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const cookieExtractor = req => {
    const token = (req && req.cookies) ? req.cookies['cookieToken'] : null
    return token
}

const LocalStrategy = local.Strategy

const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
            try {
                const { first_name, last_name, email, age } = req.body
                if (!first_name || !last_name || !email || !age || !password) return res.status(400).json({ status: 'error', error: 'all fields must be filled' })

                const user = await UserModel.findOne({ email: username })

                if (user) {
                    console.log('User already exists')
                    return done(null, false)
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password),
                    role
                }

                const userCart = await CartModel.create({ products: [] })
                newUser.cart = userCart._id

                const result = await UserModel.create(newUser)
                return done(null, result)
            } catch (error) {
                return done('Error al obtener el usuario: ' + error)
            }
        }
    ))

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            if (username === 'testing@coderhouse.com' && password === 'TestingCoderHouse2023') {
                const admin = {
                    _id: '63e4ee6a795025c3ccb9b29a',
                    email: username,
                    password,
                    first_name: 'Testing',
                    last_name: 'CoderHouse',
                    age: 20,
                    role: 'admin'
                }
                const token = generateToken(admin)
                admin.token = token

                return done(null, admin)
            }

            const user = await UserModel.findOne({ email: username }).lean().exec()
            if (!user) {
                console.log("User doesn't exist")
                return done(null, false)
            }
            if (!isValidPassword(user, password)) return done(null, false)

            const token = generateToken(user)
            user.token = token

            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

    passport.use('github', new GithubStrategy({
        clientID: 'Iv1.a49d514085faaa40',
        clientSecret: 'c3e2dc1c0effc0bc294a8be4d9e8075d9b816e9d',
        callbackURL: 'http://127.0.0.1:8080/api/sessions/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await UserModel.findOne({ email: profile._json.email })

            if (!user) {
                const newUser = {
                    first_name: profile._json.name,
                    last_name: '',
                    age: 0,
                    email: profile._json.email,
                    password: ''
                }

                const userCart = await CartModel.create({ products: [] })
                newUser.cart = userCart._id

                const result = await UserModel.create(newUser)

                const token = generateToken(result)
                result.token = token

                return done(null, result)
            }
            const token = generateToken(user)
            user.token = token
            done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

    // Current (JWT - obtener usuario actual por medio del token guardado en la cookie)
    passport.use('current', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY
    }, async (jwt_payload, done) => {

        try {
            return done(null, jwt_payload.user)
        } catch (error) {
            return done(error)
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        const user = await UserModel.findById(id)
        done(null, user)
    })
}

export default initializePassport