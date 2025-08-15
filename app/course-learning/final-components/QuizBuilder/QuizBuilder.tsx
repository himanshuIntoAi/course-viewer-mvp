'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, CheckSquare, Square, Move, Eye, EyeOff, Filter, Check, X, Play, Maximize2, Save, Upload, Download, XCircle } from 'lucide-react';
import Image from 'next/image';
import './QuizBuilder.css';
// Add dnd-kit imports
// npm install @dnd-kit/core @dnd-kit/sortable
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable, // <-- Add
  useDroppable, // <-- Add
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuizPlayer from './QuizPlayer'; // Import the new component

// Add global styles at the top
const globalStyles = `
  .quiz-builder-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
    text-align: left;
  }

  .quiz-builder-content .quiz-builder {
    width: 100%;
    max-width: 100%;
  }

  .quiz-builder-portal .space-y-2 > div,
  .quiz-builder-content .space-y-2 > div {
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
`;

// Simple component to inject CSS
const StyleTag: React.FC<{css: string}> = ({css}) => {
  return <style dangerouslySetInnerHTML={{__html: css}} />;
};

// Create a popup container component
const PopupContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);
  // We don't need portalChildren state anymore

  useEffect(() => {
    // Create portal container when component mounts
    setMounted(true);
    
    // Create a div for the portal if it doesn't exist
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.id = 'quiz-builder-portal';
      document.body.appendChild(portalRef.current);
    }
    
    return () => {
      // Clean up portal container when component unmounts
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, []);

  // We don't need to update portalChildren state anymore

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Add event listener to prevent scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Fullscreen button - icon only */}
      <div className="flex justify-end mb-4">
        <button
          onClick={togglePopup}
          className="p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow-md"
          title="Open in fullscreen"
        >
          <Maximize2 size={20} color="white" />
        </button>
      </div>

      {!isOpen && (
        /* Main content when not in popup mode */
        <div className="quiz-builder-content">
          {children}
        </div>
      )}

      {/* Popup overlay - Render with portal at document root only when open */}
      {isOpen && mounted && portalRef.current && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 999999 // Extra high z-index
          }}
        >
          {/* Increase width and height here */}
          <div className="bg-white rounded-lg w-11/12 h-[90vh] max-w-7xl overflow-auto relative"> {/* Increased max-w and height */}
            {/* Add Close button (using Maximize2 icon) inside the popup */}
            <button
              onClick={togglePopup}
              className="absolute top-4 right-4 p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow-md z-20"
              title="Close fullscreen"
            >
              <Maximize2 size={24} color="white" />
            </button>
            
            {/* Content with same padding as the main view */}
            <div className="p-6 quiz-builder-content w-full"> {/* Added w-full to ensure full width */}
              <div className="w-full text-left"> {/* Removed mx-auto */} 
                {children}
              </div>
            </div>
          </div>
        </div>,
        portalRef.current
      )}
    </>
  );
};

// Define question types based on the 7 interactive quiz types
enum QuestionType {
  TrueFalse = 'True/False',
  SingleChoice = 'Single Choice',
  MultipleChoice = 'Multiple Choice',
  OpenEnded = 'Open Ended',
  FillInBlanks = 'Fill in the Blanks',
  SortAnswer = 'Sort Answer',
  Matching = 'Matching',
  ImageMatching = 'Image Matching'
}

// Define interfaces for different question types
interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
}

interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TrueFalse;
  correctAnswer: boolean;
}

interface ChoiceQuestion extends BaseQuestion {
  type: QuestionType.SingleChoice | QuestionType.MultipleChoice;
  options: string[];
  correctAnswers: number[]; // Index of correct options
}

interface OpenEndedQuestion extends BaseQuestion {
  type: QuestionType.OpenEnded;
  modelAnswer: string; // Sample answer for reference
}

interface FillInBlanksQuestion extends BaseQuestion {
  type: QuestionType.FillInBlanks;
  questionWithBlanks: string; // Text with _____ for blanks
  answers: string[]; // Correct answers for each blank
}

interface SortAnswerQuestion extends BaseQuestion {
  type: QuestionType.SortAnswer;
  items: string[]; // Items to be sorted
  correctOrder: number[]; // Correct order indices
}

interface MatchingItem {
  id: string;
  left: string;
  right: string;
}

interface MatchingQuestion extends BaseQuestion {
  type: QuestionType.Matching | QuestionType.ImageMatching;
  items: MatchingItem[];
  isImage?: boolean; // For image matching
}

type Question = 
  | TrueFalseQuestion 
  | ChoiceQuestion 
  | OpenEndedQuestion 
  | FillInBlanksQuestion 
  | SortAnswerQuestion 
  | MatchingQuestion;

// Define a type for the quiz data including the new fields
interface QuizData {
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  maxQuestions?: number; // Max questions to display
  passingGrade?: number; // Percentage
}

// Define a type-safe user answers structure
interface UserAnswers {
  [questionId: string]: {
    type: QuestionType;
    value: boolean | number | number[] | string | string[] | Record<string, string>;
  }
}

// Define a type for eliminated options state
interface EliminatedOptions {
  [questionId: string]: number[]; // Array of eliminated option indices
}

// --- Helper Functions and Sub-components Definitions Moved Here ---

