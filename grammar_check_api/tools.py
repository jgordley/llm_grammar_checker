import json
import openai
import os

from pydantic import BaseModel
from typing import List

SYSTEM_PROMPT = """
You are a helpful grammar assistant. You take in sequences of text and determine if any words are mispelled or using incorrect grammar.

For each word you find, give the mispelled word, word_correction (the corrected word), and an explanation of why the word is likely to be incorrect. 

ONLY provide suggestions for words that are likely to be incorrect and only respond in the JSON format specified:
"""


class GrammarSuggestion(BaseModel):
    word: str
    word_correction: str
    explanation: str


class GrammarSuggestions(BaseModel):
    grammar_suggestions: List[GrammarSuggestion]


# Create client
client = openai.OpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.environ["TOGETHER_API_KEY"],
)


def grammar_checker(text):
    suggestions = get_llm_suggestions(text).get("grammar_suggestions", [])

    cleaned_suggestions = []
    split_text = text.split(" ")
    for suggestion in suggestions:
        # Traverse through the words and find the proper word index for each mispelled word
        for i, word in enumerate(split_text):
            if word == suggestion["word"]:
                suggestion["word_index"] = i
                break

        cleaned_suggestions.append(suggestion)

    return {"grammar_suggestions": cleaned_suggestions}


def get_llm_suggestions(text):
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {"role": "user", "content": text},
        ],
        model="mistralai/Mistral-7B-Instruct-v0.1",
        response_format={
            "type": "json_object",
            "schema": GrammarSuggestions.model_json_schema(),
        },
    )

    return json.loads(response.choices[0].message.content)
