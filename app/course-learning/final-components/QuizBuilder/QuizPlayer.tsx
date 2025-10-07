import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Check, X, Clock, Share2, Download } from 'lucide-react';
import Image from 'next/image';
export enum QuestionType {
  TrueFalse = 'TrueFalse',
  SingleChoice = 'SingleChoice',
  MultipleChoice = 'MultipleChoice',
  OpenEnded = 'OpenEnded',
  FillInBlanks = 'FillInBlanks',
  SortAnswer = 'SortAnswer',
  Matching = 'Matching',
  ImageMatching = 'ImageMatching'
}

export interface BaseQuestion {
  id: string;
  question: string;
  type: QuestionType;
  points: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TrueFalse;
  correctAnswer: boolean;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: QuestionType.SingleChoice | QuestionType.MultipleChoice;
  options: string[];
  correctAnswers: number[];
}

export interface OpenEndedQuestion extends BaseQuestion {
  type: QuestionType.OpenEnded;
  modelAnswer?: string;
}

export interface FillInBlanksQuestion extends BaseQuestion {
  type: QuestionType.FillInBlanks;
  questionWithBlanks: string;
  answers: string[];
}

export interface SortAnswerQuestion extends BaseQuestion {
  type: QuestionType.SortAnswer;
  items: string[];
  correctOrder: number[];
}

export interface MatchingItem {
  id: string;
  left: string;
  right: string;
  leftImageUrl?: string;
  rightImageUrl?: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: QuestionType.Matching | QuestionType.ImageMatching;
  items: MatchingItem[];
}

export type Question =
  | TrueFalseQuestion
  | ChoiceQuestion
  | OpenEndedQuestion
  | FillInBlanksQuestion
  | SortAnswerQuestion
  | MatchingQuestion;

export interface QuizData {
  title: string;
  description?: string;
  timeLimit?: number;
  passingGrade?: number;
  questions?: Question[];
}

export type UserAnswers = Record<string, { type: QuestionType; value: unknown }>;
export type EliminatedOptions = Record<string, number[]>;

export const SortableQuizList: React.FC<{
  question: SortAnswerQuestion;
  userAnswer?: string[];
  onChange: (order: string[]) => void;
  disabled?: boolean;
}> = ({ question, userAnswer = [] }) => {
  const itemsToShow = userAnswer.length ? userAnswer : question.items;
  return (
    <div>
      {itemsToShow.map((item: string, idx: number) => (
        <div key={`${question.id}-${idx}`} className="p-1 border border-gray-200 rounded mb-1 text-sm">
          {item}
        </div>
      ))}
    </div>
  );
};

