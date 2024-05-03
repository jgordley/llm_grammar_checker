import json
import openai

SYSTEM_PROMPT = """
You are a helpful grammar assistant. You take in sequences of text and determine if any words are mispelled or using incorrect grammar. Only respond in the JSON format specified:

Give the word, word_index (the index of the word in the whole text), previous_words (the 3 (ONLY 3) words before the word IN ORDER), subsequent_words (the 3 (ONLY 3) words after the word IN ORDER), word_correction (the corrected word), and an explanation of why the word is likely to be incorrect

Here is an example
{
    "grammar_suggestions": [
        {
            "word": "financail",
            "word_index": 4,
            "previous_words": ["These", "are", "the"],
            "subsequent_words": ["documents", "you", "requested"],
            "word_correction": "financial",
            "explanation": "The word is likely to be financial based on the context talking about money and the similar spelling."
        },
        {
            "word": "referall",
            "word_index": 10,
            "previous_words": ["I", "need", "a"],
            "subsequent_words": ["to", "a", "specialist"],
            "word_correction": "referral",
            "explanation": "The word is likely to be referral based on the context talking about needing a specialist."
        }
    ]
}
"""


def grammar_checker(text):
    suggestions = get_openai_suggestions(text).get("grammar_suggestions", [])

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


def get_openai_suggestions(text):
    response = openai.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {"role": "user", "content": text},
        ],
        model="gpt-4-turbo",
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)
