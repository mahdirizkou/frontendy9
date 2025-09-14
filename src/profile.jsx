import React, { useContext } from "react";
import { UserContext } from "./UserContext";

export default function Profile() {
  const { user, logout } = useContext(UserContext);

  if (!user) return <p>Please login first</p>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}