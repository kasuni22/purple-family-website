import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Birthdays from "./pages/Birthdays";
import Wallpapers from "./pages/Wallpapers";
import Members from "./pages/Members";
import Singalong from "./pages/Singalong";
import Quiz from "./pages/Quiz";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/birthdays" element={token ? <Birthdays /> : <Navigate to="/login" />} />
        <Route path="/wallpapers" element={token ? <Wallpapers /> : <Navigate to="/login" />} />
        <Route path="/members" element={token ? <Members /> : <Navigate to="/login" />} />
        <Route path="/singalong" element={token ? <Singalong /> : <Navigate to="/login" />} />
        <Route path="/quiz" element={token ? <Quiz /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;