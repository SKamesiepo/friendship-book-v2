import React, { useRef, useState, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import '../App.css';
import axios from 'axios';
import BASE_URL from '../config';

const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#FF8F33", "#8F33FF"]; // Preset colors

const DrawingBoard = ({ onQuit, name, sessionId }) => {
  const canvasRef = useRef(null);
  const [drawingFinished, setDrawingFinished] = useState(false);
  const [opponentDrawingFinished, setOpponentDrawingFinished] = useState(false);
  const [brushSize, setBrushSize] = useState(12);
  const [brushColor, setBrushColor] = useState("#444");
  const [myDrawing, setMyDrawing] = useState(null);
  const [opponentDrawing, setOpponentDrawing] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // Ensure sessionId is valid
  useEffect(() => {
    if (!sessionId) {
      console.error("Session ID is missing or invalid.");
      return;
    }

    const interval = setInterval(() => {
      axios
        .get(`${BASE_URL}/session/${sessionId}`)
        .then((response) => {
          console.log("Session state fetched:", response.data);

          const {
            player1_drawing_finished: player1Finished,
            player2_drawing_finished: player2Finished,
            player1_drawing_base64: player1Drawing,
            player2_drawing_base64: player2Drawing,
            drawing_finished_count: finishedCount,
            gameOver: backendGameOver,
          } = response.data;

          const isPlayer1 = response.data.player1 === name;

          setMyDrawing(isPlayer1 ? player1Drawing : player2Drawing);
          setOpponentDrawing(isPlayer1 ? player2Drawing : player1Drawing);
          setOpponentDrawingFinished(isPlayer1 ? player2Finished : player1Finished);
          setGameOver(backendGameOver);

          // Show both drawings if all players are done
          if (finishedCount === 2) {
            setDrawingFinished(true);
            setOpponentDrawingFinished(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, name]);

  const handleFinish = async () => {
    if (!sessionId) {
      console.error("Session ID is missing. Cannot submit drawing.");
      return;
    }

    setDrawingFinished(true); // Hide the canvas and tools

    const base64 = canvasRef.current.canvasContainer.childNodes[1].toDataURL();

    console.log("Submitting drawing data:", {
      playerName: name,
      sessionId,
      drawingData: base64.slice(0, 50) + "...", // Truncate for readability
    });

    try {
      const response = await axios.post(`${BASE_URL}/session/${sessionId}/drawing`, {
        playerName: name,
        drawingData: base64,
        finished: true,
      });

      console.log("Drawing submitted successfully:", response.data);
    } catch (error) {
      console.error("Error saving drawing:", error);
      if (error.response) {
        console.error("Backend error response:", error.response.data);
      } else if (error.request) {
        console.error("No response received. Request made was:", error.request);
      } else {
        console.error("Error setting up the request:", error.message);
      }
    }
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

      {!drawingFinished ? (
        <>
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

          <button className="finish-button" onClick={handleFinish}>
            Submit Drawing
          </button>
        </>
      ) : (
        <div>
          {!opponentDrawingFinished ? (
            <h3>Waiting for the other player to finish...</h3>
          ) : (
            <div className="drawings-side-by-side">
              <div>
                <h3>Your Drawing</h3>
                <img src={myDrawing} alt="Your Drawing" width="400" height="400" />
              </div>

              <div>
                <h3>Opponent's Drawing</h3>
                {opponentDrawing ? (
                  <img src={opponentDrawing} alt="Opponent's Drawing" width="400" height="400" />
                ) : (
                  <p>No drawing available yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <button className="quit-button" onClick={onQuit}>
        Quit To Menu
      </button>
    </div>
  );
};

export default DrawingBoard;
