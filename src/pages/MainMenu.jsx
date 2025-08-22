import React, { useState, useEffect } from 'react';
import './MainMenu.css';
import Inbox from './Inbox';
import SendMail from './SendMail';

// Cloudflare Worker API URL
const API_BASE_URL = 'https://mail-system-api.nadhinanutshell.workers.dev/api';

// This component now accepts currentUser and onLogout as props from App.jsx
export default function MainMenu({ currentUser, onLogout }) {
  // All login-related state and functions have been removed
  // The component now relies on the currentUser prop from App.jsx
  const [showInbox, setShowInbox] = useState(false);
  const [showSendMail, setShowSendMail] = useState(false);
  const [showSlotOptions, setShowSlotOptions] = useState(false);
  const [showMailOptions, setShowMailOptions] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load unread count when user changes
  useEffect(() => {
    // Check if a user is logged in before fetching data
    if (currentUser) {
      loadUnreadCount();
      // Set up interval to refresh unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Load unread mail count
  const loadUnreadCount = async () => {
    // This check is redundant now but good practice
    if (!currentUser) return; 
    
    try {
      const response = await fetch(`${API_BASE_URL}/mails/${currentUser.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const unread = data.mails.filter(mail => !mail.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
      // Silently fail for unread count
    }
  };

  // Handle mail slot click
  const handleSlotClick = () => {
    setShowSlotOptions(!showSlotOptions);
    setShowMailOptions(false);
  };

  // Handle mail section click
  const handleMailClick = () => {
    setShowMailOptions(!showMailOptions);
    setShowSlotOptions(false);
  };

  // Handle opening inbox
  const handleOpenInbox = () => {
    setShowInbox(true);
    setShowSlotOptions(false);
    setShowMailOptions(false);
  };

  // Handle opening send mail
  const handleOpenSendMail = () => {
    setShowSendMail(true);
    setShowSlotOptions(false);
    setShowMailOptions(false);
  };

  // Handle closing inbox
  const handleCloseInbox = () => {
    setShowInbox(false);
    loadUnreadCount(); // Refresh unread count when closing inbox
  };

  // Handle closing send mail
  const handleCloseSendMail = () => {
    setShowSendMail(false);
  };

  // Handle mail sent successfully
  const handleMailSent = (sentMail) => {
    console.log('Mail sent:', sentMail);
    loadUnreadCount();
  };

  // Handle clicking outside to close options
  const handleClickOutside = () => {
    setShowSlotOptions(false);
    setShowMailOptions(false);
  };

  // Get container class based on user
  const getContainerClass = () => {
    // Check the username directly to determine the theme
    if (!currentUser) return 'q38-main-container';
    return currentUser.username === 'Q09' ? 'q09-main-container' : 'q38-main-container';
  };

  // Get instruction class based on user
  const getInstructionClass = () => {
    // Use the currentUser prop to determine the theme
    if (!currentUser) return 'q38-instruction-paragraph';
    return currentUser.username === 'Q09' ? 'q09-instruction-paragraph' : 'q38-instruction-paragraph';
  };

  // Get user-specific welcome message
  const getWelcomeMessage = () => {
    if (!currentUser) return '';
    
    if (currentUser.username === 'Q09') {
      return `Welcome back, ${currentUser.name}! Click on different parts of the mailbox to access your mail system.`;
    } else {
      return `Welcome back, ${currentUser.name}! Click on different parts of the mailbox to access your mail system.`;
    }
  };

  // The loading screen is now only relevant if we are fetching data
  if (loading) {
    return (
      <div className={getContainerClass()}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className={getInstructionClass()}>Loading...</p>
        </div>
      </div>
    );
  }

  // The main application screen is only rendered if a user is logged in
  if (!currentUser) {
    return null; // Don't render anything if no user is logged in
  }

  return (
    <div className={getContainerClass()} onClick={handleClickOutside}>
      <p className={getInstructionClass()}>
        {getWelcomeMessage()}
      </p>

      <div className="mailbox-container">
        {/* Mailbox top (curved dome) */}
        <div className="mailbox-top no-hover"></div>
        {/* Mailbox body */}
        <div className="mailbox-body">
          {/* Mail slot - for composing/sending mail */}
          <div 
            className="mail-slot hover-component" 
            onClick={(e) => {
              e.stopPropagation();
              handleSlotClick();
            }}
          >
            {showSlotOptions && (
              <div className="options-menu">
                <button 
                  className="option-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSendMail();
                  }}
                >
                  Compose Mail
                </button>
              </div>
            )}
          </div>

          {/* Mail section - for viewing inbox */}
          <div 
            className="mail-section hover-component"
            onClick={(e) => {
              e.stopPropagation();
              handleMailClick();
            }}
          >
            <h3 className="mail-text">
              MAIL
              {unreadCount > 0 && (
                <span className="unread-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </h3>
            {showMailOptions && (
              <div className="options-menu">
                <button 
                  className="option-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenInbox();
                  }}
                >
                  View Inbox ({unreadCount} unread)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render modals */}
      {showInbox && (
        <Inbox 
          currentUser={currentUser} 
          onClose={handleCloseInbox} 
        />
      )}

      {showSendMail && (
        <SendMail 
          currentUser={currentUser} 
          onClose={handleCloseSendMail}
          onSend={handleMailSent}
        />
      )}
    </div>
  );
}
