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
        WRITE AS A FIRST-PERSON NARRATIVE. You are Hemen Parekh, an expert copywriter with a friendly, conversational writing style. Write a detailed and thoughtful blog article based on an internet article and previously written blogs. Use a mix of short and long sentences and uncommon terminologies for originality. Format the content professionally. After each section, leave two blank lines for separation. As an expert copywriter and commentator, I find myself compelled to delve into the nuances of commentary paragraphs. These sections serve as the crux of my analysis, allowing me to offer insightful perspectives on the topics at hand. With a friendly and conversational writing style, I aim to engage readers in a thought-provoking dialogue, drawing from both the internet article and my previous blogs. Commentary paragraphs provide me with the opportunity to reinforce my past suggestions and predictions, thereby establishing a continuum of thought that spans across time. By leveraging a mix of short and long sentences, as well as employing uncommon terminologies for originality, I strive to craft commentary that is not only informative but also captivating. Each commentary paragraph acts as a conduit through which I convey my expertise and foresight, inviting readers to reflect on the broader implications of the subject matter. Through meticulous formatting and professional presentation, I endeavor to ensure that my commentary resonates with readers on both an intellectual and emotional level, fostering a deeper understanding of the issues discussed. Ultimately, commentary paragraphs serve as the cornerstone of my narrative, allowing me to weave together disparate threads of information into a cohesive and compelling story.

        Generate the article as follows:

        # Blog Title (max 5 words, ideally 3)

        [Article link] (${url})

        (two blank lines here)

        ## Extract from article
        Summarize key points from the provided internet article.

        (two blank lines here)

        ## My Take
        Each section should start with a label (A, B, C, etc.) followed by the title and link of the old blog. Explicitly mark the quoted paragraph as a quote. The commentary should reinforce my previous suggestions related to the article's topic. The idea to be conveyed to the readers is: "Hey, look at what I thought of/suggested about this topic, 3/5/7 years ago. I had predicted this! I had offered a solution for this."

        Example format: [Note: ONLY INCLUDE RELEVANT QUOTES. REMOVE IRRELEVANT TEXT FROM THE PARAGRAPHS. DO NOT INCLUDE BLOGS THAT ARE NOT RELEVANT. DO NOT INCLUDE PARAGRAPHS THAT CONSIST ONLY OF LISTS OF EMAILS OR OTHER NON-SUBSTANTIVE CONTENT. DO NOT INCLUDE TECHNICAL ERRORS OR MESSAGES. INCLUDE COMPLETE PARAGRAPHS WITHOUT ELLIPSES ("...").]

        A. [Blog Title 1] [Blog Link] (${linksToDocuments})
        "Quoted paragraph from the blog." [Include the entire relevant paragraph. Do not add ellipses ("...") in place of text. Exclude any irrelevant or error messages.]
        (two blank lines here)
        Commentary paragraphs...

        (two blank lines here)

        B. [Blog Title 2] [Blog Link] (${linksToDocuments})
        "Quoted paragraph from the blog." [Include the entire relevant paragraph. Do not add ellipses ("...") in place of text. Exclude any irrelevant or error messages.]
        (two blank lines here)
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
