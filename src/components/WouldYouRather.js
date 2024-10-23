import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const questions = [
  { question: "Would you rather be invisible or fly?", leftOption: { text: "Invisible", emoji: "🕵️‍♂️" }, rightOption: { text: "Fly", emoji: "🦅" } },
  { question: "Would you rather be a superhero or a wizard?", leftOption: { text: "Superhero", emoji: "🦸‍♂️" }, rightOption: { text: "Wizard", emoji: "🧙‍♂️" } },
];

const WouldYouRather = ({ onQuit, name }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [opponentAnswers, setOpponentAnswers] = useState({});
  const [localPlayerKey, setLocalPlayerKey] = useState('');
  const [playerFinished, setPlayerFinished] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const totalQuestions = questions.length;

  // Get the sessionId from localStorage
  const sessionId = localStorage.getItem('sessionId');

  useEffect(() => {
    const player1Name = localStorage.getItem('player1');
    const player2Name = localStorage.getItem('player2');

    // Determine if the player is player1 or player2 based on localStorage
    if (player1Name === name) {
      setLocalPlayerKey('player1Answers');
    } else if (player2Name === name) {
      setLocalPlayerKey('player2Answers');
    }

    // Poll for opponent's answers and finish state every 1 second
    const interval = setInterval(() => {
      if (sessionId) {
        axios.get(`http://localhost:5000/session/${sessionId}`)
          .then((response) => {
            const { player1Answers, player2Answers, player1Finished, player2Finished } = response.data;

            const opponentKey = localPlayerKey === 'player1Answers' ? 'player2Answers' : 'player1Answers';
            setOpponentAnswers(response.data[opponentKey] || {});

            const opponentFinishedState = localPlayerKey === 'player1Answers' ? player2Finished : player1Finished;
            setOpponentFinished(opponentFinishedState);

            if (playerFinished && opponentFinishedState) {
              setGameOver(true);
            }
          })
          .catch((error) => {
            console.error('Error fetching session data', error);
            clearInterval(interval); // Stop polling if there's an error
          });
      } else {
        console.error('Session ID is missing');
        clearInterval(interval); // Stop polling if session ID is missing
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up on unmount
  }, [localPlayerKey, name, playerFinished, sessionId]);

  // Save the player's answer and submit to the backend
  const handleSelectOption = (selectedOption) => {
    const playerAnswers = JSON.parse(localStorage.getItem(localPlayerKey)) || {};
    playerAnswers[questions[currentQuestionIndex].question] = selectedOption.text;
    localStorage.setItem(localPlayerKey, JSON.stringify(playerAnswers)); // Save locally

    axios.post(`http://localhost:5000/session/${sessionId}/answers`, {
      playerName: name,
      answers: playerAnswers,
    }).catch(error => console.error('Error submitting answers:', error));

    if (questionsAnswered + 1 === totalQuestions) {
      setPlayerFinished(true); // Mark player as finished
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionsAnswered(questionsAnswered + 1);
    }
  };

  const handleFinish = () => {
    setPlayerFinished(true);
    localStorage.setItem(`${localPlayerKey.replace('Answers', 'Finished')}`, 'true');
  };

  const handlePlayAgain = () => {
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setPlayerFinished(false);
    setOpponentFinished(false);
    setGameOver(false);
    localStorage.removeItem('player1Answers');
    localStorage.removeItem('player2Answers');
    localStorage.removeItem('player1Finished');
    localStorage.removeItem('player2Finished');
  };

  const { leftOption, rightOption } = questions[currentQuestionIndex];
  const player1Name = localStorage.getItem('player1');
  const player2Name = localStorage.getItem('player2');
  const currentPlayerIsPlayer1 = localPlayerKey === 'player1Answers';

  return (
    <div className="would-you-rather-container">
      {gameOver ? (
        <div className="round-over-message">
          <h2>Round Over!</h2>
          <div className="results-container">
            <div className={`answer-card ${currentPlayerIsPlayer1 ? 'player2-card' : 'player1-card'}`}>
              <h3>{currentPlayerIsPlayer1 ? player2Name : player1Name}'s Answers:</h3>
              <ul>
                {Object.keys(opponentAnswers || {}).map((question) => (
                  <li key={question}>
                    <p>{question}</p>
                    {opponentAnswers[question]}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`answer-card ${currentPlayerIsPlayer1 ? 'player1-card' : 'player2-card'}`}>
              <h3>{currentPlayerIsPlayer1 ? player1Name : player2Name}'s Answers:</h3>
              <ul>
                {Object.keys(JSON.parse(localStorage.getItem(localPlayerKey)) || {}).map((question) => (
                  <li key={question}>
                    <p>{question}</p>
                    {JSON.parse(localStorage.getItem(localPlayerKey))[question]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button onClick={handlePlayAgain}>Play Again</button>
          <button onClick={onQuit}>Back to Main Menu</button>
        </div>
      ) : (
        <>
          <h2>Would You Rather?</h2>
          <p>{questions[currentQuestionIndex].question}</p>
          <div className="options-container">
            <div className="emoji-option" onClick={() => handleSelectOption(leftOption)} title={leftOption.text}>
              <div>{leftOption.emoji}</div>
              <p>{leftOption.text}</p>
            </div>
            <div className="emoji-option" onClick={() => handleSelectOption(rightOption)} title={rightOption.text}>
              <div>{rightOption.emoji}</div>
              <p>{rightOption.text}</p>
            </div>
          </div>

          {/* Show finish button if player has answered all questions */}
          {questionsAnswered === totalQuestions && !playerFinished && (
            <button onClick={handleFinish}>Finish</button>
          )}

          {/* Display waiting message if the player finished but the opponent has not */}
          {playerFinished && !gameOver && <p>Waiting for the other player to finish...</p>}
        </>
      )}
    </div>
  );
};

export default WouldYouRather;
