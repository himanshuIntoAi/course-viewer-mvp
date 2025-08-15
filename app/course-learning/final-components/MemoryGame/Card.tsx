import React from 'react';
import './Card.css';

export interface CardType {
  text: string;
  pair: string;
  matched: boolean;
  id: string;
  isKeyword: boolean;
}

export interface CardProps {
  card: CardType;
  handleChoice: (card: CardType) => void;
  flipped: boolean;
  disabled: boolean;
}

const Card: React.FC<CardProps> = ({ card, handleChoice, flipped, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.matched) {
      handleChoice(card);
    }
  };

  // Use the pair property to determine color class (ensures matching pairs have same color)
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const colorIndex = (hashCode(card.pair) % 4) + 1;

  return (
    <div className="card" onClick={handleClick}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        <div className={`front ${card.matched ? `matched matched-color-${colorIndex}` : ''}`}>
          {card.text}
        </div>
        <div className="back">
          <div className="back-icon" />
        </div>
      </div>
    </div>
  );
};

export default Card; 