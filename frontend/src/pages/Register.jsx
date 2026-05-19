import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    country: "", bias: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully! Please login 💜");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💜 Join Purple Family</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} placeholder="Username"
          onChange={e => setForm({ ...form, username: e.target.value })} required />
        <input style={styles.input} placeholder="Email" type="email"
          onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input style={styles.input} placeholder="Password" type="password"
          onChange={e => setForm({ ...form, password: e.target.value })} required />
        <input style={styles.input} placeholder="Country"
          onChange={e => setForm({ ...form, country: e.target.value })} />
        <input style={styles.input} placeholder="Your Bias (e.g. Taehyung)"
          onChange={e => setForm({ ...form, bias: e.target.value })} />
        <input style={styles.input} placeholder="Birthday (YYYY-MM-DD)"
          type="date"
          onChange={e => setForm({ ...form, birthday: e.target.value })} />
        <button style={styles.button} type="submit">Join the Family 💜</button>
      </form>
      <p style={{ color: "#ccc" }}>Already a member? <a href="/login" style={{ color: "#b39ddb" }}>Login</a></p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", background: "#1a0533", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center"
  },
  title: { color: "#b39ddb", fontSize: "2rem", marginBottom: "2rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", width: "320px" },
  input: {
    padding: "12px", borderRadius: "8px", border: "1px solid #b39ddb",
    background: "#2d0a4e", color: "white", fontSize: "1rem"
  },
  button: {
    padding: "12px", borderRadius: "8px", background: "#7c3aed",
    color: "white", fontSize: "1rem", cursor: "pointer", border: "none"
  }
};