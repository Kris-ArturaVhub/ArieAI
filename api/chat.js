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
      return res.status(500).json({ error: 'API Key chưa được cài đặt trên Vercel!' });
    }

    // Endpoint REST API của Gemini 1.5 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Bạn là Arie, chatbot mini. Hãy trả lời câu hỏi sau bằng Tiếng Việt.
            BẮT BUỘC trả về định dạng JSON thuần đúng cấu trúc sau, không kèm bất kỳ văn bản giải thích nào khác:
            {"reply_text": "nội dung câu trả lời", "emotion": "normal"}

            Các emotion hợp lệ gồm: normal, happy, sleepy, angry, sad, surprised.
            
            Câu hỏi của người dùng: "${prompt}"`
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
      
      // Xóa sạch các dấu ```json hoặc ``` ở đầu/cuối chuỗi
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      return res.status(200).json({ text: rawText });
    } else {
      return res.status(500).json({ error: 'Không nhận được phản hồi đúng từ Gemini' });
    }

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
  }
