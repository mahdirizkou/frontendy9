import React, { useState, useContext } from "react";
import "./login.css";
import { UserContext } from "./UserContext"; 
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const validate = () => {
    if (!username) return "Username is required";
    if (!email) return "Email is required";
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

    fetch("http://127.0.0.1:8000/yalahntla9aw/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from backend:", data);
        if (data && data.tokens) {
          // context in login
          login(data.user, data.tokens);
          navigate("/face");
        } else {
          setError(data.error || "Registration failed");
        }
      })
      .catch((err) => setError("Network error: " + err.message));
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Register</h1>
      <p className="login-subtitle">Create your account to get started.</p>

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
          <label className="form-label" htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="firstName">First Name:</label>
          <input
            id="firstName"
            type="text"
            className="form-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lastName">Last Name:</label>
          <input
            id="lastName"
            type="text"
            className="form-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
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

        <button type="submit" className="submit-button">Sign Up</button>
      </form>

      <div className="signup-section">
        <p>
          Already have an account?{" "}
          <a href="/login" className="signup-link">Login</a>
        </p>
      </div>
    </div>
  );
}
export default Register;
