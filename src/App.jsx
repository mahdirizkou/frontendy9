// App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./login";
import Home from "./home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
