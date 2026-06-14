import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://purple-family-website.onrender.com/${path}`;
};

export default function EditProfile() {
  const [form, setForm] = useState({
    nickname: "",
    bias: "",
    country: "",
    birthday: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const biasOptions = [
    "Jin",
    "Suga",
    "J-Hope",
    "RM",
    "Jimin",
    "Taehyung",
    "Jungkook",
  ];

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setForm({
          nickname: res.data.nickname || "",
          bias: res.data.bias || "",
          country: res.data.country || "",
          birthday: res.data.birthday || "",
        });

        if (res.data.profile_picture) {
          setPreview(getImageUrl(res.data.profile_picture));
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

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

      const res = await API.put("/auth/profile", formData);
      setUser(res.data);
      setSaved(true);

      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Update failed");
    }
  };

  return (
    <>
      <Navbar />

      <main className="edit-profile-page" style={styles.page}>
        <section className="edit-profile-hero" style={styles.hero}>
          <div>
            <div style={styles.badge}>👤 ARMY Profile</div>
            <h1 style={styles.title}>Make your profile beautifully purple</h1>
            <p style={styles.subtitle}>
              Update your nickname, birthday, country, bias and profile photo.
            </p>
          </div>

          <div className="edit-profile-hero-card" style={styles.heroCard}>
            <span style={styles.heroIcon}>💜</span>
            <h2>{user?.nickname || user?.username || "ARMY"}</h2>
            <p>{user?.is_admin ? "Purple Family Admin" : "Purple Family Member"}</p>
          </div>
        </section>

        <section className="edit-profile-card" style={styles.card}>
          <aside className="edit-profile-side-card" style={styles.profileCard}>
            <div className="edit-profile-avatar-wrap" style={styles.avatarWrap}>
              {preview ? (
                <img src={preview} alt="Profile" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatar}>
                  {(user?.nickname || user?.username || "?")[0].toUpperCase()}
                </div>
              )}
            </div>

            <h2 style={styles.username}>{user?.nickname || user?.username}</h2>
            <p style={styles.email}>{user?.email}</p>

            {user?.is_admin && <div style={styles.adminBadge}>👑 Admin</div>}

            <div style={styles.infoBox}>
              <p>💜 Bias: {form.bias || "Not selected"}</p>
              <p>🌍 Country: {form.country || "Not added"}</p>
              <p>🎂 Birthday: {form.birthday || "Not added"}</p>
            </div>
          </aside>

          <form className="edit-profile-form" onSubmit={handleSubmit} style={styles.form}>
            <div className="edit-profile-form-head" style={styles.formHead}>
              <h2 style={styles.formTitle}>Edit Your Profile</h2>
              <p style={styles.formText}>Keep your ARMY identity fresh and lovely.</p>
            </div>

            <label style={styles.label}>Nickname 💜</label>
            <input
              style={styles.input}
              placeholder="Your ARMY nickname"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />

            <label style={styles.label}>Your Bias 💜</label>
            <select
              style={styles.input}
              value={form.bias}
              onChange={(e) => setForm({ ...form, bias: e.target.value })}
            >
              <option value="">Select your bias</option>
              {biasOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <label style={styles.label}>Country 🌍</label>
            <input
              style={styles.input}
              placeholder="e.g. Sri Lanka"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />

            <label style={styles.label}>Birthday 🎂</label>
            <input
              style={styles.input}
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />

            <label style={styles.label}>Profile Picture 📷</label>
            <label className="edit-profile-upload-box" style={styles.uploadBox}>
              <span>📸 Choose a profile photo</span>
              <small>PNG, JPG or JPEG</small>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.hiddenFile}
              />
            </label>

            {saved && (
              <div style={styles.successMsg}>
                ✅ Profile updated successfully! 💜
              </div>
            )}

            <button style={styles.button} type="submit">
              Save Changes 💜
            </button>
          </form>
        </section>

        <EditProfileResponsiveStyles />
      </main>

      <Footer />
    </>
  );
}


function EditProfileResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .edit-profile-page {
          padding: 24px 14px !important;
        }

        .edit-profile-hero {
          grid-template-columns: 1fr !important;
          padding: 32px 22px !important;
          border-radius: 28px !important;
          gap: 20px !important;
          text-align: center !important;
        }

        .edit-profile-hero-card {
          min-height: 190px !important;
          border-radius: 26px !important;
        }

        .edit-profile-card {
          grid-template-columns: 1fr !important;
          padding: 18px !important;
          border-radius: 28px !important;
          gap: 18px !important;
        }

        .edit-profile-side-card {
          padding: 26px 20px !important;
          border-radius: 26px !important;
        }

        .edit-profile-avatar-wrap {
          width: 118px !important;
          height: 118px !important;
        }

        .edit-profile-form {
          padding: 24px 18px !important;
          border-radius: 26px !important;
        }

        .edit-profile-form-head {
          text-align: center !important;
        }

        .edit-profile-upload-box {
          text-align: center !important;
          padding: 20px 16px !important;
        }
      }

      @media (max-width: 480px) {
        .edit-profile-page {
          padding: 20px 12px !important;
        }

        .edit-profile-hero {
          padding: 28px 18px !important;
        }

        .edit-profile-hero-card {
          min-height: 170px !important;
        }

        .edit-profile-card {
          padding: 14px !important;
        }

        .edit-profile-side-card,
        .edit-profile-form {
          padding: 22px 16px !important;
        }
      }
    `}</style>
  );
}


const styles = {
  page: {
    width: "100%",
    padding: "40px clamp(16px,4vw,64px)",
  },

  hero: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    padding: "50px",
    borderRadius: "36px",
    background:
      "linear-gradient(135deg,rgba(255,255,255,0.92),rgba(243,232,255,0.9))",
    border: "1px solid rgba(124,58,237,0.16)",
    boxShadow: "0 25px 70px rgba(76,29,149,0.14)",
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "24px",
    alignItems: "center",
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
    fontSize: "clamp(2.3rem,5vw,4.6rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    color: "#241039",
    marginBottom: "18px",
  },

  subtitle: {
    color: "#6b5a80",
    lineHeight: 1.8,
    maxWidth: "680px",
  },

  heroCard: {
    minHeight: "220px",
    borderRadius: "30px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    boxShadow: "0 20px 45px rgba(124,58,237,0.25)",
  },

  heroIcon: {
    fontSize: "3rem",
  },

  card: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "28px",
  },

  profileCard: {
    padding: "30px",
    borderRadius: "30px",
    background: "linear-gradient(135deg,#4c1d95,#7c3aed,#ec4899)",
    color: "white",
    textAlign: "center",
  },

  avatarWrap: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    margin: "0 auto 18px",
    padding: "5px",
    background: "rgba(255,255,255,0.35)",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "grid",
    placeItems: "center",
    fontSize: "3rem",
    fontWeight: 900,
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },

  username: {
    fontSize: "1.7rem",
    marginBottom: "6px",
  },

  email: {
    color: "rgba(255,255,255,0.78)",
    marginBottom: "12px",
  },

  adminBadge: {
    display: "inline-flex",
    padding: "7px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.18)",
    fontWeight: 900,
    marginBottom: "20px",
  },

  infoBox: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.12)",
    textAlign: "left",
    lineHeight: 2,
  },

  form: {
    padding: "30px",
    borderRadius: "30px",
    background: "white",
    display: "flex",
    flexDirection: "column",
    gap: "13px",
  },

  formHead: {
    marginBottom: "10px",
  },

  formTitle: {
    color: "#241039",
    fontSize: "2rem",
    letterSpacing: "-0.04em",
  },

  formText: {
    color: "#7c6a92",
    marginTop: "6px",
  },

  label: {
    color: "#6d28d9",
    fontWeight: 900,
    fontSize: "0.92rem",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "#faf7ff",
    color: "#241039",
    fontSize: "1rem",
    outline: "none",
  },

  uploadBox: {
    border: "2px dashed rgba(124,58,237,0.28)",
    background: "#faf7ff",
    borderRadius: "20px",
    padding: "22px",
    color: "#6d28d9",
    fontWeight: 900,
    cursor: "pointer",
    display: "grid",
    gap: "5px",
  },

  hiddenFile: {
    display: "none",
  },

  successMsg: {
    background: "#dcfce7",
    color: "#166534",
    padding: "14px",
    borderRadius: "16px",
    textAlign: "center",
    fontWeight: 800,
  },

  button: {
    padding: "15px",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
    fontWeight: 900,
    marginTop: "8px",
    boxShadow: "0 16px 32px rgba(124,58,237,0.22)",
  },
};