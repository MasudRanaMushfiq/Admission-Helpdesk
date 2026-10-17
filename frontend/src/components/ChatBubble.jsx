const LABELS = { student: 'You', ai: 'AI Assistant', admin: 'Admin' };

function formatTime(date) {
  return new Date(date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

// replyTo: the question this admin reply quotes
export default function ChatBubble({ message, replyTo, highlighted, onQuoteClick }) {
  const { id, senderType, content, status, createdAt } = message;
  const bubbleClass = `bubble bubble-${senderType}${highlighted ? ' bubble-highlight' : ''}`;

  return (
    <div id={`msg-${id}`} className={`bubble-row bubble-row-${senderType}`}>
      <div className={bubbleClass}>
        <div className="bubble-meta">
          {senderType === 'admin' ? <span className="badge badge-admin">Admin</span> : <span>{LABELS[senderType]}</span>}
          <span>{formatTime(createdAt)}</span>
        </div>

        {senderType === 'admin' && replyTo && (
          <button type="button" className="bubble-quote" onClick={() => onQuoteClick(replyTo.id)} title="Show your question">
            <span className="quote-label">↩ Reply to your question</span>
            <span className="quote-text">{replyTo.content}</span>
          </button>
        )}

        <p className="bubble-text">{content}</p>
        {senderType === 'student' && status === 'pending_admin' && (
          <p className="bubble-note">Forwarded to admin – you will get a reply here.</p>
        )}
      </div>
    </div>
  );
}
