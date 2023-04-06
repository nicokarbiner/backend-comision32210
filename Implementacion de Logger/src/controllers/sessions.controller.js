import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateAuthenticationError } from "../services/errors/info.js";

export const register = async (req, res) => res.json({ status: "success", payload: req.user });
export const login = async (req, res) => res.cookie("cookieToken", req.user.token).json({ status: "success", payload: req.user });
export const logout = (req, res) => res.clearCookie("cookieToken").send({ status: "success", message: "Logged out" });

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
    req.logger.error(error);
    res.json({status: error, error});
  }
};