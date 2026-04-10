import { Router } from "express";
import { cartController } from "./cart.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post("/", checkAuth(Role.CUSTOMER), cartController.addToCart);
router.get("/", checkAuth(Role.CUSTOMER), cartController.getCartItems);
router.put("/", checkAuth(Role.CUSTOMER), cartController.updateCartItem);
router.delete(
  "/:medicineId",
  checkAuth(Role.CUSTOMER),
  cartController.deleteCartItem,
);
router.delete("/", checkAuth(Role.CUSTOMER), cartController.clearCart);

export const cartRoute = router;
