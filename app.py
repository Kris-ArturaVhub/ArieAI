import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI()

# Bật CORS để HTML từ GitHub Pages gửi Request sang không bị chặn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6IipupD9KXOP3Z-EVBmyevj_FqYCCFkXE11r2schnJhcQ")
client = genai.Client(api_key=GEMINI_API_KEY)

class ChatRequest(BaseModel):
    message: str

class BotResponseSchema(BaseModel):
    reply_text: str
    emotion: str # normal, happy, sad, angry, surprised, sleepy

@app.get("/")
def root():
    return {"status": "Arie AI Engine is Online!"}

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    prompt = f"""
    Bạn là Arie AI - một trợ lý ảo cá tính.
    Hãy phản hồi câu nói sau của User: "{req.message}"
    Tự động chọn 1 trong các emotion sau hợp nhất: [normal, happy, sad, angry, surprised, sleepy].
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=BotResponseSchema,
                temperature=0.7,
            ),
        )
        res_data = BotResponseSchema.model_validate_json(response.text)
        return {
            "status": "success",
            "reply_text": res_data.reply_text,
            "emotion": res_data.emotion
        }
    except Exception as e:
        return {
            "status": "error",
            "reply_text": f"Lỗi xử lý AI: {str(e)}",
            "emotion": "sad"
        }
