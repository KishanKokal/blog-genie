import fs from "node:fs";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
let docs = JSON.parse(fs.readFileSync("../data/posts-with-embeddings.json"))[
  "posts"
];

for (const doc of docs) {
  doc["content-embeddings"] = Object.values(doc["content-embeddings"]["data"]);
}

console.log(docs[0]);

const client = new MongoClient(uri);
await client.connect();
console.log("Connected to MongoDB");

const db = client.db("blog-genie");
const collection = db.collection("blog-posts");

await collection.insertMany(docs);
console.log("Data stored in MongoDB");
await client.close();
