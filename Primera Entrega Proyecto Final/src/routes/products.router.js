import { Router } from 'express'
import ProductsManager from '../productsManager.js'

const router = Router()
const productsManager = new ProductsManager('./productos.json')

router.get('/', async (req, res) => {
    const products = await productsManager.getProducts()
    const limit = req.query.limit

    if (limit) {
        const limitedArray = products.slice(0, limit)
        return res.json({products: limitedArray})
    } else {
        res.json({products})
    }
})

router.get('/:pid', async (req, res) => {
    const idProd = req.params.pid
    const productById = await productsManager.getProductsById(idProd)

    res.json({productById})
})

router.post('/', async (req, res) => {
    const body = req.body
    const product = await productsManager.addProduct(body)

    if (!product) {
        return res.status(404).json({status: "error", error: "Product Duplicated"})
    } else {
        if (product === "Fail") res.json({status: 'error', message: 'Missing object parameters'})
        else res.json({status: 'success', message: 'Product added!', product: product})
    }
})

router.put('/:pid', async (req, res) => {
    const idProd = req.params.pid
    const body = req.body
    const productToUpdate = await productsManager.updateProduct(idProd, body)

    if (!productToUpdate) {
        return res.status(404).json({status: "error", error: "Product not found"})
    }

    res.json({status: 'success', message: 'Product updated!', product: productToUpdate})
})

router.delete('/:pid', async (req, res) => {
    const idProd = req.params.pid
    const productToDelete = await productsManager.deleteProduct(idProd)

    if(!productToDelete) {
        return res.status(404).json({status: "error", error: "Product not found"})
    }

    res.json({status: 'success', message: 'Product deleted!', product: productToDelete})

})

export default router