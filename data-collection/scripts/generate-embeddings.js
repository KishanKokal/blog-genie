import { pipeline } from "@xenova/transformers";
import fs from "node:fs";

const posts = JSON.parse(fs.readFileSync("posts-with-content.json", "utf-8"))[
  "posts"
];

let generateEmbeddings = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

for (const post of posts) {
  const result = await generateEmbeddings(post["content"], {
    pooling: "mean",
    normalize: true,
  });
  console.log(post["content"]);
  console.log(result);
}
