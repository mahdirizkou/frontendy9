// App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./login";
import Profile from "./profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
