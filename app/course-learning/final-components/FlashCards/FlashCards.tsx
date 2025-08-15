'use client'

import { useEffect, useState, useCallback } from 'react';
import FlashCard from './FlashCard';
import styles from './FlashCard.module.css';

// First, let's define proper types for the topics
interface TopicCard {
  question: string;
  answer: string;
}

interface Topics {
  [key: string]: TopicCard[];
}

// Default topics with example cards
const topics: Topics = {
  'Database': [
    { question: 'What are Database Triggers?', answer: 'Special procedures that automatically run when specific database events occur' },
    { question: 'What is Database Normalization?', answer: 'The process of organizing data to reduce redundancy and improve data integrity' },
    { question: 'What is ACID in databases?', answer: 'Atomicity, Consistency, Isolation, and Durability - properties of database transactions' },
    { question: 'What is an Index?', answer: 'A data structure that improves the speed of data retrieval operations' },
    { question: 'What is Sharding?', answer: 'A database architecture pattern where data is distributed across multiple servers' },
    { question: 'What is a View?', answer: 'A virtual table based on the result set of an SQL statement' }
  ],
  'React': [
    { question: 'What is React?', answer: 'A JavaScript library for building user interfaces with component-based architecture' },
    { question: 'What are React Hooks?', answer: 'Functions that allow using state and lifecycle features in functional components' },
    { question: 'What is useEffect?', answer: 'A Hook that lets you perform side effects in function components' },
    { question: 'What is useState?', answer: 'A Hook that lets you add state to function components' },
    { question: 'What is useContext?', answer: 'A Hook that subscribes to React context without introducing nesting' },
    { question: 'What is useReducer?', answer: 'A Hook that manages complex state logic in components' }
  ],
  // ... other topics ...
};

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

interface AddCardFormProps {
  onAdd: (card: { question: string; answer: string; topic: string }) => void;
  onClose: () => void;
  availableTopics: string[];
}

