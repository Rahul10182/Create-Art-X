import React, { useEffect } from 'react';
import { useOthers, useUpdateMyPresence } from '@liveblocks/react';

const COLORS = [
  '#E57373', '#F06292', '#BA68C8', '#9575CD',
  '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1',
  '#4DB6AC', '#81C784', '#AED581', '#DCE775',
  '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65'
];

const Cursor = ({ color, x, y, name }) => {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        transform: `translateX(${x}px) translateY(${y}px)`,
        pointerEvents: "none",
        zIndex: 1000,
        transition: "transform 150ms ease-out"
      }}
    >
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
        />
      </svg>
      
      {name && (
        <div
          style={{
            position: "absolute",
            left: "24px",
            top: "0",
            backgroundColor: color,
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
};

export default function LiveCursors() {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  // Track local cursor position
  useEffect(() => {
    const handlePointerMove = (e) => {
      updateMyPresence({
        cursor: {
          x: Math.round(e.clientX),
          y: Math.round(e.clientY)
        }
      });
    };

    const handlePointerLeave = () => {
      updateMyPresence({ cursor: null });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [updateMyPresence]);

  // Filter and render other users' cursors
  return others
    .filter((user) => user.presence?.cursor != null)
    .map(({ connectionId, presence }) => (
      <Cursor
        key={connectionId}
        color={presence.color || COLORS[0]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        name={presence.name}
      />
    ));
}