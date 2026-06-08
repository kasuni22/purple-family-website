import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Wallpapers() {
  const [wallpapers, setWallpapers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", member: "", file: null });
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const members = ["All", "Jin", "Suga", "J-Hope", "RM", "Jimin", "Taehyung", "Jungkook"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await API.get("/auth/me");
        setCurrentUser(userRes.data);
        const wallpapersRes = await API.get("/wallpapers");
        setWallpapers(wallpapersRes.data);
      } catch {
        navigate("/login");
      }
    };
    loadData();
  }, [navigate]);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
  };

  const canDeleteWallpaper = (wallpaper) => {
    return currentUser && (currentUser.is_admin || currentUser.id === wallpaper.uploaded_by_id);
  };

  const updateWallpaperState = (wallpaperId, changes) => {
    setWallpapers(prev => prev.map(w => w.id === wallpaperId ? { ...w, ...changes } : w));
    setSelectedWallpaper(prev => prev && prev.id === wallpaperId ? { ...prev, ...changes } : prev);
  };

  const handleLike = async (wallpaper, e) => {
    e.stopPropagation();
    try {
      await API.post(`/wallpapers/${wallpaper.id}/like`);
      updateWallpaperState(wallpaper.id, {
        liked_by_current_user: true,
        likes_count: (wallpaper.likes_count || 0) + 1,
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Could not like wallpaper");
    }
  };

  const handleUnlike = async (wallpaper, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/wallpapers/${wallpaper.id}/like`);
      updateWallpaperState(wallpaper.id, {
        liked_by_current_user: false,
        likes_count: Math.max((wallpaper.likes_count || 1) - 1, 0),
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Could not remove like");
    }
  };

  const handleDelete = async (wallpaper, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete wallpaper \"${wallpaper.title}\"?`)) return;
    try {
      await API.delete(`/wallpapers/${wallpaper.id}`);
      setWallpapers(prev => prev.filter(w => w.id !== wallpaper.id));
      if (selectedWallpaper?.id === wallpaper.id) {
        setSelectedWallpaper(null);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Could not delete wallpaper");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) return alert("Please select a file!");
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("member", form.member);
    formData.append("file", form.file);
    try {
      const res = await API.post("/wallpapers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

  const getFileUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `http://127.0.0.1:8000/${path}`;
  };

  const handleDownload = (wallpaper) => {
    window.location.href = `http://127.0.0.1:8000/wallpapers/${wallpaper.id}/download`;
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.headerControls}>
          <h2 style={styles.title}>🖼️ BTS Wallpaper Gallery</h2>
          {currentUser?.is_admin && (
            <button onClick={() => setUploading(!uploading)} style={styles.uploadBtn}>
              {uploading ? "Cancel" : "⬆️ Upload Wallpaper"}
            </button>
          )}
        </div>

        {/* Upload Form - Admin Only */}
        {currentUser?.is_admin && uploading && (
          <div style={styles.uploadCard}>
            <h3 style={styles.cardTitle}>Upload New Wallpaper</h3>
            <form onSubmit={handleUpload} style={styles.form}>
              <input style={styles.input} placeholder="Wallpaper Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
              <select style={styles.input}
                value={form.member}
                onChange={e => setForm({ ...form, member: e.target.value })}>
                <option value="">Select Member</option>
                {members.slice(1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input type="file" accept="image/*" style={styles.fileInput}
                onChange={e => setForm({ ...form, file: e.target.files[0] })} required />
              <button style={styles.button} type="submit">Upload 💜</button>
            </form>
          </div>
        )}

        {/* Filter Buttons */}
        <div style={styles.filters}>
          {members.map(m => (
            <button key={m} onClick={() => setFilter(m)}
              style={{
                ...styles.filterBtn,
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
            <p style={{ color: "#ccc" }}>No wallpapers yet! 💜</p>
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Be the first ARMY to upload a wallpaper! 💜</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(w => (
              <div key={w.id} style={styles.card} onClick={() => setSelectedWallpaper(w)}>
                <img
                  src={getFileUrl(w.file_path)}
                  alt={w.title}
                  style={styles.image}
                />
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{w.title}</h3>
                  {w.member && <p style={styles.member}>💜 {w.member}</p>}
                  <p style={styles.meta}>👤 {w.uploaded_by_username || "Unknown"} · 📅 {formatDate(w.created_at)}</p>
                  <p style={styles.likes}>💜 {w.likes_count || 0} likes</p>
                  <div style={styles.actionRow}>
                    <button
                      onClick={(e) => w.liked_by_current_user ? handleUnlike(w, e) : handleLike(w, e)}
                      style={styles.likeBtn}
                    >
                      {w.liked_by_current_user ? "❤️ Liked" : "🤍 Like"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDownload(w); }}
                      style={styles.downloadBtn}>
                      ⬇️ Download
                    </button>
                    {canDeleteWallpaper(w) && (
                      <button onClick={(e) => handleDelete(w, e)} style={styles.deleteBtn}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedWallpaper && (
          <div style={styles.modalOverlay} onClick={() => setSelectedWallpaper(null)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setSelectedWallpaper(null)}>×</button>
              <img src={getFileUrl(selectedWallpaper.file_path)} alt={selectedWallpaper.title}
                style={styles.modalImage} />
              <div style={styles.modalInfo}>
                <h3 style={styles.modalTitle}>{selectedWallpaper.title}</h3>
                {selectedWallpaper.member && (
                  <p style={styles.member}>💜 {selectedWallpaper.member}</p>
                )}
                <p style={styles.meta}>👤 {selectedWallpaper.uploaded_by_username || "Unknown"} · 📅 {formatDate(selectedWallpaper.created_at)}</p>
                <p style={styles.likes}>💜 {selectedWallpaper.likes_count || 0} likes</p>
                <div style={styles.modalActions}>
                  <button
                    style={styles.likeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectedWallpaper.liked_by_current_user ? handleUnlike(selectedWallpaper, e) : handleLike(selectedWallpaper, e);
                    }}
                  >
                    {selectedWallpaper.liked_by_current_user ? "❤️ Liked" : "🤍 Like"}
                  </button>
                  <button style={styles.downloadBtn} onClick={() => handleDownload(selectedWallpaper)}>
                    ⬇️ Download
                  </button>
                  {canDeleteWallpaper(selectedWallpaper) && (
                    <button style={styles.deleteBtn} onClick={(e) => handleDelete(selectedWallpaper, e)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff", display: "flex", flexDirection: "column" },
  content: {
    width: "100%",
    padding: "2rem 3rem",
    flex: 1,
    boxSizing: "border-box"
  },
  headerControls: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { color: "#2d0a4e", fontSize: "2rem", margin: 0 },
  uploadBtn: {
    padding: "8px 16px",
    background: "#7c3aed",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
    width: "100%"
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #d4b8ff",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  },
  image: { width: "100%", height: "280px", objectFit: "contain", background: "#f8f5ff" },
  cardInfo: { padding: "1rem" },
  cardTitle: { color: "#2d0a4e", margin: "0 0 0.5rem" },
  member: { color: "#888888", fontSize: "0.9rem", margin: "0 0 0.5rem" },
  meta: { color: "#666", fontSize: "0.85rem", margin: "0 0 0.5rem" },
  likes: { color: "#7c3aed", fontSize: "0.9rem", margin: "0 0 1rem", fontWeight: 600 },
  actionRow: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.75rem" },
  likeBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    background: "#f3e8ff",
    color: "#7c3aed",
    border: "1px solid #7c3aed",
    cursor: "pointer",
    fontWeight: 600,
  },
  deleteBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    cursor: "pointer",
    fontWeight: 600,
  },
  modalActions: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginTop: "1rem" },
  downloadBtn: {
    display: "inline-block",
    padding: "6px 16px",
    background: "#7c3aed",
    color: "white",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(45, 10, 78, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "2rem",
  },
  modalContent: {
    position: "relative",
    background: "white",
    borderRadius: "16px",
    padding: "1rem",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalImage: {
    width: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    borderRadius: "12px",
    background: "#f8f5ff",
  },
  modalInfo: {
    padding: "1rem 0 0",
  },
  modalTitle: {
    color: "#2d0a4e",
    margin: "0 0 0.5rem",
  },
  closeBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1rem",
    zIndex: 2,
  }
};