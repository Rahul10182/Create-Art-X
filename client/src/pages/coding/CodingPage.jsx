import { Box, Typography, Button } from "@mui/material";
import { FaCode, FaArrowRight } from "react-icons/fa";

const CodingSkillsPage = () => {
  return (
    <Box className="flex flex-col justify-center items-center text-center">
      <FaCode className="text-6xl text-cyan-400 mb-4" />
      <Typography variant="h4" className="text-cyan-400 font-bold">
        Coding & Technical Skills
      </Typography>
      <Typography variant="body1" className="mt-2">
        Learn programming, data structures, and software development.
      </Typography>
      <Button variant="contained" color="primary" className="mt-4">
        Start Learning <FaArrowRight className="ml-2" />
      </Button>
    </Box>
  );
};

export default CodingSkillsPage;