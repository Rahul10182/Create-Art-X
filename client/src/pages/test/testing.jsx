import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import Canvas from './TestCanvas';
import ToolControls from '../board/ToolControls';
import Topbar from '../board/Topbar';
import { updateCanvasSize } from '../../apis/boardApi';
import hogwartsGallery from '../../assets/hogwartsGallary.jpg';
import { UserPresence } from '../../components/liveblocks/UserPresence';
import LiveCursors from '../../components/liveblocks/LiveCursor'; // Import the LiveCursors component

const publicApiKey = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_RlYQeoj5sKuN1KRvy_vJVqz2lrE9inBvvPPPvn2z9qHjHO8WdgP47jaKc-vwoL4l";

if (!publicApiKey) {
  console.error("Liveblocks public API key is missing or empty.");
}


const DrawingBoardContent = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  const { boardID } = useParams();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.uid;

  // Handle window resize and initial sizing
  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        setCanvasSize({ width, height });
        
        // Update canvas ref if needed
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("[DrawingBoard] Canvas ref is null");
      return;
    }
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev, dataUrl]);
    setRedoStack([]);
  }, []);

  const saveCanvasToDB = async () => {
    try {
      if (!boardID || !canvasSize.width || !canvasSize.height) return;
      const res = await updateCanvasSize(boardID, canvasSize.width, canvasSize.height);
      console.log("[DrawingBoard] Saved board canvas size:", res);
    } catch (error) {
      console.error("[DrawingBoard] Failed to save board size:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      saveCanvasToDB();
    }, 60000);
    return () => clearInterval(interval);
  }, [boardID, canvasSize]);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-yellow-100 font-harry relative overflow-hidden"
      style={{ backgroundImage: `url(${hogwartsGallery})` }}
    >
      {/* Add LiveCursors component here */}
      <LiveCursors />
      
      <div className="flex flex-col min-h-screen px-4 py-4 relative z-10">
        <Topbar title="Hogwarts Drawing" />
        
        <div className="flex flex-row w-full">
          {/* Tool Controls - hidden but kept for potential future use */}
          <div className="mt-0 mb-0 max-w-[0px] hidden">
            <ToolControls tool={tool} setTool={setTool} color={color} setColor={setColor} />
          </div>

          <UserPresence user={user}/>

          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="w-full h-full flex justify-center items-start"
            style={{ height: 'calc(100vh - 100px)' }} // Adjust based on your Topbar height
          >
            <div className="rounded-lg p-2 w-full h-full">
              <Canvas
                canvasRef={canvasRef}
                tool={tool}
                color={color}
                startPos={startPos}
                setStartPos={setStartPos}
                saveHistory={saveHistory}
                boardID={boardID}
                userId={userId}
                width={canvasSize.width}
                height={canvasSize.height}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DrawingBoard = () => {
  const { boardID } = useParams();
  const { user } = useSelector((state) => state.auth);
  console.log("[DrawingBoard] Board ID:", boardID); // Debug

  if (!boardID) {
    console.error("[DrawingBoard] No boardID provided");
    return <div className="text-center text-red-500 font-bold">Invalid Board ID</div>;
  }

  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      <RoomProvider 
        id={boardID}
        initialPresence={{
          cursor: null, // Make sure cursor is in initial presence
          name: user?.name || "Anonymous",
          email: user?.email || "",
          avatarIndex: 0,
        }}
      >
        <DrawingBoardContent />
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default DrawingBoard;