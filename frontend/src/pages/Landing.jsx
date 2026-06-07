import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import btsHero from "../assets/bts-hero.jpeg";

export default function Landing() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <img src={logo} alt="Purple Family" style={{ height: "50px" }} />
        <div style={styles.navButtons}>
          <button onClick={() => navigate("/login")} style={styles.loginBtn}>Login</button>
          <button onClick={() => navigate("/register")} style={styles.joinBtn}>Join Us 💜</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        {/* BTS background image - hidden/faded */}
        <div style={styles.heroBgImage}>
          <img src={btsHero} alt="" style={styles.bgImg}
            onError={(e) => e.target.style.display = "none"} />
        </div>

        <div style={styles.heroContent}>
          <div style={styles.badge}>🇱🇰 Sri Lankan ARMY Community</div>
          <h1 style={styles.heroTitle}>Welcome to<br />Purple Family 💜</h1>
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
          {/* Scroll Button */}
          <div style={styles.scrollBtn} onClick={scrollToFeatures}>
            <span style={styles.scrollText}>Explore more</span>
            <div style={styles.scrollArrow}>↓</div>
          </div>
        </div>

        <div style={styles.heroArt}>
          <div style={styles.artCircle1}>💜</div>
          <div style={styles.artCircle2}>🎵</div>
          <div style={styles.artCircle3}>⭐</div>
          <div style={styles.artMain}>BTS<br />💜<br />ARMY</div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={styles.features}>
        <h2 style={styles.featuresTitle}>Everything for ARMY 💜</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: "📢", title: "Family Board", desc: "Share updates, thoughts and love with your purple family", path: "/dashboard" },
            { icon: "🎂", title: "Birthday Calendar", desc: "Never miss an ARMY birthday! Celebrate together 💜", path: "/register" },
            { icon: "🖼️", title: "Wallpaper Gallery", desc: "Download beautiful BTS wallpapers for free", path: "/register" },
            { icon: "👥", title: "Know About OT7", desc: "Learn about all 7 BTS members and share your thoughts", path: "/register" },
            { icon: "🎵", title: "Sing-Along", desc: "Sing your heart out with BTS lyrics and YouTube videos", path: "/register" },
            { icon: "🎮", title: "BTS Quiz", desc: "Test your BTS knowledge and challenge your ARMY friends!", path: "/register" },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}
              onClick={() => navigate(f.path)}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
              <div style={styles.featureLink}>Explore →</div>
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

      {/* WhatsApp Community Section */}
      <div style={styles.whatsapp}>
        <div style={styles.whatsappContent}>
          <div style={styles.whatsappIcon}>💬</div>
          <div style={styles.whatsappText}>
            <h2 style={styles.whatsappTitle}>Join our SL ARMY WhatsApp Community! 💜</h2>
            <p style={styles.whatsappDesc}>
              Make ARMY friends, chat about BTS, share news and spread purple love
              with Sri Lankan ARMYs!
            </p>
            <div style={styles.whatsappFeatures}>
              <span style={styles.wFeature}>💜 Make ARMY friends</span>
              <span style={styles.wFeature}>📢 BTS news & updates</span>
              <span style={styles.wFeature}>🎉 Fun events</span>
              <span style={styles.wFeature}>🇱🇰 SL ARMY only</span>
            </div>
          </div>
          <a href="https://chat.whatsapp.com/your-link-here"
            target="_blank" rel="noopener noreferrer"
            style={styles.whatsappBtn}>
            Join WhatsApp Community 💬
          </a>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to join the Purple Family? 💜</h2>
        <p style={styles.ctaDesc}>Connect with Sri Lankan ARMYs who love BTS just as much as you do!</p>
        <button onClick={() => navigate("/register")} style={styles.ctaBigBtn}>
          Join for Free 💜
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <img src={logo} alt="Purple Family" style={{ height: "40px", marginBottom: "0.5rem" }} />
            <p style={styles.footerDesc}>A safe space for Sri Lankan BTS ARMY 💜</p>
          </div>
          <div style={styles.footerMiddle}>
            <p style={styles.footerLink} onClick={() => navigate("/register")}>Join Us</p>
            <p style={styles.footerLink} onClick={() => navigate("/login")}>Login</p>
          </div>
          <div style={styles.footerRight}>
            <p style={styles.footerText}>Made by 💜 Kasuni Kariyawasam</p>
            <p style={styles.footerText}>© 2026 Purple Family. All rights reserved.</p>
            <p style={styles.footerSmall}>Built with 🐍 Python & ⚛️ React</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerBottomText}>💜 Purple Family — Sri Lankan BTS ARMY Community 💜</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff" },
  nav: {
    background: "white", padding: "1rem 3rem", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    borderBottom: "2px solid #e0d0ff", position: "sticky", top: 0, zIndex: 100
  },
  navButtons: { display: "flex", gap: "1rem" },
  loginBtn: {
    padding: "8px 20px", background: "white", border: "1px solid #7c3aed",
    color: "#7c3aed", borderRadius: "8px", cursor: "pointer", fontSize: "1rem"
  },
  joinBtn: {
    padding: "8px 20px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "1rem"
  },
  hero: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "5rem 3rem", maxWidth: "1200px", margin: "0 auto", position: "relative"
  },
  heroBgImage: {
    position: "absolute", right: "-160px", top: 0, width: "55%",
    height: "100%", overflow: "hidden", zIndex: 0
  },
  bgImg: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.50 },
  heroContent: { flex: 1, position: "relative", zIndex: 1 },
  badge: {
    display: "inline-block", padding: "6px 16px", background: "#f0e6ff",
    color: "#7c3aed", borderRadius: "20px", fontSize: "0.9rem", marginBottom: "1.5rem"
  },
  heroTitle: {
    fontSize: "3.5rem", color: "#2d0a4e", lineHeight: 1.2,
    marginBottom: "1.5rem", fontWeight: "bold"
  },
  heroSubtitle: {
    fontSize: "1.2rem", color: "#666", marginBottom: "2rem",
    maxWidth: "500px", lineHeight: 1.6
  },
  heroButtons: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" },
  ctaBtn: {
    padding: "14px 32px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "10px", cursor: "pointer", fontSize: "1.1rem",
    fontWeight: "bold"
  },
  ctaBigBtn: {
    padding: "16px 48px", background: "white", border: "3px solid white",
    color: "#7c3aed", borderRadius: "50px", cursor: "pointer", fontSize: "1.2rem",
    fontWeight: "bold"
  },
  secondaryBtn: {
    padding: "14px 32px", background: "white",
    border: "2px solid #7c3aed", color: "#7c3aed", borderRadius: "10px",
    cursor: "pointer", fontSize: "1.1rem"
  },
  scrollBtn: {
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    gap: "8px", cursor: "pointer", marginTop: "2rem"
  },
  scrollText: {
    color: "#7c3aed", fontSize: "0.95rem", fontWeight: "500",
    letterSpacing: "1px"
  },
  scrollArrow: {
    width: "48px", height: "48px", borderRadius: "50%",
    background: "#7c3aed", border: "none", display: "flex",
    alignItems: "center", justifyContent: "center", color: "white",
    fontSize: "2.0rem", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)"
  },
  heroArt: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", height: "400px", zIndex: 1, marginLeft: "-950px"
  },
  artCircle1: { position: "absolute", top: "1%", left: "40%", fontSize: "4rem" },
  artCircle2: { position: "absolute", top: "1%", right: "30%", fontSize: "3rem" },
  artCircle3: { position: "absolute", bottom: "20%", left: "38%", fontSize: "2.5rem" },
  artMain: {
    width: "200px", height: "200px", borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #b39ddb)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.8rem", fontWeight: "bold", color: "white", textAlign: "center",
    lineHeight: 1.4, boxShadow: "0 20px 60px rgba(124, 58, 237, 0.3)"
  },
  features: { background: "white", padding: "5rem 3rem" },
  featuresTitle: {
    textAlign: "center", color: "#2d0a4e", fontSize: "2rem",
    marginBottom: "3rem"
  },
  featuresGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem", maxWidth: "1100px", margin: "0 auto"
  },
  featureCard: {
    background: "#f8f5ff", borderRadius: "12px", padding: "2rem",
    textAlign: "center", border: "1px solid #e0d0ff", cursor: "pointer",
    transition: "transform 0.2s"
  },
  featureIcon: { fontSize: "2.5rem", marginBottom: "1rem" },
  featureTitle: { color: "#2d0a4e", marginBottom: "0.5rem", fontSize: "1.1rem" },
  featureDesc: {
    color: "#888", fontSize: "0.95rem", lineHeight: 1.6,
    marginBottom: "1rem"
  },
  featureLink: { color: "#7c3aed", fontWeight: "500", fontSize: "0.9rem" },
  members: { padding: "5rem 3rem", textAlign: "center" },
  biasGrid: {
    display: "flex", gap: "1rem", flexWrap: "wrap",
    justifyContent: "center", maxWidth: "600px", margin: "0 auto"
  },
  biasPill: {
    padding: "10px 24px", background: "white", border: "2px solid #d4b8ff",
    color: "#7c3aed", borderRadius: "30px", fontSize: "1rem", fontWeight: "500"
  },
  whatsapp: {
    background: "#f0e6ff", padding: "4rem 3rem",
    borderTop: "2px solid #d4b8ff", borderBottom: "2px solid #d4b8ff"
  },
  whatsappContent: {
    maxWidth: "1000px", margin: "0 auto", display: "flex",
    alignItems: "center", gap: "2rem", flexWrap: "wrap"
  },
  whatsappIcon: { fontSize: "5rem", flexShrink: 0 },
  whatsappText: { flex: 1 },
  whatsappTitle: {
    color: "#2d0a4e", fontSize: "1.6rem",
    marginBottom: "0.75rem"
  },
  whatsappDesc: {
    color: "#666", fontSize: "1rem", lineHeight: 1.6,
    marginBottom: "1rem"
  },
  whatsappFeatures: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  wFeature: {
    padding: "6px 14px", background: "white",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "20px", fontSize: "0.85rem"
  },
  whatsappBtn: {
    padding: "14px 28px", background: "#25D366",
    color: "white", borderRadius: "10px", textDecoration: "none",
    fontSize: "1rem", fontWeight: "bold", flexShrink: 0,
    whiteSpace: "nowrap"
  },
  cta: { background: "#7c3aed", padding: "5rem 3rem", textAlign: "center" },
  ctaTitle: { color: "white", fontSize: "2rem", marginBottom: "1rem" },
  ctaDesc: { color: "#e0d0ff", fontSize: "1.1rem", marginBottom: "2rem" },
  footer: { background: "#2d0a4e", padding: "3rem 3rem 0" },
  footerContent: {
    maxWidth: "1100px", margin: "0 auto", display: "flex",
    justifyContent: "space-between", flexWrap: "wrap", gap: "2rem",
    paddingBottom: "2rem", borderBottom: "1px solid #7c3aed"
  },
  footerLeft: { display: "flex", flexDirection: "column" },
  footerDesc: { color: "#b39ddb", fontSize: "0.9rem" },
  footerMiddle: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  footerLink: { color: "#b39ddb", fontSize: "0.9rem", cursor: "pointer" },
  footerRight: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  footerText: { color: "#b39ddb", fontSize: "0.9rem" },
  footerSmall: { color: "#7c3aed", fontSize: "0.85rem", marginTop: "0.5rem" },
  footerBottom: { textAlign: "center", padding: "1rem 0" },
  footerBottomText: { color: "#7c3aed", fontSize: "0.85rem" },
};