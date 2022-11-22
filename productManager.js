class ProductManager {

    constructor() {
        this.products = []
    }

    getProducts = () => { return this.products }

    getNextID = () => {
        const count = this.products.length

        if (count > 0) {
            const lastproduct = this.products[count - 1]
            const id = lastproduct.id + 1

            return id
        } else {

            return 1
        }
    }

    addProducts = (title, description, price, thumbnail, code, stock) => {

        const id = this.getNextID()
        const product = {
            id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,

        }

        const codeDuplicado = this.products.some(product => product.code === code)
        if (codeDuplicado == true) return console.log("CODE REPETIDO - No se carga producto")
        if (!codeDuplicado) { this.products.push(product) }
    }

    getProductByID = (id) => {
        const productFound = this.products.find(product => product.id == id)
        if (productFound == undefined) return console.log("ERROR: PRODUCTO NO ENCONTRADO")
        console.log(productFound)

    }
}

const productManager = new ProductManager()

console.log(productManager.getProducts());

productManager.addProducts("Producto prueba 1", "Este es un producto de prueba", 200, "Sin imagen", "abc123", 25)

console.log(productManager.getProducts())
console.log("------------------------------------------------")

productManager.addProducts("Producto prueba 2", "Este es un producto de prueba", 300, "Sin imagen", "abc123", 21)
productManager.addProducts("      ", "", 0, "", "", )

console.log(productManager.getProducts())
console.log("-----------------------------------------------------")

productManager.addProducts("Producto prueba 3", "Este es un producto de prueba", 1500, "Con imagen", "abc111", 15)
productManager.addProducts("Producto prueba 4  ", "Este es un producto de prueba", 700, "  Sin imagen", "abd100", 18)
productManager.addProducts("Producto prueba 5", "      ", 150, "Sin imagen", "abe102", 20)

console.log(productManager.getProducts())
console.log("---------------------------------------------------")

productManager.getProductByID(2);
productManager.getProductByID(3);
productManager.getProductByID(15);
