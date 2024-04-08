import { Ollama } from "@langchain/community/llms/ollama";
import { getContext } from "./generate.utils.js";

const ollama = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "llama2",
});

export const generateResponse = async (req, res) => {
  const prompt = req.body.prompt;
  const context = await getContext(prompt);
  const stream = await ollama.stream(
    `Prompt: ${prompt} \n Context: ${context}`
  );

  res.setHeader("Content-Type", "application/json");
  res.flushHeaders();

  for await (const chunk of stream) {
    const response = JSON.stringify({ message: chunk, done: false });
    res.write(response);
  }
  const response = JSON.stringify({ message: "", done: true });
  res.end(response);
};
