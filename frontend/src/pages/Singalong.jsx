import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://127.0.0.1:8000";
const years = ["All", ...Array.from({ length: 14 }, (_, i) => String(2026 - i))];
const soloArtists = ["RM", "Jin", "SUGA", "j-hope", "Jimin", "V", "Jung Kook"];

export default function Singalong() {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [albumFilter, setAlbumFilter] = useState("All");

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [songForm, setSongForm] = useState({
    title: "",
    artist: "BTS",
    lyrics: "",
    youtube_url: "",
    release_year: "",
    album: "",
    album_id: "",
    song_type: "BTS",
    solo_artist: "",
    image_url: "",
  });

  const [editingAlbum, setEditingAlbum] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);

      const [meRes, albumsRes, songsRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/albums"),
        API.get("/songs"),
      ]);

      setCurrentUser(meRes.data);
      setAlbums(albumsRes.data || []);
      setSongs(songsRes.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API_BASE}/${path}`;
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const getYoutubePlaylistId = (url) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get("list");
    } catch {
      const match = url.match(/[?&]list=([^&]+)/);
      return match ? match[1] : null;
    }
  };

  const albumOptions = useMemo(() => {
    const bts = albums.filter((a) => a.album_type === "BTS");
    const solo = albums.filter((a) => a.album_type === "Solo");
    return { bts, solo };
  }, [albums]);

  const albumCardsToShow = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = [...albums];

    if (typeFilter !== "All") {
      list = list.filter((album) => album.album_type === typeFilter);
    }

    if (albumFilter !== "All") {
      if (soloArtists.includes(albumFilter)) {
        list = list.filter((album) => album.album_type === "Solo" && album.artist === albumFilter);
      } else {
        list = list.filter((album) => album.name === albumFilter);
      }
    }

    if (yearFilter !== "All") {
      list = list.filter((album) => String(album.year) === yearFilter);
    }

    if (term) {
      list = list.filter((album) =>
        album.name.toLowerCase().includes(term) ||
        album.artist.toLowerCase().includes(term)
      );
    }

    return list.sort((a, b) => {
      const yearDiff = (b.year || 0) - (a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      if (a.album_type !== b.album_type) return a.album_type === "BTS" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [albums, search, yearFilter, typeFilter, albumFilter]);

  const albumSongs = useMemo(() => {
    if (!selectedAlbum || selectedAlbum.album_type !== "BTS") return [];
    return songs.filter((song) =>
      song.album_id === selectedAlbum.id ||
      song.album === selectedAlbum.name
    );
  }, [songs, selectedAlbum]);

  const resetSongForm = () => {
    setEditingSong(null);
    setSongForm({
      title: "",
      artist: "BTS",
      lyrics: "",
      youtube_url: "",
      release_year: "",
      album: "",
      album_id: "",
      song_type: "BTS",
      solo_artist: "",
      image_url: "",
    });
  };

  const openAddSong = () => {
    resetSongForm();
    if (selectedAlbum) {
      setSongForm((prev) => ({
        ...prev,
        artist: selectedAlbum.artist,
        release_year: selectedAlbum.year ? String(selectedAlbum.year) : "",
        album: selectedAlbum.name,
        album_id: selectedAlbum.id,
        song_type: selectedAlbum.album_type,
        solo_artist: selectedAlbum.album_type === "Solo" ? selectedAlbum.artist : "",
      }));
    }
    setShowSongForm(true);
  };

  const handleSongSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...songForm,
      release_year: songForm.release_year ? Number(songForm.release_year) : null,
      album_id: songForm.album_id ? Number(songForm.album_id) : null,
    };

    try {
      const res = editingSong
        ? await API.put(`/songs/${editingSong.id}`, payload)
        : await API.post("/songs", payload);

      const saved = res.data;
      setSongs((prev) => editingSong
        ? prev.map((song) => song.id === saved.id ? saved : song)
        : [saved, ...prev]
      );
      setSelectedSong(saved);
      setShowSongForm(false);
      resetSongForm();
      alert(editingSong ? "Song updated! 💜" : "Song added! 💜");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.detail || "Failed to save song");
    }
  };

  const startEditSong = (song) => {
    setEditingSong(song);
    setSongForm({
      title: song.title || "",
      artist: song.artist || "",
      lyrics: song.lyrics || "",
      youtube_url: song.youtube_url || "",
      release_year: song.release_year ? String(song.release_year) : "",
      album: song.album || "",
      album_id: song.album_id || "",
      song_type: song.song_type || "BTS",
      solo_artist: song.solo_artist || "",
      image_url: song.image_url || "",
    });
    setShowSongForm(true);
  };

  const handleFavoriteToggle = async (song) => {
    try {
      const res = song.favorited_by_current_user
        ? await API.delete(`/songs/${song.id}/favorite`)
        : await API.post(`/songs/${song.id}/favorite`);

      setSongs((prev) => prev.map((item) => item.id === song.id ? res.data : item));
      if (selectedSong?.id === song.id) setSelectedSong(res.data);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleDeleteSong = async (song) => {
    if (!window.confirm("Delete this song?")) return;
    try {
      await API.delete(`/songs/${song.id}`);
      setSongs((prev) => prev.filter((item) => item.id !== song.id));
      if (selectedSong?.id === song.id) setSelectedSong(null);
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.detail || "Only admins can delete songs");
    }
  };

  const startEditAlbum = (album) => {
    setEditingAlbum({ ...album, preview: "", file: null });
  };

  const handleSaveAlbum = async () => {
    if (!editingAlbum) return;

    const data = new FormData();
    data.append("name", editingAlbum.name || "");
    data.append("artist", editingAlbum.artist || "");
    data.append("year", editingAlbum.year || "");
    data.append("album_type", editingAlbum.album_type || "BTS");
    data.append("playlist_url", editingAlbum.playlist_url || "");
    data.append("image_url", editingAlbum.image_url || "");
    if (editingAlbum.file) data.append("file", editingAlbum.file);

    try {
      const res = await API.put(`/albums/${editingAlbum.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const saved = res.data;
      setAlbums((prev) => prev.map((album) => album.id === saved.id ? saved : album));
      if (selectedAlbum?.id === saved.id) setSelectedAlbum(saved);
      setEditingAlbum(null);
      alert("Album updated! 💜");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.detail || "Failed to save album");
    }
  };

  const handleDeleteAlbum = async (album) => {
    if (!window.confirm("Delete this album?")) return;
    try {
      await API.delete(`/albums/${album.id}`);
      setAlbums((prev) => prev.filter((item) => item.id !== album.id));
      if (selectedAlbum?.id === album.id) {
        setSelectedAlbum(null);
        setSelectedSong(null);
      }
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.detail || "Only admins can delete albums");
    }
  };

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setSelectedSong(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const galleryTitle = (() => {
    if (selectedAlbum?.album_type === "BTS") return `💿 ${selectedAlbum.name} Songs`;
    if (selectedAlbum?.album_type === "Solo") return `💿 ${selectedAlbum.name}`;
    if (yearFilter !== "All" && typeFilter === "All" && albumFilter === "All") return `🎵 ${yearFilter} Albums & Songs`;
    if (typeFilter === "Solo" && soloArtists.includes(albumFilter)) return `🎵 ${albumFilter} Solo Discography`;
    if (typeFilter === "BTS") return yearFilter === "All" ? "🎵 BTS Albums" : `🎵 BTS Albums - ${yearFilter}`;
    if (typeFilter === "Solo") return yearFilter === "All" ? "🎵 Solo Albums" : `🎵 Solo Albums - ${yearFilter}`;
    return "🎵 All Albums";
  })();

  return (
    <div style={styles.container} className="singalongContainer">
      <Navbar />
      <style>{`
        @keyframes softPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.86;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-9px);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .singalongContent {
            padding: 1rem !important;
          }
          .songDetailContainer {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          .detailAlbumGrid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          .detailCoverBox {
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
          }
          .songInfo {
            width: 100% !important;
            min-width: 0 !important;
          }
          .videoContainer {
            width: 100% !important;
            min-width: 0 !important;
          }
          .videoContainer iframe,
          .videoIframe {
            width: 100% !important;
            aspect-ratio: 16 / 9 !important;
            height: auto !important;
            display: block !important;
          }
          .songDetail {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          body, html, #root {
            overflow-x: hidden !important;
          }
          .filterTopRow {
            flex-direction: column !important;
          }
          .search, .select {
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>
      <div style={styles.content} className="singalongContent">
        <div style={styles.headerControls}>
          <div>
            <h2 style={styles.title}>🎵 BTS Sing-Along</h2>
            <p style={styles.subtitle}>Sing your heart out ARMY! 💜</p>
          </div>
          <button onClick={openAddSong} style={styles.addBtn}>🎵 Add Song</button>
        </div>

        {showSongForm && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.cardTitle}>{editingSong ? "Edit Song" : "Add New Song"}</h3>
              <button style={styles.cancelSmallBtn} onClick={() => { setShowSongForm(false); resetSongForm(); }}>Cancel</button>
            </div>
            <form onSubmit={handleSongSubmit} style={styles.form}>
              <input style={styles.input} placeholder="Song Title" value={songForm.title} onChange={(e) => setSongForm({ ...songForm, title: e.target.value })} required />
              <input style={styles.input} placeholder="Artist" value={songForm.artist} onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })} required />
              <select style={styles.select} value={songForm.song_type} onChange={(e) => setSongForm({ ...songForm, song_type: e.target.value, album: "", album_id: "", solo_artist: "" })}>
                <option value="BTS">BTS</option>
                <option value="Solo">Solo</option>
              </select>
              {songForm.song_type === "Solo" && (
                <select style={styles.select} value={songForm.solo_artist} onChange={(e) => setSongForm({ ...songForm, solo_artist: e.target.value, artist: e.target.value })}>
                  <option value="">Select Solo Artist</option>
                  {soloArtists.map((artist) => <option key={artist} value={artist}>{artist}</option>)}
                </select>
              )}
              <select
                style={styles.select}
                value={songForm.album_id || ""}
                onChange={(e) => {
                  const album = albums.find((a) => String(a.id) === e.target.value);
                  setSongForm({
                    ...songForm,
                    album_id: album?.id || "",
                    album: album?.name || "",
                    release_year: album?.year ? String(album.year) : songForm.release_year,
                    song_type: album?.album_type || songForm.song_type,
                    artist: album?.album_type === "BTS" ? "BTS" : (album?.artist || songForm.artist),
                    solo_artist: album?.album_type === "Solo" ? album.artist : "",
                  });
                }}
              >
                <option value="">Select Album</option>
                {albums
                  .filter((album) => album.album_type === songForm.song_type)
                  .map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
              </select>
              <select style={styles.select} value={songForm.release_year} onChange={(e) => setSongForm({ ...songForm, release_year: e.target.value })}>
                <option value="">Select Year</option>
                {years.filter((year) => year !== "All").map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
              <input style={styles.input} placeholder="Song Image URL (optional)" value={songForm.image_url} onChange={(e) => setSongForm({ ...songForm, image_url: e.target.value })} />
              <input style={styles.input} placeholder="YouTube URL" value={songForm.youtube_url} onChange={(e) => setSongForm({ ...songForm, youtube_url: e.target.value })} required />
              <textarea style={styles.textarea} placeholder="Paste lyrics here..." value={songForm.lyrics} rows={8} onChange={(e) => setSongForm({ ...songForm, lyrics: e.target.value })} required />
              <button style={styles.button} type="submit">{editingSong ? "Update Song 💜" : "Add Song 💜"}</button>
            </form>
          </div>
        )}

        {editingAlbum && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <h3 style={styles.cardTitle}>Edit Album</h3>
              <div style={styles.modalForm}>
                <label style={styles.label}>Album Name</label>
                <input style={styles.input} value={editingAlbum.name || ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, name: e.target.value })} />

                <label style={styles.label}>Artist</label>
                <input style={styles.input} value={editingAlbum.artist || ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, artist: e.target.value })} />

                <label style={styles.label}>Year</label>
                <input style={styles.input} type="number" value={editingAlbum.year || ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, year: e.target.value })} />

                <label style={styles.label}>Type</label>
                <select style={styles.select} value={editingAlbum.album_type || "BTS"} onChange={(e) => setEditingAlbum({ ...editingAlbum, album_type: e.target.value })}>
                  <option value="BTS">BTS</option>
                  <option value="Solo">Solo</option>
                </select>

                <label style={styles.label}>Playlist URL (Solo albums)</label>
                <input style={styles.input} value={editingAlbum.playlist_url || ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, playlist_url: e.target.value })} />

                <label style={styles.label}>Image URL</label>
                <input style={styles.input} value={editingAlbum.image_url || ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, image_url: e.target.value, preview: "" })} />

                <label style={styles.label}>Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  style={styles.fileInput}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setEditingAlbum({ ...editingAlbum, file, preview: URL.createObjectURL(file) });
                  }}
                />

                {(editingAlbum.preview || editingAlbum.image_url) && (
                  <div style={styles.imagePreview}>
                    <img src={getFileUrl(editingAlbum.preview || editingAlbum.image_url)} alt={editingAlbum.name} style={styles.previewImage} />
                  </div>
                )}

                <div style={styles.modalActions}>
                  <button style={styles.button} onClick={handleSaveAlbum}>Save Album 💜</button>
                  <button style={{ ...styles.button, background: "#6b7280" }} onClick={() => setEditingAlbum(null)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.filterToolbar}>
          <div style={styles.filterTopRow} className="filterTopRow">
            <input style={styles.search} className="search" placeholder="Search albums or songs..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={styles.select} className="select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setAlbumFilter("All"); setSelectedAlbum(null); setSelectedSong(null); }}>
              <option value="All">All Types</option>
              <option value="BTS">BTS</option>
              <option value="Solo">Solo</option>
            </select>
            <select style={styles.select} className="select" value={albumFilter} onChange={(e) => { setAlbumFilter(e.target.value); setSelectedAlbum(null); setSelectedSong(null); }}>
              <option value="All">All Albums</option>
              {(typeFilter === "All" || typeFilter === "BTS") && (
                <optgroup label="BTS Albums">
                  {albumOptions.bts.map((album) => <option key={album.id} value={album.name}>{album.name}</option>)}
                </optgroup>
              )}
              {(typeFilter === "All" || typeFilter === "Solo") && (
                <optgroup label="Solo Artists">
                  {soloArtists.map((artist) => <option key={artist} value={artist}>{artist}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          <div style={styles.pillRow}>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => { setYearFilter(year); setSelectedAlbum(null); setSelectedSong(null); }}
                style={{ ...styles.pillButton, ...(yearFilter === year ? styles.pillActive : {}) }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {selectedAlbum?.album_type === "Solo" && (
          <div style={styles.detailAlbumPanel} className="detailAlbumPanel">
            <button style={styles.backBtn} onClick={() => setSelectedAlbum(null)}>← Back to albums</button>
            <div style={styles.detailAlbumGrid} className="detailAlbumGrid">
              <div style={styles.detailCoverBox} className="detailCoverBox">
                {selectedAlbum.image_url ? <img src={getFileUrl(selectedAlbum.image_url)} alt={selectedAlbum.name} style={styles.albumImage} /> : <span style={styles.albumEmoji}>🎵</span>}
              </div>
              <div className="songInfo">
                <h2 style={styles.detailTitle}>{selectedAlbum.name}</h2>
                <p style={styles.detailMeta}>👤 {selectedAlbum.artist}</p>
                <p style={styles.detailMeta}>📅 {selectedAlbum.year || "Unknown"}</p>
                <p style={styles.albumType}>Solo</p>
                {selectedAlbum.playlist_url && getYoutubePlaylistId(selectedAlbum.playlist_url) && (
                  <div style={styles.videoWrapper} className="videoContainer videoWrapper">
                    <iframe width="100%" height="315" src={`https://www.youtube.com/embed/videoseries?list=${getYoutubePlaylistId(selectedAlbum.playlist_url)}`} title={selectedAlbum.name} frameBorder="0" allowFullScreen style={styles.video} className="videoIframe" />
                  </div>
                )}
                {selectedAlbum.playlist_url && (
                  <a href={selectedAlbum.playlist_url} target="_blank" rel="noopener noreferrer" style={styles.youtubeBtn}>▶️ Open Full Playlist</a>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedAlbum?.album_type === "BTS" && (
          <div style={styles.albumSection}>
            <button style={styles.backBtn} onClick={() => { setSelectedAlbum(null); setSelectedSong(null); }}>← Back to albums</button>
            <h3 style={styles.sectionTitle}>{galleryTitle}</h3>
            {albumSongs.length === 0 ? (
              <div style={styles.emptyCard}>No songs added to this album yet! 💜</div>
            ) : (
              <div style={styles.albumSongLayout} className="albumSongLayout songDetailContainer">
                <div style={styles.songCardsGrid} className="songCardsGrid">
                  {albumSongs.map((song) => (
                    <SongMiniCard
                      key={song.id}
                      song={song}
                      album={selectedAlbum}
                      selected={selectedSong?.id === song.id}
                      currentUser={currentUser}
                      getFileUrl={getFileUrl}
                      onSelect={() => setSelectedSong(song)}
                      onFavorite={() => handleFavoriteToggle(song)}
                      onEdit={() => startEditSong(song)}
                      onDelete={() => handleDeleteSong(song)}
                    />
                  ))}
                </div>
                <SongDetail song={selectedSong} getYoutubeId={getYoutubeId} />
              </div>
            )}
          </div>
        )}

        {!selectedAlbum && (
          <div style={styles.albumSection}>
            <h3 style={styles.sectionTitle}>{galleryTitle}</h3>

            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingIconWrap}>
                  <span style={styles.loadingIcon}>🎵</span>
                </div>

                <h2 style={styles.loadingTitle}>Loading BTS Albums...</h2>

                <p style={styles.loadingText}>
                  Preparing your Purple Family music library 💜
                </p>

                <div style={styles.loadingDots}>
                  <span style={{ ...styles.loadingDot, animationDelay: "0s" }} />
                  <span style={{ ...styles.loadingDot, animationDelay: "0.18s" }} />
                  <span style={{ ...styles.loadingDot, animationDelay: "0.36s" }} />
                </div>
              </div>
            ) : albumCardsToShow.length === 0 ? (
              <div style={styles.emptyCard}>No albums found! 💜</div>
            ) : (
              <div style={styles.albumCardsGrid}>
                {albumCardsToShow.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    getFileUrl={getFileUrl}
                    onOpen={() => handleAlbumClick(album)}
                    onEdit={() => startEditAlbum(album)}
                    onDelete={() => handleDeleteAlbum(album)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function AlbumCard({ album, getFileUrl, onOpen, onEdit, onDelete }) {
  return (
    <div style={styles.albumCard} onClick={onOpen}>
      <div style={styles.albumArtwork}>
        {album.image_url ? <img src={getFileUrl(album.image_url)} alt={album.name} style={styles.albumImage} /> : <span style={styles.albumEmoji}>🎵</span>}
      </div>
      <h4 style={styles.albumName}>{album.name}</h4>
      <p style={styles.albumMeta}>👤 {album.artist}</p>
      <p style={styles.albumMeta}>📅 {album.year || "Unknown"}</p>
      <p style={styles.albumType}>{album.album_type}</p>
      <div style={styles.albumCardActions} onClick={(e) => e.stopPropagation()}>
        <button style={styles.openBtn} onClick={onOpen}>{album.album_type === "Solo" ? "▶️ Playlist" : "🎵 Songs"}</button>
        {album.can_edit && <button style={styles.editBtn} onClick={onEdit}>Edit</button>}
        {album.can_delete && <button style={styles.deleteBtn} onClick={onDelete}>Delete</button>}
      </div>
    </div>
  );
}

function SongMiniCard({ song, album, selected, currentUser, getFileUrl, onSelect, onFavorite, onEdit, onDelete }) {
  const image = song.image_url || album?.image_url;
  return (
    <div onClick={onSelect} style={{ ...styles.songMiniCard, border: selected ? "2px solid #7c3aed" : "1px solid #d4b8ff" }}>
      <div style={styles.songMiniImageBox}>
        {image ? <img src={getFileUrl(image)} alt={song.title} style={styles.albumImage} /> : <span style={styles.albumEmoji}>🎵</span>}
      </div>
      <h4 style={styles.albumName}>{song.title}</h4>
      <p style={styles.albumMeta}>🎤 {song.artist}</p>
      <p style={styles.albumMeta}>📅 {song.release_year || "Unknown"}</p>
      <p style={styles.albumMeta}>❤️ {song.favorites_count || 0}</p>
      <div style={styles.albumCardActions} onClick={(e) => e.stopPropagation()}>
        <button style={styles.favoriteBtn} onClick={onFavorite}>{song.favorited_by_current_user ? "❤️ Favorited" : "🤍 Favorite"}</button>
        {(currentUser?.is_admin || currentUser?.id === song.added_by_id) && <button style={styles.editBtn} onClick={onEdit}>Edit</button>}
        {currentUser?.is_admin && <button style={styles.deleteBtn} onClick={onDelete}>Delete</button>}
      </div>
    </div>
  );
}

function SongDetail({ song, getYoutubeId }) {
  if (!song) {
    return <div style={styles.selectPrompt}>👈 Select a song to sing along! 💜</div>;
  }

  return (
    <div style={styles.songDetail} className="songDetail">
      <div className="songInfo">
        <h2 style={styles.detailTitle}>{song.title}</h2>
        <p style={styles.detailArtist}>🎤 {song.artist}</p>
        <p style={styles.detailMeta}>📅 Release Year: {song.release_year || "Unknown"}</p>
        <p style={styles.detailMeta}>🎤 Type: {song.song_type || "BTS"}</p>
        <p style={styles.detailMeta}>💿 Album: {song.album || "Unknown"}</p>
        <p style={styles.detailMeta}>👤 Added by: {song.added_by_username || "Unknown"}</p>
        <p style={styles.detailMeta}>❤️ Favorites: {song.favorites_count || 0}</p>
      </div>
      {song.youtube_url && getYoutubeId(song.youtube_url) && (
        <div style={styles.videoWrapper} className="videoContainer videoWrapper">
          <iframe className="videoIframe" width="100%" height="315" src={`https://www.youtube.com/embed/${getYoutubeId(song.youtube_url)}`} title={song.title} frameBorder="0" allowFullScreen style={styles.video} />
        </div>
      )}
      <div style={styles.lyricsBox}>
        <h3 style={styles.lyricsTitle}>📝 Lyrics</h3>
        <pre style={styles.lyrics}>{song.lyrics}</pre>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff", display: "flex", flexDirection: "column" },
  content: { width: "100%", padding: "2rem 3rem", flex: 1, boxSizing: "border-box" },
  headerControls: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { color: "#2d0a4e", fontSize: "2rem", margin: 0 },
  subtitle: { color: "#7c3aed", marginBottom: 0 },
  addBtn: { padding: "10px 18px", background: "#7c3aed", border: "none", color: "white", borderRadius: "8px", cursor: "pointer" },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  formCard: { background: "white", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid #d4b8ff" },
  cardTitle: { color: "#2d0a4e", marginBottom: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff", background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem" },
  textarea: { padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff", background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem", resize: "vertical", fontFamily: "monospace" },
  button: { padding: "12px", borderRadius: "8px", background: "#7c3aed", color: "white", fontSize: "1rem", cursor: "pointer", border: "none" },
  cancelSmallBtn: { padding: "8px 12px", borderRadius: "8px", background: "#6b7280", color: "white", border: "none", cursor: "pointer" },
  search: { flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff", background: "white", color: "#2d0a4e", fontSize: "1rem", minWidth: "280px" },
  filterToolbar: { display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" },
  filterTopRow: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  pillRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  pillButton: { padding: "8px 14px", borderRadius: "999px", border: "1px solid #d4b8ff", background: "white", color: "#2d0a4e", cursor: "pointer" },
  pillActive: { background: "#7c3aed", color: "white", borderColor: "#7c3aed" },
  select: { minWidth: "180px", padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff", background: "white", color: "#2d0a4e", fontSize: "1rem" },
  albumSection: { marginBottom: "2rem" },
  sectionTitle: { color: "#2d0a4e", fontSize: "1.6rem", marginBottom: "1.5rem", marginTop: 0 },
  albumCardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" },
  albumCard: { background: "white", borderRadius: "12px", border: "1px solid #d4b8ff", padding: "1rem", cursor: "pointer" },
  albumArtwork: { width: "100%", aspectRatio: "1", background: "linear-gradient(135deg, #e0d0ff, #f0e6ff)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.9rem", border: "1px solid #d4b8ff", overflow: "hidden" },
  albumImage: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" },
  albumEmoji: { fontSize: "4rem" },
  albumName: { color: "#2d0a4e", fontSize: "1.2rem", marginBottom: "0.4rem", marginTop: 0, lineHeight: "1.3", wordBreak: "break-word" },
  albumMeta: { color: "#7c3aed", fontSize: "0.95rem", marginBottom: "0.3rem", marginTop: "0.3rem" },
  albumType: { display: "inline-block", padding: "4px 10px", borderRadius: "999px", background: "#f0e6ff", color: "#7c3aed", fontSize: "0.8rem", margin: "0.4rem 0" },
  albumCardActions: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" },
  openBtn: { padding: "8px 10px", borderRadius: "6px", border: "none", background: "#7c3aed", color: "white", cursor: "pointer", textAlign: "center" },
  youtubeBtn: { display: "inline-block", padding: "10px 14px", borderRadius: "6px", border: "none", background: "#ef4444", color: "white", cursor: "pointer", textDecoration: "none", textAlign: "center" },
  editBtn: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #7c3aed", background: "#7c3aed", color: "white", cursor: "pointer" },
  deleteBtn: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #f97316", background: "#f97316", color: "white", cursor: "pointer" },
  favoriteBtn: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #d4b8ff", background: "white", color: "#2d0a4e", cursor: "pointer" },
  detailAlbumPanel: { background: "white", border: "1px solid #d4b8ff", borderRadius: "12px", padding: "1.5rem" },
  detailAlbumGrid: { display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", alignItems: "start" },
  detailCoverBox: { width: "100%", aspectRatio: "1", background: "#f0e6ff", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
  backBtn: { marginBottom: "1rem", padding: "8px 12px", background: "white", border: "1px solid #d4b8ff", color: "#7c3aed", borderRadius: "8px", cursor: "pointer" },
  albumSongLayout: { display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "1.5rem", alignItems: "start" },
  songCardsGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "1rem" },
  songMiniCard: { background: "white", borderRadius: "12px", padding: "1rem", cursor: "pointer" },
  songMiniImageBox: { width: "100%", aspectRatio: "16 / 9", background: "#f0e6ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: "0.75rem" },
  songDetail: { background: "white", borderRadius: "12px", padding: "1.5rem", border: "1px solid #d4b8ff" },
  detailTitle: { color: "#2d0a4e", fontSize: "1.8rem", marginBottom: "0.5rem" },
  detailArtist: { color: "#7c3aed", marginBottom: "1.5rem" },
  detailMeta: { color: "#4b2777", fontSize: "0.95rem", marginBottom: "0.6rem" },
  videoWrapper: { marginTop: "1rem", marginBottom: "1.5rem", borderRadius: "10px", overflow: "hidden" },
  video: { borderRadius: "10px" },
  lyricsBox: { background: "#f8f5ff", borderRadius: "10px", padding: "1.5rem", border: "1px solid #e0d0ff" },
  lyricsTitle: { color: "#2d0a4e", marginBottom: "1rem" },
  lyrics: { color: "#2d0a4e", lineHeight: 2, fontFamily: "inherit", whiteSpace: "pre-wrap", fontSize: "1rem" },
  selectPrompt: { display: "flex", alignItems: "center", justifyContent: "center", background: "white", borderRadius: "12px", border: "1px solid #d4b8ff", minHeight: "180px", color: "#888" },
  emptyCard: { background: "white", borderRadius: "12px", padding: "2rem", textAlign: "center", border: "1px solid #d4b8ff", color: "#888" },
  loadingContainer: {
    minHeight: "360px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(243,232,255,0.72))",
    border: "1px solid #d4b8ff",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "2rem",
  },
  loadingIconWrap: {
    width: "86px",
    height: "86px",
    borderRadius: "28px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 20px 40px rgba(124,58,237,0.28)",
    marginBottom: "1.2rem",
    animation: "softPulse 1.8s ease-in-out infinite",
  },
  loadingIcon: {
    fontSize: "3.2rem",
    lineHeight: 1,
  },
  loadingTitle: {
    color: "#2d0a4e",
    fontSize: "2rem",
    fontWeight: 900,
    margin: "0 0 0.6rem",
    letterSpacing: "-0.03em",
  },
  loadingText: {
    color: "#7c3aed",
    fontSize: "1.05rem",
    margin: 0,
    lineHeight: 1.7,
  },
  loadingDots: {
    display: "flex",
    gap: "10px",
    marginTop: "1.4rem",
  },
  loadingDot: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    background: "#7c3aed",
    display: "inline-block",
    animation: "dotBounce 1.2s ease-in-out infinite",
  },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalCard: { background: "white", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", border: "2px solid #d4b8ff", boxShadow: "0 10px 40px rgba(124,58,237,0.2)" },
  modalForm: { display: "flex", flexDirection: "column", gap: "0.9rem" },
  label: { display: "block", color: "#2d0a4e", fontSize: "0.95rem", fontWeight: 500 },
  fileInput: { padding: "10px", borderRadius: "8px", border: "2px dashed #d4b8ff", background: "#f8f5ff", color: "#2d0a4e", cursor: "pointer", fontSize: "0.95rem", width: "100%", boxSizing: "border-box" },
  imagePreview: { marginTop: "0.5rem", borderRadius: "10px", overflow: "hidden", border: "2px solid #d4b8ff", maxHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f5ff" },
  previewImage: { width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "8px" },
  modalActions: { display: "flex", gap: "1rem", marginTop: "1.2rem", justifyContent: "flex-end" },
};
