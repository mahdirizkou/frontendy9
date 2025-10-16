import { Box, Typography, Stack, Skeleton, Card, CardContent, CardMedia, Avatar, Chip } from "@mui/material";
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
        setExplorePosts(data);
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
        Posts Clubs
      </Typography>
      
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" height={100} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="rectangular" height={300} />
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
                  boxShadow: 4
                }
              }}
            >
              {/* Post Header */}
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      mr: 2,
                      width: 40,
                      height: 40
                    }}
                  >
                    {post.user.username[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {post.club.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      by {post.user.username} • {formatDate(post.date_post)}
                    </Typography>
                  </Box>
                  <Chip 
                    label={post.club.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>

                {/* Club Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📍 {post.club.city} • Created {formatDate(post.club.creation_date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.club.description}
                  </Typography>
                </Box>

                {/* Post Content */}
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>
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
                  alt="Post image"
                />
              )}

              {/* Footer */}
              <CardContent sx={{ pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Club created by {post.club.creator.username}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Available to join
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No posts to explore right now.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Explore;