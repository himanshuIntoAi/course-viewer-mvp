// "use client";

// import React, { useState, useCallback, useRef } from 'react';
// import CourseLearningSidebar, { SidebarRef } from './CourseLearningSidebar';
// import CourseLearningVideoPlayer from './CourseLearningVideoPlayer';
// import { type YouTubePlaylist, type YouTubeVideo } from '../utils/youtubeApi';

// // Import the actual components
// import FlashCards from './Components/FlashCards/FlashCards';
// import MindMap from './Components/InteractiveMindMap/MindMap';
// import QuizPlayer from './Components/QuizBuilder/QuizPlayer';
// import MemoryGame from './Components/MemoryGame/MemoryGame';

// // Import quiz types
// import { QuizData, Question, QuestionType, UserAnswers, EliminatedOptions } from './Components/QuizBuilder/QuizBuilder';

// // Keep video-related types and functionality for future use when needed
// export type VideoSource = 'youtube' | 'backend';
// export type Video = YouTubeVideo | BackendVideo;
// export type Playlist = YouTubePlaylist | BackendPlaylist;

// interface BackendVideo {
//   id: string;
//   title: string;
//   thumbnailUrl: string;
//   videoUrl: string;
//   type: 'hls' | 'mp4';
// }

// interface BackendPlaylist {
//   id: string;
//   title: string;
//   videos: BackendVideo[];
// }

// interface SelectedContent {
//   type: 'lesson' | 'component';
//   id: string;
//   title: string;
//   content: string;
//   componentType?: string;
// }

// // Dummy data for different component types
// const getDummyData = (componentType: string, title: string) => {
//   switch (componentType) {
//     case 'flashcards':
//       return {
//         initialCards: [
//           { question: `What is ${title.includes('Python') ? 'Python' : 'programming'}?`, answer: 'A high-level, interpreted programming language known for its simplicity and readability.' },
//           { question: 'What are variables?', answer: 'Named storage locations that hold data values that can be modified during program execution.' },
//           { question: 'What is a function?', answer: 'A reusable block of code that performs a specific task and can accept parameters.' },
//           { question: 'What is a loop?', answer: 'A programming construct that repeats a block of code multiple times.' },
//           { question: 'What is debugging?', answer: 'The process of finding and fixing errors or bugs in computer programs.' },
//           { question: 'What is an algorithm?', answer: 'A step-by-step procedure for solving a problem or completing a task.' }
//         ],
//         topic: title
//       };
    
//     case 'mindmap':
//       return {
//         initialData: {
//           nodes: [
//             { id: "1", name: title, group: 1, level: 0 },
//             { id: "2", name: "Core Concepts", group: 2, level: 1 },
//             { id: "3", name: "Advanced Topics", group: 2, level: 1 },
//             { id: "4", name: "Practical Applications", group: 2, level: 1 },
//             { id: "5", name: "Variables", group: 3, level: 2 },
//             { id: "6", name: "Functions", group: 3, level: 2 },
//             { id: "7", name: "Data Structures", group: 3, level: 2 },
//             { id: "8", name: "Object-Oriented Programming", group: 3, level: 2 },
//             { id: "9", name: "Web Development", group: 3, level: 2 },
//             { id: "10", name: "Data Analysis", group: 3, level: 2 }
//           ],
//           links: [
//             { source: "1", target: "2" },
//             { source: "1", target: "3" },
//             { source: "1", target: "4" },
//             { source: "2", target: "5" },
//             { source: "2", target: "6" },
//             { source: "2", target: "7" },
//             { source: "3", target: "8" },
//             { source: "4", target: "9" },
//             { source: "4", target: "10" }
//           ]
//         },
//         defaultCollapsed: false
//       };
    
