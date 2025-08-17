import { useState } from 'react';
import './App.css';

// The main App component handles the state of the landing page,
// switching between the initial message, the login form, and the logged-in view.
export default function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Forces the user to log in every single time

  // This function is called when the "I have the password!" button is clicked.
  function handleButtonClick() {
    setShowLoginForm(true);
  }

  // This function is called by the LoginForm component upon successful login.
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Conditionally render the appropriate view based on the app's state.
  return (
    <div className="main-container">
      {/* Container for the content, centered on the page. */}
      <div className="card-container">
        {isLoggedIn ? (
          // If the user is logged in, bring them to the main content
          <LoggedInView />
        ) : showLoginForm ? (
          // If the login form is requested, show it.
          // The onLoginSuccess prop is passed here.
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          // Otherwise, show the initial message.
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
function LoginForm({ onLoginSuccess }) {
  // State variables for the username, password, and error messages.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Hardcoded credentials (placeholder for now; might be permanent if I'm lazy to set up the necessary security protocols)
  const validCredentials = [
    { username: 'Q38', password: 'Sunshine' },
    { username: 'Q09', password: 'Moonlight' }
  ];

  // Handles the login button click.
  const handleLogin = (e) => {
    e.preventDefault(); // Prevents the default form submission behavior.

    // Check if the entered credentials match the hardcoded values.
    const isValid = validCredentials.some(
      (credential) => credential.username === username && credential.password === password
    );

    if (isValid) {
      onLoginSuccess();
    } else {
      setErrorMessage('Haha nice try, buddy!');
    }
  };

  return (
    <form className="content-card-left animate-fadeIn" onSubmit={handleLogin}>
      <h2 className="card-heading">
        We'll see about that.
      </h2>
      <p className="card-paragraph">
        Enter your username & password.
      </p>
      <input
        type="text"
        placeholder="Username"
        className="input-field"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Username"
      />
      <input
        type="password"
        placeholder="Password"
        className="input-field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
      />
      {/* Display error message if wrong credentials */}
      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}
      <div className="centered-button">
        <button
          type="submit"
          className="login-button"
        >
          Login
        </button>
      </div>
    </form>
  );
}


// Logged In Placeholder
function LoggedInView() {
  return (
    <div className="content-card-left animate-fadeIn">
      <h2 className="card-heading">
        Welcome, friend.
      </h2>
      <p className="card-paragraph">
        You've found the secret part of the website! There's not much here yet, but you're in.
      </p>
    </div>
  );
}
