import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Wallpapers() {
  const [wallpapers, setWallpapers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", member: "", file: null });
  const navigate = useNavigate();

  const members = ["All", "Jin", "Suga", "J-Hope", "RM", "Jimin", "Taehyung", "Jungkook"];

  useEffect(() => {
    API.get("/auth/me").then(res => setUser(res.data)).catch(() => navigate("/login"));
    API.get("/wallpapers").then(res => setWallpapers(res.data));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) return alert("Please select a file!");
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("member", form.member);
    formData.append("file", form.file);
    try {
      const res = await API.post("/wallpapers", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setWallpapers([res.data, ...wallpapers]);
      setForm({ title: "", member: "", file: null });
      setUploading(false);
      alert("Wallpaper uploaded! 💜");
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed");
    }
  };

  const filtered = filter === "All" ? wallpapers 
    : wallpapers.filter(w => w.member === filter);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>💜 Purple Family</h1>
        <div style={styles.headerRight}>
          {user?.is_admin && (
            <button onClick={() => setUploading(!uploading)} style={styles.uploadBtn}>
              {uploading ? "Cancel" : "⬆️ Upload Wallpaper"}
            </button>
          )}
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>🖼️ BTS Wallpaper Gallery</h2>

        {/* Upload Form - Admin Only */}
        {uploading && user?.is_admin && (
          <div style={styles.uploadCard}>
            <h3 style={styles.cardTitle}>Upload New Wallpaper</h3>
            <form onSubmit={handleUpload} style={styles.form}>
              <input style={styles.input} placeholder="Wallpaper Title"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
              <select style={styles.input}
                onChange={e => setForm({...form, member: e.target.value})}>
                <option value="">Select Member</option>
                {members.slice(1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input type="file" accept="image/*" style={styles.fileInput}
                onChange={e => setForm({...form, file: e.target.files[0]})} required />
              <button style={styles.button} type="submit">Upload 💜</button>
            </form>
          </div>
        )}

        {/* Filter Buttons */}
        <div style={styles.filters}>
          {members.map(m => (
            <button key={m} onClick={() => setFilter(m)}
              style={{...styles.filterBtn, 
                background: filter === m ? "#7c3aed" : "transparent",
                border: filter === m ? "none" : "1px solid #7c3aed"
              }}>
              {m}
            </button>
          ))}
        </div>

        {/* Wallpaper Grid */}
        {filtered.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={{color: "#ccc"}}>No wallpapers yet! 💜</p>
            {!user?.is_admin && <p style={{color: "#888", fontSize: "0.9rem"}}>Ask an admin to upload some!</p>}
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(w => (
              <div key={w.id} style={styles.card}>
                <img 
                  src={`http://127.0.0.1:8000/${w.file_path}`}
                  alt={w.title}
                  style={styles.image}
                />
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{w.title}</h3>
                  {w.member && <p style={styles.member}>💜 {w.member}</p>}
                  <a href={`http://127.0.0.1:8000/${w.file_path}`}
                    download style={styles.downloadBtn}>
                    ⬇️ Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
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
  headerRight: { display: "flex", gap: "1rem", alignItems: "center" },
  uploadBtn: {
    padding: "8px 16px",
    background: "#7c3aed",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
  backBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "6px",
    cursor: "pointer",
  },
  content: { maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem" },
  title: { color: "#2d0a4e", fontSize: "2rem", marginBottom: "1.5rem" },
  uploadCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    border: "1px solid #d4b8ff",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "#f0e6ff",
    color: "#2d0a4e",
    fontSize: "1rem",
  },
  fileInput: { color: "#2d0a4e" },
  button: {
    padding: "12px",
    borderRadius: "8px",
    background: "#7c3aed",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
  },
  filters: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" },
  filterBtn: {
    padding: "6px 16px",
    borderRadius: "20px",
    color: "#2d0a4e",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  emptyCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "3rem",
    textAlign: "center",
    border: "1px solid #d4b8ff",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #d4b8ff",
  },
  image: { width: "100%", height: "200px", objectFit: "cover" },
  cardInfo: { padding: "1rem" },
  cardTitle: { color: "#2d0a4e", margin: "0 0 0.5rem" },
  member: { color: "#888888", fontSize: "0.9rem", margin: "0 0 0.5rem" },
  downloadBtn: {
    display: "inline-block",
    padding: "6px 16px",
    background: "#7c3aed",
    color: "white",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
};