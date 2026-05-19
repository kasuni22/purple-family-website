import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Birthdays() {
  const [birthdays, setBirthdays] = useState([]);
  const [today, setToday] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    setToday(`${now.getMonth() + 1}/${now.getDate()}`);
    API.get("/birthdays").then(res => setBirthdays(res.data))
      .catch(() => navigate("/login"));
  }, []);

  const isBirthdayToday = (birthday) => {
    const date = new Date(birthday);
    const now = new Date();
    return date.getMonth() === now.getMonth() && 
           date.getDate() === now.getDate();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const sortedBirthdays = [...birthdays].sort((a, b) => {
    const now = new Date();
    const dateA = new Date(a.birthday);
    const dateB = new Date(b.birthday);
    const nextA = new Date(now.getFullYear(), dateA.getMonth(), dateA.getDate());
    const nextB = new Date(now.getFullYear(), dateB.getMonth(), dateB.getDate());
    if (nextA < now) nextA.setFullYear(now.getFullYear() + 1);
    if (nextB < now) nextB.setFullYear(now.getFullYear() + 1);
    return nextA - nextB;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>💜 Purple Family</h1>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>🎂 ARMY Birthday Calendar</h2>
        <p style={styles.subtitle}>Today is {today} 💜</p>

        {birthdays.length === 0 ? (
          <div style={styles.card}>
            <p style={{color: "#ccc", textAlign: "center"}}>
              No birthdays yet! Update your profile to add yours 💜
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {sortedBirthdays.map((member, index) => (
              <div key={index} style={{
                ...styles.card,
                border: isBirthdayToday(member.birthday) 
                  ? "2px solid gold" : "1px solid #7c3aed"
              }}>
                {isBirthdayToday(member.birthday) && (
                  <div style={styles.todayBadge}>🎉 Today!</div>
                )}
                <div style={styles.avatar}>
                  {member.username[0].toUpperCase()}
                </div>
                <h3 style={styles.username}>{member.username}</h3>
                <p style={styles.date}>🎂 {formatDate(member.birthday)}</p>
                {member.bias && (
                  <p style={styles.bias}>💜 Bias: {member.bias}</p>
                )}
                {isBirthdayToday(member.birthday) && (
                  <p style={styles.wish}>Happy Birthday! 🎉💜</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#1a0533" },
  header: { background: "#2d0a4e", padding: "1rem 2rem", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    borderBottom: "2px solid #7c3aed" },
  logo: { color: "#b39ddb", margin: 0 },
  backBtn: { padding: "8px 16px", background: "transparent",
    border: "1px solid #b39ddb", color: "#b39ddb",
    borderRadius: "6px", cursor: "pointer" },
  content: { maxWidth: "1000px", margin: "2rem auto", padding: "0 1rem" },
  title: { color: "#b39ddb", fontSize: "2rem", marginBottom: "0.5rem" },
  subtitle: { color: "#ccc", marginBottom: "2rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1.5rem" },
  card: { background: "#2d0a4e", borderRadius: "12px", padding: "1.5rem",
    textAlign: "center", position: "relative" },
  todayBadge: { position: "absolute", top: "-12px", left: "50%",
    transform: "translateX(-50%)", background: "gold", color: "#1a0533",
    padding: "2px 12px", borderRadius: "20px", fontSize: "0.8rem",
    fontWeight: "bold" },
  avatar: { width: "60px", height: "60px", borderRadius: "50%",
    background: "#7c3aed", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold",
    margin: "0 auto 1rem", color: "white" },
  username: { color: "white", marginBottom: "0.5rem" },
  date: { color: "#b39ddb", marginBottom: "0.5rem" },
  bias: { color: "#ccc", fontSize: "0.9rem" },
  wish: { color: "gold", marginTop: "0.5rem", fontWeight: "bold" }
};