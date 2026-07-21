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
      return res.status(500).json({ error: 'API Key not configured on Vercel' });
    }

    // Gọi trực tiếp đến Gemini API endpoint chính thức bằng fetch (Không cần cài thư viện)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Bạn là Arie chatbot mini. Phản hồi ngắn gọn: "${prompt}".
            BẮT BUỘC trả về định dạng JSON thuần không codeblock:
            {"reply_text": "câu trả lời", "emotion": "chọn 1 trong [normal, happy, sad, angry, surprised, sleepy]"}`
          }]
        }]
      })
    });

    const data = await apiResponse.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const responseText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: responseText });
    } else {
      throw new Error("Invalid response from Gemini API");
    }

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
                                    }
                      
