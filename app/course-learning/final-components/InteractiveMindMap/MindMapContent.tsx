"use client";

import React, { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from "react";
import { Maximize2, ArrowLeftRight, ArrowUpDown, Plus, Palette, Link as LinkIcon, Wand2, Download, ChevronDown } from "lucide-react";
import 'reactflow/dist/style.css';
import { useReactFlow } from 'reactflow'; // Import useReactFlow
import './MindMap.css';
import GraphRenderer from "./GraphRenderer";
import GraphRendererLR from "./GraphRendererLR";
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { API_ENDPOINTS } from '../../lib/config';

// Import the generateMindMapFromText function from MindMap.tsx
import { generateMindMapFromText } from './MindMap';

// Define interfaces for Node, Link, and MindMapData
interface Node {
  id: string;
  name: string;
  group: number;
  level: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface MindMapLink {
  source: string;
  target: string;
}

interface MindMapData {
  nodes: Node[];
  links: MindMapLink[];
}

// Define NodeData interface for GraphRenderer props consistency
interface NodeData {
  label: string;
  group: number;
  childCount: number;
  isExpanded: boolean;
  pathColor?: string;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onAddChild: (id: string) => void;
  onNodeLabelChange: (id: string, newLabel: string, extraData?: Partial<NodeData>) => void;
  onRequestSubtopics?: (id: string) => void;
  width?: number;
  height?: number;
}

interface NodeColorMap {
  [nodeId: string]: string;
}

// Updated MindMapContentProps to receive state and setters from MindMap.tsx
interface MindMapContentProps {
  data: MindMapData;
  setData: (data: MindMapData | ((prevData: MindMapData) => MindMapData)) => void;
  inputText: string;
  setInputText: Dispatch<SetStateAction<string>>;
  layout: "vertical" | "horizontal";
  onLayoutChange: (newLayout: "vertical" | "horizontal") => void;
  collapsedNodes: Set<string>;
  setCollapsedNodes: Dispatch<SetStateAction<Set<string>>>;
  isPopupOpen: boolean;
  togglePopup: () => void;
  triggerGenerateFromText: () => void;
}

const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.spinner {
  animation: spin 1s linear infinite;
}
`;

const MindMapContent: React.FC<MindMapContentProps> = ({ 
  data,
  setData,
  inputText,
  setInputText,
  layout,
  onLayoutChange,
  collapsedNodes,
  setCollapsedNodes,
  isPopupOpen,
  togglePopup,
  triggerGenerateFromText,
}) => {
  const reactFlowInstance = useReactFlow();
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("#4f46e5");
  const [linkMode, setLinkMode] = useState<boolean>(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const [nodeColors, setNodeColors] = useState<NodeColorMap>({});
  const [isCoreDataReady, setIsCoreDataReady] = useState<boolean>(false);

  const componentMountedRef = useRef(true);
  const dataLoadedRef = useRef<boolean>(false);

  // New state variables for canvas and line styling
  const [canvasTheme, setCanvasTheme] = useState<"dark" | "light">("dark");
  const [lineStyle, setLineStyle] = useState<"solid" | "dashed" | "animated" | "dashed-arrow">("solid");
  const [lineCurveStyle, setLineCurveStyle] = useState<"curved" | "straight">("curved");
  const [lineColorMode, setLineColorMode] = useState<"default" | "random" | "custom">("default");
  const [customLineColor, setCustomLineColor] = useState<string>("#CBD5E0");
  const [showLineColorPicker, setShowLineColorPicker] = useState<boolean>(false);

  const generateUniqueNodeId = useCallback((nodes: Node[]): string => {
    const parseNodeId = (node: { id: string }): number => {
      const idStr = node.id;
      if (idStr === "1") return 1;
      if (idStr.startsWith("node_")) {
        const numericPart = idStr.substring("node_".length);
        const parsed = parseInt(numericPart, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      const parsedSimple = parseInt(idStr, 10);
      return isNaN(parsedSimple) ? 0 : parsedSimple;
    };

    const maxId = Math.max(0, ...nodes.map(parseNodeId));
    return `node_${maxId + 1}`;
  }, []);

  const handleExportPNG = useCallback(() => {
    if (reactFlowInstance && reactFlowWrapperRef.current) {
      reactFlowInstance.fitView({ padding: 0.2 });
      setTimeout(() => {
        if (reactFlowWrapperRef.current) {
          toPng(reactFlowWrapperRef.current, { 
            backgroundColor: '#ffffff',
            pixelRatio: 4 
          })
            .then((dataUrl: string) => { 
              const link = document.createElement('a'); 
              link.download = 'mindmap.png'; 
              link.href = dataUrl; 
              link.click(); 
            })
            .catch((err: Error) => console.error("Error exporting as PNG:", err));
        }
      }, 500);
    }
    setShowExportOptions(false);
  }, [reactFlowInstance, setShowExportOptions]);

  const handleExportJPG = useCallback(() => {
    if (reactFlowInstance && reactFlowWrapperRef.current) {
      reactFlowInstance.fitView({ padding: 0.2 });
      setTimeout(() => {
        if (reactFlowWrapperRef.current) {
          toJpeg(reactFlowWrapperRef.current, { 
            backgroundColor: '#ffffff',
            pixelRatio: 4,
            quality: 0.95
          })
            .then((dataUrl: string) => { 
              const link = document.createElement('a'); 
              link.download = 'mindmap.jpg'; 
              link.href = dataUrl; 
              link.click(); 
            })
            .catch((err: Error) => console.error("Error exporting as JPG:", err));
        }
      }, 500);
    }
    setShowExportOptions(false);
  }, [reactFlowInstance, setShowExportOptions]);

  const handleExportPDF = useCallback(() => {
    if (reactFlowInstance && reactFlowWrapperRef.current) {
      reactFlowInstance.fitView({ padding: 0.2 });
      setTimeout(() => {
        if (reactFlowWrapperRef.current) {
          toPng(reactFlowWrapperRef.current, { 
            backgroundColor: '#ffffff',
            pixelRatio: 4
          })
            .then((dataUrl: string) => { 
              const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: 'a4'
              });
              const img = new Image();
              img.onload = () => {
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = img.width;
                const imgHeight = img.height;
                const Hratio = pageWidth / imgWidth;
                const Vratio = pageHeight / imgHeight;
                const ratio = Math.min(Hratio, Vratio);
                const scaledWidth = imgWidth * ratio;
                const scaledHeight = imgHeight * ratio;
                const x = (pageWidth - scaledWidth) / 2;
                const y = (pageHeight - scaledHeight) / 2;
                pdf.addImage(dataUrl, 'PNG', x, y, scaledWidth, scaledHeight);
                pdf.save('mindmap.pdf');
              };
              img.src = dataUrl;
            })
            .catch((err: Error) => console.error("Error exporting as PDF:", err));
        }
      }, 500);
    }
    setShowExportOptions(false);
  }, [reactFlowInstance, setShowExportOptions]);

  const handleNodeToggle = useCallback((nodeId: string) => {
    console.log(`[MindMapContent] Node toggle requested for node: ${nodeId}`);
    setCollapsedNodes(prev => {
      const isCurrentlyCollapsed = prev.has(nodeId);
      const next = new Set(prev);
      
      if (isCurrentlyCollapsed) {
        // Expanding a collapsed node
        console.log(`[MindMapContent] Expanding node: ${nodeId}`);
        next.delete(nodeId);
      } else {
        // Collapsing an expanded node
        console.log(`[MindMapContent] Collapsing node: ${nodeId}`);
        next.add(nodeId);
        
        // Removed collapsing all descendants here
      }
      
      return next;
    });
  }, [setCollapsedNodes]);

  useEffect(() => {
    dataLoadedRef.current = data.nodes.length > 0;
  }, [data]);

  useEffect(() => {
    if (!document.getElementById('mind-map-spinner-style')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'mind-map-spinner-style';
      styleElement.textContent = spinnerStyle;
      document.head.appendChild(styleElement);
      return () => {
        const styleToRemove = document.getElementById('mind-map-spinner-style');
        if (styleToRemove) document.head.removeChild(styleToRemove);
      };
    }
  }, []);

  useEffect(() => {
    if (!document.getElementById('mind-map-arrow-fix')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'mind-map-arrow-fix';
      styleElement.textContent = `
        /* Global fixes for arrow markers */
        .react-flow__edge.dashed-arrow {
          marker-end: url(#react-flow__arrowclosed) !important;
        }
        
        .react-flow__edge.dashed-arrow .react-flow__edge-path {
          marker-end: url(#react-flow__arrowclosed) !important;
        }
        
        .react-flow__arrowclosed {
          fill: currentColor !important;
          stroke: none !important;
        }
        
        .react-flow__arrowclosed polygon {
          transform: scale(2.5);
        }
        
        /* Ensure marker is visible by making it larger */
        #react-flow__arrowclosed {
          transform: scale(1.5);
        }
        
        /* Force the marker to be displayed in SVG namespace */
        svg .react-flow__edge[class*='dashed-arrow'] path {
          marker-end: url(#react-flow__arrowclosed) !important;
        }
      `;
      document.head.appendChild(styleElement);
      return () => {
        const styleToRemove = document.getElementById('mind-map-arrow-fix');
        if (styleToRemove) document.head.removeChild(styleToRemove);
      };
    }
  }, []);

  useEffect(() => {
    // New logic: Consider core data ready once the component has mounted,
    // allowing the canvas to render immediately.
    // The actual presence of nodes for display is handled by the data prop itself.
    if (!isCoreDataReady) { // Set only once
        setIsCoreDataReady(true);
        console.log('[MindMapContent] Core data considered ready on mount. Forcing resize.');
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100); // Ensure layout recalculates
    }

    return () => { componentMountedRef.current = false; };
  }, [isCoreDataReady]); // Rerun if isCoreDataReady changes, though it should only change once.


  const exportGraph = useCallback(() => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmap.json";
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportOptions(false); 
  }, [data]); 

  const handleGenerateFromAI = useCallback(async () => {
    // Generate fresh alternative mindmap content
    setIsGenerating(true);
    
    // FIRST: Extract topic from input text instead of relying on mindmap data
    let topic = "";
    
    if (inputText && inputText.trim()) {
      // Extract topic from the input text
      const lines = inputText.trim().split('\n');
      const firstLine = lines[0]?.trim();
      
      if (firstLine) {
        // Handle different formats:
        // 1. "mindmap\n    root((Topic Name))" - extract from root
        // 2. "Topic Name\n  subtopic..." - use first line
        // 3. "root((Topic Name))" - extract from parentheses
        
        if (firstLine.toLowerCase().includes('mindmap') && lines.length > 1) {
          // Look for root in subsequent lines
          const rootLine = lines.find(line => line.includes('root((') || line.includes('root('));
          if (rootLine) {
            const match = rootLine.match(/root\(\(([^)]+)\)\)/);
            if (match) {
              topic = match[1];
            } else {
              const simpleMatch = rootLine.match(/root\(([^)]+)\)/);
              if (simpleMatch) {
                topic = simpleMatch[1];
              }
            }
          }
        } else if (firstLine.includes('root((') || firstLine.includes('root(')) {
          // Direct root format
          const match = firstLine.match(/root\(\(([^)]+)\)\)/);
          if (match) {
            topic = match[1];
          } else {
            const simpleMatch = firstLine.match(/root\(([^)]+)\)/);
            if (simpleMatch) {
              topic = simpleMatch[1];
            }
          }
        } else {
          // Use first line as topic (remove any leading indentation)
          topic = firstLine.replace(/^\s+/, '');
        }
      }
    }
    
    // Fallback: Try to get topic from existing mindmap data if input text failed
    if (!topic) {
      console.log('[MindMapContent] No topic found in input text, trying existing mindmap data...');
      const currentData = data;
      
      if (currentData && currentData.nodes && currentData.nodes.length > 0) {
        let rootNode = currentData.nodes.find(node => node.id === "1");
        if (!rootNode) {
          rootNode = currentData.nodes.find(node => node.level === 0);
        }
        if (!rootNode && currentData.nodes.length > 0) {
          rootNode = currentData.nodes[0];
        }
        topic = rootNode?.name || "";
      }
    }
    
    console.log('[MindMapContent] Final topic for alternative generation:', topic);
    
    if (!topic) {
      console.error('[MindMapContent] No topic found from input text or mindmap data, cannot generate alternative mindmap');
      console.error('[MindMapContent] Input text:', inputText);
      console.error('[MindMapContent] Data nodes:', data.nodes);
      setIsGenerating(false);
      return;
    }
    
    // THEN: Clear existing mindmap data to ensure fresh generation
    setData({ nodes: [], links: [] });
    setInputText('');
    
    // FORCE: Clear localStorage cache to prevent loading old data
    const timestamp = Date.now();
    const uniqueId = window.currentCourseId || localStorage.getItem('currentCourseId') || timestamp.toString();
    
    // Clear existing mindmap cache
    const topicKey = topic.toLowerCase().replace(/\s+/g, '_');
    const storageKey = `mindmapContent_${topicKey}_${uniqueId}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem('mindmapContent');
    
    try {
      // ✅ FIXED: Use the same logic as CourseCreationWorkspace for "Add More" functionality
      // Get course ID from multiple sources for backend API
      const courseId = window.currentCourseId || localStorage.getItem('currentCourseId');
      if (!courseId) {
        throw new Error('Course ID not found. Please ensure a course has been generated first.');
      }

      // ✅ FIXED: Build context object that matches BackendAPIService expectations
      const context = {
        course_context: `Create a detailed mind map about "${topic}" with specific, concrete content.

IMPORTANT: DO NOT use generic terms like "Key Concepts", "Important Topics", "Advanced Concepts", "Fundamentals", "Theory", "Practice", "Applications", "Basics", "Core Principles", or "Main Areas".

Instead, provide actual, specific topics that are directly related to "${topic}". For example:
- If topic is "Machine Learning": Supervised Learning, Unsupervised Learning, Neural Networks, Deep Learning, Reinforcement Learning
- If topic is "Web Development": Frontend Development, Backend Development, Database Design, API Development, DevOps
- If topic is "Data Science": Data Collection, Data Cleaning, Statistical Analysis, Machine Learning, Data Visualization

Include 5-7 main branches with 2-3 specific subtopics each. Each branch should be a concrete aspect of "${topic}", not a generic category. Use proper mindmap syntax with root((${topic})) format and indentation hierarchy.`,
        course_id: parseInt(courseId.toString()),
        topic_id: 1, // Use 1 as default topic_id for mindmap generation
            difficulty: 'intermediate'
      };

      console.log(`[MindMapContent] Generating alternative mindmap for topic: "${topic}" with course_id: ${context.course_id}, topic_id: ${context.topic_id}`);
      
      // ✅ FIXED: Use BackendAPIService like CourseCreationWorkspace
      const { BackendAPIService } = await import('../../lib/BackendAPIService');
      const backendAPI = new BackendAPIService();
      
      // ✅ FIXED: Call the API with the same structure as CourseCreationWorkspace
      const generatedData = await backendAPI.generateContent('mindmap', topic, context);
      if (!generatedData) {
        throw new Error('Failed to generate mindmap content');
      }
      
      console.log(`[MindMapContent] Successfully generated mindmap data:`, generatedData);
      console.log(`[MindMapContent] Generated data type:`, typeof generatedData);
      
      // ✅ FIXED: Process response using the same logic as CourseCreationWorkspace
      let processedData: string = '';
      
      if (typeof generatedData === 'string' && generatedData.trim().length > 0) {
        // Direct string response - should be Mermaid syntax
        processedData = generatedData;
        console.log(`[MindMapContent] Using direct string response (${processedData.length} chars)`);
      } else       if (generatedData && typeof generatedData === 'object') {
        // Object response - check multiple possible formats
        if (generatedData.data && typeof generatedData.data === 'string' && generatedData.data.trim().length > 0) {
          // ✅ FIXED: Check for data as string first (this is the correct format per API docs)
          processedData = generatedData.data;
          console.log(`[MindMapContent] Found in .data property as string (${processedData.length} chars)`);
        } else if (generatedData.data && typeof generatedData.data === 'object' && generatedData.data.mindmap_syntax) {
          // ✅ FALLBACK: Check for nested data.mindmap_syntax (legacy format)
          processedData = generatedData.data.mindmap_syntax;
          console.log(`[MindMapContent] Found in .data.mindmap_syntax property (${processedData.length} chars)`);
        } else if (generatedData.mindmap && typeof generatedData.mindmap === 'string' && generatedData.mindmap.trim().length > 0) {
          processedData = generatedData.mindmap;
          console.log(`[MindMapContent] Found in .mindmap property (${processedData.length} chars)`);
        } else if (generatedData.content && typeof generatedData.content === 'string' && generatedData.content.trim().length > 0) {
          processedData = generatedData.content;
          console.log(`[MindMapContent] Found in .content property (${processedData.length} chars)`);
        } else if (generatedData.data && typeof generatedData.data === 'string' && generatedData.data.trim().length > 0) {
          processedData = generatedData.data;
          console.log(`[MindMapContent] Found in .data property (${processedData.length} chars)`);
        } else if (generatedData.mind_map && typeof generatedData.mind_map === 'string' && generatedData.mind_map.trim().length > 0) {
          processedData = generatedData.mind_map;
          console.log(`[MindMapContent] Found in .mind_map property (${processedData.length} chars)`);
        } else if (generatedData.text && typeof generatedData.text === 'string' && generatedData.text.trim().length > 0) {
          processedData = generatedData.text;
          console.log(`[MindMapContent] Found in .text property (${processedData.length} chars)`);
        } else {
          // Check if any property contains mindmap-like content
          const allKeys = Object.keys(generatedData);
          console.log(`[MindMapContent] Checking all object properties:`, allKeys);
          
          for (const key of allKeys) {
            const value = generatedData[key];
            if (typeof value === 'string' && value.trim().length > 0 && 
                (value.includes('mindmap') || value.includes('root(') || value.includes('    '))) {
              processedData = value;
              console.log(`[MindMapContent] Found mindmap-like content in .${key} property (${processedData.length} chars)`);
              break;
            }
          }
        }
      }
      
      // ✅ FIXED: Enhanced validation with better error messages and content quality checks
      if (!processedData || processedData.trim().length === 0) {
        console.warn('[MindMapContent] No mindmap data found');
        processedData = '';
      } else if (processedData === '{}' || processedData === '""' || processedData === 'null') {
        console.warn('[MindMapContent] Mindmap data is empty object/string/null');
        processedData = '';
      } else if (processedData.trim().length < 50) {
        console.warn(`[MindMapContent] Mindmap data too short (${processedData.trim().length} chars), likely incomplete`);
        processedData = '';
      } else if (!processedData.includes('mindmap') && !processedData.includes('root(')) {
        console.warn('[MindMapContent] Mindmap data doesn\'t contain expected mindmap syntax');
        processedData = '';
      }
      
      // Only use fallback if we have no valid data
      if (!processedData) {
        console.warn('[MindMapContent] Invalid mindmap data generated, using fallback');
        processedData = `mindmap
    root((${topic}))
        Core Concepts
            Fundamental Principles
            Key Theories
        Practical Applications
            Real-world Examples
            Industry Use Cases
        Advanced Topics
            Emerging Trends
            Research Areas
        Best Practices
            Common Challenges`;
      }
      
      // ✅ FIXED: Format the syntax properly
      const formattedSyntax = !processedData.trim().startsWith('mindmap') ? `mindmap\n${processedData}` : processedData;
      
      // ✅ FIXED: Set the input text and trigger generation to replace existing mindmap
      setInputText(formattedSyntax); 
      
      // ✅ FIXED: Save the new mindmap data to localStorage for persistence
      const timestamp = Date.now();
      const uniqueId = window.currentCourseId || localStorage.getItem('currentCourseId') || timestamp.toString();
      const topicKey = topic.toLowerCase().replace(/\s+/g, '_');
      const storageKey = `mindmapContent_${topicKey}_${uniqueId}`;
      
      // Save to localStorage with proper format
      localStorage.setItem(storageKey, JSON.stringify({
        inputText: formattedSyntax,
        data: formattedSyntax,
        timestamp: timestamp,
        uniqueId: uniqueId,
        topic: topic
      }));
      
      // Also save to main mindmapContent key for compatibility
      localStorage.setItem('mindmapContent', JSON.stringify({
        inputText: formattedSyntax,
        data: formattedSyntax,
        timestamp: timestamp
      }));
      
      console.log(`[MindMapContent] Saved new mindmap data to localStorage with key: ${storageKey}`);
      
      // ✅ FIXED: Set the input text and trigger generation to replace existing mindmap
      setInputText(formattedSyntax); 
      
      // ✅ IMPROVED: Force immediate data update to ensure regeneration works properly
      const newGeneratedData = generateMindMapFromText(formattedSyntax);
      setData(newGeneratedData);
      
      // Also trigger the text generation for consistency
      triggerGenerateFromText();
      
      // Force a resize event to ensure proper rendering
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);
      
      // Dispatch event to notify other components of the update
      window.dispatchEvent(new CustomEvent('componentDataUpdated', {
        detail: { componentType: 'mindmap', topic: topic, uniqueId: uniqueId }
      }));
      
      console.log(`[MindMapContent] Successfully generated alternative mindmap for "${topic}"`);
      
    } catch (error) {
      console.error('[MindMapContent] Error generating alternative mind map from AI:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, data, setInputText, triggerGenerateFromText, setData]); // Added inputText and data dependencies


  const handleLayoutChange = useCallback((newLayout: "vertical" | "horizontal") => {
    if (layout === newLayout) return; 
    onLayoutChange(newLayout); 
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [layout, onLayoutChange]); 

  const handleDeleteNode = useCallback((nodeId: string) => {
    setData(prev => { 
      const newData = {
        nodes: prev.nodes.filter((node) => node.id !== nodeId),
        links: (prev.links as MindMapLink[]).filter((link) => link.source !== nodeId && link.target !== nodeId),
      };
      // getDefaultData should be handled by parent or passed if used here.
      // For simplicity, if root is deleted and no nodes remain, parent will manage the empty state.
      if (nodeId === "1" && newData.nodes.length === 0) return { nodes: [], links: [] }; // Or call a prop to reset to default
      return newData.nodes.length > 0 ? newData : { nodes: [], links: [] };
    });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [setData]); 

  const handleAddNodeOnEdgeDrop = useCallback((sourceId: string, position: { x: number, y: number }) => {
    const sourceNode = data.nodes.find(n => n.id === sourceId); 
    if (!sourceNode) return;
    const newId = generateUniqueNodeId(data.nodes);
    const newNode = { id: newId, name: `New Node`, group: sourceNode.group + 1, level: (sourceNode.level || 0) + 1, x: position.x, y: position.y };
    const newLink: MindMapLink = { source: sourceId, target: newId };
    setData(prev => ({ nodes: [...prev.nodes, newNode], links: [...prev.links, newLink] })); 
    setSelectedNodeId(newId);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [data.nodes, generateUniqueNodeId, setData, setSelectedNodeId]); 

  const handleAddChildNode = useCallback((parentId: string) => {
    const parentNode = data.nodes.find(node => node.id === parentId); 
    if (!parentNode) return;
    const newId = generateUniqueNodeId(data.nodes);
    const parentLevel = parentNode.level || 0;
    const childrenOfParent = (data.links as MindMapLink[]).filter(link => link.source === parentId).map(link => data.nodes.find(node => node.id === link.target)).filter((node): node is Node => node !== undefined);
    const DEFAULT_VERTICAL_SPACING = 100, FIRST_CHILD_VERTICAL_SPACING = 120, DEFAULT_HORIZONTAL_SPACING = 220; 
    let newX: number, newY: number;
    if (layout === 'vertical') { 
      newX = (parentNode.x || 0);
      if (childrenOfParent.length > 0) {
        const lastSibling = childrenOfParent.sort((a,b) => (a.y || 0) - (b.y || 0))[childrenOfParent.length - 1];
        newY = (lastSibling.y || parentNode.y || 0) + DEFAULT_VERTICAL_SPACING;
        newX = (lastSibling.x || parentNode.x || 0);
      } else {
        newY = (parentNode.y || 0) + FIRST_CHILD_VERTICAL_SPACING;
      }
    } else {
      newY = (parentNode.y || 0);
      if (childrenOfParent.length > 0) {
        const lastSibling = childrenOfParent.sort((a,b) => (a.x || 0) - (b.x || 0))[childrenOfParent.length - 1];
        newX = (lastSibling.x || parentNode.x || 0) + DEFAULT_HORIZONTAL_SPACING;
      } else {
        newX = (parentNode.x || 0) + DEFAULT_HORIZONTAL_SPACING;
      }
    }
    const newNode: Node = { id: newId, name: 'New Node', group: parentNode.group + 1, level: parentLevel + 1, x: newX, y: newY };
    const newLink: MindMapLink = { source: parentId, target: newId };
    setData(prev => ({ nodes: [...prev.nodes, newNode], links: [...prev.links, newLink] })); 
    setSelectedNodeId(newId);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [data, layout, generateUniqueNodeId, setData, setSelectedNodeId]); 

  const handleUpdateNodeLabel = useCallback((nodeId: string, newLabel: string, extraData?: Partial<NodeData>) => {
    setData(prevData => ({ 
      ...prevData,
      nodes: prevData.nodes.map(node => node.id === nodeId ? { ...node, name: newLabel, ...(extraData && { width: extraData.width, height: extraData.height }) } : node)
    }));
  }, [setData]); 

  const handleGenerateSubtopics = useCallback(async (nodeId: string) => {
    console.log(`[MindMapContent] handleGenerateSubtopics: Called for nodeId: ${nodeId}`);
    setIsGenerating(true);

    try {
      const parentNode = data.nodes.find(n => n.id === nodeId);
      console.log(`[MindMapContent] handleGenerateSubtopics: Found parentNode:`, parentNode ? { id: parentNode.id, name: parentNode.name, level: parentNode.level } : null);
      if (!parentNode) {
        console.error('[MindMapContent] handleGenerateSubtopics: Parent node not found!');
        setIsGenerating(false); return; 
      }
      
      const level = parentNode.level || 0;
      const nodeScope = level > 0 ? "subtopics/child nodes" : "main topics";
      const detail = level > 0 ? "detailed and specific" : "broad and comprehensive";
      
      // Build comprehensive context by analyzing the entire mindmap structure
      const buildMindMapContext = () => {
        let rootNode = data.nodes.find(n => n.id === "1");
        if (!rootNode) {
          // Fallback: find node with level 0 (root level)
          rootNode = data.nodes.find(n => n.level === 0);
        }
        if (!rootNode && data.nodes.length > 0) {
          // Fallback: use the first node if no level 0 node found
          rootNode = data.nodes[0];
        }
        if (!rootNode) return "";
        
        // Get all direct children of the root
        const rootChildren = data.links
          .filter(link => link.source === rootNode.id)
          .map(link => data.nodes.find(n => n.id === link.target))
          .filter(Boolean);
        
        // Get all direct children of the parent node
        const parentChildren = data.links
          .filter(link => link.source === nodeId)
          .map(link => data.nodes.find(n => n.id === link.target))
          .filter(Boolean);
        
        // Build complete mindmap structure for context
        const buildCompleteStructure = () => {
          let structure = `Complete Mindmap Structure:\n`;
          structure += `Root: "${rootNode.name}" (Level 0)\n`;
          
          // Add all main branches with their levels
          rootChildren.forEach((child) => {
            if (child) {
              structure += `  ├─ ${child.name} (Level 1)\n`;
              
              // Get children of this main branch
              const branchChildren = data.links
                .filter(link => link.source === child.id)
                .map(link => data.nodes.find(n => n.id === link.target))
                .filter(Boolean);
              
              branchChildren.forEach((grandChild) => {
                if (grandChild) {
                  structure += `    ├─ ${grandChild.name} (Level 2)\n`;
                  
                  // Get children of this sub-branch (Level 3)
                  const subBranchChildren = data.links
                    .filter(link => link.source === grandChild.id)
                    .map(link => data.nodes.find(n => n.id === link.target))
                    .filter(Boolean);
                  
                  subBranchChildren.forEach((subChild) => {
                    if (subChild) {
                      structure += `      ├─ ${subChild.name} (Level 3)\n`;
                    }
                  });
                }
              });
            }
          });
          
          return structure;
        };
        
        // Build parent node context with hierarchy information
        const buildParentContext = () => {
          let parentContext = `\nParent Node Details:\n`;
          parentContext += `- Name: "${parentNode.name}"\n`;
          parentContext += `- Level: ${parentNode.level || 0}\n`;
          parentContext += `- Group: ${parentNode.group}\n`;
          
          // Find parent's parent (grandparent)
          const grandparentLink = data.links.find(link => link.target === nodeId);
          if (grandparentLink) {
            const grandparent = data.nodes.find(n => n.id === grandparentLink.source);
            if (grandparent) {
              parentContext += `- Parent: "${grandparent.name}" (Level ${grandparent.level || 0})\n`;
            }
          }
          
          // Add siblings (other children of the same parent)
          if (grandparentLink) {
            const siblings = data.links
              .filter(link => link.source === grandparentLink.source && link.target !== nodeId)
              .map(link => data.nodes.find(n => n.id === link.target))
              .filter(Boolean);
            
            if (siblings.length > 0) {
              parentContext += `- Siblings: ${siblings.map(s => s?.name).join(", ")}\n`;
            }
          }
          
          return parentContext;
        };
        
        // Build existing children context
        const buildExistingChildrenContext = () => {
          if (parentChildren.length === 0) {
            return `\nExisting Children: None (this is a new branch)\n`;
          }
          
          let childrenContext = `\nExisting Children under "${parentNode.name}":\n`;
          parentChildren.forEach((child) => {
            if (child) {
              childrenContext += `- ${child.name} (Level ${child.level || 0})\n`;
              
              // Get children of this existing child
              const grandChildren = data.links
                .filter(link => link.source === child.id)
                .map(link => data.nodes.find(n => n.id === link.target))
                .filter(Boolean);
              
              if (grandChildren.length > 0) {
                childrenContext += `  └─ Children: ${grandChildren.map(gc => gc?.name).join(", ")}\n`;
              }
            }
          });
          
          return childrenContext;
        };
        
        // Build the complete context
        let context = buildCompleteStructure();
        context += buildParentContext();
        context += buildExistingChildrenContext();
        
        // Add generation instructions
        context += `\nGeneration Instructions:\n`;
        context += `Generate 5 specific, concrete ${detail} ${nodeScope} for "${parentNode.name}". `;
        context += `DO NOT return generic template content like "Key Concepts", "Important Topics", or "Advanced Concepts". `;
        context += `Instead, provide actual, specific subtopics that are directly related to "${parentNode.name}". `;
        context += `For example, if the topic is "Applications of Machine Learning", return specific applications like "Computer Vision", "Natural Language Processing", "Recommendation Systems", etc. `;
        context += `Return them as a numbered list, with each subtopic being concise (2-5 words). `;
        context += `Ensure the new subtopics complement the existing structure and don't duplicate existing concepts. `;
        context += `Consider the hierarchy level (${parentNode.level || 0}) and maintain consistency with the overall mindmap structure.`;
        
        return context;
      };
      
      const prompt = buildMindMapContext();
      console.log(`[MindMapContent] handleGenerateSubtopics: Enhanced prompt for AI:`, prompt);
      
      // ✨ SUBTOPICS API: Generate specific subtopics for existing mindmap nodes
      // 📍 API: POST /api/course/content/subtopics
      // 📋 PURPOSE: Magic button to add child nodes to existing nodes
      let suggestions: string[] = [];
      let usedSpecializedEndpoint = false;
      let subtopicsError = null;
      
      // ✅ FIXED: Get course ID once at the beginning for both API calls
      const courseId = window.currentCourseId || localStorage.getItem('currentCourseId');
      if (!courseId) {
        throw new Error('Course ID not found for subtopics generation');
      }
      
      try {
        console.log(`[MindMapContent] Trying specialized subtopics endpoint...`);
        
        // ✅ FIXED: Use the dedicated subtopics method from BackendAPIService
        const { BackendAPIService } = await import('../../lib/BackendAPIService');
        const apiService = new BackendAPIService();
        
        const subtopicsResult = await apiService.generateMindmapSubtopics(
          parentNode.name,
          { 
            course_context: prompt || `Generate specific subtopics for: ${parentNode.name}`,
            course_id: parseInt(courseId.toString())
          }, // ✅ FIXED: Include course_id in context
          {
            level: level,
            difficulty: 'intermediate'
          }
        );
        
        console.log(`[MindMapContent] Subtopics result:`, subtopicsResult);
        
        // ✅ FIXED: Handle response format correctly
        if (subtopicsResult.success && subtopicsResult.subtopics) {
          suggestions = subtopicsResult.subtopics;
          usedSpecializedEndpoint = true;
          console.log(`[MindMapContent] ✅ Using specialized subtopics:`, suggestions);
        } else {
          subtopicsError = 'No subtopics returned from API.';
        }
      } catch (error) {
        subtopicsError = error;
        console.log(`[MindMapContent] Specialized subtopics endpoint failed:`, error);
      }
      
      if (!usedSpecializedEndpoint) {
        setIsGenerating(false);
        console.error('[MindMapContent] Could not generate subtopics:', subtopicsError);
        return;
      }
      
      console.log(`[MindMapContent] Final suggestions from specialized endpoint:`, suggestions);
      
      // Check if suggestions are too generic and try to generate more specific ones
      const genericTerms = ['key concepts', 'important topics', 'advanced concepts', 'fundamentals', 'theory', 'practice', 'applications'];
      const isGeneric = suggestions.some(suggestion => 
        genericTerms.some(term => suggestion.toLowerCase().includes(term))
      );
      
      if (isGeneric && suggestions.length > 0) {
        console.log(`[MindMapContent] Detected generic suggestions, trying to generate more specific content...`);
        
        // Try to generate more specific content using the specialized subtopics endpoint
        try {
          const specificPrompt = `Generate 5 specific, concrete subtopics for "${parentNode.name}". 
DO NOT use generic terms like "Key Concepts", "Important Topics", "Advanced Concepts", "Fundamentals", "Theory", "Practice", or "Applications".
Instead, provide actual, specific subtopics that are directly related to "${parentNode.name}".

For example:
- If topic is "Applications of Machine Learning": Computer Vision, Natural Language Processing, Recommendation Systems, Predictive Analytics, Autonomous Systems
- If topic is "Data Collection": Surveys, Sensors, APIs, Web Scraping, IoT Devices
- If topic is "Feature Engineering": Feature Selection, Dimensionality Reduction, Data Transformation, Feature Scaling, Feature Creation

Return only the 5 specific subtopics as a numbered list (1. Subtopic, 2. Subtopic, etc.).`;

          console.log(`[MindMapContent] Sending specific content request for: ${parentNode.name}`);
          
          // ✅ FIXED: Use the same API service for consistency
          const { BackendAPIService } = await import('../../lib/BackendAPIService');
          const apiService = new BackendAPIService();
          
          const specificResult = await apiService.generateMindmapSubtopics(
            parentNode.name,
            { 
              course_context: specificPrompt || `Generate specific subtopics for: ${parentNode.name}`,
              course_id: parseInt(courseId.toString())
            }, // ✅ FIXED: Include course_id in context
            {
              level: level,
              difficulty: 'intermediate'
            }
          );
          
          console.log(`[MindMapContent] Specific content response:`, specificResult);
          
          if (specificResult && specificResult.success && specificResult.subtopics) {
            const specificContent = specificResult.subtopics;
            
            if (Array.isArray(specificContent) && specificContent.length > 0) {
              // Extract numbered items from the specific response
              const numberedItems = specificContent
                .filter((item: string) => item.length > 0 && !genericTerms.some(term => item.toLowerCase().includes(term)));
              
              if (numberedItems.length > 0) {
                suggestions = numberedItems.slice(0, 5);
                console.log(`[MindMapContent] Using specific numbered items:`, suggestions);
              }
            }
          }
        } catch (specificError) {
          console.error(`[MindMapContent] Error generating specific content:`, specificError);
        }
      }
      
      if (suggestions.length === 0) {
        console.warn(`[MindMapContent] No suggestions extracted from API response, using fallback`);
        suggestions = Array.from({length: 5}, (_, i) => `${parentNode.name} aspect ${i+1}`);
        console.log(`[MindMapContent] Fallback suggestions:`, suggestions);
      }
      
      console.log(`[MindMapContent] handleGenerateSubtopics: Parsed/fallback suggestions:`, suggestions);
      suggestions = suggestions.filter(item => 
        item !== 'mindmap' && 
        !item.startsWith('root') && 
        !item.match(/^\s*[\(\)\[\]\{\}]+\s*$/)
      ).slice(0, 5);
      
      console.log(`[MindMapContent] handleGenerateSubtopics: Filtered suggestions:`, suggestions);
      
      const newNodesPayload: Node[] = [];
      const newLinksPayload: MindMapLink[] = [];
      const AI_CHILD_VERTICAL_OFFSET = 100, AI_CHILD_HORIZONTAL_OFFSET = 180, AI_CHILD_HORIZONTAL_SPACING_LR = 200, AI_CHILD_VERTICAL_SPACING_LR = 70;
      const parentX = parentNode.x || 0, parentY = parentNode.y || 0;

      // Use a temporary array to collect new nodes for ID generation consistency
      // This ensures that generateUniqueNodeId considers nodes created within this same operation.
      const currentBatchNodes: Node[] = [...data.nodes];

      suggestions.forEach((suggestion: string, index: number) => {
        if (!suggestion || suggestion.trim().length === 0) return;
        const cleanedSuggestion = suggestion.trim() === '[object Object]' ? `${parentNode.name} subtopic ${index + 1}` : suggestion.trim();
        
        // Generate a unique ID for the new node
        // Pass the current state of all nodes (including those already added in this batch)
        const newNodeId = generateUniqueNodeId(currentBatchNodes);
        console.log(`[MindMapContent] Creating new node with ID: ${newNodeId} for parent: ${nodeId}`);
        
        let newX: number, newY: number;
        if (layout === 'vertical') { 
          newX = parentX + (index - (suggestions.length - 1) / 2) * AI_CHILD_HORIZONTAL_OFFSET;
          newY = parentY + AI_CHILD_VERTICAL_OFFSET;
        } else {
          newX = parentX + AI_CHILD_HORIZONTAL_SPACING_LR;
          newY = parentY + (index - (suggestions.length - 1) / 2) * AI_CHILD_VERTICAL_SPACING_LR;
        }
        const newNodeToAdd: Node = { id: newNodeId, name: cleanedSuggestion, group: parentNode.group + 1, level: (parentNode.level || 0) + 1, x: newX, y: newY };
        newNodesPayload.push(newNodeToAdd);
        newLinksPayload.push({ source: nodeId, target: newNodeId });
        // Add the newly created node to currentBatchNodes for the next iteration's ID generation
        currentBatchNodes.push(newNodeToAdd);
      });

      // First expand the parent node before adding nodes
      if (collapsedNodes.has(nodeId)) {
        console.log(`[MindMapContent] handleGenerateSubtopics: Expanding parent node ${nodeId} BEFORE adding children`);
        setCollapsedNodes(prevCollapsed => {
          const nextCollapsed = new Set(prevCollapsed);
          nextCollapsed.delete(nodeId);
          return nextCollapsed;
        });
      }
      
      // Add the new nodes to data
      setData(prev => ({ nodes: [...prev.nodes, ...newNodesPayload], links: [...prev.links, ...newLinksPayload] })); 
      
      // Ensure the parent node is expanded after adding children
      setCollapsedNodes(prevCollapsed => {
        const nextCollapsed = new Set(prevCollapsed);
        if (nextCollapsed.has(nodeId)) {
          console.log(`[MindMapContent] handleGenerateSubtopics: Parent node ${nodeId} was still collapsed, expanding it again.`);
          nextCollapsed.delete(nodeId);
        }
        return nextCollapsed;
      });
      
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    } catch (error) {
      console.error('[MindMapContent] Error generating subtopics:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [data, layout, setData, setCollapsedNodes, collapsedNodes, generateUniqueNodeId]); 

  const handleAddNode = useCallback(() => {
    setData(prev => { 
      let newNode: Node;
      if (prev.nodes.length === 0) {
        newNode = { id: "1", name: "New Node", group: 1, level: 0 };
      } else {
        const newId = generateUniqueNodeId(prev.nodes);
        newNode = { id: newId, name: "New Node", group: 1, level: 0 };
      }
      const newNodes = [...prev.nodes, newNode];
      setSelectedNodeId(newNode.id);
      return { nodes: newNodes, links: prev.links };
    });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [generateUniqueNodeId, setData, setSelectedNodeId]);

  const handleApplyColor = useCallback((nodeId: string, color: string) => {
    setNodeColors(prev => ({ ...prev, [nodeId]: color }));
    if (nodeId) { setSelectedNodeId(nodeId); setSelectedColor(color); setShowColorPicker(false); }
  }, []);

  const handleLinkNodes = useCallback((sourceId: string, targetId: string) => {
    if (sourceId && targetId && sourceId !== targetId) {
      const linkExists = (data.links as MindMapLink[]).some(link => link.source === sourceId && link.target === targetId); 
      if (!linkExists) {
        const newLink: MindMapLink = { source: sourceId, target: targetId };
        setData(prev => ({ ...prev, links: [...prev.links, newLink] })); 
      }
      setLinkMode(false); setLinkSource(null);
    }
  }, [data, setData]); 

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    if (linkMode && linkSource && nodeId) {
      handleLinkNodes(linkSource, nodeId);
    } else {
      setSelectedNodeId(nodeId);
      if (nodeId !== selectedNodeId) setShowColorPicker(false);
    }
  }, [linkMode, linkSource, handleLinkNodes, selectedNodeId]);
  
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setData(prev => { 
      const nodeToUpdate = prev.nodes.find(node => node.id === nodeId);
      if (nodeToUpdate && (nodeToUpdate.x !== position.x || nodeToUpdate.y !== position.y)) {
        return { ...prev, nodes: prev.nodes.map(node => node.id === nodeId ? { ...node, x: position.x, y: position.y } : node) };
      }
      return prev;
    });
  }, [setData]); 

  useEffect(() => {
    if (selectedNodeId && selectedColor) {
      setNodeColors(prev => ({ ...prev, [selectedNodeId]: selectedColor }));
    }
  }, [selectedNodeId, selectedColor]);

  const ManualEditButtons = () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <button onClick={handleAddNode} style={{ padding: "4px 8px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}><Plus size={16} /> Add Node</button>
      <button onClick={() => setShowColorPicker(!showColorPicker)} style={{ padding: "4px 8px", backgroundColor: selectedNodeId ? "#8b5cf6" : "#d1d5db", color: "white", border: "none", borderRadius: "4px", cursor: selectedNodeId ? "pointer" : "not-allowed", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", transition: "background-color 0.2s" }} disabled={!selectedNodeId} onMouseEnter={(e) => selectedNodeId && (e.currentTarget.style.backgroundColor = "#7c3aed")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedNodeId ? "#8b5cf6" : "#d1d5db")}><Palette size={16} /> {selectedNodeId ? "Change Node Color" : "Select Node"}</button>
      <button onClick={() => { if (selectedNodeId) { setLinkMode(!linkMode); setLinkSource(linkMode ? null : selectedNodeId); } }} style={{ padding: "4px 8px", backgroundColor: selectedNodeId ? (linkMode ? "#ef4444" : "#ec4899") : "#d1d5db", color: "white", border: "none", borderRadius: "4px", cursor: selectedNodeId ? "pointer" : "not-allowed", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", transition: "background-color 0.2s" }} disabled={!selectedNodeId} onMouseEnter={(e) => selectedNodeId && (e.currentTarget.style.backgroundColor = linkMode ? "#dc2626" : "#db2777")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedNodeId ? (linkMode ? "#ef4444" : "#ec4899") : "#d1d5db")}><LinkIcon size={16} /> {linkMode ? "Cancel Link" : "Link Nodes"}</button>
      {linkMode && selectedNodeId && (<div style={{ padding: "4px 8px", backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", }}>Linking from Node #{selectedNodeId}</div>)}
    </div>
  );

  const CanvasStyleButtons = () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: isPopupOpen ? '0px' : '8px' }}>
      <button onClick={() => setCanvasTheme(canvasTheme === "dark" ? "light" : "dark")} style={{ padding: "4px 8px", backgroundColor: "#607d8b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
        {canvasTheme === "dark" ? "Light Theme" : "Dark Theme"}
      </button>
      <button 
        onClick={() => setLineStyle(prev => 
          prev === "solid" ? "dashed" : 
          prev === "dashed" ? "animated" : 
          prev === "animated" ? "dashed-arrow" : 
          "solid"
        )} 
        style={{ padding: "4px 8px", backgroundColor: "#795548", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
      >
        Line: {lineStyle === "solid" ? "Dashed" : 
               lineStyle === "dashed" ? "Animated" : 
               lineStyle === "animated" ? "Dashed Arrow" : 
               "Solid"}
      </button>
      <button onClick={() => setLineCurveStyle(prev => prev === "curved" ? "straight" : "curved")} style={{ padding: "4px 8px", backgroundColor: "#795548", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
        Curve: {lineCurveStyle === "curved" ? "Straight" : "Curved"}
      </button>
      <button onClick={() => setLineColorMode(prev => prev === "default" ? "random" : prev === "random" ? "custom" : "default")} style={{ padding: "4px 8px", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
        Line Color: {lineColorMode === "default" ? "Random" : lineColorMode === "random" ? "Custom" : "Default"}
      </button>
      {lineColorMode === "custom" && (
        <button onClick={() => setShowLineColorPicker(!showLineColorPicker)} style={{ padding: "4px 8px", backgroundColor: customLineColor, color: "white", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
          Pick Line Color
        </button>
      )}
    </div>
  );

  const ColorPicker = () => {
    const colors = ["#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#10b981","#14b8a6","#06b6d4","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899","#f43f5e"];
    return showColorPicker && selectedNodeId ? (
      <div style={{ position: "absolute", top: isPopupOpen ? "130px" : "210px", right: "10px", zIndex: 1000, backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", width: "220px" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>Choose a color for Node #{selectedNodeId}:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>{colors.map(color => (<div key={color} style={{ width: "24px", height: "24px", backgroundColor: color, borderRadius: "4px", cursor: "pointer", border: color === selectedColor ? "2px solid black" : "none" }} onClick={() => handleApplyColor(selectedNodeId, color)} />))}</div>
      </div>
    ) : null;
  };

  const LineColorPicker = () => {
    const colors = ["#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#10b981","#14b8a6","#06b6d4","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899","#f43f5e", "#CBD5E0", "#000000", "#FFFFFF"];
    return showLineColorPicker && lineColorMode === "custom" ? (
      <div style={{ position: "absolute", top: isPopupOpen ? "130px" : "240px", right: "10px", zIndex: 1000, backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", width: "220px" }}>
        <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>Choose a custom line color:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>{colors.map(color => (<div key={color} style={{ width: "24px", height: "24px", backgroundColor: color, borderRadius: "4px", cursor: "pointer", border: color === customLineColor ? "2px solid black" : "1px solid #eee" }} onClick={() => { setCustomLineColor(color); setShowLineColorPicker(false);}} />))}</div>
      </div>
    ) : null;
  };
  
  const isLoading = false; // New: Never show "Initializing Mind Map..." from MindMapContent

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Ensure arrows display properly for all edge types */
      .react-flow__edge-path {
        stroke-width: 2;
      }
      
      /* Make default edges (straight lines) consistent with custom edges */
      .react-flow__edge.default .react-flow__edge-path {
        stroke-width: 2 !important;
      }
      
      /* Ensure markers appear properly */
      .react-flow__arrowclosed {
        fill: currentColor !important;
        stroke: none !important;
      }
      
      /* Better animation handling */
      .react-flow__edge.animated path {
        animation: flowDashdraw 0.5s linear infinite;
      }
      
      /* Fix for dashed-arrow style */
      .react-flow__edge.default[data-markerend] .react-flow__edge-path {
        marker-end: url(#react-flow__arrowclosed);
      }
      
      /* Fix for straight line thickness */
      .react-flow__edge.default {
        stroke-width: 2 !important;
      }
      
      /* Fix for arrow size */
      .react-flow__arrowclosed polygon {
        transform: scale(1.5);
      }
      
      @keyframes flowDashdraw {
        to {
          stroke-dashoffset: -10;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!document.getElementById('mind-map-dashed-arrow-fix')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'mind-map-dashed-arrow-fix';
      styleElement.textContent = `
        /* Global fixes specifically for dashed-arrow edges */
        .react-flow__edge.dashed-arrow {
          stroke-dasharray: 5,5;
        }
        
        .react-flow__edge.dashed-arrow .react-flow__edge-path {
          marker-end: url(#custom-arrow) !important;
          stroke-dasharray: 5,5 !important;
        }
        
        /* Force all arrow edges to display correctly regardless of line type */
        .react-flow__edges [class*='dashed-arrow'] .react-flow__edge-path {
          marker-end: url(#custom-arrow) !important;
        }
        
        /* Ensure the arrow color matches the line color */
        .react-flow__edges .react-flow__edge.dashed-arrow {
          color: inherit;
        }
        
        /* Make the arrow more visible */
        #custom-arrow {
          fill: currentColor;
          stroke: none;
        }
      `;
      document.head.appendChild(styleElement);
      return () => {
        const styleToRemove = document.getElementById('mind-map-dashed-arrow-fix');
        if (styleToRemove) document.head.removeChild(styleToRemove);
      };
    }
  }, []);

  return (
    <div style={{ 
      width: "100%",
      height: "100%", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      padding: isPopupOpen ? "0" : "1rem",
      boxSizing: "border-box",
      background: isPopupOpen ? "#f0f0f0" : "transparent"
    }}>
      {isPopupOpen ? (
        <>
          <div style={{ padding: "8px", background: "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-lg font-semibold text-blue-700">Interactive Mind Map</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => handleLayoutChange(layout === "vertical" ? "horizontal" : "vertical")} className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-md" title={`Switch to ${layout === "vertical" ? "horizontal" : "vertical"} layout`} style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '120px', height: '30px' }}>{layout === "vertical" ? <><ArrowLeftRight size={16} color="white" /> Horizontal</> : <><ArrowUpDown size={16} color="white" /> Vertical</>}</button>
                <button onClick={togglePopup} className="p-2 text-white rounded-md shadow-md" style={{ backgroundColor: '#0d9488' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14b8a6')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0d9488')} title="Exit fullscreen"><Maximize2 size={20} color="white" /></button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}> 
              <textarea key="mindmap-textarea-fullscreen" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter text..." style={{ flexBasis: '200px', flexGrow: 1, minHeight: "30px", maxHeight: "30px", padding: "4px", fontFamily: "monospace", fontSize: "11px", lineHeight: "1.2", border: "1px solid #ddd", borderRadius: "4px", resize: "none", whiteSpace: "nowrap", overflowX: "auto", color: "black", marginRight: 'auto' }} />
              <button onClick={handleGenerateFromAI} style={{ padding: "4px 8px", backgroundColor: "#9c27b0", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }} disabled={isGenerating}><Wand2 size={16} /> Generate Alternative Mindmap</button>
               <div style={{ display: 'flex', gap: '8px', position: 'relative', flexShrink: 0 }}>
                <button onClick={() => setShowExportOptions(!showExportOptions)} style={{ padding: "4px 8px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}><Download size={16} /> Download Mind Map <ChevronDown size={16} /></button>
                {showExportOptions && (
                  <div style={{ position: "absolute", top: "100%", left: 0, backgroundColor: "white", border: "1px solid #ddd", borderRadius: "4px", zIndex: 10, minWidth: "150px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                    <button onClick={handleExportPNG} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as PNG</button>
                    <button onClick={handleExportJPG} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as JPG</button>
                    <button onClick={handleExportPDF} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as PDF</button>
                    <button onClick={exportGraph} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as JSON</button>
                  </div>
                )}
              </div>
              <ManualEditButtons />
            </div>
            <CanvasStyleButtons />
            <ColorPicker /> 
            <LineColorPicker />
          </div>
          <div ref={reactFlowWrapperRef} style={{ width: "100%", flexGrow: 1, position: "relative", overflow: "hidden", background: "#f8fafc", touchAction: "none" }} className="reactflow-wrapper">
            {isGenerating && (<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}><div style={{ background: 'white', padding: '10px 20px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #3498db', borderTopColor: 'transparent', borderRadius: '50%' }}></div><span style={{ fontSize: '14px', color: '#2c3e50' }}>Generating...</span></div></div>)}
            {isLoading ? (<div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Initializing Mind Map...</div>) : (
              <div style={{ width: "100%", height: "100%" }}>
                {layout === "vertical" ? (
                  <GraphRenderer data={data} deleteNode={handleDeleteNode} onAddChildNode={handleAddChildNode} onUpdateNodeLabel={handleUpdateNodeLabel} onRequestSubtopics={handleGenerateSubtopics} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor={selectedColor} nodeColors={nodeColors} linkMode={linkMode} linkSource={linkSource} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={handleAddNodeOnEdgeDrop} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={canvasTheme} lineStyle={lineStyle} lineCurveStyle={lineCurveStyle} lineColorMode={lineColorMode} customLineColor={customLineColor}
                  />
                ) : (
                  <GraphRendererLR data={data} deleteNode={handleDeleteNode} onAddChildNode={handleAddChildNode} onUpdateNodeLabel={handleUpdateNodeLabel} onRequestSubtopics={handleGenerateSubtopics} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor={selectedColor} nodeColors={nodeColors} linkMode={linkMode} linkSource={linkSource} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={handleAddNodeOnEdgeDrop} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={canvasTheme} lineStyle={lineStyle} lineCurveStyle={lineCurveStyle} lineColorMode={lineColorMode} customLineColor={customLineColor}
                  />
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", width: "100%" }}>
            <span className="text-lg font-semibold text-blue-700">Interactive Mind Map</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => handleLayoutChange(layout === "vertical" ? "horizontal" : "vertical")} className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-md" title={`Switch to ${layout === "vertical" ? "horizontal" : "vertical"} layout`} style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '120px', height: '30px' }}>{layout === "vertical" ? <><ArrowLeftRight size={16} color="white" /> Horizontal</> : <><ArrowUpDown size={16} color="white" /> Vertical</>}</button>
              <button onClick={togglePopup} className="p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow-md" title="Open in fullscreen"><Maximize2 size={20} color="white" /></button>
            </div>
          </div>
          <div style={{ marginBottom: "1rem", background: "#ffffff", padding: "4px", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", width: "100%" }}>
            <textarea key="mindmap-textarea" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter text with indentation for hierarchy.\nExample:\nMy Project\n  Planning\n" style={{ width: "100%", minHeight: "40px", maxHeight: "100px", padding: "4px", marginBottom: "4px", fontFamily: "monospace", fontSize: "11px", lineHeight: "1.2", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical", whiteSpace: "pre", overflowX: "auto", color: "black" }}/>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleGenerateFromAI} style={{ padding: "4px 8px", backgroundColor: "#9c27b0", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background-color 0.2s", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7b1fa2")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#9c27b0")} disabled={isGenerating}><Wand2 size={16} /> Generate Alternative Mindmap</button>
              <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                <button onClick={() => setShowExportOptions(!showExportOptions)} style={{ padding: "4px 8px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background-color 0.2s", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2980b9")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3498db")}><Download size={16} /> Download Mind Map <ChevronDown size={16} /></button>
                {showExportOptions && (
                  <div style={{ position: "absolute", top: "100%", left: 0, backgroundColor: "white", border: "1px solid #ddd", borderRadius: "4px", zIndex: 10, minWidth: "150px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                    <button onClick={handleExportPNG} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as PNG</button>
                    <button onClick={handleExportJPG} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as JPG</button>
                    <button onClick={handleExportPDF} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as PDF</button>
                    <button onClick={exportGraph} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>Export as JSON</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ManualEditButtons />
          <CanvasStyleButtons />
          <ColorPicker />
          <LineColorPicker />
          {linkMode && selectedNodeId && (<div style={{ position: "absolute", top: "240px", right: "10px", zIndex: 1000, backgroundColor: "#fed7aa", borderRadius: "4px", padding: "8px", fontSize: "12px", color: "#92400e", border: "1px solid #fdba74", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"}}>Linking from Node #{selectedNodeId}</div>)}
          <div ref={reactFlowWrapperRef} style={{ width: "100%", flexGrow: 1, position: "relative", border: "1px solid #E2E8F0", borderRadius: "4px", overflow: "hidden", background: "#f8fafc", minHeight: "300px", touchAction: "none" }} className="reactflow-wrapper">
            {isGenerating && (<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}><div style={{ background: 'white', padding: '10px 20px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #3498db', borderTopColor: 'transparent', borderRadius: '50%' }}></div><span style={{ fontSize: '14px', color: '#2c3e50' }}>Generating...</span></div></div>)}
            {isLoading ? (<div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Initializing Mind Map...</div>) : (
              <div style={{ width: "100%", height: "100%" }}>
                {layout === "vertical" ? (
                  <GraphRenderer data={data} deleteNode={handleDeleteNode} onAddChildNode={handleAddChildNode} onUpdateNodeLabel={handleUpdateNodeLabel} onRequestSubtopics={handleGenerateSubtopics} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor={selectedColor} nodeColors={nodeColors} linkMode={linkMode} linkSource={linkSource} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={handleAddNodeOnEdgeDrop} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={canvasTheme} lineStyle={lineStyle} lineCurveStyle={lineCurveStyle} lineColorMode={lineColorMode} customLineColor={customLineColor}
                  />
                ) : (
                  <GraphRendererLR data={data} deleteNode={handleDeleteNode} onAddChildNode={handleAddChildNode} onUpdateNodeLabel={handleUpdateNodeLabel} onRequestSubtopics={handleGenerateSubtopics} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor={selectedColor} nodeColors={nodeColors} linkMode={linkMode} linkSource={linkSource} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={handleAddNodeOnEdgeDrop} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={canvasTheme} lineStyle={lineStyle} lineCurveStyle={lineCurveStyle} lineColorMode={lineColorMode} customLineColor={customLineColor}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MindMapContent; 