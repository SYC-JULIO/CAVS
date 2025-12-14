import React from 'react';
import { AssessmentData } from '../types';
import { DIMENSION_NAMES } from '../constants';
import { getDimensionRiskLevel } from '../utils/scoring';

interface Props {
  dimensions: AssessmentData['dimensions'];
}

export const RadarChart: React.FC<Props> = ({ dimensions }) => {
  const scores = [
    dimensions.physical,
    dimensions.family,
    dimensions.mental,
    dimensions.management
  ];

  // Radar Chart Config
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const maxScale = 50; // Assume max score for normalization
  
  // Calculate points
  const points = scores.map((score, i) => {
    const angle = (Math.PI / 2) * i - Math.PI / 2; // -PI/2 to start at top
    const normalizedScore = Math.min(score, maxScale);
    const r = (normalizedScore / maxScale) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Calculate background polygons (levels)
  const levels = [10, 25, 40]; // Green threshold, Yellow threshold, Outer
  const levelPolygons = levels.map((levelVal) => {
     return [0, 1, 2, 3].map(i => {
       const angle = (Math.PI / 2) * i - Math.PI / 2;
       const r = (levelVal / maxScale) * radius;
       const x = center + r * Math.cos(angle);
       const y = center + r * Math.sin(angle);
       return `${x},${y}`;
     }).join(' ');
  });

  // Axis labels
  const labels = DIMENSION_NAMES.map((name, i) => {
    const angle = (Math.PI / 2) * i - Math.PI / 2;
    const r = radius + 25; // Padding for text
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, text: name };
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col items-center">
      <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider self-start w-full border-b pb-2">風險面向雷達圖分析</h3>
      
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background Grid */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Axis Lines */}
          {[0, 1, 2, 3].map(i => {
             const angle = (Math.PI / 2) * i - Math.PI / 2;
             const x = center + radius * Math.cos(angle);
             const y = center + radius * Math.sin(angle);
             return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
          })}

          {/* Level Zones (approximate visual guides) */}
          {/* Green Zone (0-10) */}
          <polygon points={levelPolygons[0]} fill="#dcfce7" fillOpacity="0.3" stroke="#86efac" strokeDasharray="4 4"/>
          {/* Yellow Zone (11-25) */}
          <polygon points={levelPolygons[1]} fill="none" stroke="#fde047" strokeDasharray="4 4"/>
          {/* Red Zone (26+) - implied outer */}

          {/* Data Polygon */}
          <polygon points={points} fill="rgba(13, 148, 136, 0.4)" stroke="#0d9488" strokeWidth="2" />
          
          {/* Data Points */}
          {scores.map((score, i) => {
             const angle = (Math.PI / 2) * i - Math.PI / 2;
             const normalizedScore = Math.min(score, maxScale);
             const r = (normalizedScore / maxScale) * radius;
             const x = center + r * Math.cos(angle);
             const y = center + r * Math.sin(angle);
             return (
               <circle key={i} cx={x} cy={y} r="4" fill="#0f766e" />
             );
          })}

          {/* Labels */}
          {labels.map((l, i) => (
            <text 
              key={i} 
              x={l.x} 
              y={l.y} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="text-[10px] fill-slate-500 font-medium"
            >
              {l.text}
            </text>
          ))}
        </svg>
      </div>

      <div className="w-full mt-4 grid grid-cols-2 gap-4">
        {scores.map((score, index) => {
          const risk = getDimensionRiskLevel(score);
          const colorClass = risk === 'Red' ? 'text-red-600' : risk === 'Yellow' ? 'text-yellow-600' : 'text-green-600';
          return (
             <div key={index} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="text-xs text-slate-600">{DIMENSION_NAMES[index]}</span>
                <span className={`text-sm font-bold ${colorClass}`}>
                  {score} 分 ({risk === 'Red' ? '紅' : risk === 'Yellow' ? '黃' : '綠'})
                </span>
             </div>
          );
        })}
      </div>
    </div>
  );
};