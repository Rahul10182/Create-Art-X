import React, { useState, useRef, useEffect } from "react";
import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { saveBoardForUser, getBoardForUser } from "../../apis/boardApi";
import Cursor from "../../components/liveblocks/Cursor"; // Import your existing Cursor component

const Canvas = ({ tool, color, fillColor, boardID, userId }) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Drawing state
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [canvasSize, setCanvasSize] = useState([]);

  // Liveblocks presence
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  // Get mouse position relative to canvas
  const getMousePos = (e) => {
    const rect = canvasSize.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Track cursor position for live collaboration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerMove = (e) => {
      const pos = getMousePos(e);
      updateMyPresence({
        cursor: {
          x: pos.x,
          y: pos.y
        }
      });
    };

    const handlePointerLeave = () => {
      updateMyPresence({ cursor: null });
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [updateMyPresence]);

  // Save/Load functions (unchanged)
  const handleManualSave = async () => {
    try {
      await saveBoardForUser(boardID, userId, shapes);
      console.log("Board saved manually.");
    } catch (error) {
      console.error("Manual save failed", error);
    }
  };

  const fetchSavedShapes = async () => {
    try {
      const savedData = await getBoardForUser(boardID, userId);
      if (savedData && savedData.shapes) {
        setCanvasSize(savedData.canvas.size);
        console.log(savedData.canvas.size);
        setShapes(savedData.shapes);
      }
    } catch (error) {
      console.error("Failed to load saved board", error);
    }
  };

  // Auto-save effect (unchanged)
  useEffect(() => {
    fetchSavedShapes();
  }, [boardID, userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveBoardForUser(boardID, userId, shapes)
        .then(() => console.log("Auto-saved board"))
        .catch((err) => console.error("Auto-save failed", err));
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [shapes]);

  // Drawing rendering (unchanged)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawShape = (shape) => {
      const fill = shape.fillColor && shape.fillColor !== "transparent" ? shape.fillColor : null;
      ctx.lineWidth = 2;

      switch (shape.type) {
        case "rectangle":
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(shape.startX, shape.startY, shape.width, shape.height);
          }
          ctx.strokeStyle = shape.color;
          ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
          break;

        case "circle":
          ctx.beginPath();
          ctx.arc(shape.startX, shape.startY, shape.radius, 0, 2 * Math.PI);
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
          }
          ctx.strokeStyle = shape.color;
          ctx.stroke();
          break;

        case "line":
          ctx.beginPath();
          ctx.moveTo(shape.start.x, shape.start.y);
          ctx.lineTo(shape.end.x, shape.end.y);
          ctx.strokeStyle = shape.color;
          ctx.stroke();
          break;

        case "pen":
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach((point) => ctx.lineTo(point.x, point.y));
          ctx.strokeStyle = shape.color;
          ctx.stroke();
          break;

        case "triangle":
          ctx.beginPath();
          ctx.moveTo(shape.startX, shape.startY);
          ctx.lineTo(shape.endX, shape.endY);
          ctx.lineTo(2 * shape.startX - shape.endX, shape.endY);
          ctx.closePath();
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
          }
          ctx.strokeStyle = shape.color;
          ctx.stroke();
          break;

        case "star":
          const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
              x = cx + Math.cos(rot) * outerRadius;
              y = cy + Math.sin(rot) * outerRadius;
              ctx.lineTo(x, y);
              rot += step;

              x = cx + Math.cos(rot) * innerRadius;
              y = cy + Math.sin(rot) * innerRadius;
              ctx.lineTo(x, y);
              rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            if (fill) {
              ctx.fillStyle = fill;
              ctx.fill();
            }
            ctx.strokeStyle = shape.color;
            ctx.stroke();
          };
          drawStar(shape.cx, shape.cy, 5, shape.outerRadius, shape.innerRadius);
          break;

        case "arrow":
          const headLength = 10;
          const dx = shape.end.x - shape.start.x;
          const dy = shape.end.y - shape.start.y;
          const angle = Math.atan2(dy, dx);

          ctx.beginPath();
          ctx.moveTo(shape.start.x, shape.start.y);
          ctx.lineTo(shape.end.x, shape.end.y);
          ctx.strokeStyle = shape.color;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(shape.end.x, shape.end.y);
          ctx.lineTo(
            shape.end.x - headLength * Math.cos(angle - Math.PI / 6),
            shape.end.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            shape.end.x - headLength * Math.cos(angle + Math.PI / 6),
            shape.end.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.lineTo(shape.end.x, shape.end.y);
          ctx.closePath();
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
          }
          ctx.stroke();
          break;

        case "image":
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
          };
          img.src = shape.src;
          break;

        default:
          break;
      }
    };

    shapes.forEach(drawShape);
    if (currentShape) drawShape(currentShape);
  }, [shapes, currentShape]);

  // Mouse event handlers (unchanged except for type annotations)
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setDrawing(true);
    setStartPos(pos);
    setRedoStack([]);

    if (tool === "pen") {
      setCurrentShape({ type: "pen", points: [pos], color });
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (pos.x < 0 || pos.y < 0 || pos.x > canvas.width || pos.y > canvas.height) return;

    if (tool === "eraser") {
      const ctx = canvas.getContext("2d");
      const eraseSize = 20;
      ctx.clearRect(pos.x - eraseSize / 2, pos.y - eraseSize / 2, eraseSize, eraseSize);
      return;
    }

    switch (tool) {
      case "pen":
        setCurrentShape((prev) => ({ ...prev, points: [...prev.points, pos] }));
        break;
      case "rectangle":
        setCurrentShape({ type: "rectangle", startX: startPos.x, startY: startPos.y, width: pos.x - startPos.x, height: pos.y - startPos.y, color, fillColor });
        break;
      case "circle":
        const radius = Math.sqrt((pos.x - startPos.x) ** 2 + (pos.y - startPos.y) ** 2);
        setCurrentShape({ type: "circle", startX: startPos.x, startY: startPos.y, radius, color, fillColor });
        break;
      case "line":
        setCurrentShape({ type: "line", start: startPos, end: pos, color });
        break;
      case "triangle":
        setCurrentShape({ type: "triangle", startX: startPos.x, startY: startPos.y, endX: pos.x, endY: pos.y, color, fillColor });
        break;
      case "star":
        const outerRadius = Math.sqrt((pos.x - startPos.x) ** 2 + (pos.y - startPos.y) ** 2);
        setCurrentShape({ type: "star", cx: startPos.x, cy: startPos.y, outerRadius, innerRadius: outerRadius / 2.5, color, fillColor });
        break;
      case "arrow":
        setCurrentShape({ type: "arrow", start: startPos, end: pos, color, fillColor });
        break;
      default:
        break;
    }
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    setDrawing(false);
    if (currentShape) {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
    }
  };

  // Toolbar actions (unchanged)
  const handleUndo = () => {
    if (shapes.length === 0) return;
    const newShapes = [...shapes];
    const popped = newShapes.pop();
    setShapes(newShapes);
    setRedoStack((prev) => [...prev, popped]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const shape = redoStack.pop();
    setShapes((prev) => [...prev, shape]);
    setRedoStack([...redoStack]);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const shape = {
          type: "image",
          src: reader.result,
          x: 100,
          y: 100,
          width: 200,
          height: 150
        };
        setShapes((prev) => [...prev, shape]);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex justify-center gap-4 mb-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleManualSave}>Save</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={handleUndo}>Undo</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleRedo}>Redo</button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={handleDownload}>Download</button>
        <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => fileInputRef.current.click()}>Upload Image</button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
      </div>

      {/* Wrap canvas in relative container for cursors */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="border-4 border-purple-300 bg-white rounded-lg shadow-xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setDrawing(false);
            setCurrentShape(null);
          }}
        />
        
        {/* Render other users' cursors */}
        {others
          .filter((user) => user.presence?.cursor != null)
          .map(({ connectionId, presence }) => (
            <Cursor
              key={connectionId}
              color={presence.color || "#000"}
              x={presence.cursor.x}
              y={presence.cursor.y}
              name={presence.name}
            />
          ))}
      </div>
    </div>
  );
};

export default Canvas;