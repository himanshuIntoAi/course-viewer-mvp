"use client";

import React, { useState } from "react";
import { MoveHorizontal, MoveVertical } from "lucide-react";
import './MindMap.css';

interface ControlsProps {
  addNode: (name: string) => void;
  addLink: (source: string, target: string) => void;
  exportGraph: () => void;
  importGraph: (file: File) => void;
  layout?: "vertical" | "horizontal";
  onLayoutChange?: (layout: "vertical" | "horizontal") => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  addNode, 
  addLink, 
  exportGraph, 
  importGraph,
  layout = "vertical",
  onLayoutChange
}) => {
  const [nodeName, setNodeName] = useState<string>("");
  const [linkSource, setLinkSource] = useState<string>("");
  const [linkTarget, setLinkTarget] = useState<string>("");

  const toggleLayout = () => {
    if (onLayoutChange) {
      onLayoutChange(layout === "vertical" ? "horizontal" : "vertical");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div>
        <input
          type="text"
          placeholder="Node Name"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
        />
        <button onClick={() => { addNode(nodeName); setNodeName(""); }}>Add Node</button>
        
        {onLayoutChange && (
          <button
            onClick={toggleLayout}
            title={`Switch to ${layout === "vertical" ? "horizontal" : "vertical"} layout`}
            style={{ 
              marginLeft: "10px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 8px",
              background: "transparent",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {layout === "vertical" 
              ? <MoveHorizontal size={16} style={{ marginRight: "4px" }} /> 
              : <MoveVertical size={16} style={{ marginRight: "4px" }} />
            }
            {layout === "vertical" ? "Horizontal" : "Vertical"}
          </button>
        )}
      </div>
      <div>
        <input
          type="text"
          placeholder="Source ID"
          value={linkSource}
          onChange={(e) => setLinkSource(e.target.value)}
        />
        <input
          type="text"
          placeholder="Target ID"
          value={linkTarget}
          onChange={(e) => setLinkTarget(e.target.value)}
        />
        <button onClick={() => { addLink(linkSource, linkTarget); setLinkSource(""); setLinkTarget(""); }}>Add Link</button>
      </div>
      <div>
        <button onClick={exportGraph}>Export Graph</button>
        <input 
          type="file" 
          accept=".json" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              importGraph(e.target.files[0]);
            }
          }} 
        />
      </div>
    </div>
  );
};

export default Controls; 