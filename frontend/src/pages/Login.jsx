import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      alert("Welcome to Purple Family! 💜");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💜 Purple Family</h1>
      <p style={styles.subtitle}>Welcome back ARMY!</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} placeholder="Email" type="email"
          onChange={e => setForm({...form, email: e.target.value})} required />
        <input style={styles.input} placeholder="Password" type="password"
          onChange={e => setForm({...form, password: e.target.value})} required />
        <button style={styles.button} type="submit">Login 💜</button>
      </form>
      <p style={{color: "#ccc"}}>New ARMY? <a href="/register" style={{color: "#b39ddb"}}>Join the Family</a></p>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#1a0533", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center" },
  title: { color: "#b39ddb", fontSize: "2.5rem", marginBottom: "0.5rem" },
  subtitle: { color: "#ccc", marginBottom: "2rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", width: "320px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #b39ddb",
    background: "#2d0a4e", color: "white", fontSize: "1rem" },
  button: { padding: "12px", borderRadius: "8px", background: "#7c3aed",
    color: "white", fontSize: "1rem", cursor: "pointer", border: "none" }
};