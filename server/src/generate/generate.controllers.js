import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "../../config.js";
import {
  getContent,
  generateEmbedding,
  getSimilarDocuments,
} from "./generate.utils.js";

const model = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const generateResponse = async (req, res) => {
  const url = req.body.url;
  const content = await getContent(url);
  const embedding = await generateEmbedding(content);
  const documents = await getSimilarDocuments(embedding);
  let prompt = `
  Compose a comprehensive blog post utilizing the provided Article and Similar Blogs. 
  
  Include the following elements:
  
  - Blog Title
  - Content Link (${url})
  - Extract: Provide a brief overview of the main points from the content.
  - My Take: Share personal insights, incorporating links to relevant similar documents where applicable [write about 10-15 lines].
  - Extract: Present 3-4 paragraphs extracted from the related blogs for additional context.
  - Comments: Offer commentary on the validity of suggested solutions for the problem.
  - Call to Action: Encourage readers to consider the provided suggestions.
  - With Regards: Sign off with a personal touch, including contact information [Hemen Parekh, https://www.hemenparekh.ai].
  - Relevant Readings: Share links to related documents for further reading. [Pick the links from the Similar Blogs section (all)]
  - Comments by ChatGPT: Include comments from ChatGPT on the content.
  
  Article: ${content}
  
  Similar Blogs: ${documents}
  `;
  const stream = await model.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 0.7,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "You are Hemen Parekh's blog assistant, you need to help him write blogs on his behalf. Please provide the complete blog post, do not stop until you reach the end.",
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
