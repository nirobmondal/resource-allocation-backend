import { Router } from "express";
import { ResourceController } from "./resource.controller";

const router = Router();

router.get("/", ResourceController.getAllResources);
router.post("/", ResourceController.createResource);

export const ResourceRoutes = router;
