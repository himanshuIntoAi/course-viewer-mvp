
"use client"
import { Suspense } from "react"
import CourseLearningNavbar from "./final-components/CourselearningNavbar"
import CourseSyllabusSidebar from "./final-components/CourseSyllabusSidebar"
import CourseLessonLearningSidebar from "./final-components/CourselessonLearningSidebar"
import CourseEditor from "./final-components/CourseCodeEditor"
import CourseVideoPlayer from "./final-components/CourseVideoPlayer"

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
// Import interactive components
import FlashCards from "./final-components/FlashCards/FlashCards"
import SimpleMindMap from "./final-components/InteractiveMindMap/SimpleMindMap"
import MemoryGame from "./final-components/MemoryGame/MemoryGame"
import QuizPlayer, { QuestionType, type Question, QuizData, UserAnswers } from "./final-components/QuizBuilder/QuizPlayer"
import Image from "next/image"
import TopicDetail, { TopicSummary } from "./final-components/TopicDetail"
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
        const flashcardsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/flashcards/`);

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
          setFlashcardData([]);
        }
      } catch (err) {
        console.error('Error fetching flashcard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch flashcard data');
        setFlashcardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardData();
  }, [topic, topicId, courseId]);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full h-full  bg-white flex items-center justify-center">
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
      <div className="w-full h-full ">
        <FlashCards
          topic={topic}
          courseId={courseId}
          topicId={topicId}
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
        <FlashCards
          topic={topic}
          courseId={courseId}
          topicId={topicId}
        />
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
        const mindmapsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/mindmaps/`);

        if (!mindmapsResponse.ok) {
          throw new Error(`Failed to fetch mindmaps: ${mindmapsResponse.status} ${mindmapsResponse.statusText}`);
        }

        const mindmaps = await mindmapsResponse.json();

        console.log('[MindMap] All mindmaps for course:', mindmaps);
        console.log('[MindMap] Looking for topic ID:', topicId);

        // Find mindmap that matches the topic ID (don't fallback to first available)
        const selectedMindmap = mindmaps.find((mindmap: APIMindmap) => mindmap.topic_id === topicId);
        
        if (!selectedMindmap) {
          console.log('[MindMap] No mindmap found for topic ID:', topicId);
          setMindmapData(null);
          setLoading(false);
          return; // Exit early if no matching mindmap
        }

        console.log('[MindMap] Found matching mindmap:', selectedMindmap);

        if (selectedMindmap) {

          // Parse Mermaid data to extract nodes and links
          const parseMermaidToMindMapData = (mermaidText: string): MindMapData => {
            console.log('[MindMap Parser] Starting to parse mermaid text:', mermaidText);
            
            const rawLines = mermaidText.split('\n');
            const nodes: MindMapData['nodes'] = [];
            const links: MindMapData['links'] = [];
            let nodeIdCounter = 1;
            const levelStack: string[] = [];
            
            // Track actual indentation levels to handle dynamic spacing
            const indentLevels: number[] = [];
            let firstNodeIndent: number | null = null; // Track the root node's indentation
            
            const normalizeIndent = (s: string) => s.replace(/\t/g, '    ');
            
            // Helper to determine indent level based on actual spacing
            const getIndentLevel = (indentLength: number, isFirstNode: boolean): number => {
              // First node is always the root (level 0)
              if (isFirstNode) {
                firstNodeIndent = indentLength;
                return 0;
              }
              
              // Calculate relative indentation from the root
              const relativeIndent = indentLength - (firstNodeIndent || 0);
              
              if (relativeIndent <= 0) return 0; // Same or less indent than root = root level
              
              // Find the closest matching indent level or create a new one
              const existingIndex = indentLevels.indexOf(relativeIndent);
              if (existingIndex !== -1) {
                return existingIndex + 1; // +1 because root is level 0
              }
              
              // Find where this indent fits in the hierarchy
              let level = 0;
              for (let i = 0; i < indentLevels.length; i++) {
                if (relativeIndent > indentLevels[i]) {
                  level = i + 1;
                } else {
                  break;
                }
              }
              
              // Add new indent level if it's deeper than existing
              if (relativeIndent > (indentLevels[indentLevels.length - 1] || 0)) {
                indentLevels.push(relativeIndent);
                level = indentLevels.length;
              }
              
              return level;
            };

            let nodeCount = 0;

            for (let idx = 0; idx < rawLines.length; idx++) {
              const line = rawLines[idx];
              if (!line) continue;
              
              // Skip mermaid header
              const trimmedLine = line.trim().toLowerCase();
              if (trimmedLine === 'mindmap' || trimmedLine === '') continue;

              const normalized = normalizeIndent(line);
              const indentMatch = normalized.match(/^(\s*)/);
              const indentLength = indentMatch ? indentMatch[1].length : 0;
              const isFirstNode = nodeCount === 0;
              const indentLevel = getIndentLevel(indentLength, isFirstNode);

              // Extract node name from trimmed content
              let content = normalized.trim();
              
              // Handle root((Title)) or root(Title) - improved regex
              const rootMatch = content.match(/^root\s*\(+\s*([^)]+?)\s*\)+/i);
              if (rootMatch && rootMatch[1]) {
                content = rootMatch[1].trim();
              }
              
              const nodeName = content;
              if (!nodeName || nodeName.toLowerCase() === 'mindmap') continue;

              console.log(`[MindMap Parser] Line ${idx}: "${line}" -> Indent: ${indentLength}, Level: ${indentLevel}, Name: "${nodeName}"`);

              // Assign ids: ensure first node becomes id "1"
              const nodeId = String(nodeIdCounter++);
              nodes.push({ 
                id: nodeId, 
                name: nodeName, 
                group: Math.max(1, indentLevel + 1), 
                level: indentLevel 
              });

              // Parent link for children
              if (indentLevel > 0) {
                let parentId: string | null = null;
                // Find the most recent parent at the previous level
                for (let i = indentLevel - 1; i >= 0; i--) {
                  if (levelStack[i]) { 
                    parentId = levelStack[i]; 
                    break; 
                  }
                }
                if (parentId) {
                  links.push({ source: parentId, target: nodeId });
                  console.log(`[MindMap Parser] Added link: ${parentId} -> ${nodeId}`);
                } else {
                  console.warn(`[MindMap Parser] No parent found for node ${nodeId} at level ${indentLevel}`);
                }
              }

              // Update stack at this level
              while (levelStack.length <= indentLevel) levelStack.push('');
              levelStack[indentLevel] = nodeId;
              // Clear deeper levels
              for (let i = indentLevel + 1; i < levelStack.length; i++) levelStack[i] = '';
              
              nodeCount++;
            }

            console.log('[MindMap Parser] Final nodes:', nodes);
            console.log('[MindMap Parser] Final links:', links);

            // Ensure the very first node has id "1" and is at level 0
            if (nodes.length > 0) {
              if (nodes[0].id !== '1') {
                const oldId = nodes[0].id;
                nodes[0].id = '1';
                // Update links that reference old id
                links.forEach(l => { 
                  if (l.source === oldId) l.source = '1'; 
                  if (l.target === oldId) l.target = '1'; 
                });
              }
              // Ensure root is at level 0
              if (nodes[0].level !== 0) {
                console.warn(`[MindMap Parser] Root node was not at level 0 (was ${nodes[0].level}), fixing...`);
                nodes[0].level = 0;
                nodes[0].group = 1;
              }
            }

            return { nodes, links };
          };

          try {
            console.log('[MindMap] Parsing mindmap for topic:', topic, 'topicId:', topicId);
            console.log('[MindMap] Raw mermaid data:', selectedMindmap.mindmap_mermaid);
            
            const transformedData = parseMermaidToMindMapData(selectedMindmap.mindmap_mermaid);

            // Validate the transformed data
            if (transformedData.nodes.length === 0) {
              console.error('[MindMap] No nodes found in parsed data');
              throw new Error('No nodes found in mindmap data');
            }

            console.log('[MindMap] Successfully parsed mindmap:', transformedData);
            setMindmapData(transformedData);
          } catch (parseError) {
            console.error('[MindMap] Failed to parse mindmap:', parseError);
            console.error('[MindMap] Raw mermaid text:', selectedMindmap.mindmap_mermaid);
            throw new Error('Failed to parse mindmap data: ' + (parseError instanceof Error ? parseError.message : 'Unknown error'));
          }
        } else {
          // No mindmaps available for course
          setMindmapData(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mindmap data');
        setMindmapData(null);
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
      <div className="w-full h-full bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Mindmap</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show mindmap when data is loaded
  if (mindmapData) {
    console.log('[MindMap] Rendering SimpleMindMap with data:', mindmapData);
    return (
      <div className="w-full h-full">
        <SimpleMindMap data={mindmapData} />
      </div>
    );
  }

  // No mindmap available for this topic
  return (
    <div className="w-full h-full bg-white flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="text-gray-400 text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Mindmap Available</h3>
        <p className="text-gray-500 mb-2">There is no mindmap available for this topic yet.</p>
        <p className="text-sm text-gray-400">Topic: {topic} (ID: {topicId})</p>
      </div>
    </div>
  );
};

// Simple Quiz Wrapper Component (auto-start first quiz for topic)
const QuizWithAPI = ({ topic, topicId, courseId }: { topic: string; topicId: number; courseId: string }) => {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for quiz selection
  const [availableQuizzes, setAvailableQuizzes] = useState<APIQuiz[]>([]);
  const [, setSelectedQuizId] = useState<number | null>(null);

  // Fetch available quizzes from API for the specific topic and auto-start the first
  useEffect(() => {
    const fetchAvailableQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all quizzes for the course
        const quizzesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/quizzes/`);

        if (!quizzesResponse.ok) {
          throw new Error(`Failed to fetch quizzes: ${quizzesResponse.status} ${quizzesResponse.statusText}`);
        }

        const quizzes: APIQuiz[] = await quizzesResponse.json();
        // Filter quizzes by topicId
        const topicQuizzes = quizzes.filter(q => q.topic_id === topicId);
        setAvailableQuizzes(topicQuizzes);

        if (topicQuizzes.length === 0) {
          throw new Error('No quizzes available for this topic');
        }

        // Auto-start the first quiz for this topic
        const firstQuiz = topicQuizzes[0];
        setSelectedQuizId(firstQuiz.id);
        await fetchQuizData(firstQuiz.id, firstQuiz);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, topicId]);

  // Fetch specific quiz data when a quiz is selected
  const fetchQuizData = async (quizId: number, preselected?: APIQuiz) => {
    try {
      setLoading(true);
      setError(null);

      // Find the selected quiz
      const selectedQuiz = preselected ?? availableQuizzes.find(quiz => quiz.id === quizId);
      if (!selectedQuiz) {
        throw new Error('Selected quiz not found');
      }

      // Fetch questions for this quiz
      const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/quizzes/${quizId}/questions/`);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz data');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExitQuiz = () => {
    // Reset quiz state and go back to quiz selection
    setUserAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setRemainingTime(null);
    setQuizData(null);
    setSelectedQuizId(null);
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
          <button
            onClick={() => {
              setError(null);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No quiz selection UI; auto-starts based on topic

  // Show quiz when data is loaded
  if (quizData) {
    return (
      <div className="w-full min-h-full bg-white overflow-auto">
        <QuizPlayer
          quizData={quizData}
          questions={quizData.questions as Question[]}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          quizSubmitted={quizSubmitted}
          setQuizSubmitted={setQuizSubmitted}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          remainingTime={remainingTime}
          setRemainingTime={setRemainingTime}
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
        const memoryGamesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/memory-games/`);

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
          const pairsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/memory-game-pairs/game/${selectedMemoryGame.id}`);

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

const CourseLearningPageInner = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedLessonId, setSelectedLessonId] = useState<number | undefined>(undefined);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<APILesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'lesson' | 'InteractiveComponent' | 'topic'>('lesson');
  const [selectedComponent, setSelectedComponent] = useState<InteractiveComponent | null>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [isLearningSidebarFullScreen, setIsLearningSidebarFullScreen] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  
  // State for breadcrumbs
  const [courseName, setCourseName] = useState<string>("");
  const [topics, setTopics] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicSummary | null>(null);
  const [topicCountsMap, setTopicCountsMap] = useState<Record<number, TopicSummary['counts']>>({});


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

  // Fetch course data and topics for breadcrumbs
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        const [courseResponse, topicsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/topics/`)
        ]);

        if (courseResponse.ok) {
          const course = await courseResponse.json();
          setCourseName(course.title || "Course");
        }

        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          setTopics(topicsData);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Fetch lesson data when selectedLessonId changes
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!selectedLessonId) {
        setCurrentLesson(null);
        return;
      }

      try {
        setLoading(true);

        const lessonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/lessons/`);

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

    if (
      selectedComponent &&
      selectedComponent.id === component.id &&
      selectedComponent.type === component.type
    ) {
      // setIsSidebarOpen(false); // just close sidebar
      return;
    }

    setSelectedComponent(component);
    setActiveView('InteractiveComponent');
    // setIsSidebarOpen(false);
    // Hide lesson sidebar when component is selected for full screen experience
    // setIsLearningSidebarFullScreen(true);
  };

  // Handle lesson selection
  const handleLessonSelect = useCallback((lessonId: number) => {
    if (hasVideo || hasEditor) {
      setIsLearningSidebarFullScreen(false);
    }
    setSelectedLessonId(lessonId);
    setActiveView('lesson');
    setSelectedComponent(null);
  }, [hasVideo, hasEditor]);


  // Initialize courseId from URL or localStorage
  useEffect(() => {
    const idParam = searchParams.get('courseId');
    const resolvedId = idParam || (typeof window !== 'undefined' ? localStorage.getItem('currentCourseId') || '' : '');
    if (resolvedId && resolvedId !== courseId) {
      setCourseId(resolvedId);
      setSelectedLessonId(undefined);
      setCurrentLesson(null);
      setSelectedComponent(null);
      setActiveView('lesson');
    }
  }, [searchParams, courseId]);

  // Fetch and cache all lessons for the course (for prev/next navigation)
  useEffect(() => {
    const fetchAllLessons = async () => {
      if (!courseId) {
        setAllLessons([]);
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/lessons/`);
        if (response.ok) {
          const lessons: APILesson[] = await response.json();
          setAllLessons(lessons || []);
          
          // Auto-select first lesson if none is selected
          if (lessons && lessons.length > 0 && !selectedLessonId) {
            setSelectedLessonId(lessons[0].id);
          }
        } else {
          setAllLessons([]);
        }
      } catch {
        setAllLessons([]);
      }
    };
    fetchAllLessons();
  }, [courseId, selectedLessonId]);

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
  console.log("Active view", activeView);
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
      const rightMinPercent = (hasVideo || hasEditor || (activeView === 'InteractiveComponent' && selectedComponent)) ? 30 : 0;
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

  const memoizedInteractiveComponent = useMemo(() => {
    if (!selectedComponent) return null;

    switch (selectedComponent.type) {
      case 'mindmap':
        return <MindMapWithAPI key={selectedComponent.id} topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
      case 'flashcards':
        return <FlashCardsWithAPI key={selectedComponent.id} topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
      case 'memorygame':
        return <MemoryGameWithAPI key={selectedComponent.id} topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
      case 'quiz':
        return <QuizWithAPI key={selectedComponent.id} topic={selectedComponent.title} topicId={selectedComponent.topic_id} courseId={courseId} />;
      default:
        return null;
    }
  }, [selectedComponent, courseId]);

  // Compute prev/next lesson details based on current selection
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!allLessons || allLessons.length === 0) {
      return { prevLesson: null as APILesson | null, nextLesson: null as APILesson | null };
    }
    const currentIndex = selectedLessonId ? allLessons.findIndex(l => l.id === selectedLessonId) : -1;
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    return { prevLesson: prev, nextLesson: next };
  }, [allLessons, selectedLessonId]);

  const handleGoPrev = useCallback(() => {
    if (prevLesson) {
      handleLessonSelect(prevLesson.id);
    }
  }, [prevLesson, handleLessonSelect]);

  const handleGoNext = useCallback(() => {
    if (nextLesson) {
      handleLessonSelect(nextLesson.id);
    } else if (!selectedLessonId && allLessons.length > 0) {
      // If nothing selected yet, start from the first lesson on Next
      handleLessonSelect(allLessons[0].id);
    }
  }, [nextLesson, selectedLessonId, allLessons, handleLessonSelect]);

  // Helper to show Topic Detail from a topic id
  const showTopicDetail = useCallback(async (topicId: number, title: string) => {
    if (!courseId) return;
    // Instant render using cached counts if available
    const cached = topicCountsMap[topicId];
    if (cached) {
      setSelectedTopic({ id: topicId, title, counts: cached });
      setSelectedComponent(null);
      setActiveView('topic');
    } else {
      // Show instantly with zeros while refreshing in background
      setSelectedTopic({ id: topicId, title, counts: { lessons: 0, quizzes: 0, flashcards: 0, mindmaps: 0 } });
      setSelectedComponent(null);
      setActiveView('topic');
    }

    // Refresh counts in background
    try {
      const [lessonsRes, quizzesRes, flashcardsRes, mindmapsRes, memoryGamesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/lessons/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/quizzes/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/flashcards/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/mindmaps/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course-learning/courses/${courseId}/memory-games/`)
      ]);

      const [lessons, quizzes, flashcards, mindmaps, memorygames] = await Promise.all([
        lessonsRes.ok ? lessonsRes.json() : [],
        quizzesRes.ok ? quizzesRes.json() : [],
        flashcardsRes.ok ? flashcardsRes.json() : [],
        mindmapsRes.ok ? mindmapsRes.json() : [],
        memoryGamesRes.ok ? memoryGamesRes.json() : []
      ]);

      const counts = {
        lessons: (lessons || []).filter((l: { topic_id: number }) => l.topic_id === topicId).length,
        quizzes: (quizzes || []).filter((q: { topic_id: number }) => q.topic_id === topicId).length,
        flashcards: (flashcards || []).filter((f: { topic_id: number }) => f.topic_id === topicId).length,
        mindmaps: (mindmaps || []).filter((m: { topic_id: number }) => m.topic_id === topicId).length,
        memorygames: (memorygames || []).filter((mg: { topic_id: number }) => mg.topic_id === topicId).length
      } as TopicSummary['counts'];

      setTopicCountsMap(prev => ({ ...prev, [topicId]: counts }));
      setSelectedTopic(prev => prev && prev.id === topicId ? { ...prev, counts } : prev);
    } catch {
      // ignore background errors
    }
  }, [courseId, topicCountsMap]);

  // Generate breadcrumb trail based on current state
  type BreadcrumbItem = { label: string; href: string; topicId?: number };
  const getBreadcrumbTrail = (): BreadcrumbItem[] => {
    const trail: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/all-courses' },
      { label: courseName || 'Course', href: `/course-detail?courseId=${courseId}` }
    ];

    if (activeView === 'lesson' && currentLesson) {
      // Find topic name for the current lesson
      const topic = topics.find(t => t.id === currentLesson.topic_id);
      if (topic) {
        trail.push({ label: topic.title, href: '#', topicId: topic.id });
      }
      trail.push({ label: currentLesson.title, href: '#' });
    } else if (activeView === 'InteractiveComponent' && selectedComponent) {
      // For interactive components, show topic name and component type
      const topic = topics.find(t => t.id === selectedComponent.topic_id);
      if (topic) {
        trail.push({ label: topic.title, href: '#', topicId: topic.id });
      }
      const componentLabel = selectedComponent.type === 'mindmap' ? 'Mindmap' :
                            selectedComponent.type === 'flashcards' ? 'Flashcards' :
                            selectedComponent.type === 'memorygame' ? 'Memory Game' :
                            selectedComponent.type === 'quiz' ? 'Quiz' : 'Interactive';
      trail.push({ label: componentLabel, href: '#' });
    } else if (activeView === 'topic' && selectedTopic) {
      trail.push({ label: selectedTopic.title, href: '#' });
    }

    return trail;
  };

  const renderVideoLearningCodeComponent = () => {
    return (
      <>
        <div className={`flex flex-row w-full h-full min-w-0 overflow-hidden ${isLearningSidebarFullScreen && 'z-[50]'}`}
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
              className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 relative flex-shrink-0"
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
              className={` overflow-hidden flex items-center justify-center ${isLearningSidebarFullScreen && 'z-[-10]'} `}
              style={{
                width: hasEditor ? `${videoWidthPercent}%` : `${100 - lessonSidebarWidthPercent}%`,
                minWidth: '250px',
                height: '100%'
              }}
            >
              <CourseVideoPlayer {...videoProps} />
            </div>
          )}

          {/* Code Editor - Only show when code is available */}
          {hasEditor && (
            <>
              {/* Resize handle for code editor */}
              <div
                className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 relative flex-shrink-0 `}
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

      </>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">

      <CourseLearningNavbar
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Breadcrumbs */}
      {courseId && (
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex-shrink-0">
          <nav className="text-sm text-gray-500 flex items-center">
            {getBreadcrumbTrail().map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <Image 
                    className="mx-2" 
                    src="/images/course-detail/arrow-rightLogo.svg" 
                    alt="Right Arrow" 
                    width={16} 
                    height={16} 
                  />
                )}
                {crumb.href !== '#' ? (
                  <Link 
                    href={crumb.href} 
                    className="hover:text-gray-700 cursor-pointer"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={`${index === getBreadcrumbTrail().length - 1 ? "text-gray-900 font-medium" : "hover:text-gray-700 cursor-pointer"}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (crumb.topicId) {
                        showTopicDetail(crumb.topicId, crumb.label);
                      }
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex flex-row flex-1 w-full relative overflow-hidden"
      >
        {/* Syllabus Sidebar - Now as an overlay */}
        <div
          className="absolute top-0 h-full transition-all duration-300 ease-in-out overflow-hidden shadow-2xl z-[1000]"
          style={{
            width: '700px',
            minWidth: '400px',
            maxWidth: '700px',
            left: isSidebarOpen ? '0' : '-700px'
          }}
        >
          <CourseSyllabusSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onLessonSelect={handleLessonSelect}
            onComponentSelect={handleComponentSelect}
            courseId={courseId}
            setActiveView={(view: string) => setActiveView(view === 'InteractiveComponent' ? 'InteractiveComponent' : (view === 'topic' ? 'topic' : 'lesson'))}
            isLearningSidebarFullScreen={isLearningSidebarFullScreen ?? undefined}
            onTopicSelect={(topic, counts) => {
              const summary: TopicSummary = {
                id: topic.id,
                title: topic.title,
                counts: {
                  lessons: counts.lessons,
                  quizzes: counts.quizzes,
                  flashcards: counts.flashcards,
                  mindmaps: counts.mindmaps,
                  memorygames: counts.memorygames,
                },
              };
              setTopicCountsMap(prev => ({ ...prev, [topic.id]: summary.counts }));
              setSelectedTopic(summary);
              setSelectedComponent(null);
              setSelectedLessonId(undefined);
            }}
          />
        </div>
        {/*   Render Content based on User Selection */}
        <div className="flex flex-col w-full h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            {
              activeView === 'lesson' && renderVideoLearningCodeComponent()
            }
            {
              activeView === 'InteractiveComponent' && memoizedInteractiveComponent
            }
            {
              activeView === 'topic' && selectedTopic && (
                <TopicDetail topic={selectedTopic} />
              )
            }
          </div>

          <div className="flex flex-row items-center justify-between bg-gray-300 px-6 py-3 flex-shrink-0 z-[100]" >
            <button
              onClick={handleGoPrev}
              disabled={!prevLesson}
              className={`flex items-center justify-center gap-2 bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] text-white px-4 py-2 rounded-md ${!prevLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Image src="/lessThenIcon.svg" alt="Previous" width={20} height={20} />
              <span className="text-sm font-medium">{prevLesson ? `Back: ${prevLesson.title}` : 'Back'}</span>
            </button>
            <button
              onClick={handleGoNext}
              disabled={!nextLesson && allLessons.length === 0}
              className={`flex items-center justify-center gap-2 bg-gradient-to-r from-[#5A09FF] to-[#CB4BFF] text-white px-4 py-2 rounded-md ${(!nextLesson && allLessons.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-sm font-medium">{nextLesson ? `Next: ${nextLesson.title}` : (selectedLessonId ? 'Next' : 'Start')}</span>
              <Image src="/greaterThenIcon.svg" alt="Next" width={20} height={20} />
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}

export default function CourseLearningPage() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Suspense fallback={<div className="min-h-screen" />}> 
        <CourseLearningPageInner />
      </Suspense>
    </div>
  )
} 