import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Singalong() {
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", lyrics: "", youtube_url: "" });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me").catch(() => navigate("/login"));
    API.get("/songs").then(res => setSongs(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/songs", form);
      setSongs([res.data, ...songs]);
      setForm({ title: "", artist: "", lyrics: "", youtube_url: "" });
      setShowForm(false);
      alert("Song added! 💜");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add song");
    }
  };

  const getYoutubeId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.headerControls}>
          <div>
            <h2 style={styles.title}>🎵 BTS Sing-Along</h2>
            <p style={styles.subtitle}>Sing your heart out ARMY! 💜</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? "Cancel" : "🎵 Add Song"}
          </button>
        </div>

        {/* Add Song Form - Admin Only */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>Add New Song</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input style={styles.input} placeholder="Song Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
              <input style={styles.input} placeholder="Artist (e.g. BTS, Jungkook)"
                value={form.artist}
                onChange={e => setForm({ ...form, artist: e.target.value })} required />
              <input style={styles.input} placeholder="YouTube URL"
                value={form.youtube_url}
                onChange={e => setForm({ ...form, youtube_url: e.target.value })} required />
              <textarea style={styles.textarea} placeholder="Paste lyrics here..."
                value={form.lyrics} rows={8}
                onChange={e => setForm({ ...form, lyrics: e.target.value })} required />
              <button style={styles.button} type="submit">Add Song 💜</button>
            </form>
          </div>
        )}

        {/* Search */}
        <input style={styles.search} placeholder="Search songs..."
          value={search} onChange={e => setSearch(e.target.value)} />

        <div style={styles.layout}>
          {/* Song List */}
          <div style={styles.songList}>
            {filtered.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={{ color: "#888" }}>No songs yet! 💜</p>
              </div>
            ) : (
              filtered.map(song => (
                <div key={song.id}
                  onClick={() => setSelected(song)}
                  style={{
                    ...styles.songCard,
                    border: selected?.id === song.id ? "2px solid #7c3aed" : "1px solid #d4b8ff",
                    background: selected?.id === song.id ? "#f0e6ff" : "white"
                  }}>
                  <h3 style={styles.songTitle}>{song.title}</h3>
                  <p style={styles.songArtist}>🎤 {song.artist}</p>
                </div>
              ))
            )}
          </div>

          {/* Song Detail */}
          {selected && (
            <div style={styles.songDetail}>
              <h2 style={styles.detailTitle}>{selected.title}</h2>
              <p style={styles.detailArtist}>🎤 {selected.artist}</p>

              {/* YouTube Player */}
              {selected.youtube_url && getYoutubeId(selected.youtube_url) && (
                <div style={styles.videoWrapper}>
                  <iframe
                    width="100%"
                    height="250"
                    src={`https://www.youtube.com/embed/${getYoutubeId(selected.youtube_url)}`}
                    title={selected.title}
                    frameBorder="0"
                    allowFullScreen
                    style={styles.video}
                  />
                </div>
              )}

              {/* Lyrics */}
              <div style={styles.lyricsBox}>
                <h3 style={styles.lyricsTitle}>📝 Lyrics</h3>
                <pre style={styles.lyrics}>{selected.lyrics}</pre>
              </div>
            </div>
          )}

          {!selected && filtered.length > 0 && (
            <div style={styles.selectPrompt}>
              <p style={{ color: "#888", fontSize: "1.2rem" }}>
                👈 Select a song to sing along! 💜
              </p>
            </div>
          )}
        </div>
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
  title: { color: "#2d0a4e", fontSize: "2rem", marginBottom: "0.5rem", margin: 0 },
  subtitle: { color: "#7c3aed", marginBottom: 0 },
  addBtn: {
    padding: "8px 16px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "6px", cursor: "pointer"
  },
  formCard: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    marginBottom: "1.5rem", border: "1px solid #d4b8ff"
  },
  cardTitle: { color: "#2d0a4e", marginBottom: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: {
    padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff",
    background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem"
  },
  textarea: {
    padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff",
    background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem", resize: "vertical",
    fontFamily: "monospace"
  },
  button: {
    padding: "12px", borderRadius: "8px", background: "#7c3aed",
    color: "white", fontSize: "1rem", cursor: "pointer", border: "none"
  },
  search: {
    width: "100%", padding: "12px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "white", color: "#2d0a4e",
    fontSize: "1rem", marginBottom: "1.5rem"
  },
  layout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" },
  songList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  songCard: { padding: "1rem 1.25rem", borderRadius: "10px", cursor: "pointer" },
  songTitle: { color: "#2d0a4e", marginBottom: "0.25rem", fontSize: "1rem" },
  songArtist: { color: "#7c3aed", fontSize: "0.85rem" },
  emptyCard: {
    background: "white", borderRadius: "12px", padding: "2rem",
    textAlign: "center", border: "1px solid #d4b8ff"
  },
  songDetail: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    border: "1px solid #d4b8ff"
  },
  detailTitle: { color: "#2d0a4e", fontSize: "1.8rem", marginBottom: "0.5rem" },
  detailArtist: { color: "#7c3aed", marginBottom: "1.5rem" },
  videoWrapper: { marginBottom: "1.5rem", borderRadius: "10px", overflow: "hidden" },
  video: { borderRadius: "10px" },
  lyricsBox: {
    background: "#f8f5ff", borderRadius: "10px", padding: "1.5rem",
    border: "1px solid #e0d0ff"
  },
  lyricsTitle: { color: "#2d0a4e", marginBottom: "1rem" },
  lyrics: {
    color: "#2d0a4e", lineHeight: 2, fontFamily: "inherit",
    whiteSpace: "pre-wrap", fontSize: "1rem"
  },
  selectPrompt: {
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "white", borderRadius: "12px", border: "1px solid #d4b8ff"
  }
};