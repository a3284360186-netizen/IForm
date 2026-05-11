import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import CreatePost from "@/pages/CreatePost";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
