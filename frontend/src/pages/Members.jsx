import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BTS_MEMBERS = [
  {
    name: "Jin", emoji: "🐹", role: "Vocalist",
    born: "December 4, 1992", from: "Gwacheon, South Korea",
    desc: "Kim Seokjin, known as Jin, is BTS's oldest member and worldwide handsome! Known for his dad jokes, pink princess energy, and powerful vocals.",
    color: "#ffe0e0"
  },
  {
    name: "Suga", emoji: "🐱", role: "Rapper & Producer",
    born: "March 9, 1993", from: "Daegu, South Korea",
    desc: "Min Yoongi, known as Suga or Agust D. A genius music producer and rapper known for his honest, emotional lyrics and sleepy cat energy.",
    color: "#e0e8ff"
  },
  {
    name: "J-Hope", emoji: "🐿️", role: "Rapper & Dancer",
    born: "February 18, 1994", from: "Gwangju, South Korea",
    desc: "Jung Hoseok is BTS's sunshine! Known for his incredible dancing, bright energy, and powerful rap. He is your hope, he is J-Hope!",
    color: "#fff8e0"
  },
  {
    name: "RM", emoji: "🐨", role: "Leader & Rapper",
    born: "September 12, 1994", from: "Ilsan, South Korea",
    desc: "Kim Namjoon is BTS's leader and the voice of the group. A deep thinker, art lover, and self-taught English speaker with incredible lyrical skills.",
    color: "#e8f5e0"
  },
  {
    name: "Jimin", emoji: "🐥", role: "Vocalist & Dancer",
    born: "October 13, 1995", from: "Busan, South Korea",
    desc: "Park Jimin is known for his stunning dance skills, sweet vocals, and charming personality. He puts his heart into every performance.",
    color: "#f0e0ff"
  },
  {
    name: "Taehyung", emoji: "🐯", role: "Vocalist",
    born: "December 30, 1995", from: "Daegu, South Korea",
    desc: "Kim Taehyung, also known as V, is known for his deep baritone voice, artistic soul, and unique 4D personality. A true renaissance man.",
    color: "#e0f5ff"
  },
  {
    name: "Jungkook", emoji: "🐰", role: "Main Vocalist",
    born: "September 1, 1997", from: "Busan, South Korea",
    desc: "Jeon Jungkook is the Golden Maknae — the youngest member who excels at everything. Singing, dancing, drawing, sports — he does it all!",
    color: "#fff0e0"
  },
];

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBias, setFilterBias] = useState("All");
  const [activeTab, setActiveTab] = useState("ot7");
  const [selectedMember, setSelectedMember] = useState(null);
  const [descriptions, setDescriptions] = useState({});
  const [newDesc, setNewDesc] = useState("");
  const navigate = useNavigate();

  const biasOptions = ["All", "Jin", "Suga", "J-Hope", "RM", "Jimin", "Taehyung", "Jungkook"];

  useEffect(() => {
    API.get("/members").then(res => setMembers(res.data))
      .catch(() => navigate("/login"));
    const saved = JSON.parse(localStorage.getItem("bts_descriptions") || "{}");
    setDescriptions(saved);
  }, []);

  const filtered = members.filter(m => {
    const matchSearch = m.username.toLowerCase().includes(search.toLowerCase()) ||
      (m.country && m.country.toLowerCase().includes(search.toLowerCase()));
    const matchBias = filterBias === "All" || m.bias === filterBias;
    return matchSearch && matchBias;
  });

  const handleAddDesc = (memberName) => {
    if (!newDesc.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first!");
    const updated = {
      ...descriptions,
      [memberName]: [
        ...(descriptions[memberName] || []),
        { text: newDesc, author: "You", date: new Date().toLocaleDateString() }
      ]
    };
    setDescriptions(updated);
    localStorage.setItem("bts_descriptions", JSON.stringify(updated));
    setNewDesc("");
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button onClick={() => setActiveTab("ot7")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "ot7" ? "#7c3aed" : "white",
              color: activeTab === "ot7" ? "white" : "#7c3aed"
            }}>
            💜 Know About OT7
          </button>
          <button onClick={() => setActiveTab("army")}
            style={{
              ...styles.tabBtn,
              background: activeTab === "army" ? "#7c3aed" : "white",
              color: activeTab === "army" ? "white" : "#7c3aed"
            }}>
            👥 SL ARMY Family
          </button>
        </div>

        {/* ── TAB 1: OT7 ── */}
        {activeTab === "ot7" && (
          <>
            <h2 style={styles.title}>💜 Know About OT7</h2>
            <p style={styles.subtitle}>Learn about all 7 BTS members 💜</p>

            {!selectedMember ? (
              <div style={styles.grid}>
                {BTS_MEMBERS.map((m, i) => (
                  <div key={i} style={{ ...styles.btsCard, background: m.color }}
                    onClick={() => setSelectedMember(m)}>
                    <div style={styles.btsEmoji}>{m.emoji}</div>
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
                  <div style={styles.detailEmoji}>{selectedMember.emoji}</div>
                  <h2 style={styles.detailName}>{selectedMember.name}</h2>
                  <div style={styles.detailBadge}>{selectedMember.role}</div>
                  <div style={styles.detailInfo}>
                    <span>🎂 {selectedMember.born}</span>
                    <span>📍 {selectedMember.from}</span>
                  </div>
                  <p style={styles.detailDesc}>{selectedMember.desc}</p>
                </div>

                {/* ARMY Descriptions */}
                <div style={styles.descSection}>
                  <h3 style={styles.descTitle}>💜 What ARMY says about {selectedMember.name}</h3>
                  {(descriptions[selectedMember.name] || []).length === 0 ? (
                    <p style={{ color: "#888" }}>No descriptions yet! Be the first 💜</p>
                  ) : (
                    (descriptions[selectedMember.name] || []).map((d, i) => (
                      <div key={i} style={styles.descCard}>
                        <p style={styles.descText}>{d.text}</p>
                        <div style={styles.descFooter}>
                          <span style={styles.descAuthor}>💜 {d.author}</span>
                          <span style={styles.descDate}>{d.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div style={styles.descForm}>
                    <textarea style={styles.descInput}
                      placeholder={`Share your thoughts about ${selectedMember.name} 💜`}
                      value={newDesc} rows={3}
                      onChange={e => setNewDesc(e.target.value)} />
                    <button style={styles.descBtn}
                      onClick={() => handleAddDesc(selectedMember.name)}>
                      Add 💜
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: SL ARMY Members ── */}
        {activeTab === "army" && (
          <>
            <h2 style={styles.title}>👥 Our SL ARMY Family</h2>
            <p style={styles.subtitle}>{members.length} members and growing! 💜</p>

            <div style={styles.controls}>
              <input style={styles.search} placeholder="Search by name or country..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <select style={styles.select} value={filterBias}
                onChange={e => setFilterBias(e.target.value)}>
                {biasOptions.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={{ color: "#888" }}>No members found 💜</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {filtered.map(member => (
                  <div key={member.id} style={styles.card}>
                    <div style={styles.avatar}>
                      {member.username[0].toUpperCase()}
                    </div>
                    <h3 style={styles.username}>{member.username}</h3>
                    {member.country && (
                      <p style={styles.country}>🌍 {member.country}</p>
                    )}
                    {member.bias && (
                      <div style={styles.biasBadge}>💜 {member.bias}</div>
                    )}
                    {member.is_admin && (
                      <div style={styles.adminBadge}>👑 Admin</div>
                    )}
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
    minHeight: "100vh", background: "#f8f5ff",
    display: "flex", flexDirection: "column"
  },
  content: {
    width: "100%",
    padding: "2rem 3rem",
    flex: 1,
    boxSizing: "border-box",
    maxWidth: "100%"
  },
  tabs: { display: "flex", gap: "1rem", marginBottom: "2rem" },
  tabBtn: {
    padding: "10px 24px", border: "1px solid #7c3aed",
    borderRadius: "20px", cursor: "pointer", fontSize: "1rem",
    fontWeight: "500"
  },
  title: { color: "#2d0a4e", fontSize: "2rem", marginBottom: "0.5rem" },
  subtitle: { color: "#7c3aed", marginBottom: "1.5rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1.5rem", width: "100%"
  },
  btsCard: {
    borderRadius: "12px", padding: "1.5rem", textAlign: "center",
    border: "1px solid #e0d0ff", cursor: "pointer"
  },
  btsEmoji: { fontSize: "3rem", marginBottom: "0.5rem" },
  btsName: { color: "#2d0a4e", fontSize: "1.3rem", marginBottom: "0.25rem" },
  btsRole: { color: "#7c3aed", fontSize: "0.9rem", marginBottom: "0.25rem" },
  btsFrom: { color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem" },
  viewBtn: { color: "#7c3aed", fontWeight: "500", fontSize: "0.9rem" },
  memberDetail: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  backBtn: {
    padding: "8px 16px", background: "white",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "8px", cursor: "pointer", width: "fit-content"
  },
  detailCard: {
    borderRadius: "16px", padding: "2rem", textAlign: "center",
    border: "1px solid #e0d0ff"
  },
  detailEmoji: { fontSize: "5rem", marginBottom: "1rem" },
  detailName: { color: "#2d0a4e", fontSize: "2rem", marginBottom: "0.5rem" },
  detailBadge: {
    display: "inline-block", padding: "6px 20px",
    background: "#7c3aed", color: "white", borderRadius: "20px",
    fontSize: "0.9rem", marginBottom: "1rem"
  },
  detailInfo: {
    display: "flex", justifyContent: "center", gap: "2rem",
    color: "#555", marginBottom: "1rem"
  },
  detailDesc: {
    color: "#444", lineHeight: 1.7, maxWidth: "600px",
    margin: "0 auto"
  },
  descSection: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    border: "1px solid #d4b8ff"
  },
  descTitle: { color: "#2d0a4e", marginBottom: "1rem" },
  descCard: {
    background: "#f8f5ff", borderRadius: "8px", padding: "1rem",
    marginBottom: "0.75rem", border: "1px solid #e0d0ff"
  },
  descText: { color: "#2d0a4e", marginBottom: "0.5rem", lineHeight: 1.6 },
  descFooter: { display: "flex", justifyContent: "space-between" },
  descAuthor: { color: "#7c3aed", fontSize: "0.85rem", fontWeight: "500" },
  descDate: { color: "#aaa", fontSize: "0.8rem" },
  descForm: {
    display: "flex", flexDirection: "column", gap: "0.75rem",
    marginTop: "1rem"
  },
  descInput: {
    padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff",
    background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem", resize: "vertical"
  },
  descBtn: {
    padding: "10px", borderRadius: "8px", background: "#7c3aed",
    color: "white", fontSize: "1rem", cursor: "pointer", border: "none"
  },
  controls: { display: "flex", gap: "1rem", marginBottom: "1.5rem" },
  search: {
    flex: 1, padding: "12px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "white",
    color: "#2d0a4e", fontSize: "1rem"
  },
  select: {
    padding: "12px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "white",
    color: "#2d0a4e", fontSize: "1rem"
  },
  emptyCard: {
    background: "white", borderRadius: "12px", padding: "3rem",
    textAlign: "center", border: "1px solid #d4b8ff"
  },
  card: {
    background: "white", borderRadius: "12px", padding: "1.5rem",
    textAlign: "center", border: "1px solid #d4b8ff"
  },
  avatar: {
    width: "64px", height: "64px", borderRadius: "50%",
    background: "#7c3aed", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "1.8rem", fontWeight: "bold",
    margin: "0 auto 1rem", color: "white"
  },
  username: { color: "#2d0a4e", marginBottom: "0.5rem" },
  country: { color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem" },
  biasBadge: {
    display: "inline-block", padding: "4px 14px",
    background: "#f0e6ff", color: "#7c3aed", borderRadius: "20px",
    fontSize: "0.85rem", marginBottom: "0.5rem"
  },
  adminBadge: {
    display: "inline-block", padding: "4px 14px",
    background: "#fff3cd", color: "#856404", borderRadius: "20px",
    fontSize: "0.85rem", marginBottom: "0.5rem"
  },
  joined: { color: "#aaa", fontSize: "0.8rem", marginTop: "0.5rem" },
  footer: { background: "#2d0a4e", padding: "1.5rem", textAlign: "center" },
  footerText: { color: "#b39ddb", fontSize: "0.9rem" },
};