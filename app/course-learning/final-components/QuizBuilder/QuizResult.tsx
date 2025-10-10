
import React, { useMemo, useState } from "react";
import Image from "next/image";

// Define types for QuizResults
interface QuizQuestion {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  chosenIndex: number;
  explanation: string;
}

interface QuizAttempt {
  id: number;
  start: string;
  completed: string;
  score: string;
  action: string;
}

interface QuizStats {
  recentScoreLabel: string;
  recentScore: string;
  correct: number;
  incorrect: number;
  totalTime: string;
  accuracy: string;
}

interface QuizResultsData {
  title: string;
  scoreRaw: number;
  scoreMax: number;
  bannerNote: string;
  stats: QuizStats;
  attempts: QuizAttempt[];
  questions: QuizQuestion[];
}

// Add fadeIn animation
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;



const StatPill = ({ icon, label, value }: { icon: string; label: string; value: string | number }) => (
    <div className="flex items-center gap-3 bg-white">
        <Image src={icon} alt={label} width={20} height={20} />
        <div className=" flex items-center gap-2 leading-tight">
            <div className="text-xs text-slate-500">{label}</div>
            <div className="font-semibold text-slate-800">{value}</div>
        </div>
    </div>
);

// Commented out unused Badge component
// const Badge = ({ children, tone = "slate" }: { children: React.ReactNode; tone?: string }) => (
//     <span
//         className={
//             `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ` +
//             (tone === "green"
//                 ? "border-emerald-200 bg-emerald-50 text-emerald-700"
//                 : tone === "purple"
//                     ? "border-violet-200 bg-violet-50 text-violet-700"
//                     : tone === "red"
//                         ? "border-rose-200 bg-rose-50 text-rose-700"
//                         : "border-slate-200 bg-slate-50 text-slate-700")
//         }
//     >
//         {children}
//     </span>
// );

