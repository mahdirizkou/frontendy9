import Sidebar from "./sidebar";
import Feed from "./feed";
import Rightbar from "./rightbar";
import { Box, createTheme, Stack, ThemeProvider } from "@mui/material";
import Navbar from "./navbar";
import Add from "./add";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

// Import your other components
import Clubs from "../pages/Clubs";
import CreatedClubs from "../pages/CreatedClubs";
import Notifications from "../pages/notification";
import Explore from "../pages/Explore";
import Messagerie from "../pages/message";
import Profile from "../pages/profile";
import Settings from "../pages/Settings";
import JoinClub from "../pages/joinclub";
import UserNotifications from "../pages/notificationuser";
import ClubMembers from "../pages/ClubMembers";
import YourClubs from "../pages/YourClubs";
import { UserContext } from "../UserContext";

function Face() {
  const { user, accessToken } = useContext(UserContext);
  const [mode, setMode] = useState("light");
  const [activeComponent, setActiveComponent] = useState("home");
  const [selectedClubId, setSelectedClubId] = useState(null); 
  const [isCreator, setIsCreator] = useState(false);
  const navigate = useNavigate(); 

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !accessToken) {
      navigate("/login"); 
    }
  }, [user, accessToken, navigate]);

  useEffect(() => {
    const checkIfCreator = async () => {
      if (!user?.id || !accessToken) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const clubsData = await response.json();
          const userCreatedClubs = clubsData.filter(club => club.creator.id === user.id);
          setIsCreator(userCreatedClubs.length > 0);
        }
      } catch (error) {
        console.error("Error checking creator status:", error);
        setIsCreator(false);
      }
    };

    checkIfCreator();
  }, [user?.id, accessToken]);

  const darkTheme = createTheme({
    palette: {
      mode: mode,
    },
  });

  const handleClubMessagesView = (clubId) => {
    setSelectedClubId(clubId);
    setActiveComponent("clubMessages");
  };

  const renderMainContent = () => {
    switch(activeComponent) {
      case "notifications":
        return isCreator ? <Notifications /> : <UserNotifications />;
      case "home":
        return <Explore />;
      case "messagerie":
        return <Messagerie />;
      case "joinedClubs":
        return <JoinClub onViewMessages={handleClubMessagesView} />;
      case "myClubs":
        return <Clubs onViewMessages={handleClubMessagesView} />;
      case "createdClubs":
        return <CreatedClubs onViewMessages={handleClubMessagesView} />;
      case "clubMembers":
        return <ClubMembers />;
      case "yourClubs": 
        return <YourClubs onViewMessages={handleClubMessagesView} />;
      case "clubMessages":
        return <ClubMessages clubId={selectedClubId} />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return <Feed />;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box bgcolor={"background.default"} color={"text.primary"}>
        <Navbar setActiveComponent={setActiveComponent} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Sidebar 
            setMode={setMode} 
            mode={mode}
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
          {renderMainContent()}
          <Rightbar />
        </Stack>
        <Add />
      </Box>
    </ThemeProvider>
  );
}

export default Face;
