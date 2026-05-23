import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Birthdays from "./pages/Birthdays";
import Wallpapers from "./pages/Wallpapers";
import Members from "./pages/Members";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;