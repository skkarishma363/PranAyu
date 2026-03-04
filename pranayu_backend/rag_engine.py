from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os

model = SentenceTransformer("all-MiniLM-L6-v2")

# Get absolute path to knowledge_base
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
KNOWLEDGE_PATH = os.path.join(PROJECT_ROOT, "knowledge_base")

documents = []

if not os.path.exists(KNOWLEDGE_PATH):
    raise Exception(f"Knowledge base folder not found at: {KNOWLEDGE_PATH}")

for filename in os.listdir(KNOWLEDGE_PATH):
    if filename.endswith(".txt"):
        file_path = os.path.join(KNOWLEDGE_PATH, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                clean_line = line.strip()
                if clean_line:
                    documents.append(clean_line)

if len(documents) == 0:
    raise Exception("No documents loaded from knowledge_base folder.")

# Create embeddings
embeddings = model.encode(documents)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

def retrieve_context(query):
    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, k=2)
    results = [documents[i] for i in indices[0]]
    return results