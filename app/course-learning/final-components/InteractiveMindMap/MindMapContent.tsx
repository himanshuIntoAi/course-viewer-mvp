"use client";

import React, { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from "react";
import { Maximize2, ArrowLeftRight, ArrowUpDown, Sun, Moon } from "lucide-react";
import 'reactflow/dist/style.css';
import './MindMap.css';
import GraphRenderer from "./GraphRenderer";
import GraphRendererLR from "./GraphRendererLR";

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
  layout: "vertical" | "horizontal";
  onLayoutChange: (newLayout: "vertical" | "horizontal") => void;
  collapsedNodes: Set<string>;
  setCollapsedNodes: Dispatch<SetStateAction<Set<string>>>;
  isPopupOpen: boolean;
  togglePopup: () => void;
}


const MindMapContent: React.FC<MindMapContentProps> = ({ 
  data,
  setData,
  layout,
  onLayoutChange,
  collapsedNodes,
  setCollapsedNodes,
  isPopupOpen,
  togglePopup,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const [nodeColors] = useState<NodeColorMap>({});
  const [isCoreDataReady, setIsCoreDataReady] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  const componentMountedRef = useRef(true);
  const dataLoadedRef = useRef<boolean>(false);


  const handleNodeToggle = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const isCurrentlyCollapsed = prev.has(nodeId);
      const next = new Set(prev);
      
      if (isCurrentlyCollapsed) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      
      return next;
    });
  }, [setCollapsedNodes]);

  useEffect(() => {
    dataLoadedRef.current = data.nodes.length > 0;
  }, [data]);

  useEffect(() => {
    if (!isCoreDataReady) {
        setIsCoreDataReady(true);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    }
    return () => { componentMountedRef.current = false; };
  }, [isCoreDataReady]);




  const handleLayoutChange = useCallback((newLayout: "vertical" | "horizontal") => {
    if (layout === newLayout) return; 
    onLayoutChange(newLayout); 
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, [layout, onLayoutChange]);

  const handleThemeToggle = useCallback(() => {
    setIsDarkTheme(prev => !prev);
  }, []); 

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);
  
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setData(prev => { 
      const nodeToUpdate = prev.nodes.find(node => node.id === nodeId);
      if (nodeToUpdate && (nodeToUpdate.x !== position.x || nodeToUpdate.y !== position.y)) {
        return { ...prev, nodes: prev.nodes.map(node => node.id === nodeId ? { ...node, x: position.x, y: position.y } : node) };
      }
      return prev;
    });
  }, [setData]);

  const isLoading = false;


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
          <div style={{ padding: "8px", background: isDarkTheme ? "#1f2937" : "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-lg font-semibold" style={{ color: isDarkTheme ? "#ffffff" : "#1e40af" }}>Interactive Mind Map</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={handleThemeToggle} className="p-1 text-white rounded-md shadow-md" style={{ backgroundColor: isDarkTheme ? '#374151' : '#6b7280' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkTheme ? '#4b5563' : '#9ca3af')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDarkTheme ? '#374151' : '#6b7280')} title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}>
                {isDarkTheme ? <Sun size={16} color="white" /> : <Moon size={16} color="white" />}
              </button>
              <button onClick={() => handleLayoutChange(layout === "vertical" ? "horizontal" : "vertical")} className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-md" title={`Switch to ${layout === "vertical" ? "horizontal" : "vertical"} layout`} style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '120px', height: '30px' }}>{layout === "vertical" ? <><ArrowLeftRight size={16} color="white" /> Horizontal</> : <><ArrowUpDown size={16} color="white" /> Vertical</>}</button>
              <button onClick={togglePopup} className="p-2 text-white rounded-md shadow-md" style={{ backgroundColor: '#0d9488' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14b8a6')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0d9488')} title="Exit fullscreen"><Maximize2 size={20} color="white" /></button>
            </div>
          </div>
          <div ref={reactFlowWrapperRef} style={{ width: "100%", flexGrow: 1, position: "relative", overflow: "hidden", background: isDarkTheme ? "#111827" : "#f8fafc", touchAction: "none" }} className="reactflow-wrapper">
            {isLoading ? (<div style={{ padding: '20px', textAlign: 'center', color: isDarkTheme ? '#9ca3af' : '#666' }}>Initializing Mind Map...</div>) : (
              <div style={{ width: "100%", height: "100%" }}>
                {layout === "vertical" ? (
                  <GraphRenderer data={data} deleteNode={() => {}} onAddChildNode={() => {}} onUpdateNodeLabel={() => {}} onRequestSubtopics={async () => {}} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor="#4f46e5" nodeColors={nodeColors} linkMode={false} linkSource={null} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={() => {}} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={isDarkTheme ? "dark" : "light"} lineStyle="solid" lineCurveStyle="curved" lineColorMode="default" customLineColor={isDarkTheme ? "#6b7280" : "#CBD5E0"}
                  />
                ) : (
                  <GraphRendererLR data={data} deleteNode={() => {}} onAddChildNode={() => {}} onUpdateNodeLabel={() => {}} onRequestSubtopics={async () => {}} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor="#4f46e5" nodeColors={nodeColors} linkMode={false} linkSource={null} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={() => {}} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={isDarkTheme ? "dark" : "light"} lineStyle="solid" lineCurveStyle="curved" lineColorMode="default" customLineColor={isDarkTheme ? "#6b7280" : "#CBD5E0"}
                  />
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", width: "100%" }}>
            <span className="text-lg font-semibold" style={{ color: isDarkTheme ? "#ffffff" : "#1e40af" }}>Interactive Mind Map</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={handleThemeToggle} className="p-1 text-white rounded-md shadow-md" style={{ backgroundColor: isDarkTheme ? '#374151' : '#6b7280' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkTheme ? '#4b5563' : '#9ca3af')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDarkTheme ? '#374151' : '#6b7280')} title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}>
                {isDarkTheme ? <Sun size={16} color="white" /> : <Moon size={16} color="white" />}
              </button>
              <button onClick={() => handleLayoutChange(layout === "vertical" ? "horizontal" : "vertical")} className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-md" title={`Switch to ${layout === "vertical" ? "horizontal" : "vertical"} layout`} style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '120px', height: '30px' }}>{layout === "vertical" ? <><ArrowLeftRight size={16} color="white" /> Horizontal</> : <><ArrowUpDown size={16} color="white" /> Vertical</>}</button>
              <button onClick={togglePopup} className="p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 shadow-md" title="Open in fullscreen"><Maximize2 size={20} color="white" /></button>
            </div>
          </div>
          <div ref={reactFlowWrapperRef} style={{ width: "100%", flexGrow: 1, position: "relative", border: isDarkTheme ? "1px solid #374151" : "1px solid #E2E8F0", borderRadius: "4px", overflow: "hidden", background: isDarkTheme ? "#111827" : "#f8fafc", minHeight: "300px", touchAction: "none" }} className="reactflow-wrapper">
            {isLoading ? (<div style={{ padding: '20px', textAlign: 'center', color: isDarkTheme ? '#9ca3af' : '#666' }}>Initializing Mind Map...</div>) : (
              <div style={{ width: "100%", height: "100%" }}>
                {layout === "vertical" ? (
                  <GraphRenderer data={data} deleteNode={() => {}} onAddChildNode={() => {}} onUpdateNodeLabel={() => {}} onRequestSubtopics={async () => {}} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor="#4f46e5" nodeColors={nodeColors} linkMode={false} linkSource={null} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={() => {}} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={isDarkTheme ? "dark" : "light"} lineStyle="solid" lineCurveStyle="curved" lineColorMode="default" customLineColor={isDarkTheme ? "#6b7280" : "#CBD5E0"}
                  />
                ) : (
                  <GraphRendererLR data={data} deleteNode={() => {}} onAddChildNode={() => {}} onUpdateNodeLabel={() => {}} onRequestSubtopics={async () => {}} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} selectedColor="#4f46e5" nodeColors={nodeColors} linkMode={false} linkSource={null} controlsPosition="bottom-right" minimapPosition="top-right" onAddNodeOnEdgeDrop={() => {}} onNodePositionChange={handleNodePositionChange} collapsedNodes={collapsedNodes} onNodeToggle={handleNodeToggle} isParentInitialized={isCoreDataReady} isInPopupView={isPopupOpen} 
                    canvasTheme={isDarkTheme ? "dark" : "light"} lineStyle="solid" lineCurveStyle="curved" lineColorMode="default" customLineColor={isDarkTheme ? "#6b7280" : "#CBD5E0"}
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