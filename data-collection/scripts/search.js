import fs from "node:fs";
import { pipeline } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const pc = new Pinecone({
  apiKey: PINECONE_API_KEY,
});
const index = pc.index("blog-genie");

// Function to chunk array into smaller arrays
function chunkArray(array, chunkSize) {
  return Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)
  );
}

// Stream processing function
async function processDocuments(docs) {
  const pipe = await pipeline(
    "feature-extraction",
    "mixedbread-ai/mxbai-embed-large-v1"
  );

  let i = 0;
  const batchSize = 10; // Adjust batch size as needed
  const chunks = chunkArray(docs, batchSize);

  for (const chunk of chunks) {
    const embeddings = await Promise.all(
      chunk.map(async (doc) => {
        const res = await pipe(doc.content, {
          pooling: "mean",
          normalize: true,
        });
        return {
          id: String(i++),
          values: res.tolist()[0],
          metadata: { link: doc.link, content: doc.content },
        };
      })
    );

    await index.upsert(embeddings);
    console.log(`Processed ${i} documents`);
  }
}

async function main() {
  // Assuming "chunked.json" and "chunked-2.json" are large files, consider streaming them instead of loading into memory
  const doc1Stream = fs.readFileSync("../data/chunked.json");
  const doc2Stream = fs.readFileSync("../data/chunked-2.json");

  // Read data from streams and process
  let docs = [];
  for await (const chunk of [doc1Stream, doc2Stream]) {
    const chunkedDocs = JSON.parse(chunk);
    docs.push(...chunkedDocs);
  }

  await processDocuments(docs);
}

main().catch(console.error);
