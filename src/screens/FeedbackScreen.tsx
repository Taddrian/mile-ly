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
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: '#E1F5EE' }}
        >
          ✓
        </div>
        <p className="text-base font-semibold mb-1" style={{ color: 'var(--fg)' }}>Thanks for your feedback!</p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          We read every message and use it to improve Mile-ly.
        </p>
        <button
          onClick={() => { setSent(false); setType('Suggestion'); }}
          className="text-sm font-medium"
          style={{ color: '#0F6E56' }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-4 md:pt-6">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Help us improve</p>
        <h1 className="text-2xl font-medium" style={{ color: 'var(--fg)' }}>Feedback</h1>
      </div>

      <div className="px-4 space-y-5 pb-8">
        {/* Type selector */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</p>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors flex flex-col items-center gap-1"
                style={{
                  backgroundColor: type === t ? '#0F6E56' : 'var(--card)',
                  color: type === t ? '#fff' : 'var(--text-secondary)',
                  border: `0.5px solid ${type === t ? '#0F6E56' : 'var(--border)'}`,
                }}
              >
                <span className="text-base">{TYPE_ICONS[t]}</span>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</p>
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
            className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none"
            style={{
              backgroundColor: 'var(--card)',
              color: 'var(--fg)',
              border: '0.5px solid var(--border)',
            }}
          />
          <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
            {message.length} chars
          </p>
        </div>

        {error && (
          <p className="text-xs text-center" style={{ color: '#E24B4A' }}>{error}</p>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#0F6E56' }}
        >
          {sending ? 'Sending…' : 'Send feedback'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Your email is included so we can follow up if needed.
        </p>
      </div>
    </div>
  );
}
