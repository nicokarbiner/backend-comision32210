import UsersRepository from "../repositories/users.repository.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateAuthenticationError } from "../services/errors/info.js";
import { generateToken, validateToken, isValidPassword as comparePasswords, createHash } from "../utils.js";
import { usersService } from "../repositories/index.js";
import config from "../config/config.js";

const { COOKIE_NAME } = config

export const register = async (req, res) => res.json({ status: "success", payload: req.user });
export const login = async (req, res) => res.cookie(COOKIE_NAME, req.user.token).json({ status: "success", payload: req.user });
export const logout = (req, res) => res.clearCookie(COOKIE_NAME).send({ status: "success", message: "Logged out" });

export const getUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) CustomError.createError({
      name: "Authentication error",
      cause: generateAuthenticationError(),
      message: "Error trying to find user.", 
      code: EErrors.AUTHENTICATION_ERROR
    });

    res.json({ status: "success", payload: user });
  } catch(error) {
    req.logger.error(error.toString());
    res.json({status: "error", error});
  }
};

export const sendRecoveryMail = async (req, res) => {
  try {
    const { email } = req.body

    const result = await usersService.sendMail(email)
    
    res.json({status: "success", payload: result})
  } catch(error) {
    req.logger.error(error.toString());
    res.json({status: "error", error});
  }
}

export const changePassword = async (req, res) => {
  try { 
    const { uid, token } = req.params
    const { newPassword, confirmation } = req.body
    const { err } = validateToken(token)
    const user = await usersService.getUserByID(uid)
    
    if(err?.name === "TokenExpiredError") return res.status(403).json({status: "error", error: "El token expiró"})
    else if(err) return res.json({status: "error", error: err})

    if(!newPassword || !confirmation) return res.status(400).json({status: "error", error: "Escriba y confirme la nueva contraseña"})
    if(comparePasswords(user, newPassword)) return res.json({status: "error", error: "La contraseña no puede ser igual a la anterior."})
    if(newPassword != confirmation) return res.json({status: "error", error: "Las contraseñas no coinciden."})

    const userData = {
      ...user,
      password: createHash(newPassword)
    }

    const newUser = await usersService.updateUser(uid, userData)
    res.json({status: "success", payload: newUser})
  } catch(error) {
    req.logger.error(error.toString());
    res.json({status: "error", error});
  }
};

export const updateRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await usersService.getUserByID(uid);

    const newRole = user.role === "user" ? "premium" : "user"
    
    const data = {
      ... user,
      role: newRole
    }
    
    const result = await usersService.updateUser(uid, data);

    res.clearCookie(COOKIE_NAME).json({status: "success", message: `Role updated to ${newRole}. Log in again.`})
  } catch(error) {
    req.logger.error(error.toString());
    res.json({status: "error", error});
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params
    const result = await usersService.deleteUser(uid)
    res.json({status: "success", result})
  } catch(error) {
    req.logger.error(error.toString());
    res.json({status: "error", error});  
  }
}

export const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params
    const exists = await usersService.getUserByEmail(email)
    if(!exists) return res.status(404).json({status: "error", error: "User not found"}) 
    const result = await usersService.deleteUser(exists._id)
    res.json({status: "success", result})
  } catch(error) {
    req.logger.error(error.toString());
    res.json({status: "error", error});  
  }
}