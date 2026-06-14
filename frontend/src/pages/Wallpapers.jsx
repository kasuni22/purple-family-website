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
  const [editingWallpaper, setEditingWallpaper] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    member: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const members = ["All", "OT7", "RM", "Jin", "Suga", "J-Hope", "Jimin", "Taehyung", "Jungkook"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await API.get("/auth/me");
        setCurrentUser(userRes.data);

        const wallpapersRes = await API.get("/wallpapers");
        setWallpapers(wallpapersRes.data || []);
      } catch {
        navigate("/login");
      }
    };

    loadData();
  }, [navigate]);

  const getFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") && path.includes("cloudinary")) {
      return path.replace("/upload/", "/upload/q_auto,f_auto,w_600/");
    }
    return path.startsWith("http")
      ? path
      : `https://purple-family-website.onrender.com/${path}`;
  };

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
  };

  const canDeleteWallpaper = (wallpaper) => {
    return currentUser && (currentUser.is_admin || currentUser.id === wallpaper.uploaded_by_id);
  };

  const canEditWallpaper = (wallpaper) => {
    return currentUser && (currentUser.is_admin || currentUser.id === wallpaper.uploaded_by_id);
  };

  const updateWallpaperState = (wallpaperId, changes) => {
    setWallpapers((prev) =>
      prev.map((w) => (w.id === wallpaperId ? { ...w, ...changes } : w))
    );

    setSelectedWallpaper((prev) =>
      prev && prev.id === wallpaperId ? { ...prev, ...changes } : prev
    );
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

    if (!window.confirm(`Delete wallpaper "${wallpaper.title}"?`)) return;

    try {
      await API.delete(`/wallpapers/${wallpaper.id}`);

      setWallpapers((prev) => prev.filter((w) => w.id !== wallpaper.id));

      if (selectedWallpaper?.id === wallpaper.id) {
        setSelectedWallpaper(null);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Could not delete wallpaper");
    }
  };

  const startEditWallpaper = (wallpaper, e) => {
    e.stopPropagation();

    setEditingWallpaper(wallpaper);
    setEditForm({
      title: wallpaper.title || "",
      member: wallpaper.member || "",
    });
  };

  const cancelEditWallpaper = () => {
    setEditingWallpaper(null);
    setEditForm({
      title: "",
      member: "",
    });
  };

  const handleUpdateWallpaper = async (e) => {
    e.preventDefault();

    if (!editingWallpaper) return;

    const formData = new FormData();
    formData.append("title", editForm.title);
    formData.append("member", editForm.member);

    try {
      const res = await API.put(
        `/wallpapers/${editingWallpaper.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setWallpapers((prev) =>
        prev.map((w) =>
          w.id === editingWallpaper.id ? res.data : w
        )
      );

      setSelectedWallpaper((prev) =>
        prev && prev.id === editingWallpaper.id
          ? res.data
          : prev
      );

      cancelEditWallpaper();
      alert("Wallpaper updated 💜");
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      setWallpapers([res.data, ...wallpapers]);
      setForm({ title: "", member: "", file: null });
      setUploading(false);
      alert("Wallpaper uploaded! 💜");
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed");
    }
  };

  const filtered =
    filter === "All" ? wallpapers : wallpapers.filter((w) => w.member === filter);

  const handleDownload = (wallpaper) => {
    window.location.href = `https://purple-family-website.onrender.com/wallpapers/${wallpaper.id}/download`;
  };

  return (
    <>
      <Navbar />

      <main className="wallpapers-page" style={styles.page}>
        <section className="wallpapers-hero" style={styles.hero}>
          <div>
            <div style={styles.badge}>🖼️ BTS Wallpaper Gallery</div>
            <h1 style={styles.title}>Collect beautiful purple moments</h1>
            <p style={styles.subtitle}>
              Upload, preview, like and download BTS wallpapers shared by your
              Purple Family.
            </p>
          </div>

          <div className="wallpapers-hero-card" style={styles.heroCard}>
            <span style={styles.heroIcon}>💜</span>
            <h2>{wallpapers.length}</h2>
            <p>Total Wallpapers</p>
          </div>
        </section>

        <section className="wallpapers-toolbar" style={styles.toolbar}>
          <div className="wallpapers-filters" style={styles.filters}>
            {members.map((m) => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === m ? styles.activeFilter : {}),
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            className="wallpapers-upload-main-btn"
            onClick={() => setUploading(!uploading)}
            style={styles.uploadBtn}
          >
            {uploading ? "Cancel" : "⬆️ Upload Wallpaper"}
          </button>
        </section>

        {uploading && (
          <section className="wallpapers-upload-card" style={styles.uploadCard}>
            <h3 style={styles.cardTitle}>Upload New Wallpaper</h3>

            <form className="wallpapers-form" onSubmit={handleUpload} style={styles.form}>
              <input
                style={styles.input}
                placeholder="Wallpaper title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <select
                style={styles.input}
                value={form.member}
                onChange={(e) => setForm({ ...form, member: e.target.value })}
              >
                <option value="">Select Member</option>
                {members.slice(1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                style={styles.fileInput}
                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                required
              />

              <button style={styles.button} type="submit">
                Upload Wallpaper 💜
              </button>
            </form>
          </section>
        )}

        {filtered.length === 0 ? (
          <section className="wallpapers-empty-card" style={styles.emptyCard}>
            <h3>No wallpapers yet 💜</h3>
            <p>Upload a beautiful BTS wallpaper to start the gallery.</p>
          </section>
        ) : (
          <section className="wallpapers-grid" style={styles.grid}>
            {filtered.map((w) => (
              <article
                key={w.id}
                className="wallpapers-card"
                style={styles.card}
                onClick={() => setSelectedWallpaper(w)}
              >
                <div className="wallpapers-image-wrap" style={styles.imageWrap}>
                  <img
                    src={getFileUrl(w.file_path)}
                    alt={w.title}
                    className="wallpapers-image"
                    style={styles.image}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.style.background = "#f3e8ff";
                    }}
                  />

                  {w.member && <span style={styles.memberBadge}>{w.member}</span>}
                </div>

                <div className="wallpapers-card-info" style={styles.cardInfo}>
                  <h3 style={styles.wallTitle}>{w.title}</h3>

                  <p style={styles.meta}>
                    👤 {w.uploaded_by_username || "Unknown"} · 📅{" "}
                    {formatDate(w.created_at)}
                  </p>

                  <div className="wallpapers-action-row" style={styles.actionRow}>
                    <button
                      onClick={(e) =>
                        w.liked_by_current_user
                          ? handleUnlike(w, e)
                          : handleLike(w, e)
                      }
                      style={{
                        ...styles.likeBtn,
                        ...(w.liked_by_current_user ? styles.likedBtn : {}),
                      }}
                    >
                      {w.liked_by_current_user ? "❤️" : "🤍"} {w.likes_count || 0}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(w);
                      }}
                      style={styles.downloadBtn}
                    >
                      ⬇️
                    </button>
                    {canEditWallpaper(w) && (
                      <button
                        onClick={(e) => startEditWallpaper(w, e)}
                        style={styles.editBtn}
                      >
                        ✏️
                      </button>
                    )}

                    {canDeleteWallpaper(w) && (
                      <button
                        onClick={(e) => handleDelete(w, e)}
                        style={styles.deleteBtn}
                      >
                        🗑️
                      </button>
                    )}

                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {editingWallpaper && (
          <div className="wallpapers-modal-overlay" style={styles.modalOverlay} onClick={cancelEditWallpaper}>
            <div className="wallpapers-modal-content" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={cancelEditWallpaper}>
                ×
              </button>

              <div className="wallpapers-modal-info" style={styles.modalInfo}>
                <h3 style={styles.modalTitle}>Edit Wallpaper</h3>

                <form onSubmit={handleUpdateWallpaper} style={styles.form}>
                  <input
                    style={styles.input}
                    placeholder="Wallpaper title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />

                  <select
                    style={styles.input}
                    value={editForm.member}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        member: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Member</option>
                    {members.slice(1).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <button style={styles.button} type="submit">
                    Save Changes 💜
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {selectedWallpaper && (
          <div
            className="wallpapers-modal-overlay"
            style={styles.modalOverlay}
            onClick={() => setSelectedWallpaper(null)}
          >
            <div className="wallpapers-modal-content" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedWallpaper(null)}
              >
                ×
              </button>

              <img
                src={getFileUrl(selectedWallpaper.file_path)}
                alt={selectedWallpaper.title}
                className="wallpapers-modal-image"
                style={styles.modalImage}
              />

              <div className="wallpapers-modal-info" style={styles.modalInfo}>
                <h3 style={styles.modalTitle}>{selectedWallpaper.title}</h3>

                {selectedWallpaper.member && (
                  <p style={styles.modalMember}>💜 {selectedWallpaper.member}</p>
                )}

                <p style={styles.meta}>
                  👤 {selectedWallpaper.uploaded_by_username || "Unknown"} · 📅{" "}
                  {formatDate(selectedWallpaper.created_at)}
                </p>

                <div className="wallpapers-modal-actions" style={styles.modalActions}>
                  <button
                    style={{
                      ...styles.likeBtn,
                      ...(selectedWallpaper.liked_by_current_user
                        ? styles.likedBtn
                        : {}),
                    }}
                    onClick={(e) =>
                      selectedWallpaper.liked_by_current_user
                        ? handleUnlike(selectedWallpaper, e)
                        : handleLike(selectedWallpaper, e)
                    }
                  >
                    {selectedWallpaper.liked_by_current_user ? "❤️ Liked" : "🤍 Like"}{" "}
                    {selectedWallpaper.likes_count || 0}
                  </button>

                  <button
                    style={styles.modalDownloadBtn}
                    onClick={() => handleDownload(selectedWallpaper)}
                  >
                    ⬇️ Download
                  </button>
                  {canEditWallpaper(selectedWallpaper) && (
                    <button
                      style={styles.editBtn}
                      onClick={(e) => startEditWallpaper(selectedWallpaper, e)}
                    >
                      ✏️ Edit
                    </button>
                  )}

                  {canDeleteWallpaper(selectedWallpaper) && (
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => handleDelete(selectedWallpaper, e)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <WallpaperResponsiveStyles />
      </main>

      <Footer />
    </>
  );
}


function WallpaperResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .wallpapers-page {
          padding: 24px 14px !important;
          overflow-x: hidden !important;
        }

        .wallpapers-hero {
          grid-template-columns: 1fr !important;
          padding: 32px 22px !important;
          border-radius: 28px !important;
          text-align: center !important;
          gap: 18px !important;
        }

        .wallpapers-hero-card {
          min-height: 170px !important;
          border-radius: 24px !important;
        }

        .wallpapers-toolbar {
          padding: 16px !important;
          border-radius: 24px !important;
          flex-direction: column !important;
          align-items: stretch !important;
        }

        .wallpapers-filters {
          width: 100% !important;
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 10px !important;
        }

        .wallpapers-filters button {
          width: 100% !important;
          padding: 11px 10px !important;
          font-size: 0.88rem !important;
        }

        .wallpapers-upload-main-btn {
          width: 100% !important;
          padding: 14px 18px !important;
        }

        .wallpapers-upload-card {
          padding: 22px !important;
          border-radius: 24px !important;
        }

        .wallpapers-form {
          grid-template-columns: 1fr !important;
        }

        .wallpapers-grid {
          grid-template-columns: 1fr !important;
          gap: 18px !important;
        }

        .wallpapers-card {
          border-radius: 24px !important;
        }

        .wallpapers-image-wrap {
          height: 360px !important;
        }

        .wallpapers-card-info {
          padding: 16px !important;
        }

        .wallpapers-action-row {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 8px !important;
        }

        .wallpapers-action-row button {
          width: 100% !important;
          padding: 10px 8px !important;
          text-align: center !important;
        }

        .wallpapers-empty-card {
          padding: 44px 18px !important;
          border-radius: 24px !important;
        }

        .wallpapers-modal-overlay {
          padding: 12px !important;
          align-items: start !important;
          overflow-y: auto !important;
        }

        .wallpapers-modal-content {
          width: 100% !important;
          max-height: none !important;
          margin-top: 18px !important;
          border-radius: 26px !important;
          padding: 12px !important;
        }

        .wallpapers-modal-image {
          max-height: 62vh !important;
          border-radius: 20px !important;
        }

        .wallpapers-modal-info {
          padding: 16px 6px 8px !important;
          text-align: center !important;
        }

        .wallpapers-modal-actions {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 10px !important;
        }

        .wallpapers-modal-actions button {
          width: 100% !important;
          justify-content: center !important;
        }
      }

      @media (max-width: 420px) {
        .wallpapers-hero {
          padding: 28px 18px !important;
        }

        .wallpapers-image-wrap {
          height: 310px !important;
        }

        .wallpapers-filters {
          grid-template-columns: 1fr !important;
        }

        .wallpapers-action-row {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
    `}</style>
  );
}


const styles = {
  page: {
    width: "100%",
    padding: "40px clamp(16px,4vw,64px)",
  },

  hero: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    padding: "50px",
    borderRadius: "36px",
    background:
      "linear-gradient(135deg,rgba(255,255,255,0.92),rgba(243,232,255,0.9))",
    border: "1px solid rgba(124,58,237,0.16)",
    boxShadow: "0 25px 70px rgba(76,29,149,0.14)",
    display: "grid",
    gridTemplateColumns: "1fr 250px",
    gap: "24px",
    alignItems: "center",
  },

  badge: {
    display: "inline-flex",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "rgba(124,58,237,0.1)",
    color: "#6d28d9",
    fontWeight: 900,
    marginBottom: "18px",
  },

  title: {
    fontSize: "clamp(2.3rem,5vw,4.6rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    color: "#241039",
    marginBottom: "18px",
  },

  subtitle: {
    color: "#6b5a80",
    lineHeight: 1.8,
    maxWidth: "680px",
  },

  heroCard: {
    minHeight: "220px",
    borderRadius: "30px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    boxShadow: "0 20px 45px rgba(124,58,237,0.25)",
  },

  heroIcon: {
    fontSize: "3rem",
  },

  toolbar: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    padding: "18px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(124,58,237,0.14)",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },

  filters: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  filterBtn: {
    border: "1px solid rgba(124,58,237,0.22)",
    background: "white",
    color: "#6d28d9",
    padding: "10px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  activeFilter: {
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    boxShadow: "0 12px 24px rgba(124,58,237,0.2)",
  },

  uploadBtn: {
    border: "none",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  uploadCard: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    padding: "26px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  cardTitle: {
    color: "#4c1d95",
    marginBottom: "16px",
  },

  form: {
    display: "grid",
    gap: "14px",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
    background: "white",
  },

  fileInput: {
    color: "#4c1d95",
    fontWeight: 800,
  },

  button: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "14px",
    cursor: "pointer",
    fontWeight: 900,
  },

  emptyCard: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    padding: "60px 20px",
    textAlign: "center",
    borderRadius: "30px",
    background: "white",
    color: "#7c6a92",
    border: "1px solid rgba(124,58,237,0.14)",
  },

  grid: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
    gap: "22px",
  },

  card: {
    overflow: "hidden",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 42px rgba(76,29,149,0.1)",
    cursor: "pointer",
  },

  imageWrap: {
    position: "relative",
    height: "320px",
    background: "linear-gradient(90deg, #f3e8ff 25%, #e9d5ff 50%, #f3e8ff 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  memberBadge: {
    position: "absolute",
    left: "14px",
    top: "14px",
    padding: "8px 13px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.86)",
    color: "#6d28d9",
    fontWeight: 900,
    backdropFilter: "blur(12px)",
  },

  cardInfo: {
    padding: "18px",
  },

  wallTitle: {
    color: "#241039",
    marginBottom: "8px",
  },

  meta: {
    color: "#7c6a92",
    fontSize: "0.86rem",
    lineHeight: 1.5,
  },

  actionRow: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap",
    marginTop: "15px",
  },

  likeBtn: {
    border: "1px solid rgba(124,58,237,0.22)",
    background: "#f3e8ff",
    color: "#6d28d9",
    padding: "9px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  likedBtn: {
    background: "#fdf2f8",
    color: "#db2777",
    border: "1px solid rgba(236,72,153,0.28)",
  },

  downloadBtn: {
    border: "none",
    background: "#7ca8ff",
    color: "white",
    padding: "9px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },
  editBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "10px 13px",
    cursor: "pointer",
    fontWeight: 900,
  },
  deleteBtn: {
    border: "1px solid #fecaca",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "9px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(18,10,35,0.78)",
    backdropFilter: "blur(10px)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
    padding: "22px",
  },

  modalContent: {
    position: "relative",
    width: "min(980px,100%)",
    maxHeight: "92vh",
    overflow: "auto",
    borderRadius: "34px",
    background: "white",
    boxShadow: "0 35px 90px rgba(0,0,0,0.35)",
    padding: "18px",
  },

  closeBtn: {
    position: "absolute",
    top: "22px",
    right: "22px",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(36,16,57,0.88)",
    color: "white",
    fontSize: "1.4rem",
    cursor: "pointer",
    zIndex: 2,
  },

  modalImage: {
    width: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    borderRadius: "24px",
    background: "#f3e8ff",
  },

  modalInfo: {
    padding: "18px 8px 8px",
  },

  modalTitle: {
    color: "#241039",
    fontSize: "1.7rem",
    marginBottom: "8px",
  },

  modalMember: {
    color: "#7c3aed",
    fontWeight: 900,
    marginBottom: "8px",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "16px",
  },

  modalDownloadBtn: {
    border: "none",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },
};