import React, { useState, useEffect } from 'react';
import './Inbox.css';

// Your Cloudflare Worker API URL
const API_BASE_URL = 'https://mail-system-api.nadhinanutshell.workers.dev/api';

export default function Inbox({ currentUser, onClose }) {
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);

  // Load mails on component mount or when the user changes
  useEffect(() => {
    loadMails();
  }, [currentUser.username]);

  // Load mails from API
  const loadMails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/mails/${currentUser.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load mails: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Sort mails by timestamp (newest first)
      const sortedMails = data.mails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setMails(sortedMails);
      
    } catch (error) {
      console.error('Error loading mails:', error);
      setError('Failed to load mails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mark a specific mail as read
  const markAsRead = async (mailId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mails/${mailId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.username
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark mail as read');
      }

      // Update local state to reflect the change
      setMails(prev => prev.map(mail => 
        mail.id === mailId ? { ...mail, isRead: true } : mail
      ));
      
    } catch (error) {
      console.error('Error marking mail as read:', error);
      // Optionally show user notification
    }
  };

  // Delete a specific mail after user confirmation
  const deleteMail = async (mailId) => {
    // Show the custom confirmation modal
    setShowConfirm(true);
    setConfirmCallback(() => async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mails/${mailId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.username
          })
        });

        if (!response.ok) {
          throw new Error('Failed to delete mail');
        }

        // Update local state and close detail view if the selected mail was deleted
        setMails(prev => prev.filter(mail => mail.id !== mailId));
        
        if (selectedMail && selectedMail.id === mailId) {
          setSelectedMail(null);
        }
        
      } catch (error) {
        console.error('Error deleting mail:', error);
        setError('Failed to delete mail. Please try again.');
      } finally {
        setShowConfirm(false);
        setConfirmCallback(null);
      }
    });
  };

  // Handle mail selection, marking it as read if it's new
  const handleMailSelect = (mail) => {
    setSelectedMail(mail);
    if (!mail.isRead) {
      markAsRead(mail.id);
    }
  };

  // Format the mail's timestamp into a readable string
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

  // Get a priority badge based on the mail's priority level
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
  
  // Custom Confirmation Modal Component
  const ConfirmationModal = () => (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <p>Are you sure you want to delete this mail?</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
          <button className="confirm-delete" onClick={confirmCallback}>Delete</button>
        </div>
      </div>
    </div>
  );

  // Display a loading spinner while fetching mails
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

  // Display error state
  if (error) {
    return (
      <div className="inbox-overlay">
        <div className="inbox-modal">
          <div className="inbox-header">
            <h2>Inbox</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          <div className="error-container">
            <p>{error}</p>
            <button onClick={loadMails} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-overlay">
      <div className="inbox-modal">
        {/* Header section with title and action buttons */}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222226" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/>
              </svg>
            </button>
            <button 
              className="close-button"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#222226" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
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
                  Back to Inbox
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
                  <h3>Your inbox is empty</h3>
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
      {showConfirm && <ConfirmationModal />}
    </div>
  );
}