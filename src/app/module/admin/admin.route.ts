import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/dashboard",
  checkAuth(Role.ADMIN),
  adminController.getAdminDashboard,
);
router.patch(
  "/ban/:userId",
  checkAuth(Role.ADMIN),
  adminController.banUnbanUser,
);

export const adminRoute = router;
