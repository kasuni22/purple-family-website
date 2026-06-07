import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MONTHS = ["All", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const BTS_BIRTHDAYS = [
  { name: "Jin", date: "December 4", month: 12, emoji: "🐹" },
  { name: "Suga", date: "March 9", month: 3, emoji: "🐱" },
  { name: "J-Hope", date: "February 18", month: 2, emoji: "🐿️" },
  { name: "RM", date: "September 12", month: 9, emoji: "🐨" },
  { name: "Jimin", date: "October 13", month: 10, emoji: "🐥" },
  { name: "Taehyung", date: "December 30", month: 12, emoji: "🐯" },
  { name: "Jungkook", date: "September 1", month: 9, emoji: "🐰" },
  { name: "BTS Debut", date: "June 13", month: 6, emoji: "💜", special: true },
  { name: "ARMY Day", date: "July 9", month: 7, emoji: "💜", special: true },
];

export default function Birthdays() {
  const [birthdays, setBirthdays] = useState([]);
  const [birthdayPosts, setBirthdayPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [btsMonth, setBtsMonth] = useState("All");
  const [activeTab, setActiveTab] = useState("army");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ for_username: "", message: "", file: null });
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();

  const today = new Date();

  useEffect(() => {
    API.get("/auth/me").catch(() => navigate("/login"));
    API.get("/birthdays").then(res => setBirthdays(res.data));
    API.get("/birthday-posts").then(res => setBirthdayPosts(res.data));
  }, []);

  const isBirthdayToday = (birthday) => {
    const date = new Date(birthday);
    return date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const todayBirthdays = birthdays.filter(m => isBirthdayToday(m.birthday));

  const filteredArmy = birthdays.filter(m => {
    const date = new Date(m.birthday);
    const matchMonth = monthFilter === "All" ||
      date.getMonth() === MONTHS.indexOf(monthFilter) - 1;
    const matchSearch = m.username.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchSearch;
  });

  const filteredBts = BTS_BIRTHDAYS.filter(m =>
    btsMonth === "All" || m.month === MONTHS.indexOf(btsMonth)
  );

  const handlePost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("for_username", postForm.for_username);
    formData.append("message", postForm.message);
    if (postForm.file) formData.append("file", postForm.file);
    try {
      await API.post("/birthday-posts", formData,
        { headers: { "Content-Type": "multipart/form-data" } });
      const res = await API.get("/birthday-posts");
      setBirthdayPosts(res.data);
      setPostForm({ for_username: "", message: "", file: null });
      setShowPostForm(false);
    } catch (err) {
      alert("Failed to post");
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]) return;
    const formData = new FormData();
    formData.append("content", commentText[postId]);
    try {
      await API.post(`/birthday-comments/${postId}`, formData,
        { headers: { "Content-Type": "multipart/form-data" } });
      const res = await API.get("/birthday-posts");
      setBirthdayPosts(res.data);
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      alert("Failed to comment");
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>

        {/* Tab Navigation */}
        <div style={styles.tabNav}>
          <button onClick={() => setActiveTab("army")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "army" ? "#7c3aed" : "white",
              color: activeTab === "army" ? "white" : "#7c3aed"
            }}>
            🎂 ARMY Birthdays
          </button>
          <button onClick={() => setActiveTab("wishes")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "wishes" ? "#7c3aed" : "white",
              color: activeTab === "wishes" ? "white" : "#7c3aed"
            }}>
            🎉 Birthday Wishes
          </button>
          <button onClick={() => setActiveTab("bts")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "bts" ? "#7c3aed" : "white",
              color: activeTab === "bts" ? "white" : "#7c3aed"
            }}>
            💜 BTS Birthdays
          </button>
        </div>

        {/* ── TAB 1: ARMY Birthdays ── */}
        {activeTab === "army" && (
          <>
            <h2 style={styles.title}>🎂 ARMY Birthday Calendar</h2>
            <p style={styles.subtitle}>Today is {today.toLocaleDateString("en-US",
              { month: "long", day: "numeric" })} 💜</p>

            {/* Today's birthdays */}
            {todayBirthdays.length > 0 && (
              <div style={styles.todayCard}>
                <h3 style={styles.todayTitle}>🎉 Today's Birthdays!</h3>
                {todayBirthdays.map((m, i) => (
                  <div key={i} style={styles.todayItem}>
                    <div style={styles.avatarSm}>{m.username[0].toUpperCase()}</div>
                    <div>
                      <strong style={{ color: "#2d0a4e" }}>{m.username}</strong>
                      <p style={{ color: "#7c3aed", fontSize: "0.85rem" }}>
                        Happy Birthday! 🎉💜
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search & Filter */}
            <div style={styles.controls}>
              <input style={styles.search} placeholder="Search by nickname..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <select style={styles.select} value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            {filteredArmy.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={{ color: "#888" }}>No birthdays found 💜</p>
                <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
                  Update your profile to add your birthday!
                </p>
              </div>
            ) : (
              <div style={styles.grid}>
                {filteredArmy.map((member, i) => (
                  <div key={i} style={{
                    ...styles.card,
                    border: isBirthdayToday(member.birthday)
                      ? "2px solid gold" : "1px solid #d4b8ff"
                  }}>
                    {isBirthdayToday(member.birthday) && (
                      <div style={styles.todayBadge}>🎉 Today!</div>
                    )}
                    <div style={styles.avatar}>
                      {member.username[0].toUpperCase()}
                    </div>
                    <h3 style={styles.username}>{member.username}</h3>
                    <p style={styles.date}>🎂 {formatDate(member.birthday)}</p>
                    {member.bias && (
                      <p style={styles.bias}>💜 {member.bias}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: Birthday Wishes ── */}
        {activeTab === "wishes" && (
          <>
            <div style={styles.wishesHeader}>
              <h2 style={styles.title}>🎉 Birthday Wishes</h2>
              <button onClick={() => setShowPostForm(!showPostForm)}
                style={styles.addBtn}>
                {showPostForm ? "Cancel" : "🎂 Add Birthday Wish"}
              </button>
            </div>

            {showPostForm && (
              <div style={styles.formCard}>
                <h3 style={styles.cardTitle}>Add Birthday Wish 💜</h3>
                <form onSubmit={handlePost} style={styles.form}>
                  <input style={styles.input} placeholder="For who? (nickname)"
                    value={postForm.for_username}
                    onChange={e => setPostForm({ ...postForm, for_username: e.target.value })}
                    required />
                  <textarea style={styles.textarea}
                    placeholder="Write a birthday message 💜" rows={3}
                    value={postForm.message}
                    onChange={e => setPostForm({ ...postForm, message: e.target.value })}
                    required />
                  <input type="file" accept="image/*" style={{ color: "#2d0a4e" }}
                    onChange={e => setPostForm({ ...postForm, file: e.target.files[0] })} />
                  <button style={styles.button} type="submit">Post Wish 💜</button>
                </form>
              </div>
            )}

            {birthdayPosts.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={{ color: "#888" }}>No birthday wishes yet! Be the first 💜</p>
              </div>
            ) : (
              birthdayPosts.map(post => (
                <div key={post.id} style={styles.wishCard}>
                  <div style={styles.wishHeader}>
                    <div style={styles.avatarSm}>
                      {post.posted_by[0].toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ color: "#2d0a4e" }}>
                        {post.posted_by}
                      </strong>
                      <span style={{ color: "#7c3aed" }}>
                        {" "}wishes Happy Birthday to{" "}
                      </span>
                      <strong style={{ color: "#7c3aed" }}>
                        {post.for_username}
                      </strong>
                      <p style={{ color: "#aaa", fontSize: "0.8rem" }}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p style={styles.wishMessage}>{post.message}</p>
                  {post.image_path && (
                    <img src={`http://127.0.0.1:8000/${post.image_path}`}
                      alt="birthday" style={styles.wishImg} />
                  )}

                  {/* Comments */}
                  <div style={styles.comments}>
                    {post.comments.map((c, i) => (
                      <div key={i} style={styles.comment}>
                        <span style={styles.commentUser}>💜 {c.owner}</span>
                        <span style={styles.commentText}>{c.content}</span>
                      </div>
                    ))}
                    <div style={styles.commentForm}>
                      <input style={styles.commentInput}
                        placeholder="Add a comment 💜"
                        value={commentText[post.id] || ""}
                        onChange={e => setCommentText({
                          ...commentText, [post.id]: e.target.value
                        })} />
                      <button style={styles.commentBtn}
                        onClick={() => handleComment(post.id)}>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── TAB 3: BTS Birthdays ── */}
        {activeTab === "bts" && (
          <>
            <h2 style={styles.title}>💜 BTS Birthdays & Special Days</h2>
            <select style={{ ...styles.select, marginBottom: "1.5rem" }}
              value={btsMonth} onChange={e => setBtsMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <div style={styles.grid}>
              {filteredBts.map((member, i) => (
                <div key={i} style={{
                  ...styles.card,
                  border: member.special ? "2px solid #7c3aed" : "1px solid #d4b8ff",
                  background: member.special ? "#f0e6ff" : "white"
                }}>
                  <div style={styles.btsEmoji}>{member.emoji}</div>
                  <h3 style={styles.username}>{member.name}</h3>
                  <p style={styles.date}>🎂 {member.date}</p>
                  {member.special && (
                    <div style={styles.specialBadge}>Special Day 💜</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", background: "#f8f5ff",
    display: "flex", flexDirection: "column"
  },
  header: {
    background: "white", padding: "0.75rem 2rem", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    borderBottom: "2px solid #e0d0ff", position: "sticky", top: 0, zIndex: 100
  },
  navCenter: { display: "flex", gap: "0.5rem" },
  tabBtn: {
    padding: "8px 16px", border: "1px solid #7c3aed",
    borderRadius: "20px", cursor: "pointer", fontSize: "0.9rem"
  },
  backBtn: {
    padding: "8px 16px", background: "white",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "6px", cursor: "pointer"
  },
  content: { width: "100%", padding: "2rem 3rem", flex: 1, boxSizing: "border-box" },
  tabNav: { display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" },
  title: { color: "#2d0a4e", fontSize: "2rem", marginBottom: "0.5rem" },
  subtitle: { color: "#888", marginBottom: "1.5rem" },
  todayCard: {
    background: "#fff9e6", border: "2px solid gold",
    borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem"
  },
  todayTitle: { color: "#2d0a4e", marginBottom: "1rem" },
  todayItem: {
    display: "flex", alignItems: "center", gap: "1rem",
    marginBottom: "0.5rem"
  },
  controls: { display: "flex", gap: "1rem", marginBottom: "1.5rem" },
  search: {
    flex: 1, padding: "10px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "white",
    color: "#2d0a4e", fontSize: "1rem"
  },
  select: {
    padding: "10px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "white",
    color: "#2d0a4e", fontSize: "1rem"
  },
  emptyCard: {
    background: "white", borderRadius: "12px", padding: "3rem",
    textAlign: "center", border: "1px solid #d4b8ff"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem", width: "100%"
  },
  card: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    textAlign: "center", position: "relative"
  },
  todayBadge: {
    position: "absolute", top: "-12px", left: "50%",
    transform: "translateX(-50%)", background: "gold", color: "#2d0a4e",
    padding: "2px 12px", borderRadius: "20px", fontSize: "0.8rem",
    fontWeight: "bold"
  },
  avatar: {
    width: "60px", height: "60px", borderRadius: "50%",
    background: "#7c3aed", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold",
    margin: "0 auto 1rem", color: "white"
  },
  avatarSm: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "#7c3aed", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "1rem", fontWeight: "bold",
    color: "white", flexShrink: 0
  },
  username: { color: "#2d0a4e", marginBottom: "0.5rem" },
  date: { color: "#7c3aed", marginBottom: "0.5rem" },
  bias: { color: "#888", fontSize: "0.9rem" },
  btsEmoji: { fontSize: "2.5rem", marginBottom: "0.5rem" },
  specialBadge: {
    display: "inline-block", padding: "4px 12px",
    background: "#7c3aed", color: "white", borderRadius: "20px",
    fontSize: "0.8rem", marginTop: "0.5rem"
  },
  wishesHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "1.5rem"
  },
  addBtn: {
    padding: "8px 16px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "8px", cursor: "pointer"
  },
  formCard: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    border: "1px solid #d4b8ff", marginBottom: "1.5rem"
  },
  cardTitle: { color: "#2d0a4e", marginBottom: "1rem" },
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
  wishCard: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    border: "1px solid #d4b8ff", marginBottom: "1.5rem"
  },
  wishHeader: {
    display: "flex", gap: "1rem", alignItems: "flex-start",
    marginBottom: "1rem"
  },
  wishMessage: { color: "#2d0a4e", marginBottom: "1rem", lineHeight: 1.6 },
  wishImg: {
    width: "100%", borderRadius: "8px", marginBottom: "1rem",
    maxHeight: "300px", objectFit: "cover"
  },
  comments: { borderTop: "1px solid #e0d0ff", paddingTop: "1rem" },
  comment: {
    display: "flex", gap: "0.5rem", marginBottom: "0.5rem",
    alignItems: "flex-start"
  },
  commentUser: {
    color: "#7c3aed", fontWeight: "500", fontSize: "0.85rem",
    flexShrink: 0
  },
  commentText: { color: "#444", fontSize: "0.9rem" },
  commentForm: { display: "flex", gap: "0.5rem", marginTop: "0.75rem" },
  commentInput: {
    flex: 1, padding: "8px 12px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "#f8f5ff",
    color: "#2d0a4e", fontSize: "0.9rem"
  },
  commentBtn: {
    padding: "8px 16px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem"
  },
  footer: { background: "#2d0a4e", padding: "1.5rem", textAlign: "center" },
  footerText: { color: "#b39ddb", fontSize: "0.9rem" },
};