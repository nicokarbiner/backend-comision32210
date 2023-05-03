import ProductDTO from "../dao/DTO/product.dto.js"

export default class ProductsRepository {
    constructor(dao) {
        this.dao = dao
    }

    getProducts = async () => await this.dao.get()

    getPaginate = async (req) => {
        const limit = req.query?.limit || 10;
        const page = req.query?.page || 1;
        const category = req.query?.category;
        const sortQuery = req.query?.sort;
        const sortOrder = req.query?.sortOrder || "desc";
        const stock = req.query?.stock;
    
        const query = {
          ...(category ? { categories: category } : null),
          ...(stock ? { stock: { $gt: 0 } } : null),
        };
    
        const sort = {};
        if (sortQuery) {
          sort[sortQuery] = sortOrder;
        }
    
        const options = {
          limit,
          page,
          sort,
          lean: true,
        };

        return {products: await this.dao.getPaginate(query, options), options: {... options, stock}}
    }
    
    getProduct = async (id) => {
        return await this.dao.getByID(id)
    }

    createProduct = async (data) => {
        const dataToInsert = new ProductDTO(data)
        return await this.dao.create(dataToInsert)
    }

    updateProduct = async (id, data) => {
        const product = new ProductDTO(data)
        return await this.dao.update(id, product)
    }

    updateStock = async (id, n) => {
        return await this.dao.update(id, {$inc: {"stock": -n}})
      }

    deleteProduct = async (id) => await this.dao.delete(id)
}