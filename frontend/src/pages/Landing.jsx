import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h1 style={styles.logo}>💜 Purple Family</h1>
        <div style={styles.navButtons}>
          <button onClick={() => navigate("/login")} style={styles.loginBtn}>Login</button>
          <button onClick={() => navigate("/register")} style={styles.joinBtn}>Join Us 💜</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>🇱🇰 Sri Lankan ARMY Community</div>
          <h1 style={styles.heroTitle}>Welcome to<br/>Purple Family 💜</h1>
          <p style={styles.heroSubtitle}>
            A safe space for Sri Lankan BTS ARMY to connect, 
            share, celebrate birthdays, and spread purple love!
          </p>
          <div style={styles.heroButtons}>
            <button onClick={() => navigate("/register")} style={styles.ctaBtn}>
              Join the Family 💜
            </button>
            <button onClick={() => navigate("/login")} style={styles.secondaryBtn}>
              I'm already ARMY
            </button>
          </div>
        </div>
        <div style={styles.heroArt}>
          <div style={styles.artCircle1}>💜</div>
          <div style={styles.artCircle2}>🎵</div>
          <div style={styles.artCircle3}>⭐</div>
          <div style={styles.artMain}>BTS<br/>💜<br/>ARMY</div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>Everything for ARMY 💜</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: "📢", title: "Family Board", desc: "Share updates, thoughts and love with your purple family" },
            { icon: "🎂", title: "Birthday Calendar", desc: "Never miss an ARMY birthday! Celebrate together" },
            { icon: "🖼️", title: "Wallpaper Gallery", desc: "Download beautiful BTS wallpapers for free" },
            { icon: "👥", title: "Members", desc: "Meet ARMYs from Sri Lanka and see their bias" },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BTS Members Section */}
      <div style={styles.members}>
        <h2 style={styles.featuresTitle}>Who's your bias? 💜</h2>
        <div style={styles.biasGrid}>
          {["Jin", "Suga", "J-Hope", "RM", "Jimin", "Taehyung", "Jungkook"].map((name, i) => (
            <div key={i} style={styles.biasPill}>💜 {name}</div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to join the Purple Family? 💜</h2>
        <p style={styles.ctaDesc}>Connect with Sri Lankan ARMYs who love BTS just as much as you do!</p>
        <button onClick={() => navigate("/register")} style={styles.ctaBtn}>
          Join for Free 💜
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>💜 Purple Family — Made with love for Sri Lankan ARMY 💜</p>
      </footer>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff" },
  nav: { background: "white", padding: "1rem 3rem", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    borderBottom: "2px solid #e0d0ff", position: "sticky", top: 0, zIndex: 100 },
  logo: { color: "#7c3aed", margin: 0, fontSize: "1.5rem" },
  navButtons: { display: "flex", gap: "1rem" },
  loginBtn: { padding: "8px 20px", background: "white", border: "1px solid #7c3aed",
    color: "#7c3aed", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  joinBtn: { padding: "8px 20px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  hero: { display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "5rem 3rem", maxWidth: "1200px", margin: "0 auto" },
  heroContent: { flex: 1 },
  badge: { display: "inline-block", padding: "6px 16px", background: "#f0e6ff",
    color: "#7c3aed", borderRadius: "20px", fontSize: "0.9rem", marginBottom: "1.5rem" },
  heroTitle: { fontSize: "3.5rem", color: "#2d0a4e", lineHeight: 1.2,
    marginBottom: "1.5rem", fontWeight: "bold" },
  heroSubtitle: { fontSize: "1.2rem", color: "#666", marginBottom: "2rem",
    maxWidth: "500px", lineHeight: 1.6 },
  heroButtons: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  ctaBtn: { padding: "14px 32px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "10px", cursor: "pointer", fontSize: "1.1rem",
    fontWeight: "bold" },
  secondaryBtn: { padding: "14px 32px", background: "white",
    border: "2px solid #7c3aed", color: "#7c3aed", borderRadius: "10px",
    cursor: "pointer", fontSize: "1.1rem" },
  heroArt: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", height: "400px" },
  artCircle1: { position: "absolute", top: "10%", left: "20%", fontSize: "4rem",
    animation: "float 3s ease-in-out infinite" },
  artCircle2: { position: "absolute", top: "30%", right: "15%", fontSize: "3rem" },
  artCircle3: { position: "absolute", bottom: "20%", left: "30%", fontSize: "2.5rem" },
  artMain: { width: "200px", height: "200px", borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #b39ddb)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.8rem", fontWeight: "bold", color: "white", textAlign: "center",
    lineHeight: 1.4, boxShadow: "0 20px 60px rgba(124, 58, 237, 0.3)" },
  features: { background: "white", padding: "5rem 3rem" },
  featuresTitle: { textAlign: "center", color: "#2d0a4e", fontSize: "2rem",
    marginBottom: "3rem" },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem", maxWidth: "1100px", margin: "0 auto" },
  featureCard: { background: "#f8f5ff", borderRadius: "12px", padding: "2rem",
    textAlign: "center", border: "1px solid #e0d0ff" },
  featureIcon: { fontSize: "2.5rem", marginBottom: "1rem" },
  featureTitle: { color: "#2d0a4e", marginBottom: "0.5rem", fontSize: "1.1rem" },
  featureDesc: { color: "#888", fontSize: "0.95rem", lineHeight: 1.6 },
  members: { padding: "5rem 3rem", textAlign: "center" },
  biasGrid: { display: "flex", gap: "1rem", flexWrap: "wrap",
    justifyContent: "center", maxWidth: "600px", margin: "0 auto" },
  biasPill: { padding: "10px 24px", background: "white", border: "2px solid #d4b8ff",
    color: "#7c3aed", borderRadius: "30px", fontSize: "1rem", fontWeight: "500" },
  cta: { background: "#7c3aed", padding: "5rem 3rem", textAlign: "center" },
  ctaTitle: { color: "white", fontSize: "2rem", marginBottom: "1rem" },
  ctaDesc: { color: "#e0d0ff", fontSize: "1.1rem", marginBottom: "2rem" },
  footer: { background: "#2d0a4e", padding: "2rem", textAlign: "center" },
  footerText: { color: "#b39ddb", fontSize: "0.95rem" }
};