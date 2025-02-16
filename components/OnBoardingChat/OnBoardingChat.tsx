"use client";
import React, { useState } from "react";

/**
 * OnboardingChat:
 * A simple 3-step onboarding with tabs and chat-style messages.
 */
export default function OnboardingChat() {
  // The three steps (tab labels)
  const steps = ["Tell Us About You", "Skills", "Guides"];
  // Track which tab (step) is active
  const [activeTab, setActiveTab] = useState(0);
 
  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow p-6">
      {/* -- Tabs (Steps) -- */}
      <div className="flex space-x-8 border-b mb-6">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`relative text-sm font-semibold pb-3 tcvransition-colors
              ${
                activeTab === index
                  ? "text-indigo-800 border-b-2 border-[#B6D0FF]"
                  : "text-gray-400"
              }
            `}
          >
            {step}
          </button>
        ))}
      </div>

      {/* -- Render Different “Stages” by activeTab -- */}
      {activeTab === 0 && <TellUsAboutYou />}
      {activeTab === 1 && <SkillsStage />}
      {activeTab === 2 && <GuidesStage />}
    </div>
  );
}

/* --------------------------------------------
   Stage 0: “Tell Us About You”
   -------------------------------------------- */
function TellUsAboutYou() {
  return (
    <div className="flex flex-col space-y-4">
      {/* Example chat bubbles */}
      <div className="flex items-start space-x-2">
        {/* System bubble on the LEFT */}
        <div className="bg-teal-400 text-white px-4 py-2 rounded-xl max-w-sm">
          <p>Hi! I will help you</p>
        </div>
      </div>

      <div className="flex justify-end items-start space-x-2">
        {/* User bubble on the RIGHT */}
        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl max-w-sm">
          <p>I’m a student</p>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        {/* Another system bubble */}
        <div className="bg-teal-400 text-white px-4 py-2 rounded-xl max-w-md">
          <p>
            That’s great! What skills are you interested in?
          </p>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-4" />

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-3">
        {[
          "Programming Skills",
          "Data Engineering",
          "Business Management",
          "Something Non-Technical",
          "DevOps",
          "Data Engineering",
          "Data Engineering",
        ].map((skill, idx) => (
          <button
            key={idx}
            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold"
          >
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------
   Stage 1: “Skills”
   (Add your own content/logic here)
   -------------------------------------------- */
function SkillsStage() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-indigo-50 p-4 rounded-xl">
        <h2 className="text-lg font-semibold text-indigo-900 mb-2">
          Skills Stage
        </h2>
        <p className="text-gray-700">
          Here you could prompt the user to pick or rate their skill levels,
          or display a more advanced conversation about specific interests.
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------
   Stage 2: “Guides”
   (Add your own content/logic here)
   -------------------------------------------- */
function GuidesStage() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-indigo-50 p-4 rounded-xl">
        <h2 className="text-lg font-semibold text-indigo-900 mb-2">
          Guides & Next Steps
        </h2>
        <p className="text-gray-700">
          In this stage, you might display recommended learning paths
          or guides tailored to the user’s chosen skills.
        </p>
      </div>
    </div>
  );
}
