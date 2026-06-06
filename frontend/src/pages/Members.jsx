import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBias, setFilterBias] = useState("All");
  const navigate = useNavigate();

  const biasOptions = ["All", "Jin", "Suga", "J-Hope", "RM", "Jimin", "Taehyung", "Jungkook"];

  useEffect(() => {
    API.get("/members").then(res => setMembers(res.data))
      .catch(() => navigate("/login"));
  }, []);

  const filtered = members.filter(m => {
    const matchSearch = m.username.toLowerCase().includes(search.toLowerCase()) ||
      (m.country && m.country.toLowerCase().includes(search.toLowerCase()));
    const matchBias = filterBias === "All" || m.bias === filterBias;
    return matchSearch && matchBias;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img src={logo} alt="Purple Family" style={{height: "40px"}} />
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>👥 Our ARMY Family</h2>
        <p style={styles.subtitle}>{members.length} members and growing! 💜</p>

        {/* Search & Filter */}
        <div style={styles.controls}>
          <input style={styles.search} placeholder="Search by name or country..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Bias Filter */}
        <div style={styles.filters}>
          {biasOptions.map(b => (
            <button key={b} onClick={() => setFilterBias(b)}
              style={{...styles.filterBtn,
                background: filterBias === b ? "#7c3aed" : "white",
                color: filterBias === b ? "white" : "#7c3aed",
                border: "1px solid #7c3aed"
              }}>
              {b}
            </button>
          ))}
        </div>

        {/* Members Grid */}
        {filtered.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={{color: "#888"}}>No members found 💜</p>
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
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff" },
  header: { background: "#ffffff", padding: "1rem 2rem", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    borderBottom: "2px solid #e0d0ff" },
  logo: { color: "#7c3aed", margin: 0 },
  backBtn: { padding: "8px 16px", background: "white",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "6px", cursor: "pointer" },
  content: { maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem" },
  title: { color: "#2d0a4e", fontSize: "2rem", marginBottom: "0.5rem" },
  subtitle: { color: "#7c3aed", marginBottom: "1.5rem" },
  controls: { marginBottom: "1rem" },
  search: { width: "100%", padding: "12px", borderRadius: "8px",
    border: "1px solid #d4b8ff", background: "white",
    color: "#2d0a4e", fontSize: "1rem" },
  filters: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" },
  filterBtn: { padding: "6px 16px", borderRadius: "20px",
    cursor: "pointer", fontSize: "0.9rem" },
  emptyCard: { background: "white", borderRadius: "12px", padding: "3rem",
    textAlign: "center", border: "1px solid #d4b8ff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1.5rem" },
  card: { background: "white", borderRadius: "12px", padding: "1.5rem",
    textAlign: "center", border: "1px solid #d4b8ff" },
  avatar: { width: "64px", height: "64px", borderRadius: "50%",
    background: "#7c3aed", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "1.8rem", fontWeight: "bold",
    margin: "0 auto 1rem", color: "white" },
  username: { color: "#2d0a4e", marginBottom: "0.5rem" },
  country: { color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem" },
  biasBadge: { display: "inline-block", padding: "4px 14px",
    background: "#f0e6ff", color: "#7c3aed", borderRadius: "20px",
    fontSize: "0.85rem", marginBottom: "0.5rem" },
  adminBadge: { display: "inline-block", padding: "4px 14px",
    background: "#fff3cd", color: "#856404", borderRadius: "20px",
    fontSize: "0.85rem", marginBottom: "0.5rem" },
  joined: { color: "#aaa", fontSize: "0.8rem", marginTop: "0.5rem" }
};