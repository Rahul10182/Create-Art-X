import { Box, Typography, Button } from "@mui/material";
import { FaBook, FaArrowRight } from "react-icons/fa";

const AcademicSkillsPage = () => {
  return (
    <Box className="flex flex-col justify-center items-center text-center">
      <FaBook className="text-6xl text-pink-400 mb-4" />
      <Typography variant="h4" className="text-pink-400 font-bold">
        Academic Skills
      </Typography>
      <Typography variant="body1" className="mt-2">
        Improve your study techniques, writing, and research skills.
      </Typography>
      <Button variant="contained" color="secondary" className="mt-4">
        Explore Now <FaArrowRight className="ml-2" />
      </Button>
    </Box>
  );
};

export default AcademicSkillsPage;