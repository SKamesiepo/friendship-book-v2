// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NameEntry from './components/NameEntry';
import MainMenu from './components/MainMenu';
import WouldYouRather from './components/WouldYouRather';
import DrawingBoard from './components/DrawingBoard';
import './App.css';

function App() {
  const [name, setName] = useState(''); // State to store the user's name
  const [currentView, setCurrentView] = useState('nameEntry');

  const handleViewChange = (view) => {
    setCurrentView(view);
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
