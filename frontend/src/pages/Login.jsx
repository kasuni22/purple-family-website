import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../api/axios";
import logo from "../assets/logo.svg";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card login-card">
        <div className="auth-left">
          <img src={logo} alt="Purple Family" className="auth-logo" />
          <h1>Welcome back ARMY 💜</h1>
          <p>Login to continue your Purple Family journey.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Email Address</label>
            <input
              placeholder="army@email.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <label>Password</label>
            <div className="password-box">
              <input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login 💜"}
            </button>
          </form>

          <p className="auth-bottom">
            New ARMY? <Link to="/register">Join the Family</Link>
          </p>
        </div>

        <div className="auth-right">
          <div className="auth-glass">
            <span>🎤</span>
            <h2>Purple Family</h2>
            <p>Birthdays, wallpapers, sing-along, quizzes and ARMY memories in one beautiful place.</p>
          </div>
        </div>
      </section>

      <AuthStyles />
    </main>
  );
}

function AuthStyles() {
  return (
    <style>{`
      .auth-page{
        min-height:100vh;
        display:grid;
        place-items:center;
        padding:24px;
      }

      .auth-card{
        width:min(1050px,100%);
        min-height:620px;
        display:grid;
        grid-template-columns:1fr 1fr;
        background:rgba(255,255,255,.82);
        border:1px solid rgba(124,58,237,.16);
        border-radius:34px;
        overflow:hidden;
        box-shadow:0 30px 80px rgba(76,29,149,.18);
      }

      .auth-left{
        padding:56px;
        display:flex;
        flex-direction:column;
        justify-content:center;
      }

      .auth-logo{
        width:64px;
        margin-bottom:22px;
      }

      .auth-left h1{
        font-size:2.7rem;
        color:#241039;
        line-height:1;
        letter-spacing:-.05em;
        margin-bottom:14px;
      }

      .auth-left p{
        color:#7c6a92;
        line-height:1.7;
        margin-bottom:30px;
      }

      .auth-form{
        display:flex;
        flex-direction:column;
        gap:12px;
      }

      .auth-form label{
        color:#4c1d95;
        font-weight:800;
        font-size:.9rem;
      }

      .auth-form input{
        width:100%;
        padding:14px 16px;
        border-radius:16px;
        border:1px solid rgba(124,58,237,.22);
        background:white;
        color:#241039;
        font-size:1rem;
        outline:none;
      }

      .password-box{
        position:relative;
      }

      .password-box input{
        padding-right:50px;
      }

      .password-box button{
        position:absolute;
        right:14px;
        top:50%;
        transform:translateY(-50%);
        background:transparent;
        border:none;
        cursor:pointer;
        color:#7c3aed;
        display:flex;
      }

      .auth-submit{
        margin-top:12px;
        padding:15px;
        border-radius:999px;
        background:linear-gradient(135deg,#7c3aed,#ec4899);
        color:white;
        font-size:1rem;
        font-weight:900;
        cursor:pointer;
        border:none;
        box-shadow:0 16px 30px rgba(124,58,237,.25);
      }

      .auth-bottom{
        margin-top:24px !important;
        margin-bottom:0 !important;
      }

      .auth-bottom a{
        color:#7c3aed;
        font-weight:900;
      }

      .auth-right{
        display:grid;
        place-items:center;
        padding:40px;
        background:radial-gradient(circle at 30% 20%,rgba(236,72,153,.55),transparent 35%),linear-gradient(135deg,#4c1d95,#7c3aed);
      }

      .auth-glass{
        padding:42px;
        border-radius:30px;
        background:rgba(255,255,255,.14);
        border:1px solid rgba(255,255,255,.25);
        backdrop-filter:blur(18px);
        color:white;
        text-align:center;
      }

      .auth-glass span{
        font-size:4rem;
      }

      .auth-glass h2{
        font-size:2.3rem;
        margin-top:18px;
      }

      .auth-glass p{
        color:rgba(255,255,255,.82);
        line-height:1.7;
        margin-top:12px;
      }

      @media(max-width:768px){
        .auth-page{
          padding:18px;
          align-items:start;
          padding-top:28px;
        }

        .auth-card{
          min-height:auto;
          grid-template-columns:1fr;
          border-radius:28px;
        }

        .auth-left{
          padding:34px 22px;
          text-align:center;
        }

        .auth-logo{
          width:58px;
          margin:0 auto 18px;
        }

        .auth-left h1{
          font-size:2.1rem;
        }

        .auth-left p{
          font-size:.95rem;
          margin-bottom:24px;
        }

        .auth-form{
          text-align:left;
        }

        .auth-form input{
          padding:14px;
          border-radius:14px;
        }

        .auth-submit{
          padding:15px;
        }

        .auth-right{
          display:none;
        }
      }
    `}</style>
  );
}