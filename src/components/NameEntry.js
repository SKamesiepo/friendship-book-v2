import React, { useState } from 'react';
import '../App.css'; 

const NameEntry = ({ setName, onContinue }) => {
  const [enteredName, setEnteredName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setName(enteredName); // Pass the name up to App.js
    onContinue(); // Move to the next view
  };

  return (
    <div>
      <h2>Enter Your Name Please</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={enteredName}
          onChange={(e) => setEnteredName(e.target.value)}
          placeholder="Enter your name"
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default NameEntry;
