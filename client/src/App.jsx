import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing/LandingPage";
import Login from "./pages/signin/LoginPage";
import Signup from "./pages/signin/SignUpPage";
import Home from "./pages/home/HomePage";
import { useSelector } from "react-redux";
import ProfilePage from "./pages/profile/ProfilePage";
import TestPage from "./pages/test/testing"; 

function App() {
  const { user } = useSelector((state) => state.auth); // Get user from Redux

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/dashboard" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/test" element={<TestPage/>} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
