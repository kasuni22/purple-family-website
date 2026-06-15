import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
  { id: "default-jin", name: "Jin", date: "December 4", month: 12, day: 4, emoji: "🐹" },
  { id: "default-suga", name: "SUGA", date: "March 9", month: 3, day: 9, emoji: "🐱" },
  { id: "default-jhope", name: "j-hope", date: "February 18", month: 2, day: 18, emoji: "🐿️" },
  { id: "default-rm", name: "RM", date: "September 12", month: 9, day: 12, emoji: "🐨" },
  { id: "default-jimin", name: "Jimin", date: "October 13", month: 10, day: 13, emoji: "🐥" },
  { id: "default-v", name: "V", date: "December 30", month: 12, day: 30, emoji: "🐯" },
  { id: "default-jungkook", name: "Jung Kook", date: "September 1", month: 9, day: 1, emoji: "🐰" },
  { id: "default-bts-debut", name: "BTS Debut", date: "June 13", month: 6, day: 13, emoji: "💜", special: true },
  { id: "default-army-day", name: "ARMY Day", date: "July 9", month: 7, day: 9, emoji: "💜", special: true },
];

export default function Birthdays() {
  const navigate = useNavigate();
  const today = new Date();

  const [birthdays, setBirthdays] = useState([]);
  const [birthdayPosts, setBirthdayPosts] = useState([]);
  const [specialDays, setSpecialDays] = useState([]);
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

  const [showBtsForm, setShowBtsForm] = useState(false);
  const [editingBtsDay, setEditingBtsDay] = useState(null);
  const [btsForm, setBtsForm] = useState({
    title: "",
    date: "",
    description: "",
    file: null,
    image_url: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
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
    } catch {
      navigate("/login");
    }
  };

  const refreshBirthdayPosts = async () => {
    const res = await API.get("/birthday-posts");
    setBirthdayPosts(res.data || []);
  };

  const refreshSpecialDays = async () => {
    const res = await API.get("/special-days");
    setSpecialDays(res.data || []);
  };

  const imageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API_BASE}/${path}`;
  };

  const monthDayToLabel = (month, day) => {
    const monthName = MONTHS[Number(month)] || "";
    return `${monthName} ${Number(day)}`;
  };

  const getMonthFromDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.getMonth() + 1;
  };

  const getDayFromDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.getDate();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not added";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const isBirthdayToday = (birthday) => {
    if (!birthday) return false;
    const date = new Date(birthday);
    return (
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isMonthMatch = (monthNumber, selectedMonth) => {
    return selectedMonth === "All" || Number(monthNumber) === MONTHS.indexOf(selectedMonth);
  };

  const isDefaultEventToday = (event) => {
    return Number(event.month) === today.getMonth() + 1 && Number(event.day) === today.getDate();
  };

  const isApiDayToday = (day) => {
    return (
      getMonthFromDate(day.date) === today.getMonth() + 1 &&
      getDayFromDate(day.date) === today.getDate()
    );
  };

  const todayBirthdays = birthdays.filter((m) => isBirthdayToday(m.birthday));

  const thisMonthBirthdays = birthdays.filter((m) => {
    if (!m.birthday) return false;
    return new Date(m.birthday).getMonth() === today.getMonth();
  });

  const todayBtsEventsCount =
    DEFAULT_BTS_EVENTS.filter(isDefaultEventToday).length +
    specialDays.filter(isApiDayToday).length;

  const filteredArmy = birthdays.filter((member) => {
    if (!member.birthday) return false;

    const birthday = new Date(member.birthday);
    const matchMonth =
      monthFilter === "All" ||
      birthday.getMonth() === MONTHS.indexOf(monthFilter) - 1;

    const name = `${member.username || ""} ${member.nickname || ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());

    return matchMonth && matchSearch;
  });

  const filteredDefaultBts = DEFAULT_BTS_EVENTS.filter((event) =>
    isMonthMatch(event.month, btsMonth)
  );

  const filteredAddedBtsDays = specialDays.filter((day) =>
    isMonthMatch(getMonthFromDate(day.date), btsMonth)
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

      await refreshBirthdayPosts();
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
      await API.post(`/birthday-comments/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshBirthdayPosts();
      setCommentText({ ...commentText, [postId]: "" });
    } catch {
      alert("Failed to comment");
    }
  };

  const openAddBtsDay = () => {
    setEditingBtsDay(null);
    setBtsForm({
      title: "",
      date: "",
      description: "",
      file: null,
      image_url: "",
    });
    setShowBtsForm(true);
  };

  const editBtsDay = (day) => {
    setEditingBtsDay(day);
    setBtsForm({
      title: day.title || "",
      date: day.date || "",
      description: day.description || "",
      file: null,
      image_url: day.image_url || "",
    });
    setShowBtsForm(true);
  };

  const saveBtsDay = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", btsForm.title);
    formData.append("date", btsForm.date);
    formData.append("description", btsForm.description || "");

    // Backend can save this to Cloudinary when /special-days accepts file.
    // Safe to keep here; current FastAPI will ignore extra form-data if file support is not added yet.
    if (btsForm.file) formData.append("file", btsForm.file);
    if (btsForm.image_url) formData.append("image_url", btsForm.image_url);

    try {
      if (editingBtsDay) {
        await API.put(`/special-days/${editingBtsDay.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/special-days", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await refreshSpecialDays();
      setShowBtsForm(false);
      setEditingBtsDay(null);
      setBtsForm({
        title: "",
        date: "",
        description: "",
        file: null,
        image_url: "",
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save BTS day");
    }
  };

  const deleteBtsDay = async (day) => {
    if (!window.confirm(`Delete "${day.title}"?`)) return;

    try {
      await API.delete(`/special-days/${day.id}`);
      await refreshSpecialDays();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete BTS day");
    }
  };

  return (
    <>
      <Navbar />

      <main className="birthdays-page" style={styles.page}>
        <section className="birthdays-hero" style={styles.hero}>
          <div>
            <div style={styles.badge}>🎂 Purple Birthday Calendar</div>

            <h1 style={styles.heroTitle}>
              Celebrate every ARMY beautifully
            </h1>

            <p style={styles.heroText}>
              Track ARMY birthdays, send purple wishes, and celebrate permanent
              BTS special days with your Purple Family.
            </p>
          </div>

          <div className="birthdays-hero-card" style={styles.heroCard}>
            <span style={styles.heroEmoji}>🎉</span>
            <h2>{todayBirthdays.length + todayBtsEventsCount}</h2>
            <p>Special Moments Today</p>
          </div>
        </section>

        <section className="birthdays-stats" style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span>👥</span>
            <h3>{birthdays.length}</h3>
            <p>Total ARMY Birthdays</p>
          </div>

          <div style={styles.statCard}>
            <span>📅</span>
            <h3>{thisMonthBirthdays.length}</h3>
            <p>ARMY Birthdays This Month</p>
          </div>

          <div style={styles.statCard}>
            <span>💜</span>
            <h3>{DEFAULT_BTS_EVENTS.length + specialDays.length}</h3>
            <p>BTS Special Days</p>
          </div>
        </section>

        <div className="birthdays-tabs" style={styles.tabNav}>
          {[
            ["army", "🎂 ARMY Birthdays"],
            ["wishes", "🎉 Birthday Wishes"],
            ["bts", "💜 BTS Days"],
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

                <div style={styles.todayList}>
                  {todayBirthdays.map((member) => (
                    <div key={member.id} style={styles.todayItem}>
                      {member.profile_picture ? (
                        <img
                          src={imageUrl(member.profile_picture)}
                          alt={member.username}
                          style={styles.avatarSmImg}
                        />
                      ) : (
                        <div style={styles.avatarSm}>
                          {(member.nickname || member.username)?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <div>
                        <strong>{member.nickname || member.username}</strong>
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
                placeholder="Search name or nickname..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                style={styles.select}
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                {MONTHS.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </select>
            </div>

            {filteredArmy.length === 0 ? (
              <div style={styles.emptyCard}>
                <h3>No birthdays found 💜</h3>
                <p>Try another month or search name.</p>
              </div>
            ) : (
              <div className="birthdays-grid" style={styles.grid}>
                {filteredArmy.map((member) => {
                  const isToday = isBirthdayToday(member.birthday);

                  return (
                    <article
                      key={member.id}
                      style={{
                        ...styles.card,
                        ...(isToday ? styles.todayBorder : {}),
                      }}
                    >
                      {isToday && <div style={styles.todayBadge}>🎉 Today</div>}

                      {member.profile_picture ? (
                        <img
                          src={imageUrl(member.profile_picture)}
                          alt={member.username}
                          style={styles.avatarImg}
                        />
                      ) : (
                        <div style={styles.avatar}>
                          {(member.nickname || member.username)?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <h3 style={styles.username}>
                        {member.nickname || member.username}
                      </h3>

                      <p style={styles.date}>🎂 {formatDate(member.birthday)}</p>

                      {member.bias && <p style={styles.bias}>💜 Bias: {member.bias}</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "wishes" && (
          <section className="birthdays-panel" style={styles.panel}>
            <div className="birthdays-section-head" style={styles.wishesHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Birthday Wishes</h2>
                <p style={styles.sectionText}>
                  Share a loving purple wish for an ARMY birthday.
                </p>
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
                      setPostForm({
                        ...postForm,
                        for_username: e.target.value,
                      })
                    }
                    required
                  />

                  <textarea
                    style={styles.textarea}
                    placeholder="Write a birthday message 💜"
                    rows={4}
                    value={postForm.message}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        message: e.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="file"
                    accept="image/*"
                    style={styles.fileInput}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        file: e.target.files?.[0] || null,
                      })
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
                        <strong style={styles.purpleText}>
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
                      {post.comments?.map((comment) => (
                        <div key={comment.id} style={styles.comment}>
                          <span style={styles.commentUser}>💜 {comment.owner}</span>
                          <span style={styles.commentText}>{comment.content}</span>
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
                  <button onClick={openAddBtsDay} style={styles.addBtn}>
                    ➕ Add BTS Day
                  </button>
                </div>

                <p style={styles.sectionText}>
                  Default BTS birthdays stay permanent. ARMY-added days are saved
                  online and can be edited by the creator.
                </p>
              </div>

              <select
                style={styles.select}
                value={btsMonth}
                onChange={(e) => setBtsMonth(e.target.value)}
              >
                {MONTHS.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </select>
            </div>

            {showBtsForm && (
              <div style={styles.formCard}>
                <h3 style={styles.cardTitle}>
                  {editingBtsDay ? "Edit BTS Day" : "Add BTS Day"}
                </h3>

                <form onSubmit={saveBtsDay} style={styles.form}>
                  <input
                    style={styles.input}
                    placeholder="Title e.g. Jimin Live Day"
                    value={btsForm.title}
                    onChange={(e) =>
                      setBtsForm({ ...btsForm, title: e.target.value })
                    }
                    required
                  />

                  <input
                    type="date"
                    style={styles.input}
                    value={btsForm.date}
                    onChange={(e) =>
                      setBtsForm({ ...btsForm, date: e.target.value })
                    }
                    required
                  />

                  <textarea
                    style={styles.textarea}
                    placeholder="Description optional"
                    value={btsForm.description}
                    onChange={(e) =>
                      setBtsForm({ ...btsForm, description: e.target.value })
                    }
                    rows={3}
                  />

                  <input
                    style={styles.input}
                    placeholder="Image URL optional"
                    value={btsForm.image_url}
                    onChange={(e) =>
                      setBtsForm({ ...btsForm, image_url: e.target.value })
                    }
                  />

                  <input
                    type="file"
                    accept="image/*"
                    style={styles.fileInput}
                    onChange={(e) =>
                      setBtsForm({
                        ...btsForm,
                        file: e.target.files?.[0] || null,
                      })
                    }
                  />

                  {btsForm.file && (
                    <p style={styles.uploadHint}>
                      Selected image: {btsForm.file.name}
                    </p>
                  )}

                  <div style={styles.formActions}>
                    <button style={styles.button} type="submit">
                      {editingBtsDay ? "Update BTS Day 💜" : "Create BTS Day 💜"}
                    </button>

                    <button
                      type="button"
                      style={styles.cancelBtn}
                      onClick={() => {
                        setShowBtsForm(false);
                        setEditingBtsDay(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="birthdays-grid" style={styles.grid}>
              {filteredDefaultBts.map((event) => {
                const isToday = isDefaultEventToday(event);

                return (
                  <article
                    key={event.id}
                    style={{
                      ...styles.card,
                      ...(event.special ? styles.specialCard : {}),
                      ...(isToday ? styles.todayBorder : {}),
                    }}
                  >
                    {isToday && <div style={styles.todayBadge}>🎉 Today</div>}

                    <div style={styles.btsEmoji}>{event.emoji}</div>

                    <h3 style={styles.username}>{event.name}</h3>
                    <p style={styles.date}>🎂 {event.date}</p>

                    {event.special && (
                      <div style={styles.specialBadge}>Special Day 💜</div>
                    )}

                    <div style={styles.permanentBadge}>
                      Permanent
                    </div>
                  </article>
                );
              })}

              {filteredAddedBtsDays.map((day) => {
                const isToday = isApiDayToday(day);
                const image = day.image_url || day.image_path;

                return (
                  <article
                    key={day.id}
                    style={{
                      ...styles.card,
                      ...styles.addedDayCard,
                      ...(isToday ? styles.todayBorder : {}),
                    }}
                  >
                    {isToday && <div style={styles.todayBadge}>🎉 Today</div>}

                    {image ? (
                      <img
                        src={imageUrl(image)}
                        alt={day.title}
                        style={styles.btsImage}
                      />
                    ) : (
                      <div style={styles.btsEmoji}>💜</div>
                    )}

                    <h3 style={styles.username}>{day.title}</h3>

                    <p style={styles.date}>
                      🎂 {formatDate(day.date)}
                    </p>

                    {day.description && (
                      <p style={styles.dayDescription}>{day.description}</p>
                    )}

                    <small style={styles.creatorText}>
                      Added by{" "}
                      {day.created_by_nickname ||
                        day.created_by_username ||
                        "ARMY"}
                    </small>

                    <div style={styles.specialBadge}>ARMY Added 💜</div>

                    {(day.can_edit || day.can_delete) && (
                      <div style={styles.cardActions}>
                        {day.can_edit && (
                          <button
                            style={styles.editBtn}
                            onClick={() => editBtsDay(day)}
                          >
                            Edit
                          </button>
                        )}

                        {day.can_delete && (
                          <button
                            style={styles.deleteBtn}
                            onClick={() => deleteBtsDay(day)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {filteredDefaultBts.length === 0 && filteredAddedBtsDays.length === 0 && (
              <div style={styles.emptyCard}>
                <h3>No BTS days found for this month 💜</h3>
                <p>Add a new BTS day for your Purple Family.</p>
              </div>
            )}
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
        }

        .birthdays-panel {
          padding: 22px 16px !important;
          border-radius: 28px !important;
        }

        .birthdays-section-head {
          flex-direction: column !important;
          align-items: stretch !important;
        }

        .birthdays-controls {
          flex-direction: column !important;
        }

        .birthdays-grid {
          grid-template-columns: 1fr !important;
        }

        .birthdays-today-card {
          padding: 20px !important;
        }

        .birthdays-comment-form {
          flex-direction: column !important;
        }

        .birthdays-comment-form button {
          width: 100% !important;
        }
      }

      @media (max-width: 480px) {
        .birthdays-hero {
          padding: 28px 18px !important;
        }

        .birthdays-panel {
          padding: 18px 14px !important;
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
      "linear-gradient(135deg,rgba(255,255,255,0.94),rgba(243,232,255,0.92))",
    border: "1px solid rgba(124,58,237,0.16)",
    boxShadow: "0 25px 70px rgba(76,29,149,0.14)",
    display: "grid",
    gridTemplateColumns: "1fr 270px",
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

  heroTitle: {
    fontSize: "clamp(2.3rem,5vw,4.6rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    color: "#241039",
    marginBottom: "18px",
  },

  heroText: {
    color: "#6b5a80",
    lineHeight: 1.8,
    maxWidth: "700px",
    fontSize: "1.05rem",
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
    background: "rgba(255,255,255,0.76)",
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
    fontSize: "clamp(1.7rem,3vw,2.6rem)",
    letterSpacing: "-0.04em",
    marginBottom: "8px",
  },

  sectionText: {
    color: "#7c6a92",
    lineHeight: 1.7,
  },

  inlineActions: {
    display: "flex",
    gap: "10px",
    margin: "14px 0",
    flexWrap: "wrap",
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
    background: "white",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
  },

  card: {
    position: "relative",
    padding: "28px",
    minHeight: "260px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(124,58,237,0.14)",
    textAlign: "center",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  specialCard: {
    background: "linear-gradient(135deg,#f3e8ff,#fdf2f8)",
    border: "2px solid rgba(124,58,237,0.32)",
  },

  addedDayCard: {
    background: "linear-gradient(135deg,#ffffff,#faf5ff)",
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
    whiteSpace: "nowrap",
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

  btsEmoji: {
    width: "82px",
    height: "82px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#f3e8ff,#fdf2f8)",
    border: "2px solid rgba(124,58,237,0.18)",
    display: "grid",
    placeItems: "center",
    fontSize: "2.6rem",
    marginBottom: "18px",
  },

  btsImage: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #c084fc",
    boxShadow: "0 12px 24px rgba(76,29,149,0.16)",
    marginBottom: "18px",
  },

  username: {
    color: "#4c1d95",
    marginBottom: "8px",
    fontSize: "1.25rem",
  },

  date: {
    color: "#7c3aed",
    fontWeight: 900,
    marginBottom: "10px",
  },

  bias: {
    color: "#7c6a92",
  },

  specialBadge: {
    display: "inline-flex",
    padding: "7px 14px",
    borderRadius: "999px",
    background: "#7c3aed",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: 900,
    marginTop: "6px",
  },

  permanentBadge: {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#ecfeff",
    color: "#0e7490",
    fontSize: "0.76rem",
    fontWeight: 900,
    marginTop: "10px",
  },

  dayDescription: {
    color: "#6b5a80",
    lineHeight: 1.6,
    marginTop: "6px",
    marginBottom: "10px",
  },

  creatorText: {
    color: "#9b7cc5",
    marginTop: "4px",
  },

  cardActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "14px",
  },

  editBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "8px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "8px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  emptyCard: {
    padding: "50px 20px",
    borderRadius: "28px",
    background: "white",
    textAlign: "center",
    color: "#7c6a92",
    border: "1px solid rgba(124,58,237,0.12)",
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
    boxShadow: "0 14px 28px rgba(124,58,237,0.22)",
  },

  formCard: {
    padding: "24px",
    borderRadius: "28px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    marginBottom: "24px",
    boxShadow: "0 12px 26px rgba(76,29,149,0.08)",
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
    background: "#faf7ff",
  },

  textarea: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(124,58,237,0.2)",
    outline: "none",
    resize: "vertical",
    background: "#faf7ff",
  },

  fileInput: {
    color: "#4c1d95",
    fontWeight: 800,
  },

  uploadHint: {
    color: "#7c6a92",
    fontSize: "0.9rem",
  },

  formActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  button: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    padding: "14px 22px",
    fontWeight: 900,
    cursor: "pointer",
  },

  cancelBtn: {
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "999px",
    background: "white",
    color: "#6d28d9",
    padding: "14px 22px",
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

  purpleText: {
    color: "#7c3aed",
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
};
