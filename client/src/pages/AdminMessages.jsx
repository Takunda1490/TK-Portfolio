import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import {
  fetchMessages,
  markMessageRead,
  markMessageUnread,
  deleteMessage,
} from '../api';

export default function AdminMessages() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = () =>
    fetchMessages()
      .then((r) => setMessages(r.messages || []))
      .catch(() => showToast({ type: 'error', message: 'Failed to load messages.' }));

  useEffect(() => {
    let cancelled = false;
    fetchMessages()
      .then((r) => { if (!cancelled) setMessages(r.messages || []); })
      .catch(() => { if (!cancelled) showToast({ type: 'error', message: 'Failed to load messages.' }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [showToast]);

  const handleSelect = async (m) => {
    setSelected(m);
    if (!m.read_at) {
      try {
        const updated = await markMessageRead(m.id);
        setMessages((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
        setSelected(updated);
      } catch {
        showToast({ type: 'error', message: 'Failed to mark read.' });
      }
    }
  };

  const handleToggleRead = async (m) => {
    try {
      const updated = m.read_at ? await markMessageUnread(m.id) : await markMessageRead(m.id);
      setMessages((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
      if (selected?.id === m.id) setSelected(updated);
    } catch {
      showToast({ type: 'error', message: 'Failed to update.' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      showToast({ type: 'success', message: 'Message deleted.' });
      setMessages((prev) => prev.filter((x) => x.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      showToast({ type: 'error', message: 'Failed to delete.', persistent: true });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <section className="page admin-section">
        <div className="container"><h2>Messages</h2><p>Loading…</p></div>
      </section>
    );
  }

  return (
    <section className="page admin-section admin-messages">
      <div className="container">
        <div className="admin-page-header">
          <h2>Messages</h2>
        </div>
        <div className="messages-layout">
          <div className="message-list">
            {messages.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`message-item ${!m.read_at ? 'unread' : ''} ${selected?.id === m.id ? 'active' : ''}`}
                onClick={() => handleSelect(m)}
              >
                <div className="message-item-name">{m.name}</div>
                <div className="message-item-subject">{m.subject || '(no subject)'}</div>
                <div className="message-item-date">{new Date(m.created_at).toLocaleString()}</div>
              </button>
            ))}
            {messages.length === 0 && (
              <div className="empty-state"><p>No messages.</p></div>
            )}
          </div>
          <div className="message-detail">
            {selected ? (
              <>
                <h3>{selected.subject || '(no subject)'}</h3>
                <p className="message-meta">
                  From: {selected.name} &lt;{selected.email}&gt; — {new Date(selected.created_at).toLocaleString()}
                </p>
                <p className="message-body">{selected.body}</p>
                <div className="modal-actions">
                  <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || '')}`} className="btn-submit">
                    Reply
                  </a>
                  <button type="button" className="btn-link" onClick={() => handleToggleRead(selected)}>
                    {selected.read_at ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button type="button" className="btn-link btn-delete" onClick={() => setDeleteId(selected.id)}>
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <p>Select a message to view details.</p>
            )}
          </div>
        </div>
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete message?</h3>
              <p>This cannot be undone.</p>
              <div className="modal-actions">
                <button type="button" className="btn-link" onClick={() => setDeleteId(null)}>Cancel</button>
                <button type="button" className="btn-submit btn-delete" onClick={() => handleDelete(deleteId)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
