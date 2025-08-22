import { useState } from 'react';
import './App.css';
import MainMenu from './pages/MainMenu.jsx';

// The main App component handles the state of the landing page,
export default function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // This function is called when the "I have the password!" button is clicked.
  const handleButtonClick = () => {
    setShowLoginForm(true);
  };

  // This function is called by the LoginForm component upon successful login.
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  // This function logs the user out by resetting the state.
  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginForm(false);
  };

  // Conditionally render the appropriate view based on the app's state.
  return (
    <>
      {currentUser ? (
        // If a user is logged in, show the MainMenu and pass the user object as a prop.
        <MainMenu currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        // Otherwise, show the initial message or login form inside the containers.
        <div className="main-container">
          <div className="card-container">
            {showLoginForm ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            ) : (
              <InitialMessage onButtonClick={handleButtonClick} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// InitialMessage component displays the message and the button to show the login form.
function InitialMessage({ onButtonClick }) {
  return (
    <div className="content-card-left animate-fadeIn">
      <div className="centered-icon">
        {/* SVG for the warning icon */}
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

  // Hardcoded credentials (placeholder for now; might be permanent if I'm lazy)
  const validCredentials = [
    { username: 'Q38', password: 'Sunshine', name: 'Nate' },
    { username: 'Q09', password: 'Moonlight', name: 'Nadh'}
  ];

  // Handles the login button click.
  const handleLogin = (e) => {
    e.preventDefault(); // Prevents the default form submission behavior.

    // Find the matching user in the array.
    const user = validCredentials.find(
      (credential) => credential.username === username && credential.password === password
    );

    if (user) {
      // Pass the found user object to the parent function.
      onLoginSuccess(user);
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
