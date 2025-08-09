
import dotenv from "dotenv";
dotenv.config();

import { getVectorStore } from "./initVectorStore.js";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.1,
});

/*
 * Find the top 4 documents for a given question + country,
 * then ask ChatGPT to answer using those docs as context.
 *
 * @param {string} question – The user's question.
 * @param {string} country – The region metadata to filter 
 * @returns {Promise<string>} – ChatGPT's answer.
 * */

export async function queryCountry(question, country) {
  const vectorStore = await getVectorStore();

  // Retrieve the top‐4 most similar docs, filtering on `metadata.region`
  const docs = await vectorStore.similaritySearch(
    question,
    4,
    { region: country }
  );

  //Build a single context string from the snippets
  const context = docs
    .map((doc, i) => `--- Document ${i + 1} ---\n${doc.pageContent.trim()}`)
    .join("\n\n");

  const systemPrompt = `You are an expert on natural disaster preparedness, information, and procedures from ${country}. Use the provided context to answer the user’s question as accurately as possible. Do not make up answers.`;
  const userPrompt   = `Context:\n${context}\n\nQuestion:\n${question}`;

  const result = await llm.generate([[  
    { role: "system", content: systemPrompt },
    { role: "user",   content: userPrompt   },
  ]]);
  return result.generations[0][0].message.content;
}
