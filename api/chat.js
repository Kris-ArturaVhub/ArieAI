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
      return res.status(500).json({ error: 'API Key chưa được cài đặt!' });
    }

    // Đã đổi sang gemini-2.0-flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Bạn là Arie,mini chatbot. Trả lời câu hỏi sau bằng Tiếng Việt.
            BẮT BUỘC trả về câu trả lời bắt đầu bằng thẻ cảm xúc trong ngoặc vuông, sau đó là khoảng trắng và câu trả lời. KHÔNG TRẢ VỀ JSON!
            
            Các thẻ hợp lệ: [normal], [happy], [sleepy], [angry], [sad], [surprised].
            
            Ví dụ:
            [happy] Chào bạn, tôi có thể giúp gì?
            
            Câu hỏi: "${prompt}"`
          }]
        }]
      })
    });

    const data = await apiResponse.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      let rawText = data.candidates[0].content.parts[0].text.trim();
      return res.status(200).json({ text: rawText });
    } else {
      return res.status(500).json({ error: 'Không nhận được phản hồi từ Gemini' });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
    }
