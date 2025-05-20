import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { getBoards } from '../../apis/boardApi';
import { logout } from '../../redux/authSlice';
import { Link } from 'react-router-dom';


const Navbar = ({ allBoards, setAllBoards }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [constBoards, setConstBoards] = useState(allBoards);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { user } = useSelector((state) => state.auth); // Get user from Redux
  console.log(user);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const open = Boolean(anchorEl);

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

  const handleSearch = () => {
    if (!searchTerm) {
      setAllBoards(constBoards);
      return;
    }

    const filtered = constBoards.filter((board) => {
      const title = board?.title;
      return typeof title === 'string' && title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setAllBoards(filtered);
  };

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const handleDeleteDialogOpen = () => setOpenDeleteDialog(true);
  const handleDeleteDialogClose = () => setOpenDeleteDialog(false);

  const handleAccountDelete = () => {
    console.log("Deleting account...");
    setOpenDeleteDialog(false);
    // Add account deletion logic here
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 shadow-lg">
      <Link to="/" className="text-3xl font-bold text-white hover:text-gray-300 transition-colors">
        Create-Art-X
      </Link>


      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch();
        }}
        placeholder="Search Boards..."
        className="px-3 py-2 text-sm rounded-lg shadow-md outline-none text-gray-700 bg-white w-64"
      />

      <div className="flex items-center gap-4">
        {user?.name && (
          <span className="bg-white mr-4 text-zinc-800 px-3 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-zinc-100 transition-all">
            {user.name}
          </span>
        )}


        <button
          className="px-6 py-2 mr-4 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all cursor-pointer"
          onClick={handleLogout}
        >
          Sign Out
        </button>


        {currentUser?.avatar && (
          <img
            className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
            src={currentUser.avatar}
            alt="User Avatar"
            onClick={handleAvatarClick}
          />
        )}

        {/* Popover Menu */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            style: { padding: 12, width: 180 }
          }}
        >
          <div className="flex flex-col gap-2">
            <Button onClick={handleLogout} color="primary" fullWidth>
              Sign Out
            </Button>
            <Button onClick={handleDeleteDialogOpen} color="error" fullWidth>
              Delete Account
            </Button>
          </div>
        </Popover>

        {/* Delete Account Dialog */}
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
