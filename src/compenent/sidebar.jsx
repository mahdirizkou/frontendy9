import {
  AccountBox,
  Article,
  Group,
  Home,
  ModeNight,
  Settings,
  Storefront,
} from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
} from "@mui/material";
import React from "react";

const Sidebar = ({ mode, setMode, activeComponent, setActiveComponent }) => {
  // Menu items with their corresponding component keys
  const menuItems = [
    { 
      text: "Homepage", 
      icon: <Home />, 
      componentKey: "home" 
    },
    { 
      text: "The clubs I joined", 
      icon: <Article />, 
      componentKey: "myClubs" 
    },
    { 
      text: "The clubs I created", 
      icon: <Group />, 
      componentKey: "createdClubs" 
    },
    { 
      text: "Explore", 
      icon: <Storefront />, 
      componentKey: "explore" 
    },
    { 
      text: "Settings", 
      icon: <Settings />, 
      componentKey: "settings" 
    },
    { 
      text: "Profile", 
      icon: <AccountBox />, 
      componentKey: "profile" 
    },
  ];

  const handleMenuClick = (componentKey) => {
    setActiveComponent(componentKey);
  };

  return (
    <Box flex={1} p={2} sx={{ display: { xs: "none", sm: "block" } }}>
      <Box position="fixed">
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component="span"
                onClick={() => handleMenuClick(item.componentKey)}
                sx={{
                  backgroundColor: activeComponent === item.componentKey 
                    ? 'primary.main' 
                    : 'transparent',
                  color: activeComponent === item.componentKey 
                    ? 'white' 
                    : 'text.primary',
                  '&:hover': {
                    backgroundColor: activeComponent === item.componentKey 
                      ? 'primary.dark' 
                      : 'action.hover',
                  },
                  borderRadius: 1,
                  mb: 0.5
                }}
              >
                <ListItemIcon sx={{ 
                  color: activeComponent === item.componentKey 
                    ? 'white' 
                    : 'text.primary' 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          
          {/* Dark Mode Switch */}
          <ListItem disablePadding>
            <ListItemButton component="span">
              <ListItemIcon>
                <ModeNight />
              </ListItemIcon>
              <Switch 
                onChange={() => setMode(mode === "light" ? "dark" : "light")}
                checked={mode === "dark"}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;