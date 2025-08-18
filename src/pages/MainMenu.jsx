import React from 'react';
import './MainMenu.css';

export default function MainMenu({ currentUser }) {
  // Checks the user with 'if' statements.
  if (currentUser.username === 'Q38') {
    return (
      // View for user Q38
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
            <div className="mail-slot"></div>
            {/* Mail Section */}
            <div className="mail-section">
              <h2 className="mail-text">MAIL</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
 
  else {
    return (
      // View for user Q09
      <div className="q09-main-container">
        <div className="instruction-text">
          {/* Write Up */}
          <p className="q09-instruction-paragraph">
            Hover on the mailbox to access different features.
          </p>
        </div>
        <div className="mailbox-container">
          {/* Mailbox Top (Curved) */}
          <div className="mailbox-top"></div>
         
          {/* Mailbox Body */}
          <div className="mailbox-body">
            {/* Mail Slot */}
            <div className="mail-slot"></div>
           
            {/* Mail Section */}
            <div className="mail-section">
              <h2 className="mail-text">MAIL</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
}