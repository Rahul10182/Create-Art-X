import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import {
  Pencil, Square, Circle, Eraser, Slash, PaintBucket,
  Star, MoveRight, Triangle, Type, Move, Image, Minus, Plus
} from 'lucide-react';

const tools = [
  { value: 'select', icon: <Move />, title: 'Wand (Select/Move)' },
  { value: 'pen', icon: <Pencil />, title: 'Quill (Pen)' },
  { value: 'rectangle', icon: <Square />, title: 'Rectangular Spell' },
  { value: 'circle', icon: <Circle />, title: 'Protective Charm' },
  { value: 'triangle', icon: <Triangle />, title: 'Deathly Hallows' },
  { value: 'star', icon: <Star />, title: 'Starry Night Spell' },
  { value: 'arrow', icon: <MoveRight />, title: 'Direction Charm' },
  { value: 'line', icon: <Slash />, title: 'Straight Line Spell' },
  { value: 'text', icon: <Type />, title: 'Writing Charm' },
  { value: 'eraser', icon: <Eraser />, title: 'Vanishing Spell' },
  { value: 'fill', icon: <PaintBucket />, title: 'Color Changing Potion' },
  { value: 'image', icon: <Image />, title: 'Moving Portrait' },
];

const ToolControls = ({ 
  tool, 
  setTool, 
  color, 
  setColor, 
  fillColor, 
  setFillColor,
  lineWidth,
  setLineWidth,
  fontSize,
  setFontSize,
  eraserSize,
  setEraserSize
}) => (
  <div className="flex flex-wrap items-center gap-6 bg-[#1f1b18] text-gold px-6 py-5 rounded-2xl shadow-[0_5px_25px_rgba(255,215,0,0.15)] border border-gold">
    
    {/* Spell Color */}
    <div className="flex items-center gap-3">
      <span className="font-semibold text-gold tracking-wider font-harry">Spell Color:</span>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-10 h-10 rounded-full border-2 border-gold shadow-md ring-2 ring-gold hover:ring-4 transition-all cursor-wand"
      />
    </div>

    {/* Potion Fill */}
    <div className="flex items-center gap-3">
      <span className="font-semibold text-gold tracking-wider font-harry">Potion Fill:</span>
      <input
        type="color"
        value={fillColor}
        onChange={(e) => setFillColor(e.target.value)}
        className="w-10 h-10 rounded-full border-2 border-gold shadow-md ring-2 ring-gold hover:ring-4 transition-all cursor-wand"
      />
    </div>

    {/* Spell Strength (Line Width) */}
    <div className="flex items-center gap-3">
      <span className="font-semibold text-gold tracking-wider font-harry">Spell Strength:</span>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
          className="bg-[#543f33] text-gold p-1 rounded border border-gold hover:bg-gold/10 cursor-wand"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-harry">{lineWidth}</span>
        <button 
          onClick={() => setLineWidth(lineWidth + 1)}
          className="bg-[#543f33] text-gold p-1 rounded border border-gold hover:bg-gold/10 cursor-wand"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>

    {/* Eraser Size Adjustment */}
    {tool === 'eraser' && (
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gold tracking-wider font-harry">Eraser Size:</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setEraserSize(Math.max(5, eraserSize - 5))}
            className="bg-[#543f33] text-gold p-1 rounded border border-gold hover:bg-gold/10 cursor-wand"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-harry">{eraserSize}</span>
          <button 
            onClick={() => setEraserSize(eraserSize + 5)}
            className="bg-[#543f33] text-gold p-1 rounded border border-gold hover:bg-gold/10 cursor-wand"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    )}

    {/* Font Size for Text Tool */}
    {tool === 'text' && (
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gold tracking-wider font-harry">Font Size:</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFontSize(Math.max(8, fontSize - 2))}
            className="bg-[#543f33] text-gold p-1 rounded border border-gold hover:bg-gold/10 cursor-wand"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-harry">{fontSize}</span>
          <button 
            onClick={() => setFontSize(fontSize + 2)}
            className="bg-[#543f33] text-gold p-1 rounded border border-gold hover:bg-gold/10 cursor-wand"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    )}

    {/* Tool Buttons */}
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
            hover:!shadow-gold/40 !p-2 cursor-wand
        
            [&.Mui-selected]:!bg-[#e8c1b3]
            [&.Mui-selected]:!text-gold
            [&.Mui-selected]:!border-gold
            [&.Mui-selected]:!shadow-lg
            [&.Mui-selected:hover]:!bg-gold/20
          `}
        >
          <Tooltip title={title} arrow>
            <div className="flex flex-col items-center">
              {icon}
              <span className="text-xs mt-1 font-harry">
                {value === 'select' ? '' : 
                 value === 'pen' ? '' : 
                 value === 'rectangle' ? '' : 
                 value === 'circle' ? '' : 
                 value === 'triangle' ? '' : 
                 value === 'star' ? '' : 
                 value === 'arrow' ? '' : 
                 value === 'line' ? '' : 
                 value === 'text' ? '' : 
                 value === 'eraser' ? '' : 
                 value === 'fill' ? '' : 
                 ''}
              </span>
            </div>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </div>
);

export default ToolControls;
