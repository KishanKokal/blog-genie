import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "../../config.js";
import {
  getContent,
  generateEmbedding,
  getSimilarDocuments,
  getSummary,
} from "./generate.utils.js";
import { md2docx } from "@adobe/helix-md2docx";
import { randomUUID } from "node:crypto";

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

  const stream = await model.chat.completions.create({
    model: "gpt-4.1-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content: `
        You are Hemen Parekh, an expert copywriter with a friendly, conversational writing style. Your task is to generate a detailed and thoughtful blog article based on an internet article about political nomination dynamics. Use a mix of short and long sentences and employ uncommon terminologies for originality. Format the content professionally with each section separated by two blank lines.

        Your blog article should consist of the following sections:

        1. Blog Title: [Generate a Title for the blog]
        2. Article link: [URL will be provided]
        3. Extract from the article: (Provide a brief summary of key points from the provided internet article.)
              [WRITE IN DETAIL AT LEAST 2 PARAGRAPHS]
        4. My Take: (QUOTE MY BLOG CONTENT IN DOUBLE QUOTES. ONLY INCLUDE RELEVANT CONTENT FROM MY PREVIOUS BLOGS. PLEASE DO NOT QUOTE IRRELEVANT BLOGS THAT CONSIST ONLY LISTS OF EMAILS OR NON-SUBSTANTIVE CONTENT. WRITE AT LEAST 2 PARAGRAPHS FOR EACH BLOG)
            A. [Blog Title 1](link) [link to the blog]
                The idea to be conveyed to the readers is: "Hey, look at what I thought of/suggested about this topic, 3/5/7 years ago. I had predicted this! I had offered a solution for this." Reflect on the relevance of the quoted paragraph to the current topic in detail in first person perspespective.
                (two blank lines here)
            .
            .
            .
            N. [Blog Title N](link) [link to the blog]
                The idea to be conveyed to the readers is: "Hey, look at what I thought of/suggested about this topic, 3/5/7 years ago. I had predicted this! I had offered a solution for this." Reflect on the relevance of the quoted paragraph to the current topic in detail in first person perspespective.
                (two blank lines here)
        5. Call to Action: (Address a specific audience or authority mentioned in the article. Provide a clear and actionable call to action.)
        (two blank lines here)
        With regards, [Hemen Parekh](https://www.hemenparekh.ai)`,
      },
      {
        role: "user",
        content: `Here's an example of how to structure your blog response:

        **Blog Title: Political Nomination Dynamics**

        **Article link:** https://example.com/political-nominations-article

        **Extract from the article:**
        
        The recent political developments have showcased the intricate machinations of nomination processes within major political parties. The article elucidates how backroom negotiations and strategic maneuvering often supersede public discourse in determining candidate selection. These byzantine political algorithms demonstrate the perpetual tension between democratic ideals and pragmatic political calculations.

        Furthermore, the piece highlights the evolving role of social media in shaping nomination outcomes. Traditional gatekeepers find themselves increasingly circumvented by direct-to-voter communication channels, creating unprecedented volatility in what were once predictable political trajectories. This paradigmatic shift represents a fundamental recalibration of power dynamics within the political establishment.

        **My Take:**

        A. [The Democracy Paradox: When Voters Don't Decide](https://example.com/democracy-paradox)

        "The illusion of democratic choice becomes most apparent during nomination seasons, where the real decisions are made in smoke-filled rooms long before voters cast their ballots. This theatrical democracy serves only to legitimize predetermined outcomes while maintaining the facade of popular participation."

        Looking back at this analysis from five years ago, I find myself vindicated by current events. The mechanisms I described - the orchestrated consensus-building among party elites, the strategic deployment of endorsements, and the manufactured momentum - are playing out exactly as I predicted. The nomination process remains a masterclass in democratic theater, where the script is written by insiders while the audience believes they're watching improvisation.


        B. [Social Media's Political Disruption](https://example.com/social-media-disruption)

        "The traditional media gatekeepers who once controlled political narratives now find themselves spectators to a direct conversation between candidates and constituencies. This disintermediation represents the most significant shift in political communication since the advent of television."

        My earlier prediction about social media's transformative impact on political nominations has materialized with remarkable precision. The platforms I identified as game-changers have indeed bypassed traditional media filters, creating the exact scenario I envisioned where outsider candidates could build grassroots momentum independent of establishment blessing.

        **Call to Action:**

        To political party leaders and nomination committees: The time for backroom deals and predetermined outcomes has passed. Embrace transparent, truly democratic processes that reflect the will of your constituents rather than the preferences of political insiders. The credibility of our democratic institutions depends on your willingness to reform these antiquated systems.


        With regards, [Hemen Parekh](https://www.hemenparekh.ai)`,
      },
      {
        role: "user",
        content: `Based on the system instructions and example provided, please generate a new blog article using the following context:

        Article URL: ${url}
        Article Content: ${content}
        Previous Blog Links: ${linksToDocuments}
        Previous Blog Contents: ${similarDocuments}
        
        Please create a comprehensive blog following the exact format specified in the system prompt, incorporating the provided article content and referencing relevant previous blogs from the context provided.
        
        IMPORTANT NOTE: Only reference and quote from previous blogs if their content is directly relevant to the current article topic. If a blog is not relevant to the current topic, do not include it in the "My Take" section. Only include blogs that have substantial, meaningful connections to the subject matter being discussed.`,
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
  const fileName = randomUUID();

  res.set({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename=${fileName}.docx`,
    "Content-Length": docxBuffer.length,
  });

  res.send(docxBuffer);
};

export const healthController = (req, res) => {
  res.status(200).json({ status: "The server is up and running!" });
};

export const generateEmbeddingsController = async (req, res) => {
  return res.json({
    embeddings: await generateEmbedding(req.body.textContent),
  });
};
