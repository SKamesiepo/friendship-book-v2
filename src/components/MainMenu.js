import React from 'react';

const MainMenu = ({ onSelect }) => {
  return (
    <div>
      <h2>Friendship Book</h2>
      <button onClick={() => onSelect('wouldYouRather')}>Would You Rather</button>
      <button onClick={() => onSelect('drawingBoard')}>Drawing Board</button>
    </div>
  );
};

export default MainMenu;