//     case 'quiz':
//       const generateId = () => `question_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
//       return {
//         quizData: {
//           title: `${title} - Knowledge Check`,
//           description: `Test your understanding of ${title} concepts`,
//           timeLimit: 10, // 10 minutes
//           maxQuestions: 5,
//           passingGrade: 70
//         } as QuizData,
//         questions: [
//           {
//             id: generateId(),
//             type: QuestionType.TrueFalse,
//             question: `${title.includes('Python') ? 'Python is a compiled language.' : 'Programming is only about writing code.'}`,
//             points: 10,
//             correctAnswer: false
//           },
//           {
//             id: generateId(),
//             type: QuestionType.SingleChoice,
//             question: `What is the main purpose of ${title.includes('Python') ? 'Python' : 'programming'}?`,
//             points: 15,
//             options: [
//               'To make computers faster',
//               'To solve problems and automate tasks',
//               'To replace human workers',
//               'To create websites only'
//             ],
//             correctAnswers: [1]
//           },
//           {
//             id: generateId(),
//             type: QuestionType.MultipleChoice,
//             question: `Which of the following are key concepts in ${title}? (Select all that apply)`,
//             points: 20,
//             options: [
//               'Variables',
//               'Functions', 
//               'Magic spells',
//               'Data types',
//               'Unicorns'
//             ],
//             correctAnswers: [0, 1, 3]
//           },
//           {
//             id: generateId(),
//             type: QuestionType.FillInBlanks,
//             question: `A _______ is a named storage location that can hold different _______ during program execution.`,
//             points: 15,
//             questionWithBlanks: 'A _______ is a named storage location that can hold different _______ during program execution.',
//             answers: ['variable', 'values']
//           },
//           {
//             id: generateId(),
//             type: QuestionType.OpenEnded,
//             question: `Explain in your own words what ${title.includes('Python') ? 'Python programming' : 'programming'} means to you.`,
//             points: 20,
//             modelAnswer: `${title.includes('Python') ? 'Python programming' : 'Programming'} is the process of creating instructions for computers to solve problems and automate tasks using logical thinking and structured approaches.`
//           }
//         ] as Question[]
//       };
    
//     case 'memory_game':
//       return {
//         topic: title,
//         cards: [
//           { id: 'term_1', content: 'Variable' },
//           { id: 'def_1', content: 'A storage location with a name' },
//           { id: 'term_2', content: 'Function' },
//           { id: 'def_2', content: 'A reusable block of code' },
//           { id: 'term_3', content: 'Loop' },
//           { id: 'def_3', content: 'Repeats code multiple times' },
//           { id: 'term_4', content: 'Class' },
//           { id: 'def_4', content: 'A blueprint for creating objects' },
//           { id: 'term_5', content: 'Method' },
//           { id: 'def_5', content: 'A function that belongs to a class' },
//           { id: 'term_6', content: 'Module' },
//           { id: 'def_6', content: 'A file containing Python code' }
//         ]
//       };
    
//     default:
//       return {};
//   }
// };

// const CourseLearningPage: React.FC = () => {
//   const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Quiz player states
//   const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
//   const [quizSubmitted, setQuizSubmitted] = useState(false);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [remainingTime, setRemainingTime] = useState<number | null>(null);
//   const [eliminatedOptions, setEliminatedOptions] = useState<EliminatedOptions>({});

//   const sidebarRef = useRef<SidebarRef>(null);

//   const handleContentSelect = useCallback((content: SelectedContent) => {
//     setSelectedContent(content);
//     // Reset quiz states when new content is selected
//     if (content.componentType === 'quiz') {
//       setUserAnswers({});
//       setQuizSubmitted(false);
//       setCurrentQuestionIndex(0);
//       setRemainingTime(null);
//       setEliminatedOptions({});
//     }
//   }, []);

//   const handleExitQuiz = useCallback(() => {
//     // Reset quiz states and go back to welcome screen
//     setSelectedContent(null);
//     setUserAnswers({});
//     setQuizSubmitted(false);
//     setCurrentQuestionIndex(0);
//     setRemainingTime(null);
//     setEliminatedOptions({});
//   }, []);

