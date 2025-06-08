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
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
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
    description: str = None

class ProjectUpdate(BaseModel):
    name: str
    description: str = None

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
    cursor.execute("INSERT INTO projects (name, description) VALUES (?, ?)", (project.name, project.description))
    new_project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_project_id, "name": project.name, "description": project.description}

@app.put("/api/projects/{project_id}")
def update_project(project_id: int, project: ProjectUpdate):
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Check if project exists
    existing_project = cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    if not existing_project:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project
    cursor.execute(
        "UPDATE projects SET name = ?, description = ? WHERE id = ?",
        (project.name, project.description, project_id)
    )
    conn.commit()
    
    # Return updated project
    updated_project = cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    conn.close()
    return dict(updated_project)

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Check if project exists
    existing_project = cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    if not existing_project:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete related messages first
    cursor.execute("DELETE FROM messages WHERE project_id = ?", (project_id,))
    
    # Delete project
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Project deleted successfully"}

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