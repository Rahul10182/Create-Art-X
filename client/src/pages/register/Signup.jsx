import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";
import { signupUser } from "../../apis/authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import { checkUsernameAvailability } from "../../apis/userApi";
import debounce from "lodash.debounce";
import { Typewriter } from "react-simple-typewriter";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import loginBg from "../../assets/login_background_image.avif";
import Lottie from "lottie-react";
import magicLottie from "../../assets/animations/login-animation.json";

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
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const [error, setError] = useState("");
  const [step, setStep] = useState("splash");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const splashTimeout = setTimeout(() => setStep("signup"), 7000);
    return () => clearTimeout(splashTimeout);
  }, []);

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
        const suggestions = Array.from({ length: 3 }, () => {
          return `${input.username}${Math.floor(Math.random() * 1000)}`;
        });
        setSuggestedUsernames(suggestions);
      } else {
        setSuggestedUsernames([]);
      }
    }, 500);

    debouncedCheck();
    return () => debouncedCheck.cancel();
  }, [input.username]);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (input.password !== input.confirmPassword) {
      setError("The spells don't match!");
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
      setError("Something went wrong with your magic. Try again.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const email = googleUser.email;
      const username = email.substring(0, email.indexOf("@"));

      await signupUser({
        firebaseUID: googleUser.uid,
        name: googleUser.displayName,
        email: email,
        username: username,
      });

      dispatch(
        loginSuccess({
          uid: googleUser.uid,
          name: googleUser.displayName,
          email: email,
          username: username,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError("Google signup failed. Please try again.");
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
            "Preparing your magical journey...",
            "The sorting hat awaits...",
            "Your wizarding story begins...",
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

  // SIGNUP SCREEN
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
            words={["Join the Wizarding World!"]}
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

      {/* RIGHT: Signup Form */}
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
            Hogwarts Enrollment
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSignup}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              variant="outlined"
              margin="normal"
              value={input.name}
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
              label="Username"
              name="username"
              variant="outlined"
              margin="normal"
              value={input.username}
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
              helperText={
                usernameStatus === null
                  ? ""
                  : usernameStatus
                  ? "✨ Available"
                  : "❌ Taken"
              }
              FormHelperTextProps={{
                style: {
                  color: usernameStatus ? "#ADFF2F" : "#FF6347",
                },
              }}
            />

            {usernameStatus === false && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="#ddd">
                  Try one of these:
                </Typography>
                {suggestedUsernames.map((s, i) => (
                  <Button
                    key={i}
                    variant="text"
                    onClick={() => setInput({ ...input, username: s })}
                    sx={{ color: "#BA55D3", textTransform: "none" }}
                  >
                    {s}
                  </Button>
                ))}
              </Box>
            )}

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
              type={showPassword ? "text" : "password"}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ color: "#f9d342" }} />
                      ) : (
                        <Visibility sx={{ color: "#f9d342" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Secret Spell"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={input.confirmPassword}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff sx={{ color: "#f9d342" }} />
                      ) : (
                        <Visibility sx={{ color: "#f9d342" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
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
              Complete Enrollment
            </Button>
          </form>

          <Typography
            variant="body2"
            sx={{ mt: 2, color: "#aaa", textAlign: "center" }}
          >
            Already enrolled?{" "}
            <Link to="/login" style={{ color: "#f9d342", fontWeight: "bold" }}>
              Access the portal
            </Link>
          </Typography>

          <Divider sx={{ my: 3, borderColor: "#444" }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            sx={{
              mb: 2,
              borderColor: "#f9d342",
              color: "#f9d342",
              "&:hover": { backgroundColor: "#292744" },
            }}
          >
            Enroll with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            sx={{
              borderColor: "#f9d342",
              color: "#f9d342",
              "&:hover": { backgroundColor: "#292744" },
            }}
          >
            Enroll with Facebook
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupPage;