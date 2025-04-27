import React from "react";
import styles from "./Avatar.module.css";

export function Avatar({ name, avatarIndex, otherStyles }) {
  if (!name) {
    name = "Anonymous";
  }

  if (avatarIndex === undefined || avatarIndex === null) {
    avatarIndex = Math.floor(Math.random() * 30);
  }

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  };

  return (
    <div 
      className={`${styles.avatar} ${otherStyles}`} 
      data-tooltip={name}
      aria-label={`User avatar: ${name}`}
    >
      <img
        src={`https://liveblocks.io/avatars/avatar-${avatarIndex}.png`}
        className={styles.avatar_picture}
        alt={name}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}

export default Avatar;