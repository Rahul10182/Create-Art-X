// src/pages/Homepage.jsx
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import homepageAnimation from "../../assets/animations/homepage-animation.json";
import Navbar from "../../components/navbar/Navbar";

// Card Data
const cardData = [
  {
    id: "events",
    title: "College Events",
    desc: "Stay updated on all upcoming college events and activities.",
    color: "from-green-500 to-teal-500",
    glow: "shadow-green-500/50",
    position: "top-left",
  },
  {
    id: "coding",
    title: "Coding Contests",
    desc: "Participate in ongoing coding contests and challenges.",
    color: "from-red-500 to-rose-500",
    glow: "shadow-red-500/50",
    position: "top-right",
  },
  {
    id: "academics",
    title: "Academics & Notes",
    desc: "Access lecture notes, academic resources, and materials.",
    color: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/50",
    position: "bottom-left",
  },
  {
    id: "announcements",
    title: "Announcements",
    desc: "Important announcements and notifications.",
    color: "from-orange-500 to-amber-500",
    glow: "shadow-orange-500/50",
    position: "bottom-right",
  },
];

// Initial Card Animation from Corners
const cornerVariants = {
  hidden: (pos) => {
    const positions = {
      "top-left": { x: -300, y: -300 },
      "top-right": { x: 300, y: -300 },
      "bottom-left": { x: -300, y: 300 },
      "bottom-right": { x: 300, y: 300 },
    };
    return {
      opacity: 0,
      scale: 0.8,
      ...positions[pos],
    };
  },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.4 },
  },
};

// Expanded Card Variants
const expandedVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.4 } },
};

const Homepage = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  // Hide initial animation after 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Reset card view when clicking outside of expanded card
  const handleOutsideClick = (e) => {
    if (selectedCard && !e.target.closest(".expanded-card")) {
      setSelectedCard(null);
    }
  };

  return (
    <Box
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative"
      onClick={handleOutsideClick}
    >
      {/* Navbar */}
      <Navbar />

      {/* Initial Lottie Animation */}
      {showAnimation && (
        <Box className="fixed inset-0 flex items-center justify-center bg-black z-50">
          <Lottie
            animationData={homepageAnimation}
            loop={false}
            autoplay
            style={{ width: 300, height: 300 }}
          />
        </Box>
      )}

      {/* Main Content after Animation */}
      {!showAnimation && (
        <Box className="relative z-10 px-8 py-12 mt-10 h-[calc(100vh-100px)]">
          <AnimatePresence>
            {/* Expanded Card */}
            {selectedCard ? (
              <motion.div
                className="fixed inset-0 flex items-center justify-center p-8 bg-black bg-opacity-90 z-50 expanded-card"
                variants={expandedVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Card
                  className={`bg-gradient-to-r ${selectedCard.color} shadow-xl shadow-${selectedCard.glow} rounded-3xl w-full max-w-3xl`}
                >
                  <CardContent className="p-8 text-center">
                    <Typography
                      variant="h4"
                      className="text-white font-bold mb-4"
                    >
                      {selectedCard.title}
                    </Typography>
                    <Typography variant="body1" className="text-gray-200 mb-6">
                      {selectedCard.desc}
                    </Typography>
                    <Button
                      onClick={() => setSelectedCard(null)}
                      className="text-white bg-red-600 px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      Go Back
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              // Cards Positioned in Four Corners
              <div className="w-full h-full relative">
                {cardData.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={cornerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={item.position}
                    className={`absolute ${
                      item.position === "top-left" && "top-0 left-0"
                    } ${item.position === "top-right" && "top-0 right-0"} ${
                      item.position === "bottom-left" && "bottom-0 left-0"
                    } ${
                      item.position === "bottom-right" && "bottom-0 right-0"
                    } m-6`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-[670px] h-[280px] bg-gradient-to-r ${item.color} shadow-xl shadow-${item.glow} rounded-2xl flex items-center justify-center cursor-pointer transform transition-all`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCard(item);
                      }}
                    >
                      <CardContent className="text-center p-4">
                        {/* Glowing Neon Button with Mixed Edge Style */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCard(item);
                          }}
                          className="text-white text-lg font-bold px-6 py-3 rounded-lg bg-black bg-opacity-60 transition-all shadow-neon hover:scale-110"
                          sx={{
                            border: "2px solid #ff3b3b",
                            boxShadow:
                              "0 0 10px #ff3b3b, 0 0 20px #ff3b3b, inset 0 0 5px rgba(255, 0, 0, 0.6)",
                            borderRadius: "20px 4px 20px 4px",
                          }}
                        >
                          {item.title}
                        </Button>
                      </CardContent>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default Homepage;
