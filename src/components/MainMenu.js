import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MainMenu = ({ onSelect, player, sessionId, onQuitSession }) => {
  const [canStartGame, setCanStartGame] = useState(false);
  const [isPlayer1, setIsPlayer1] = useState(false);

  // Ensure the session ID is displayed for Player 1
  useEffect(() => {
    // Polling the backend to check if both players are present
    const interval = setInterval(() => {
      if (sessionId) {
        axios.get(`http://localhost:5000/session/${sessionId}`)
          .then(response => {
            const { player1, player2 } = response.data;

            console.log("Checking for players...");
            console.log("Player 1:", player1);
            console.log("Player 2:", player2);

            // Enable starting the game only if both players exist in the session
            if (player1 && player2) {
              console.log("Both players detected. The game can start.");
              setCanStartGame(true);
            } else {
              console.log("Waiting for both players to join.");
              setCanStartGame(false);
            }

            // Identify if this is Player 1
            if (player1 === player) {
              setIsPlayer1(true);  // This is Player 1
            }
          })
          .catch(error => {
            console.error('Error fetching session data', error);
          });
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval); // Clean up on component unmount
  }, [player, sessionId]);

  const handleWouldYouRatherClick = () => {
    if (!canStartGame) {
      alert('Waiting for both players to join the session.');
      return;
    }
    // Start the game
    onSelect('wouldYouRather');
  };

  return (
    <div>
      <h2>Friendship Book</h2>
      <button onClick={handleWouldYouRatherClick} disabled={!canStartGame}>
        Would You Rather
      </button>
      <button onClick={() => onSelect('drawingBoard')}>Drawing Board</button>

      {/* Show "Quit Session" only for Player 1 */}
      {isPlayer1 && (
        <div>
          <button onClick={onQuitSession} style={{ marginTop: '20px', backgroundColor: 'red' }}>
            Quit Session
          </button>
          {/* Display session ID */}
          {sessionId && (
            <p style={{ marginTop: '10px' }}>Session ID: <strong>{sessionId}</strong></p>
          )}
        </div>
      )}
    </div>
  );
};

export default MainMenu;
