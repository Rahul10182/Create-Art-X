import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";
import { loginUser } from "../../apis/authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import { Typewriter } from "react-simple-typewriter";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import loginBg from "../../assets/login_background_image.avif";
import Lottie from "lottie-react";
import magicLottie from "../../assets/animations/login-animation.json";

const LoginPage = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState("splash");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const splashTimeout = setTimeout(() => setStep("login"), 7000);
    return () => clearTimeout(splashTimeout);
  }, []);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        input.email,
        input.password
      );
      const firebaseUser = userCredential.user;
      const response = await loginUser(firebaseUser.uid);
      const user = response.user;
      dispatch(
        loginSuccess({
          uid: user.firebaseUID,
          name: user.name,
          email: user.email,
          username: user.username,
        })
      );
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const response = await loginUser(googleUser.uid);
      const user = response.user;
      dispatch(
        loginSuccess({
          uid: user.firebaseUID,
          name: user.name,
          email: user.email,
          username: user.username,
        })
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  // SPLASH SCREEN
  if (step === "splash") {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f9d342",
          textShadow: "0 0 10px #f9d342, 0 0 20px #6E1EFF",
          fontFamily: "'Harry P', serif",
          fontSize: "2rem",
        }}
      >
        <Typewriter
          words={[
            "Welcome to the Wizarding Realm...",
            "Your journey begins at Hogwarts...",
            "Only the chosen ones may pass...",
          ]}
          loop={0}
          cursor
          cursorStyle="|"
          typeSpeed={50}
          deleteSpeed={40}
          delaySpeed={2000}
        />
      </Box>
    );
  }

  // LOGIN SCREEN
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0f0c29",
        color: "#ffffff",
      }}
    >
      {/* LEFT: Lottie + Message */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            textAlign: "center",
            color: "#f9d342",
            textShadow: "0 0 10px #f9d342, 0 0 20px #6E1EFF",
            fontFamily: "'Harry P', serif",
            fontSize: "2rem",
            px: 3,
            width: "100%",
          }}
        >
          <Typewriter
            words={["Welcome back, wizard!"]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={50}
            deleteSpeed={40}
            delaySpeed={2000}
          />
        </Box>
        <Lottie
          animationData={magicLottie}
          loop
          autoplay
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      </Box>

      {/* RIGHT: Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 4,
            backgroundColor: "#1c1b29",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Harry P', serif",
              color: "#f9d342",
              textAlign: "center",
              mb: 2,
            }}
          >
            Hogwarts Login
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Owl Mail"
              name="email"
              type="email"
              variant="outlined"
              margin="normal"
              value={input.email}
              onChange={handleChange}
              required
              InputLabelProps={{ style: { color: "#aaa" } }}
              sx={{
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#f9d342" },
                  "&.Mui-focused fieldset": { borderColor: "#f9d342" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Secret Spell"
              name="password"
              type="password"
              variant="outlined"
              margin="normal"
              value={input.password}
              onChange={handleChange}
              required
              InputLabelProps={{ style: { color: "#aaa" } }}
              sx={{
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#f9d342" },
                  "&.Mui-focused fieldset": { borderColor: "#f9d342" },
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
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#5714D9" },
              }}
            >
              Unlock the Portal
            </Button>
          </form>

          <Typography
            variant="body2"
            sx={{ mt: 2, color: "#aaa", textAlign: "center" }}
          >
            Muggle?{" "}
            <Link to="/signup" style={{ color: "#f9d342", fontWeight: "bold" }}>
              Register now
            </Link>
          </Typography>

          <Divider sx={{ my: 3, borderColor: "#444" }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              mb: 2,
              borderColor: "#f9d342",
              color: "#f9d342",
              "&:hover": { backgroundColor: "#292744" },
            }}
          >
            Enter with Google
          </Button>

        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;