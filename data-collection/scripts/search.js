import { pipeline } from "@xenova/transformers";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const url =
  "https://www.ndtv.com/india-news/we-do-not-have-any-regrets-rajnath-singh-on-electoral-bonds-5421803#:~:text=also%20be%20disclosed.%22-,The%20Electoral%20Bond%20Scheme%20was%20a%20way%20for%20political%20parties,stop%20issuing%20Electoral%20Bonds%20immediately.";
const body = {
  url: url,
};
const data = await axios.post("http://127.0.0.1:8000/api/content", body);
const content = data.data.content;

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
