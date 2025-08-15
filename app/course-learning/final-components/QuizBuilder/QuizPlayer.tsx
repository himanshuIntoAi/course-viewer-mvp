import React, { useEffect, useRef, useCallback } from 'react';
import { Check, X, Clock } from 'lucide-react';
import './QuizBuilder.css';
// Remove Image import
// import Image from 'next/image';
// Remove dnd-kit imports
/*
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable, 
  useDroppable, 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
*/

// Import types and components from QuizBuilder in the same folder
import { 
  Question, 
  QuestionType, 
  TrueFalseQuestion, 
  ChoiceQuestion, 
  OpenEndedQuestion, 
  FillInBlanksQuestion, 
  SortAnswerQuestion, 
  MatchingQuestion, 
  QuizData,
  UserAnswers,
  EliminatedOptions,
  SortableQuizList,
  MatchingQuestionQuizMode
} from './QuizBuilder'; // Updated import path

// Update QuizPlayerProps
interface QuizPlayerProps {
  quizData: QuizData; 
  questions: Question[]; 
  onExitQuiz: () => void; 
  // Add props for lifted state
  userAnswers: UserAnswers;
  setUserAnswers: React.Dispatch<React.SetStateAction<UserAnswers>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  remainingTime: number | null;
  setRemainingTime: React.Dispatch<React.SetStateAction<number | null>>;
  eliminatedOptions: EliminatedOptions;
  setEliminatedOptions: React.Dispatch<React.SetStateAction<EliminatedOptions>>;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ 
  quizData, 
  questions, 
  onExitQuiz,
  // Destructure new props
  userAnswers,
  setUserAnswers,
  quizSubmitted,
  setQuizSubmitted,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  remainingTime,
  setRemainingTime,
  eliminatedOptions,
  setEliminatedOptions
}) => {
  // Remove internal state for lifted variables
  // const [userAnswers, setUserAnswers] = useState<UserAnswers>({}); // Removed
  // const [quizSubmitted, setQuizSubmitted] = useState(false); // Removed
  // const [eliminatedOptions, setEliminatedOptions] = useState<EliminatedOptions>({}); // Removed
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Removed
  // const [remainingTime, setRemainingTime] = useState<number | null>(null); // Removed
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement | null>(null); 

  // Helper function to format time (MM:SS)
  const formatTime = (totalSeconds: number | null): string => {
    if (totalSeconds === null || totalSeconds < 0) return '--:--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to handle quiz submission (using props)
  const submitQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setQuizSubmitted(true); // Use prop setter
    setRemainingTime(null); // Use prop setter
  }, [setQuizSubmitted, setRemainingTime]);

  // Effect to handle the countdown timer (using props)
  useEffect(() => {
    if (!quizSubmitted && quizData.timeLimit && quizData.timeLimit > 0) {
      // Initialize timer only if remainingTime is null (first render or reset)
      if (remainingTime === null) {
         setRemainingTime(quizData.timeLimit * 60); // Use prop setter
      }

      // Clear existing timer before starting a new one
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Only start the interval if remainingTime is a positive number
      if (remainingTime !== null && remainingTime > 0) {
        timerRef.current = setInterval(() => {
          // Use functional update with prop setter to avoid stale state issues
          setRemainingTime(prevTime => {
            if (prevTime === null || prevTime <= 1) {
              clearInterval(timerRef.current!); 
              timerRef.current = null;
              // Call submitQuiz which uses the prop setter
              submitQuiz(); 
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }

      // Cleanup function
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      // Clear timer if quiz is submitted or has no time limit
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Ensure remaining time is nullified if quiz is submitted
      if (quizSubmitted && remainingTime !== null) {
         setRemainingTime(null); // Use prop setter
      }
    }
  // Dependencies: include props that affect the timer
  }, [quizSubmitted, quizData.timeLimit, remainingTime, setRemainingTime, submitQuiz]); 

   // Handle user answer changes (using props)
  const handleAnswerChange = (
    questionId: string, 
    value: boolean | number | number[] | string | string[] | Record<string, string>,
    type: QuestionType
  ) => {
    // Use prop setter with functional update
    setUserAnswers((prev: UserAnswers) => ({
      ...prev,
      [questionId]: { type, value }
    }));
  };
  
  // Handler for Eliminating Options (using props)
  const handleEliminateOption = (questionId: string, optionIndex: number) => {
     // Use prop setter with functional update
    setEliminatedOptions((prev: EliminatedOptions) => { 
      const currentEliminated = prev[questionId] || [];
      if (currentEliminated.includes(optionIndex)) {
        // Remove option
        return {
          ...prev,
          [questionId]: currentEliminated.filter((index: number) => index !== optionIndex) 
        };
      } else {
        // Add option
        return {
          ...prev,
          [questionId]: [...currentEliminated, optionIndex]
        };
      }
    });
  };

  // Check if answer is correct (uses userAnswers prop)
  const isAnswerCorrect = (question: Question): boolean | undefined => {
    if (!userAnswers[question.id]) return undefined; // Undefined for unanswered
    
    const userAnswerValue = userAnswers[question.id].value; // Read from prop

    switch (question.type) {
      case QuestionType.TrueFalse:
        return userAnswerValue === (question as TrueFalseQuestion).correctAnswer;
        
      case QuestionType.SingleChoice:
        return (question as ChoiceQuestion).correctAnswers.includes(userAnswerValue as number);
        
      case QuestionType.MultipleChoice:
        const choiceQuestion = question as ChoiceQuestion;
        const multiAnswer = userAnswerValue as number[];
        return Array.isArray(multiAnswer) &&
               multiAnswer.length === choiceQuestion.correctAnswers.length && 
               multiAnswer.every(val => choiceQuestion.correctAnswers.includes(val));
        
      case QuestionType.FillInBlanks:
        const fillQuestion = question as FillInBlanksQuestion;
        const fillAnswers = userAnswerValue as string[];
        return Array.isArray(fillAnswers) &&
               fillAnswers.length === fillQuestion.answers.length && 
               fillAnswers.every((ans, idx) => 
                 ans?.toLowerCase().trim() === fillQuestion.answers[idx]?.toLowerCase().trim()
               );
        
      case QuestionType.SortAnswer:
        const sortQuestion = question as SortAnswerQuestion;
        const sortAnswers = userAnswerValue as string[];
        const expectedSortedItems = sortQuestion.correctOrder.map(index => sortQuestion.items[index]);
        return Array.isArray(sortAnswers) &&
               sortAnswers.length === expectedSortedItems.length && 
               sortAnswers.every((item, idx) => 
                 item?.trim() === expectedSortedItems[idx]?.trim()
               );
        
      case QuestionType.Matching:
      case QuestionType.ImageMatching:
        const matchQuestion = question as MatchingQuestion;
        const matchAnswers = userAnswerValue as Record<string, string> || {}; 
        const answerKeys = Object.keys(matchAnswers);
        return answerKeys.length === matchQuestion.items.length && 
               answerKeys.every(itemId => {
                 const item = matchQuestion.items.find(i => i.id === itemId);
                 return item && item.right === matchAnswers[itemId];
               });
        
      case QuestionType.OpenEnded:
        // Open ended questions are typically manually graded or not automatically checked for correctness
        return undefined; // Or false, depending on desired behavior for results display
        
      default:
         // Exhaustive check: All types should be handled above.
         // const _exhaustiveCheck: never = question.type; // TypeScript confirms this is never
         return false; // Should not be reached
    }
  };

  // Calculate user score (uses userAnswers prop)
  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      // Check userAnswers prop
      if (userAnswers[question.id] && isAnswerCorrect(question)) {
        earnedPoints += question.points;
      }
    });
    
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = quizData.passingGrade !== undefined ? percentage >= quizData.passingGrade : true; 
    
    return {
      earned: earnedPoints,
      total: totalPoints,
      percentage: percentage,
      passed: passed 
    };
  };

  // Content for each question type (uses props: quizSubmitted, userAnswers, eliminatedOptions, isAnswerCorrect)
  function renderQuestionInterface(question: Question) {
      // Read props
      const hasAnswered = question.id in userAnswers;
      const isCorrect = quizSubmitted && hasAnswered && isAnswerCorrect(question);
      const currentEliminated = eliminatedOptions[question.id] || [];
      
      // Common result indicator (uses props)
      const ResultIndicator = () => quizSubmitted ? ( // Reads quizSubmitted prop
        <div className={`flex items-center mt-1 text-xs ${ 
          isCorrect ? 'text-green-600' : 
          !hasAnswered ? 'text-gray-600' : 
          'text-red-600'
        }`}>
          {isCorrect ? (
            <>
              <Check size={14} className="mr-1" /> 
              <span>Correct</span>
            </>
          ) : !hasAnswered ? (
            <>
               <X size={14} className="mr-1" /> 
              <span>Not Answered</span>
            </>
          ) : (
            <>
               <X size={14} className="mr-1" /> 
              <span>Incorrect</span>
            </>
          )}
        </div>
      ) : null;

      // Compact mode adjustment
      const isCompact = true; // Use compact mode for quiz player items

      switch (question.type) {
        case QuestionType.TrueFalse:
          // ... (Component logic uses handleAnswerChange prop) ...
          return (
            <div className="space-y-2">
              <div className="mt-4 grid grid-cols-2 gap-4">
                {/* True Option Label */}
                <label className={`flex items-center p-3 border rounded-md cursor-pointer 
                  ${quizSubmitted && (question as TrueFalseQuestion).correctAnswer === true ? 'border-green-500 bg-green-100 font-medium' : 'border-gray-300'} 
                  ${!quizSubmitted && userAnswers[question.id]?.value === true ? 'border-teal-500 bg-teal-50' : ''} 
                  ${quizSubmitted ? 'cursor-not-allowed opacity-80' : ''} 
                  ${quizSubmitted && userAnswers[question.id]?.value === true && (question as TrueFalseQuestion).correctAnswer !== true ? 'border-red-500 bg-red-100 opacity-100' : ''} 
                  `}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={userAnswers[question.id]?.value === true}
                    onChange={() => handleAnswerChange(question.id, true, QuestionType.TrueFalse)}
                    disabled={quizSubmitted}
                    className="mr-2 accent-teal-600"
                  />
                  <span>True</span>
                   {quizSubmitted && (question as TrueFalseQuestion).correctAnswer === true && <Check size={16} className="ml-auto text-green-600" />} 
                   {quizSubmitted && userAnswers[question.id]?.value === true && (question as TrueFalseQuestion).correctAnswer !== true && <X size={16} className="ml-auto text-red-600" />} 
                 </label>
                 {/* False Option Label */}
                 <label className={`flex items-center p-3 border rounded-md cursor-pointer 
                   ${quizSubmitted && (question as TrueFalseQuestion).correctAnswer === false ? 'border-green-500 bg-green-100 font-medium' : 'border-gray-300'} 
                   ${!quizSubmitted && userAnswers[question.id]?.value === false ? 'border-teal-500 bg-teal-50' : ''} 
                   ${quizSubmitted ? 'cursor-not-allowed opacity-80' : ''} 
                   ${quizSubmitted && userAnswers[question.id]?.value === false && (question as TrueFalseQuestion).correctAnswer !== false ? 'border-red-500 bg-red-100 opacity-100' : ''} 
                   `}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={userAnswers[question.id]?.value === false}
                    onChange={() => handleAnswerChange(question.id, false, QuestionType.TrueFalse)}
                    disabled={quizSubmitted}
                    className="mr-2 accent-teal-600"
                  />
                  <span>False</span>
                   {quizSubmitted && (question as TrueFalseQuestion).correctAnswer === false && <Check size={16} className="ml-auto text-green-600" />} 
                   {quizSubmitted && userAnswers[question.id]?.value === false && (question as TrueFalseQuestion).correctAnswer !== false && <X size={16} className="ml-auto text-red-600" />} 
                 </label>
              </div>
               <ResultIndicator />
             </div>
           );

        case QuestionType.SingleChoice:
        case QuestionType.MultipleChoice:
          // ... (Component logic uses handleAnswerChange, handleEliminateOption props) ...
          const choiceQuestion = question as ChoiceQuestion;
          const isSingle = question.type === QuestionType.SingleChoice;
          
          return (
            <div className="space-y-1.5"> 
              {choiceQuestion.options.map((option, index) => {
                // Type-safe check for isSelected
                const isSelected = (() => {
                  const answerData = userAnswers[question.id];
                  if (!answerData) return false;
                  if (isSingle) {
                      // For SingleChoice, value should be number
                      return answerData.type === QuestionType.SingleChoice && answerData.value === index;
                  } else {
                      // For MultipleChoice, value should be number[]
                      if (answerData.type === QuestionType.MultipleChoice && Array.isArray(answerData.value)) {
                        // Assert type here after checks pass
                        return (answerData.value as number[]).includes(index);
                      }
                      return false; // Should not happen if types are consistent
                  }
                })();

                const isEliminated = currentEliminated.includes(index);
                
                return (
                  <div key={`${question.id}-${index}`} className={`flex items-center justify-between p-1.5 rounded-md transition-colors duration-150 ${ quizSubmitted && choiceQuestion.correctAnswers.includes(index) ? 'bg-green-50' : '' } ${ quizSubmitted && isSelected && !choiceQuestion.correctAnswers.includes(index) ? 'bg-red-50' : '' } ${isEliminated ? 'bg-gray-100 opacity-60' : ''}`}>
                     <label className={`flex items-center flex-grow text-sm ${isEliminated ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type={isSingle ? 'radio' : 'checkbox'}
                        name={`question_${question.id}`} 
                        value={index.toString()} 
                        checked={isSelected}
                        onChange={() => {
                          if (isSingle) { handleAnswerChange(question.id, index, QuestionType.SingleChoice); } 
                          else {
                            // Ensure currentAnswer is treated as number[] for multiple choice
                            const currentSelection = (userAnswers[question.id]?.value as number[] | undefined) || [];
                            const newSelection = isSelected ? currentSelection.filter(i => i !== index) : [...currentSelection, index];
                            handleAnswerChange(question.id, newSelection.sort((a, b) => a - b), QuestionType.MultipleChoice);
                          }
                        }}
                        disabled={quizSubmitted || isEliminated}
                        className="mr-1.5" 
                      />
                      <span className={`${isEliminated ? 'line-through text-gray-500' : ''}`}>{option}</span>
                    </label>
                    {quizSubmitted && choiceQuestion.correctAnswers.includes(index) && ( <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full shrink-0 flex items-center"><Check size={12} className="mr-0.5" /> Correct</span> )}
                    {quizSubmitted && isSelected && !choiceQuestion.correctAnswers.includes(index) && ( <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full shrink-0 flex items-center"><X size={12} className="mr-0.5" /> Incorrect</span> )}
                    {!quizSubmitted && (
                       <button onClick={() => handleEliminateOption(question.id, index)} className={`ml-1.5 p-0.5 rounded-full shrink-0 ${isEliminated ? 'text-red-600 bg-red-100 hover:bg-red-200' : 'text-gray-400 hover:text-red-500 hover:bg-red-100'}`} title={isEliminated ? `Restore option "${option}"` : `Eliminate option "${option}"`} aria-label={isEliminated ? `Restore option "${option}"` : `Eliminate option "${option}"`}>
                         <X size={12} />
                       </button>
                     )}
                   </div>
                 );
               })}
               {quizSubmitted && <ResultIndicator />} 
             </div>
           );
        
        case QuestionType.OpenEnded:
          // ... (Component logic uses handleAnswerChange prop) ...
          const openQuestion = question as OpenEndedQuestion;
          const oeAnswer = userAnswers[question.id]?.value as string || '';
          return (
            <div className="space-y-2">
               <textarea
                 className="w-full p-1.5 border border-gray-300 rounded-md text-sm" 
                 placeholder="Type your answer here..."
                 value={oeAnswer}
                 onChange={(e) => handleAnswerChange(question.id, e.target.value, QuestionType.OpenEnded)}
                 disabled={quizSubmitted}
                 rows={2} 
               />
               {quizSubmitted && (
                 <div className="mt-1.5">
                   <div className="text-xs font-medium text-gray-700">Model Answer:</div>
                   <div className="p-2 bg-gray-50 rounded-md border border-gray-200 text-xs mt-1">
                     {openQuestion.modelAnswer}
                   </div>
                   <div className="mt-1 text-xs text-gray-600"> 
                     <span className="font-medium">Note:</span> Open-ended questions require manual grading.
                   </div>
                 </div>
               )}
             </div>
           );
           
        case QuestionType.FillInBlanks:
          // ... (Component logic uses handleAnswerChange prop) ...
           const fillQuestion = question as FillInBlanksQuestion;
           const blanksParts = fillQuestion.questionWithBlanks.split('_____');
           const fbAnswers = userAnswers[question.id]?.value as string[] | undefined;
           const userBlankAnswers = fbAnswers || Array(fillQuestion.answers.length).fill('');
           return (
             <div className="space-y-2">
               <div className="text-sm"> 
                 {blanksParts.map((part, i) => {
                   if (i === blanksParts.length - 1) return <span key={i}>{part}</span>;
                   const isCorrectBlank = quizSubmitted && userBlankAnswers[i]?.toLowerCase().trim() === fillQuestion.answers[i].toLowerCase().trim();
                   return (
                     <React.Fragment key={i}>
                       {part}
                       <input
                         type="text"
                         className={`inline-block mx-0.5 w-20 px-1 py-0.5 border rounded-md text-sm ${ quizSubmitted ? (isCorrectBlank ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-300' }`} 
                         value={userBlankAnswers[i] || ''}
                         onChange={(e) => {
                           const newAnswers = [...userBlankAnswers]; newAnswers[i] = e.target.value;
                           handleAnswerChange(question.id, newAnswers, QuestionType.FillInBlanks);
                         }}
                         disabled={quizSubmitted}
                       />
                     </React.Fragment>
                   );
                 })}
               </div>
               {quizSubmitted && (
                 <div className="mt-1.5">
                   <ResultIndicator />
                   <div className="text-xs text-gray-600 mt-1"> 
                     <span className="font-medium">Correct answers: </span>
                     {fillQuestion.answers.join(', ')}
                   </div>
                 </div>
               )}
             </div>
           );

        case QuestionType.SortAnswer:
           // ... (Uses SortableQuizList which needs prop update, uses handleAnswerChange) ...
           const sortQuestion = question as SortAnswerQuestion;
           return (
              <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-1.5">Arrange the items in the correct order by dragging:</p>
                  <SortableQuizList 
                      question={sortQuestion}
                      userAnswer={userAnswers[question.id]?.value as string[] | undefined} // Pass userAnswer from prop
                      onChange={(newOrder: string[]) => handleAnswerChange(question.id, newOrder, QuestionType.SortAnswer)}
                      disabled={quizSubmitted}
                      showCorrectness={quizSubmitted}
                      isCompact={isCompact} 
                  />
                   {/* ResultIndicator might be redundant if SortableQuizList shows correctness */}
                   <ResultIndicator />
              </div>
           );

        case QuestionType.Matching:
        case QuestionType.ImageMatching:
           // ... (Uses MatchingQuestionQuizMode which needs prop update, uses handleAnswerChange) ...
            const matchQuestion = question as MatchingQuestion;
            return (
                <div>
                    <MatchingQuestionQuizMode 
                        question={matchQuestion}
                        userAnswer={userAnswers[question.id]?.value as Record<string, string> || {}} // Pass userAnswer from prop
                        onAnswerChange={(newAnswer: Record<string, string>) => handleAnswerChange(question.id, newAnswer, question.type)}
                        isSubmitted={quizSubmitted} // Pass quizSubmitted prop
                        ResultIndicator={ResultIndicator} // Pass down the indicator
                        isCompact={isCompact}
                    />
                    {/* ResultIndicator is passed to MatchingQuestionQuizMode */}
                </div>
            );
            
        default:
          // Exhaustive check: All types should be handled above.
          // console.error("Unsupported question type in renderQuestionInterface:", question.type);
          return <div>This question type is not supported</div>;
      }
  }

  // ... (Scroll to results logic remains the same) ...
  useEffect(() => {
    if (quizSubmitted && resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [quizSubmitted]);
  
  // Component return structure (uses props: currentQuestionIndex, remainingTime, etc.)
  const currentQuestion = questions[currentQuestionIndex];
  const score = quizSubmitted ? calculateScore() : null;

  return (
    <div className="quiz-player p-4 md:p-6">
      {/* Quiz Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-purple-700">{quizData.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{quizData.description}</p>
      </div>

      {/* Quiz score summary */}
      {quizSubmitted && score && ( 
        <div ref={resultsContainerRef} className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 scroll-mt-4">
          <h3 className="text-lg font-semibold mb-2 text-purple-800">Quiz Results</h3>
            <div className="flex flex-col items-center">
              <div className={`text-2xl font-bold mb-2 px-4 py-1 rounded-md ${score.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {score.passed ? 'Passed' : 'Failed'}
              </div>
              <div className="text-3xl font-bold mb-2">
                <span className={score.percentage >= (quizData.passingGrade ?? 70) ? 'text-green-600' : 'text-red-600'}>
                  {score.percentage}%
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                You scored {score.earned} out of {score.total} points (Passing Grade: {quizData.passingGrade ?? 'N/A'}%) 
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className={`h-2.5 rounded-full ${score.passed ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${score.percentage}%` }}
                ></div>
              </div>
            </div>
          <div className="flex justify-center space-x-4 mt-2">
            <button onClick={onExitQuiz} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">
               Back to Builder/Preview 
            </button>
          </div>
        </div>
      )}

      {/* Quiz Progress Tracker - Show only before submission */} 
      {!quizSubmitted && questions.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold text-purple-800">Quiz Progress</h3>
            {/* Timer Position */}
            {quizData.timeLimit && remainingTime !== null && ( 
              <div className={`flex items-center text-lg font-semibold ${ remainingTime <= 60 ? 'text-red-600 animate-pulse' : 'text-purple-700'}`}> 
                <Clock size={18} className="mr-1.5" />
                <span>{formatTime(remainingTime)}</span>
              </div>
            )}
            <span className="text-sm font-semibold text-purple-800">
              {Object.keys(userAnswers).length} of {questions.length} Answered
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="h-2.5 rounded-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
            ></div>
          </div>
          {/* Total Points/Remaining */}
          <div className="flex justify-between text-xs text-gray-600">
            <span>Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</span>
            {Object.keys(userAnswers).length > 0 && (
              <span>Remaining: {questions.length - Object.keys(userAnswers).length}</span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area: Single Question (Before Submit) or All Questions (After Submit) */} 
      {!quizSubmitted && currentQuestion && ( 
          // Render Single Question View
          <div key={currentQuestion.id} className="p-4 border border-purple-200 rounded-lg bg-white shadow-sm mb-4"> 
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center flex-1">
                <span className="text-purple-700 font-semibold mr-2 w-6 text-center">{currentQuestionIndex + 1}.</span>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-purple-900">{currentQuestion.question}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mr-2">
                      {currentQuestion.type}
                    </span>
                    <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                      {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                    </span>
                    {currentQuestion.id in userAnswers && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Answered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Body */}
            <div className="mt-3 pt-3 border-t border-purple-100">
               {renderQuestionInterface(currentQuestion)}
            </div>
          </div>
        )}

      {quizSubmitted && (
          // Render All Questions View
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-800 mt-4 mb-2 border-t pt-4">Detailed Results:</h3>
              {questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-purple-200 rounded-lg bg-white shadow-sm">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start flex-1">
                              <span className="text-purple-700 font-semibold mr-2 w-6 text-center pt-1">{index + 1}.</span>
                              <div className="flex-1">
                                  <div className="font-semibold text-md text-purple-900">{question.question}</div>
                                  <div className="flex items-center flex-wrap mt-1 gap-1">
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                          {question.type}
                                      </span>
                                      <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                                          {question.points} {question.points === 1 ? 'point' : 'points'}
                                      </span>
                                      {/* Optionally add Correct/Incorrect indicator here too if desired */} 
                                  </div>
                              </div>
                          </div>
                          {/* Optionally add points display or simple correct/incorrect icon here */} 
                      </div>
                      {/* Body */}
                      <div className="mt-2 pt-2 border-t border-purple-100">
                          {renderQuestionInterface(question)} 
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Navigation Buttons - Show only before submission */}
      {!quizSubmitted && questions.length > 0 && ( 
        <div className="flex justify-between items-center mt-4 mb-4 px-1">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm" 
          >
            &larr; Previous
          </button>
          <button
            onClick={() => {
                if (currentQuestionIndex === questions.length - 1) {
                    submitQuiz(); // Submit on last question
                } else {
                    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1)); // Go next
                }
            }}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center text-sm" 
          >
            {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next →'} 
          </button>
        </div>
      )}
      
      {/* Exit button only shown after submission */}
      {quizSubmitted && (
          <div className="flex justify-center mt-6">
               <button onClick={onExitQuiz} className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600">
                  Exit Quiz Mode
               </button>
          </div>
      )}

    </div>
  );
};

export default QuizPlayer;
