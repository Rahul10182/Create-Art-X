import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getBoards } from '../../apis/boardApi';
import {
  Popover,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";

const Navbar = ({ allBoards, setAllBoards }) => {
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [searchTerm, setSearchTerm] = useState('');
  const [constBoards, setConstBoards] = useState(allBoards);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleLogout = () => {
    // Clear any authentication tokens or user data here
    localStorage.clear(); 
    navigate('/');
  };

  // Initial load
  useEffect(() => {
    if (currentUser?.firebaseUID) {
      fetchBoards();
    }
  }, [currentUser]);

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const data = await getBoards(currentUser.firebaseUID);
      setAllBoards(data);
      setConstBoards(data);
    } catch (err) {
      console.error("Failed to fetch boards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      setAllBoards(constBoards);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getBoards(currentUser.firebaseUID, searchTerm);
      setAllBoards(data);
    } catch (err) {
      console.error("Error searching boards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteDialogOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleAccountDelete = () => {
    console.log("Deleting account");
    setOpenDeleteDialog(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-900 shadow-lg">
      <div className="text-3xl font-extrabold text-white">Create-X</div>

      <form className="flex items-center bg-white p-1 rounded-lg shadow-inner" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch();
          }}
          placeholder="Search Canvas"
          className="px-4 py-2 text-sm text-gray-800 rounded-l-lg outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
          onClick={handleSearch}
        >
          Search
        </button>
        {isLoading && <span className="ml-2 text-sm text-white">Loading...</span>}
      </form>

      <div className="flex items-center gap-4">
        <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Create New
        </button>

        <button
          className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-blue-600"
          onClick={handleLogout}
        >
          Sign Out
        </button>

        {currentUser?.avatar && (
          <img
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer"
            src={currentUser.avatar}
            alt="User"
            onClick={handleAvatarClick}
          />
        )}

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ style: { width: 200, height: 100, overflow: 'auto' } }}
        >
          <div className="flex flex-col p-4">
            <Button onClick={() => navigate("/logout")} color="primary">
              Sign Out
            </Button>
            <Button onClick={handleDeleteDialogOpen} color="error">
              Delete Account
            </Button>
          </div>
        </Popover>

        <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleAccountDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Navbar;
