import React, { useState } from 'react';

const questions = [
  "Would you rather be invisible or fly?",
  "Would you rather be a superhero or a wizard?",
  "Would you rather live in space or underwater?",
  "Would you rather have unlimited money or unlimited time?",
  "Would you rather be able to talk to animals or speak every language?",
  "Would you rather have no homework or no exams?",
  "Would you rather be the smartest person in the world or the funniest?",
  "Would you rather live without music or live without TV?",
  "Would you rather have a personal robot or a personal jet?",
  "Would you rather have the ability to time travel or teleport?"
];

const WouldYouRather = ({ onQuit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNext = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length); // Move to the next question
  };

  return (
    <div>
      <h2>Would You Rather Question</h2>
      <p>{questions[currentQuestionIndex]}</p>
      <button onClick={handleNext}>Next</button>
      <button onClick={onQuit}>Quit</button>
    </div>
  );
};

export default WouldYouRather;
