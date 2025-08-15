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
}

// Helper function (can be moved to a utils file if shared)
const generateMindMapFromText = (text: string): MindMapData => {
  console.log('[MindMap] generateMindMapFromText INPUT TEXT:\n', text); // Log input text
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  const defaultEmptyData = (): MindMapData => ({ nodes: [], links: [] });

  if (lines.length === 0) {
    console.log('[MindMap] generateMindMapFromText: No lines, returning empty data.');
    return defaultEmptyData();
  }

  const nodes: Node[] = [];
  const links: Link[] = [];
  let nodeIdCounter = 1;
  const levelMap = new Map<number, string>();

  const parseNodeLabel = (text: string): { name: string, isRootSyntax: boolean } => {
    const trimmed = text.trim();
    console.log(`[MindMap] parseNodeLabel INPUT: "${text}", TRIMMED: "${trimmed}"`);

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
    let potentialLabel = trimmed;
    potentialLabel = potentialLabel.replace(/::icon\([^\)]+\)/g, '').trim();
    potentialLabel = potentialLabel.replace(/<[^>]+>/g, ' ').trim();
    potentialLabel = potentialLabel.replace(/\\s\\s+/g, ' ').trim();

    let match = potentialLabel.match(/\\\[([^\\\[\\\]]+)\\]$/);
    if (match && match[1]) {
      return { name: match[1].trim(), isRootSyntax: false };
    }

    match = potentialLabel.match(/\\(\\(([^()]+)\\)\\)$/);
    if (match && match[1]) {
      return { name: match[1].trim(), isRootSyntax: false };
    }

    match = potentialLabel.match(/\\(([^()]+)\\)$/);
    if (match && match[1]) {
      return { name: match[1].trim(), isRootSyntax: false };
    }
    
    return { name: potentialLabel || "Unnamed Node", isRootSyntax: false };
  };
  
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
  levelMap.set(0, rootId);
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
    
    const indentation = line.match(/^(\s*)/)?.[1].length ?? 0;
    let parentId = rootId;
    let bestParentLevel = -1;
    console.log(`[MindMap] Processing line: "${line.substring(0,30)}..." Indentation: ${indentation}. Initial parentId: ${parentId}, levelMap: ${JSON.stringify(Array.from(levelMap.entries()))}`);
    levelMap.forEach((id, mapIndentation) => {
        console.log(`[MindMap]  -> Checking levelMap entry: id=${id}, mapIndentation=${mapIndentation}. Current bestParentLevel: ${bestParentLevel}`);
        if (indentation > mapIndentation && mapIndentation > bestParentLevel) {
            parentId = id;
            bestParentLevel = mapIndentation;
            console.log(`[MindMap]    ==> New parentId found: ${parentId} (was at mapIndentation ${mapIndentation})`);
        } else {
            console.log(`[MindMap]    ==> No change. indentation (${indentation}) > mapIndentation (${mapIndentation}) is ${indentation > mapIndentation}. mapIndentation (${mapIndentation}) > bestParentLevel (${bestParentLevel}) is ${mapIndentation > bestParentLevel}.`);
        }
    });
    
    const parentNode = nodes.find(n => n.id === parentId);
    const parentLevelNum = parentNode ? parentNode.level : 0;

    nodes.push({
      id: currentId,
      name: nodeName,
      group: parentLevelNum + 2,
      level: parentLevelNum + 1
    });
    links.push({ source: parentId, target: currentId });
    levelMap.set(indentation, currentId);
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
      console.log(`[MindMap] ${logContext}: Collapsing children of root (node '1' removed from set if present).`);
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
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
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
}) => {
  console.log('[MindMap] Component initialized with initialData:', initialData);
  
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [data, setData] = useState<MindMapData>(() => {
    console.log('[MindMap] Setting initial data state. initialData:', initialData);
    const result = initialData || getDefaultData();
    console.log('[MindMap] Initial data state result:', result);
    return result;
  });
  const [inputText, setInputText] = useState<string>("");
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const [generationTrigger, setGenerationTrigger] = useState<number>(0); // New state for triggering generation
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
    () => {
      console.log('[MindMap] Initializing collapsedNodes state. DefaultCollapsed prop:', defaultCollapsed, 'Initial data state:', data);
      // Force all nodes to be expanded initially for better user experience
      const initialCollapsed = new Set<string>();
      console.log('[MindMap] Initial collapsed set (forcing expanded):', initialCollapsed);
      return initialCollapsed;
    }
  );
  const loadInitiatedRef = useRef(false);
  const lastSavedValueRef = useRef<string | null>(null);

  const togglePopup = useCallback(() => {
    setIsPopupOpen(prev => {
      const newState = !prev;
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
        console.log('[MindMap] handleSetData: Incremental update, preserving collapsed/expanded state (no change to collapsedNodes from this function).');
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
  
  const actualGenerateFromInputTextHandler = useCallback(() => {
    // Now, this handler only updates the trigger.
    // The actual generation logic will move to a useEffect hook listening to this trigger.
    console.log('[MindMap] actualGenerateFromInputTextHandler: Setting generation trigger.');
    setGenerationTrigger(prev => prev + 1);
  }, []);

  // useEffect to handle mind map generation when inputText changes AND a generation is triggered.
  useEffect(() => {
    if (generationTrigger === 0) { // Don't run on initial mount or if not triggered
      console.log('[MindMap] Generation useEffect (main from inputText): Trigger is 0, skipping.');
      return;
    }

    console.log('[MindMap] Generation useEffect (main from inputText): Triggered. Generating from inputText:', inputText.substring(0,100) + "...");
    
    if (!inputText.trim()) {
        console.log('[MindMap] Generation useEffect (main from inputText): inputText is empty. Data state will be preserved unless explicitly cleared by user or other actions.');
        // If inputText is cleared, we might want to clear the data. 
        // This is a design choice. For now, let's assume if inputText is cleared, data is also cleared.
        // However, to prevent loops, this effect should *only* generate. Clearing should be a separate action.
        // For now, if input is empty, we effectively do nothing in terms of *generating new data*.
        // BUT, if there *was* old data, and input is cleared, the user probably expects the map to clear.
        // This scenario is tricky. Let's assume for now that clearing inputText means clearing the map data via this effect.
        // This will trigger handleSetData which will then correctly update collapsedNodes.
        handleSetData({ nodes: [], links: [] });
        console.log('[MindMap] Generation useEffect (main from inputText): inputText was empty, called handleSetData with empty data.');
        return;
    }

    const newGeneratedData = generateMindMapFromText(inputText);
    console.log('[MindMap] Generation useEffect (main from inputText): Generated new data, calling handleSetData.');
    handleSetData(newGeneratedData); 
    
    console.log('[MindMap] Generation useEffect (main from inputText): Processed.');

    // Dispatch resize after data is set and likely rendered
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      console.log('[MindMap] Resize event dispatched after Generation useEffect (main from inputText).');
    }, 100);
  }, [generationTrigger, inputText, handleSetData]); // CORE CHANGE: Simplified dependencies

  useEffect(() => {
    if (loadInitiatedRef.current) return;
    loadInitiatedRef.current = true;

    try {
      const savedContent = localStorage.getItem('mindmapContent');
      lastSavedValueRef.current = savedContent;
      if (savedContent) {
        console.log('[MindMap] Found saved content:', savedContent.substring(0, 50) + '...');
        const parsedContent = JSON.parse(savedContent);
        // Check if parsedContent has a 'data' field that is a string (old format)
        // or if it's directly a string, or an object (new format)
        let textToProcess: string;
        let mindMapDataToSet: MindMapData | null = null;

        if (parsedContent && typeof parsedContent.inputText === 'string' && parsedContent.data && typeof parsedContent.data === 'object') {
          // New format: { inputText: "...", data: { nodes: [], links: [] }, layout: "..." }
          textToProcess = parsedContent.inputText;
          mindMapDataToSet = parsedContent.data as MindMapData;
          if (parsedContent.layout) {
            setLayout(parsedContent.layout);
          }
        } else if (typeof parsedContent === 'string') {
           // Old format: just the text string
          textToProcess = parsedContent;
        } else if (parsedContent.data && typeof parsedContent.data === 'string') {
          // Old format: { data: "text string" }
          textToProcess = parsedContent.data;
        } else if (typeof parsedContent === 'object' && parsedContent.nodes && parsedContent.links) {
          // Might be just the MindMapData object directly
          textToProcess = JSON.stringify(parsedContent, null, 2); // Or some other serialization
          mindMapDataToSet = parsedContent as MindMapData;
        } else {
           console.warn('[MindMap] Unknown format in localStorage, falling back.');
          textToProcess = ""; // Fallback to empty
        }

        setInputText(textToProcess);
        if (mindMapDataToSet) {
          handleSetData(mindMapDataToSet);
          setCollapsedNodes(
            calculateDefaultCollapsedSet(mindMapDataToSet, defaultCollapsed, "localStorage load (direct data)")
          );
        } else if (textToProcess) {
          const generatedData = generateMindMapFromText(textToProcess);
          if (generatedData.nodes.length > 0) {
            handleSetData(generatedData);
            setCollapsedNodes(
              calculateDefaultCollapsedSet(generatedData, defaultCollapsed, "localStorage load (from text)")
            );
          }
        }
                      } else {
          console.log('[MindMap] No saved content found. Using initialData.');
          if (initialData && initialData.nodes && initialData.nodes.length > 0) {
            handleSetData(initialData);
            // Potentially serialize initialData to inputText if needed
            // setInputText(serializeMindMapToText(initialData)); 
            // Force all nodes to be expanded for better visibility
            setCollapsedNodes(new Set<string>());
            console.log('[MindMap] InitialData load: Forcing all nodes to be expanded');
          } else {
            handleSetData(getDefaultData());
            setInputText("");
            setCollapsedNodes(new Set<string>());
            console.log('[MindMap] Default data load: Forcing all nodes to be expanded');
          }
        }
    } catch (error) {
      console.error('[MindMap] Error loading saved content:', error);
      // Fallback to default if loading fails
      handleSetData(initialData || getDefaultData());
      setInputText("");
      // Force all nodes to be expanded even in error fallback
      setCollapsedNodes(new Set<string>());
      console.log('[MindMap] Error fallback: Forcing all nodes to be expanded');
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [initialData, defaultCollapsed, handleSetData]);

  // Effect to handle initialData changes after initial load
  useEffect(() => {
    if (!loadInitiatedRef.current) return; // Skip if initial load hasn't happened yet
    
    console.log('[MindMap] Effect: initialData changed after initial load. initialData:', initialData);
    console.log('[MindMap] Effect: initialData nodes count:', initialData?.nodes?.length);
    console.log('[MindMap] Effect: initialData links count:', initialData?.links?.length);
    
    if (initialData && initialData.nodes && initialData.nodes.length > 0) {
      console.log('[MindMap] Effect: Setting new initialData');
      handleSetData(initialData);
      // Force all nodes to be expanded for better visibility
      setCollapsedNodes(new Set<string>());
      console.log('[MindMap] Effect: Forcing all nodes to be expanded');
    }
  }, [initialData, defaultCollapsed, handleSetData]);

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
  }, [data, inputText, layout, collapsedNodes]);

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
          // Force all nodes to be expanded
          setCollapsedNodes(new Set<string>());
          console.log('[MindMap] Storage Event Cleared: Forcing all nodes to be expanded');
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
          // Force all nodes to be expanded
          setCollapsedNodes(new Set<string>());
          console.log('[MindMap] Storage Event Load: Forcing all nodes to be expanded');
          
          // Update generationTrigger to potentially reflect remote changes, if needed, or reset.
          // For now, let's ensure it doesn't cause an immediate re-generation unless inputText changed significantly.
          // setGenerationTrigger(prev => prev +1 ); // Or some other logic if needed
          console.log('[MindMap] Storage change: Applied to local state.');

        } catch (error) {
          console.error('[MindMap] Storage change: Error parsing new value from localStorage:', error);
          // Fallback to a safe state if parsing fails
          setData(getDefaultData());
          setInputText('');
          // Force all nodes to be expanded even in parse error fallback
          setCollapsedNodes(new Set<string>());
          console.log('[MindMap] Storage Event Parse Error: Forcing all nodes to be expanded');
        }
        // Update lastSavedValueRef AFTER processing the foreign change, 
        // so future saves by this instance are correctly managed.
        lastSavedValueRef.current = event.newValue; 
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => { window.removeEventListener('storage', handleStorageChange); };
  }, [defaultCollapsed, handleSetData, initialData]);

  return (
    <ReactFlowProvider>
      <PopupContainer isOpen={isPopupOpen}>
        <MindMapContent
          // Pass state and setters as props
          data={data}
          setData={handleSetData}
          inputText={inputText}
          setInputText={setInputText}
          layout={layout}
          onLayoutChange={handleLayoutChange}
          collapsedNodes={collapsedNodes}
          setCollapsedNodes={setCollapsedNodes}
          // Keep existing props
          isPopupOpen={isPopupOpen} 
          togglePopup={togglePopup}
          // Pass initialData for any specific initial use if MindMapContent still needs it,
          // though ideally it should rely on the `data` prop now.
          triggerGenerateFromText={actualGenerateFromInputTextHandler}
        />
      </PopupContainer>
    </ReactFlowProvider>
  );
};

export default MindMap;