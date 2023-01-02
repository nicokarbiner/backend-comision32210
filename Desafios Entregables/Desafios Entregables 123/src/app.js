const express = require ('express')

const ProductManager = require('./ProductManager')
const productManager = new ProductManager('products.json');

const app = express();

app.get('/products', async (req, res) => {
    const products = await productManager.getProducts()
    let limit = req.query.limit
    if (!limit) res.send({ products })
    else {
        const prodLimit = [];
        if (limit > products.length) limit = products.length;
        for (let index = 0; index < limit; index++) {
            prodLimit.push(products[index]);
        }
        res.send({ prodLimit })
    }
})

app.get('/products/:pid', async (req, res) => {
    const id = req.params.pid
    const product = await productManager.getProductById(id)
    if(product) res.send(product)
    else res.send({error: 'No se ha encontrado el producto'})
})

app.listen(8080, () => {
    console.log("Sirviendo en el puerto 8080...");
});