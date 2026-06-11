import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function EditProfile() {
  const [form, setForm] = useState({
    nickname: "",
    bias: "",
    country: "",
    birthday: ""
  });

  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const biasOptions = ["Jin", "Suga", "J-Hope", "RM", "Jimin", "Taehyung", "Jungkook"];

  useEffect(() => {
    API.get("/auth/me").then(res => {
      setUser(res.data);
      setForm({
        nickname: res.data.nickname || "",
        bias: res.data.bias || "",
        country: res.data.country || "",
        birthday: res.data.birthday || ""
      });
    }).catch(() => navigate("/login"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("nickname", form.nickname);
      formData.append("bias", form.bias);
      formData.append("country", form.country);
      formData.append("birthday", form.birthday);

      if (profileImage) {
        formData.append("file", profileImage);
      }

      await API.put("/auth/profile", formData);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);

    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.card}>
          {/* Avatar */}
          <div style={styles.avatarSection}>
            {user?.profile_picture ? (
              <img
                src={`http://127.0.0.1:8000/${user.profile_picture}`}
                alt=""
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <div style={styles.avatar}>
                {(user?.nickname || user?.username)?.[0]?.toUpperCase()}
              </div>
            )}
            <h2 style={styles.username}>{user?.username}</h2>
            <p style={styles.email}>{user?.email}</p>
            {user?.is_admin && (
              <div style={styles.adminBadge}>👑 Admin</div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>✏️ Edit Your Profile</h3>
            <label style={styles.label}>
              Nickname 💜
            </label>

            <input
              style={styles.input}
              value={form.nickname}
              onChange={(e) =>
                setForm({
                  ...form,
                  nickname: e.target.value
                })
              }
            />

            <label style={styles.label}>Your Bias 💜</label>
            <select style={styles.input}
              value={form.bias}
              onChange={e => setForm({ ...form, bias: e.target.value })}>
              <option value="">Select your bias</option>
              {biasOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <label style={styles.label}>Country 🌍</label>
            <input style={styles.input} placeholder="e.g. Sri Lanka"
              value={form.country}
              onChange={e => setForm({ ...form, country: e.target.value })} />

            <label style={styles.label}>Birthday 🎂</label>
            <input style={styles.input} type="date"
              value={form.birthday}
              onChange={e => setForm({ ...form, birthday: e.target.value })} />

            <label style={styles.label}>
              Profile Picture 📷
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProfileImage(e.target.files[0])
              }
            />

            {saved && (
              <div style={styles.successMsg}>
                ✅ Profile updated successfully! 💜
              </div>
            )}

            <button style={styles.button} type="submit">
              Save Changes 💜
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff", display: "flex", flexDirection: "column" },
  content: {
    width: "100%",
    padding: "2rem 3rem",
    flex: 1,
    boxSizing: "border-box"
  },
  card: {
    background: "white", borderRadius: "16px", padding: "2rem",
    border: "1px solid #d4b8ff"
  },
  avatarSection: { textAlign: "center", marginBottom: "2rem" },
  avatar: {
    width: "80px", height: "80px", borderRadius: "50%",
    background: "#7c3aed", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "2rem", fontWeight: "bold",
    margin: "0 auto 1rem", color: "white"
  },
  username: { color: "#2d0a4e", marginBottom: "0.25rem" },
  email: { color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem" },
  adminBadge: {
    display: "inline-block", padding: "4px 14px",
    background: "#fff3cd", color: "#856404", borderRadius: "20px",
    fontSize: "0.85rem"
  },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  formTitle: { color: "#2d0a4e", marginBottom: "0.5rem" },
  label: { color: "#7c3aed", fontSize: "0.9rem", fontWeight: "500" },
  input: {
    padding: "12px", borderRadius: "8px", border: "1px solid #d4b8ff",
    background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem"
  },
  successMsg: {
    background: "#d4edda", color: "#155724", padding: "12px",
    borderRadius: "8px", textAlign: "center"
  },
  button: {
    padding: "14px", borderRadius: "8px", background: "#7c3aed",
    color: "white", fontSize: "1rem", cursor: "pointer", border: "none",
    fontWeight: "bold", marginTop: "0.5rem"
  }
};