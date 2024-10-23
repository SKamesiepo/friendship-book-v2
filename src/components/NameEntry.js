// NameEntry.js
import React, { useState } from 'react';

const NameEntry = ({ setName, setSessionId, onContinue }) => {
  const [enteredName, setEnteredName] = useState('');
  const [sessionAction, setSessionAction] = useState('create');
  const [sessionCode, setSessionCode] = useState('');
  const [createdSessionId, setCreatedSessionId] = useState('');

  const handleCreateSession = (e) => {
    e.preventDefault();
    setName(enteredName);

    const sessionId = `session_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('player1', enteredName);

    setCreatedSessionId(sessionId);
    setSessionId(sessionId);
    onContinue();
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    setName(enteredName);

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId || sessionId !== sessionCode) {
      alert('Session not found!');
      return;
    }

    if (localStorage.getItem('player2')) {
      alert('Session is full!');
      return;
    }

    localStorage.setItem('player2', enteredName);
    onContinue();
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
