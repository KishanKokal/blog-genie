import { MongoClient } from "mongodb";
import fs from "node:fs";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const client = new MongoClient(MONGO_URI, {});
await client.connect();
const db = client.db("blog-genie");
const collection = db.collection("blog-posts");

console.log("Fetching data...");
const posts = await collection.find({}).toArray();
console.log("Data fetched...");

console.log("Saving file...");
fs.writeFileSync("../data/posts.json", JSON.stringify(posts));
console.log("✅Done");
