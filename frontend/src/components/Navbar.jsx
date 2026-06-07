import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.header}>
      {/* Left - Logo */}
      <img src={logo} alt="Purple Family" style={{ height: "40px" }} />

      {/* Center - Nav Links */}
      <div style={styles.navCenter}>
        <button onClick={() => navigate("/dashboard")} style={styles.navBtn}>
          🏠 Dashboard
        </button>
        <button onClick={() => navigate("/birthdays")} style={styles.navBtn}>
          🎂 Birthdays
        </button>
        <button onClick={() => navigate("/wallpapers")} style={styles.navBtn}>
          🖼️ Wallpapers
        </button>
        <button onClick={() => navigate("/members")} style={styles.navBtn}>
          👥 Members
        </button>
        <button onClick={() => navigate("/singalong")} style={styles.navBtn}>
          🎵 Sing-Along
        </button>
        <button onClick={() => navigate("/quiz")} style={styles.navBtn}>
          🎮 Quiz
        </button>
      </div>

      {/* Right - Profile, Welcome, Logout */}
      {user && (
        <div style={styles.navRight}>
          <button onClick={() => navigate("/edit-profile")} style={styles.profileBtn}>
            👤 Profile
          </button>
          <span style={styles.welcome}>Welcome {user.username}! 💜</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    background: "white",
    padding: "0.75rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #e0d0ff",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navCenter: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  navBtn: {
    padding: "6px 14px",
    background: "transparent",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  profileBtn: {
    padding: "6px 14px",
    background: "#f0e6ff",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  welcome: {
    color: "#2d0a4e",
    fontWeight: "500",
    fontSize: "0.95rem",
  },
  logoutBtn: {
    padding: "6px 16px",
    background: "transparent",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "20px",
    cursor: "pointer",
  },
};
