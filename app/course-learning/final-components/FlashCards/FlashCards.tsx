'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';


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
  courseId?: string; // Course ID for API calls
  topicId?: number; // Topic ID for filtering flashcards
}


function RenderPlayingCards({ cards }: { cards: FlashCardType[] }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use the passed cards data or fallback to mock data
  const flashcards = cards.length > 0 ? cards : [
    { question: "Describe the concept of User Experience (UX).", answer: "User Experience (UX) is the overall experience a person has when interacting with a product or service." },
    { question: "What are the main principles of UX design?", answer: "The main principles include usability, accessibility, desirability, and utility." },
    { question: "What is the difference between UX and UI?", answer: "UX focuses on user experience and interaction, while UI focuses on visual design and interface elements." },
    { question: "What is user research in UX?", answer: "User research is the process of understanding user behaviors, needs, and motivations through various research methods." },
    { question: "What is wireframing in UX design?", answer: "Wireframing is creating a visual guide that represents the skeletal framework of a website or application." },
    { question: "What is prototyping in UX?", answer: "Prototyping is creating interactive models of a product to test and validate design concepts before development." },
    { question: "What is usability testing?", answer: "Usability testing is evaluating a product by testing it with representative users to identify usability problems." },
    { question: "What are personas in UX design?", answer: "Personas are fictional characters created to represent different user types that might use a product or service." },
    { question: "What is information architecture?", answer: "Information architecture is the structural design of information environments to help users find and manage information." },
    { question: "What is user journey mapping?", answer: "User journey mapping is visualizing the process a user goes through to achieve a goal with a product or service." },
    { question: "What is accessibility in UX?", answer: "Accessibility is designing products to be usable by people with disabilities and diverse abilities." },
    { question: "What is responsive design?", answer: "Responsive design is an approach that makes web pages render well on various devices and screen sizes." },
    { question: "What is mobile-first design?", answer: "Mobile-first design is designing for mobile devices first, then scaling up to larger screens." },
    { question: "What is A/B testing in UX?", answer: "A/B testing is comparing two versions of a webpage or app to see which performs better." },
    { question: "What is heuristic evaluation?", answer: "Heuristic evaluation is reviewing a user interface to identify usability problems based on established principles." },
    { question: "What is card sorting in UX?", answer: "Card sorting is a method used to help design or evaluate the information architecture of a site." }
  ];

  const currentCard = flashcards[currentCardIndex];
  const totalCards = flashcards.length;

  const nextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const skipCard = () => {
    nextCard();
  };

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className='flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors'
           onClick={() => setIsOpen(true)}>
        <Image src="/images/playIconCards.svg" alt='play icon' width={20} height={20} />
        <span className="text-gray-700 font-medium">Play Cards</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full min-h-full bg-black bg-opacity-80 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-4xl font-bold text-white text-center flex-1">User Experience (UX) Flashcards</h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white text-4xl hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Main Card Content */}
        <div className="flex-1 flex items-center justify-center px-8">
          {/* Card */}
          <div className="max-w-4xl w-full relative">
            <div className="bg-gradient-to-br from-sky-300 to-blue-400 rounded-3xl p-8 min-h-[500px] flex flex-col relative shadow-2xl">
              {/* Left Arrow - Inside Card */}
              <button 
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-200 transition-colors z-10 ${currentCardIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                ←
              </button>

              {/* Right Arrow - Inside Card */}
              <button 
                onClick={nextCard}
                disabled={currentCardIndex === totalCards - 1}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-200 transition-colors z-10 ${currentCardIndex === totalCards - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                →
              </button>

              {/* Card Header - Top Inside Card */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center">
                    <span className="text-lg font-bold">?</span>
                  </div>
                  <span className="text-xl font-semibold">Question</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={skipCard}
                    className="text-white hover:text-gray-200 transition-colors font-medium"
                  >
                    Skip
                  </button>
                  <button className="text-white hover:text-gray-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a5 5 0 010 7.072M6.343 6.343A10 10 0 0117.657 17.657M4.929 4.929a10 10 0 0114.142 14.142" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 flex items-center justify-center px-12">
                <p className="text-white text-3xl font-semibold text-center leading-relaxed">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
              </div>

              {/* Bottom Controls - Inside Card */}
              <div className="flex items-center justify-between pt-6">
                {/* Left Icons */}
                <div className="flex items-center gap-4">
                  <button className="text-white hover:text-gray-200 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  <button className="text-white hover:text-gray-200 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Center Controls */}
                <div className="flex items-center gap-6">
                  <span className="text-white text-xl font-semibold">
                    {currentCardIndex + 1} / {totalCards}
                  </span>
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isPlaying ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6l4-3-4-3z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right Flip Button */}
                <button 
                  onClick={flipCard}
                  className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
                >
                  <span className="text-lg font-medium">Click to flip</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ card }: { card: FlashCardType; index: number }) {
  return (
    <div className="w-[30%] h-[40vh] px-5 sm:px-8 md:px-12 lg:px-16 py-6">
      <div className="w-full h-full rounded-[28px] shadow-md overflow-hidden" style={{ background: card.gradient }}>
        {/* Top bar */}
        <div className="w-full flex items-center justify-between  text-white px-6 md:px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-white/80 flex items-center justify-center text-sm">?</div>
            <span className="text-sm md:text-base font-medium">Question</span>
          </div>
        </div>

        {/* Card body */}
        <div className="relative w-full h-[calc(100%-48px)]">
          <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12 text-white">
            <p className="text-center text-xl md:text-3xl lg:text-[34px] font-semibold leading-snug">
              {card.question}
            </p>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white">
            <button className="w-10 h-10 rounded-lg border-2 border-white/90 flex items-center justify-center" aria-label="mark">
              <div className="w-4 h-4 border-2 border-white/90" />
            </button>

            <button className="w-10 h-10 flex items-center justify-center" aria-label="link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.5l4 4a3 3 0 01-4.24 4.24l-1-1M10.5 17.5l-4-4A3 3 0 0110.76 9.26l1 1" /></svg>
            </button>

            <button className="w-10 h-10 rounded-lg border-2 border-white/90 flex items-center justify-center" aria-label="save">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a1 1 0 011 1v14l-7-3-7 3V5a1 1 0 011-1z" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9l2 2-2 2-2-2 2-2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface APIFlashcard {
  id: number;
  front: string;
  back: string;
  topic_id: number;
  card_order: number;
}

export default function FlashCards({ initialCards, courseId, topicId }: FlashCardsProps) {
  const [cards, setCards] = useState<FlashCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch flashcard data from API
  useEffect(() => {
    const fetchFlashcardData = async () => {
      if (!courseId) {
        // Use initialCards if no courseId provided
        if (initialCards && initialCards.length > 0) {
          const flashCards: FlashCardType[] = initialCards.map((card, index) => ({
            id: index,
            question: card.question,
            answer: card.answer,
            gradient: getRandomGradient()
          }));
          setCards(flashCards);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        console.log('[FlashCards] Fetching flashcards for courseId:', courseId, 'topicId:', topicId);

        // Get all flashcards for the course
        const flashcardsResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/flashcards/`);

        if (!flashcardsResponse.ok) {
          throw new Error(`Failed to fetch flashcards: ${flashcardsResponse.status}`);
        }

        const flashcards = await flashcardsResponse.json();
        console.log('[FlashCards] Fetched flashcards:', flashcards.length);

        // Filter flashcards by topic_id if provided
        let filteredFlashcards = flashcards;
        if (topicId) {
          filteredFlashcards = flashcards.filter((flashcard: APIFlashcard) => flashcard.topic_id === topicId);
          console.log('[FlashCards] Filtered flashcards for topicId:', topicId, 'count:', filteredFlashcards.length);
        }

        if (filteredFlashcards.length > 0) {
          // Sort flashcards by card_order
          const sortedFlashcards = filteredFlashcards.sort((a: APIFlashcard, b: APIFlashcard) => a.card_order - b.card_order);

          // Convert to FlashCardType format with gradients
          const flashCards: FlashCardType[] = sortedFlashcards.map((flashcard: APIFlashcard) => ({
            id: flashcard.id,
            question: flashcard.front,
            answer: flashcard.back,
            gradient: getRandomGradient()
          }));

          setCards(flashCards);
          console.log('[FlashCards] Processed flashcards:', flashCards.length);
        } else {
          // Fallback to initialCards or default data
          if (initialCards && initialCards.length > 0) {
            const flashCards: FlashCardType[] = initialCards.map((card, index) => ({
              id: index,
              question: card.question,
              answer: card.answer,
              gradient: getRandomGradient()
            }));
            setCards(flashCards);
          } else {
            // Default fallback cards
            const defaultCards: FlashCardType[] = [
              {
                id: 1,
                question: "What is the main topic?",
                answer: "This is the main topic content",
                gradient: getRandomGradient()
              },
              {
                id: 2,
                question: "Key concept to remember",
                answer: "Important information about this concept",
                gradient: getRandomGradient()
              },
              {
                id: 3,
                question: "Practice question",
                answer: "Answer to the practice question",
                gradient: getRandomGradient()
              }
            ];
            setCards(defaultCards);
          }
        }
      } catch (error) {
        console.error('[FlashCards] Error fetching flashcard data:', error);
        
        // Fallback to initialCards or default data on error
        if (initialCards && initialCards.length > 0) {
          const flashCards: FlashCardType[] = initialCards.map((card, index) => ({
            id: index,
            question: card.question,
            answer: card.answer,
            gradient: getRandomGradient()
          }));
          setCards(flashCards);
        } else {
          // Default fallback cards
          const defaultCards: FlashCardType[] = [
            {
              id: 1,
              question: "What is the main topic?",
              answer: "This is the main topic content",
              gradient: getRandomGradient()
            },
            {
              id: 2,
              question: "Key concept to remember",
              answer: "Important information about this concept",
              gradient: getRandomGradient()
            },
            {
              id: 3,
              question: "Practice question",
              answer: "Answer to the practice question",
              gradient: getRandomGradient()
            }
          ];
          setCards(defaultCards);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcardData();
  }, [courseId, topicId, initialCards]);

  // Initialize cards from initialCards prop
  // useEffect(() => {
  //   console.log("[FlashCards] Initializing. Received initialCards prop:", initialCards);

  //   if (initialCards && initialCards.length > 0) {
  //     console.log("[FlashCards] Using initialCards prop:", initialCards);
  //     // Convert to FlashCardType format with gradients
  //     const flashCards: FlashCardType[] = initialCards.map((card, index) => ({
  //       id: index,
  //       question: card.question,
  //       answer: card.answer,
  //       gradient: getRandomGradient()
  //     }));

  //     setCards(flashCards);
  //     setCardFlipStates({});
  //     setIsLoading(false);

  //     console.log("[FlashCards] Initialization complete. Loaded cards:", flashCards.length);
  //   } else {
  //     console.log("[FlashCards] No initialCards provided");
  //     setCards([]);
  //     setIsLoading(false);
  //   }
  // }, [initialCards]);
  // // Filter cards (simplified - no search functionality)
  // const filteredCards = cards;


  // const handleFlip = (cardId: number) => {
  //   setCardFlipStates(prev => ({
  //     ...prev,
  //     [cardId]: !prev[cardId]
  //   }));
  // };



  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center w-full h-full p-8">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
  //         <p className="text-gray-600">Loading flashcards...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (cards.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center w-full h-full p-8">
  //       <div className="text-center">
  //         <p className="text-gray-600">No flashcards available.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // const total = filteredCards.length;
  // const clampedIndex = Math.max(0, Math.min(currentIndex, total - 1));
  // const activeCard = filteredCards[clampedIndex];

  // const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  // const goNext = () => setCurrentIndex((i) => Math.min(total - 1, i + 1));
  // const flipActive = () => handleFlip(activeCard.id);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen overflow-y-auto">
        <div className='flex items-center gap-3 bg-gray-100 p-4 pl-12'>
          <Image src="/images/flashcardIcon.svg" alt='flashcard icon' width={26} height={26} />
          <p className='font-medium'>Flash Cards</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading flashcards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className='flex items-center gap-3 bg-gray-100 p-4 pl-12'>
        <Image src="/images/flashcardIcon.svg" alt='flashcard icon' width={26} height={26} />
        <p className='font-medium'>Flash Cards</p>
      </div>
      <div className='flex items-center justify-between w-[80vw] mx-auto mb-6 mt-5'>
        <div className='relative flex-1 max-w-md'>
          <input 
            type="text" 
            placeholder="Search Cards..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Image 
            src="/images/course-catalog/search-icon.svg" 
            alt='search icon' 
            width={20} 
            height={20} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        <RenderPlayingCards cards={cards} />
      </div>
      <div className='w-[80vw] mx-auto flex flex-wrap items-center justify-between pb-8'>
        {cards.slice(0, 6).map((card, index) => (
          <Card key={card.id} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}
