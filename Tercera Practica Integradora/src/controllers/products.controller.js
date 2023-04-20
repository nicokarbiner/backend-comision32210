import { productsService } from "../repositories/index.js";
import CustomError from "../services/errors/CustomError.js";

export const getProducts = async (req, res) => {
  try {
    const products = await productsService.getProducts();
    res.json({ status: "success", payload: products });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ result: "error", error });
  }
};

export const getProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    res.json({ status: "success", payload: product });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { role, id } = req.user
    const product = req.body;

    if(role === "premium") product.owner = id

    const result = await productsService.createProduct(product);
    res.json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    const user = req.user;

    const userID = user.id.toString()
    const owner = product.owner?.toString()

    if(user.role === "premium" && userID !== owner) {
      const error = "You can't modify a product owned by another user"
      req.logger.error(error)
      return res.status(403).json({status: "error", error})
    }

    const updatedProduct = {
      ...product,
      ...req.body,
    };
    const result = await productsService.updateProduct(pid, updatedProduct);
    res.json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    const user = req.user;

    const userID = user.id.toString()
    const owner = product.owner?.toString()

    if(user.role === "premium" && userID !== owner) {
      const error = "You can't modify a product owned by another user"
      req.logger.error(error)
      return res.status(403).json({status: "error", error})
    }

    const result = await productsService.deleteProduct(pid);

    res.json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};