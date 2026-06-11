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
  { name: "RM", emoji: "🐨", photo: rmImg, role: "Leader & Rapper", born: "September 12, 1994", from: "Ilsan, South Korea", desc: "Kim Namjoon is BTS's leader and the voice of the group. A deep thinker, art lover, and self-taught English speaker with incredible lyrical skills." },
  { name: "Jin", emoji: "🐹", photo: jinImg, role: "Vocalist", born: "December 4, 1992", from: "Gwacheon, South Korea", desc: "Kim Seokjin, known as Jin, is BTS's oldest member and worldwide handsome. Known for his dad jokes, pink princess energy, and powerful vocals." },
  { name: "Suga", emoji: "🐱", photo: sugaImg, role: "Rapper & Producer", born: "March 9, 1993", from: "Daegu, South Korea", desc: "Min Yoongi, known as Suga or Agust D, is a genius producer and rapper loved for honest, emotional lyrics." },
  { name: "J-Hope", emoji: "🐿️", photo: jhopeImg, role: "Rapper & Dancer", born: "February 18, 1994", from: "Gwangju, South Korea", desc: "Jung Hoseok is BTS's sunshine, known for incredible dancing, bright energy and powerful rap." },
  { name: "Jimin", emoji: "🐥", photo: jiminImg, role: "Vocalist & Dancer", born: "October 13, 1995", from: "Busan, South Korea", desc: "Park Jimin is known for stunning dance skills, sweet vocals and charming personality." },
  { name: "Taehyung", emoji: "🐯", photo: vImg, role: "Vocalist", born: "December 30, 1995", from: "Daegu, South Korea", desc: "Kim Taehyung, also known as V, is loved for his deep voice, artistic soul and unique personality." },
  { name: "Jungkook", emoji: "🐰", photo: jungkookImg, role: "Main Vocalist", born: "September 1, 1997", from: "Busan, South Korea", desc: "Jeon Jungkook is the Golden Maknae, talented in singing, dancing, drawing, sports and more." },
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
    const res = await API.get("/bts-descriptions");
    groupDescriptions(res.data || []);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [meRes, membersRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/members"),
        ]);

        setCurrentUser(meRes.data);
        setMembers(membersRes.data || []);
        await loadDescriptions();
      } catch {
        navigate("/login");
      }
    };

    loadPageData();
  }, [navigate]);

  const filtered = members
    .filter((m) => {
      const displayName = `${m.nickname || ""} ${m.username || ""} ${m.country || ""}`.toLowerCase();
      const matchSearch = displayName.includes(search.toLowerCase());
      const matchBias = filterBias === "All" || m.bias === filterBias;
      return matchSearch && matchBias;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      if (sortOrder === "newest") return dateB - dateA;
      if (sortOrder === "oldest") return dateA - dateB;

      return (a.nickname || a.username || "").localeCompare(b.nickname || b.username || "");
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
    } catch {
      alert("Description save failed");
    }
  };

  const saveEditDesc = async (descriptionId) => {
    if (!editingText.trim()) return;

    try {
      const formData = new FormData();
      formData.append("content", editingText.trim());

      await API.put(`/bts-descriptions/${descriptionId}`, formData);
      setEditingDescId(null);
      setEditingText("");
      await loadDescriptions();
    } catch {
      alert("Description update failed");
    }
  };

  const deleteDesc = async (descriptionId) => {
    if (!window.confirm("Delete this ARMY description?")) return;

    try {
      await API.delete(`/bts-descriptions/${descriptionId}`);
      await loadDescriptions();
    } catch {
      alert("Only admin can delete descriptions");
    }
  };

  const getAuthorPhoto = (desc) =>
    desc.created_by_profile_picture ? `${API_BASE}/${desc.created_by_profile_picture}` : null;

  const getAuthorName = (desc) =>
    desc.created_by_nickname || desc.created_by_username || "ARMY";

  return (
    <>
      <Navbar />

      <main style={styles.page}>
        <section style={styles.hero}>
          <div>
            <div style={styles.badge}>👥 Purple Family Members</div>
            <h1 style={styles.title}>Meet OT7 and our SL ARMY family</h1>
            <p style={styles.subtitle}>
              Learn about BTS members, share your thoughts, and discover ARMY
              friends by bias, country and join date.
            </p>
          </div>

          <div style={styles.heroCard}>
            <span style={styles.heroIcon}>💜</span>
            <h2>{members.length}</h2>
            <p>Total Members</p>
          </div>
        </section>

        <section style={styles.tabs}>
          <button
            onClick={() => {
              setActiveTab("ot7");
              setSelectedMember(null);
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "ot7" ? styles.activeTab : {}),
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
              ...(activeTab === "army" ? styles.activeTab : {}),
            }}
          >
            👥 SL ARMY Family
          </button>
        </section>

        {activeTab === "ot7" && (
          <section style={styles.panel}>
            {!selectedMember ? (
              <>
                <div style={styles.sectionHead}>
                  <div>
                    <h2 style={styles.sectionTitle}>Know About OT7</h2>
                    <p style={styles.sectionText}>
                      Beautiful BTS member cards with ARMY descriptions.
                    </p>
                  </div>
                </div>

                <div style={styles.ot7Grid}>
                  {BTS_MEMBERS.map((m) => (
                    <article
                      key={m.name}
                      style={styles.btsCard}
                      onClick={() => setSelectedMember(m)}
                    >
                      <div style={styles.btsPhotoBox}>
                        <img src={m.photo} alt={m.name} style={styles.btsPhoto} />
                        <span style={styles.photoTag}>{m.name}</span>
                      </div>

                      <div style={styles.btsInfo}>
                        <span style={styles.memberEmoji}>{m.emoji}</span>
                        <h3 style={styles.btsName}>{m.name}</h3>
                        <p style={styles.btsRole}>{m.role}</p>
                        <p style={styles.btsFrom}>📍 {m.from}</p>
                        <button style={styles.viewBtn}>View Profile →</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <section style={styles.memberDetail}>
                <button
                  onClick={() => setSelectedMember(null)}
                  style={styles.backBtn}
                >
                  ← Back to OT7
                </button>

                <div style={styles.detailCard}>
                  <div style={styles.detailPhotoBox}>
                    <img
                      src={selectedMember.photo}
                      alt={selectedMember.name}
                      style={styles.detailPhoto}
                    />
                  </div>

                  <div style={styles.detailContent}>
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

                <div style={styles.descSection}>
                  <h3 style={styles.descTitle}>
                    💜 What ARMY says about {selectedMember.name}
                  </h3>

                  {(descriptions[selectedMember.name] || []).length === 0 ? (
                    <div style={styles.emptyMini}>No descriptions yet. Be the first 💜</div>
                  ) : (
                    (descriptions[selectedMember.name] || []).map((d) => (
                      <article key={d.id} style={styles.descCard}>
                        <div style={styles.descHeader}>
                          <div style={styles.authorBox}>
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
                              <strong style={styles.descAuthor}>
                                {getAuthorName(d)}
                              </strong>
                              <p style={styles.descDate}>
                                {new Date(d.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div style={styles.descActions}>
                            {d.can_edit && editingDescId !== d.id && (
                              <button
                                style={styles.smallEditBtn}
                                onClick={() => {
                                  setEditingDescId(d.id);
                                  setEditingText(d.content);
                                }}
                              >
                                Edit
                              </button>
                            )}

                            {d.can_delete && (
                              <button
                                style={styles.smallDeleteBtn}
                                onClick={() => deleteDesc(d.id)}
                              >
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
                              <button
                                style={styles.descBtn}
                                onClick={() => saveEditDesc(d.id)}
                              >
                                Save
                              </button>

                              <button
                                style={styles.cancelBtn}
                                onClick={() => {
                                  setEditingDescId(null);
                                  setEditingText("");
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={styles.descText}>{d.content}</p>
                        )}
                      </article>
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
                      Add Description 💜
                    </button>
                  </div>
                </div>
              </section>
            )}
          </section>
        )}

        {activeTab === "army" && (
          <section style={styles.panel}>
            <div style={styles.sectionHead}>
              <div>
                <h2 style={styles.sectionTitle}>Our SL ARMY Family</h2>
                <p style={styles.sectionText}>
                  Showing {filtered.length} of {members.length} members.
                </p>
              </div>
            </div>

            <div style={styles.controls}>
              <input
                style={styles.search}
                placeholder="Search name, nickname or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                style={styles.select}
                value={filterBias}
                onChange={(e) => setFilterBias(e.target.value)}
              >
                {biasOptions.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>

              <select
                style={styles.select}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div style={styles.emptyMini}>No members found 💜</div>
            ) : (
              <div style={styles.armyGrid}>
                {filtered.map((member) => (
                  <article key={member.id} style={styles.armyCard}>
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

                    <h3 style={styles.username}>
                      {member.nickname || member.username}
                    </h3>

                    {member.nickname && member.username && (
                      <p style={styles.realUsername}>@{member.username}</p>
                    )}

                    {member.country && (
                      <p style={styles.country}>🌍 {member.country}</p>
                    )}

                    <div style={styles.pills}>
                      {member.bias && (
                        <span style={styles.biasBadge}>💜 {member.bias}</span>
                      )}

                      {member.is_admin && (
                        <span style={styles.adminBadge}>👑 Admin</span>
                      )}
                    </div>

                    <p style={styles.joined}>
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </>
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

  tabs: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  tabBtn: {
    border: "1px solid rgba(124,58,237,0.18)",
    background: "rgba(255,255,255,0.82)",
    color: "#6d28d9",
    padding: "12px 20px",
    borderRadius: "999px",
    fontWeight: 900,
    cursor: "pointer",
  },

  activeTab: {
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    boxShadow: "0 14px 28px rgba(124,58,237,0.22)",
  },

  panel: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
  },

  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  sectionTitle: {
    color: "#241039",
    fontSize: "clamp(1.7rem,3vw,2.5rem)",
    letterSpacing: "-0.04em",
    marginBottom: "6px",
  },

  sectionText: {
    color: "#7c6a92",
  },

  ot7Grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))",
    gap: "22px",
  },

  btsCard: {
    overflow: "hidden",
    borderRadius: "30px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 42px rgba(76,29,149,0.1)",
    cursor: "pointer",
  },

  btsPhotoBox: {
    position: "relative",
    height: "350px",
    background: "#f3e8ff",
  },

  btsPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
  },

  photoTag: {
    position: "absolute",
    top: "14px",
    left: "14px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.86)",
    color: "#6d28d9",
    fontWeight: 900,
  },

  btsInfo: {
    padding: "22px",
    textAlign: "center",
  },

  memberEmoji: {
    fontSize: "2.4rem",
  },

  btsName: {
    color: "#4c1d95",
    fontSize: "1.45rem",
    marginTop: "8px",
  },

  btsRole: {
    color: "#7c3aed",
    fontWeight: 800,
    marginTop: "4px",
  },

  btsFrom: {
    color: "#7c6a92",
    marginTop: "8px",
  },

  viewBtn: {
    marginTop: "16px",
    border: "none",
    borderRadius: "999px",
    padding: "10px 16px",
    background: "#f3e8ff",
    color: "#6d28d9",
    fontWeight: 900,
    cursor: "pointer",
  },

  memberDetail: {
    display: "grid",
    gap: "20px",
  },

  backBtn: {
    width: "fit-content",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "999px",
    background: "white",
    color: "#6d28d9",
    padding: "11px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },

  detailCard: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "28px",
    padding: "24px",
    borderRadius: "32px",
    background: "linear-gradient(135deg,#f3e8ff,#fdf2f8)",
    border: "1px solid rgba(124,58,237,0.16)",
  },

  detailPhotoBox: {
    height: "520px",
    borderRadius: "26px",
    overflow: "hidden",
    boxShadow: "0 18px 42px rgba(76,29,149,0.14)",
  },

  detailPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
  },

  detailContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  detailEmoji: {
    fontSize: "4rem",
    marginBottom: "8px",
  },

  detailName: {
    color: "#241039",
    fontSize: "clamp(2.4rem,5vw,4rem)",
    letterSpacing: "-0.05em",
    marginBottom: "10px",
  },

  detailBadge: {
    width: "fit-content",
    padding: "9px 16px",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    fontWeight: 900,
    marginBottom: "16px",
  },

  detailInfo: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    color: "#6b5a80",
    marginBottom: "18px",
  },

  detailDesc: {
    color: "#4b3b5f",
    lineHeight: 1.8,
    maxWidth: "720px",
  },

  descSection: {
    padding: "24px",
    borderRadius: "30px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
  },

  descTitle: {
    color: "#4c1d95",
    marginBottom: "16px",
  },

  descCard: {
    padding: "18px",
    borderRadius: "22px",
    background: "#faf7ff",
    border: "1px solid rgba(124,58,237,0.12)",
    marginBottom: "14px",
  },

  descHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },

  authorBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  descAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    overflow: "hidden",
  },

  descAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  descAuthor: {
    color: "#4c1d95",
  },

  descDate: {
    color: "#9ca3af",
    fontSize: "0.85rem",
  },

  descActions: {
    display: "flex",
    gap: "8px",
  },

  smallEditBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "8px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },

  smallDeleteBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "8px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },

  descText: {
    color: "#4b3b5f",
    lineHeight: 1.7,
  },

  descForm: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
  },

  editDescBox: {
    display: "grid",
    gap: "12px",
  },

  editBtns: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  descInput: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    outline: "none",
    resize: "vertical",
  },

  descBtn: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },

  cancelBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#e5e7eb",
    color: "#374151",
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },

  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 200px 210px",
    gap: "14px",
    marginBottom: "24px",
  },

  search: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
    background: "white",
  },

  select: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
    background: "white",
    color: "#4c1d95",
    fontWeight: 800,
  },

  armyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
    gap: "20px",
  },

  armyCard: {
    padding: "26px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    textAlign: "center",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
  },

  avatar: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    fontSize: "1.8rem",
    fontWeight: 900,
    overflow: "hidden",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  username: {
    color: "#4c1d95",
    marginBottom: "4px",
  },

  realUsername: {
    color: "#9b7cc5",
    fontSize: "0.85rem",
    marginBottom: "8px",
  },

  country: {
    color: "#7c6a92",
    marginBottom: "12px",
  },

  pills: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  biasBadge: {
    padding: "7px 12px",
    background: "#f3e8ff",
    color: "#6d28d9",
    borderRadius: "999px",
    fontSize: "0.84rem",
    fontWeight: 900,
  },

  adminBadge: {
    padding: "7px 12px",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "999px",
    fontSize: "0.84rem",
    fontWeight: 900,
  },

  joined: {
    color: "#9ca3af",
    fontSize: "0.82rem",
    marginTop: "14px",
  },

  emptyMini: {
    padding: "36px",
    borderRadius: "24px",
    background: "#faf7ff",
    color: "#7c6a92",
    textAlign: "center",
  },
};