"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ReactFlowProvider } from 'reactflow';
import MindMapContent from './MindMapContent'; // Import the new MindMapContent component
import './MindMap.css';

// Define interfaces for Node, Link, and MindMapData (can be shared or moved to a types file)
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

interface Link {
  source: string;
  target: string;
}

interface MindMapData {
  nodes: Node[];
  links: Link[];
}

interface MindMapProps {
  initialData?: MindMapData;
  defaultCollapsed?: boolean;
  mermaidString?: string;
}

// Helper function (can be moved to a utils file if shared)
const generateMindMapFromText = (text: string): MindMapData => {
  console.log('[MindMap] generateMindMapFromText INPUT TEXT:\n', text); // Log input text
  
  // 🔍 DEBUG: Check for problematic "Topic:" content in input
  if (typeof text === 'string' && text.includes('Topic:')) {
    console.warn('🚨 [MindMap] PROBLEMATIC "Topic:" content detected in input:', text);
    console.warn('🚨 [MindMap] This will be filtered out to prevent cross-contamination');
  }
  
  // ✅ FIXED: Add proper type checking and validation
  if (!text || typeof text !== 'string') {
    console.warn('[MindMap] generateMindMapFromText: Input is not a valid string:', typeof text, text);
    return { nodes: [], links: [] };
  }
  
  // ✅ FIXED: Filter out "Topic:" prefix lines completely to prevent cross-contamination
  const rawLines = text.split('\n').filter(line => line.trim() !== '');
  const lines = rawLines.filter(line => {
    const trimmed = line.trim();
    // Remove any lines that start with "Topic:" to prevent cross-contamination
    if (trimmed.startsWith('Topic:')) {
      console.log(`[MindMap] 🚫 Filtering out problematic "Topic:" line: "${trimmed}"`);
      return false;
    }
    return true;
  });
  
  console.log(`[MindMap] Filtered ${rawLines.length - lines.length} problematic lines, ${lines.length} lines remaining`);
  
  const defaultEmptyData = (): MindMapData => ({ nodes: [], links: [] });

  if (lines.length === 0) {
    console.log('[MindMap] generateMindMapFromText: No lines, returning empty data.');
    return defaultEmptyData();
  }

  const nodes: Node[] = [];
  const links: Link[] = [];
  let nodeIdCounter = 1;
  const levelStack: Array<{ id: string; level: number; indentLevel: number }> = [];

  const parseNodeLabel = (text: string): { name: string, isRootSyntax: boolean } => {
    const trimmed = text.trim();
    console.log(`[MindMap] parseNodeLabel INPUT: "${text}", TRIMMED: "${trimmed}"`);

    // ✅ FIXED: Enhanced root node detection for mindmap format
    const rootRegex1 = /^root\s*\(\s*\((.*?)\)\s*\)$/;
    const rootRegex2 = /^root\s*\((.*?)\)$/;
    let rootMatch = trimmed.match(rootRegex1);
    console.log(`[MindMap] parseNodeLabel: Attempting rootRegex1 on "${trimmed}". Match:`, rootMatch);
    if (!rootMatch) {
      rootMatch = trimmed.match(rootRegex2);
      console.log(`[MindMap] parseNodeLabel: Attempting rootRegex2 on "${trimmed}". Match:`, rootMatch);
    }

    if (rootMatch && rootMatch[1]) {
        const extractedName = rootMatch[1].trim();
        console.log(`[MindMap] parseNodeLabel: ROOT Matched. Extracted name: "${extractedName}"`);
        return { name: extractedName, isRootSyntax: true };
    }

    console.log(`[MindMap] parseNodeLabel: Not a root syntax. Processing as regular node.`);
    
    // ✅ FIXED: Simplified node name extraction for mindmap format
    // In mindmap format, nodes are just plain text without brackets or special characters
    let potentialLabel = trimmed;
    
    // Remove any remaining special characters that shouldn't be in mindmap format
    potentialLabel = potentialLabel.replace(/::icon\([^\)]+\)/g, '').trim();
    potentialLabel = potentialLabel.replace(/<[^>]+>/g, ' ').trim();
    potentialLabel = potentialLabel.replace(/\s\s+/g, ' ').trim();
    
    // ✅ FIXED: For mindmap format, just use the trimmed text as the node name
    // Mindmap nodes are plain text, not wrapped in brackets or special syntax
    const nodeName = potentialLabel || "Unnamed Node";
    console.log(`[MindMap] parseNodeLabel: Extracted node name: "${nodeName}"`);
    
    return { name: nodeName, isRootSyntax: false };
  };
  
  // ✅ FIXED: Handle mindmap keyword at the beginning
  const firstLineIsMindmapKeyword = lines[0].trim().toLowerCase() === "mindmap";
  let currentLineIndex = firstLineIsMindmapKeyword ? 1 : 0;

  if (currentLineIndex >= lines.length) return defaultEmptyData();

  const { name: parsedRootName } = parseNodeLabel(lines[currentLineIndex]);
  
  if (!parsedRootName) {
    console.log('[MindMap] generateMindMapFromText: First content line parsed to an empty root name. Returning empty data.');
    return defaultEmptyData();
  }

  const rootId = "1";
  nodes.push({ id: rootId, name: parsedRootName, group: 1, level: 0 });
  levelStack.push({ id: rootId, level: 0, indentLevel: 0 });
  nodeIdCounter = 2;
  
  currentLineIndex++;

  for (let i = currentLineIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const { name: nodeName, isRootSyntax: lineIsRootSyntax } = parseNodeLabel(trimmedLine);
    if (lineIsRootSyntax) continue;

    const currentId = nodeIdCounter.toString();
    nodeIdCounter++;
    
    // ✅ FIXED: Calculate indentation level (each 4 spaces = 1 level)
    const indentation = line.match(/^(\s*)/)?.[1].length ?? 0;
    const indentLevel = Math.floor(indentation / 4);
    
    console.log(`[MindMap] Processing line: "${line.substring(0,30)}..." Indentation: ${indentation}, indentLevel: ${indentLevel}`);
    
    // ✅ FIXED: Find parent node based on indentation level
    while (levelStack.length > 0 && levelStack[levelStack.length - 1].indentLevel >= indentLevel) {
      levelStack.pop();
    }
    
    let parentId = rootId;
    if (levelStack.length > 0) {
      parentId = levelStack[levelStack.length - 1].id;
        }
    
    // const parentNode = nodes.find(n => n.id === parentId);
    // const parentLevelNum = parentNode ? parentNode.level : 0;
    const nodeLevel = indentLevel;

    nodes.push({
      id: currentId,
      name: nodeName,
      group: nodeLevel + 1,
      level: nodeLevel
    });
    links.push({ source: parentId, target: currentId });
    levelStack.push({ id: currentId, level: nodeLevel, indentLevel: indentLevel });
    
    console.log(`[MindMap] Node created: ${nodeName} (level ${nodeLevel}, parent: ${parentId})`);
  }
  
  if (nodes.length === 0) {
    console.log('[MindMap] generateMindMapFromText: No nodes generated, returning empty data.');
    return defaultEmptyData();
  }
  console.log('[MindMap] generateMindMapFromText FINAL NODES:', JSON.stringify(nodes, null, 2)); // Log final nodes
  console.log('[MindMap] generateMindMapFromText FINAL LINKS:', JSON.stringify(links, null, 2)); // Log final links
  return { nodes, links };
};

