import fs from 'fs'

class ProductsManager {

    constructor(path) {
        this.path = path
        this.format = 'utf-8'
    }

    writeFile = productsArray => {
        return fs.promises.writeFile(this.path, JSON.stringify(productsArray))
    }

    getNextID = async () => {
        return this.getProducts()
            .then(products => {
                const count = products.length
                return (count > 0) ? products[count-1].id + 1 : 1
            })
    }
    
    getProducts = async () => {
        return fs.promises.readFile(this.path, this.format)
            .then(content => JSON.parse(content))
            .catch(() => {return [] })
    }
    
    getProductsById = async (id) => {
        const products = await this.getProducts()
        const productById = products.find(prod => prod.id == id);

        return productById ?? "Not Found"
    }

    addProduct = async (title, description, code, price, status, stock, category, thumbnail) => {
        const products = await this.getProducts()
        const id = await this.getNextID()
        
        if (!title || !description || !code || !Number.isInteger(price) || !Number.isInteger(stock) || !category) return "Fail"
    
        const product = {
            id,
            title, 
            description,
            code,
            price,
            status: status ? status : true,
            stock,
            category,
            thumbnail: thumbnail ? thumbnail : []
        }

        const codes = products.map(prod => prod.code);

        if (codes.includes(product.code)) {
            console.log(`ERROR: CÓDIGO DUPLICADO\nNo se agrega el producto "${product.title}"`)
        } else {
            products.push(product)
            await this.writeFile(products)  
            return product
        }
    }

    updateProduct = async (id, object) => {
        const products = await this.getProducts()
        const ids = products.map(prod => prod.id);
        const productIndex = ids.indexOf(parseInt(id))
        const productToUpdate = products[productIndex]

        if (!productToUpdate) {
            return console.log("Not Found")
        } else {
            const updatedProduct = {
                ...productToUpdate,
                ...object
            }
            products.splice(productIndex, 1, updatedProduct)
            await this.writeFile(products) 
            return updatedProduct
        }
    }

    deleteProduct = async (id) => {
        const products = await this.getProducts()
        const ids = products.map(prod => prod.id);
        const productIndex = ids.indexOf(parseInt(id))
        const productToDelete = products[productIndex]

        if (!productToDelete) {
            return console.log("Not Found")
        } else {
            products.splice(productIndex,1)
            console.log(`Producto ${productToDelete.title} eliminado`)
            await this.writeFile(products)
            return productToDelete
        }
    }
}

export default ProductsManager