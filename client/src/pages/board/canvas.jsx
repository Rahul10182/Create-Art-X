import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Star, Arrow, Image as KonvaImage, Group, Transformer } from 'react-konva';
import { saveBoardForUser, getBoardForUser } from "../../apis/boardApi";
import useImage from 'use-image';
import ToolControls from './ToolControls';

const RenderImage = ({ shape, shapes, setShapes, setSelectedId }) => {
  const [img] = useImage(shape.src);
  
  return (
    <KonvaImage
      id={shape.id}
      image={img}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      draggable={shape.draggable}
      onDragEnd={(e) => {
        const updatedShapes = shapes.map(s => {
          if (s.id === shape.id) {
            return {
              ...s,
              x: e.target.x(),
              y: e.target.y()
            };
          }
          return s;
        });
        setShapes(updatedShapes);
      }}
      onClick={() => setSelectedId(shape.id)}
    />
  );
};

const Canvas = ({ boardID, userId }) => {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [redoStack, setRedoStack] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [eraserSize, setEraserSize] = useState(20);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth - 320, height: window.innerHeight - 40 });
  
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setCanvasSize({
          width: width,
          height: height
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load saved shapes on component mount
  const fetchSavedShapes = async () => {
    try {
      const savedData = await getBoardForUser(boardID, userId);
      if (savedData && savedData.shapes) {
        setCanvasSize(savedData.canvas?.size || { width: window.innerWidth - 320, height: window.innerHeight - 40 });
        setShapes(savedData.shapes);
      }
    } catch (error) {
      console.error("Failed to load saved board", error);
    }
  };

  useEffect(() => {
    fetchSavedShapes();
  }, [boardID, userId]);

  // Auto-save every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      saveBoardForUser(boardID, userId, shapes, canvasSize)
        .then(() => console.log("Auto-saved board"))
        .catch((err) => console.error("Auto-save failed", err));
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [shapes, boardID, userId, canvasSize]);

  // Handle transformer and text area focus
  useEffect(() => {
    if (trRef.current && selectedId) {
      trRef.current.nodes([stageRef.current.findOne('#' + selectedId)]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  useEffect(() => {
    if (textPosition && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [textPosition]);

  // Clear text input when tool changes
  useEffect(() => {
    if (tool !== 'text') {
      setCurrentText('');
      setTextPosition(null);
    }
  }, [tool]);

  const handleManualSave = async () => {
    try {
      await saveBoardForUser(boardID, userId, shapes, canvasSize);
      console.log("Board saved manually.");
    } catch (error) {
      console.error("Manual save failed", error);
    }
  };

  const handleMouseDown = (e) => {
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      } else {
        setSelectedId(e.target.id());
      }
      return;
    }

    if (tool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      setTextPosition(pos);
      return;
    }

    if (tool === 'eraser') {
      const pos = e.target.getStage().getPointerPosition();
      const shapeToErase = shapes.find(shape => {
        const node = stageRef.current.findOne('#' + shape.id);
        if (!node) return false;
        
        if (shape.type === 'image') {
          return (
            pos.x >= node.x() && 
            pos.x <= node.x() + node.width() && 
            pos.y >= node.y() && 
            pos.y <= node.y() + node.height()
          );
        }
        
        return node.getClientRect().x <= pos.x && 
          node.getClientRect().y <= pos.y && 
          node.getClientRect().x + node.getClientRect().width >= pos.x && 
          node.getClientRect().y + node.getClientRect().height >= pos.y;
      });
      
      if (shapeToErase) {
        setShapes(shapes.filter(s => s.id !== shapeToErase.id));
      }
      return;
    }

    if (tool === 'fill') {
      const pos = e.target.getStage().getPointerPosition();
      const shapeToFill = shapes.find(shape => {
        const node = stageRef.current.findOne('#' + shape.id);
        if (!node) return false;
        
        return node.getClientRect().x <= pos.x && 
          node.getClientRect().y <= pos.y && 
          node.getClientRect().x + node.getClientRect().width >= pos.x && 
          node.getClientRect().y + node.getClientRect().height >= pos.y;
      });
      
      if (shapeToFill) {
        setShapes(shapes.map(s => {
          if (s.id === shapeToFill.id) {
            return {
              ...s,
              fill: fillColor === 'transparent' ? undefined : fillColor
            };
          }
          return s;
        }));
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
      points: [pos.x, pos.y, pos.x, pos.y],
      stroke: color,
      strokeWidth: lineWidth,
      fill: fillColor === 'transparent' ? undefined : fillColor,
      fontSize: fontSize,
      rotation: 0,
      outerRadius: 0,
      innerRadius: 0,
    };

    if (tool === 'star') {
      newShape.outerRadius = 0;
      newShape.innerRadius = 0;
      newShape.numPoints = 5;
    }

    setShapes([...shapes, newShape]);
    setSelectedId(newShape.id);
    setRedoStack([]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || tool === 'eraser' || tool === 'fill') return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastShape = shapes[shapes.length - 1];
    
    if (!lastShape) return;

    if (tool === 'pen') {
      const newPoints = [...lastShape.points, point.x, point.y];
      const updatedShape = { ...lastShape, points: newPoints };
      const newShapes = [...shapes];
      newShapes[newShapes.length - 1] = updatedShape;
      setShapes(newShapes);
      return;
    }

    const updatedShape = { ...lastShape };
    
    switch (tool) {
      case 'rectangle':
        updatedShape.width = point.x - lastShape.x;
        updatedShape.height = point.y - lastShape.y;
        break;
      case 'circle':
      case 'triangle':
        const radius = Math.sqrt(
          Math.pow(point.x - lastShape.x, 2) + 
          Math.pow(point.y - lastShape.y, 2)
        );
        updatedShape.radius = radius;
        break;
      case 'line':
      case 'arrow':
        updatedShape.points = [lastShape.x, lastShape.y, point.x, point.y];
        break;
      case 'star':
        const outerRadius = Math.sqrt(
          Math.pow(point.x - lastShape.x, 2) + 
          Math.pow(point.y - lastShape.y, 2)
        );
        updatedShape.outerRadius = outerRadius;
        updatedShape.innerRadius = outerRadius / 2;
        break;
      default:
        break;
    }

    const newShapes = [...shapes];
    newShapes[newShapes.length - 1] = updatedShape;
    setShapes(newShapes);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!currentText.trim()) {
        setTextPosition(null);
        return;
      }
  
      const newText = {
        id: selectedId || Date.now().toString(),
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        text: currentText,
        fontSize: fontSize,
        fontFamily: 'Times New Roman',
        fill: color,
        draggable: true,
      };
  
      if (selectedId) {
        setShapes(shapes.map(shape => 
          shape.id === selectedId ? newText : shape
        ));
      } else {
        setShapes([...shapes, newText]);
      }
      
      setCurrentText('');
      setTextPosition(null);
      setSelectedId(null);
    } else if (e.key === 'Escape') {
      setCurrentText('');
      setTextPosition(null);
      setSelectedId(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const newImage = {
        id: Date.now().toString(),
        type: 'image',
        src: event.target.result,
        x: 100,
        y: 100,
        width: img.width > 300 ? 300 : img.width,
        height: img.height > 200 ? 200 : img.height,
        draggable: true,
      };

      setShapes([...shapes, newImage]);
      setSelectedId(newImage.id);
    };
    reader.readAsDataURL(file);
  };

  const handleUndo = () => {
    if (shapes.length === 0) return;
    const newShapes = [...shapes];
    const popped = newShapes.pop();
    setShapes(newShapes);
    setRedoStack([...redoStack, popped]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const shape = redoStack[redoStack.length - 1];
    setShapes([...shapes, shape]);
    setRedoStack(redoStack.slice(0, -1));
  };

  const handleClear = () => {
    setShapes([]);
    setRedoStack([]);
    setSelectedId(null);
  };

  const handleDownload = () => {
    const uri = stageRef.current.toDataURL({
      mimeType: 'image/png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderShape = (shape) => {
    switch (shape.type) {
      case 'rectangle':
        return (
          <Rect
            id={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
            draggable={tool === 'select'}
            onDragEnd={(e) => {
              const updatedShapes = shapes.map(s => {
                if (s.id === shape.id) {
                  return {
                    ...s,
                    x: e.target.x(),
                    y: e.target.y()
                  };
                }
                return s;
              });
              setShapes(updatedShapes);
            }}
            onClick={() => setSelectedId(shape.id)}
          />
        );
      case 'circle':
        return (
          <Circle
            id={shape.id}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
            draggable={tool === 'select'}
            onDragEnd={(e) => {
              const updatedShapes = shapes.map(s => {
                if (s.id === shape.id) {
                  return {
                    ...s,
                    x: e.target.x(),
                    y: e.target.y()
                  };
                }
                return s;
              });
              setShapes(updatedShapes);
            }}
            onClick={() => setSelectedId(shape.id)}
          />
        );
      case 'line':
      case 'arrow':
        return (
          <Group>
            <Line
              id={shape.id}
              points={shape.points}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              lineCap="round"
              lineJoin="round"
              draggable={tool === 'select'}
              onDragEnd={(e) => {
                const updatedShapes = shapes.map(s => {
                  if (s.id === shape.id) {
                    const dx = e.target.x() - shape.x;
                    const dy = e.target.y() - shape.y;
                    return {
                      ...s,
                      x: e.target.x(),
                      y: e.target.y(),
                      points: [
                        shape.points[0] + dx,
                        shape.points[1] + dy,
                        shape.points[2] + dx,
                        shape.points[3] + dy
                      ]
                    };
                  }
                  return s;
                });
                setShapes(updatedShapes);
              }}
              onClick={() => setSelectedId(shape.id)}
            />
            {shape.type === 'arrow' && (
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
      case 'pen':
        return (
          <Line
            id={shape.id}
            points={shape.points}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={0.1}
            draggable={tool === 'select'}
            onDragEnd={(e) => {
              const updatedShapes = shapes.map(s => {
                if (s.id === shape.id) {
                  const dx = e.target.x() - shape.x;
                  const dy = e.target.y() - shape.y;
                  const newPoints = shape.points.map((point, i) => {
                    return i % 2 === 0 ? point + dx : point + dy;
                  });
                  return {
                    ...s,
                    x: e.target.x(),
                    y: e.target.y(),
                    points: newPoints
                  };
                }
                return s;
              });
              setShapes(updatedShapes);
            }}
            onClick={() => setSelectedId(shape.id)}
          />
        );
      case 'triangle':
        return (
          <Group
            id={shape.id}
            x={shape.x}
            y={shape.y}
            draggable={tool === 'select'}
            onDragEnd={(e) => {
              const updatedShapes = shapes.map(s => {
                if (s.id === shape.id) {
                  return {
                    ...s,
                    x: e.target.x(),
                    y: e.target.y()
                  };
                }
                return s;
              });
              setShapes(updatedShapes);
            }}
            onClick={() => setSelectedId(shape.id)}
          >
            <Line
              points={[
                0, -shape.radius, 
                shape.radius, shape.radius, 
                -shape.radius, shape.radius, 
                0, -shape.radius
              ]}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              fill={shape.fill}
              closed
            />
          </Group>
        );
      case 'star':
        return (
          <Star
            id={shape.id}
            x={shape.x}
            y={shape.y}
            numPoints={5}
            outerRadius={shape.outerRadius}
            innerRadius={shape.innerRadius}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
            draggable={tool === 'select'}
            onDragEnd={(e) => {
              const updatedShapes = shapes.map(s => {
                if (s.id === shape.id) {
                  return {
                    ...s,
                    x: e.target.x(),
                    y: e.target.y()
                  };
                }
                return s;
              });
              setShapes(updatedShapes);
            }}
            onClick={() => setSelectedId(shape.id)}
          />
        );
        case 'text':
          return (
            <Text
              id={shape.id}
              x={shape.x}
              y={shape.y}
              text={shape.text}
              fontSize={shape.fontSize}
              fontFamily={shape.fontFamily}
              fill={shape.fill}
              draggable={tool === 'select'}
              onDblClick={(e) => {
                // Prevent event bubbling to stage
                e.cancelBubble = true;
                onClick({
                  type: 'textEdit',
                  id: shape.id,
                  text: shape.text,
                  x: shape.x,
                  y: shape.y
                });
              }}
              onDragEnd={onDragEnd}
              onClick={(e) => {
                e.cancelBubble = true;
                onClick({ type: 'select', id: shape.id });
              }}
            />
          );
      case 'image':
        return (
          <RenderImage
            key={shape.id}
            shape={shape}
            shapes={shapes}
            setShapes={setShapes}
            setSelectedId={setSelectedId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen]">


      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 pt-2 pb-2"
        style={{
          height: 'calc(100vh - 1rem)',
          overflow: 'hidden'
        }}
      >
        <div className="relative w-full h-full">
          <Stage
            ref={stageRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              display: 'block',
              width: '100%',
              height: '88%'
            }}
            className="border-4 border-gold rounded-lg shadow-xl bg-white"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              {shapes.map(shape => (
                <React.Fragment key={shape.id}>
                  {renderShape(shape)}
                </React.Fragment>
              ))}
              {selectedId && tool === 'select' && (
                <Transformer
                  ref={trRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  rotateEnabled={true}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    setShapes(shapes.map(shape => {
                      if (shape.id === selectedId) {
                        if (shape.type === 'image') {
                          return {
                            ...shape,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(5, shape.width * scaleX),
                            height: Math.max(5, shape.height * scaleY),
                            rotation: node.rotation()
                          };
                        } else if (shape.type === 'text') {
                          return {
                            ...shape,
                            x: node.x(),
                            y: node.y(),
                            fontSize: Math.max(8, shape.fontSize * ((scaleX + scaleY) / 2)),
                            rotation: node.rotation()
                          };
                        } else {
                          return {
                            ...shape,
                            x: node.x(),
                            y: node.y(),
                            width: shape.width * scaleX,
                            height: shape.height * scaleY,
                            radius: shape.radius * ((scaleX + scaleY) / 2),
                            outerRadius: shape.outerRadius * ((scaleX + scaleY) / 2),
                            innerRadius: shape.innerRadius * ((scaleX + scaleY) / 2),
                            rotation: node.rotation()
                          };
                        }
                      }
                      return shape;
                    }));
                  }}
                />
              )}
            </Layer>
          </Stage>

          {textPosition && (
  <div
    style={{
      position: 'absolute',
      left: `${textPosition.x + (stageRef.current?.container().offsetLeft || 0)}px`,
      top: `${textPosition.y + (stageRef.current?.container().offsetTop || 0)}px`,
      zIndex: 100,
    }}
  >
    <div
      style={{
        padding: '4px',
        background: 'white',
        border: '2px solid #d4af37',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
      }}
    >
      <textarea
        ref={textAreaRef}
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        onKeyDown={handleTextKeyDown}
        onBlur={() => {
          if (currentText.trim()) {
            handleTextKeyDown({ key: 'Enter', preventDefault: () => {} });
          } else {
            setTextPosition(null);
          }
        }}
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: 'Times New Roman',
          color: color,
          outline: 'none',
          resize: 'none',
          width: '200px',
          minHeight: '50px',
          border: '1px solid #ccc',
          padding: '4px'
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
          handleClear={handleClear}
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