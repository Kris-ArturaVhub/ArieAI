export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key chưa được cấu hình trên Vercel!' });
    }

    // Dùng alias gemini-flash chuẩn không bao giờ sợ lỗi đổi model
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Bạn là Arie chatbot mini. Hãy trả lời câu hỏi sau bằng Tiếng Việt.
            BẮT BUỘC trả về định dạng JSON thuần không có Markdown codeblock, dạng:
            {"reply_text": "câu trả lời của bạn", "emotion": "normal"}
            
            Câu hỏi: "${prompt}"`
          }]
        }]
      })
    });

    const data = await apiResponse.json();

    if (data.error) {
      console.error('Google API Error:', data.error);
      return res.status(500).json({ error: data.error.message || 'Lỗi từ phía Gemini API' });
    }

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      let rawText = data.candidates[0].content.parts[0].text;
      
      // Xóa bỏ các ký tự codeblock ```json nếu Gemini tự thêm vào
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      return res.status(200).json({ text: rawText });
    } else {
      console.error('Unexpected Gemini Response Structure:', JSON.stringify(data));
      return res.status(500).json({ error: 'Phản hồi từ Gemini không đúng cấu trúc' });
    }

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
                                  }
