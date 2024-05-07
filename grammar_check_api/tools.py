import json
import time

from pydantic import BaseModel
from typing import List


class SpellingSuggestion(BaseModel):
    word: str
    word_correction: str
    explanation: str


class SpellingSuggestions(BaseModel):
    spelling_suggestions: List[SpellingSuggestion]

    @staticmethod
    def model_json_schema():
        return json.dumps(
            {
                "spelling_suggestions": [
                    {
                        "word": "string",
                        "word_correction": "string",
                        "explanation": "string",
                    }
                ]
            }
        )


class GrammarSuggestion(BaseModel):
    sentence: str
    improved_sentence: str
    explanation: str


class GrammarSuggestions(BaseModel):
    grammar_suggestions: List[GrammarSuggestion]

    @staticmethod
    def model_json_schema():
        return json.dumps(
            {
                "grammar_suggestions": [
                    {
                        "sentence": "string",
                        "improved_sentence": "string",
                        "explanation": "string",
                    }
                ]
            }
        )


SPELLING_SYSTEM_PROMPT = f"""
You are a spelling checker. 
For each misspelled word you find, give the mispelled word (word), the corrected word (word_correction), and an explanation of why the word is likely to be incorrect.

Respond EXACTLY in the following JSON format:

{SpellingSuggestions.model_json_schema()}
"""

GRAMMAR_SYSTEM_PROMPT = f"""
You are a grammar checker. If you're not sure, don't suggest anything. Respond EXACTLY in the following JSON format:

{GrammarSuggestions.model_json_schema()}
For each sentence that is GRAMMATICALLY incorrect (not anything to do with spelling), give the sentence, improved_sentence (the corrected sentence), and an explanation of why your grammar improvement is better.
"""


def grammar_checker(client, text, model, prompt_type):

    if prompt_type == "spelling":
        suggestions = get_llm_suggestions(client, text, model, SPELLING_SYSTEM_PROMPT)
    elif prompt_type == "grammar":
        suggestions = get_llm_suggestions(client, text, model, GRAMMAR_SYSTEM_PROMPT)

    spelling_suggestions = suggestions.get("spelling_suggestions", [])

    cleaned_spelling_suggestions = []
    split_text = text.split(" ")
    for suggestion in spelling_suggestions:
        # Traverse through the words and find the proper word index for each mispelled word
        for i, word in enumerate(split_text):
            if word == suggestion["word"]:
                suggestion["word_index"] = i
                break

        cleaned_spelling_suggestions.append(suggestion)

    grammar_suggestions = suggestions.get("grammar_suggestions", [])
    cleaned_grammar_suggestions = []
    for suggestion in grammar_suggestions:
        start_index = text.find(suggestion["sentence"])
        end_index = start_index + len(suggestion["sentence"])

        split_suggestion = text[start_index:end_index].split(" ")

        for i, word in enumerate(split_text):
            if word == split_suggestion[0]:
                # Check if the rest of the words match
                if split_suggestion == split_text[i : i + len(split_suggestion)]:
                    suggestion["first_word_index"] = i
                    suggestion["last_word_index"] = i + len(split_suggestion) - 1
                    break

        cleaned_grammar_suggestions.append(suggestion)

    return {
        "spelling_suggestions": cleaned_spelling_suggestions,
        "grammar_suggestions": cleaned_grammar_suggestions,
    }


def get_llm_suggestions(client, text, model, system_prompt):
    tic = time.perf_counter()
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {"role": "user", "content": text},
        ],
        model=model,
        response_format={
            "type": "json_object",
            # "schema": GrammarSuggestions.model_json_schema(),
        },
    )
    tac = time.perf_counter()
    print(f"LLM completion time: {tac - tic} seconds")

    return json.loads(response.choices[0].message.content)
