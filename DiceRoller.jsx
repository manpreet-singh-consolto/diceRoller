import React, { useState } from 'react';
import './DiceRoller.css';

function DiceRoller() {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    
    // Animation loop for rolling effect
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls > 10) {
        clearInterval(rollInterval);
        setDiceValue(Math.floor(Math.random() * 6) + 1);
        setIsRolling(false);
      }
    }, 100);
  };

  return (
    <div className="dice-roller">
      <div className={`dice ${isRolling ? 'rolling' : ''}`}>
        {diceValue}
      </div>
      <button 
        className="roll-button" 
        onClick={rollDice}
        disabled={isRolling}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
}

export default DiceRoller;
