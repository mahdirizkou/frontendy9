import { Box, Typography, List, ListItem, ListItemText, Switch, Divider } from "@mui/material";
import React, { useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    privacy: false
  });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <Box 
      flex={4} 
      p={{ xs: 0, md: 2 }}
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Settings
      </Typography>
      
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <List>
          <ListItem>
            <ListItemText 
              primary="Push Notifications" 
              secondary="Receive notifications about club activities"
            />
            <Switch
              checked={settings.notifications}
              onChange={() => handleSettingChange('notifications')}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText 
              primary="Email Updates" 
              secondary="Get email updates about your clubs"
            />
            <Switch
              checked={settings.emailUpdates}
              onChange={() => handleSettingChange('emailUpdates')}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText 
              primary="Private Profile" 
              secondary="Make your profile visible only to club members"
            />
            <Switch
              checked={settings.privacy}
              onChange={() => handleSettingChange('privacy')}
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Settings;