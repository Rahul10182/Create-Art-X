import { useEffect } from "react";
import { useUpdateMyPresence } from "@liveblocks/react";
import { useSelector } from "react-redux";

const COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD", 
  "#7986CB", "#64B5F6", "#4FC3F7", "#4DD0E1",
  "#4DB6AC", "#81C784", "#AED581", "#DCE775",
  "#FFF176", "#FFD54F", "#FFB74D", "#FF8A65"
];

export const UserPresence = () => {
  const updateMyPresence = useUpdateMyPresence();
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!currentUser) {
      console.warn("No current user found");
      return;
    }

    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    updateMyPresence({
      name: currentUser.name || "Anonymous",
      avatarIndex: currentUser.name?.length % 30 || 0,
      color,
      cursor: null 
    });

    return () => {
      updateMyPresence({ 
        name: "", 
        avatarIndex: 0,
        color: "",
        cursor: null 
      });
    };
  }, [currentUser, updateMyPresence]);

  return null;
};