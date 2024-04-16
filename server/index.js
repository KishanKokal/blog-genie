import express from "express";
import GenerateRouter from "./src/generate/generate.routes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/genie", GenerateRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
