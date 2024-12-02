import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config'; // Import the backend URL from a centralized config file

const MainMenu = ({ onSelect, player, sessionId, onQuitSession }) => {
  const [canStartGame, setCanStartGame] = useState(false);
  const [isPlayer1, setIsPlayer1] = useState(false);

  useEffect(() => {
    // Poll the backend to check if both players are present
    const interval = setInterval(() => {
      if (sessionId) {
        axios
          .get(`${BASE_URL}/session/${sessionId}`)
          .then((response) => {
            const { player1, player2 } = response.data;

            console.log("Checking for players...");
            console.log("Player 1:", player1);
            console.log("Player 2:", player2);

            // Enable game start only if both players are present
            setCanStartGame(!!(player1 && player2));

            // Identify if the current player is Player 1
            setIsPlayer1(player1 === player);
          })
          .catch((error) => {
            console.error('Error fetching session data:', error);
          });
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [player, sessionId]);

  const handleWouldYouRatherClick = () => {
    if (!canStartGame) {
      alert('Waiting for both players to join the session.');
      return;
    }
    // Start the game
    onSelect('wouldYouRather');
  };

  const handleDrawingBoardClick = () => {
    if (!canStartGame) {
      alert('Waiting for both players to join the session.');
      return;
    }
    // Start the drawing board game
    onSelect('drawingBoard');
  };

  return (
    <div>
      <h2>Friendship Book</h2>

      {/* Buttons to start games */}
      <button onClick={handleWouldYouRatherClick} disabled={!canStartGame}>
        Would You Rather
      </button>
      <button onClick={handleDrawingBoardClick} disabled={!canStartGame}>
        Drawing Board
      </button>

      {/* Quit Session Button and Session ID (visible for all players) */}
      <div>
        <button onClick={onQuitSession} style={{ marginTop: '20px', backgroundColor: 'red' }}>
          Quit Session
        </button>
        {sessionId && (
          <p style={{ marginTop: '10px' }}>
            Session ID: <strong>{sessionId}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
