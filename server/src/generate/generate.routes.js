import { Router } from "express";
import { generateResponse } from "./generate.controllers.js";

const router = Router();

router.post("/generate", generateResponse);

export default router;
