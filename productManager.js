class ProductManager {

    constructor() {
        this.products = []
    }

    getProducts = () => { return this.products }

    addProduct = (title, description, price, thumbmail, code, stock) => {

        // Funcion generadora de ID Unicos. Fuente: https://es.stackoverflow.com/
        function id() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }
        console.log(id());

        /* const id = this.products + 1 */

        const product = {
            id,
            title: "producto prueba",
            description: "Este es un producto prueba",
            price: 200,
            thumbnail: "Sin imagen",
            code: "abc123",
            stock: 25,
        }

        const sameCode = (element) => element == product.code;
        if (!this.products.some(sameCode)) { this.products.push(product) } else { console.log("A Code is duplicated") }

    }

}

const manager = new ProductManager()

manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25)

console.log(manager.products);

