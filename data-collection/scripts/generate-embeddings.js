import { pipeline } from "@xenova/transformers";
import fs from "node:fs";

let posts = JSON.parse(fs.readFileSync("../data/posts.json", "utf-8"));

pipeline("feature-extraction", "nomic-ai/nomic-embed-text-v1")
  .then((generateEmbeddings) => {
    let i = 0;
    let processedCount = 0; // Counter for processed posts
    const embeddingPromises = posts.map(async (post) => {
      try {
        const result = await generateEmbeddings(post["content"], {
          pooling: "mean",
          normalize: true,
        });
        delete post["_id"];
        post["content-embeddings"] = result.tolist()[0];
        processedCount++; // Increment counter for processed posts
        console.log(post);
        return post;
      } catch (error) {
        console.error("Error generating embeddings:", error);
        return null; // Return null for failed posts
      }
    });

    Promise.all(embeddingPromises).then((postsWithEmbeddings) => {
      const filteredPosts = postsWithEmbeddings.filter((post) => post !== null);
      fs.writeFileSync(
        "../data/posts-with-embeddings.json",
        JSON.stringify(filteredPosts)
      );
      console.log(`Total posts processed: ${processedCount}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing embeddings pipeline:", error);
  });