export const MatchingQuestionQuizMode: React.FC<{
  question: MatchingQuestion;
  userAnswer: Record<string, string>;
  onAnswerChange: (ans: Record<string, string>) => void;
  isSubmitted?: boolean;
}> = ({ question, userAnswer, onAnswerChange, isSubmitted }) => {
  return (
    <div>
      {question.items.map((item: MatchingItem) => (
        <div key={item.id} className="flex items-center gap-2 mb-1 text-sm">
          <span>{item.left}</span>
          <span className="text-gray-400">→</span>
          <select
            value={userAnswer[item.id] ?? ''}
            onChange={(e) => onAnswerChange({ ...userAnswer, [item.id]: e.target.value })}
            disabled={isSubmitted}
            className="border border-gray-200 rounded px-1 py-0.5 text-sm"
          >
            <option value="">Select</option>
            {question.items.map((opt: MatchingItem) => (
              <option key={opt.id} value={opt.right}>{opt.right}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

// Update QuizPlayerProps
interface QuizPlayerProps {
  quizData: QuizData;
  questions: Question[];
  onExitQuiz: () => void;
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

  const formatTime = (totalSeconds: number | null): string => {
    if (totalSeconds === null || totalSeconds < 0) return '--:--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const submitQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setQuizSubmitted(true); // Use prop setter
    setRemainingTime(null); // Use prop setter
  }, [setQuizSubmitted, setRemainingTime]);

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


  // ... (Scroll to results logic remains the same) ...
  useEffect(() => {
    if (quizSubmitted && resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [quizSubmitted]);

  // Component return structure (uses props: currentQuestionIndex, remainingTime, etc.)
  const currentQuestion = questions[currentQuestionIndex];
  const score = quizSubmitted ? calculateScore() : null;

    const progressPercent = useMemo(() => {
      if (!questions || questions.length === 0) return 0;
      return Math.min(100, Math.max(0, Math.round((currentQuestionIndex / questions.length) * 100)));
    }, [currentQuestionIndex, questions]);

  const hasCurrentAnswer = useMemo(() => {
    if (!currentQuestion) return false;
    const ans = userAnswers[currentQuestion.id]?.value as unknown;
    switch (currentQuestion.type) {
      case QuestionType.TrueFalse:
      case QuestionType.SingleChoice:
        return ans !== undefined && ans !== null;
      case QuestionType.MultipleChoice:
        return Array.isArray(ans) && ans.length > 0;
      case QuestionType.OpenEnded:
        return typeof ans === 'string' && ans.trim().length > 0;
      default:
        return ans !== undefined && ans !== null && `${ans}`.toString().trim().length > 0;
    }
  }, [currentQuestion, userAnswers]);

    return (
     <div className="quiz-player">

       {/* Top bar and breadcrumb */}
       <div className='flex justify-between items-center bg-[#F5F5F5] p-4'>
         <div className='flex items-center gap-2'>
           <Image src="/quiz/quizLogo.svg" alt="Quiz Logo" width={35} height={35} />
           <p className='font-medium'>Quiz</p>
         </div>
       </div>

       <p className='mx-6 mt-6 text-sm text-gray-500'>Home / Chapter 2. Life Insurance Basics/ Introduction / Quiz</p>

       {/* Centered quiz card */}
       <div className="max-w-4xl mx-auto my-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
         {/* Quiz meta */}
         <div className="text-center">
           <div className="text-xs text-gray-500 mb-1">Quiz ID: 61083</div>
           <div className="text-base font-medium text-gray-800">Title: {quizData.title}</div>
         </div>

         {/* Progress bar */}
         <div className="mt-4 w-full flex justify-between items-center">
           <div className="h-1 w-[95%] bg-gray-200 rounded-full relative">
             <div className="h-1 bg-purple-600 rounded-full" style={{ width: `${progressPercent}%` }} /> 
           </div>
           <div className="text-right text-xs text-gray-600 mt-1">{currentQuestionIndex + 1} of {questions.length}</div>
           
         </div>

         {/* Question */}
         <div className="mt-6 text-center">
           <div className="text-[15px] font-semibold text-purple-700">
             {currentQuestion ? currentQuestion.question : ''}
           </div>
         </div>

        <div>
        {
          !quizSubmitted && currentQuestion && (
            <div className="mt-6">
              {currentQuestion.type === QuestionType.TrueFalse ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[{ label: 'True', val: true }, { label: 'False', val: false }].map(({ label, val }) => (
                    <label
                      key={label}
                      className={`flex items-center w-full px-4 py-3 border border-gray-200 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 ${
                        userAnswers[currentQuestion.id]?.value === val ? 'ring-1 ring-purple-400' : ''
                      } ${quizSubmitted ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQuestion.id}`}
                        checked={userAnswers[currentQuestion.id]?.value === val}
                        onChange={() => handleAnswerChange(currentQuestion.id, val, QuestionType.TrueFalse)}
                        disabled={quizSubmitted}
                        className="mr-3 accent-purple-600 h-5 w-5"
                      />
                      <span className="text-sm text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>
              ) : currentQuestion.type === QuestionType.SingleChoice && Array.isArray((currentQuestion as ChoiceQuestion).options) ? (
                <div className="space-y-3">
                  {(currentQuestion as ChoiceQuestion).options.map((opt: string, idx: number) => (
                    <label
                      key={`${currentQuestion.id}-${idx}`}
                      className={`flex items-center w-full px-4 py-3 border border-gray-200 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 ${
                        (userAnswers[currentQuestion.id]?.type === QuestionType.SingleChoice && userAnswers[currentQuestion.id]?.value === idx) ? 'ring-1 ring-purple-400' : ''
                      } ${quizSubmitted ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQuestion.id}`}
                        value={idx}
                        checked={userAnswers[currentQuestion.id]?.type === QuestionType.SingleChoice && userAnswers[currentQuestion.id]?.value === idx}
                        onChange={() => handleAnswerChange(currentQuestion.id, idx, QuestionType.SingleChoice)}
                        disabled={quizSubmitted}
                        className="mr-3 accent-purple-600 h-5 w-5"
                      />
                      <span className="text-sm text-gray-800">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : currentQuestion.type === QuestionType.MultipleChoice && Array.isArray((currentQuestion as ChoiceQuestion).options) ? (
                <div className="space-y-3">
                  {(currentQuestion as ChoiceQuestion).options.map((opt: string, idx: number) => {
                    const currentSelection = (userAnswers[currentQuestion.id]?.value as number[] | undefined) || [];
                    const isChecked = Array.isArray(currentSelection) && currentSelection.includes(idx);
                    return (
                      <label
                        key={`${currentQuestion.id}-${idx}`}
                        className={`flex items-center w-full px-4 py-3 border border-gray-200 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 ${
                          isChecked ? 'ring-1 ring-purple-400' : ''
                        } ${quizSubmitted ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <input
                          type="checkbox"
                          name={`q_${currentQuestion.id}_${idx}`}
                          checked={isChecked}
                          onChange={() => {
                            const selection = (userAnswers[currentQuestion.id]?.value as number[] | undefined) || [];
                            const next = isChecked ? selection.filter(i => i !== idx) : [...selection, idx];
                            handleAnswerChange(currentQuestion.id, next.sort((a, b) => a - b), QuestionType.MultipleChoice);
                          }}
                          disabled={quizSubmitted}
                          className="mr-3 accent-purple-600 h-5 w-5"
                        />
                        <span className="text-sm text-gray-800">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                    placeholder="Type your answer here..."
                    rows={3}
                    value={(userAnswers[currentQuestion.id]?.value as string) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, QuestionType.OpenEnded)}
                    disabled={quizSubmitted}
                  />
                </div>
              )}

              {/* Submit button area */}
              <div className="mt-6 flex items-center justify-between">
                {/* Left side actions (share/export) */}
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border rounded-md text-xs text-gray-700 flex items-center gap-2"><Share2 size={14} /> SHARE</button>
                  <button className="px-3 py-2 border rounded-md text-xs text-gray-700 flex items-center gap-2"><Download size={14} /> EXPORT</button>
                </div>

                {/* Submit */}
                <button
                  disabled={!hasCurrentAnswer}
                  onClick={() => {
                    if (currentQuestionIndex === questions.length - 1) {
                      submitQuiz();
                    } else {
                      setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
                    }
                  }}
                  className={`px-6 py-2 rounded-md text-sm ${
                    hasCurrentAnswer ? 'bg-gray-700 text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Submit'}
                </button>
              </div>
            </div>
          )
        }
        </div>
     
      </div>{/* end centered quiz card */}

    </div>
  );
};

export default QuizPlayer;

//  {/* Quiz score summary */}
//       {/* {quizSubmitted && score && (
//         <div ref={resultsContainerRef} className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 scroll-mt-4">
//           <h3 className="text-lg font-semibold mb-2 text-purple-800">Quiz Results</h3>
//           <div className="flex flex-col items-center">
//             <div className={`text-2xl font-bold mb-2 px-4 py-1 rounded-md ${score.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//               {score.passed ? 'Passed' : 'Failed'}
//             </div>
//             <div className="text-3xl font-bold mb-2">
//               <span className={score.percentage >= (quizData.passingGrade ?? 70) ? 'text-green-600' : 'text-red-600'}>
//                 {score.percentage}%
//               </span>
//             </div>
//             <div className="text-sm text-gray-600 mb-4">
//               You scored {score.earned} out of {score.total} points (Passing Grade: {quizData.passingGrade ?? 'N/A'}%)
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
//               <div
//                 className={`h-2.5 rounded-full ${score.passed ? 'bg-green-600' : 'bg-red-600'}`}
//                 style={{ width: `${score.percentage}%` }}
//               ></div>
//             </div>
//           </div>
//           <div className="flex justify-center space-x-4 mt-2">
//             <button onClick={onExitQuiz} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">
//               Back to Builder/Preview
//             </button>
//           </div>
//         </div>
//       )} */}

//       {/* Quiz Progress Tracker - Show only before submission */}
//       {/* {!quizSubmitted && questions.length > 0 && (
//         <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
//           <div className="flex justify-between items-center mb-2">
//             <h3 className="text-md font-semibold text-purple-800">Quiz Progress</h3>
            
//             {quizData.timeLimit && remainingTime !== null && (
//               <div className={`flex items-center text-lg font-semibold ${remainingTime <= 60 ? 'text-red-600 animate-pulse' : 'text-purple-700'}`}>
//                 <Clock size={18} className="mr-1.5" />
//                 <span>{formatTime(remainingTime)}</span>
//               </div>
//             )}
//             <span className="text-sm font-semibold text-purple-800">
//               {Object.keys(userAnswers).length} of {questions.length} Answered
//             </span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
//             <div
//               className="h-2.5 rounded-full bg-purple-600 transition-all duration-300"
//               style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
//             ></div>
//           </div>
//           <div className="flex justify-between text-xs text-gray-600">
//             <span>Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</span>
//             {Object.keys(userAnswers).length > 0 && (
//               <span>Remaining: {questions.length - Object.keys(userAnswers).length}</span>
//             )}
//           </div>
//         </div>
//       )} */}

//        {/* Main Content Area: render options area within the centered card */}
//        {/* {!quizSubmitted && currentQuestion && (
//          <div className="mt-4">
//            {renderQuestionInterface(currentQuestion)}
//          </div>
//        )} */}

     
//        {/* Bottom actions area (share/export/submit) */}
      

//       {/* Exit button only shown after submission */}
    


//  {/* {!quizSubmitted && questions.length > 0 && (
//          <div className="mt-6 flex items-center justify-between">
//            <div className="flex items-center gap-2">
//              <button className="px-3 py-2 border rounded-md text-sm text-gray-700 flex items-center gap-2"><Share2 size={14} /> SHARE</button>
//              <button className="px-3 py-2 border rounded-md text-sm text-gray-700 flex items-center gap-2"><Download size={14} /> EXPORT</button>
//            </div>
//            <div className="flex items-center gap-2">
//              <button
//                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
//                disabled={currentQuestionIndex === 0}
//                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
//              >
//                Previous
//              </button>
//              <button
//                onClick={() => {
//                  if (currentQuestionIndex === questions.length - 1) {
//                    submitQuiz();
//                  } else {
//                    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
//                  }
//                }}
//                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
//              >
//                {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
//              </button>
//            </div>
//          </div>
//        )} */}
// {quizSubmitted && (
//   <div className="flex justify-center mt-6">
//     <button onClick={onExitQuiz} className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600">
//       Exit Quiz Mode
//     </button>
//   </div>
// )}
// {quizSubmitted && (
//   // Render All Questions View
//   <div className="space-y-4">
//     <h3 className="text-lg font-semibold text-purple-800 mt-4 mb-2 border-t pt-4">Detailed Results:</h3>
//     {questions.map((question, index) => (
//       <div key={question.id} className="p-4 border border-purple-200 rounded-lg bg-white shadow-sm">
//         {/* Header */}
//         <div className="flex justify-between items-start mb-3">
//           <div className="flex items-start flex-1">
//             <span className="text-purple-700 font-semibold mr-2 w-6 text-center pt-1">{index + 1}.</span>
//             <div className="flex-1">
//               <div className="font-semibold text-md text-purple-900">{question.question}</div>
//               <div className="flex items-center flex-wrap mt-1 gap-1">
//                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
//                   {question.type}
//                 </span>
//                 <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
//                   {question.points} {question.points === 1 ? 'point' : 'points'}
//                 </span>
//                 {/* Optionally add Correct/Incorrect indicator here too if desired */}
//               </div>
//             </div>
//           </div>
//           {/* Optionally add points display or simple correct/incorrect icon here */}
//         </div>
//         {/* Body */}
//         <div className="mt-2 pt-2 border-t border-purple-100">
//           {renderQuestionInterface(question)}
//         </div>
//       </div>
//     ))}
//   </div>
// )}
