import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Star, Arrow, Image as KonvaImage, Group, Transformer } from 'react-konva';
import { saveBoardForUser, getBoardForUser } from "../../apis/boardApi";
// import useImage from 'use-image';

const Canvas = ({ tool, color, fillColor, lineWidth, fontSize, boardID, userId }) => {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [redoStack, setRedoStack] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load saved shapes on component mount
  useEffect(() => {
    const fetchSavedShapes = async () => {
      try {
        const savedData = await getBoardForUser(boardID, userId);
        if (savedData && savedData.shapes) {
          setShapes(savedData.shapes);
        }
      } catch (error) {
        console.error("Failed to load saved board", error);
      }
    };
    fetchSavedShapes();
  }, [boardID, userId]);

  // Auto-save every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      saveBoardForUser(boardID, userId, shapes)
        .then(() => console.log("Auto-saved board"))
        .catch((err) => console.error("Auto-save failed", err));
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [shapes, boardID, userId]);

  // Handle transformer (for resizing and rotating shapes)
  useEffect(() => {
    if (trRef.current && selectedId) {
      trRef.current.nodes([stageRef.current.findOne('#' + selectedId)]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  // Handle text editing
  useEffect(() => {
    if (textPosition && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [textPosition]);

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
        
        return node.getClientRect({
          relativeTo: stageRef.current
        }).x <= pos.x && 
          node.getClientRect({
            relativeTo: stageRef.current
          }).y <= pos.y && 
          node.getClientRect({
            relativeTo: stageRef.current
          }).x + node.getClientRect({
            relativeTo: stageRef.current
          }).width >= pos.x && 
          node.getClientRect({
            relativeTo: stageRef.current
          }).y + node.getClientRect({
            relativeTo: stageRef.current
          }).height >= pos.y;
      });
      
      if (shapeToErase) {
        setShapes(shapes.filter(s => s.id !== shapeToErase.id));
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
    if (!isDrawing || tool === 'eraser') return;
    
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
      if (!currentText.trim()) {
        setTextPosition(null);
        return;
      }

      const newText = {
        id: Date.now().toString(),
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        text: currentText,
        fontSize: fontSize,
        fontFamily: 'Times New Roman',
        fill: color,
        draggable: true,
      };

      setShapes([...shapes, newText]);
      setCurrentText('');
      setTextPosition(null);
    } else if (e.key === 'Escape') {
      setCurrentText('');
      setTextPosition(null);
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
        image: img,
      };

      setShapes([...shapes, newImage]);
      setSelectedId(newImage.id);
    };
    reader.readAsDataURL(file);
  };

  const handleManualSave = async () => {
    try {
      // Prepare all the content data to be saved
      const contentData = {
        rectangles,
        circles,
        arrows,
        scribbles,
        images,
        texts,
        size: {
          width: width,
          height: height
        }
      };
  
      // Update the board with the content data
      await Board.findByIdAndUpdate(boardID, {
        content: contentData,
        canvas: {
          size: {
            width: width,
            height: height
          }
        }
      });
  
      console.log("Board content saved manually.");
    } catch (error) {
      console.error("Manual save failed", error);
    }
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
    link.download = 'magical-canvas.png';
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
            fontFamily="Times New Roman"
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
      case 'image':
        return (
            <KonvaImage
              id={shape.id}
              image={shape.image}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              draggable={true}
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
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1a1614] p-2 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.2)] border border-gold">
      <div className="flex justify-center gap-2 mb-1">
        {/* Save Scroll Button */}
        <button 
          className="bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-1 text-sm rounded-lg w-20 cursor-pointer 
          font-harry border border-gold shadow-md transition-all hover:shadow-gold/50"
          onClick={handleManualSave}
        >
          Save
        </button>

        {/* Time Turner Button */}
        <button 
          className="bg-amber-700 hover:bg-amber-600 text-white px-2 py-1 text-sm rounded-lg w-20 cursor-pointer 
          font-harry border border-gold shadow-md transition-all hover:shadow-gold/50"
          onClick={handleUndo}
        >
          Undo
        </button>

        {/* Redo Spell Button */}
        <button 
          className="bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 text-sm rounded-lg w-20 cursor-pointer 
          font-harry border border-gold shadow-md transition-all hover:shadow-gold/50"
          onClick={handleRedo}
        >
          Redo
        </button>

        {/* Capture Mirror Button */}
        <button 
          className="bg-purple-700 hover:bg-purple-600 text-white px-2 py-1 text-sm rounded-lg w-20 cursor-pointer 
          font-harry border border-gold shadow-md transition-all hover:shadow-gold/50"
          onClick={handleDownload}
        >
          Capture
        </button>

        {/* Evanesco Button */}
        <button 
          className="bg-red-700 hover:bg-red-600 text-white px-2 py-1 text-sm rounded-lg w-20 cursor-pointer 
          font-harry border border-gold shadow-md transition-all hover:shadow-gold/50"
          onClick={handleClear}
        >
          Clear
        </button>

        {/* Portkey Button */}
        <button 
          className="bg-sky-700 hover:bg-sky-600 text-white px-2 py-1 text-sm rounded-lg w-20 cursor-pointer 
          font-harry border border-gold shadow-md transition-all hover:shadow-gold/50"
          onClick={() => fileInputRef.current.click()}
        >
          Portkey
        </button>
        
        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="hidden" 
        />
      </div>

      <div className="relative">
        {/* Stage for Canvas */}
        <Stage
          ref={stageRef}
          width={1000}
          height={600}
          className="border-4 border-gold rounded-lg shadow-xl bg-white"
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
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
              />
            )}
          </Layer>
        </Stage>

        {/* Textbox Positioning */}
        {textPosition && (
          <div
            style={{
              position: 'absolute',
              left: `${textPosition.x + 10}px`,
              top: `${textPosition.y + 10}px`,
              padding: '4px',
              background: 'white',
              border: '1px solid black',
              zIndex: 100,
            }}
          >
            <textarea
              ref={textAreaRef}
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              onKeyDown={handleTextKeyDown}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: 'Times New Roman',
                color: color,
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        )}
      </div>
    </div>


  );
};

export default Canvas;