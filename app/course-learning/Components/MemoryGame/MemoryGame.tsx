'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Card, { CardType } from './Card';
import Confetti from '../Confetti/Confetti';
import './MemoryGame.css';

interface HighScores {
  easy: number;
  medium: number;
  hard: number;
  hardest: number;
}

// Define props interface for MemoryGame
interface MemoryGameProps {
  topic?: string;
  cards?: Array<{
    id?: string;
    content?: string;
  }>;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ topic: topicProp, cards: cardsProp }) => {
  const [gameCards, setGameCards] = useState<CardType[]>([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState<CardType | null>(null);
  const [choiceTwo, setChoiceTwo] = useState<CardType | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'hardest'>('easy');
  const [showConfetti, setShowConfetti] = useState(false);
  const [highScores, setHighScores] = useState<HighScores>({
    easy: Infinity,
    medium: Infinity,
    hard: Infinity,
    hardest: Infinity
  });
  const [gameTitle, setGameTitle] = useState(topicProp || 'Memory Game');
  const [sourceCardPairs, setSourceCardPairs] = useState<Array<{ text: string; pair: string }>>([]);
  const didInitialLoad = useRef(false);

  // Default card pairs if none are provided
  const defaultCardPairs = useMemo(() => [
    { text: 'React', pair: 'A JavaScript library for building user interfaces' },
    { text: 'TypeScript', pair: 'A typed superset of JavaScript' },
    { text: 'Next.js', pair: 'A React framework for production' },
    { text: 'Node.js', pair: 'A JavaScript runtime built on Chrome\'s V8 engine' },
    { text: 'Git', pair: 'A distributed version control system' },
    { text: 'NPM', pair: 'A package manager for JavaScript' },
    { text: 'CSS', pair: 'A style sheet language' },
    { text: 'HTML', pair: 'A markup language for creating web pages' },
    { text: 'JavaScript', pair: 'A programming language' },
    { text: 'API', pair: 'Application Programming Interface' },
    { text: 'DOM', pair: 'Document Object Model' },
    { text: 'HTTP', pair: 'Hypertext Transfer Protocol' },
    { text: 'REST', pair: 'Representational State Transfer' },
    { text: 'GraphQL', pair: 'A query language for APIs' },
    { text: 'Redux', pair: 'A predictable state container' },
    { text: 'Webpack', pair: 'A static module bundler' }
  ], []);

  // Card count for different difficulties
  const getDifficultyCardCount = useCallback((difficulty: 'easy' | 'medium' | 'hard' | 'hardest'): number => {
    switch (difficulty) {
      case 'easy':
        return 2; // 2x2 grid = 4 cards = 2 pairs
      case 'medium':
        return 6; // 4x3 grid = 12 cards = 6 pairs
      case 'hard':
        return 8; // 4x4 grid = 16 cards = 8 pairs
      case 'hardest':
        return 12; // 4x6 grid = 24 cards = 12 pairs
      default:
        return 2;
    }
  }, []);

  // Grid layout classes for different difficulties
  const getGridLayoutClass = useCallback((difficulty: 'easy' | 'medium' | 'hard' | 'hardest'): string => {
    switch (difficulty) {
      case 'easy':
        return 'grid-cols-2'; // 2x2 grid
      case 'medium':
        return 'grid-cols-4'; // 4x3 grid
      case 'hard':
        return 'grid-cols-4'; // 4x4 grid
      case 'hardest':
        return 'grid-cols-6'; // Changed from grid-cols-4 to grid-cols-6 for 6x4 grid
      default:
        return 'grid-cols-2';
    }
  }, []);

  // Function to shuffle cards and create pairs
  const shuffleAndSetCards = useCallback((difficulty: 'easy' | 'medium' | 'hard' | 'hardest', currentSourcePairs: Array<{ text: string; pair: string }>) => {
    if (currentSourcePairs.length === 0) {
      console.warn('[MemoryGame] No source card pairs available to shuffle.');
      setGameCards([]); // Set empty cards if source is empty
      return;
    }
    
    console.log(`[MemoryGame] Shuffling ${currentSourcePairs.length} source pairs for difficulty: ${difficulty}`);
    console.log('[MemoryGame] Source pairs being shuffled:', JSON.stringify(currentSourcePairs, null, 2));
    
    const cardCount = getDifficultyCardCount(difficulty);
    
    // Ensure we don't request more pairs than available
    const pairsToUse = Math.min(cardCount, currentSourcePairs.length);
    console.log(`[MemoryGame] Using ${pairsToUse} pairs for ${difficulty} difficulty`);
    
    // Fix: Create a deep copy to avoid reference issues
    const pairsToShuffle = [...currentSourcePairs]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsToUse);
    
    console.log('[MemoryGame] Pairs to use after shuffle and slice:', JSON.stringify(pairsToShuffle, null, 2));
    
    // Create card objects from pairs, ensuring matching works correctly
    const gameCardsToUse: CardType[] = [];
    
    // Create a pair of cards for each text-pair combo
    pairsToShuffle.forEach((pair, index) => {
      // Ensure pair has both text and pair values
      if (!pair.text || !pair.pair) {
        console.warn(`[MemoryGame] Skipping invalid pair at index ${index}:`, pair);
        return;
      }
      
      // Add term card
      gameCardsToUse.push({
        id: (index * 2).toString(),
        text: pair.text, 
        pair: pair.text, // Use text as the matching key
        matched: false,
        isKeyword: true
      });
      
      // Add definition card with same pair value
      gameCardsToUse.push({
        id: (index * 2 + 1).toString(),
        text: pair.pair,
        pair: pair.text, // Use text as the matching key
        matched: false,
        isKeyword: false
      });
    });
    
    // Shuffle all cards
    const shuffledCards = [...gameCardsToUse].sort(() => Math.random() - 0.5);
    
    console.log(`[MemoryGame] Created ${shuffledCards.length} game cards from ${pairsToUse} pairs`);
    console.log('[MemoryGame] First few cards:', shuffledCards.slice(0, 4));
    
    setGameCards(shuffledCards);
    setTurns(0);
    setChoiceOne(null);
    setChoiceTwo(null);
    setDisabled(false);
  }, [getDifficultyCardCount]);

  // Define loadFromStorage function outside useEffect but use useCallback
  const loadFromStorage = useCallback(() => {
    console.log('[MemoryGame] Attempting to load from localStorage...');
    let loadedPairs: Array<{ text: string; pair: string }> = [];
    let loadedTitle = topicProp || 'Memory Game'; // Use topic prop as initial title if available
    const storedData = localStorage.getItem('memoryGameContent');

    if (storedData) {
      try {
        const parsedStorage = JSON.parse(storedData);
        const gameData = parsedStorage.data || parsedStorage; // Handle { data: ... } wrapper

        if (gameData && gameData.topic && Array.isArray(gameData.cards) && gameData.cards.length > 0) {
          console.log('[MemoryGame] Found valid data in localStorage:', gameData);
          loadedTitle = gameData.topic;

          // Process localStorage cards using the same term_X/def_X pattern
          const termCards: Record<string, string> = {};
          const defCards: Record<string, string> = {};

          gameData.cards.forEach((card: { id?: string; content?: string }) => {
            if (!card.id || !card.content) {
              console.warn('[MemoryGame] Skipping card with missing id or content:', card);
              return;
            }
            
            // Extract the pair index from card id
            const idParts = card.id.split('_');
            const pairIndex = idParts.length > 1 ? idParts[1] : '';
            
            if (!pairIndex) {
              console.warn('[MemoryGame] Card has invalid id format (missing index):', card.id);
              return;
            }
            
            if (card.id.startsWith('term_')) {
              termCards[pairIndex] = card.content;
              console.log(`[MemoryGame] Found term_${pairIndex}: ${card.content}`);
            } else if (card.id.startsWith('def_')) {
              defCards[pairIndex] = card.content;
              console.log(`[MemoryGame] Found def_${pairIndex}: ${card.content}`);
            } else {
              console.warn('[MemoryGame] Card has unrecognized id format (not term_ or def_):', card.id);
            }
          });
          
          // Create pairs from matching indexes
          console.log('[MemoryGame] Term cards:', termCards);
          console.log('[MemoryGame] Def cards:', defCards);
          
          Object.keys(termCards).forEach(index => {
            if (defCards[index]) {
              loadedPairs.push({
                text: termCards[index],
                pair: defCards[index]
              });
              console.log(`[MemoryGame] Created pair ${index}: ${termCards[index]} <-> ${defCards[index]}`);
            } else {
              console.warn(`[MemoryGame] Missing definition for term_${index}: ${termCards[index]}`);
            }
          });
          
          console.log('[MemoryGame] Created pairs from localStorage:', loadedPairs);

        } else {
          console.warn('[MemoryGame] localStorage data invalid or empty. Still using defaults.');
          loadedPairs = defaultCardPairs;
        }
      } catch (error) {
        console.error('[MemoryGame] Error parsing localStorage. Using defaults:', error);
        loadedPairs = defaultCardPairs;
      }
    } else {
      console.log('[MemoryGame] No data found in localStorage. Using defaults.');
      loadedPairs = defaultCardPairs;
    }

    // Update state based on what was loaded
    setGameTitle(loadedTitle);
    setSourceCardPairs(loadedPairs);

    // Shuffle immediately if pairs were successfully loaded (from storage or default)
    if (loadedPairs.length > 0) {
      console.log(`[MemoryGame] loadFromStorage finished with ${loadedPairs.length} pairs. Shuffling for difficulty: ${difficulty}`);
      shuffleAndSetCards(difficulty, loadedPairs);
    } else {
      console.log('[MemoryGame] loadFromStorage finished, but no pairs found. Not shuffling.');
      setGameCards([]); // Ensure game cards are empty
    }
  // Dependencies for loadFromStorage
  }, [defaultCardPairs, difficulty, shuffleAndSetCards, topicProp]);

  // useEffect to handle loading from Props (if provided) - Runs only when props change
  useEffect(() => {
    if (cardsProp && cardsProp.length > 0) {
      console.log('[MemoryGame] Using card data directly from props:', cardsProp);
      const loadedTitle = topicProp || 'Memory Game (From Props)';
      const loadedPairs: Array<{ text: string; pair: string }> = [];
      const termCards: Record<string, string> = {};
      const defCards: Record<string, string> = {};

      // Process props data
      cardsProp.forEach(card => {
        if (!card.id || !card.content) {
          console.warn('[MemoryGame] Skipping card with missing id or content:', card);
          return;
        }
        
        // Extract the pair index from card id
        const idParts = card.id.split('_');
        const pairIndex = idParts.length > 1 ? idParts[1] : '';
        
        if (!pairIndex) {
          console.warn('[MemoryGame] Card has invalid id format (missing index):', card.id);
          return;
        }
        
        if (card.id.startsWith('term_')) {
          termCards[pairIndex] = card.content;
          console.log(`[MemoryGame] Found term_${pairIndex}: ${card.content}`);
        } else if (card.id.startsWith('def_')) {
          defCards[pairIndex] = card.content;
          console.log(`[MemoryGame] Found def_${pairIndex}: ${card.content}`);
        } else {
          console.warn('[MemoryGame] Card has unrecognized id format (not term_ or def_):', card.id);
        }
      });
      console.log('[MemoryGame] Term cards (props):', termCards);
      console.log('[MemoryGame] Def cards (props):', defCards);
      Object.keys(termCards).forEach(index => {
        if (defCards[index]) {
          loadedPairs.push({
            text: termCards[index],
            pair: defCards[index]
          });
          console.log(`[MemoryGame] Created pair ${index}: ${termCards[index]} <-> ${defCards[index]}`);
        } else {
          console.warn(`[MemoryGame] Missing definition for term_${index}: ${termCards[index]}`);
        }
      });
      console.log('[MemoryGame] Created pairs from props:', loadedPairs);

      // Update state from props
      setGameTitle(loadedTitle);
      setSourceCardPairs(loadedPairs);

      // Shuffle immediately after processing props
      if (loadedPairs.length > 0) {
        console.log(`[MemoryGame] Props data processed. Shuffling immediately for difficulty: ${difficulty}`);
        shuffleAndSetCards(difficulty, loadedPairs);
      } else {
         setGameCards([]);
      }
    }
    // This effect *only* runs if the direct props change.
  }, [cardsProp, topicProp, difficulty, shuffleAndSetCards]); // Note: defaultCardPairs not needed here

  // useEffect for initial load from storage IF NO PROPS ARE GIVEN
  useEffect(() => {
    // Prevent Strict Mode double execution of initial load
    if (didInitialLoad.current) {
      return; 
    }
    didInitialLoad.current = true; // Mark that initial load logic has run

    // Run only if props are NOT provided
    if (!cardsProp || cardsProp.length === 0) {
        console.log('[MemoryGame] Initial mount (no props). Attempting load from storage...');
        loadFromStorage(); 
    }
    // Run only ONCE on mount (effectively, due to the ref guard)
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // Empty dependency array ensures this runs only once on mount

  // useEffect for setting up the storage listener
  useEffect(() => {
    // Define the storage event handler
    const handleStorageChange = (event: StorageEvent) => {
      // Only react if the key matches AND if this component is NOT using props
      if (event.key === 'memoryGameContent' && (!cardsProp || cardsProp.length === 0)) {
        console.log('[MemoryGame] Detected storage change for memoryGameContent (and not using props). Reloading...');
        loadFromStorage();
      }
    };

    // Add the event listener
    window.addEventListener('storage', handleStorageChange);
    console.log('[MemoryGame] Storage listener added.');

    // Cleanup function to remove the listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      console.log('[MemoryGame] Storage listener removed.');
    };

  // Re-run listener setup if loadFromStorage function instance changes or if props presence changes
  }, [loadFromStorage, cardsProp]); 

  const handleChoice = (card: CardType) => {
    console.log('[MemoryGame] Card chosen:', card);
    
    if (choiceOne && choiceTwo) return;

    if (!choiceOne) {
      setChoiceOne(card);
      return;
    }

    setChoiceTwo(card);
    setDisabled(true);

    console.log('[MemoryGame] Matching:', { 
      first: choiceOne.text, 
      firstPair: choiceOne.pair, 
      second: card.text, 
      secondPair: card.pair 
    });

    // Check if the cards match by comparing their pair values
    if (choiceOne.pair === card.pair) {
      console.log('[MemoryGame] Cards matched!');
      
      setGameCards(prevCards => {
        return prevCards.map(c => {
          if (c.id === choiceOne.id || c.id === card.id) {
            return { ...c, matched: true };
          }
          return c;
        });
      });
      resetTurn();
    } else {
      console.log('[MemoryGame] Cards did not match');
      setTimeout(() => resetTurn(), 1000);
    }
  };

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setDisabled(false);
    setTurns(prevTurns => prevTurns + 1);
  };

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard' | 'hardest') => {
    console.log(`[MemoryGame] Difficulty changed TO: ${newDifficulty}`);
    setDifficulty(() => {
      if (sourceCardPairs.length > 0) {
        console.log(`[MemoryGame] Shuffling cards due to manual difficulty change to ${newDifficulty}`);
        shuffleAndSetCards(newDifficulty, sourceCardPairs);
      } else {
        console.log(`[MemoryGame] Difficulty changed, but no source pairs to shuffle yet.`);
      }
      return newDifficulty;
    });
  };

  useEffect(() => {
    const allMatched = gameCards.length > 0 && gameCards.every(card => card.matched);
    if (allMatched) {
      const currentHighScore = highScores[difficulty];
      if (turns < currentHighScore) {
        setHighScores(prev => ({
          ...prev,
          [difficulty]: turns
        }));
      }
    }
  }, [gameCards, turns, difficulty, highScores]);

  useEffect(() => {
    if (gameCards.length > 0 && gameCards.every(card => card.matched)) {
      setShowConfetti(true);

      // Hide confetti and load new cards after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
        console.log('[MemoryGame] Game won, shuffling for next round...');
        shuffleAndSetCards(difficulty, sourceCardPairs);
      }, 5000);
      // Cleanup timer on unmount or if dependencies change before timeout
      return () => clearTimeout(timer);
    }
  }, [gameCards, difficulty, shuffleAndSetCards, sourceCardPairs]);

  // Log the final gameCards state before rendering
  console.log('[MemoryGame] Final state before render:', {
    gameTitle,
    difficulty,
    sourceCardPairsCount: sourceCardPairs.length,
    gameCardsCount: gameCards.length,
    gameCards: gameCards // Log the actual cards array
  });

  return (
    <div className="memory-game">
      <div className="header">
        <h1>{gameTitle}</h1>
      </div>
      
      <div className="game-container">
        {/* Left Panel for Difficulty */}
        <div className="left-panel"> 
          <div className="difficulty-selector">
            <button
              className={difficulty === 'easy' ? 'active' : ''}
              onClick={() => handleDifficultyChange('easy')}
            >
              Easy (2×2)
            </button>
            <button
              className={difficulty === 'medium' ? 'active' : ''}
              onClick={() => handleDifficultyChange('medium')}
            >
              Medium (4×3)
            </button>
            <button
              className={difficulty === 'hard' ? 'active' : ''}
              onClick={() => handleDifficultyChange('hard')}
            >
              Hard (4×4)
            </button>
            <button
              className={difficulty === 'hardest' ? 'active' : ''}
              onClick={() => handleDifficultyChange('hardest')}
            >
              Hardest (4×6)
            </button>
          </div>
        </div>

        {/* Middle Panel for Card Grid */}
        <div className="game-content">
          <div className={`card-grid ${getGridLayoutClass(difficulty)}`}>
            {gameCards.map(card => (
              <Card
                key={card.id}
                card={card}
                handleChoice={handleChoice}
                flipped={card === choiceOne || card === choiceTwo || card.matched}
                disabled={disabled}
              />
            ))}
          </div>
        </div>

        {/* Right Panel for Turns and High Scores */}
        <div className="right-panel">
          <div className="game-info">
            <div className="turns-label">Turns</div>
            <div className="turns">{turns}</div>
          </div>
          <div className="high-scores">
            <h3>High Scores</h3>
            <div>Easy: {highScores.easy === Infinity ? '-' : highScores.easy}</div>
            <div>Medium: {highScores.medium === Infinity ? '-' : highScores.medium}</div>
            <div>Hard: {highScores.hard === Infinity ? '-' : highScores.hard}</div>
            <div>Hardest: {highScores.hardest === Infinity ? '-' : highScores.hardest}</div>
          </div>
        </div>

      </div>
      {showConfetti && <Confetti isActive={showConfetti} />}
    </div>
  );
};

export default MemoryGame; 