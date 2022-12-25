import { Router } from 'express'
import ProductsManager from '../productsManager.js'

const viewsRouter = Router()
const productsManager = new ProductsManager('./productos.json')

viewsRouter.get('/', async (req, res) => {
    const products = await productsManager.getProducts()

    res.render('home', {
        products: products,
        style: 'index.css',
        title: "Desafio 4 - Programacion Backend"
    })
})

viewsRouter.get('/realtimeproducts', async (req, res) => {
    const products = await productsManager.getProducts()

    res.render('realTimeProducts', {
        products: products,
        style: 'index.css',
        title: "Desafio 4 - Programacion Backend"
    })
})

export default viewsRouter