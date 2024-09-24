// WouldYouRather.js
import React, { useState } from 'react';
import { db } from '../firebase'; // Import Firestore database instance
import { collection, addDoc } from 'firebase/firestore'; // Firestore functions for adding data
import '../App.css'; // Ensure your CSS is set up for styling the emojis

// Questions with associated left and right emojis
const questions = [
  {
    question: "Would you rather be invisible or fly?",
    leftOption: { text: "Invisible", emoji: "🕵️‍♂️" },
    rightOption: { text: "Fly", emoji: "🦅" },
  },
  {
    question: "Would you rather be a superhero or a wizard?",
    leftOption: { text: "Superhero", emoji: "🦸‍♂️" },
    rightOption: { text: "Wizard", emoji: "🧙‍♂️" },
  },
  {
    question: "Would you rather live in space or underwater?",
    leftOption: { text: "Space", emoji: "🚀" },
    rightOption: { text: "Underwater", emoji: "🐠" },
  },
  {
    question: "Would you rather have unlimited money or unlimited time?",
    leftOption: { text: "Money", emoji: "💰" },
    rightOption: { text: "Time", emoji: "⏳" },
  },
  {
    question: "Would you rather be able to talk to animals or speak every language?",
    leftOption: { text: "Talk to Animals", emoji: "🦜" },
    rightOption: { text: "Speak Every Language", emoji: "🗣️" },
  },
  {
    question: "Would you rather have no homework or no exams?",
    leftOption: { text: "No Homework", emoji: "📚" },
    rightOption: { text: "No Exams", emoji: "📝" },
  },
  {
    question: "Would you rather be the smartest person or the funniest?",
    leftOption: { text: "Smartest", emoji: "🧠" },
    rightOption: { text: "Funniest", emoji: "😂" },
  },
  {
    question: "Would you rather live without music or live without TV?",
    leftOption: { text: "No Music", emoji: "🎵" },
    rightOption: { text: "No TV", emoji: "📺" },
  },
  {
    question: "Would you rather have a personal robot or a personal jet?",
    leftOption: { text: "Robot", emoji: "🤖" },
    rightOption: { text: "Jet", emoji: "✈️" },
  },
  {
    question: "Would you rather have the ability to time travel or teleport?",
    leftOption: { text: "Time Travel", emoji: "⏰" },
    rightOption: { text: "Teleport", emoji: "🚀" },
  },
];

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="spinner">
    <div className="double-bounce1"></div>
    <div className="double-bounce2"></div>
  </div>
);

const WouldYouRather = ({ onQuit, name }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false); // State to manage loading animation
  const [questionsAnswered, setQuestionsAnswered] = useState(0); // Track the number of questions answered

  // Function to handle the emoji click, save to Firestore, and move to the next question
  const handleSelectOption = async (selectedOption) => {
    setLoading(true); // Show loading spinner
    try {
      await addDoc(collection(db, 'responses'), {
        name: name,
        question: questions[currentQuestionIndex].question,
        selectedOption: selectedOption.text,
        emoji: selectedOption.emoji,
        timestamp: new Date(),
      });
      handleNext(); // Move to the next question after saving the response
    } catch (error) {
      console.error('Error saving response to Firestore:', error); // Log the full error object
      alert(`Failed to save your response. Error: ${error.message}`);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Function to move to the next question
  const handleNext = () => {
    setQuestionsAnswered((prevCount) => prevCount + 1);
    if (questionsAnswered + 1 >= 10) {
      alert('Round complete!'); // Show a message when the round ends
      onQuit(); // End the round by calling the onQuit function
    } else {
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
    }
  };

  const { leftOption, rightOption } = questions[currentQuestionIndex];

  return (
    <div className="would-you-rather-container">
      <h2>Would You Rather?</h2>
      <p>{questions[currentQuestionIndex].question}</p>
      {loading ? (
        <LoadingSpinner /> // Show loading spinner while saving
      ) : (
        <div className="options-container">
          {/* Display left emoji option with text */}
          <div
            className="emoji-option"
            onClick={() => handleSelectOption(leftOption)}
            title={leftOption.text}
          >
            <div>{leftOption.emoji}</div>
            <p>{leftOption.text}</p> {/* Text label under emoji */}
          </div>
          {/* Display right emoji option with text */}
          <div
            className="emoji-option"
            onClick={() => handleSelectOption(rightOption)}
            title={rightOption.text}
          >
            <div>{rightOption.emoji}</div>
            <p>{rightOption.text}</p> {/* Text label under emoji */}
          </div>
        </div>
      )}
      <button onClick={handleNext}>Next</button>
      <button onClick={onQuit}>Quit</button>
    </div>
  );
};

export default WouldYouRather;
