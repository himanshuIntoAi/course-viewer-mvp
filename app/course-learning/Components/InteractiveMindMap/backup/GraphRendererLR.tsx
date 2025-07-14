"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Node,
  Edge,
  NodeProps,
  Connection,
  useReactFlow,
  OnInit,
  ControlButton,
  Background,
  ConnectionMode,
  BackgroundVariant,
} from 'reactflow';
import { Plus, Trash2, ChevronRight, ChevronDown, Wand2, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';
// import '@reactflow/node-resizer/dist/style.css'; // Ensure this is commented or removed
import 'reactflow/dist/style.css';

// Constants for viewport settings - REMOVE THESE if ROOT_ZOOM_LEVEL_LR and ROOT_NODE_PADDING_LR are used instead
// const ROOT_ZOOM_LEVEL = 0.8; 
// const ROOT_NODE_PADDING = 300;

// Global variable for line style that can be accessed by all components
let globalLineStyle: "solid" | "dashed" | "animated" | "dashed-arrow" = "solid";

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

interface CustomNodeProps extends NodeProps<NodeData> {
  _dummy?: never;
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    group: number;
    level?: number;
    x?: number;
    y?: number;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
}

interface GraphRendererProps {
  data: GraphData;
  deleteNode: (nodeId: string) => void;
  onAddChildNode: (parentId: string) => void;
  onUpdateNodeLabel: (nodeId: string, newLabel: string) => void;
  onRequestSubtopics?: (nodeId: string) => Promise<void>;
  controlsPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimapPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  selectedColor?: string;
  nodeColors?: { [nodeId: string]: string };
  linkMode?: boolean;
  linkSource?: string | null;
  onAddNodeOnEdgeDrop?: (sourceId: string, position: { x: number, y: number }) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number, y: number }) => void;
  onNodeToggle?: (nodeId: string) => void;
  collapsedNodes: Set<string>;
  isParentInitialized: boolean;
  isInPopupView?: boolean;
  canvasTheme?: "dark" | "light";
  lineStyle?: "solid" | "dashed" | "animated" | "dashed-arrow";
  lineCurveStyle?: "curved" | "straight";
  lineColorMode?: "default" | "random" | "custom";
  customLineColor?: string;
}

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: {
    pathColor?: string;
    style?: React.CSSProperties;
    isArrow?: boolean;
  };
}

interface NodePositionCache {
    id: string;
    position: { x: number; y: number };
    color: string;
}

