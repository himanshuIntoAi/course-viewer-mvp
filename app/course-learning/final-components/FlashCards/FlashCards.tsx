'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';

const getRandomGradient = () => {
  const gradients = [
    'linear-gradient(270deg, #696EFF 0%, #F8ACFF 100%)',
    'linear-gradient(270deg, #E8B595 0%, #B190BA 100%)',
    'linear-gradient(270deg, #5CB270 0%, #DBDA79 100%)',
    'linear-gradient(270deg, #028CF3 0%, #2FEAA8 100%)',
    'linear-gradient(270deg, #939781 0%, #EED991 100%)',
    'linear-gradient(270deg, #F4D444 0%, #F86CA7 100%)',
  ];

  return gradients[Math.floor(Math.random() * gradients.length)];
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
  const [isOpen, setIsOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

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


  // ✅ progress based on current position
  const progressPercentage = totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0;

  const completeCard = () => {
    setCompletedCards((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentCardIndex);
      return newSet;
    });
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };
  const nextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };


  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const skipCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
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

        {/* Main Card Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 ">
          <div className="flex items-center justify-between mb-8 w-[48vw] relative ">
            <h1 className="text-2xl font-bold text-white text-center flex-1 mr-5">User Experience (UX) Flashcards</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-4xl hover:text-gray-200 transition-colors ml-5 absolute right-0 "
            >
              ×
            </button>
          </div>


          {/* Card */}
          <div className="max-w-4xl w-full relative">
            <div className="w-full h-[3px] bg-gray-300 mb-8 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5A09FF] transition-all duration-300 ease-in-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <div className='w-full h-[45px] bg-[#3D3D3D] text-white flex items-center justify-center'>
              <p className="" > <span className='bg-[#864EF6] px-2 py-1' >{currentCardIndex + 1}</span> Flashcards</p>
              <button
                onClick={completeCard}
                className="absolute right-6"
              >
                ...
              </button>

            </div>
            <div className="bg-gradient-to-br from-sky-300 to-blue-400  p-8 min-h-[500px] flex flex-col relative shadow-2xl">
              {/* Left Arrow - Inside Card */}
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-200 transition-colors z-10 ${currentCardIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Image src={"/flashcard/leftIcon.svg"} alt='' width={30} height={30} />

              </button>

              {/* Right Arrow - Inside Card */}
              <button
                onClick={nextCard}
                disabled={currentCardIndex === totalCards - 1}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-200 transition-colors z-10 ${currentCardIndex === totalCards - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Image src={"/flashcard/forwardIcon.svg"} alt='' width={30} height={30} />

              </button>

              {/* Card Header - Top Inside Card */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Image src={"/flashcard/questionIcon.svg"} alt='' width={30} height={30} />
                  </div>
                  <span className="text-xl text-black">Question</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={skipCard}
                    className="text-black hover:text-gray-200 transition-colors font-medium"
                  >
                    Skip
                  </button>
                  <button className="text-white hover:text-gray-200 transition-colors">
                    <Image src={"/flashcard/volumeIcon.svg"} alt='' width={30} height={30} />
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
                    <Image src={"/flashcard/shuffleIcon.svg"} alt='' width={30} height={30} />
                  </button>
                  <button className="text-white hover:text-gray-200 transition-colors">
                    <Image src={"/flashcard/heartIcon.svg"} alt='' width={30} height={30} />
                  </button>
                </div>

                {/* Center Controls */}
                <div className="flex flex-col items-center gap-6 mt-9">
                  <div className="flex items-center gap-4">
                    <Image src={"/flashcard/cancelIcon.svg"} alt='' width={30} height={30} />
                    <Image src={"/flashcard/playIcon.svg"} alt='' width={30} height={30} />
                    <Image src={"/flashcard/rightIcon.svg"} alt='' width={30} height={30} />
                  </div>
                  <span className="text-black text-xl font-semibold ">
                    {currentCardIndex + 1} / {totalCards}
                  </span>

                </div>

                {/* Right Flip Button */}
                <button
                  onClick={flipCard}
                  className="flex flex-col items-center gap-2 text-white hover:text-gray-200 transition-colors"
                >
                  <Image src={"/flashcard/clickToFlipIcon.svg"} alt='' width={30} height={30} />
                  <span className="text-lg font-medium text-black">Click to flip</span>
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
    <div className="w-[32%] h-[40vh] px-5 sm:px-8 md:px-12 lg:px-16 py-6">
      <div className="w-full h-full rounded-[28px] shadow-md overflow-hidden" style={{ background: card.gradient }}>
        {/* Top bar */}
        <div className="w-full flex items-center justify-between  text-white px-6 md:px-8 py-3">
          <div className="flex items-center gap-2">
            <Image src="/flashcard/flashcardIcon4.svg" alt='question icon' width={30} height={30} />
            <span className="text-sm md:text-base font-medium">Question</span>
          </div>
        </div>

        {/* Card body */}
        <div className="relative w-full h-[calc(100%-48px)]">
          <div className="absolute inset-0 flex  pt-8 justify-center  md:px-12 text-white">
            <p className="text-center text-lg md:text-3xl lg:text-[34px] font-light leading-snug">
              {card.question}
            </p>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white">
            {/* <button className="w-10 h-10 rounded-lg border-2 border-white/90 flex items-center justify-center" aria-label="mark">
              <div className="w-4 h-4 border-2 border-white/90" />
            </button>
             */}
            <Image src="/flashcard/flashcardIcon1.svg" alt='mark icon' width={30} height={30} />

            <Image src="/flashcard/flashcardIcon2.svg" alt='link icon' width={30} height={30} />

            <Image src="/flashcard/flashcardIcon3.svg" alt='save icon' width={30} height={30} />
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
      <div className='w-[90vw] mx-auto flex flex-wrap items-center justify-between pb-8'>
        {cards.slice(0, 6).map((card, index) => (
          <Card key={card.id} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}
