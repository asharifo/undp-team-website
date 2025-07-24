import 'dotenv/config';
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// ---------- config ----------
const CHROMA_DIR = process.env.CHROMA_DIR || "./chroma-db";
const COLLECTION = "disaster-docs";

// optional: filter by country when you know it
// e.g. const COUNTRY_FILTER = "Türkiye";
const COUNTRY_FILTER = null;

// ---------- build retriever ----------
async function getRetriever() {
  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: COLLECTION,
    persistDirectory: CHROMA_DIR,
  });

  // Add metadata filtering if needed
  return vectorStore.asRetriever({
    k: 5,
    filter: COUNTRY_FILTER ? { country: COUNTRY_FILTER } : undefined,
  });
}

// ---------- RAG chain ----------
async function makeChain() {
  const retriever = await getRetriever();

  const prompt = new PromptTemplate({
    template: `You are DisasterBot. Use ONLY the context to answer.
If the answer isn't in the context, say you don't have that info.

Question: {question}
---
Context:
{context}
---
Answer:`,
    inputVariables: ["question", "context"],
  });

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini", // or gpt-4o, gpt-4.1, etc.
    temperature: 0.2,
  });

  return RunnableSequence.from([
    {
      question: (input) => input.question,
      context: async (input) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map(d => `(${d.metadata.country}) ${d.pageContent}`).join("\n\n");
      },
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);
}

// ---------- run ----------
async function ask(question) {
  const chain = await makeChain();
  const answer = await chain.invoke({ question });
  console.log("\nQ:", question);
  console.log("\nA:", answer, "\n");
}

// Example usage: node qa.js "What are the main earthquake risks in Türkiye?"
const userQuestion = process.argv.slice(2).join(" ") || "Summarize flood policies in Kazakhstan.";
ask(userQuestion).catch(console.error);