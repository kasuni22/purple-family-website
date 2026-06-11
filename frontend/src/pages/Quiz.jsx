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
  container: { minHeight: "100vh", background: "#f8f5ff", color: "#2d0a4e" },
  page: { display: "grid", gridTemplateColumns: "330px 1fr", gap: "0.75rem", padding: "2rem 3rem", boxSizing: "border-box" },
  sidebar: { background: "white", border: "1px solid #d4b8ff", borderRadius: "10px", padding: "0.75rem", alignSelf: "start", position: "sticky", top: "90px" },
  sideTitle: { margin: "0 0 1rem", fontSize: "1.3rem" },
  topicCard: { border: "1px solid #d4b8ff", background: "white", color: "#2d0a4e", cursor: "pointer", textAlign: "left", fontSize: "1rem", padding: "0.8rem", marginBottom: "0.4rem" },
  topicCardActive: { background: "#f0c8ea", border: "2px solid #7c3aed", fontWeight: "bold" },
  topicTitleRow: { display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "flex-start" },
  topicMeta: { fontSize: "0.82rem", color: "#555", marginTop: "0.7rem" },
  topicActions: { display: "flex", gap: "0.6rem", marginTop: "0.7rem" },
  countBadge: { background: "#7c3aed", color: "white", borderRadius: "999px", padding: "2px 8px", fontSize: "0.8rem", flexShrink: 0 },
  addTopicBtn: { width: "100%", marginTop: "0.75rem", padding: "0.9rem", background: "#d662c7", color: "#111", border: "1px solid #8a2682", cursor: "pointer", fontWeight: "bold" },
  addBtn: { width: "100%", marginTop: "0.75rem", padding: "0.9rem", background: "#7c3aed", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  mainArea: { minWidth: 0, background: "white", border: "2px solid #2d0a4e", padding: "1.5rem", minHeight: "620px" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" },
  title: { margin: 0, fontSize: "2rem" },
  subtitle: { margin: "0.35rem 0 0", color: "#7c3aed" },
  primaryBtn: { padding: "0.8rem 1.2rem", background: "#7c3aed", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" },
  emptyCard: { background: "white", border: "1px solid #d4b8ff", borderRadius: "16px", padding: "3rem", textAlign: "center" },
  quizCard: { background: "white", padding: "1rem" },
  progressText: { color: "#777", fontSize: "0.95rem", marginBottom: "0.7rem" },
  progressBar: { background: "#f0e6ff", borderRadius: "10px", height: "8px", marginBottom: "1.5rem" },
  progressFill: { background: "#7c3aed", height: "8px", borderRadius: "10px", transition: "width 0.3s" },
  questionHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" },
  questionNo: { margin: "0 0 1rem", fontSize: "1.2rem" },
  questionImageWrap: { display: "flex", justifyContent: "center", marginBottom: "1.5rem" },
  questionImage: { maxWidth: "520px", width: "100%", maxHeight: "300px", objectFit: "contain", border: "1px solid #111", background: "#fff" },
  question: { fontSize: "1.45rem", lineHeight: 1.4, margin: "2rem 0 1.5rem" },
  options: { display: "grid", gap: "0.85rem", marginBottom: "1.5rem" },
  option: { padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #d4b8ff", background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "1rem" },
  correct: { background: "#d4edda", border: "2px solid #28a745", color: "#155724" },
  wrong: { background: "#f8d7da", border: "2px solid #dc3545", color: "#721c24" },
  dimmed: { opacity: 0.55 },
  optionLetter: { background: "#7c3aed", color: "white", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: "bold", flexShrink: 0 },
  nextBtn: { width: "220px", float: "right", padding: "14px", background: "#8bd34b", border: "2px solid #6daa35", color: "#111", borderRadius: "4px", fontSize: "1.05rem", cursor: "pointer", fontWeight: "bold" },
  cardActions: { display: "flex", gap: "0.5rem" },
  editBtn: { padding: "0.45rem 0.8rem", background: "#00aeef", color: "#111", border: "1px solid #0075a6", cursor: "pointer" },
  deleteBtn: { padding: "0.45rem 0.8rem", background: "red", color: "#111", border: "1px solid #900", cursor: "pointer" },
  blueBtn: { padding: "0.45rem 1.1rem", background: "#00aeef", color: "#111", border: "1px solid #0075a6", cursor: "pointer" },
  redBtn: { padding: "0.45rem 1.1rem", background: "red", color: "#111", border: "1px solid #900", cursor: "pointer" },
  resultCard: { background: "white", borderRadius: "16px", padding: "3rem", border: "1px solid #d4b8ff", textAlign: "center", maxWidth: "700px", margin: "0 auto" },
  resultEmoji: { fontSize: "4rem", marginBottom: "1rem" },
  resultTitle: { fontSize: "2rem", marginBottom: "1.5rem" },
  scoreCircle: { width: "130px", height: "130px", borderRadius: "50%", background: "#f0e6ff", border: "4px solid #7c3aed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" },
  scoreNumber: { fontSize: "2.7rem", fontWeight: "bold", color: "#7c3aed" },
  scoreTotal: { fontSize: "1.2rem", color: "#888" },
  resultMessage: { fontSize: "1.1rem", marginBottom: "2rem" },
  restartBtn: { width: "100%", padding: "14px", background: "#7c3aed", border: "none", color: "white", borderRadius: "10px", fontSize: "1.1rem", cursor: "pointer", marginBottom: "1rem" },
  homeBtn: { width: "100%", padding: "14px", background: "white", border: "2px solid #7c3aed", color: "#7c3aed", borderRadius: "10px", fontSize: "1.1rem", cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" },
  modalCard: { width: "min(760px, 95vw)", maxHeight: "92vh", overflowY: "auto", background: "white", borderRadius: "18px", padding: "1.5rem", border: "2px solid #d4b8ff" },
  smallModalCard: { width: "min(460px, 95vw)", background: "white", borderRadius: "18px", padding: "1.5rem", border: "2px solid #d4b8ff" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  modalTitle: { margin: 0 },
  closeBtn: { background: "transparent", border: "none", fontSize: "2rem", cursor: "pointer", color: "#7c3aed" },
  label: { display: "block", fontWeight: "bold", margin: "0.8rem 0 0.35rem" },
  input: { width: "100%", padding: "0.85rem", border: "1px solid #d4b8ff", borderRadius: "10px", fontSize: "1rem", boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: "90px", padding: "0.85rem", border: "1px solid #d4b8ff", borderRadius: "10px", fontSize: "1rem", boxSizing: "border-box", resize: "vertical" },
  previewImage: { width: "100%", maxHeight: "220px", objectFit: "contain", border: "1px solid #d4b8ff", borderRadius: "12px", marginTop: "0.75rem", background: "#f8f5ff" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.2rem" },
  cancelBtn: { padding: "0.8rem 1.2rem", background: "white", border: "2px solid #7c3aed", color: "#7c3aed", borderRadius: "10px", cursor: "pointer" },
  saveBtn: { padding: "0.8rem 1.2rem", background: "#7c3aed", border: "none", color: "white", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" },
};
