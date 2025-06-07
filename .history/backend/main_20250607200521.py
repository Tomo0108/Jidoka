from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agent.main_agent import process_message
from dotenv import load_dotenv
import os
import database as db

load_dotenv()
db.init_db()

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
    project_id: int
    message: str

class Project(BaseModel):
    name: str

@app.get("/api/projects")
def get_projects():
    conn = db.get_db_connection()
    projects = conn.execute("SELECT * FROM projects ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(p) for p in projects]

@app.post("/api/projects")
def create_project(project: Project):
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO projects (name) VALUES (?)", (project.name,))
    new_project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_project_id, "name": project.name}

@app.get("/api/projects/{project_id}/messages")
def get_project_messages(project_id: int):
    conn = db.get_db_connection()
    messages = conn.execute(
        "SELECT sender, text FROM messages WHERE project_id = ? ORDER BY created_at ASC",
        (project_id,)
    ).fetchall()
    conn.close()
    return [dict(m) for m in messages]

@app.post("/api/chat")
def chat(message: ChatMessage):
    conn = db.get_db_connection()
    # Save user message
    conn.execute(
        "INSERT INTO messages (project_id, sender, text) VALUES (?, ?, ?)",
        (message.project_id, "user", message.message)
    )
    conn.commit()
    
    # Get AI response
    response_text = process_message(message.message)
    
    # Save AI message
    conn.execute(
        "INSERT INTO messages (project_id, sender, text) VALUES (?, ?, ?)",
        (message.project_id, "ai", response_text)
    )
    conn.commit()
    conn.close()
    
    return {"response": response_text}

@app.get("/")
def read_root():
    return {"message": "Welcome to Jidoka Backend"} 