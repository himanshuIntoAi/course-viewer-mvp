"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ReactFlowProvider } from 'reactflow';
import MindMapContent from './MindMapContent'; // Import the new MindMapContent component

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
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

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

  return (
    <ReactFlowProvider>
      <PopupContainer isOpen={isPopupOpen}>
        <MindMapContent 
          initialData={initialData} 
          defaultCollapsed={defaultCollapsed} 
          isPopupOpen={isPopupOpen} 
          togglePopup={togglePopup} 
        />
      </PopupContainer>
    </ReactFlowProvider>
  );
};

export default MindMap;