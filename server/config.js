import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const client = await MongoClient.connect(uri);
