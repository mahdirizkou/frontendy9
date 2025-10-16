// App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./home";
import Register from "./register";
import Feed from "./compenent/feed";
import Face from "./compenent/face";
import Profile from "./pages/profile"
import Login from "./login"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/face" element={<Face />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/face" element={<Face />} /> */}

      {/* <Route path="/register" element={<Register />} /> */}
    </Routes>
  );
}

export default App;
