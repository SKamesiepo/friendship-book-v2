// MainMenu.js
import React from 'react';

const MainMenu = ({ onSelect, player, sessionId, onQuitSession }) => {
  const handleWouldYouRatherClick = () => {
    const player1 = localStorage.getItem('player1');
    const player2 = localStorage.getItem('player2');

    if (!player1 || !player2) {
      alert('Waiting for another player to join the session.');
    } else {
      onSelect('wouldYouRather');
    }
  };

  return (
    <div>
      <h2>Friendship Book</h2>
      <button onClick={handleWouldYouRatherClick}>Would You Rather</button>
      <button onClick={() => onSelect('drawingBoard')}>Drawing Board</button>

      {/* Show "Quit Session" only for Player 1 */}
      {player === 'player1' && (
        <div>
          <button onClick={onQuitSession} style={{ marginTop: '20px', backgroundColor: 'red' }}>
            Quit Session
          </button>
          {/* Display session ID */}
          <p style={{ marginTop: '10px' }}>Session ID: <strong>{sessionId}</strong></p>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
