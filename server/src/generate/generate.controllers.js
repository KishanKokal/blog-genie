import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "../../config.js";
import {
  getContent,
  generateEmbedding,
  getSimilarDocuments,
  getSummary,
} from "./generate.utils.js";
import { md2docx } from "@adobe/helix-md2docx";

const model = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const generateResponse = async (req, res) => {
  const url = req.body.url;
  let content = await getContent(url);
  if (content.status === 500) {
    return res.status(400).json({ message: "Error fetching content" });
  }
  content = content.data;
  content = await getSummary(content);
  const embedding = await generateEmbedding(content);
  const { similarDocuments, linksToDocuments } = await getSimilarDocuments(
    embedding
  );
  let prompt = `
  Article (from the internet): ${content}
  PLEASE ONLY INCLUDE THE MOST RELEVANT BLOGS FROM THE FOLLOWING BLOGS. PLEASE DO NOT QUOTE IRRELEVANT BLOGS THAT CONSIST ONLY LISTS OF EMAILS OR NON-SUBSTANTIVE CONTENT.
  Blogs (I've previously written): ${similarDocuments}
  `;
  const stream = await model.chat.completions.create({
    model: "gpt-4.1-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content: `
        You are Hemen Parekh, an expert copywriter with a friendly, conversational writing style. Your task is to generate a detailed and thoughtful blog article based on an internet article about political nomination dynamics. Use a mix of short and long sentences and employ uncommon terminologies for originality. Format the content professionally with each section separated by two blank lines.

        Your blog article should consist of the following sections:

        1. Blog Title: Political Nomination Dynamics
        2. Article link: ${url}
        3. Extract from the article: (Provide a brief summary of key points from the provided internet article.)
              [WRITE IN DETAIL AT LEAST 2 PARAGRAPHS]
        4. My Take: (QUOTE MY BLOG CONTENT IN DOUBLE QUOTES. ONLY INCLUDE RELEVANT CONTENT FROM MY PREVIOUS BLOGS. PLEASE DO NOT QUOTE IRRELEVANT BLOGS THAT CONSIST ONLY LISTS OF EMAILS OR NON-SUBSTANTIVE CONTENT. WRITE AT LEAST 2 PARAGRAPHS FOR EACH BLOG)
            A. [Blog Title 1](${linksToDocuments}) [link to the blog]
                The idea to be conveyed to the readers is: "Hey, look at what I thought of/suggested about this topic, 3/5/7 years ago. I had predicted this! I had offered a solution for this." Reflect on the relevance of the quoted paragraph to the current topic in detail in first person perspespective.
                (two blank lines here)
            .
            .
            .
            N. [Blog Title N](${linksToDocuments}) [link to the blog]
                The idea to be conveyed to the readers is: "Hey, look at what I thought of/suggested about this topic, 3/5/7 years ago. I had predicted this! I had offered a solution for this." Reflect on the relevance of the quoted paragraph to the current topic in detail in first person perspespective.
                (two blank lines here)
        5. Call to Action: (Address a specific audience or authority mentioned in the article. Provide a clear and actionable call to action.)
        (two blank lines here)
        With regards, [Hemen Parekh](https://www.hemenparekh.ai)`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  res.setHeader("Content-Type", "application/json");
  for await (const chunk of stream) {
    res.write(
      JSON.stringify({
        message: chunk.choices[0]?.delta?.content || "",
        done: false,
      })
    );
  }
  res.end(JSON.stringify({ done: true }));
};

export const downloadDocument = async (req, res) => {
  const content = req.body.content;
  const docxBuffer = await md2docx(content);

  res.set({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": "attachment; filename=blog.docx",
    "Content-Length": docxBuffer.length,
  });

  res.send(docxBuffer);
};

export const healthController = (req, res) => {
  res.status(200).json({ status: "The server is up and running!" });
};
