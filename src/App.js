import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NameEntry from './components/NameEntry';
import MainMenu from './components/MainMenu';
import WouldYouRather from './components/WouldYouRather';
import DrawingBoard from './components/DrawingBoard';
import './App.css';

function App() {
  const [name, setName] = useState(''); // State to store the user's name
  const [currentView, setCurrentView] = useState('nameEntry'); // Default view

  // Load saved session from localStorage when the component mounts
  useEffect(() => {
    const savedName = localStorage.getItem('name');
    const savedView = localStorage.getItem('currentView');

    if (savedName) {
      setName(savedName); // Restore the name from localStorage
    }
    if (savedView) {
      setCurrentView(savedView); // Restore the view from localStorage
    }
  }, []);

  // Save name and view to localStorage when they change
  useEffect(() => {
    localStorage.setItem('name', name); // Save name to localStorage
  }, [name]);

  useEffect(() => {
    localStorage.setItem('currentView', currentView); // Save view to localStorage
  }, [currentView]);

  const handleViewChange = (view) => {
    setCurrentView(view); // Change the view
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {currentView === 'nameEntry' && (
                  <NameEntry setName={setName} onContinue={() => setCurrentView('mainMenu')} />
                )}
                {currentView === 'mainMenu' && <MainMenu onSelect={handleViewChange} />}
                {currentView === 'wouldYouRather' && (
                  <WouldYouRather onQuit={() => setCurrentView('mainMenu')} name={name} />
                )}
                {currentView === 'drawingBoard' && (
                  <DrawingBoard onQuit={() => setCurrentView('mainMenu')} name={name} />
                )}
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
