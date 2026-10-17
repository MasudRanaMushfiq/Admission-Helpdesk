import { useEffect, useState } from 'react';
import api, { errorMessage, fieldErrors } from '../api/client';
import { useToast } from '../components/Toast';
import usePolling from '../hooks/usePolling';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

function QuestionCard({ question, categories, onAnswered }) {
  const toast = useToast();
  const [reply, setReply] = useState('');
  const [saveToKb, setSaveToKb] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [kbQuestion, setKbQuestion] = useState(question.content.slice(0, 255));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  // Same rules as the server
  function validate() {
    const errs = {};
    if (!reply.trim()) errs.content = 'Please write a reply';
    if (saveToKb && !categoryId) errs.categoryId = 'Choose a category';
    if (saveToKb && kbQuestion.trim().length < 3) {
      errs.kbQuestion = 'Question must be at least 3 characters. Write a clearer question, e.g. "Who are you?"';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error(Object.values(errs)[0]);

    setSending(true);
    try {
      const body = saveToKb
        ? { content: reply, saveToKb: true, categoryId: Number(categoryId), kbQuestion }
        : { content: reply };
      const res = await api.post(`/admin/inbox/${question.id}/reply`, body);

      if (res.data.data.warning) toast.error(res.data.data.warning);
      else toast.success(saveToKb ? 'Reply sent and saved to the knowledge base' : 'Reply sent');
      onAnswered(question.id);
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
      setSending(false);
    }
  }

  return (
    <form className="card inbox-card" onSubmit={handleSubmit}>
      <div className="inbox-meta">
        <strong>{question.studentName}</strong>
        <span className="muted">Roll {question.rollNo}</span>
        <span className="muted">{new Date(question.createdAt).toLocaleString()}</span>
      </div>
      <p className="inbox-question">{question.content}</p>

      {/* Click to copy the answer into the reply */}
      {question.bestMatch && (
        <button
          type="button"
          className="best-match"
          onClick={() => setReply(question.bestMatch.answer)}
          title="Click to use this answer as your reply"
        >
          <span className="best-match-head">
            <span>Best match in KB · {question.bestMatch.category}</span>
            <span className="badge">{Math.round(question.similarity * 100)}% match</span>
          </span>
          <strong>{question.bestMatch.question}</strong>
          <span className="best-match-answer">{question.bestMatch.answer}</span>
          <span className="best-match-action">Use this answer ↓</span>
        </button>
      )}
      {!question.bestMatch && (
        <p className="muted best-match-none">No related answer found in the knowledge base (0% match).</p>
      )}

      <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply..." rows={3} />
      {errors.content && <span className="field-error">{errors.content}</span>}

      <label className="checkbox">
        <input type="checkbox" checked={saveToKb} onChange={(e) => setSaveToKb(e.target.checked)} />
        Save to knowledge base
      </label>

      {saveToKb && (
        <div className="kb-promote">
          <label className="field">
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Choose...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
          </label>
          <label className="field">
            Question to save
            <input value={kbQuestion} onChange={(e) => setKbQuestion(e.target.value)} maxLength={255} />
            {errors.kbQuestion && <span className="field-error">{errors.kbQuestion}</span>}
          </label>
        </div>
      )}

      <button className="btn btn-primary" disabled={sending}>
        {sending ? 'Sending...' : 'Send reply'}
      </button>
    </form>
  );
}

export default function AdminInbox() {
  const [questions, setQuestions] = useState(null);
  const [categories, setCategories] = useState([]);
  const [failed, setFailed] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  // Refresh every 10s
  usePolling(async () => {
    try {
      const res = await api.get('/admin/inbox');
      setQuestions(res.data.data);
      setFailed(false);
    } catch (err) {
      // Show the error once
      if (!failed) toast.error(errorMessage(err));
      setFailed(true);
    }
  }, 10000);

  const removeQuestion = (id) => setQuestions((list) => list.filter((q) => q.id !== id));

  return (
    <div>
      <h2>Inbox</h2>
      <p className="muted">Questions the AI could not answer confidently.</p>

      {questions === null && failed && <EmptyState title="Could not load the inbox" text="It will try again in a few seconds." />}
      {questions === null && !failed && <Loader />}
      {questions && questions.length === 0 && (
        <EmptyState title="All caught up!" text="There are no pending questions right now." />
      )}

      {questions &&
        questions.map((q) => <QuestionCard key={q.id} question={q} categories={categories} onAnswered={removeQuestion} />)}
    </div>
  );
}
