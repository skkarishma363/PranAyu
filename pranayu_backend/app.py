from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import retrieve_context

app = FastAPI()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import retrieve_context
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserMessage(BaseModel):
    message: str

# Simple conversation memory (for demo)
conversation_history = []


def generate_with_llama(prompt):

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "phi3:mini",
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 200
            }
        }
    )

    result = response.json()

    print("OLLAMA RAW RESPONSE:", result)

    if "response" in result:
        return result["response"]
    else:
        return "Model Error: " + str(result)

@app.post("/chat")
def chat(user_message: UserMessage):

    user_input = user_message.message
    conversation_history.append(f"User: {user_input}")

    context = retrieve_context(user_input)

    full_prompt = f"""
You are PranAyu, an interactive Ayurvedic medical assistant.

Conversation so far:
{conversation_history}

Relevant medical knowledge:
{context}

Instructions:
- Ask follow-up questions if needed.
- Be conversational.
- Detect emergency situations like chest pain, breathing difficulty, severe bleeding.
- If emergency, clearly say it is urgent.

Respond naturally like a doctor.
"""

    ai_response = generate_with_llama(full_prompt)

    conversation_history.append(f"AI: {ai_response}")

    return {"response": ai_response}
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserMessage(BaseModel):
    message: str

@app.post("/chat")
def chat(user_message: UserMessage):
    user_input = user_message.message

    context = retrieve_context(user_input)

    response = f"""
Based on medical knowledge:

{context[0]}

If symptoms are severe or worsening, please consult a doctor immediately.
"""

    return {"response": response.strip()}