const getDefaultData = (): MindMapData => ({
  nodes: [],
  links: []
});

const calculateDefaultCollapsedSet = (
  data: MindMapData | undefined,
  shouldCollapse: boolean | undefined,
  logContext: string = "calculateDefaultCollapsedSet"
): Set<string> => {
  console.log(`[MindMap] ${logContext}: INPUT data:`, data ? { nodeCount: data.nodes.length, linkCount: data.links.length } : undefined);
  console.log(`[MindMap] ${logContext}: INPUT shouldCollapse: ${shouldCollapse}`);

  if (data && data.nodes.length > 0 && data.links.length > 0) { // Ensure data is not undefined and has nodes/links
    const parentNodesWithChildren = new Set<string>();
    data.links.forEach(link => {
      if (data.nodes.some(node => node.id === link.source)) {
        parentNodesWithChildren.add(link.source);
      }
    });

    // Always log the initial set of parents with children
    console.log(`[MindMap] ${logContext}: Parent nodes with children (before defaultCollapsed check):`, Array.from(parentNodesWithChildren));

    if (shouldCollapse) {
      parentNodesWithChildren.delete("1"); // Exclude root node from collapsing if shouldCollapse is true
      
      // Only collapse nodes at level 2 and deeper, keep level 1 (direct children of root) expanded
      const nodesToKeepExpanded = new Set<string>();
      data.nodes.forEach(node => {
        if (node.level === 1) { // Direct children of root (level 0)
          nodesToKeepExpanded.add(node.id);
        }
      });
      
      // Remove level 1 nodes from the collapsed set so they remain expanded
      nodesToKeepExpanded.forEach(nodeId => {
        parentNodesWithChildren.delete(nodeId);
      });
      
      console.log(`[MindMap] ${logContext}: Keeping level 1 nodes expanded, collapsing deeper levels only.`);
    } else {
      // If not collapsing by default, we might want to ensure nothing is collapsed initially,
      // or handle this based on specific requirements. For now, if shouldCollapse is false,
      // we return an empty set, meaning all nodes are expanded.
      console.log(`[MindMap] ${logContext}: shouldCollapse is false, returning empty set (all expanded).`);
      return new Set<string>();
    }
    
    console.log(`[MindMap] ${logContext}: FINAL collapsed set:`, Array.from(parentNodesWithChildren));
    return parentNodesWithChildren;
  }
  console.log(`[MindMap] ${logContext}: Data undefined, empty, or no links. Returning empty collapsed set.`);
  return new Set<string>();
};

