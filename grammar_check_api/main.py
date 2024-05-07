from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from providers import get_provider_client
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
    provider: str
    model: str
    key: str
    suggestionType: (
        str  # TODO: remove CamelCase that's only here to match the Next.js frontend
    )


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/check_grammar")
def check_grammar(request: GrammarRequest):

    # Print
    print(f"Received request from {request.provider} with model {request.model}")

    # Create a new client with the requested provider and API key.
    client = get_provider_client(provider=request.provider, api_key=request.key)

    # Get the grammar suggestions from the client.
    suggestions = grammar_checker(
        client, request.text, request.model, request.suggestionType
    )

    return suggestions
