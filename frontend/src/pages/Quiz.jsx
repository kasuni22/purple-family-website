import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const questions = [
  {
    question: "What year did BTS debut?",
    options: ["2011", "2012", "2013", "2014"],
    answer: "2013"
  },
  {
    question: "What does BTS stand for?",
    options: ["Baepsae The Star", "Bangtan Sonyeondan", "Bulletproof Tiger Squad", "Bangtan Seonyeo"],
    answer: "Bangtan Sonyeondan"
},
  {
    question: "Which BTS member is the oldest?",
    options: ["Suga", "Jin", "RM", "J-Hope"],
    answer: "Jin"
  },
  {
    question: "What was BTS's debut song?",
    options: ["Boy In Luv", "No More Dream", "N.O", "Danger"],
    answer: "No More Dream"
  },
  {
    question: "Which member is known as the 'Golden Maknae'?",
    options: ["Jimin", "Taehyung", "Jungkook", "RM"],
    answer: "Jungkook"
  },
  {
    question: "What is the name of BTS's fandom?",
    options: ["BLINK", "ARMY", "ONCE", "STAY"],
    answer: "ARMY"
  },
  {
    question: "Which BTS member is the leader?",
    options: ["Jin", "Suga", "RM", "J-Hope"],
    answer: "RM"
  },
  {
    question: "What color represents BTS ARMY?",
    options: ["Blue", "Pink", "Purple", "Gold"],
    answer: "Purple"
  },
  {
    question: "Which member said 'I purple you'?",
    options: ["Jimin", "Taehyung", "Jungkook", "Jin"],
    answer: "Taehyung"
  },
  {
    question: "What is BTS's lightstick called?",
    options: ["Army Bomb", "Purple Stick", "BTS Wand", "Star Stick"],
    answer: "Army Bomb"
  }
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === questions[current].answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setAnswered(false);
  };

  const getResultMessage = () => {
    if (score === 10) return "Perfect score! You're a true ARMY! 💜🏆";
    if (score >= 8) return "Amazing! You really know BTS! 💜⭐";
    if (score >= 6) return "Great job ARMY! Keep stanning! 💜";
    if (score >= 4) return "Not bad! Keep learning about BTS! 💜";
    return "Keep listening to BTS and try again! 💜";
  };

  const getOptionStyle = (option) => {
    if (!answered) return styles.option;
    if (option === questions[current].answer) return {...styles.option, ...styles.correct};
    if (option === selected && option !== questions[current].answer)
      return {...styles.option, ...styles.wrong};
    return {...styles.option, ...styles.dimmed};
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img src={logo} alt="Purple Family" style={{height: "40px"}} />
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {!showResult ? (
          <div style={styles.quizCard}>
            {/* Progress */}
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill,
                width: `${((current) / questions.length) * 100}%`}} />
            </div>
            <div style={styles.progressText}>
              Question {current + 1} of {questions.length} • Score: {score}
            </div>

            {/* Question */}
            <h2 style={styles.question}>{questions[current].question}</h2>

            {/* Options */}
            <div style={styles.options}>
              {questions[current].options.map((option, i) => (
                <button key={i} onClick={() => handleAnswer(option)}
                  style={getOptionStyle(option)}>
                  <span style={styles.optionLetter}>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  {option}
                  {answered && option === questions[current].answer && " ✅"}
                  {answered && option === selected &&
                    option !== questions[current].answer && " ❌"}
                </button>
              ))}
            </div>

            {/* Next Button */}
            {answered && (
              <button onClick={handleNext} style={styles.nextBtn}>
                {current + 1 < questions.length ? "Next Question →" : "See Results 🏆"}
              </button>
            )}
          </div>
        ) : (
          /* Results */
          <div style={styles.resultCard}>
            <div style={styles.resultEmoji}>
              {score === 10 ? "🏆" : score >= 7 ? "⭐" : "💜"}
            </div>
            <h2 style={styles.resultTitle}>Quiz Complete!</h2>
            <div style={styles.scoreCircle}>
              <span style={styles.scoreNumber}>{score}</span>
              <span style={styles.scoreTotal}>/{questions.length}</span>
            </div>
            <p style={styles.resultMessage}>{getResultMessage()}</p>

            {/* Score breakdown */}
            <div style={styles.breakdown}>
              <div style={styles.breakdownItem}>
                <span style={styles.correct2}>✅ Correct</span>
                <span style={styles.breakdownNum}>{score}</span>
              </div>
              <div style={styles.breakdownItem}>
                <span style={styles.wrong2}>❌ Wrong</span>
                <span style={styles.breakdownNum}>{questions.length - score}</span>
              </div>
            </div>

            <button onClick={handleRestart} style={styles.restartBtn}>
              🔄 Try Again
            </button>
            <button onClick={() => navigate("/dashboard")} style={styles.homeBtn}>
              🏠 Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8f5ff" },
  header: { background: "white", padding: "1rem 2rem", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    borderBottom: "2px solid #e0d0ff" },
  logo: { color: "#7c3aed", margin: 0 },
  backBtn: { padding: "8px 16px", background: "white",
    border: "1px solid #d4b8ff", color: "#7c3aed",
    borderRadius: "6px", cursor: "pointer" },
  content: { maxWidth: "700px", margin: "3rem auto", padding: "0 1rem" },
  quizCard: { background: "white", borderRadius: "16px", padding: "2rem",
    border: "1px solid #d4b8ff" },
  progressBar: { background: "#f0e6ff", borderRadius: "10px",
    height: "8px", marginBottom: "0.5rem" },
  progressFill: { background: "#7c3aed", height: "8px",
    borderRadius: "10px", transition: "width 0.3s" },
  progressText: { color: "#888", fontSize: "0.9rem", marginBottom: "2rem" },
  question: { color: "#2d0a4e", fontSize: "1.4rem", marginBottom: "1.5rem",
    lineHeight: 1.4 },
  options: { display: "flex", flexDirection: "column", gap: "0.75rem",
    marginBottom: "1.5rem" },
  option: { padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid #d4b8ff",
    background: "#f8f5ff", color: "#2d0a4e", fontSize: "1rem", cursor: "pointer",
    textAlign: "left", display: "flex", alignItems: "center", gap: "1rem" },
  correct: { background: "#d4edda", border: "2px solid #28a745", color: "#155724" },
  wrong: { background: "#f8d7da", border: "2px solid #dc3545", color: "#721c24" },
  dimmed: { opacity: 0.5 },
  optionLetter: { background: "#7c3aed", color: "white", borderRadius: "50%",
    width: "28px", height: "28px", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "0.85rem", fontWeight: "bold",
    flexShrink: 0 },
  nextBtn: { width: "100%", padding: "14px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "10px", fontSize: "1.1rem", cursor: "pointer",
    fontWeight: "bold" },
  resultCard: { background: "white", borderRadius: "16px", padding: "3rem",
    border: "1px solid #d4b8ff", textAlign: "center" },
  resultEmoji: { fontSize: "4rem", marginBottom: "1rem" },
  resultTitle: { color: "#2d0a4e", fontSize: "2rem", marginBottom: "1.5rem" },
  scoreCircle: { width: "120px", height: "120px", borderRadius: "50%",
    background: "#f0e6ff", border: "4px solid #7c3aed", display: "flex",
    alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" },
  scoreNumber: { fontSize: "2.5rem", fontWeight: "bold", color: "#7c3aed" },
  scoreTotal: { fontSize: "1.2rem", color: "#888" },
  resultMessage: { color: "#2d0a4e", fontSize: "1.1rem", marginBottom: "2rem" },
  breakdown: { display: "flex", justifyContent: "center", gap: "3rem",
    marginBottom: "2rem" },
  breakdownItem: { display: "flex", flexDirection: "column", alignItems: "center",
    gap: "0.5rem" },
  correct2: { color: "#28a745", fontWeight: "bold" },
  wrong2: { color: "#dc3545", fontWeight: "bold" },
  breakdownNum: { fontSize: "1.5rem", fontWeight: "bold", color: "#2d0a4e" },
  restartBtn: { width: "100%", padding: "14px", background: "#7c3aed", border: "none",
    color: "white", borderRadius: "10px", fontSize: "1.1rem", cursor: "pointer",
    marginBottom: "1rem" },
  homeBtn: { width: "100%", padding: "14px", background: "white",
    border: "2px solid #7c3aed", color: "#7c3aed", borderRadius: "10px",
    fontSize: "1.1rem", cursor: "pointer" }
};