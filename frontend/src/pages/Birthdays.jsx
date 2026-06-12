import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MONTHS = [
  "All", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const BTS_BIRTHDAYS = [
  { name: "Jin", date: "December 4", month: 12, emoji: "🐹" },
  { name: "SUGA", date: "March 9", month: 3, emoji: "🐱" },
  { name: "j-hope", date: "February 18", month: 2, emoji: "🐿️" },
  { name: "RM", date: "September 12", month: 9, emoji: "🐨" },
  { name: "Jimin", date: "October 13", month: 10, emoji: "🐥" },
  { name: "V", date: "December 30", month: 12, emoji: "🐯" },
  { name: "Jung Kook", date: "September 1", month: 9, emoji: "🐰" },
  { name: "BTS Debut", date: "June 13", month: 6, emoji: "💜", special: true },
  { name: "ARMY Day", date: "July 9", month: 7, emoji: "💜", special: true },
];

export default function Birthdays() {
  const [birthdays, setBirthdays] = useState([]);
  const [birthdayPosts, setBirthdayPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [btsMonth, setBtsMonth] = useState("All");
  const [activeTab, setActiveTab] = useState("army");
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    for_username: "",
    message: "",
    file: null,
  });
  const [commentText, setCommentText] = useState({});
  const [specialDays, setSpecialDays] = useState([]);
  const [showSpecialForm, setShowSpecialForm] = useState(false);
  const [editingSpecialDay, setEditingSpecialDay] = useState(null);

  const [specialForm, setSpecialForm] = useState({
    title: "",
    date: "",
    description: "",
  });

  const navigate = useNavigate();
  const today = new Date();

  useEffect(() => {
    API.get("/auth/me").then((res) => setCurrentUser(res.data)).catch(() => navigate("/login"));
    API.get("/birthdays").then((res) => setBirthdays(res.data || []));
    API.get("/birthday-posts").then((res) => setBirthdayPosts(res.data || []));
    API.get("/special-days")
      .then((res) => setSpecialDays(res.data || []))
      .catch(() => { });
  }, [navigate]);

  const imageUrl = (path) => `http://127.0.0.1:8000/${path}`;

  const isBirthdayToday = (birthday) => {
    if (!birthday) return false;
    const date = new Date(birthday);
    return date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not added";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const todayBirthdays = birthdays.filter((m) => isBirthdayToday(m.birthday));

  const thisMonthBirthdays = birthdays.filter((m) => {
    if (!m.birthday) return false;
    return new Date(m.birthday).getMonth() === today.getMonth();
  });

  const filteredArmy = birthdays.filter((m) => {
    if (!m.birthday) return false;
    const date = new Date(m.birthday);
    const matchMonth =
      monthFilter === "All" || date.getMonth() === MONTHS.indexOf(monthFilter) - 1;

    const name = `${m.username || ""} ${m.nickname || ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());

    return matchMonth && matchSearch;
  });

  const filteredBts = BTS_BIRTHDAYS.filter(
    (m) => btsMonth === "All" || m.month === MONTHS.indexOf(btsMonth)
  );

  const handlePost = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("for_username", postForm.for_username);
    formData.append("message", postForm.message);
    if (postForm.file) formData.append("file", postForm.file);

    try {
      await API.post("/birthday-posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await API.get("/birthday-posts");
      setBirthdayPosts(res.data || []);
      setPostForm({ for_username: "", message: "", file: null });
      setShowPostForm(false);
    } catch {
      alert("Failed to post");
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]) return;

    const formData = new FormData();
    formData.append("content", commentText[postId]);

    try {
      await API.post(`/birthday-comments/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await API.get("/birthday-posts");
      setBirthdayPosts(res.data || []);
      setCommentText({ ...commentText, [postId]: "" });
    } catch {
      alert("Failed to comment");
    }
  };


  const loadBirthdayData = async () => {
    const res = await API.get("/birthdays");
    setBirthdays(res.data || []);
  };

  const handleRemoveMember = async (member) => {
    const displayName = member.nickname || member.username || "this member";

    if (!window.confirm(`Remove ${displayName} from Purple Family? This will delete their account permanently.`)) {
      return;
    }

    try {
      await API.delete(`/members/${member.id}`);
      await loadBirthdayData();
      alert(`${displayName} removed successfully.`);
    } catch (err) {
      console.error("Remove member error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Failed to remove member. Admin only.");
    }
  };

  const refreshSpecialDays = async () => {
    const res = await API.get("/special-days");
    setSpecialDays(res.data || []);
  };

  const saveSpecialDay = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", specialForm.title);
    formData.append("date", specialForm.date);
    formData.append("description", specialForm.description);

    try {
      if (editingSpecialDay) {
        await API.put(
          `/special-days/${editingSpecialDay.id}`,
          formData
        );
      } else {
        await API.post("/special-days", formData);
      }

      await refreshSpecialDays();

      setSpecialForm({
        title: "",
        date: "",
        description: "",
      });

      setEditingSpecialDay(null);
      setShowSpecialForm(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed");
    }
  };

  const editSpecialDay = (day) => {
    setEditingSpecialDay(day);

    setSpecialForm({
      title: day.title,
      date: day.date,
      description: day.description || "",
    });

    setShowSpecialForm(true);
  };

  const deleteSpecialDay = async (day) => {
    if (!window.confirm(`Delete "${day.title}" ?`)) return;

    try {
      await API.delete(`/special-days/${day.id}`);
      await refreshSpecialDays();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <>
      <Navbar />

      <main style={styles.page}>
        <section style={styles.hero}>
          <div>
            <div style={styles.badge}>🎂 Purple Birthday Calendar</div>
            <h1 style={styles.title}>Celebrate every ARMY beautifully</h1>
            <p style={styles.subtitle}>
              Track birthdays, send wishes, celebrate BTS special days and make
              your Purple Family feel loved.
            </p>
          </div>

          <div style={styles.heroCard}>
            <span style={styles.heroEmoji}>🎉</span>
            <h2>{todayBirthdays.length}</h2>
            <p>Birthdays Today</p>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span>👥</span>
            <h3>{birthdays.length}</h3>
            <p>Total Birthdays</p>
          </div>

          <div style={styles.statCard}>
            <span>📅</span>
            <h3>{thisMonthBirthdays.length}</h3>
            <p>This Month</p>
          </div>

          <div style={styles.statCard}>
            <span>🎉</span>
            <h3>{todayBirthdays.length}</h3>
            <p>Today</p>
          </div>
        </section>

        <div style={styles.tabNav}>
          {[
            ["army", "🎂 ARMY Birthdays"],
            ["wishes", "🎉 Birthday Wishes"],
            ["bts", "💜 BTS Birthdays"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === key ? styles.activeTab : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "army" && (
          <section style={styles.panel}>
            <div style={styles.sectionHead}>
              <div>
                <h2 style={styles.sectionTitle}>ARMY Birthday Calendar</h2>
                <p style={styles.sectionText}>
                  Today is{" "}
                  {today.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  💜
                </p>
              </div>
            </div>

            {todayBirthdays.length > 0 && (
              <div style={styles.todayCard}>
                <h3>🎉 Today's Birthday Stars</h3>

                <div style={styles.todayList}>
                  {todayBirthdays.map((m) => (
                    <div key={m.id} style={styles.todayItem}>
                      {m.profile_picture ? (
                        <img
                          src={imageUrl(m.profile_picture)}
                          alt={m.username}
                          style={styles.avatarSmImg}
                        />
                      ) : (
                        <div style={styles.avatarSm}>
                          {(m.nickname || m.username)?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <div>
                        <strong>{m.nickname || m.username}</strong>
                        <p>Happy Birthday! 🎂💜</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.controls}>
              <input
                style={styles.search}
                placeholder="Search by name or nickname..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                style={styles.select}
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                {MONTHS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            {filteredArmy.length === 0 ? (
              <div style={styles.emptyCard}>
                <h3>No birthdays found 💜</h3>
                <p>Update your profile to add your birthday.</p>
              </div>
            ) : (
              <div style={styles.memberList}>
                {filteredArmy.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      ...styles.memberRow,
                      ...(isBirthdayToday(member.birthday)
                        ? styles.todayRowBorder
                        : {}),
                    }}
                  >
                    <div style={styles.memberLeft}>
                      {member.profile_picture ? (
                        <img
                          src={imageUrl(member.profile_picture)}
                          alt={member.username}
                          style={styles.listAvatarImg}
                        />
                      ) : (
                        <div style={styles.listAvatar}>
                          {(member.nickname || member.username)?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h3 style={styles.listUsername}>
                          {member.nickname || member.username}
                        </h3>
                        {member.username && member.nickname && (
                          <p style={styles.listSubName}>@{member.username}</p>
                        )}
                      </div>
                    </div>

                    <div style={styles.memberInfo}>
                      <span style={styles.listDate}>🎂 {formatDate(member.birthday)}</span>
                      {member.bias && <span style={styles.listBias}>💜 Bias: {member.bias}</span>}
                    </div>

                    <div style={styles.memberActions}>
                      {isBirthdayToday(member.birthday) && (
                        <div style={styles.listTodayBadge}>🎉 Today</div>
                      )}

                      {currentUser?.is_admin && currentUser?.id !== member.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          style={styles.removeMemberBtn}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "wishes" && (
          <section style={styles.panel}>
            <div style={styles.wishesHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Birthday Wishes</h2>
                <p style={styles.sectionText}>Share lovely purple wishes.</p>
              </div>

              <button
                onClick={() => setShowPostForm(!showPostForm)}
                style={styles.addBtn}
              >
                {showPostForm ? "Cancel" : "🎂 Add Birthday Wish"}
              </button>
            </div>

            {showPostForm && (
              <div style={styles.formCard}>
                <h3 style={styles.cardTitle}>Add Birthday Wish 💜</h3>

                <form onSubmit={handlePost} style={styles.form}>
                  <input
                    style={styles.input}
                    placeholder="For who? nickname / username"
                    value={postForm.for_username}
                    onChange={(e) =>
                      setPostForm({ ...postForm, for_username: e.target.value })
                    }
                    required
                  />

                  <textarea
                    style={styles.textarea}
                    placeholder="Write a birthday message 💜"
                    rows={4}
                    value={postForm.message}
                    onChange={(e) =>
                      setPostForm({ ...postForm, message: e.target.value })
                    }
                    required
                  />

                  <input
                    type="file"
                    accept="image/*"
                    style={styles.file}
                    onChange={(e) =>
                      setPostForm({ ...postForm, file: e.target.files[0] })
                    }
                  />

                  <button style={styles.button} type="submit">
                    Post Wish 💜
                  </button>
                </form>
              </div>
            )}

            {birthdayPosts.length === 0 ? (
              <div style={styles.emptyCard}>
                <h3>No birthday wishes yet 💜</h3>
                <p>Be the first to send one.</p>
              </div>
            ) : (
              <div style={styles.wishList}>
                {birthdayPosts.map((post) => (
                  <article key={post.id} style={styles.wishCard}>
                    <div style={styles.wishHeader}>
                      <div style={styles.avatarSm}>
                        {post.posted_by?.[0]?.toUpperCase()}
                      </div>

                      <div>
                        <strong>{post.posted_by}</strong>
                        <span style={styles.wishTo}>
                          {" "}
                          wishes Happy Birthday to{" "}
                        </span>
                        <strong style={{ color: "#7c3aed" }}>
                          {post.for_username}
                        </strong>

                        <p style={styles.postDate}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p style={styles.wishMessage}>{post.message}</p>

                    {post.image_path && (
                      <img
                        src={imageUrl(post.image_path)}
                        alt="birthday"
                        style={styles.wishImg}
                      />
                    )}

                    <div style={styles.comments}>
                      {post.comments.map((c) => (
                        <div key={c.id} style={styles.comment}>
                          <span style={styles.commentUser}>💜 {c.owner}</span>
                          <span style={styles.commentText}>{c.content}</span>
                        </div>
                      ))}

                      <div style={styles.commentForm}>
                        <input
                          style={styles.commentInput}
                          placeholder="Add a comment 💜"
                          value={commentText[post.id] || ""}
                          onChange={(e) =>
                            setCommentText({
                              ...commentText,
                              [post.id]: e.target.value,
                            })
                          }
                        />

                        <button
                          style={styles.commentBtn}
                          onClick={() => handleComment(post.id)}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "bts" && (
          <section style={styles.panel}>
            <div style={styles.sectionHead}>
              <div>
                <h2 style={styles.sectionTitle}>BTS Birthdays & Special Days</h2>
                <button
                  onClick={() => {
                    setEditingSpecialDay(null);
                    setShowSpecialForm(!showSpecialForm);
                  }}
                  style={styles.addBtn}
                >
                  {showSpecialForm ? "Cancel" : "➕ Add Special Day"}
                </button>
                <p style={styles.sectionText}>OT7 forever. Important purple days.</p>
              </div>

              <select
                style={styles.select}
                value={btsMonth}
                onChange={(e) => setBtsMonth(e.target.value)}
              >
                {MONTHS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            {showSpecialForm && (
              <div style={styles.formCard}>
                <h3>
                  {editingSpecialDay
                    ? "Edit Special Day"
                    : "Add Special Day"}
                </h3>

                <form onSubmit={saveSpecialDay} style={styles.form}>
                  <input
                    style={styles.input}
                    placeholder="Title"
                    value={specialForm.title}
                    onChange={(e) =>
                      setSpecialForm({
                        ...specialForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="date"
                    style={styles.input}
                    value={specialForm.date}
                    onChange={(e) =>
                      setSpecialForm({
                        ...specialForm,
                        date: e.target.value,
                      })
                    }
                    required
                  />

                  <textarea
                    style={styles.textarea}
                    placeholder="Description"
                    value={specialForm.description}
                    onChange={(e) =>
                      setSpecialForm({
                        ...specialForm,
                        description: e.target.value,
                      })
                    }
                  />

                  <button style={styles.button}>
                    {editingSpecialDay ? "Update" : "Create"}
                  </button>
                </form>
              </div>
            )}

            <div style={styles.grid}>

              {filteredBts.map((member) => (
                <div
                  key={member.name}
                  style={{
                    ...styles.card,
                    ...(member.special ? styles.specialCard : {}),
                  }}
                >
                  <div style={styles.btsEmoji}>{member.emoji}</div>
                  <h3 style={styles.username}>{member.name}</h3>
                  <p style={styles.date}>🎂 {member.date}</p>

                  {member.special && (
                    <div style={styles.specialBadge}>Special Day 💜</div>
                  )}
                </div>
              ))}
              {specialDays.length > 0 && (
                <>
                  <h2
                    style={{
                      marginTop: "30px",
                      marginBottom: "20px",
                    }}
                  >
                    🌟 ARMY Special Days
                  </h2>

                  <div style={styles.grid}>
                    {specialDays.map((day) => (
                      <div key={day.id} style={styles.card}>
                        <h3>{day.title}</h3>

                        <p>
                          📅{" "}
                          {new Date(day.date).toLocaleDateString()}
                        </p>

                        {day.description && (
                          <p>{day.description}</p>
                        )}

                        <small>
                          by{" "}
                          {day.created_by_nickname ||
                            day.created_by_username}
                        </small>

                        {(day.can_edit || day.can_delete) && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "10px",
                            }}
                          >
                            {day.can_edit && (
                              <button
                                onClick={() => editSpecialDay(day)}
                              >
                                ✏️ Edit
                              </button>
                            )}

                            {day.can_delete && (
                              <button
                                onClick={() => deleteSpecialDay(day)}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
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
    gridTemplateColumns: "1fr 260px",
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

  heroEmoji: {
    fontSize: "3rem",
  },

  statsGrid: {
    width: "min(1280px,100%)",
    margin: "0 auto 26px",
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "18px",
  },

  statCard: {
    padding: "24px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 36px rgba(76,29,149,0.08)",
  },

  tabNav: {
    width: "min(1280px,100%)",
    margin: "0 auto 24px",
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  tabBtn: {
    border: "1px solid rgba(124,58,237,0.18)",
    background: "rgba(255,255,255,0.82)",
    color: "#6d28d9",
    padding: "12px 20px",
    borderRadius: "999px",
    fontWeight: 900,
    cursor: "pointer",
  },

  activeTab: {
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    boxShadow: "0 14px 28px rgba(124,58,237,0.22)",
  },

  panel: {
    width: "min(1280px,100%)",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
  },

  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  sectionTitle: {
    color: "#241039",
    fontSize: "clamp(1.7rem,3vw,2.5rem)",
    letterSpacing: "-0.04em",
    marginBottom: "6px",
  },

  sectionText: {
    color: "#7c6a92",
  },

  todayCard: {
    padding: "24px",
    borderRadius: "28px",
    background: "linear-gradient(135deg,#fff7ed,#fdf2f8)",
    border: "1px solid rgba(236,72,153,0.18)",
    marginBottom: "24px",
  },

  todayList: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "14px",
  },

  todayItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "white",
    padding: "12px 16px",
    borderRadius: "18px",
  },

  controls: {
    display: "flex",
    gap: "14px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  search: {
    flex: 1,
    minWidth: "240px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
  },

  select: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    color: "#4c1d95",
    fontWeight: 800,
    outline: "none",
  },

  memberList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  memberRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    padding: "18px 22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 12px 28px rgba(76,29,149,0.07)",
  },

  todayRowBorder: {
    border: "2px solid #f59e0b",
    background: "linear-gradient(135deg,#fff7ed,#ffffff)",
  },

  memberLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  listAvatar: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: "1.35rem",
    fontWeight: 900,
    flexShrink: 0,
  },

  listAvatarImg: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #a855f7",
    flexShrink: 0,
  },

  listUsername: {
    color: "#4c1d95",
    margin: 0,
    fontSize: "1.1rem",
  },

  listSubName: {
    color: "#9ca3af",
    margin: "4px 0 0",
    fontSize: "0.85rem",
    fontWeight: 700,
  },

  memberInfo: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    color: "#7c6a92",
    fontWeight: 800,
  },

  memberActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  removeMemberBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "9px 16px",
    cursor: "pointer",
    fontWeight: 900,
  },

  listDate: {
    color: "#7c3aed",
  },

  listBias: {
    color: "#7c6a92",
  },

  listTodayBadge: {
    background: "#f59e0b",
    color: "white",
    padding: "7px 14px",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
  },

  card: {
    position: "relative",
    padding: "28px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(124,58,237,0.14)",
    textAlign: "center",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
  },

  todayBorder: {
    border: "2px solid #f59e0b",
    background: "linear-gradient(135deg,#fff7ed,#ffffff)",
  },

  todayBadge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#f59e0b",
    color: "white",
    padding: "5px 14px",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 900,
  },

  avatar: {
    width: "74px",
    height: "74px",
    borderRadius: "50%",
    margin: "0 auto 16px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: "1.8rem",
    fontWeight: 900,
  },

  avatarImg: {
    width: "74px",
    height: "74px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "16px",
    border: "3px solid #a855f7",
  },

  avatarSm: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    flexShrink: 0,
  },

  avatarSmImg: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #a855f7",
  },

  username: {
    color: "#4c1d95",
    marginBottom: "8px",
  },

  date: {
    color: "#7c3aed",
    fontWeight: 800,
    marginBottom: "8px",
  },

  bias: {
    color: "#7c6a92",
  },

  emptyCard: {
    padding: "50px 20px",
    borderRadius: "28px",
    background: "white",
    textAlign: "center",
    color: "#7c6a92",
  },

  wishesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  addBtn: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "13px 22px",
    fontWeight: 900,
    cursor: "pointer",
  },

  formCard: {
    padding: "24px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    marginBottom: "24px",
  },

  cardTitle: {
    color: "#4c1d95",
    marginBottom: "16px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
  },

  textarea: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
    resize: "vertical",
  },

  file: {
    color: "#4c1d95",
    fontWeight: 700,
  },

  button: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  wishList: {
    display: "grid",
    gap: "18px",
  },

  wishCard: {
    padding: "24px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
  },

  wishHeader: {
    display: "flex",
    gap: "12px",
    marginBottom: "14px",
  },

  wishTo: {
    color: "#7c6a92",
  },

  postDate: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    marginTop: "3px",
  },

  wishMessage: {
    color: "#241039",
    lineHeight: 1.8,
    marginBottom: "16px",
  },

  wishImg: {
    width: "100%",
    maxHeight: "360px",
    objectFit: "cover",
    borderRadius: "22px",
    marginBottom: "18px",
  },

  comments: {
    borderTop: "1px solid rgba(124,58,237,0.14)",
    paddingTop: "16px",
  },

  comment: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },

  commentUser: {
    color: "#7c3aed",
    fontWeight: 900,
  },

  commentText: {
    color: "#4b5563",
  },

  commentForm: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },

  commentInput: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
  },

  commentBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#7c3aed",
    color: "white",
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },

  btsEmoji: {
    fontSize: "3rem",
    marginBottom: "12px",
  },

  specialCard: {
    background: "linear-gradient(135deg,#f3e8ff,#fdf2f8)",
    border: "2px solid rgba(124,58,237,0.35)",
  },

  specialBadge: {
    display: "inline-flex",
    padding: "7px 14px",
    borderRadius: "999px",
    background: "#7c3aed",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: 900,
  },
};