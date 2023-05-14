import { Router } from 'express'
import passport from 'passport'
import {
  redirect,
  getProducts,
  renderForm,
  deleteProduct,
  getProduct,
  addProduct,
  filterByCategory,
  getCartProducts,
  addToCart,
  purchase,
  renderRegister,
  renderLogin,
  register,
  login,
  logout,
  getUser,
  githubLogin,
  deleteCartProducts,
  renderForgotPassword,
  sendRecoveryMail,
  renderChangePassword,
  changePassword,
} from '../controllers/views.controller.js'
import { viewsPassportCall, viewsAuthorization } from '../middleware/auth.js'
import { uploader } from '../services/multer.js'

const router = Router()

router.get('/', redirect)
router.get('/products', viewsPassportCall('current'), getProducts)
router.get('/products/create', viewsPassportCall('current'), viewsAuthorization(['premium', 'admin']), renderForm)
router.get('/products/:pid', viewsPassportCall('current'), getProduct)
router.post('/products', viewsPassportCall('current'), viewsAuthorization(['premium', 'admin']), uploader.array('file', 1), addProduct)
router.post('/products/category', viewsPassportCall('current'), filterByCategory)
router.post('/products/delete/:pid', viewsPassportCall('current'), viewsAuthorization(['premium', 'admin']), deleteProduct)
router.get('/carts/:cid', viewsPassportCall('current'), viewsAuthorization(['user', 'premium']),  getCartProducts)
router.post('/carts/:cid', viewsPassportCall('current'), viewsAuthorization(['user', 'premium']), deleteCartProducts)
router.post('/carts/:cid/products/:pid', viewsPassportCall('current'), viewsAuthorization(['user', 'premium']), addToCart)
router.post('/carts/:cid/purchase', viewsPassportCall('current'), viewsAuthorization(['user', 'premium']), purchase)
router.get('/sessions/register', renderRegister)
router.get('/sessions/login', renderLogin)
router.post('/sessions/register', viewsPassportCall('register'), register)
router.post('/sessions/login', viewsPassportCall('login'), login)
router.get('/sessions/logout', viewsPassportCall('current'), logout)
router.get('/sessions/user', viewsPassportCall('current'), getUser)
router.get('/api/sessions/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), githubLogin)
router.get('/sessions/password_reset', renderForgotPassword)
router.post('/sessions/password_reset', sendRecoveryMail)
router.get('/sessions/password_reset/:uid/:token', renderChangePassword)
router.post('/sessions/password_reset/:uid/:token', changePassword)

export default router