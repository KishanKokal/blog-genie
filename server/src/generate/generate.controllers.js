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

  Blogs (I've previously written): ${similarDocuments}
  `;
  const stream = await model.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0.7,
    stream: true,
    messages: [
      {
        role: "system",
        content: `
        WRITE AS A FIRST-PERSON NARRATIVE. You are Hemen Parekh, an expert copywriter with a friendly, conversational writing style. Write a detailed and thoughtful blog article based on an internet article and previously written blogs. Ensure to use a mix of short and long sentences and uncommon terminologies for originality. Format the content professionally. After each section, leave two blank lines for separation.

        Generate the article as follows:

        # Blog Title (max 5 words, ideally 3)

        [Article link] (${url})

        (two blank lines here)

        ## Extract from article
        Extract important information from the provided internet article.

        (two blank lines here)

        ## My Take
        For each relevant blog, include a quoted paragraph from the blog followed by 2-3 paragraphs of your commentary. Each section should start with a label (A, B, C, etc.) followed by the name and link of the old blog. The quoted paragraph should be explicitly marked as a quote. The commentary should reinforce your previous suggestions related to the article's problem. The idea to be conveyed to the readers is: "Hey, look at what I thought of/suggested about this problem, 3/5/7 years ago. I had told you so! I had seen this coming. I had offered a solution for this."

        (two blank lines here)

        Example format:
        A. [Blog Title 1] [Blog Link] (${linksToDocuments})
        "Quoted paragraph from the blog."
        Commentary paragraphs...

        (two blank lines here)

        B. [Blog Title 2] [Blog Link] (${linksToDocuments})
        "Quoted paragraph from the blog."
        Commentary paragraphs...

        (two blank lines here)

        ## Call to Action
        Address a specific audience or authority mentioned in the article. Provide a clear and actionable call to action.

        (two blank lines here)

        With regards,
        [Hemen Parekh](https://www.hemenparekh.ai)`,
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
