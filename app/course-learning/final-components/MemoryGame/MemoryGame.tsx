'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2 } from 'lucide-react';
import Card, { CardType } from './Card';
import Confetti from '../Confetti/Confetti';
import './MemoryGame.css';

// Note: config import removed as we're using environment variables directly

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);
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

  // Card count for different difficulties - Use all available pairs up to difficulty limit
  const getDifficultyCardCount = useCallback((difficulty: 'easy' | 'medium' | 'hard' | 'hardest'): number => {
    switch (difficulty) {
      case 'easy':
        return 2; // 2x2 grid = 4 cards = 2 pairs
      case 'medium':
        return 6; // 4x3 grid = 12 cards = 6 pairs
      case 'hard':
        return 8; // 4x4 grid = 16 cards = 8 pairs
      case 'hardest':
        return 12; // 4x6 grid = 24 cards = 12 pairs (use all available pairs)
      default:
        return 2;
    }
  }, []);

  // Grid layout classes for different difficulties
  const getGridLayoutClass = useCallback((difficulty: 'easy' | 'medium' | 'hard' | 'hardest'): string => {
    switch (difficulty) {
      case 'easy':
        return 'grid-cols-2'; // 2x2 grid = 4 cards (2 pairs)
      case 'medium':
        return 'grid-cols-4'; // 4x3 grid = 12 cards (6 pairs)
      case 'hard':
        return 'grid-cols-4'; // 4x4 grid = 16 cards (8 pairs)
      case 'hardest':
        return 'grid-cols-6'; // 6x4 grid = 24 cards (12 pairs)
      default:
        return 'grid-cols-2';
    }
  }, []);

  // Calculate grid rows based on number of cards and difficulty
  const getGridRows = useCallback((cardCount: number, difficulty: 'easy' | 'medium' | 'hard' | 'hardest'): string => {
    const cols = difficulty === 'easy' ? 2 : difficulty === 'hardest' ? 6 : 4;
    const rows = Math.ceil(cardCount / cols);
    return `repeat(${rows}, 180px)`;
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
    
    const maxPairsForDifficulty = getDifficultyCardCount(difficulty);
    
    // Use all available pairs up to the difficulty limit (12 pairs max)
    const pairsToUse = Math.min(maxPairsForDifficulty, currentSourcePairs.length);
    console.log(`[MemoryGame] Using ${pairsToUse} pairs for ${difficulty} difficulty (max: ${maxPairsForDifficulty}, available: ${currentSourcePairs.length})`);
    
    // Create a deep copy and shuffle all available pairs
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

  // Load memory game data from API or localStorage
  const loadMemoryGameData = useCallback(async () => {
    console.log('[MemoryGame] Attempting to load memory game data...');
    setIsLoading(true);
    setError(null);
    
    let loadedPairs: Array<{ text: string; pair: string }> = [];
    let loadedTitle = topicProp || 'Memory Game';

    // First check if cardsProp is provided (for new/updated memory games)
    if (cardsProp && Array.isArray(cardsProp) && cardsProp.length > 0) {
      console.log('[MemoryGame] Using cardsProp data:', cardsProp);
      
      // Process cardsProp data to create pairs
      const termCards: Record<string, string> = {};
      const defCards: Record<string, string> = {};

      cardsProp.forEach((card: { id?: string; content?: string }) => {
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
      
      if (loadedPairs.length > 0) {
        console.log(`[MemoryGame] Successfully loaded ${loadedPairs.length} pairs from cardsProp`);
        setGameTitle(loadedTitle);
        setSourceCardPairs(loadedPairs);
        setIsLoading(false);
        shuffleAndSetCards(difficulty, loadedPairs);
        return;
      }
    }

    try {
      // First try to load from API
      // const courseId = localStorage.getItem('currentCourseId'); // Reserved for future use
      const topicId = localStorage.getItem('currentTopicId');
      
      if (topicId) {
        // Use the correct backend endpoint directly
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ai-chatbot-v5-backend-docker.azurewebsites.net'}/api/course/components/memory-games/${topicId}`;
        
        console.log(`[MemoryGame] Fetching from API: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`[MemoryGame] API response:`, result);
          
          // Support both shapes: { data: [...] } and { memory_games: [...] }
          const gamesArray = Array.isArray(result?.data)
            ? result.data
            : (Array.isArray(result?.memory_games) ? result.memory_games : []);

          if (result.success && gamesArray.length > 0) {
            const memoryGame = gamesArray[0]; // Use the first memory game
            
            if (memoryGame && Array.isArray(memoryGame.cards) && memoryGame.cards.length > 0) {
              console.log(`[MemoryGame] Successfully loaded ${memoryGame.cards.length} cards from API`);
              
              // Check if we have enough pairs (should have at least 12 pairs = 24 cards)
              const cardCount = memoryGame.cards.length;
              const pairCount = Math.floor(cardCount / 2);
              console.log(`[MemoryGame] Memory game has ${cardCount} cards (${pairCount} pairs)`);
              
              if (pairCount < 12) {
                console.warn(`[MemoryGame] Insufficient pairs (${pairCount}), trying fallback generation...`);
                throw new Error(`Insufficient pairs: ${pairCount}`);
              }
              
              loadedTitle = memoryGame.topic || loadedTitle;

              // Process API cards using the same term_X/def_X pattern
              const termCards: Record<string, string> = {};
              const defCards: Record<string, string> = {};

              memoryGame.cards.forEach((card: { id?: string; content?: string }) => {
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
              
              // Save to localStorage for caching
              localStorage.setItem('memoryGameContent', JSON.stringify({
                pairs: loadedPairs,
                topic: loadedTitle,
                timestamp: Date.now()
              }));
              
              setGameTitle(loadedTitle);
              setSourceCardPairs(loadedPairs);
              setIsLoading(false);
              return;
            }
          } else {
            console.log('[MemoryGame] No existing memory games found, will try generation fallback...');
          }
        } else {
          console.log(`[MemoryGame] API request failed with status: ${response.status}, trying fallback...`);
          const errorText = await response.text();
          console.log(`[MemoryGame] API error response:`, errorText);
        }
      } else {
        console.log('[MemoryGame] No topicId available, skipping direct API call and using fallback...');
      }
    } catch (apiError) {
        console.warn('[MemoryGame] API failed or insufficient pairs, falling back to localStorage:', apiError);
        
        // If the error is about insufficient pairs, try to force regeneration
        if (apiError instanceof Error && apiError.message && apiError.message.includes('Insufficient pairs')) {
          console.log('[MemoryGame] Attempting to force regeneration due to insufficient pairs...');
          try {
            // Force regeneration by calling the generation endpoint directly
            const courseId = localStorage.getItem('currentCourseId');
            const topicId = localStorage.getItem('currentTopicId');
            
            if (courseId && topicId) {
              const regenerateUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ai-chatbot-v5-backend-docker.azurewebsites.net'}/api/course/content/generate`;
              const regenerateResponse = await fetch(regenerateUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'memory_game',
                  topic: loadedTitle,
                  context: {
                    course_id: parseInt(courseId.toString()),
                    topic_id: parseInt(topicId.toString()),
                    course_context: `Memory game for topic: ${loadedTitle}. Generate exactly 12 pairs (24 cards total) with comprehensive content.`
                  }
                })
              });
              
              if (regenerateResponse.ok) {
                const regenerateResult = await regenerateResponse.json();
                if (regenerateResult.success && regenerateResult.data) {
                  console.log('[MemoryGame] Successfully regenerated memory game with sufficient pairs');
                  loadedPairs = [];
                  
                  // Process the regenerated data
                  const termCards: Record<string, string> = {};
                  const defCards: Record<string, string> = {};

                  regenerateResult.data.cards.forEach((card: { id?: string; content?: string }) => {
                    if (!card.id || !card.content) return;
                    
                    const idParts = card.id.split('_');
                    const pairIndex = idParts.length > 1 ? idParts[1] : '';
                    
                    if (!pairIndex) return;
                    
                    if (card.id.startsWith('term_')) {
                      termCards[pairIndex] = card.content;
                    } else if (card.id.startsWith('def_')) {
                      defCards[pairIndex] = card.content;
                    }
                  });
                  
                  Object.keys(termCards).forEach(index => {
                    if (defCards[index]) {
                      loadedPairs.push({
                        text: termCards[index],
                        pair: defCards[index]
                      });
                    }
                  });
                  
                  console.log(`[MemoryGame] Regenerated ${loadedPairs.length} pairs`);
                  setGameTitle(loadedTitle);
                  setSourceCardPairs(loadedPairs);
                  
                  if (loadedPairs.length > 0) {
                    shuffleAndSetCards(difficulty, loadedPairs);
                  }
                  return;
                }
              }
            }
          } catch (regenerateError) {
            console.warn('[MemoryGame] Regeneration failed, using fallback:', regenerateError);
          }
        }
      
      // Fallback to localStorage
      const storedData = localStorage.getItem('memoryGameContent');

      if (storedData) {
        try {
          const parsedStorage = JSON.parse(storedData);
          const gameData = parsedStorage.data || parsedStorage;

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
            
          } else {
            console.warn('[MemoryGame] localStorage data invalid or empty. Using defaults.');
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
    } finally {
      setIsLoading(false);
    }

    // Update state based on what was loaded
    setGameTitle(loadedTitle);
    setSourceCardPairs(loadedPairs);

    // Shuffle immediately if pairs were successfully loaded
    if (loadedPairs.length > 0) {
      console.log(`[MemoryGame] loadMemoryGameData finished with ${loadedPairs.length} pairs. Shuffling for difficulty: ${difficulty}`);
      shuffleAndSetCards(difficulty, loadedPairs);
    } else {
      console.log('[MemoryGame] loadMemoryGameData finished, but no pairs found. Not shuffling.');
      setGameCards([]); // Ensure game cards are empty
    }
  }, [defaultCardPairs, difficulty, shuffleAndSetCards, topicProp, cardsProp]);

  // useEffect to handle loading from Props (if provided) - Runs only when props change
  useEffect(() => {
    console.log('[MemoryGame] Props useEffect triggered. cardsProp:', cardsProp, 'length:', cardsProp?.length);
    if (cardsProp && cardsProp.length > 0) {
      console.log('[MemoryGame] Using card data directly from props:', cardsProp);
      console.log('[MemoryGame] First card structure:', JSON.stringify(cardsProp[0], null, 2));
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

  // Portal setup
  useEffect(() => {
    setMounted(true);
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.id = 'memory-game-portal';
      document.body.appendChild(portalRef.current);
    }
    return () => {
      if (portalRef.current && document.body.contains(portalRef.current)) {
        try {
          document.body.removeChild(portalRef.current);
        } catch (error) {
          console.warn('[MemoryGame] Error removing portal:', error);
        }
        portalRef.current = null;
      }
    };
  }, []);

  // Fullscreen body overflow management
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  // useEffect for initial load from API/storage IF NO PROPS ARE GIVEN
  useEffect(() => {
    // Prevent Strict Mode double execution of initial load
    if (didInitialLoad.current) {
      return; 
    }
    didInitialLoad.current = true; // Mark that initial load logic has run

    // Run only if props are NOT provided
    if (!cardsProp || cardsProp.length === 0) {
        console.log('[MemoryGame] Initial mount (no props). Attempting load from API/storage...');
        loadMemoryGameData(); 
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
        loadMemoryGameData();
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

  // Re-run listener setup if loadMemoryGameData function instance changes or if props presence changes
  }, [loadMemoryGameData, cardsProp]); 

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

  const toggleFullscreen = useCallback(() => {
    setIsFullScreen(prev => {
      const newState = !prev;
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return newState;
    });
  }, []);

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
    maxPairsForDifficulty: getDifficultyCardCount(difficulty),
    actualPairsUsed: Math.floor(gameCards.length / 2),
    gameCards: gameCards.slice(0, 4) // Log first few cards for debugging
  });

  return (
    <>
      {!isFullScreen && (
        <div className="memory-game">
          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>{gameTitle}</h1>
            <button
              onClick={toggleFullscreen}
              disabled={gameCards.length === 0}
              className="p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow-md"
              title="Open in fullscreen"
            >
              <Maximize2 size={20} color="white" />
            </button>
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
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading memory game data...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">Error: {error}</p>
              <button 
                onClick={() => loadMemoryGameData()}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          ) : gameCards.length === 0 ? (
            <div className="empty-container">
              <p>No memory game cards available.</p>
            </div>
          ) : (
            <div 
              className={`card-grid ${getGridLayoutClass(difficulty)}`}
              style={{
                gridTemplateRows: getGridRows(gameCards.length, difficulty)
              }}
            >
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
          )}
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
        {showConfetti && <Confetti active={showConfetti} />}
        </div>
      )}
      
      {isFullScreen && mounted && portalRef.current && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70" 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999999,
          }}
          onContextMenu={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white w-full h-full flex flex-col overflow-hidden"
            style={{ pointerEvents: 'all' }}
            onContextMenu={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="memory-game" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <h1>{gameTitle}</h1>
                <button
                  onClick={toggleFullscreen}
                  className="fullscreen-button"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  × Close
                </button>
              </div>
              
              <div className="game-container" style={{ flex: 1, display: 'flex' }}>
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
                  {isLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading memory game data...</p>
                    </div>
                  ) : error ? (
                    <div className="error-container">
                      <p className="error-message">Error: {error}</p>
                      <button 
                        onClick={() => loadMemoryGameData()}
                        className="retry-button"
                      >
                        Retry
                      </button>
                    </div>
                  ) : gameCards.length === 0 ? (
                    <div className="empty-container">
                      <p>No memory game cards available.</p>
                    </div>
                  ) : (
                    <div 
                      className={`card-grid ${getGridLayoutClass(difficulty)}`}
                      style={{
                        gridTemplateRows: getGridRows(gameCards.length, difficulty)
                      }}
                    >
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
                  )}
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
              {showConfetti && <Confetti active={showConfetti} />}
            </div>
          </div>
        </div>,
        portalRef.current
      )}
    </>
  );
};

export default MemoryGame; 