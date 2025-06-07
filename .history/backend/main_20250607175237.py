from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Greeting(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Jidoka Backend"}

@app.get("/hello", response_model=Greeting)
def get_greeting():
    return Greeting(message="Hello World") 