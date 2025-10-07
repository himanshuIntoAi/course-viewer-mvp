"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

// Note: This component is now a simple, view-only wrapper around GraphRendererLR

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

// Popup/fullscreen removed for read-only viewer

// The main MindMap component now wraps MindMapContent with ReactFlowProvider
const MindMap: React.FC<MindMapProps> = ({ 
  initialData,
  defaultCollapsed = true,
}) => {
  const [data, setData] = useState<MindMapData>(() => initialData || getDefaultData());
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
    () => {
      console.log('[MindMap] Initializing collapsedNodes state. DefaultCollapsed prop:', defaultCollapsed, 'Initial data state:', data);
      const initialCollapsed = calculateDefaultCollapsedSet(data, defaultCollapsed, "MindMap initial state setup");
      console.log('[MindMap] Initial collapsed set:', initialCollapsed);
      return initialCollapsed;
    }
  );
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // popup/fullscreen disabled

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
        // Use setTimeout to break the update cycle and prevent infinite loops
        setTimeout(() => {
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
        }, 0);
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
  

  // No mermaid or text generation; data comes from props

  // No generation or localStorage usage

  // No localStorage persistence

  // No storage listeners

  // No history management

  return (
    <ReactFlowProvider>
      <MindMapContent
        data={data}
        setData={handleSetData}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        collapsedNodes={collapsedNodes}
        setCollapsedNodes={setCollapsedNodes}
        isPopupOpen={false}
        togglePopup={() => {}}
      />
    </ReactFlowProvider>
  );
};

export default MindMap;