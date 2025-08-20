import React, { useState, useEffect, useRef } from 'react';
import './MainMenu.css';
import Inbox from './Inbox';
import SendMail from './SendMail';

export default function MainMenu({ currentUser }) {
  const [showInbox, setShowInbox] = useState(false);
  const [showSendMail, setShowSendMail] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const menuRef = useRef(null);

  // API base URL
  const API_BASE_URL = 'https://mail-system-api.nadhinanutshell.workers.dev/api';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load unread count on component mount and periodically
  useEffect(() => {
    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser.username]);

  // Load unread mail count
  const loadUnreadCount = async () => {
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
    }
  };

  // Handle menu toggle
  const handleMenuToggle = (menuType) => {
    setActiveMenu(activeMenu === menuType ? null : menuType);
  };

  // Handle inbox open
  const handleOpenInbox = () => {
    setShowInbox(true);
    setActiveMenu(null);
  };

  // Handle send mail open
  const handleOpenSendMail = () => {
    setShowSendMail(true);
    setActiveMenu(null);
  };

  // Handle inbox close
  const handleInboxClose = () => {
    setShowInbox(false);
    loadUnreadCount(); // Refresh unread count when inbox closes
  };

  // Handle send mail close
  const handleSendMailClose = () => {
    setShowSendMail(false);
  };

  // Handle mail sent (refresh unread count)
  const handleMailSent = (newMail) => {
    console.log('Mail sent:', newMail);
    // Optionally refresh unread count or show success message
  };

  // Get container class based on user
  const getContainerClass = () => {
    return currentUser.username === 'Q38' ? 'q38-main-container' : 'q09-main-container';
  };

  // Get instruction class based on user
  const getInstructionClass = () => {
    return currentUser.username === 'Q38' ? 'q38-instruction-paragraph' : 'q09-instruction-paragraph';
  };

  return (
    <div className={getContainerClass()}>
      <p className={getInstructionClass()}>
        Welcome {currentUser.name}! Click on different parts of the mailbox to access options.
      </p>
      
      <div className="mailbox-container" ref={menuRef}>
        {/* Mailbox Top */}
        <div className="mailbox-top hover-component">
          {/* No functionality for top section */}
        </div>
        
        {/* Mailbox Body */}
        <div className="mailbox-body">
          {/* Mail Slot */}
          <div 
            className="mail-slot hover-component"
            onClick={() => handleMenuToggle('slot')}
          >
            {activeMenu === 'slot' && (
              <div className="options-menu">
                <button 
                  className="option-button"
                  onClick={handleOpenSendMail}
                >
                  Send Mail
                </button>
              </div>
            )}
          </div>
          
          {/* Mail Section */}
          <div 
            className="mail-section hover-component"
            onClick={() => handleMenuToggle('section')}
          >
            <h2 className="mail-text">MAIL</h2>
            
            {/* Unread count indicator */}
            {unreadCount > 0 && (
              <div className="unread-badge">
                {unreadCount}
              </div>
            )}
            
            {activeMenu === 'section' && (
              <div className="options-menu">
                <button 
                  className="option-button"
                  onClick={handleOpenInbox}
                >
                  Open Inbox {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Components */}
      {showInbox && (
        <Inbox 
          currentUser={currentUser}
          onClose={handleInboxClose}
        />
      )}
      
      {showSendMail && (
        <SendMail 
          currentUser={currentUser}
          onClose={handleSendMailClose}
          onSend={handleMailSent}
        />
      )}
    </div>
  );
}