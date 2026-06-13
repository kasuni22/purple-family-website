import { Heart, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="pf-footer">
      <div className="pf-footer-container">
        <div className="pf-footer-brand">
          <h2>💜 Purple Family</h2>
          <p>
            A beautiful home for BTS ARMYs to share birthdays, wallpapers,
            songs, quizzes and memories.
          </p>

          <a
            href="https://chat.whatsapp.com/DxIhmvj7N6jI6xKMaBOmeO"
            target="_blank"
            rel="noopener noreferrer"
            className="pf-whatsapp"
          >
            <Users size={18} />
            WhatsApp Community
          </a>
        </div>

        <div className="pf-footer-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/birthdays">Birthdays</a>
          <a href="/wallpapers">Wallpapers</a>
          <a href="/members">Members</a>
          <a href="/singalong">Sing Along</a>
          <a href="/quiz">Quiz</a>
        </div>
      </div>

      <div className="pf-footer-bottom">
        <p>
          Made by <Heart size={14} fill="currentColor" /> Kasuni Kariyawasam
        </p>
        <p>Built with 🐍 Python & ⚛️ React</p>
        <p>© {new Date().getFullYear()} Purple Family. All rights reserved.</p>
      </div>

      <style>{`
        .pf-footer {
          margin-top: 80px;
          background: linear-gradient(135deg,#1e1b4b,#581c87);
          color: white;
        }

        .pf-footer-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 55px 24px 35px;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 40px;
        }

        .pf-footer-brand h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .pf-footer-brand p {
          max-width: 560px;
          color: rgba(255,255,255,0.78);
          line-height: 1.8;
        }

        .pf-whatsapp {
          margin-top: 22px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 16px;
          background: #25D366;
          color: white;
          text-decoration: none;
          font-weight: 700;
        }

        .pf-footer-links {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 14px;
          align-content: start;
        }

        .pf-footer-links a {
          color: rgba(255,255,255,0.84);
          text-decoration: none;
          font-weight: 600;
        }

        .pf-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.12);
          max-width: 1300px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          color: rgba(255,255,255,0.72);
        }

        .pf-footer-bottom p {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 768px) {
          .pf-footer {
            margin-top: 50px;
            text-align: center;
          }

          .pf-footer-container {
            padding: 42px 20px 28px;
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .pf-footer-brand h2 {
            font-size: 2.1rem;
          }

          .pf-footer-brand p {
            max-width: 100%;
            font-size: 1rem;
          }

          .pf-whatsapp {
            width: 100%;
            justify-content: center;
            border-radius: 999px;
            padding: 14px 18px;
          }

          .pf-footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .pf-footer-links a {
            background: rgba(255,255,255,0.08);
            padding: 13px 10px;
            border-radius: 14px;
          }

          .pf-footer-bottom {
            padding: 22px 20px 28px;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }
        }

        @media (max-width: 420px) {
          .pf-footer-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}