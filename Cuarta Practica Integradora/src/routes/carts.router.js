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

export default router;