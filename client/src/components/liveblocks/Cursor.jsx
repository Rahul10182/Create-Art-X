import React from "react";

export default function Cursor({ color, x, y, name }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        transform: `translateX(${x}px) translateY(${y}px)`,
        pointerEvents: "none",
        zIndex: 1000,
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
}