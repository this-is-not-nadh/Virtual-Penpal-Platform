import React, { useState, useEffect } from 'react';
import './MainMenu.css';
import SendMail from './SendMail';
import Inbox from './Inbox';

// API configuration - replace with your Cloudflare Workers endpoint
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export default function MainMenu({ currentUser }) {
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [clickedComponent, setClickedComponent] = useState(null);
  const [showSendMail, setShowSendMail] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCheckingUnread, setIsCheckingUnread] = useState(false);

  useEffect(() => {
    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 10000); // Check every 10 seconds (reduced frequency for API calls)
    return () => clearInterval(interval);
  }, [currentUser.username]);

  // Check unread messages count via API
  const checkUnreadMessages = async () => {
    if (isCheckingUnread) return; // Prevent concurrent requests
    
    setIsCheckingUnread(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mails/${currentUser.username}/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('Failed to fetch unread count:', response.statusText);
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
      // Don't update unread count on error to avoid showing incorrect information
    } finally {
      setIsCheckingUnread(false);
    }
  };

  // Handle mouse enter for showing options
  const handleMouseEnter = (component) => {
    if (!clickedComponent) {
      setHoveredComponent(component);
    }
  };

  // Handle mouse leave for hiding options
  const handleMouseLeave = () => {
    if (!clickedComponent) {
      setHoveredComponent(null);
    }
  };

  // Handle click for showing/hiding options
  const handleClick = (component) => {
    if (clickedComponent === component) {
      // If same component is clicked, hide the menu
      setClickedComponent(null);
      setHoveredComponent(null);
    } else {
      // Show menu for clicked component
      setClickedComponent(component);
      setHoveredComponent(component);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clickedComponent && !event.target.closest('.hover-component')) {
        setClickedComponent(null);
        setHoveredComponent(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [clickedComponent]);

  // Handle option clicks
  const handleOptionClick = (action, component) => {
    console.log(`Action: ${action} on ${component}`);
    // Close the menu after selecting an option
    setClickedComponent(null);
    setHoveredComponent(null);

    switch(action) {
      case 'send':
        setShowSendMail(true);
        break;
      case 'check':
        setShowInbox(true);
        break;
    }
  };

  // Handle send mail success
  const handleSendMailSuccess = (mailData) => {
    console.log('Mail sent:', mailData);
    // Refresh unread count as it might affect the sender's view
    checkUnreadMessages();
  };

  // Handle close modals
  const handleCloseSendMail = () => {
    setShowSendMail(false);
  };

  const handleCloseInbox = () => {
    setShowInbox(false);
    // Refresh unread count after closing inbox
    checkUnreadMessages();
  };

  // Render options menu
  const renderOptionsMenu = (component) => {
    const isVisible = hoveredComponent === component || clickedComponent === component;
    if (!isVisible) return null;

    let options = [];
    
    switch(component) {
      case 'mail-slot':
        options = [
          { label: 'Send Mail', action: 'send' },
        ];
        break;
      case 'mail-section':
        options = [
          { label: 'Check Mail', action: 'check' },
        ];
        break;
    }

    return (
      <div className={`options-menu ${clickedComponent === component ? 'clicked' : ''}`}>
        {options.map((option, index) => (
          <button
            key={index}
            className="option-button"
            onClick={(e) => {
              e.stopPropagation();
              handleOptionClick(option.action, component);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  // Render unread notification badge
  const renderUnreadBadge = () => {
    if (unreadCount === 0) return null;
    
    return (
      <div className="unread-badge">
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
    );
  };

  // Checks the user with 'if' statements.
  if (currentUser.username === 'Q38') {
    return (
      <>
        {/* View for user Q38 */}
        <div className="q38-main-container">
          <div className="instruction-text">
            {/* Write Up */}
            <p className="q38-instruction-paragraph">
              Hover on the mailbox to access different features.
            </p>
          </div>
          <div className="mailbox-container">
            {/* Mailbox Curve */}
            <div className="mailbox-top"></div>
            
            {/* Mailbox Body */}
            <div className="mailbox-body">
              {/* Mail Slot */}
              <div 
                className="mail-slot hover-component"
                onMouseEnter={() => handleMouseEnter('mail-slot')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('mail-slot')}
              >
                {renderOptionsMenu('mail-slot')}
              </div>
              
              {/* Mail Section */}
              <div 
                className="mail-section hover-component"
                onMouseEnter={() => handleMouseEnter('mail-section')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('mail-section')}
              >
                <h2 className="mail-text">MAIL</h2>
                {renderUnreadBadge()}
                {renderOptionsMenu('mail-section')}
              </div>
              
              {renderOptionsMenu('mailbox-body')}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showSendMail && (
          <SendMail 
            currentUser={currentUser}
            onClose={handleCloseSendMail}
            onSend={handleSendMailSuccess}
          />
        )}
        
        {showInbox && (
          <Inbox 
            currentUser={currentUser}
            onClose={handleCloseInbox}
          />
        )}
      </>
    );
  }
 
  else {
    return (
      <>
        {/* View for user Q09 */}
        <div className="q09-main-container">
          <div className="instruction-text">
            {/* Write Up */}
            <p className="q09-instruction-paragraph">
              Hover on the mailbox to access different features.
            </p>
          </div>
          <div className="mailbox-container">
            {/* Mailbox Curve */}
            <div className="mailbox-top"></div>
            
            {/* Mailbox Body */}
            <div className="mailbox-body">
              {/* Mail Slot */}
              <div 
                className="mail-slot hover-component"
                onMouseEnter={() => handleMouseEnter('mail-slot')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('mail-slot')}
              >
                {renderOptionsMenu('mail-slot')}
              </div>
              
              {/* Mail Section */}
              <div 
                className="mail-section hover-component"
                onMouseEnter={() => handleMouseEnter('mail-section')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick('mail-section')}
              >
                <h2 className="mail-text">MAIL</h2>
                {renderUnreadBadge()}
                {renderOptionsMenu('mail-section')}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showSendMail && (
          <SendMail 
            currentUser={currentUser}
            onClose={handleCloseSendMail}
            onSend={handleSendMailSuccess}
          />
        )}
        
        {showInbox && (
          <Inbox 
            currentUser={currentUser}
            onClose={handleCloseInbox}
          />
        )}
      </>
    );
  }
}