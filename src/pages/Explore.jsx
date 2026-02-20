import { Box, Typography, Stack, Skeleton, Card, CardContent, CardMedia, Avatar, Chip, IconButton, CardActions, Divider } from "@mui/material";
import { FavoriteOutlined, ChatBubbleOutline, Share, MoreVert, LocationOn, AccessTime } from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const Explore = () => {
  const { accessToken } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [explorePosts, setExplorePosts] = useState([]);

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch explore posts");

        const data = await response.json();
        console.log("Posts data:", data); // ✅ Debug log

        // ✅ Sort posts by date (newest first)
        const sortedPosts = data.sort((a, b) => new Date(b.date_post) - new Date(a.date_post));
        setExplorePosts(sortedPosts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, [accessToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
        Explore Posts
      </Typography>

      {loading ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((item) => (
            <Card key={item} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={16} width="40%" />
                  </Box>
                </Box>
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : explorePosts.length > 0 ? (
        <Stack spacing={3}>
          {explorePosts.map((post) => (
            <Card
              key={post.id_post}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transition: 'all 0.3s ease-in-out'
                }
              }}
            >
              {/* Post Header */}
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={post.club?.image_url}
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 2,
                        width: 50,
                        height: 50
                      }}
                    >
                      {post.club?.name ? post.club.name[0].toUpperCase() : 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {post.club?.name || 'Unknown Club'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={post.club?.category || 'General'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                          {formatDate(post.date_post)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Post Content */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                    {truncateText(post.content)}
                  </Typography>
                </Box>

                {/* Author Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: 24,
                      height: 24,
                      fontSize: '0.875rem'
                    }}
                  >
                    {post.user?.username ? post.user.username[0].toUpperCase() : 'U'}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Posted by <strong>{post.user?.username || 'Unknown'}</strong>
                  </Typography>
                </Box>
              </CardContent>

              {/* Post Image */}
              {post.image_url && (
                <CardMedia
                  component="img"
                  sx={{
                    height: 300,
                    objectFit: 'cover'
                  }}
                  image={post.image_url}
                  alt="Post content"
                />
              )}

              <Divider />

              {/* Actions */}
              <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" color="primary">
                    <FavoriteOutlined />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <ChatBubbleOutline />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Share />
                  </IconButton>
                </Box>

                {/* Club Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {post.club?.city || 'Unknown'}
                  </Typography>
                </Box>
              </CardActions>

              {/* Footer - Club Info */}
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>{post.club?.name || 'Unknown Club'}</strong> • {post.club?.description ? truncateText(post.club.description, 100) : 'No description'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Created by <strong>{post.club?.creator?.username || 'Unknown'}</strong> • Club since {post.club?.creation_date ? formatDate(post.club.creation_date) : 'Unknown'}
                </Typography>
              </Box>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            📝 No Posts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No posts to explore right now. Check back later!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Explore;