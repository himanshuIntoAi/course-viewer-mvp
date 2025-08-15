"use client";

import React, { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from "react";
import { Maximize2, ArrowLeftRight, ArrowUpDown, Plus, Palette, Link as LinkIcon, FileText, Wand2, Sparkles, Download, ChevronDown } from "lucide-react";
import 'reactflow/dist/style.css';
import { useReactFlow } from 'reactflow'; // Import useReactFlow
import './MindMap.css';
import GraphRenderer from "./GraphRenderer";
import GraphRendererLR from "./GraphRendererLR";
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

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
  console.log('[MindMapContent] Component received data:', data);
  console.log('[MindMapContent] Data nodes count:', data?.nodes?.length);
  console.log('[MindMapContent] Data links count:', data?.links?.length);
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

  const handleGenerateFromText = useCallback(() => {
    // This function now just triggers the generation in the parent component.
    // The parent (MindMap.tsx) will use its `inputText` state to generate the new `data`.
    triggerGenerateFromText();
    // Parent component will handle resize after generation
  }, [triggerGenerateFromText]);

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
    setIsGenerating(true);
    const rootNode = data.nodes.find(node => node.id === "1");
    const topic = rootNode?.name || "";
    try {
      const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Create a detailed mind map about "${topic}" with multiple branches and sub-branches. Include at least 5-7 main topics with 2-3 subtopics each.`, isMindMap: true }),
      });
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      const mermaidSyntax = await response.text();
      const formattedSyntax = !mermaidSyntax.trim().startsWith('mindmap') ? `mindmap\n${mermaidSyntax}` : mermaidSyntax;
      setInputText(formattedSyntax); 
      // Trigger generation in parent after setting inputText
      triggerGenerateFromText();
      // Parent component will handle resize after generation
    } catch (error) {
      console.error('[MindMapContent] Error generating mind map from AI:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [data.nodes, setInputText, triggerGenerateFromText]); 

  const handleGenerateTopicFromAI = useCallback(async () => {
    setIsGenerating(true);
    const topic = inputText.trim(); 
    if (!topic) { setIsGenerating(false); return; }
    try {
      const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Create a detailed mind map about "${topic}" with multiple branches and sub-branches. Include at least 5-7 main topics with 2-3 subtopics each.`, isMindMap: true }),
      });
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      const mermaidSyntax = await response.text();
      const formattedSyntax = !mermaidSyntax.trim().startsWith('mindmap') ? `mindmap\n${mermaidSyntax}` : mermaidSyntax;
      setInputText(formattedSyntax); 
      // Trigger generation in parent after setting inputText
      triggerGenerateFromText(); 
      // Parent component will handle resize after generation
    } catch (error) {
      console.error('[MindMapContent] Error generating topic mind map from AI:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, setInputText, triggerGenerateFromText]);

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
      const prompt = `Generate 5 ${detail} ${nodeScope} for the concept: "${parentNode.name}". Return them as a numbered list, with each subtopic being concise (2-5 words).`;
      console.log(`[MindMapContent] handleGenerateSubtopics: Prompt for AI: ${prompt}`);
      const response = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isMindMap: true, field: parentNode.name }),
      });
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      const result = await response.text();
      console.log(`[MindMapContent] handleGenerateSubtopics: Raw result from AI:`, result);
      let suggestions: string[] = [];
      if (result && typeof result === 'string') {
        const cleanedResult = result.replace(/^mindmap\s*$/m, '').replace(/^root\s*\(.*Sakai\?\).*$/m, '').replace(/^(\s*)(mindmap|root)(\s*)/, '$1').trim();
        const lines = cleanedResult.split('\n');
        const numberedItems = lines.filter(line => /^\s*\d+[\.\)]\s+.*/.test(line)).map(line => line.replace(/^\s*\d+[\.\)]\s+/, '').trim());
        if (numberedItems.length > 0) {
          suggestions = numberedItems;
        } else {
          suggestions = lines.filter(line => { const trimmed = line.trim(); return trimmed.length > 0 && !trimmed.startsWith('mindmap') && !trimmed.match(/^root\s*\(.*Sakai\?\)/) && !trimmed.match(/^\s*$/) && !trimmed.match(/^\s*[\{\}\(\)]+/); }).map(line => line.trim().replace(/^\s*-?\s*/, '').replace(/\((.*?)\)$/, '$1').replace(/\[\[(.*?)\]\]/, '$1').trim()).filter(line => line.length > 0).slice(0, 5);
        }
      }
      if (suggestions.length === 0) suggestions = Array.from({length: 5}, (_, i) => `${parentNode.name} aspect ${i+1}`);
      console.log(`[MindMapContent] handleGenerateSubtopics: Parsed/fallback suggestions:`, suggestions);
      suggestions = suggestions.filter(item => item !== 'mindmap' && !item.startsWith('root') && !item.match(/^\s*[\(\)\[\]\{\}]+\s*$/)).slice(0, 5);
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
              <button onClick={handleGenerateFromText} style={{ padding: "4px 8px", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }}><FileText size={16} /> Generate Mind Map</button>
              <button onClick={handleGenerateFromAI} style={{ padding: "4px 8px", backgroundColor: "#9c27b0", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }} disabled={isGenerating}><Wand2 size={16} /> Generate alternative mindmap with AI</button>
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
              <button onClick={handleGenerateTopicFromAI} style={{ padding: "4px 8px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }} disabled={isGenerating}><Sparkles size={16} /> Create Mind Map using AI</button>
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
              <button onClick={handleGenerateFromText} style={{ padding: "4px 8px", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background-color 0.2s", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#27ae60")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2ecc71")}><FileText size={16} /> Generate Mind Map</button>
              <button onClick={handleGenerateFromAI} style={{ padding: "4px 8px", backgroundColor: "#9c27b0", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background-color 0.2s", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7b1fa2")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#9c27b0")} disabled={isGenerating}><Wand2 size={16} /> Generate alternative mindmap with AI</button>
              <button onClick={handleGenerateTopicFromAI} style={{ padding: "4px 8px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1976D2")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2196F3")} disabled={isGenerating}><Sparkles size={16} /> Create Mind Map using AI</button>
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