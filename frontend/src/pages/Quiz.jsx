import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/axios";

const API_BASE = "http://127.0.0.1:8000";

const emptyQuestionForm = {
  id: null,
  topic_id: "",
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "",
  image_url: "",
  file: null,
};

const emptyTopicForm = {
  id: null,
  name: "",
  icon: "📚",
};

function imageSrc(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

function shuffleArray(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function Quiz() {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [topicForm, setTopicForm] = useState(emptyTopicForm);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const activeTopic = useMemo(
    () => topics.find((topic) => topic.id === Number(activeTopicId)),
    [topics, activeTopicId]
  );

  const activeQuestions = useMemo(() => {
    return questions.filter((q) => q.topic_id === Number(activeTopicId));
  }, [questions, activeTopicId]);

  const currentQuestion = activeQuestions[current];
  const optionList = currentQuestion
    ? [currentQuestion.option_a, currentQuestion.option_b, currentQuestion.option_c, currentQuestion.option_d]
    : [];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meRes, topicsRes, qRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/quiz/topics"),
        API.get("/quiz/questions"),
      ]);

      setCurrentUser(meRes.data);
      setTopics(topicsRes.data || []);
      setQuestions(qRes.data || []);

      if (!activeTopicId && topicsRes.data?.length) {
        setActiveTopicId(topicsRes.data[0].id);
      }
    } catch (err) {
      console.error("Quiz load error:", err.response?.data || err.message);
      alert("Quiz load failed. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPlayState = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setShowResult(false);
  };

  const changeTopic = (topicId) => {
    setActiveTopicId(topicId);
    resetPlayState();
  };

  const handleAnswer = (option) => {
    if (answered || !currentQuestion) return;
    setSelected(option);
    setAnswered(true);
    if (option === currentQuestion.correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 < activeQuestions.length) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(activeQuestions);
    const otherQuestions = questions.filter((q) => q.topic_id !== Number(activeTopicId));
    setQuestions([...otherQuestions, ...shuffled]);
    resetPlayState();
  };

  const getResultMessage = () => {
    const total = activeQuestions.length || 1;
    const percent = (score / total) * 100;
    if (percent === 100) return "Perfect score! You're a true ARMY! 💜🏆";
    if (percent >= 80) return "Amazing! You really know BTS! 💜⭐";
    if (percent >= 60) return "Great job ARMY! Keep stanning! 💜";
    if (percent >= 40) return "Not bad! Keep learning about BTS! 💜";
    return "Keep listening to BTS and try again! 💜";
  };

  const getOptionStyle = (option) => {
    if (!answered) return styles.option;
    if (option === currentQuestion.correct_answer) return { ...styles.option, ...styles.correct };
    if (option === selected && option !== currentQuestion.correct_answer) {
      return { ...styles.option, ...styles.wrong };
    }
    return { ...styles.option, ...styles.dimmed };
  };

  const openAddQuestionForm = () => {
    setQuestionForm({ ...emptyQuestionForm, topic_id: activeTopicId || topics[0]?.id || "" });
    setPreview("");
    setShowQuestionForm(true);
  };

  const openEditQuestionForm = (q) => {
    setQuestionForm({
      id: q.id,
      topic_id: q.topic_id || activeTopicId || "",
      question: q.question || "",
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_answer: q.correct_answer || "",
      image_url: q.image_url || "",
      file: null,
    });
    setPreview(imageSrc(q.image_url));
    setShowQuestionForm(true);
  };

  const closeQuestionForm = () => {
    setShowQuestionForm(false);
    setQuestionForm(emptyQuestionForm);
    setPreview("");
  };

  const openAddTopicForm = () => {
    setTopicForm(emptyTopicForm);
    setShowTopicForm(true);
  };

  const openEditTopicForm = (topic) => {
    setTopicForm({ id: topic.id, name: topic.name || "", icon: topic.icon || "📚" });
    setShowTopicForm(true);
  };

  const closeTopicForm = () => {
    setShowTopicForm(false);
    setTopicForm(emptyTopicForm);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuestionForm((prev) => ({ ...prev, file }));
    setPreview(URL.createObjectURL(file));
  };

  const submitQuestion = async (e) => {
    e.preventDefault();

    if (!questionForm.topic_id) {
      alert("Please select a topic.");
      return;
    }

    if (
      !questionForm.question.trim() ||
      !questionForm.option_a.trim() ||
      !questionForm.option_b.trim() ||
      !questionForm.option_c.trim() ||
      !questionForm.option_d.trim()
    ) {
      alert("Please fill all question and option fields.");
      return;
    }

    if (!questionForm.correct_answer) {
      alert("Please select correct answer.");
      return;
    }

    const fd = new FormData();
    fd.append("topic_id", questionForm.topic_id);
    fd.append("question", questionForm.question);
    fd.append("option_a", questionForm.option_a);
    fd.append("option_b", questionForm.option_b);
    fd.append("option_c", questionForm.option_c);
    fd.append("option_d", questionForm.option_d);
    fd.append("correct_answer", questionForm.correct_answer);
    fd.append("image_url", questionForm.image_url || "");
    if (questionForm.file) fd.append("file", questionForm.file);

    try {
      if (questionForm.id) {
        await API.put(`/quiz/questions/${questionForm.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/quiz/questions", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      closeQuestionForm();
      await loadData();
      resetPlayState();
    } catch (err) {
      console.error("Save question error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Question save failed.");
    }
  };

  const submitTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.name.trim()) {
      alert("Please enter topic name.");
      return;
    }

    const fd = new FormData();
    fd.append("name", topicForm.name.trim());
    fd.append("icon", topicForm.icon || "📚");

    try {
      let res;
      if (topicForm.id) {
        res = await API.put(`/quiz/topics/${topicForm.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await API.post("/quiz/topics", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      closeTopicForm();
      await loadData();
      setActiveTopicId(res.data.id);
      resetPlayState();
    } catch (err) {
      console.error("Save topic error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Topic save failed.");
    }
  };

  const deleteQuestion = async (q) => {
    if (!window.confirm("Delete this quiz question?")) return;
    try {
      await API.delete(`/quiz/questions/${q.id}`);
      await loadData();
      resetPlayState();
    } catch (err) {
      console.error("Delete question error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Delete failed. Admin only.");
    }
  };

  const deleteTopic = async (topic) => {
    if (!window.confirm(`Delete topic "${topic.name}" and its questions?`)) return;

    try {
      await API.delete(`/quiz/topics/${topic.id}`);

      const [topicsRes, qRes] = await Promise.all([
        API.get("/quiz/topics"),
        API.get("/quiz/questions"),
      ]);

      const nextTopics = topicsRes.data || [];
      setTopics(nextTopics);
      setQuestions(qRes.data || []);
      setActiveTopicId(nextTopics[0]?.id || null);
      resetPlayState();
    } catch (err) {
      console.error("Delete topic error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Delete failed. Admin only.");
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.page}>
        <aside style={styles.sidebar}>
          <h2 style={styles.sideTitle}>🎮 Quiz Topics</h2>

          {topics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => changeTopic(topic.id)}
              style={{
                ...styles.topicCard,
                ...(Number(activeTopicId) === topic.id ? styles.topicCardActive : {}),
              }}
            >
              <div style={styles.topicTitleRow}>
                <strong>{topic.icon || "📚"} {topic.name}</strong>
                <span style={styles.countBadge}>{topic.question_count || 0}</span>
              </div>
              <div style={styles.topicMeta}>Added by {topic.created_by_username || "System"}</div>
              <div style={styles.topicActions} onClick={(e) => e.stopPropagation()}>
                {topic.can_edit && <button onClick={() => openEditTopicForm(topic)} style={styles.blueBtn}>Edit</button>}
                {topic.can_delete && <button onClick={() => deleteTopic(topic)} style={styles.redBtn}>Delete</button>}
              </div>
            </div>
          ))}

          <button onClick={openAddTopicForm} style={styles.addTopicBtn}>➕ Add Topic</button>
          <button onClick={openAddQuestionForm} style={styles.addBtn}>➕ Add Question</button>
        </aside>

        <main style={styles.mainArea}>
          <div style={styles.topBar}>
            <div>
              <h1 style={styles.title}>{activeTopic ? `${activeTopic.icon || "📚"} ${activeTopic.name}` : "Quiz Games"}</h1>
              <p style={styles.subtitle}>All ARMY can add questions. Images are optional 💜</p>
            </div>
            <button onClick={openAddQuestionForm} style={styles.primaryBtn}>➕ Add Question</button>
          </div>

          {loading ? (
            <div style={styles.emptyCard}>Loading quiz questions... 💜</div>
          ) : !activeTopic ? (
            <div style={styles.emptyCard}>
              <h2>No topics yet 💜</h2>
              <button onClick={openAddTopicForm} style={styles.primaryBtn}>➕ Add First Topic</button>
            </div>
          ) : activeQuestions.length === 0 ? (
            <div style={styles.emptyCard}>
              <h2>No questions yet 💜</h2>
              <p>Be the first ARMY to add a question for this topic.</p>
              <button onClick={openAddQuestionForm} style={styles.primaryBtn}>➕ Add First Question</button>
            </div>
          ) : !showResult ? (
            <div style={styles.quizCard}>
              <div style={styles.progressText}>
                Question {current + 1} of {activeQuestions.length} • Score: {score}
              </div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${((current + (answered ? 1 : 0)) / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>

              <div style={styles.questionHeaderRow}>
                <h2 style={styles.questionNo}>Question {String(current + 1).padStart(2, "0")}</h2>
                <div style={styles.cardActions}>
                  {currentQuestion.can_edit && <button onClick={() => openEditQuestionForm(currentQuestion)} style={styles.editBtn}>Edit</button>}
                  {currentQuestion.can_delete && <button onClick={() => deleteQuestion(currentQuestion)} style={styles.deleteBtn}>Delete</button>}
                </div>
              </div>

              {currentQuestion.image_url && (
                <div style={styles.questionImageWrap}>
                  <img src={imageSrc(currentQuestion.image_url)} alt="Quiz" style={styles.questionImage} />
                </div>
              )}

              <h2 style={styles.question}>{currentQuestion.question}</h2>

              <div style={styles.options}>
                {optionList.map((option, i) => (
                  <button key={i} onClick={() => handleAnswer(option)} style={getOptionStyle(option)}>
                    <span style={styles.optionLetter}>{["A", "B", "C", "D"][i]}</span>
                    <span>{option}</span>
                    {answered && option === currentQuestion.correct_answer && <b> ✅</b>}
                    {answered && option === selected && option !== currentQuestion.correct_answer && <b> ❌</b>}
                  </button>
                ))}
              </div>

              {answered && (
                <button onClick={handleNext} style={styles.nextBtn}>
                  {current + 1 < activeQuestions.length ? "Next →" : "See Results 🏆"}
                </button>
              )}
            </div>
          ) : (
            <div style={styles.resultCard}>
              <div style={styles.resultEmoji}>{score === activeQuestions.length ? "🏆" : score >= activeQuestions.length / 2 ? "⭐" : "💜"}</div>
              <h2 style={styles.resultTitle}>Quiz Complete!</h2>
              <div style={styles.scoreCircle}>
                <span style={styles.scoreNumber}>{score}</span>
                <span style={styles.scoreTotal}>/{activeQuestions.length}</span>
              </div>
              <p style={styles.resultMessage}>{getResultMessage()}</p>
              <button onClick={handleRestart} style={styles.restartBtn}>🔄 Try Again</button>
              <button onClick={openAddQuestionForm} style={styles.homeBtn}>➕ Add More Questions</button>
            </div>
          )}
        </main>
      </div>

      {showTopicForm && (
        <div style={styles.modalOverlay}>
          <form onSubmit={submitTopic} style={styles.smallModalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{topicForm.id ? "Edit Topic" : "Add Topic"}</h2>
              <button type="button" onClick={closeTopicForm} style={styles.closeBtn}>×</button>
            </div>

            <label style={styles.label}>Topic Icon</label>
            <input
              value={topicForm.icon}
              onChange={(e) => setTopicForm({ ...topicForm, icon: e.target.value })}
              style={styles.input}
              placeholder="👀"
            />

            <label style={styles.label}>Topic Name</label>
            <input
              value={topicForm.name}
              onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
              style={styles.input}
              placeholder="Guess the BTS Member by Eyes"
              required
            />

            <div style={styles.modalActions}>
              <button type="button" onClick={closeTopicForm} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" style={styles.saveBtn}>{topicForm.id ? "Save Topic" : "Add Topic"}</button>
            </div>
          </form>
        </div>
      )}

      {showQuestionForm && (
        <div style={styles.modalOverlay}>
          <form onSubmit={submitQuestion} style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{questionForm.id ? "Edit Quiz Question" : "Add Quiz Question"}</h2>
              <button type="button" onClick={closeQuestionForm} style={styles.closeBtn}>×</button>
            </div>

            <label style={styles.label}>Topic</label>
            <select
              value={questionForm.topic_id}
              onChange={(e) => setQuestionForm({ ...questionForm, topic_id: e.target.value })}
              style={styles.input}
              required
            >
              <option value="">Select topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>{topic.icon || "📚"} {topic.name}</option>
              ))}
            </select>

            <label style={styles.label}>Question</label>
            <textarea
              value={questionForm.question}
              onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
              style={styles.textarea}
              placeholder="Type your question..."
              required
            />

            <label style={styles.label}>Image (Optional)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={styles.input} />
            {preview && <img src={preview} alt="Preview" style={styles.previewImage} />}

            <div style={styles.formGrid}>
              {["option_a", "option_b", "option_c", "option_d"].map((key, idx) => (
                <div key={key}>
                  <label style={styles.label}>Option {String.fromCharCode(65 + idx)}</label>
                  <input
                    value={questionForm[key]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setQuestionForm((prev) => {
                        const next = { ...prev, [key]: value };
                        if (prev.correct_answer === prev[key]) next.correct_answer = value;
                        return next;
                      });
                    }}
                    style={styles.input}
                    required
                  />
                </div>
              ))}
            </div>

            <label style={styles.label}>Correct Answer</label>
            <select
              value={questionForm.correct_answer}
              onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
              style={styles.input}
              required
            >
              <option value="">Select correct answer</option>
              {[questionForm.option_a, questionForm.option_b, questionForm.option_c, questionForm.option_d]
                .filter(Boolean)
                .map((option, idx) => (
                  <option key={`${option}-${idx}`} value={option}>{option}</option>
                ))}
            </select>

            <div style={styles.modalActions}>
              <button type="button" onClick={closeQuestionForm} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" style={styles.saveBtn}>{questionForm.id ? "Save Changes" : "Add Question"}</button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
  },

  page: {
    width: "100%",
    padding: "40px clamp(16px,4vw,64px)",
    display: "grid",
    gridTemplateColumns: "330px 1fr",
    gap: "24px",
  },

  sidebar: {
    alignSelf: "start",
    position: "sticky",
    top: "100px",
    padding: "22px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
  },

  sideTitle: {
    color: "#241039",
    fontSize: "1.5rem",
    marginBottom: "18px",
  },

  topicCard: {
    width: "100%",
    border: "1px solid rgba(124,58,237,0.14)",
    background: "white",
    color: "#4c1d95",
    cursor: "pointer",
    textAlign: "left",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "20px",
    fontWeight: 800,
  },

  topicCardActive: {
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    boxShadow: "0 14px 28px rgba(124,58,237,0.22)",
  },

  topicTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },

  topicMeta: {
    fontSize: "0.82rem",
    opacity: 0.78,
    marginTop: "10px",
  },

  topicActions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    flexWrap: "wrap",
  },

  countBadge: {
    background: "rgba(255,255,255,0.22)",
    color: "inherit",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "0.75rem",
    flexShrink: 0,
  },

  addTopicBtn: {
    width: "100%",
    marginTop: "14px",
    padding: "13px",
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
  },

  addBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "13px",
    border: "1px solid rgba(124,58,237,0.22)",
    borderRadius: "999px",
    background: "#f3e8ff",
    color: "#6d28d9",
    cursor: "pointer",
    fontWeight: 900,
  },

  mainArea: {
    minWidth: 0,
    padding: "34px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(124,58,237,0.14)",
    boxShadow: "0 18px 45px rgba(76,29,149,0.08)",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "clamp(2rem,4vw,3.3rem)",
    color: "#241039",
    letterSpacing: "-0.05em",
  },

  subtitle: {
    marginTop: "8px",
    color: "#7c6a92",
    fontWeight: 700,
  },

  primaryBtn: {
    padding: "13px 22px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 14px 28px rgba(124,58,237,0.22)",
  },

  emptyCard: {
    background: "white",
    border: "1px solid rgba(124,58,237,0.14)",
    borderRadius: "28px",
    padding: "55px 20px",
    textAlign: "center",
    color: "#7c6a92",
  },

  quizCard: {
    background: "white",
    borderRadius: "30px",
    padding: "28px",
    border: "1px solid rgba(124,58,237,0.12)",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
  },

  progressText: {
    color: "#7c6a92",
    fontSize: "0.95rem",
    marginBottom: "10px",
    fontWeight: 800,
  },

  progressBar: {
    background: "#f3e8ff",
    borderRadius: "999px",
    height: "10px",
    marginBottom: "24px",
    overflow: "hidden",
  },

  progressFill: {
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    height: "10px",
    borderRadius: "999px",
    transition: "width 0.3s",
  },

  questionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  questionNo: {
    margin: "0 0 16px",
    color: "#7c3aed",
    fontSize: "1.2rem",
  },

  questionImageWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },

  questionImage: {
    maxWidth: "560px",
    width: "100%",
    maxHeight: "340px",
    objectFit: "contain",
    borderRadius: "24px",
    border: "1px solid rgba(124,58,237,0.14)",
    background: "#faf7ff",
  },

  question: {
    fontSize: "clamp(1.4rem,3vw,2rem)",
    lineHeight: 1.45,
    margin: "26px 0",
    color: "#241039",
    fontWeight: 800,
  },

  options: {
    display: "grid",
    gap: "14px",
    marginBottom: "24px",
  },

  option: {
    padding: "16px 18px",
    borderRadius: "20px",
    border: "1px solid rgba(124,58,237,0.16)",
    background: "#faf7ff",
    color: "#241039",
    fontSize: "1rem",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    fontWeight: 800,
  },

  correct: {
    background: "#dcfce7",
    border: "2px solid #22c55e",
    color: "#166534",
  },

  wrong: {
    background: "#fee2e2",
    border: "2px solid #ef4444",
    color: "#991b1b",
  },

  dimmed: {
    opacity: 0.55,
  },

  optionLetter: {
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    color: "white",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: 900,
    flexShrink: 0,
  },

  nextBtn: {
    minWidth: "220px",
    float: "right",
    padding: "14px 20px",
    background: "#22c55e",
    border: "none",
    color: "white",
    borderRadius: "999px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 900,
  },

  cardActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  editBtn: {
    padding: "8px 13px",
    background: "#e0f2fe",
    color: "#0369a1",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  deleteBtn: {
    padding: "8px 13px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  blueBtn: {
    padding: "8px 13px",
    background: "#e0f2fe",
    color: "#0369a1",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  redBtn: {
    padding: "8px 13px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  resultCard: {
    background: "white",
    borderRadius: "30px",
    padding: "50px 24px",
    border: "1px solid rgba(124,58,237,0.14)",
    textAlign: "center",
    maxWidth: "720px",
    margin: "0 auto",
    boxShadow: "0 16px 35px rgba(76,29,149,0.08)",
  },

  resultEmoji: {
    fontSize: "4rem",
    marginBottom: "16px",
  },

  resultTitle: {
    color: "#241039",
    fontSize: "2rem",
    marginBottom: "24px",
  },

  scoreCircle: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "#f3e8ff",
    border: "5px solid #7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },

  scoreNumber: {
    fontSize: "2.8rem",
    fontWeight: 900,
    color: "#7c3aed",
  },

  scoreTotal: {
    fontSize: "1.2rem",
    color: "#7c6a92",
  },

  resultMessage: {
    fontSize: "1.1rem",
    marginBottom: "28px",
    color: "#6b5a80",
    fontWeight: 700,
  },

  restartBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    border: "none",
    color: "white",
    borderRadius: "999px",
    fontSize: "1rem",
    cursor: "pointer",
    marginBottom: "12px",
    fontWeight: 900,
  },

  homeBtn: {
    width: "100%",
    padding: "14px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.22)",
    color: "#7c3aed",
    borderRadius: "999px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 900,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(18,10,35,0.78)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modalCard: {
    width: "min(760px,95vw)",
    maxHeight: "92vh",
    overflowY: "auto",
    background: "white",
    borderRadius: "30px",
    padding: "28px",
    border: "1px solid rgba(124,58,237,0.18)",
    boxShadow: "0 35px 90px rgba(0,0,0,0.35)",
  },

  smallModalCard: {
    width: "min(460px,95vw)",
    background: "white",
    borderRadius: "30px",
    padding: "28px",
    border: "1px solid rgba(124,58,237,0.18)",
    boxShadow: "0 35px 90px rgba(0,0,0,0.35)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  modalTitle: {
    margin: 0,
    color: "#241039",
    fontSize: "1.5rem",
  },

  closeBtn: {
    background: "#f3e8ff",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#7c3aed",
    fontWeight: 900,
  },

  label: {
    display: "block",
    fontWeight: 900,
    margin: "13px 0 6px",
    color: "#6d28d9",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "16px",
    fontSize: "1rem",
    boxSizing: "border-box",
    background: "#faf7ff",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "14px 16px",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "16px",
    fontSize: "1rem",
    boxSizing: "border-box",
    resize: "vertical",
    background: "#faf7ff",
    outline: "none",
  },

  previewImage: {
    width: "100%",
    maxHeight: "240px",
    objectFit: "contain",
    border: "1px solid rgba(124,58,237,0.14)",
    borderRadius: "18px",
    marginTop: "12px",
    background: "#faf7ff",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "22px",
    flexWrap: "wrap",
  },

  cancelBtn: {
    padding: "12px 18px",
    background: "white",
    border: "1px solid rgba(124,58,237,0.22)",
    color: "#7c3aed",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },

  saveBtn: {
    padding: "12px 18px",
    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
    border: "none",
    color: "white",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 900,
  },
};
