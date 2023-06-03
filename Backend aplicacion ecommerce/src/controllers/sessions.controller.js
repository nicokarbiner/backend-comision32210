import CustomError from '../services/errors/CustomError.js'
import EErrors from '../services/errors/enums.js'
import { generateAuthenticationError } from '../services/errors/info.js'
import {
  validateToken,
  isValidPassword as comparePasswords,
  createHash,
} from '../utils.js'
import { usersService } from '../repositories/index.js'
import config from '../config/config.js'

const { COOKIE_NAME } = config

export const register = async (req, res) =>
  res.json({ status: 'success', payload: req.user })

export const login = async (req, res) =>
  res
    .cookie(COOKIE_NAME, req.user.token)
    .json({ status: 'success', payload: req.user })

export const logout = async (req, res) => {
  const user = req.user
  user.last_connection = new Date().toLocaleString()
  await usersService.updateUser(user.id, user)

  res
    .clearCookie(COOKIE_NAME)
    .send({ status: 'success', message: 'Logged out' })
}

export const getUser = async (req, res) => {
  try {
    const user = req.user
    if (!user)
      CustomError.createError({
        name: 'Authentication error',
        cause: generateAuthenticationError(),
        message: 'Error trying to find user.',
        code: EErrors.AUTHENTICATION_ERROR,
      })

    res.json({ status: 'success', payload: user })
  } catch (error) {
    req.logger.error(error.toString())
    res.json({ status: 'error', error })
  }
}

export const sendRecoveryMail = async (req, res) => {
  try {
    const { email } = req.body
    const result = await usersService.sendMail(email)
    res.json({ status: 'success', payload: result })
  } catch (error) {
    req.logger.error(error.toString())
    res.json({ status: 'error', error })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { uid, token } = req.params
    const { newPassword, confirmation } = req.body
    const { err } = validateToken(token)
    const user = await usersService.getUserByID(uid)

    if (err?.name === 'TokenExpiredError')
      return res.status(403).json({ status: 'error', error: 'El token expiró' })
    else if (err) return res.json({ status: 'error', error: err })

    if (!newPassword || !confirmation)
      return res.status(400).json({
        status: 'error',
        error: 'Escriba y confirme la nueva contraseña',
      })
    if (comparePasswords(user, newPassword))
      return res.json({
        status: 'error',
        error: 'La contraseña no puede ser igual a la anterior.',
      })
    if (newPassword != confirmation)
      return res.json({
        status: 'error',
        error: 'Las contraseñas no coinciden.',
      })

    const userData = {
      ...user,
      password: createHash(newPassword),
    }

    const newUser = await usersService.updateUser(uid, userData)
    res.json({ status: 'success', payload: newUser })
  } catch (error) {
    req.logger.error(error.toString())
    res.json({ status: 'error', error })
  }
}