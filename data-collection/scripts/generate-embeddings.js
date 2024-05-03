import { pipeline } from "@xenova/transformers";
import fs from "node:fs";

const batchSize = 10; // Number of posts to process in each batch
let posts = JSON.parse(fs.readFileSync("../data/posts.json", "utf-8"));
let processedCount = 0; // Counter for processed posts

const processBatch = async (start, end) => {
  const batch = posts.slice(start, end);
  const generateEmbeddings = await pipeline(
    "feature-extraction",
    "nomic-ai/nomic-embed-text-v1"
  );

  const embeddingPromises = batch.map(async (post) => {
    try {
      const result = await generateEmbeddings(post["content"], {
        pooling: "mean",
        normalize: true,
      });
      delete post["_id"];
      post["content-embeddings"] = result.tolist()[0];
      processedCount++; // Increment counter for processed posts
      console.log(`Processed ${processedCount} posts`);
      return post;
    } catch (error) {
      console.error("Error generating embeddings:", error);
      return null; // Return null for failed posts
    }
  });

  const postsWithEmbeddings = await Promise.all(embeddingPromises);
  return postsWithEmbeddings.filter((post) => post !== null);
};

const saveProgress = (index) => {
  fs.writeFileSync("../data/progress.json", JSON.stringify({ index }));
};

const loadProgress = () => {
  try {
    const progressData = fs.readFileSync("../data/progress.json", "utf-8");
    return JSON.parse(progressData).index;
  } catch (error) {
    console.error("Error loading progress:", error);
    return 0; // Start from the beginning if progress file doesn't exist
  }
};

const processPosts = async () => {
  let start = loadProgress();
  let end = Math.min(start + batchSize, posts.length);
  let allPosts = [];

  while (start < posts.length) {
    const batchPosts = await processBatch(start, end);
    allPosts = [...allPosts, ...batchPosts];
    start += batchSize;
    end = Math.min(start + batchSize, posts.length);
    saveProgress(start); // Save progress after processing each batch
    // Write processed posts to file after each batch
    fs.writeFileSync(
      "../data/posts-with-embeddings-2.json",
      JSON.stringify(allPosts)
    );
  }
  console.log(`Total posts processed: ${processedCount}`);
};

processPosts().catch((error) => {
  console.error("Error processing posts:", error);
});
