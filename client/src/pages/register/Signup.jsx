import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from "@mui/icons-material";
import { createUserWithEmailAndPassword ,GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import { auth } from "../../firebase/config"; // Ensure this file exists
import { signupUser } from "../../apis/authApi"; // API call to backend
import Lottie from "lottie-react";
import backgroundAnimation from "../../assets/animations/background-animation.json";
import { Typewriter } from "react-simple-typewriter";
import { useDispatch } from "react-redux"; // ✅ Import Redux Dispatch
import { loginSuccess } from "../../redux/authSlice"; // ✅ Import Redux Action
import { useEffect } from "react";
import { checkUsernameAvailability } from "../../apis/userApi";
import debounce from "lodash.debounce";

const SignupPage = () => {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null, true, or false
  const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (input.password !== input.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        input.email,
        input.password
      );
      const firebaseUser = userCredential.user;

      await signupUser({
        firebaseUID: firebaseUser.uid,
        name: input.name,
        email: input.email,
        username: input.username,
      });

      dispatch(
        loginSuccess({
        uid: firebaseUser.uid,
        name: input.name,
        email: input.email,
        username: input.username,          
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error.message);
      alert("Signup failed. Please try again.");
    }
  };

  useEffect(() => {
      if (input.username.trim() === "") {
        setUsernameStatus(null);
        setSuggestedUsernames([]);
        return;
      }
    
      const debouncedCheck = debounce(async () => {
        const isAvailable = await checkUsernameAvailability(input.username);
        setUsernameStatus(isAvailable);
    
        if (!isAvailable) {
          const suggestions = Array.from(
            { length: 3 },
            () => `${input.username}${Math.floor(Math.random() * 1000)}`
          );
          setSuggestedUsernames(suggestions);
        } else {
          setSuggestedUsernames([]);
        }
      }, 500);
    
      debouncedCheck();
      return () => debouncedCheck.cancel();
    }, [input.username]);

  
    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
      
          // Extract username from email
          const email = user.email;
          const username = email.substring(0, email.indexOf('@'));
      
          // Save user data to your backend
          await signupUser({
            firebaseUID: user.uid,
            name: user.displayName,
            email: email,
            username: username,
          });
      
          // Dispatch login success
          dispatch(
            loginSuccess({
              uid: user.uid,
              name: user.displayName,
              email: email,
              username: username,
            })
          );
      
          // Navigate to home/dashboard
          navigate("/dashboard");
      
        } catch (error) {
          console.error("Google Sign-in error:", error.message);
          alert("Failed to sign in with Google. Please try again.");
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

      <Typography
        variant="h4"
        sx={{
          position: "absolute",
          top: "5%",
          left: "10%",
          fontWeight: "bold",
          color: "#ffffff",
          textShadow: "0px 0px 10px rgba(255, 255, 255, 0.8)",
        }}
      >
        <Typewriter
          words={["Hello there! Sign Up Now"]}
          loop={true}
          cursor
          cursorStyle="|"
          typeSpeed={50}
          deleteSpeed={30}
        />
      </Typography>

      <Paper
        elevation={10}
        sx={{
          width: "500px",
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
          Create Your Account
        </Typography>

        <form onSubmit={handleSignup} style={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            margin="normal"
            value={input.name}
            onChange={(e) => setInput({ ...input, name: e.target.value })}
            required
            sx={inputStyles}
          />

          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={input.username}
            onChange={(e) => setInput({ ...input, username: e.target.value })}
            required
            sx={inputStyles}
            helperText={
            usernameStatus === null
                ? ""
                : usernameStatus
                ? "✅ Username available"
                : "❌ Username taken"
            }
            FormHelperTextProps={{
            style: { color: usernameStatus ? "lightgreen" : "red" },
            }}
        />
        {usernameStatus === false && suggestedUsernames.length > 0 && (
        <Box sx={{ textAlign: "left", mt: 1 }}>
            <Typography variant="body2" sx={{ color: "#ccc" }}>
            Try:
            </Typography>
            {suggestedUsernames.map((s, idx) => (
            <Button
                key={idx}
                variant="text"
                sx={{ textTransform: "none", color: "#6E1EFF" }}
                onClick={() => setInput({ ...input, username: s })}
            >
                {s}
            </Button>
            ))}
        </Box>
        )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            margin="normal"
            value={input.email}
            onChange={(e) => setInput({ ...input, email: e.target.value })}
            required
            sx={inputStyles}
          />


          <Box sx={{ display: "flex", gap: "1rem", width: "100%" }}>
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={input.password}
              onChange={(e) => setInput({ ...input, password: e.target.value })}
              required
              sx={{ ...inputStyles, flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ color: "#ffffff" }} />
                      ) : (
                        <Visibility sx={{ color: "#ffffff" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={input.confirmPassword}
              onChange={(e) =>
                setInput({ ...input, confirmPassword: e.target.value })
              }
              required
              sx={{ ...inputStyles, flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff sx={{ color: "#ffffff" }} />
                      ) : (
                        <Visibility sx={{ color: "#ffffff" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button fullWidth variant="contained" type="submit" sx={buttonStyles}>
            Sign Up
          </Button>
        </form>

        <Divider sx={{ my: 3, borderColor: "#ffffff" }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={socialButtonStyles}
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<FacebookIcon />}
          sx={socialButtonStyles}
        >
          Continue with Facebook
        </Button>

        <Typography variant="body2" sx={{ mt: 2, color: "#ffffff" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6E1EFF", fontWeight: "bold" }}>
            Login here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

const inputStyles = {
  "& label.Mui-focused": { color: "#ffffff" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#6E1EFF" },
    "&:hover fieldset": { borderColor: "#ffffff" },
    "&.Mui-focused fieldset": { borderColor: "#ffffff" },
  },
  "& .MuiInputBase-input": { color: "#ffffff" },
};

const buttonStyles = {
  mt: 2,
  backgroundColor: "#6E1EFF",
  color: "#ffffff",
  "&:hover": { backgroundColor: "#5714D9" },
};

const socialButtonStyles = {
  mb: 2,
  borderColor: "#ffffff",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#ffffff",
  },
};

export default SignupPage;
