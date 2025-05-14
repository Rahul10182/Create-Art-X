import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Star,
  Arrow,
  Image as KonvaImage,
  Group,
  Transformer,
} from "react-konva";
import { io } from "socket.io-client";
import { saveBoardForUser, getBoardForUser } from "../../apis/boardApi";
import useImage from "use-image";
import { toast } from "react-hot-toast";
import ToolControls from "../board/ToolControls";

const ErrorToast = ({ error }) => (
  <div className="text-red-500 p-2 border border-red-400 rounded bg-red-50">
    <strong>Error:</strong> {error.message}
    {error.details && <div className="text-sm mt-1">{error.details}</div>}
  </div>
);

const RenderImage = ({ shape, onUpdate, onError }) => {
  const [img, status] = useImage(shape.src, {
    onError: (error) => onError(error, `Loading image ${shape.src}`),
  });

  useEffect(() => {
    if (status === "failed") {
      onError(new Error(`Failed to load image: ${shape.src}`), "RenderImage");
    }
  }, [status, shape.src, onError]);

  return (
    <KonvaImage
      id={shape.id}
      image={img}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      draggable={true}
      onDragEnd={(e) => {
        try {
          onUpdate({
            id: shape.id,
            updates: {
              x: e.target.x(),
              y: e.target.y(),
            },
          });
        } catch (error) {
          onError(error, "Image drag update");
        }
      }}
    />
  );
};

