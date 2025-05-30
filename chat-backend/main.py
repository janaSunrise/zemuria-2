from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
from typing import Optional

app = FastAPI(
    title="Zemuria Chat Backend",
    description="FastAPI backend integrated with Langflow for AI-powered chat",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: Optional[str] = None

@app.get("/")
def read_root():
    return {
        "message": "Zemuria Chat Backend",
        "status": "running",
        "langflow_url": "http://localhost:7860",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "zemuria-chat-backend"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    """
    Send a message to the Langflow flow and get a response.
    This endpoint will integrate with your imported Langflow flow.
    """
    try:
        # This is a placeholder for Langflow integration
        # You'll need to update this with your actual flow endpoint after importing
        langflow_url = os.getenv("LANGFLOW_URL", "http://localhost:7860")

        # Example integration - you'll need to replace with your actual flow ID
        async with httpx.AsyncClient() as client:
            # This is a mock response - replace with actual Langflow API call
            response_text = f"Echo: {chat_message.message}"

        return ChatResponse(
            response=response_text,
            session_id=chat_message.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.get("/flows")
async def list_flows():
    """
    List available Langflow flows (placeholder endpoint).
    """
    return {
        "flows": [
            {
                "id": "zem-flow",
                "name": "Zemuria Chat Flow",
                "description": "Main chat flow with OpenAI integration"
            }
        ]
    }
