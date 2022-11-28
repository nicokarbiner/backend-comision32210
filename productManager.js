const fs = require('fs')

class ProductManager {

    constructor(path) {
        this.path = path
        this.format = 'utf-8'
    }

    getProducts = async () => {
        return fs.promises.readFile(this.path, this.format)
            .then(res => {
                if (res) {
                    const products = JSON.parse(res)
                    return products
                } else return []
            })
            .catch(err => {
                console.log("Archivo No Existe. Intentar añadir un producto")
                return []
            })
    }

    getProductById = async (id) => {
        const products = await this.getProducts()
        const productFound = products.find(product => product.id === id)
        return productFound || console.error('Producto No Encontrado')
    }

    getNextID = async () => {
        const products = await this.getProducts()
        const length = products.length
        if (length > 0) {
            const lastProduct = products[length - 1]
            const id = lastProduct.id + 1
            return id
        } else return 1
    }

    checkFields = async (product) => {
        const emptyFields = []
        const products = await this.getProducts()
        const isCodeRepeated = products.some(prod => prod.code === product.code)
        if (isCodeRepeated) {
            console.error(`El código ${product.code} ya está siendo usado`)
            return false
        }
        const productFields = Object.entries(product)
        productFields.forEach(value => {
            if (!value[1]) emptyFields.push(value[0])
        })
        if (emptyFields.length !== 0) {
            console.error("Es requisito necesario completar todos los campos. Campos vacíos: ", emptyFields)
            return false
        }
        return true
    }

    addProducts = async (title, description, price, thumbnail, code, stock) => {
        const id = await this.getNextID()
        const product = {
            id,
            title: title.trim(),
            description: description.trim(),
            price,
            thumbnail: thumbnail.trim(),
            code: code.trim(),
            stock
        }
        if (await this.checkFields(product)) {
            const products = await this.getProducts()
            products.push(product)
            const productsStr = JSON.stringify(products)
            fs.promises.writeFile(this.path, productsStr, error => {
                console.log(error)
            })
        }
    }

    updateProduct = async (id, obj) => {
        const products = await this.getProducts()
        const checkID = () => products.some(prod => prod.id === id)
        if (!checkID()) return console.log("El producto no se encontró")
        const productToUpdate = products.find(prod => prod.id === id)
        const updatedProduct = {
            ...productToUpdate,
            ...obj,
            id: id
        }
        const updatedProducts = products.filter(prod => prod.id !== id)
        updatedProducts.push(updatedProduct)
        const productsStr = JSON.stringify(updatedProducts)
        fs.promises.writeFile(this.path, productsStr, error => console.log(error))
    }

    deleteProduct = async (id) => {
        const products = await this.getProducts()
        const checkID = () => products.some(prod => prod.id === id)
        if (!checkID()) return console.log("No se encuentra Producto")
        const updatedProducts = products.filter(prod => prod.id !== id)
        const productsStr = JSON.stringify(updatedProducts)
        fs.promises.writeFile(this.path, productsStr, error => console.log(error))
    }
}

// Proceso de Testing

async function run () {

    const productManager = new ProductManager('./producto.json')
    console.log(await productManager.getProducts(), '-----1era Impresion-----')

    await productManager.addProducts("Producto prueba 1", "Este es un producto de prueba", 200, "Sin imagen", "abc123", 25)
    console.log(await productManager.getProducts(), '-----2da Impresion-----')

    await productManager.addProducts("Producto prueba 2", "Este es un producto de prueba", 300, "Sin imagen", "abc123", 21)
    await productManager.addProducts("Producto prueba 3", "Este es un producto de prueba", 1500, "Con imagen", "abc111", 15)
    await productManager.addProducts("Producto prueba 4", "Este es un producto de prueba", 700, "  Sin imagen", "abd100", 18)
    console.log(await productManager.getProducts(), '-----3era Impresion-----')
    console.log(await productManager.getProductById(3), '-----4ta Impresion-----')
    console.log(await productManager.getProductById(4), '-----5ta Impresion-----')

    await productManager.updateProduct(3, { title: "Criptomoneda", price: 15000, description: "Titulo Modificado" })
    console.log(await productManager.getProducts(), '-----6ta Impresion-----')

    await productManager.deleteProduct(3)
    console.log(await productManager.getProducts(), '-----7ma Impresion-----')

}

run()
