"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import Canvas from './canvas';
import ToolControls from './ToolControls';
import Topbar from './Topbar';
import { updateCanvasSize } from '../../apis/boardApi';
import hogwartsGallery from '../../assets/hogwartsGallary.jpg';

const publicApiKey = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY;

if (!publicApiKey) {
  console.error("Liveblocks public API key is missing or empty.");
}

const DrawingBoardContent = () => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  const { boardID } = useParams();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.uid; // safer access

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
    try {
      const res = await updateCanvasSize(boardID, canvas.width, canvas.height);
      console.log("Saved board canvas size:", res);
    } catch (error) {
      console.error("Failed to save board size to DB:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      saveCanvasToDB();
    }, 60000); // auto save every 60 seconds
    return () => clearInterval(interval);
  }, [boardID]);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-yellow-100 font-harry relative overflow-hidden"
      style={{ backgroundImage: `url(${hogwartsGallery})` }}
    >
      <div className="flex justify-center items-center min-h-screen px-4 py-4 relative z-10">
        <div className="text-center w-full max-w-5xl">
          <Topbar title="Hogwarts Drawing" />
          
          <div className="mb-4 ml-52 w-full max-w-2xl bg-gradient-to-br from-[#372f26] to-[#1e1a16] border border-white rounded-2xl shadow-lg shadow-yellow-700/30">
            <ToolControls tool={tool} setTool={setTool} color={color} setColor={setColor} />
          </div>

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

const DrawingBoard = () => {
  const { boardID } = useParams();

  if (!boardID) {
    return <div className="text-center text-red-500 font-bold">Invalid Board ID</div>;
  }

  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      <RoomProvider id={boardID} >
        <DrawingBoardContent />
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default DrawingBoard;
