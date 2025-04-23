// CanvasBoard.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import { ChromePicker } from 'react-color';

const CanvasBoard = () => {
  const stageRef = useRef(null);
  const fileUploadRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [color, setColor] = useState('#00D084');

  // Add rectangle
  const addRectangle = () => {
    const rect = {
      id: `rect-${elements.length}`,
      type: 'rect',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: color,
      rotation: 0,
      draggable: true,
    };
    setElements([...elements, rect]);
  };

  // Add circle
  const addCircle = () => {
    const circle = {
      id: `circle-${elements.length}`,
      type: 'circle',
      x: 150,
      y: 150,
      radius: 50,
      fill: color,
      rotation: 0,
      draggable: true,
    };
    setElements([...elements, circle]);
  };

  // Upload image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result;
      img.onload = () => {
        const image = {
          id: `img-${elements.length}`,
          type: 'image',
          image: img,
          x: 200,
          y: 200,
          width: 150,
          height: 150,
          draggable: true,
        };
        setElements((prev) => [...prev, image]);
      };
    };
    reader.readAsDataURL(file);
  };

  // Export canvas to image
  const exportToImage = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = uri;
    link.click();
  };

  // Save as JSON
  const exportToJSON = () => {
    const json = stageRef.current.toJSON();
    console.log(json);
    alert('JSON saved to console!');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        <button onClick={addRectangle} className="bg-blue-500 text-white px-4 py-2 rounded">Add Rectangle</button>
        <button onClick={addCircle} className="bg-green-500 text-white px-4 py-2 rounded">Add Circle</button>
        <button onClick={() => fileUploadRef.current.click()} className="bg-purple-500 text-white px-4 py-2 rounded">Upload Image</button>
        <button onClick={exportToImage} className="bg-yellow-500 text-white px-4 py-2 rounded">Export as Image</button>
        <button onClick={exportToJSON} className="bg-gray-800 text-white px-4 py-2 rounded">Export as JSON</button>
        <input type="file" hidden ref={fileUploadRef} onChange={handleImageUpload} />
        <div className="ml-4">
          <ChromePicker color={color} onChange={(c) => setColor(c.hex)} />
        </div>
      </div>

      <Stage
        width={window.innerWidth}
        height={600}
        ref={stageRef}
        onMouseDown={(e) => {
          const clicked = e.target;
          const id = clicked.attrs.id;
          setSelectedId(id);
        }}
        style={{ border: '1px solid #ccc' }}
      >
        <Layer>
          {elements.map((el, i) => {
            if (el.type === 'rect') {
              return (
                <Rectangle
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(newAttrs) => {
                    const updated = elements.slice();
                    updated[i] = newAttrs;
                    setElements(updated);
                  }}
                />
              );
            } else if (el.type === 'circle') {
              return (
                <CircleShape
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(newAttrs) => {
                    const updated = elements.slice();
                    updated[i] = newAttrs;
                    setElements(updated);
                  }}
                />
              );
            } else if (el.type === 'image') {
              return (
                <ImageShape
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(newAttrs) => {
                    const updated = elements.slice();
                    updated[i] = newAttrs;
                    setElements(updated);
                  }}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

// Rectangle component
const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        {...shapeProps}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            scaleX: 1,
            scaleY: 1,
            rotation: node.rotation(),
          });
        }}
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

// Circle component
const CircleShape = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Circle
        {...shapeProps}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            radius: node.radius() * node.scaleX(),
            scaleX: 1,
            scaleY: 1,
            rotation: node.rotation(),
          });
        }}
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

// Image component
const ImageShape = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        {...shapeProps}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            scaleX: 1,
            scaleY: 1,
            rotation: node.rotation(),
          });
        }}
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

export default CanvasBoard;