// PopupContainer remains the same as it handles the portal and fullscreen styling
const PopupContainer: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
}> = ({ children, isOpen }) => {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.id = 'mind-map-portal';
      document.body.appendChild(portalRef.current);
    }
    return () => {
      if (portalRef.current && document.body.contains(portalRef.current)) {
        try {
        document.body.removeChild(portalRef.current);
        } catch (error) {
          console.warn('[PopupContainer] Error removing portal:', error);
        }
        portalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Delay resize event dispatch to allow DOM updates
      setTimeout(() => {
        console.log('[PopupContainer] Dispatching resize event due to isOpen=true');
        window.dispatchEvent(new Event('resize'));
      }, 300); // 300ms delay, adjust if needed
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        console.log('[PopupContainer] Dispatching resize event due to isOpen=false');
        window.dispatchEvent(new Event('resize'));
      }, 300); 
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {!isOpen && (
        <div className="mind-map-content" style={{ 
          width: "100%", 
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          {children}
        </div>
      )}
      {isOpen && mounted && portalRef.current && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70" 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999999,
          }}
          onContextMenu={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white w-full h-full flex flex-col overflow-hidden"
            style={{ pointerEvents: 'all' }}
            onContextMenu={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            >
              {children}
          </div>
        </div>,
        portalRef.current
      )}
    </>
  );
};

