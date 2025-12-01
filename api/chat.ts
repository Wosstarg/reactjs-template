// api/chat.ts
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { message } = await req.json();

  // Vercel в Edge Functions подставляет переменные через process.env
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ reply: 'API ключ не найден (проверь переменную в Vercel)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Ты — профессиональный ИИ-психолог и эксперт по играм. Отвечай на русском, глубоко, с примерами, без медицинских диагнозов.' },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('DeepSeek error:', err);
      return new Response(JSON.stringify({ reply: 'Ошибка DeepSeek' }), { status: 502 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Не смог ответить';

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ reply: 'Серверная ошибка' }), { status: 500 });
  }
}

export const config = {
  runtime: 'edge',
};