import passport from "passport"
import local from "passport-local"
import GithubStrategy from "passport-github2"
import jwt from "passport-jwt"
import { createHash, isValidPassword, generateToken } from "../utils.js"
import config from "./config.js"
import { cartsService, usersService } from "../repositories/index.js"
import UserDTO from "../dao/DTO/user.dto.js"
import CustomError from "../services/errors/CustomError.js"
import options from './process.js'

const {
  PRIVATE_KEY,
  COOKIE_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
} = config

const environment = options.mode

const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const cookieExtractor = req => {
  const token = req && req.cookies ? req.cookies[COOKIE_NAME] : null
  return token
}

const LocalStrategy = local.Strategy

const initializePassport = () => {
  // Registro
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email, age, role = "user" } = req.body
          if (!first_name || !last_name || !email || !age || !password)
            return res
              .status(400)
              .json({ status: "error", error: "All fields must be filled" })

          const user = await usersService.getUserByEmail(username)

          if (user) {
            req.logger.error("User already exists")
            return done(null, false)
          }

          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role,
          }

          const userCart = await cartsService.createCart()
          newUser.cart = userCart._id

          const result = await usersService.createUser(newUser)

          if (environment === 'production') {
            await usersService.sendRegistrationMail(username)
          }

          return done(null, result)
        } catch (error) {
          req.logger.error(error.toString())
          return done('Error al registrar el usuario: ' + error)
        }
      }
    )
  )

  // Login
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          if (username === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const admin = {
              _id: ADMIN_ID,
              email: username,
              password,
              first_name: "Admin",
              last_name: "Coder",
              age: 100,
              role: "admin",
            }

            const token = generateToken(admin)
            admin.token = token
            const adminDTO = new UserDTO(admin)

            return done(null, adminDTO)
          }

          const user = await usersService.getUserByEmail(username)
          if (!user) {
            CustomError.createError({
              name: "Authentication error",
              cause: generateAuthenticationError(),
              message: "Error trying to find user.",
              code: EErrors.AUTHENTICATION_ERROR,
            });
            return done(null, false)
          }
          if (!isValidPassword(user, password)) return done(null, false)

          const token = generateToken(user)
          user.token = token

          user.last_connection = new Date()
          await usersService.updateUser(user._id, user)

          return done(null, new UserDTO(user))
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  // Login con Github
  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: "Iv1.292c05e5fd5b7af5",
        clientSecret: "aea4758e51fb3312fdbb9654220f96d2d7c43218",
        callbackURL: "http://127.0.0.1:8080/api/sessions/githubcallback"
        
    /*     clientID: "e554c37f06eeec8e1a3c",
        clientSecret: "5e234b13ce89fdc4f1aca9b78a27c8ff1be45dc2",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
        callbackURL: "https://backend-comision32210-production.up.railway.app/auth/github/callback" */
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await usersService.getUserByEmail(profile._json.email)

          if (!user) {
            const newUser = {
              first_name: profile._json.name,
              last_name: "",
              age: 0,
              email: profile._json.email,
              password: "",
            };

            const userCart = await cartsService.createCart()
            newUser.cart = userCart._id

            const result = await usersService.createUser(newUser)

            const token = generateToken(result)
            result.token = token
            user.last_connection = new Date()
            await usersService.updateUser(user._id, user)

            return done(null, result)
          }

          const token = generateToken(user)
          user.token = token
          user.last_connection = new Date()
          await usersService.updateUser(user._id, user)
          done(null, user)
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  // Current (JWT - obtener usuario actual por medio del token guardado en la cookie)
  passport.use(
    "current",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: 'codersecret',
      },
      async (jwt_payload, done) => {
        try {
          const user = new UserDTO(jwt_payload.user)
          return done(null, user)
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user._id)
  });

  passport.deserializeUser(async (id, done) => {
    const user = await usersService.getUserDataByID(id)
    done(null, user);
  })
}

export default initializePassport