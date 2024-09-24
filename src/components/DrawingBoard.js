// DrawingBoard.js
import React, { useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import '../App.css'; 

const DrawingBoard = ({ onQuit, name }) => {
  const [drawingFinished, setDrawingFinished] = useState(false);
  const canvasRef = useRef(null);

  const handleFinish = () => {
    setDrawingFinished(true);
  };

  return (
    <div className="drawing-board-container">
      <h2>{name}'s Drawing Board</h2>
      {!drawingFinished ? (
        <div className="canvas-container">
          <CanvasDraw ref={canvasRef} hideGrid={true} />
        </div>
      ) : (
        <div>
          <h3>Waiting for the other child to finish...</h3>
        </div>
      )}

<button className="finish-button" onClick={handleFinish}>
            Finish Drawing
          </button>
          
      <button className="quit-button" onClick={onQuit}>
        Quit
      </button>
    </div>
  );
};

export default DrawingBoard;
