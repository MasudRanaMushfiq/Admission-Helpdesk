import { useEffect, useState } from 'react';
import api, { errorMessage, fieldErrors } from '../api/client';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const EMPTY = { categoryId: '', question: '', answer: '', isActive: true };
const PAGE_SIZE = 50;

function EntryForm({ entry, categories, onSaved, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(entry ? { ...entry } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const body = { categoryId: Number(form.categoryId), question: form.question, answer: form.answer, isActive: form.isActive };
    try {
      if (entry) await api.put(`/admin/kb/${entry.id}`, body);
      else await api.post('/admin/kb', body);
      toast.success(entry ? 'Entry updated' : 'Entry added');
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={entry ? 'Edit KB entry' : 'Add KB entry'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          Category
          <select name="categoryId" value={form.categoryId} onChange={update}>
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
          Question
          <input name="question" value={form.question} onChange={update} maxLength={255} />
          {errors.question && <span className="field-error">{errors.question}</span>}
        </label>
        <label className="field">
          Answer
          <textarea name="answer" value={form.answer} onChange={update} rows={5} />
          {errors.answer && <span className="field-error">{errors.answer}</span>}
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active (used by the AI)
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminKB() {
  const toast = useToast();
  const [entries, setEntries] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | entry

  async function load() {
    try {
      const [kb, cats] = await Promise.all([api.get('/admin/kb'), api.get('/admin/categories')]);
      setEntries(kb.data.data);
      setCategories(cats.data.data);
    } catch (err) {
      setEntries([]);
      toast.error(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(entry) {
    try {
      await api.put(`/admin/kb/${entry.id}`, {
        categoryId: entry.categoryId,
        question: entry.question,
        answer: entry.answer,
        isActive: !entry.isActive,
      });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(entry) {
    if (!window.confirm(`Delete "${entry.question}"?`)) return;
    try {
      await api.delete(`/admin/kb/${entry.id}`);
      toast.success('Entry deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (entries === null) return <Loader />;

  const term = search.trim().toLowerCase();
  const visible = entries.filter(
    (e) =>
      (!filterCategory || e.categoryId === Number(filterCategory)) &&
      (!term || e.question.toLowerCase().includes(term) || e.answer.toLowerCase().includes(term)),
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageEntries = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <h2>Knowledge Base</h2>
        <button className="btn btn-primary" onClick={() => setEditing('new')} disabled={categories.length === 0}>
          + Add entry
        </button>
      </div>
      {categories.length === 0 && <div className="alert">Create a category first, then you can add entries.</div>}

      <div className="toolbar">
        <input
          placeholder="Search questions or answers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No entries found" text={entries.length ? 'Try a different search or filter.' : 'Add your first entry.'} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Category</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageEntries.map((entry) => (
                <tr key={entry.id} className={entry.isActive ? '' : 'row-inactive'}>
                  <td>{entry.question}</td>
                  <td className="cell-long">{entry.answer}</td>
                  <td>{entry.category.name}</td>
                  <td>
                    <button className={entry.isActive ? 'badge badge-green' : 'badge'} onClick={() => toggleActive(entry)} title="Click to change">
                      {entry.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="actions">
                    <button className="btn btn-small btn-light" onClick={() => setEditing(entry)}>
                      Edit
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(entry)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visible.length > 0 && (
        <div className="pagination">
          <button className="btn btn-small btn-light" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
            ← Previous
          </button>
          <span className="muted">
            Page {currentPage} of {totalPages} · {visible.length} entries
          </span>
          <button className="btn btn-small btn-light" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
            Next →
          </button>
        </div>
      )}

      {editing && (
        <EntryForm
          entry={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
