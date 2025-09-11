import React from 'react';
import styles from './FlashCard.module.css';

interface FlashCardProps {
  id?: number;
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  gradient: string;
}

const FlashCard: React.FC<FlashCardProps> = ({ 
  front, 
  back, 
  isFlipped,
  onFlip,
  gradient
}) => {

  const cardStyle = {
    '--card-gradient': gradient
  } as React.CSSProperties;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFlip();
  };

  return (
    <div className={styles.cardContainer}>
      <div
        className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
        onClick={handleClick}
        style={cardStyle}
      >
        <div className={styles.front}>
          <div className={styles.content}>{front}</div>
          <div className={styles.frontOverlay} />
        </div>
        <div className={styles.back}>
          <div className={styles.content}>{back}</div>
          <div className={styles.backOverlay} />
        </div>
      </div>
    </div>
  );
};

export default FlashCard; 