function AddCardForm({ onAdd, onClose, availableTopics }: AddCardFormProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [topic, setTopic] = useState(availableTopics[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [cardGradient] = useState(getRandomGradient());
  const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onAdd({ 
        question: question.trim(), 
        answer: answer.trim(),
        topic: topic 
      });
      setQuestion('');
      setAnswer('');
      onClose();
    }
  };

  const togglePreviewFlip = () => {
    setIsPreviewFlipped(!isPreviewFlipped);
  };

  return (
    <div className={styles.formOverlay}>
      <div className={`${styles.formContent} ${styles.enhancedForm}`}>
        <div className={styles.formHeader}>
          <h2>Create New Flashcard</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className={styles.formLayout}>
          <form onSubmit={handleSubmit} className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="topic">
                <span className={styles.labelText}>Category</span>
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={styles.topicSelect}
                >
                  {availableTopics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="question">
                <span className={styles.labelText}>Question</span>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  placeholder="Enter your question"
                  className={styles.enhancedTextarea}
                />
                <span className={styles.charCount}>
                  {question.length} characters
                </span>
              </label>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="answer">
                <span className={styles.labelText}>Answer</span>
                <textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  placeholder="Enter the answer"
                  className={styles.enhancedTextarea}
                />
                <span className={styles.charCount}>
                  {answer.length} characters
                </span>
              </label>
            </div>
            
            <div className={styles.formActions}>
              <button 
                type="button" 
                onClick={() => setShowPreview(!showPreview)}
                className={styles.previewButton}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <div>
                <button type="submit" className={styles.submitButton}>Add Card</button>
                <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
              </div>
            </div>
          </form>
          
          {showPreview && (
            <div className={styles.previewSection}>
              <h3 className={styles.previewTitle}>Preview</h3>
              <div 
                className={styles.cardPreviewWrapper}
                onClick={togglePreviewFlip}
              >
                <div className={`${styles.cardPreviewInner} ${isPreviewFlipped ? styles.flipped : ''}`}>
                  <div 
                    className={`${styles.cardPreview} ${styles.frontPreview}`}
                    style={{ background: cardGradient }}
                  >
                    <div className={styles.previewContent}>
                      {question || "Question will appear here"}
                    </div>
                  </div>
                  <div 
                    className={`${styles.cardPreview} ${styles.backPreview}`}
                    style={{ background: cardGradient }}
                  >
                    <div className={styles.previewContent}>
                      {answer || "Answer will appear here"}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.previewHelp}>
                Click on the card to flip between question and answer
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ProgressBar = ({ 
  progress, 
  totalCards, 
  currentCardIndex 
}: { 
  progress: number; 
  totalCards: number;
  currentCardIndex: number;
}) => (
  <div className={styles.progressBar}>
    {Array.from({ length: totalCards }).map((_, index) => (
      <div 
        key={index} 
        className={`${styles.progressSegment} ${
          index < currentCardIndex ? styles.segmentCompleted : ''
        }`}
      >
        <div 
          className={styles.progressFill}
          style={{ 
            width: index === currentCardIndex ? `${progress}%` : '0%'
          }}
        />
      </div>
    ))}
  </div>
);

// Define props for the component
interface FlashCardsProps {
  initialCards?: Array<{ question: string; answer: string }>; // Optional initial cards
  topic?: string; // Optional initial topic
}

export default function FlashCards({ initialCards, topic: initialTopic }: FlashCardsProps) {
  const [cards, setCards] = useState<FlashCardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // Use initialTopic prop if provided, otherwise default
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || 'Database'); 
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState(0);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardFlipStates, setCardFlipStates] = useState<Record<number, boolean>>({ 0: false });
  const [customCards, setCustomCards] = useState<Record<string, TopicCard[]>>({});
  const [isClosing, setIsClosing] = useState(false);
  const [playlistCards, setPlaylistCards] = useState<FlashCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processedLocalStorage, setProcessedLocalStorage] = useState(false);

  const CARD_DURATION = 6000; // 6 seconds per card
  const FLIP_DURATION = 3000; // 3 seconds per side

  // Renamed from saveToLocalStorage to make purpose clear
  // This function now takes the current state of all custom cards
  const saveCustomCardsToLocalStorage = useCallback((allCustomCards: Record<string, TopicCard[]>) => {
    // Convert the customCards object into the array format expected by localStorage
    const dataToSave = Object.entries(allCustomCards).map(([topic, cards]) => ({ topic, cards }));
    
    try {
      const dataString = JSON.stringify({ data: dataToSave, timestamp: Date.now() });
      localStorage.setItem('flashcardsContent', dataString);
      console.log('[FlashCards] Saved custom cards data to localStorage:', dataToSave);
    } catch (error) {
      console.error('[FlashCards] Error saving custom cards to localStorage:', error);
    }
  }, []); // No dependencies needed as it takes data as argument

  // Initialize cards: Prioritize initialCards prop, then localStorage, then defaults
  useEffect(() => {
    console.log("[FlashCards] Initializing. Received initialCards prop:", initialCards);
    
    let loadedCustomCards: Record<string, TopicCard[]> = {};
    // Initialize with default topics first
    Object.keys(topics).forEach(topic => {
      loadedCustomCards[topic] = topics[topic] ? [...topics[topic]] : []; // Copy default cards
    });
    
    // Check localStorage for custom additions/overrides only if initialCards is NOT provided
    if (!initialCards) {
      console.log("[FlashCards] No initialCards prop, checking localStorage...");
    const storedFlashcards = localStorage.getItem('flashcardsContent');
    if (storedFlashcards) {
        try {
          const parsedStorage = JSON.parse(storedFlashcards);
          // Expecting format { data: [{ topic: "T", cards: [...] }, ...], timestamp: ... } or legacy array
          const storageData = parsedStorage.data || parsedStorage; // Handle both formats
          
          if (Array.isArray(storageData)) {
            // Process array format (assuming it contains topics with cards)
            // Define a type for the expected item structure in the array
            type StorageItem = 
              { topic: string; cards: Array<{ question: string; answer: string }> } | 
              { question: string; answer: string; topic?: string }; // Also handle legacy flat format
              
            (storageData as StorageItem[]).forEach((item) => {
              if ('topic' in item && 'cards' in item && Array.isArray(item.cards)) {
                // Process topic with cards structure
                const topicName = item.topic;
                if (!loadedCustomCards[topicName]) loadedCustomCards[topicName] = []; // Ensure topic exists
                
                const existingCards = loadedCustomCards[topicName];
                const newCards = item.cards.filter((newCard: { question: string; answer: string }) => // Type for newCard
                  !existingCards.some(existing => existing.question === newCard.question)
                );
                loadedCustomCards[topicName] = [...existingCards, ...newCards];
              } else if ('question' in item && 'answer' in item) {
                 // Handle legacy flat array format (assign to default topic or a new one)
                 const topicName = item.topic || initialTopic || 'Database'; // Use item.topic if present
                 if (!loadedCustomCards[topicName]) loadedCustomCards[topicName] = [];
                 // Avoid duplicates
                 if (!loadedCustomCards[topicName].some(c => c.question === item.question)) {
                    loadedCustomCards[topicName].push({ question: item.question, answer: item.answer });
                 }
              }
            });
          } else {
             console.warn("[FlashCards] localStorage 'flashcardsContent' data is not an array:", storageData);
        }
      } catch (error) {
          console.error("[FlashCards] Error parsing localStorage 'flashcardsContent':", error);
        }
      }
    } else {
      // If initialCards prop IS provided, create a single topic based on prop or default
      const topicName = initialTopic || "Preview Topic";
      console.log(`[FlashCards] Using initialCards prop for topic: ${topicName}`);
      loadedCustomCards = { 
        [topicName]: initialCards.map(card => ({ ...card })) // Map to ensure correct type
      };
      setSelectedTopic(topicName); // Set the topic based on the prop
    }
    
    setCustomCards(loadedCustomCards);
    setProcessedLocalStorage(true); // Mark as processed
    setIsLoading(false);

    // Set initial state based on loaded/default data
    setCustomCards(loadedCustomCards);
    setProcessedLocalStorage(true); // Mark that localStorage has been processed

    // Select initial topic and load cards
    // Ensure initialTopic exists in loadedCustomCards, otherwise default
    let topicToLoad: string;
    if (initialTopic && loadedCustomCards[initialTopic]) {
        topicToLoad = initialTopic;
    } else {
        topicToLoad = Object.keys(loadedCustomCards)[0] || 'Database'; // Default if no keys exist
    }
    setSelectedTopic(topicToLoad);
    loadCards(loadedCustomCards[topicToLoad] || []); // Load cards for the selected topic

  }, [initialCards, initialTopic]); 

  // Separate useEffect for loading cards when selectedTopic changes AFTER initial load
  useEffect(() => {
    // Only run if initial processing is done and topic exists in customCards
    if (processedLocalStorage && customCards[selectedTopic]) {
      console.log(`[FlashCards] Topic changed to ${selectedTopic}, loading cards...`);
      loadCards(customCards[selectedTopic]);
      setCurrentCardIndex(0); // Reset index on topic change
      setIsFlipped(false);
      setProgress(0);
      setSelectedCards(new Set()); // Clear selection
    }
  }, [selectedTopic, customCards, processedLocalStorage]); // Depend on topic, cards data, and processed flag

  // Load cards for the current topic
  const loadCards = (topicCards: TopicCard[]) => {
    const formattedCards = topicCards.map((card, index) => ({
      id: index,
      question: card.question,
      answer: card.answer,
      gradient: getRandomGradient(),
    }));
    
    // Initialize flip states for all cards
    const initialFlipStates: Record<number, boolean> = {};
    formattedCards.forEach(card => {
      initialFlipStates[card.id] = false;
    });
    
    setCards(formattedCards);
    setCardFlipStates(initialFlipStates);
  };

  // Filter cards based on search term
  const filteredCards = cards.filter(card => 
    card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-play functionality
  useEffect(() => {
    // Guard clauses
    if (!isFullScreen || !isPlaying || playlistCards.length === 0) {
      return;
    }

    let startTime = performance.now();
    let animationFrameId: number;
    const progressInterval = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, FLIP_DURATION);

    const animate = (currentTime: number) => {
      if (!isPlaying) {
        clearInterval(progressInterval);
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }

      const elapsed = currentTime - startTime;
      const duration = CARD_DURATION;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      // Update progress state immediately to ensure smooth animation
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Reset flip state first and wait for next render before changing card
        setIsFlipped(false);
        setProgress(0);
        
        // Use setTimeout to ensure the flip state is applied before changing card
        setTimeout(() => {
          setCurrentCardIndex((prev) => (prev + 1) % playlistCards.length);
          startTime = performance.now();
          animationFrameId = requestAnimationFrame(animate);
        }, 50); // Small delay to ensure flip animation completes
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(progressInterval);
      setProgress(0);
    };
  }, [isFullScreen, isPlaying, currentCardIndex, playlistCards, CARD_DURATION]);

  const handleFlip = (cardId?: number) => {
    console.log(`[FlashCards] Flipping card with ID: ${cardId}, isFullScreen: ${isFullScreen}`);
    
    if (isFullScreen) {
      setIsFlipped(!isFlipped);
    } else if (cardId !== undefined) {
      setCardFlipStates(prev => {
        const newState = {
          ...prev,
          [cardId]: !prev[cardId]
        };
        console.log(`[FlashCards] New flip state for card ${cardId}: ${newState[cardId]}`);
        return newState;
      });
    }
  };

  const handleSelect = (id: number) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Updated Play All handler
  const handlePlay = () => {
    if (filteredCards.length === 0) {
      return;
    }
    
    // Force cards to be unflipped before setting fullscreen
    setIsFlipped(false);
    
    // Slight delay before showing fullscreen and starting playback
    setTimeout(() => {
      setPlaylistCards(filteredCards);
      setCurrentCardIndex(0);
      setProgress(0);
      setIsFullScreen(true);
      
      // Small delay before starting playback
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }, 50);
  };

  // Handler for viewing selected cards
  const handleViewSelected = () => {
    if (selectedCards.size === 0) {
      return;
    }
    
    // Force cards to be unflipped before setting fullscreen
    setIsFlipped(false);
    
    // Slight delay before showing fullscreen
    setTimeout(() => {
      const selectedPlaylist = cards.filter(card => selectedCards.has(card.id));
      setPlaylistCards(selectedPlaylist);
      setCurrentCardIndex(0);
      setProgress(0);
      setIsFullScreen(true);
      setIsPlaying(false);
    }, 50);
  };

  const handleClose = () => {
    // First stop playing and reset card to front side
    setIsPlaying(false);
    setIsFlipped(false);
    setProgress(0);
    
    // Then start closing animation
    setIsClosing(true);
    
    setTimeout(() => {
      setIsFullScreen(false);
      setIsClosing(false);
      setCurrentCardIndex(0);
      
      // Ensure card is reset properly after closing
      setTimeout(() => {
        setPlaylistCards([]);
      }, 50);
    }, 300);
  };

  const handleNext = () => {
    if (playlistCards.length === 0) return;
    setIsFlipped(false);
    setIsPlaying(false);
    setProgress(0);
    
    // Small delay to ensure flip state is updated before changing card
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % playlistCards.length);
    }, 50);
  };

  const handlePrevious = () => {
    if (playlistCards.length === 0) return;
    setIsFlipped(false);
    setIsPlaying(false);
    setProgress(0);
    
    // Small delay to ensure flip state is updated before changing card
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + playlistCards.length) % playlistCards.length);
    }, 50);
  };

  const handleTopicChange = (topic: string) => {
    // Only change topic if it exists in our customCards data
    if (customCards[topic]) {
    setSelectedTopic(topic);
      // No need to save here, useEffect handles loading
    } else {
        console.warn(`[FlashCards] Attempted to switch to non-existent topic: ${topic}`);
    }
  };

  const handleAddCard = (newCard: { question: string; answer: string; topic: string }) => {
    const { topic, question, answer } = newCard;
    
    // Update the customCards state
    const updatedCustomCards = { ...customCards };
    if (!updatedCustomCards[topic]) {
      updatedCustomCards[topic] = [];
    }

    // Check for duplicates before adding
    if (!updatedCustomCards[topic].some(card => card.question === question)) {
      updatedCustomCards[topic] = [...updatedCustomCards[topic], { question, answer }];
      setCustomCards(updatedCustomCards);
      console.log(`[FlashCards] Added card to topic ${topic}. New state:`, updatedCustomCards);
      
      // If the new card belongs to the currently selected topic, update the displayed cards
      if (topic === selectedTopic) {
        loadCards(updatedCustomCards[topic]);
      }
      
      // Save the entire updated customCards structure immediately
      saveCustomCardsToLocalStorage(updatedCustomCards);

    } else {
      console.log(`[FlashCards] Card with question "${question}" already exists in topic ${topic}. Not adding.`);
    }

    setIsAddingCard(false);
  };

  // --- Add handleDeleteCard --- START
  const handleDeleteCard = (id: number) => {
    const updatedCustomCards = { ...customCards };
    const currentTopicCards = updatedCustomCards[selectedTopic] || [];

    // Filter out the card to be deleted using its index (id)
    const updatedCardsForTopic = currentTopicCards.filter((_, index) => index !== id);
    
    updatedCustomCards[selectedTopic] = updatedCardsForTopic;
    setCustomCards(updatedCustomCards);
    console.log(`[FlashCards] Deleted card ${id} from topic ${selectedTopic}. New state:`, updatedCustomCards);

    // Update the currently displayed cards
    loadCards(updatedCardsForTopic);
    // Adjust current index if necessary
    if (currentCardIndex >= updatedCardsForTopic.length && updatedCardsForTopic.length > 0) {
      setCurrentCardIndex(updatedCardsForTopic.length - 1);
    } else if (updatedCardsForTopic.length === 0) {
      setCurrentCardIndex(0); // Reset if no cards left
    }

    // Save the entire updated structure immediately
    saveCustomCardsToLocalStorage(updatedCustomCards);
  };
  // --- Add handleDeleteCard --- END

  // Add keyboard event listener to handle Escape key in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

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
          <p className="text-gray-600">No flashcards found. Try adding some or switching topics.</p>
          <button 
            onClick={() => setIsAddingCard(true)}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md"
          >
            Add New Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.topicSelector}>
        {(() => {
          // Get all available topics by combining default topics and custom topics
          const allTopics = new Set([
            ...Object.keys(topics),
            ...Object.keys(customCards).filter(topic => customCards[topic] && customCards[topic].length > 0)
          ]);
          
          return Array.from(allTopics).map(topic => (
            <button
              key={topic}
              onClick={() => handleTopicChange(topic)}
              className={`${styles.topicButton} ${selectedTopic === topic ? styles.active : ''}`}
            >
              {topic}
            </button>
          ));
        })()}
      </div>

      <div className={styles.controls}>
        <button
          onClick={handlePlay}
          disabled={filteredCards.length === 0}
          className={styles.playButton}
        >
          Play All Cards
        </button>
        <button
          onClick={() => setIsAddingCard(true)}
          className={styles.addButton}
        >
          Add New Card
        </button>
        {selectedCards.size > 0 && (
          <button
            onClick={handleViewSelected}
            className={styles.selectedButton}
          >
            View Selected ({selectedCards.size})
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {filteredCards.map((card) => (
          <FlashCard
            key={card.id}
            id={card.id}
            front={card.question}
            back={card.answer}
            isSelected={selectedCards.has(card.id)}
            onSelect={() => handleSelect(card.id)}
            isFlipped={cardFlipStates[card.id] || false}
            onFlip={() => handleFlip(card.id)}
            gradient={card.gradient}
            onFullScreen={() => {
              setCurrentCardIndex(filteredCards.findIndex(c => c.id === card.id));
              setIsFullScreen(true);
            }}
            onDelete={() => handleDeleteCard(card.id)}
          />
        ))}
      </div>

      {isFullScreen && playlistCards.length > 0 && (
        <div 
          className={`${styles.fullScreenOverlay} ${isClosing ? styles.closing : ''}`} 
          tabIndex={0}
        >
          <div className={styles.fullScreenContent}>
            <div className={styles.fullscreenHeader}>
              <h3 className={styles.fullscreenTitle}>
                {selectedTopic} Flashcards
              </h3>
              <div className={styles.headerControls}>
                <span className={styles.cardCounter}>
                  {currentCardIndex + 1} / {playlistCards.length}
                </span>
                <button 
                  className={styles.fullscreenCloseButton}
                  onClick={handleClose}
                  aria-label="Close fullscreen"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1003 }}>
              <ProgressBar 
                key={`progress-${currentCardIndex}-${progress}`}
                progress={progress} 
                totalCards={playlistCards.length}
                currentCardIndex={currentCardIndex}
              />
            </div>

            <FlashCard
              front={playlistCards[currentCardIndex].question}
              back={playlistCards[currentCardIndex].answer}
              gradient={playlistCards[currentCardIndex].gradient}
              isFullScreen={true}
              isFlipped={isFlipped}
              onFlip={() => !isPlaying && handleFlip()}
            />

            <div className={styles.controls}>
              <button onClick={handlePrevious} disabled={isPlaying || playlistCards.length <= 1}>Previous</button>
              <button onClick={() => {
                setIsPlaying(!isPlaying);
              }}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={handleNext} disabled={isPlaying || playlistCards.length <= 1}>Next</button>
            </div>
          </div>
        </div>
      )}

      {isAddingCard && (
        <AddCardForm
          onAdd={handleAddCard}
          onClose={() => setIsAddingCard(false)}
          availableTopics={Array.from(new Set([
            ...Object.keys(topics),
            ...Object.keys(customCards).filter(topic => customCards[topic] && customCards[topic].length > 0)
          ]))}
        />
      )}
    </div>
  );
}
