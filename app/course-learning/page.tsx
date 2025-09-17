
"use client"
import CourseLearningNavbar from "./final-components/CourselearningNavbar"
import CourseSyllabusSidebar from "./final-components/CourseSyllabusSidebar"
import CourseLessonLearningSidebar from "./final-components/CourselessonLearningSidebar"
import CourseEditor from "./final-components/CourseCodeEditor"
import CourseVideoPlayer from "./final-components/CourseVideoPlayer"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
// Import interactive components
import FlashCards from "./final-components/FlashCards/FlashCards"
import MindMap from "./final-components/InteractiveMindMap/MindMap"
import MemoryGame from "./final-components/MemoryGame/MemoryGame"
import QuizPlayer from "./final-components/QuizBuilder/QuizPlayer"
import { QuestionType, QuizData, UserAnswers, EliminatedOptions } from "./final-components/QuizBuilder/QuizBuilder"

interface Lesson {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  course_id: number;
  video_source?: string;
  video_path?: string;
  video_filename?: string;
  image_path?: string;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number;
  code?: string;
  code_language?: string;
  code_output?: string;
  course_code?: string;
  course_code_language?: string;
}

interface FlashcardData {
  id: number;
  front: string;
  back: string;
  clue: string;
  topic_id: number;
  card_order: number;
}

