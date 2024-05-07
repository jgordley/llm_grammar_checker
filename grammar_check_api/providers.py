import openai
import os

PROVIDERS_MAP = {
    "OpenAI": os.environ["OPENAI_BASE_URL"],
    "TogetherAI": os.environ["TOGETHERAI_BASE_URL"],
    "Telnyx": os.environ["TELNYX_BASE_URL"],
}


def get_provider_client(provider, api_key):
    new_client = openai.OpenAI(base_url=PROVIDERS_MAP[provider], api_key=api_key)
    return new_client
