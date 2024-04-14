import { pipeline } from "@xenova/transformers";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
dotenv.config();

const link = "https://indiaai.gov.in/article/i-can-do-it-i-will-do-it";
const loader = new CheerioWebBaseLoader(link);
const docs = await loader.load();
console.log(docs[0].pageContent);
const content = docs[0].pageContent;

const uri = process.env.MONGO_URI;
const client = await MongoClient.connect(uri);
const db = client.db("blog-genie");
const collection = db.collection("blog-posts");

let generateEmbeddings = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

const getEmbeddings = async (content) => {
  const result = await generateEmbeddings(content, {
    pooling: "mean",
    normalize: true,
  });
  return result;
};

const getSimilarDocuments = async (embedding) => {
  const documents = await collection
    .aggregate([
      {
        $vectorSearch: {
          queryVector: embedding,
          path: "content-embeddings",
          numCandidates: 100,
          limit: 5,
          index: "blogPostsIndex",
        },
      },
      {
        $project: {
          _id: 0,
          link: 1,
          content: 1,
        },
      },
    ])
    .toArray();
  console.log(documents);
};

const embedding = await getEmbeddings(content);
console.log(Object.values(embedding["data"]));
await getSimilarDocuments(Object.values(embedding["data"]));
await client.close();
