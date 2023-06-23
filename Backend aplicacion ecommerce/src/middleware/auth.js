import passport from "passport"
import CustomError from "../services/errors/CustomError.js"
import { generateAuthenticationError } from "../services/errors/info.js"
import EErrors from "../services/errors/enums.js"
import { logger } from "./logger.js"
import { usersService } from '../repositories/index.js'
import UserDTO from '../dao/DTO/user.dto.js'
import config from '../config/config.js'
const { ADMIN_EMAIL } = config

export const passportCall = strategy => {
  return async (req, res, next) => {
    passport.authenticate(strategy, async function (err, user) {
      if (err) return next(err)
      if (!user) {
        logger.error('Authentication error. Invalid credentials.')
        return res
          .status(401)
          .json({ status: 'error', error: 'Invalid credentials.' })
      }

      if(user.email === ADMIN_EMAIL) {
        req.user = user
        next()
      } else {
        const updatedUser = new UserDTO({ ...await usersService.getUserByID(user.id), token: user.token })
        req.user = updatedUser
        next()
      }
    })(req, res, next)
  }
}

export const viewsPassportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user) {
      if (err) return next(err)
      if (!user) {
        return res
          .status(401)
          .render("errors/base", { error: "Invalid credentials." })
      }

      req.user = user
      next()
    })(req, res, next)
  }
}

export const authorization = (roles) => {
  return async (req, res, next) => {
    const user = req.user || null

    if (!user) CustomError({
      name: "Authentication error",
      cause: generateAuthenticationError(),
      message: "Invalid credentials.", 
      code: EErrors.AUTHENTICATION_ERROR,
    })
    if (!roles.includes(user.role)) {
      logger.error("Error. Unauthorized.")
      return res.status(403).json({ status: "error", error: "Unauthorized" })
    }

    next()
  }
}

export const viewsAuthorization = roles => {
  return async (req, res, next) => {
    const user = req.user || null

    if (!user) return res.status(401).redirect("/login")
    if (!roles.includes(user.role))
      return res
        .status(403)
        .render("errors/base", { error: "Not authorized", user })
    next()
  }
}