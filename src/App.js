import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NameEntry from './components/NameEntry';
import MainMenu from './components/MainMenu';
import WouldYouRather from './components/WouldYouRather';
import DrawingBoard from './components/DrawingBoard';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [currentView, setCurrentView] = useState('nameEntry');
  const [sessionId, setSessionId] = useState('');

  // Effect to check session on page load and restore the name and session
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    const storedName = localStorage.getItem('player1') || localStorage.getItem('player2');
    
    if (storedSessionId && storedName) {
      setName(storedName);
      setSessionId(storedSessionId);
      setCurrentView('mainMenu');
    } else {
      setCurrentView('nameEntry');
    }
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleQuitSession = () => {
    // Clear session and player data
    localStorage.removeItem('sessionId');
    localStorage.removeItem('player1');
    localStorage.removeItem('player2');
    localStorage.removeItem('player1Answers');
    localStorage.removeItem('player2Answers');
    setCurrentView('nameEntry');
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
                  <NameEntry setName={setName} setSessionId={setSessionId} onContinue={() => setCurrentView('mainMenu')} />
                )}
                {currentView === 'mainMenu' && (
                  <MainMenu
                    onSelect={handleViewChange}
                    player={localStorage.getItem('player1') === name ? 'player1' : 'player2'}
                    sessionId={sessionId} // Pass sessionId to be displayed
                    onQuitSession={handleQuitSession}
                  />
                )}
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
