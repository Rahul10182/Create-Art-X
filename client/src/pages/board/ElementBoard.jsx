import React, { useRef, useState, useCallback, useEffect } from 'react';
import Canvas from './canvas';
import ToolControls from './ToolControls';
import { updateCanvasSize } from '../../apis/boardApi';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; // ✅ Using useParams now

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const { boardID } = useParams(); // ✅ Get boardID from URL
  console.log("boardID in drawing board", boardID);

  const { user } = useSelector((state) => state.auth);
  const userId = user.uid;

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev, dataUrl]);
    setRedoStack([]); // clear redo stack on new draw
  }, []);

  const saveCanvasToDB = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !boardID) return;
    const dataUrl = canvas.toDataURL();
    try {
      const res = await updateCanvasSize(boardID, canvas.width, canvas.height);
      console.log("Saved board canvas size:", res);
    } catch (error) {
      console.error("Failed to save board to DB:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      saveCanvasToDB();
    }, 60000); // auto-save every 60 seconds
    return () => clearInterval(interval);
  }, [boardID]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center py-10 px-6">
      <h1 className="text-4xl font-bold text-purple-700 mb-6">🎨 Creative Canvas</h1>

      <ToolControls tool={tool} setTool={setTool} color={color} setColor={setColor} />

      <Canvas
        canvasRef={canvasRef}
        tool={tool}
        color={color}
        startPos={startPos}
        setStartPos={setStartPos}
        saveHistory={saveHistory}
        boardID={boardID}
        userId={userId}
      />
    </div>
  );
};

export default DrawingBoard;
