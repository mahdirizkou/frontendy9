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
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/userclubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch joined clubs");

        const joinedData = await response.json();
        console.log("Joined clubs data:", joinedData); // ✅ Debug log
        setJoinedClubs(joinedData);

        if (joinedData.length > 0) {
          const clubDetailsPromises = joinedData.map(async (joinRecord) => {
            try {
              // ✅ joinRecord.club is now an OBJECT with club_id property (from ClubSerializer)
              const clubId = joinRecord.club?.club_id || joinRecord.club;
              console.log("Fetching club:", clubId); // ✅ Debug log

              const clubResponse = await fetch(`http://127.0.0.1:8000/yalahntla9aw/clubs/${clubId}/`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: accessToken ? `Bearer ${accessToken}` : "",
                },
              });

              if (clubResponse.ok) {
                const clubData = await clubResponse.json();
                return {
                  ...clubData,
                  joinDate: joinRecord.date_joined,  // ✅ Use date_joined from UserClub
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
      content: '',
      image_url: ''
    });
  };

  const handlePostSubmit = async () => {
    if (!postData.content.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in the content',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        content: postData.content,
        club_id: selectedClub.club_id,
      };

      if (postData.image_url.trim()) {
        body.image_url = postData.image_url;
      }

      const postResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!postResponse.ok) {
        const errorData = await postResponse.json();
        console.error("Backend error:", errorData);
        throw new Error(JSON.stringify(errorData));
      }

      const newPost = await postResponse.json();
      console.log("Post created:", newPost);

      try {
        await fetch("http://127.0.0.1:8000/yalahntla9aw/notifications/", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: selectedClub.creator.id,
            club_id: selectedClub.club_id,
            message: `New post submitted by ${user.username} in ${selectedClub.name}.`,
          }),
        });
      } catch (notifError) {
        console.warn("Notification failed:", notifError);
      }

      setSnackbar({
        open: true,
        message: 'Post created successfully!',
        severity: 'success'
      });

      handleCloseCreatePost();

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
                <CardMedia
                  component="img"
                  sx={{ height: 200, objectFit: 'cover' }}
                  image={club.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={club.name}
                />

                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label="✅ Member"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, flex: 1 }}
                  >
                    {club.description}
                  </Typography>

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

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{ bgcolor: 'secondary.main', mr: 1, width: 32, height: 32 }}
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

      <Dialog
        open={openCreatePost}
        onClose={handleCloseCreatePost}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PostAdd />
          Create New Post
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {selectedClub && (
              <Alert severity="info">
                Creating post for: <strong>{selectedClub.name}</strong>
              </Alert>
            )}

            <TextField
              label="Post Content *"
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              fullWidth
              multiline
              rows={5}
              required
              placeholder="Write your post content here..."
            />

            <TextField
              label="Image URL (Optional)"
              value={postData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
              InputProps={{
                startAdornment: <span style={{ marginRight: 8 }}>🖼️</span>
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCreatePost} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handlePostSubmit}
            variant="contained"
            startIcon={<PostAdd />}
            disabled={submitting || !postData.content.trim()}
          >
            {submitting ? 'Creating...' : 'Create Post'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JoinClub;