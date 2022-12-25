import fs from 'fs'

class CartsManager {

    constructor(path) {
        this.path = path
        this.format = 'utf-8'
    }
    
    writeFile = cartsArray => {
        return fs.promises.writeFile(this.path, JSON.stringify(cartsArray))
    }

    getCarts = async () => {
        return fs.promises.readFile(this.path, this.format)
            .then(content => JSON.parse(content))
            .catch(() => {return [] })
    }

    getNextID = async () => {
        return this.getCarts()
            .then(carts => {
                const count = carts.length
                return (count > 0) ? carts[count-1].id + 1 : 1
            })
    }

    getCartsById = async (id) => {
        const carts = await this.getCarts()
        const cartById = carts.find(cart => cart.id == id);

        return cartById ?? "Not Found"
    }

    addCart = async () => {
        const carts = await this.getCarts()
        const id = await this.getNextID()
        const cart = {
            id,
            products: []
        }
       
        carts.push(cart)
        await this.writeFile(carts)  
        return cart
    }

    updateCart = async (idCart, idProd) => {
        const carts = await this.getCarts()
        const cartToUpdate = carts.find(cart => cart.id == idCart);
        const cartsIds = carts.map(cart => cart.id);
        const cartIndex = cartsIds.indexOf(parseInt(idCart))

        const prodToUpdate = cartToUpdate.products.find(prod => prod.product == idProd);
        const prodsIds = cartToUpdate.products.map(prod => prod.product);
        const prodIndex = prodsIds.indexOf(parseInt(idProd))


        if (!prodToUpdate) {
            const newProductToCart = {
                product: idProd,
                quantity: 1
            }
            cartToUpdate.products.push(newProductToCart)
            carts.splice(cartIndex, 1, cartToUpdate)
            await this.writeFile(carts) 
            return newProductToCart
        } else {
            const updatedProduct = {
                ...prodToUpdate,
                quantity: prodToUpdate.quantity + 1
            }
            cartToUpdate.products.splice(prodIndex, 1,updatedProduct)
            carts.splice(cartIndex, 1, cartToUpdate)
            await this.writeFile(carts) 
            return updatedProduct
        }
    }
}

export default CartsManager