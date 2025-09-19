import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout, accessToken } = useContext(UserContext);
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clubs");
        }

        const data = await response.json();
        setClubs(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClubs();
  }, [accessToken]);

  if (!user) return <p>Please login first</p>;

  return (
    <div className="home-page">
      {/* Left Sidebar */}
      <aside className="sidebar left">
        <div className="profile">
          <img src={user.profileImage || "https://via.placeholder.com/50"} alt="profile" />
          <p>{user.username}</p>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
        <nav>
          <ul>
          <li onClick={() => navigate("/register")}>Explore</li>
          <li onClick={() => navigate("/my-clubs")}>The clubs I joined</li>
          <li onClick={() => navigate("/settings")}>Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Feed */}
      <main className="feed">
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <div key={club.club_id} className="post-card">
              {club.image_url && <img src={club.image_url} alt={club.name} />}
              <div className="post-content">
                <h3>{club.name}</h3>
                <p>{club.description}</p>
                <span>{club.category} | {club.city} | {club.creator.username}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No clubs available.</p>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="sidebar right">
        <h3>Suggestions</h3>
        <ul>
          <li>Club A</li>
          <li>Club B</li>
          <li>Club C</li>
        </ul>
      </aside>
    </div>
  );
}
