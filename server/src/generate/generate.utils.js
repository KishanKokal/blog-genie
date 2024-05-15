import axios from "axios";
import { INDEX } from "../../config.js";
import { pipeline } from "@xenova/transformers";
import { DOCUMENT_LOADER_URL } from "../../config.js";

export const getSummary = async (content) => {
  const pipe = await pipeline("summarization");
  const res = await pipe(content);
  const summary = res[0]["summary_text"];
  return summary;
};

export const getContent = async (link) => {
  try {
    const { data } = await axios.post(DOCUMENT_LOADER_URL, {
      url: link,
    });

    return { data: data.content, status: 200 };
  } catch (error) {
    return { status: 500 };
  }
};

export const generateEmbedding = async (content) => {
  const generateEmbeddings = await pipeline(
    "feature-extraction",
    "mixedbread-ai/mxbai-embed-large-v1"
  );

  const result = await generateEmbeddings(content, {
    pooling: "mean",
    normalize: true,
  });

  const embeddingsArray = result.tolist()[0];
  return embeddingsArray;
};

export const getSimilarDocuments = async (embedding) => {
  let response = await INDEX.query({
    topK: 3,
    vector: embedding,
    includeValues: false,
    includeMetadata: true,
  });
  let documents = response.matches;
  let similarDocuments = "";
  let linksToDocuments = [];
  for (let doc of documents) {
    linksToDocuments.push(doc.metadata.link);
    similarDocuments +=
      "Link: " +
      doc.metadata.link +
      "\n" +
      "Content: " +
      doc.metadata.content +
      "\n\n\n<--------------------------End of Blog-------------------------->\n\n\n";
  }
  return { similarDocuments, linksToDocuments };
};
