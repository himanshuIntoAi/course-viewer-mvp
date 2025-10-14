"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  ReactFlowInstance,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Image from 'next/image';

// Simple Node Component with theme support
const SimpleNode: React.FC<NodeProps & { themeMode?: string; layoutOrientation?: 'horizontal' | 'vertical' }> = ({ 
  data, 
  selected, 
  themeMode = 'dark',
  layoutOrientation = 'horizontal'
}) => {
  const isLight = themeMode === 'light';
  const isHorizontal = layoutOrientation === 'horizontal';
  
  return (
    <div
      className="px-4 py-2 rounded-lg shadow-md border-2"
      style={{
        minWidth: '140px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: selected ? (isLight ? '#fef3c7' : '#451a03') : (isLight ? '#ffffff' : '#ffffff'),
        borderColor: selected ? '#fbbf24' : (isLight ? '#d1d5db' : '#6b7280'),
        color: isLight ? '#1f2937' : '#1f2937',
      }}
    >
      <Handle type="target" position={isHorizontal ? Position.Left : Position.Top} />
      <div className="font-medium text-sm">{data.label}</div>
      <Handle type="source" position={isHorizontal ? Position.Right : Position.Bottom} />
    </div>
  );
};


interface SimpleMindMapProps {
  data: {
    nodes: Array<{
      id: string;
      name: string;
      level: number;
    }>;
    links: Array<{
      source: string;
      target: string;
    }>;
  };
}

