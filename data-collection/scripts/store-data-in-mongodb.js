import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import fs from "node:fs";
dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const doc1 = JSON.parse(fs.readFileSync("../data/ollama.json"));
const doc2 = JSON.parse(fs.readFileSync("../data/ollama-2.json"));
let docs = doc1.concat(doc2);

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY,
});
const index = pc.index("blog-genie");

let i = 0;
for (const doc of docs) {
  doc["id"] = String(i++);
  doc["values"] = doc["content-embeddings"];
  delete doc["content-embeddings"];
  doc["metadata"] = { link: doc["link"], content: doc["content"] };
  delete doc["link"];
  delete doc["content"];
}

const batchSize = 100;
let batch = [];
for (const doc of docs) {
  batch.push(doc);
  if (batch.length === batchSize) {
    await index.upsert(batch);
    console.log(`Processed ${batch.length} documents.`);
    batch = [];
  }
}

// Upsert the remaining documents if the batch size doesn't evenly divide the total number of documents
if (batch.length > 0) {
  await index.upsert(batch);
  console.log(`Processed ${batch.length} documents.`);
}
