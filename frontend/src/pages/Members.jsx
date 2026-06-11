import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import jinImg from "../assets/bts-members/jin.jpg";
import sugaImg from "../assets/bts-members/suga.jpg";
import jhopeImg from "../assets/bts-members/jhope.jpg";
import rmImg from "../assets/bts-members/rm.jpg";
import jiminImg from "../assets/bts-members/jimin.jpg";
import vImg from "../assets/bts-members/v.jpg";
import jungkookImg from "../assets/bts-members/jungkook.jpg";

const API_BASE = "http://127.0.0.1:8000";

const BTS_MEMBERS = [
  {
    name: "RM",
    emoji: "🐨",
    photo: rmImg,
    role: "Leader & Rapper",
    born: "September 12, 1994",
    from: "Ilsan, South Korea",
    desc: "Kim Namjoon is BTS's leader and the voice of the group. A deep thinker, art lover, and self-taught English speaker with incredible lyrical skills.",
    color: "#e8f5e0",
  },
  {
    name: "Jin",
    emoji: "🐹",
    photo: jinImg,
    role: "Vocalist",
    born: "December 4, 1992",
    from: "Gwacheon, South Korea",
    desc: "Kim Seokjin, known as Jin, is BTS's oldest member and worldwide handsome! Known for his dad jokes, pink princess energy, and powerful vocals.",
    color: "#ffe0e0",
  },
  {
    name: "Suga",
    emoji: "🐱",
    photo: sugaImg,
    role: "Rapper & Producer",
    born: "March 9, 1993",
    from: "Daegu, South Korea",
    desc: "Min Yoongi, known as Suga or Agust D. A genius music producer and rapper known for his honest, emotional lyrics and sleepy cat energy.",
    color: "#e0e8ff",
  },
  {
    name: "J-Hope",
    emoji: "🐿️",
    photo: jhopeImg,
    role: "Rapper & Dancer",
    born: "February 18, 1994",
    from: "Gwangju, South Korea",
    desc: "Jung Hoseok is BTS's sunshine! Known for his incredible dancing, bright energy, and powerful rap. He is your hope, he is J-Hope!",
    color: "#fff8e0",
  },
  {
    name: "Jimin",
    emoji: "🐥",
    photo: jiminImg,
    role: "Vocalist & Dancer",
    born: "October 13, 1995",
    from: "Busan, South Korea",
    desc: "Park Jimin is known for his stunning dance skills, sweet vocals, and charming personality. He puts his heart into every performance.",
    color: "#f0e0ff",
  },
  {
    name: "Taehyung",
    emoji: "🐯",
    photo: vImg,
    role: "Vocalist",
    born: "December 30, 1995",
    from: "Daegu, South Korea",
    desc: "Kim Taehyung, also known as V, is known for his deep baritone voice, artistic soul, and unique 4D personality. A true renaissance man.",
    color: "#e0f5ff",
  },
  {
    name: "Jungkook",
    emoji: "🐰",
    photo: jungkookImg,
    role: "Main Vocalist",
    born: "September 1, 1997",
    from: "Busan, South Korea",
    desc: "Jeon Jungkook is the Golden Maknae — the youngest member who excels at everything. Singing, dancing, drawing, sports — he does it all!",
    color: "#fff0e0",
  },
];

