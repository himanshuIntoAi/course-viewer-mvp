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
import { Plus, Trash2, ChevronDown, ChevronRight, Wand2, RotateCcw} from 'lucide-react';
import { toPng } from 'html-to-image';
// import '@reactflow/node-resizer/dist/style.css'; // Ensure this is commented or removed
import 'reactflow/dist/style.css'; // Uncomment this to ensure styles are properly loaded
import './MindMap.css';

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

// Custom Node Component for Vertical layout
const CustomNode: React.FC<CustomNodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  const isRootNode = id === "1";
  const hasChildren = data.childCount > 0;
  const pathColor = data.pathColor || '#6C63FF';

  // Helper function for DoubleClick with improved event handling
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default behaviors
    
    // Set a small timeout to ensure the event doesn't propagate to parent components
    setTimeout(() => {
      setIsEditing(true);
      setEditValue(data.label);
    }, 10);
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
          height: data.height || 'auto',
          WebkitTapHighlightColor: 'transparent' // Improve mobile touch handling
        }}
        className="custom-node"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onDoubleClick={(e) => {
          // Prevent event propagation at container level too
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        {/* Target handle positioned in center */}
        <Handle 
          type="target" 
          position={Position.Top}
          style={{ 
            opacity: 0,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            top: '50%',
            left: '50%',
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
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                data.onRequestSubtopics?.(id);
              }}
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
          position={Position.Bottom}
          style={{ 
            opacity: 0,
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            bottom: '50%',
            left: '50%',
            transform: 'translate(-50%, 50%)',
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
  const midY = sourceY + (targetY - sourceY) / 2;
  const arrowY = midY;
  
  // Create a gentle curved path that doesn't bulge too much
  // Use a smoother curve with better control point placement
  const path = `M ${sourceX} ${sourceY} C ${sourceX} ${sourceY + (targetY - sourceY) * 0.3}, ${targetX} ${targetY - (targetY - sourceY) * 0.3}, ${targetX} ${targetY}`;
  
  const pathColor = data?.pathColor || '#CBD5E0';
  const strokeWidth = isHovered ? 3 : 2;
  
  // Simplified arrow rendering with global line style check
  const showArrow = globalLineStyle === 'dashed-arrow';
  
  // Create a smaller arrow
  const ARROW_SIZE = 12;
  
  // For a curved path, approximate the tangent at the middle point
  // In this case, it's vertical (coming from above)
  const angle = Math.atan2(1, 0); // pointing downward
  
  // Calculate points for a triangle
  const leftX = targetX - Math.cos(angle - Math.PI/4) * ARROW_SIZE;
  const leftY = arrowY - Math.sin(angle - Math.PI/4) * ARROW_SIZE;
  
  const rightX = targetX - Math.cos(angle + Math.PI/4) * ARROW_SIZE;
  const rightY = arrowY - Math.sin(angle + Math.PI/4) * ARROW_SIZE;
  
  const arrowPoints = `${targetX},${arrowY} ${leftX},${leftY} ${rightX},${rightY}`;
  
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

// Add a new StraightEdge component for the straight line type
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

    const childrenObjects = getChildNodes(current, nodes, links);
    childrenObjects.forEach(child => {
      if (!descendants.has(child.id)) { 
        descendants.add(child.id);
        stack.push(child.id);
      }
    });
  }
  return descendants;
};

// Simple grid-based layout for mindmaps - more robust than hierarchical
const calculateNodePositions = (
    nodesData: GraphData['nodes']
) => {
    const nodePositions = new Map<string, { x: number; y: number }>();
    if (!nodesData || nodesData.length === 0) return nodePositions;

    console.log('[calculateNodePositions] Starting layout calculation for', nodesData.length, 'nodes');

    // Simple grid layout parameters
    const NODE_SPACING_X = 200; // Horizontal spacing between nodes
    const NODE_SPACING_Y = 120; // Vertical spacing between nodes
    const NODES_PER_ROW = 3; // Maximum nodes per row
    
    // Calculate positions in a grid pattern
    nodesData.forEach((node, index) => {
        const row = Math.floor(index / NODES_PER_ROW);
        const col = index % NODES_PER_ROW;
        
        // Center the grid horizontally
        const centerOffset = ((nodesData.length - 1) % NODES_PER_ROW) * NODE_SPACING_X / 2;
        
        const x = (col * NODE_SPACING_X) - centerOffset;
        const y = row * NODE_SPACING_Y;
        
        console.log(`[calculateNodePositions] Node ${node.id} (${node.name}) positioned at row ${row}, col ${col}: x=${x}, y=${y}`);
        
        nodePositions.set(node.id, { x, y });
    });

    console.log('[calculateNodePositions] Final positions:', Object.fromEntries(nodePositions));
    return nodePositions;
};

// Main GraphRenderer component
const GraphRenderer: React.FC<GraphRendererProps> = ({ 
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
  console.log('[GraphRenderer] Component received data:', data);
  console.log('[GraphRenderer] Data nodes count:', data?.nodes?.length);
  console.log('[GraphRenderer] Data links count:', data?.links?.length);
  
  // Update the global lineStyle
  globalLineStyle = lineStyle;

  const graphData = data;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const reactFlowInstance = useReactFlow<NodeData, Edge>();
  const [isReadyToFit, setIsReadyToFit] = useState<boolean>(false);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const isInitialRender = useRef(true);

  const nodePositionsRef = useRef<NodePositionCache[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    nodeId?: string;
  } | null>(null);
  
  const callbacksRef = useRef({
    deleteNode,
    toggleNode: (id: string) => {
      console.log(`[GraphRenderer] Toggle requested for node: ${id}`);
      
      // Check if this is coming from a toolbar button click vs. a node click
      // Skip if this node was just clicked for AI generation (can lead to race conditions)
      if (document.activeElement && 
          document.activeElement instanceof HTMLElement && 
          document.activeElement.getAttribute('title') === "Generate Subtopics with AI") {
        console.log(`[GraphRenderer] Toggle ignored because AI generation button has focus for node: ${id}`);
        return;
      }
      
      setUserInteracted(false);
      isInitialRender.current = false;
      
      if (onNodeToggle) {
        console.log(`[GraphRenderer] Notifying parent about toggle for node: ${id}`);
        onNodeToggle(id);
      }
    },
    addChildNode: onAddChildNode,
    handleNodeLabelChange: onUpdateNodeLabel,
  });

  const getDescendantsForCurrentData = useCallback((nodeId: string) => {
    return getDescendants(nodeId, graphData.nodes, graphData.links);
  }, [graphData.nodes, graphData.links]);

  // --- Context Menu Handlers ---
  const handleContextMenuClose = useCallback(() => setContextMenu(null), []);

  const handleContextMenu = useCallback((event: React.MouseEvent) => { 
    event.preventDefault(); 
    event.stopPropagation(); 
    const targetElement = event.target as Element; 
    const nodeIdElement = targetElement.closest('.react-flow__node')?.getAttribute('data-id'); 
    setContextMenu({ 
      mouseX: event.clientX, 
      mouseY: event.clientY, 
      nodeId: nodeIdElement || undefined 
    }); 
  }, []);

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

  // Download image function
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
              link.download = 'mindmap.png'; 
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
      console.log('[GraphRenderer] Parent not initialized, waiting...');
      setNodes([]); // Clear nodes if parent is not ready
      setEdges([]); // Clear edges if parent is not ready
      nodePositionsRef.current = [];
      isInitialRender.current = true; // Reset initial render flag if parent becomes unready
      return;
    }
    console.log('[GraphRenderer] Parent is initialized. Processing graph data.');

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) { 
      console.log('[GraphRenderer] No graph data or nodes, clearing view.');
      setNodes([]); 
      setEdges([]); 
      nodePositionsRef.current = [];
      isInitialRender.current = true; // Reset if graph data becomes empty
      return; 
    }
    
    // Filter out nodes that don't actually exist in graphData.nodes from nodePositionsRef.current
    // This prevents trying to use cached positions for nodes that were deleted.
    const validNodeIdsFromGraphData = new Set(graphData.nodes.map(n => n.id));
    nodePositionsRef.current = nodePositionsRef.current.filter(cache => validNodeIdsFromGraphData.has(cache.id));

    // Determine if we should recalculate all positions (like a reset) or try to preserve existing.
    // For simplicity and to match the new dynamic layout's intent, we will recalculate positions
    // when graphData, collapsedNodes, or isParentInitialized changes.
    // User-dragged positions are handled by onNodeDragStop and temporarily override calculated ones.
    // `resetLayout` explicitly clears nodePositionsRef to force full recalculation.

    console.log('[GraphRenderer] Main useEffect: Recalculating all node positions.');
    console.log('[GraphRenderer] Graph data for positioning:', {
      nodes: graphData.nodes.map(n => ({ id: n.id, name: n.name, level: n.level })),
      links: graphData.links.map(l => ({ source: l.source, target: l.target })),
      collapsedNodes: Array.from(collapsedNodes)
    });
    const calculatedPositions = calculateNodePositions(graphData.nodes);
    console.log('[GraphRenderer] Calculated positions:', Object.fromEntries(calculatedPositions));
    
    const tempGeneratedColors = new Map<string, string>(); // For nodes without a cached color
    const finalNodesArray: Node[] = []; // Changed name to avoid conflict with state 'nodes'
    const newPositionCache: NodePositionCache[] = [];
    
    graphData.nodes.forEach((graphNode) => {
      // With grid layout, all nodes are always visible
      const isVisible = true;
      
      console.log(`[GraphRenderer] Node ${graphNode.id} (${graphNode.name}) - isVisible: ${isVisible}`);
      
      if (isVisible) {
        const cachedNodeInfo = nodePositionsRef.current.find(cn => cn.id === graphNode.id);
        let position;

        if (cachedNodeInfo && userInteracted) { // MODIFIED: Prioritize cached/dragged position
          position = cachedNodeInfo.position;
          console.log(`[GraphRenderer] Using CACHED/DRAGGED position for node ${graphNode.id}:`, position);
        } else {
          position = calculatedPositions.get(graphNode.id) || { x: 0, y: 0 }; // Default to calculated
          if (cachedNodeInfo && !userInteracted) {
            // This means it's a calculated position from a previous render, which should match the current calculation
            // if the structure hasn't changed, or be superseded by the new calculation if it has.
            console.log(`[GraphRenderer] Using CALCULATED (or cached if same) position for node ${graphNode.id} (userInteracted: false):`, position);
          } else if (!cachedNodeInfo) {
            console.log(`[GraphRenderer] Using CALCULATED position for NEW/RESET node ${graphNode.id}:`, position);
          }
        }
        
        if (onNodePositionChange) onNodePositionChange(graphNode.id, position);

        const childNodeObjects = getChildNodes(graphNode.id, graphData.nodes, graphData.links);
        
        const existingCachedVisuals = nodePositionsRef.current.find(cn => cn.id === graphNode.id);
        let pathColor = selectedNodeId === graphNode.id && selectedColor ? selectedColor 
                        : existingCachedVisuals?.color;

        if (!pathColor) {
            pathColor = tempGeneratedColors.get(graphNode.id);
            if(!pathColor) {
                pathColor = generateRandomColor();
                tempGeneratedColors.set(graphNode.id, pathColor);
            }
        }
                        
        finalNodesArray.push({
          id: graphNode.id, 
          position, 
          type: 'custom', 
          data: { 
            label: graphNode.name, 
            group: graphNode.group, 
            onDelete: callbacksRef.current.deleteNode, 
            onToggle: callbacksRef.current.toggleNode, 
            onAddChild: callbacksRef.current.addChildNode, 
            onNodeLabelChange: callbacksRef.current.handleNodeLabelChange, 
            isExpanded: !collapsedNodes.has(graphNode.id),
            childCount: childNodeObjects.length, 
            pathColor,
            onRequestSubtopics: onRequestSubtopics ? () => onRequestSubtopics(graphNode.id) : undefined 
          }
        });
        newPositionCache.push({ id: graphNode.id, position, color: pathColor });
      }
    });
    
    // Update the persistent cache with the latest positions and colors from visible nodes
    // This should only contain nodes that are currently rendered.
    nodePositionsRef.current = newPositionCache;
    
    setNodes(finalNodesArray); // Update React Flow nodes
    
    const finalEdgesArray: Edge[] = graphData.links
      .filter(link => finalNodesArray.some(n => n.id === link.source) && finalNodesArray.some(n => n.id === link.target))
      .map(link => { 
        const sourceNode = finalNodesArray.find(n => n.id === link.source);
        
        const pc = lineColorMode === "random" ? generateRandomColor() :
                   lineColorMode === "custom" ? customLineColor :
                   (sourceNode?.data as NodeData)?.pathColor || generateRandomColor();
        
        // Set consistent stroke width regardless of line type
        const edgeBase: Edge = {
          id: `edge-${link.source}-${link.target}`,
          source: link.source,
          target: link.target,
          type: lineCurveStyle === 'straight' ? 'straight' : 'custom', // Use our custom straight edge
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
          // Skip using markerEnd
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
          
          // Log for debugging
          console.log('Created dashed-arrow edge with isArrow=true:', edgeBase);
        }
        
        return edgeBase;
      });
      
    setEdges(finalEdgesArray); // Update React Flow edges
    
    // FitView Logic:
    // This logic should trigger if it's the initial render and no user interaction,
    // OR if a programmatic change (like node toggle, which changes collapsedNodes) happened
    // and the user hasn't interacted.
    // `userInteracted` is set true on drag/pan. `resetLayout` sets it false.
    // `callbacksRef.current.toggleNode` sets it false.
    if (finalNodesArray.length > 0) {
        if (isInitialRender.current && !userInteracted) {
            console.log('[GraphRenderer] Main useEffect: Scheduling initial fitView.');
            setIsReadyToFit(true);
        } else if (!isInitialRender.current && !userInteracted) {
            // This handles fitting view after programmatic changes like toggling a node,
            // if the user hasn't manually panned/zoomed since the last auto-fit or reset.
            console.log('[GraphRenderer] Main useEffect: Scheduling fitView after programmatic update (e.g., toggle).');
            setTimeout(() => setIsReadyToFit(true), 50); // Small delay for layout to apply
        }
    }
    // Ensure isInitialRender is correctly managed:
    // It's true initially, and set to false after the first successful fitView.
    // It's reset to true if graphData becomes empty or parent is uninitialized.

  }, [
    graphData, 
    collapsedNodes, 
    // getDescendantsForCurrentData, // This is stable if graphData.nodes/links don't change, but included for safety if its internals change
    onRequestSubtopics, 
    selectedNodeId, 
    selectedColor, 
    setNodes, 
    setEdges, 
    onNodePositionChange, 
    userInteracted, // MODIFIED: Ensure userInteracted is a dependency
    isParentInitialized,
    // Add new style dependencies
    canvasTheme,
    lineStyle,
    lineCurveStyle,
    lineColorMode,
    customLineColor
  ]);

  const onNodeDragStop = useCallback((event: React.MouseEvent, draggedNode: Node) => {
    const newPosition = { ...draggedNode.position };
    const index = nodePositionsRef.current.findIndex(n => n.id === draggedNode.id);
    const nodeData = draggedNode.data as NodeData;
    const pathColor = nodeData.pathColor || generateRandomColor();
    
    if (index >= 0) { 
      nodePositionsRef.current[index].position = newPosition; 
      nodePositionsRef.current[index].color = pathColor; 
    } else { 
      nodePositionsRef.current.push({ id: draggedNode.id, position: newPosition, color: pathColor }); 
    }
    
    setNodes(nds => nds.map(n => (n.id === draggedNode.id ? { ...n, position: newPosition } : n)));
    if (onNodePositionChange) onNodePositionChange(draggedNode.id, newPosition);
    setUserInteracted(true); // MODIFIED: Ensure userInteracted is set to true
    console.log(`[GraphRenderer] Node ${draggedNode.id} drag stop. userInteracted: true. Position cache updated.`);
    return false;
  }, [setNodes, setUserInteracted, onNodePositionChange]); // MODIFIED: Ensure setUserInteracted is in dependencies

  const resetLayout = useCallback(() => {
    if (reactFlowInstance && graphData.nodes.length > 0) {
      console.log("[GraphRenderer] Resetting layout...");
      nodePositionsRef.current = []; // MODIFIED: Clear position cache
      setUserInteracted(false);  // MODIFIED: Reset user interaction flag
      isInitialRender.current = true; // MODIFIED: Treat as initial render for fitView purposes

      // Use prop collapsedNodes
      const newPositionsMap = calculateNodePositions(graphData.nodes);
      
      // Generate colors map
      const newColorsMap = new Map<string, string>();
      graphData.nodes.forEach(n => {
        // Use provided nodeColors if available, otherwise generate a random color
        const color = (nodeColors && nodeColors[n.id]) || generateRandomColor();
        newColorsMap.set(n.id, color);
      });
        
      // Create nodes with proper type annotation
      const updatedNodes: Record<string, unknown>[] = graphData.nodes.map(gn => {
        const position = newPositionsMap.get(gn.id) || { x: 0, y: 0 };
        const pathColor = newColorsMap.get(gn.id) || generateRandomColor();
        const childNodes = getChildNodes(gn.id, graphData.nodes, graphData.links);
          
        // Call onNodePositionChange for each node to update MindMap's state
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
      }).filter(node => { // Filter for visibility
        let isVisible = true;
        for (const collapsedId of collapsedNodes) {
          if (getDescendantsForCurrentData(collapsedId).has(node.id as string)) {
            isVisible = false;
            break;
          }
        }
        return isVisible;
      });

      nodePositionsRef.current = updatedNodes.map(n => ({ 
        id: n.id as string, 
        position: n.position as { x: number, y: number }, 
        color: (n.data as NodeData).pathColor! 
      }));
      
      setNodes(updatedNodes as unknown as Node[]);
      
      const rfEdges: Edge[] = graphData.links
        .filter(link => updatedNodes.some(n => n.id === link.source) && updatedNodes.some(n => n.id === link.target))
        .map(link => { 
          const sn = updatedNodes.find(n => n.id === link.source);
          
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
            id: `edge-${link.source}-${link.target}`,
            source: link.source,
            target: link.target,
            type: lineCurveStyle === 'straight' ? 'straight' : 'custom', // Use our custom straight edge
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
            // Skip using markerEnd
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
            console.log('Reset: Created dashed-arrow edge with isArrow=true:', edgeBaseReset);
          }

          return edgeBaseReset;
        });
        
      setEdges(rfEdges);
      setIsReadyToFit(true);
    }
  }, [graphData, reactFlowInstance, collapsedNodes, onNodePositionChange, onRequestSubtopics, nodeColors, getDescendantsForCurrentData, setEdges, setNodes, lineStyle, lineColorMode, customLineColor, lineCurveStyle]);

  const onMove = useCallback(() => {
    if (!userInteracted && !isInitialRender.current) {
      console.log("[GraphRenderer] User manually changed viewport");
      setUserInteracted(true);
    }
  }, [userInteracted]);

  const onConnect = useCallback((params: Connection) => {
    const newEdgeColor = selectedColor || generateRandomColor();
    const type = lineCurveStyle === 'straight' ? 'straight' : 'custom'; // Use our custom straight edge
    const animated = lineStyle === 'animated';
    const edgeData: { pathColor: string; style?: React.CSSProperties } = { 
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

    setEdges((eds) => addEdge({ ...params, type, animated, style: edgeStyle, data: edgeData, markerEnd }, eds));
  }, [selectedColor, setEdges, lineStyle, lineCurveStyle]);

  const onEdgeUpdateStart = useCallback(() => {}, []);

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    const type = lineCurveStyle === 'straight' ? 'straight' : 'custom'; // Use our custom straight edge
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

    setEdges((els) => addEdge({ ...oldEdge, ...newConnection, type, animated, style: newEdgeStyle, data: newEdgeData, markerEnd: marker }, els.filter(e => e.id !== oldEdge.id)));
  }, [setEdges, lineCurveStyle, lineStyle]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (onAddNodeOnEdgeDrop) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        const position = { x: (sourceNode.position.x + targetNode.position.x) / 2, y: (sourceNode.position.y + targetNode.position.y) / 2 };
        onAddNodeOnEdgeDrop(edge.source, position);
      } else {
         console.warn("[GraphRenderer] Could not find source/target for edge click to add node.");
      }
    } else {
      console.log(`[GraphRenderer] Edge clicked: ${edge.id}. No onAddNodeOnEdgeDrop handler provided.`);
    }
  }, [nodes, onAddNodeOnEdgeDrop]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => { 
    if (linkMode && linkSource && selectedNodeId === linkSource) {
      if (onNodeSelect) onNodeSelect(node.id); 
    } else if (onNodeSelect) { 
      onNodeSelect(node.id); 
    }
  }, [linkMode, linkSource, onNodeSelect, selectedNodeId]);

  const onInit: OnInit = () => { console.log('[GraphRenderer] ReactFlow initialized.'); };
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
      console.log(`[GraphRenderer] FitView effect: Triggering fitView with delay: ${fitViewDelay}ms. isInitialRender: ${isInitialRender.current}`);

      setTimeout(() => {
        try {
          if (nodes.length === 0) {
            setIsReadyToFit(false);
            return;
          }
          reactFlowInstance.fitView({
            padding: 0.5,
            duration: 800, 
            includeHiddenNodes: false
          });
          isInitialRender.current = false;
        } catch (error) {
          console.error("[GraphRenderer] Error during fit view:", error);
        }
        setIsReadyToFit(false);
      }, fitViewDelay); // Use the consistent delay
    }
  }, [isReadyToFit, reactFlowInstance, nodes, userInteracted, isParentInitialized]);

  // Node repositioning effect (when collapsedNodes changes from props)
  useEffect(() => {
    console.log('[GraphRenderer] Collapsed nodes changed (from prop), recalculating layout. User interacted:', userInteracted, "Initial render:", isInitialRender.current);

    if (!isParentInitialized || !graphData?.nodes?.length) {
        console.log('[GraphRenderer] Skipping layout for collapsedNodes change: Parent not init or no graph data.');
        return;
    }
    
    // If user has interacted, we generally don't want to auto-reposition everything on collapse/expand.
    // However, the expectation for collapse/expand IS a relayout.
    // The `userInteracted` flag is more for preventing fitView on pan/zoom.
    // For collapse/expand, we *do* want to re-calculate and re-render.
    // The main useEffect already handles this recalculation when `collapsedNodes` changes.
    // This separate effect might be redundant or could conflict if not managed carefully.

    // Let's simplify: The main useEffect already depends on `collapsedNodes` and will
    // trigger a full recalculation and `setIsReadyToFit(true)` (if !userInteracted).
    // This means this separate effect might not be strictly necessary for just recalculating layout,
    // as the main one does it. Its primary role here might be to ensure nodes *animate* to new positions.

    // If the main useEffect handles the position calculation and `setNodes`,
    // this effect could focus on ensuring `isReadyToFit` is triggered
    // if `userInteracted` was true but now a collapse/expand should override that for fitting.
    // However, `callbacksRef.current.toggleNode` sets `userInteracted` to false before changing `collapsedNodes`,
    // which means the main `useEffect`'s `setIsReadyToFit(true)` path should be taken.

    // Given the main useEffect correctly recalculates positions based on `collapsedNodes`
    // and sets `isReadyToFit`, this effect can be simplified or potentially removed if it's causing issues.
    // Let's ensure the main effect correctly handles the state for fitting.

    // The main useEffect already handles the recalculation and calls setNodes.
    // It also sets setIsReadyToFit(true) if appropriate.
    // This effect, if it re-calls setNodes, might cause an extra render cycle.
    // Let's comment out the setNodes part here and rely on the main useEffect triggered by `collapsedNodes` change.
    // If animations are desired, they should be part of the `setNodes` in the main useEffect.
    
    // console.log('[GraphRenderer] Collapsed nodes changed. Triggering main useEffect by dependency.');
    // No direct setNodes here; rely on main useEffect triggered by `collapsedNodes` change.
    // If animations are desired, they should be part of the `setNodes` in the main useEffect.
    
    // The `style` for animation should be applied in the main useEffect when nodes are updated.
    // Let's ensure that's happening.
    // The main useEffect *does not* currently add a transition style.
    // This is where this effect can be useful: to specifically add transition styling
    // *after* `collapsedNodes` changes and *before* the main useEffect might run again,
    // or to ensure nodes animate smoothly.

    if (userInteracted && !isInitialRender.current) {
      console.log('[GraphRenderer] Skipping automatic layout in collapsedNodes useEffect due to prior user interaction.');
      // Even if user interacted, a collapse/expand should still re-layout.
      // The `userInteracted` flag is set to `false` by the toggle handler *before* `collapsedNodes` changes.
      // So, this condition might not be hit as expected after a toggle.
    }

    // Force a re-calculation and animate (if `setNodes` includes style changes)
    // The main `useEffect` will handle the actual position calculation due to `collapsedNodes` dependency.
    // This effect can ensure that `isReadyToFit` is true,
    // to make sure `fitView` runs after the re-layout from collapse/expand,
    // especially if `userInteracted` was true from other actions.
    // Since toggle sets `userInteracted` to false, main useEffect handles `setIsReadyToFit`.

    // The main useEffect already depends on `collapsedNodes`. When it changes,
    // `calculateNodePositions` is called, and `setNodes` updates nodes with new positions.
    // If we want animation, the `style` property should be added there.

    // Let's move the animation style to the main useEffect's setNodes.
    // This current useEffect for `collapsedNodes` might then become redundant unless it serves another purpose.
    // For now, let's assume the main `useEffect` will handle `setNodes` correctly.

    // This effect's main purpose was to call `setIsReadyToFit` after a delay.
    // Let's retain that aspect if it's beneficial for timing the fitView after collapse/expand.
    // The main useEffect already sets `setIsReadyToFit` (conditionally on userInteracted).
    // The toggleNode sets userInteracted to false, so it should work.

    // What this effect *could* do is force `isInitialRender.current = false` and `userInteracted = false`
    // to ensure the fitView logic in the main effect behaves as if it's a programmatic update.
    // This is already done by `toggleNode`.

    // Conclusion: The main `useEffect` handles recalculation and `setIsReadyToFit`.
    // This effect for `collapsedNodes` can be simplified or potentially removed if its logic is fully covered.
    // Let's ensure the animation style is added in the main `useEffect` where `setNodes` is called.
    // The provided code already updates `isExpanded` in `setNodes` in the main `useEffect`
    // but does not add `style: { transition: ... }`.

    // To enable animation, we should modify the `setNodes` call in the main `useEffect`
    // to add a transition style when positions change due to `collapsedNodes`.
    // However, `setNodes(nds => nds.map(...))` in `onNodeDragStop` and `resetLayout` *also* updates positions.
    // A global animation style might be better, or apply it selectively.

    // For now, this effect for `collapsedNodes` can be very minimal or removed
    // if main useEffect is robust. The console log for `Scheduling fit view update` is fine.
    // The important part is that `collapsedNodes` is a dependency of the main `useEffect`.

  }, [collapsedNodes, graphData?.nodes, graphData?.links, setNodes, userInteracted, isParentInitialized]); // Added isParentInitialized

  console.log('[GraphRenderer] Rendering with collapsedNodes (prop):', collapsedNodes, 'isParentInitialized:', isParentInitialized);

  return (
    <div 
      ref={reactFlowWrapperRef} 
      style={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        WebkitTapHighlightColor: 'transparent', // Add this for better mobile behavior
        background: canvasTheme === 'dark' ? '#000000' : '#FFFFFF', // Set canvas background here
      }}
      onContextMenu={handleContextMenu}
      onDoubleClick={(e) => {
        // Add a global double-click handler to prevent unwanted collapses
        e.stopPropagation();
        e.preventDefault();
      }}
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
        onEdgeUpdateStart={onEdgeUpdateStart}
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
        onDoubleClick={(e) => {
          // Prevent double-clicks from propagating to parent components
          e.stopPropagation();
          e.preventDefault();
        }}
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
            transform: isInPopupView ? 'scale(1)' : 'scale(0.5)',
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
          color={canvasTheme === 'dark' ? '#FFFFFF' : '#AAAAAA'} // Dot color
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

export default GraphRenderer; 