import { Router } from "express";
import { manufacturerController } from "./manufacturer.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN),
  manufacturerController.createManufacturer,
);
router.get("/", manufacturerController.getAllManufacturer);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  manufacturerController.updateManufacturer,
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  manufacturerController.deleteManufacturer,
);

export const manufacturerRoute = router;
