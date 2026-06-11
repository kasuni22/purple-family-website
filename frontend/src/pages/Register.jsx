import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../api/axios";
import logo from "../assets/logo.svg";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    country: "",
    bias: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        birthday: form.birthday || null,
        country: form.country,
        bias: form.bias,
      });

      alert("Registration successful 💜");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.left}>
          <img src={logo} alt="Purple Family" style={styles.logo} />

          <h1 style={styles.title}>Join Purple Family 💜</h1>

          <p style={styles.subtitle}>
            Create your ARMY profile and become part of our BTS community.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              style={styles.input}
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            {/* Password */}

            <div style={styles.passwordWrapper}>
              <input
                style={styles.passwordInput}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {/* Confirm Password */}

            <div style={styles.passwordWrapper}>
              <input
                style={styles.passwordInput}
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                style={styles.eyeButton}
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <input
              style={styles.input}
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
            />

            <input
              style={styles.input}
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
            />

            <select
              style={styles.input}
              name="bias"
              value={form.bias}
              onChange={handleChange}
            >
              <option value="">Select Your Bias</option>
              <option value="RM">RM</option>
              <option value="Jin">Jin</option>
              <option value="SUGA">SUGA</option>
              <option value="j-hope">j-hope</option>
              <option value="Jimin">Jimin</option>
              <option value="V">V</option>
              <option value="Jung Kook">Jung Kook</option>
            </select>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account 💜"}
            </button>
          </form>

          <p style={styles.bottomText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </p>
        </div>

        <div style={styles.right}>
          <div style={styles.glass}>
            <span style={styles.bigEmoji}>💜</span>

            <h2 style={styles.panelTitle}>Welcome ARMY</h2>

            <p style={styles.panelText}>
              Share wallpapers, celebrate birthdays, play BTS quizzes and
              connect with fellow ARMYs.
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
    width: "min(1100px,100%)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    overflow: "hidden",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 30px 80px rgba(76,29,149,0.18)",
  },

  left: {
    padding: "50px",
  },

  logo: {
    width: "64px",
    marginBottom: "20px",
  },

  title: {
    fontSize: "2.7rem",
    color: "#241039",
    marginBottom: "12px",
  },

  subtitle: {
    color: "#7c6a92",
    marginBottom: "25px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.22)",
    outline: "none",
    fontSize: "1rem",
  },

  passwordWrapper: {
    position: "relative",
  },

  passwordInput: {
    width: "100%",
    padding: "14px 50px 14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.22)",
    outline: "none",
    fontSize: "1rem",
  },

  eyeButton: {
    position: "absolute",
    top: "50%",
    right: "14px",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#7c3aed",
  },

  button: {
    marginTop: "10px",
    border: "none",
    borderRadius: "999px",
    padding: "15px",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
    background:
      "linear-gradient(135deg,#7c3aed,#ec4899)",
  },

  bottomText: {
    marginTop: "20px",
    color: "#7c6a92",
  },

  link: {
    color: "#7c3aed",
    fontWeight: "800",
  },

  right: {
    display: "grid",
    placeItems: "center",
    padding: "40px",
    background:
      "linear-gradient(135deg,#4c1d95,#7c3aed,#ec4899)",
  },

  glass: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(15px)",
    borderRadius: "30px",
    padding: "40px",
    color: "white",
    textAlign: "center",
  },

  bigEmoji: {
    fontSize: "4rem",
  },

  panelTitle: {
    marginTop: "18px",
    fontSize: "2rem",
  },

  panelText: {
    marginTop: "12px",
    lineHeight: "1.8",
    color: "rgba(255,255,255,0.85)",
  },
};