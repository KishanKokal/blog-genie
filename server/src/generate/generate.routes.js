import { Router } from "express";
import { generateResponse, downloadDocument } from "./generate.controllers.js";

const router = Router();

router.post("/generate", generateResponse);
router.post("/download", downloadDocument);

export default router;
