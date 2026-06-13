import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import btsHero from "../assets/bts-hero1.jpg";

const API_BASE = "http://127.0.0.1:8000";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({ title: "", content: "" });
  const [posting, setPosting] = useState(false);

  const displayName = user?.nickname || user?.username || "ARMY";

  useEffect(() => {
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const [meRes, birthdayRes, membersRes, postsRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/birthdays/today").catch(() => ({ data: [] })),
        API.get("/members").catch(() => ({ data: [] })),
        API.get("/posts").catch(() => ({ data: [] })),
      ]);

      setUser(meRes.data);
      setBirthdays(birthdayRes.data || []);
      setMembers(membersRes.data || []);
      setPosts(postsRes.data || []);
    } catch {
      navigate("/login");
    }
  };

  const imageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API_BASE}/${path}`;
  };

  const getAuthorName = (post) =>
    post.nickname || post.username || "ARMY";

  const getInitial = (name) =>
    (name || "A").trim().charAt(0).toUpperCase();

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!postForm.title.trim() || !postForm.content.trim()) {
      alert("Please add title and message 💜");
      return;
    }

    try {
      setPosting(true);
      await API.post("/posts", {
        title: postForm.title.trim(),
        content: postForm.content.trim(),
      });

      setPostForm({ title: "", content: "" });
      const postsRes = await API.get("/posts");
      setPosts(postsRes.data || []);
    } catch (err) {
      alert(err.response?.data?.detail || "Post failed");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm("Delete this ARMY feed post?")) return;

    try {
      await API.delete(`/posts/${post.id}`);
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  const cards = [
    {
      title: "Birthday Calendar",
      icon: "🎂",
      text: "Celebrate ARMY birthdays and post wishes.",
      path: "/birthdays",
      color: "linear-gradient(135deg,#f472b6,#a855f7)",
    },
    {
      title: "Wallpaper Gallery",
      icon: "🖼️",
      text: "Upload, like and download beautiful BTS wallpapers.",
      path: "/wallpapers",
      color: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    },
    {
      title: "Members",
      icon: "👥",
      text: "See Purple Family members, countries and bias.",
      path: "/members",
      color: "linear-gradient(135deg,#7c3aed,#ec4899)",
    },
    {
      title: "Sing-Along",
      icon: "🎵",
      text: "Add BTS songs, lyrics, albums and YouTube links.",
      path: "/singalong",
      color: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    },
    {
      title: "BTS Quiz",
      icon: "🎮",
      text: "Create quiz topics and test ARMY knowledge.",
      path: "/quiz",
      color: "linear-gradient(135deg,#ec4899,#f97316)",
    },
    {
      title: "Edit Profile",
      icon: "👤",
      text: "Update nickname, profile photo, country and bias.",
      path: "/edit-profile",
      color: "linear-gradient(135deg,#9333ea,#db2777)",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="dashboard-page" style={styles.page}>
        <section className="dashboard-hero" style={styles.hero}>
          <div className="dashboard-hero-content" style={styles.heroContent}>
            <div style={styles.badge}>💜 Welcome back, {displayName}</div>

            <h1 style={styles.title}>Your Purple Family ARMY Feed</h1>

            <p style={styles.subtitle}>
              Share updates, memories, BTS love, birthday wishes and community
              moments with your SL ARMY family.
            </p>

            <div style={styles.heroActions}>
              <button
                style={styles.primaryBtn}
                onClick={() => document.getElementById("army-feed-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Write Feed Post 💜
              </button>

              <button
                style={styles.secondaryBtn}
                onClick={() => navigate("/quiz")}
              >
                Play Quiz 🎮
              </button>
            </div>
          </div>

          <div className="dashboard-hero-panel" style={styles.heroPanel}>
            <h2 style={styles.panelTitle}>SL BTS ARMY</h2>
            <p style={styles.panelText}>
              A soft, modern and loving space for your purple community.
            </p>
          </div>
        </section>

        <section className="dashboard-stats" style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <h3 style={styles.statNumber}>{members.length}</h3>
            <p style={styles.statText}>Total Members</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎂</span>
            <h3 style={styles.statNumber}>{birthdays.length}</h3>
            <p style={styles.statText}>Today Birthdays</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>💌</span>
            <h3 style={styles.statNumber}>{posts.length}</h3>
            <p style={styles.statText}>Feed Posts</p>
          </div>
        </section>

        {birthdays.length > 0 && (
          <section style={styles.birthdayBox}>
            <div>
              <h2 style={styles.boxTitle}>🎉 Today&apos;s Birthday</h2>
              <p style={styles.boxText}>Don&apos;t forget to send purple wishes!</p>
            </div>

            <div style={styles.birthdayList}>
              {birthdays.map((b) => (
                <span key={b.id} style={styles.birthdayPill}>
                  💜 {b.nickname || b.username}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="dashboard-feed-layout" style={styles.feedLayout}>
          <div>
            <section id="army-feed-form" style={styles.feedComposer}>
              <div style={styles.feedComposerHeader}>
                <div style={styles.myAvatar}>
                  {user?.profile_picture ? (
                    <img
                      src={imageUrl(user.profile_picture)}
                      alt={displayName}
                      style={styles.myAvatarImg}
                    />
                  ) : (
                    getInitial(displayName)
                  )}
                </div>

                <div>
                  <h2 style={styles.feedTitle}>💜 ARMY Feed</h2>
                  <p style={styles.feedSubText}>
                    All ARMY can share posts. Newest posts show first.
                  </p>
                </div>
              </div>

              <form style={styles.feedForm} onSubmit={handleCreatePost}>
                <input
                  style={styles.feedInput}
                  placeholder="Post title..."
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                />

                <textarea
                  style={styles.feedTextarea}
                  placeholder="Share something with Purple Family..."
                  rows={4}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                />

                <button style={styles.postBtn} type="submit" disabled={posting}>
                  {posting ? "Posting..." : "Post to ARMY Feed 💜"}
                </button>
              </form>
            </section>

            <section style={styles.feedList}>
              {posts.length === 0 ? (
                <div style={styles.emptyFeed}>
                  <h3>No ARMY posts yet 💜</h3>
                  <p>Be the first to write something beautiful.</p>
                </div>
              ) : (
                posts.map((post) => {
                  const author = getAuthorName(post);
                  const canDelete = user?.is_admin || user?.id === post.owner_id;

                  return (
                    <article key={post.id} style={styles.feedPost}>
                      <div style={styles.postHeader}>
                        <div style={styles.postAuthorBox}>
                          <div style={styles.postAvatar}>
                            {post.profile_picture ? (
                              <img
                                src={imageUrl(post.profile_picture)}
                                alt={author}
                                style={styles.postAvatarImg}
                              />
                            ) : (
                              getInitial(author)
                            )}
                          </div>

                          <div>
                            <strong style={styles.postAuthor}>{author}</strong>
                            <p style={styles.postDate}>{formatDate(post.created_at)}</p>
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            style={styles.deletePostBtn}
                            onClick={() => handleDeletePost(post)}
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      <h3 style={styles.postTitle}>{post.title}</h3>
                      <p style={styles.postContent}>{post.content}</p>

                      {post.bias && (
                        <span style={styles.biasPill}>💜 Bias: {post.bias}</span>
                      )}
                    </article>
                  );
                })
              )}
            </section>
          </div>

          <aside className="dashboard-quick-panel" style={styles.quickPanel}>
            <h3 style={styles.quickTitle}>Quick Actions</h3>
            {cards.map((card) => (
              <button
                key={card.title}
                style={styles.quickBtn}
                onClick={() => navigate(card.path)}
              >
                <span>{card.icon}</span>
                {card.title}
              </button>
            ))}
          </aside>
        </section>

        <section style={styles.sectionHeader}>
          <p style={styles.kicker}>Explore</p>
          <h2 style={styles.sectionTitle}>What do you want to do?</h2>
        </section>

        <section className="dashboard-card-grid" style={styles.cardGrid}>
          {cards.map((card) => (
            <article key={card.title} style={styles.featureCard}>
              <div style={{ ...styles.cardIcon, background: card.color }}>
                {card.icon}
              </div>

              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardText}>{card.text}</p>

              <button
                style={styles.cardButton}
                onClick={() => navigate(card.path)}
              >
                Open →
              </button>
            </article>
          ))}
        </section>
        <DashboardResponsiveStyles />
      </main>

      <Footer />
    </>
  );
}
function DashboardResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .dashboard-page {
          padding: 24px 14px !important;
        }

        .dashboard-hero {
          grid-template-columns: 1fr !important;
          gap: 18px !important;
        }

        .dashboard-hero-content {
          padding: 32px 22px !important;
          border-radius: 28px !important;
          text-align: center !important;
        }

        .dashboard-hero-panel {
          min-height: 260px !important;
          border-radius: 28px !important;
          padding: 26px !important;
        }

        .dashboard-stats {
          grid-template-columns: 1fr !important;
          gap: 14px !important;
        }

        .dashboard-feed-layout {
          grid-template-columns: 1fr !important;
          gap: 20px !important;
        }

        .dashboard-quick-panel {
          position: static !important;
        }

        .dashboard-card-grid {
          grid-template-columns: 1fr !important;
        }
      }

      @media (max-width: 480px) {
        .dashboard-hero-content {
          padding: 28px 18px !important;
        }

        .dashboard-hero-panel {
          min-height: 220px !important;
        }
      }
    `}</style>
  );
}

