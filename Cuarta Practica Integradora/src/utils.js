import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from "./config/config.js";
import TicketModel from "./dao/models/ticket.model.js";
import { faker } from "@faker-js/faker";

const { PRIVATE_KEY } = config;

export const generateToken = (user, time = 24) => {
  const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn:  `${time}h` });
  return token;
};

export const validateToken = token => {
  return jwt.verify(token, config.PRIVATE_KEY, function (err, decoded) {
    return { err, decoded }
  })
}

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

export const codeGenerator = async () => {
  let last =
    (await TicketModel.find().sort({ purchase_datetime: -1 }))[0]?.code || 'AA00'
  
  let letters = last.slice(0, 2)
  let nums = parseInt(last.slice(2))

  if(nums === 99) {
    if (letters.charCodeAt(1) === 90) {
      letters = String.fromCharCode((letters.charCodeAt(0) + 1)).concat(String.fromCharCode(65))
    } else {
      letters = letters[0].concat(String.fromCharCode((letters.charCodeAt(1) + 1)))
    }
    nums = "00"
  } else {
    nums = (nums + 1).toLocaleString(undefined, {minimumIntegerDigits: 2})
  }

  return letters.concat(nums)
}

export const generateProducts = () => {
  return {
    id: faker.database.mongodbObjectId(),
    title: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    lang: "es",
    code: faker.random.alphaNumeric(10),
    price: faker.commerce.price(),
    status: faker.datatype.boolean(),
    stock: faker.random.numeric(),
    categories: [faker.commerce.productAdjective(), faker.commerce.productAdjective()],
    thumbnails: [faker.image.image()]
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;