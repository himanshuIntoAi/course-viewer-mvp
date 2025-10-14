"use client"
import React from "react"

export interface TopicSummary {
  id: number
  title: string
  counts: {
    lessons: number
    quizzes: number
    flashcards: number
    mindmaps: number
    memorygames?: number
    gamification?: number
    assignments?: number
  }
}

interface TopicDetailProps {
  topic: TopicSummary
}

const StatCard = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center w-full">
      <div className="text-gray-800 font-medium mb-2">{label}</div>
      <div className="text-2xl font-bold text-gray-900">
        {String(value).padStart(2, "0")}
      </div>
    </div>
  )
}

export default function TopicDetail({ topic }: TopicDetailProps) {
  const { title, counts } = topic
  return (
    <div className="w-full h-full bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="No of Lessons" value={counts.lessons || 0} />
        <StatCard label="Quiz" value={counts.quizzes || 0} />
        <StatCard label="Flash Cards" value={counts.flashcards || 0} />
        <StatCard label="Mind Mapping" value={counts.mindmaps || 0} />
        <StatCard label="Gamification" value={counts.gamification || 0} />
        <StatCard label="Assignments" value={counts.assignments || 0} />
      </div>
    </div>
  )
}


