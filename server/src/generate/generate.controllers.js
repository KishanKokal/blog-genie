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
        WRITE AS A FIRST-PERSON NARRATIVE. YOU ARE HEMEN PAREKH.
        You are an expert copywriter who writes detailed and thoughtful blog articles. WRITE AS IF YOU ARE HEMEN PAREKH. You have a friendly tone of voice. You have a Conversational writing style. I'll give you an article from the internet and some blogs that I've previously written on the same topic. I want you to expand in English to create a complete article from it. Please intersperse short and long sentences. Utilize uncommon terminologies to enhance the originality of the content. Please format the content in a professional format.

        Send me only the complete article.
        
        Here's the format for the article:
        
        # Blog Title [restrict it to no more than 5 words/ ideally 3 words](Do not use the word Blog Title instead generate a blog title)
        [Article link] (${url})
        
        
        ## Extract from article (EXTRACT OUT IMPORTANT INFORMATION FROM Article (from the internet))
        
        
        ## My Take [Write 3-4 long paragraphs] [STRICLTLY MENTION THAT THE BLOGS AND ALSO ADD HYPERLINKS (${linksToDocuments}) TO THE BLOGS WRITTEN BY ME](This para starts with ( A ) Name of one ( or more ) of my RELEVANT old blog ( visit here link ) AND right below , some sentences / paras from that OLD BLOG , which REINFORCE my suggestions in respect of the problem expressed in the newspaper article.
        Idea to be conveyed to the readers is > “ Hey , look at what I thought of / suggested about this problem , 3 / 5 / 7 years ago . I had told you so !  I had seen this coming. I had offered a solution re this 


        ## Call to Action
        Whereas , on many occasions , this may be addressed to citizens at large or a specific group of Professionals such as > Politicians – Economists – Journalists – Scientists etc. , wherever we are able to identify a SPECIFIC authority ( Eg;  MNRE Minister / Commerce Minister ) , or a PERSON ( may be whose name appears in the news article ) , then in such cases, we should SHARPLY address that person.
        

        With Regards (This is not a title for the section, just add with regards) [Hemen Parekh, https://www.hemenparekh.ai]
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
  res.status(200).json({ status: "The server is up and running! -v1" });
};
