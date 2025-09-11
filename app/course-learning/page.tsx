
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
  mindmap_json: {};
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

interface APIQuestion {
  quiz_id: number;
  type: string;
  question_text: string;
  points: number;
  answers: {
    answer?: boolean | number | number[] | string[];
    options?: string[];
    modelAnswer?: string;
    items?: string[];
    correctOrder?: number[];
    stems?: string[];
    matches?: string[];
    acceptedAnswers?: string[];
  };
  question_order: number;
  active: boolean;
  id: number;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number | null;
}

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
        const flashcardsResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/courses/${courseId}/flashcards/`);

        if (!flashcardsResponse.ok) {
          throw new Error(`Failed to fetch flashcards: ${flashcardsResponse.status} ${flashcardsResponse.statusText}`);
        }

        const flashcards = await flashcardsResponse.json();
        console.log('Available flashcards:', flashcards);
        console.log('Looking for flashcards with topic_id:', topicId);

        // Filter flashcards that match the topic ID
        const topicFlashcards = flashcards.filter((flashcard: APIFlashcard) => {
          console.log(`Checking flashcard ${flashcard.id}: topic_id=${flashcard.topic_id}, front="${flashcard.front}"`);
          return flashcard.topic_id === topicId;
        });

        if (topicFlashcards.length > 0) {
          console.log(`Found ${topicFlashcards.length} flashcards for topic ${topicId}`);

          // Sort flashcards by card_order
          const sortedFlashcards = topicFlashcards.sort((a: APIFlashcard, b: APIFlashcard) => a.card_order - b.card_order);

          console.log('Sorted flashcards:', sortedFlashcards);

          // Log the transformed data structure
          const transformedCards = sortedFlashcards.map((card: APIFlashcard) => ({
            question: card.front,
            answer: card.back
          }));
          console.log('Transformed cards for FlashCards component:', transformedCards);

          setFlashcardData(sortedFlashcards);
        } else {
          // Fallback to dummy data if no matching flashcards found
          console.log('No topic-specific flashcards found, using fallback data');
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Debug: Reload
          </button>
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
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show flashcards when data is loaded
  if (flashcardData.length > 0) {
    console.log('FlashCardsWithAPI: Rendering FlashCards component with data:', flashcardData);
    return (
      <div className="w-full h-full flex flex-col">
        {/* Debug info */}
        {/* FlashCards component */}
        <div className="flex-1">
          <FlashCards
            topic={topic}
            initialCards={flashcardData.map(card => ({
              question: card.front,
              answer: card.back
            }))}
          />
        </div>
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

  console.log('MindMapWithAPI rendered with props:', { topic, topicId, courseId });

  // Fetch mindmap data from API
  useEffect(() => {
    const fetchMindmapData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all mindmaps for the course
        console.log('Fetching mindmaps from API...');
        
        const mindmapsResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/courses/${courseId}/mindmaps/`);

        if (!mindmapsResponse.ok) {
          throw new Error(`Failed to fetch mindmaps: ${mindmapsResponse.status} ${mindmapsResponse.statusText}`);
        }

        const mindmaps = await mindmapsResponse.json();
        console.log('Available mindmaps:', mindmaps);
        console.log('Looking for mindmap with topic_id:', topicId);

        // Test API response structure
        if (mindmaps && Array.isArray(mindmaps)) {
          console.log('API returned array with length:', mindmaps.length);
          mindmaps.forEach((mindmap: APIMindmap, index: number) => {
            console.log(`Mindmap ${index}:`, {
              id: mindmap.id,
              topic_id: mindmap.topic_id,
              has_mermaid: !!mindmap.mindmap_mermaid,
              mermaid_length: mindmap.mindmap_mermaid?.length || 0,
              is_completed: mindmap.is_completed,
              active: mindmap.active
            });
          });
        } else {
          console.error('API response is not an array:', mindmaps);
        }

        // Find mindmap that matches the topic ID
        const selectedMindmap = mindmaps.find((mindmap: APIMindmap) => {
          console.log(`Checking mindmap ${mindmap.id}: topic_id=${mindmap.topic_id}, has_mermaid=${!!mindmap.mindmap_mermaid}`);
          return mindmap.topic_id === topicId;
        });

        if (selectedMindmap) {
          console.log(`Found matching mindmap with Mermaid data (ID: ${selectedMindmap.id})`);
          console.log('Mermaid data:', selectedMindmap.mindmap_mermaid);

          // Parse Mermaid data to extract nodes and links
          const parseMermaidToMindMapData = (mermaidText: string): MindMapData => {
            const lines = mermaidText.split('\n').map(line => line.trim()).filter(line => line);
            const nodes: MindMapData['nodes'] = [];
            const links: MindMapData['links'] = [];
            const nodeMap = new Map<string, { id: string; name: string; level: number }>();

            let nodeIdCounter = 1;
            let currentLevel = 0;
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
            
            console.log('Parsed mindmap data from Mermaid:', transformedData);

            // Validate the transformed data
            if (transformedData.nodes.length === 0) {
              console.error('Parsed data has no nodes!');
              throw new Error('No nodes found in mindmap data');
            }

            if (transformedData.links.length === 0) {
              console.warn('Parsed data has no links - this might cause display issues');
            }

            setMindmapData(transformedData);
          } catch (parseError) {
            console.error('Error parsing Mermaid data:', parseError);
            throw new Error('Failed to parse mindmap data');
          }
        } else {
          // Fallback to dummy data if no matching mindmap found
          console.log('No topic-specific mindmap found, using fallback data');
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
          console.log('Setting fallback mindmap data:', fallbackData);
          setMindmapData(fallbackData);
        }
      } catch (err) {
        console.error('Error fetching mindmap data:', err);
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
    console.log('MindMapWithAPI: Showing loading state');
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mindmap...</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Debug: Reload
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log('MindMapWithAPI: Showing error state:', error);
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Mindmap</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show mindmap when data is loaded
  if (mindmapData) {
    console.log('MindMapWithAPI: Rendering MindMap component with data:', mindmapData);
    return (
      <div className="w-full h-full flex flex-col">
        {/* Debug info */}
        <div className="bg-yellow-100 p-2 text-xs border-b">
          <strong>Debug Info:</strong> Topic: {topic} | Topic ID: {topicId} |
          Nodes: {mindmapData.nodes.length} | Links: {mindmapData.links.length} |
          <span className="text-green-600">API data loaded</span> |
          <span className="text-blue-600">Rendering MindMap</span>
        </div>

        {/* MindMap component */}
        <div className="flex-1 w-full h-full min-h-[500px]">
          <MindMap initialData={mindmapData} />
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  console.log('MindMapWithAPI: Showing fallback state - no data available');
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Mindmap Available</h3>
        <p className="text-gray-500">Please try again later.</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>Debug info: loading={loading.toString()}, error={error}, mindmapData={mindmapData ? 'present' : 'null'}</p>
        </div>
      </div>
    </div>
  );
};

// Simple Quiz Wrapper Component
const SimpleQuiz = ({ topic, topicId, courseId }: { topic: string; topicId: number; courseId: string }) => {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<EliminatedOptions>({});
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz data from API
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get all quizzes for the course
        console.log(`Fetching quizzes for course ${courseId}...`);
        const quizzesResponse = await fetch(`https://ip-hm-course-view-api-dsgfu8tx7-projectcou.vercel.app/api/v1/course-learning/courses/${courseId}/quizzes/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });

        if (!quizzesResponse.ok) {
          console.error('Failed to fetch quizzes:', quizzesResponse.status, quizzesResponse.statusText);
          throw new Error(`Failed to fetch quizzes: ${quizzesResponse.status} ${quizzesResponse.statusText}`);
        }

        const quizzes = await quizzesResponse.json();
        console.log('Available quizzes:', quizzes);
        console.log('Looking for quiz with topic_id:', topicId);

        // Find a quiz that matches the topic
        let selectedQuiz = null;

        // Try to find a quiz that matches the topic ID
        selectedQuiz = quizzes.find((quiz: APIQuiz) => {
          console.log(`Checking quiz ${quiz.id}: topic_id=${quiz.topic_id}, title="${quiz.title}"`);
          // Check if quiz has a topic_id that matches
          if (quiz.topic_id === topicId) {
            console.log(`Found matching quiz: ${quiz.title} (ID: ${quiz.id})`);
            return true;
          }
          return false;
        });

        // If no matching quiz found, use the first available quiz
        if (!selectedQuiz && quizzes.length > 0) {
          selectedQuiz = quizzes[0];
          console.log('No topic-specific quiz found, using first available quiz:', selectedQuiz);
        }

        if (selectedQuiz) {
          // Now fetch questions for this quiz
          console.log(`Fetching questions for quiz ${selectedQuiz.id}...`);
          const questionsResponse = await fetch(`https://ip-hm-course-view-api-dsgfu8tx7-projectcou.vercel.app/api/v1/course-learning/quizzes/${selectedQuiz.id}/questions/`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors',
          });

          if (!questionsResponse.ok) {
            console.error('Failed to fetch questions:', questionsResponse.status, questionsResponse.statusText);
            throw new Error(`Failed to fetch questions: ${questionsResponse.status} ${questionsResponse.statusText}`);
          }

          const questions = await questionsResponse.json();
          console.log('Quiz questions:', questions);

          // Validate that we have questions
          if (!questions || questions.length === 0) {
            throw new Error('No questions found for this quiz');
          }

          // Transform API data to match QuizPlayer expectations
          const transformedQuizData = {
            title: selectedQuiz.title || `${topic} Quiz`,
            description: selectedQuiz.description || `Test your knowledge on ${topic}`,
            questions: questions.map((q: any, index: number) => {
              console.log(`Processing question ${index + 1}:`, q);
              
              // Map API question structure to QuizPlayer format based on actual API response
              let transformedQuestion: any = {
                id: q.id || `q${index + 1}`,
                question: q.question_text || 'Question text not available',
                points: q.points || 1,
              };

              // Handle different question types based on API response
              switch (q.type) {
                case 'TRUE_FALSE':
                  transformedQuestion.type = QuestionType.TrueFalse;
                  transformedQuestion.correctAnswer = q.answers?.answer || false;
                  break;

                case 'SINGLE':
                  transformedQuestion.type = QuestionType.SingleChoice;
                  // Handle both standard options and acceptedAnswers format
                  if (q.answers?.acceptedAnswers) {
                    // For questions with acceptedAnswers (like fill-in-the-blank style)
                    transformedQuestion.options = q.answers.acceptedAnswers;
                    transformedQuestion.correctAnswers = [0]; // First answer is correct
                  } else {
                    transformedQuestion.options = q.answers?.options || ['Option A', 'Option B', 'Option C', 'Option D'];
                    transformedQuestion.correctAnswers = [q.answers?.answer || 0];
                  }
                  break;

                case 'MULTIPLE':
                  transformedQuestion.type = QuestionType.MultipleChoice;
                  transformedQuestion.options = q.answers?.options || ['Option A', 'Option B', 'Option C', 'Option D'];
                  transformedQuestion.correctAnswers = q.answers?.answer || [0];
                  break;

                case 'OPEN_ENDED':
                  transformedQuestion.type = QuestionType.OpenEnded;
                  transformedQuestion.modelAnswer = q.answers?.modelAnswer || '';
                  break;

                case 'SORT_ANSWER':
                  transformedQuestion.type = QuestionType.SortAnswer;
                  transformedQuestion.items = q.answers?.items || [];
                  transformedQuestion.correctOrder = q.answers?.correctOrder || [];
                  break;

                case 'MATCHING':
                  transformedQuestion.type = QuestionType.Matching;
                  // Transform matching data structure
                  const matchingItems = [];
                  if (q.answers?.stems && q.answers?.matches) {
                    for (let i = 0; i < q.answers.stems.length; i++) {
                      const stem = q.answers.stems[i];
                      const matchIndex = parseInt(q.answers.matches[i]);
                      const match = q.answers?.options?.[matchIndex] || `Match ${i + 1}`;
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

              console.log(`Transformed question ${index + 1}:`, transformedQuestion);
              return transformedQuestion;
            }),
            timeLimit: selectedQuiz.time_limit_minutes || 10,
            maxQuestions: selectedQuiz.max_questions || questions.length,
            passingGrade: selectedQuiz.passing_grade_percent || 70
          };

          console.log('Final transformed quiz data:', transformedQuizData);

          setQuizData(transformedQuizData);
        } else {
          throw new Error('No quizzes available for this course');
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [topic, topicId, courseId]);

  const handleExitQuiz = () => {
    // Reset quiz state
    setUserAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setRemainingTime(null);
    setEliminatedOptions({});
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
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
          <div className="text-sm text-gray-500 mb-4">
            <p>This appears to be a backend issue. Please check:</p>
            <ul className="list-disc list-inside text-left mt-2">
              <li>API authentication configuration on Vercel</li>
              <li>CORS settings for the API endpoints</li>
              <li>API server status and deployment</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show quiz when data is loaded
  if (quizData) {
    return (
      <div className="w-full h-full bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{quizData.title}</h1>
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
        const memoryGamesResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/courses/${courseId}/memory-games/`);

        if (!memoryGamesResponse.ok) {
          throw new Error('Failed to fetch memory games');
        }

        const memoryGames = await memoryGamesResponse.json();
        console.log('Available memory games:', memoryGames);
        console.log('Looking for memory game with topic_id:', topicId);

        // Find a memory game that matches the topic
        let selectedMemoryGame = null;

        // Try to find a memory game that matches the topic ID
        selectedMemoryGame = memoryGames.find((game: APIMemoryGame) => {
          console.log(`Checking memory game ${game.id}: topic_id=${game.topic_id}, description="${game.description}"`);
          return game.topic_id === topicId;
        });

        // If no matching memory game found, use the first available one
        if (!selectedMemoryGame && memoryGames.length > 0) {
          selectedMemoryGame = memoryGames[0];
          console.log('No topic-specific memory game found, using first available game:', selectedMemoryGame);
        }

        if (selectedMemoryGame) {
          // Now fetch the memory game pairs
          const pairsResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/memory-game-pairs/game/${selectedMemoryGame.id}`);

          if (!pairsResponse.ok) {
            throw new Error('Failed to fetch memory game pairs');
          }

          const pairs = await pairsResponse.json();
          console.log('Memory game pairs:', pairs);

          // Transform API data to match MemoryGame component expectations
          const transformedData = {
            topic: selectedMemoryGame.description || topic,
            cards: pairs.map((pair: APIMemoryGamePair) => ({
              term: pair.term,
              definition: pair.term_description,
              pair_order: pair.pair_order
            }))
          };

          console.log('Transformed memory game data:', transformedData);
          setMemoryGameData(transformedData);
        } else {
          throw new Error('No memory games available');
        }
      } catch (err) {
        console.error('Error fetching memory game data:', err);
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
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show memory game when data is loaded
  if (memoryGameData) {
    console.log('MemoryGameWithAPI: Rendering MemoryGame component with data:', memoryGameData);
    return (
      <div className="w-full h-full flex flex-col">
        {/* Debug info */}
        <div className="bg-gray-100 p-2 text-xs border-b">
          <strong>Debug Info:</strong> Topic: {topic} | Topic ID: {topicId} |
          Cards: {memoryGameData.cards.length} |
          <span className="text-green-600">API data loaded</span> |
          <span className="text-blue-600">Real memory game enabled</span>
        </div>
        {/* MemoryGame component */}
        <div className="flex-1">
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
  
  // Debug sidebar state changes
  useEffect(() => {
    console.log('Sidebar state changed:', isSidebarOpen);
  }, [isSidebarOpen]);
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
        console.log('No lesson selected');
        setCurrentLesson(null);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching lesson data for ID:', selectedLessonId);

        const lessonResponse = await fetch(`https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/courses/${courseId}/lessons/`);
        console.log('Lesson API response status:', lessonResponse.status);

        if (lessonResponse.ok) {
          const lessons = await lessonResponse.json();
          console.log('All lessons data received:', lessons);

          // Find the specific lesson by ID
          const lesson = lessons.find((l: APILesson) => l.id === selectedLessonId);

          if (lesson) {
            console.log('Found lesson:', lesson);
            console.log('Lesson code:', lesson.code);
            console.log('Lesson code language:', lesson.code_language);
            setCurrentLesson(lesson);
          } else {
            console.error('Lesson not found with ID:', selectedLessonId);
            setCurrentLesson(null);
          }
        } else {
          console.error('Failed to fetch lesson data');
          setCurrentLesson(null);
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setCurrentLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [selectedLessonId, courseId]);

  // Handle component selection
  const handleComponentSelect = (component: InteractiveComponent) => {
    console.log('Component selected:', component);
    console.log('Setting activeView to component and selectedComponent to:', component);
    setSelectedComponent(component);
    setActiveView('component');
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
    onProgressUpdate: (progress: number, completed: boolean) => {
      console.log(`Video progress: ${progress}%, completed: ${completed}`);
    }
  }), [currentLesson]);

  // Debug video props
  useEffect(() => {
    console.log('Video props updated:', videoProps);
  }, [videoProps]);

  // Debug lesson code data
  useEffect(() => {
    if (currentLesson) {
      const codeData = {
        code: currentLesson.code || currentLesson.course_code,
        language: currentLesson.code_language || currentLesson.course_code_language,
        fileName: `${currentLesson.title?.replace(/\s+/g, '') || 'Lesson'}.js`
      };
      console.log('Lesson code data for editor:', codeData);
      console.log('Code length:', codeData.code?.length || 0);
      console.log('Code preview:', codeData.code?.substring(0, 200) + '...');
    }
  }, [currentLesson]);


  // Test video API function
  const testVideoAPI = async () => {
    try {
      console.log('Testing video API...');
      const response = await fetch('https://ip-hm-course-view-api-mvp.vercel.app/api/v1/course-learning/hls/lesson1/master.m3u8', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      console.log('Test API response status:', response.status);
      const data = await response.json();
      console.log('Test API response:', data);
    } catch (error) {
      console.error('Test API error:', error);
    }
  };



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
  }, [isDragging, dragType, lessonSidebarWidthPercent, videoWidthPercent, editorWidthPercent, hasVideo, hasEditor]);

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
    console.log('renderMainContent called - activeView:', activeView, 'selectedComponent:', selectedComponent);
    console.log('hasVideo:', hasVideo, 'hasEditor:', hasEditor);
    
    if (activeView === 'component' && selectedComponent) {
      console.log('Rendering component:', selectedComponent.type);
      switch (selectedComponent.type) {
        case 'mindmap':
          console.log('Rendering MindMapWithAPI with props:', {
            topic: selectedComponent.title,
            topicId: selectedComponent.topic_id,
            courseId: courseId
          });
          return (
            <div className="w-full h-full bg-red-100 border-2 border-red-500 min-h-[500px]">
              <div className="p-4 h-full flex flex-col">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-red-800">MindMap Test Component</h2>
                  <p>Topic: {selectedComponent.title}</p>
                  <p>Topic ID: {selectedComponent.topic_id}</p>
                  <p>Course ID: {courseId}</p>
                </div>
                <div className="flex-1 min-h-[400px]">
                  <MindMapWithAPI topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />
                </div>
              </div>
            </div>
          );
        case 'flashcards':
          return <FlashCardsWithAPI topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
        case 'memorygame':
          return <MemoryGameWithAPI topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
        case 'quiz':
          return <SimpleQuiz topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
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

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">

      <CourseLearningNavbar
        setIsSidebarOpen={setIsSidebarOpen}
        onTestAPI={testVideoAPI}
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
          {(hasVideo || hasEditor || (activeView === 'component' && selectedComponent)) && (
            <div
              className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 relative z-10 flex-shrink-0"
              onMouseDown={() => handleMouseDown('lesson')}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-8 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Video Player / Interactive Components */}
          {(hasVideo || (activeView === 'component' && selectedComponent)) && (
            <div
              className={`flex-shrink-0 overflow-hidden ${isLearningSidebarFullScreen && 'z-[-10]'} min-h-[500px]`}
              style={{
                width: hasEditor ? `${videoWidthPercent}%` : `${100 - lessonSidebarWidthPercent}%`,
                minWidth: '250px',
                height: '100%'
              }}
            >
              {(() => {
                console.log('Rendering main content container');
                return renderMainContent();
              })()}
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
                  onCodeChange={(code: string) => {
                    console.log('Code changed:', code);
                  }}
                  onRun={(code: string) => {
                    console.log('Running code:', code);
                  }}
                  onTalkToMentor={() => {
                    console.log('Talk to mentor clicked');
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