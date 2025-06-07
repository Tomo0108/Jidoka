from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agent.main_agent import process_message
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
def chat(message: ChatMessage):
    response_message = process_message(message.message)
    return {"response": response_message}

@app.get("/")
def read_root():
    return {"message": "Welcome to Jidoka Backend"}

@app.get("/hello", response_model=Greeting)
def get_greeting():
    return Greeting(message="Hello World") 