import fs from "node:fs";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
let docs = JSON.parse(fs.readFileSync("../data/embeddings.json"));

const client = new MongoClient(uri);
await client.connect();
console.log("Connected to MongoDB");

const db = client.db("blog-genie");
const collection = db.collection("blog-posts");

console.log("Deleting docs...");
await collection.deleteMany({});
console.log("Deleted all docs");

console.log("Storiong new data...");
await collection.insertMany(docs);
console.log("Data stored in MongoDB");
await client.close();