// The main MindMap component now wraps MindMapContent with ReactFlowProvider
const MindMap: React.FC<MindMapProps> = ({ 
  initialData,
  defaultCollapsed = true,
  mermaidString,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [data, setData] = useState<MindMapData>(() => initialData || getDefaultData());
  // ✅ FIXED: Initialize inputText with mermaidString prop if provided
  const [inputText, setInputText] = useState<string>(mermaidString || "");
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const [generationTrigger, setGenerationTrigger] = useState<number>(0); // New state for triggering generation
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
    () => {
      console.log('[MindMap] Initializing collapsedNodes state. DefaultCollapsed prop:', defaultCollapsed, 'Initial data state:', data);
      const initialCollapsed = calculateDefaultCollapsedSet(data, defaultCollapsed, "MindMap initial state setup");
      console.log('[MindMap] Initial collapsed set:', initialCollapsed);
      return initialCollapsed;
    }
  );
  const loadInitiatedRef = useRef(false);
  const lastSavedValueRef = useRef<string | null>(null);
  const [lastSavedMermaid, setLastSavedMermaid] = useState<string | null>(null);

  // ✅ FIXED: Effect to update inputText when mermaidString prop changes
  useEffect(() => {
    if (mermaidString && typeof mermaidString === 'string' && mermaidString !== inputText) {
      console.log('[MindMap] mermaidString prop changed, updating inputText:', mermaidString.substring(0, 100) + "...");
      setInputText(mermaidString);
      // ✅ FIXED: Trigger generation when mermaidString prop is set
      setGenerationTrigger(prev => prev + 1);
    }
  }, [mermaidString, inputText]); // Keep inputText to properly compare and avoid unnecessary updates

  // ✅ FIXED: Effect to trigger initial generation when component mounts with mermaidString
  useEffect(() => {
    if (mermaidString && typeof mermaidString === 'string' && mermaidString.trim() && generationTrigger === 0) {
      console.log('[MindMap] Initial mount with mermaidString, triggering generation');
      setGenerationTrigger(1);
    }
    loadInitiatedRef.current = true;
  }, [mermaidString, generationTrigger]);

  const togglePopup = useCallback(() => {
    setIsPopupOpen(prev => {
      const newState = !prev;
      
      if (newState) {
        // Opening popup - push state to history so back button works
        window.history.pushState({ mindmapOpen: true }, '', window.location.href);
        
        // Listen for back button
        const handlePopState = (event: PopStateEvent) => {
          if (!event.state?.mindmapOpen) {
            setIsPopupOpen(false);
            window.removeEventListener('popstate', handlePopState);
          }
        };
        window.addEventListener('popstate', handlePopState);
      } else {
        // Closing popup - remove the history entry if it was added
        if (window.history.state?.mindmapOpen) {
          window.history.back();
        }
      }
      
      setTimeout(() => {
        console.log('[MindMap] Popup state changed to:', newState, ' Dispatching resize.');
        window.dispatchEvent(new Event('resize'));
      }, 100); // Keep a small delay for DOM to settle
      return newState;
    });
  }, []);

  const handleSetData = useCallback((newData: MindMapData | ((prevData: MindMapData) => MindMapData)) => {
    setData(prevData => {
      const updatedData = typeof newData === 'function' ? newData(prevData) : newData;
      let newCollapsedSet: Set<string> | null = null;

      if (updatedData.nodes.length === 0 && prevData.nodes.length > 0) {
        console.log('[MindMap] handleSetData: Clearing all nodes, calculating new collapsedNodes');
        newCollapsedSet = calculateDefaultCollapsedSet(updatedData, defaultCollapsed, "setData منجر به پاک شدن گره‌ها شد");
      } 
      else if (updatedData.nodes.length > 0 && prevData.nodes.length === 0) {
        console.log('[MindMap] handleSetData: Empty → populated, calculating new collapsed state');
        newCollapsedSet = calculateDefaultCollapsedSet(updatedData, defaultCollapsed, "setData منجر به اضافه شدن گره‌ها به نقشه خالی شد");
      }
      else if (updatedData.nodes.length > 0 && prevData.nodes.length > 0 && 
              updatedData.nodes[0]?.id === "1" && prevData.nodes[0]?.id === "1" &&
              updatedData.nodes[0]?.name !== prevData.nodes[0]?.name) {
        console.log('[MindMap] handleSetData: Root node changed, calculating new collapsedNodes');
        newCollapsedSet = calculateDefaultCollapsedSet(updatedData, defaultCollapsed, "Root node changed");
      }
      else {
        // Reduced logging for performance
        // console.log('[MindMap] handleSetData: Incremental update, preserving collapsed/expanded state (no change to collapsedNodes from this function).');
      }

      if (newCollapsedSet) {
        setCollapsedNodes(currentCollapsed => {
          // Check if the new set is actually different before updating
          if (currentCollapsed.size === newCollapsedSet!.size && 
              [...currentCollapsed].every(value => newCollapsedSet!.has(value))) {
            console.log('[MindMap] handleSetData: New collapsed set is identical to current. Skipping setCollapsedNodes.');
            return currentCollapsed; 
          }
          console.log('[MindMap] handleSetData: New collapsed set is different. Updating setCollapsedNodes.');
          return newCollapsedSet;
        });
      }
      
      return updatedData;
    });
  }, [defaultCollapsed]); // Keep only defaultCollapsed. collapsedNodes is now handled via functional update & internal check.

  const handleLayoutChange = useCallback((newLayout: "vertical" | "horizontal") => {
    if (layout === newLayout) return;
    setLayout(newLayout);
    // Resetting x,y might be better handled within the GraphRenderer/LR components
    // when they receive a new layout prop, to ensure their internal layout logic runs.
    // For now, keep it simple.
    handleSetData(prevData => ({
      ...prevData,
      nodes: prevData.nodes.map(node => ({ ...node, x: undefined, y: undefined })),
    }));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [layout, handleSetData]);
  

  // useEffect to handle mind map generation when inputText changes AND a generation is triggered.
  useEffect(() => {
    if (generationTrigger === 0) { // Don't run on initial mount or if not triggered
      console.log('[MindMap] Generation useEffect (main from inputText): Trigger is 0, skipping.');
      return;
    }

    // Reduced logging for performance
    // console.log('[MindMap] Generation useEffect (main from inputText): Triggered. Generating from inputText:', inputText.substring(0,100) + "...");
    
    // ✅ FIXED: Don't clear data when inputText is empty during initialization
    // Only clear data if we have existing data and the user explicitly cleared the input
    if (!inputText.trim()) {
        // Reduced logging for performance
        // console.log('[MindMap] Generation useEffect (main from inputText): inputText is empty. Preserving existing data to prevent initialization issues.');
        // Don't clear data automatically - let the user explicitly clear it if needed
        return;
    }

    const newGeneratedData = generateMindMapFromText(inputText);
    // Reduced logging for performance
    // console.log('[MindMap] Generation useEffect (main from inputText): Generated new data, calling handleSetData.');
    handleSetData(newGeneratedData); 
    
    // Reduced logging for performance
    // console.log('[MindMap] Generation useEffect (main from inputText): Processed.');

    // Dispatch resize after data is set and likely rendered
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      // Reduced logging for performance
      // console.log('[MindMap] Resize event dispatched after Generation useEffect (main from inputText).');
    }, 100);
  }, [generationTrigger, inputText, handleSetData]);

  // Main data generation and loading effect
  useEffect(() => {
    // Priority 1: Use mermaidString prop if provided
    if (mermaidString && typeof mermaidString === 'string' && mermaidString.trim()) {
      console.log('[MindMap] Generation useEffect: Using mermaidString prop.');
      const generatedData = generateMindMapFromText(mermaidString);
      handleSetData(generatedData);
      setLastSavedMermaid(mermaidString); // Keep track of what we've processed
      return;
    }

    // Priority 2: Use initialData prop if provided and different from current data
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(data)) {
      console.log('[MindMap] Generation useEffect: Using initialData prop.');
      handleSetData(initialData);
      return;
    }

    // Priority 3: Load from localStorage if mermaidString prop is not used
    // This prevents overwriting prop-driven data with stale localStorage data.
    if (generationTrigger > 0) { // Assuming trigger is for manual refresh
      console.log(`[MindMap] Generation useEffect (main from inputText): Trigger is ${generationTrigger}, re-generating.`);
      
      // FORCE: Skip localStorage loading if we just cleared it for fresh generation
      // Check if we have fresh inputText to use instead of loading from localStorage
      if (inputText && inputText.trim() && inputText !== lastSavedMermaid) {
        console.log('[MindMap] Using current inputText instead of localStorage for fresh generation');
        const newGeneratedData = generateMindMapFromText(inputText);
        handleSetData(newGeneratedData);
        setLastSavedMermaid(inputText); // Remember this as the last processed content
        // Dispatch resize event after setting new data
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
        return;
      }
      
      const savedContent = localStorage.getItem("mindmapContent");
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent);
          
          // ✅ FIXED: Handle case where parsed.data might be an object (mindmap data) instead of a string
          let textToGenerate = '';
          if (parsed.inputText && typeof parsed.inputText === 'string') {
            textToGenerate = parsed.inputText;
          } else if (parsed.data && typeof parsed.data === 'string') {
            textToGenerate = parsed.data;
          } else if (parsed.data && typeof parsed.data === 'object' && parsed.data.nodes) {
            // If parsed.data is already a mindmap data object, use it directly
            console.log('[MindMap] Generation useEffect: Found mindmap data object in localStorage, using directly.');
            handleSetData(parsed.data);
            return;
          }
          
          // Only generate if we have valid string text and it's different from the last generated string from a prop
          if (textToGenerate && textToGenerate !== lastSavedMermaid) {
            console.log('[MindMap] Generation useEffect: Loading from localStorage with text:', textToGenerate.substring(0, 100) + "...");
            const generatedData = generateMindMapFromText(textToGenerate);
            handleSetData(generatedData);
          } else {
             console.log('[MindMap] Generation useEffect: Skipping localStorage load, content is same as prop-derived content or no valid text found.');
          }
        } catch (e) {
          console.error("Failed to parse mindmapContent from localStorage", e);
        }
      }
    } else {
       console.log(`[MindMap] Generation useEffect (main from inputText): Trigger is ${generationTrigger}, skipping.`);
    }
  }, [mermaidString, initialData, generationTrigger, lastSavedMermaid, data, handleSetData, inputText]);

  // Effect to save to localStorage when data, inputText, or layout changes
  useEffect(() => {
    // Don't save if the initial load hasn't completed yet.
    if (!loadInitiatedRef.current) return;

    const contentToSave = {
      inputText,
      data,
      layout,
      // Persist collapsedNodes as well
      // collapsedNodes: Array.from(collapsedNodes) // Convert Set to Array for JSON
    };
    const stringifiedContent = JSON.stringify(contentToSave);

    // Prevent reacting to our own save triggering a storage event
    lastSavedValueRef.current = stringifiedContent; 
    localStorage.setItem('mindmapContent', stringifiedContent);

    console.log('[MindMap] Saved to localStorage:', stringifiedContent.substring(0,50) + "...");
  }, [data, inputText, layout]); // Remove collapsedNodes from dependencies to prevent infinite loop

  // Effect to listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mindmapContent') {
        console.log('[MindMap] Storage change detected. Key:', event.key, 'New value present:', !!event.newValue);

        if (event.oldValue === event.newValue && event.key === 'mindmapContent') {
            // Some browsers fire storage events for setItem in the same tab,
            // often with oldValue === newValue.
            console.log('[MindMap] Storage event: oldValue === newValue. Skipping update to prevent potential loops.');
            return;
        }
        
        if (!event.newValue) { // Value was cleared from another tab
          console.log('[MindMap] Storage change: New value is null (cleared). Resetting to default.');
          // Optionally, reset to initialData or a default empty state
          setData(initialData || getDefaultData());
          setInputText(''); // Clear inputText as well
          setCollapsedNodes(calculateDefaultCollapsedSet(initialData || getDefaultData(), defaultCollapsed, "Storage Event Cleared"));
          loadInitiatedRef.current = true; // Ensure future saves are allowed
          lastSavedValueRef.current = null; // Reset last saved value
          return;
        }

        // Critical comparison:
        if (event.newValue === lastSavedValueRef.current) {
          console.log('[MindMap] Storage change: New value is THE SAME as last saved by THIS instance. Skipping update.');
          return;
        }

        // If we reach here, it's considered a "foreign" update or a problematic self-trigger
        console.warn('[MindMap] Storage change: New value is DIFFERENT from last saved value by this instance. Applying update.');
        console.log('[MindMap] Last saved by this instance (first 100 chars):', lastSavedValueRef.current ? lastSavedValueRef.current.substring(0,100) : "null");
        console.log('[MindMap] New value from storage event (first 100 chars):', event.newValue ? event.newValue.substring(0,100) : "null");
        
        try {
          const loadedContent = JSON.parse(event.newValue);
          console.log('[MindMap] Storage change: Parsed loaded content.', { inputTextExists: !!loadedContent.inputText, dataExists: !!loadedContent.data });

          setInputText(loadedContent.inputText || ''); 
          setData(loadedContent.data || getDefaultData());
          setCollapsedNodes(calculateDefaultCollapsedSet(loadedContent.data, defaultCollapsed, "Storage Event Load"));
          
          // Update generationTrigger to potentially reflect remote changes, if needed, or reset.
          // For now, let's ensure it doesn't cause an immediate re-generation unless inputText changed significantly.
          // setGenerationTrigger(prev => prev +1 ); // Or some other logic if needed
          console.log('[MindMap] Storage change: Applied to local state.');

        } catch (error) {
          console.error('[MindMap] Storage change: Error parsing new value from localStorage:', error);
          // Fallback to a safe state if parsing fails
          setData(getDefaultData());
          setInputText('');
          setCollapsedNodes(calculateDefaultCollapsedSet(getDefaultData(), defaultCollapsed, "Storage Event Parse Error"));
        }
        // Update lastSavedValueRef AFTER processing the foreign change, 
        // so future saves by this instance are correctly managed.
        lastSavedValueRef.current = event.newValue; 
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => { window.removeEventListener('storage', handleStorageChange); };
  }, [defaultCollapsed, initialData]); // Remove handleSetData from dependencies to prevent infinite loop

  // Cleanup effect for browser history
  useEffect(() => {
    return () => {
      // Clean up any remaining popstate listeners when component unmounts
      if (isPopupOpen && window.history.state?.mindmapOpen) {
        window.history.back();
      }
    };
  }, [isPopupOpen]);

  return (
    <ReactFlowProvider>
      <PopupContainer isOpen={isPopupOpen}>
        <MindMapContent
          // Pass state and setters as props
          data={data}
          setData={handleSetData}
          layout={layout}
          onLayoutChange={handleLayoutChange}
          collapsedNodes={collapsedNodes}
          setCollapsedNodes={setCollapsedNodes}
          // Keep existing props
          isPopupOpen={isPopupOpen} 
          togglePopup={togglePopup}
        />
      </PopupContainer>
    </ReactFlowProvider>
  );
};

// Export the generateMindMapFromText function for use in MindMapContent
export { generateMindMapFromText };

export default MindMap;