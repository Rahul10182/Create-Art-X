import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import { FaSignOutAlt, FaCog, FaUser, FaBars, FaTimes, FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/authSlice";
import { motion } from "framer-motion";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
          setUser(JSON.parse(storedUser));
      }
  }, []);

  const handleProfileClick = (event) => {
      setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
      setAnchorEl(null);
  };

  const handleLogout = () => {
      dispatch(logoutUser());
      localStorage.removeItem("user");
      navigate("/login");
  };

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
      >
          <AppBar
              position="static"
              sx={{
                  background: "linear-gradient(90deg, #4a90e2, #9013fe, #4a90e2)",
                  backgroundSize: "200% 200%",
                  animation: "moveGradient 5s ease infinite",
                  "@keyframes moveGradient": {
                      "0%": { backgroundPosition: "0% 50%" },
                      "50%": { backgroundPosition: "100% 50%" },
                      "100%": { backgroundPosition: "0% 50%" },
                  },
              }}
          >
              <Toolbar className="flex justify-between items-center">
                  <IconButton
                      edge="start"
                      color="inherit"
                      onClick={() => setDrawerOpen(true)}
                      className="lg:hidden"
                  >
                      <FaBars />
                  </IconButton>
                  <Typography
                      variant="h6"
                      sx={{ cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => navigate("/")}
                  >
                      Campus Pulse 🚀
                  </Typography>
                  <Box className="hidden lg:flex space-x-4">
                      <Button color="inherit" onClick={() => navigate("/coding")}>Coding</Button>
                      <Button color="inherit" onClick={() => navigate("/academics")}>Academics</Button>
                  </Box>
                  {user ? (
                      <>
                          <IconButton onClick={handleProfileClick} color="inherit">
                              <Avatar src={user.avatar || "/default-avatar.png"} alt={user.name} />
                          </IconButton>
                          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                              <MenuItem disabled>
                                  Hello, <strong>{user.name}</strong>
                              </MenuItem>
                              <MenuItem onClick={() => { navigate("/profile"); handleClose(); }}>
                                  <FaUser className="mr-2" /> Profile
                              </MenuItem>
                              <MenuItem onClick={() => { navigate("/settings"); handleClose(); }}>
                                  <FaCog className="mr-2" /> Settings
                              </MenuItem>
                              <MenuItem onClick={handleLogout} className="text-red-500">
                                  <FaSignOutAlt className="mr-2" /> Logout
                              </MenuItem>
                          </Menu>
                      </>
                  ) : (
                      <Button color="inherit" onClick={() => navigate("/login")}>Login</Button>
                  )}
              </Toolbar>
          </AppBar>

          {/* Mobile Drawer */}
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 250 }} role="presentation">
                  <IconButton onClick={() => setDrawerOpen(false)} className="m-4">
                      <FaTimes />
                  </IconButton>
                  <List>
                      <ListItem button onClick={() => navigate("/coding")}>
                          <ListItemIcon><FaUser /></ListItemIcon>
                          <ListItemText primary="Coding" />
                      </ListItem>
                      <ListItem button onClick={() => navigate("/academics")}>
                          <ListItemIcon><FaBook /></ListItemIcon>
                          <ListItemText primary="Academics" />
                      </ListItem>
                  </List>
              </Box>
          </Drawer>
      </motion.div>
  );
};

export default Navbar;
