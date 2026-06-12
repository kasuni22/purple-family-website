import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import btsHero from "../assets/bts-hero.jpeg";
import Footer from "../components/Footer";

export default function Landing() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { icon: "📢", title: "Family Board", desc: "Share updates, thoughts and love with your purple family." },
    { icon: "🎂", title: "Birthday Calendar", desc: "Celebrate every ARMY birthday beautifully." },
    { icon: "🖼️", title: "Wallpaper Gallery", desc: "Upload, like and download BTS wallpapers." },
    { icon: "👥", title: "OT7 Members", desc: "Learn and share thoughts about all 7 members." },
    { icon: "🎵", title: "Sing-Along", desc: "Enjoy BTS lyrics, albums and YouTube videos." },
    { icon: "🎮", title: "BTS Quiz", desc: "Create topics and play BTS quiz games." },
  ];

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.brand}>
          <img src={logo} alt="Purple Family" style={styles.logo} />
          <div>
            <strong style={styles.brandTitle}>Purple Family</strong>
            <p style={styles.brandSub}>SL BTS ARMY Community</p>
          </div>
        </div>

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
          <p style={styles.subtitle}>
            Connect with Sri Lankan ARMYs, celebrate birthdays, share BTS
            wallpapers, sing along, play quizzes and spread purple love.
          </p>

          <div style={styles.actions}>
            <button onClick={() => navigate("/register")} style={styles.primaryBtn}>
              Join the Family 💜
            </button>

            <button onClick={() => navigate("/login")} style={styles.secondaryBtn}>
              I&apos;m already ARMY
            </button>
          </div>

          <button onClick={scrollToFeatures} style={styles.exploreBtn}>
            Explore more ↓
          </button>
        </div>

        <div style={styles.heroArt}>
          <div style={styles.artCircle1}>💜</div>
          <div style={styles.artCircle2}>🎵</div>
          <div style={styles.artCircle3}>⭐</div>
          <div style={styles.artMain}>BTS<br />💜<br />ARMY</div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.kicker}>What you can do</p>
          <h2 style={styles.sectionTitle}>Everything for ARMY 💜</h2>
          <p style={styles.sectionDesc}>
            A clean, fun and modern space for your whole Purple Family.
          </p>
        </div>

        <div style={styles.grid}>
          {features.map((item) => (
            <div key={item.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{item.icon}</div>
              <h3 style={styles.featureTitle}>{item.title}</h3>
              <p style={styles.featureDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BTS Members Section */}
      <section style={styles.biasSection}>
        <p style={styles.kicker}>OT7</p>
        <h2 style={styles.sectionTitle}>Who&apos;s your bias?</h2>

        <div style={styles.biasGrid}>
          {["RM", "Jin", "SUGA", "j-hope", "Jimin", "V", "Jung Kook"].map(
            (name) => (
              <span key={name} style={styles.biasPill}>
                💜 {name}
              </span>
            )
          )}
        </div>
      </section>

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
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to join Purple Family?</h2>
        <p style={styles.ctaText}>
          Create your profile and become part of our SL BTS ARMY home.
        </p>
        <button onClick={() => navigate("/register")} style={styles.ctaButton}>
          Join for Free 💜
        </button>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff" },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "16px clamp(18px, 5vw, 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(124,58,237,0.14)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "48px",
    height: "48px",
  },

  brandTitle: {
    color: "#4c1d95",
    fontSize: "1.1rem",
  },

  brandSub: {
    color: "#8b5cf6",
    fontSize: "0.8rem",
    fontWeight: 700,
  },

  navButtons: {
    display: "flex",
    gap: "12px",
  },

  loginBtn: {
    border: "1px solid rgba(124,58,237,0.28)",
    background: "white",
    color: "#6d28d9",
    padding: "11px 22px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 800,
  },
  joinBtn: {
    border: "none",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "11px 22px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 12px 24px rgba(124,58,237,0.25)",
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
  subtitle: {
    color: "#6b5a80",
    fontSize: "1.05rem",
    lineHeight: 1.8,
    maxWidth: "600px",
    marginBottom: "30px",
  },

  actions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },

  primaryBtn: {
    border: "none",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "15px 28px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "1rem",
    boxShadow: "0 18px 35px rgba(124,58,237,0.25)",
  },

  secondaryBtn: {
    border: "1px solid rgba(124,58,237,0.22)",
    background: "rgba(255,255,255,0.78)",
    color: "#4c1d95",
    padding: "15px 28px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "1rem",
  },

  exploreBtn: {
    border: "none",
    background: "transparent",
    color: "#7c3aed",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: "1rem",
  },
  heroArt: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", height: "400px", zIndex: 1, marginLeft: "-850px", pointerEvents: "none"
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
  section: {
    padding: "80px clamp(18px, 5vw, 70px)",
    background: "rgba(255,255,255,0.52)",
  },

  sectionHeader: {
    textAlign: "center",
    maxWidth: "720px",
    margin: "0 auto 38px",
  },

  kicker: {
    color: "#ec4899",
    fontWeight: 900,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },

  sectionTitle: {
    color: "#241039",
    fontSize: "clamp(2rem, 4vw, 2.4rem)",
    letterSpacing: "-0.04em",
    marginBottom: "12px",
  },

  sectionDesc: {
    color: "#7c6a92",
    lineHeight: 1.7,
  },

  grid: {
    width: "min(1180px, 100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "22px",
  },

  featureCard: {
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(124,58,237,0.14)",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 18px 40px rgba(76,29,149,0.08)",
  },

  featureIcon: {
    fontSize: "2.5rem",
    marginBottom: "18px",
  },

  featureTitle: {
    color: "#4c1d95",
    marginBottom: "10px",
  },

  featureDesc: {
    color: "#7c6a92",
    lineHeight: 1.7,
  },
  biasSection: {
    padding: "80px 20px",
    textAlign: "center",
  },

  biasGrid: {
    margin: "28px auto 0",
    width: "min(820px,100%)",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "14px",
  },

  biasPill: {
    padding: "13px 22px",
    borderRadius: "999px",
    background: "white",
    color: "#6d28d9",
    fontWeight: 900,
    border: "1px solid rgba(124,58,237,0.18)",
    boxShadow: "0 12px 24px rgba(76,29,149,0.08)",
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
  cta: {
    width: "min(1180px, calc(100% - 36px))",
    margin: "20px auto 80px",
    padding: "60px 24px",
    textAlign: "center",
    borderRadius: "36px",
    background: "linear-gradient(135deg,#4c1d95,#7c3aed,#ec4899)",
    color: "white",
    boxShadow: "0 28px 70px rgba(124,58,237,0.28)",
  },

  ctaTitle: {
    fontSize: "clamp(2rem, 4vw, 3.0rem)",
    marginBottom: "12px",
  },

  ctaText: {
    color: "rgba(255,255,255,0.82)",
    marginBottom: "28px",
  },

  ctaButton: {
    border: "none",
    background: "white",
    color: "#6d28d9",
    padding: "15px 34px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "1rem",
  },
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
  footerBottomText: {
    color: "#7c3aed",
    fontSize: "0.85rem",
  },

  mobileHero: {
    flexDirection: "column",
  },

  mobileNav: {
    flexDirection: "column",
    gap: "16px",
  },

  mobileButtons: {
    width: "100%",
  },
};