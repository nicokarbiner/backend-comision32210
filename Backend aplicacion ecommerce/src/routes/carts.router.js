import { Router } from "express"
import {
  createCart,
  getProducts,
  addProduct,
  updateCart,
  updateQuantity,
  emptyCart,
  deleteProduct,
  purchase,
  prepareCheckout,
  finishCheckout,
} from "../controllers/carts.controller.js"

const router = Router()

router.post("/", createCart)
router.get("/:cid", getProducts)
router.put("/:cid", updateCart)
router.delete("/:cid", emptyCart)
router.post("/:cid/products/:pid", addProduct)
router.put("/:cid/products/:pid", updateQuantity)
router.delete("/:cid/products/:pid", deleteProduct)
router.post("/:cid/purchase", purchase)
router.post('/:cid/checkout', prepareCheckout)
router.post('/:cid/finish_checkout', finishCheckout)

export default router