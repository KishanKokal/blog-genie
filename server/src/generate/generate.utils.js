import axios from "axios";
import { client } from "../../config.js";
import { pipeline } from "@xenova/transformers";
import { DOCUMENT_LOADER_URL } from "../../config.js";

export const getContent = async (link) => {
  const { data } = await axios.post(DOCUMENT_LOADER_URL, {
    url: link,
  });
  return data.content;
};

export const generateEmbedding = async (content) => {
  const generateEmbeddings = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const result = await generateEmbeddings(content, {
    pooling: "mean",
    normalize: true,
  });
  const embeddingsArray = Object.values(result["data"]);
  return embeddingsArray;
};

export const getSimilarDocuments = async (embedding) => {
  const db = client.db("blog-genie");
  const collection = db.collection("blog-posts");
  const documents = await collection
    .aggregate([
      {
        $vectorSearch: {
          queryVector: embedding,
          path: "content-embeddings",
          numCandidates: 100,
          limit: 3,
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
  let similarDocuments = "";
  let index = 0;
  for (let doc of documents) {
    documents[index]["content"] = documents[index]["content"].replace(
      /►\s*[A-Za-z]+\s*\(\d+\)\s*/g,
      ""
    );
    documents[index]["content"] = documents[index]["content"].replace(
      /►\s*\d+\s*\(\d+\)\s*/g,
      ""
    );
    index++;
  }
  for (let doc of documents) {
    similarDocuments +=
      "Link: " +
      doc.link +
      "\n" +
      "Content: " +
      doc.content +
      "\n\n\n<--------------------------End of Blog-------------------------->\n\n\n";
  }
  return similarDocuments;
};
