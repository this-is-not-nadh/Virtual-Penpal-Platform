    import './App.css';
    import { useState } from 'react';

// The main App component handles the state of the landing page,
// switching between the initial message and the login form.
export default function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);

  // This function is called when the "I have the password!" button is clicked.
  const handleButtonClick = () => {
    setShowLoginForm(true);
  };

  return (
    <div className="main-container">
      {/* Container for the content, centered on the page. */}
      <div className="card-container">
        {/*
          Conditionally render either the initial message card or the login form card.
          The transition from one to the other is a simple fade.
        */}
        {showLoginForm ? (
          <LoginForm />
        ) : (
          <InitialMessage onButtonClick={handleButtonClick} />
        )}
      </div>
    </div>
  );
}

// InitialMessage component displays the message and the button to show the login form.
function InitialMessage({ onButtonClick }) {
  return (
    <div className="content-card-left">
      <div className="centered-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.94 3.374h14.71c1.723 0 2.806-1.874 1.94-3.374L14.059 4.868c-.767-1.332-2.65-1.332-3.417 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="card-heading">
        You're accessing a very personal part of my website.
      </h2>
      <p className="card-paragraph">
        There really isn't much for you here unless you have the password to access this part of the site.
      </p>
      <div className="centered-button">
        <button
          onClick={onButtonClick}
          className="message-button"
        >
          I have the password!
        </button>
      </div>
    </div>
  );
}

// LoginForm component for the username and password inputs.
function LoginForm() {
  return (
    <div className="content-card-left">
      <h2 className="card-heading">
        We'll see about that.
      </h2>
      <p className="card-paragraph">
        Enter your username & password.
      </p>
      <input
        type="text"
        placeholder="Username"
        className="input-field mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        className="input-field mb-6"
      />
      <div className="centered-button">
        <button
          type="submit"
          className="login-button"
        >
          Login
        </button>
      </div>
    </div>
  );
}
