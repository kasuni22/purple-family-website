import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import btsHero from "../assets/bts-hero.jpeg";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me").then(res => setUser(res.data))
      .catch(() => navigate("/login"));
    API.get("/posts").then(res => setPosts(res.data));
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/posts", newPost);
      setPosts([res.data, ...posts]);
      setNewPost({ title: "", content: "" });
    } catch (err) {
      alert("Failed to post");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* BTS Background */}
      <div style={styles.bgWrapper}>
        <img src={btsHero} alt="" style={styles.bgImg}
          onError={(e) => e.target.style.display = "none"} />
      </div>

      {/* Navbar */}
      <div style={styles.header}>
        {/* Left - Logo */}
        <img src={logo} alt="Purple Family" style={{ height: "40px" }} />

        {/* Center - Nav Links */}
        <div style={styles.navCenter}>
          <button onClick={() => navigate("/birthdays")} style={styles.navBtn}>
            🎂 Birthdays
          </button>
          <button onClick={() => navigate("/wallpapers")} style={styles.navBtn}>
            🖼️ Wallpapers
          </button>
          <button onClick={() => navigate("/members")} style={styles.navBtn}>
            👥 Members
          </button>
          <button onClick={() => navigate("/singalong")} style={styles.navBtn}>
            🎵 Sing-Along
          </button>
          <button onClick={() => navigate("/quiz")} style={styles.navBtn}>
            🎮 Quiz
          </button>
        </div>

        {/* Right - Profile, Welcome, Logout */}
        {user && (
          <div style={styles.navRight}>
            <button onClick={() => navigate("/edit-profile")} style={styles.profileBtn}>
              👤 Profile
            </button>
            <span style={styles.welcome}>Welcome, {user.username}! 💜</span>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Post Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📢 Share with the Family</h2>
          <form onSubmit={handlePost} style={styles.form}>
            <input style={styles.input} placeholder="Title"
              value={newPost.title}
              onChange={e => setNewPost({ ...newPost, title: e.target.value })} required />
            <textarea style={styles.textarea} placeholder="What's on your mind ARMY? 💜"
              value={newPost.content} rows={4}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })} required />
            <button style={styles.button} type="submit">Post 💜</button>
          </form>
        </div>

        {/* Posts Feed */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>💜 Family Updates</h2>
          {posts.length === 0 && (
            <p style={{ color: "#888" }}>No posts yet. Be the first! 💜</p>
          )}
          {posts.map(post => (
            <div key={post.id} style={styles.post}>
              <h3 style={styles.postTitle}>{post.title}</h3>
              <p style={styles.postContent}>{post.content}</p>
              <div style={styles.postFooter}>
                <span style={styles.postUsername}>
                  💜 {post.username || "ARMY"}
                </span>
                <small style={styles.postDate}>
                  {new Date(post.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>Made with 💜 by Kasuni Kariyawasam</p>
          <p style={styles.footerText}>© 2026 Purple Family. All rights reserved.</p>
          <p style={styles.footerSmall}>Built with 🐍 Python & ⚛️ React</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", background: "#f8f5ff",
    display: "flex", flexDirection: "column", position: "relative"
  },
  bgWrapper: {
    position: "fixed", top: 0, right: 0, width: "100%",
    height: "100%", zIndex: 0, pointerEvents: "none"
  },
  bgImg: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.50 },
  header: {
    background: "white", padding: "0.75rem 2rem", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    borderBottom: "2px solid #e0d0ff", position: "sticky",
    top: 0, zIndex: 100
  },
  navCenter: { display: "flex", alignItems: "center", gap: "0.5rem" },
  navRight: { display: "flex", alignItems: "center", gap: "1rem" },
  navBtn: {
    padding: "6px 14px", background: "transparent",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "20px", cursor: "pointer", fontSize: "0.9rem"
  },
  profileBtn: {
    padding: "6px 14px", background: "#f0e6ff",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "20px", cursor: "pointer", fontSize: "0.9rem"
  },
  welcome: { color: "#2d0a4e", fontWeight: "500", fontSize: "0.95rem" },
  logoutBtn: {
    padding: "6px 16px", background: "transparent",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "20px", cursor: "pointer"
  },
  content: {
    maxWidth: "800px", margin: "2rem auto", padding: "0 1rem",
    flex: 1, position: "relative", zIndex: 1, width: "100%"
  },
  card: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    marginBottom: "1.5rem", border: "1px solid #d4b8ff"
  },
  cardTitle: { color: "#2d0a4e", marginTop: 0 },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: {
    padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff",
    background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem"
  },
  textarea: {
    padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff",
    background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem", resize: "vertical"
  },
  button: {
    padding: "12px", borderRadius: "8px", background: "#7c3aed",
    color: "white", fontSize: "1rem", cursor: "pointer", border: "none"
  },
  post: {
    borderBottom: "1px solid #e0d0ff", paddingBottom: "1rem",
    marginBottom: "1rem"
  },
  postTitle: { color: "#2d0a4e", margin: "0 0 0.5rem 0" },
  postContent: { color: "#444", margin: "0 0 0.5rem 0" },
  postFooter: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center"
  },
  postUsername: { color: "#7c3aed", fontSize: "0.85rem", fontWeight: "500" },
  postDate: { color: "#888" },
  footer: {
    background: "#2d0a4e", padding: "1.5rem",
    textAlign: "center", position: "relative", zIndex: 1
  },
  footerContent: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  footerText: { color: "#b39ddb", fontSize: "0.9rem" },
  footerSmall: { color: "#7c3aed", fontSize: "0.85rem" },
};