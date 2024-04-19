import { Router } from "express";
import {
  generateResponse,
  downloadDocument,
  healthController,
} from "./generate.controllers.js";

const router = Router();

router.post("/generate", generateResponse);
router.post("/download", downloadDocument);
router.get("/health", healthController);

export default router;
