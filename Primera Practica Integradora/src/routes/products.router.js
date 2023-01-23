import { Router } from 'express'
import productModel from '../dao/models/product.model.js'

const router = Router()

// Get products
router.get('/', async (req, res) => {
    try {
        const products = await productModel.find().lean().exec()

        const limit = req.query.limit
        if(limit) products.splice(limit)
        
        res.json({ status: 'success', payload: products })
    } catch (error) {
        console.log(error)
        res.json({ result: 'error', error })
    }
})

// Get one product
router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const product = await productModel.findOne({_id: pid}).lean().exec()
        res.json({ status: 'success', payload: product })
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

        res.json({ status: "success", payload: newProduct })
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Update product
router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const productToUpdate = req.body
        const result = await productModel.updateOne({_id: pid}, productToUpdate)

        res.json({ status: "success", payload: result })
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

// Delete product
router.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const result = await productModel.deleteOne({_id: pid})

        res.json({ status: "success", payload: result })
    } catch(error) {
        console.log(error)
        res.json({ status: 'error', error })   
    }
})

export default router