//   const renderContent = () => {
//     if (!selectedContent) {
//       return (
//         <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
//           <div className="text-center">
//             <div className="mb-4">
//               <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your Course</h3>
//             <p className="text-sm text-gray-500">Select a lesson or component from the sidebar to get started</p>
//           </div>
//         </div>
//       );
//     }

//     if (selectedContent.type === 'lesson') {
//       return (
//         <div className="flex-1 p-8 overflow-y-auto">
//           <div className="max-w-7xl mx-auto">
//             <div className="mb-6">
//               <div className="flex items-center mb-2">
//                 <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">Lesson</span>
//               </div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedContent.title}</h1>
//             </div>
            
//             {/* Two Column Layout */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              
//               {/* Left Side - Theory Content */}
//               <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//                 <div className="p-6">
//                   {/* Theory Content with Embedded Code Sections */}
//                   <div className="space-y-8">
                  
//                     {/* Introduction Theory Section */}
//                     <section className="prose max-w-none">
//                       <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
//                       <p className="text-gray-700 leading-relaxed mb-4">
//                         Welcome to this comprehensive lesson on <strong>{selectedContent.title}</strong>. In this section, we'll explore the fundamental concepts and practical applications that will form the foundation of your understanding.
//                       </p>
//                       <p className="text-gray-700 leading-relaxed mb-6">
//                         Programming is not just about writing code - it's about solving problems systematically and creating elegant solutions. Let's start by understanding the core principles that guide this process.
//                       </p>
//                     </section>

//                     {/* Code Section 1 */}
//                     <div className="bg-gray-50 border-l-4 border-[#02BABA] p-6 rounded-r-lg">
//                       <div className="flex items-center mb-3">
//                         <svg className="w-5 h-5 text-[#02BABA] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
//                         </svg>
//                         <span className="text-sm font-medium text-[#02BABA] uppercase tracking-wider">Code Example</span>
//                       </div>
//                       <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm">
//                         <div className="text-gray-400 mb-2"># Code section will be implemented here</div>
//                         <div className="text-[#02BABA]">codepart</div>
//                       </div>
//                     </div>

//                     {/* Theory Section 2 */}
//                     <section className="prose max-w-none">
//                       <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Concepts</h2>
//                       <p className="text-gray-700 leading-relaxed mb-4">
//                         Now that we've seen a basic example, let's dive deeper into the fundamental concepts. Understanding these building blocks is crucial for mastering the subject.
//                       </p>
//                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                         <h3 className="text-lg font-semibold text-blue-900 mb-2">🔑 Key Points to Remember:</h3>
//                         <ul className="list-disc list-inside text-blue-800 space-y-2">
//                           <li>Every concept builds upon the previous one</li>
//                           <li>Practice is essential for understanding</li>
//                           <li>Don't hesitate to experiment with the code</li>
//                           <li>Understanding the 'why' is as important as the 'how'</li>
//                         </ul>
//                       </div>
//                     </section>

//                     {/* Code Section 2 */}
//                     <div className="bg-gray-50 border-l-4 border-green-500 p-6 rounded-r-lg">
//                       <div className="flex items-center mb-3">
//                         <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                         </svg>
//                         <span className="text-sm font-medium text-green-500 uppercase tracking-wider">Try It Yourself</span>
//                       </div>
//                       <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm">
//                         <div className="text-gray-400 mb-2"># Interactive code section coming soon</div>
//                         <div className="text-green-400">codepart</div>
//                       </div>
//                     </div>

//                     {/* Theory Section 3 */}
//                     <section className="prose max-w-none">
//                       <h2 className="text-2xl font-bold text-gray-900 mb-4">Practical Applications</h2>
//                       <p className="text-gray-700 leading-relaxed mb-4">
//                         Theory without practice is incomplete. In this section, we'll explore how these concepts apply to real-world scenarios and common use cases you might encounter.
//                       </p>
//                       <p className="text-gray-700 leading-relaxed mb-6">
//                         The beauty of programming lies in its practical applications. What you learn here will directly translate to solving actual problems and building meaningful projects.
//                       </p>
//                     </section>

