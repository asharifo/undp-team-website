import dotenv from "dotenv";
dotenv.config();

import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { parse_docs } from "./ingest.js";

let vectorStorePromise;

export async function getVectorStore() {
    if (!vectorStorePromise) {
        vectorStorePromise = (async () => {
            try {
                const texts = await parse_docs();
                const astraConfig = {
                    token: process.env.APPLICATION_TOKEN,
                    endpoint: process.env.API_ENDPOINT,
                    namespace: process.env.KEYSPACE_NAME,
                    collection: process.env.COLLECTION_NAME,
                    collectionOptions: {
                        vector: {
                            dimension: 1536,
                            metric: "dot_product",
                        },
                    },
                };

                // Initialize the vector store.
                const vectorStore = await AstraDBVectorStore.fromDocuments(
                    texts,
                    new OpenAIEmbeddings({
                        model: "text-embedding-3-small",
                        openAIApiKey: process.env.OPENAI_API_KEY,
                        batchSize: 512,
                    }),
                    astraConfig
                );
                return vectorStore;
            } catch (error) {
                console.error("Error initializing vector store:", error);
                throw error;
            }
        })();
    }
    return vectorStorePromise;
}