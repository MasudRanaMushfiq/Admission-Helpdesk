import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api/client';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState(null);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  async function load() {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.data);
    } catch (err) {
      setCategories([]);
      toast.error(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post('/admin/categories', { name: newName });
      setNewName('');
      toast.success('Category added');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function saveEdit(id) {
    try {
      await api.put(`/admin/categories/${id}`, { name: editName });
      setEditId(null);
      toast.success('Category updated');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${category.id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (categories === null) return <Loader />;

  return (
    <div>
      <h2>Categories</h2>

      <form className="toolbar" onSubmit={add}>
        <input placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={50} />
        <button className="btn btn-primary">Add</button>
      </form>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" text="Add categories like Fees, Deadlines or Exam." />
      ) : (
        <ul className="card list">
          {categories.map((c) => (
            <li key={c.id} className="list-item">
              {editId === c.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={50} autoFocus />
                  <div className="actions">
                    <button className="btn btn-small btn-primary" onClick={() => saveEdit(c.id)}>
                      Save
                    </button>
                    <button className="btn btn-small btn-light" onClick={() => setEditId(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span>
                    {c.name} <small className="muted">({c.entryCount} entries)</small>
                  </span>
                  <div className="actions">
                    <button
                      className="btn btn-small btn-light"
                      onClick={() => {
                        setEditId(c.id);
                        setEditName(c.name);
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(c)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
