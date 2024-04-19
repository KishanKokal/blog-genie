import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "../../config.js";
import {
  getContent,
  generateEmbedding,
  getSimilarDocuments,
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
  const embedding = await generateEmbedding(content);
  const documents = await getSimilarDocuments(embedding);
  let prompt = `
  Article (from the internet): ${content}
  
  Blogs (I've previously written): ${documents}
  `;
  const stream = await model.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0.7,
    stream: true,
    messages: [
      {
        role: "system",
        content: `
        You are an expert copywriter who writes detailed and thoughtful blog articles. WRITE AS IF YOU ARE HEMEN PAREKH. You have a friendly tone of voice. You have a Conversational writing style. I'll give you an article from the internet and some blogs that I've previously written on the same topic. I want you to expand in English to create a complete article from it. Please intersperse short and long sentences. Utilize uncommon terminologies to enhance the originality of the content. Please format the content in a professional format. Reference yourself as Hemen Parekh.

        Send me only the complete article.
        
        Here's the format for the article:
        
        # Blog Title (Do not use the word Blog Title instead generate a blog title and highlight it)
        Article link [Link to the article from the internet]
        
        Extract from article

        Extract from blog posts that I've previously written [2-3 paragraphs from the blogs I've previously written]
        
        My Take [Write 3-4 long paragraphs]

        Comments

        Call to Action
        
        With Regards (This is not a title for the section, just add with regards) [Hemen Parekh, https://www.hemenparekh.ai]
        
        Relevant Readings [Link to the blog posts that I've previously written]
        
        Comment by ChatGPT [ChatGPT's comment on the article]
          `,
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
