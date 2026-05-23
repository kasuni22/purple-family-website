import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

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
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>💜 Purple Family</h1>
        {user && (
          <div style={styles.userInfo}>
            <span style={styles.welcome}>Welcome, {user.username}! 💜</span>
            <span style={styles.bias}>Bias: {user.bias}</span>
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
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </div>

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
          {posts.length === 0 && <p style={{ color: "#ccc" }}>No posts yet. Be the first! 💜</p>}
          {posts.map(post => (
            <div key={post.id} style={styles.post}>
              <h3 style={styles.postTitle}>{post.title}</h3>
              <p style={styles.postContent}>{post.content}</p>
              <small style={styles.postDate}>
                {new Date(post.created_at).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff" },
  header: {
    background: "#ffffff",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #e0d0ff",
  },
  logo: { color: "#7c3aed", margin: 0 },
  userInfo: { display: "flex", alignItems: "center", gap: "1rem" },
  welcome: { color: "#2d0a4e" },
  bias: {
    color: "#7c3aed",
    background: "#f0e6ff",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  navBtn: {
    padding: "6px 16px",
    background: "#7c3aed",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "6px 16px",
    background: "transparent",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "6px",
    cursor: "pointer",
  },
  content: { maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    border: "1px solid #d4b8ff",
  },
  cardTitle: { color: "#2d0a4e", marginTop: 0 },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "#f0e6ff",
    color: "#2d0a4e",
    fontSize: "1rem",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "#f0e6ff",
    color: "#2d0a4e",
    fontSize: "1rem",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    background: "#7c3aed",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
  },
  post: { borderBottom: "1px solid #d4b8ff", paddingBottom: "1rem", marginBottom: "1rem" },
  postTitle: { color: "#2d0a4e", margin: "0 0 0.5rem 0" },
  postContent: { color: "#2d0a4e", margin: "0 0 0.5rem 0" },
  postDate: { color: "#888888" },
};