import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load from backend folder
load_dotenv(r"d:\aimedrisk\backend\.env")
api_keys_str = os.getenv("GEMINI_API_KEY", "")
api_keys = [k.strip() for k in api_keys_str.split(",") if k.strip()]

if not api_keys:
    print(f"No API Key found in .env. String was: '{api_keys_str}'")
else:
    first_key = api_keys[0]
    genai.configure(api_key=first_key)
    try:
        print(f"Available models for key {first_key[:10]}...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Error: {e}")
