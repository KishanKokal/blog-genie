import { pipeline } from "@xenova/transformers";
import fs from "node:fs";

const posts = JSON.parse(
  fs.readFileSync("../data/posts-with-content.json", "utf-8")
)["posts"];

let generateEmbeddings = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

let i = 0;
for (const post of posts) {
  console.log(i++);
  const result = await generateEmbeddings(post["content"], {
    pooling: "mean",
    normalize: true,
  });
  post["content-embeddings"] = result;
}

fs.writeFileSync(
  "../data/posts-with-embeddings.json",
  JSON.stringify({ posts })
);