// Function to generate a random color
const generateRandomColor = (): string => {
  const hue = Math.floor(Math.random() * 360); // Random hue
  const saturation = 60 + Math.random() * 20; // 60-80% saturation
  const lightness = 45 + Math.random() * 10; // 45-55% lightness
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Custom Node Component for Left-to-Right layout
const CustomNode: React.FC<CustomNodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const isRootNode = id === "1";
  const hasChildren = data.childCount > 0;
  const pathColor = data.pathColor || '#6C63FF';

  // Helper function for DoubleClick
  const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
    setEditValue(data.label);
  };

  // Helper function for KeyDown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      data.onNodeLabelChange(id, editValue);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(data.label);
    }
  };

  // Helper function for Blur
  const handleBlur = () => {
    if (editValue.trim() !== '') {
      data.onNodeLabelChange(id, editValue);
    } else {
      setEditValue(data.label);
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(data.label);
    }
  }, [data.label, isEditing]);

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: data.width || 'auto',
          height: data.height || 'auto'
        }}
        className="custom-node"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Target handle positioned in center */}
        <Handle 
          type="target" 
          position={Position.Left}
          style={{ 
            opacity: 0,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
          isConnectable={true}
        />
        
        {isRootNode ? (
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              minWidth: '150px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoFocus
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '0',
                  color: 'inherit'
                }}
              />
            ) : (
              <div 
                style={{ 
                  fontWeight: '600',
                  fontSize: '16px',
                  textAlign: 'center',
                  cursor: 'text',
                  color: '#2D3748',
                  width: '100%'
                }}
                onDoubleClick={handleDoubleClick}
              >
                {data.label}
              </div>
            )}
          </div>
        ) : (
          <div 
            style={{ 
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <div 
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#FFFFFF',
                border: `1px solid ${pathColor}`,
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'text',
                color: '#4A5568',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px', 
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                width: '100%',
                textAlign: 'center'
              }}
              onDoubleClick={handleDoubleClick}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    padding: '4px 0',
                    color: 'inherit',
                    width: '100%',
                    textAlign: 'center'
                  }}
                />
              ) : (
                <>
                  {data.label}
                  {hasChildren && !data.isExpanded && (
                    <span style={{
                      fontSize: '12px',
                      color: pathColor,
                      background: `${pathColor}10`,
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      marginLeft: '4px'
                    }}>
                      {data.childCount}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: isHovering ? 'auto' : 'none',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '6px',
          padding: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
          zIndex: 20
        }}>
          {hasChildren && (
            <button
              title={data.isExpanded ? "Collapse" : "Expand"}
              onClick={() => data.onToggle(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                padding: '0',
                color: pathColor,
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = `${pathColor}20`}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {data.isExpanded ? 
                <ChevronDown size={18} /> : 
                <ChevronRight size={18} />
              }
            </button>
          )}
          <button
            title="Add Child"
            onClick={() => data.onAddChild(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              padding: '0',
              color: pathColor,
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = `${pathColor}20`}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Plus size={18} />
          </button>
          
          {data.onRequestSubtopics && (
            <button
              title="Generate Subtopics with AI"
              onClick={() => data.onRequestSubtopics?.(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                padding: '0',
                color: '#8B5CF6',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Wand2 size={18} />
            </button>
          )}
          
          {!isRootNode && (
            <button
              title="Delete Node"
              onClick={() => data.onDelete(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                padding: '0',
                color: '#EF4444',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        
        {/* Source handle positioned in center */}
        <Handle 
          type="source" 
          position={Position.Right}
          style={{ 
            opacity: 0,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            right: '50%',
            top: '50%',
            transform: 'translate(50%, -50%)',
            zIndex: 10
          }}
          isConnectable={true}
        />
      </div>
    </>
  );
};

// Custom Edge with hover effect for centered connections
const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Move the arrow to the middle of the line
  const arrowX = sourceX + (targetX - sourceX) / 2;
  const arrowY = sourceY + (targetY - sourceY) / 2;
  
  // Create a gentle curved path that doesn't bulge too much
  // Use a smoother curve with better control point placement
  const path = `M ${sourceX} ${sourceY} C ${sourceX + (targetX - sourceX) * 0.3} ${sourceY}, ${targetX - (targetX - sourceX) * 0.3} ${targetY}, ${targetX} ${targetY}`;
  
  const pathColor = data?.pathColor || '#CBD5E0';
  const strokeWidth = isHovered ? 3 : 2;
  
  // Simplified arrow rendering with global line style check
  const showArrow = globalLineStyle === 'dashed-arrow';
  
  // Create a smaller arrow
  const ARROW_SIZE = 10;
  
  // Calculate the angle of the line
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  
  // Calculate points for a triangle
  const topY = arrowY - Math.sin(angle - Math.PI/4) * ARROW_SIZE;
  const topX = arrowX - Math.cos(angle - Math.PI/4) * ARROW_SIZE;
  
  const bottomY = arrowY - Math.sin(angle + Math.PI/4) * ARROW_SIZE;
  const bottomX = arrowX - Math.cos(angle + Math.PI/4) * ARROW_SIZE;
  
  const arrowPoints = `${arrowX},${arrowY} ${topX},${topY} ${bottomX},${bottomY}`;
  
  return (
    <>
      <path
        id={id}
        d={path}
        stroke={pathColor}
        strokeWidth={strokeWidth}
        fill="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          transition: 'all 0.2s ease',
          opacity: isHovered ? 1 : 0.8,
          strokeDasharray: data?.style?.strokeDasharray,
          animation: data?.style?.animation,
          ...data?.style
        }}
      />
      {(data?.isArrow || showArrow) && (
        <polygon 
          points={arrowPoints} 
          fill={pathColor} 
          stroke={pathColor} 
          strokeWidth="1"
        />
      )}
    </>
  );
};

// Add a new StraightEdge component for the straight line type (after the CustomEdge component around line 368)
const StraightEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const pathColor = data?.pathColor || '#CBD5E0';
  const strokeWidth = isHovered ? 3 : 2;
  
  // Simplified arrow rendering
  const showArrow = globalLineStyle === 'dashed-arrow';
  
  // Create a smaller arrow
  const ARROW_SIZE = 12;
  
  // Calculate the angle of the line
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  
  // Calculate the distance between source and target
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  
  // Position the arrow in the middle of the line
  const midPointX = sourceX + dx * 0.5;
  const midPointY = sourceY + dy * 0.5;
  
  // Update the path to include both segments - from source to midpoint and from midpoint to target
  const adjustedPath = `M ${sourceX} ${sourceY} L ${midPointX} ${midPointY} M ${midPointX} ${midPointY} L ${targetX} ${targetY}`;
  
  // Create arrow points with a direct approach, starting from the middle point
  const arrowPoints = `${midPointX},${midPointY} 
                     ${midPointX - Math.cos(angle - Math.PI/4) * ARROW_SIZE},${midPointY - Math.sin(angle - Math.PI/4) * ARROW_SIZE} 
                     ${midPointX - Math.cos(angle + Math.PI/4) * ARROW_SIZE},${midPointY - Math.sin(angle + Math.PI/4) * ARROW_SIZE}`;
  
  return (
    <>
      <path
        id={id}
        d={adjustedPath}
        stroke={pathColor}
        strokeWidth={strokeWidth}
        fill="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          strokeDasharray: data?.style?.strokeDasharray,
          animation: data?.style?.animation,
          transition: 'all 0.2s ease',
          opacity: isHovered ? 1 : 0.8,
          ...data?.style
        }}
      />
      {(data?.isArrow || showArrow) && (
        <polygon 
          points={arrowPoints} 
          fill={pathColor} 
          stroke={pathColor} 
          strokeWidth="1"
        />
      )}
    </>
  );
};

// Define the edge types for better readability
const edgeTypes = {
  custom: CustomEdge,
  straight: StraightEdge,
};

// Helper functions for layout calculation
const getChildNodes = (nodeId: string, allNodes: GraphData['nodes'], allLinks: GraphData['links']) => {
  return allLinks
    .filter(link => link.source === nodeId)
    .map(link => allNodes.find(n => n.id === link.target))
    .filter((node): node is GraphData['nodes'][0] => node !== undefined);
};

const getDescendants = (nodeId: string, nodes: GraphData['nodes'], links: GraphData['links']): Set<string> => {
  const descendants = new Set<string>();
  const stack = [nodeId];
  const visited = new Set<string>(); // Prevent infinite loops

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    const children = getChildNodes(current, nodes, links);
    children.forEach(child => {
      if (!descendants.has(child.id)) { 
        descendants.add(child.id);
        stack.push(child.id);
      }
    });
  }
  return descendants;
};

