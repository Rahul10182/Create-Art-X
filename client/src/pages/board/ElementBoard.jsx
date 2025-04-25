import React, { useRef, useState, useCallback, useEffect } from 'react';
import Canvas from './canvas';
import ToolControls from './ToolControls';
import { updateCanvasSize } from '../../apis/boardApi';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// Importing images from the assets folder
import hogwartsGallery from '../../assets/hogwartsGallary.jpg';
import feathers from '../../assets/feathers.jpg';
import stars from '../../assets/train.jpg';
import trainBridge from '../../assets/train-bridge.jpg';

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const { boardID } = useParams();
  const { user } = useSelector((state) => state.auth);
  const userId = user.uid;

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev, dataUrl]);
    setRedoStack([]);
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
    }, 60000);
    return () => clearInterval(interval);
  }, [boardID]);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-yellow-100 font-harry relative overflow-hidden"
      style={{
        backgroundImage: `url(${hogwartsGallery})`, // Set Hogwarts gallery as the background
      }}
    >
      {/* Floating Images */}
      <img
        src={feathers}
        alt="feathers"
        className="absolute top-10 left-10 w-16 animate-float opacity-80"
      />
      <img
        src={stars}
        alt="stars"
        className="absolute right-5 top-16 w-20 opacity-70 animate-pulse"
      />
      <img
        src={trainBridge}
        alt="train bridge"
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-1/3 opacity-60"
      />

      {/* Magical content container */}
      <div className="flex justify-center items-center min-h-screen px-4 py-4 relative z-10">
        <div className="text-center w-full max-w-5xl">
          <h1 className="text-4xl font-harry text-yellow-300 drop-shadow-[0_0_10px_gold] mb-6">
            🪄 Hogwarts Drawing Scroll
          </h1>

          {/* Tool Controls */}
          <div className="mb-4 ml-52 w-full max-w-2xl bg-gradient-to-br from-[#372f26] to-[#1e1a16] border border-yellow-700 rounded-lg p-1 shadow-lg shadow-yellow-700/30">
            <ToolControls tool={tool} setTool={setTool} color={color} setColor={setColor} />
          </div>

          {/* Canvas section with frame */}
          <div className="inline-block border-4 border-yellow-600 rounded-lg shadow-[0_0_40px_rgba(255,215,0,0.4)] bg-black/40 p-1 mx-auto">
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
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;
