import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/logo.svg";

const API_BASE = "https://purple-family-website.onrender.com";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const navigate = useNavigate();

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth <= 700;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };

    window.addEventListener("resize", resize);

    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));

    API.get("/birthdays/today")
      .then((res) => setTodayBirthdays(res.data || []))
      .catch(() => setTodayBirthdays([]));

    return () => window.removeEventListener("resize", resize);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const profileImage = user?.profile_picture
    ? `${API_BASE}/${user.profile_picture}`
    : null;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/birthdays", label: "Birthdays", icon: "🎂", badge: todayBirthdays.length },
    { to: "/wallpapers", label: "Wallpapers", icon: "🖼️" },
    { to: "/members", label: "Members", icon: "👥" },
    { to: "/singalong", label: "Sing-Along", icon: "🎵" },
    { to: "/quiz", label: "Quiz", icon: "🎮" },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.brand} onClick={() => navigate("/dashboard")}>
        <img src={logo} alt="Purple Family" style={styles.logo} />
        <div>
          <strong style={styles.brandTitle}>Purple Family</strong>
          <span style={styles.brandSub}>SL BTS ARMY</span>
        </div>
      </div>

      {isMobile && (
        <button style={styles.menuBtn} onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      )}

      <div
        style={{
          ...styles.mobileMenuWrap,
          ...(isMobile ? {} : styles.desktopWrap),
          ...(isMobile && !open ? { display: "none" } : {}),
        }}
      >
        <nav style={isMobile ? styles.mobileNavCenter : styles.navCenter}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                ...styles.navBtn,
                ...(isMobile ? styles.mobileNavBtn : {}),
                ...(isActive ? styles.activeNavBtn : {}),
              })}
            >
              <span>{link.icon}</span>
              {link.label}
              {link.badge > 0 && <span style={styles.badge}>{link.badge}</span>}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div style={isMobile ? styles.mobileNavRight : styles.navRight}>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/edit-profile");
              }}
              style={isMobile ? styles.mobileProfileBtn : styles.profileBtn}
            >
              {profileImage ? (
                <img src={profileImage} alt="profile" style={styles.profileImage} />
              ) : (
                <span style={styles.avatarFallback}>👤</span>
              )}
              <span>{user.nickname || user.username}</span>
            </button>

            <button onClick={handleLogout} style={isMobile ? styles.mobileLogoutBtn : styles.logoutBtn}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    minHeight: "76px",
    padding: "14px clamp(16px, 4vw, 46px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 12px 35px rgba(76,29,149,0.08)",
    flexWrap: "wrap",
  },

  desktopWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
  },

  mobileMenuWrap: {
    width: "100%",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    minWidth: "190px",
  },

  logo: { width: "44px", height: "44px" },

  brandTitle: {
    display: "block",
    color: "#4c1d95",
    fontSize: "1rem",
    lineHeight: 1.1,
  },

  brandSub: {
    color: "#8b5cf6",
    fontSize: "0.75rem",
    fontWeight: 700,
  },

  navCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  mobileNavCenter: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    width: "100%",
  },

  navBtn: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px 14px",
    borderRadius: "999px",
    color: "#5b21b6",
    fontWeight: 700,
    fontSize: "0.88rem",
    border: "1px solid rgba(124,58,237,0.14)",
    background: "rgba(255,255,255,0.55)",
    textDecoration: "none",
  },

  mobileNavBtn: {
    width: "100%",
    borderRadius: "16px",
    padding: "13px 14px",
  },

  activeNavBtn: {
    color: "white",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    boxShadow: "0 10px 22px rgba(124,58,237,0.24)",
  },

  badge: {
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: "999px",
    background: "#ef4444",
    color: "white",
    fontSize: "0.72rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "210px",
    justifyContent: "flex-end",
  },

  mobileNavRight: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginTop: "10px",
    width: "100%",
  },

  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "rgba(255,255,255,0.75)",
    color: "#4c1d95",
    borderRadius: "999px",
    padding: "7px 12px",
    cursor: "pointer",
    fontWeight: 800,
  },

  mobileProfileBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "rgba(255,255,255,0.75)",
    color: "#4c1d95",
    borderRadius: "16px",
    padding: "13px 14px",
    cursor: "pointer",
    fontWeight: 800,
  },

  profileImage: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #a855f7",
  },

  avatarFallback: { fontSize: "1.1rem" },

  logoutBtn: {
    border: "none",
    background: "#241039",
    color: "white",
    borderRadius: "999px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: 800,
  },

  mobileLogoutBtn: {
    width: "100%",
    border: "none",
    background: "#241039",
    color: "white",
    borderRadius: "16px",
    padding: "13px 14px",
    cursor: "pointer",
    fontWeight: 800,
  },

  menuBtn: {
    border: "1px solid rgba(124,58,237,0.18)",
    background: "white",
    color: "#4c1d95",
    borderRadius: "14px",
    padding: "9px 13px",
    fontSize: "1.15rem",
    cursor: "pointer",
    fontWeight: 900,
  },
};