import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jinImg from "../assets/bts-members/jin.jpg";
import sugaImg from "../assets/bts-members/suga.jpg";
import jhopeImg from "../assets/bts-members/jhope.jpg";
import rmImg from "../assets/bts-members/rm.jpg";
import jiminImg from "../assets/bts-members/jimin.jpg";
import vImg from "../assets/bts-members/v.jpg";
import jungkookImg from "../assets/bts-members/jungkook.jpg";
import btsDebutImg from "../assets/bts-members/bts-debut.png";
import armyDayImg from "../assets/bts-members/army-day.jpg";

const MONTHS = [
  "All", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DEFAULT_BTS_EVENTS = [
  { title: "Jin", date: "December 4", month: 12, image_url: "/src/assets/bts-members/jin.jpg", isDefault: true },
  { title: "SUGA", date: "March 9", month: 3, image_url: "/src/assets/bts-members/suga.jpg", isDefault: true },
  { title: "j-hope", date: "February 18", month: 2, image_url: "/src/assets/bts-members/jhope.jpg", isDefault: true },
  { title: "RM", date: "September 12", month: 9, image_url: "/src/assets/bts-members/rm.jpg", isDefault: true },
  { title: "Jimin", date: "October 13", month: 10, image_url: "/src/assets/bts-members/jimin.jpg", isDefault: true },
  { title: "V", date: "December 30", month: 12, image_url: "/src/assets/bts-members/v.jpg", isDefault: true },
  { title: "Jung Kook", date: "September 1", month: 9, image_url: "/src/assets/bts-members/jungkook.jpg", isDefault: true },
  { title: "BTS Debut", date: "June 13", month: 6, image_url: "/src/assets/bts-debut.png", isDefault: true, isSpecial: true },
  { title: "ARMY Day", date: "July 9", month: 7, image_url: "/src/assets/army-day.jpg", isDefault: true, isSpecial: true },
];;

const getSavedBtsEvents = () => {
  try {
    const saved = localStorage.getItem("purple_family_bts_events");
    return saved ? JSON.parse(saved) : DEFAULT_BTS_EVENTS;
  } catch {
    return DEFAULT_BTS_EVENTS;
  }
};

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
  const [btsEvents, setBtsEvents] = useState(getSavedBtsEvents);
  const [showBtsForm, setShowBtsForm] = useState(false);
  const [editingBtsEvent, setEditingBtsEvent] = useState(null);
  const [btsForm, setBtsForm] = useState({
  name: "",
  month: 1,
  day: 1,
  image: "",
  special: false,
  file: null,  
});

  const [specialForm, setSpecialForm] = useState({
    title: "",
    date: "",
    description: "",
    file: null,
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

  const imageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `https://purple-family-website.onrender.com/${path}`;
  };

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

  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  const todayBirthdays = birthdays.filter((m) => isBirthdayToday(m.birthday));

  const thisMonthBirthdays = birthdays.filter((m) => {
    if (!m.birthday) return false;
    return new Date(m.birthday).getMonth() === today.getMonth();
  });

  const isBtsEventToday = (event) =>
    Number(event.month) === todayMonth && Number(event.day) === todayDate;

  const isSpecialDayToday = (day) => {
    if (!day?.date) return false;
    const date = new Date(day.date);
    return date.getMonth() + 1 === todayMonth && date.getDate() === todayDate;
  };

  const isSpecialDayThisMonth = (day) => {
    if (!day?.date) return false;
    return new Date(day.date).getMonth() + 1 === todayMonth;
  };

  const todayBtsEvents = btsEvents.filter(isBtsEventToday);
  const todaySpecialDays = specialDays.filter(isSpecialDayToday);
  const thisMonthBtsEvents = btsEvents.filter((event) => Number(event.month) === todayMonth);
  const thisMonthSpecialDays = specialDays.filter(isSpecialDayThisMonth);

  const totalTodayEvents =
    todayBirthdays.length + todayBtsEvents.length + todaySpecialDays.length;

  const totalThisMonthEvents =
    thisMonthBirthdays.length + thisMonthBtsEvents.length + thisMonthSpecialDays.length;

  const filteredArmy = birthdays.filter((m) => {
    if (!m.birthday) return false;
    const date = new Date(m.birthday);
    const matchMonth =
      monthFilter === "All" || date.getMonth() === MONTHS.indexOf(monthFilter) - 1;

    const name = `${m.username || ""} ${m.nickname || ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());

    return matchMonth && matchSearch;
  });

  const filteredBts = btsEvents.filter(
    (m) => btsMonth === "All" || Number(m.month) === MONTHS.indexOf(btsMonth)
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

    if (specialForm.file) {
      formData.append("file", specialForm.file);
    }

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
        file: null,
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

  const monthDayToDateLabel = (month, day) => `${MONTHS[Number(month)]} ${Number(day)}`;

  const persistBtsEvents = (events) => {
    setBtsEvents(events);
    localStorage.setItem("purple_family_bts_events", JSON.stringify(events));
  };

  const openAddBtsEvent = () => {
    setEditingBtsEvent(null);
    setBtsForm({ name: "", month: todayMonth, day: todayDate, image: "", special: false });
    setShowBtsForm(true);
  };

  const editBtsEvent = (event) => {
    setEditingBtsEvent(event);
    setBtsForm({
      name: event.name || "",
      month: Number(event.month) || 1,
      day: Number(event.day) || 1,
      image: event.image || "",
      special: Boolean(event.special),
    });
    setShowBtsForm(true);
  };

  const saveBtsEvent = (e) => {
    e.preventDefault();

    const cleanName = btsForm.name.trim();
    if (!cleanName) return alert("Name is required");

    const month = Number(btsForm.month);
    const day = Number(btsForm.day);

    const payload = {
      id: editingBtsEvent?.id || `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: cleanName,
      month,
      day,
      date: monthDayToDateLabel(month, day),
      image: btsForm.image.trim(),
      emoji: "💜",
      special: Boolean(btsForm.special),
    };

    const updated = editingBtsEvent
      ? btsEvents.map((item) => (item.id === editingBtsEvent.id ? payload : item))
      : [...btsEvents, payload];

    persistBtsEvents(updated);
    setShowBtsForm(false);
    setEditingBtsEvent(null);
  };

  const deleteBtsEvent = (event) => {
    if (!window.confirm(`Delete "${event.name}"?`)) return;
    persistBtsEvents(btsEvents.filter((item) => item.id !== event.id));
  };

  const resetBtsEvents = () => {
    if (!window.confirm("Reset BTS birthdays and special days to default?")) return;
    persistBtsEvents(DEFAULT_BTS_EVENTS);
  };

  return (
    <>
      <Navbar />

      <main className="birthdays-page" style={styles.page}>
        <section className="birthdays-hero" style={styles.hero}>
          <div>
            <div style={styles.badge}>🎂 Purple Birthday Calendar</div>
            <h1 style={styles.title}>Celebrate every ARMY beautifully</h1>
            <p style={styles.subtitle}>
              Track birthdays, send wishes, celebrate BTS special days and make
              your Purple Family feel loved.
            </p>
          </div>

          <div className="birthdays-hero-card" style={styles.heroCard}>
            <span style={styles.heroEmoji}>🎉</span>
            <h2>{totalTodayEvents}</h2>
            <p>Birthdays Today</p>
          </div>
        </section>

        <section className="birthdays-stats" style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span>👥</span>
            <h3>{birthdays.length}</h3>
            <p>Total Birthdays</p>
          </div>

          <div style={styles.statCard}>
            <span>📅</span>
            <h3>{totalThisMonthEvents}</h3>
            <p>This Month</p>
          </div>

          <div style={styles.statCard}>
            <span>🎉</span>
            <h3>{totalTodayEvents}</h3>
            <p>Today</p>
          </div>
        </section>

        <div className="birthdays-tabs" style={styles.tabNav}>
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
          <section className="birthdays-panel" style={styles.panel}>
            <div className="birthdays-section-head" style={styles.sectionHead}>
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
              <div className="birthdays-today-card" style={styles.todayCard}>
                <h3>🎉 Today's Birthday Stars</h3>

                <div className="birthdays-today-list" style={styles.todayList}>
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

            <div className="birthdays-controls" style={styles.controls}>
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
              <div className="birthdays-member-list" style={styles.memberList}>
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
                    <div className="birthdays-member-left" style={styles.memberLeft}>
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

                    <div className="birthdays-member-info" style={styles.memberInfo}>
                      <span style={styles.listDate}>🎂 {formatDate(member.birthday)}</span>
                      {member.bias && <span style={styles.listBias}>💜 Bias: {member.bias}</span>}
                    </div>

                    <div className="birthdays-member-actions" style={styles.memberActions}>
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
          <section className="birthdays-panel" style={styles.panel}>
            <div className="birthdays-wishes-header" style={styles.wishesHeader}>
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
              <div className="birthdays-form-card" style={styles.formCard}>
                <h3 style={styles.cardTitle}>Add Birthday Wish 💜</h3>

                <form className="birthdays-form" onSubmit={handlePost} style={styles.form}>
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
              <div className="birthdays-wish-list" style={styles.wishList}>
                {birthdayPosts.map((post) => (
                  <article className="birthdays-wish-card" key={post.id} style={styles.wishCard}>
                    <div className="birthdays-wish-header" style={styles.wishHeader}>
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

                      <div className="birthdays-comment-form" style={styles.commentForm}>
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
          <section className="birthdays-panel" style={styles.panel}>
            <div className="birthdays-section-head" style={styles.sectionHead}>
              <div>
                <h2 style={styles.sectionTitle}>BTS Birthdays & Special Days</h2>
                <div style={styles.inlineActions}>
                  {currentUser && (
                    <button onClick={openAddBtsEvent} style={styles.addBtn}>
                      ➕ Add BTS Day
                    </button>
                  )}

                </div>
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
            {showBtsForm && currentUser && (
              <div className="birthdays-form-card" style={styles.formCard}>
                <h3>{editingBtsEvent ? "Edit BTS Birthday / Special Day" : "Add BTS Birthday / Special Day"}</h3>

                <form className="birthdays-form" onSubmit={saveBtsEvent} style={styles.form}>
                  <input
                    style={styles.input}
                    placeholder="Name e.g. BTS Debut"
                    value={btsForm.name}
                    onChange={(e) => setBtsForm({ ...btsForm, name: e.target.value })}
                    required
                  />

                  <select
                    style={styles.input}
                    value={btsForm.month}
                    onChange={(e) => setBtsForm({ ...btsForm, month: Number(e.target.value) })}
                  >
                    {MONTHS.slice(1).map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="31"
                    style={styles.input}
                    value={btsForm.day}
                    onChange={(e) => setBtsForm({ ...btsForm, day: Number(e.target.value) })}
                    required
                  />

                  <input
                    style={styles.input}
                    placeholder="Image path optional"
                    value={btsForm.image}
                    onChange={(e) => setBtsForm({ ...btsForm, image: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={styles.input}
                    onChange={(e) =>
                      setBtsForm({
                        ...btsForm,
                        file: e.target.files?.[0] || null,
                      })
                    }
                  />

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={btsForm.special}
                      onChange={(e) => setBtsForm({ ...btsForm, special: e.target.checked })}
                    />
                    Special Day
                  </label>

                  <button style={styles.button}>
                    {editingBtsEvent ? "Update BTS Day" : "Create BTS Day"}
                  </button>
                </form>
              </div>
            )}

            {showSpecialForm && (
              <div className="birthdays-form-card" style={styles.formCard}>
                <h3>
                  {editingSpecialDay
                    ? "Edit Special Day"
                    : "Add Special Day"}
                </h3>

                <form className="birthdays-form" onSubmit={saveSpecialDay} style={styles.form}>
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

                  <input
                    type="file"
                    accept="image/*"
                    style={styles.input}
                    onChange={(e) =>
                      setSpecialForm({
                        ...specialForm,
                        file: e.target.files?.[0] || null,
                      })
                    }
                  />

                  <button style={styles.button}>
                    {editingSpecialDay ? "Update" : "Create"}
                  </button>
                </form>
              </div>
            )}

            <div className="birthdays-grid" style={styles.grid}>

              {filteredBts.map((member) => {
                const isToday = isBtsEventToday(member);

                return (
                  <div
                    key={member.id || member.name}
                    style={{
                      ...styles.card,
                      ...(member.special ? styles.specialCard : {}),
                      ...(isToday ? styles.todayRowBorder : {}),
                    }}
                  >
                    {(member.image || member.image_url) ? (
                      <img
                        src={member.image || member.image_url}
                        alt={member.name}
                        style={styles.btsImage}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={styles.btsEmoji}>{member.emoji || "💜"}</div>
                    )}

                    <h3 style={styles.username}>{member.name}</h3>
                    <p style={styles.date}>🎂 {member.date || monthDayToDateLabel(member.month, member.day)}</p>

                    {member.special && (
                      <div style={styles.specialBadge}>Special Day 💜</div>
                    )}

                    {isToday && (
                      <div style={styles.todayBadge}>🎉 Today</div>
                    )}

                    {currentUser?.is_admin && (
                      <div style={styles.cardActions}>
                        <button style={styles.editBtn} onClick={() => editBtsEvent(member)}>
                          Edit
                        </button>
                        <button style={styles.deleteBtn} onClick={() => deleteBtsEvent(member)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </section>
        )}
      </main>
      <BirthdaysResponsiveStyles />

      <Footer />
    </>
  );
}


function BirthdaysResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .birthdays-page {
          padding: 24px 14px !important;
          overflow-x: hidden !important;
        }

        .birthdays-hero {
          grid-template-columns: 1fr !important;
          padding: 32px 22px !important;
          border-radius: 28px !important;
          text-align: center !important;
          gap: 18px !important;
        }

        .birthdays-hero-card {
          min-height: 170px !important;
          border-radius: 26px !important;
        }

        .birthdays-stats {
          grid-template-columns: 1fr !important;
          gap: 14px !important;
        }

        .birthdays-tabs {
          justify-content: flex-start !important;
          overflow-x: auto !important;
          flex-wrap: nowrap !important;
          padding: 4px 2px 8px !important;
          scrollbar-width: none !important;
        }

        .birthdays-tabs::-webkit-scrollbar {
          display: none !important;
        }

        .birthdays-tabs button {
          flex: 0 0 auto !important;
          white-space: nowrap !important;
          padding: 11px 16px !important;
          font-size: 0.9rem !important;
        }

        .birthdays-panel {
          padding: 20px !important;
          border-radius: 28px !important;
        }

        .birthdays-section-head,
        .birthdays-wishes-header {
          flex-direction: column !important;
          align-items: stretch !important;
          text-align: left !important;
        }

        .birthdays-controls {
          flex-direction: column !important;
          gap: 12px !important;
        }

        .birthdays-controls input,
        .birthdays-controls select {
          width: 100% !important;
          min-width: 0 !important;
        }

        .birthdays-today-card {
          padding: 20px !important;
          border-radius: 24px !important;
        }

        .birthdays-today-list {
          flex-direction: column !important;
        }

        .birthdays-member-list {
          gap: 12px !important;
        }

        .birthdays-member-list > div {
          flex-direction: column !important;
          align-items: flex-start !important;
          padding: 18px !important;
          border-radius: 22px !important;
        }

        .birthdays-member-left,
        .birthdays-member-info,
        .birthdays-member-actions {
          width: 100% !important;
          justify-content: flex-start !important;
        }

        .birthdays-member-info {
          gap: 8px !important;
          flex-direction: column !important;
          align-items: flex-start !important;
        }

        .birthdays-member-actions button {
          width: 100% !important;
        }

        .birthdays-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }

        .birthdays-form-card,
        .birthdays-wish-card {
          padding: 20px !important;
          border-radius: 24px !important;
        }

        .birthdays-form input,
        .birthdays-form textarea,
        .birthdays-form button {
          width: 100% !important;
        }

        .birthdays-wish-header {
          align-items: flex-start !important;
        }

        .birthdays-comment-form {
          flex-direction: column !important;
        }

        .birthdays-comment-form input,
        .birthdays-comment-form button {
          width: 100% !important;
        }
      }

      @media (max-width: 480px) {
        .birthdays-page {
          padding: 20px 12px !important;
        }

        .birthdays-hero {
          padding: 28px 18px !important;
        }

        .birthdays-hero-card {
          min-height: 150px !important;
        }

        .birthdays-panel {
          padding: 16px !important;
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

  btsImage: {
    width: "94px",
    height: "94px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "14px",
    border: "3px solid rgba(124,58,237,0.25)",
    boxShadow: "0 14px 28px rgba(76,29,149,0.16)",
  },

  btsEmoji: {
    fontSize: "3rem",
    marginBottom: "12px",
  },

  inlineActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    margin: "12px 0",
  },

  secondarySmallBtn: {
    border: "1px solid rgba(124,58,237,0.2)",
    background: "white",
    color: "#5b21b6",
    borderRadius: "999px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 900,
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#4c1d95",
    fontWeight: 800,
  },

  cardActions: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "12px",
  },

  editBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },

  deleteBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },

  todayBadge: {
    display: "inline-flex",
    padding: "7px 14px",
    borderRadius: "999px",
    background: "#22c55e",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: 900,
    marginTop: "10px",
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
  specialDayImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "16px",
    marginBottom: "12px",
  },
};