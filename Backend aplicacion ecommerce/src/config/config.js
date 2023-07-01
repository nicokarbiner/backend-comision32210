import dotenv from "dotenv"
import options from './process.js'

const environment = options.mode

dotenv.config({
  path:
    environment === 'development' ? './.env.development' : './.env.production',
})

export default {
  BASE_URL: process.env.BASE_URL,
  PORT: process.env.PORT,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  COOKIE_NAME: process.env.COOKIE_NAME,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_ID: process.env.ADMIN_ID,
  SESSION_SECRET: process.env.SESSION_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  TEST_MONGO_URI: process.env.TEST_MONGO_URI,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  USER_MAIL: process.env.USER_MAIL,
  USER_PASS: process.env.USER_PASS,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY,
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
  MP_CLIENT_ID: process.env.MP_CLIENT_ID,
  MP_CLIENT_SECRET: process.env.MP_CLIENT_SECRET,
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
}