const Canvas = ({ boardID, userId }) => {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [redoStack, setRedoStack] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [textPosition, setTextPosition] = useState(null);
  const [tool, setTool] = useState("select");
  const [color, setColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [eraserSize, setEraserSize] = useState(20);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth - 320,
    height: window.innerHeight - 40,
  });
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Error handling
  const handleError = useCallback((error, context = "") => {
    console.error(`[Canvas Error] ${context}:`, error);
    toast.error(
      <ErrorToast error={{ message: error.message, details: context }} />,
      { autoClose: 5000 }
    );

    if (
      error.message.includes("Network Error") &&
      reconnectAttempts.current < 3
    ) {
      reconnectAttempts.current += 1;
      setTimeout(initializeSocket, 2000 * reconnectAttempts.current);
    }
  }, []);

  // Socket initialization
  const initializeSocket = useCallback(() => {
    try {
      if (socketRef.current?.connected) return;

      const socketUrl =
        import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3001";
      socketRef.current = io(socketUrl, {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
        socketRef.current.emit("joinBoard", boardID);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        setConnectionStatus("disconnected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        handleError(error, "Socket connection");
      });

      // Drawing events
      socketRef.current.on("initialShapes", (initialShapes) => {
        console.log("Received initial shapes:", initialShapes);
        try {
          if (!Array.isArray(initialShapes))
            throw new Error("Invalid shapes data");
          setShapes(initialShapes);
        } catch (error) {
          handleError(error, "Processing initial shapes");
        }
      });

      socketRef.current.on("addShape", (shape) => {
        console.log("Received new shape:", shape);
        try {
          if (!shape?.id) throw new Error("Invalid shape data");
          setShapes((prev) => [...prev, shape]);
        } catch (error) {
          handleError(error, "Adding remote shape");
        }
      });

      socketRef.current.on("shapeUpdated", ({ shapeId, updates }) => {
        console.log("Received shape update:", { shapeId, updates });
        try {
          if (!shapeId || !updates) throw new Error("Invalid update data");
          setShapes((prev) =>
            prev.map((shape) =>
              shape.id === shapeId ? { ...shape, ...updates } : shape
            )
          );
        } catch (error) {
          handleError(error, "Updating remote shape");
        }
      });

      socketRef.current.on("shapeDeleted", (shapeId) => {
        console.log("Received shape deletion:", shapeId);
        try {
          if (!shapeId) throw new Error("Missing shape ID");
          setShapes((prev) => prev.filter((shape) => shape.id !== shapeId));
        } catch (error) {
          handleError(error, "Deleting remote shape");
        }
      });

      socketRef.current.on("boardCleared", () => {
        console.log("Board cleared");
        setShapes([]);
      });
    } catch (error) {
      handleError(error, "Socket initialization");
    }
  }, [boardID, handleError]);

  // Socket lifecycle
  useEffect(() => {
    initializeSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.off(); // Remove all listeners
        socketRef.current.disconnect();
      }
    };
  }, [initializeSocket]);

  // Drawing operations - these are good as is
  const emitAddShape = useCallback(
    (shape) => {
      try {
        if (!socketRef.current?.connected) {
          console.error("Socket not connected when trying to add shape");
          return;
        }
        socketRef.current.emit("addShape", {
          boardId: boardID,
          shape,
        });
      } catch (error) {
        handleError(error, "Adding shape");
      }
    },
    [boardID, handleError]
  );

  const emitUpdateShape = useCallback(
    (shapeId, updates) => {
      try {
        if (!socketRef.current?.connected) {
          console.error("Socket not connected when trying to update shape");
          return;
        }
        socketRef.current.emit("updateShape", {
          boardId: boardID,
          shapeId,
          updates,
        });
      } catch (error) {
        handleError(error, "Updating shape");
      }
    },
    [boardID, handleError]
  );

  const emitDeleteShape = useCallback(
    (shapeId) => {
      try {
        if (!socketRef.current?.connected) {
          console.error("Socket not connected when trying to delete shape");
          return;
        }
        socketRef.current.emit("deleteShape", {
          boardId: boardID,
          shapeId,
        });
      } catch (error) {
        handleError(error, "Deleting shape");
      }
    },
    [boardID, handleError]
  );

  const emitClearBoard = useCallback(() => {
    try {
      if (!socketRef.current?.connected)
        throw new Error("Socket not connected");
      socketRef.current.emit("clearBoard", boardID);
    } catch (error) {
      handleError(error, "Clearing board");
    }
  }, [boardID, handleError]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      try {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          const height = containerRef.current.offsetHeight;
          setCanvasSize({ width, height });
        }
      } catch (error) {
        handleError(error, "Window resize");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleError]);

  // Load initial shapes
  useEffect(() => {
    const fetchSavedShapes = async () => {
      try {
        const savedData = await getBoardForUser(boardID, userId);
        if (savedData?.shapes) {
          setCanvasSize(savedData.canvas?.size || canvasSize);
          setShapes(savedData.shapes);
        }
      } catch (error) {
        handleError(error, "Loading saved board");
      }
    };
    fetchSavedShapes();
  }, [boardID, userId]);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      saveBoardForUser(boardID, userId, shapes, canvasSize).catch((error) =>
        handleError(error, "Auto-saving board")
      );
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [shapes, boardID, userId, canvasSize, handleError]);

  // Transformer and text area focus
  useEffect(() => {
    try {
      if (trRef.current && selectedId) {
        trRef.current.nodes([stageRef.current.findOne("#" + selectedId)]);
        trRef.current.getLayer().batchDraw();
      }
    } catch (error) {
      handleError(error, "Transformer setup");
    }
  }, [selectedId, handleError]);

  useEffect(() => {
    try {
      if (textPosition && textAreaRef.current) {
        textAreaRef.current.focus();
      }
    } catch (error) {
      handleError(error, "Text focus");
    }
  }, [textPosition, handleError]);

  // Clear text input when tool changes
  useEffect(() => {
    if (tool !== "text") {
      setCurrentText("");
      setTextPosition(null);
    }
  }, [tool]);

  const handleManualSave = async () => {
    try {
      await saveBoardForUser(boardID, userId, shapes, canvasSize);
      toast.success("Board saved successfully!");
    } catch (error) {
      handleError(error, "Manual save");
    }
  };

  // Drawing handlers
  const handleMouseDown = (e) => {
    try {
      if (tool === "select") {
        const clickedOnEmpty = e.target === e.target.getStage();
        setSelectedId(clickedOnEmpty ? null : e.target.id());
        return;
      }

      if (tool === "text") {
        const pos = e.target.getStage().getPointerPosition();
        setTextPosition(pos);
        return;
      }

      if (tool === "eraser") {
        const pos = e.target.getStage().getPointerPosition();
        const shapeToErase = shapes.find((shape) => {
          const node = stageRef.current.findOne("#" + shape.id);
          if (!node) return false;
          return node.isPointInPos(pos);
        });

        if (shapeToErase) {
          emitDeleteShape(shapeToErase.id);
        }
        return;
      }

      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      const newShape = {
        id: Date.now().toString(),
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radius: 0,
        points: tool === "pen" ? [pos.x, pos.y] : [pos.x, pos.y, pos.x, pos.y],
        stroke: color,
        strokeWidth: lineWidth,
        fill: fillColor === "transparent" ? undefined : fillColor,
        fontSize: fontSize,
        rotation: 0,
        outerRadius: 0,
        innerRadius: 0,
      };

      if (tool === "star") {
        newShape.outerRadius = 0;
        newShape.innerRadius = 0;
        newShape.numPoints = 5;
      }

      // Add shape locally immediately for responsiveness
      setShapes((prev) => [...prev, newShape]);
      setSelectedId(newShape.id);
      setRedoStack([]);

      // Then emit to server
      emitAddShape(newShape);
    } catch (error) {
      handleError(error, "Mouse down event");
    }
  };

  const handleMouseMove = (e) => {
    try {
      if (!isDrawing || tool === "eraser" || tool === "fill") return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const lastShape = shapes[shapes.length - 1];

      if (!lastShape) return;

      let updates = {};

      if (tool === "pen") {
        updates = {
          points: [...lastShape.points, point.x, point.y],
        };
      } else {
        switch (tool) {
          case "rectangle":
            updates = {
              width: point.x - lastShape.x,
              height: point.y - lastShape.y,
            };
            break;
          case "circle":
          case "triangle":
            updates = {
              radius: Math.sqrt(
                Math.pow(point.x - lastShape.x, 2) +
                  Math.pow(point.y - lastShape.y, 2)
              ),
            };
            break;
          case "line":
          case "arrow":
            updates = {
              points: [lastShape.x, lastShape.y, point.x, point.y],
            };
            break;
          case "star":
            updates = {
              outerRadius: Math.sqrt(
                Math.pow(point.x - lastShape.x, 2) +
                  Math.pow(point.y - lastShape.y, 2)
              ),
              innerRadius:
                Math.sqrt(
                  Math.pow(point.x - lastShape.x, 2) +
                    Math.pow(point.y - lastShape.y, 2)
                ) / 2,
            };
            break;
          default:
            break;
        }
      }

      // Update locally first for responsiveness
      setShapes((prev) =>
        prev.map((shape, i) =>
          i === prev.length - 1 ? { ...shape, ...updates } : shape
        )
      );

      // Then emit to server
      emitUpdateShape(lastShape.id, updates);
    } catch (error) {
      handleError(error, "Mouse move event");
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTextKeyDown = (e) => {
    try {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!currentText.trim()) {
          setTextPosition(null);
          return;
        }

        const newText = {
          id: selectedId || Date.now().toString(),
          type: "text",
          x: textPosition.x,
          y: textPosition.y,
          text: currentText,
          fontSize: fontSize,
          fontFamily: "Times New Roman",
          fill: color,
          draggable: true,
        };

        if (selectedId) {
          emitUpdateShape(selectedId, newText);
        } else {
          emitAddShape(newText);
        }

        setCurrentText("");
        setTextPosition(null);
        setSelectedId(null);
      } else if (e.key === "Escape") {
        setCurrentText("");
        setTextPosition(null);
        setSelectedId(null);
      }
    } catch (error) {
      handleError(error, "Text input");
    }
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const img = new window.Image();
          img.src = event.target.result;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = () => {
              throw new Error("Failed to load image");
            };
          });

          const newImage = {
            id: Date.now().toString(),
            type: "image",
            src: event.target.result,
            x: 100,
            y: 100,
            width: img.width > 300 ? 300 : img.width,
            height: img.height > 200 ? 200 : img.height,
            draggable: true,
          };

          emitAddShape(newImage);
          setSelectedId(newImage.id);
        } catch (error) {
          handleError(error, "Image upload");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      handleError(error, "File handling");
    }
  };

  const handleUndo = () => {
    try {
      if (shapes.length === 0) return;
      const newShapes = [...shapes];
      const popped = newShapes.pop();
      setShapes(newShapes);
      setRedoStack([...redoStack, popped]);
      // Note: Undo is local only to avoid complexity in sync
    } catch (error) {
      handleError(error, "Undo operation");
    }
  };

  const handleRedo = () => {
    try {
      if (redoStack.length === 0) return;
      const shape = redoStack[redoStack.length - 1];
      setShapes([...shapes, shape]);
      setRedoStack(redoStack.slice(0, -1));
      // Note: Redo is local only to avoid complexity in sync
    } catch (error) {
      handleError(error, "Redo operation");
    }
  };

  const handleDownload = () => {
    try {
      const uri = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
      });
      const link = document.createElement("a");
      link.download = "canvas-drawing.png";
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      handleError(error, "Download");
    }
  };

  const renderShape = (shape) => {
    const commonProps = {
      id: shape.id,
      draggable: tool === "select",
      onClick: () => setSelectedId(shape.id),
      onDragEnd: (e) => {
        emitUpdateShape(shape.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      },
    };

    switch (shape.type) {
      case "rectangle":
        return (
          <Rect
            {...commonProps}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
          />
        );
      case "circle":
        return (
          <Circle
            {...commonProps}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
          />
        );
      case "line":
      case "arrow":
        return (
          <Group {...commonProps}>
            <Line
              points={shape.points}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              lineCap="round"
              lineJoin="round"
            />
            {shape.type === "arrow" && (
              <Arrow
                points={shape.points}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
                fill={shape.stroke}
                pointerLength={10}
                pointerWidth={10}
              />
            )}
          </Group>
        );
      case "pen":
        return (
          <Line
            {...commonProps}
            points={shape.points}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={0.1}
          />
        );
      case "triangle":
        return (
          <Group {...commonProps}>
            <Line
              points={[
                0,
                -shape.radius,
                shape.radius,
                shape.radius,
                -shape.radius,
                shape.radius,
                0,
                -shape.radius,
              ]}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              fill={shape.fill}
              closed
            />
          </Group>
        );
      case "star":
        return (
          <Star
            {...commonProps}
            x={shape.x}
            y={shape.y}
            numPoints={5}
            outerRadius={shape.outerRadius}
            innerRadius={shape.innerRadius}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
          />
        );
      case "text":
        return (
          <Text
            {...commonProps}
            x={shape.x}
            y={shape.y}
            text={shape.text}
            fontSize={shape.fontSize}
            fontFamily={shape.fontFamily}
            fill={shape.fill}
            onDblClick={(e) => {
              e.cancelBubble = true;
              setSelectedId(shape.id);
              setTextPosition({ x: shape.x, y: shape.y });
              setCurrentText(shape.text);
            }}
          />
        );
      case "image":
        return (
          <RenderImage
            key={shape.id}
            shape={shape}
            onUpdate={({ id, updates }) => emitUpdateShape(id, updates)}
            onError={handleError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Connection status indicator */}
      <div
        className={`absolute top-2 right-2 p-2 rounded-md text-sm ${
          connectionStatus === "connected"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {connectionStatus === "connected" ? "Connected" : "Disconnected"}
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 pt-2 pb-2"
        style={{ height: "calc(100vh - 1rem)", overflow: "hidden" }}
      >
        <div className="relative w-full h-full">
          <Stage
            ref={stageRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              display: "block",
              width: "100%",
              height: "88%",
            }}
            className="border-4 border-gold rounded-lg shadow-xl bg-white"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              {shapes.map((shape) => (
                <React.Fragment key={shape.id}>
                  {renderShape(shape)}
                </React.Fragment>
              ))}
              {selectedId && tool === "select" && (
                <Transformer
                  ref={trRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  rotateEnabled={true}
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ]}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    const shape = shapes.find((s) => s.id === selectedId);
                    if (!shape) return;

                    let updates = {
                      x: node.x(),
                      y: node.y(),
                      rotation: node.rotation(),
                    };

                    if (shape.type === "image") {
                      updates.width = Math.max(5, shape.width * scaleX);
                      updates.height = Math.max(5, shape.height * scaleY);
                    } else if (shape.type === "text") {
                      updates.fontSize = Math.max(
                        8,
                        shape.fontSize * ((scaleX + scaleY) / 2)
                      );
                    } else {
                      updates.width = shape.width * scaleX;
                      updates.height = shape.height * scaleY;
                      if (shape.radius)
                        updates.radius = shape.radius * ((scaleX + scaleY) / 2);
                      if (shape.outerRadius)
                        updates.outerRadius =
                          shape.outerRadius * ((scaleX + scaleY) / 2);
                      if (shape.innerRadius)
                        updates.innerRadius =
                          shape.innerRadius * ((scaleX + scaleY) / 2);
                    }

                    emitUpdateShape(selectedId, updates);
                  }}
                />
              )}
            </Layer>
          </Stage>

          {textPosition && (
            <div
              style={{
                position: "absolute",
                left: `${
                  textPosition.x +
                  (stageRef.current?.container().offsetLeft || 0)
                }px`,
                top: `${
                  textPosition.y +
                  (stageRef.current?.container().offsetTop || 0)
                }px`,
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "4px",
                  background: "white",
                  border: "2px solid #d4af37",
                  borderRadius: "4px",
                  boxShadow: "0 0 10px rgba(212, 175, 55, 0.5)",
                }}
              >
                <textarea
                  ref={textAreaRef}
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  onKeyDown={handleTextKeyDown}
                  onBlur={() => {
                    if (currentText.trim()) {
                      handleTextKeyDown({
                        key: "Enter",
                        preventDefault: () => {},
                      });
                    } else {
                      setTextPosition(null);
                    }
                  }}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: "Times New Roman",
                    color: color,
                    outline: "none",
                    resize: "none",
                    width: "200px",
                    minHeight: "50px",
                    border: "1px solid #ccc",
                    padding: "4px",
                  }}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 pt-4 ml-4 pr-4">
        <ToolControls
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          fillColor={fillColor}
          setFillColor={setFillColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          fontSize={fontSize}
          setFontSize={setFontSize}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          selectedId={selectedId}
          shapes={shapes}
          setShapes={setShapes}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          handleClear={emitClearBoard}
          handleDownload={handleDownload}
          handleManualSave={handleManualSave}
          handleImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
};

export default Canvas;
