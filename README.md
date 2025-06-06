# 🖼️ Create-Art-X

Create Art X is a collaborative, real-time **Canva-style web app** built for students, clubs, and creatives to easily design and share campus posters, banners, and more. It combines the power of live editing, smart templates, and social features — all in one seamless platform.

---

## 🚀 Features

- 🧑‍🎨 **Interactive Board Editor** using **Konva.js**  
  Create and edit designs with tools like pencil, shapes, text, and image uploads — directly on a canvas.

- 👥 **Real-time Collaboration** using **Liveblocks + Socket.IO**  
  Collaborate live with teammates. See each other's mouse pointers, drawings, and updates instantly.

- 💬 **In-app Chat**  
  Communicate with team members directly while working on the same design.

- 🧩 **Template Library**  
  Choose from blank boards or pre-made templates for quick design starts.

- 📁 **Drag & Drop Support**  
  Easily upload and position images, elements, and shapes on the canvas.

- 🔍 **Board Search and Management**  
  View, search, rename, and delete boards from a personalized dashboard.

- 🔗 **Board Sharing**  
  Share boards via username, email, or public link for collaborative access.

- 🔐 **User Authentication via Firebase**  
  Secure signup/login with email/password and Google authentication.

- ☁️ **Cloudinary Image Hosting**  
  Uploads and design images are optimized and stored securely in the cloud.

- 🎨 **Modern & Responsive UI**  
  Styled with **Tailwind CSS** and **Material UI** for a clean.

---
## 🌐 Demo Video

> https://drive.google.com/file/d/1EQf4KeXgUMhaVMou6kE5VhahliSUmg4g/view?usp=sharing

## 🛠️ Tech Stack

- **Frontend**: Vite + React,Redux Toolkit Tailwind CSS, Material UI  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Authentication**: Firebase Auth  
- **Canvas/Editor**: Konva.js  
- **Live Collaboration**: Liveblocks + Socket.IO  
- **Image Storage**: Cloudinary  

---

## 📦 Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/campus-art-x.git
   cd campus-art-x
   ```

2. Install dependencies:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Setup environment variables:  
   Create `.env` files for client and server with keys like:

   ```
   # Firebase keys
   REACT_APP_FIREBASE_API_KEY=...

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...

   # Socket.IO, MongoDB, etc.
   ```

4. Run the app:
   ```bash
   # Start backend
   cd server
   npm run dev

   # In another terminal, start frontend
   cd client
   npm run dev
   ```
---
## Authors
Anshul Verma - https://github.com/Anshulstark44

Rahul Kumar Singh - https://github.com/Rahul10182
