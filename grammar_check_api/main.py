from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from tools import grammar_checker

app = FastAPI()
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GrammarRequest(BaseModel):
    text: str


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/check_grammar")
def check_grammar(request: GrammarRequest):
    suggestions = grammar_checker(request.text)
    return suggestions
