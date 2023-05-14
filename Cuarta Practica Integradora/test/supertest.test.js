import chai from "chai";
import supertest from "supertest";
import config from "../src/config/config.js";
const { COOKIE_NAME, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = config;

const expect = chai.expect;
const requester = supertest(BASE_URL);

describe("Testing e-commerce", function () {
  let cookie
  this.timeout(0)

  after(function () {
    requester
      .delete('/api/users/email/test@test.com')
      .set('Cookie', [`${cookie.name}=${cookie.value}`])
      .then(result => console.log('Delete test user.', result._body))
  })

  describe('Test de sessions', () => {
    const mockUser = {
      first_name: 'Test',
      last_name: 'Test',
      email: 'test@test.com',
      password: '4878785',
      age: '36',
      role: 'premium',
    }

    it('El endpoint POST /api/sessions/register debe registrar un usuario correctamente', async () => {
      const { _body } = await requester
        .post('/api/sessions/register')
        .send(mockUser)
      expect(_body.payload).to.have.property('_id')
    })

    it('El endpoint POST /api/sessions/login debe loguear correctamente al usuario y devolver una cookie', async () => {
      const data = {
        email: mockUser.email,
        password: mockUser.password,
      }

      const result = await requester.post('/api/sessions/login').send(data)
      const cookieResult = result.headers['set-cookie'][0]
      expect(cookieResult).to.be.ok
      cookie = {
        name: cookieResult.split('=')[0],
        value: cookieResult.split('=')[1],
      }
      expect(cookie.name).to.be.ok.and.eql(COOKIE_NAME)
      expect(cookie.value).to.be.ok
    })

    it('El endpoint GET /api/sessions/current debe devolver la información no sensible del usuario a partir de la cookie', async () => {
      const { _body } = await requester
        .get('/api/sessions/current')
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload.email).to.be.eql(mockUser.email)
      expect(_body.payload.password).to.be.eql(undefined)
    })
  })

  describe('Test de products', () => {
    const mockProduct = {
      title: 'Bitcoin',
      description: 'Criptomoneda Descentralizada',
      lang: 'es',
      code: 'JKJ124',
      price: 27000,
      stock: 11,
      categories: ['programacion'],
      thumbnails: [],
    }

    before(async function () {
      const { _body } = await requester
        .get('/api/sessions/current')
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      mockProduct.owner = _body.payload.email
    })

    it('El endpoint GET /api/products debe devolver los productos con paginación', async () => {
      const { _body } = await requester
        .get('/api/products')
        .set('Cookie', [`${cookie.name}=${cookie.value}`])

      expect(_body.payload).to.have.property('docs')
      expect(_body.payload.docs).to.be.an('array')
    })

    it('El endpoint GET /api/products/:pid debe devolver un solo producto', async () => {
      const { _body } = await requester
        .get('/api/products/645cbfc955e63737e5c6e186')
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload._id).to.be.ok
    })

    it('El endpoint POST /api/products debe poder crear un producto', async () => {
      const { _body } = await requester
        .post('/api/products')
        .send(mockProduct)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload._id).to.be.ok
      expect(_body.payload.title).to.be.eql(mockProduct.title)

      mockProduct._id = _body.payload._id
    })

    it('El endpoint PUT /api/products/:pid debe modificar un producto existente', async () => {
      const data = {
        description: 'Descripción modificada',
        stock: 26,
      }

      const { _body } = await requester
        .put(`/api/products/${mockProduct._id}`)
        .send(data)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload.modifiedCount).to.be.ok.and.eql(1)
    })

    it('El endpoint DELETE /api/products/:pid debe eliminar un producto', async () => {
      const { _body } = await requester
        .delete(`/api/products/${mockProduct._id}`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload.deletedCount).to.be.ok.and.eql(1)
    })
  })

  describe('Test de carts', () => {
    let mockCart
    const data = [
      { product: '645cbfc955e63737e5c6e186', quantity: 1 },
      { product: '645cbfc955e63737e5c6e188', quantity: 2 },
    ]
    const pid = data[0].product

    before(async function () {
      const { _body } = await requester
        .get('/api/sessions/current')
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      mockCart = { _id: _body.payload.cart, products: [] }
    })

    it('El endpoint POST /api/carts debe crear un carrito con un arreglo de productos vacío', async () => {
      const { _body } = await requester
        .post('/api/carts')
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload._id).to.be.ok
      expect(_body.payload.products).to.be.deep.equal([])
    })

    it('El endpoint PUT /api/carts/:cid debe actualizar un carrito con un arreglo de productos', async () => {
      const { _body } = await requester
        .put(`/api/carts/${mockCart._id}`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
        .send(data)
      expect(_body.payload.id).to.be.ok
      expect(_body.payload.products).to.be.deep.equal(data)
    })

    it('El endpoint GET /api/carts/:cid debe obtener un carrito con sus productos', async () => {
      const { _body } = await requester
        .get(`/api/carts/${mockCart._id}`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload._id).to.be.ok
      expect(_body.payload.products).to.be.ok.and.an('array')
    })

    it('El endpoint DELETE /api/carts/:cid debe vaciar el carrito', async () => {
      const { _body } = await requester
        .delete(`/api/carts/${mockCart._id}/`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload.products).to.be.deep.equal([])
    })

    it('El endpoint POST /api/carts/:cid/products/:pid debe agregar un producto a un carrito', async () => {
      const { _body } = await requester
        .post(`/api/carts/${mockCart._id}/products/${pid}`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload.products[0].product).to.be.ok.and.deep.equal(pid)
    })

    it('El endpoint PUT /api/carts/:cid/products/:pid debe actualizar la cantidad de un producto', async () => {
      const { _body } = await requester
        .put(`/api/carts/${mockCart._id}/products/${pid}`)
        .send({ quantity: 2 })
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload.products[0].quantity).to.be.ok.and.deep.equal(2)
    })

    it('El endpoint DELETE /api/carts/:cid/products/:pid debe eliminar un producto de un carrito', async () => {
      const { _body } = await requester
        .delete(`/api/carts/${mockCart._id}/products/${pid}`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload.products).to.be.deep.equal([])
    })

    it('El endpoint POST /api/carts/:cid/purchase debe generar un ticket de compra', async () => {
      await requester
        .post(`/api/carts/${mockCart._id}/products/${pid}`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])

      const { _body } = await requester
        .post(`/api/carts/${mockCart._id}/purchase`)
        .set('Cookie', [`${cookie.name}=${cookie.value}`])
      expect(_body.payload._id).to.be.ok
      expect(_body.payload.purchaser).to.be.eql('test@test.com')
    })
  })
})