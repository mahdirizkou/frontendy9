import { 
  Box, Typography, Stack, Skeleton, Card, CardContent, CardMedia, Avatar, 
  Chip, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Snackbar
} from "@mui/material";
import { Add, PostAdd } from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const JoinClub = () => {
  const { accessToken, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [clubsDetails, setClubsDetails] = useState([]);
  
  // Post creation states
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchJoinedClubs = async () => {
      try {
        // Fetch user's joined clubs
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/userclubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch joined clubs");

        const joinedData = await response.json();
        setJoinedClubs(joinedData);

        // Fetch details for each club
        if (joinedData.length > 0) {
          const clubDetailsPromises = joinedData.map(async (joinRecord) => {
            try {
              const clubResponse = await fetch(`http://127.0.0.1:8000/yalahntla9aw/clubs/${joinRecord.club}/`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: accessToken ? `Bearer ${accessToken}` : "",
                },
              });
              
              if (clubResponse.ok) {
                const clubData = await clubResponse.json();
                return {
                  ...clubData,
                  joinDate: joinRecord.user.date_joined,
                  joinId: joinRecord.id,
                  joinedUser: joinRecord.user
                };
              }
              return null;
            } catch (error) {
              console.error(`Error fetching club ${joinRecord.club}:`, error);
              return null;
            }
          });

          const clubsData = await Promise.all(clubDetailsPromises);
          setClubsDetails(clubsData.filter(club => club !== null));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedClubs();
  }, [accessToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCreatePost = (club) => {
    setSelectedClub(club);
    setOpenCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setOpenCreatePost(false);
    setSelectedClub(null);
    setPostData({
      title: '',
      content: '',
      image_url: ''
    });
  };

  const handlePostSubmit = async () => {
    if (!postData.title.trim() || !postData.content.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in title and content',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create the post
      const postResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          image_url: postData.image_url || null,
          club: selectedClub.club_id,
          author: user.id,
          status: 'pending' // Post needs approval from club creator
        }),
      });

      if (postResponse.ok) {
        const newPost = await postResponse.json();
        
        // Send notification to club creator
        const notificationResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/notifications/", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user: selectedClub.creator.id,
            club: selectedClub.club_id,
            message: `New post "${postData.title}" submitted by ${user.username} and awaiting your approval.`,
            notification_type: 'post_approval_request'
          }),
        });

        if (notificationResponse.ok) {
          setSnackbar({
            open: true,
            message: 'Post submitted successfully! Waiting for approval from club creator.',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Post created but failed to notify club creator.',
            severity: 'warning'
          });
        }
        
        handleCloseCreatePost();
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create post. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
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
        Clubs I Joined
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
      ) : clubsDetails.length > 0 ? (
        <Grid container spacing={3}>
          {clubsDetails.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.club_id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 2,
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

                  {/* Member Badge */}
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label="✅ Member" 
                      size="small" 
                      color="success" 
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

                  {/* Location and Creation Date */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📍 {club.city}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📅 Club created {formatDate(club.creation_date)}
                    </Typography>
                    {club.joinDate && (
                      <Typography variant="body2" color="success.main">
                        🎉 You joined {formatDate(club.joinDate)}
                      </Typography>
                    )}
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
                      {club.creator?.username ? club.creator.username[0].toUpperCase() : 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created by
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {club.creator?.username || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Create Post Button */}
                  <Button
                    variant="contained"
                    startIcon={<PostAdd />}
                    onClick={() => handleCreatePost(club)}
                    sx={{ mt: 'auto' }}
                    fullWidth
                  >
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            🏟️ No Joined Clubs Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You haven't joined any clubs yet. Explore and join clubs that interest you!
          </Typography>
        </Box>
      )}

      {/* Create Post Dialog */}
      <Dialog 
        open={openCreatePost} 
        onClose={handleCloseCreatePost}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Post for {selectedClub?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Post Title"
              value={postData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Post Content"
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
            />
            
            <TextField
              label="Image URL (Optional)"
              value={postData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />

            <Alert severity="info">
              Your post will be sent to the club creator for approval before it becomes visible to other members.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreatePost}>
            Cancel
          </Button>
          <Button 
            onClick={handlePostSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JoinClub;