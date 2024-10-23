import React, { useState } from 'react';
import axios from 'axios';

const NameEntry = ({ setName, setSessionId, onContinue }) => {
  const [enteredName, setEnteredName] = useState('');
  const [sessionAction, setSessionAction] = useState('create');
  const [sessionCode, setSessionCode] = useState('');
  const [createdSessionId, setCreatedSessionId] = useState('');

  // Create a session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setName(enteredName);

    try {
      const sessionId = `session_${Math.random().toString(36).substring(7)}`;
      const response = await axios.post('http://localhost:5000/session', {
        sessionId,
        playerName: enteredName,
      });

      setCreatedSessionId(sessionId); // Store session ID for UI display
      setSessionId(sessionId); // Set session ID for main menu
      localStorage.setItem('sessionId', sessionId); // Save in localStorage
      localStorage.setItem('player1', enteredName); // Store Player 1
      console.log(`Session ID created: ${sessionId}`); // Debugging output

      onContinue(); // Continue to main menu
    } catch (error) {
      console.error('Error creating session', error);
    }
  };

  // Join a session
  const handleJoinSession = async (e) => {
    e.preventDefault();
    setName(enteredName);

    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId || sessionId !== sessionCode) {
        alert('Session not found!');
        return;
      }

      const response = await axios.post('http://localhost:5000/session', {
        sessionId: sessionCode,
        playerName: enteredName,
      });

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      localStorage.setItem('player2', enteredName); // Store Player 2
      setSessionId(sessionCode); // Set session ID for main menu
      console.log(`Joined session with ID: ${sessionCode}`); // Debugging output

      onContinue(); // Continue to main menu
    } catch (error) {
      alert('Session not found or full!');
    }
  };

  return (
    <div>
      <h2>Enter Your Name</h2>
      <form>
        <input
          type="text"
          value={enteredName}
          onChange={(e) => setEnteredName(e.target.value)}
          placeholder="Enter your name"
        />
        <div>
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
        {sessionAction === 'join' && (
          <input
            type="text"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            placeholder="Enter session code"
          />
        )}
        <button onClick={sessionAction === 'create' ? handleCreateSession : handleJoinSession}>
          Continue
        </button>

        {/* Display the session ID after it is created */}
        {createdSessionId && (
          <div>
            <p>Session ID: <strong>{createdSessionId}</strong></p>
            <p>Use this Session ID to join the session from another tab or device.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default NameEntry;
