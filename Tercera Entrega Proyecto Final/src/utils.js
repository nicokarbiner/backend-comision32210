import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import config from "./config/config.js";
import { ticketsService } from "./repositories/index.js";
import TicketModel from "./dao/models/ticket.model.js";
import ProductModel from "./dao/models/product.model.js";

const { PRIVATE_KEY } = config;

export const generateToken = (user) => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' });

    return token;
};

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, user) {

            if (err) return next(err);
            if (!user) {
                return res
                    .status(401)
                    .json({ status: "error", error: "Invalid credentials" });
            }

            req.user = user;
            next();
        })(req, res, next);
    };
};

export const viewsPassportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, user) {
            if (err) return next(err);
            if (!user) {
                return res
                    .status(401)
                    .render("errors/base", { error: "Invalid credentials" });
            }

            req.user = user;
            next();
        })(req, res, next);
    };
};

export const authorization = (role) => {
    return async (req, res, next) => {

        const user = req.user || null
        if (!user)
            return res
                .status(401)
                .json({ status: "error", error: "Unauthenticated" });
        if (user.role !== role)
            return res.status(403).json({ status: "error", error: "Unauthorized" });
        next();
    };
};

export const viewsAuthorization = (role) => {
    return async (req, res, next) => {

        const user = req.user || null

        if (!user) return res.status(401).redirect('/login');
        if (user.role !== role)
            return res.status(403).render('errors/base', { error: 'Not authorized', user });
        next();
    };
};

export const createHash = (password) =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) =>
    bcrypt.compareSync(password, user.password);

export const codeGenerator = async () => {
    const last = (await TicketModel.find().sort({ purchase_datetime: -1 }))[0].code

    let letters = last.slice(0, 2)
    let nums = parseInt(last.slice(2))

    if (nums === 99) {
        if (letters.charCodeAt(1) === 90) {
            letters = String.fromCharCode((letters.charCodeAt(0) + 1)).concat(String.fromCharCode(65))
        } else {
            letters = letters[0].concat(String.fromCharCode((letters.charCodeAt(1) + 1)))
        }
        nums = "00"
    } else {
        nums = (nums + 1).toLocaleString(undefined, { minimumIntegerDigits: 2 })
    }

    return letters.concat(nums)
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;