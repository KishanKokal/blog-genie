import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PC_CLIENT = new Pinecone({ apiKey: PINECONE_API_KEY });

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const DOCUMENT_LOADER_URL = process.env.DOCUMENT_LOADER_URL;
export const INDEX = PC_CLIENT.index("blog-genie");
