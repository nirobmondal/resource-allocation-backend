import { Router } from "express";
import { categoryController } from "./category.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", checkAuth(Role.ADMIN), categoryController.createCategory);
router.get("/", categoryController.getAllCategory);
router.patch("/:id", checkAuth(Role.ADMIN), categoryController.updateCategory);
router.delete("/:id", checkAuth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoute = router;