const SimpleMindMap: React.FC<SimpleMindMapProps> = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  
  // State for UI controls
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('dark');
  const [localLineCurveStyle, setLocalLineCurveStyle] = useState<'curved' | 'straight'>('curved');
  const [localLineStyle, setLocalLineStyle] = useState<'solid' | 'animated'>('solid');
  const [localLineColorMode, setLocalLineColorMode] = useState<'default' | 'random' | 'custom'>('default');
  const [localCustomLineColor, setLocalCustomLineColor] = useState('#ef4444');
  const [layoutOrientation, setLayoutOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Zoom and pan handlers
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomOut({ duration: 300 });
    }
  };

  const handleFitView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ 
        padding: 0.2, 
        duration: 300,
        maxZoom: 1.2,
        minZoom: 0.5
      });
    }
  };

  const onInit = (instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  };

  const handleLayoutToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLayoutOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    // Fit view after layout change
    setTimeout(() => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({ 
          padding: 0.2, 
          duration: 300,
          maxZoom: 1.2,
          minZoom: 0.5
        });
      }
    }, 100);
  };

  // Download functionality
  const handleDownload = async (format: string) => {
    try {
      switch (format.toLowerCase()) {
        case 'png':
          await downloadAsPNG();
          break;
        case 'jpeg':
          await downloadAsJPEG();
          break;
        case 'svg':
          await downloadAsSVG();
          break;
        case 'pdf':
          await downloadAsPDF();
          break;
        case 'csv':
          await downloadAsCSV();
          break;
        default:
          console.log(`Download format ${format} not implemented yet`);
      }
      setIsDownloadOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const downloadAsPNG = async () => {
    const canvas = await createFullMindmapCanvas();
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `mindmap-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const downloadAsJPEG = async () => {
    const canvas = await createFullMindmapCanvas();
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `mindmap-${Date.now()}.jpeg`;
    link.href = dataUrl;
    link.click();
  };

  const createFullMindmapCanvas = async (): Promise<HTMLCanvasElement | null> => {
    // Calculate the bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const x = node.position.x;
      const y = node.position.y;
      const nodeWidth = 140;
      const nodeHeight = 40;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + nodeWidth);
      maxY = Math.max(maxY, y + nodeHeight);
    });
    
    // Add padding
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const scale = 2; // For higher quality
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.scale(scale, scale);
    
    // Fill background
    ctx.fillStyle = getBackgroundColor();
    ctx.fillRect(0, 0, width, height);
    
    // Draw background dots
    ctx.fillStyle = getBackgroundDotColor();
    const dotSize = 2;
    const dotGap = 20;
    for (let x = 0; x < width; x += dotGap) {
      for (let y = 0; y < height; y += dotGap) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw edges first (so they appear behind nodes)
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const isHorizontal = layoutOrientation === 'horizontal';
        
        let sourceX, sourceY, targetX, targetY;
        
        if (isHorizontal) {
          // Horizontal layout: connect right side to left side
          sourceX = sourceNode.position.x - minX + 140; // Right side of source node
          sourceY = sourceNode.position.y - minY + 20; // Middle of source node
          targetX = targetNode.position.x - minX; // Left side of target node
          targetY = targetNode.position.y - minY + 20; // Middle of target node
        } else {
          // Vertical layout: connect bottom side to top side
          sourceX = sourceNode.position.x - minX + 70; // Middle of source node
          sourceY = sourceNode.position.y - minY + 40; // Bottom of source node
          targetX = targetNode.position.x - minX + 70; // Middle of target node
          targetY = targetNode.position.y - minY; // Top of target node
        }
        
        // Draw wavy line
        ctx.strokeStyle = edge.style?.stroke || '#ef4444';
        ctx.lineWidth = typeof edge.style?.strokeWidth === 'number' ? edge.style.strokeWidth : 3;
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        
        // Create a smooth curve (wavy effect)
        if (isHorizontal) {
          const controlPoint1X = sourceX + (targetX - sourceX) * 0.3;
          const controlPoint2X = sourceX + (targetX - sourceX) * 0.7;
          ctx.bezierCurveTo(
            controlPoint1X, sourceY,
            controlPoint2X, targetY,
            targetX, targetY
          );
        } else {
          const controlPoint1Y = sourceY + (targetY - sourceY) * 0.3;
          const controlPoint2Y = sourceY + (targetY - sourceY) * 0.7;
          ctx.bezierCurveTo(
            sourceX, controlPoint1Y,
            targetX, controlPoint2Y,
            targetX, targetY
          );
        }
        ctx.stroke();
        
        // Draw arrowhead
        const arrowSize = 10;
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        
        ctx.fillStyle = edge.style?.stroke || '#ef4444';
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(
          targetX - arrowSize * Math.cos(angle - Math.PI / 6),
          targetY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          targetX - arrowSize * Math.cos(angle + Math.PI / 6),
          targetY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const x = node.position.x - minX;
      const y = node.position.y - minY;
      const nodeWidth = 140;
      const nodeHeight = 40;
      const borderRadius = 8;
      
      // Draw node background
      ctx.fillStyle = node.selected 
        ? (themeMode === 'light' ? '#fef3c7' : '#451a03') 
        : '#ffffff';
      ctx.strokeStyle = node.selected ? '#fbbf24' : (themeMode === 'light' ? '#d1d5db' : '#6b7280');
      ctx.lineWidth = 2;
      
      // Rounded rectangle
      ctx.beginPath();
      ctx.moveTo(x + borderRadius, y);
      ctx.lineTo(x + nodeWidth - borderRadius, y);
      ctx.quadraticCurveTo(x + nodeWidth, y, x + nodeWidth, y + borderRadius);
      ctx.lineTo(x + nodeWidth, y + nodeHeight - borderRadius);
      ctx.quadraticCurveTo(x + nodeWidth, y + nodeHeight, x + nodeWidth - borderRadius, y + nodeHeight);
      ctx.lineTo(x + borderRadius, y + nodeHeight);
      ctx.quadraticCurveTo(x, y + nodeHeight, x, y + nodeHeight - borderRadius);
      ctx.lineTo(x, y + borderRadius);
      ctx.quadraticCurveTo(x, y, x + borderRadius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw node text
      ctx.fillStyle = '#1f2937';
      ctx.font = '500 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const label = node.data.label as string;
      const maxWidth = nodeWidth - 16;
      const words = label.split(' ');
      let lines: string[] = [];
      let currentLine = '';
      
      // Word wrap
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      // Limit to 2 lines and add ellipsis if needed
      if (lines.length > 2) {
        lines = lines.slice(0, 2);
        lines[1] = lines[1].slice(0, -3) + '...';
      }
      
      // Draw text centered vertically
      const lineHeight = 16;
      const totalHeight = lines.length * lineHeight;
      const startY = y + nodeHeight / 2 - totalHeight / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, x + nodeWidth / 2, startY + index * lineHeight);
      });
    });
    
    return canvas;
  };

  const downloadAsSVG = async () => {
    const svgContent = generateSVG();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mindmap-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = async () => {
    const canvas = await createFullMindmapCanvas();
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    const jsPDF = (await import('jspdf')).default;
    
    // Determine orientation based on aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    const orientation = aspectRatio > 1 ? 'landscape' : 'portrait';
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;
    
    // Calculate image dimensions to fit the page
    const imgAspectRatio = canvas.width / canvas.height;
    const pageAspectRatio = pageWidth / pageHeight;
    
    let imgWidth, imgHeight;
    if (imgAspectRatio > pageAspectRatio) {
      // Image is wider than page
      imgWidth = pageWidth - 20; // 10mm margin on each side
      imgHeight = imgWidth / imgAspectRatio;
    } else {
      // Image is taller than page
      imgHeight = pageHeight - 20; // 10mm margin on each side
      imgWidth = imgHeight * imgAspectRatio;
    }
    
    // Center the image on the page
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    
    pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`mindmap-${Date.now()}.pdf`);
  };

  const downloadAsCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.download = `mindmap-${Date.now()}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const generateSVG = () => {
    const width = 1200;
    const height = 800;
    const positions = calculatePositions(data, layoutOrientation);
    const isHorizontal = layoutOrientation === 'horizontal';
    
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="${getBackgroundColor()}"/>`;
    
    // Add nodes
    data.nodes.forEach(node => {
      const pos = positions[node.id] || { x: 0, y: 0 };
      const x = pos.x + width / 2;
      const y = pos.y + height / 2;
      
      svgContent += `<rect x="${x - 70}" y="${y - 15}" width="140" height="30" 
        fill="white" stroke="${themeMode === 'light' ? '#d1d5db' : '#6b7280'}" stroke-width="2" rx="8"/>`;
      svgContent += `<text x="${x}" y="${y + 5}" text-anchor="middle" 
        font-family="Arial" font-size="12" fill="${themeMode === 'light' ? '#1f2937' : '#1f2937'}">${node.name}</text>`;
    });
    
    // Add edges
    data.links.forEach(link => {
      const sourcePos = positions[link.source] || { x: 0, y: 0 };
      const targetPos = positions[link.target] || { x: 0, y: 0 };
      
      let x1, y1, x2, y2;
      if (isHorizontal) {
        x1 = sourcePos.x + width / 2 + 70;
        y1 = sourcePos.y + height / 2;
        x2 = targetPos.x + width / 2 - 70;
        y2 = targetPos.y + height / 2;
      } else {
        x1 = sourcePos.x + width / 2;
        y1 = sourcePos.y + height / 2 + 15;
        x2 = targetPos.x + width / 2;
        y2 = targetPos.y + height / 2 - 15;
      }
      
      svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
        stroke="${localCustomLineColor}" stroke-width="3" marker-end="url(#arrowhead)"/>`;
    });
    
    // Add arrow marker
    svgContent += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" 
      refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" 
      fill="${localCustomLineColor}"/></marker></defs>`;
    
    svgContent += '</svg>';
    return svgContent;
  };

  const generateCSV = () => {
    let csvContent = 'Node ID,Node Name,Level,Parent ID\n';
    
    data.nodes.forEach(node => {
      const parentLink = data.links.find(link => link.target === node.id);
      const parentId = parentLink ? parentLink.source : '';
      csvContent += `${node.id},"${node.name}",${node.level},"${parentId}"\n`;
    });
    
    return csvContent;
  };

  // Node types with theme and layout support
  const nodeTypes = {
    simple: (props: NodeProps) => <SimpleNode {...props} themeMode={themeMode} layoutOrientation={layoutOrientation} />,
  };

  // Calculate positions for nodes - Supports both horizontal and vertical layouts
  const calculatePositions = useCallback((data: SimpleMindMapProps['data'], orientation: 'horizontal' | 'vertical' = 'horizontal'): Record<string, { x: number; y: number }> => {
    if (!data.nodes.length) return {};

    const positions: Record<string, { x: number; y: number }> = {};
    const levelGroups: { [key: number]: string[] } = {};

    // Group nodes by level
    data.nodes.forEach(node => {
      if (!levelGroups[node.level]) {
        levelGroups[node.level] = [];
      }
      levelGroups[node.level].push(node.id);
    });

    if (orientation === 'horizontal') {
      // Horizontal layout (left to right)
      const levelSpacing = 300; // Horizontal spacing between levels
      const nodeSpacing = 200;  // Vertical spacing between nodes in same level

      Object.keys(levelGroups).forEach(levelStr => {
        const level = parseInt(levelStr);
        const nodeIds = levelGroups[level];

        nodeIds.forEach((nodeId, index) => {
          const x = level * levelSpacing;
          // Center nodes vertically within each level
          const totalHeight = (nodeIds.length - 1) * nodeSpacing;
          const startY = -totalHeight / 2;
          const y = startY + (index * nodeSpacing);
          positions[nodeId] = { x, y };
        });
      });
    } else {
      // Vertical layout (top to bottom)
      const levelSpacing = 200; // Vertical spacing between levels
      const nodeSpacing = 250;  // Horizontal spacing between nodes in same level

      Object.keys(levelGroups).forEach(levelStr => {
        const level = parseInt(levelStr);
        const nodeIds = levelGroups[level];

        nodeIds.forEach((nodeId, index) => {
          const y = level * levelSpacing;
          // Center nodes horizontally within each level
          const totalWidth = (nodeIds.length - 1) * nodeSpacing;
          const startX = -totalWidth / 2;
          const x = startX + (index * nodeSpacing);
          positions[nodeId] = { x, y };
        });
      });
    }

    return positions;
  }, []);

  // Convert data to ReactFlow format
  useEffect(() => {
    if (!data.nodes.length) {
      setNodes([]);
      setEdges([]);
      return;
    }

    console.log('[SimpleMindMap] Converting data to ReactFlow format:', data);
    console.log('[SimpleMindMap] Layout orientation:', layoutOrientation);

    const positions = calculatePositions(data, layoutOrientation);

    // Convert nodes
    const reactFlowNodes: Node[] = data.nodes.map(node => ({
      id: node.id,
      type: 'simple',
      position: positions[node.id] || { x: 0, y: 0 },
      data: { label: node.name },
    }));

    // Convert edges with red highlighting and arrow heads like Figma design
    const reactFlowEdges: Edge[] = data.links.map((link, index) => {
      // Determine line color based on settings
      let lineColor = '#ef4444'; // default red
      if (localLineColorMode === 'custom') {
        lineColor = localCustomLineColor;
      } else if (localLineColorMode === 'random') {
        const colors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899'];
        lineColor = colors[index % colors.length];
      }

      // Determine line type based on settings
      let lineType = 'default'; // wavy
      if (localLineCurveStyle === 'straight') {
        lineType = 'straight';
      }

      return {
        id: `edge-${index}`,
        source: link.source,
        target: link.target,
        type: lineType,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: lineColor,
          width: 20,
          height: 20,
        },
        style: {
          stroke: lineColor,
          strokeWidth: 3,
        },
        animated: localLineStyle === 'animated',
      };
    });

    console.log('[SimpleMindMap] ReactFlow nodes:', reactFlowNodes);
    console.log('[SimpleMindMap] ReactFlow edges:', reactFlowEdges);

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [data, calculatePositions, localLineColorMode, localCustomLineColor, localLineCurveStyle, localLineStyle, themeMode, layoutOrientation, setNodes, setEdges]);

  if (!data.nodes.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">🗺️</div>
          <p className="text-gray-500">No mindmap data available</p>
        </div>
      </div>
    );
  }

  // Determine background color based on theme
  const getBackgroundColor = () => {
    switch (themeMode) {
      case 'light':
        return '#ffffff';
      case 'dark':
        return '#1a1a1a';
      case 'auto':
        return '#1a1a1a'; // Default to dark for now
      default:
        return '#1a1a1a';
    }
  };

  const getBackgroundDotColor = () => {
    switch (themeMode) {
      case 'light':
        return '#e5e7eb';
      case 'dark':
        return '#666666';
      case 'auto':
        return '#666666';
      default:
        return '#666666';
    }
  };

  return (
    <div className="w-full h-full relative" style={{ background: getBackgroundColor() }}>
      {/* Top control bar */}
      <div className='absolute top-0 right-0 z-10 flex' >
        <button 
          className='flex border-2 border-gray-50 bg-white rounded-md p-2 mr-2 mt-2 items-center hover:bg-gray-100' 
          onClick={(e) => {
            e.stopPropagation();
            setIsSettingsOpen(true);
          }}
        > 
          <Image src={"/mindmap/settingIcon.svg"} alt="setting icon" width={30} height={30} className='mr-2' /> 
          Setting
        </button>
        <button 
          className='flex border-2 border-gray-50 bg-white rounded-md p-2 mr-2 mt-2 items-center hover:bg-gray-100' 
          onClick={(e) => {
            e.stopPropagation();
            setIsDownloadOpen(true);
          }}
        > 
          <Image src={"/mindmap/downloadIcon.svg"} alt="download icon" width={30} height={30} className='mr-2' /> 
          Download
        </button>
        <button 
          className='flex border-2 border-gray-50 bg-white rounded-md p-2 mr-2 mt-2 items-center hover:bg-gray-100' 
          onClick={handleLayoutToggle}
        > 
          <Image src={"/mindmap/frameIcon.svg"} alt="layout icon" width={30} height={30} className='mr-2' /> 
          {layoutOrientation === 'horizontal' ? 'Vertical' : 'Horizontal'}
        </button>
      </div>
      
      {/* Right control panel */}
      <div className='absolute top-[30vh] right-0 z-10 flex flex-col gap-2' >
         <button 
           className='border-2 border-gray-50 bg-white rounded-md p-2 hover:bg-gray-100' 
           title="AI Assistant"
           onClick={(e) => e.stopPropagation()}
         >
           <Image src={"/mindmap/aiSparkleIcon.svg"} alt="theme icon" width={30} height={30} />
         </button>
         <button 
           className='border-2 border-gray-50 bg-white rounded-md p-2 hover:bg-gray-100' 
           title="Zoom In"
           onClick={handleZoomIn}
         >
           <Image src={"/mindmap/zoomInIcon.svg"} alt="layout icon" width={30} height={30} />
         </button>
         <button 
           className='border-2 border-gray-50 bg-white rounded-md p-2 hover:bg-gray-100' 
           title="Fit to View"
           onClick={handleFitView}
         >
           <Image src={"/mindmap/fullPageIcon.svg"} alt="colour icon" width={30} height={30} />
         </button>
         <button 
           className='border-2 border-gray-50 bg-white rounded-md p-2 hover:bg-gray-100' 
           title="Zoom Out"
           onClick={handleZoomOut}
         >
           <Image src={"/mindmap/zoomOutIcon.svg"} alt="style icon" width={30} height={30} />
         </button>
       </div>

      {isSettingsOpen && (
        <div className='w-[20vw] h-[] bg-white absolute top-[100px] right-[38vh] border-2 border-gray-200 rounded-md z-[10000]' >
          <div className='flex justify-between items-center p-4 border-b-2 border-gray-200' >
            <p className='text-lg font-bold' >Settings</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(false);
              }} 
              aria-label='Close settings'
            >
              <Image src={'/mindmap/closeIcon.svg'} alt='close settings' width={30} height={30} className='mr-2 cursor-pointer' />
            </button>
          </div>
          <div className='p-4' >
            <p>Theme</p>
            <div className='flex gap-2 mt-2' >
              <button className={`rounded-sm p-2 px-4 ${themeMode === 'light' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setThemeMode('light')}>Light</button>
              <button className={`rounded-sm p-2 px-4 ${themeMode === 'dark' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setThemeMode('dark')}>Dark</button>
              <button className={`rounded-sm p-2 px-4 ${themeMode === 'auto' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setThemeMode('auto')}>Auto</button>
            </div>
          </div>
          <div className='p-4' >
            <p>Layout</p>
            <div className='flex gap-2 mt-2' >
              <button className={`rounded-sm p-2 px-4 ${localLineCurveStyle === 'curved' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setLocalLineCurveStyle('curved')}>Curved</button>
              <button className={`rounded-sm p-2 px-4 ${localLineCurveStyle === 'straight' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setLocalLineCurveStyle('straight')}>Straight</button>
            </div>
          </div>

          <div className='p-4' >
            <p>Style</p>
            <div className='flex gap-2 mt-2 justify-between' >
              <p>Animated Lines</p>
              <div className="flex items-center">
                <button
                  type="button"
                  className="relative inline-flex h-6 w-12 border-2 border-gray-300 rounded-full transition-colors duration-200 focus:outline-none"
                  style={{
                    background: localLineStyle === 'animated' ? '#5A09FF' : '#e5e7eb',
                  }}
                  onClick={() => setLocalLineStyle(prev => prev === 'animated' ? 'solid' : 'animated')}
                >
                  <span
                    className="inline-block h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200"
                    style={{
                      transform: localLineStyle === 'animated' ? 'translateX(24px)' : 'translateX(0px)',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className='p-4' >
            <p>Colour</p>
            <div className='flex gap-2 mt-2' >
              <button className='w-6 h-6 bg-green-500 rounded-xl' onClick={() => { setLocalLineColorMode('custom'); setLocalCustomLineColor('#22c55e'); }} />
              <button className='w-6 h-6 bg-red-500 rounded-xl' onClick={() => { setLocalLineColorMode('custom'); setLocalCustomLineColor('#ef4444'); }} />
              <button className='w-6 h-6 bg-yellow-500 rounded-xl' onClick={() => { setLocalLineColorMode('custom'); setLocalCustomLineColor('#eab308'); }} />
              <button className='w-6 h-6 bg-blue-500 rounded-xl' onClick={() => { setLocalLineColorMode('custom'); setLocalCustomLineColor('#3b82f6'); }} />
              <button className='w-6 h-6 bg-purple-500 rounded-xl' onClick={() => { setLocalLineColorMode('custom'); setLocalCustomLineColor('#8b5cf6'); }} />
              <button className='w-6 h-6 bg-pink-500 rounded-xl' onClick={() => { setLocalLineColorMode('custom'); setLocalCustomLineColor('#ec4899'); }} />
            </div>
            <div className='flex gap-2 mt-3'>
              <button className={`rounded-sm p-2 px-4 ${localLineColorMode === 'default' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setLocalLineColorMode('default')}>Default</button>
              <button className={`rounded-sm p-2 px-4 ${localLineColorMode === 'random' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setLocalLineColorMode('random')}>Random</button>
              <button className={`rounded-sm p-2 px-4 ${localLineColorMode === 'custom' ? 'bg-[#5A09FF] text-white' : 'bg-gray-200'}`} onClick={() => setLocalLineColorMode('custom')}>Custom</button>
            </div>
          </div>
        </div>
      )}

{isDownloadOpen && (
        <div className='absolute top-[10vh] right-[25vh] w-[13vw] bg-white rounded-md border-2 border-gray-200 flex flex-col gap-2 z-[10000]' >
          <div className='flex justify-between items-center p-4 border-b-2 border-gray-200' >
            <p className='text-lg font-bold' >Download</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsDownloadOpen(false);
              }} 
              aria-label='Close download'
            >
              <Image src={"/mindmap/closeIcon.svg"} alt="download close icon" width={30} height={30} />
            </button>
          </div>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 border-b-2 border-gray-200 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload('PNG');
            }}
          >
            PNG
          </button>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 border-b-2 border-gray-200 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload('JPEG');
            }}
          >
            JPEG
          </button>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 border-b-2 border-gray-200 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload('SVG');
            }}
          >
            SVG
          </button>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 border-b-2 border-gray-200 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              console.log('GIF download not implemented yet');
            }}
          >
            GIF
          </button>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 border-b-2 border-gray-200 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload('CSV');
            }}
          >
            CSV
          </button>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 border-b-2 border-gray-200 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload('PDF');
            }}
          >
            PDF
          </button>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 border-b-2 border-gray-200 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              console.log('WORD download not implemented yet');
            }}
          >
            WORD
          </button>
          <button 
            className='w-full p-4 cursor-pointer hover:bg-gray-100 text-left' 
            onClick={(e) => {
              e.stopPropagation();
              console.log('HTML download not implemented yet');
            }}
          >
            HTML
          </button>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        elementsSelectable={false}
        nodesConnectable={false}
        nodesDraggable={true}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          maxZoom: 1.2,
          minZoom: 0.5
        }}
        attributionPosition="bottom-left"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background
          color={getBackgroundDotColor()}
          gap={20}
          size={2}
          variant={BackgroundVariant.Dots}
        />
        

      </ReactFlow>
    </div>
  );
};

export default SimpleMindMap;
