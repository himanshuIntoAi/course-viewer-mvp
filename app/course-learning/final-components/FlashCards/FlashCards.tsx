'use client'

import { useEffect, useState, useCallback } from 'react';
import FlashCard from './FlashCard';
import styles from './FlashCard.module.css';

// First, let's define proper types for the topics
interface TopicCard {
  question: string;
  answer: string;
}



const getRandomGradient = () => {
  const colors = [
    'rgba(147, 197, 253, 0.5)',  // blue
    'rgba(249, 168, 212, 0.5)',  // pink
    'rgba(110, 231, 183, 0.5)',  // green
    'rgba(251, 146, 60, 0.5)',   // orange
    'rgba(167, 139, 250, 0.5)',  // purple
    'rgba(252, 211, 77, 0.5)',   // yellow
  ];
  
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  let color2;
  do {
    color2 = colors[Math.floor(Math.random() * colors.length)];
  } while (color2 === color1);
  
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

interface FlashCardType {
  id: number;
  question: string;
  answer: string;
  gradient: string;
}



// Define props for the component
interface FlashCardsProps {
  initialCards?: Array<{ question: string; answer: string }>; // Optional initial cards
  topic?: string; // Optional initial topic
}

export default function FlashCards({ initialCards, topic: initialTopic }: FlashCardsProps) {
  const [cards, setCards] = useState<FlashCardType[]>([]);
  const [cardFlipStates, setCardFlipStates] = useState<Record<number, boolean>>({ 0: false });
  const [isLoading, setIsLoading] = useState(true);



  // Initialize cards from initialCards prop
  useEffect(() => {
    console.log("[FlashCards] Initializing. Received initialCards prop:", initialCards);
    
    if (initialCards && initialCards.length > 0) {
      console.log("[FlashCards] Using initialCards prop:", initialCards);
      // Convert to FlashCardType format with gradients
      const flashCards: FlashCardType[] = initialCards.map((card, index) => ({
        id: index,
        question: card.question,
        answer: card.answer,
        gradient: getRandomGradient()
      }));
      
      setCards(flashCards);
      setCardFlipStates({});
      setIsLoading(false);
      
      console.log("[FlashCards] Initialization complete. Loaded cards:", flashCards.length);
    } else {
      console.log("[FlashCards] No initialCards provided");
      setCards([]);
      setIsLoading(false);
    }
  }, [initialCards]);
  // Filter cards (simplified - no search functionality)
  const filteredCards = cards;


  const handleFlip = (cardId: number) => {
    setCardFlipStates(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="text-center">
          <p className="text-gray-600">No flashcards available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {filteredCards.map((card) => (
          <FlashCard
            key={card.id}
            id={card.id}
            front={card.question}
            back={card.answer}
            isFlipped={cardFlipStates[card.id] || false}
            onFlip={() => handleFlip(card.id)}
            gradient={card.gradient}
          />
        ))}
      </div>
    </div>
  );
}
