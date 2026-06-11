import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));

    API.get("/birthdays/today")
      .then((res) => setTodayBirthdays(res.data || []))
      .catch(() => setTodayBirthdays([]));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const profileImage =
    user?.profile_picture
      ? `http://127.0.0.1:8000/${user.profile_picture}`
      : null;

  return (
    <div style={styles.header}>
      {/* Logo */}
      <img src={logo} alt="Purple Family" style={{ height: "40px" }} />

      {/* Center Navigation */}
      <div style={styles.navCenter}>
        <button onClick={() => navigate("/dashboard")} style={styles.navBtn}>
          🏠 Dashboard
        </button>

        <button onClick={() => navigate("/birthdays")} style={styles.navBtnWithBadge}>
          🎂 Birthdays
          {todayBirthdays.length > 0 && (
            <span style={styles.birthdayBadge}>{todayBirthdays.length}</span>
          )}
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

      {/* Right Side */}
      {user && (
        <div style={styles.navRight}>
          <button
            onClick={() => navigate("/edit-profile")}
            style={styles.profileBtn}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="profile"
                style={styles.profileImage}
              />
            ) : (
              <span style={styles.avatarFallback}>👤</span>
            )}

            <span>Profile</span>
          </button>

          <span style={styles.welcome}>
            Welcome {user.nickname || user.username}! 💜
          </span>

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

  navBtnWithBadge: {
    position: "relative",
    padding: "6px 18px 6px 14px",
    background: "transparent",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },

  birthdayBadge: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    minWidth: "20px",
    height: "20px",
    padding: "0 5px",
    borderRadius: "999px",
    background: "#ef4444",
    color: "white",
    fontSize: "0.72rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
  },

  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    background: "#f0e6ff",
    border: "1px solid #d4b8ff",
    color: "#7c3aed",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },

  profileImage: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #9333ea",
  },

  avatarFallback: {
    fontSize: "1.1rem",
  },

  welcome: {
    color: "#2d0a4e",
    fontWeight: "600",
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