import { useMemo } from "react";
import { useOthers, useSelf, useStatus } from "@liveblocks/react";
import { Avatar } from "./Avatar";

const ActiveUsers = () => {
  const others = useOthers();
  const self = useSelf();
  const status = useStatus();

  console.debug("[ActiveUsers] Status:", status);
  console.debug("[ActiveUsers] Other users count:", others.length);
  console.debug("[ActiveUsers] Self presence:", self?.presence);

  const memoizedUsers = useMemo(() => {
    const liveUsers = self ? [self, ...others] : others;
    const liveUsersCount = liveUsers.length;

    return (
      <div className="flex items-center gap-3">
        {/* Online count badge */}
        <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {liveUsersCount} online
        </div>

        {/* Avatars container */}
        <div className="flex items-center">
          {/* Current user (you) */}
          {self && (
            <div 
              title={`You (${self.presence.name || "Me"})`}
              className="relative z-10 hover:scale-110 transition-transform"
            >
              <Avatar
                name={self.presence.name || "You"}
                avatarIndex={self.presence.avatarIndex}
                otherStyles="border-2 border-green-500"
              />
            </div>
          )}

          {/* Other connected users */}
          {others.map((user) => (
            <div
              key={user.connectionId}
              title={user.presence.name || "Anonymous"}
              className="relative -ml-2 hover:scale-110 transition-transform"
            >
              <Avatar
                name={user.presence.name}
                avatarIndex={user.presence.avatarIndex}
                otherStyles="border-2 border-blue-400"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }, [others, self]);

  if (status === "disconnected") {
    return (
      <div className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded">
        Disconnected
      </div>
    );
  }

  if (status !== "connected") {
    return (
      <div className="text-yellow-600 text-xs bg-yellow-100 px-2 py-1 rounded">
        Connecting...
      </div>
    );
  }

  return memoizedUsers;
};

export default ActiveUsers;