import os
import json
import openai
from pydantic import BaseModel, Field

# Create client
client = openai.OpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.environ["TOGETHER_API_KEY"],
)


# Define the schema for the output.
class User(BaseModel):
    name: str = Field(description="user name")
    address: str = Field(description="address")


# Call the LLM with the JSON schema
chat_completion = client.chat.completions.create(
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
    response_format={"type": "json_object", "schema": User.model_json_schema()},
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant that answers in JSON.",
        },
        {
            "role": "user",
            "content": "Create a user named Alice, who lives in 42, Wonderland Avenue.",
        },
    ],
)

created_user = json.loads(chat_completion.choices[0].message.content)
print(json.dumps(created_user, indent=2))

"""
{
  "address": "42, Wonderland Avenue",
  "name": "Alice"
}
"""
