import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import {
  Pencil, Square, Circle, Eraser, Slash, PaintBucket,
  Star, MoveRight, Triangle
} from 'lucide-react';

const ToolControls = ({ tool, setTool, color, setColor }) => (
  <div className="flex flex-wrap items-center gap-6 bg-white px-6 py-4 rounded-lg shadow-lg">
    <div className="flex items-center gap-2">
      <span className="font-medium text-purple-700">Color:</span>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-10 h-10 rounded-full border-2 border-purple-400 shadow cursor-pointer"
      />
    </div>

    <ToggleButtonGroup
      value={tool}
      exclusive
      onChange={(e, newTool) => {
        if (newTool) setTool(newTool);
      }}
      aria-label="drawing tools"
    >
      <ToggleButton value="pen"><Tooltip title="Pen"><Pencil /></Tooltip></ToggleButton>
      <ToggleButton value="rectangle"><Tooltip title="Rectangle"><Square /></Tooltip></ToggleButton>
      <ToggleButton value="circle"><Tooltip title="Circle"><Circle /></Tooltip></ToggleButton>
      <ToggleButton value="triangle"><Tooltip title="Triangle"><Triangle /></Tooltip></ToggleButton>
      <ToggleButton value="star"><Tooltip title="Star"><Star /></Tooltip></ToggleButton>
      <ToggleButton value="arrow"><Tooltip title="Arrow"><MoveRight /></Tooltip></ToggleButton>
      <ToggleButton value="line"><Tooltip title="Line"><Slash /></Tooltip></ToggleButton>
      <ToggleButton value="eraser"><Tooltip title="Eraser"><Eraser /></Tooltip></ToggleButton>
      <ToggleButton value="fill"><Tooltip title="Fill"><PaintBucket /></Tooltip></ToggleButton>
    </ToggleButtonGroup>
  </div>
);

export default ToolControls;
