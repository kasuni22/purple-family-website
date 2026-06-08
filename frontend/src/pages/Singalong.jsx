import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Singalong() {
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", artist: "", lyrics: "", youtube_url: "", release_year: "", album: "", song_type: "BTS" });
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [albumFilter, setAlbumFilter] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me")
      .then(res => setCurrentUser(res.data))
      .catch(() => navigate("/login"));
    API.get("/songs").then(res => setSongs(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      release_year: form.release_year ? Number(form.release_year) : null,
    };

    try {
      const res = editingSong
        ? await API.put(`/songs/${editingSong.id}`, payload)
        : await API.post("/songs", payload);

      const updatedSong = res.data;
      setSongs(prevSongs => {
        if (editingSong) {
          return prevSongs.map(song => song.id === updatedSong.id ? updatedSong : song);
        }
        return [updatedSong, ...prevSongs];
      });

      setSelected(updatedSong);
      setForm({ title: "", artist: "", lyrics: "", youtube_url: "", release_year: "", album: "", song_type: "BTS" });
      setShowForm(false);
      setEditingSong(null);
      alert(editingSong ? "Song updated! 💜" : "Song added! 💜");
    } catch (err) {
      console.error(err.response?.data || err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === "string" ? detail : JSON.stringify(detail || "Failed to add song"));
    }
  };

  const getYoutubeId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const filtered = songs.filter(song => {
    const searchMatch =
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase());

    const yearMatch =
      yearFilter === "All" ||
      String(song.release_year) === yearFilter;

    const typeMatch =
      typeFilter === "All" ||
      song.song_type === typeFilter;

    const albumMatch =
      albumFilter === "All" ||
      song.album === albumFilter;

    return searchMatch && yearMatch && typeMatch && albumMatch;
  });

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.headerControls}>
          <div>
            <h2 style={styles.title}>🎵 BTS Sing-Along</h2>
            <p style={styles.subtitle}>Sing your heart out ARMY! 💜</p>
          </div>
          <button onClick={() => {
            if (showForm) {
              setEditingSong(null);
              setForm({ title: "", artist: "", lyrics: "", youtube_url: "", release_year: "", album: "", song_type: "BTS" });
            }
            setShowForm(!showForm);
          }} style={styles.addBtn}>
            {showForm ? "Cancel" : "🎵 Add Song"}
          </button>
        </div>

        {/* Add Song Form - All ARMY */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>{editingSong ? "Edit Song" : "Add New Song"}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input style={styles.input} placeholder="Song Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
              <input style={styles.input} placeholder="Artist (e.g. BTS, Jungkook)"
                value={form.artist}
                onChange={e => setForm({ ...form, artist: e.target.value })} required />
              <select style={styles.select} value={form.song_type} onChange={e => setForm({ ...form, song_type: e.target.value })}>
                <option value="BTS">BTS</option>
                <option value="Solo">Solo</option>
              </select>
              <select style={styles.select} value={form.album} onChange={e => setForm({ ...form, album: e.target.value })}>
                <option value="">Select Album</option>
                <option value="Dark & Wild">Dark & Wild</option>
                <option value="Wings">Wings</option>
                <option value="Love Yourself">Love Yourself</option>
                <option value="Map of the Soul">Map of the Soul</option>
                <option value="BE">BE</option>
                <option value="Proof">Proof</option>
                <option value="Golden">Golden</option>
                <option value="Layover">Layover</option>
                <option value="D-Day">D-Day</option>
                <option value="Jack In The Box">Jack In The Box</option>
                <option value="Indigo">Indigo</option>
                <option value="Face">Face</option>
                <option value="Muse">Muse</option>
                <option value="Happy">Happy</option>
              </select>
              <select
                style={styles.select}
                value={form.release_year}
                onChange={(e) => setForm({ ...form, release_year: e.target.value })}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 14 }, (_, i) => 2013 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <input style={styles.input} placeholder="YouTube URL"
                value={form.youtube_url}
                onChange={e => setForm({ ...form, youtube_url: e.target.value })} required />
              <textarea style={styles.textarea} placeholder="Paste lyrics here..."
                value={form.lyrics} rows={8}
                onChange={e => setForm({ ...form, lyrics: e.target.value })} required />
              <button style={styles.button} type="submit">{editingSong ? "Update Song 💜" : "Add Song 💜"}</button>
            </form>
          </div>
        )}

        <div style={styles.filterToolbar}>
          <div style={styles.filterTopRow}>
            <input style={styles.search} placeholder="Search songs..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select style={styles.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              <option value="BTS">BTS</option>
              <option value="Solo">Solo</option>
            </select>
            <select style={styles.select} value={albumFilter} onChange={e => setAlbumFilter(e.target.value)}>
              <option value="All">All Albums</option>
              <option value="Dark & Wild">Dark & Wild</option>
              <option value="Wings">Wings</option>
              <option value="Love Yourself">Love Yourself</option>
              <option value="Map of the Soul">Map of the Soul</option>
              <option value="BE">BE</option>
              <option value="Proof">Proof</option>
              <option value="Golden">Golden</option>
              <option value="Layover">Layover</option>
              <option value="D-Day">D-Day</option>
              <option value="Jack In The Box">Jack In The Box</option>
              <option value="Indigo">Indigo</option>
              <option value="Face">Face</option>
              <option value="Muse">Muse</option>
              <option value="Happy">Happy</option>
            </select>
          </div>
          <div style={styles.pillRow}>
            {['All', ...Array.from({ length: 14 }, (_, i) => String(2013 + i))].map(year => (
              <button
                key={year}
                type="button"
                onClick={() => setYearFilter(year)}
                style={{
                  ...styles.pillButton,
                  ...(yearFilter === year ? styles.pillActive : {})
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

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
                  <p style={styles.songMeta}>📅 {song.release_year || "Unknown"} · 🎤 {song.song_type || "BTS"} · 💿 {song.album || "Unknown Album"}</p>
                  <p style={styles.songMeta}>👤 Added by: {song.added_by_username || "Unknown"}</p>
                  <p style={styles.songMeta}>❤️ {song.favorites_count || 0} favorites</p>
                  <div style={styles.cardActions}>
                    <button
                      type="button"
                      style={styles.favoriteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (song.favorited_by_current_user) {
                          API.delete(`/songs/${song.id}/favorite`).then(res => {
                            setSongs(prev => prev.map(s => s.id === song.id ? res.data : s));
                            if (selected?.id === song.id) setSelected(res.data);
                          }).catch(err => {
                            console.error(err.response?.data || err);
                          });
                        } else {
                          API.post(`/songs/${song.id}/favorite`).then(res => {
                            setSongs(prev => prev.map(s => s.id === song.id ? res.data : s));
                            if (selected?.id === song.id) setSelected(res.data);
                          }).catch(err => {
                            console.error(err.response?.data || err);
                          });
                        }
                      }}
                    >
                      {song.favorited_by_current_user ? "❤️ Favorited" : "🤍 Favorite"}
                    </button>
                    {(currentUser?.is_admin || currentUser?.id === song.added_by_id) && (
                      <>
                        <button
                          type="button"
                          style={styles.editBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSong(song);
                            setShowForm(true);
                            setForm({
                              title: song.title || "",
                              artist: song.artist || "",
                              lyrics: song.lyrics || "",
                              youtube_url: song.youtube_url || "",
                              release_year: song.release_year ? String(song.release_year) : "",
                              album: song.album || "",
                              song_type: song.song_type || "BTS"
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!window.confirm("Delete this song?")) return;
                            API.delete(`/songs/${song.id}`).then(() => {
                              setSongs(prev => prev.filter(s => s.id !== song.id));
                              if (selected?.id === song.id) setSelected(null);
                            }).catch(err => {
                              console.error(err.response?.data || err);
                            });
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Song Detail */}
          {selected && (
            <div style={styles.songDetail}>
              <h2 style={styles.detailTitle}>{selected.title}</h2>
              <p style={styles.detailArtist}>🎤 {selected.artist}</p>
              <p style={styles.detailMeta}>📅 Release Year: {selected.release_year || "Unknown"}</p>
              <p style={styles.detailMeta}>🎤 Type: {selected.song_type || "BTS"}</p>
              <p style={styles.detailMeta}>💿 Album: {selected.album || "Unknown"}</p>
              <p style={styles.detailMeta}>👤 Added by: {selected.added_by_username || "Unknown"}</p>
              <p style={styles.detailMeta}>🕒 Added on: {new Date(selected.created_at).toLocaleDateString()}</p>
              <p style={styles.detailMeta}>❤️ Favorites: {selected.favorites_count || 0}</p>

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
    flex: 1,
    padding: "12px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "white", color: "#2d0a4e",
    fontSize: "1rem"
  },
  filterToolbar: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "1.5rem"
  },
  filterTopRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap"
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem"
  },
  pillButton: {
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid #d4b8ff",
    background: "white",
    color: "#2d0a4e",
    cursor: "pointer"
  },
  pillActive: {
    background: "#7c3aed",
    color: "white",
    borderColor: "#7c3aed"
  },
  select: {
    minWidth: "180px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "white",
    color: "#2d0a4e",
    fontSize: "1rem"
  },
  layout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" },
  songList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  songCard: { padding: "1rem 1.25rem", borderRadius: "10px", cursor: "pointer" },
  songTitle: { color: "#2d0a4e", marginBottom: "0.25rem", fontSize: "1rem" },
  songArtist: { color: "#7c3aed", fontSize: "0.85rem" },
  songMeta: { color: "#4b2777", fontSize: "0.8rem", marginTop: "0.4rem" },
  cardActions: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" },
  favoriteBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "white",
    color: "#2d0a4e",
    cursor: "pointer"
  },
  editBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #7c3aed",
    background: "#7c3aed",
    color: "white",
    cursor: "pointer"
  },
  deleteBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #f97316",
    background: "#f97316",
    color: "white",
    cursor: "pointer"
  },
  detailMeta: { color: "#4b2777", fontSize: "0.95rem", marginBottom: "0.6rem" },
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