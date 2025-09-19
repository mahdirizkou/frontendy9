import { Box, Typography, Avatar, Card, CardContent, Stack } from "@mui/material";
import React, { useContext } from "react";
import { UserContext } from "../UserContext";

const Profile = () => {
  const { user } = useContext(UserContext);

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
        Profile
      </Typography>
      
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Stack alignItems="center" spacing={2}>
            <Avatar 
              sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
            
            <Typography variant="h5" component="div">
              {user?.name || 'User Name'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                Location: Casablanca, Morocco
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since: {new Date().getFullYear()}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;