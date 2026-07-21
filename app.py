import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("AQ.Ab8RN6IipupD9KXOP3Z-EVBmyevj_FqYCCFkXE11r2schnJhcQ")

app = FastAPI()

@app.get("/")
def get():
    return HTMLResponse("Arie AI Backend đang chạy trên Render/Server!")

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            if not data.strip():
                continue

            # Logic mẫu phản hồi tạm thời
            emotion = "happy"
            reply_text = f"Tớ đã nhận câu lệnh từ web: '{data}' ✨"

            await websocket.send_json({
                "type": "state_change",
                "emotion": emotion,
                "is_talking": True
            })

            accumulated_text = ""
            for i, char in enumerate(reply_text):
                accumulated_text += char
                mouth_scale = 1.3 if (i % 2 == 0) else 0.6
                await websocket.send_json({
                    "type": "stream_chunk",
                    "text_chunk": accumulated_text,
                    "mouth_scale_y": mouth_scale
                })
                await asyncio.sleep(0.04)

            await websocket.send_json({
                "type": "state_change",
                "emotion": emotion,
                "is_talking": False
            })
    except WebSocketDisconnect:
        print("Client disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
          
