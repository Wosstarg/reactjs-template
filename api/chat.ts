// api/chat.ts
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { message } = await req.json ? await req.json() : {};

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ reply: 'API key missing' }), { status: 500 });
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Ты — профессиональный ИИ-психолог и эксперт по играм. Отвечай на русском языке, глубоко и по делу.' },
        { role: 'user', content: message || 'Привет' }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || 'Нет ответа';

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export const config = { runtime: 'edge' };
