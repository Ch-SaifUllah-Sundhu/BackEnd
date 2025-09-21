import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VideoList from "./components/Videos/VideoList";
import UploadVideo from "./components/Videos/UploadVideo";
import SubscriptionList from "./components/Subscriptions/SubscriptionList";

function App() {
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/videos" element={<VideoList />} />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/subscriptions" element={<SubscriptionList />} />
      </Routes>
    </Router>
  );
}

export default App;

