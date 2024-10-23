// DrawingBoard.js
import React, { useRef, useState, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import '../App.css';
import axios from 'axios';

const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#FF8F33", "#8F33FF"]; // 6 preset colors for kids

const DrawingBoard = ({ onQuit, name }) => {
  const canvasRef = useRef(null);
  const [drawingFinished, setDrawingFinished] = useState(false);
  const [opponentDrawingFinished, setOpponentDrawingFinished] = useState(false);
  const [brushSize, setBrushSize] = useState(12);
  const [brushColor, setBrushColor] = useState("#444"); // Default brush color
  const [opponentDrawing, setOpponentDrawing] = useState(null);

  const sessionId = localStorage.getItem('sessionId');
  const isPlayer1 = localStorage.getItem('player1') === name;

  useEffect(() => {
    const interval = setInterval(() => {
      // Poll opponent's drawing and check if they have finished
      if (sessionId) {
        axios.get(`http://localhost:5000/session/${sessionId}/drawing`)
          .then((response) => {
            const opponentData = isPlayer1 ? response.data.player2Drawing : response.data.player1Drawing;
            const opponentFinished = isPlayer1 ? response.data.player2Finished : response.data.player1Finished;

            if (opponentFinished) {
              setOpponentDrawingFinished(true);
              setOpponentDrawing(opponentData);
            }
          })
          .catch((error) => {
            console.error("Error fetching opponent drawing", error);
          });
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [sessionId, isPlayer1]);

  const handleFinish = () => {
    setDrawingFinished(true);

    // Save the drawing data to the backend
    const drawingData = canvasRef.current.getSaveData();
    axios.post(`http://localhost:5000/session/${sessionId}/drawing`, {
      playerName: name,
      drawingData,
      finished: true,
    }).catch(error => {
      console.error("Error submitting drawing:", error);
    });
  };

  const handleUndo = () => {
    canvasRef.current.undo();
  };

  const handleBrushSizeChange = (e) => {
    setBrushSize(e.target.value);
  };

  const handleColorChange = (color) => {
    setBrushColor(color);
  };

  return (
    <div className="drawing-board-container">
      <h2>Your Drawing Board</h2>

      <div className="options">
        {/* Color options */}
        <div className="color-options">
          {colors.map((color) => (
            <button
              key={color}
              className="color-button"
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            ></button>
          ))}
        </div>

        {/* Brush size slider */}
        <input
          type="range"
          min="5"
          max="50"
          value={brushSize}
          onChange={handleBrushSizeChange}
          className="brush-size-slider"
        />

        {/* Undo button */}
        <button className="undo-button" onClick={handleUndo}>⏪ Undo</button>
      </div>

      {!drawingFinished ? (
        <div className="canvas-container">
          <CanvasDraw
            ref={canvasRef}
            hideGrid={true}
            brushRadius={brushSize}
            brushColor={brushColor}
            canvasWidth={400}
            canvasHeight={400}
          />
        </div>
      ) : (
        <div>
          <h3>Waiting for the other player to finish...</h3>
        </div>
      )}

      <button className="finish-button" onClick={handleFinish}>
        Submit Drawing
      </button>

      {/* Display both drawings side by side when both players are done */}
      {drawingFinished && opponentDrawingFinished && (
        <div className="drawings-side-by-side">
          <div>
            <h3>Your Drawing</h3>
            <CanvasDraw
              disabled
              saveData={canvasRef.current.getSaveData()}
              immediateLoading={true}
              hideGrid={true}
              canvasWidth={400}
              canvasHeight={400}
            />
          </div>

          <div>
            <h3>Opponent's Drawing</h3>
            {opponentDrawing ? (
              <CanvasDraw
                disabled
                saveData={opponentDrawing}
                immediateLoading={true}
                hideGrid={true}
                canvasWidth={400}
                canvasHeight={400}
              />
            ) : (
              <p>No drawing available yet.</p>
            )}
          </div>
        </div>
      )}

      <button className="quit-button" onClick={onQuit}>
        Quit To Menu
      </button>
    </div>
  );
};

export default DrawingBoard;
