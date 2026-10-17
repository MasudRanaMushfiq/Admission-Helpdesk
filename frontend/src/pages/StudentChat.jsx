import { useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import usePolling from '../hooks/usePolling';
import ChatBubble from '../components/ChatBubble';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const SAMPLE_QUESTIONS = [
  'How much is the application fee?',
  'CSE e koyta seat ache?',
  'A unit er exam kobe?',
  'Meye der jonno koyta hall ache?',
];
const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

export default function StudentChat() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [messages, setMessages] = useState(null); // null = loading
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const bottomRef = useRef(null);

  // Poll every 4s for admin replies
  usePolling(async () => {
    try {
      const res = await api.get('/chat');
      setMessages(res.data.data);
    } catch (err) {
      // Error only on first load
      if (messages === null) {
        setMessages([]);
        toast.error(errorMessage(err));
      }
    }
  }, 4000);

  // Scroll to newest
  const count = messages ? messages.length : 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [count, sending]);

  async function send(question) {
    const content = question.trim();
    if (!content || sending) return;
    if (content.length < MIN_LENGTH) {
      toast.error(`Please write a full question (at least ${MIN_LENGTH} characters)`);
      return;
    }

    setSending(true);
    setText('');
    try {
      const res = await api.post('/chat', { content });
      const { question: saved, reply, forwarded } = res.data.data;
      // Skip messages already added by polling
      setMessages((list) => {
        const current = list || [];
        const ids = new Set(current.map((m) => m.id));
        return [...current, ...[saved, reply].filter((m) => m && !ids.has(m.id))];
      });
      if (forwarded) toast.success('Your question was forwarded to the admin');
    } catch (err) {
      setText(content);
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(text);
  }

  // Too short
  const tooShort = text.trim().length > 0 && text.trim().length < MIN_LENGTH;

  // Find a message by id
  const byId = Object.fromEntries((messages || []).map((m) => [m.id, m]));

  // Scroll to the quoted question and highlight it
  function jumpToMessage(id) {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 1500);
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <div className="brand">Admission Helpdesk</div>
          <small className="muted">
            {user.name} · Roll {user.rollNo}
          </small>
        </div>
        <button className="btn btn-light" onClick={logout}>
          Log out
        </button>
      </header>

      <div className="chat-messages">
        {messages === null && <Loader text="Loading your chat..." />}

        {messages && messages.length === 0 && !sending && (
          <EmptyState title="Ask your first question" text="Try one of these:">
            <div className="chips">
              {SAMPLE_QUESTIONS.map((q) => (
                <button key={q} className="chip" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          </EmptyState>
        )}

        {messages &&
          messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              replyTo={m.replyToId ? byId[m.replyToId] : null}
              highlighted={m.id === highlightId}
              onQuoteClick={jumpToMessage}
            />
          ))}

        {sending && (
          <div className="bubble-row bubble-row-ai">
            <div className="bubble bubble-ai thinking">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
          }}
          placeholder="Type your admission question..."
          maxLength={MAX_LENGTH}
          rows={2}
        />
        <div className="chat-input-side">
          <small className={tooShort ? 'field-error' : 'muted'}>
            {tooShort ? `min ${MIN_LENGTH} characters` : `${text.length}/${MAX_LENGTH}`}
          </small>
          <button className="btn btn-primary" disabled={sending || text.trim().length < MIN_LENGTH}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
