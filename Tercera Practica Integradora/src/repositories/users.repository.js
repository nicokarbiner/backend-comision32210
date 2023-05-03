import UserDTO from "../dao/DTO/user.dto.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateAuthenticationError } from "../services/errors/info.js";
import Mail from "../services/mail.js";
import config from "../config/config.js";
import { generateToken } from "../utils.js";

export default class UsersRepository {
    constructor(dao) {
        this.dao = dao;
        this.mail = new Mail;
    }

    getUsers = async () => await this.dao.get();

    getUserByID = async (id) => {
        return await this.dao.getByID(id);
    };

    getUserDataByID = async (id) => {
        const user = await this.dao.getByID(id);
        return new UserDTO(user);
    };

    getUserByEmail = async (email) => {
        return await this.dao.getByEmail(email);
    };

    createUser = async (data) => {
        return await this.dao.create(data);
    };

    updateUser = async (id, data) => {
        await this.dao.update(id, data)
        return await this.getUserDataByID(id)
    };

    sendMail = async (email) => {
        const user = await this.getUserByEmail(email)
        if (!user) CustomError.createError({
            name: "Authentication error",
            cause: generateAuthenticationError(),
            message: "Error trying to find user.",
            code: EErrors.AUTHENTICATION_ERROR
        });

        const token = generateToken({}, 1)

        const html = `<h1>Restauración de contraseña</h1>
    <p>Hola 👋</p>
    <p>Solicistaste un cambio de contraseña para tu cuenta.</p>
    <p>Podés hacerlo desde acá:</p>
    <a href=${config.BASE_URL}/sessions/password_reset/${user.id || user._id}/${token}>Cambiar contraseña</a>
    <br>
    <p>¡Saludos!</p>`

        return await this.mail.send(email, "Restauración de contraseña", html)
    }
}