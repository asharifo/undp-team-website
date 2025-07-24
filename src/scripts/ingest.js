import 'dotenv/config';
import path from 'node:path';
import { glob } from 'glob';
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "@langchain/community/document_loaders/fs/text";

const DOCS_DIR = process.env.DOCS_DIR || "./docs";
const CHROMA_DIR = process.env.CHROMA_DIR || "./chroma-db";

const LoaderFor = (filepath) => {
    const ext = path.extname(filepath).toLocaleLowerCase();
    if (ext === ".pdf") return new PDFLoader(filepath);
    if (ext === ".docx") return new DocxLoader(filepath);
    if (ext === ".doc") return new DocxLoader(filepath, {type: "doc"});
    return new TextLoader(filepath);
};

const getCountryFromPath = (filpath) => {
    const parts = filepath.split(path.sep);
    const idx = parts.indexOf(path.basename(DOCS_DIR));
    return idx>=0 && parts[idx+1] ? parts[idx+1] : "Unknown";
};

async function run() {
    const files = await glob((`${DOCS_DIR}/**/*.{pdf,docx,txt,md}`, { nocase: true }));
    if (files.length === 0) {
        console.log("no files found")
        return;
    }
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });
    const allDocs = [];
    for (const f of files) {
        const country = getCountryFromPath(f);
        const rawDocs = await LoaderFor(f).load;
        const splitDocs = await splitter.splitDocuments(
            rawDocs.map(d => ({
                ...d,
                metadata: {...d.metadata, country, source: f},
            }))
        );
        allDocs.push(...splitDocs);
    }
    console.log("chunkes to store: ${allDocs.length}");
    const embeddings = new OpenAIEmbeddings({model: "text-embedding-3-small"});
    await Chroma.fromDocuments(allDocs, embeddings, {
        collectionName: "disaster-docs",
        persistDirectory: CHROMA_DIR,
    });
    console.log("DONE");
}