import { Box, Typography, Stack, Skeleton, Card, CardContent, CardMedia, Avatar, Chip, Grid, Button, Alert } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const Clubs = () => {
  const { accessToken, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [myClubs, setMyClubs] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const clubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        
        const userClubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/userclubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        
        const requestsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/my-membership-requests/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          setMyClubs(clubsData);
        }

        if (userClubsResponse.ok) {
          const userClubsData = await userClubsResponse.json();
          setUserClubs(userClubsData.map(uc => uc.club));
        }

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setPendingRequests(requestsData.filter(req => req.status === 'pending').map(req => req.club.club_id));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const handleJoinRequest = async (clubId) => {
    setRequestLoading(prev => ({ ...prev, [clubId]: true }));

    try {
      const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/membership-requests/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          club_id: clubId
        })
      });

      if (response.ok) {
        
        setPendingRequests(prev => [...prev, clubId]);
        alert("Join request sent successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send join request");
      }

    } catch (error) {
      console.error("Error sending join request:", error);
      alert("Error sending join request");
    } finally {
      setRequestLoading(prev => ({ ...prev, [clubId]: false }));
    }
  };

  const getClubStatus = (club) => {
    if (club.creator.id === user?.id) {
      return { type: 'owner', label: '👑 Your Club', color: 'warning' };
    }
    
    
    if (userClubs.includes(club.club_id)) {
      return { type: 'member', label: '✅ Member', color: 'success' };
    }
    
   
    if (pendingRequests.includes(club.club_id)) {
      return { type: 'pending', label: '⏳ Request Pending', color: 'info' };
    }
    
   
    return { type: 'available', label: 'Join Club', color: 'primary' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        All Clubs
      </Typography>
      
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : myClubs.length > 0 ? (
        <Grid container spacing={3}>
          {myClubs.map((club) => {
            const status = getClubStatus(club);
            return (
              <Grid item xs={12} sm={6} md={4} key={club.club_id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: 2,
                    border: status.type === 'owner' ? 2 : 0,
                    borderColor: status.type === 'owner' ? 'warning.main' : 'transparent',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  {/* Club Image */}
                  <CardMedia
                    component="img"
                    sx={{ 
                      height: 200,
                      objectFit: 'cover'
                    }}
                    image={club.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={club.name}
                  />

                  {/* Club Content */}
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header with Name and Category */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                        {club.name}
                      </Typography>
                      <Chip 
                        label={club.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>

                    {/* Status Chip */}
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={status.label}
                        size="small" 
                        color={status.color}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, flex: 1 }}
                    >
                      {club.description}
                    </Typography>

                    {/* Location and Date */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        📍 {club.city}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 Created {formatDate(club.creation_date)}
                      </Typography>
                    </Box>

                    {/* Creator Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'secondary.main', 
                          mr: 1,
                          width: 32,
                          height: 32
                        }}
                      >
                        {club.creator.username[0].toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Created by
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {club.creator.username}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Join Button */}
                    {status.type === 'available' && (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={requestLoading[club.club_id]}
                        onClick={() => handleJoinRequest(club.club_id)}
                        sx={{ mt: 'auto' }}
                      >
                        {requestLoading[club.club_id] ? 'Sending...' : 'Request to Join'}
                      </Button>
                    )}

                    {status.type === 'pending' && (
                      <Alert severity="info" sx={{ mt: 'auto' }}>
                        Request sent - waiting for approval
                      </Alert>
                    )}

                    {status.type === 'member' && (
                      <Alert severity="success" sx={{ mt: 'auto' }}>
                        You are a member of this club
                      </Alert>
                    )}

                    {status.type === 'owner' && (
                      <Alert severity="warning" sx={{ mt: 'auto' }}>
                        You own this club
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            🏟️ No Clubs Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No clubs available yet
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Clubs;