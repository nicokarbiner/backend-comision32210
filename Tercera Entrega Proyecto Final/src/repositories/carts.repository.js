import CartDTO from "../dao/DTO/cart.dto.js";

export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createCart = async () => {
    return await this.dao.create();
  };

  getCart = async (id) => {
    return await this.dao.getByID(id);
  };

  updateCart = async (id, data) => {
    return await this.dao.update(id, data);
    // return new CartDTO(cart);
  };

  addProductToCart = async (cart, product) => {
    if (!cart) throw new Error("No se ha encontrado el carrito" ) 
    if (!product) throw new Error("No se ha encontrado el producto")

    const productIndex = cart.products.findIndex((p) => p.product?.equals(product._id));
    if (productIndex === -1) {
      cart.products.push({ product: product._id, quantity: 1 });
      await this.updateCart(cart.id, cart)
    } else {
      cart.products[productIndex].quantity++;
      await this.updateCart(cart.id, cart)
    }
    return cart
  };
}