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
      const [meRes, albumsRes, songsRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/albums"),
        API.get("/songs"),
      ]);

      setCurrentUser(meRes.data);
      setAlbums(albumsRes.data || []);
      setSongs(songsRes.data || []);
    } catch {
      navigate("/login");
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
        list = list.filter(
          (album) => album.album_type === "Solo" && album.artist === albumFilter
        );
      } else {
        list = list.filter((album) => album.name === albumFilter);
      }
    }

    if (yearFilter !== "All") {
      list = list.filter((album) => String(album.year) === yearFilter);
    }

    if (term) {
      list = list.filter(
        (album) =>
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

    return songs.filter(
      (song) => song.album_id === selectedAlbum.id || song.album === selectedAlbum.name
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
        solo_artist:
          selectedAlbum.album_type === "Solo" ? selectedAlbum.artist : "",
      }));
    }

    setShowSongForm(true);
  };

  const handleSongSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...songForm,
      release_year: songForm.release_year
        ? Number(songForm.release_year)
        : null,
      album_id: songForm.album_id ? Number(songForm.album_id) : null,
    };

    try {
      const res = editingSong
        ? await API.put(`/songs/${editingSong.id}`, payload)
        : await API.post("/songs", payload);

      const saved = res.data;

      const songsRes = await API.get("/songs");
      setSongs(songsRes.data || []);

      setSelectedSong(saved);
      setShowSongForm(false);
      resetSongForm();

      alert(editingSong ? "Song updated! 💜" : "Song added! 💜");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save song");
    }
  };

  const startEditSong = (song) => {
    if (!song) return;

    setEditingSong(song);

    setSongForm({
      title: song.title || "",
      artist: song.artist || "",
      lyrics: song.lyrics || "",
      youtube_url: song.youtube_url || "",
      release_year: song.release_year ? String(song.release_year) : "",
      album: song.album || "",
      album_id: song.album_id ? String(song.album_id) : "",
      song_type: song.song_type || "BTS",
      solo_artist: song.solo_artist || "",
      image_url: song.image_url || "",
    });

    setShowSongForm(true);

    setTimeout(() => {
      const form = document.getElementById("song-form-card");
      if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 80);
  };

  const handleFavoriteToggle = async (song) => {
    try {
      const res = song.favorited_by_current_user
        ? await API.delete(`/songs/${song.id}/favorite`)
        : await API.post(`/songs/${song.id}/favorite`);

      setSongs((prev) =>
        prev.map((item) => (item.id === song.id ? res.data : item))
      );

      if (selectedSong?.id === song.id) setSelectedSong(res.data);
    } catch {
      alert("Favorite update failed");
    }
  };

  const handleDeleteSong = async (song) => {
    if (!window.confirm("Delete this song?")) return;

    try {
      await API.delete(`/songs/${song.id}`);
      setSongs((prev) => prev.filter((item) => item.id !== song.id));

      if (selectedSong?.id === song.id) setSelectedSong(null);
    } catch (err) {
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

      setAlbums((prev) =>
        prev.map((album) => (album.id === saved.id ? saved : album))
      );

      if (selectedAlbum?.id === saved.id) setSelectedAlbum(saved);

      setEditingAlbum(null);
      alert("Album updated! 💜");
    } catch (err) {
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
    if (yearFilter !== "All" && typeFilter === "All" && albumFilter === "All")
      return `🎵 ${yearFilter} Albums & Songs`;
    if (typeFilter === "Solo" && soloArtists.includes(albumFilter))
      return `🎵 ${albumFilter} Solo Discography`;
    if (typeFilter === "BTS")
      return yearFilter === "All" ? "🎵 BTS Albums" : `🎵 BTS Albums - ${yearFilter}`;
    if (typeFilter === "Solo")
      return yearFilter === "All" ? "🎵 Solo Albums" : `🎵 Solo Albums - ${yearFilter}`;
    return "🎵 All Albums";
  })();

  return (
    <>
      <Navbar />

      <main className="singalong-page" style={styles.page}>
        <section className="singalong-hero" style={styles.hero}>
          <div>
            <div style={styles.badge}>🎵 BTS Sing-Along</div>
            <h1 style={styles.title}>Sing, save and enjoy BTS music</h1>
            <p style={styles.subtitle}>
              Explore BTS and solo albums, add lyrics, watch YouTube videos and
              favorite songs with your Purple Family.
            </p>
          </div>

          <div className="singalong-hero-card" style={styles.heroCard}>
            <span style={styles.heroIcon}>🎤</span>
            <h2>{songs.length}</h2>
            <p>Total Songs</p>
          </div>
        </section>

        <section className="singalong-top-actions" style={styles.topActions}>
          <button onClick={openAddSong} style={styles.addBtn}>
            🎵 Add Song
          </button>
        </section>

        {showSongForm && (
          <section id="song-form-card" className="singalong-form-card" style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.cardTitle}>
                {editingSong ? `Edit Song: ${editingSong.title}` : "Add New Song"}
              </h3>

              <button
                style={styles.cancelSmallBtn}
                onClick={() => {
                  setShowSongForm(false);
                  resetSongForm();
                }}
              >
                Cancel
              </button>
            </div>

            <form className="singalong-form" onSubmit={handleSongSubmit} style={styles.form}>
              <input
                style={styles.input}
                placeholder="Song Title"
                value={songForm.title}
                onChange={(e) =>
                  setSongForm({ ...songForm, title: e.target.value })
                }
                required
              />

              <input
                style={styles.input}
                placeholder="Artist"
                value={songForm.artist}
                onChange={(e) =>
                  setSongForm({ ...songForm, artist: e.target.value })
                }
                required
              />

              <select
                style={styles.select}
                value={songForm.song_type}
                onChange={(e) =>
                  setSongForm({
                    ...songForm,
                    song_type: e.target.value,
                    album: "",
                    album_id: "",
                    solo_artist: "",
                  })
                }
              >
                <option value="BTS">BTS</option>
                <option value="Solo">Solo</option>
              </select>

              {songForm.song_type === "Solo" && (
                <select
                  style={styles.select}
                  value={songForm.solo_artist}
                  onChange={(e) =>
                    setSongForm({
                      ...songForm,
                      solo_artist: e.target.value,
                      artist: e.target.value,
                    })
                  }
                >
                  <option value="">Select Solo Artist</option>
                  {soloArtists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              )}

              <select
                style={styles.select}
                value={songForm.album_id ? String(songForm.album_id) : ""}
                onChange={(e) => {
                  const album = albums.find((a) => String(a.id) === e.target.value);

                  setSongForm({
                    ...songForm,
                    album_id: album?.id || "",
                    album: album?.name || "",
                    release_year: album?.year
                      ? String(album.year)
                      : songForm.release_year,
                    song_type: album?.album_type || songForm.song_type,
                    artist:
                      album?.album_type === "BTS"
                        ? "BTS"
                        : album?.artist || songForm.artist,
                    solo_artist: album?.album_type === "Solo" ? album.artist : "",
                  });
                }}
              >
                <option value="">Select Album</option>

                {albums
                  .filter((album) => album.album_type === songForm.song_type)
                  .map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.name}
                    </option>
                  ))}
              </select>

              <select
                style={styles.select}
                value={songForm.release_year}
                onChange={(e) =>
                  setSongForm({ ...songForm, release_year: e.target.value })
                }
              >
                <option value="">Select Year</option>
                {years
                  .filter((year) => year !== "All")
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>

              <input
                style={styles.input}
                placeholder="Song Image URL optional"
                value={songForm.image_url}
                onChange={(e) =>
                  setSongForm({ ...songForm, image_url: e.target.value })
                }
              />

              <input
                style={styles.input}
                placeholder="YouTube URL"
                value={songForm.youtube_url}
                onChange={(e) =>
                  setSongForm({ ...songForm, youtube_url: e.target.value })
                }
                required
              />

              <textarea
                style={styles.textarea}
                placeholder="Paste lyrics here..."
                value={songForm.lyrics}
                rows={8}
                onChange={(e) =>
                  setSongForm({ ...songForm, lyrics: e.target.value })
                }
                required
              />

              <button style={styles.button} type="submit">
                {editingSong ? "Update Song 💜" : "Add Song 💜"}
              </button>
            </form>
          </section>
        )}

        {editingAlbum && (
          <div style={styles.modalOverlay}>
            <div className="singalong-modal-card" style={styles.modalCard}>
              <h3 style={styles.cardTitle}>Edit Album</h3>

              <div className="singalong-modal-form" style={styles.modalForm}>
                <label style={styles.label}>Album Name</label>
                <input
                  style={styles.input}
                  value={editingAlbum.name || ""}
                  onChange={(e) =>
                    setEditingAlbum({ ...editingAlbum, name: e.target.value })
                  }
                />

                <label style={styles.label}>Artist</label>
                <input
                  style={styles.input}
                  value={editingAlbum.artist || ""}
                  onChange={(e) =>
                    setEditingAlbum({ ...editingAlbum, artist: e.target.value })
                  }
                />

                <label style={styles.label}>Year</label>
                <input
                  style={styles.input}
                  type="number"
                  value={editingAlbum.year || ""}
                  onChange={(e) =>
                    setEditingAlbum({ ...editingAlbum, year: e.target.value })
                  }
                />

                <label style={styles.label}>Type</label>
                <select
                  style={styles.select}
                  value={editingAlbum.album_type || "BTS"}
                  onChange={(e) =>
                    setEditingAlbum({
                      ...editingAlbum,
                      album_type: e.target.value,
                    })
                  }
                >
                  <option value="BTS">BTS</option>
                  <option value="Solo">Solo</option>
                </select>

                <label style={styles.label}>Playlist URL</label>
                <input
                  style={styles.input}
                  value={editingAlbum.playlist_url || ""}
                  onChange={(e) =>
                    setEditingAlbum({
                      ...editingAlbum,
                      playlist_url: e.target.value,
                    })
                  }
                />

                <label style={styles.label}>Image URL</label>
                <input
                  style={styles.input}
                  value={editingAlbum.image_url || ""}
                  onChange={(e) =>
                    setEditingAlbum({
                      ...editingAlbum,
                      image_url: e.target.value,
                      preview: "",
                    })
                  }
                />

                <label style={styles.label}>Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  style={styles.fileInput}
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (file) {
                      setEditingAlbum({
                        ...editingAlbum,
                        file,
                        preview: URL.createObjectURL(file),
                      });
                    }
                  }}
                />

                {(editingAlbum.preview || editingAlbum.image_url) && (
                  <div style={styles.imagePreview}>
                    <img
                      src={getFileUrl(editingAlbum.preview || editingAlbum.image_url)}
                      alt={editingAlbum.name}
                      style={styles.previewImage}
                    />
                  </div>
                )}

                <div className="singalong-modal-actions" style={styles.modalActions}>
                  <button style={styles.button} onClick={handleSaveAlbum}>
                    Save Album 💜
                  </button>

                  <button
                    style={styles.grayBtn}
                    onClick={() => setEditingAlbum(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="singalong-filter-toolbar" style={styles.filterToolbar}>
          <div className="singalong-filter-top-row" style={styles.filterTopRow}>
            <input
              style={styles.search}
              placeholder="Search albums or songs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              style={styles.select}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setAlbumFilter("All");
                setSelectedAlbum(null);
                setSelectedSong(null);
              }}
            >
              <option value="All">All Types</option>
              <option value="BTS">BTS</option>
              <option value="Solo">Solo</option>
            </select>

            <select
              style={styles.select}
              value={albumFilter}
              onChange={(e) => {
                setAlbumFilter(e.target.value);
                setSelectedAlbum(null);
                setSelectedSong(null);
              }}
            >
              <option value="All">All Albums</option>

              {(typeFilter === "All" || typeFilter === "BTS") && (
                <optgroup label="BTS Albums">
                  {albumOptions.bts.map((album) => (
                    <option key={album.id} value={album.name}>
                      {album.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {(typeFilter === "All" || typeFilter === "Solo") && (
                <optgroup label="Solo Artists">
                  {soloArtists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="singalong-pill-row" style={styles.pillRow}>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setYearFilter(year);
                  setSelectedAlbum(null);
                  setSelectedSong(null);
                }}
                style={{
                  ...styles.pillButton,
                  ...(yearFilter === year ? styles.pillActive : {}),
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </section>

        {selectedAlbum?.album_type === "Solo" && (
          <section className="singalong-detail-album-panel" style={styles.detailAlbumPanel}>
            <button style={styles.backBtn} onClick={() => setSelectedAlbum(null)}>
              ← Back to albums
            </button>

            <div className="singalong-detail-album-grid" style={styles.detailAlbumGrid}>
              <div className="singalong-detail-cover-box" style={styles.detailCoverBox}>
                {selectedAlbum.image_url ? (
                  <img
                    src={getFileUrl(selectedAlbum.image_url)}
                    alt={selectedAlbum.name}
                    style={styles.albumImage}
                  />
                ) : (
                  <span style={styles.albumEmoji}>🎵</span>
                )}
              </div>

              <div>
                <h2 style={styles.detailTitle}>{selectedAlbum.name}</h2>
                <p style={styles.detailMeta}>👤 {selectedAlbum.artist}</p>
                <p style={styles.detailMeta}>📅 {selectedAlbum.year || "Unknown"}</p>
                <p style={styles.albumType}>Solo</p>

                {selectedAlbum.playlist_url &&
                  getYoutubePlaylistId(selectedAlbum.playlist_url) && (
                    <div className="singalong-video-wrapper" style={styles.videoWrapper}>
                      <iframe
                        width="100%"
                        height="315"
                        src={`https://www.youtube.com/embed/videoseries?list=${getYoutubePlaylistId(
                          selectedAlbum.playlist_url
                        )}`}
                        title={selectedAlbum.name}
                        frameBorder="0"
                        allowFullScreen
                        style={styles.video}
                      />
                    </div>
                  )}

                {selectedAlbum.playlist_url && (
                  <a
                    href={selectedAlbum.playlist_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.youtubeBtn}
                  >
                    ▶️ Open Full Playlist
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {selectedAlbum?.album_type === "BTS" && (
          <section className="singalong-album-section" style={styles.albumSection}>
            <button
              style={styles.backBtn}
              onClick={() => {
                setSelectedAlbum(null);
                setSelectedSong(null);
              }}
            >
              ← Back to albums
            </button>

            <h3 style={styles.sectionTitle}>{galleryTitle}</h3>

            {albumSongs.length === 0 ? (
              <div style={styles.emptyCard}>No songs added to this album yet! 💜</div>
            ) : (
              <div className="singalong-album-song-layout" style={styles.albumSongLayout}>
                <div className="singalong-song-cards-grid" style={styles.songCardsGrid}>
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
          </section>
        )}

        {!selectedAlbum && (
          <section className="singalong-album-section" style={styles.albumSection}>
            <h3 style={styles.sectionTitle}>{galleryTitle}</h3>

            {albumCardsToShow.length === 0 ? (
              <div style={styles.emptyCard}>No albums found! 💜</div>
            ) : (
              <div className="singalong-album-cards-grid" style={styles.albumCardsGrid}>
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
          </section>
        )}
        <SingalongResponsiveStyles />
      </main>

      <Footer />
    </>
  );
}

function AlbumCard({ album, getFileUrl, onOpen, onEdit, onDelete }) {
  return (
    <article className="singalong-album-card" style={styles.albumCard} onClick={onOpen}>
      <div className="singalong-album-cover" style={styles.albumCover}>
        {album.image_url ? (
          <img
            src={getFileUrl(album.image_url)}
            alt={album.name}
            style={styles.albumImage}
          />
        ) : (
          <span style={styles.albumEmoji}>🎵</span>
        )}

        <span style={styles.albumTag}>{album.album_type}</span>
      </div>

      <div style={styles.albumInfo}>
        <h3 style={styles.albumName}>{album.name}</h3>
        <p style={styles.albumArtist}>👤 {album.artist}</p>
        <p style={styles.albumYear}>📅 {album.year || "Unknown"}</p>

        <div className="singalong-album-actions" style={styles.albumActions}>
          <button style={styles.openBtn} onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}>
            Open →
          </button>

          {album.can_edit && (
            <button style={styles.editBtn} onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}>
              Edit
            </button>
          )}

          {album.can_delete && (
            <button style={styles.deleteBtn} onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function SongMiniCard({
  song,
  selected,
  currentUser,
  getFileUrl,
  onSelect,
  onFavorite,
  onEdit,
  onDelete,
}) {
  return (
    <article
      onClick={onSelect}
      className="singalong-song-mini-card"
      style={{
        ...styles.songMiniCard,
        ...(selected ? styles.songMiniActive : {}),
      }}
    >
      <div className="singalong-song-thumb" style={styles.songThumb}>
        {song.image_url ? (
          <img
            src={getFileUrl(song.image_url)}
            alt={song.title}
            style={styles.songThumbImg}
          />
        ) : (
          <span>🎵</span>
        )}
      </div>

      <div style={styles.songMiniContent}>
        <h4 style={styles.songMiniTitle}>{song.title}</h4>
        <p style={styles.songMiniMeta}>
          {song.artist} · {song.release_year || "Unknown"}
        </p>

        <div className="singalong-song-actions" style={styles.songActions}>
          <button
            style={{
              ...styles.favoriteBtn,
              ...(song.favorited_by_current_user ? styles.favoriteActive : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
          >
            {song.favorited_by_current_user ? "❤️" : "🤍"}{" "}
            {song.favorites_count || 0}
          </button>

          {song.can_edit && (
            <button
              style={styles.editBtn}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
          )}

          {currentUser?.is_admin && (
            <button
              style={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function SongDetail({ song, getYoutubeId }) {
  if (!song) {
    return (
      <aside className="singalong-song-detail-empty" style={styles.songDetailEmpty}>
        <span style={styles.heroIcon}>🎧</span>
        <h3>Select a song</h3>
        <p>Choose a song from the album to view lyrics and video.</p>
      </aside>
    );
  }

  const videoId = getYoutubeId(song.youtube_url);

  return (
    <aside className="singalong-song-detail" style={styles.songDetail}>
      <h2 style={styles.songDetailTitle}>{song.title}</h2>
      <p style={styles.songDetailMeta}>
        👤 {song.artist} · 💿 {song.album || "Album"} · 📅{" "}
        {song.release_year || "Unknown"}
      </p>

      {videoId && (
        <div className="singalong-video-wrapper" style={styles.videoWrapper}>
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={song.title}
            frameBorder="0"
            allowFullScreen
            style={styles.video}
          />
        </div>
      )}

      <div className="singalong-lyrics-box" style={styles.lyricsBox}>
        <h3 style={styles.lyricsTitle}>Lyrics</h3>
        <pre style={styles.lyrics}>{song.lyrics}</pre>
      </div>
    </aside>
  );
}


function SingalongResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .singalong-page {
          padding: 24px 14px !important;
          overflow-x: hidden !important;
        }

        .singalong-hero {
          grid-template-columns: 1fr !important;
          padding: 32px 22px !important;
          border-radius: 28px !important;
          text-align: center !important;
          gap: 18px !important;
        }

        .singalong-hero-card {
          min-height: 170px !important;
          border-radius: 24px !important;
        }

        .singalong-top-actions {
          justify-content: stretch !important;
        }

        .singalong-top-actions button,
        .singalong-form button,
        .singalong-modal-actions button,
        .singalong-youtube-btn {
          width: 100% !important;
        }

        .singalong-form-card,
        .singalong-filter-toolbar,
        .singalong-album-section,
        .singalong-detail-album-panel {
          padding: 20px !important;
          border-radius: 26px !important;
        }

        .singalong-form {
          grid-template-columns: 1fr !important;
        }

        .singalong-form textarea,
        .singalong-form button {
          grid-column: auto !important;
        }

        .singalong-filter-top-row {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .singalong-pill-row {
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          padding-bottom: 8px !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .singalong-pill-row button {
          flex: 0 0 auto !important;
        }

        .singalong-album-cards-grid {
          grid-template-columns: 1fr !important;
          gap: 18px !important;
        }

        .singalong-album-card {
          border-radius: 26px !important;
        }

        .singalong-album-cover {
          height: 240px !important;
        }

        .singalong-album-actions,
        .singalong-song-actions {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
        }

        .singalong-album-actions button,
        .singalong-song-actions button {
          width: 100% !important;
        }

        .singalong-detail-album-grid,
        .singalong-album-song-layout {
          grid-template-columns: 1fr !important;
          gap: 20px !important;
        }

        .singalong-detail-cover-box {
          height: 300px !important;
        }

        .singalong-song-cards-grid {
          max-height: none !important;
          overflow: visible !important;
          padding-right: 0 !important;
        }

        .singalong-song-mini-card {
          grid-template-columns: 72px 1fr !important;
          gap: 12px !important;
          border-radius: 20px !important;
        }

        .singalong-song-thumb {
          width: 72px !important;
          height: 72px !important;
        }

        .singalong-song-detail,
        .singalong-song-detail-empty {
          padding: 20px !important;
          border-radius: 24px !important;
        }

        .singalong-video-wrapper iframe {
          height: 230px !important;
        }

        .singalong-lyrics-box {
          padding: 14px !important;
        }

        .singalong-modal-card {
          width: 100% !important;
          padding: 22px !important;
          border-radius: 24px !important;
        }

        .singalong-modal-actions {
          flex-direction: column !important;
        }
      }

      @media (max-width: 420px) {
        .singalong-page {
          padding: 20px 12px !important;
        }

        .singalong-hero {
          padding: 28px 18px !important;
        }

        .singalong-hero-card {
          min-height: 150px !important;
        }

        .singalong-form-card,
        .singalong-filter-toolbar,
        .singalong-album-section,
        .singalong-detail-album-panel {
          padding: 16px !important;
        }

        .singalong-album-cover {
          height: 220px !important;
        }

        .singalong-detail-cover-box {
          height: 260px !important;
        }

        .singalong-song-mini-card {
          grid-template-columns: 1fr !important;
        }

        .singalong-song-thumb {
          width: 100% !important;
          height: 190px !important;
        }

        .singalong-album-actions,
        .singalong-song-actions {
          grid-template-columns: 1fr !important;
        }

        .singalong-video-wrapper iframe {
          height: 200px !important;
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
    maxWidth: "720px",
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

  topActions: {
    width: "min(1280px,100%)",
    margin: "0 auto 20px",
    display: "flex",
    justifyContent: "flex-end",
  },

  addBtn: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "13px 22px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(124,58,237,0.22)",
  },

  formCard: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    padding: "26px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },

  cardTitle: {
    color: "#4c1d95",
    fontSize: "1.4rem",
  },

  cancelSmallBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#e5e7eb",
    color: "#374151",
    padding: "10px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "14px",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    color: "#241039",
    outline: "none",
  },

  select: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    color: "#4c1d95",
    fontWeight: 800,
    outline: "none",
  },

  textarea: {
    gridColumn: "1 / -1",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    color: "#241039",
    outline: "none",
    resize: "vertical",
  },

  button: {
    gridColumn: "1 / -1",
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  filterToolbar: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    padding: "18px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  filterTopRow: {
    display: "grid",
    gridTemplateColumns: "1fr 180px 260px",
    gap: "14px",
    marginBottom: "16px",
  },

  search: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    color: "#241039",
    outline: "none",
  },

  pillRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  pillButton: {
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    color: "#6d28d9",
    padding: "9px 14px",
    borderRadius: "999px",
    fontWeight: 900,
    cursor: "pointer",
  },

  pillActive: {
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    boxShadow: "0 12px 24px rgba(124,58,237,0.2)",
  },

  albumSection: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
  },

  sectionTitle: {
    color: "#241039",
    fontSize: "clamp(1.7rem,3vw,2.5rem)",
    letterSpacing: "-0.04em",
    marginBottom: "22px",
  },

  albumCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
    gap: "22px",
  },

  albumCard: {
    overflow: "hidden",
    borderRadius: "30px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 42px rgba(76,29,149,0.1)",
    cursor: "pointer",
  },

  albumCover: {
    position: "relative",
    height: "280px",
    background: "#f3e8ff",
    display: "grid",
    placeItems: "center",
  },

  albumImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  albumEmoji: {
    fontSize: "4rem",
  },

  albumTag: {
    position: "absolute",
    top: "14px",
    left: "14px",
    padding: "8px 13px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.86)",
    color: "#6d28d9",
    fontWeight: 900,
  },

  albumInfo: {
    padding: "20px",
  },

  albumName: {
    color: "#4c1d95",
    marginBottom: "8px",
  },

  albumArtist: {
    color: "#7c6a92",
    marginBottom: "5px",
  },

  albumYear: {
    color: "#7c6a92",
  },

  albumActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "15px",
  },

  openBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#f3e8ff",
    color: "#6d28d9",
    padding: "9px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  editBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "9px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "9px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  backBtn: {
    marginBottom: "18px",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "999px",
    background: "white",
    color: "#6d28d9",
    padding: "11px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },

  albumSongLayout: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "24px",
    alignItems: "start",
  },

  songCardsGrid: {
    display: "grid",
    gap: "14px",
    maxHeight: "760px",
    overflow: "auto",
    paddingRight: "6px",
  },

  songMiniCard: {
    display: "grid",
    gridTemplateColumns: "86px 1fr",
    gap: "14px",
    padding: "12px",
    borderRadius: "22px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.12)",
    cursor: "pointer",
  },

  songMiniActive: {
    border: "2px solid #a855f7",
    background: "#faf5ff",
  },

  songThumb: {
    width: "86px",
    height: "86px",
    borderRadius: "18px",
    background: "#f3e8ff",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
  },

  songThumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  songMiniContent: {
    minWidth: 0,
  },

  songMiniTitle: {
    color: "#4c1d95",
    marginBottom: "5px",
  },

  songMiniMeta: {
    color: "#7c6a92",
    fontSize: "0.88rem",
    marginBottom: "10px",
  },

  songActions: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },

  favoriteBtn: {
    border: "1px solid rgba(124,58,237,0.2)",
    background: "#f3e8ff",
    color: "#6d28d9",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 900,
    cursor: "pointer",
  },

  favoriteActive: {
    background: "#fdf2f8",
    color: "#db2777",
    border: "1px solid rgba(236,72,153,0.28)",
  },

  songDetail: {
    padding: "24px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
  },

  songDetailEmpty: {
    minHeight: "360px",
    padding: "40px 20px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    textAlign: "center",
    color: "#7c6a92",
    display: "grid",
    placeItems: "center",
  },

  songDetailTitle: {
    color: "#241039",
    fontSize: "2rem",
    marginBottom: "8px",
  },

  songDetailMeta: {
    color: "#7c6a92",
    marginBottom: "18px",
  },

  videoWrapper: {
    overflow: "hidden",
    borderRadius: "22px",
    background: "#111827",
    marginBottom: "20px",
  },

  video: {
    border: "none",
    display: "block",
  },

  lyricsBox: {
    padding: "18px",
    borderRadius: "22px",
    background: "#faf7ff",
    border: "1px solid rgba(124,58,237,0.12)",
  },

  lyricsTitle: {
    color: "#4c1d95",
    marginBottom: "12px",
  },

  lyrics: {
    whiteSpace: "pre-wrap",
    color: "#4b3b5f",
    lineHeight: 1.8,
    fontFamily: "inherit",
  },

  detailAlbumPanel: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    padding: "30px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
  },

  detailAlbumGrid: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "26px",
  },

  detailCoverBox: {
    height: "420px",
    borderRadius: "28px",
    overflow: "hidden",
    background: "#f3e8ff",
    display: "grid",
    placeItems: "center",
  },

  detailTitle: {
    color: "#241039",
    fontSize: "clamp(2rem,4vw,3.5rem)",
    letterSpacing: "-0.05em",
    marginBottom: "12px",
  },

  detailMeta: {
    color: "#7c6a92",
    marginBottom: "8px",
    fontWeight: 700,
  },

  albumType: {
    display: "inline-flex",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#f3e8ff",
    color: "#6d28d9",
    fontWeight: 900,
    margin: "10px 0 18px",
  },

  youtubeBtn: {
    display: "inline-flex",
    marginTop: "6px",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "12px 18px",
    fontWeight: 900,
  },

  emptyCard: {
    padding: "48px 20px",
    borderRadius: "28px",
    background: "white",
    textAlign: "center",
    color: "#7c6a92",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(18,10,35,0.78)",
    backdropFilter: "blur(10px)",
    display: "grid",
    placeItems: "center",
    padding: "22px",
  },

  modalCard: {
    width: "min(760px,100%)",
    maxHeight: "92vh",
    overflow: "auto",
    padding: "28px",
    borderRadius: "30px",
    background: "white",
    boxShadow: "0 35px 90px rgba(0,0,0,0.35)",
  },

  modalForm: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },

  label: {
    color: "#6d28d9",
    fontWeight: 900,
  },

  fileInput: {
    color: "#4c1d95",
    fontWeight: 800,
  },

  imagePreview: {
    height: "220px",
    borderRadius: "22px",
    overflow: "hidden",
    background: "#f3e8ff",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  grayBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#e5e7eb",
    color: "#374151",
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
};