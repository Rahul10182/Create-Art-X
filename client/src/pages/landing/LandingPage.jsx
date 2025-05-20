import { Link } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";
import { keyframes } from "@emotion/react";
import LandingImage from "../../assets/LandingImage.jpg"; // adjust path as needed

// Animations
const shimmer = keyframes`
  0% { background-position: -500% center; }
  100% { background-position: 500% center; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 15px #ffcc00, 0 0 30px #ffcc00; }
  50% { text-shadow: 0 0 30px #ffcc00, 0 0 60px #ffcc00; }
`;

const floatingEffect = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const LandingPage = () => {
  return (
    <Box
      sx={{
        backgroundImage: `url(${LandingImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "flex-start", // Move content upwards
        justifyContent: "center",
        color: "white",
        overflow: "hidden",
        fontFamily: "'Harry P', sans-serif", // Hogwarts-inspired font
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Darker to give more contrast
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container sx={{ zIndex: 2, textAlign: "center", paddingTop: "120px" }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "'Cinzel Decorative', cursive",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #FFD700, #FFEA00, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: `${shimmer} 8s linear infinite, ${glow} 2.5s ease-in-out infinite`,
            backgroundSize: "500% auto",
            mb: 3,
            letterSpacing: "2px",
            fontSize: "4rem", // Large size for emphasis
          }}
        >
          Welcome to Create-Art-X
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontStyle: "italic",
            animation: `${fadeInUp} 2s ease-out`,
            mb: 2,
            fontSize: "2.5rem",
            color: "#f5f5dc", // Hogwarts parchment color
            textShadow: "1px 1px 4px rgba(0, 0, 0, 0.7)",
            fontFamily: "'Garamond', serif", // Mystical font style
            animation: `${floatingEffect} 3s ease-in-out infinite`,
          }}
        >
          Unleash Your Magic at Hogwarts School of Witchcraft and Wizardry
        </Typography>

        <Typography
          variant="body1"
          sx={{
            maxWidth: "600px",
            mx: "auto",
            animation: `${fadeInUp} 2.5s ease-out, ${floatingEffect} 3s ease-in-out infinite`,
            fontSize: "1.5rem",
            color: "#f5f5f5",
            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
            mb: 4,
            fontFamily: "'Garamond', serif",
          }}
        >
          Step into a magical world where every spell, potion, and brushstroke creates wonders. Join us at Hogwarts and discover the art of wizardry.
        </Typography>


        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/login"
          sx={{
            px: 6,
            py: 1.7,
            fontSize: "1.2rem",
            fontWeight: "bold",
            borderRadius: "30px",
            color: "white",
            background: "linear-gradient(to right, #6a4dad, #8a63d2)",
            boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
            transition: "all 0.4s ease",
            animation: `${fadeInUp} 3s ease-out`,
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 0 25px rgba(255, 215, 0, 0.8)",
              background: "linear-gradient(to right, #5e3ca4, #9e75ff)",
            },
          }}
        >
          Enter In The Hogwarts
        </Button>
      </Container>

      {/* Optional Floating Animations */}
      <style>{`
        @keyframes float0 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        @keyframes float1 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-15px); }
        }
        @keyframes float2 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-12px); }
        }
      `}</style>
    </Box>
  );
};

export default LandingPage;
