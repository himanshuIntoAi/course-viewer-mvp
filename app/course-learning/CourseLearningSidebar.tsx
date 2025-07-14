"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Zap, 
  Brain, 
  Target, 
  Gamepad2, 
  Check, 
  X, 
  Settings,
  LayoutGrid
} from 'lucide-react';
import Image from 'next/image';

interface Props {
  onContentSelect?: (content: any) => void;
}

export interface SidebarRef {
  updateProgress: (videoId: string, progress: number, completed: boolean) => void;
}

enum ComponentType {
  FLASHCARDS = 'flashcards',
  MINDMAP = 'mindmap',
  QUIZ = 'quiz',
  MEMORY_GAME = 'memory_game'
}

interface CourseComponent {
  id: string;
  title: string;
  type: ComponentType;
}

interface Lesson {
  id: string;
  title: string;
}

interface CourseSection {
  id: string;
  title: string;
  isExpanded: boolean;
  lessons: Lesson[];
  components: CourseComponent[];
}

interface EditingItem {
  type: 'lesson' | 'component' | 'section';
  id: string;
}

// Dummy data for demonstration
const initialCourseSections: CourseSection[] = [
  {
    id: 'section-1',
    title: 'Introduction to Python',
    isExpanded: true,
    lessons: [
      { id: 'lesson-1-1', title: 'History and Features of Python' },
      { id: 'lesson-1-2', title: 'Your First Python Program' }
    ],
    components: [
      { id: 'comp-1-1', title: 'Flash Cards', type: ComponentType.FLASHCARDS },
      { id: 'comp-1-2', title: 'Mind Map', type: ComponentType.MINDMAP },
      { id: 'comp-1-3', title: 'Quiz', type: ComponentType.QUIZ },
      { id: 'comp-1-4', title: 'Memory Game', type: ComponentType.MEMORY_GAME }
    ]
  },
  {
    id: 'section-2',
    title: 'Data Types and Variables',
    isExpanded: false,
    lessons: [
      { id: 'lesson-2-1', title: 'Understanding Data Types' },
      { id: 'lesson-2-2', title: 'Working with Variables' },
      { id: 'lesson-2-3', title: 'Type Conversion' }
    ],
    components: [
      { id: 'comp-2-1', title: 'Data Types Quiz', type: ComponentType.QUIZ },
      { id: 'comp-2-2', title: 'Variables Flash Cards', type: ComponentType.FLASHCARDS }
    ]
  },
  {
    id: 'section-3',
    title: 'Control Structures',
    isExpanded: false,
    lessons: [
      { id: 'lesson-3-1', title: 'If Statements' },
      { id: 'lesson-3-2', title: 'Loops and Iteration' }
    ],
    components: [
      { id: 'comp-3-1', title: 'Control Flow Mind Map', type: ComponentType.MINDMAP }
    ]
  },
  {
    id: 'section-4',
    title: 'Functions and Modules',
    isExpanded: false,
    lessons: [
      { id: 'lesson-4-1', title: 'Creating Functions' },
      { id: 'lesson-4-2', title: 'Working with Modules' }
    ],
    components: []
  },
  {
    id: 'section-5',
    title: 'Object-Oriented Programming',
    isExpanded: false,
    lessons: [
      { id: 'lesson-5-1', title: 'Classes and Objects' },
      { id: 'lesson-5-2', title: 'Inheritance' }
    ],
    components: [
      { id: 'comp-5-1', title: 'OOP Concepts Quiz', type: ComponentType.QUIZ }
    ]
  }
];

const CourseLearningSidebar = forwardRef<SidebarRef, Props>(({ onContentSelect }, ref) => {
  const [courseSections, setCourseSections] = useState<CourseSection[]>(initialCourseSections);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<CourseComponent | null>(null);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);

  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showPublishSettings, setShowPublishSettings] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [activeView, setActiveView] = useState<'lesson' | 'component'>('lesson');

  // Expose updateProgress method via ref
  useImperativeHandle(ref, () => ({
    updateProgress: (videoId: string, progress: number, completed: boolean) => {
      // Handle progress updates if needed
    }
  }));

  const toggleSection = (sectionId: string) => {
    setCourseSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const handleLessonSelect = (lesson: Lesson, section: CourseSection) => {
    setSelectedLesson(lesson);
    setSelectedComponent(null);
    setSelectedSection(section);
    setActiveView('lesson');
    
    // Call the content select callback with dummy content
    onContentSelect?.({
      type: 'lesson',
      id: lesson.id,
      title: lesson.title,
      content: `This is dummy content for lesson: ${lesson.title}. In the actual implementation, this would contain the real lesson content.`
    });
  };

  const handleComponentSelect = (component: CourseComponent) => {
    setSelectedComponent(component);
    setSelectedLesson(null);
    setActiveView('component');
    
    // Call the content select callback with dummy content
    onContentSelect?.({
      type: 'component',
      id: component.id,
      title: component.title,
      componentType: component.type,
      content: `This is dummy content for ${component.type}: ${component.title}. In the actual implementation, this would render the appropriate component.`
    });
  };

  const startEditing = (type: 'lesson' | 'component' | 'section', id: string, currentValue: string) => {
    setEditingItem({ type, id });
    setEditingValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    
    setCourseSections(prevSections =>
      prevSections.map(section => {
        if (editingItem.type === 'section' && section.id === editingItem.id) {
          return { ...section, title: editingValue };
        }
        
        if (editingItem.type === 'lesson') {
          return {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === editingItem.id
                ? { ...lesson, title: editingValue }
                : lesson
            )
          };
        }
        
        if (editingItem.type === 'component') {
          return {
            ...section,
            components: section.components.map(component =>
              component.id === editingItem.id
                ? { ...component, title: editingValue }
                : component
            )
          };
        }
        
        return section;
      })
    );
    
    setEditingItem(null);
    setEditingValue('');
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditingValue('');
  };

  const handleEditLesson = (sectionId: string, lessonId: string) => {
    const section = courseSections.find(s => s.id === sectionId);
    const lesson = section?.lessons.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setSelectedSection(section!);
      setActiveView('lesson');
    }
  };

  const getComponentIcon = (type: ComponentType) => {
    switch (type) {
      case ComponentType.FLASHCARDS:
        return <Zap size={14} className={selectedComponent?.type === type ? 'text-blue-600' : 'text-blue-400'} />;
      case ComponentType.MINDMAP:
        return <Brain size={14} className={selectedComponent?.type === type ? 'text-green-600' : 'text-green-400'} />;
      case ComponentType.QUIZ:
        return <Target size={14} className={selectedComponent?.type === type ? 'text-purple-600' : 'text-purple-400'} />;
      case ComponentType.MEMORY_GAME:
        return <Gamepad2 size={14} className={selectedComponent?.type === type ? 'text-red-600' : 'text-red-400'} />;
      default:
        return <FileText size={14} className="text-gray-400" />;
    }
  };

  return (
    <aside className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Course Outline</h2>
      </div>

      {/* Scrollable Course Sections */}
      <div className="flex-1 overflow-y-auto p-4 relative min-h-0">
        {courseSections.length === 0 && !isContentLoading && !initialLoading ? (
          <div className="text-center py-8">
            <LayoutGrid size={32} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 mb-1">No course content yet.</p>
            <p className="text-xs text-gray-400">Start by creating a course in the chat!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {courseSections.map((section) => (
              <div key={section.id}>
                <div
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleSection(section.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 flex-grow">
                    {section.isExpanded ? (
                      <ChevronDown size={20} className="text-gray-600" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900" style={{fontSize: '14px'}}>{section.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                    <button className="p-2.5 hover:bg-gray-100 rounded bg-gray-50 flex items-center justify-center" style={{ minWidth: '36px', minHeight: '36px' }} onClick={(e) => { 
                      e.stopPropagation(); 
                      const clickedSection = courseSections.find(s => s.id === section.id);
                      if (clickedSection) {
                        setSelectedSection(clickedSection);
                        setSelectedLesson(null); 
                        setSelectedComponent(null);
                        setActiveView('lesson');
                      }
                    }}>
                      <Image 
                        src="/ai_course_builder_icons/edit.png" 
                        alt="Edit Topic" 
                        width={20}
                        height={20}
                        className="opacity-90 hover:opacity-100"
                      />
      </button>

                  </div>
                </div>

                {section.isExpanded && (
                  <div className="ml-6 space-y-1 mt-1">
                    {section.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson, section)}
                        className={`w-full flex items-center justify-between p-2 rounded-md group ${
                          selectedLesson?.id === lesson.id
                            ? 'bg-[#ebebeb] text-gray-900'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <FileText size={14} className={selectedLesson?.id === lesson.id ? 'text-gray-700' : 'text-gray-400'} />
                          {editingItem?.type === 'lesson' && editingItem.id === lesson.id ? (
          <input
            type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="flex-1 text-sm px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              style={{fontSize: '14px'}}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveEdit();
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEditing();
                                }
                              }}
                            />
                          ) : (
                            <span 
                              className="text-sm cursor-pointer flex-1" 
                              style={{fontSize: '14px'}}
                              onClick={() => handleLessonSelect(lesson, section)}
                            >
                              {lesson.title}
                            </span>
                          )}
        </div>
                        <div className={`flex items-center space-x-1 ${editingItem?.type === 'lesson' && editingItem.id === lesson.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {editingItem?.type === 'lesson' && editingItem.id === lesson.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-1 hover:bg-green-100 text-green-600 rounded cursor-pointer"
                                title="Save"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 hover:bg-red-100 text-red-600 rounded cursor-pointer"
                                title="Cancel"
                              >
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1.5 hover:bg-gray-100 rounded cursor-pointer bg-gray-50" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLesson(section.id, lesson.id);
                                }}
                                title="Edit lesson content"
                              >
                                <Image 
                                  src="/ai_course_builder_icons/edit.png" 
                                  alt="Edit Lesson" 
                                  width={20}
                                  height={20}
                                  className="opacity-90 hover:opacity-100"
                                />
                              </button>

      </div>
                          )}
      </div>
            </div>
                    ))}
                    
                    {/* Course Components */}
                    {section.components && section.components.map((component) => (
                      <div
                        key={component.id}
                        className={`w-full flex items-center justify-between p-2 rounded-md group ${
                          selectedComponent?.id === component.id
                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                  >
                        <div className="flex items-center space-x-2 flex-1">
                          {getComponentIcon(component.type)}
                          {editingItem?.type === 'component' && editingItem.id === component.id ? (
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="flex-1 text-sm px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              style={{fontSize: '14px'}}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveEdit();
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEditing();
                                }
                              }}
                            />
                          ) : (
                            <span 
                              className="text-sm cursor-pointer flex-1" 
                              style={{fontSize: '14px'}}
                              onClick={() => handleComponentSelect(component)}
                            >
                              {component.title}
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center space-x-1 ${editingItem?.type === 'component' && editingItem.id === component.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {editingItem?.type === 'component' && editingItem.id === component.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-1 hover:bg-green-100 text-green-600 rounded cursor-pointer"
                                title="Save"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 hover:bg-red-100 text-red-600 rounded cursor-pointer"
                                title="Cancel"
                              >
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <button
                                className="p-1 hover:bg-gray-100 rounded cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing('component', component.id, component.title);
                                }}
                                title="Edit component name"
                              >
                                <Image 
                                  src="/ai_course_builder_icons/edit.png" 
                                  alt="Edit Component" 
                                  width={20}
                                  height={20}
                                  className="opacity-60 hover:opacity-100"
                                />
                              </button>

                          </div>
                          )}
                        </div>
                      </div>
                    ))}
                    

                  </div>
                )}
                    </div>
            ))}
          </div>
        )}

       
      </div>

      {/* Fixed Footer with Publish Settings */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <button 
          onClick={() => setShowPublishSettings(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
        >
          <Settings size={16} />
          <span>Publish Settings</span>
        </button>
      </div>
    </aside>
  );
});

CourseLearningSidebar.displayName = 'CourseLearningSidebar';

export default CourseLearningSidebar; 