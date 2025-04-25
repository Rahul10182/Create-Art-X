import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Paper, Typography, Tooltip, IconButton } from '@mui/material';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function DesignBoard() {
  const [elements, setElements] = useState([]);
  const navigate = useNavigate();

  const handleAddElement = () => {
    const newElement = {
      id: Date.now(),
      text: `Element ${elements.length + 1}`,
    };
    setElements([...elements, newElement]);
  };

  const handleDelete = (id) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const handleSave = () => {
    alert('Design saved successfully!');
  };

  const handleElementClick = (id) => {
    navigate(`/element-board/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0C3FC] via-[#FDEFF9] to-[#F9F7FF] p-8 font-sans">
      <header className="flex flex-col md:flex-row items-center justify-between mb-10">
        <h1 className="text-6xl font-extrabold text-purple-700 tracking-tight drop-shadow-sm mb-4 md:mb-0">
          AnantamBoard
        </h1>
        <div className="flex gap-4">
          <Tooltip title="Add new element">
            <Button
              variant="contained"
              startIcon={<Plus />}
              color="primary"
              onClick={handleAddElement}
              className="rounded-full px-6 py-2 shadow-lg hover:shadow-2xl transition-all"
            >
              Add
            </Button>
          </Tooltip>
          <Tooltip title="Save your design">
            <Button
              variant="outlined"
              startIcon={<Save />}
              color="secondary"
              onClick={handleSave}
              className="rounded-full px-6 py-2 shadow-lg hover:shadow-2xl transition-all"
            >
              Save
            </Button>
          </Tooltip>
        </div>
      </header>

      <main className="border-4 border-dashed border-purple-300 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 min-h-[70vh] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {elements.length === 0 ? (
          <div className="col-span-full text-center text-purple-400 text-2xl font-medium">
            ✨ Start designing your masterpiece! Click "Add" to get started.
          </div>
        ) : (
          elements.map((el) => (
            <Paper
              key={el.id}
              elevation={8}
              onClick={() => handleElementClick(el.id)}
              className="p-6 rounded-3xl border border-purple-200 shadow-xl hover:shadow-2xl transition-all relative bg-gradient-to-br from-white to-purple-50 cursor-pointer"
            >
              <Typography
                variant="h6"
                className="text-purple-800 font-semibold text-center mb-3"
              >
                {el.text}
              </Typography>
              <IconButton
                className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(el.id);
                }}
              >
                <Trash2 size={20} />
              </IconButton>
            </Paper>
          ))
        )}
      </main>

      <footer className="mt-12 text-center text-sm text-purple-700">
        &copy; 2025 <span className="font-bold">AnantamCode</span> · Design your imagination 🌟
      </footer>
    </div>
  );
}