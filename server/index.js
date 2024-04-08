import express from "express";
import GenerateRouter from "./src/generate/generate.routes.js";

const app = express();

app.use(express.json());
app.use("/genie/ollama", GenerateRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
