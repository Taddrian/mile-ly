'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type FeedbackType = 'Bug' | 'Suggestion' | 'Other';

const TYPES: FeedbackType[] = ['Bug', 'Suggestion', 'Other'];

const TYPE_ICONS: Record<FeedbackType, string> = {
  Bug: '🐛',
  Suggestion: '💡',
  Other: '💬',
};

export default function FeedbackScreen() {
  const [type, setType] = useState<FeedbackType>('Suggestion');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      setSending(false);
      return;
    }

    const { error: err } = await supabase.from('feedback').insert({
      user_id: user.id,
      user_email: user.email ?? null,
      type,
      message: message.trim(),
    });

    setSending(false);
    if (err) {
      setError('Something went wrong. Please try again.');
    } else {
      setSent(true);
      setMessage('');
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-24 text-center">
        <div
          style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(180deg, var(--node-ring), var(--node-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: 16,
            boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.18)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6" />
          </svg>
        </div>
        <p className="font-display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--m-ink)', marginBottom: 4 }}>Thanks for your feedback!</p>
        <p style={{ fontSize: 13, color: 'var(--m-slate)', marginBottom: 28 }}>
          We read every message and use it to improve Mile-ly.
        </p>
        <button
          onClick={() => { setSent(false); setType('Suggestion'); }}
          className="font-display"
          style={{ fontSize: 13, fontWeight: 700, color: 'var(--node-deep)' }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div style={{ padding: '52px 20px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--m-slate)', marginBottom: 4 }}>
          Help us improve
        </p>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--m-ink)' }}>
          Feedback
        </h1>
      </div>

      <div className="px-4 pb-8" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Type selector */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate)', marginBottom: 8 }}>Type</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="font-display"
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 14,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                  background: type === t ? 'linear-gradient(180deg, var(--node-ring), var(--node-deep))' : 'var(--card)',
                  color: type === t ? '#fff' : 'var(--m-slate)',
                  border: type === t ? 'none' : '2px solid var(--m-border)',
                  boxShadow: type === t ? 'inset 0 -4px 0 rgba(0,0,0,0.18)' : 'none',
                }}
              >
                <span style={{ fontSize: 17 }}>{TYPE_ICONS[t]}</span>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate)', marginBottom: 8 }}>Message</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'Bug'
                ? 'Describe what happened and how to reproduce it…'
                : type === 'Suggestion'
                ? 'What feature or improvement would you like to see?'
                : 'Anything on your mind…'
            }
            rows={6}
            className="w-full resize-none"
            style={{
              borderRadius: 16,
              padding: '14px 16px',
              fontSize: 14,
              outline: 'none',
              background: 'var(--card)',
              color: 'var(--m-ink)',
              border: '2px solid var(--m-border)',
            }}
          />
          <p style={{ fontSize: 11, marginTop: 4, textAlign: 'right', color: 'var(--m-slate)' }}>
            {message.length} chars
          </p>
        </div>

        {error && (
          <p style={{ fontSize: 12, textAlign: 'center', color: '#E04E42' }}>{error}</p>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="font-display"
          style={{
            width: '100%',
            padding: '15px 0',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 800,
            color: '#fff',
            background: 'linear-gradient(180deg, var(--node-ring), var(--node-deep))',
            boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.18)',
            opacity: sending || !message.trim() ? 0.4 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {sending ? 'Sending…' : 'Send feedback'}
        </button>

        <p style={{ fontSize: 11, textAlign: 'center', color: 'var(--m-slate)' }}>
          Your email is included so we can follow up if needed.
        </p>
      </div>
    </div>
  );
}