//                     {/* Code Section 3 */}
//                     <div className="bg-gray-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
//                       <div className="flex items-center mb-3">
//                         <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
//                         </svg>
//                         <span className="text-sm font-medium text-purple-500 uppercase tracking-wider">Real World Example</span>
//                       </div>
//                       <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm">
//                         <div className="text-gray-400 mb-2"># Real-world implementation example</div>
//                         <div className="text-purple-400">codepart</div>
//                       </div>
//                     </div>

//                     {/* Summary Section */}
//                     <section className="prose max-w-none">
//                       <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary & Next Steps</h2>
//                       <p className="text-gray-700 leading-relaxed mb-4">
//                         Congratulations! You've completed this lesson on <strong>{selectedContent.title}</strong>. You should now have a solid understanding of the key concepts and how they apply in practice.
//                       </p>
                      
//                       <div className="grid md:grid-cols-2 gap-4 mt-6">
//                         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                           <h3 className="text-lg font-semibold text-green-900 mb-2">✅ What You've Learned:</h3>
//                           <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
//                             <li>Fundamental concepts and principles</li>
//                             <li>Practical code examples and implementations</li>
//                             <li>Real-world applications and use cases</li>
//                             <li>Best practices and common patterns</li>
//                           </ul>
//                         </div>
                        
//                         <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                           <h3 className="text-lg font-semibold text-orange-900 mb-2">🚀 Next Steps:</h3>
//                           <ul className="list-disc list-inside text-orange-800 text-sm space-y-1">
//                             <li>Practice with the interactive exercises</li>
//                             <li>Try the quiz to test your knowledge</li>
//                             <li>Explore the flashcards for quick review</li>
//                             <li>Move on to the next lesson when ready</li>
//                           </ul>
//                         </div>
//                       </div>
//                     </section>

//                     {/* Action Buttons */}
//                     <div className="flex flex-wrap gap-4 pt-4">
//                       <button className="px-6 py-3 bg-[#02BABA] text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         Mark as Complete
//                       </button>
//                       <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                         Download Notes
//                       </button>
//                       <button className="px-6 py-3 border-2 border-[#02BABA] text-[#02BABA] rounded-lg font-medium hover:bg-[#02BABA] hover:text-white transition-colors flex items-center gap-2">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         Take Quiz
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Right Side - Video Section */}
//               <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//                 <div className="h-full flex flex-col">
//                   {/* Video Header */}
//                   <div className="p-6 border-b">
//                     <div className="flex items-center mb-2">
//                       <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                       </svg>
//                       <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">Video Lesson</span>
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-900">{selectedContent.title}</h2>
//                   </div>
                  
//                   {/* Video Placeholder */}
//                   <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
//                     <div className="text-center">
//                       <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       </div>
//                       <h3 className="text-lg font-medium text-gray-900 mb-2">Video will be here</h3>
//                       <p className="text-sm text-gray-500 mb-4">Interactive video content for this lesson</p>
//                       <div className="flex flex-col gap-2 text-xs text-gray-400">
//                         <span>Duration: 15 minutes</span>
//                         <span>Quality: HD</span>
//                         <span>Captions: Available</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Video Controls Placeholder */}
//                   <div className="p-4 border-t bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                           Play
//                         </button>
//                         <span className="text-sm text-gray-500">0:00 / 15:32</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
//                           </svg>
//                         </button>
//                         <button className="p-2 text-gray-500 hover:text-gray-700 rounded">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (selectedContent.type === 'component' && selectedContent.componentType) {
//       const dummyData = getDummyData(selectedContent.componentType, selectedContent.title);
      