export default function Members() {
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBias, setFilterBias] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [activeTab, setActiveTab] = useState("ot7");
  const [selectedMember, setSelectedMember] = useState(null);
  const [descriptions, setDescriptions] = useState({});
  const [newDesc, setNewDesc] = useState("");
  const [editingDescId, setEditingDescId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const navigate = useNavigate();

  const biasOptions = ["All", "Jin", "Suga", "J-Hope", "RM", "Jimin", "Taehyung", "Jungkook"];

  const groupDescriptions = (items) => {
    const grouped = {};
    items.forEach((item) => {
      if (!grouped[item.member_name]) grouped[item.member_name] = [];
      grouped[item.member_name].push(item);
    });
    setDescriptions(grouped);
  };

  const loadDescriptions = async () => {
    try {
      const res = await API.get("/bts-descriptions");
      groupDescriptions(res.data);
    } catch (err) {
      console.error("Failed to load BTS descriptions", err);
    }
  };

  const loadPageData = async () => {
    try {
      const [meRes, membersRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/members"),
      ]);

      setCurrentUser(meRes.data);
      setMembers(membersRes.data);
      await loadDescriptions();
    } catch (err) {
      navigate("/login");
    }
  };

  useEffect(() => {
    loadPageData();
  }, [navigate]);

  const filtered = members
    .filter((m) => {
      const displayName = m.nickname || m.username || "";
      const matchSearch =
        displayName.toLowerCase().includes(search.toLowerCase()) ||
        (m.username && m.username.toLowerCase().includes(search.toLowerCase())) ||
        (m.country && m.country.toLowerCase().includes(search.toLowerCase()));

      const matchBias = filterBias === "All" || m.bias === filterBias;
      return matchSearch && matchBias;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      if (sortOrder === "newest") return dateB - dateA;
      if (sortOrder === "oldest") return dateA - dateB;

      const nameA = (a.nickname || a.username || "").toLowerCase();
      const nameB = (b.nickname || b.username || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const handleAddDesc = async (memberName) => {
    if (!newDesc.trim()) return;

    try {
      const formData = new FormData();
      formData.append("member_name", memberName);
      formData.append("content", newDesc.trim());

      await API.post("/bts-descriptions", formData);
      setNewDesc("");
      await loadDescriptions();
    } catch (err) {
      console.error(err);
      alert("Description save failed");
    }
  };

  const startEditDesc = (desc) => {
    setEditingDescId(desc.id);
    setEditingText(desc.content);
  };

  const cancelEditDesc = () => {
    setEditingDescId(null);
    setEditingText("");
  };

  const saveEditDesc = async (descriptionId) => {
    if (!editingText.trim()) return;

    try {
      const formData = new FormData();
      formData.append("content", editingText.trim());

      await API.put(`/bts-descriptions/${descriptionId}`, formData);
      cancelEditDesc();
      await loadDescriptions();
    } catch (err) {
      console.error(err);
      alert("Description update failed");
    }
  };

  const deleteDesc = async (descriptionId) => {
    if (!window.confirm("Delete this ARMY description?")) return;

    try {
      await API.delete(`/bts-descriptions/${descriptionId}`);
      await loadDescriptions();
    } catch (err) {
      console.error(err);
      alert("Only admin can delete descriptions");
    }
  };

  const getAuthorPhoto = (desc) => {
    if (!desc.created_by_profile_picture) return null;
    return `${API_BASE}/${desc.created_by_profile_picture}`;
  };

  const getAuthorName = (desc) => {
    return desc.created_by_nickname || desc.created_by_username || "ARMY";
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.tabs}>
          <button
            onClick={() => {
              setActiveTab("ot7");
              setSelectedMember(null);
            }}
            style={{
              ...styles.tabBtn,
              background: activeTab === "ot7" ? "#7c3aed" : "white",
              color: activeTab === "ot7" ? "white" : "#7c3aed",
            }}
          >
            💜 Know About OT7
          </button>

          <button
            onClick={() => {
              setActiveTab("army");
              setSelectedMember(null);
            }}
            style={{
              ...styles.tabBtn,
              background: activeTab === "army" ? "#7c3aed" : "white",
              color: activeTab === "army" ? "white" : "#7c3aed",
            }}
          >
            👥 SL ARMY Family
          </button>
        </div>

        {activeTab === "ot7" && (
          <>
            <h2 style={styles.title}>💜 Know About OT7</h2>
            <p style={styles.subtitle}>Learn about all 7 BTS members 💜</p>

            {!selectedMember ? (
              <div style={styles.ot7Grid}>
                {BTS_MEMBERS.map((m) => (
                  <div
                    key={m.name}
                    style={{ ...styles.btsCard, background: m.color }}
                    onClick={() => setSelectedMember(m)}
                  >
                    <div style={styles.btsPhotoBox}>
                      <img src={m.photo} alt={m.name} style={styles.btsPhoto} />
                      <div style={styles.photoNameTag}>{m.name}</div>
                    </div>

                    <div style={styles.memberEmoji}>{m.emoji}</div>
                    <h3 style={styles.btsName}>{m.name}</h3>
                    <p style={styles.btsRole}>{m.role}</p>
                    <p style={styles.btsFrom}>📍 {m.from}</p>
                    <div style={styles.viewBtn}>View Profile →</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.memberDetail}>
                <button onClick={() => setSelectedMember(null)} style={styles.backBtn}>
                  ← Back to OT7
                </button>

                <div style={{ ...styles.detailCard, background: selectedMember.color }}>
                  <div style={styles.detailHero}>
                    <div style={styles.detailPhotoBox}>
                      <img
                        src={selectedMember.photo}
                        alt={selectedMember.name}
                        style={styles.detailPhoto}
                      />
                      <div style={styles.detailPhotoTag}>{selectedMember.name}</div>
                    </div>

                    <div style={styles.detailTextBox}>
                      <div style={styles.detailEmoji}>{selectedMember.emoji}</div>
                      <h2 style={styles.detailName}>{selectedMember.name}</h2>
                      <div style={styles.detailBadge}>{selectedMember.role}</div>

                      <div style={styles.detailInfo}>
                        <span>🎂 {selectedMember.born}</span>
                        <span>📍 {selectedMember.from}</span>
                      </div>

                      <p style={styles.detailDesc}>{selectedMember.desc}</p>
                    </div>
                  </div>
                </div>

                <div style={styles.descSection}>
                  <h3 style={styles.descTitle}>💜 What ARMY says about {selectedMember.name}</h3>

                  {(descriptions[selectedMember.name] || []).length === 0 ? (
                    <p style={{ color: "#888" }}>No descriptions yet! Be the first 💜</p>
                  ) : (
                    (descriptions[selectedMember.name] || []).map((d) => (
                      <div key={d.id} style={styles.descCard}>
                        <div style={styles.descHeader}>
                          <div style={styles.descAuthorBox}>
                            <div style={styles.descAvatar}>
                              {getAuthorPhoto(d) ? (
                                <img
                                  src={getAuthorPhoto(d)}
                                  alt={getAuthorName(d)}
                                  style={styles.descAvatarImg}
                                />
                              ) : (
                                getAuthorName(d)[0]?.toUpperCase()
                              )}
                            </div>

                            <div>
                              <div style={styles.descAuthor}>💜 {getAuthorName(d)}</div>
                              <div style={styles.descDate}>
                                {new Date(d.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div style={styles.descActions}>
                            {d.can_edit && editingDescId !== d.id && (
                              <button style={styles.smallEditBtn} onClick={() => startEditDesc(d)}>
                                Edit
                              </button>
                            )}

                            {d.can_delete && (
                              <button style={styles.smallDeleteBtn} onClick={() => deleteDesc(d.id)}>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {editingDescId === d.id ? (
                          <div style={styles.editDescBox}>
                            <textarea
                              style={styles.descInput}
                              value={editingText}
                              rows={3}
                              onChange={(e) => setEditingText(e.target.value)}
                            />

                            <div style={styles.editBtns}>
                              <button style={styles.descBtn} onClick={() => saveEditDesc(d.id)}>
                                Save
                              </button>
                              <button style={styles.cancelBtn} onClick={cancelEditDesc}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={styles.descText}>{d.content}</p>
                        )}
                      </div>
                    ))
                  )}

                  <div style={styles.descForm}>
                    <textarea
                      style={styles.descInput}
                      placeholder={`Share your thoughts about ${selectedMember.name} 💜`}
                      value={newDesc}
                      rows={3}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />

                    <button
                      style={styles.descBtn}
                      onClick={() => handleAddDesc(selectedMember.name)}
                    >
                      Add 💜
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "army" && (
          <>
            <h2 style={styles.title}>👥 Our SL ARMY Family</h2>
            <p style={styles.subtitle}>{members.length} members and growing! 💜</p>

            <div style={styles.controls}>
              <input
                style={styles.search}
                placeholder="Search by name, nickname or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div style={styles.filterBox}>
                <label style={styles.filterLabel}>Bias</label>
                <select
                  style={styles.select}
                  value={filterBias}
                  onChange={(e) => setFilterBias(e.target.value)}
                >
                  {biasOptions.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterBox}>
                <label style={styles.filterLabel}>Sort</label>
                <select
                  style={styles.select}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest Members First</option>
                  <option value="oldest">Oldest Members First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            <div style={styles.filterSummary}>
              Showing {filtered.length} of {members.length} members
              {filterBias !== "All" ? ` • Bias: ${filterBias}` : ""}
            </div>

            {filtered.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={{ color: "#888" }}>No members found 💜</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {filtered.map((member) => (
                  <div key={member.id} style={styles.card}>
                    <div style={styles.avatar}>
                      {member.profile_picture ? (
                        <img
                          src={`${API_BASE}/${member.profile_picture}`}
                          alt={member.nickname || member.username}
                          style={styles.avatarImg}
                        />
                      ) : (
                        (member.nickname || member.username || "?")[0].toUpperCase()
                      )}
                    </div>

                    <h3 style={styles.username}>{member.nickname || member.username}</h3>

                    {member.nickname && member.username && (
                      <p style={styles.realUsername}>@{member.username}</p>
                    )}

                    {member.country && <p style={styles.country}>🌍 {member.country}</p>}

                    {member.bias && <div style={styles.biasBadge}>💜 {member.bias}</div>}

                    {member.is_admin && <div style={styles.adminBadge}>👑 Admin</div>}

                    <p style={styles.joined}>
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f5ff",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    width: "100%",
    padding: "2rem 3rem",
    flex: 1,
    boxSizing: "border-box",
    maxWidth: "100%",
  },
  tabs: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  tabBtn: {
    padding: "10px 24px",
    border: "1px solid #7c3aed",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
  },
  title: {
    color: "#2d0a4e",
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#7c3aed",
    marginBottom: "1.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1.5rem",
    width: "100%",
  },
  ot7Grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.6rem",
    width: "100%",
  },
  btsCard: {
    borderRadius: "18px",
    padding: "1rem",
    textAlign: "center",
    border: "1px solid #d4b8ff",
    cursor: "pointer",
    overflow: "hidden",
    boxShadow: "0 8px 22px rgba(124, 58, 237, 0.12)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  btsPhotoBox: {
    width: "100%",
    height: "360px",
    borderRadius: "14px",
    overflow: "hidden",
    position: "relative",
    background: "#eee",
    marginBottom: "1rem",
    border: "3px solid white",
    boxShadow: "0 8px 20px rgba(45, 10, 78, 0.18)",
  },
  btsPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
    display: "block",
  },
  photoNameTag: {
    position: "absolute",
    left: "12px",
    top: "12px",
    background: "rgba(45, 10, 78, 0.85)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "1rem",
    letterSpacing: "0.5px",
  },
  memberEmoji: {
    fontSize: "2.2rem",
    marginBottom: "0.25rem",
  },
  btsName: {
    color: "#2d0a4e",
    fontSize: "1.45rem",
    marginBottom: "0.25rem",
  },
  btsRole: {
    color: "#7c3aed",
    fontSize: "0.95rem",
    marginBottom: "0.25rem",
  },
  btsFrom: {
    color: "#777",
    fontSize: "0.9rem",
    marginBottom: "0.75rem",
  },
  viewBtn: {
    color: "#7c3aed",
    fontWeight: "700",
    fontSize: "0.95rem",
  },
  memberDetail: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  backBtn: {
    padding: "8px 16px",
    background: "white",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "8px",
    cursor: "pointer",
    width: "fit-content",
  },
  detailCard: {
    borderRadius: "18px",
    padding: "1.5rem",
    border: "1px solid #d4b8ff",
    boxShadow: "0 8px 22px rgba(124, 58, 237, 0.12)",
  },
  detailHero: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 420px) 1fr",
    gap: "2rem",
    alignItems: "center",
  },
  detailPhotoBox: {
    width: "100%",
    height: "520px",
    borderRadius: "18px",
    overflow: "hidden",
    position: "relative",
    background: "#eee",
    border: "4px solid white",
    boxShadow: "0 10px 28px rgba(45, 10, 78, 0.22)",
  },
  detailPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
    display: "block",
  },
  detailPhotoTag: {
    position: "absolute",
    left: "14px",
    top: "14px",
    background: "rgba(0, 0, 0, 0.78)",
    color: "white",
    padding: "8px 14px",
    borderRadius: "10px",
    fontWeight: "900",
    fontSize: "1.1rem",
  },
  detailTextBox: {
    textAlign: "center",
  },
  detailEmoji: {
    fontSize: "4rem",
    marginBottom: "0.5rem",
  },
  detailName: {
    color: "#2d0a4e",
    fontSize: "2.4rem",
    marginBottom: "0.5rem",
  },
  detailBadge: {
    display: "inline-block",
    padding: "6px 20px",
    background: "#7c3aed",
    color: "white",
    borderRadius: "20px",
    fontSize: "0.95rem",
    marginBottom: "1rem",
  },
  detailInfo: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    color: "#555",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  detailDesc: {
    color: "#444",
    lineHeight: 1.7,
    maxWidth: "700px",
    margin: "0 auto",
    fontSize: "1rem",
  },
  descSection: {
    background: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid #d4b8ff",
  },
  descTitle: {
    color: "#2d0a4e",
    marginBottom: "1rem",
  },
  descCard: {
    background: "#f8f5ff",
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "0.75rem",
    border: "1px solid #e0d0ff",
  },
  descHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
    alignItems: "center",
    marginBottom: "0.7rem",
    flexWrap: "wrap",
  },
  descAuthorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  descAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#7c3aed",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    overflow: "hidden",
    flexShrink: 0,
  },
  descAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  descActions: {
    display: "flex",
    gap: "0.5rem",
  },
  smallEditBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#0ea5e9",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
  },
  smallDeleteBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
  },
  editDescBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  editBtns: {
    display: "flex",
    gap: "0.75rem",
  },
  cancelBtn: {
    padding: "10px",
    borderRadius: "8px",
    background: "#ddd",
    color: "#2d0a4e",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
  },
  descText: {
    color: "#2d0a4e",
    marginBottom: "0.5rem",
    lineHeight: 1.6,
  },
  descAuthor: {
    color: "#7c3aed",
    fontSize: "0.9rem",
    fontWeight: "700",
  },
  descDate: {
    color: "#aaa",
    fontSize: "0.8rem",
  },
  descForm: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  descInput: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "#f8f5ff",
    color: "#2d0a4e",
    fontSize: "1rem",
    resize: "vertical",
  },
  descBtn: {
    padding: "10px",
    borderRadius: "8px",
    background: "#7c3aed",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 190px 230px",
    gap: "1rem",
    marginBottom: "0.75rem",
    alignItems: "end",
  },
  filterBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  filterLabel: {
    color: "#7c3aed",
    fontSize: "0.85rem",
    fontWeight: "700",
  },
  filterSummary: {
    color: "#7c3aed",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
    fontWeight: "600",
  },
  search: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "white",
    color: "#2d0a4e",
    fontSize: "1rem",
  },
  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d4b8ff",
    background: "white",
    color: "#2d0a4e",
    fontSize: "1rem",
  },
  emptyCard: {
    background: "white",
    borderRadius: "12px",
    padding: "3rem",
    textAlign: "center",
    border: "1px solid #d4b8ff",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    border: "1px solid #d4b8ff",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: "bold",
    margin: "0 auto 1rem",
    color: "white",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  username: {
    color: "#2d0a4e",
    marginBottom: "0.25rem",
  },
  realUsername: {
    color: "#9b7cc5",
    fontSize: "0.8rem",
    marginBottom: "0.5rem",
  },
  country: {
    color: "#888",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
  },
  biasBadge: {
    display: "inline-block",
    padding: "4px 14px",
    background: "#f0e6ff",
    color: "#7c3aed",
    borderRadius: "20px",
    fontSize: "0.85rem",
    marginBottom: "0.5rem",
  },
  adminBadge: {
    display: "inline-block",
    padding: "4px 14px",
    background: "#fff3cd",
    color: "#856404",
    borderRadius: "20px",
    fontSize: "0.85rem",
    marginBottom: "0.5rem",
  },
  joined: {
    color: "#aaa",
    fontSize: "0.8rem",
    marginTop: "0.5rem",
  },
};