// Dynamic, centered mind map layout with fully recursive dynamic spacing and correct sibling spacing on collapse
const calculateNodePositions = (nodes: GraphData['nodes'], links: GraphData['links'], collapsedNodes: Set<string>) => {
  const nodePositions = new Map<string, { x: number; y: number }>();
  const BASE_HORIZONTAL_SPACING = 600;     // Further reduced horizontal spacing between levels
  const MIN_VERTICAL_SPACING = 40;         // Minimal vertical gap for collapsed siblings
  const NORMAL_VERTICAL_SPACING = 30;      // Reduced normal vertical spacing for simple siblings
  const EXPANDED_VERTICAL_SPACING = 60;    // Spacing for expanded nodes with large subtrees
  const COLLAPSED_SCALE_FACTOR = 0.2;      // Further reduced scale factor for collapsed nodes
  const ROOT_X = 0;                      // Root X starting position (changed from 100)

  if (!Array.isArray(nodes) || !Array.isArray(links)) {
    console.error("[GraphRenderer] Invalid nodes or links data.");
    return nodePositions;
  }

  // Map to store calculated node sizes (height occupied by each node and its visible subtree)
  const nodeSizes = new Map<string, number>();
  
  // Helper: get children of a node (all, not just visible)
  const getAllChildren = (nodeId: string): string[] => {
    return links
      .filter(link => link.source === nodeId)
      .map(link => link.target)
      .filter(childId => nodes.find(n => n.id === childId));
  };
  
  // Helper: get children of a node (visible only)
  const getVisibleChildren = (nodeId: string): string[] => {
    if (collapsedNodes.has(nodeId)) return [];
    return getAllChildren(nodeId);
  };

  // Helper: determine the depth of a subtree (how many levels deep)
  const getSubtreeDepth = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId) || collapsedNodes.has(nodeId)) return 0;
    visited.add(nodeId);
    
    const children = getVisibleChildren(nodeId);
    if (children.length === 0) return 0;
    
    let maxChildDepth = 0;
    for (const childId of children) {
      const childDepth = getSubtreeDepth(childId, visited);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
    
    return 1 + maxChildDepth;
  };

  // Get the siblings count for a node
  const getSiblingCount = (nodeId: string): number => {
    const parentLinks = links.filter(link => link.target === nodeId);
    if (parentLinks.length === 0) return 0;
    
    const parentId = parentLinks[0].source;
    return links.filter(link => link.source === parentId).length;
  };
  
  // Get total number of descendants that would be visible if this node was expanded
  const getPotentialVisibleDescendants = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    
    const children = getAllChildren(nodeId);
    if (children.length === 0) return 0;
    
    let totalDescendants = children.length;
    for (const childId of children) {
      if (!collapsedNodes.has(childId)) {
        totalDescendants += getPotentialVisibleDescendants(childId, visited);
      }
    }
    
    return totalDescendants;
  };
  
  // Phase 1: Compute the size (height) required for each subtree
  const computeSubtreeSize = (nodeId: string): number => {
    // Base case - leaf node
    const children = getVisibleChildren(nodeId);
    if (children.length === 0) return 1;
    
    // Recursively compute sizes for all children
    const childSizes = children.map(childId => computeSubtreeSize(childId));
    const totalChildSize = childSizes.reduce((sum, size) => sum + size, 0);
    
    // Dynamic spacing multiplier based on various factors
    const subtreeDepth = getSubtreeDepth(nodeId);
    const siblingCount = getSiblingCount(nodeId);
    const potentialDescendants = getPotentialVisibleDescendants(nodeId);
    
    let spacingMultiplier;
    
    if (subtreeDepth > 2) {
      // Very deep subtrees need more space
      spacingMultiplier = 1.8;
    } else if (subtreeDepth > 1) {
      // Moderately deep subtrees
      spacingMultiplier = 1.3;
    } else if (children.some(child => !collapsedNodes.has(child) && getVisibleChildren(child).length > 0)) {
      // Has expanded children with their own children
      spacingMultiplier = 1.0;
    } else if (children.some(child => !collapsedNodes.has(child))) {
      // Has expanded children but they're leaf nodes
      spacingMultiplier = 0.8;
    } else if (potentialDescendants > 10) {
      // Has many potential descendants (if expanded)
      spacingMultiplier = 0.6;
    } else if (siblingCount > 5) {
      // Many collapsed siblings
      spacingMultiplier = 0.4;
    } else {
      // Few collapsed siblings - most compact
      spacingMultiplier = 0.3;
    }
    
    // Adjustment for nodes that have a lot of direct children
    if (children.length > 5) {
      spacingMultiplier *= 1.2;
    }
    
    const spacing = Math.max(1, children.length - 1) * spacingMultiplier;
    
    // Store in map for future reference
    const size = Math.max(1, totalChildSize + spacing);
    nodeSizes.set(nodeId, size);
    return size;
  };
  
  // Compute sizes for all nodes starting with the root
  const rootId = '1';
  computeSubtreeSize(rootId);

  // Phase 2: Position all nodes based on computed sizes
  const positionSubtree = (nodeId: string, x: number, y: number): { top: number, bottom: number } => {
    // Add deterministic offset based on node ID instead of random values
    const getNodeOffset = (id: string) => {
      const idSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return {
        x: ((idSum % 5) - 2) * 0.5, // Range of -1 to 1
        y: ((idSum % 7) - 3) * 0.4  // Range of -1.2 to 1.2
      };
    };

    const offset = getNodeOffset(nodeId);
    nodePositions.set(nodeId, { 
      x: x + offset.x, 
      y: y + offset.y 
    });
    
    // Get all visible children
    const children = getVisibleChildren(nodeId);
    if (children.length === 0) {
      // Leaf node - just return its extent
      return { top: y - MIN_VERTICAL_SPACING/2, bottom: y + MIN_VERTICAL_SPACING/2 };
    }
    
    // Determine the total height needed for all children
    let totalSize = 0;
    const childSizes: number[] = [];
    
    for (const childId of children) {
      // Use a smaller size for collapsed nodes
      let size = nodeSizes.get(childId) || 1;
      if (collapsedNodes.has(childId)) {
        size *= COLLAPSED_SCALE_FACTOR; // Reduce size for collapsed nodes
      }
      childSizes.push(size);
      totalSize += size;
    }
    
    // Calculate appropriate spacing between siblings
    const spacingMap: Record<string, number> = {};
    let totalSpacingHeight = 0;
    
    for (let i = 0; i < children.length - 1; i++) {
      const currentChild = children[i];
      const nextChild = children[i+1];
      
      // Determine appropriate spacing between these two siblings
      let siblingSpacing: number;
      
      // Both current and next are collapsed
      if (collapsedNodes.has(currentChild) && collapsedNodes.has(nextChild)) {
        siblingSpacing = MIN_VERTICAL_SPACING; // Minimal spacing between collapsed siblings
      } 
      // Either has deep subtrees - needs more space
      else if (getSubtreeDepth(currentChild) > 1 || getSubtreeDepth(nextChild) > 1) {
        siblingSpacing = EXPANDED_VERTICAL_SPACING; // More space for deep subtrees
      }
      // One is collapsed but the other has potential for expansion
      else if ((collapsedNodes.has(currentChild) && getPotentialVisibleDescendants(nextChild) > 3) || 
               (collapsedNodes.has(nextChild) && getPotentialVisibleDescendants(currentChild) > 3)) {
        siblingSpacing = NORMAL_VERTICAL_SPACING * 0.7; // Medium spacing for mixed collapse/expand with potential
      }
      // One is collapsed but the other is a simple node
      else if (collapsedNodes.has(currentChild) || collapsedNodes.has(nextChild)) {
        siblingSpacing = NORMAL_VERTICAL_SPACING * 0.5; // Slightly more than minimum
      }
      // Both are expanded but are simple nodes
      else {
        siblingSpacing = NORMAL_VERTICAL_SPACING; // Normal spacing for simple siblings
      }
      
      spacingMap[`${currentChild}-${nextChild}`] = siblingSpacing;
      totalSpacingHeight += siblingSpacing;
    }
    
    // Total vertical space needed (with dynamic scale adjustment for compactness)
    const compactnessFactor = children.length > 10 ? 0.7 : 
                               children.length > 5 ? 0.8 : 
                               children.length > 2 ? 0.9 : 1.0;
    
    const totalHeight = (totalSize * NORMAL_VERTICAL_SPACING + totalSpacingHeight) * compactnessFactor;
    
    // Start position - align to center the entire subtree around the parent
    let currentY = y - totalHeight / 2;
    
    // Bounds of this subtree
    let subtreeTop = y;
    let subtreeBottom = y;
    
    // Position each child
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      const childSize = childSizes[i];
      
      // Calculate child vertical center
      const childHeight = childSize * NORMAL_VERTICAL_SPACING;
      const childY = currentY + childHeight / 2;
      
      // Position the child and its subtree
      const childX = x + BASE_HORIZONTAL_SPACING * (collapsedNodes.has(childId) ? 0.7 : 1);
      const { top, bottom } = positionSubtree(childId, childX, childY);
      
      // Update subtree bounds
      subtreeTop = Math.min(subtreeTop, top);
      subtreeBottom = Math.max(subtreeBottom, bottom);
      
      // Move to next sibling position
      currentY += childHeight;
      
      // Add spacing to the next sibling if any
      if (i < children.length - 1) {
        const nextChild = children[i+1];
        const spacing = spacingMap[`${childId}-${nextChild}`] || NORMAL_VERTICAL_SPACING;
        currentY += spacing;
      }
    }
    
    return { top: subtreeTop, bottom: subtreeBottom };
  };
  
  // Start the positioning with the root node
  if (nodes.length > 0) {
    // Position the entire tree
    positionSubtree(rootId, ROOT_X, 0);
  }

  return nodePositions;
};

