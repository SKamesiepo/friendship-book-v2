// WouldYouRather.js
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const player1Name = localStorage.getItem('player1');
    const player2Name = localStorage.getItem('player2');

    if (player1Name === name) {
      setLocalPlayerKey('player1Answers');
    } else if (player2Name === name) {
      setLocalPlayerKey('player2Answers');
    }

    const interval = setInterval(() => {
      const opponentKey = localPlayerKey === 'player1Answers' ? 'player2Answers' : 'player1Answers';
      const storedOpponentAnswers = JSON.parse(localStorage.getItem(opponentKey)) || {};
      setOpponentAnswers(storedOpponentAnswers);

      const opponentFinishKey = localPlayerKey === 'player1Answers' ? 'player2Finished' : 'player1Finished';
      const isOpponentFinished = localStorage.getItem(opponentFinishKey) === 'true';
      setOpponentFinished(isOpponentFinished);

      if (playerFinished && isOpponentFinished) {
        setGameOver(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [localPlayerKey, name, playerFinished]);

  const handleSelectOption = (selectedOption) => {
    const playerAnswers = JSON.parse(localStorage.getItem(localPlayerKey)) || {};
    playerAnswers[questions[currentQuestionIndex].question] = selectedOption.text;
    localStorage.setItem(localPlayerKey, JSON.stringify(playerAnswers));

    if (questionsAnswered + 1 === totalQuestions) {
      setPlayerFinished(true);
      localStorage.setItem(`${localPlayerKey.replace('Answers', 'Finished')}`, 'true');
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
          {questionsAnswered === totalQuestions && !playerFinished && (
            <button onClick={handleFinish}>Finish</button>
          )}
          {playerFinished && !gameOver && <p>Waiting for the other player to finish...</p>}
        </>
      )}
    </div>
  );
};

export default WouldYouRather;
