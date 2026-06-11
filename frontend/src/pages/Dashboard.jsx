import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import btsHero from "../assets/bts-hero1.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));

    API.get("/birthdays/today")
      .then((res) => setBirthdays(res.data || []))
      .catch(() => setBirthdays([]));

    API.get("/members")
      .then((res) => setMembers(res.data || []))
      .catch(() => setMembers([]));
  }, [navigate]);

  const cards = [
    {
      title: "Birthday Calendar",
      icon: "🎂",
      text: "Celebrate ARMY birthdays and post wishes.",
      path: "/birthdays",
      color: "linear-gradient(135deg,#f472b6,#a855f7)",
    },
    {
      title: "Wallpaper Gallery",
      icon: "🖼️",
      text: "Upload, like and download beautiful BTS wallpapers.",
      path: "/wallpapers",
      color: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    },
    {
      title: "Members",
      icon: "👥",
      text: "See Purple Family members, countries and bias.",
      path: "/members",
      color: "linear-gradient(135deg,#7c3aed,#ec4899)",
    },
    {
      title: "Sing-Along",
      icon: "🎵",
      text: "Add BTS songs, lyrics, albums and YouTube links.",
      path: "/singalong",
      color: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    },
    {
      title: "BTS Quiz",
      icon: "🎮",
      text: "Create quiz topics and test ARMY knowledge.",
      path: "/quiz",
      color: "linear-gradient(135deg,#ec4899,#f97316)",
    },
    {
      title: "Edit Profile",
      icon: "👤",
      text: "Update nickname, profile photo, country and bias.",
      path: "/edit-profile",
      color: "linear-gradient(135deg,#9333ea,#db2777)",
    },
  ];

  const displayName = user?.nickname || user?.username || "ARMY";

  return (
    <>
      <Navbar />

      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.badge}>💜 Welcome back, {displayName}</div>

            <h1 style={styles.title}>
              Your Purple Family dashboard
            </h1>

            <p style={styles.subtitle}>
              Manage birthdays, wallpapers, members, BTS songs, quizzes and your
              ARMY profile from one beautiful place.
            </p>

            <div style={styles.heroActions}>
              <button
                style={styles.primaryBtn}
                onClick={() => navigate("/wallpapers")}
              >
                Explore Wallpapers
              </button>

              <button
                style={styles.secondaryBtn}
                onClick={() => navigate("/quiz")}
              >
                Play Quiz 🎮
              </button>
            </div>
          </div>

          <div style={styles.heroPanel}>
            <h2 style={styles.panelTitle}>SL BTS ARMY</h2>
            <p style={styles.panelText}>
              A soft, modern and loving space for your purple community.
            </p>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <h3 style={styles.statNumber}>{members.length}</h3>
            <p style={styles.statText}>Total Members</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎂</span>
            <h3 style={styles.statNumber}>{birthdays.length}</h3>
            <p style={styles.statText}>Today Birthdays</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>⭐</span>
            <h3 style={styles.statNumber}>OT7</h3>
            <p style={styles.statText}>Forever BTS</p>
          </div>
        </section>

        {birthdays.length > 0 && (
          <section style={styles.birthdayBox}>
            <div>
              <h2 style={styles.boxTitle}>🎉 Today&apos;s Birthday</h2>
              <p style={styles.boxText}>
                Don&apos;t forget to send purple wishes!
              </p>
            </div>

            <div style={styles.birthdayList}>
              {birthdays.map((b) => (
                <span key={b.id} style={styles.birthdayPill}>
                  💜 {b.nickname || b.username}
                </span>
              ))}
            </div>
          </section>
        )}

        <section style={styles.sectionHeader}>
          <p style={styles.kicker}>Explore</p>
          <h2 style={styles.sectionTitle}>What do you want to do?</h2>
        </section>

        <section style={styles.cardGrid}>
          {cards.map((card) => (
            <article key={card.title} style={styles.featureCard}>
              <div style={{ ...styles.cardIcon, background: card.color }}>
                {card.icon}
              </div>

              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardText}>{card.text}</p>

              <button
                style={styles.cardButton}
                onClick={() => navigate(card.path)}
              >
                Open →
              </button>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}

const styles = {
  page: {
    width: "100%",
    padding: "40px clamp(16px, 4vw, 64px)",
  },

  hero: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.35fr 0.75fr",
    gap: "28px",
    alignItems: "stretch",
  },

  heroContent: {
    padding: "54px",
    borderRadius: "34px",
    background:
      "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(243,232,255,0.9))",
    border: "1px solid rgba(124,58,237,0.16)",
    boxShadow: "0 25px 70px rgba(76,29,149,0.14)",
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
    fontSize: "clamp(2.4rem,5vw,4.8rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    color: "#241039",
    maxWidth: "780px",
    marginBottom: "20px",
  },

  subtitle: {
    color: "#6b5a80",
    lineHeight: 1.8,
    fontSize: "1.05rem",
    maxWidth: "650px",
  },

  heroActions: {
    display: "flex",
    gap: "14px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    border: "none",
    borderRadius: "999px",
    padding: "14px 25px",
    cursor: "pointer",
    color: "white",
    fontWeight: 900,
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    boxShadow: "0 16px 32px rgba(124,58,237,0.25)",
  },

  secondaryBtn: {
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "999px",
    padding: "14px 25px",
    cursor: "pointer",
    color: "#5b21b6",
    fontWeight: 900,
    background: "rgba(255,255,255,0.72)",
  },

  heroPanel: {
    minHeight: "330px",
    borderRadius: "34px",
    padding: "34px",
    color: "white",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    border: "1px solid rgba(255,255,255,0.15)",

    backgroundImage: `
    linear-gradient(
      to top,
      rgba(0,0,0,0.75),
      rgba(0,0,0,0.15)
    ),
    url(${btsHero})
  `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 25px 70px rgba(76,29,149,0.18)",
  },

  panelTitle: {
    fontSize: "2rem",
    marginBottom: "10px",
  },

  panelText: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.7,
  },

  statsGrid: {
    width: "min(1280px,100%)",
    margin: "26px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "18px",
  },

  statCard: {
    padding: "26px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  statIcon: {
    fontSize: "2rem",
  },

  statNumber: {
    color: "#4c1d95",
    fontSize: "2.1rem",
    marginTop: "10px",
  },

  statText: {
    color: "#7c6a92",
    fontWeight: 700,
  },

  birthdayBox: {
    width: "min(1280px,100%)",
    margin: "26px auto 0",
    padding: "28px",
    borderRadius: "28px",
    background: "linear-gradient(135deg,#fdf2f8,#f3e8ff)",
    border: "1px solid rgba(236,72,153,0.2)",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  boxTitle: {
    color: "#831843",
    marginBottom: "6px",
  },

  boxText: {
    color: "#9d174d",
  },

  birthdayList: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  birthdayPill: {
    padding: "10px 15px",
    borderRadius: "999px",
    background: "white",
    color: "#7c3aed",
    fontWeight: 900,
  },

  sectionHeader: {
    width: "min(1280px,100%)",
    margin: "55px auto 24px",
  },

  kicker: {
    color: "#ec4899",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontWeight: 900,
    marginBottom: "8px",
  },

  sectionTitle: {
    fontSize: "clamp(2rem,4vw,3.2rem)",
    letterSpacing: "-0.04em",
    color: "#241039",
  },

  cardGrid: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "22px",
  },

  featureCard: {
    padding: "28px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 40px rgba(76,29,149,0.08)",
  },

  cardIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    fontSize: "1.8rem",
    marginBottom: "22px",
    boxShadow: "0 12px 24px rgba(124,58,237,0.22)",
  },

  cardTitle: {
    color: "#4c1d95",
    marginBottom: "10px",
    fontSize: "1.25rem",
  },

  cardText: {
    color: "#7c6a92",
    lineHeight: 1.7,
    marginBottom: "22px",
  },

  cardButton: {
    border: "none",
    background: "#f3e8ff",
    color: "#6d28d9",
    padding: "11px 17px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },
};