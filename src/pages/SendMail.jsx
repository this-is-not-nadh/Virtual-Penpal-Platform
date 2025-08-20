import React, { useState, useEffect } from 'react';
import './SendMail.css';

// API configuration - replace with your Cloudflare Workers endpoint
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export default function SendMail({ currentUser, onClose, onSend }) {
  const [mailData, setMailData] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load available users on component mount
  useEffect(() => {
    loadAvailableUsers();
  }, [currentUser.username]);

  // Load available users from API
  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      
      // Filter out current user from the list
      const filteredUsers = data.users.filter(user => user.username !== currentUser.username);
      setAvailableUsers(filteredUsers);
      
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to hardcoded users if API fails
      setAvailableUsers([
        { username: 'Q38', name: 'Nate' },
        { username: 'Q09', name: 'Nadh' }
      ].filter(user => user.username !== currentUser.username));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setMailData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!mailData.recipient.trim()) {
      newErrors.recipient = 'Recipient is required';
    }
    
    if (!mailData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!mailData.message.trim()) {
      newErrors.message = 'Message cannot be empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle send mail
  const handleSendMail = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Create mail object
      const mailObject = {
        from: currentUser.username,
        to: mailData.recipient,
        subject: mailData.subject,
        message: mailData.message,
        priority: mailData.priority,
      };
      
      // Send mail via API
      const response = await fetch(`${API_BASE_URL}/mails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailObject)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send mail');
      }

      const result = await response.json();
      
      console.log('Mail sent successfully:', result);
      
      // Call parent component's send handler if provided
      if (onSend) {
        onSend(result.mail);
      }
      
      // Reset form
      setMailData({
        recipient: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
      
      // Show success message
      alert('Mail sent successfully!');
      
      // Close modal
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Failed to send mail:', error);
      setErrors({ general: error.message || 'Failed to send mail. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="send-mail-overlay">
      <div className="send-mail-modal">
        {/* Header */}
        <div className="send-mail-header">
          <h2>Compose Mail</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="send-mail-form">
          {/* General Error */}
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          {/* Recipient */}
          <div className="form-group">
            <label htmlFor="recipient">To:</label>
            {loadingUsers ? (
              <div className="loading-users">Loading users...</div>
            ) : (
              <select
                id="recipient"
                value={mailData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                className={errors.recipient ? 'error' : ''}
                disabled={isLoading}
              >
                <option value="">Select recipient</option>
                {availableUsers.map(user => (
                  <option key={user.username} value={user.username}>
                    {user.username} ({user.name})
                  </option>
                ))}
              </select>
            )}
            {errors.recipient && (
              <span className="error-message">{errors.recipient}</span>
            )}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label htmlFor="priority">Priority:</label>
            <select
              id="priority"
              value={mailData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              disabled={isLoading}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input
              id="subject"
              type="text"
              value={mailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Enter subject"
              className={errors.subject ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.subject && (
              <span className="error-message">{errors.subject}</span>
            )}
          </div>

          {/* Message */}
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              value={mailData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Type your message here..."
              rows="8"
              className={errors.message ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.message && (
              <span className="error-message">{errors.message}</span>
            )}
          </div>

          {/* Character count */}
          <div className="character-count">
            {mailData.message.length} characters
          </div>

          {/* Action buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="send-button"
              onClick={handleSendMail}
              disabled={isLoading || loadingUsers}
            >
              {isLoading ? (
                <span>
                  <span className="loading-spinner"></span>
                  Sending...
                </span>
              ) : (
                'Send Mail'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}