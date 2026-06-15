import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
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

const API_BASE = "https://purple-family-website.onrender.com";

const MONTHS = [
  "All",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DEFAULT_BTS_EVENTS = [
  { id: "jin", name: "Jin", date: "December 4", month: 12, day: 4, image: jinImg, emoji: "🐹", isDefault: true },
  { id: "suga", name: "SUGA", date: "March 9", month: 3, day: 9, image: sugaImg, emoji: "🐱", isDefault: true },
  { id: "jhope", name: "j-hope", date: "February 18", month: 2, day: 18, image: jhopeImg, emoji: "🐿️", isDefault: true },
  { id: "rm", name: "RM", date: "September 12", month: 9, day: 12, image: rmImg, emoji: "🐨", isDefault: true },
  { id: "jimin", name: "Jimin", date: "October 13", month: 10, day: 13, image: jiminImg, emoji: "🐥", isDefault: true },
  { id: "v", name: "V", date: "December 30", month: 12, day: 30, image: vImg, emoji: "🐯", isDefault: true },
  { id: "jungkook", name: "Jung Kook", date: "September 1", month: 9, day: 1, image: jungkookImg, emoji: "🐰", isDefault: true },
  { id: "bts-debut", name: "BTS Debut", date: "June 13", month: 6, day: 13, image: btsDebutImg, emoji: "💜", special: true, isDefault: true },
  { id: "army-day", name: "ARMY Day", date: "July 9", month: 7, day: 9, image: armyDayImg, emoji: "💜", special: true, isDefault: true },
];

const dateLabelFromParts = (month, day) => `${MONTHS[Number(month)]} ${Number(day)}`;

const toFileUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE}/${path}`;
};

const specialDayToBtsEvent = (day) => {
  const date = new Date(day.date);
  return {
    id: `special-${day.id}`,
    specialDayId: day.id,
    name: day.title,
    date: date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    month: date.getMonth() + 1,
    day: date.getDate(),
    image: day.image_url,
    emoji: "💜",
    description: day.description,
    special: true,
    isDefault: false,
    createdBy: day.created_by_nickname || day.created_by_username,
    canEdit: day.can_edit,
    canDelete: day.can_delete,
    raw: day,
  };
};

export default function Birthdays() {
  const navigate = useNavigate();
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  const [currentUser, setCurrentUser] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [birthdayPosts, setBirthdayPosts] = useState([]);
  const [specialDays, setSpecialDays] = useState([]);
  const [activeTab, setActiveTab] = useState("army");
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [btsMonth, setBtsMonth] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ for_username: "", message: "", file: null });
  const [commentText, setCommentText] = useState({});

  const [showBtsForm, setShowBtsForm] = useState(false);
  const [editingBtsEvent, setEditingBtsEvent] = useState(null);
  const [btsForm, setBtsForm] = useState({
    name: "",
    month: todayMonth,
    day: todayDate,
    description: "",
    file: null,
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [meRes, birthdaysRes, postsRes, specialRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/birthdays"),
        API.get("/birthday-posts"),
        API.get("/special-days"),
      ]);

      setCurrentUser(meRes.data);
      setBirthdays(birthdaysRes.data || []);
      setBirthdayPosts(postsRes.data || []);
      setSpecialDays(specialRes.data || []);
    } catch (err) {
      console.error(err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const allBtsEvents = useMemo(
    () => [...DEFAULT_BTS_EVENTS, ...specialDays.map(specialDayToBtsEvent)],
    [specialDays]
  );

  const isBirthdayToday = (birthday) => {
    if (!birthday) return false;
    const date = new Date(birthday);
    return date.getMonth() === today.getMonth() && date.getDate() === todayDate;
  };

  const isBtsEventToday = (event) => Number(event.month) === todayMonth && Number(event.day) === todayDate;

  const todayBirthdays = birthdays.filter((member) => isBirthdayToday(member.birthday));
  const todayBtsEvents = allBtsEvents.filter(isBtsEventToday);
  const thisMonthBirthdays = birthdays.filter((member) => {
    if (!member.birthday) return false;
    return new Date(member.birthday).getMonth() === today.getMonth();
  });
  const thisMonthBtsEvents = allBtsEvents.filter((event) => Number(event.month) === todayMonth);

  const totalTodayEvents = todayBirthdays.length + todayBtsEvents.length;
  const totalThisMonthEvents = thisMonthBirthdays.length + thisMonthBtsEvents.length;

  const filteredArmy = birthdays.filter((member) => {
    if (!member.birthday) return false;
    const date = new Date(member.birthday);
    const matchesMonth = monthFilter === "All" || date.getMonth() === MONTHS.indexOf(monthFilter) - 1;
    const name = `${member.username || ""} ${member.nickname || ""}`.toLowerCase();
    return matchesMonth && name.includes(search.toLowerCase());
  });

  const filteredBts = allBtsEvents.filter(
    (event) => btsMonth === "All" || Number(event.month) === MONTHS.indexOf(btsMonth)
  );

  const openAddBtsEvent = () => {
    setEditingBtsEvent(null);
    setBtsForm({ name: "", month: todayMonth, day: todayDate, description: "", file: null });
    setShowBtsForm(true);
  };

  const editBtsEvent = (event) => {
    if (event.isDefault) return;
    setEditingBtsEvent(event);
    setBtsForm({
      name: event.name || "",
      month: Number(event.month) || todayMonth,
      day: Number(event.day) || todayDate,
      description: event.description || "",
      file: null,
    });
    setShowBtsForm(true);
  };

  const closeBtsForm = () => {
    setShowBtsForm(false);
    setEditingBtsEvent(null);
    setBtsForm({ name: "", month: todayMonth, day: todayDate, description: "", file: null });
  };

  const saveBtsEvent = async (e) => {
    e.preventDefault();

    const cleanName = btsForm.name.trim();
    if (!cleanName) return alert("Name is required");

    const dateValue = `2026-${String(btsForm.month).padStart(2, "0")}-${String(btsForm.day).padStart(2, "0")}`;
    const formData = new FormData();
    formData.append("title", cleanName);
    formData.append("date", dateValue);
    formData.append("description", btsForm.description || "BTS special purple day 💜");
    if (btsForm.file) formData.append("file", btsForm.file);

    try {
      if (editingBtsEvent?.specialDayId) {
        await API.put(`/special-days/${editingBtsEvent.specialDayId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/special-days", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const res = await API.get("/special-days");
      setSpecialDays(res.data || []);
      closeBtsForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to save BTS day");
    }
  };

  const deleteBtsEvent = async (event) => {
    if (event.isDefault) {
      alert("Default BTS events cannot be deleted 💜");
      return;
    }

    if (!window.confirm(`Delete "${event.name}"?`)) return;

    try {
      await API.delete(`/special-days/${event.specialDayId}`);
      const res = await API.get("/special-days");
      setSpecialDays(res.data || []);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete BTS day");
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("for_username", postForm.for_username);
    formData.append("message", postForm.message);
    if (postForm.file) formData.append("file", postForm.file);

    try {
      await API.post("/birthday-posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const res = await API.get("/birthday-posts");
      setBirthdayPosts(res.data || []);
      setPostForm({ for_username: "", message: "", file: null });
      setShowPostForm(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to post birthday wish");
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    const formData = new FormData();
    formData.append("content", commentText[postId]);

    try {
      await API.post(`/birthday-comments/${postId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const res = await API.get("/birthday-posts");
      setBirthdayPosts(res.data || []);
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to comment");
    }
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
              Track birthdays, send wishes, celebrate BTS special days and make your Purple Family feel loved.
            </p>
          </div>

          <div className="birthdays-hero-card" style={styles.heroCard}>
            <span style={styles.heroEmoji}>🎉</span>
            <h2>{loading ? "..." : totalTodayEvents}</h2>
            <p>Events Today</p>
          </div>
        </section>

        <section className="birthdays-stats" style={styles.statsGrid}>
          <div style={styles.statCard}><span>👥</span><h3>{birthdays.length}</h3><p>Total ARMY Birthdays</p></div>
          <div style={styles.statCard}><span>📅</span><h3>{totalThisMonthEvents}</h3><p>This Month</p></div>
          <div style={styles.statCard}><span>💜</span><h3>{allBtsEvents.length}</h3><p>BTS Purple Days</p></div>
        </section>

        <div className="birthdays-tabs" style={styles.tabNav}>
          {[
            ["army", "🎂 ARMY Birthdays"],
            ["wishes", "🎉 Birthday Wishes"],
            ["bts", "💜 BTS Days"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ ...styles.tabBtn, ...(activeTab === key ? styles.activeTab : {}) }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "army" && (
          <section className="birthdays-panel" style={styles.panel}>
            <div className="birthdays-section-head" style={styles.sectionHead}>
              <div>
                <h2 style={styles.sectionTitle}>ARMY Birthday Calendar</h2>
                <p style={styles.sectionText}>Today is {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })} 💜</p>
              </div>
            </div>

            {todayBirthdays.length > 0 && (
              <div style={styles.todayCard}>
                <h3>🎉 Today's Birthday Stars</h3>
                <div style={styles.todayList}>
                  {todayBirthdays.map((member) => (
                    <div key={member.id} style={styles.todayItem}>
                      {member.profile_picture ? <img src={toFileUrl(member.profile_picture)} alt={member.username} style={styles.avatarSmImg} /> : <div style={styles.avatarSm}>{(member.nickname || member.username)?.[0]?.toUpperCase()}</div>}
                      <div><strong>{member.nickname || member.username}</strong><p>Happy Birthday! 🎂💜</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="birthdays-controls" style={styles.controls}>
              <input style={styles.search} placeholder="Search by name or nickname..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select style={styles.select} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>{MONTHS.map((m) => <option key={m}>{m}</option>)}</select>
            </div>

            {filteredArmy.length === 0 ? (
              <div style={styles.emptyCard}>No ARMY birthdays found 💜</div>
            ) : (
              <div className="birthdays-grid" style={styles.grid}>
                {filteredArmy.map((member) => (
                  <article key={member.id} style={{ ...styles.card, ...(isBirthdayToday(member.birthday) ? styles.todayRowBorder : {}) }}>
                    {member.profile_picture ? <img src={toFileUrl(member.profile_picture)} alt={member.username} style={styles.avatarImg} /> : <div style={styles.avatar}>{(member.nickname || member.username)?.[0]?.toUpperCase()}</div>}
                    <h3 style={styles.username}>{member.nickname || member.username}</h3>
                    <p style={styles.date}>🎂 {member.birthday ? new Date(member.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "Not added"}</p>
                    {member.bias && <p style={styles.meta}>Bias: {member.bias}</p>}
                    {isBirthdayToday(member.birthday) && <div style={styles.todayBadge}>🎉 Today</div>}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "wishes" && (
          <section className="birthdays-panel" style={styles.panel}>
            <div className="birthdays-section-head" style={styles.sectionHead}>
              <div><h2 style={styles.sectionTitle}>Birthday Wishes Wall</h2><p style={styles.sectionText}>Send love, memories and purple wishes.</p></div>
              <button style={styles.addBtn} onClick={() => setShowPostForm(!showPostForm)}>➕ Add Wish</button>
            </div>

            {showPostForm && (
              <div style={styles.formCard}>
                <form onSubmit={handlePost} style={styles.form}>
                  <input style={styles.input} placeholder="For username / nickname" value={postForm.for_username} onChange={(e) => setPostForm({ ...postForm, for_username: e.target.value })} required />
                  <textarea style={styles.textarea} placeholder="Write your birthday wish..." value={postForm.message} onChange={(e) => setPostForm({ ...postForm, message: e.target.value })} required />
                  <input style={styles.input} type="file" accept="image/*" onChange={(e) => setPostForm({ ...postForm, file: e.target.files?.[0] || null })} />
                  <button style={styles.button}>Post Wish 💜</button>
                </form>
              </div>
            )}

            {birthdayPosts.length === 0 ? (
              <div style={styles.emptyCard}>No birthday wishes yet 💜</div>
            ) : (
              <div style={styles.postGrid}>
                {birthdayPosts.map((post) => (
                  <article key={post.id} style={styles.postCard}>
                    <div style={styles.postHead}><strong>For {post.for_username}</strong><span>by {post.posted_by}</span></div>
                    <p style={styles.postMessage}>{post.message}</p>
                    {post.image_path && <img src={toFileUrl(post.image_path)} alt="Birthday wish" style={styles.postImage} />}
                    <div style={styles.commentsBox}>
                      {(post.comments || []).map((comment) => <p key={comment.id}><strong>{comment.owner}:</strong> {comment.content}</p>)}
                      <div style={styles.commentInputRow}>
                        <input style={styles.commentInput} placeholder="Add a comment..." value={commentText[post.id] || ""} onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })} />
                        <button style={styles.smallBtn} onClick={() => handleComment(post.id)}>Send</button>
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
                  <button onClick={openAddBtsEvent} style={styles.addBtn}>➕ Add BTS Day</button>
                </div>
                <p style={styles.sectionText}>Default BTS days are permanent. ARMY-added days are saved with Cloudinary images.</p>
              </div>

              <select style={styles.select} value={btsMonth} onChange={(e) => setBtsMonth(e.target.value)}>{MONTHS.map((m) => <option key={m}>{m}</option>)}</select>
            </div>

            {showBtsForm && (
              <div style={styles.formCard}>
                <h3>{editingBtsEvent ? "Edit BTS Day" : "Add BTS Day"}</h3>
                <form onSubmit={saveBtsEvent} style={styles.form}>
                  <input style={styles.input} placeholder="Name e.g. FESTA Day" value={btsForm.name} onChange={(e) => setBtsForm({ ...btsForm, name: e.target.value })} required />
                  <div style={styles.twoColumnForm}>
                    <select style={styles.input} value={btsForm.month} onChange={(e) => setBtsForm({ ...btsForm, month: Number(e.target.value) })}>{MONTHS.slice(1).map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
                    <input type="number" min="1" max="31" style={styles.input} value={btsForm.day} onChange={(e) => setBtsForm({ ...btsForm, day: Number(e.target.value) })} required />
                  </div>
                  <textarea style={styles.textarea} placeholder="Description" value={btsForm.description} onChange={(e) => setBtsForm({ ...btsForm, description: e.target.value })} />
                  <input style={styles.input} type="file" accept="image/*" onChange={(e) => setBtsForm({ ...btsForm, file: e.target.files?.[0] || null })} />
                  <div style={styles.formActions}>
                    <button type="button" style={styles.cancelBtn} onClick={closeBtsForm}>Cancel</button>
                    <button style={styles.button}>{editingBtsEvent ? "Update BTS Day" : "Create BTS Day"}</button>
                  </div>
                </form>
              </div>
            )}

            <div className="birthdays-grid" style={styles.grid}>
              {filteredBts.map((event) => {
                const isToday = isBtsEventToday(event);
                const canManage = !event.isDefault && (event.canEdit || event.canDelete);

                return (
                  <article key={event.id} style={{ ...styles.card, ...(event.special ? styles.specialCard : {}), ...(isToday ? styles.todayRowBorder : {}) }}>
                    {event.image ? <img src={toFileUrl(event.image)} alt={event.name} style={styles.btsImage} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <div style={styles.btsEmoji}>{event.emoji || "💜"}</div>}
                    <h3 style={styles.username}>{event.name}</h3>
                    <p style={styles.date}>🎂 {event.date || dateLabelFromParts(event.month, event.day)}</p>
                    {event.description && <p style={styles.meta}>{event.description}</p>}
                    {event.special && <div style={styles.specialBadge}>{event.isDefault ? "Special Day 💜" : "ARMY Added 💜"}</div>}
                    {isToday && <div style={styles.todayBadge}>🎉 Today</div>}
                    {event.createdBy && <small style={styles.createdBy}>by {event.createdBy}</small>}
                    {canManage && (
                      <div style={styles.cardActions}>
                        {event.canEdit && <button style={styles.editBtn} onClick={() => editBtsEvent(event)}>Edit</button>}
                        {event.canDelete && <button style={styles.deleteBtn} onClick={() => deleteBtsEvent(event)}>Delete</button>}
                      </div>
                    )}
                  </article>
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
        .birthdays-page { padding: 24px 14px !important; overflow-x: hidden !important; }
        .birthdays-hero { grid-template-columns: 1fr !important; padding: 32px 22px !important; border-radius: 28px !important; text-align: center !important; gap: 18px !important; }
        .birthdays-hero-card { min-height: 170px !important; border-radius: 26px !important; }
        .birthdays-stats { grid-template-columns: 1fr !important; gap: 14px !important; }
        .birthdays-tabs { justify-content: flex-start !important; overflow-x: auto !important; flex-wrap: nowrap !important; padding: 4px 2px 8px !important; scrollbar-width: none !important; }
        .birthdays-tabs::-webkit-scrollbar { display: none !important; }
        .birthdays-panel { padding: 22px 16px !important; border-radius: 28px !important; }
        .birthdays-section-head { flex-direction: column !important; align-items: stretch !important; }
        .birthdays-controls { flex-direction: column !important; }
        .birthdays-grid { grid-template-columns: 1fr !important; }
        .birthdays-form { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

const styles = {
  page: { width: "100%", padding: "40px clamp(16px,4vw,64px)", background: "linear-gradient(135deg,#faf5ff,#fdf2f8)", minHeight: "100vh" },
  hero: { width: "min(1280px,100%)", margin: "0 auto 24px", padding: "50px", borderRadius: "36px", background: "linear-gradient(135deg,rgba(255,255,255,.92),rgba(243,232,255,.9))", border: "1px solid rgba(124,58,237,.16)", boxShadow: "0 25px 70px rgba(76,29,149,.14)", display: "grid", gridTemplateColumns: "1fr 260px", gap: "24px", alignItems: "center" },
  badge: { display: "inline-flex", padding: "10px 16px", borderRadius: "999px", background: "rgba(124,58,237,.1)", color: "#6d28d9", fontWeight: 900, marginBottom: "18px" },
  title: { fontSize: "clamp(2.3rem,5vw,4.6rem)", lineHeight: .95, letterSpacing: "-.06em", color: "#241039", marginBottom: "18px" },
  subtitle: { color: "#6b5a80", lineHeight: 1.8, maxWidth: "680px" },
  heroCard: { minHeight: "220px", borderRadius: "30px", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", display: "grid", placeItems: "center", textAlign: "center", boxShadow: "0 20px 45px rgba(124,58,237,.25)" },
  heroEmoji: { fontSize: "3rem" },
  statsGrid: { width: "min(1280px,100%)", margin: "0 auto 26px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px" },
  statCard: { padding: "24px", borderRadius: "28px", background: "rgba(255,255,255,.84)", border: "1px solid rgba(124,58,237,.14)", boxShadow: "0 16px 36px rgba(76,29,149,.08)", color: "#241039" },
  tabNav: { width: "min(1280px,100%)", margin: "0 auto 24px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  tabBtn: { border: "1px solid rgba(124,58,237,.18)", background: "rgba(255,255,255,.82)", color: "#6d28d9", padding: "12px 20px", borderRadius: "999px", fontWeight: 900, cursor: "pointer" },
  activeTab: { background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", boxShadow: "0 14px 28px rgba(124,58,237,.22)" },
  panel: { width: "min(1280px,100%)", margin: "0 auto", padding: "30px", borderRadius: "34px", background: "rgba(255,255,255,.72)", border: "1px solid rgba(124,58,237,.14)", boxShadow: "0 18px 45px rgba(76,29,149,.08)" },
  sectionHead: { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "24px" },
  sectionTitle: { color: "#241039", fontSize: "clamp(1.7rem,3vw,2.5rem)", letterSpacing: "-.04em", marginBottom: "6px" },
  sectionText: { color: "#7c6a92" },
  controls: { display: "flex", gap: "14px", marginBottom: "24px", flexWrap: "wrap" },
  search: { flex: 1, minWidth: "240px", padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(124,58,237,.2)", outline: "none" },
  select: { padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(124,58,237,.2)", background: "white", color: "#4c1d95", fontWeight: 800, outline: "none" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "22px" },
  card: { background: "white", border: "1px solid rgba(124,58,237,.12)", borderRadius: "28px", padding: "28px 20px", textAlign: "center", boxShadow: "0 16px 35px rgba(76,29,149,.08)", minHeight: "270px" },
  specialCard: { background: "linear-gradient(135deg,#faf5ff,#fdf2f8)", border: "2px solid rgba(124,58,237,.28)" },
  todayRowBorder: { border: "2px solid #ec4899", boxShadow: "0 20px 45px rgba(236,72,153,.18)" },
  avatar: { width: "86px", height: "86px", borderRadius: "50%", margin: "0 auto 16px", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", fontSize: "2rem", fontWeight: 900 },
  avatarImg: { width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "4px solid #ede9fe" },
  avatarSm: { width: "52px", height: "52px", borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", fontWeight: 900 },
  avatarSmImg: { width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover" },
  btsImage: { width: "104px", height: "104px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "4px solid #ede9fe", boxShadow: "0 12px 25px rgba(124,58,237,.18)" },
  btsEmoji: { fontSize: "4rem", marginBottom: "16px" },
  username: { color: "#4c1d95", fontSize: "1.35rem", marginBottom: "8px" },
  date: { color: "#7c3aed", fontWeight: 900, marginBottom: "10px" },
  meta: { color: "#7c6a92", lineHeight: 1.5, marginBottom: "10px" },
  createdBy: { display: "block", color: "#7c6a92", marginTop: "8px" },
  todayBadge: { display: "inline-flex", marginTop: "10px", padding: "8px 12px", borderRadius: "999px", background: "#fce7f3", color: "#be185d", fontWeight: 900 },
  specialBadge: { display: "inline-flex", padding: "8px 14px", borderRadius: "999px", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", fontWeight: 900, marginTop: "8px" },
  todayCard: { padding: "24px", borderRadius: "28px", background: "linear-gradient(135deg,#fff7ed,#fdf2f8)", border: "1px solid rgba(236,72,153,.18)", marginBottom: "24px" },
  todayList: { display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "14px" },
  todayItem: { display: "flex", alignItems: "center", gap: "12px", background: "white", padding: "12px 16px", borderRadius: "18px" },
  emptyCard: { padding: "45px 20px", borderRadius: "26px", background: "white", textAlign: "center", color: "#7c6a92", fontWeight: 800 },
  addBtn: { border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", padding: "13px 18px", borderRadius: "999px", fontWeight: 900, cursor: "pointer", boxShadow: "0 14px 28px rgba(124,58,237,.22)" },
  inlineActions: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" },
  formCard: { padding: "24px", borderRadius: "26px", background: "white", border: "1px solid rgba(124,58,237,.14)", marginBottom: "24px" },
  form: { display: "grid", gap: "14px" },
  input: { width: "100%", padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(124,58,237,.2)", outline: "none", background: "#faf7ff" },
  textarea: { width: "100%", minHeight: "100px", padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(124,58,237,.2)", outline: "none", background: "#faf7ff", resize: "vertical" },
  twoColumnForm: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" },
  button: { border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "white", padding: "13px 18px", borderRadius: "999px", fontWeight: 900, cursor: "pointer" },
  cancelBtn: { border: "1px solid rgba(124,58,237,.22)", background: "white", color: "#7c3aed", padding: "13px 18px", borderRadius: "999px", fontWeight: 900, cursor: "pointer" },
  cardActions: { display: "flex", gap: "8px", justifyContent: "center", marginTop: "14px" },
  editBtn: { border: "none", background: "#dbeafe", color: "#1d4ed8", padding: "9px 14px", borderRadius: "999px", fontWeight: 900, cursor: "pointer" },
  deleteBtn: { border: "none", background: "#fee2e2", color: "#b91c1c", padding: "9px 14px", borderRadius: "999px", fontWeight: 900, cursor: "pointer" },
  postGrid: { display: "grid", gap: "18px" },
  postCard: { background: "white", borderRadius: "26px", padding: "22px", border: "1px solid rgba(124,58,237,.12)", boxShadow: "0 12px 28px rgba(76,29,149,.07)" },
  postHead: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", color: "#4c1d95", marginBottom: "12px" },
  postMessage: { color: "#241039", lineHeight: 1.7 },
  postImage: { width: "100%", maxHeight: "360px", objectFit: "cover", borderRadius: "20px", marginTop: "14px" },
  commentsBox: { marginTop: "16px", padding: "14px", borderRadius: "18px", background: "#faf5ff" },
  commentInputRow: { display: "flex", gap: "10px", marginTop: "12px" },
  commentInput: { flex: 1, padding: "12px 14px", borderRadius: "999px", border: "1px solid rgba(124,58,237,.2)", outline: "none" },
  smallBtn: { border: "none", borderRadius: "999px", padding: "10px 14px", background: "#7c3aed", color: "white", fontWeight: 900, cursor: "pointer" },
};
