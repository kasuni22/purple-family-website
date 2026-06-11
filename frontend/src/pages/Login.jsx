import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/logo.svg";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.left}>
          <img src={logo} alt="Purple Family" style={styles.logo} />
          <h1 style={styles.title}>Welcome back ARMY 💜</h1>
          <p style={styles.subtitle}>
            Login to continue your Purple Family journey.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              placeholder="army@email.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                style={styles.passwordInput}
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login 💜"}
            </button>
          </form>

          <p style={styles.bottomText}>
            New ARMY? <Link to="/register" style={styles.link}>Join the Family</Link>
          </p>
        </div>

        <div style={styles.right}>
          <div style={styles.glass}>
            <span style={styles.bigEmoji}>🎤</span>
            <h2 style={styles.panelTitle}>Purple Family</h2>
            <p style={styles.panelText}>
              Birthdays, wallpapers, sing-along, quizzes and ARMY memories in one beautiful place.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
  },

  card: {
    width: "min(1050px, 100%)",
    minHeight: "620px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(124,58,237,0.16)",
    borderRadius: "34px",
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(76,29,149,0.18)",
  },

  left: {
    padding: "56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  logo: {
    width: "64px",
    marginBottom: "22px",
  },

  title: {
    fontSize: "2.7rem",
    color: "#241039",
    lineHeight: 1,
    letterSpacing: "-0.05em",
    marginBottom: "14px",
  },

  subtitle: {
    color: "#7c6a92",
    lineHeight: 1.7,
    marginBottom: "30px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  label: {
    color: "#4c1d95",
    fontWeight: 800,
    fontSize: "0.9rem",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.22)",
    background: "white",
    color: "#241039",
    fontSize: "1rem",
    outline: "none",
  },
  passwordWrapper: {
    position: "relative",
  },

  passwordInput: {
    width: "100%",
    padding: "14px 50px 14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.22)",
    background: "white",
    color: "#241039",
    fontSize: "1rem",
    outline: "none",
  },

  eyeButton: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  button: {
    marginTop: "12px",
    padding: "15px",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    fontSize: "1rem",
    fontWeight: 900,
    cursor: "pointer",
    border: "none",
    boxShadow: "0 16px 30px rgba(124,58,237,0.25)",
  },

  bottomText: {
    marginTop: "24px",
    color: "#7c6a92",
  },

  link: {
    color: "#7c3aed",
    fontWeight: 900,
  },

  right: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    padding: "40px",
    background:
      "radial-gradient(circle at 30% 20%, rgba(236,72,153,0.55), transparent 35%), linear-gradient(135deg,#4c1d95,#7c3aed)",
  },

  glass: {
    padding: "42px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.25)",
    backdropFilter: "blur(18px)",
    color: "white",
    textAlign: "center",
  },

  bigEmoji: {
    fontSize: "4rem",
  },

  panelTitle: {
    fontSize: "2.3rem",
    marginTop: "18px",
  },

  panelText: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.7,
    marginTop: "12px",
  },
};