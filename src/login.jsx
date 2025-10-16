import React, { useState, useContext } from "react";
import "./login.css";
import { UserContext } from "./UserContext"; 
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(UserContext); // login context
  const navigate = useNavigate();

  const validate = () => {
    if (!username) return "Username is required";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");

    fetch("http://127.0.0.1:8000/yalahntla9aw/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from backend:", data);
        if (data && data.tokens) {
          // context
          login(data.user, data.tokens); 
          navigate("/face");
        } else {
          setError(data.error || "Login failed");
        }
      })
      .catch((err) => setError("Network error: " + err.message));
  };



  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <p className="login-subtitle">Welcome back! Please enter your details.</p>

      {error && <div className="error-message">{error}</div>}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="remember-forgot-section">
          <label className="remember-me">
            <input
              type="checkbox"
              className="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <a href="#" className="forgot-password">Forgot password?</a>
        </div>

        <button type="submit" className="submit-button">Sign In</button>
      </form>

      <div className="signup-section">
        <p>
          Don't have an account?{" "}
          <span 
            className="signup-link" 
            onClick={() => navigate("/register")} 
            style={{ cursor: "pointer" }}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
export default Login