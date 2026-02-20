import {
  Box,
  Typography,
  Stack,
  Skeleton,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  CardActions
} from "@mui/material";
import {
  Add,
  Close,
  Image,
  Send,
  PostAdd
} from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const CreatedClubs = () => {
  const { accessToken, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [createdClubs, setCreatedClubs] = useState([]);

  const [createPostDialog, setCreatePostDialog] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  // ✅ Removed title - backend has no title field
  const [postData, setPostData] = useState({
    content: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchCreatedClubs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch clubs");

        const data = await response.json();

        const userCreatedClubs = data.filter(club =>
          club.creator && club.creator.id === user?.id
        );

        setCreatedClubs(userCreatedClubs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCreatedClubs();
    }
  }, [accessToken, user?.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreatePostClick = (club) => {
    setSelectedClub(club);
    setCreatePostDialog(true);
    // ✅ Reset without title
    setPostData({
      content: '',
      image_url: ''
    });
  };

  const handleCloseDialog = () => {
    setCreatePostDialog(false);
    setSelectedClub(null);
    setPostData({
      content: '',
      image_url: ''
    });
  };

  const handlePostDataChange = (field) => (event) => {
    setPostData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCreatePost = async () => {
    // ✅ Only validate content
    if (!postData.content.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in the content',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Send exactly what backend expects
      const postPayload = {
        content: postData.content,
        club_id: selectedClub.club_id,  // ✅ was "club", must be "club_id"
      };

      // ✅ Only include image_url if not empty
      if (postData.image_url.trim()) {
        postPayload.image_url = postData.image_url;
      }

      console.log("Sending payload:", postPayload); // ✅ debug log

      const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // ✅ must have token
        },
        body: JSON.stringify(postPayload),
      });

      // ✅ Log exact error from backend
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(JSON.stringify(errorData));
      }

      const newPost = await response.json();
      console.log("Post created successfully:", newPost);

      setSnackbar({
        open: true,
        message: `Post created successfully for ${selectedClub.name}!`,
        severity: 'success'
      });

      handleCloseDialog();

    } catch (error) {
      console.error("Error creating post:", error);
      setSnackbar({
        open: true,
        message: 'Failed to create post. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
        My Created Clubs
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
      ) : createdClubs.length > 0 ? (
        <Grid container spacing={3}>
          {createdClubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.club_id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 2,
                  border: 2,
                  borderColor: 'primary.main',
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
                      label="👑 Owner"
                      size="small"
                      color="warning"
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
                    <Typography variant="body2" color="primary.main">
                      📅 Created {formatDate(club.creation_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Avatar
                      sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}
                    >
                      {club.creator?.username ? club.creator.username[0].toUpperCase() : 'Y'}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created by you
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                        {club.creator?.username || 'You'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PostAdd />}
                    onClick={() => handleCreatePostClick(club)}
                    sx={{ width: '90%', borderRadius: 2, fontWeight: 'bold' }}
                  >
                    Create Post
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            🏗️ No Created Clubs Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You haven't created any clubs yet. Start building your community by creating your first club!
          </Typography>
        </Box>
      )}

      {/* ✅ Create Post Dialog - no title field */}
      <Dialog
        open={createPostDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PostAdd sx={{ mr: 1 }} />
            Create New Post
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedClub && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Creating post for: <strong>{selectedClub.name}</strong>
              </Alert>

              {/* ✅ Removed title field - backend has no title */}

              <TextField
                fullWidth
                label="Post Content *"
                value={postData.content}
                onChange={handlePostDataChange('content')}
                margin="normal"
                required
                multiline
                rows={5}
                placeholder="Write your post content here..."
              />

              <TextField
                fullWidth
                label="Image URL (Optional)"
                value={postData.image_url}
                onChange={handlePostDataChange('image_url')}
                margin="normal"
                placeholder="https://example.com/image.jpg"
                InputProps={{
                  startAdornment: <Image sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {postData.image_url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Image Preview:
                  </Typography>
                  <Card>
                    <CardMedia
                      component="img"
                      sx={{ height: 200, objectFit: 'cover' }}
                      image={postData.image_url}
                      alt="Post preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            startIcon={<Send />}
            disabled={isSubmitting || !postData.content.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatedClubs;