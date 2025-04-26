import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import {
  Pencil, Square, Circle, Eraser, Slash, PaintBucket,
  Star, MoveRight, Triangle
} from 'lucide-react';

const tools = [
  { value: 'pen', icon: <Pencil />, title: 'Pen' },
  { value: 'rectangle', icon: <Square />, title: 'Rectangle' },
  { value: 'circle', icon: <Circle />, title: 'Circle' },
  { value: 'triangle', icon: <Triangle />, title: 'Triangle' },
  { value: 'star', icon: <Star />, title: 'Star' },
  { value: 'arrow', icon: <MoveRight />, title: 'Arrow' },
  { value: 'line', icon: <Slash />, title: 'Line' },
  { value: 'eraser', icon: <Eraser />, title: 'Eraser' },
  { value: 'fill', icon: <PaintBucket />, title: 'Fill' },
];

const ToolControls = ({ tool, setTool, color, setColor }) => (
  <div className="flex flex-wrap items-center gap-6 bg-[#1f1b18] text-gold px-6 py-5 rounded-2xl shadow-[0_5px_25px_rgba(255,215,0,0.15)] border border-gold">
    <div className="flex items-center gap-3">
      <span className="font-semibold text-gold tracking-wider">Wand Color:</span>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-10 h-10 rounded-full border-2 border-gold shadow-md ring-2 ring-gold hover:ring-4 transition-all"
      />
    </div>

    <ToggleButtonGroup
      value={tool}
      exclusive
      onChange={(e, newTool) => {
        if (newTool) setTool(newTool);
      }}
      aria-label="drawing tools"
      className="flex gap-2 flex-wrap"
    >
      {tools.map(({ value, icon, title }) => (
        <ToggleButton
        key={value}
        value={value}
        className={`
          !text-gold !bg-[#543f33] !border !border-gold !rounded-xl
          !hover:bg-gold/10 !transition-all !duration-300 !shadow-md
          hover:!shadow-gold/40 !p-2
      
          [&.Mui-selected]:!bg-[#e8c1b3]
          [&.Mui-selected]:!text-gold
          [&.Mui-selected]:!border-gold
          [&.Mui-selected]:!shadow-lg
          [&.Mui-selected:hover]:!bg-gold/20
        `}
      >
        <Tooltip title={title}>{icon}</Tooltip>
      </ToggleButton>
      
      ))}
    </ToggleButtonGroup>
  </div>
);

export default ToolControls;
