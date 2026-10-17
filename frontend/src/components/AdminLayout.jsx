import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/inbox', label: 'Inbox' },
  { to: '/admin/kb', label: 'Knowledge Base' },
  { to: '/admin/students', label: 'Student Records' },
  { to: '/admin/categories', label: 'Categories' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-layout">
      <header className="mobile-header">
        <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          ☰
        </button>
        <span className="brand">Admission Helpdesk</span>
      </header>

      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="brand sidebar-brand">Admission Helpdesk</div>
        <nav>
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>{user.email}</small>
          <button className="btn btn-light" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
