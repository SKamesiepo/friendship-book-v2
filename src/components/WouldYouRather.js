import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import '../App.css';

const questions = [
  { question: "Would you rather be invisible or fly?", leftOption: { text: "Invisible", emoji: "🕵️‍♂️" }, rightOption: { text: "Fly", emoji: "🦅" } },
  { question: "Would you rather be a superhero or a wizard?", leftOption: { text: "Superhero", emoji: "🦸‍♂️" }, rightOption: { text: "Wizard", emoji: "🧙‍♂️" } },
];

const WouldYouRather = ({ onQuit, name, sessionId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [opponentAnswers, setOpponentAnswers] = useState({});
  const [playerFinished, setPlayerFinished] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const totalQuestions = questions.length;

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage('Session ID is missing. Please return to the main menu.');
      console.error('Session ID is undefined. Cannot fetch session data.');
      return;
    }

    // Poll the backend for opponent's answers and finish state
    const interval = setInterval(() => {
      axios
        .get(`${BASE_URL}/session/${sessionId}`)
        .then((response) => {
          const {
            player1_answers: player1Answers,
            player2_answers: player2Answers,
            player1_finished: player1Finished,
            player2_finished: player2Finished,
            wyr_finished_count: finishedCount,
            gameOver: backendGameOver,
          } = response.data;

          console.log('Session state:', response.data);

          // Determine opponent's answers and finish state
          const opponentAnswers = name === response.data.player1 ? player2Answers : player1Answers;
          const opponentFinishedState = name === response.data.player1 ? player2Finished : player1Finished;

          setOpponentAnswers(opponentAnswers ? JSON.parse(opponentAnswers) : {});
          setOpponentFinished(!!opponentFinishedState);

          // If both players are finished, set gameOver to true
          if (finishedCount === 2 && backendGameOver) {
            console.log('Game Over: Both players have finished.');
            setGameOver(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching session data:', error);
          setErrorMessage(
            error.response?.data?.error || 'Failed to fetch session data. Please check your connection.'
          );
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [name, sessionId, playerFinished]);

  const handleSelectOption = (selectedOption) => {
    if (!sessionId) {
      setErrorMessage('Session ID is missing. Please return to the main menu.');
      console.error('Session ID is undefined. Cannot submit answers.');
      return;
    }

    const updatedAnswers = {
      ...playerAnswers,
      [questions[currentQuestionIndex].question]: selectedOption.text,
    };

    setPlayerAnswers(updatedAnswers);

    if (currentQuestionIndex + 1 === totalQuestions) {
      setPlayerFinished(true);

      console.log("Player finished all questions. Submitting answers to the backend.");
      console.log("Session ID:", sessionId);
      console.log("Player Name:", name);

      // Submit answers to the backend only when all questions are answered
      axios.post(`${BASE_URL}/session/${sessionId}/answers`, {
        playerName: name,
        answers: updatedAnswers,
      })
        .then(() => {
          console.log('Answers submitted successfully.');
        })
        .catch((error) => {
          console.error('Error submitting answers:', error);
          setErrorMessage(
            error.response?.data?.error || 'Failed to submit answers. Please try again.'
          );
        });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionsAnswered(questionsAnswered + 1);
    }
  };

  const handlePlayAgain = () => {
    axios
      .post(`${BASE_URL}/session/${sessionId}/reset`)
      .then(() => {
        setCurrentQuestionIndex(0);
        setQuestionsAnswered(0);
        setPlayerFinished(false);
        setOpponentFinished(false);
        setGameOver(false);
        setPlayerAnswers({});
        setErrorMessage('');
      })
      .catch((error) => {
        console.error('Error resetting the game:', error);
        setErrorMessage('Failed to reset the game. Please try again.');
      });
  };

  const { leftOption, rightOption } = questions[currentQuestionIndex];

  return (
    <div className="would-you-rather-container">
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {gameOver ? (
        <div className="round-over-message">
          <h2>Round Over!</h2>
          <div className="results-container">
            <div className="answer-card player-card">
              <h3>Your Answers:</h3>
              <ul>
                {Object.keys(playerAnswers).map((question) => (
                  <li key={question}>
                    <p>{question}</p>
                    {playerAnswers[question]}
                  </li>
                ))}
              </ul>
            </div>
            <div className="answer-card opponent-card">
              <h3>Opponent's Answers:</h3>
              <ul>
                {Object.keys(opponentAnswers).map((question) => (
                  <li key={question}>
                    <p>{question}</p>
                    {opponentAnswers[question]}
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
            <div className="emoji-option" onClick={() => handleSelectOption(leftOption)}>
              <div>{leftOption.emoji}</div>
              <p>{leftOption.text}</p>
            </div>
            <div className="emoji-option" onClick={() => handleSelectOption(rightOption)}>
              <div>{rightOption.emoji}</div>
              <p>{rightOption.text}</p>
            </div>
          </div>

          {playerFinished && !gameOver && <p>Waiting for the other player to finish...</p>}
        </>
      )}
    </div>
  );
};

export default WouldYouRather;
