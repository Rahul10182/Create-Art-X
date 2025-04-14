import React from "react";
import { Avatar, Button, IconButton } from "@mui/material";
import { Edit, GitHub, LinkedIn, Email, LocationOn } from "@mui/icons-material";

const ProfilePage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full sm:w-2/3 lg:w-1/2 p-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              src="https://via.placeholder.com/150"
              alt="User Avatar"
              className="w-20 h-20"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
              <p className="text-gray-500">Software Engineer</p>
            </div>
          </div>
          <IconButton>
            <Edit className="text-gray-500" />
          </IconButton>
        </div>

        {/* About Section */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700">About Me</h3>
          <p className="text-gray-600 mt-2">
            Passionate software engineer with a focus on building scalable web
            applications and user-friendly interfaces.
          </p>

          {/* Contact Details */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-gray-600">
              <Email className="mr-2" />
              <span>johndoe@example.com</span>
            </div>
            <div className="flex items-center text-gray-600">
              <LocationOn className="mr-2" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700">Connect With Me</h3>
          <div className="flex space-x-4 mt-2">
            <IconButton>
              <GitHub className="text-gray-600" />
            </IconButton>
            <IconButton>
              <LinkedIn className="text-blue-500" />
            </IconButton>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <Button
            variant="contained"
            color="primary"
            className="w-full"
          >
            Edit Profile
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            className="w-full"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
