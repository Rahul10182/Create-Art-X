import { Link } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";

const LandingPage = () => {
  return (
    <Container sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h2" gutterBottom>
        Welcome to Campus Pulse
      </Typography>
      <Typography variant="h5" gutterBottom>
        Stay connected with your campus community!
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 3 }} component={Link} to="/login">
        Get Started
      </Button>
    </Container>
  );
};

export default LandingPage;