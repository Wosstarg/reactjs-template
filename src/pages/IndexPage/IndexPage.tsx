'use client';

import { useEffect, useState, useRef } from 'react';

const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;

export function IndexPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Привет! Я твой ИИ-психолог и эксперт по играм 🤖\nЧем могу помочь?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = tg?.colorScheme === 'dark';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.MainButton.setText('Купить подписку — 149 ₽');
      tg.MainButton.show();
      tg.MainButton.onClick(() => tg.showAlert('Оплата через Telegram Stars — скоро здесь!'));
    }
  }, []);

  const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userText = input.trim();
  setInput('');
  setMessages(prev => [...prev, { role: 'user', content: userText }]);
  setLoading(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
  } catch {
    setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка сети. Попробуй ещё раз.' }]);
  }
  setLoading(false);
};

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark ? '#0f0f0f' : '#ffffff',
      color: isDark ? '#fff' : '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '20px 16px 16px',
        textAlign: 'center',
        borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
        background: isDark ? '#1c1c1d' : '#ffffff'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          ИИ-Психолог & Геймер
        </h1>
      </div>

      {/* Сообщения */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            margin: '8px 0'
          }}>
            <div style={{
              maxWidth: '82%',
              padding: '12px 18px',
              borderRadius: '18px',
              background: m.role === 'user' ? '#2483ff' : (isDark ? '#2d2d2d' : '#f2f2f2'),
              color: m.role === 'user' ? '#fff' : (isDark ? '#fff' : '#000'),
              borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '18px',
              borderBottomRightRadius: m.role === 'user' ? '4px' : '18px',
            }}>
              {m.content.split('\n').map((line, j) => (
                <div key={j} style={{ margin: '4px 0' }}>{line || <br />}</div>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '8px 0' }}>
            <div style={{
              padding: '12px 18px',
              borderRadius: '18px',
              background: isDark ? '#2d2d2d' : '#f2f2f2',
              color: isDark ? '#fff' : '#000',
              borderBottomLeftRadius: '4px'
            }}>
              Печатает...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div style={{
        padding: '12px 16px 20px',
        background: isDark ? '#0f0f0f' : '#ffffff',
        borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}`
      }}>
        <div style={{ position: 'relative' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Напиши сообщение..."
            style={{
              width: '100%',
              padding: '14px 56px 14px 20px',
              borderRadius: '30px',
              border: 'none',
              background: isDark ? '#2d2d2d' : '#f2f2f2',
              color: isDark ? '#fff' : '#000',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              background: '#2483ff',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}