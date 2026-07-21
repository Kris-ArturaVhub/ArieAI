import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Tự động lấy GEMINI_API_KEY từ Environment Variable của Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`Bạn là Arie chatbot mini. Phản hồi ngắn gọn: "${prompt}".
    BẮT BUỘC trả về định dạng JSON thuần không codeblock:
    {"reply_text": "câu trả lời", "emotion": "chọn 1 trong [normal, happy, sad, angry, surprised, sleepy]"}`);

    const responseText = result.response.text();

    return res.status(200).json({ text: responseText });

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