// Option line with emoji markers
const OptionLine = ({ text, state, isUserSelected }: { text: string; state: string; isUserSelected: boolean }) => {
    // state: 'correct', 'wrong-selected', 'neutral'
    const styles = {
        base:
            "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
        correct: "border-emerald-200 text-emerald-900",
        wrong: "border-rose-200 text-rose-900",
        neutral: "border-slate-200 bg-white hover:bg-slate-50",
    };

    const cls =
        styles.base +
        " " +
        (state === "correct" ? styles.correct : state === "wrong-selected" ? styles.wrong : styles.neutral);

    return (
        <div className={cls + " flex justify-between items-center gap-3"}>
            <div className="flex items-center gap-3" >
                <div className="w-4 h-4 border border-slate-200 rounded-full flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full border  ${isUserSelected ? "bg-[#5b09ff5a] border-[#5b09ff5a] " : ""}`} ></div>
                </div>
                <p className="text-slate-800">{text}</p>
            </div>
            <span className="text-lg" aria-hidden>
                {state === "correct" ? <Image src="/quizResult/correctIconGreen.svg" alt="correct" width={20} height={20} /> : <Image src="/quizResult/wrongRedIcon.svg" alt="wrong" width={20} height={20} />}
            </span>
        </div>
    );
};


export default function QuizResults({ data }: { data: QuizResultsData }) {
    const [activeTab, setActiveTab] = useState("all"); // 'all' | 'correct' | 'incorrect'
    const [openIds, setOpenIds] = useState(() => new Set());

    // Calculate tab indicator position for animation
    const getTabPosition = () => {
        if (activeTab === "all") return "0%";
        if (activeTab === "correct") return "33.33%";
        return "66.66%";
    };

    const openToggle = (id: number) =>
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });

    const filtered = useMemo(() => {
        if (activeTab === "correct") return data.questions.filter((q: QuizQuestion) => q.chosenIndex === q.correctIndex);
        if (activeTab === "incorrect") return data.questions.filter((q: QuizQuestion) => q.chosenIndex !== q.correctIndex);
        return data.questions;
    }, [activeTab, data.questions]);

    return (
        <>
            <style>{styles}</style>
            <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8 border border-slate-200 bg-gray-50 mt-4 rounded-sm">
                {/* Top success banner */}
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <Image src="/quizResult/quizCorrectIcon.svg" alt="Check" width={50} height={50} />
                    <div>
                        <div className="font-semibold text-slate-900 text-2xl">
                            Quiz Completed!
                        </div>
                        <p className="text-md text-slate-700 ">
                            You’ve finished the quiz on <span className="font-semibold">{data.title}</span>. {data.bannerNote}
                        </p>
                    </div>
                </div>
                <div className="px-5 py-2 text-right flex items-center justify-center border-l-4 border-[#2ED496]">
                    <div className="text-lg text-[#064D3A] font-extrabold">Your Score <span aria-hidden>🏆:</span></div>
                    <div className="text-2xl font-extrabold text-[#064D3A]">
                        {data.scoreRaw} / {data.scoreMax}
                    </div>
                </div>
            </div>

            {/* Recent performance */}
            <div className=" border border-slate-200 bg-white p-6 shadow-sm relative">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold absolute top-[-10px] left-2 bg-white px-2 text-slate-900">
                    Recent Performance
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <StatPill icon="/quizResult/quizSilverCupIcon.svg" label={data.stats.recentScoreLabel} value={data.stats.recentScore} />
                    <StatPill icon="/quizResult/quizCorrectIconSmall.svg" label="Correct Answers" value={data.stats.correct} />
                    <StatPill icon="/quizResult/quizwrongIconSmall.svg" label="Incorrect Answers" value={data.stats.incorrect} />
                    <StatPill icon="/quizResult/quizTotalTimeIcon.svg" label="Total Time" value={data.stats.totalTime} />
                    <StatPill icon="/quizResult/quizAccuracyIcon.svg" label="Accuracy" value={data.stats.accuracy} />
                </div>
            </div>

            {/* Attempt history */}
            <div className="border border-slate-200 bg-white pt-6 shadow-sm relative">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold absolute top-[-10px] left-2 bg-white px-2 text-slate-900">
                    Attempt History
                </div>
                <div className="overflow-hiddenborder border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">Attempt</th>
                                <th className="px-4 py-3 font-medium">Start Date</th>
                                <th className="px-4 py-3 font-medium">Completed Date</th>
                                <th className="px-4 py-3 font-medium">Score</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {data.attempts.map((a: QuizAttempt, idx: number) => (
                                <tr key={a.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">{idx + 1}</td>
                                    <td className="px-4 py-3">{a.start}</td>
                                    <td className="px-4 py-3">{a.completed}</td>
                                    <td className="px-4 py-3">{a.score}</td>
                                    <td className="px-4 py-3">
                                        {a.action === "resume" ? (
                                            <button className="inline-flex items-center gap-2 bg-violet-600 px-3 py-2 text-white shadow hover:bg-[#5A09FF]">
                                                Resume
                                            </button>
                                        ) : (
                                            <button className="inline-flex items-center gap-2 border border-slate-300 text-white bg-[#5A09FF] px-3 py-2 shadow-sm hover:bg-slate-50">
                                                View Result
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabs */}
            <div className=" border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap relative">
                    {/* Base border for all tabs */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200"></div>
                    
                    {/* Animated sliding indicator */}
                    <div 
                        className="absolute bottom-0 h-[4px] w-[30%] transition-all duration-300 ease-in-out"
                        style={{
                            left: getTabPosition(),
                            background: 'linear-gradient(to right, #5A09FF, #CB4BFF)'
                        }}
                    ></div>

                    <button
                        onClick={() => setActiveTab("all")}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium w-[30%] transition-colors duration-200 relative z-10 ${
                            activeTab === "all" ? "text-[#5A09FF]" : "text-slate-800 hover:text-slate-900"
                        }`}
                    >
                        <Image src={"/quizResult/allQuestionsIcon.svg"} alt="" width={20} height={20} /> All Questions
                    </button>
                    <button
                        onClick={() => setActiveTab("correct")}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium w-[30%] transition-colors duration-200 relative z-10 ${
                            activeTab === "correct" ? "text-[#5A09FF]" : "text-slate-800 hover:text-slate-900"
                        }`}
                    >
                        <Image src={"/quizResult/correctIconGreen.svg"} alt="" width={20} height={20} /> Correct
                    </button>
                    <button
                        onClick={() => setActiveTab("incorrect")}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium w-[30%] transition-colors duration-200 relative z-10 ${
                            activeTab === "incorrect" ? "text-[#5A09FF]" : "text-slate-800 hover:text-slate-900"
                        }`}
                    >
                        <Image src={"/quizResult/wrongRedIcon.svg"} alt="" width={20} height={20} /> Incorrect
                    </button>
                </div>

                {/* Accordion list */}
                <div key={activeTab} className="space-y-3" style={{ animation: 'fadeIn 0.3s ease-in' }}>
                    {filtered.map((q: QuizQuestion, idx: number) => {
                        const isOpen = openIds.has(q.id);
                        return (
                            <div key={q.id} className="overflow-hidden bg-white border border-slate-200">
                                {/* Header */}
                                <button
                                    onClick={() => openToggle(q.id)}
                                    className="flex w-full items-center justify-between gap-4 bg-white px-4 py-3 text-left hover:bg-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-800">{`Q${idx + 1}: ${q.prompt}`}</span>
                                    </div>
                                    <span className="text-lg" aria-hidden>
                                        {isOpen ? <Image src="/quizResult/downIcon.svg" alt="up" width={20} height={20} /> : <Image src="/quizResult/upIcon.svg" alt="down" width={20} height={20} />}
                                    </span>
                                </button>

                                {/* Body */}
                                {isOpen && (
                                    <div className="space-y-3 bg-white p-4">
                                        {q.options.map((opt: string, i: number) => {
                                            const isUserSelected = i === q.chosenIndex;
                                            const state =
                                                i === q.correctIndex
                                                    ? "correct"
                                                    : i === q.chosenIndex
                                                        ? "wrong-selected"
                                                        : "neutral";
                                            return <OptionLine key={i} text={opt} state={state} isUserSelected={isUserSelected} />;
                                        })}

                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                            <span className="font-semibold text-slate-900">Explanation:</span>{" "}
                                            {q.explanation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            </div>
        </>
    );
}
