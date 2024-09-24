import React, { useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';

const DrawingBoard = ({ onQuit, name }) => {
  const [drawingFinished, setDrawingFinished] = useState(false);
  const canvasRef = useRef(null);

  const handleFinish = () => {
    setDrawingFinished(true);
  };

  return (
    <div>
      <h2>{name}'s Drawing Board</h2>
      {!drawingFinished ? (
        <div>
          <CanvasDraw ref={canvasRef} hideGrid={true} />
          <button onClick={handleFinish}>Finish Drawing</button>
        </div>
      ) : (
        <div>
          <h3>Waiting for the other child to finish...</h3>
        </div>
      )}
      <button onClick={onQuit}>Quit</button>
    </div>
  );
};

export default DrawingBoard;