//       return (
//         <div className="flex-1 overflow-hidden bg-gray-50">
//           <div className="h-full flex flex-col">
//             {/* Header */}
//             <div className="flex-shrink-0 p-6 pb-2">
//               <div className="flex items-center mb-2">
//                 <span className="text-2xl mr-2">
//                   {selectedContent.componentType === 'flashcards' && '⚡'}
//                   {selectedContent.componentType === 'mindmap' && '🧠'}
//                   {selectedContent.componentType === 'quiz' && '🎯'}
//                   {selectedContent.componentType === 'memory_game' && '🎮'}
//                 </span>
//                 <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">
//                   {selectedContent.componentType.replace('_', ' ')}
//                 </span>
//               </div>
//               <h1 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h1>
//             </div>
            
//             {/* Component Content */}
//             <div className="flex-1 px-6 pb-6 overflow-hidden">
//               <div className="bg-white rounded-lg shadow-sm border h-full overflow-hidden">
//                 {selectedContent.componentType === 'flashcards' && (
//                   <div className="p-6 h-full">
//                     <FlashCards 
//                       initialCards={dummyData.initialCards}
//                       topic={dummyData.topic}
//                     />
//                   </div>
//                 )}
                
//                 {selectedContent.componentType === 'mindmap' && (
//                   <div className="h-full">
//                     <MindMap 
//                       initialData={dummyData.initialData}
//                       defaultCollapsed={dummyData.defaultCollapsed}
//                     />
//                   </div>
//                 )}
                
//                 {selectedContent.componentType === 'quiz' && dummyData.quizData && dummyData.questions && (
//                   <div className="h-full overflow-auto">
//                     <QuizPlayer 
//                       quizData={dummyData.quizData}
//                       questions={dummyData.questions}
//                       onExitQuiz={handleExitQuiz}
//                       userAnswers={userAnswers}
//                       setUserAnswers={setUserAnswers}
//                       quizSubmitted={quizSubmitted}
//                       setQuizSubmitted={setQuizSubmitted}
//                       currentQuestionIndex={currentQuestionIndex}
//                       setCurrentQuestionIndex={setCurrentQuestionIndex}
//                       remainingTime={remainingTime}
//                       setRemainingTime={setRemainingTime}
//                       eliminatedOptions={eliminatedOptions}
//                       setEliminatedOptions={setEliminatedOptions}
//                     />
//                   </div>
//                 )}
                
//                 {selectedContent.componentType === 'memory_game' && (
//                   <div className="p-6 h-full">
//                     <MemoryGame 
//                       topic={dummyData.topic}
//                       cards={dummyData.cards}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return null;
//   };

//   if (loading) {
//     return <div className="flex h-screen items-center justify-center">Loading...</div>;
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <div className="hidden md:block w-96 h-full">
//         <CourseLearningSidebar 
//           ref={sidebarRef}
//           onContentSelect={handleContentSelect}
//         />
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Top Bar */}
//         <div className="h-16 flex items-center justify-between px-8 border-b bg-white flex-shrink-0">
//           <div className="flex items-center gap-4">
//             <img src="/images/cloudOu logo.png" alt="CloudOu Logo" className="h-8" />
//             <h1 className="text-xl font-semibold text-gray-900">Course Learning Platform</h1>
//           </div>
//           <div className="flex items-center gap-8">
//             <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-700">Memory Feed</span>
//             <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-700">Community</span>
//             <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-700">Courses</span>
//             <div className="flex items-center gap-1 cursor-pointer">
//               <img src="/images/user-icon.svg" alt="User Icon" className="w-6 h-6" />
//               <img src="/images/down-arrow2.svg" alt="Down Arrow" className="w-4 h-4" />
//             </div>
//           </div>
//         </div>

//         {/* Content Area */}
//         <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
//           {error ? (
//             <div className="flex-1 flex items-center justify-center text-red-500 p-8 text-center">
//               {error}
//             </div>
//           ) : (
//             renderContent()
//           )}
//         </div>
//       </div>

//       {/* Floating Chatbot Button */}
//       <button className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg shadow-lg hover:bg-primary-100">
//         <span className="text-lg">🤖</span>
//         <span className="text-sm font-medium hidden sm:block">Hey, Ask me anything!</span>
//       </button>
//     </div>
//   );
// };

// export default CourseLearningPage;