import React, { useState, useEffect } from 'react';
import './Inbox.css';

// System currently only works on local machine for UI testing purposes & testing.
// You need to rewrite this code for Cloudflare deployment
export default function Inbox({ currentUser, onClose }) {
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load mails on component mount
  useEffect(() => {
    loadMails();
  }, [currentUser.username]);

  // Load mails from localStorage
  const loadMails = () => {
    setLoading(true);
    try {
      const allMails = JSON.parse(localStorage.getItem('mailbox_messages') || '[]');
      
      // Filter mails for current user
      const userMails = allMails
        .filter(mail => mail.to === currentUser.username)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setMails(userMails);
    } catch (error) {
      console.error('Error loading mails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark mail as read
  const markAsRead = (mailId) => {
    try {
      const allMails = JSON.parse(localStorage.getItem('mailbox_messages') || '[]');
      const updatedMails = allMails.map(mail => 
        mail.id === mailId ? { ...mail, isRead: true } : mail
      );
      
      localStorage.setItem('mailbox_messages', JSON.stringify(updatedMails));
      
      // Update local state
      setMails(prev => prev.map(mail => 
        mail.id === mailId ? { ...mail, isRead: true } : mail
      ));
    } catch (error) {
      console.error('Error marking mail as read:', error);
    }
  };

  // Delete mail
  const deleteMail = (mailId) => {
    if (window.confirm('Are you sure you want to delete this mail?')) {
      try {
        const allMails = JSON.parse(localStorage.getItem('mailbox_messages') || '[]');
        const updatedMails = allMails.filter(mail => mail.id !== mailId);
        
        localStorage.setItem('mailbox_messages', JSON.stringify(updatedMails));
        
        // Update local state
        setMails(prev => prev.filter(mail => mail.id !== mailId));
        
        // Close selected mail if it was deleted
        if (selectedMail && selectedMail.id === mailId) {
          setSelectedMail(null);
        }
      } catch (error) {
        console.error('Error deleting mail:', error);
      }
    }
  };

  // Handle mail selection
  const handleMailSelect = (mail) => {
    setSelectedMail(mail);
    if (!mail.isRead) {
      markAsRead(mail.id);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const badges = {
      low: { color: '#28a745', text: 'LOW' },
      normal: { color: '#6c757d', text: 'NORMAL' },
      high: { color: '#fd7e14', text: 'HIGH' },
      urgent: { color: '#dc3545', text: 'URGENT' }
    };
    
    const badge = badges[priority] || badges.normal;
    return (
      <span 
        className="priority-badge" 
        style={{ backgroundColor: badge.color }}
      >
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="inbox-overlay">
        <div className="inbox-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading inbox...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-overlay">
      <div className="inbox-modal">
        {/* Header */}
        <div className="inbox-header">
          <h2>
            Inbox ({mails.filter(mail => !mail.isRead).length} unread)
          </h2>
          <div className="inbox-actions">
            <button 
              className="refresh-button"
              onClick={loadMails}
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/>
              </svg>
            </button>
            <button 
              className="close-button"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="inbox-content">
          {selectedMail ? (
            /* Mail Detail View */
            <div className="mail-detail">
              <div className="mail-detail-header">
                <button 
                  className="back-button"
                  onClick={() => setSelectedMail(null)}
                >
                  ← Back to Inbox
                </button>
                <button 
                  className="delete-button"
                  onClick={() => deleteMail(selectedMail.id)}
                >
                    Delete
                </button>
              </div>

              <div className="mail-detail-content">
                <div className="mail-meta">
                  <h3>{selectedMail.subject}</h3>
                  <div className="mail-info">
                    <span><strong>From:</strong> {selectedMail.from}</span>
                    <span><strong>Time:</strong> {formatTimestamp(selectedMail.timestamp)}</span>
                    {getPriorityBadge(selectedMail.priority)}
                  </div>
                </div>
                
                <div className="mail-body">
                  {selectedMail.message}
                </div>
              </div>
            </div>
          ) : (
            /* Mail List View */
            <div className="mail-list">
              {mails.length === 0 ? (
                <div className="empty-inbox">
                  <h3>📭 Your inbox is empty</h3>
                  <p>No messages to display.</p>
                </div>
              ) : (
                mails.map(mail => (
                  <div
                    key={mail.id}
                    className={`mail-item ${!mail.isRead ? 'unread' : ''}`}
                    onClick={() => handleMailSelect(mail)}
                  >
                    <div className="mail-item-header">
                      <span className="mail-from">{mail.from}</span>
                      <span className="mail-time">{formatTimestamp(mail.timestamp)}</span>
                    </div>
                    
                    <div className="mail-item-subject">
                      {mail.subject}
                      {getPriorityBadge(mail.priority)}
                    </div>
                    
                    <div className="mail-item-preview">
                      {mail.message.substring(0, 100)}
                      {mail.message.length > 100 ? '...' : ''}
                    </div>
                    
                    {!mail.isRead && <div className="unread-indicator"></div>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}