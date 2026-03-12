"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapMarker } from "@/lib/analytics";

interface NigeriaSpyMapProps {
  markers: MapMarker[];
}

export const NigeriaSpyMap: React.FC<NigeriaSpyMapProps> = ({ markers }) => {
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);

  // Nigeria Bounds (True Geographic Extents)
  const bounds = {
    minLat: 4.240594,
    maxLat: 13.824888,
    minLng: 2.691702,
    maxLng: 14.577178,
  };

  // High-accuracy Nigeria SVG Path (Preserving aspect ratio, Max width = 100)
  const nigeriaPath = "M48.87,77.12 L40.14,80.19 L36.94,79.74 L33.71,81.65 L26.98,81.47 L22.47,76.14 L19.70,69.97 L13.75,64.36 L7.42,64.46 L0.00,64.46 L0.48,50.73 L0.27,45.31 L1.86,39.93 L4.45,37.32 L8.53,32.05 L7.64,29.76 L9.30,26.33 L7.41,21.27 L7.74,18.44 L8.31,10.83 L10.73,7.75 L11.92,2.84 L14.11,0.99 L23.14,0.00 L31.57,3.16 L34.74,6.37 L39.03,6.52 L43.03,4.43 L53.21,8.86 L57.50,8.65 L62.48,5.02 L67.41,5.27 L69.84,4.08 L74.37,4.58 L80.89,7.04 L87.48,2.28 L89.44,2.63 L95.14,6.26 L96.72,7.41 L100.00,6.54 L99.08,8.08 L98.64,10.94 L91.53,17.66 L89.30,23.15 L88.12,27.62 L86.33,29.54 L84.62,35.57 L80.10,39.13 L78.79,42.70 L76.88,45.55 L76.09,49.27 L70.31,52.20 L65.57,48.66 L62.37,48.76 L57.34,53.80 L54.90,53.87 L50.90,62.18 L48.87,77.12 Z";

  const rows = 60;
  const cols = 60;

  const project = (lat: number, lng: number) => {
    return {
      x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100,
      y: ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 81.65,
    };
  };

  const dots = useMemo(() => {
    const grid = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c / cols) * 100;
        const y = (r / rows) * 81.65;
        grid.push({ x, y });
      }
    }
    return grid;
  }, []);

  return (
    <div className="relative w-full aspect-[100/81.65] overflow-hidden flex items-center justify-center">
      {/* HUD Accents */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 border-l border-primary/40 pl-3">
        <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">Region: West Africa</span>
        <span className="text-xl font-mono text-slate-900 tracking-tight">SECTOR_NIGERIA</span>
      </div>
      
      <div className="absolute bottom-8 right-8 text-right flex flex-col gap-1 border-r border-primary/40 pr-3">
        <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">Live Status</span>
        <span className="text-sm font-mono text-success uppercase font-bold">Operational_Active</span>
      </div>

      <svg viewBox="0 0 100 81.65" className="w-full h-full">
        <defs>
          <mask id="nigeriaMask">
            <path d={nigeriaPath} fill="white" />
          </mask>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Background Grid (Dim) */}
        {dots.map((dot, i) => (
          <circle 
            key={`bg-${i}`} 
            cx={dot.x} 
            cy={dot.y} 
            r="0.15" 
            fill="rgba(0,0,0,0.08)" 
          />
        ))}

        {/* Nigeria Shape Outline */}
        <path 
          d={nigeriaPath} 
          fill="rgba(0,0,0,0.03)" 
          stroke="rgba(0,0,0,0.08)" 
          strokeWidth="0.4" 
        />

        {/* Dotted Grid Masked by Nigeria Shape */}
        <g mask="url(#nigeriaMask)">
          {dots.map((dot, i) => (
            <circle 
              key={`fg-${i}`} 
              cx={dot.x} 
              cy={dot.y} 
              r="0.25" 
              fill="rgba(0,0,0,0.2)" 
            />
          ))}
        </g>

        {/* Markers */}
        {markers.map((marker) => {
          const { x, y } = project(marker.lat, marker.lng);
          const isBee = marker.type === 'bee';
          
          return (
            <g 
              key={marker.id}
              onMouseEnter={() => setHoveredMarker(marker)}
              onMouseLeave={() => setHoveredMarker(null)}
              className="cursor-pointer group"
            >
              {/* Pulse Animation */}
              <motion.circle
                cx={x}
                cy={y}
                r="1.5"
                fill={isBee ? "rgba(255,204,0,0.4)" : "rgba(0,112,243,0.4)"}
                animate={{
                  r: [1.2, 3.0, 1.2],
                  opacity: [0.5, 0.1, 0.5]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Actual Node */}
              <circle
                cx={x}
                cy={y}
                r="0.8"
                fill={isBee ? "#FFCC00" : "#0070F3"}
                filter="url(#glow)"
                className="transition-all duration-300 group-hover:r-2"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredMarker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 pointer-events-none"
            style={{
                left: `${project(hoveredMarker.lat, hoveredMarker.lng).x}%`,
                top: `${(project(hoveredMarker.lat, hoveredMarker.lng).y / 81.65) * 100}%`,
                transform: 'translate(-50%, calc(-100% - 12px))'
            }}
          >
            <div className="bg-white border border-border/50 backdrop-blur-md p-4 rounded-2xl shadow-xl min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono tracking-tighter uppercase ${
                  hoveredMarker.type === 'bee' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-info/10 text-info border border-info/20'
                }`}>
                  {hoveredMarker.type}
                </div>
                <span className="text-[10px] font-mono text-slate-400">ID: {hoveredMarker.id.slice(0, 8)}</span>
              </div>
              <div className="font-mono">
                <div className="text-slate-900 text-sm font-bold leading-tight">{hoveredMarker.label}</div>
                <div className="text-slate-500 text-[11px] mt-1">{hoveredMarker.sublabel}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-slate-300 tracking-widest">Lat</span>
                  <span className="text-[10px] text-slate-600 font-mono">{hoveredMarker.lat.toFixed(4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-slate-300 tracking-widest">Lng</span>
                  <span className="text-[10px] text-slate-600 font-mono">{hoveredMarker.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
            {/* Pointer SVG */}
            <div className="w-full flex justify-center -mt-0.5">
              <div className="w-px h-6 bg-gradient-to-b from-slate-200 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Legend */}
      <div className="absolute top-8 right-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">Service_Bees</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-info shadow-sm" />
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">User_Nodes</span>
        </div>
      </div>
    </div>
  );
};