interface MindMapData {
  nodes: Array<{
    id: string;
    name: string;
    group: number;
    level: number;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
}

interface MemoryGameData {
  topic: string;
  cards: Array<{
    term: string;
    definition: string;
    pair_order: number;
  }>;
}

interface APIFlashcard {
  id: number;
  front: string;
  back: string;
  topic_id: number;
  card_order: number;
}

interface APIMindmap {
  id: number;
  course_id: number;
  topic_id: number;
  mindmap_mermaid: string;
  mindmap_json: Record<string, unknown>;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number | null;
}

interface APIQuiz {
  id: number;
  title: string;
  description: string;
  topic_id: number;
  course_id: number;
  time_limit_minutes: number;
  max_questions: number;
  passing_grade_percent: number;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number | null;
}

// interface APIQuestion {
//   quiz_id: number;
//   type: string;
//   question_text: string;
//   points: number;
//   answers: {
//     answer?: boolean | number | number[] | string[];
//     options?: string[];
//     modelAnswer?: string;
//     items?: string[];
//     correctOrder?: number[];
//     stems?: string[];
//     matches?: string[];
//     acceptedAnswers?: string[];
//   };
//   question_order: number;
//   active: boolean;
//   id: number;
//   created_at: string;
//   created_by: number;
//   updated_at: string;
//   updated_by: number | null;
// }

interface APIMemoryGame {
  id: number;
  description: string;
  topic_id: number;
}

interface APIMemoryGamePair {
  term: string;
  term_description: string;
  pair_order: number;
}

interface APILesson {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  course_id: number;
  video_source?: string;
  video_path?: string;
  video_filename?: string;
  image_path?: string;
  is_completed: boolean;
  active: boolean;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by?: number;
  code?: string;
  code_language?: string;
  code_output?: string;
  course_code?: string;
  course_code_language?: string;
}



// New interface for interactive components
interface InteractiveComponent {
  id: string;
  type: 'mindmap' | 'flashcards' | 'memorygame' | 'quiz';
  title: string;
  topic_id: number;
  data?: Record<string, unknown>;
}

// FlashCards with API Integration Component
const FlashCardsWithAPI = ({ topic, topicId, courseId }: { topic: string; topicId: number; courseId: string }) => {
  const [flashcardData, setFlashcardData] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch flashcard data from API
  useEffect(() => {
    const fetchFlashcardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all flashcards for the course
        const flashcardsResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/flashcards/`);

        if (!flashcardsResponse.ok) {
          throw new Error(`Failed to fetch flashcards: ${flashcardsResponse.status} ${flashcardsResponse.statusText}`);
        }

        const flashcards = await flashcardsResponse.json();

        // Filter flashcards that match the topic ID
        const topicFlashcards = flashcards.filter((flashcard: APIFlashcard) => {
          return flashcard.topic_id === topicId;
        });

        if (topicFlashcards.length > 0) {
          // Sort flashcards by card_order
          const sortedFlashcards = topicFlashcards.sort((a: APIFlashcard, b: APIFlashcard) => a.card_order - b.card_order);

          setFlashcardData(sortedFlashcards);
        } else {
          // Fallback to dummy data if no matching flashcards found
          setFlashcardData([
            {
              id: 1,
              front: topic,
              back: 'Key concepts and information',
              clue: 'Study this topic thoroughly',
              topic_id: topicId,
              card_order: 1
            },
            {
              id: 2,
              front: 'Important Points',
              back: 'Remember the key takeaways',
              clue: 'Focus on main concepts',
              topic_id: topicId,
              card_order: 2
            },
            {
              id: 3,
              front: 'Practice Questions',
              back: 'Test your understanding',
              clue: 'Apply what you learned',
              topic_id: topicId,
              card_order: 3
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching flashcard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch flashcard data');

        // Fallback to dummy data on error
        setFlashcardData([
          {
            id: 1,
            front: topic,
            back: 'Key concepts and information',
            clue: 'Study this topic thoroughly',
            topic_id: topicId,
            card_order: 1
          },
          {
            id: 2,
            front: 'Important Points',
            back: 'Remember the key takeaways',
            clue: 'Focus on main concepts',
            topic_id: topicId,
            card_order: 2
          },
          {
            id: 3,
            front: 'Practice Questions',
            back: 'Test your understanding',
            clue: 'Apply what you learned',
            topic_id: topicId,
            card_order: 3
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardData();
  }, [topic, topicId, courseId]);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Flashcards</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Show flashcards when data is loaded
  if (flashcardData.length > 0) {
    return (
      <div className="w-full h-full">
        <FlashCards
          topic={topic}
          initialCards={flashcardData.map(card => ({
            question: card.front,
            answer: card.back
          }))}
        />
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Flashcards Available</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    </div>
  );
};

// MindMap with API Integration Component
const MindMapWithAPI = ({ topic, topicId, courseId }: { topic: string; topicId: number; courseId: string }) => {
  const [mindmapData, setMindmapData] = useState<MindMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch mindmap data from API
  useEffect(() => {
    const fetchMindmapData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all mindmaps for the course
        const mindmapsResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/mindmaps/`);

        if (!mindmapsResponse.ok) {
          throw new Error(`Failed to fetch mindmaps: ${mindmapsResponse.status} ${mindmapsResponse.statusText}`);
        }

        const mindmaps = await mindmapsResponse.json();

        // Find mindmap that matches the topic ID
        const selectedMindmap = mindmaps.find((mindmap: APIMindmap) => {
          return mindmap.topic_id === topicId;
        });

        if (selectedMindmap) {

          // Parse Mermaid data to extract nodes and links
          const parseMermaidToMindMapData = (mermaidText: string): MindMapData => {
            const lines = mermaidText.split('\n').map(line => line.trim()).filter(line => line);
            const nodes: MindMapData['nodes'] = [];
            const links: MindMapData['links'] = [];
            const nodeMap = new Map<string, { id: string; name: string; level: number }>();

            let nodeIdCounter = 1;
            // const currentLevel = 0;
            const levelStack: string[] = [];

            lines.forEach((line, index) => {
              // Skip the first line if it's just "mindmap"
              if (index === 0 && line.toLowerCase() === 'mindmap') {
                return;
              }

              // Calculate indentation level - handle both spaces and tabs
              const indentMatch = line.match(/^(\s*)/);
              const indentLength = indentMatch ? indentMatch[1].length : 0;
              const indentLevel = Math.floor(indentLength / 4); // Assuming 4 spaces per level
              
              // Extract node name (remove parentheses and extra formatting)
              let nodeName = line.replace(/^\s*/, '').replace(/^root\(\(/, '').replace(/\)\)$/, '').replace(/^root\(/, '').replace(/\)$/, '');
              
              // Clean up the node name
              nodeName = nodeName.trim();

              if (nodeName) {
                const nodeId = `node_${nodeIdCounter++}`;
                const node = {
                  id: nodeId,
                  name: nodeName,
                  group: 1,
                  level: indentLevel
                };

                nodes.push(node);
                nodeMap.set(nodeName, { id: nodeId, name: nodeName, level: indentLevel });

                // Create links based on hierarchy
                if (indentLevel > 0) {
                  // Find the most recent parent at the previous level
                  let parentNode = null;
                  for (let i = indentLevel - 1; i >= 0; i--) {
                    if (levelStack[i]) {
                      parentNode = levelStack[i];
                      break;
                    }
                  }
                  
                  if (parentNode) {
                    links.push({
                      source: parentNode,
                      target: nodeId
                    });
                  }
                }

                // Update level stack - ensure array is large enough
                while (levelStack.length <= indentLevel) {
                  levelStack.push('');
                }
                levelStack[indentLevel] = nodeId;
                
                // Clear deeper levels
                for (let i = indentLevel + 1; i < levelStack.length; i++) {
                  levelStack[i] = '';
                }
              }
            });

            return { nodes, links };
          };

          try {
            const transformedData = parseMermaidToMindMapData(selectedMindmap.mindmap_mermaid);
            
            // Validate the transformed data
            if (transformedData.nodes.length === 0) {
              throw new Error('No nodes found in mindmap data');
            }

            setMindmapData(transformedData);
          } catch {
            throw new Error('Failed to parse mindmap data');
          }
        } else {
          // Fallback to dummy data if no matching mindmap found
          const fallbackData = {
            nodes: [
              { id: '1', name: topic, group: 1, level: 0 },
              { id: '2', name: 'Key Concepts', group: 1, level: 1 },
              { id: '3', name: 'Examples', group: 1, level: 1 },
              { id: '4', name: 'Practice', group: 1, level: 1 }
            ],
            links: [
              { source: '1', target: '2' },
              { source: '1', target: '3' },
              { source: '1', target: '4' }
            ]
          };
          setMindmapData(fallbackData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mindmap data');

        // Fallback to dummy data on error
        setMindmapData({
          nodes: [
            { id: '1', name: topic, group: 1, level: 0 },
            { id: '2', name: 'Key Concepts', group: 1, level: 1 },
            { id: '3', name: 'Examples', group: 1, level: 1 },
            { id: '4', name: 'Practice', group: 1, level: 1 }
          ],
          links: [
            { source: '1', target: '2' },
            { source: '1', target: '3' },
            { source: '1', target: '4' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMindmapData();
  }, [topic, topicId, courseId]);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mindmap...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Mindmap</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Show mindmap when data is loaded
  if (mindmapData) {
    return (
      <div className="w-full h-full">
        <MindMap initialData={mindmapData} />
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Mindmap Available</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    </div>
  );
};

// Simple Quiz Wrapper Component
const SimpleQuiz = ({ topic, courseId }: { topic: string; courseId: string }) => {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<EliminatedOptions>({});
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for quiz selection
  const [availableQuizzes, setAvailableQuizzes] = useState<APIQuiz[]>([]);
  const [, setSelectedQuizId] = useState<number | null>(null);
  const [showQuizSelection, setShowQuizSelection] = useState(true);

  // Fetch available quizzes from API
  useEffect(() => {
    const fetchAvailableQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all quizzes for the course
        const quizzesResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/quizzes/`);

        if (!quizzesResponse.ok) {
          throw new Error(`Failed to fetch quizzes: ${quizzesResponse.status} ${quizzesResponse.statusText}`);
        }

        const quizzes = await quizzesResponse.json();
        setAvailableQuizzes(quizzes);
        
        if (quizzes.length === 0) {
          throw new Error('No quizzes available for this course');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableQuizzes();
  }, [courseId]);

  // Fetch specific quiz data when a quiz is selected
  const fetchQuizData = async (quizId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Find the selected quiz
      const selectedQuiz = availableQuizzes.find(quiz => quiz.id === quizId);
      if (!selectedQuiz) {
        throw new Error('Selected quiz not found');
      }

      // Fetch questions for this quiz
      const questionsResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/quizzes/${quizId}/questions/`);

      if (!questionsResponse.ok) {
        throw new Error(`Failed to fetch questions: ${questionsResponse.status} ${questionsResponse.statusText}`);
      }

      const questions = await questionsResponse.json();

      // Validate that we have questions
      if (!questions || questions.length === 0) {
        throw new Error('No questions found for this quiz');
      }

      // Transform API data to match QuizPlayer expectations
      const transformedQuizData = {
        title: selectedQuiz.title || `${topic} Quiz`,
        description: selectedQuiz.description || `Test your knowledge on ${topic}`,
        questions: questions.map((q: Record<string, unknown>, index: number) => {
          // Map API question structure to QuizPlayer format based on actual API response
          const transformedQuestion: Record<string, unknown> = {
            id: q.id || `q${index + 1}`,
            question: q.question_text || 'Question text not available',
            points: q.points || 1,
          };

          // Handle different question types based on API response
          switch (q.type) {
            case 'TRUE_FALSE':
              transformedQuestion.type = QuestionType.TrueFalse;
              transformedQuestion.correctAnswer = (q.answers as Record<string, unknown>)?.answer || false;
              break;

            case 'SINGLE':
              transformedQuestion.type = QuestionType.SingleChoice;
              // Handle both standard options and acceptedAnswers format
              if ((q.answers as Record<string, unknown>)?.acceptedAnswers) {
                // For questions with acceptedAnswers (like fill-in-the-blank style)
                transformedQuestion.options = (q.answers as Record<string, unknown>).acceptedAnswers;
                transformedQuestion.correctAnswers = [0]; // First answer is correct
              } else {
                transformedQuestion.options = (q.answers as Record<string, unknown>)?.options || ['Option A', 'Option B', 'Option C', 'Option D'];
                transformedQuestion.correctAnswers = [(q.answers as Record<string, unknown>)?.answer || 0];
              }
              break;

            case 'MULTIPLE':
              transformedQuestion.type = QuestionType.MultipleChoice;
              transformedQuestion.options = (q.answers as Record<string, unknown>)?.options || ['Option A', 'Option B', 'Option C', 'Option D'];
              transformedQuestion.correctAnswers = (q.answers as Record<string, unknown>)?.answer || [0];
              break;

            case 'OPEN_ENDED':
              transformedQuestion.type = QuestionType.OpenEnded;
              transformedQuestion.modelAnswer = (q.answers as Record<string, unknown>)?.modelAnswer || '';
              break;

            case 'SORT_ANSWER':
              transformedQuestion.type = QuestionType.SortAnswer;
              transformedQuestion.items = (q.answers as Record<string, unknown>)?.items || [];
              transformedQuestion.correctOrder = (q.answers as Record<string, unknown>)?.correctOrder || [];
              break;

            case 'MATCHING':
              transformedQuestion.type = QuestionType.Matching;
              // Transform matching data structure
              const matchingItems = [];
              if ((q.answers as Record<string, unknown>)?.stems && (q.answers as Record<string, unknown>)?.matches) {
                for (let i = 0; i < ((q.answers as Record<string, unknown>).stems as string[]).length; i++) {
                  const stem = ((q.answers as Record<string, unknown>).stems as string[])[i];
                  const matchIndex = parseInt(((q.answers as Record<string, unknown>).matches as string[])[i]);
                  const match = ((q.answers as Record<string, unknown>)?.options as string[])?.[matchIndex] || `Match ${i + 1}`;
                  matchingItems.push({
                    id: `match_${i}`,
                    left: stem,
                    right: match
                  });
                }
              }
              transformedQuestion.items = matchingItems;
              break;

            default:
              // Fallback to single choice for unknown types
              transformedQuestion.type = QuestionType.SingleChoice;
              transformedQuestion.options = ['Option A', 'Option B', 'Option C', 'Option D'];
              transformedQuestion.correctAnswers = [0];
              break;
          }

          return transformedQuestion;
        }),
        timeLimit: selectedQuiz.time_limit_minutes || 10,
        maxQuestions: selectedQuiz.max_questions || questions.length,
        passingGrade: selectedQuiz.passing_grade_percent || 70
      };

      setQuizData(transformedQuizData);
      setShowQuizSelection(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelection = (quizId: number) => {
    setSelectedQuizId(quizId);
    fetchQuizData(quizId);
  };

  const handleExitQuiz = () => {
    // Reset quiz state and go back to quiz selection
    setUserAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setRemainingTime(null);
    setEliminatedOptions({});
    setQuizData(null);
    setSelectedQuizId(null);
    setShowQuizSelection(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {showQuizSelection ? 'Loading quizzes...' : 'Loading quiz...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Quiz</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setShowQuizSelection(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show quiz selection interface
  if (showQuizSelection) {
    return (
      <div className="w-full h-full bg-white p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Quizzes</h1>
            <p className="text-gray-600">Choose a quiz to test your knowledge on {topic}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleQuizSelection(quiz.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 ml-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {quiz.max_questions} questions
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {quiz.description}
                </p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Time Limit:</span>
                    <span className="font-medium">{quiz.time_limit_minutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Passing Grade:</span>
                    <span className="font-medium">{quiz.passing_grade_percent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${quiz.is_completed ? 'text-green-600' : 'text-orange-600'}`}>
                      {quiz.is_completed ? 'Completed' : 'Not Completed'}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                  Start Quiz
                </button>
              </div>
            ))}
          </div>

          {availableQuizzes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Quizzes Available</h3>
              <p className="text-gray-500">There are no quizzes available for this topic at the moment.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show quiz when data is loaded
  if (quizData) {
    return (
      <div className="w-full h-full bg-white">
        <QuizPlayer
          quizData={quizData}
          questions={quizData.questions}
          onExitQuiz={handleExitQuiz}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          quizSubmitted={quizSubmitted}
          setQuizSubmitted={setQuizSubmitted}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          remainingTime={remainingTime}
          setRemainingTime={setRemainingTime}
          eliminatedOptions={eliminatedOptions}
          setEliminatedOptions={setEliminatedOptions}
        />
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Quiz Available</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    </div>
  );
}

// MemoryGame with API Integration Component
const MemoryGameWithAPI = ({ topic, topicId, courseId }: { topic: string; topicId: number; courseId: string }) => {
  const [memoryGameData, setMemoryGameData] = useState<MemoryGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch memory game data from API
  useEffect(() => {
    const fetchMemoryGameData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get all memory games for the course
        const memoryGamesResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/memory-games/`);

        if (!memoryGamesResponse.ok) {
          throw new Error('Failed to fetch memory games');
        }

        const memoryGames = await memoryGamesResponse.json();

        // Find a memory game that matches the topic
        let selectedMemoryGame = null;

        // Try to find a memory game that matches the topic ID
        selectedMemoryGame = memoryGames.find((game: APIMemoryGame) => {
          return game.topic_id === topicId;
        });

        // If no matching memory game found, use the first available one
        if (!selectedMemoryGame && memoryGames.length > 0) {
          selectedMemoryGame = memoryGames[0];
        }

        if (selectedMemoryGame) {
          // Now fetch the memory game pairs
          const pairsResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/memory-game-pairs/game/${selectedMemoryGame.id}`);

          if (!pairsResponse.ok) {
            throw new Error('Failed to fetch memory game pairs');
          }

          const pairs = await pairsResponse.json();

          // Transform API data to match MemoryGame component expectations
          const transformedData = {
            topic: selectedMemoryGame.description || topic,
            cards: pairs.map((pair: APIMemoryGamePair) => ({
              term: pair.term,
              definition: pair.term_description,
              pair_order: pair.pair_order
            }))
          };

          setMemoryGameData(transformedData);
        } else {
          throw new Error('No memory games available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch memory game data');

        // Fallback to default data
        setMemoryGameData({
          topic: topic,
          cards: [
            { term: 'React', definition: 'A JavaScript library for building user interfaces', pair_order: 1 },
            { term: 'TypeScript', definition: 'A typed superset of JavaScript', pair_order: 2 },
            { term: 'Next.js', definition: 'A React framework for production', pair_order: 3 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMemoryGameData();
  }, [topic, topicId, courseId]);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memory game...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Memory Game</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Show memory game when data is loaded
  if (memoryGameData) {
    return (
      <div className="w-full h-full">
        <MemoryGame
          topic={memoryGameData.topic}
          cards={memoryGameData.cards.map((card: MemoryGameData['cards'][0]) => ({
            id: `term_${card.pair_order}`,
            content: card.term
          })).concat(memoryGameData.cards.map((card: MemoryGameData['cards'][0]) => ({
            id: `def_${card.pair_order}`,
            content: card.definition
          })))}
        />
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Memory Game Available</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    </div>
  );
};

export default function CourseLearningPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [selectedLessonId, setSelectedLessonId] = useState<number | undefined>(undefined);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'video' | 'component'>('video');
  const [selectedComponent, setSelectedComponent] = useState<InteractiveComponent | null>(null);
  const [courseId, setCourseId] = useState<string>("641");
  const [isLearningSidebarFullScreen, setIsLearningSidebarFullScreen] = useState<boolean | null>(null);


  // Percentage-based layout state for seamless resizing (syllabus is now overlay)
  const [lessonSidebarWidthPercent, setLessonSidebarWidthPercent] = useState(20); // Learning sidebar 20%
  const [videoWidthPercent, setVideoWidthPercent] = useState(40); // Video player 40%
  const [editorWidthPercent, setEditorWidthPercent] = useState(40); // Code editor 40%


  // Drag state (removed syllabus dragging)
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'lesson' | 'video' | 'editor' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Availability flags for video and editor
  const hasVideo = !!(currentLesson && (currentLesson.video_path || currentLesson.video_source || currentLesson.video_filename));
  const hasEditor = !!(currentLesson && ((currentLesson.code || currentLesson.course_code) && (currentLesson.code_language || currentLesson.course_code_language)));

  // Fetch lesson data when selectedLessonId changes
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!selectedLessonId) {
        setCurrentLesson(null);
        return;
      }

      try {
        setLoading(true);

        const lessonResponse = await fetch(`https://course-viewer-mvp-backend.vercel.app/api/v1/course-learning/courses/${courseId}/lessons/`);

        if (lessonResponse.ok) {
          const lessons = await lessonResponse.json();

          // Find the specific lesson by ID
          const lesson = lessons.find((l: APILesson) => l.id === selectedLessonId);

          if (lesson) {
            setCurrentLesson(lesson);
          } else {
            setCurrentLesson(null);
          }
        } else {
          setCurrentLesson(null);
        }
      } catch {
        setCurrentLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [selectedLessonId, courseId]);

  // Handle component selection
  const handleComponentSelect = (component: InteractiveComponent) => {
    setSelectedComponent(component);
    setActiveView('component');
    // Hide lesson sidebar when component is selected for full screen experience
    setIsLearningSidebarFullScreen(true);
  };

  // Handle lesson selection
  const handleLessonSelect = (lessonId: number) => {
    if (hasVideo || hasEditor) {
      setIsLearningSidebarFullScreen(false);
    }
    setSelectedLessonId(lessonId);
    setActiveView('video');
    setSelectedComponent(null);
  };

  
  // Handle course ID change
  const handleCourseIdChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    setSelectedLessonId(undefined);
    setCurrentLesson(null);
    setSelectedComponent(null);
    setActiveView('video');
  };

  // Video props based on current lesson
  const videoProps = useMemo(() => ({
    videoPath: currentLesson?.video_path,
    videoFileName: currentLesson?.video_filename,
    title: currentLesson?.title || "Select a lesson to start learning",
    thumbnailUrl: currentLesson?.image_path || "/images/hero-image-courses.png",
    onProgressUpdate: () => {
      // Video progress tracking
    }
  }), [currentLesson]);





  // Handle mouse down on resize handles
  const handleMouseDown = useCallback((type: 'lesson' | 'editor') => {
    setIsDragging(true);
    setDragType(type);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  // Handle mouse move for resizing with proper constraints (syllabus is now overlay)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    const mousePercent = (mouseX / containerWidth) * 100;

    if (dragType === 'lesson') {
      // Resize lesson sidebar with constraints based on available right-side content
      const minLessonPercent = 15;
      const rightMinPercent = (hasVideo || hasEditor || (activeView === 'component' && selectedComponent)) ? 30 : 0;
      const maxLessonPercent = 100 - rightMinPercent;
      const newLessonPercent = Math.max(minLessonPercent, Math.min(maxLessonPercent, mousePercent));

      setLessonSidebarWidthPercent(newLessonPercent);

      if (rightMinPercent > 0) {
        const remainingForRight = 100 - newLessonPercent;
        
        if (hasEditor) {
          // When editor is present, distribute between video and editor
          const totalRight = (videoWidthPercent + editorWidthPercent) || 1; // avoid divide by zero
          const videoRatio = videoWidthPercent / totalRight;
          const newVideoPercent = remainingForRight * videoRatio;
          const newEditorPercent = remainingForRight - newVideoPercent;
          setVideoWidthPercent(newVideoPercent);
          setEditorWidthPercent(newEditorPercent);
        } else {
          // When no editor, video/interactive components take full remaining width
          setVideoWidthPercent(remainingForRight);
        }
      }
    } else if (dragType === 'editor') {
      // Resize editor and automatically adjust video
      const availableWidth = 100 - lessonSidebarWidthPercent;

      // Calculate the mouse position relative to the start of the video section
      const videoStartX = (lessonSidebarWidthPercent / 100) * containerWidth;
      const relativeMouseX = mouseX - videoStartX;

      // Convert to percentage of available width
      const relativeMousePercent = (relativeMouseX / containerWidth) * 100;

      // Calculate new editor width based on mouse position
      // When dragging right, editor should get wider
      // Fix the direction by inverting the calculation
      const newEditorPercent = Math.max(20, Math.min(availableWidth - 20, availableWidth - relativeMousePercent));
      const newVideoPercent = availableWidth - newEditorPercent;

      setEditorWidthPercent(newEditorPercent);
      setVideoWidthPercent(newVideoPercent);
    }
  }, [isDragging, dragType, lessonSidebarWidthPercent, videoWidthPercent, editorWidthPercent, hasVideo, hasEditor, activeView, selectedComponent]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Ensure total width is always 100% (syllabus is now overlay)
  useEffect(() => {
    if (hasEditor) {
      const totalWidth = lessonSidebarWidthPercent + videoWidthPercent + editorWidthPercent;
      if (Math.abs(totalWidth - 100) > 0.1) {
        // Adjust video and editor to maintain their ratio and total 100%
        const availableWidth = 100 - lessonSidebarWidthPercent;
        const videoRatio = videoWidthPercent / (videoWidthPercent + editorWidthPercent);
        const newVideoPercent = availableWidth * videoRatio;
        const newEditorPercent = availableWidth - newVideoPercent;

        setVideoWidthPercent(newVideoPercent);
        setEditorWidthPercent(newEditorPercent);
      }
    } else {
      // When no editor, video/interactive components should take remaining width
      const totalWidth = lessonSidebarWidthPercent + videoWidthPercent;
      if (Math.abs(totalWidth - 100) > 0.1) {
        const newVideoPercent = 100 - lessonSidebarWidthPercent;
        setVideoWidthPercent(newVideoPercent);
      }
    }
  }, [lessonSidebarWidthPercent, videoWidthPercent, editorWidthPercent, hasEditor]);

  // Render the appropriate component based on active view
  const renderMainContent = () => {
    if (activeView === 'component' && selectedComponent) {
      switch (selectedComponent.type) {
        case 'mindmap':
          return (
            <div className="w-full h-full bg-white">
              <MindMapWithAPI topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />
            </div>
          );
        case 'flashcards':
          return <FlashCardsWithAPI topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
        case 'memorygame':
          return <MemoryGameWithAPI topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
        case 'quiz':
          return <SimpleQuiz topic={selectedComponent.title} courseId={courseId} />;
        default:
          return null;
      }
    }


    if (!selectedLessonId) {
      return null
    }

    if (loading) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lesson...</p>
          </div>
        </div>
      );
    }

    if (!hasVideo) {
      // If no video but we have interactive components, show them
      if (activeView === 'component' && selectedComponent) {
        return null; // This will be handled by the component rendering above
      }
      return null;
    }

    return <CourseVideoPlayer {...videoProps} />;
  };

  // If an interactive component is selected, show it in full screen
  if (activeView === 'component' && selectedComponent) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <CourseLearningNavbar
          setIsSidebarOpen={setIsSidebarOpen}
          courseId={courseId}
          onCourseIdChange={handleCourseIdChange}
        />

        {/* Syllabus Sidebar - Now as an overlay */}
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="absolute bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Syllabus Sidebar */}
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-300 ease-in-out overflow-hidden shadow-2xl z-[1000] `}
              style={{
                width: '400px',
                minWidth: '400px'
              }}
            >
              <CourseSyllabusSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                onLessonSelect={handleLessonSelect}
                onComponentSelect={handleComponentSelect}
                courseId={courseId}
                isLearningSidebarFullScreen={isLearningSidebarFullScreen ?? undefined}
              />
            </div>
          </>
        )}

        {/* Full screen interactive component */}
        <div className="flex-1 w-full h-full overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">

      <CourseLearningNavbar
        setIsSidebarOpen={setIsSidebarOpen}
        courseId={courseId}
        onCourseIdChange={handleCourseIdChange}
      />

      <div
        ref={containerRef}
        className="flex flex-row h-full w-full overflow-hidden relative"
      >
        {/* Syllabus Sidebar - Now as an overlay */}
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="absolute bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Syllabus Sidebar */}
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-300 ease-in-out overflow-hidden shadow-2xl z-[1000] `}
              style={{
                width: '400px',
                minWidth: '400px'
              }}
            >
              <CourseSyllabusSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                onLessonSelect={handleLessonSelect}
                onComponentSelect={handleComponentSelect}
                courseId={courseId}
                isLearningSidebarFullScreen={isLearningSidebarFullScreen ?? undefined}
              />
            </div>
          </>
        )}

        {/* Main content area - Always takes full width when syllabus is closed */}
        <div className={`flex flex-1 flex-row min-w-0 overflow-hidden ${isLearningSidebarFullScreen && 'z-[50]'}`}
        >
          {/* Lesson Learning Sidebar */}
          <div
            className={`flex-shrink-0 overflow-hidden ${isLearningSidebarFullScreen && 'z-[50]'}`}
            style={{
              width: `${lessonSidebarWidthPercent}%`,
              minWidth: '200px'

            }}
          >
            <CourseLessonLearningSidebar
              selectedLessonId={selectedLessonId}
              currentLesson={currentLesson}
              loading={loading}
              courseId={courseId}
              hasVideo={hasVideo}
              hasCode={hasEditor}
              isLearningSidebarFullScreen={isLearningSidebarFullScreen ?? undefined}
              setIsLearningSidebarFullScreen={setIsLearningSidebarFullScreen}
            />
          </div>

          {/* Resize handle for lesson sidebar */}
          {(hasVideo || hasEditor) && (
            <div
              className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 relative z-10 flex-shrink-0"
              onMouseDown={() => handleMouseDown('lesson')}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-8 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Video Player */}
          {hasVideo && (
            <div
              className={`flex-shrink-0 overflow-hidden ${isLearningSidebarFullScreen && 'z-[-10]'} min-h-[500px]`}
              style={{
                width: hasEditor ? `${videoWidthPercent}%` : `${100 - lessonSidebarWidthPercent}%`,
                minWidth: '250px',
                height: '100%'
              }}
            >
              {renderMainContent()}
            </div>
          )}

          {/* Code Editor - Only show when code is available */}
          {hasEditor && (
            <>
              {/* Resize handle for code editor */}
              <div
                className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 relative z-10 flex-shrink-0 `}
                onMouseDown={() => handleMouseDown('editor')}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-8 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              <div
                className={`flex-shrink-0 overflow-hidden ${isLearningSidebarFullScreen && 'z-[-10]'} `}
                style={{
                  width: `${editorWidthPercent}%`,
                  minWidth: '250px'
                }}
              >
                <CourseEditor
                  initialCode={currentLesson.code || currentLesson.course_code || ''}
                  language={currentLesson.code_language || currentLesson.course_code_language || 'javascript'}
                  fileName={`${currentLesson.title?.replace(/\s+/g, '') || 'Lesson'}.js`}
                  onCodeChange={() => {
                    // Code change handling
                  }}
                  onRun={() => {
                    // Code execution handling
                  }}
                  onTalkToMentor={() => {
                    // Talk to mentor handling
                  }}
                  isLearningSidebarFullScreen={isLearningSidebarFullScreen ?? undefined}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}