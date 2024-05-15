import { Ollama } from "ollama";
import { pipeline } from "@xenova/transformers";
import fs from "node:fs";

const ollama = new Ollama();
const pipe = await pipeline(
  "feature-extraction",
  "mixedbread-ai/mxbai-embed-large-v1"
);

const docs = JSON.parse(fs.readFileSync("../data/chunked.json"));

let i = 0;
for (const doc of docs) {
  console.log(i++);
  // const embed1 = await ollama.embeddings({
  //   model: "mxbai-embed-large",
  //   prompt: doc.content,
  // });

  const embed2 = await pipe(doc.content, {
    pooling: "mean",
    normalize: true,
  });
}
