import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../api/axios";
import logo from "../assets/logo.svg";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    country: "",
    bias: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        birthday: form.birthday || null,
        country: form.country,
        bias: form.bias,
      });

      alert("Registration successful 💜");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card register-card">
        <div className="auth-left">
          <img src={logo} alt="Purple Family" className="auth-logo" />
          <h1>Join Purple Family 💜</h1>
          <p>Create your ARMY profile and become part of our BTS community.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />

            <div className="password-box">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="password-box">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input type="date" name="birthday" value={form.birthday} onChange={handleChange} />
            <input name="country" placeholder="Country" value={form.country} onChange={handleChange} />

            <select name="bias" value={form.bias} onChange={handleChange}>
              <option value="">Select Your Bias</option>
              <option value="RM">RM</option>
              <option value="Jin">Jin</option>
              <option value="SUGA">SUGA</option>
              <option value="j-hope">j-hope</option>
              <option value="Jimin">Jimin</option>
              <option value="V">V</option>
              <option value="Jung Kook">Jung Kook</option>
              <option value="OT7">OT7</option>

            </select>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account 💜"}
            </button>
          </form>

          <p className="auth-bottom">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="auth-right">
          <div className="auth-glass">
            <span>💜</span>
            <h2>Welcome ARMY</h2>
            <p>Share wallpapers, celebrate birthdays, play BTS quizzes and connect with fellow ARMYs.</p>
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
        width:min(1100px,100%);
        display:grid;
        grid-template-columns:1fr 1fr;
        overflow:hidden;
        border-radius:34px;
        background:rgba(255,255,255,.85);
        border:1px solid rgba(124,58,237,.14);
        box-shadow:0 30px 80px rgba(76,29,149,.18);
      }

      .auth-left{
        padding:50px;
      }

      .auth-logo{
        width:64px;
        margin-bottom:20px;
      }

      .auth-left h1{
        font-size:2.7rem;
        color:#241039;
        margin-bottom:12px;
        letter-spacing:-.04em;
      }

      .auth-left p{
        color:#7c6a92;
        margin-bottom:25px;
        line-height:1.6;
      }

      .auth-form{
        display:flex;
        flex-direction:column;
        gap:14px;
      }

      .auth-form input,
      .auth-form select{
        width:100%;
        padding:14px 16px;
        border-radius:16px;
        border:1px solid rgba(124,58,237,.22);
        outline:none;
        font-size:1rem;
        background:white;
        color:#241039;
      }

      .password-box{
        position:relative;
      }

      .password-box input{
        padding-right:50px;
      }

      .password-box button{
        position:absolute;
        top:50%;
        right:14px;
        transform:translateY(-50%);
        border:none;
        background:transparent;
        cursor:pointer;
        color:#7c3aed;
        display:flex;
      }

      .auth-submit{
        margin-top:10px;
        border:none;
        border-radius:999px;
        padding:15px;
        color:white;
        font-weight:900;
        cursor:pointer;
        background:linear-gradient(135deg,#7c3aed,#ec4899);
        box-shadow:0 16px 30px rgba(124,58,237,.22);
      }

      .auth-bottom{
        margin-top:20px !important;
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
        background:linear-gradient(135deg,#4c1d95,#7c3aed,#ec4899);
      }

      .auth-glass{
        background:rgba(255,255,255,.12);
        border:1px solid rgba(255,255,255,.2);
        backdrop-filter:blur(15px);
        border-radius:30px;
        padding:40px;
        color:white;
        text-align:center;
      }

      .auth-glass span{
        font-size:4rem;
      }

      .auth-glass h2{
        margin-top:18px;
        font-size:2rem;
      }

      .auth-glass p{
        margin-top:12px;
        line-height:1.8;
        color:rgba(255,255,255,.85);
      }

      @media(max-width:768px){
        .auth-page{
          padding:18px;
          align-items:start;
          padding-top:28px;
        }

        .auth-card{
          grid-template-columns:1fr;
          border-radius:28px;
        }

        .auth-left{
          padding:32px 22px;
          text-align:center;
        }

        .auth-logo{
          width:58px;
          margin:0 auto 18px;
        }

        .auth-left h1{
          font-size:2.05rem;
          line-height:1.05;
        }

        .auth-left p{
          font-size:.95rem;
          margin-bottom:22px;
        }

        .auth-form{
          text-align:left;
          gap:12px;
        }

        .auth-form input,
        .auth-form select{
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