import { Router } from "express";
import {
  generateResponse,
  downloadDocument,
  healthController,
  generateEmbeddingsController,
} from "./generate.controllers.js";

const router = Router();

router.post("/generate", generateResponse);
router.post("/download", downloadDocument);
router.get("/health", healthController);
router.post("/embeddings", generateEmbeddingsController);

export default router;
