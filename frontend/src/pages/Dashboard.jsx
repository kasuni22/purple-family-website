import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import btsHero from "../assets/bts-hero.jpeg";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [showBirthdayNotice, setShowBirthdayNotice] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me").catch(() => navigate("/login"));
    API.get("/posts").then(res => setPosts(res.data));
    API.get("/birthdays/today").then(res => setTodayBirthdays(res.data || [])).catch(() => { });
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

  return (
    <div style={styles.container}>
      {/* BTS Background */}
      <div style={styles.bgWrapper}>
        <img src={btsHero} alt="" style={styles.bgImg}
          onError={(e) => e.target.style.display = "none"} />
      </div>

      <Navbar />

      {/* Content */}
      <div style={styles.content}>
        {showBirthdayNotice && todayBirthdays.length > 0 && (
          <div style={styles.birthdayNotice}>
            <div style={styles.birthdayNoticeHeader}>
              <div>
                <h2 style={styles.birthdayTitle}>🎂 Today's Birthday Notification</h2>
                <p style={styles.birthdaySubtitle}>
                  Let's send love to our ARMY family today 💜
                </p>
              </div>
              <button
                style={styles.closeNoticeBtn}
                onClick={() => setShowBirthdayNotice(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.birthdayList}>
              {todayBirthdays.map((member) => (
                <div key={member.id} style={styles.birthdayPerson}>
                  <div style={styles.birthdayAvatar}>
                    {member.profile_picture ? (
                      <img
                        src={`http://127.0.0.1:8000/${member.profile_picture}`}
                        alt={member.nickname || member.username}
                        style={styles.birthdayAvatarImg}
                      />
                    ) : (
                      (member.nickname || member.username || "?")[0].toUpperCase()
                    )}
                  </div>

                  <div>
                    <strong style={styles.birthdayName}>
                      Happy Birthday {member.nickname || member.username}! 🎉
                    </strong>
                    {member.bias && (
                      <p style={styles.birthdayBias}>Bias: {member.bias} 💜</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              style={styles.wishBtn}
              onClick={() => navigate("/birthdays")}
            >
              Send Birthday Wishes 💜
            </button>
          </div>
        )}

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

      <Footer />
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
  content: {
    maxWidth: "800px", margin: "2rem auto", padding: "0 1rem",
    flex: 1, position: "relative", zIndex: 1, width: "100%"
  },
  birthdayNotice: {
    background: "linear-gradient(135deg, #fff7d6, #f3e8ff)",
    border: "2px solid #facc15",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 8px 22px rgba(124, 58, 237, 0.16)"
  },
  birthdayNoticeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem"
  },
  birthdayTitle: { color: "#2d0a4e", margin: 0 },
  birthdaySubtitle: { color: "#7c3aed", margin: "0.3rem 0 0" },
  closeNoticeBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    background: "white",
    color: "#7c3aed",
    cursor: "pointer",
    fontSize: "1.4rem",
    fontWeight: "bold"
  },
  birthdayList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1rem"
  },
  birthdayPerson: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    background: "rgba(255,255,255,0.75)",
    borderRadius: "12px",
    padding: "0.75rem"
  },
  birthdayAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#7c3aed",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.2rem",
    overflow: "hidden",
    flexShrink: 0
  },
  birthdayAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  birthdayName: { color: "#2d0a4e" },
  birthdayBias: { color: "#7c3aed", margin: "0.25rem 0 0", fontSize: "0.9rem" },
  wishBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
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
};