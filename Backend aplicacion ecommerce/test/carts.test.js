import mongoose from "mongoose"
import chai from "chai"
import Cart from "../src/dao/classes/carts.dao.js"
import config from "../src/config/config.js"
const { TEST_MONGO_URI } = config

mongoose.connect(TEST_MONGO_URI);
const expect = chai.expect;

describe("Testing Carts DAO", () => {
    before(function() {
        this.cartsDao = new Cart()
    })

    beforeEach(function() {
        mongoose.connection.collections.carts.drop()
        this.timeout(0)
    })

    it("El DAO debe poder crear un carrito con una propiedad products que por defecto es un array vacío", async function() {
        const cart = await this.cartsDao.create()
        expect(cart._id).to.be.ok
        expect(cart.products).to.be.deep.equal([])
    })

    it("El DAO debe poder obtener un carrito mediante su ID", async function() {
        const cart = await this.cartsDao.create()
        const foundCart = await this.cartsDao.getByID(cart._id)
        expect(foundCart._id).to.be.ok
        expect(foundCart.products).to.be.an("array")
    })

    it("El DAO debe poder modificar un carrito", async function() {
        const cart = await this.cartsDao.create()
        const data = [{product: "63d3df5453af636c753a106a", quantity: 3}, {product: "641c61487f90f07c92ba8807", quantity: 1}]
        const result = await this.cartsDao.update(cart._id, data)
        expect(result.modifiedCount).to.be.ok.and.eql(1)
    })
})