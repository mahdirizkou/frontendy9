import Sidebar from "./sidebar";
import Feed from "./feed";
import Rightbar from "./rightbar";
import { Box, createTheme, Stack, ThemeProvider } from "@mui/material";
import Navbar from "./navbar";
import Add from "./add";
import { useState } from "react";

// Import your other components
import MyClubs from "../pages/MyClubs";
import CreatedClubs from "../pages/CreatedClubs";
import Explore from "../pages/Explore";
import Profile from "../pages/profile";
import Settings from "../pages/Settings";

function Face() {
  const [mode, setMode] = useState("light");
  const [activeComponent, setActiveComponent] = useState("home"); // State to track active component

  const darkTheme = createTheme({
    palette: {
      mode: mode,
    },
  });

  
  const renderMainContent = () => {
    switch(activeComponent) {
      case "home":
        return <Feed />;
      case "myClubs":
        return <MyClubs />;
      case "createdClubs":
        return <CreatedClubs />;
      case "explore":
        return <Explore />;
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
        <Navbar />
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