const styles = {
  page: {
    width: "100%",
    padding: "40px clamp(16px, 4vw, 64px)",
  },

  hero: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.35fr 0.75fr",
    gap: "28px",
    alignItems: "stretch",
  },

  heroContent: {
    padding: "54px",
    borderRadius: "34px",
    background:
      "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(243,232,255,0.9))",
    border: "1px solid rgba(124,58,237,0.16)",
    boxShadow: "0 25px 70px rgba(76,29,149,0.14)",
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
    fontSize: "clamp(2.4rem,5vw,4.8rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    color: "#241039",
    maxWidth: "780px",
    marginBottom: "20px",
  },

  subtitle: {
    color: "#6b5a80",
    lineHeight: 1.8,
    fontSize: "1.05rem",
    maxWidth: "650px",
  },

  heroActions: {
    display: "flex",
    gap: "14px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    border: "none",
    borderRadius: "999px",
    padding: "14px 25px",
    cursor: "pointer",
    color: "white",
    fontWeight: 900,
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    boxShadow: "0 16px 32px rgba(124,58,237,0.25)",
  },

  secondaryBtn: {
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "999px",
    padding: "14px 25px",
    cursor: "pointer",
    color: "#5b21b6",
    fontWeight: 900,
    background: "rgba(255,255,255,0.72)",
  },

  heroPanel: {
    minHeight: "330px",
    borderRadius: "34px",
    padding: "34px",
    color: "white",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    border: "1px solid rgba(255,255,255,0.15)",
    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15)), url(${btsHero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 25px 70px rgba(76,29,149,0.18)",
  },

  panelTitle: {
    fontSize: "2rem",
    marginBottom: "10px",
  },

  panelText: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.7,
  },

  statsGrid: {
    width: "min(1280px,100%)",
    margin: "26px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "18px",
  },

  statCard: {
    padding: "26px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  statIcon: { fontSize: "2rem" },
  statNumber: { color: "#4c1d95", fontSize: "2.1rem", marginTop: "10px" },
  statText: { color: "#7c6a92", fontWeight: 700 },

  birthdayBox: {
    width: "min(1280px,100%)",
    margin: "26px auto 0",
    padding: "28px",
    borderRadius: "28px",
    background: "linear-gradient(135deg,#fdf2f8,#f3e8ff)",
    border: "1px solid rgba(236,72,153,0.2)",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  boxTitle: { color: "#831843", marginBottom: "6px" },
  boxText: { color: "#9d174d" },

  birthdayList: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  birthdayPill: {
    padding: "10px 15px",
    borderRadius: "999px",
    background: "white",
    color: "#7c3aed",
    fontWeight: 900,
  },

  feedLayout: {
    width: "min(1280px,100%)",
    margin: "32px auto 0",
    display: "grid",
    gridTemplateColumns: "1fr 310px",
    gap: "24px",
    alignItems: "start",
  },

  feedComposer: {
    padding: "28px",
    borderRadius: "32px",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
    marginBottom: "20px",
  },

  feedComposerHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },

  myAvatar: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "1.4rem",
    overflow: "hidden",
    flexShrink: 0,
  },

  myAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  feedTitle: {
    color: "#241039",
    marginBottom: "4px",
  },

  feedSubText: {
    color: "#7c6a92",
    fontWeight: 700,
  },

  feedForm: {
    display: "grid",
    gap: "12px",
  },

  feedInput: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
    color: "#241039",
  },

  feedTextarea: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
    resize: "vertical",
    color: "#241039",
    lineHeight: 1.7,
  },

  postBtn: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "14px 20px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(124,58,237,0.2)",
  },

  feedList: {
    display: "grid",
    gap: "16px",
  },

  feedPost: {
    padding: "24px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
  },

  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "14px",
  },

  postAuthorBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  postAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    overflow: "hidden",
    flexShrink: 0,
  },

  postAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  postAuthor: {
    color: "#4c1d95",
  },

  postDate: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    marginTop: "3px",
  },

  deletePostBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "8px 13px",
    fontWeight: 900,
    cursor: "pointer",
  },

  postTitle: {
    color: "#241039",
    fontSize: "1.35rem",
    marginBottom: "8px",
  },

  postContent: {
    color: "#4b3b5f",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    marginBottom: "14px",
  },

  biasPill: {
    display: "inline-flex",
    padding: "8px 13px",
    borderRadius: "999px",
    background: "#f3e8ff",
    color: "#6d28d9",
    fontWeight: 900,
    fontSize: "0.85rem",
  },

  emptyFeed: {
    padding: "46px 20px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    textAlign: "center",
    color: "#7c6a92",
  },

  quickPanel: {
    position: "sticky",
    top: "100px",
    padding: "22px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
  },

  quickTitle: {
    color: "#241039",
    marginBottom: "14px",
  },

  quickBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(124,58,237,0.16)",
    background: "white",
    color: "#6d28d9",
    borderRadius: "18px",
    padding: "13px 14px",
    cursor: "pointer",
    fontWeight: 900,
    marginBottom: "10px",
    textAlign: "left",
  },

  sectionHeader: {
    width: "min(1280px,100%)",
    margin: "55px auto 24px",
  },

  kicker: {
    color: "#ec4899",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontWeight: 900,
    marginBottom: "8px",
  },

  sectionTitle: {
    fontSize: "clamp(2rem,4vw,3.2rem)",
    letterSpacing: "-0.04em",
    color: "#241039",
  },

  cardGrid: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "22px",
  },

  featureCard: {
    padding: "28px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 40px rgba(76,29,149,0.08)",
  },

  cardIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    fontSize: "1.8rem",
    marginBottom: "22px",
    boxShadow: "0 12px 24px rgba(124,58,237,0.22)",
  },

  cardTitle: { color: "#4c1d95", marginBottom: "10px", fontSize: "1.25rem" },
  cardText: { color: "#7c6a92", lineHeight: 1.7, marginBottom: "22px" },

  cardButton: {
    border: "none",
    background: "#f3e8ff",
    color: "#6d28d9",
    padding: "11px 17px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },
};
