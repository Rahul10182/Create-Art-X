import React, { useState } from 'react';
import { FaShareAlt } from "react-icons/fa";
import Popover from '@mui/material/Popover';
import ShareCanvas from './Shareboard';
import { useParams } from 'react-router-dom';

const Topbar2 = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { boardId } = useParams(); // get boardId from URL

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div className="bg-white flex gap-3 shadow-lg w-[100px] h-[48px] rounded-lg m-3 justify-center items-center px-4">
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-300 transition duration-200"
        onClick={handleShareClick}
      >
        <span className="font-semibold">Share</span>
        <FaShareAlt size={20} />
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <div>
          <ShareCanvas boardId={boardId} />
        </div>
      </Popover>
    </div>
  );
};

export default Topbar2;
