import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { updateCanvasSize } from '../apis/boardApi';

const SetDimension = ({ height, setHeight, width, setWidth }) => {
  const { id } = useParams();

  const increaseHeight = () => setHeight((prev) => Math.min(1200, prev + 10));
  const decreaseHeight = () => setHeight((prev) => Math.max(0, prev - 10));
  const increaseWidth = () => setWidth((prev) => Math.min(1200, prev + 10));
  const decreaseWidth = () => setWidth((prev) => Math.max(0, prev - 10));

  const syncDimensions = async () => {
    try {
      await updateCanvasSize(id, width, height);
    } catch (error) {
      // Handle error or show a toast if needed
      console.log(error);
    }
  };

  useEffect(() => {
    if (height && width) syncDimensions();
  }, [height, width]);

  return (
    <div className="fixed bottom-2 right-2 flex space-x-3 p-2 bg-gray-100 rounded-md shadow-sm">
      <div className="flex flex-col items-center">
        <button onClick={increaseHeight} className="bg-blue-500 text-white rounded-full w-6 h-6 mb-1 text-xs hover:bg-blue-600">+</button>
        <label htmlFor="height" className="text-xs">H</label>
        <input id="height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-12 text-center border rounded p-0.5 mb-1 text-xs" />
        <button onClick={decreaseHeight} className="bg-blue-500 text-white rounded-full w-6 h-6 text-xs hover:bg-blue-600">-</button>
      </div>
      <div className="flex flex-col items-center">
        <button onClick={increaseWidth} className="bg-blue-500 text-white rounded-full w-6 h-6 mb-1 text-xs hover:bg-blue-600">+</button>
        <label htmlFor="width" className="text-xs">W</label>
        <input id="width" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-12 text-center border rounded p-0.5 mb-1 text-xs" />
        <button onClick={decreaseWidth} className="bg-blue-500 text-white rounded-full w-6 h-6 text-xs hover:bg-blue-600">-</button>
      </div>
    </div>
  );
};

export default SetDimension;