// Component for True/False question editor
const TrueFalseQuestionEditor: React.FC<{
  question: TrueFalseQuestion;
  onChange: (question: TrueFalseQuestion) => void;
}> = ({ question, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          className="w-20 p-2 border border-gray-300 rounded-md"
          value={question.points}
          min={1}
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={question.correctAnswer === true}
              onChange={() => onChange({ ...question, correctAnswer: true })}
              className="mr-2"
            />
            <span>True</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={question.correctAnswer === false}
              onChange={() => onChange({ ...question, correctAnswer: false })}
              className="mr-2"
            />
            <span>False</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Component for Single/Multiple Choice question editor
const ChoiceQuestionEditor: React.FC<{
  question: ChoiceQuestion;
  onChange: (question: ChoiceQuestion) => void;
}> = ({ question, onChange }) => {
  const addOption = () => {
    onChange({
      ...question,
      options: [...question.options, `Option ${question.options.length + 1}`]
    });
  };
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onChange({ ...question, options: newOptions });
  };
  
  const removeOption = (index: number) => {
    const newOptions = [...question.options];
    newOptions.splice(index, 1);
    
    // Update correct answers if needed
    let newCorrectAnswers = [...question.correctAnswers];
    newCorrectAnswers = newCorrectAnswers.filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    
    onChange({ 
      ...question, 
      options: newOptions,
      correctAnswers: newCorrectAnswers
    });
  };
  
  const toggleCorrectAnswer = (index: number) => {
    let newCorrectAnswers = [...question.correctAnswers];
    
    if (question.type === QuestionType.SingleChoice) {
      // For single choice, only one answer can be correct
      newCorrectAnswers = [index];
    } else {
      // For multiple choice, toggle the selection
      if (newCorrectAnswers.includes(index)) {
        newCorrectAnswers = newCorrectAnswers.filter(i => i !== index);
      } else {
        newCorrectAnswers.push(index);
      }
    }
    
    onChange({ ...question, correctAnswers: newCorrectAnswers });
  };
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          className="w-20 p-2 border border-gray-300 rounded-md"
          value={question.points}
          min={1}
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Options
          </label>
          <button
            onClick={addOption}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md flex items-center"
          >
            <Plus size={12} className="mr-1" />
            Add Option
          </button>
        </div>
        
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => toggleCorrectAnswer(index)}
                className="mr-2 flex-shrink-0 focus:outline-none"
                title={question.correctAnswers.includes(index) ? "Correct answer" : "Mark as correct"}
              >
                {question.type === QuestionType.SingleChoice ? (
                  <div className={`w-4 h-4 rounded-full border mr-2 ${
                    question.correctAnswers.includes(index) 
                      ? 'bg-teal-500 border-teal-500' 
                      : 'border-gray-400'
                  }`}>
                    {question.correctAnswers.includes(index) && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                ) : (
                  question.correctAnswers.includes(index) ? (
                    <CheckSquare size={18} className="text-teal-500 mr-2" />
                  ) : (
                    <Square size={18} className="text-gray-400 mr-2" />
                  )
                )}
              </button>
              
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
              
              <button
                onClick={() => removeOption(index)}
                className="ml-2 text-gray-400 hover:text-red-500"
                disabled={question.options.length <= 2}
                title="Remove option"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for Open Ended question editor
const OpenEndedQuestionEditor: React.FC<{
  question: OpenEndedQuestion;
  onChange: (question: OpenEndedQuestion) => void;
}> = ({ question, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          className="w-20 p-2 border border-gray-300 rounded-md"
          value={question.points}
          min={1}
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model Answer (for reference)
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.modelAnswer}
          onChange={(e) => onChange({ ...question, modelAnswer: e.target.value })}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Note: Open-ended questions typically require manual grading or advanced AI evaluation.
        </p>
      </div>
    </div>
  );
};

// Component for Fill in the Blanks question editor
const FillInBlanksQuestionEditor: React.FC<{
  question: FillInBlanksQuestion;
  onChange: (question: FillInBlanksQuestion) => void;
}> = ({ question, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Prefix
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text with Blanks
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.questionWithBlanks}
          onChange={(e) => onChange({ ...question, questionWithBlanks: e.target.value })}
          rows={3}
          placeholder="Use _____ for each blank position"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use _____ (5 underscores) for each blank position in the text.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          className="w-20 p-2 border border-gray-300 rounded-md"
          value={question.points}
          min={1}
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Answers for Blanks
          </label>
          <button
            onClick={() => onChange({
              ...question,
              answers: [...question.answers, '']
            })}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md flex items-center"
          >
            <Plus size={12} className="mr-1" />
            Add Answer
          </button>
        </div>
        
        <div className="space-y-2">
          {question.answers.map((answer, index) => (
            <div key={index} className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Blank {index + 1}:</span>
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                value={answer}
                onChange={(e) => {
                  const newAnswers = [...question.answers];
                  newAnswers[index] = e.target.value;
                  onChange({ ...question, answers: newAnswers });
                }}
              />
              
              <button
                onClick={() => {
                  const newAnswers = [...question.answers];
                  newAnswers.splice(index, 1);
                  onChange({ ...question, answers: newAnswers });
                }}
                className="ml-2 text-gray-400 hover:text-red-500"
                disabled={question.answers.length <= 1}
                title="Remove blank"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for Sort Answer question editor
const SortAnswerQuestionEditor: React.FC<{
  question: SortAnswerQuestion;
  onChange: (question: SortAnswerQuestion) => void;
}> = ({ question, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          className="w-20 p-2 border border-gray-300 rounded-md"
          value={question.points}
          min={1}
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Items to Sort
          </label>
          <button
            onClick={() => {
              const newItems = [...question.items, `Item ${question.items.length + 1}`];
              const newOrder = Array.from({ length: newItems.length }, (_, i) => i); // Fixed: creates [0,1,2,...]
              onChange({
                ...question,
                items: newItems,
                correctOrder: newOrder
              });
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md flex items-center"
          >
            <Plus size={12} className="mr-1" />
            Add Item
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          {question.items.map((item, index) => (
            <div key={index} className="flex items-center">
              <Move size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                value={item}
                onChange={(e) => {
                  const newItems = [...question.items];
                  newItems[index] = e.target.value;
                  onChange({ ...question, items: newItems });
                }}
              />
              
              <button
                onClick={() => {
                  const newItems = [...question.items];
                  newItems.splice(index, 1);
                  
                  // Update correct order
                  const newOrder = question.correctOrder
                    .filter(i => i !== index)
                    .map(i => i > index ? i - 1 : i);
                  
                  onChange({ 
                    ...question, 
                    items: newItems,
                    correctOrder: newOrder
                  });
                }}
                className="ml-2 text-gray-400 hover:text-red-500"
                disabled={question.items.length <= 2}
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Order
          </label>
          <div className="p-3 bg-gray-50 rounded-md">
            <ol className="list-decimal pl-5 space-y-1">
              {question.correctOrder.map((itemIndex, index) => (
                <li key={index} className="text-sm">
                  {question.items[itemIndex] || `Item ${itemIndex + 1}`}
                </li>
              ))}
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              Note: In a real implementation, you would be able to drag and drop items to rearrange them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for Matching and Image Matching question editor
const MatchingQuestionEditor: React.FC<{
  question: MatchingQuestion;
  onChange: (question: MatchingQuestion) => void;
}> = ({ question, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          className="w-20 p-2 border border-gray-300 rounded-md"
          value={question.points}
          min={1}
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Matching Pairs
          </label>
          <button
            onClick={() => {
              const newItemId = `item_${Date.now()}`;
              const newItems = [...question.items, {
                id: newItemId,
                left: `Item ${question.items.length + 1}`,
                right: `Match ${question.items.length + 1}`
              }];
              onChange({
                ...question,
                items: newItems
              });
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md flex items-center"
          >
            <Plus size={12} className="mr-1" />
            Add Pair
          </button>
        </div>
        
        <div className="space-y-2">
          {question.items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-2 gap-2">
              <input
                type="text"
                className="p-2 border border-gray-300 rounded-md"
                value={item.left}
                placeholder={question.type === QuestionType.ImageMatching ? "Image URL" : "Left item"}
                onChange={(e) => {
                  const newItems = [...question.items];
                  newItems[index] = { ...item, left: e.target.value };
                  onChange({ ...question, items: newItems });
                }}
              />
              
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  value={item.right}
                  placeholder="Right item"
                  onChange={(e) => {
                    const newItems = [...question.items];
                    newItems[index] = { ...item, right: e.target.value };
                    onChange({ ...question, items: newItems });
                  }}
                />
                
                <button
                  onClick={() => {
                    const newItems = [...question.items];
                    newItems.splice(index, 1);
                    onChange({ ...question, items: newItems });
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500"
                  disabled={question.items.length <= 2}
                  title="Remove pair"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {question.type === QuestionType.ImageMatching && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              For Image Matching, enter image URLs in the left column and their descriptions in the right column.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// New Sortable Item Component
interface SortableQuizItemProps {
  id: number; // Changed id type to number (original index)
  value: string;
  colorClasses: { bg: string; border: string; text: string };
  isCorrect?: boolean; 
  disabled?: boolean; 
  isCompact?: boolean; // Added prop
}

function SortableQuizItem({ id, value, colorClasses, isCorrect, disabled, isCompact }: SortableQuizItemProps) {
  const { 
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id }); // id is now the original index

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto', 
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      // Adjusted padding and margin based on isCompact
      className={`flex items-center ${isCompact ? 'p-2 mb-1.5 text-sm' : 'p-3 mb-2'} border rounded-md touch-none 
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-grab'} 
        ${ isCorrect === true ? 'bg-green-100 border-green-300' : 
           isCorrect === false ? 'bg-red-100 border-red-300' : 
           `${colorClasses.bg} ${colorClasses.border}` 
        }
      `}
      aria-label={`Draggable item ${value}`}
    >
      {!disabled && <Move size={14} className={`flex-shrink-0 mr-2 ${isCorrect === undefined ? colorClasses.text : 'text-gray-400'}`} />} {/* Smaller icon/margin */}
      <span className={`flex-1 ${isCorrect === undefined ? colorClasses.text : 'text-gray-800'} font-medium`}>{value}</span>
      {isCorrect === true && <Check size={14} className="ml-2 text-green-600" />} {/* Smaller icon */}
      {isCorrect === false && <X size={14} className="ml-2 text-red-600" />} {/* Smaller icon */} 
    </div>
  );
}

// New Sortable List Wrapper Component for Quiz Mode
interface SortableQuizListProps {
  question: SortAnswerQuestion;
  userAnswer: string[] | undefined; 
  onChange: (newOrder: string[]) => void; 
  disabled?: boolean;
  showCorrectness?: boolean; 
  isCompact?: boolean; // Added prop
}

// Define item structure with color and original index
interface SortableItem { 
  id: number; // Unique ID for dnd-kit (use original index)
  originalIndex: number; // Store the original index
  value: string; // The actual text content
  colorClasses: { bg: string; border: string; text: string };
}

function SortableQuizList({ question, userAnswer, onChange, disabled, showCorrectness, isCompact }: SortableQuizListProps) {
  // 1. `useSensors` first
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 2. `useMemo` for pastelPalette
  const pastelPalette = React.useMemo(() => [
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700' },
    { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
    { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  ], []);

  // Initialize state based on userAnswer or question.items, mapping to SortableItem
  const [items, setItems] = useState<SortableItem[]>(() => {
    const initialValues = userAnswer ? userAnswer : question.items;
    return initialValues.map(value => {
      const originalIndex = question.items.indexOf(value);
      // Use a fallback index if not found (shouldn't happen with valid data)
      const safeOriginalIndex = originalIndex >= 0 ? originalIndex : Math.random(); 
      return {
        id: safeOriginalIndex, // Original index is the ID
        originalIndex: safeOriginalIndex,
          value: value,
        colorClasses: pastelPalette[safeOriginalIndex % pastelPalette.length]
      };
    });
  });

  // Update state if userAnswer prop changes (e.g., on Try Again or external update)
  useEffect(() => {
    // Determine the source of truth for the current order
    const currentValues = userAnswer ? userAnswer : question.items;
    // Map current values to SortableItem structure
    const updatedItems = currentValues.map(value => {
      const originalIndex = question.items.indexOf(value);
      const safeOriginalIndex = originalIndex >= 0 ? originalIndex : Math.random();
      return {
        id: safeOriginalIndex,
        originalIndex: safeOriginalIndex,
        value: value,
        colorClasses: pastelPalette[safeOriginalIndex % pastelPalette.length]
      };
    });

    // Check if the derived state differs from the current state before updating
    // Compare based on the order of IDs (original indices)
    if (JSON.stringify(updatedItems.map(i => i.id)) !== JSON.stringify(items.map(i => i.id))) {
      setItems(updatedItems);
    }
    // Dependencies: Trigger effect if userAnswer, question.items, or the palette changes.
    // Note: Including 'items' itself in dependencies can cause loops if not careful,
    // but here it's needed to compare against the potentially stale 'items' state.
  }, [userAnswer, question.items, items, pastelPalette]);

  // --- Event Handlers & Helper Functions --- 
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find indices based on the ID (original index) in the items array
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
          console.error("Could not find dragged items in state");
          return; 
      }

      const movedItems = arrayMove(items, oldIndex, newIndex);
      
      onChange(movedItems.map(item => item.value)); 
      
      setItems(movedItems); 
    }
  }

  // Determine correctness based on original index
  const getItemCorrectness = (itemOriginalIndex: number, currentListIndex: number): boolean | undefined => {
    if (!showCorrectness) return undefined;
    // Check if the item's original index matches the expected original index for this position
    return question.correctOrder[currentListIndex] === itemOriginalIndex;
  };


  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* Pass array of IDs (original indices) to SortableContext */}
      <SortableContext 
        items={items.map(item => item.id)} 
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        <div className="space-y-1">
          {/* Map over the array of objects */}
          {items.map((item, index) => (
            <SortableQuizItem 
              key={item.id} // Use original index as key
              id={item.id}   // Pass original index as id
              value={item.value}
              colorClasses={item.colorClasses}
              // Pass item's original index and current list index for comparison
              isCorrect={getItemCorrectness(item.originalIndex, index)}
              disabled={disabled}
              isCompact={isCompact} // Pass down the prop
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// --- New dnd-kit components for Matching Questions ---

interface DraggableMatchOptionProps {
  id: string; // Use option value as ID
  value: string;
  label: string; // e.g., "A", "B"
  colorClasses: { bg: string; border: string; text: string }; // Added
  disabled?: boolean;
  isCompact?: boolean; // Added prop
}

function DraggableMatchOption({ id, value, label, colorClasses, disabled, isCompact }: DraggableMatchOptionProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: id, // Use the actual value as the ID
    data: { type: 'matchOption', value: value, colorClasses: colorClasses }, // Pass color data
    disabled: disabled,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  } : {};

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      // Apply dynamic background, border, and text colors
      className={`${isCompact ? 'p-1.5 mb-1.5 text-sm' : 'p-2 mb-2'} border rounded-md flex items-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-grab'} ${colorClasses.bg} ${colorClasses.border}`}
    >
      {/* Apply dynamic text color to label and value */}
      <span className={`inline-block w-5 h-5 text-center border border-gray-300 rounded-full bg-white mr-1.5 font-medium text-xs ${colorClasses.text}`}>{label}</span> 
      <span className={`font-medium ${colorClasses.text}`}>{value}</span>
    </div>
  );
}

interface DroppableMatchZoneProps {
  id: string; // Use left item id as ID
  matchedValue: string | null;
  matchedColorClasses: { bg: string; border: string; text: string } | null; // Added
  onClearMatch: () => void;
  isCorrect?: boolean | undefined; // For feedback after submission
  disabled?: boolean;
  isCompact?: boolean; // Added prop
}

function DroppableMatchZone({ id, matchedValue, matchedColorClasses, onClearMatch, isCorrect, disabled, isCompact }: DroppableMatchZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({ // Get active drag item 
    id: id,
    data: { type: 'matchZone' },
    disabled: disabled,
  });

  // Determine color classes for hover effect (only when no item is matched yet)
  const hoverColorClasses = isOver && !matchedValue && active?.data.current?.type === 'matchOption' && !disabled ? 
                              active.data.current.colorClasses : 
                              null;
  
  // Determine the primary color classes to display (matched item color takes precedence)
  const displayColorClasses = matchedColorClasses || hoverColorClasses;

  // Determine background and border based on state (Correct > Incorrect > Matched/Hover > Default)
  const getZoneClasses = () => {
    if (isCorrect === true) return 'bg-green-100 border-green-400';
    if (isCorrect === false) return 'bg-red-100 border-red-400';
    if (displayColorClasses) return `${displayColorClasses.bg} ${displayColorClasses.border}`; 
    return 'bg-gray-50 border-gray-200'; // Default empty state
  };

  return (
    <div 
      ref={setNodeRef} 
      // Apply dynamic background and border classes
      className={`${isCompact ? 'p-2 min-h-[45px] text-xs' : 'p-3 min-h-[60px] text-sm'} border-2 border-dashed rounded-md flex items-center justify-center relative transition-colors duration-150 ${disabled ? 'opacity-70' : ''} ${getZoneClasses()}`}
    >
      {matchedValue && matchedColorClasses ? (
        // Display matched item
        <div className="flex items-center justify-between w-full">
          <span className={`font-medium ${matchedColorClasses.text}`}>{matchedValue}</span>
          {!disabled && (
            <button 
              onClick={onClearMatch} 
              // Adjusted position/padding
              className={`ml-1 p-0.5 absolute top-0.5 right-0.5 ${matchedColorClasses.text} opacity-50 hover:opacity-100`}
              title="Clear match"
            >
              <XCircle size={14} /> {/* Smaller icon */}
            </button>
          )}
        </div>
      ) : (
        <span className="text-gray-400">Drop match here</span>
      )}
    </div>
  );
}

// --- New Component for Matching Question Quiz Mode ---
interface MatchingQuestionQuizModeProps {
  question: MatchingQuestion;
  userAnswer: Record<string, string>;
  onAnswerChange: (newAnswer: Record<string, string>) => void;
  isSubmitted: boolean;
  ResultIndicator: React.FC; // Receive the indicator component as a prop
  isCompact?: boolean; // Added prop
}

const MatchingQuestionQuizMode: React.FC<MatchingQuestionQuizModeProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  ResultIndicator,
  isCompact // Receive prop
}) => {
  // Hooks can be called here
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Define *Pastel* Color Palette (Tailwind classes) - Use useMemo for stability
  const colorPalette = React.useMemo(() => [
    // { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' }, // Removed Rose
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700' },
    { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
    { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    // Added more pastel colors from the Sortable list for consistency
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' }, 
    { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' }, 
  ], []); // Empty dependency array ensures it's created only once

  // --- This section was causing the redeclaration error and is removed --- 
  /* 
  // Define Pastel Color Palette (Tailwind classes) - Replaced with pastel, removed Rose
  const colorPalette = React.useMemo(() => [
    // ... colors ... 
  ], []); 
  */

  const rightOptionsWithColor = question.items.map((item, i) => ({
    label: String.fromCharCode(65 + i), 
    value: item.right,
    id: item.right, 
    // Use the updated colorPalette defined above
    colorClasses: colorPalette[i % colorPalette.length] // Assign color cyclically
  }));

  const colorMap = new Map(rightOptionsWithColor.map(opt => [opt.value, opt.colorClasses]));

  const usedRightValues = new Set(Object.values(userAnswer));
  const availableOptions = rightOptionsWithColor.filter(opt => !usedRightValues.has(opt.value));

  const handleMatchingDragEnd = (event: DragEndEvent) => {
    // ... (existing drag end logic remains the same)
    const { active, over } = event;

    if (over && over.data.current?.type === 'matchZone' && 
        active && active.data.current?.type === 'matchOption') {
      
      const targetLeftItemId = over.id as string;
      const draggedRightValue = active.id as string; // This is the value of the right item being dragged

      // Get the original state before this drag operation
      const currentAnswers = { ...userAnswer }; 

      // Find details about the source and target based on currentAnswers
      const existingMatchInTarget = currentAnswers[targetLeftItemId]; 
      let sourceLeftItemId: string | null = null;
      for (const leftId in currentAnswers) {
        if (currentAnswers[leftId] === draggedRightValue) {
          sourceLeftItemId = leftId;
          break;
        }
      }

      // --- Immutable Update Logic ---
      // Start building the next state based on the current state
      let nextAnswers = { ...currentAnswers };

      // 1. Remove the dragged item from its original position (if it had one)
      if (sourceLeftItemId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [sourceLeftItemId]: _removed, ...rest } = nextAnswers;
        nextAnswers = rest; 
      }

      // 2. Remove the item currently in the target slot (if any) 
      // It will either be replaced by the dragged item or moved (if swapping)
      if (existingMatchInTarget) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [targetLeftItemId]: _removed, ...rest } = nextAnswers;
          nextAnswers = rest;
      }

      // 3. Add the dragged item to the target slot
      nextAnswers[targetLeftItemId] = draggedRightValue;

      // 4. Handle the swap: If the dragged item came from a source slot 
      //    and the target slot had an item, put the target's original item 
      //    into the source slot.
      if (sourceLeftItemId && sourceLeftItemId !== targetLeftItemId && existingMatchInTarget) {
          nextAnswers[sourceLeftItemId] = existingMatchInTarget;
      }
      // --- End Immutable Update Logic ---

      onAnswerChange(nextAnswers);
    }
  };

  const clearMatch = (leftItemId: string) => {
    // Create a new object excluding the cleared item (immutable approach)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [leftItemId]: _, ...remainingAnswers } = userAnswer;
    onAnswerChange(remainingAnswers);
  };

  const getZoneCorrectness = (leftItemId: string): boolean | undefined => {
    if (!isSubmitted) return undefined;
    const userMatch = userAnswer[leftItemId];
    if (!userMatch) return false; 
    const correctItem = question.items.find(i => i.id === leftItemId);
    return correctItem?.right === userMatch;
  };

  // --- Return Statement: Applying the fixes here --- 
  return (
    <DndContext 
      onDragEnd={handleMatchingDragEnd} // Use the defined handler
      sensors={sensors} // Use the defined sensors
    >
      <div className={`grid grid-cols-1 md:grid-cols-3 ${isCompact ? 'gap-3' : 'gap-6'}`}>
        {/* Left Items with Drop Zones */}
        <div className="md:col-span-2 space-y-2"> {/* Reduced space-y */}
          <p className="text-xs font-medium text-gray-700 mb-1.5">Match the items on the left with the options on the right:</p> {/* Smaller text/margin */}
          {question.items.map((item) => (
             // Reduced gap and padding
            <div key={item.id} className={`grid grid-cols-2 ${isCompact ? 'gap-2' : 'gap-4'} items-center ${isCompact ? 'p-2' : 'p-3'} border border-gray-200 rounded-md bg-white`}>
              {/* Left Item Content - Adjusted size/text */}
              <div className={`font-medium ${isCompact ? 'text-sm' : ''}`}>
                {question.type === QuestionType.ImageMatching && (item.left.startsWith('/images/') || item.left.includes('image')) ? (
                  <div className="flex flex-col items-center">
                     {/* Adjusted size */}
                    <div className={`bg-gray-100 flex items-center justify-center rounded border border-gray-300 mb-1 relative ${isCompact ? 'w-12 h-12' : 'w-16 h-16'}`}>
                      <Image src={item.left} alt={`Item ${item.id}`} width={isCompact ? 40: 56} height={isCompact ? 40: 56} className="object-contain" />
                    </div>
                  </div>
                ) : (
                  <span>{item.left}</span>
                )}
              </div>

              {/* Drop Zone */}
              <DroppableMatchZone 
                id={item.id} 
                matchedValue={userAnswer[item.id] || null} 
                matchedColorClasses={userAnswer[item.id] ? colorMap.get(userAnswer[item.id]) || null : null} 
                onClearMatch={() => clearMatch(item.id)} 
                isCorrect={getZoneCorrectness(item.id)} 
                disabled={isSubmitted} 
                isCompact={isCompact} // Pass down the prop
              />
            </div>
          ))}
        </div>

        {/* Available Options Pool */}
        <div className="md:col-span-1">
          <p className="text-xs font-medium text-gray-700 mb-1.5">Available Options:</p> {/* Smaller text/margin */}
           {/* Adjusted padding/min-height */}
          <div className={`${isCompact ? 'p-2 min-h-[100px]' : 'p-3 min-h-[150px]'} bg-gray-100 rounded-md border border-gray-200`}>
            {availableOptions.length > 0 ? (
              availableOptions.map(option => (
                <DraggableMatchOption 
                  key={option.id} 
                  id={option.id} 
                  value={option.value} 
                  label={option.label} 
                  colorClasses={option.colorClasses} 
                  disabled={isSubmitted} 
                  isCompact={isCompact} // Pass down the prop
                />
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center pt-4">All options matched.</p>
            )}
          </div>
        </div>
      </div>
      {isSubmitted && <ResultIndicator />} 
    </DndContext>
  );
};
// ----------------------------------------------------

// Component for the quiz builder
const QuizBuilder = () => {
  const [quizData, setQuizData] = useState<QuizData>({
    title: 'Course Quiz',
    description: 'Test your knowledge of the course material',
    questions: [],
    timeLimit: undefined, 
    maxQuestions: undefined,
    passingGrade: 70, 
  });
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>(QuestionType.TrueFalse);
  const [filterType, setFilterType] = useState<QuestionType | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'quiz'>('edit');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]); // State to hold questions for the current quiz session

  // Add state for the active quiz session
  const [currentUserAnswers, setCurrentUserAnswers] = useState<UserAnswers>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState<number>(0);
  const [quizRemainingTime, setQuizRemainingTime] = useState<number | null>(null);
  const [currentEliminatedOptions, setCurrentEliminatedOptions] = useState<EliminatedOptions>({});

  // Load quiz data from localStorage if available
  useEffect(() => {
    const savedQuizData = localStorage.getItem('quizBuilderContent');
    if (savedQuizData) {
      try {
        const parsedData = JSON.parse(savedQuizData);
        if (parsedData.data) {
          setQuizData({
            ...parsedData.data,
            questions: parsedData.data.questions || [], // Ensure questions is initialized
            maxQuestions: parsedData.data.maxQuestions ?? undefined,
            passingGrade: parsedData.data.passingGrade ?? 70,
          });
        } else {
           createSampleQuestions(); // Initialize if data structure is unexpected
        }
      } catch (error) {
        console.error('Error parsing quiz data:', error);
         createSampleQuestions(); // Initialize on error
      }
    } else {
      createSampleQuestions();
    }
  }, []); // Keep dependency array empty for initial load

  // Toggle between modes - UPDATED
  const toggleViewMode = (mode: 'edit' | 'preview' | 'quiz') => {
    if (mode === 'quiz') {
      // Reset only builder-related state if necessary
      setActiveQuestionId(null); // Collapse any open editors

      // Reset quiz-taking state before starting a new session
      setCurrentUserAnswers({});
      setIsQuizSubmitted(false);
      setCurrentQuizQuestionIndex(0);
      setQuizRemainingTime(null); // Timer will be initialized in QuizPlayer based on quizData.timeLimit
      setCurrentEliminatedOptions({});

      // Select questions for the quiz based on maxQuestions
      let questionsForQuiz = [...quizData.questions];
      if (quizData.maxQuestions && quizData.maxQuestions > 0 && quizData.maxQuestions < quizData.questions.length) {
        // Shuffle and slice to get a random subset
        questionsForQuiz.sort(() => Math.random() - 0.5);
        questionsForQuiz = questionsForQuiz.slice(0, quizData.maxQuestions);
      } else {
         // Optional: Shuffle even if taking all questions
         questionsForQuiz.sort(() => Math.random() - 0.5);
      }
      setQuizQuestions(questionsForQuiz); // Set the questions for this session
    } else {
        // Reset quiz questions if leaving quiz mode
        setQuizQuestions([]);
        // Optionally reset quiz taking state when exiting quiz mode as well
        // setCurrentUserAnswers({});
        // setIsQuizSubmitted(false);
        // setCurrentQuizQuestionIndex(0);
        // setQuizRemainingTime(null); 
        // setCurrentEliminatedOptions({});
    }
    setViewMode(mode);
  };

  // Create sample questions for demonstration (Keep)
  const createSampleQuestions = () => {
     // ... implementation remains the same ...
    const sampleQuiz: QuizData = {
      title: 'Course Quiz',
      description: 'Test your knowledge of the course material',
      questions: [
        // True/False Questions
        {
          id: '1',
          type: QuestionType.TrueFalse,
          question: 'React is a JavaScript library for building user interfaces.',
          points: 1,
          correctAnswer: true
        },
        {
          id: '2',
          type: QuestionType.TrueFalse,
          question: 'TypeScript is a superset of JavaScript that adds static typing.',
          points: 1,
          correctAnswer: true
        },
        
        // Single Choice Questions
        {
          id: '3',
          type: QuestionType.SingleChoice,
          question: 'Which of the following is NOT a JavaScript framework?',
          options: ['Angular', 'Vue', 'React', 'Java'],
          correctAnswers: [3],
          points: 2
        },
        {
          id: '4',
          type: QuestionType.SingleChoice,
          question: 'Which HTTP status code represents a successful response?',
          options: ['200', '404', '500', '301'],
          correctAnswers: [0],
          points: 2
        },
        
        // Multiple Choice Questions
        {
          id: '5',
          type: QuestionType.MultipleChoice,
          question: 'Select all the front-end technologies:',
          options: ['HTML', 'CSS', 'Python', 'JavaScript'],
          correctAnswers: [0, 1, 3],
          points: 3
        },
        {
          id: '6',
          type: QuestionType.MultipleChoice,
          question: 'Which of the following are JavaScript frameworks or libraries?',
          options: ['React', 'Angular', 'Python', 'jQuery', 'C++'],
          correctAnswers: [0, 1, 3],
          points: 3
        },
        
        // Open Ended Questions
        {
          id: '7',
          type: QuestionType.OpenEnded,
          question: 'Explain the concept of state in React.',
          points: 3,
          modelAnswer: 'State is a built-in React object that contains data or information about the component. A component\'s state can change over time, and when it does, the component re-renders.'
        },
        {
          id: '8',
          type: QuestionType.OpenEnded,
          question: 'What is the difference between props and state in React?',
          points: 3,
          modelAnswer: 'Props are passed to a component from its parent and are read-only, while state is managed within the component and can be updated using setState().'
        },
        
        // Fill in the Blanks Questions
        {
          id: '9',
          type: QuestionType.FillInBlanks,
          question: 'Complete the sentence about React:',
          questionWithBlanks: 'React was created by _____ and is maintained by _____.',
          answers: ['Facebook', 'Meta'],
          points: 2
        },
        {
          id: '10',
          type: QuestionType.FillInBlanks,
          question: 'Fill in the blanks about HTML:',
          questionWithBlanks: 'HTML stands for _____ _____ _____.',
          answers: ['Hypertext', 'Markup', 'Language'],
          points: 2
        },
        
        // Sort Answer Questions
        {
          id: '11',
          type: QuestionType.SortAnswer,
          question: 'Sort the following web development steps in order:',
          items: ['Requirements gathering', 'Design', 'Development', 'Testing', 'Deployment'],
          correctOrder: [0, 1, 2, 3, 4],
          points: 3
        },
        {
          id: '12',
          type: QuestionType.SortAnswer,
          question: 'Sort these programming languages from oldest to newest:',
          items: ['FORTRAN', 'C', 'JavaScript', 'TypeScript', 'Swift'],
          correctOrder: [0, 1, 2, 3, 4],
          points: 3
        },
        
        // Matching Questions
        {
          id: '13',
          type: QuestionType.Matching,
          question: 'Match the programming languages with their primary use cases:',
          items: [
            { id: 'match1', left: 'JavaScript', right: 'Web development' },
            { id: 'match2', left: 'Python', right: 'Data science' },
            { id: 'match3', left: 'Swift', right: 'iOS development' },
            { id: 'match4', left: 'C#', right: 'Windows applications' }
          ],
          points: 4
        },
        {
          id: '14',
          type: QuestionType.Matching,
          question: 'Match the HTTP status codes with their meanings:',
          items: [
            { id: 'match5', left: '200', right: 'OK' },
            { id: 'match6', left: '404', right: 'Not Found' },
            { id: 'match7', left: '500', right: 'Internal Server Error' },
            { id: 'match8', left: '301', right: 'Moved Permanently' }
          ],
          points: 4
        },
        
        // Image Matching Questions
        {
          id: '15',
          type: QuestionType.ImageMatching,
          question: 'Match the technology logos with their names:',
          items: [
            { id: 'img1', left: '/images/react-logo.svg', right: 'React' },
            { id: 'img2', left: '/images/angular-logo.svg', right: 'Angular' },
            { id: 'img3', left: '/images/vue-logo.svg', right: 'Vue' },
            { id: 'img4', left: '/images/svelte-logo.svg', right: 'Svelte' }
          ],
          isImage: true,
          points: 4
        },
        {
          id: '16',
          type: QuestionType.ImageMatching,
          question: 'Match the UI components with their descriptions:',
          items: [
            { id: 'img5', left: '/images/button.svg', right: 'Button' },
            { id: 'img6', left: '/images/dropdown.svg', right: 'Dropdown' },
            { id: 'img7', left: '/images/checkbox.svg', right: 'Checkbox' },
            { id: 'img8', left: '/images/slider.svg', right: 'Slider' }
          ],
          isImage: true,
          points: 4
        }
      ],
       timeLimit: 10, // Add sample time limit
       maxQuestions: 10, // Add sample max questions
       passingGrade: 70 // Add sample passing grade
    };
    setQuizData(sampleQuiz);
    localStorage.setItem('quizBuilderContent', JSON.stringify({
      data: {
        ...sampleQuiz,
        maxQuestions: sampleQuiz.maxQuestions,
        passingGrade: sampleQuiz.passingGrade,
      },
      timestamp: Date.now()
    }));
  };

  // Save quiz data to localStorage (Keep)
  const saveQuiz = () => {
    // ... implementation remains the same ...
    localStorage.setItem('quizBuilderContent', JSON.stringify({
      data: {
        ...quizData,
        maxQuestions: quizData.maxQuestions,
        passingGrade: quizData.passingGrade,
      },
      timestamp: Date.now()
    }));
  };

  // Generate a unique ID (Keep)
  const generateId = () => `question_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Create a sample CSV template for users to download
  const createSampleCSV = () => {
    // Create CSV header and sample data
    const headers = "Type,Question,Points,CorrectAnswer,Options/Items,Additional Data\n";
    
    const sampleData = [
      `"${QuestionType.TrueFalse}","Is React a JavaScript library?",1,true,,`,
      `"${QuestionType.SingleChoice}","Which of the following is NOT a JavaScript framework?",2,2,"Angular,React,jQuery,Vue",`,
      `"${QuestionType.MultipleChoice}","Select all JavaScript data types:",2,"0,1","String,Number,Loop,Function",`,
      `"${QuestionType.OpenEnded}","Explain the concept of React hooks:",3,,"","React Hooks are functions that let you use state and other React features without writing a class."`,
      `"${QuestionType.FillInBlanks}","JavaScript is a ____ language that adds ____ to web pages.",2,,"programming,interactivity",`,
      `"${QuestionType.SortAnswer}","Sort these events in the order they occur in React lifecycle:",3,,"Component mounts,Props/state update,Component renders,Component unmounts","0,2,1,3"`,
      `"${QuestionType.Matching}","Match the concepts to their definitions:",3,,"React,Component,Props,State","A JavaScript library for building user interfaces,A reusable piece of UI,Data passed from parent to child,Internal data that changes"`,
    ].join("\n");
    
    const csvContent = headers + sampleData;
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'quiz_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        
        // Skip header row
        const dataRows = lines.slice(1).filter(line => line.trim() !== '');
        
        if (dataRows.length === 0) {
          alert('No question data found in the CSV file.');
          return;
        }
        
        const newQuestions: Question[] = [];
        
        for (const row of dataRows) {
          // Handle quoted values correctly by using a regex to parse CSV
          const values: string[] = [];
          let inQuote = false;
          let currentValue = '';
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
              inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Add the last value
          values.push(currentValue);
          
          // Extract values
          const [type, questionText, pointsStr, correctAnswer, optionsText, additionalData] = values;
          const questionType = type.replace(/"/g, '') as QuestionType;
          const points = parseInt(pointsStr) || 1;
          
          // Create question based on type
          let newQuestion: Question;
          
          switch (questionType) {
            case QuestionType.TrueFalse:
              newQuestion = {
                id: generateId(),
                type: QuestionType.TrueFalse,
                question: questionText.replace(/"/g, ''),
                points,
                correctAnswer: correctAnswer.toLowerCase() === 'true'
              };
              break;
              
            case QuestionType.SingleChoice:
            case QuestionType.MultipleChoice:
              const options = optionsText ? optionsText.split(',').map(opt => opt.trim()) : [];
              let correctAnswers: number[] = [];
              
              if (questionType === QuestionType.SingleChoice) {
                const correctIndex = parseInt(correctAnswer);
                correctAnswers = isNaN(correctIndex) ? [] : [correctIndex];
              } else {
                correctAnswers = correctAnswer.split(',')
                  .map(idx => parseInt(idx.trim()))
                  .filter(idx => !isNaN(idx));
              }
              
              newQuestion = {
                id: generateId(),
                type: questionType,
                question: questionText.replace(/"/g, ''),
                points,
                options,
                correctAnswers
              };
              break;
              
            case QuestionType.OpenEnded:
              newQuestion = {
                id: generateId(),
                type: QuestionType.OpenEnded,
                question: questionText.replace(/"/g, ''),
                points,
                modelAnswer: additionalData || ''
              };
              break;
              
            case QuestionType.FillInBlanks:
              const answers = optionsText ? optionsText.split(',').map(ans => ans.trim()) : [];
              newQuestion = {
                id: generateId(),
                type: QuestionType.FillInBlanks,
                question: questionText.replace(/"/g, ''),
                points,
                questionWithBlanks: questionText.replace(/"/g, ''),
                answers
              };
              break;
              
            case QuestionType.SortAnswer:
              const items = optionsText ? optionsText.split(',').map(item => item.trim()) : [];
              const correctOrder = additionalData ? 
                additionalData.split(',').map(idx => parseInt(idx.trim())).filter(idx => !isNaN(idx)) : 
                items.map((_, i) => i);
              
              newQuestion = {
                id: generateId(),
                type: QuestionType.SortAnswer,
                question: questionText.replace(/"/g, ''),
                points,
                items,
                correctOrder
              };
              break;
              
            case QuestionType.Matching:
            case QuestionType.ImageMatching:
              const leftItems = optionsText ? optionsText.split(',').map(item => item.trim()) : [];
              const rightItems = additionalData ? additionalData.split(',').map(item => item.trim()) : [];
              
              const matchingItems: MatchingItem[] = leftItems.map((left, index) => ({
                id: `match_${index}`,
                left,
                right: rightItems[index] || ''
              }));
              
              newQuestion = {
                id: generateId(),
                type: questionType,
                question: questionText.replace(/"/g, ''),
                points,
                items: matchingItems,
                isImage: questionType === QuestionType.ImageMatching
              };
              break;
              
            default:
              continue; // Skip unsupported question types
          }
          
          newQuestions.push(newQuestion);
        }
        
        if (newQuestions.length > 0) {
          // Update the quiz with the new questions
          setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, ...newQuestions]
          }));
          
          // Save to localStorage with the correct format
          const updatedQuizData = {
            ...quizData,
            questions: [...quizData.questions, ...newQuestions]
          };
          
          localStorage.setItem('quizBuilderContent', JSON.stringify({
            data: {
              ...updatedQuizData,
              maxQuestions: updatedQuizData.maxQuestions,
              passingGrade: updatedQuizData.passingGrade,
            },
            timestamp: Date.now()
          }));
          
          alert(`Successfully imported ${newQuestions.length} question(s).`);
        } else {
          alert('No valid questions found in the CSV file.');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format and try again.');
      }
    };
    
    reader.readAsText(file);
    
    // Clear the file input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  // Create a new question based on the selected type (Keep)
  const addNewQuestion = () => {
    // ... implementation remains the same ...
    let newQuestion: Question;
    
    switch (newQuestionType) {
      case QuestionType.TrueFalse:
        newQuestion = {
          id: generateId(),
          type: QuestionType.TrueFalse,
          question: 'New True/False question',
          points: 1,
          correctAnswer: true
        };
        break;
        
      case QuestionType.SingleChoice:
        newQuestion = {
          id: generateId(),
          type: QuestionType.SingleChoice,
          question: 'New Single Choice question',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswers: [0],
          points: 1
        };
        break;
        
      case QuestionType.MultipleChoice:
        newQuestion = {
          id: generateId(),
          type: QuestionType.MultipleChoice,
          question: 'New Multiple Choice question',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswers: [0, 1],
          points: 2
        };
        break;
        
      case QuestionType.OpenEnded:
        newQuestion = {
          id: generateId(),
          type: QuestionType.OpenEnded,
          question: 'New Open Ended question',
          points: 3,
          modelAnswer: 'This is a sample model answer.'
        };
        break;
        
      case QuestionType.FillInBlanks:
        newQuestion = {
          id: generateId(),
          type: QuestionType.FillInBlanks,
          question: 'New Fill in the Blanks question',
          questionWithBlanks: 'This is a _____ with some _____.',
          answers: ['question', 'blanks'],
          points: 2
        };
        break;
        
      case QuestionType.SortAnswer:
        newQuestion = {
          id: generateId(),
          type: QuestionType.SortAnswer,
          question: 'New Sort Answer question',
          items: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
          correctOrder: [0, 1, 2, 3],
          points: 3
        };
        break;
        
      case QuestionType.Matching:
        newQuestion = {
          id: generateId(),
          type: QuestionType.Matching,
          question: 'New Matching question',
          items: [
            { id: 'match1', left: 'Item 1', right: 'Match 1' },
            { id: 'match2', left: 'Item 2', right: 'Match 2' },
            { id: 'match3', left: 'Item 3', right: 'Match 3' }
          ],
          points: 3
        };
        break;
        
      case QuestionType.ImageMatching:
        newQuestion = {
          id: generateId(),
          type: QuestionType.ImageMatching,
          question: 'New Image Matching question',
          items: [
            { id: 'img1', left: '/images/react-logo.svg', right: 'React' },
            { id: 'img2', left: '/images/angular-logo.svg', right: 'Angular' },
            { id: 'img3', left: '/images/vue-logo.svg', right: 'Vue' }
          ],
          isImage: true,
          points: 3
        };
        break;
        
      default:
        // Add exhaustive check
        const _exhaustiveCheck: never = newQuestionType;
        console.error("Unsupported question type:", _exhaustiveCheck);
        return;
    }
    
    setQuizData(prev => ({
      ...prev,
      questions: [newQuestion, ...prev.questions] 
    }));
    
    setActiveQuestionId(newQuestion.id);
    saveQuiz();
  };

  // Delete a question (Keep)
  const deleteQuestion = (id: string) => {
    // ... implementation remains the same ...
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
    
    if (activeQuestionId === id) {
      setActiveQuestionId(null);
    }
    
    saveQuiz();
  };

  // Render a specific question type component (Keep - for editor)
  const renderQuestionEditor = (question: Question) => {
    // ... implementation remains the same ...
    switch (question.type) {
      case QuestionType.TrueFalse:
        return (
          <TrueFalseQuestionEditor 
            question={question as TrueFalseQuestion} 
            onChange={(updatedQuestion) => updateQuestion(updatedQuestion)}
          />
        );
        
      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice:
        return (
          <ChoiceQuestionEditor 
            question={question as ChoiceQuestion} 
            onChange={(updatedQuestion) => updateQuestion(updatedQuestion)}
          />
        );
        
      case QuestionType.OpenEnded:
        return (
          <OpenEndedQuestionEditor 
            question={question as OpenEndedQuestion} 
            onChange={(updatedQuestion) => updateQuestion(updatedQuestion)}
          />
        );
        
      case QuestionType.FillInBlanks:
        return (
          <FillInBlanksQuestionEditor 
            question={question as FillInBlanksQuestion} 
            onChange={(updatedQuestion) => updateQuestion(updatedQuestion)}
          />
        );
        
      case QuestionType.SortAnswer:
        return (
          <SortAnswerQuestionEditor 
            question={question as SortAnswerQuestion} 
            onChange={(updatedQuestion) => updateQuestion(updatedQuestion)}
          />
        );
        
      case QuestionType.Matching:
      case QuestionType.ImageMatching:
        return (
          <MatchingQuestionEditor 
            question={question as MatchingQuestion} 
            onChange={(updatedQuestion) => updateQuestion(updatedQuestion)}
          />
        );
        
      default:
        // Add exhaustive check
        const _exhaustiveCheck: never = question;
        console.error("Unsupported question type in editor:", _exhaustiveCheck);
        return <div>Unknown question type</div>;
    }
  };

  // Update an existing question (Keep)
  const updateQuestion = (updatedQuestion: Question) => {
    // ... implementation remains the same ...
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    }));
    
    saveQuiz();
  };

  // Filter questions based on selected type (Keep)
  const filteredQuestions = filterType 
    ? quizData.questions.filter(q => q.type === filterType)
    : quizData.questions;

  // Function to render the preview of a question (Keep)
  function renderQuestionPreview(question: Question) {
    // ... implementation remains the same ...
    switch (question.type) {
      case QuestionType.TrueFalse:
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Answer:</p>
              <div className="flex space-x-4">
                <label className={`flex items-center ${(question as TrueFalseQuestion).correctAnswer === true ? 'text-green-600 font-medium' : ''}`}>
                  <input
                    type="radio"
                    checked={(question as TrueFalseQuestion).correctAnswer === true}
                    readOnly
                    className="mr-2"
                  />
                  <span>True</span>
                </label>
                <label className={`flex items-center ${(question as TrueFalseQuestion).correctAnswer === false ? 'text-green-600 font-medium' : ''}`}>
                  <input
                    type="radio"
                    checked={(question as TrueFalseQuestion).correctAnswer === false}
                    readOnly
                    className="mr-2"
                  />
                  <span>False</span>
                </label>
              </div>
            </div>
          </div>
        );
        
      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice:
        const choiceQuestion = question as ChoiceQuestion;
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
              <div className="space-y-2">
                {choiceQuestion.options.map((option, index) => (
                  <div key={index} className={`flex items-center p-2 rounded-md ${choiceQuestion.correctAnswers.includes(index) ? 'bg-green-50' : ''}`}>
                    {choiceQuestion.type === QuestionType.SingleChoice ? (
                      <div className={`w-4 h-4 rounded-full border mr-2 ${
                        choiceQuestion.correctAnswers.includes(index) 
                          ? 'bg-teal-500 border-teal-500' 
                          : 'border-gray-400'
                      }`}>
                        {choiceQuestion.correctAnswers.includes(index) && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    ) : (
                      choiceQuestion.correctAnswers.includes(index) ? (
                        <CheckSquare size={18} className="text-teal-500 mr-2" />
                      ) : (
                        <Square size={18} className="text-gray-400 mr-2" />
                      )
                    )}
                    <span className={choiceQuestion.correctAnswers.includes(index) ? 'font-medium' : ''}>{option}</span>
                    {choiceQuestion.correctAnswers.includes(index) && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center"> {/* Updated span */}
                        <Check size={14} className="mr-0.5" /> Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case QuestionType.OpenEnded:
        const openQuestion = question as OpenEndedQuestion;
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Model Answer:</p>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
                {openQuestion.modelAnswer || 'No model answer provided.'}
              </div>
            </div>
          </div>
        );
        
      case QuestionType.FillInBlanks:
        const fillQuestion = question as FillInBlanksQuestion;
        const formattedText = fillQuestion.questionWithBlanks.split('_____').map((part, i) => {
          if (i === fillQuestion.questionWithBlanks.split('_____').length - 1) {
            return <span key={i}>{part}</span>;
          }
          const answer = fillQuestion.answers[i] || '';
          return (
            <React.Fragment key={i}>
              {part}
              <span className="inline-block bg-green-100 text-green-800 px-1 rounded mx-1">
                {answer}
              </span>
            </React.Fragment>
          );
        });
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Question with Answers:</p>
              <div className="p-3 bg-gray-50 rounded-md">
                {formattedText}
              </div>
            </div>
          </div>
        );
        
      case QuestionType.SortAnswer:
        const sortQuestion = question as SortAnswerQuestion;
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Correct Order:</p>
              <ol className="list-decimal pl-5 space-y-1">
                {sortQuestion.correctOrder.map((itemIndex, index) => (
                  <li key={index} className="p-2 bg-gray-50 rounded-md">
                    {sortQuestion.items[itemIndex] || `Item ${itemIndex + 1}`}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
        
      case QuestionType.Matching:
      case QuestionType.ImageMatching:
        const matchingQuestion = question as MatchingQuestion;
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Matching Pairs:</p>
              <div className="space-y-2">
                {matchingQuestion.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-md">
                    <div className="font-medium">{item.left}</div>
                    <div className="font-medium">{item.right}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
         // Add exhaustive check
         const _exhaustiveCheck: never = question;
         console.error("Unsupported question type in preview:", _exhaustiveCheck);
        return <div>Preview not available for this question type</div>;
    }
  }

  return (
    <PopupContainer>
      {/* Inject CSS for consistent layout */}
      <StyleTag css={globalStyles} />
      
      {/* Make this outer div a simple flex container */}
      <div className="quiz-builder flex flex-col h-full">
        {/* Quiz Header & Settings (Keep) */}
        <div className="mb-5 flex-shrink-0"> {/* Make header non-flexible */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">Quiz Builder</h2> 
          </div>
          <div>
            <div className="w-full">
              <div className="flex flex-col mb-2">
                <label className="mb-1 text-sm font-medium text-gray-700">Quiz Title</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => {
                    setQuizData({
                      ...quizData,
                      title: e.target.value
                    });
                    // Auto-save when title changes
                    setTimeout(() => saveQuiz(), 0);
                  }}
                  placeholder="Enter quiz title"
                  className="p-2 border border-gray-300 rounded-md w-full"
                  disabled={viewMode === 'quiz'}
                />
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">Quiz Description</label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => {
                    setQuizData({
                      ...quizData,
                      description: e.target.value
                    });
                    // Auto-save when description changes
                    setTimeout(() => saveQuiz(), 0);
                  }}
                  placeholder="Enter quiz description"
                  className="p-2 border border-gray-300 rounded-md w-full h-20"
                  disabled={viewMode === 'quiz'}
                />
              </div>
            </div>
          </div>
          
          {/* Quiz settings row */}
          <div className="flex items-center space-x-6 mb-4">
          {/* Time limit input */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Time Limit (minutes)</label>
              <input
                type="number"
                min="0"
                value={quizData.timeLimit || ''}
                onChange={(e) => {
                  setQuizData({ 
                    ...quizData, 
                    timeLimit: e.target.value ? Number(e.target.value) : undefined 
                  });
                  // Auto-save when time limit changes
                  setTimeout(() => saveQuiz(), 0);
                }}
                placeholder="Optional"
                className="p-2 border border-gray-300 rounded-md w-24"
                disabled={viewMode === 'quiz'} // Disable settings in quiz mode
              />
            </div>

            {/* Max Questions Input */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Max Questions</label>
              <input
                type="number"
                min="1"
                max={quizData.questions.length || 1} // Use 1 if no questions yet
                value={quizData.maxQuestions || ''}
                onChange={(e) => {
                  setQuizData({ 
                    ...quizData, 
                    maxQuestions: e.target.value ? Number(e.target.value) : undefined 
                  });
                  // Auto-save when max questions changes
                  setTimeout(() => saveQuiz(), 0);
                }}
                placeholder="All"
                className="p-2 border border-gray-300 rounded-md w-24"
                disabled={viewMode === 'quiz'} // Disable settings in quiz mode
              />
            </div>

            {/* Passing Grade Input */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Passing Grade (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={quizData.passingGrade || ''}
                onChange={(e) => {
                  setQuizData({ 
                    ...quizData, 
                    passingGrade: e.target.value ? Number(e.target.value) : undefined 
                  });
                  // Auto-save when passing grade changes
                  setTimeout(() => saveQuiz(), 0);
                }}
                placeholder="e.g., 70"
                className="p-2 border border-gray-300 rounded-md w-24"
                disabled={viewMode === 'quiz'} // Disable settings in quiz mode
              />
            </div>
          </div>
        </div>
        
        {/* Add question and save quiz buttons - shown only in edit mode (Keep) */}
        {viewMode === 'edit' && (
          <div className="mb-4 flex flex-wrap items-center space-x-2 flex-shrink-0"> {/* Allow wrapping and ensure consistent spacing */}
            <div className="flex items-center space-x-2"> {/* Remove flex-1, keep items grouped */}
              <select
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
                className="p-2 border border-gray-300 rounded-md w-40"
              >
                {Object.values(QuestionType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                onClick={addNewQuestion}
                className="ml-2 px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Question
              </button>
              
              {/* File input is hidden, triggered by the Import button */}
              <input 
                type="file" 
                id="quiz-csv-import"
                accept=".csv"
                className="hidden"
                onChange={handleFileImport}
              />
              
              <button
                onClick={() => document.getElementById('quiz-csv-import')?.click()}
                className="ml-2 px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center"
              >
                <Upload size={16} className="mr-1" />
                Import Quiz
              </button>
              
              <button
                onClick={createSampleCSV}
                className="ml-2 px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center"
              >
                <Download size={16} className="mr-1" />
                Download Template
              </button>
            </div>
            
            {/* 
              NOTE: This Save Quiz button is now optional since all quiz data
              (including metadata like title, description, time limits, etc.)
              is automatically saved whenever it changes. You can safely remove
              this button if desired.
            */}
            <button 
              onClick={saveQuiz} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center font-medium ml-2 shadow-sm min-w-[140px] whitespace-nowrap"
              title="Save quiz state (optional - quiz data is auto-saved)"
            >
              <Save size={16} color="white" className="mr-1.5" />
              <span className="inline-block">Save Quiz</span>
            </button>
          </div>
        )}

        {/* View mode toggle and filter (Keep) */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0"> {/* Make toggles non-flexible */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleViewMode('edit')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm border ${
                viewMode === 'edit' 
                  ? 'bg-teal-100 text-teal-600 border-teal-300' 
                  : 'text-gray-600 hover:text-teal-600 border-gray-300'
              }`}
            >
              <Edit size={16} className="mr-1" />
              Edit Mode
            </button>
            
            <button
              onClick={() => toggleViewMode('preview')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm border ${
                viewMode === 'preview' 
                  ? 'bg-blue-100 text-blue-600 border-blue-300' 
                  : 'text-gray-600 hover:text-blue-600 border-gray-300'
              }`}
            >
              <Eye size={16} className="mr-1" />
              Preview Mode
            </button>
            
            <button
              onClick={() => toggleViewMode('quiz')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm border ${
                viewMode === 'quiz' 
                  ? 'bg-purple-100 text-purple-600 border-purple-300' 
                  : 'text-gray-600 hover:text-purple-600 border-gray-300'
              }`}
            >
              <Play size={16} className="mr-1" />
              Take Quiz
            </button>
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex items-center">
            <Filter size={16} className="text-gray-500 mr-1" />
            <select
              className="p-1.5 border border-gray-300 rounded-md text-sm"
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value as QuestionType || null)}
              disabled={viewMode === 'quiz'} // Disable filter in quiz mode
            >
              <option value="">All Question Types</option>
              {Object.values(QuestionType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* New Scrolling Container for Content */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4"> 
          {/* Edit/Preview Mode: Show Filtered List (Keep) */}
          {(viewMode === 'edit' || viewMode === 'preview') && (
            filteredQuestions.length === 0 ? (
              <div className="text-gray-500 text-sm p-4 border border-dashed border-gray-300 rounded-md text-center">
                {filterType 
                  ? `No ${filterType} questions found. Add some using the \"Add Question\" button.`
                  : `No questions added yet. Use the \"Add Question\" button to create questions.`}
              </div>
            ) : (
              <div className="space-y-2 w-full">
                {filteredQuestions.map((question) => ( // Removed index, using findIndex below
                  <div 
                    key={question.id}
                    className={`p-3 border ${activeQuestionId === question.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200'} rounded-md hover:border-teal-300 transition-colors w-full text-left`}
                  >
                    {/* Header */} 
                    <div className="flex justify-between items-center">
                      {/* Left side (number, text, type, points) */} 
                      <div className="flex items-start mr-4"> {/* Removed flex-1 from outer container */} 
                        <span className="text-gray-500 font-medium mr-2"> 
                          {quizData.questions.findIndex(q => q.id === question.id) + 1}.
                        </span>
                        <div className="text-left flex-1"> {/* Added flex-1 back to inner text block */} 
                          <div className="font-medium">{question.question}</div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mr-2">
                              {question.type}
                            </span>
                            <span className={`text-xs text-teal-600`}>
                              {question.points} {question.points === 1 ? 'point' : 'points'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Right side (actions) */} 
                      <div className="flex items-center">
                        {viewMode === 'edit' ? ( /* Edit actions */
                          <>
                            <button 
                              onClick={() => setActiveQuestionId(activeQuestionId === question.id ? null : question.id)}
                              className="text-gray-500 hover:text-teal-600 p-1 mr-1"
                              title={activeQuestionId === question.id ? "Collapse question" : "Edit question"}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => deleteQuestion(question.id)}
                              className="text-gray-500 hover:text-red-600 p-1"
                              title="Delete question"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : ( /* Preview actions */
                          <button 
                            onClick={() => setActiveQuestionId(activeQuestionId === question.id ? null : question.id)}
                            className="text-gray-500 hover:text-teal-600 p-1"
                            title={activeQuestionId === question.id ? "Hide details" : "View details"}
                          >
                            {activeQuestionId === question.id ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Editor/Preview Body (collapsible) */} 
                    {(activeQuestionId === question.id) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {viewMode === 'edit' 
                          ? renderQuestionEditor(question)
                          : renderQuestionPreview(question)
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Quiz Mode: Render QuizPlayer */}
          {viewMode === 'quiz' && quizQuestions.length > 0 && (
            <QuizPlayer 
              quizData={quizData} 
              questions={quizQuestions} 
              onExitQuiz={() => toggleViewMode('preview')} // Go back to preview after quiz
              // Pass quiz session state and setters
              userAnswers={currentUserAnswers}
              setUserAnswers={setCurrentUserAnswers}
              quizSubmitted={isQuizSubmitted}
              setQuizSubmitted={setIsQuizSubmitted}
              currentQuestionIndex={currentQuizQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuizQuestionIndex}
              remainingTime={quizRemainingTime}
              setRemainingTime={setQuizRemainingTime}
              eliminatedOptions={currentEliminatedOptions}
              setEliminatedOptions={setCurrentEliminatedOptions}
            />
          )}

          {viewMode === 'quiz' && quizQuestions.length === 0 && (
            <div className="text-center p-10 text-gray-600">
              <p>No questions available for the quiz based on current settings.</p>
              <button 
                onClick={() => toggleViewMode('edit')}
                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
              >
                Go to Edit Mode
              </button>
            </div>
          )}
        </div>
      </div>
    </PopupContainer>
  );
};

export default QuizBuilder;

// --- Explicit Exports for types and shared components ---
export type { 
  Question, 
  BaseQuestion,
  TrueFalseQuestion, 
  ChoiceQuestion, 
  OpenEndedQuestion, 
  FillInBlanksQuestion, 
  SortAnswerQuestion, 
  MatchingItem,
  MatchingQuestion, 
  QuizData,
  UserAnswers,
  EliminatedOptions,
  SortableQuizListProps, 
  MatchingQuestionQuizModeProps 
};

// Export the enum and components themselves
export { 
  QuestionType, 
  SortableQuizList, 
  MatchingQuestionQuizMode 
};