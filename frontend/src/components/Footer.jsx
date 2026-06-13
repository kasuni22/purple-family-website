import { Heart, Music2, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div>
          <h2 style={styles.logo}>💜 Purple Family</h2>
          <p style={styles.description}>
            A beautiful home for BTS ARMYs to share birthdays, wallpapers,
            songs, quizzes and memories.
          </p>

          <div style={styles.stats}>
            <a
              href="https://chat.whatsapp.com/DxIhmvj7N6jI6xKMaBOmeO"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.statCard}
            >
              <Users size={18} />
              <span>WhatsApp Community</span>
            </a>
          </div>
        </div>

        <div style={styles.links}>
          <a href="/dashboard">Dashboard</a>
          <a href="/birthdays">Birthdays</a>
          <a href="/wallpapers">Wallpapers</a>
          <a href="/members">Members</a>
          <a href="/singalong">Sing Along</a>
          <a href="/quiz">Quiz</a>
        </div>
      </div>

      <div style={styles.bottom}>
        <p style={styles.made}>
          Made by <Heart size={14} fill="currentColor" /> Kasuni Kariyawasam
        </p>
        <p>Built with 🐍 Python & ⚛️ React</p>
        <p>© {new Date().getFullYear()} Purple Family. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "80px",
    background: "linear-gradient(135deg,#1e1b4b,#581c87)",
    color: "white",
  },

  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "55px 24px 35px",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "40px",
  },

  logo: {
    fontSize: "2rem",
    fontWeight: "800",
    marginBottom: "14px",
  },

  description: {
    maxWidth: "560px",
    color: "rgba(255,255,255,0.78)",
    lineHeight: "1.8",
  },

  stats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
  },

  statCard: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 16px",
  borderRadius: "16px",
  background: "#25D366",
  color: "white",
  textDecoration: "none",
  transition: "0.3s",
  cursor: "pointer",
},

  links: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "14px",
    alignContent: "start",
  },

  bottom: {
    borderTop: "1px solid rgba(255,255,255,0.12)",
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    color: "rgba(255,255,255,0.72)",
  },

  made: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
};