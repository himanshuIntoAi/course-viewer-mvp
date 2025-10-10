import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import QuizResults from './QuizResult';
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
  userAnswers: UserAnswers;
  setUserAnswers: React.Dispatch<React.SetStateAction<UserAnswers>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  remainingTime: number | null;
  setRemainingTime: React.Dispatch<React.SetStateAction<number | null>>;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quizData,
  questions,
  userAnswers,
  setUserAnswers,
  quizSubmitted,
  setQuizSubmitted,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  remainingTime,
  setRemainingTime,
}) => {
  // Remove internal state for lifted variables
  // const [userAnswers, setUserAnswers] = useState<UserAnswers>({}); // Removed
  // const [quizSubmitted, setQuizSubmitted] = useState(false); // Removed
  // const [eliminatedOptions, setEliminatedOptions] = useState<EliminatedOptions>({}); // Removed
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Removed
  // const [remainingTime, setRemainingTime] = useState<number | null>(null); // Removed

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);

  const formatTime = useCallback((totalSeconds: number | null): string => {
    if (totalSeconds === null || totalSeconds < 0) return '--:--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

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
  // Commented out as it's not currently used
  // const handleEliminateOption = (questionId: string, optionIndex: number) => {
  //   // Use prop setter with functional update
  //   setEliminatedOptions((prev: EliminatedOptions) => {
  //     const currentEliminated = prev[questionId] || [];
  //     if (currentEliminated.includes(optionIndex)) {
  //       // Remove option
  //       return {
  //         ...prev,
  //         [questionId]: currentEliminated.filter((index: number) => index !== optionIndex)
  //       };
  //     } else {
  //       // Add option
  //       return {
  //         ...prev,
  //         [questionId]: [...currentEliminated, optionIndex]
  //       };
  //     }
  //   });
  // };

  // Check if answer is correct (uses userAnswers prop)
  const isAnswerCorrect = useCallback((question: Question): boolean | undefined => {
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
  }, [userAnswers]);

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

  // Transform quiz data for QuizResults component
  const quizResultsData = useMemo(() => {
    if (!score) return null;

    const correctCount = questions.filter(q => isAnswerCorrect(q) === true).length;
    const incorrectCount = questions.filter(q => isAnswerCorrect(q) === false).length;
    
    // Calculate time taken (if timer was used)
    const timeTaken = quizData.timeLimit && remainingTime !== null 
      ? formatTime((quizData.timeLimit * 60) - remainingTime)
      : 'N/A';

    // Transform questions to match QuizResults format
    const transformedQuestions = questions.map((q, idx) => {
      let options: string[] = [];
      let correctIndex = -1;
      let chosenIndex = -1;

      if (q.type === QuestionType.TrueFalse) {
        options = ['True', 'False'];
        const tfQuestion = q as TrueFalseQuestion;
        correctIndex = tfQuestion.correctAnswer ? 0 : 1;
        const userAns = userAnswers[q.id]?.value;
        chosenIndex = userAns === true ? 0 : userAns === false ? 1 : -1;
      } else if (q.type === QuestionType.SingleChoice || q.type === QuestionType.MultipleChoice) {
        const choiceQuestion = q as ChoiceQuestion;
        options = choiceQuestion.options;
        correctIndex = choiceQuestion.correctAnswers[0] ?? -1;
        const userAns = userAnswers[q.id]?.value;
        chosenIndex = typeof userAns === 'number' ? userAns : (Array.isArray(userAns) && userAns.length > 0 ? userAns[0] : -1);
      } else {
        // For other types, create placeholder options
        options = ['User Answer', 'Correct Answer'];
        const isCorrect = isAnswerCorrect(q);
        correctIndex = 1;
        chosenIndex = isCorrect ? 1 : 0;
      }

      return {
        id: idx + 1,
        prompt: q.question,
        options,
        correctIndex,
        chosenIndex,
        explanation: `Question worth ${q.points} point${q.points !== 1 ? 's' : ''}.`
      };
    });

    return {
      title: quizData.title,
      scoreRaw: score.earned,
      scoreMax: score.total,
      bannerNote: score.passed ? 'Great job!' : 'Keep practicing!',
      stats: {
        recentScoreLabel: 'Score',
        recentScore: `${correctCount} / ${questions.length} (${score.percentage}%)`,
        correct: correctCount,
        incorrect: incorrectCount,
        totalTime: timeTaken,
        accuracy: `${score.percentage}%`
      },
      attempts: [
        {
          id: 1,
          start: new Date().toLocaleDateString(),
          completed: new Date().toLocaleDateString(),
          score: `${score.earned}/${score.total}`,
          action: 'view'
        }
      ],
      questions: transformedQuestions
    };
  }, [score, questions, userAnswers, quizData, remainingTime, isAnswerCorrect, formatTime]);

  return (
    <div className="quiz-player ">

      {/* Top bar and breadcrumb */}
      <div className='flex justify-between items-center bg-[#F5F5F5] p-4'>
        <div className='flex items-center gap-2'>
          <Image src="/quiz/quizLogo.svg" alt="Quiz Logo" width={35} height={35} />
          <p className='font-medium'>Quiz</p>
        </div>
      </div>

      

      {/* Centered quiz card - Only show when quiz is not submitted */}
      {!quizSubmitted && (
        <div className="max-w-4xl mx-auto my-6 bg-[#f7f6f675] rounded-lg border border-gray-200 shadow-sm p-16">
          {/* Quiz meta */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Quiz ID: 61083</div>
            <div className="text-base font-medium text-gray-800">Title: {quizData.title}</div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full flex justify-between items-center">
            <div className="h-2 w-[90%] bg-gray-200 rounded-full relative">
              <div className="h-2 bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="text-right text-lg font-medium text-gray-600 mt-1">{currentQuestionIndex + 1} of {questions.length}</div>

          </div>

          {/* Question */}
          <div className="mt-6 text-center">
            <div className="text-[20px] font-semibold text-[#5A09FF]">
              {currentQuestion ? currentQuestion.question : ''}
            </div>
          </div>

          <div>
            {
              currentQuestion && (
              <div className="mt-6">
                {currentQuestion.type === QuestionType.TrueFalse ? (
                  <div className="grid grid-rows-1 md:grid-rows-2 gap-3">
                    {[{ label: 'True', val: true }, { label: 'False', val: false }].map(({ label, val }) => (
                      <label
                        key={label}
                        className={`flex items-center w-full px-4 py-3 border border-gray-200 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 ${userAnswers[currentQuestion.id]?.value === val ? 'ring-1 ring-purple-400' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQuestion.id}`}
                          checked={userAnswers[currentQuestion.id]?.value === val}
                          onChange={() => handleAnswerChange(currentQuestion.id, val, QuestionType.TrueFalse)}
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
                        className={`flex items-center w-full px-4 py-3 border border-gray-200 rounded cursor-pointer bg-[#eeecec] hover:bg-gray-200 ${(userAnswers[currentQuestion.id]?.type === QuestionType.SingleChoice && userAnswers[currentQuestion.id]?.value === idx) ? 'ring-1 ring-purple-400' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQuestion.id}`}
                          value={idx}
                          checked={userAnswers[currentQuestion.id]?.type === QuestionType.SingleChoice && userAnswers[currentQuestion.id]?.value === idx}
                          onChange={() => handleAnswerChange(currentQuestion.id, idx, QuestionType.SingleChoice)}
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
                          className={`flex items-center w-full px-4 py-3 border border-gray-200 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 ${isChecked ? 'ring-1 ring-purple-400' : ''}`}
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
                    />
                  </div>
                )}

                {/* Navigation and action buttons */}
                <div className={`mt-6 flex items-center ${currentQuestionIndex > 0 ? 'justify-between' : 'justify-end'}`}>
                  {
                    currentQuestionIndex > 0 && (<button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm ${currentQuestionIndex === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                      <Image src="/lessThenIcon.svg" alt="Previous" width={20} height={20} />
                      <span className="text-sm font-medium">Previous</span>
                    </button>
                    )
                  }

                  <button
                    disabled={!hasCurrentAnswer}
                    onClick={() => {
                      if (currentQuestionIndex === questions.length - 1) {
                        submitQuiz();
                      } else {
                        setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
                      }
                    }}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm  ${hasCurrentAnswer
                      ? 'bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] text-white hover:bg-gray-800'
                      : 'bg-[#8F8B8B] text-white cursor-not-allowed'
                      }`}
                  >
                    <span className="text-sm font-medium">{currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}</span>
                    <Image src="/greaterThenIcon.svg" alt="Next" width={20} height={20} />
                  </button>
                </div>
              </div>
            )
          }
          </div>
        </div>
      )}
      {/* end centered quiz card */}

      {/* Results Section - Shown after quiz submission */}
      {quizSubmitted && quizResultsData && (
        <div ref={resultsContainerRef}>
          <QuizResults data={quizResultsData} />
        </div>
      )}

    </div>
  );
};

export default QuizPlayer;
