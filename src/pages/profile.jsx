import { 
  Box, Typography, Avatar, Card, CardContent, 
  Stack, Grid, Chip, Divider, Button 
} from "@mui/material";
import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, accessToken, logout } = useContext(UserContext);
  const [userStats, setUserStats] = useState({
    createdClubs: 0,
    joinedClubs: 0,
    totalPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id || !accessToken) return;

      try {
        const clubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const joinedClubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/userclubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const postsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let createdClubs = 0;
        let joinedClubs = 0;
        let totalPosts = 0;

        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          createdClubs = clubsData.filter(club => 
            club.creator && club.creator.id === user.id
          ).length;
        }

        if (joinedClubsResponse.ok) {
          const joinedData = await joinedClubsResponse.json();
          joinedClubs = joinedData.length;
        }

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          totalPosts = postsData.filter(post => 
            post.user && post.user.id === user.id
          ).length;
        }

        setUserStats({
          createdClubs,
          joinedClubs,
          totalPosts
        });

      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.id, accessToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getUserRole = () => {
    const { createdClubs, joinedClubs } = userStats;
    
    if (createdClubs > 0 && joinedClubs > 0) {
      return { label: "Creator & Member", color: "primary", icon: "👑🎯" };
    } else if (createdClubs > 0) {
      return { label: "Club Creator", color: "warning", icon: "👑" };
    } else if (joinedClubs > 0) {
      return { label: "Club Member", color: "success", icon: "🎯" };
    } else {
      return { label: "New User", color: "default", icon: "🌟" };
    }
  };

  const role = getUserRole();

  const handleLogout = () => {
    logout(); 
    navigate("/login");
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
        Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Main Profile Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="center" spacing={3}>
                <Avatar 
                  sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem' }}
                >
                  {user?.username ? user.username[0].toUpperCase() : 'U'}
                </Avatar>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {user?.username || 'User Name'}
                  </Typography>
                  
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                    {user?.email || 'user@example.com'}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={`${role.icon} ${role.label}`}
                      color={role.color}
                      size="medium"
                      sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2, py: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ width: '100%' }} />

                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography variant="body1" gutterBottom>
                    📍 Location: Casablanca, Morocco
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since: {user?.date_joined ? formatDate(user.date_joined) : new Date().getFullYear()}
                  </Typography>
                </Box>

                {/* زر تسجيل الخروج */}
                <Button 
                  variant="contained" 
                  color="error" 
                  sx={{ mt: 3 }}
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                Activity Statistics
              </Typography>
              
              <Stack spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {loading ? '...' : userStats.createdClubs}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    👑 Clubs Created
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {loading ? '...' : userStats.joinedClubs}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    🎯 Clubs Joined
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                    {loading ? '...' : userStats.totalPosts}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    📝 Posts Created
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
