import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Chỉ nhận yêu cầu POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Tự động lấy GEMINI_API_KEY từ biến môi trường (Environment Variable) trên Vercel
    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bạn là Arie chatbot mini. Phản hồi ngắn gọn: "${prompt}".
      BẮT BUỘC trả về định dạng JSON thuần không codeblock:
      {"reply_text": "câu trả lời", "emotion": "chọn 1 trong [normal, happy, sad, angry, surprised, sleepy]"}`,
    });

    // Trả kết quả an toàn về cho Frontend
    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
