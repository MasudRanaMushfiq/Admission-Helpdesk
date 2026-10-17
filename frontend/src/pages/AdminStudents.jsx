import { useEffect, useState } from 'react';
import api, { errorMessage, fieldErrors } from '../api/client';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const EMPTY = { fullName: '', rollNo: '', registrationNo: '' };

function RecordForm({ record, onSaved, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(record ? { ...record } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const body = { fullName: form.fullName, rollNo: form.rollNo, registrationNo: form.registrationNo };
    try {
      if (record) await api.put(`/admin/student-records/${record.id}`, body);
      else await api.post('/admin/student-records', body);
      toast.success(record ? 'Record updated' : 'Record added');
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
      setSaving(false);
    }
  }

  const field = (name, label) => (
    <label className="field">
      {label}
      <input name={name} value={form[name]} onChange={update} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </label>
  );

  return (
    <Modal title={record ? 'Edit student record' : 'Add student record'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {field('fullName', 'Full name')}
        {field('rollNo', 'Roll number')}
        {field('registrationNo', 'Registration number')}
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

export default function AdminStudents() {
  const toast = useToast();
  const [records, setRecords] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const res = await api.get('/admin/student-records');
      setRecords(res.data.data);
    } catch (err) {
      setRecords([]);
      toast.error(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(record) {
    if (!window.confirm(`Delete the record of ${record.fullName}?`)) return;
    try {
      await api.delete(`/admin/student-records/${record.id}`);
      toast.success('Record deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (records === null) return <Loader />;

  const term = search.trim().toLowerCase();
  const visible = records.filter(
    (r) => !term || r.fullName.toLowerCase().includes(term) || r.rollNo.includes(term) || r.registrationNo.includes(term),
  );

  return (
    <div>
      <div className="page-header">
        <h2>Student Records</h2>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          + Add record
        </button>
      </div>
      <p className="muted">Official student list. Students can register only if their details are here.</p>

      <div className="toolbar">
        <input placeholder="Search by name, roll or registration..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No records found" text={records.length ? 'Try a different search.' : 'Add your first student record.'} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll</th>
                <th>Registration</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>{r.fullName}</td>
                  <td>{r.rollNo}</td>
                  <td>{r.registrationNo}</td>
                  <td>
                    <span className={r.isClaimed ? 'badge badge-green' : 'badge'}>{r.isClaimed ? 'Registered' : 'Not registered'}</span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-small btn-light" onClick={() => setEditing(r)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => remove(r)}
                      disabled={r.isClaimed}
                      title={r.isClaimed ? 'Registered records cannot be deleted' : ''}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RecordForm
          record={editing === 'new' ? null : editing}
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
