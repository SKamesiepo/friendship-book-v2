import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config'; // Import the backend URL from a centralized config file

const NameEntry = ({ setName, setSessionId, onContinue }) => {
  const [enteredName, setEnteredName] = useState('');
  const [sessionAction, setSessionAction] = useState('create');
  const [sessionCode, setSessionCode] = useState('');
  const [createdSessionId, setCreatedSessionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Create a session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setName(enteredName);

    try {
      // Generate a unique session ID
      const sessionId = `session_${Math.random().toString(36).substring(7)}`;
      await axios.post(`${BASE_URL}/session`, {
        sessionId,
        playerName: enteredName,
      });

      // Update state with session ID
      setCreatedSessionId(sessionId);
      setSessionId(sessionId);

      console.log(`Session created successfully: ${sessionId}`);

      // Proceed to the next screen
      onContinue();
    } catch (error) {
      console.error('Error creating session:', error);
      setErrorMessage('Failed to create session. Please try again.');
    }
  };

  // Join a session
  const handleJoinSession = async (e) => {
    e.preventDefault();
    setName(enteredName);

    try {
      await axios.post(`${BASE_URL}/session/join`, {
        sessionId: sessionCode,
        playerName: enteredName,
      });

      // Update state with session ID
      setSessionId(sessionCode);

      console.log(`Joined session successfully: ${sessionCode}`);

      // Proceed to the next screen
      onContinue();
    } catch (error) {
      console.error('Error joining session:', error);
      setErrorMessage('Failed to join session. Please check the session ID and try again.');
    }
  };

  return (
    <div>
      <h2>Enter Your Name</h2>
      <form>
        {/* Name Input */}
        <input
          type="text"
          value={enteredName}
          onChange={(e) => setEnteredName(e.target.value)}
          placeholder="Enter your name"
        />
        <div>
          {/* Radio Buttons for Session Action */}
          <label>
            <input
              type="radio"
              value="create"
              checked={sessionAction === 'create'}
              onChange={() => setSessionAction('create')}
            />
            Create Session
          </label>
          <label>
            <input
              type="radio"
              value="join"
              checked={sessionAction === 'join'}
              onChange={() => setSessionAction('join')}
            />
            Join Session
          </label>
        </div>

        {/* Session Code Input for Joining */}
        {sessionAction === 'join' && (
          <input
            type="text"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            placeholder="Enter session code"
          />
        )}

        {/* Submit Button */}
        <button onClick={sessionAction === 'create' ? handleCreateSession : handleJoinSession}>
          Continue
        </button>

        {/* Display Created Session ID */}
        {createdSessionId && sessionAction === 'create' && (
          <div>
            <p>Session ID: <strong>{createdSessionId}</strong></p>
            <p>Use this Session ID to join the session from another tab or device.</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default NameEntry;
