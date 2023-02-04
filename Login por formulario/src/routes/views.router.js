import { Router } from 'express'
import cartModel from '../dao/models/cart.model.js'
import productModel from '../dao/models/product.model.js'
import UserModel from '../dao/models/user.model.js'

const router = Router()

function requireAuth(req, res, next) {
    if(req.session?.user) {
        return next()
    } else {
        res.status(401).redirect('/sessions/login')
        return next()
    }
}

function logged(req, res, next) {
    if(!req.session?.user) {
        return next()
    } else {
        res.status(400).redirect('/products')
        return next()
    }
}

// Redirección para empezar por la pantalla de login
router.get('/', requireAuth)

// Get products
router.get('/products', requireAuth, async (req, res) => {
    try {
        const limit = req.query?.limit || 12
        const page = req.query?.page || 1
        const sortQuery = req.query?.sort
        const category = req.query?.category
        const stock = req.query?.stock
        const sortOrder = req.query?.sortorder || 'desc'

        const query = {
            ... category ? {categories: category} : null,
            ... stock ? {stock: {$gt: 0}} : null
        }

        const sort = {}
        if(sortQuery) {
            sort[sortQuery] = sortOrder
        }

        const options = {
            limit,
            page,
            sort,
            lean: true
        }

        const products = await productModel.paginate(query, options) 
    
        products.prevLink = products.hasPrevPage ? `/products?page=${products.prevPage}&limit=${limit}${category ? `&category=${category}` : ''}${stock ? `&stock=${stock}` : ''}` : ''
        products.nextLink = products.hasNextPage ? `/products?page=${products.nextPage}&limit=${limit}${category ? `&category=${category}` : ''}${stock ? `&stock=${stock}` : ''}` : ''

        const user = req.session.user

        res.render('products', {products, user})
    } catch (error) {
        console.log(error)
        res.json({ result: 'error', error })
    }
})

// Create products form
router.get('/products/create', async (req, res) => {
    const user = req.session.user
    res.render('create', {user})
})

// Delete
router.get('/products/delete/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const result = await productModel.deleteOne({_id: pid})
        res.redirect('/products')
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Get one product
router.get('/products/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const product = await productModel.findOne({_id: pid}).lean().exec()
        const user = req.session.user
        
        res.render('oneProduct', { product, user })
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Add product
router.post('/products', async (req, res) => {
    try {
        // const newProduct = await productModel.create(req.body)
        const newProduct = req.body
        const generatedProduct = new productModel(newProduct)
        await generatedProduct.save()

        res.redirect('/products/' + generatedProduct._id)
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Filter by category
router.post('/products/category', async (req, res) => {
    try {
        const category = req.body.category
        res.redirect(`/products?category=${category}`)        
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})


// Get cart products
router.get('/carts/:cid', async (req, res) => {
    try {
        const cid = req.params.cid
        const products = await cartModel.findOne({_id: cid}).populate('products.product').lean()
        const user = req.session.user
        res.render('cart', products)

    } catch (error) {
        console.log(error)
        res.json({ result: 'error', error })
    }
})

// Add product to cart
router.post('/carts/:cid/products/:pid', async (req, res) => {
    try {
        const cid = req.params.cid
        const pid = req.params.pid

        const cart = await cartModel.findOne({_id: cid})
        if(!cart) return res.send({status: "error", error: 'No se ha encontrado el carrito'})

        const product = await productModel.findOne({_id: pid})
        if(!product) return res.send({status: "error", error: 'No se ha encontrado el producto'})

        const productIndex = cart.products.findIndex(p => p.product.equals(product._id))
        if(productIndex === -1) {
            cart.products.push({product: product._id, quantity: 1})
            await cart.save()
        } else {
            cart.products[productIndex].quantity++
            await cartModel.updateOne({_id: cid}, cart)
        }

        res.redirect('/carts/' + cid)

    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Sessions

// Vista para registrar usuarios
router.get('/sessions/register', logged, (req, res) => {
    res.render('sessions/register')
})

// Crear usuarios en la DB
router.post('/sessions/register', async( req, res) => {
    const newUser = req.body

    const user = new UserModel(newUser)
    await user.save()

    res.redirect('/sessions/login')
})

// Vista de login
router.get('/sessions/login', logged, (req, res) => {
    res.render('sessions/login')
})

// Login
router.post('/sessions/login', async (req, res) => {

    const { email, password } = req.body

    if(email === 'testing@coderhouse.com' && password === 'Testing2023') {
        
        const admin = {
            email,
            password,
            first_name: 'Testing',
            last_name: 'Coderhouse',
            age: 20,
            role: 'admin'
        }
        
        req.session.user = admin
        res.redirect('/products')
    }
    
    const user = await UserModel.findOne({email, password}).lean().exec()
    if(!user) {
        return res.status(401).render('errors/base', {
            error: 'Error en email y/o password'
        })
    }

    req.session.user = user
    res.redirect('/products')
    
})

// Cerrar sesión
router.get('/sessions/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            res.status(500).render('errors/base', {error: err})
        } else res.redirect('/sessions/login')
    })
})

// Perfil del usuario
router.get('/sessions/user', requireAuth, (req, res) => {
    const user = req.session.user

    if(!user) {
        return res.status(404).render('errors/base', {
            error: 'User not found'
        })
    }

    res.render('sessions/user', {user})
})

export default router