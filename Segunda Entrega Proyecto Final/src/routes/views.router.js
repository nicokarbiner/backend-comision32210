import { Router } from 'express'
import cartModel from '../dao/models/cart.model.js'
import productModel from '../dao/models/product.model.js'

const router = Router()

// Get products
router.get('/products', async (req, res) => {
    try {
        const limit = req.query.limit || 12
        const page = req.query.page || 1
        const sort = req.query.sort //Funciona si pasamos asc/desc o 1/-1
        const category = req.query.category
        const stock = req.query.stock

        const query = {
            ... category ? {categories: category} : null,
            ... stock ? {stock: {$gt: 0}} : null
        }

        const products = await productModel.paginate(query, {
            page: page, 
            limit: limit,
            sort: {price: sort} || null,
            lean: true
        })

        products.prevLink = products.hasPrevPage ? `/products?page=${products.prevPage}&limit=${limit}${category ? `&category=${category}` : ''}${stock ? `&stock=${stock}` : ''}` : ''
        products.nextLink = products.hasNextPage ? `/products?page=${products.nextPage}&limit=${limit}${category ? `&category=${category}` : ''}${stock ? `&stock=${stock}` : ''}` : ''

        res.render('products', products)
    } catch (error) {
        console.log(error)
        res.json({ result: 'error', error })
    }
})

// Create products form
router.get('/products/create', async (req, res) => {
    res.render('create', {})
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
        
        res.render('oneProduct', { product })
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

export default router