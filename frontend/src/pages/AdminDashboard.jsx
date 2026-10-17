import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data.data))
      .catch((err) => {
        toast.error(errorMessage(err));
        setFailed(true);
      });
  }, [toast]);

  if (failed) return <EmptyState title="Could not load the dashboard" text="Please refresh the page to try again." />;
  if (!stats) return <Loader />;

  const cards = [
    { label: 'Pending questions', value: stats.pending, link: '/admin/inbox', highlight: stats.pending > 0 },
    { label: 'Registered students', value: stats.registeredStudents },
    { label: 'Total questions', value: stats.totalQuestions },
    { label: 'Answered by AI', value: stats.aiAnswered },
    { label: 'Forwarded to admin', value: stats.forwarded },
  ];
  const maxCount = Math.max(1, ...stats.topCategories.map((c) => c.count));

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="stat-grid">
        {cards.map((card) => {
          const content = (
            <>
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </>
          );
          return card.link ? (
            <Link key={card.label} to={card.link} className={card.highlight ? 'card stat-card stat-highlight' : 'card stat-card'}>
              {content}
            </Link>
          ) : (
            <div key={card.label} className="card stat-card">
              {content}
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Top matched categories</h3>
        {stats.topCategories.length === 0 ? (
          <EmptyState title="No AI answers yet" text="Categories appear here once students get AI answers." />
        ) : (
          <ul className="bar-list">
            {stats.topCategories.map((c) => (
              <li key={c.name}>
                <span className="bar-label">{c.name}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                </span>
                <span className="bar-count">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
