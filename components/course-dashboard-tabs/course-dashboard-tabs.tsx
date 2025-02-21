"use client";
import React, { useState } from 'react';
// import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import "./course-details-tabs.css";
interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
}

interface Quiz {
    id: number;
    title: string;
    estimatedTime: number;
    status: 'completed' | 'available' | 'locked';
    score: number | null;
    questions: Question[];
}

const CourseDashboardTabs = () => {
    const [activeTab, setActiveTab] = useState<string>('Quizzes');
    const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
    const [quizPages, setQuizPages] = useState<{ [key: number]: boolean }>({});

    const [quizzes, setQuizzes] = useState<Quiz[]>([
        {
            id: 1,
            title: 'Quiz 1',
            estimatedTime: 30,
            status: 'completed',
            score: 85,
            questions: [
                {
                    id: 1,
                    question: 'What is the capital of France?',
                    options: ['London', 'Berlin', 'Paris', 'Madrid'],
                    correctAnswer: 'Paris',
                    userAnswer: 'Paris'
                },
                {
                    id: 2,
                    question: 'Which planet is known as the Red Planet?',
                    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                    correctAnswer: 'Mars',
                    userAnswer: 'Mars'
                }
            ]
        },
        {
            id: 2,
            title: 'Quiz 2',
            estimatedTime: 30,
            status: 'available',
            score: null,
            questions: [
                {
                    id: 1,
                    question: 'What is the largest mammal?',
                    options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
                    correctAnswer: 'Blue Whale'
                },
                {
                    id: 2,
                    question: 'Which element has the chemical symbol Au?',
                    options: ['Silver', 'Copper', 'Gold', 'Aluminum'],
                    correctAnswer: 'Gold'
                }
            ]
        },
        {
            id: 3,
            title: 'Quiz 3',
            estimatedTime: 30,
            status: 'locked',
            score: null,
            questions: []
        }
    ]);

    const tabs = ['Modules', 'Quizzes', 'Assignments', 'Certificates', 'Glossary'];

    const handleTabClick = (tab: string): void => {
        setActiveTab(tab);
        // Reset expanded quiz and pages state when switching tabs
        setExpandedQuiz(null);
        setQuizPages({});
    };

    const handleQuizToggle = (quizId: number): void => {
        setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
    };

    const handleQuizPagesToggle = (quizId: number): void => {
        setQuizPages((prevPages) => ({
            ...prevPages,
            [quizId]: !prevPages[quizId]
        }));
    };

    const handleStartQuiz = (quizId: number): void => {
        const quiz = quizzes.find(q => q.id === quizId);
        if (quiz?.status === 'locked') {
            alert('Please complete the previous quiz first!');
            return;
        }
        alert('Starting Quiz ' + quizId);
    };

    // Modules, Certificates, and Glossary page contect
    const renderModuleContent = () => {
        return (
            <div className="space-y-4">

            </div>
        );
    };

    const renderCertificateContent = () => {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-lg shadow-md">Certificate 1 Content</div>
                <div className="p-4 bg-teal-50 rounded-lg shadow-md">Certificate 2 Content</div>
                <div className="p-4 bg-teal-50 rounded-lg shadow-md">Certificate 3 Content</div>
            </div>
        );
    };

    const renderGlossaryContent = () => {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-lg shadow-md">Glossary Term 1</div>
                <div className="p-4 bg-teal-50 rounded-lg shadow-md">Glossary Term 2</div>
                <div className="p-4 bg-teal-50 rounded-lg shadow-md">Glossary Term 3</div>
            </div>
        );
    };

    return (
        <div className="w-[90vw] m-auto">
            <div className="container w-[90vw]">
                {/* AI Banner */}
                <div className="bg-blue-100 p-4 rounded-lg flex justify-between items-center mb-4 w-[90vw]">
                    <span className="text-blue-950">
                        Ask Our AI for any doubts, clarifications and help in learning any topics
                    </span>
                    <button className="bg-white text-blue-950 px-4 py-2 rounded-lg flex items-center space-x-4">
                        <span>Try CloudOU AI Now</span>
                        {/* <ChevronRight className="w-6 h-6 " /> */}
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-between mb-4 w-[90vw]">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`px-4 py-2 rounded-lg transition ${activeTab === tab
                                    ? 'bg-teal-500 text-white'
                                    : 'text-blue-950 hover:bg-teal-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <hr className="border-t-[3px] border-teal-400 mb-4 w-[90vw]" />

                {/* Conditional Content Rendering based on Active Tab */}
                {activeTab === 'Quizzes' && (
                    <div className="space-y-4 w-full">
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} className="bg-white rounded-2xl shadow-md w-[90vw]">
                                {/* Quiz Header */}
                                <div
                                    className="p-4 flex justify-between items-center cursor-pointer"
                                    onClick={() => handleQuizToggle(quiz.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <svg
                                            width="30"
                                            height="30"
                                            viewBox="0 0 44 44"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M29.334 7.33366H33.0007C33.9731 7.33366 34.9057 7.71997 35.5934 8.4076C36.281 9.09523 36.6673 10.0279 36.6673 11.0003V36.667C36.6673 37.6395 36.281 38.5721 35.5934 39.2597C34.9057 39.9474 33.9731 40.3337 33.0007 40.3337H22.9173M7.33398 24.7503V11.0003C7.33398 10.0279 7.72029 9.09523 8.40793 8.4076C9.09556 7.71997 10.0282 7.33366 11.0007 7.33366H14.6673M16.5007 3.66699H27.5007C28.5132 3.66699 29.334 4.4878 29.334 5.50033V9.16699C29.334 10.1795 28.5132 11.0003 27.5007 11.0003H16.5007C15.4881 11.0003 14.6673 10.1795 14.6673 9.16699V5.50033C14.6673 4.4878 15.4881 3.66699 16.5007 3.66699ZM24.527 28.648C24.8886 28.2864 25.1755 27.8571 25.3712 27.3846C25.5669 26.9121 25.6676 26.4057 25.6676 25.8943C25.6676 25.3829 25.5669 24.8765 25.3712 24.4041C25.1755 23.9316 24.8886 23.5023 24.527 23.1407C24.1654 22.779 23.7361 22.4922 23.2636 22.2965C22.7911 22.1008 22.2847 22.0001 21.7733 22.0001C21.2619 22.0001 20.7555 22.1008 20.283 22.2965C19.8106 22.4922 19.3813 22.779 19.0197 23.1407L9.83465 32.3293C9.39877 32.765 9.07972 33.3034 8.90698 33.895L7.37248 39.1567C7.32647 39.3144 7.32371 39.4816 7.3645 39.6408C7.40528 39.8 7.48811 39.9453 7.6043 40.0615C7.7205 40.1777 7.8658 40.2605 8.02499 40.3013C8.18417 40.3421 8.3514 40.3393 8.50915 40.2933L13.7708 38.7588C14.3624 38.5861 14.9008 38.267 15.3365 37.8312L24.527 28.648Z"
                                                stroke={quiz.status === 'completed' ? '#02BABA' : '#FF931F'}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="text-lg font-medium">{quiz.title}</div>
                                        {quiz.status === 'completed' && (
                                            <div className="text-teal-500 flex items-center">
                                                {/* <Check className="w-4 h-4 mr-1" /> */}
                                                Completed ({quiz.score}%)
                                            </div>
                                        )}

                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-gray-500">Estimated {quiz.estimatedTime} Mins</div>
                                        {expandedQuiz === quiz.id ? (
                                            <img src="/images/right-arrow.svg" alt="" className='w-4 h-4' />
                                        ): (
                                            <img src="/images/right-arrow.svg" alt="" className='w-4 h-4' />
                                            )}
                                    </div>
                                </div>

                                {/* Expandable Content */}
                                {expandedQuiz === quiz.id && (
                                    <div className="p-4 border-t">
                                        {quiz.status === 'completed' ? (
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-lg">Quiz Results</h3>
                                                {quiz.questions.map((question, index) => (
                                                    <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="font-medium">Question {index + 1}: {question.question}</p>
                                                        {question.userAnswer && (
                                                            <p className="text-green-600">Your answer: {question.userAnswer}</p>
                                                        )}
                                                        <p className="text-gray-600">Correct answer: {question.correctAnswer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : quiz.status === 'available' ? (
                                            <div className="space-y-4">
                                                <p className="text-gray-600">This quiz contains {quiz.questions.length} questions.</p>
                                                <button
                                                    onClick={() => handleStartQuiz(quiz.id)}
                                                    className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition"
                                                >
                                                    Start Quiz
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600">
                                                Complete the previous quiz to unlock this one.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Modules' && renderModuleContent()}
                {activeTab === 'Certificates' && renderCertificateContent()}
                {activeTab === 'Glossary' && renderGlossaryContent()}

                {/* Chat Feature */}
                <div className="flex justify-end items-center space-x-4 mt-4">
                    <button className="relative text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg  transition bg-teal-500 speech-bubble">
                        Hey, Ask me anything!
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-5 h-5 bg-teal-500 rotate-45 bg"></span>

                    </button>
                    <img alt="OU logo with graduation cap" className="w-20 h-20 ml-4" src="https://media-hosting.imagekit.io//10c1c6b068c549cc/Group%20389.png?Expires=1834316114&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Ij7Qc9M6Hh6QVh9pdIeuD-f0lyWom4F41c67VXHyB-99xnpy3~U1hrOH2z8logoGmaEejoi-grEkIucwU4ZbgxP~Gw~Ves1boaEe0fgHo9XVkwFQvCQqrUQlhwHPxnO0PQ7AySq0DEzMRHgen9pt2iV1OSoXBjAX8jTs5OqQy8bT4TYAewjrTBIOSonnpUWjrAAasya73ShK0-XnK8ycpxHsTqCD55fIWMzpnWL7XkC7iCJWPdEVZ5O66Uym86W4EqwQnu5siSKYcpukbBe0bcRvoBAboLxEowi4eOsI8aHw6g4uji8LdtaPAct5Zt~XqWkzgwT8njlTI~9daBRcMg" />

                </div>
            </div>
        </div>
    );
};

export default CourseDashboardTabs;