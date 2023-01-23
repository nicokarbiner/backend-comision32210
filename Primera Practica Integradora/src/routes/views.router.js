import { Router } from 'express'
import productModel from '../dao/models/product.model.js'

const router = Router()

// Get products
router.get('/', async (req, res) => {
    try {
        const products = await productModel.find().lean().exec()

        const limit = req.query.limit
        if(limit) products.splice(limit)
        
        res.render('index', { products })
    } catch (error) {
        console.log(error)
        res.json({ result: 'error', error })
    }
})

// Create products form
router.get('/create', async (req, res) => {
    res.render('create', {})
})

// Delete
router.get('/delete/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const result = await productModel.deleteOne({_id: pid})
        res.redirect('/')
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Get one product
router.get('/:pid', async (req, res) => {
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
router.post('/', async (req, res) => {
    try {
        // const newProduct = await productModel.create(req.body)
        const newProduct = req.body
        const generatedProduct = new productModel(newProduct)
        await generatedProduct.save()

        res.redirect('/' + generatedProduct._id)
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

export default router