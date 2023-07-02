import {
  cartsService,
  productsService,
  usersService,
} from '../repositories/index.js'
import {
  createHash,
  validateToken,
  isValidPassword as comparePasswords,
} from '../utils.js'

// Redirección para empezar por la pantalla de login
export const redirect = (req, res) => res.redirect('/sessions/login')

// PRODUCTS
// Get products
export const getProducts = async (req, res) => {
  try {
    const {
      products,
      options: { limit, category, stock },
    } = await productsService.getPaginate(req)

    products.prevLink = products.hasPrevPage
      ? `/products?page=${products.prevPage}&limit=${limit}${category ? `&category=${category}` : ''
      }${stock ? `&stock=${stock}` : ''}`
      : ''
    products.nextLink = products.hasNextPage
      ? `/products?page=${products.nextPage}&limit=${limit}${category ? `&category=${category}` : ''
      }${stock ? `&stock=${stock}` : ''}`
      : ''

    const user = req.user
    res.render('products', { products, user })
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// Create products form
export const renderForm = async (req, res) => {
  const user = req.user
  res.render('create', { user })
}

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid
    const user = req.user
    const product = await productsService.getProduct(pid)

    if (user.role === 'premium' && user.email !== product.owner) {
      const error = "You can't modify a product owned by another user"
      req.logger.error(error)
      return res.status(403).json({ status: 'error', error })
    }

    await productsService.deleteProduct(pid)
    res.redirect('/products')
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// Get one product
export const getProduct = async (req, res) => {
  try {
    const pid = req.params.pid
    const product = await productsService.getProduct(pid)
    const user = req.user
    res.render('oneProduct', { product, user })
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// Add product
export const addProduct = async (req, res) => {
  try {
    const { role, email } = req.user
    const data = req.body
    const documents = await usersService.saveDocuments(req.user, req.files)
    data.thumbnails = documents.map(file => file.reference)
    const categories = data.categories.split(',').map(c => c.trim())
    data.categories = Array.isArray(categories) ? categories : [categories]
    if (role === 'premium') data.owner = email

    const product = await productsService.createProduct(data)

    res.redirect('/products/' + product._id)
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// Filter by category
export const filterByCategory = async (req, res) => {
  try {
    const category = req.body.category
    res.redirect(`/products?category=${category}`)
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// CARTS
// Get cart products
export const getCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid
    const cart = await cartsService.getCart(cid)
    const products = cart.toObject()

    const user = req.user
    res.render('cart', { cid, products, user })
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { cid, pid } = req.params
    const user = req.user
    const cart = await cartsService.getCart(cid)
    const product = await productsService.getProduct(pid)
    const quantity = req.body.quantity || 1

    if (user.role === 'premium' && cart.owner === user.id) {
      const error = "You can't add your own product to your cart."
      req.logger.error(error)
      return res.status(403).json({ status: 'error', error })
    }

    cartsService.addProductToCart(user, cart, product, quantity)
    res.redirect('/carts/' + cid)
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// Delete product from cart
export const deleteCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid
    const cart = await cartsService.updateCart(cid, { products: [] })
    const user = req.user
    res.render('cart', { cid, products: cart, user })
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// Purchase
export const purchase = async (req, res) => {
  try {
    const { cid } = req.params
    const purchaser = req.user.email
    const { outOfStock, ticket } = await cartsService.purchase(cid, purchaser)

    if (outOfStock.length > 0) {
      return res.render('purchase', { ids: outOfStock, ticket, cid })
    }

    res.render('purchase', { ticket })
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

// SESSIONS
// Vista para registrar usuarios
export const renderRegister = (req, res) => {
  res.render('sessions/register')
}

// Vista de login
export const renderLogin = (req, res) => {
  res.render('sessions/login')
}

// Crear usuarios en la DB
export const register = async (req, res) => {
  res.redirect('/sessions/login')
}

// Login
export const login = async (req, res) => {
  const user = req.user
  if (!user)
    return res
      .status(400)
      .render('errors/base', { error: 'Invalid credentials', user })

  res.cookie('mycookie', user.token).redirect('/products')
}

// Logout
export const logout = async (req, res) => {
  const user = req.user
  user.last_connection = new Date()
  await usersService.updateUser(user.id, user)
  res.clearCookie('mycookie').redirect('/sessions/login')
}

// Get user
export const getUser = (req, res) => {
  const user = req.user

  if (!user) {
    return res.status(404).render('errors/base', {
      error: 'User not found',
    })
  }

  res.render('sessions/user', { user })
}

// Iniciar sesión con Github
export const githubLogin = async (req, res) => {
  return res.cookie('mycookie', req.user.token).redirect('/products')
}

// Renderizar página para enviar mail
export const renderForgotPassword = async (req, res) => {
  res.render('sessions/forgotPassword')
}

export const sendRecoveryMail = async (req, res) => {
  try {
    const { email } = req.body
    await usersService.sendMail(email)
    res.render('sessions/message', {
      message: `Enviamos un email al correo ${email}. Ingresá al link para restablecer la contraseña.`,
    })
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}

export const renderChangePassword = async (req, res) => {
  const { uid, token } = req.params
  res.render('sessions/changePassword', { uid, token })
}

export const changePassword = async (req, res) => {
  try {
    const { uid, token } = req.params
    const { newPassword, confirmation } = req.body
    const { err } = validateToken(token)
    const user = await usersService.getUserByID(uid)

    if (err?.name === 'TokenExpiredError')
      return res.status(403).redirect('/sessions/password_reset')
    else if (err) return res.render('errors/base', { error: err })

    if (!newPassword || !confirmation)
      return res.render('errors/base', {
        error: 'Escriba y confirme la nueva contraseña',
      })
    if (comparePasswords(user, newPassword))
      return res.render('errors/base', {
        error: 'La contraseña no puede ser igual a la anterior.',
      })
    if (newPassword != confirmation)
      return res.render('errors/base', {
        error: 'Las contraseñas no coinciden.',
      })

    const userData = {
      ...user,
      password: createHash(newPassword),
    }

    const newUser = await usersService.updateUser(uid, userData)
    res.render('sessions/message', {
      message: 'Tu contraseña ha sido actualizada. Ya podés iniciar sesión.',
    })
  } catch (error) {
    req.logger.error(error.toString())
    res.render('base', { error })
  }
}