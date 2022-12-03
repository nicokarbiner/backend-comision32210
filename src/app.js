const express = require('express');
const app = express();

const ProductManager = require('./productmanager')
const manager = new ProductManager('./producto.json');


app.get('/products', async (req, res) => {
    const products = await manager.getProducts()
    let limit = req.query.limit
    if (!limit) res.send({products})
    else {
        const prodLimit = [];
        if (limit > products.length) limit = products.length;
        for (let index = 0; index < limit; index++) {
            prodLimit.push(products[index]);
        }
        res.send({prodLimit})
    }
})

app.get('/products/:pid', async (req, res) => {
    const id = req.params.pid
    const product = await manager.getProductById(id)
    res.send({product})
})


app.listen(8080, ()=>{
    console.log("Escuchando en el puerto 8080...");
});