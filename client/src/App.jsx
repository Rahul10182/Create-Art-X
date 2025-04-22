import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing/LandingPage";
import Login from "./pages/register/Login";
import Signup from "./pages/register/Signup";
import Home from "./pages/home/HomePage";
import { useSelector } from "react-redux";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  const { user } = useSelector((state) => state.auth); // Get user from Redux

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={ <Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
