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
  const [errorMessage, setErrorMessage] = useState(''); // New state for errors

  const totalQuestions = questions.length;

  useEffect(() => {
    if (!sessionId) {
      console.error("Error: sessionId is undefined. Cannot fetch session data.");
      setErrorMessage("Session ID is missing. Please return to the main menu.");
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
          } = response.data;

          // Determine opponent's answers and finish state
          const opponentAnswers = name === response.data.player1 ? player2Answers : player1Answers;
          const opponentFinishedState = name === response.data.player1 ? player2Finished : player1Finished;

          setOpponentAnswers(opponentAnswers ? JSON.parse(opponentAnswers) : {});
          setOpponentFinished(!!opponentFinishedState);

          if (playerFinished && opponentFinishedState) {
            setGameOver(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
          setErrorMessage("Failed to fetch session data. Please check your connection.");
        });
    }, 1000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [name, sessionId, playerFinished]);

  const handleSelectOption = async (selectedOption) => {
    if (!sessionId) {
      console.error("Error: sessionId is undefined. Cannot submit answers.");
      setErrorMessage("Session ID is missing. Please return to the main menu.");
      return;
    }

    // Update player's answers
    const updatedAnswers = {
      ...playerAnswers,
      [questions[currentQuestionIndex].question]: selectedOption.text,
    };

    setPlayerAnswers(updatedAnswers);

    try {
      console.log("Submitting answers:", updatedAnswers);
      console.log("Session ID:", sessionId);
      console.log("Player Name:", name);

      // Submit the updated answers to the backend
      await axios.post(`${BASE_URL}/session/${sessionId}/answers`, {
        playerName: name,
        answers: updatedAnswers,
      });

      if (questionsAnswered + 1 === totalQuestions) {
        setPlayerFinished(true); // Mark player as finished

        console.log("Marking player as finished:", name);
        await axios.post(`${BASE_URL}/session/${sessionId}/finish`, {
          playerName: name,
        });
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionsAnswered(questionsAnswered + 1);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      setErrorMessage("Failed to submit answers. Please try again.");
    }
  };

  const handlePlayAgain = () => {
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setPlayerFinished(false);
    setOpponentFinished(false);
    setGameOver(false);
    setPlayerAnswers({});
    setErrorMessage('');
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
            <div
              className="emoji-option"
              onClick={() => handleSelectOption(leftOption)}
              title={leftOption.text}
            >
              <div>{leftOption.emoji}</div>
              <p>{leftOption.text}</p>
            </div>
            <div
              className="emoji-option"
              onClick={() => handleSelectOption(rightOption)}
              title={rightOption.text}
            >
              <div>{rightOption.emoji}</div>
              <p>{rightOption.text}</p>
            </div>
          </div>

          {questionsAnswered === totalQuestions && !playerFinished && (
            <button onClick={() => setPlayerFinished(true)}>Finish</button>
          )}

          {playerFinished && !gameOver && <p>Waiting for the other player to finish...</p>}
        </>
      )}
    </div>
  );
};

export default WouldYouRather;
