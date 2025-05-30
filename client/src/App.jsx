import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Landing from "./pages/landing/LandingPage";
import Login from "./pages/register/Login";
import Signup from "./pages/register/Signup";
import Home from "./pages/home/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import TestPage from "./pages/test/testing"; 
import Board from "./pages/board/Board"; 
import ElementBoard from "./pages/board/ElementBoard"; 

function App() {
  const { user } = useSelector((state) => state.auth); // Get user from Redux
  console.log(user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Public Routes (redirect if logged in) */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={user ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/board" element={user ? <Board /> : <Navigate to="/login" replace />} />
        <Route path="/create/:boardID" element={user ? <ElementBoard /> : <Navigate to="/login" replace />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="/test/:boardID" element={<TestPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
