import openai
import os

client = openai.OpenAI(
    base_url="https://api.telnyx.com/v2/ai",
    api_key=os.environ["TELYNX_API_KEY"],
)

for model in client.models.list()._get_page_items():
    print(model.id)