// Main GraphRendererLR component
const GraphRendererLR: React.FC<GraphRendererProps> = ({ 
  data, 
  deleteNode, 
  onAddChildNode,
  onUpdateNodeLabel,
  onRequestSubtopics,
  controlsPosition = 'bottom-right',
  minimapPosition = 'top-right',
  onNodeSelect,
  selectedNodeId,
  selectedColor,
  nodeColors,
  linkMode,
  linkSource,
  onAddNodeOnEdgeDrop,
  onNodePositionChange,
  onNodeToggle,
  collapsedNodes,
  isParentInitialized,
  isInPopupView,
  canvasTheme = "dark",
  lineStyle = "solid",
  lineCurveStyle = "curved",
  lineColorMode = "default",
  customLineColor = "#CBD5E0",
}) => {
  // Update the global lineStyle
  globalLineStyle = lineStyle;

  const graphData = data;
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<{ pathColor: string; style?: React.CSSProperties; }>[]>([]);
  const reactFlowInstance = useReactFlow<NodeData, Edge<{ pathColor: string; style?: React.CSSProperties; }>>();
  const [isReadyToFit, setIsReadyToFit] = useState(false);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const isInitialRender = useRef(true);
  
  const nodePositionsRef = useRef<NodePositionCache[]>([]);

  const callbacksRef = useRef({
    deleteNode,
    toggleNode: (id: string) => {
      console.log(`[GraphRendererLR] Toggle requested for node: ${id}`);
      setUserInteracted(false);
      isInitialRender.current = false;

      if (onNodeToggle) {
        console.log(`[GraphRendererLR] Notifying parent about toggle for node: ${id}`);
        onNodeToggle(id);
      }
    },
    addChildNode: onAddChildNode,
    handleNodeLabelChange: onUpdateNodeLabel,
  });

  useEffect(() => {
    callbacksRef.current.deleteNode = deleteNode;
    callbacksRef.current.addChildNode = onAddChildNode;
    callbacksRef.current.handleNodeLabelChange = onUpdateNodeLabel;
  }, [deleteNode, onAddChildNode, onUpdateNodeLabel]);

  const getDescendantsForCurrentData = useCallback((nodeId: string) => {
    return getDescendants(nodeId, graphData.nodes, graphData.links);
  }, [graphData.nodes, graphData.links]);

  const handleContextMenuClose = useCallback(() => setContextMenu(null), []);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; nodeId?: string; } | null>(null);
  const handleContextMenu = useCallback((event: React.MouseEvent) => { event.preventDefault(); event.stopPropagation(); const targetElement = event.target as Element; const nodeIdElement = targetElement.closest('.react-flow__node')?.getAttribute('data-id'); setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, nodeId: nodeIdElement || undefined }); }, []);
  const handleAddNodeViaContextMenu = useCallback(() => {
    if (contextMenu) {
      if (contextMenu.nodeId) {
        callbacksRef.current.addChildNode?.(contextMenu.nodeId);
      } else {
        const rootNode = nodes.find(n => n.id === "1");
        if (rootNode) callbacksRef.current.addChildNode?.(rootNode.id);
      }
    }
    handleContextMenuClose();
  }, [contextMenu, nodes, handleContextMenuClose]);

  const downloadImage = useCallback(() => {
    if (reactFlowInstance && reactFlowWrapperRef.current) {
      handleContextMenuClose();
      reactFlowInstance.fitView({ padding: 0.2 });
      setTimeout(() => {
        if (reactFlowWrapperRef.current) {
          toPng(reactFlowWrapperRef.current, { 
            backgroundColor: '#ffffff',
            pixelRatio: 4
          })
            .then((dataUrl: string) => { 
              const link = document.createElement('a'); 
              link.download = 'mindmap_lr.png'; 
              link.href = dataUrl; 
              link.click(); 
            })
            .catch((err: Error) => console.error("Error downloading image:", err));
        }
      }, 500); // Increased from 300ms to 500ms
    }
  }, [handleContextMenuClose, reactFlowInstance]);

  // Main useEffect for node and edge updates
  useEffect(() => {
    // Wait for parent to signal readiness
    if (!isParentInitialized) {
      console.log('[GraphRendererLR] Parent not initialized, waiting...');
      setNodes([]); // Clear nodes if parent is not ready
      setEdges([]); // Clear edges if parent is not ready
      nodePositionsRef.current = [];
      isInitialRender.current = true; // Reset initial render flag if parent becomes unready
      return;
    }

    console.log('[GraphRendererLR] Parent is initialized. Processing graph data.');

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) { 
      console.log('[GraphRendererLR] No graph data or nodes, clearing view.');
      setNodes([]);
      setEdges([]);
      nodePositionsRef.current = [];
      isInitialRender.current = true;
      return;
    }

    // Always calculate positions for all nodes when graphData or collapsedNodes changes.
    // This ensures fresh layout akin to resetLayout.
    console.log('[GraphRendererLR] Main useEffect: Recalculating all node positions due to graphData or collapsedNodes change.');
    const calculatedPositions = calculateNodePositions(graphData.nodes, graphData.links, collapsedNodes);
    
    const tempGeneratedColors = new Map<string, string>(); // For new nodes or nodes needing a color
    const reactFlowNodes: Node[] = [];
    const newPositionCache: NodePositionCache[] = [];

    graphData.nodes.forEach((node) => {
      let isVisible = true;
      // Determine visibility based on the current collapsedNodes set
      for (const collapsedId of collapsedNodes) {
        if (getDescendantsForCurrentData(collapsedId).has(node.id)) {
          isVisible = false;
          break;
        }
      }

      if (isVisible) {
        // Use the freshly calculated position for this node
        const position = calculatedPositions.get(node.id) || { x: 0, y: 0 };

        if (onNodePositionChange) {
          // Notify parent of position, though MindMap.tsx doesn't seem to store these for LR
          onNodePositionChange(node.id, position);
        }

        const childNodes = getChildNodes(node.id, graphData.nodes, graphData.links);
        
        // Color Management:
        // 1. Selected color (if current node is selected)
        // 2. Cached color from previous renders (nodePositionsRef.current)
        // 3. Newly generated color (if no cached color)
        const existingCachedNode = nodePositionsRef.current.find(cn => cn.id === node.id);
        let pathColor = selectedNodeId === node.id && selectedColor 
                        ? selectedColor 
                        : existingCachedNode?.color;

        if (!pathColor) { // If no color from selection or persistent cache
          pathColor = tempGeneratedColors.get(node.id); // Check if generated in this pass (e.g. for a truly new node)
          if (!pathColor) {
            pathColor = generateRandomColor();
            tempGeneratedColors.set(node.id, pathColor); // Cache for this render pass
          }
        }
                        
        reactFlowNodes.push({
          id: node.id,
          position, // Use the new, authoritative position
          type: 'custom',
          data: {
            label: node.name,
            group: node.group,
            onDelete: callbacksRef.current.deleteNode,
            onToggle: callbacksRef.current.toggleNode,
            onAddChild: callbacksRef.current.addChildNode,
            onNodeLabelChange: callbacksRef.current.handleNodeLabelChange,
            isExpanded: !collapsedNodes.has(node.id), // Reflect current collapse state
            childCount: childNodes.length,
            pathColor,
            onRequestSubtopics: onRequestSubtopics ? () => onRequestSubtopics(node.id) : undefined
          }
        });
        newPositionCache.push({ id: node.id, position, color: pathColor });
      }
    });

    // Update the persistent cache with the latest positions and colors
    nodePositionsRef.current = newPositionCache;
    
    setNodes(reactFlowNodes);

    const reactFlowEdges: Edge[] = graphData.links
      .filter(link => reactFlowNodes.some(n => n.id === link.source) && reactFlowNodes.some(n => n.id === link.target))
      .map(link => {
        const sourceNode = reactFlowNodes.find(n => n.id === link.source);
        const pc = lineColorMode === "random" ? generateRandomColor() :
                   lineColorMode === "custom" ? customLineColor :
                   (sourceNode?.data as NodeData)?.pathColor || generateRandomColor();
        
        // Set consistent stroke width regardless of line type
        const edgeBase: Edge = {
          id: `edge-${link.source}-${link.target}`,
          source: link.source,
          target: link.target,
          type: lineCurveStyle === 'straight' ? 'straight' : 'custom',
          animated: lineStyle === 'animated',
          style: {
            stroke: pc,
            strokeOpacity: 0.8,
            strokeWidth: 2,
            strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
          },
          data: { 
            pathColor: pc,
            style: {
              stroke: pc,
              strokeOpacity: 0.8,
              strokeWidth: 2,
              strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
              animation: lineStyle === 'animated' ? 'dashdraw 0.5s linear infinite' : undefined,
            }
          }
        };

        // Add isArrow flag for dashed-arrow style
        if (lineStyle === 'dashed-arrow') {
          edgeBase.className = 'dashed-arrow-edge';
          
          // Ensure style object exists
          if (!edgeBase.style) {
            edgeBase.style = {};
          }
          // Explicitly set all needed styles
          edgeBase.style.stroke = pc;
          edgeBase.style.strokeWidth = 2;
          edgeBase.style.strokeDasharray = '5,5';
          
          // Set isArrow flag for our custom edge component
          if (!edgeBase.data) {
            edgeBase.data = { pathColor: pc };
          }
          edgeBase.data.isArrow = true;
        }
        
        return edgeBase;
      });
    setEdges(reactFlowEdges);

    // FitView logic (remains the same):
    // Handles initial render and subsequent programmatic updates (like node toggle)
    // when the user hasn't manually interacted with the viewport.
    if (reactFlowNodes.length > 0) {
      if (isInitialRender.current && !userInteracted) {
        // Fit view on initial load - schedule setIsReadyToFit synchronously
        console.log('[GraphRendererLR] Main useEffect: Scheduling initial fitView (synchronous setIsReadyToFit)');
        setIsReadyToFit(true);
      } else if (!isInitialRender.current && !userInteracted) {
        // Fit view after a programmatic update (e.g., node toggle)
        console.log('[GraphRendererLR] Main useEffect: Scheduling fitView after programmatic update (e.g., toggle) (50ms delay for setIsReadyToFit)');
        setTimeout(() => {
          setIsReadyToFit(true);
        }, 50); // Small delay before triggering the fitView effect
      }
    }
  }, [
    graphData,
    collapsedNodes,
    getDescendantsForCurrentData,
    onRequestSubtopics,
    selectedNodeId,
    selectedColor,
    setNodes,
    setEdges,
    onNodePositionChange,
    reactFlowInstance,
    userInteracted,
    isParentInitialized,
    lineStyle,
    lineCurveStyle,
    lineColorMode,
    customLineColor
  ] as [
    GraphData, 
    Set<string>, 
    (nodeId: string) => Set<string>, 
    ((nodeId: string) => Promise<void>) | undefined, 
    string | null | undefined, 
    string | undefined, 
    React.Dispatch<React.SetStateAction<Node<NodeData, string | undefined>[]>>, 
    React.Dispatch<React.SetStateAction<Edge<{ pathColor: string; style?: React.CSSProperties; }>[]>>,
    ((nodeId: string, position: { x: number, y: number }) => void) | undefined, 
    ReturnType<typeof useReactFlow<NodeData, Edge<{ pathColor: string; style?: React.CSSProperties; }>>>,
    boolean, 
    boolean, 
    string | undefined, 
    string | undefined, 
    string | undefined, 
    string | undefined 
  ]);

  const onNodeDragStop = useCallback((event: React.MouseEvent, draggedNode: Node) => {
    const newPosition = { ...draggedNode.position };
    const index = nodePositionsRef.current.findIndex(n => n.id === draggedNode.id);
    const pathColor = (draggedNode.data as NodeData).pathColor || generateRandomColor();
    if (index >= 0) { nodePositionsRef.current[index].position = newPosition; nodePositionsRef.current[index].color = pathColor; } 
    else { nodePositionsRef.current.push({ id: draggedNode.id, position: newPosition, color: pathColor }); }
    setNodes(nds => nds.map(n => (n.id === draggedNode.id ? { ...n, position: newPosition } : n)));
    if (onNodePositionChange) onNodePositionChange(draggedNode.id, newPosition);
    setUserInteracted(true); return false;
  }, [setNodes, setUserInteracted, onNodePositionChange]);

  const resetLayout = useCallback(() => {
    if (reactFlowInstance && graphData.nodes.length > 0) {
      console.log("[GraphRendererLR] Resetting layout...");
      nodePositionsRef.current = []; 
      setUserInteracted(false); 
      isInitialRender.current = true; 

      const newPositionsMap = calculateNodePositions(graphData.nodes, graphData.links, collapsedNodes);
      const newColorsMap = new Map<string, string>();
      graphData.nodes.forEach(n => {
        const color = (nodeColors && nodeColors[n.id]) || generateRandomColor();
        newColorsMap.set(n.id, color);
      });
        
      const updatedReactFlowNodes = graphData.nodes.map(gn => {
        const position = newPositionsMap.get(gn.id) || { x: 0, y: 0 };
        const pathColor = newColorsMap.get(gn.id) || generateRandomColor();
        const childNodes = getChildNodes(gn.id, graphData.nodes, graphData.links);
          
        if (onNodePositionChange) {
          onNodePositionChange(gn.id, position);
        }

        return {
          id: gn.id,
          position,
          type: 'custom' as const,
            data: { 
            label: gn.name,
            group: gn.group,
              onDelete: (id: string) => callbacksRef.current.deleteNode(id),
            onToggle: (id: string) => callbacksRef.current.toggleNode(id),
              onAddChild: (id: string) => callbacksRef.current.addChildNode?.(id),
            onNodeLabelChange: (id: string, newLabel: string) => callbacksRef.current.handleNodeLabelChange?.(id, newLabel),
            isExpanded: !collapsedNodes.has(gn.id),
            childCount: childNodes.length,
              pathColor,
            onRequestSubtopics: onRequestSubtopics ? (id: string) => onRequestSubtopics(id) : undefined,
          },
        };
      }).filter(node => {
      let isVisible = true;
      for (const collapsedId of collapsedNodes) {
         if (getDescendantsForCurrentData(collapsedId).has(node.id)) {
            isVisible = false;
            break;
         }
      }
        return isVisible;
      });

      nodePositionsRef.current = updatedReactFlowNodes.map(n => ({ id: n.id, position: n.position, color: (n.data as NodeData).pathColor! }));
      setNodes(updatedReactFlowNodes as Node[]);
      const rfEdges: Edge[] = graphData.links
        .filter(l => updatedReactFlowNodes.some(n => n.id === l.source) && updatedReactFlowNodes.some(n => n.id === l.target))
        .map(l => { 
          const sn = updatedReactFlowNodes.find(n => n.id === l.source); 
          let pc = lineColorMode === "random" ? generateRandomColor() :
                     lineColorMode === "custom" ? customLineColor :
                     (sn?.data as NodeData)?.pathColor || generateRandomColor(); 
          
          if (sn && sn.data && typeof sn.data === 'object') {
            const nodeData = sn.data as Record<string, unknown>;
            if ('pathColor' in nodeData && typeof nodeData.pathColor === 'string') {
              pc = nodeData.pathColor;
            }
          }

          const edgeBaseReset: Edge = {
            id: `edge-${l.source}-${l.target}`,
            source: l.source,
            target: l.target,
            type: lineCurveStyle === 'straight' ? 'straight' : 'custom',
            animated: lineStyle === 'animated',
            style: { 
              stroke: pc, 
              strokeOpacity: 0.8, 
              strokeWidth: 2,
              strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
            },
            data: { 
              pathColor: pc,
              style: {
                stroke: pc,
                strokeOpacity: 0.8,
                strokeWidth: 2,
                strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
                animation: lineStyle === 'animated' ? 'dashdraw 0.5s linear infinite' : undefined,
              }
            }
          };

        // Add isArrow flag for dashed-arrow style
        if (lineStyle === 'dashed-arrow') {
          edgeBaseReset.className = 'dashed-arrow-edge';
          
          // Ensure style object exists
          if (!edgeBaseReset.style) {
            edgeBaseReset.style = {};
          }
          // Explicitly set all needed styles
          edgeBaseReset.style.stroke = pc;
          edgeBaseReset.style.strokeWidth = 2;
          edgeBaseReset.style.strokeDasharray = '5,5';
          
          // Set isArrow flag for our custom edge component
          if (!edgeBaseReset.data) {
            edgeBaseReset.data = { pathColor: pc };
          }
          edgeBaseReset.data.isArrow = true;
          
          // Log for debugging
          console.log('LR Reset: Created dashed-arrow edge with isArrow=true:', edgeBaseReset);
        }

        return edgeBaseReset;
      });
      setEdges(rfEdges);
        setIsReadyToFit(true);
    }
  }, [graphData, reactFlowInstance, collapsedNodes, onNodePositionChange, onRequestSubtopics, nodeColors, getDescendantsForCurrentData, setEdges, setNodes, lineStyle, lineCurveStyle, lineColorMode, customLineColor]);

  const onMove = useCallback(() => {
    if (!userInteracted && !isInitialRender.current) {
      console.log("[GraphRendererLR] User manually changed viewport");
      setUserInteracted(true);
    }
  }, [userInteracted]);

  const onConnect = useCallback((params: Connection) => {
    const newEdgeColor = selectedColor || generateRandomColor();
    const edgeType = lineCurveStyle === 'straight' ? 'straight' : 'custom';
    const animated = lineStyle === 'animated';
    const edgeData: { pathColor: string, style?: React.CSSProperties } = { 
      pathColor: newEdgeColor,
      style: {
        stroke: newEdgeColor, 
        strokeOpacity: 0.8, 
        strokeWidth: 2,
        strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
        animation: lineStyle === 'animated' ? 'dashdraw 0.5s linear infinite' : undefined,
      }
    };
    const edgeStyle: React.CSSProperties = { 
      stroke: newEdgeColor, 
      strokeOpacity: 0.8, 
      strokeWidth: 2,
      strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
    };
    
    // Create the marker end for arrow with explicit dimensions
    const markerEnd = lineStyle === 'dashed-arrow' ? 'url(#custom-arrow)' : undefined;

    setEdges((eds) => addEdge({ 
      ...params, 
      type: edgeType, 
      animated, 
      style: edgeStyle, 
      data: edgeData, 
      markerEnd 
    }, eds));
  }, [selectedColor, setEdges, lineStyle, lineCurveStyle]);

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    const edgeType = lineCurveStyle === 'straight' ? 'straight' : 'custom';
    const animated = lineStyle === 'animated';
    const pathColor = oldEdge.data?.pathColor || generateRandomColor();
    
    // Create the marker end for arrow with explicit dimensions
    const marker = lineStyle === 'dashed-arrow' ? 'url(#custom-arrow)' : undefined;

    const newEdgeData = { 
      ...oldEdge.data, 
      pathColor,
      style: {
        stroke: pathColor,
        strokeOpacity: 0.8,
        strokeWidth: 2,
        strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
        animation: lineStyle === 'animated' ? 'dashdraw 0.5s linear infinite' : undefined,
      }
    };
    
    const newEdgeStyle: React.CSSProperties = {
      stroke: pathColor,
      strokeOpacity: 0.8,
      strokeWidth: 2,
      strokeDasharray: lineStyle === 'dashed' || lineStyle === 'dashed-arrow' ? '5,5' : undefined,
    };

    setEdges((els) => addEdge({ 
      ...oldEdge, 
      ...newConnection, 
      type: edgeType, 
      animated, 
      style: newEdgeStyle, 
      data: newEdgeData, 
      markerEnd: marker 
    }, els.filter(e => e.id !== oldEdge.id)));
  }, [setEdges, lineCurveStyle, lineStyle]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (onAddNodeOnEdgeDrop) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        const position = { x: (sourceNode.position.x + targetNode.position.x) / 2, y: (sourceNode.position.y + targetNode.position.y) / 2 };
        onAddNodeOnEdgeDrop(edge.source, position);
      } else {
         console.warn("[GraphRendererLR] Could not find source/target for edge click to add node.");
      }
          } else {
      console.log(`[GraphRendererLR] Edge clicked: ${edge.id}. No onAddNodeOnEdgeDrop handler provided.`);
          }
  }, [nodes, onAddNodeOnEdgeDrop]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => { 
    if (linkMode && linkSource && selectedNodeId === linkSource) {
      if (onNodeSelect) onNodeSelect(node.id); 
    } else if (onNodeSelect) { 
      onNodeSelect(node.id); 
    }
  }, [linkMode, linkSource, onNodeSelect, selectedNodeId]);

  const onInit: OnInit = () => { console.log('[GraphRendererLR] ReactFlow initialized.'); };
  const nodeTypes = useMemo(() => ({ custom: CustomNode as React.ComponentType<NodeProps<NodeData>> }), []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-minimap-wrapper .react-flow__minimap {
        padding: 0 !important;
        margin: 0 !important;
      }
      .custom-minimap-wrapper .react-flow__minimap-mask {
        fill: rgba(220, 220, 220, 0.3) !important;
      }
      .react-flow__attribution {
        display: none !important;
      }
      @keyframes dashdraw {
        to {
          stroke-dashoffset: -10;
        }
      }
      
      /* Strong override for dashed-arrow edges */
      .react-flow__edge.dashed-arrow-edge .react-flow__edge-path {
        stroke-dasharray: 5,5 !important;
      }
      
      /* Make the edge arrows more visible */
      .react-flow__edge polygon {
        z-index: 1000 !important;
        stroke-width: 1px !important;
        pointer-events: none !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Ensure all edges are visible */
      .react-flow__edge {
        z-index: 100 !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      .react-flow__edge-path {
        stroke-width: 2;
      }
      .react-flow__edge.selected .react-flow__edge-path {
        stroke-width: 3;
      }
      .react-flow__edge-text {
        font-size: 10px;
      }
      .react-flow__edge-textbg {
        fill: white;
      }
      .react-flow__edge.straight .react-flow__edge-path {
        stroke-width: 2 !important;
      }
      .react-flow__edge.animated path {
        stroke-dasharray: 5;
        animation: dashdraw 0.5s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    if (isReadyToFit && reactFlowInstance && nodes.length > 0 && isParentInitialized) { // Ensure parent is initialized
      if (userInteracted && !isInitialRender.current) {
        setIsReadyToFit(false);
        return;
      }
      
      // Use a consistent delay now that parent readiness is handled
      const fitViewDelay = 550; 
      console.log(`[GraphRendererLR] FitView effect: Triggering fitView with delay: ${fitViewDelay}ms. isInitialRender: ${isInitialRender.current}`);

      setTimeout(() => {
        try {
          if (nodes.length === 0 || !reactFlowWrapperRef.current) { // Added ref check
            setIsReadyToFit(false);
            return;
          }
          reactFlowInstance.fitView({
            padding: 0.5,
            duration: 800, 
            includeHiddenNodes: false
          });
          // isInitialRender.current should only be set to false *if* this was an initial render
          if (isInitialRender.current) {
            isInitialRender.current = false;
          }
        } catch (error) {
          console.error("[GraphRendererLR] Error during fit view:", error);
        }
        setIsReadyToFit(false);
      }, fitViewDelay); // Use the consistent delay
    }
  }, [isReadyToFit, reactFlowInstance, nodes, userInteracted, isParentInitialized]);

  console.log('[GraphRendererLR] Rendering with collapsedNodes (prop):', collapsedNodes, 'isParentInitialized:', isParentInitialized);

  return (
    <div 
      ref={reactFlowWrapperRef} 
      style={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        background: canvasTheme === 'dark' ? '#000000' : '#FFFFFF',
      }}
      onContextMenu={handleContextMenu}
    >
      {linkMode && linkSource && (
        <div style={{
          position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#fed7aa', color: '#9a3412', padding: '6px 12px',
          borderRadius: '4px', fontSize: '12px', zIndex: 5, pointerEvents: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #fdba74'
        }}>
          Click on a target node to create a link
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={() => {}}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        fitView={false}
        minZoom={0.1}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        panOnDrag={true}
        onMove={onMove}
        onNodeDragStop={onNodeDragStop}
        className="custom-minimap-wrapper"
        connectOnClick={linkMode || false}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{ animated: lineStyle === 'animated' }}
        style={{ transition: 'all 0.5s ease' }}
      >
        <Controls 
          position={controlsPosition}
          style={{
            display: 'flex', flexDirection: 'column', gap: 0, padding: '1px',
            borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transformOrigin: controlsPosition,
            ...( !isInPopupView ? { transform: 'scale(0.5)', bottom: '40px' } : {} )
          }}
        >
          <ControlButton onClick={resetLayout} title="Reset Layout"><RotateCcw size={16} /></ControlButton>
        </Controls>
        <MiniMap 
          position={minimapPosition}
          style={{
            transform: isInPopupView ? 'scale(0.8)' : 'scale(0.5)',
            transformOrigin: 'top right', padding: 0, margin: 0,
            background: canvasTheme === 'dark' ? '#424242' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '2px',
            border: '0px solid rgba(0, 0, 0, 0.05)', top: 0, right: 0, zIndex: 5
          }}
          pannable={false}
          nodeStrokeWidth={2}
          nodeColor={(node) => node.data?.pathColor || '#CBD5E0'}
        />
        <Background 
          color={canvasTheme === 'dark' ? '#FFFFFF' : '#AAAAAA'}
          gap={24} 
          size={1} 
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
      {contextMenu && (
        <div style={{
          position: 'fixed', top: contextMenu.mouseY, left: contextMenu.mouseX,
          background: 'white', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          zIndex: 10000, overflow: 'hidden'
        }}>
          <div 
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            onClick={handleAddNodeViaContextMenu}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            {contextMenu.nodeId ? 'Add Child Node' : 'Add Node'}
          </div>
          {contextMenu.nodeId && contextMenu.nodeId !== '1' && (
            <div 
              style={{ padding: '8px 16px', cursor: 'pointer', color: '#EF4444' }}
              onClick={() => { if (contextMenu.nodeId) callbacksRef.current.deleteNode(contextMenu.nodeId); handleContextMenuClose(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              Delete Node
            </div>
          )}
          {!contextMenu.nodeId && selectedNodeId && selectedNodeId !== '1' && (
            <div 
              style={{ padding: '8px 16px', cursor: 'pointer', color: '#EF4444' }}
              onClick={() => { callbacksRef.current.deleteNode(selectedNodeId); handleContextMenuClose(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              Delete Selected Node
            </div>
          )}
          <div 
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            onClick={downloadImage}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            Download as Image
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphRendererLR; 