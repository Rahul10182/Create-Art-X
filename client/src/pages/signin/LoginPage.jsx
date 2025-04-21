import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { loginUser } from "../../apis/authApi"; // Backend API call
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice"; 
import Lottie from "lottie-react"; // Import Lottie
import backgroundAnimation from "../../assets/animations/background-animation.json";
import { Typewriter } from "react-simple-typewriter"; // Import Typewriter
import GoogleIcon from "@mui/icons-material/Google"; //Import Google Icon
import FacebookIcon from "@mui/icons-material/Facebook"; // Import Facebook Icon
import { signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../firebase/config";

const LoginPage = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // Handle errors
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      // 🔹 Firebase Authentication (Login with Email & Password)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        input.email,
        input.password
      );
      const firebaseUser = userCredential.user;

      // 🔹 Send Firebase UID to the backend
      await loginUser(firebaseUser.uid);

      dispatch(
        loginSuccess({
          name: userCredential.name,
          username: userCredential.username,
          avatar: userCredential.avatar || "/default-avatar.png",
        })
      );

      console.log("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
  
      // Call your backend with the UID
      await loginUser(googleUser.uid);
  
      dispatch(
        loginSuccess({
          name: googleUser.displayName,
          avatar: googleUser.photoURL || "/default-avatar.png",
        })
      );
  
      console.log("Google Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err.message);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "left",
        position: "relative",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      >
        <Lottie animationData={backgroundAnimation} loop autoPlay />
      </Box>

      {/* Typewriter Effect Text */}
      <Typography
        variant="h4"
        sx={{
          position: "absolute",
          top: "15%",
          left: "10%",
          fontWeight: "bold",
          color: "#ffffff",
          textShadow: "0px 0px 10px rgba(255, 255, 255, 0.8)",
        }}
      >
        <Typewriter
          words={["Hello there! Login Now"]}
          loop={true}
          cursor
          cursorStyle="|"
          typeSpeed={50}
          deleteSpeed={30}
        />
      </Typography>

      {/* Glassmorphic Login Card */}
      <Paper
        elevation={10}
        sx={{
          width: "400px",
          padding: "2rem",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0px 4px 30px rgba(110, 30, 255, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
          marginLeft: "10%",
          marginTop: "5%",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#ffffff" }}
        >
          Welcome Back
        </Typography>

        {/* Display error message */}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={input.email}
            onChange={handleChange}
            required
            sx={{
              "& label.Mui-focused": { color: "#ffffff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#6E1EFF" },
                "&:hover fieldset": { borderColor: "#ffffff" },
                "&.Mui-focused fieldset": { borderColor: "#ffffff" },
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            value={input.password}
            onChange={handleChange}
            required
            sx={{
              "& label.Mui-focused": { color: "#ffffff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#6E1EFF" },
                "&:hover fieldset": { borderColor: "#ffffff" },
                "&.Mui-focused fieldset": { borderColor: "#ffffff" },
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{
              mt: 2,
              backgroundColor: "#6E1EFF",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#5714D9" },
            }}
          >
            Login
          </Button>
        </form>

        {/* First Time Here? Sign Up Now */}
        <Typography variant="body2" sx={{ mt: 2, color: "#ffffff" }}>
          First time here?{" "}
          <Link
            to="/signup"
            style={{
              color: "#6E1EFF",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Sign up now
          </Link>
        </Typography>

        <Divider sx={{ my: 3, borderColor: "#ffffff" }}>OR</Divider>

        {/* Google Login */}
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            mb: 2,
            borderColor: "#ffffff",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "#ffffff",
            },
          }}
        >
          Continue with Google
        </Button>

        {/* Facebook Login */}
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<FacebookIcon />}
          sx={{
            borderColor: "#ffffff",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "#ffffff",
            },
          }}
        >
          Continue with Facebook
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
